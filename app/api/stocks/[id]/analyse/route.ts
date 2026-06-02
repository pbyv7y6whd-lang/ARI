import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { getStock, getDocumentsForStock, updateStock, setupDb } from "@/lib/db";
import { parsePDF } from "@/lib/pdf";
import { analyseStock } from "@/lib/analysis";

export const maxDuration = 300;

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  await setupDb();

  const { id: stockId } = await params;
  const stock = await getStock(stockId);
  if (!stock) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const docs = await getDocumentsForStock(stockId);
  if (!docs.length) return NextResponse.json({ error: "No documents uploaded yet" }, { status: 400 });

  // Run analysis (awaited — this route has 300s timeout)
  try {
    await updateStock(stockId, { status: "processing", progress: 10, progress_message: "Parsing documents..." });

    const parsedDocs = [];
    for (const doc of docs) {
      const res = await fetch(doc.blob_url);
      const buf = Buffer.from(await res.arrayBuffer());
      const parsed = await parsePDF(buf);
      parsedDocs.push({ file_name: doc.file_name, doc_type: doc.doc_type, year: doc.year, parsed });
    }

    await updateStock(stockId, { progress: 30, progress_message: `Analysing ${parsedDocs.length} document(s)...` });

    const analysis = await analyseStock(stock.name, parsedDocs, async (msg) => {
      await updateStock(stockId, { progress: 60, progress_message: msg });
    });

    await updateStock(stockId, {
      status: "complete",
      progress: 100,
      progress_message: "Analysis complete",
      analysis,
      sector: analysis.investmentSnapshot?.sector || stock.sector,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    await updateStock(stockId, {
      status: "error",
      progress: 0,
      progress_message: err instanceof Error ? err.message : "Analysis failed",
    });
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
