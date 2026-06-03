/**
 * POST /api/initiate-coverage
 *
 * Returns stockId IMMEDIATELY after creating the record.
 * Analysis runs in a separate /api/stocks/[id]/analyse call triggered by the client.
 * This means the browser never waits more than ~60s for the initial response.
 */

import { NextRequest, NextResponse } from "next/server";
import { createStock, addDocument, updateStock, setupDb } from "@/lib/db";
import { parsePDF } from "@/lib/pdf";
import { v4 as uuidv4 } from "uuid";

export const maxDuration = 60; // just download + parse — fast enough

function extractYear(url: string): string {
  const m = url.match(/20(1[5-9]|2[0-9])/);
  return m ? m[0] : String(new Date().getFullYear());
}

function extractFilename(url: string): string {
  try {
    const path = new URL(url).pathname;
    const name = path.split("/").pop() || "annual-report.pdf";
    return name.toLowerCase().endsWith(".pdf") ? name : name + ".pdf";
  } catch { return "annual-report.pdf"; }
}

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch { return false; }
}

export async function POST(request: NextRequest) {
  await setupDb();

  const body = await request.json();
  const { name, ticker, sector, url, doc_type = "annual_report", year: yearOverride } = body;

  if (!name?.trim()) return NextResponse.json({ error: "Company name required" }, { status: 400 });
  if (!url?.trim())  return NextResponse.json({ error: "Annual report URL required" }, { status: 400 });
  if (!isValidUrl(url.trim())) return NextResponse.json({ error: "Invalid URL" }, { status: 400 });

  const stockId  = uuidv4();
  const docId    = uuidv4();
  const year     = yearOverride || extractYear(url.trim());
  const fileName = extractFilename(url.trim());

  // Create stock immediately
  await createStock({
    id: stockId,
    name: name.trim(),
    ticker: ticker?.trim().toUpperCase() || null,
    sector: sector?.trim() || null,
  });
  await updateStock(stockId, { status: "processing", progress: 5, progress_message: "Downloading annual report..." });

  // Download PDF
  let buffer: Buffer;
  try {
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 45_000);

    const res = await fetch(url.trim(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/pdf,*/*",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      await updateStock(stockId, { status: "error", progress_message: `URL returned HTTP ${res.status}` });
      return NextResponse.json({ error: `URL returned HTTP ${res.status}` }, { status: 400 });
    }

    buffer = Buffer.from(await res.arrayBuffer());
  } catch (err: unknown) {
    const msg = err instanceof Error && err.message.includes("abort")
      ? "Download timed out. The file may be too large or the server too slow."
      : `Download failed: ${err instanceof Error ? err.message : String(err)}`;
    await updateStock(stockId, { status: "error", progress_message: msg });
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (buffer.length < 1024) {
    await updateStock(stockId, { status: "error", progress_message: "Downloaded file is too small to be a valid PDF." });
    return NextResponse.json({ error: "File too small" }, { status: 400 });
  }
  if (buffer.length > 50 * 1024 * 1024) {
    await updateStock(stockId, { status: "error", progress_message: "PDF exceeds 50MB limit." });
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  // Parse PDF
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
    id: docId, stock_id: stockId, file_name: fileName,
    doc_type, year, blob_url: url.trim(),
    page_count: parsed.pageCount, word_count: parsed.wordCount,
  });

  await updateStock(stockId, {
    progress: 28,
    progress_message: `${parsed.pageCount} pages · ${parsed.wordCount.toLocaleString()} words — queuing analysis...`,
  });

  // ── Return stockId now — client will trigger analysis separately ──────────
  return NextResponse.json({ stockId, docId });
}
