import { NextRequest, NextResponse } from "next/server";
import { createStock, addDocument, updateStock, setupDb } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { parsePDF } from "@/lib/pdf";
import { analyseStock } from "@/lib/analysis";
import { v4 as uuidv4 } from "uuid";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  await setupDb();

  const formData = await request.formData();
  const name     = (formData.get("name") as string)?.trim();
  const ticker   = (formData.get("ticker") as string)?.trim().toUpperCase() || null;
  const sector   = (formData.get("sector") as string)?.trim() || null;
  const docType  = (formData.get("doc_type") as string) || "annual_report";
  const year     = (formData.get("year") as string) || String(new Date().getFullYear());
  const file     = formData.get("file") as File | null;

  if (!name) return NextResponse.json({ error: "Company name required" }, { status: 400 });
  if (!file) return NextResponse.json({ error: "PDF file required" }, { status: 400 });
  if (file.type !== "application/pdf" && !file.name.endsWith(".pdf"))
    return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
  if (file.size > 50 * 1024 * 1024)
    return NextResponse.json({ error: "PDF exceeds 50MB limit" }, { status: 400 });

  const stockId = uuidv4();
  const docId   = uuidv4();

  await createStock({ id: stockId, name, ticker, sector });
  await updateStock(stockId, { status: "processing", progress: 10, progress_message: "Reading uploaded file..." });

  const buffer = Buffer.from(await file.arrayBuffer());

  if (buffer.length < 1024)
    return NextResponse.json({ error: "File is too small to be a valid PDF" }, { status: 400 });

  await updateStock(stockId, { progress: 20, progress_message: "Parsing document structure..." });

  let parsed;
  try {
    parsed = await parsePDF(buffer);
  } catch (err) {
    const msg = `PDF parsing failed: ${err instanceof Error ? err.message : "unknown"}`;
    await updateStock(stockId, { status: "error", progress_message: msg });
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  await addDocument({
    id: docId,
    stock_id: stockId,
    file_name: file.name,
    doc_type: docType,
    year,
    blob_url: `uploaded:${file.name}`,
    page_count: parsed.pageCount,
    word_count: parsed.wordCount,
  });

  await updateStock(stockId, {
    progress: 28,
    progress_message: `${parsed.pageCount} pages · ${parsed.wordCount.toLocaleString()} words — analysing...`,
  });

  // Run analysis inline (we have the buffer in memory — no need to re-fetch)
  try {
    let pct = 30;
    const analysis = await analyseStock(name, [{ file_name: file.name, doc_type: docType, year, parsed }], async (msg) => {
      pct = Math.min(pct + 8, 92);
      await updateStock(stockId, { progress: pct, progress_message: msg });
    });

    await updateStock(stockId, {
      status: "complete", progress: 100, progress_message: "Research complete",
      analysis, sector: analysis.investmentSnapshot?.sector || sector,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Analysis failed";
    await updateStock(stockId, { status: "error", progress: 0, progress_message: msg });
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ stockId, docId });
}
