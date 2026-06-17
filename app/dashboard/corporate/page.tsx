"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus, Building2, Loader2, TrendingUp, TrendingDown,
  X, Upload, Globe, AlertCircle, ArrowRight,
} from "lucide-react";
import { cn, formatDateShort } from "@/lib/utils";

type Corporate = {
  id: string;
  name: string;
  ticker: string | null;
  sector: string | null;
  entity_type: string;
  status: "pending" | "processing" | "complete" | "error";
  progress: number;
  progress_message: string | null;
  doc_count: number;
  updated_at: string;
  overall_score: { total: number } | null;
  snapshot: {
    issuer?: string;
    country?: string;
    sector?: string;
    creditView?: "Positive" | "Neutral" | "Negative";
    creditRationale?: string;
  } | null;
  credit_verdict: {
    recommendation?: "Buy" | "Hold" | "Sell";
    spreadView?: "Tighten" | "Stable" | "Widen";
    summary?: string;
  } | null;
  credit_metrics: {
    netDebtToEbitda?: string;
    interestCoverage?: string;
    trend?: string;
  } | null;
  top_bull: string | null;
  top_bear: string | null;
};

const CORPORATE_DOC_TYPES = [
  { value: "annual_report",         label: "Annual Report" },
  { value: "prospectus",            label: "Bond Prospectus" },
  { value: "investor_presentation", label: "Investor Presentation" },
  { value: "earnings_call",         label: "Earnings Transcript" },
  { value: "rating_agency_report",  label: "Rating Agency Report" },
  { value: "other",                 label: "Other" },
];

function creditViewColour(view?: string) {
  if (view === "Positive") return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  if (view === "Negative") return "text-red-400 bg-red-400/10 border-red-400/20";
  return "text-amber-500 bg-amber-500/10 border-amber-500/20";
}

function recommendationColour(rec?: string) {
  if (rec === "Buy")  return "text-emerald-500";
  if (rec === "Sell") return "text-red-400";
  return "text-amber-500";
}

function spreadViewColour(sv?: string) {
  if (sv === "Tighten") return "text-emerald-500/60";
  if (sv === "Widen")   return "text-red-400/60";
  return "text-amber-500/60";
}

function scoreColour(score: number) {
  if (score >= 70) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

// ── Add Corporate Modal ───────────────────────────────────────────────────────

function AddCorporateModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const router = useRouter();
  const [mode,    setMode]    = useState<"url" | "upload">("upload");
  const [name,    setName]    = useState("");
  const [ticker,  setTicker]  = useState("");
  const [sector,  setSector]  = useState("");
  const [url,     setUrl]     = useState("");
  const [file,    setFile]    = useState<File | null>(null);
  const [docType, setDocType] = useState("annual_report");
  const [year,    setYear]    = useState(String(new Date().getFullYear()));
  const [dragOver, setDragOver] = useState(false);
  const [state,   setState]   = useState<"idle" | "submitting" | "error">("idle");
  const [error,   setError]   = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const urlValid = url.trim().startsWith("http") && url.trim().includes(".");
  const canSubmit = name.trim() && state !== "submitting" && (mode === "url" ? urlValid : !!file);

  const handleClose = () => {
    if (state === "submitting") return;
    setName(""); setTicker(""); setSector(""); setUrl(""); setFile(null);
    setDocType("annual_report"); setYear(String(new Date().getFullYear()));
    setState("idle"); setError(""); setMode("upload");
    onClose();
  };

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.endsWith(".pdf")) { setError("Please select a PDF file"); return; }
    setError("");
    setFile(f);
    const m = f.name.match(/20(1[5-9]|2[0-9])/);
    if (m) setYear(m[0]);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setState("submitting");
    setError("");

    let stockId: string;

    if (mode === "url") {
      const stockRes = await fetch("/api/stocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), ticker: ticker.trim() || null, sector: sector.trim() || null, entity_type: "corporate" }),
      });
      const stockData = await stockRes.json();
      if (!stockRes.ok) { setError(stockData.error || "Failed to create issuer"); setState("error"); return; }
      stockId = stockData.id;

      const docRes = await fetch(`/api/stocks/${stockId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), doc_type: docType, year }),
      });
      if (!docRes.ok) { const d = await docRes.json(); setError(d.error || "Failed to add document"); setState("error"); return; }
    } else {
      const fd = new FormData();
      fd.append("name", name.trim());
      if (ticker.trim()) fd.append("ticker", ticker.trim().toUpperCase());
      if (sector.trim()) fd.append("sector", sector.trim());
      fd.append("doc_type", docType);
      fd.append("year", year);
      fd.append("entity_type", "corporate");
      fd.append("file", file!);

      const res = await fetch("/api/initiate-coverage-upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to upload"); setState("error"); return; }
      stockId = data.stockId;
    }

    router.push(`/dashboard/stocks/${stockId}`);
    fetch(`/api/stocks/${stockId}/analyse`, { method: "POST" }).catch(console.error);
    setState("idle");
    onSuccess();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-sm border border-[#282828] bg-[#0f0f0f]" style={{ boxShadow: "0 32px 64px rgba(0,0,0,0.6)" }}>
        <div className="flex items-center justify-between border-b border-[#1e1e1e] px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#555]">Corporate Tracker</p>
            <h2 className="mt-0.5 text-[15px] font-semibold text-[#f0f0f0]">Add Corporate</h2>
          </div>
          <button onClick={handleClose} disabled={state === "submitting"}
            className="flex h-7 w-7 items-center justify-center rounded-sm text-[#444] hover:bg-[#1a1a1a] hover:text-[#aaa] disabled:opacity-40">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          {/* Mode toggle */}
          <div className="flex rounded-sm border border-[#242424] bg-[#0a0a0a] p-0.5">
            {(["upload", "url"] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} disabled={state === "submitting"}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-sm py-1.5 text-[11px] font-medium transition-colors",
                  mode === m ? "bg-[#1e1e1e] text-[#e0e0e0]" : "text-[#555] hover:text-[#888]"
                )}>
                {m === "upload" ? <><Upload className="h-3 w-3" /> Upload PDF</> : <><Globe className="h-3 w-3" /> Paste URL</>}
              </button>
            ))}
          </div>

          {mode === "url" && (
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/30 mb-1.5 block">Document URL</label>
              <input value={url} onChange={e => { setUrl(e.target.value); setError(""); }}
                placeholder="https://ir.company.com/annual-report-2024.pdf"
                disabled={state === "submitting"}
                className="w-full rounded-sm border border-[#242424] bg-[#0a0a0a] px-3 py-2 text-[13px] text-[#e0e0e0] placeholder-[#333] outline-none focus:border-[#3a3a3a] disabled:opacity-50" />
            </div>
          )}

          {mode === "upload" && (
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/30 mb-1.5 block">PDF File</label>
              <div onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0] ?? null); }}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed px-4 py-6 transition-colors",
                  dragOver ? "border-amber-500/60 bg-amber-500/5" : file ? "border-amber-500/40 bg-amber-500/5" : "border-[#242424] hover:border-[#333]"
                )}>
                <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden"
                  disabled={state === "submitting"} onChange={e => handleFile(e.target.files?.[0] ?? null)} />
                {file ? (
                  <div className="text-center">
                    <p className="text-[12px] font-medium text-[#e0e0e0]">{file.name}</p>
                    <p className="text-[11px] text-[#555]">{(file.size / 1024 / 1024).toFixed(1)} MB · click to change</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="h-4 w-4 text-[#555] mx-auto mb-1" />
                    <p className="text-[12px] text-[#888]">Drop PDF here or click to browse</p>
                    <p className="text-[11px] text-[#444]">Max 50MB</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Issuer name + ticker */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-white/30 mb-1.5 block">Issuer Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Safaricom PLC"
                disabled={state === "submitting"}
                className="w-full rounded-sm border border-[#242424] bg-[#0a0a0a] px-3 py-2 text-[13px] text-[#e0e0e0] placeholder-[#333] outline-none focus:border-[#3a3a3a] disabled:opacity-50" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/30 mb-1.5 block">Ticker</label>
              <input value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())} placeholder="SCOM"
                disabled={state === "submitting"}
                className="w-full rounded-sm border border-[#242424] bg-[#0a0a0a] px-3 py-2 font-mono text-[13px] text-[#e0e0e0] placeholder-[#333] outline-none focus:border-[#3a3a3a] disabled:opacity-50" />
            </div>
          </div>

          {/* Sector + doc type + year */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/30 mb-1.5 block">Sector</label>
              <input value={sector} onChange={e => setSector(e.target.value)} placeholder="Telecoms"
                disabled={state === "submitting"}
                className="w-full rounded-sm border border-[#242424] bg-[#0a0a0a] px-3 py-2 text-[13px] text-[#e0e0e0] placeholder-[#333] outline-none focus:border-[#3a3a3a] disabled:opacity-50" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/30 mb-1.5 block">Doc Type</label>
              <select value={docType} onChange={e => setDocType(e.target.value)} disabled={state === "submitting"}
                className="w-full rounded-sm border border-[#242424] bg-[#0a0a0a] px-3 py-2 text-[13px] text-[#e0e0e0] outline-none focus:border-[#3a3a3a] disabled:opacity-50">
                {CORPORATE_DOC_TYPES.map(t => <option key={t.value} value={t.value} className="bg-[#0f0f0f]">{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/30 mb-1.5 block">Year</label>
              <input value={year} onChange={e => setYear(e.target.value)} placeholder="2024"
                disabled={state === "submitting"}
                className="w-full rounded-sm border border-[#242424] bg-[#0a0a0a] px-3 py-2 font-mono text-[13px] text-[#e0e0e0] placeholder-[#333] outline-none focus:border-[#3a3a3a] disabled:opacity-50" />
            </div>
          </div>

          {state === "submitting" && (
            <div className="rounded-sm border border-[#242424] bg-[#0a0a0a] px-4 py-3 flex items-center gap-2.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500 shrink-0" />
              <span className="text-[12px] text-[#9a9a9a]">Processing document...</span>
            </div>
          )}

          {state === "error" && error && (
            <div className="flex items-start gap-2.5 rounded-sm border border-[#ef4444]/25 bg-[#ef4444]/5 px-4 py-3">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ef4444]" />
              <p className="text-[12px] text-[#ef4444]">{error}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 border-t border-[#1a1a1a] px-5 py-4">
          <button onClick={handleClose} disabled={state === "submitting"}
            className="flex-none rounded-sm border border-[#242424] px-4 py-2 text-[12px] text-[#666] hover:border-[#333] hover:text-[#aaa] disabled:opacity-40">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!canSubmit}
            className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-white px-4 py-2 text-[12px] font-semibold text-black hover:bg-[#e8e8e8] disabled:cursor-not-allowed disabled:opacity-30">
            {state === "submitting"
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Adding corporate...</>
              : <>Add &amp; Analyse <ArrowRight className="h-3.5 w-3.5" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Corporate Card ────────────────────────────────────────────────────────────

function CorporateCard({ c }: { c: Corporate }) {
  const score    = c.overall_score?.total;
  const view     = c.snapshot?.creditView;
  const rec      = c.credit_verdict?.recommendation;
  const sv       = c.credit_verdict?.spreadView;
  const sector   = c.sector || c.snapshot?.sector;
  const country  = c.snapshot?.country;
  const leverage = c.credit_metrics?.netDebtToEbitda;
  const coverage = c.credit_metrics?.interestCoverage;

  return (
    <Link href={`/dashboard/stocks/${c.id}`}>
      <div className="group bg-[#0a0a0a] hover:bg-[#0d0d0d] transition-colors cursor-pointer h-full">
        {score !== undefined && (
          <div className="h-[2px]" style={{ background: scoreColour(score) }} />
        )}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                {c.ticker && <span className="font-mono text-[10px] text-white/30">{c.ticker}</span>}
                {country && <span className="text-[10px] text-white/20">{country}</span>}
                {sector && <span className="text-[10px] text-white/20">· {sector}</span>}
              </div>
              <h3 className="text-[13px] font-semibold text-white/75 group-hover:text-white transition-colors leading-tight truncate">
                {c.name}
              </h3>
              {view && (
                <span className={cn("mt-1.5 inline-block text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider border rounded-sm", creditViewColour(view))}>
                  {view}
                </span>
              )}
            </div>
            {score !== undefined && (
              <div className="shrink-0 text-right">
                <div className="font-mono text-[24px] font-bold leading-none" style={{ color: scoreColour(score) }}>{score}</div>
                <div className="text-[9px] text-white/20 font-mono">/100</div>
              </div>
            )}
          </div>

          {/* Credit metrics */}
          {(leverage || coverage) && (
            <div className="mb-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
              {leverage && (
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/20">Net Debt/EBITDA</p>
                  <p className="text-[11px] font-mono text-white/50">{leverage}</p>
                </div>
              )}
              {coverage && (
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/20">Interest Cover</p>
                  <p className="text-[11px] font-mono text-white/50">{coverage}</p>
                </div>
              )}
            </div>
          )}

          {/* Bull/bear */}
          {(c.top_bull || c.top_bear) && (
            <div className="mb-3 space-y-1">
              {c.top_bull && (
                <div className="flex items-start gap-1.5 text-[11px]">
                  <TrendingUp className="mt-0.5 h-2.5 w-2.5 shrink-0 text-emerald-500/60" />
                  <span className="text-white/30 line-clamp-1">{c.top_bull}</span>
                </div>
              )}
              {c.top_bear && (
                <div className="flex items-start gap-1.5 text-[11px]">
                  <TrendingDown className="mt-0.5 h-2.5 w-2.5 shrink-0 text-red-400/60" />
                  <span className="text-white/30 line-clamp-1">{c.top_bear}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-white/[0.05] pt-2.5 mt-1">
            <div className="flex items-center gap-2">
              {rec && (
                <span className={cn("text-[10px] font-bold uppercase tracking-wider", recommendationColour(rec))}>{rec}</span>
              )}
              {sv && (
                <span className={cn("text-[10px] font-mono", spreadViewColour(sv))}>Spreads {sv}</span>
              )}
            </div>
            <span className="text-[10px] text-white/20 font-mono">{c.doc_count} doc{c.doc_count !== 1 ? "s" : ""} · {formatDateShort(c.updated_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CorporateTrackerPage() {
  const [corporates, setCorporates] = useState<Corporate[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(false);

  const fetchCorporates = async () => {
    const res = await fetch("/api/stocks?type=corporate");
    if (res.ok) setCorporates(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchCorporates();
    const iv = setInterval(() => {
      setCorporates(prev => {
        if (prev.some(c => c.status === "processing")) fetchCorporates();
        return prev;
      });
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  const complete   = corporates.filter(c => c.status === "complete");
  const processing = corporates.filter(c => c.status === "processing");
  const buys       = complete.filter(c => c.credit_verdict?.recommendation === "Buy");
  const sells      = complete.filter(c => c.credit_verdict?.recommendation === "Sell");

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-[#161616] bg-[#0a0a0a] h-12 flex items-center px-5 gap-3">
        <div className="flex-1 flex items-center gap-3">
          <h1 className="text-[12px] font-semibold text-white/60">Corporate Tracker</h1>
          {processing.length > 0 && (
            <span className="flex items-center gap-1.5 text-[11px] text-amber-500/70 font-mono">
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
              {processing.length} analysing
            </span>
          )}
        </div>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-1.5 bg-white px-3 py-1.5 text-[11px] font-semibold text-black hover:bg-white/90 transition-colors rounded-sm">
          <Plus className="h-3 w-3" />
          Add Corporate
        </button>
      </div>

      {/* Stats strip */}
      {complete.length > 0 && (
        <div className="grid grid-cols-3 border-b border-[#161616] divide-x divide-[#161616]">
          {[
            { label: "Covered", value: String(complete.length), sub: "issuers",    colour: "text-white/70" },
            { label: "Buy",     value: String(buys.length),     sub: "buy-rated",  colour: "text-emerald-500" },
            { label: "Sell",    value: String(sells.length),    sub: "sell-rated", colour: "text-red-400" },
          ].map(({ label, value, sub, colour }) => (
            <div key={label} className="px-5 py-3">
              <p className="text-[10px] uppercase tracking-widest text-white/25 mb-1.5">{label}</p>
              <p className={cn("font-mono text-[20px] font-bold leading-none", colour)}>{value}</p>
              <p className="text-[10px] text-white/20 mt-1 font-mono">{sub}</p>
            </div>
          ))}
        </div>
      )}

      <div className="p-5">
        {/* Processing */}
        {processing.length > 0 && (
          <div className="mb-6 space-y-2">
            {processing.map(c => (
              <Link key={c.id} href={`/dashboard/stocks/${c.id}`}>
                <div className="border border-amber-500/10 bg-amber-500/[0.03] px-4 py-3 hover:bg-amber-500/[0.05] transition-colors cursor-pointer rounded-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 text-amber-500/60 animate-spin shrink-0" />
                      <span className="text-[12px] font-medium text-white/60">
                        {c.ticker ? `${c.ticker} · ` : ""}{c.name}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-amber-500/50">{c.progress}%</span>
                  </div>
                  <div className="h-px w-full bg-white/[0.05] mb-1.5">
                    <div className="h-px bg-amber-500/50 transition-all duration-1000" style={{ width: `${c.progress || 5}%` }} />
                  </div>
                  <p className="text-[11px] text-white/25">{c.progress_message || "Analysing..."}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {[1,2,3].map(i => <div key={i} className="h-40 animate-pulse border border-[#161616] bg-[#0d0d0d] rounded-sm" />)}
          </div>
        ) : complete.length === 0 && !processing.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 w-8 h-8 border border-white/10 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white/20" />
            </div>
            <h3 className="text-[14px] font-semibold text-white/40 mb-2">No corporates tracked yet</h3>
            <p className="text-[12px] text-white/20 max-w-xs leading-relaxed mb-6">
              Upload annual reports, bond prospectuses, or investor presentations to get started.
            </p>
            <button onClick={() => setModal(true)}
              className="flex items-center gap-1.5 bg-white px-4 py-2 text-[12px] font-semibold text-black hover:bg-white/90 transition-colors rounded-sm">
              <Plus className="h-3 w-3" />
              Add First Corporate
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-px md:grid-cols-2 xl:grid-cols-3 bg-[#161616]">
            {complete.map(c => <CorporateCard key={c.id} c={c} />)}
          </div>
        )}

        {/* Pending/error */}
        {corporates.filter(c => c.status === "pending" || c.status === "error").length > 0 && (
          <div className="mt-6">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/20 mb-2">Awaiting Documents</p>
            <div className="grid grid-cols-1 gap-px md:grid-cols-2 xl:grid-cols-3 bg-[#161616]">
              {corporates.filter(c => c.status === "pending" || c.status === "error").map(c => (
                <Link key={c.id} href={`/dashboard/stocks/${c.id}`}>
                  <div className={cn("bg-[#0a0a0a] px-4 py-3 hover:bg-[#0d0d0d] transition-colors", c.status === "error" && "border-l-2 border-red-500/40")}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {c.ticker && <span className="font-mono text-[10px] text-white/30">{c.ticker}</span>}
                      <p className="text-[12px] font-medium text-white/50">{c.name}</p>
                    </div>
                    <p className={cn("text-[11px]", c.status === "error" ? "text-red-400/60" : "text-white/25")}>
                      {c.status === "error" ? c.progress_message || "Analysis failed" : "No documents — click to add"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <AddCorporateModal open={modal} onClose={() => setModal(false)} onSuccess={() => { setModal(false); fetchCorporates(); }} />
    </div>
  );
}
