"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Loader2, AlertCircle, Plus, FileText,
  RefreshCw, Trash2, ChevronDown, ChevronRight,
} from "lucide-react";
import { cn, formatDate, verdictFromScore, scoreColour } from "@/lib/utils";
import type { ReportAnalysis } from "@/lib/supabase";
import ReportView from "@/components/report/ReportView";
import UploadDocModal from "@/components/stocks/UploadDocModal";

type Document = {
  id: string; file_name: string; doc_type: string;
  year: string | null; blob_url: string;
  page_count: number | null; created_at: string;
};

type StockData = {
  id: string; name: string; ticker: string | null; sector: string | null;
  status: "pending" | "processing" | "complete" | "error";
  progress: number; progress_message: string | null;
  analysis: ReportAnalysis | null; doc_count: number;
  created_at: string; updated_at: string; documents: Document[];
};

// ── Pipeline steps shown while processing ─────────────────────────────────────
const PIPELINE_STEPS = [
  { pct: 0,  label: "Downloading and verifying document" },
  { pct: 18, label: "Parsing document structure" },
  { pct: 28, label: "Extracting sections — Chairman, CEO review, strategy" },
  { pct: 42, label: "Analysing financial quality and cash conversion" },
  { pct: 50, label: "Evaluating management quality and capital allocation" },
  { pct: 58, label: "Reviewing governance, board structure and remuneration" },
  { pct: 65, label: "Building bull case and bear case" },
  { pct: 72, label: "Identifying accounting red flags" },
  { pct: 78, label: "Running variant perception analysis" },
  { pct: 84, label: "Generating risk matrix and investment catalysts" },
  { pct: 90, label: "Compiling investment memo and management questions" },
  { pct: 97, label: "Finalising research report" },
];

function getActiveStep(pct: number) {
  let active = 0;
  for (let i = 0; i < PIPELINE_STEPS.length; i++) {
    if (pct >= PIPELINE_STEPS[i].pct) active = i;
  }
  return active;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  annual_report: "Annual Report", interim_report: "Interim Report",
  investor_presentation: "Investor Presentation", earnings_call: "Earnings Call",
  prospectus: "Prospectus", other: "Filing",
};

export default function StockPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [stock,       setStock]       = useState<StockData | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [uploadOpen,  setUploadOpen]  = useState(false);
  const [reanalysing, setReanalysing] = useState(false);
  const [activeTab,   setActiveTab]   = useState<"research" | "documents">("research");

  const fetchStock = async () => {
    const res = await fetch(`/api/stocks/${id}`);
    if (!res.ok) { router.push("/dashboard"); return; }
    setStock(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchStock();
    const iv = setInterval(() => {
      setStock(prev => { if (prev?.status === "processing") fetchStock(); return prev; });
    }, 4000);
    return () => clearInterval(iv);
  }, [id]);

  const handleReanalyse = async () => {
    setReanalysing(true);
    await fetch(`/api/stocks/${id}/analyse`, { method: "POST" });
    await fetchStock();
    setReanalysing(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${stock?.name}? This cannot be undone.`)) return;
    await fetch(`/api/stocks/${id}`, { method: "DELETE" });
    router.push("/dashboard");
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
      <Loader2 className="h-5 w-5 animate-spin text-[#333]" />
    </div>
  );
  if (!stock) return null;

  const score   = stock.analysis?.overallScore?.total;
  const sector  = stock.sector || stock.analysis?.investmentSnapshot?.sector;
  const verdict = score !== undefined ? verdictFromScore(score) : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b border-[#1a1a1a] bg-[#0a0a0a]">
        <div className="flex items-center gap-4 px-6 py-3">
          <Link href="/dashboard" className="text-[#333] transition-colors hover:text-[#888]">
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {stock.ticker && (
                <span className="text-mono text-[12px] font-bold text-[#555] bg-[#141414] border border-[#242424] px-2 py-0.5 rounded-sm">
                  {stock.ticker}
                </span>
              )}
              <h1 className="text-[14px] font-semibold text-[#e8e8e8]">{stock.name}</h1>
              {sector && <span className="text-[12px] text-[#3a3a3a]">· {sector}</span>}
              {verdict && (
                <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-sm", verdict.className)}>
                  {verdict.label}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#333] mt-0.5">
              {stock.documents.length} filing{stock.documents.length !== 1 ? "s" : ""} · Updated {formatDate(stock.updated_at)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {score !== undefined && (
              <div className="text-right px-3 py-1 rounded-sm border border-[#1e1e1e]">
                <div className="text-mono text-[18px] font-bold leading-none" style={{ color: scoreColour(score) }}>
                  {score}
                </div>
                <div className="text-[10px] text-[#333]">/100</div>
              </div>
            )}
            <button onClick={() => setUploadOpen(true)}
              className="flex items-center gap-1.5 rounded-sm border border-[#242424] px-2.5 py-1.5 text-[11px] text-[#666] transition-colors hover:border-[#333] hover:text-[#aaa]">
              <Plus className="h-3 w-3" /> Add Filing
            </button>
            {stock.documents.length > 0 && stock.status !== "processing" && (
              <button onClick={handleReanalyse} disabled={reanalysing}
                className="flex items-center gap-1.5 rounded-sm border border-[#242424] px-2.5 py-1.5 text-[11px] text-[#666] transition-colors hover:border-[#333] hover:text-[#aaa] disabled:opacity-40">
                <RefreshCw className={cn("h-3 w-3", reanalysing && "animate-spin")} />
                Re-analyse
              </button>
            )}
            <button onClick={handleDelete} title="Delete"
              className="rounded-sm p-1.5 text-[#2a2a2a] transition-colors hover:text-[#ef4444]">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-t border-[#141414] px-6">
          {(["research", "documents"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn(
                "border-b-2 px-4 py-2.5 text-[12px] font-medium capitalize transition-colors",
                activeTab === tab
                  ? "border-white text-[#e0e0e0]"
                  : "border-transparent text-[#444] hover:text-[#888]"
              )}>
              {tab === "research" ? "Research Report" : `Filings (${stock.documents.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="px-6 py-6">
        {activeTab === "documents" ? (
          <DocumentsTab stock={stock} onUpload={() => setUploadOpen(true)} />
        ) : stock.status === "processing" ? (
          <ProcessingView stock={stock} />
        ) : stock.status === "pending" || stock.documents.length === 0 ? (
          <PendingView onUpload={() => setUploadOpen(true)} />
        ) : stock.status === "error" ? (
          <ErrorView message={stock.progress_message} onRetry={handleReanalyse} />
        ) : stock.analysis ? (
          <ReportView analysis={stock.analysis} />
        ) : null}
      </div>

      <UploadDocModal stockId={id} open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => { setUploadOpen(false); fetchStock(); }} />
    </div>
  );
}

// ── Processing view ────────────────────────────────────────────────────────────

function ProcessingView({ stock }: { stock: StockData }) {
  const activeStep = getActiveStep(stock.progress);

  return (
    <div className="max-w-lg mx-auto py-16">
      <div className="rounded-sm border border-[#1e1e1e] bg-[#0f0f0f] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#444]">Analysis Pipeline</p>
            <h3 className="mt-1 text-[14px] font-semibold text-[#e0e0e0]">{stock.name}</h3>
          </div>
          <div className="text-right">
            <div className="text-mono text-[20px] font-bold text-[#f59e0b] leading-none">{stock.progress}%</div>
            <div className="text-[10px] text-[#444] mt-0.5">complete</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-px w-full bg-[#1a1a1a] mb-5">
          <div className="h-px bg-[#f59e0b] transition-all duration-1000"
            style={{ width: `${stock.progress || 3}%` }} />
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {PIPELINE_STEPS.map((step, i) => {
            const done    = i < activeStep;
            const current = i === activeStep;
            return (
              <div key={i} className={cn(
                "flex items-center gap-2.5 text-[11px] transition-colors",
                done    ? "text-[#444]" :
                current ? "text-[#c0c0c0]" :
                          "text-[#2a2a2a]"
              )}>
                <div className={cn(
                  "h-1 w-1 shrink-0 rounded-full transition-colors",
                  done    ? "bg-[#22c55e]" :
                  current ? "bg-[#f59e0b] processing-pulse" :
                            "bg-[#1e1e1e]"
                )} />
                <span className={current ? "processing-pulse" : ""}>{step.label}</span>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-[11px] text-[#333]">Typically takes 2–4 minutes. Page updates automatically.</p>
      </div>
    </div>
  );
}

// ── Pending view ───────────────────────────────────────────────────────────────

function PendingView({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-sm border border-[#1e1e1e] bg-[#111]">
        <FileText className="h-4 w-4 text-[#333]" />
      </div>
      <h3 className="text-[14px] font-semibold text-[#888]">No filings uploaded</h3>
      <p className="mt-1.5 max-w-xs text-[12px] text-[#444]">
        Add an annual report URL to generate institutional research for this company.
      </p>
      <button onClick={onUpload}
        className="mt-5 flex items-center gap-1.5 rounded-sm bg-white px-4 py-2 text-[12px] font-semibold text-black hover:bg-[#e8e8e8] transition-colors">
        <Plus className="h-3 w-3" /> Add Filing
      </button>
    </div>
  );
}

// ── Error view ─────────────────────────────────────────────────────────────────

function ErrorView({ message, onRetry }: { message: string | null; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <AlertCircle className="mb-3 h-8 w-8 text-[#ef4444]/60" />
      <h3 className="text-[14px] font-semibold text-[#888]">Analysis failed</h3>
      <p className="mt-1.5 max-w-sm text-[12px] text-[#555]">{message || "An error occurred."}</p>
      <button onClick={onRetry}
        className="mt-5 flex items-center gap-1.5 rounded-sm border border-[#242424] px-4 py-2 text-[12px] text-[#888] hover:border-[#333] hover:text-[#ccc] transition-colors">
        <RefreshCw className="h-3 w-3" /> Retry Analysis
      </button>
    </div>
  );
}

// ── Documents tab ──────────────────────────────────────────────────────────────

function DocumentsTab({ stock, onUpload }: { stock: StockData; onUpload: () => void }) {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[13px] font-semibold text-[#c0c0c0]">Filings</h2>
        <button onClick={onUpload}
          className="flex items-center gap-1.5 rounded-sm bg-white px-3 py-1.5 text-[11px] font-semibold text-black hover:bg-[#e8e8e8] transition-colors">
          <Plus className="h-3 w-3" /> Add Filing
        </button>
      </div>

      {stock.documents.length === 0 ? (
        <p className="text-[12px] text-[#444]">No filings yet.</p>
      ) : (
        <div className="rounded-sm border border-[#1e1e1e] overflow-hidden">
          {stock.documents.map((doc, i) => (
            <a key={doc.id} href={doc.blob_url} target="_blank" rel="noopener noreferrer"
              className={cn("flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#111] group",
                i < stock.documents.length - 1 && "border-b border-[#141414]")}>
              <FileText className="h-3.5 w-3.5 shrink-0 text-[#333]" />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-[#c0c0c0] truncate">{doc.file_name}</p>
                <p className="text-[11px] text-[#444]">
                  {DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}
                  {doc.year && ` · ${doc.year}`}
                  {doc.page_count && ` · ${doc.page_count} pages`}
                  {` · Added ${formatDate(doc.created_at)}`}
                </p>
              </div>
              <span className="text-[11px] text-[#2a2a2a] group-hover:text-[#555] transition-colors">↗</span>
            </a>
          ))}
        </div>
      )}

      <p className="mt-4 text-[11px] text-[#333] leading-relaxed">
        Add multiple years of annual reports to generate Year-on-Year trend analysis. Use "Re-analyse" after uploading new filings.
      </p>
    </div>
  );
}
