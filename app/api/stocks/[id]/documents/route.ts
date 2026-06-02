import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { addDocument, getStock, updateStock, setupDb } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { parsePDF } from "@/lib/pdf";
import { v4 as uuidv4 } from "uuid";

export const maxDuration = 60;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  await setupDb();

  const { id: stockId } = await params;
  const stock = await getStock(stockId);
  if (!stock) return NextResponse.json({ error: "Stock not found" }, { status: 404 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const docType = (formData.get("doc_type") as string) || "annual_report";
  const year = (formData.get("year") as string) || null;

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (file.type !== "application/pdf") return NextResponse.json({ error: "Must be PDF" }, { status: 400 });
  if (file.size > 50 * 1024 * 1024) return NextResponse.json({ error: "Max 50MB" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const docId = uuidv4();

  const blob = await put(`stocks/${stockId}/${docId}/${file.name}`, buffer, {
    access: "public",
    contentType: "application/pdf",
  });

  let pageCount: number | null = null;
  let wordCount: number | null = null;
  try {
    const parsed = await parsePDF(buffer);
    pageCount = parsed.pageCount;
    wordCount = parsed.wordCount;
  } catch {}

  await addDocument({
    id: docId,
    stock_id: stockId,
    file_name: file.name,
    doc_type: docType,
    year,
    blob_url: blob.url,
    page_count: pageCount,
    word_count: wordCount,
  });

  // Trigger re-analysis in background
  runAnalysis(stockId).catch(console.error);

  return NextResponse.json({ docId });
}

async function runAnalysis(stockId: string) {
  const { getStock, getDocumentsForStock, updateStock } = await import("@/lib/db");
  const { parsePDF } = await import("@/lib/pdf");
  const { analyseStock } = await import("@/lib/analysis");

  try {
    await updateStock(stockId, { status: "processing", progress: 10, progress_message: "Parsing documents..." });

    const stock = await getStock(stockId);
    const docs = await getDocumentsForStock(stockId);

    if (!docs.length) return;

    // Fetch and parse each document
    const parsedDocs = [];
    for (const doc of docs) {
      const res = await fetch(doc.blob_url);
      const buf = Buffer.from(await res.arrayBuffer());
      const parsed = await parsePDF(buf);
      parsedDocs.push({
        file_name: doc.file_name,
        doc_type: doc.doc_type,
        year: doc.year,
        parsed,
      });
    }

    await updateStock(stockId, {
      progress: 30,
      progress_message: `Analysing ${parsedDocs.length} document${parsedDocs.length !== 1 ? "s" : ""}...`,
    });

    const analysis = await analyseStock(
      stock.name,
      parsedDocs,
      async (msg) => {
        await updateStock(stockId, { progress: 60, progress_message: msg });
      }
    );

    await updateStock(stockId, {
      status: "complete",
      progress: 100,
      progress_message: "Analysis complete",
      analysis,
      sector: analysis.investmentSnapshot?.sector || stock.sector,
    });
  } catch (err) {
    await updateStock(stockId, {
      status: "error",
      progress: 0,
      progress_message: err instanceof Error ? err.message : "Analysis failed",
    });
  }
}
