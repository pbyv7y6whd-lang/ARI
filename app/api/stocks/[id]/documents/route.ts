import { NextRequest, NextResponse, after } from "next/server";
import { addDocument, getStock, updateStock, setupDb } from "@/lib/db";
import { parsePDF } from "@/lib/pdf";
import { sql } from "@vercel/postgres";
import { v4 as uuidv4 } from "uuid";

// Upload route: saves doc and returns immediately (~1-2s).
// PDF parsing happens after the response via after() — never blocks the modal.
// Analysis is triggered separately by the client.
export const maxDuration = 60;

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

  // Save document record immediately — no parsing yet
  const docId = uuidv4();
  await addDocument({
    id: docId, stock_id: stockId, file_name: fileName,
    display_name: displayName,
    doc_type: docType, year, blob_url: storedUrl,
    page_count: null, word_count: null,
    parsed_content: null,
  });

  await updateStock(stockId, {
    status: "processing", progress: 5,
    progress_message: "Document saved — parsing PDF...",
  });

  // Parse PDF after the response is sent — captures buffer in closure
  // after() keeps the Vercel function alive until this completes
  const bufferCopy = Buffer.from(buffer); // ensure closure capture
  after(async () => {
    try {
      const parsed = await parsePDF(bufferCopy);
      await sql`
        UPDATE documents
        SET parsed_content = ${JSON.stringify(parsed)}::jsonb,
            page_count     = ${parsed.pageCount},
            word_count     = ${parsed.wordCount}
        WHERE id = ${docId}
      `;
      await updateStock(stockId, {
        status: "processing", progress: 15,
        progress_message: `PDF parsed (${parsed.pageCount} pages) — ready for analysis`,
      });
    } catch (err) {
      console.error("[documents] post-response parse failed:", err);
      // Not fatal — analysis will attempt to re-parse URL docs, or skip uploaded ones
    }
  });

  // Returns in ~1s for uploads, ~5-45s for URL downloads (download time only)
  return NextResponse.json({ docId });
}
