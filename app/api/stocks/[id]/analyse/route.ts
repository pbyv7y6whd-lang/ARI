import { NextRequest, NextResponse } from "next/server";
import { getStock, getDocumentsForStock, updateStock, setupDb } from "@/lib/db";
import { parsePDF } from "@/lib/pdf";
import { analyseStock } from "@/lib/analysis";

export const maxDuration = 300;

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await setupDb();

  const { id: stockId } = await params;
  const stock = await getStock(stockId);
  if (!stock) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const docs = await getDocumentsForStock(stockId);
  if (!docs.length) return NextResponse.json({ error: "No documents" }, { status: 400 });

  const tTotal = Date.now();

  try {
    await updateStock(stockId, { status: "processing", progress: 10, progress_message: "Fetching filings..." });

    const parsedDocs = [];
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      if (doc.blob_url.startsWith("uploaded:")) {
        if (doc.parsed_content) {
          parsedDocs.push({ file_name: doc.file_name, doc_type: doc.doc_type, year: doc.year, parsed: doc.parsed_content });
        } else {
          console.log(`[re-analyse] skipping uploaded file ${doc.file_name} — no stored parsed content`);
        }
        continue;
      }
      await updateStock(stockId, {
        progress: 10 + Math.round((i / docs.length) * 18),
        progress_message: `Downloading ${doc.file_name}...`,
      });
      const res = await fetch(doc.blob_url, {
        headers: { "User-Agent": "Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36" },
      });
      const buf = Buffer.from(await res.arrayBuffer());
      const parsed = await parsePDF(buf);
      parsedDocs.push({ file_name: doc.file_name, doc_type: doc.doc_type, year: doc.year, parsed });
    }

    if (!parsedDocs.length) {
      return NextResponse.json({ error: "No fetchable documents found" }, { status: 400 });
    }

    await updateStock(stockId, { progress: 30, progress_message: `Analysing ${parsedDocs.length} filing(s)...` });

    let pct = 30;
    const analysis = await analyseStock(stock.name, parsedDocs, async (msg) => {
      pct = Math.min(pct + 8, 92);
      await updateStock(stockId, { progress: pct, progress_message: msg });
    });

    await updateStock(stockId, {
      status: "complete", progress: 100, progress_message: "Research complete",
      analysis, sector: analysis.investmentSnapshot?.sector || stock.sector,
    });

    console.log(`[re-analyse] completed in ${Date.now() - tTotal}ms`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Analysis failed";
    await updateStock(stockId, { status: "error", progress: 0, progress_message: msg });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
