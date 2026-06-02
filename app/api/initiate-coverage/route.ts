/**
 * POST /api/initiate-coverage
 *
 * Fully synchronous pipeline — runs everything within the request lifecycle
 * so Vercel doesn't kill background tasks.
 *
 * Steps:
 *   1. Validate URL
 *   2. Download PDF (30s timeout)
 *   3. Create stock + document records
 *   4. Parse PDF
 *   5. Run Claude analysis
 *   6. Write analysis to DB
 *   7. Return stockId
 */

import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { createStock, addDocument, updateStock, setupDb } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { parsePDF, buildAnalysisText } from "@/lib/pdf";
import { analyseStock } from "@/lib/analysis";
import { v4 as uuidv4 } from "uuid";

export const maxDuration = 300; // 5 minutes — requires Vercel Pro or higher

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractYear(url: string): string {
  const m = url.match(/20(1[5-9]|2[0-9])/);
  return m ? m[0] : String(new Date().getFullYear());
}

function extractFilename(url: string): string {
  try {
    const path = new URL(url).pathname;
    const name = path.split("/").pop() || "annual-report.pdf";
    return name.toLowerCase().endsWith(".pdf") ? name : name + ".pdf";
  } catch {
    return "annual-report.pdf";
  }
}

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch { return false; }
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const tTotal = Date.now();

  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  await setupDb();

  const body = await request.json();
  const {
    name, ticker, sector,
    url, doc_type = "annual_report",
    year: yearOverride,
  } = body;

  // ── 1. Validate inputs ────────────────────────────────────────────────────
  if (!name?.trim()) return NextResponse.json({ error: "Company name required" }, { status: 400 });
  if (!url?.trim())  return NextResponse.json({ error: "Annual report URL required" }, { status: 400 });
  if (!isValidUrl(url.trim())) return NextResponse.json({ error: "Invalid URL — must start with https://" }, { status: 400 });

  const stockId = uuidv4();
  const docId   = uuidv4();
  const year    = yearOverride || extractYear(url.trim());
  const fileName = extractFilename(url.trim());

  // ── 2. Create stock record immediately (status = processing) ──────────────
  await createStock({
    id: stockId,
    name: name.trim(),
    ticker: ticker?.trim().toUpperCase() || null,
    sector: sector?.trim() || null,
  });

  await updateStock(stockId, { status: "processing", progress: 5, progress_message: "Downloading annual report..." });

  // ── 3. Download PDF ───────────────────────────────────────────────────────
  let buffer: Buffer;
  const t1 = Date.now();
  try {
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 45_000);

    const res = await fetch(url.trim(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept":     "application/pdf,*/*",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      await updateStock(stockId, { status: "error", progress_message: `URL returned HTTP ${res.status}. Check the link is a direct PDF.` });
      return NextResponse.json({ error: `URL returned HTTP ${res.status}` }, { status: 400 });
    }

    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("pdf") && !url.toLowerCase().includes(".pdf")) {
      await updateStock(stockId, { status: "error", progress_message: "URL does not point to a PDF. Use a direct link to the PDF file." });
      return NextResponse.json({ error: "URL does not appear to be a PDF" }, { status: 400 });
    }

    buffer = Buffer.from(await res.arrayBuffer());
    console.log(`[pipeline] download: ${Date.now() - t1}ms — ${(buffer.length / 1024 / 1024).toFixed(1)} MB`);
  } catch (err: unknown) {
    const msg = err instanceof Error && err.message.includes("abort")
      ? "Download timed out (45s). The server may be slow or the file too large."
      : `Download failed: ${err instanceof Error ? err.message : String(err)}`;
    await updateStock(stockId, { status: "error", progress_message: msg });
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (buffer.length < 1024) {
    const msg = "Downloaded file is too small to be a valid PDF.";
    await updateStock(stockId, { status: "error", progress_message: msg });
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  if (buffer.length > 50 * 1024 * 1024) {
    const msg = "PDF exceeds 50 MB limit. Try a compressed version.";
    await updateStock(stockId, { status: "error", progress_message: msg });
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // ── 4. Upload to Blob storage ──────────────────────────────────────────────
  await updateStock(stockId, { progress: 12, progress_message: "Storing document..." });
  const t2 = Date.now();
  const blob = await put(`stocks/${stockId}/${docId}/${fileName}`, buffer, {
    access: "public",
    contentType: "application/pdf",
  });
  console.log(`[pipeline] blob upload: ${Date.now() - t2}ms`);

  // ── 5. Parse PDF ──────────────────────────────────────────────────────────
  await updateStock(stockId, { progress: 20, progress_message: "Parsing document structure..." });
  const t3 = Date.now();
  let parsed;
  try {
    parsed = await parsePDF(buffer);
    console.log(`[pipeline] pdf parse: ${Date.now() - t3}ms — ${parsed.pageCount} pages, ${parsed.wordCount.toLocaleString()} words`);
  } catch (err) {
    const msg = `PDF parsing failed: ${err instanceof Error ? err.message : "unknown error"}`;
    await updateStock(stockId, { status: "error", progress_message: msg });
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // ── 6. Create document record ─────────────────────────────────────────────
  await addDocument({
    id: docId,
    stock_id: stockId,
    file_name: fileName,
    doc_type,
    year,
    blob_url: blob.url,
    page_count: parsed.pageCount,
    word_count: parsed.wordCount,
  });

  await updateStock(stockId, {
    progress: 30,
    progress_message: `Extracted ${parsed.pageCount} pages · ${parsed.wordCount.toLocaleString()} words · ${parsed.sections.length} sections identified`,
  });

  // ── 7. Run analysis pipeline ──────────────────────────────────────────────
  const PROGRESS_STEPS = [
    [38, "Locating key sections — Chairman, CEO review, strategy..."],
    [46, "Analysing financial quality and cash conversion..."],
    [54, "Evaluating management quality and capital allocation..."],
    [62, "Reviewing governance, board structure and remuneration..."],
    [70, "Building bull case and bear case..."],
    [76, "Identifying accounting red flags..."],
    [82, "Running variant perception analysis..."],
    [88, "Generating risk matrix and investment catalysts..."],
    [93, "Compiling investment memo..."],
  ] as const;

  let stepIdx = 0;
  const progressTick = async (msg: string) => {
    const step = PROGRESS_STEPS[Math.min(stepIdx++, PROGRESS_STEPS.length - 1)];
    await updateStock(stockId, { progress: step[0], progress_message: msg || step[1] });
  };

  await progressTick(PROGRESS_STEPS[0][1]);

  let analysis;
  const t4 = Date.now();
  try {
    analysis = await analyseStock(
      name.trim(),
      [{ file_name: fileName, doc_type, year, parsed }],
      progressTick,
    );
    console.log(`[pipeline] analysis: ${Date.now() - t4}ms`);
  } catch (err) {
    const msg = `Analysis failed: ${err instanceof Error ? err.message : "unknown error"}`;
    console.error("[pipeline] analysis error:", err);
    await updateStock(stockId, { status: "error", progress_message: msg });
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // ── 8. Persist analysis ───────────────────────────────────────────────────
  await updateStock(stockId, {
    status: "complete",
    progress: 100,
    progress_message: "Research complete",
    analysis,
    sector: analysis.investmentSnapshot?.sector || sector?.trim() || null,
  });

  console.log(`[pipeline] TOTAL: ${Date.now() - tTotal}ms`);
  return NextResponse.json({ stockId, docId });
}
