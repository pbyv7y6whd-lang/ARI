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
  if (!docs.length) return NextResponse.json({ error: "No documents" }, { status: 400 });

  const tTotal = Date.now();

  try {
    await updateStock(stockId, { status: "processing", progress: 10, progress_message: "Fetching stored documents..." });

    const parsedDocs = [];
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      await updateStock(stockId, {
        progress: 10 + Math.round((i / docs.length) * 15),
        progress_message: `Parsing document ${i + 1} of ${docs.length}: ${doc.file_name}`,
      });
      const res = await fetch(doc.blob_url);
      const buf = Buffer.from(await res.arrayBuffer());
      const parsed = await parsePDF(buf);
      parsedDocs.push({ file_name: doc.file_name, doc_type: doc.doc_type, year: doc.year, parsed });
    }

    await updateStock(stockId, { progress: 30, progress_message: `Analysing ${parsedDocs.length} document(s)...` });

    let stepPct = 30;
    const analysis = await analyseStock(stock.name, parsedDocs, async (msg) => {
      stepPct = Math.min(stepPct + 8, 92);
      await updateStock(stockId, { progress: stepPct, progress_message: msg });
    });

    await updateStock(stockId, {
      status: "complete",
      progress: 100,
      progress_message: "Research complete",
      analysis,
      sector: analysis.investmentSnapshot?.sector || stock.sector,
    });

    console.log(`[re-analyse] completed in ${Date.now() - tTotal}ms`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Analysis failed";
    await updateStock(stockId, { status: "error", progress: 0, progress_message: msg });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
