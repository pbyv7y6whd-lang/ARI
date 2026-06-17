import { NextRequest, NextResponse } from "next/server";
import { addDocument, getStock, updateStock, setupDb } from "@/lib/db";
import { parsePDF } from "@/lib/pdf";
import { v4 as uuidv4 } from "uuid";
import type { ParsedPDF } from "@/lib/pdf";

// This route ONLY saves the document — it returns fast (~5-10s).
// The client fires /analyse separately so the modal closes immediately.
export const maxDuration = 120;

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

  // Parse and store — this is the slow part for large PDFs, but happens once and is cached
  let pageCount: number | null = null;
  let wordCount: number | null = null;
  let parsed: ParsedPDF | null = null;
  try {
    parsed    = await parsePDF(buffer);
    pageCount = parsed.pageCount;
    wordCount = parsed.wordCount;
  } catch { /* non-fatal */ }

  const docId = uuidv4();
  await addDocument({
    id: docId, stock_id: stockId, file_name: fileName,
    display_name: displayName,
    doc_type: docType, year, blob_url: storedUrl,
    page_count: pageCount, word_count: wordCount,
    parsed_content: parsed ?? null,
  });

  // Mark as pending re-analysis so the page shows a queued state
  await updateStock(stockId, {
    status: "processing", progress: 5,
    progress_message: "Document saved — queuing analysis...",
  });

  // Return immediately — client fires /analyse separately
  return NextResponse.json({ docId });
}
