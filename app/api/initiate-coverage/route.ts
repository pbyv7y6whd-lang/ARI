/**
 * POST /api/initiate-coverage
 *
 * Single-call endpoint:
 *   1. Validate + download PDF from URL
 *   2. Create stock record
 *   3. Store PDF in Vercel Blob
 *   4. Kick off async analysis pipeline
 */

import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { createStock, addDocument, updateStock, setupDb } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { v4 as uuidv4 } from "uuid";

export const maxDuration = 60;

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractYearFromUrl(url: string): string | null {
  const match = url.match(/20(1[5-9]|2[0-9])/);
  return match ? match[0] : null;
}

function extractFilenameFromUrl(url: string): string {
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
  } catch {
    return false;
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  await setupDb();

  const body = await request.json();
  const { name, ticker, sector, url, doc_type = "annual_report", year: yearOverride } = body;

  // ── Validate inputs ───────────────────────────────────────────────────────
  if (!name?.trim()) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  }
  if (!url?.trim()) {
    return NextResponse.json({ error: "Annual report URL is required" }, { status: 400 });
  }
  if (!isValidUrl(url.trim())) {
    return NextResponse.json({ error: "Invalid URL — must start with http:// or https://" }, { status: 400 });
  }

  // ── Download PDF ──────────────────────────────────────────────────────────
  let buffer: Buffer;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    const res = await fetch(url.trim(), {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/pdf,*/*",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        { error: `Could not access that URL (HTTP ${res.status}). Check the link is a direct PDF link.` },
        { status: 400 }
      );
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("pdf") && !url.toLowerCase().includes(".pdf")) {
      return NextResponse.json(
        { error: "URL does not appear to point to a PDF file. Make sure you're linking directly to the PDF, not an HTML page." },
        { status: 400 }
      );
    }

    buffer = Buffer.from(await res.arrayBuffer());
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("aborted")) {
      return NextResponse.json(
        { error: "Download timed out after 30 seconds. The document may be too large or the server too slow." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: `Failed to download PDF: ${msg}` },
      { status: 400 }
    );
  }

  if (buffer.length < 1024) {
    return NextResponse.json(
      { error: "Downloaded file is too small to be a valid PDF." },
      { status: 400 }
    );
  }
  if (buffer.length > 50 * 1024 * 1024) {
    return NextResponse.json(
      { error: "PDF is too large (max 50 MB). Try a compressed version." },
      { status: 400 }
    );
  }

  // ── Quick parse for metadata ──────────────────────────────────────────────
  let pageCount: number | null = null;
  let wordCount: number | null = null;
  try {
    const { parsePDF } = await import("@/lib/pdf");
    const parsed = await parsePDF(buffer);
    pageCount = parsed.pageCount;
    wordCount = parsed.wordCount;
  } catch { /* non-fatal */ }

  // ── Create records ────────────────────────────────────────────────────────
  const stockId = uuidv4();
  const docId = uuidv4();
  const fileName = extractFilenameFromUrl(url.trim());
  const year = yearOverride || extractYearFromUrl(url.trim()) || String(new Date().getFullYear());

  // Upload to Vercel Blob
  const blob = await put(`stocks/${stockId}/${docId}/${fileName}`, buffer, {
    access: "public",
    contentType: "application/pdf",
  });

  await createStock({
    id: stockId,
    name: name.trim(),
    ticker: ticker?.trim().toUpperCase() || null,
    sector: sector?.trim() || null,
  });

  await addDocument({
    id: docId,
    stock_id: stockId,
    file_name: fileName,
    doc_type,
    year,
    blob_url: blob.url,
    page_count: pageCount,
    word_count: wordCount,
  });

  // ── Kick off analysis (fire and forget) ───────────────────────────────────
  runFullAnalysis(stockId).catch(console.error);

  return NextResponse.json({ stockId, docId });
}

// ── Analysis pipeline with granular progress ──────────────────────────────────

async function runFullAnalysis(stockId: string) {
  const { getStock, getDocumentsForStock, updateStock } = await import("@/lib/db");
  const { parsePDF } = await import("@/lib/pdf");
  const { analyseStock } = await import("@/lib/analysis");

  const progress = async (pct: number, msg: string) => {
    await updateStock(stockId, { progress: pct, progress_message: msg });
  };

  try {
    await progress(8,  "Downloading and verifying document...");

    const stock = await getStock(stockId);
    const docs  = await getDocumentsForStock(stockId);
    if (!docs.length) return;

    await progress(18, "Parsing document structure...");

    const parsedDocs = [];
    for (const doc of docs) {
      const res = await fetch(doc.blob_url);
      const buf = Buffer.from(await res.arrayBuffer());
      const parsed = await parsePDF(buf);
      parsedDocs.push({ file_name: doc.file_name, doc_type: doc.doc_type, year: doc.year, parsed });
    }

    const totalWords = parsedDocs.reduce((s, d) => s + (d.parsed.wordCount || 0), 0);
    const totalPages = parsedDocs.reduce((s, d) => s + (d.parsed.pageCount || 0), 0);

    await progress(28, `Identified ${totalPages} pages · ${totalWords.toLocaleString()} words`);
    await progress(35, "Locating sections — Chairman statement, CEO review, strategy...");
    await progress(42, "Analysing financial quality and cash conversion...");
    await progress(50, "Evaluating management quality and capital allocation...");
    await progress(58, "Reviewing governance, board structure and remuneration...");
    await progress(65, "Building bull case and bear case...");
    await progress(72, "Identifying accounting red flags...");
    await progress(78, "Running variant perception analysis...");
    await progress(84, "Generating risk matrix and investment catalysts...");
    await progress(90, "Compiling investment memo and management questions...");

    const analysis = await analyseStock(
      stock.name,
      parsedDocs,
      async (msg) => { await progress(92, msg); }
    );

    await progress(97, "Finalising research report...");

    await updateStock(stockId, {
      status: "complete",
      progress: 100,
      progress_message: "Research complete",
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
