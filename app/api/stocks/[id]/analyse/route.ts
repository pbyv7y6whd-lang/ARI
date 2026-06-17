import { NextRequest, NextResponse } from "next/server";
import { getStock, getDocumentsForStock, updateStock, setupDb } from "@/lib/db";
import { parsePDF } from "@/lib/pdf";
import { analyseStock } from "@/lib/analysis";
import { analyseSovereign, analyseCorporate } from "@/lib/em-analysis";

export const maxDuration = 300;

// Poll until all uploaded docs have parsed_content (set by the upload route's after() callback)
async function waitForParsedContent(stockId: string, maxWaitMs = 90_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docs = await getDocumentsForStock(stockId) as any[];
    const uploadedDocs = docs.filter(d => d.blob_url?.startsWith("uploaded:"));
    const pending = uploadedDocs.filter(d => !d.parsed_content);
    if (uploadedDocs.length === 0 || pending.length === 0) return;
    console.log(`[analyse] waiting for ${pending.length} doc(s) to finish parsing...`);
    await new Promise(r => setTimeout(r, 3000));
  }
  console.log("[analyse] gave up waiting — proceeding with whatever is parsed");
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await setupDb();

  const { id: stockId } = await params;
  const stock = await getStock(stockId);
  if (!stock) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const docs = await getDocumentsForStock(stockId);
  if (!docs.length) return NextResponse.json({ error: "No documents" }, { status: 400 });

  const tTotal = Date.now();
  const entityType: string = stock.entity_type || "corporate";

  try {
    // Wait for any uploaded docs whose after() parse is still in progress
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasPendingUploads = (docs as any[]).some(
      (d: { blob_url: string; parsed_content: unknown }) =>
        d.blob_url?.startsWith("uploaded:") && !d.parsed_content
    );
    if (hasPendingUploads) {
      await updateStock(stockId, { status: "processing", progress: 8, progress_message: "Parsing PDF — almost ready..." });
      await waitForParsedContent(stockId);
    }

    await updateStock(stockId, { status: "processing", progress: 10, progress_message: "Loading documents..." });

    // Re-fetch docs now that parsing should be complete
    const freshDocs = await getDocumentsForStock(stockId);
    const parsedDocs = [];
    for (let i = 0; i < freshDocs.length; i++) {
      const doc = freshDocs[i];
      if (doc.blob_url.startsWith("uploaded:")) {
        if (doc.parsed_content) {
          parsedDocs.push({ file_name: doc.file_name, doc_type: doc.doc_type, year: doc.year, parsed: doc.parsed_content });
        } else {
          console.log(`[re-analyse] skipping uploaded file ${doc.file_name} — parse timed out`);
        }
        continue;
      }
      await updateStock(stockId, {
        progress: 10 + Math.round((i / docs.length) * 18),
        progress_message: `Downloading ${doc.file_name}...`,
      });
      // URL doc — check cache first, re-download only if no cached content
      if (doc.parsed_content) {
        parsedDocs.push({ file_name: doc.file_name, doc_type: doc.doc_type, year: doc.year, parsed: doc.parsed_content });
        continue;
      }
      await updateStock(stockId, {
        progress: 10 + Math.round((i / freshDocs.length) * 18),
        progress_message: `Downloading ${doc.file_name}...`,
      });
      try {
        const res = await fetch(doc.blob_url, {
          headers: { "User-Agent": "Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36" },
        });
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          const parsed = await parsePDF(buf);
          parsedDocs.push({ file_name: doc.file_name, doc_type: doc.doc_type, year: doc.year, parsed });
        }
      } catch { /* skip inaccessible */ }
    }

    if (!parsedDocs.length) {
      return NextResponse.json({ error: "No fetchable documents found" }, { status: 400 });
    }

    await updateStock(stockId, { progress: 30, progress_message: `Analysing ${parsedDocs.length} document(s)...` });

    let pct = 30;
    const onProgress = async (msg: string) => {
      pct = Math.min(pct + 8, 92);
      await updateStock(stockId, { progress: pct, progress_message: msg });
    };

    let analysis: object;

    if (entityType === "sovereign") {
      analysis = await analyseSovereign(stock.name, parsedDocs, onProgress);
      await updateStock(stockId, {
        status: "complete",
        progress: 100,
        progress_message: "Sovereign credit assessment complete",
        analysis,
      });
    } else if (entityType === "corporate") {
      analysis = await analyseCorporate(stock.name, parsedDocs, onProgress);
      // Extract sector from analysis snapshot if available
      const snap = (analysis as { snapshot?: { sector?: string } }).snapshot;
      await updateStock(stockId, {
        status: "complete",
        progress: 100,
        progress_message: "Corporate credit assessment complete",
        analysis,
        sector: snap?.sector || stock.sector,
      });
    } else {
      // Fallback to legacy equity analysis
      const equityAnalysis = await analyseStock(stock.name, parsedDocs, onProgress);
      await updateStock(stockId, {
        status: "complete",
        progress: 100,
        progress_message: "Research complete",
        analysis: equityAnalysis,
        sector: equityAnalysis.investmentSnapshot?.sector || stock.sector,
      });
    }

    console.log(`[analyse] completed in ${Date.now() - tTotal}ms`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Analysis failed";
    await updateStock(stockId, { status: "error", progress: 0, progress_message: msg });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
