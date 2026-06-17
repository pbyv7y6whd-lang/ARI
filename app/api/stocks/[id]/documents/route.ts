import { NextRequest, NextResponse } from "next/server";
import { addDocument, getStock, getDocumentsForStock, updateStock, setupDb } from "@/lib/db";
import { parsePDF } from "@/lib/pdf";
import { analyseSovereign, analyseCorporate } from "@/lib/em-analysis";
import { v4 as uuidv4 } from "uuid";
import type { ParsedPDF } from "@/lib/pdf";

export const maxDuration = 300;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await setupDb();

  const { id: stockId } = await params;
  const stock = await getStock(stockId);
  if (!stock) return NextResponse.json({ error: "Stock not found" }, { status: 404 });

  const formData = await request.formData();
  const docType     = (formData.get("doc_type") as string) || "annual_report";
  const year        = (formData.get("year") as string) || null;
  const displayName = (formData.get("display_name") as string) || null;
  const pdfUrl      = formData.get("pdf_url") as string | null;
  const file        = formData.get("file") as File | null;

  if (!file && !pdfUrl) return NextResponse.json({ error: "No file or URL" }, { status: 400 });

  let buffer: Buffer;
  let fileName: string;
  let storedUrl: string;

  if (pdfUrl) {
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 45_000);
    let res: Response;
    try {
      res = await fetch(pdfUrl.trim(), {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/pdf,*/*",
        },
      });
      clearTimeout(timeout);
    } catch (err) {
      return NextResponse.json({ error: `Download failed: ${err instanceof Error ? err.message : "unknown"}` }, { status: 400 });
    }
    if (!res.ok) return NextResponse.json({ error: `URL returned HTTP ${res.status}` }, { status: 400 });
    buffer   = Buffer.from(await res.arrayBuffer());
    const p  = new URL(pdfUrl).pathname;
    fileName = p.split("/").pop() || "filing.pdf";
    if (!fileName.endsWith(".pdf")) fileName += ".pdf";
    storedUrl = pdfUrl.trim();
  } else {
    if (file!.type !== "application/pdf") return NextResponse.json({ error: "Must be PDF" }, { status: 400 });
    if (file!.size > 50 * 1024 * 1024)   return NextResponse.json({ error: "Max 50MB" }, { status: 400 });
    buffer    = Buffer.from(await file!.arrayBuffer());
    fileName  = file!.name;
    storedUrl = `uploaded:${file!.name}`;
  }

  // Parse PDF once — store parsed content so it never needs re-parsing or re-downloading
  let pageCount: number | null = null;
  let wordCount: number | null = null;
  let parsed: ParsedPDF | null = null;
  try {
    parsed    = await parsePDF(buffer);
    pageCount = parsed.pageCount;
    wordCount = parsed.wordCount;
  } catch { /* non-fatal */ }

  const docId = uuidv4();
  // Store parsed_content so all future re-analyses use the cached version
  await addDocument({
    id: docId, stock_id: stockId, file_name: fileName,
    display_name: displayName,
    doc_type: docType, year, blob_url: storedUrl,
    page_count: pageCount, word_count: wordCount,
    parsed_content: parsed ?? null,
  });

  // ── Re-analyse with ALL documents ────────────────────────────────────────────
  try {
    await updateStock(stockId, { status: "processing", progress: 20, progress_message: "New document added — re-analysing all documents..." });

    const allDocs = await getDocumentsForStock(stockId);
    const parsedDocs: { file_name: string; doc_type: string; year: string | null; parsed: ParsedPDF }[] = [];

    for (const doc of allDocs) {
      // Use stored parsed_content if available — avoids re-downloading and re-parsing
      if (doc.parsed_content) {
        parsedDocs.push({
          file_name: doc.file_name,
          doc_type: doc.doc_type,
          year: doc.year,
          parsed: doc.parsed_content as ParsedPDF,
        });
        continue;
      }

      // Uploaded files without stored content can't be recovered — skip
      if (doc.blob_url.startsWith("uploaded:")) {
        // If this is the just-added doc and we have it in memory, use it
        if (doc.id === docId && parsed) {
          parsedDocs.push({ file_name: doc.file_name, doc_type: doc.doc_type, year: doc.year, parsed });
        }
        continue;
      }

      // URL-based doc without cached content — download and parse (one-time cost; next time it'll be cached)
      try {
        const r = await fetch(doc.blob_url, {
          headers: { "User-Agent": "Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36" },
        });
        if (r.ok) {
          const docBuffer = Buffer.from(await r.arrayBuffer());
          const p = await parsePDF(docBuffer);
          parsedDocs.push({ file_name: doc.file_name, doc_type: doc.doc_type, year: doc.year, parsed: p });
        }
      } catch { /* skip inaccessible doc */ }
    }

    // Fallback: if somehow nothing was collected, use the doc we just parsed
    if (!parsedDocs.length && parsed) {
      parsedDocs.push({ file_name: fileName, doc_type: docType, year, parsed });
    }

    await updateStock(stockId, { progress: 38, progress_message: `Analysing ${parsedDocs.length} document(s)...` });

    const entityType = stock.entity_type || "corporate";
    let pct = 38;
    const onProgress = async (msg: string) => {
      pct = Math.min(pct + 8, 92);
      await updateStock(stockId, { progress: pct, progress_message: msg });
    };

    let analysis: object;
    if (entityType === "sovereign") {
      analysis = await analyseSovereign(stock.name, parsedDocs, onProgress);
    } else {
      analysis = await analyseCorporate(stock.name, parsedDocs, onProgress);
    }

    await updateStock(stockId, {
      status: "complete", progress: 100, progress_message: "Credit assessment complete",
      analysis,
    });
  } catch (err) {
    await updateStock(stockId, {
      status: "error", progress: 0,
      progress_message: err instanceof Error ? err.message : "Analysis failed",
    });
  }

  return NextResponse.json({ docId });
}
