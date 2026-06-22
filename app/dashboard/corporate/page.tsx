"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus, Building2, Loader2, TrendingUp, TrendingDown,
  X, AlertCircle, ArrowRight,
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
  const [name,   setName]   = useState("");
  const [ticker, setTicker] = useState("");
  const [sector, setSector] = useState("");
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const handleClose = () => {
    if (saving) return;
    setName(""); setTicker(""); setSector(""); setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/stocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), ticker: ticker.trim() || null, sector: sector.trim() || null, entity_type: "corporate" }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Failed to create"); setSaving(false); return; }
    onSuccess();
    router.push(`/dashboard/stocks/${data.id}`);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a0a2e]/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-sm border border-[#c8bedd] bg-[#ede8f5]" style={{ boxShadow: "0 32px 64px rgba(0,0,0,0.15)" }}>
        <div className="flex items-center justify-between border-b border-[#d8cfe8] px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9a7cc0]">Corporate Tracker</p>
            <h2 className="mt-0.5 text-[15px] font-semibold text-[#1a0a2e]">Add Corporate</h2>
          </div>
          <button onClick={handleClose} disabled={saving}
            className="flex h-7 w-7 items-center justify-center rounded-sm text-[#b09dcc] hover:bg-[#ddd6ec] hover:text-[#4a2980] disabled:opacity-40">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-5">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-[#8b6bb5] mb-1.5 block">Issuer Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Commercial International Bank"
              autoFocus disabled={saving}
              className="w-full rounded-sm border border-[#d0c6e0] bg-[#fafaf8] px-3 py-2 text-[13px] text-[#2d1654] placeholder-[#b09dcc] outline-none focus:border-[#5b21b6] disabled:opacity-50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#8b6bb5] mb-1.5 block">Ticker</label>
              <input value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())} placeholder="COMI"
                disabled={saving}
                className="w-full rounded-sm border border-[#d0c6e0] bg-[#fafaf8] px-3 py-2 font-mono text-[13px] text-[#2d1654] placeholder-[#b09dcc] outline-none focus:border-[#5b21b6] disabled:opacity-50" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#8b6bb5] mb-1.5 block">Sector</label>
              <input value={sector} onChange={e => setSector(e.target.value)} placeholder="Financials"
                disabled={saving}
                className="w-full rounded-sm border border-[#d0c6e0] bg-[#fafaf8] px-3 py-2 text-[13px] text-[#2d1654] placeholder-[#b09dcc] outline-none focus:border-[#5b21b6] disabled:opacity-50" />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-sm border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />
              <p className="text-[12px] text-red-600">{error}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 border-t border-[#ddd6ec] px-5 py-4">
          <button onClick={handleClose} disabled={saving}
            className="flex-none rounded-sm border border-[#d0c6e0] px-4 py-2 text-[12px] text-[#8b6bb5] hover:border-[#5b21b6]/50 hover:text-[#4a2980] disabled:opacity-40">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!name.trim() || saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-[#5b21b6] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#5b21b6]/90 disabled:cursor-not-allowed disabled:opacity-30">
            {saving
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Creating...</>
              : <>Create <ArrowRight className="h-3.5 w-3.5" /></>}
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
      <div className="group bg-[#fafaf8] hover:bg-[#f0edf6] transition-colors cursor-pointer h-full">
        {score !== undefined && (
          <div className="h-[2px]" style={{ background: scoreColour(score) }} />
        )}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                {c.ticker && <span className="font-mono text-[10px] text-[#8b6bb5]">{c.ticker}</span>}
                {country && <span className="text-[10px] text-[#b09dcc]">{country}</span>}
                {sector && <span className="text-[10px] text-[#b09dcc]">· {sector}</span>}
              </div>
              <h3 className="text-[13px] font-semibold text-[#1a0a2e]/80 group-hover:text-[#1a0a2e] transition-colors leading-tight truncate">
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
                <div className="text-[9px] text-[#b09dcc] font-mono">/100</div>
              </div>
            )}
          </div>

          {/* Credit metrics */}
          {(leverage || coverage) && (
            <div className="mb-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
              {leverage && (
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-[#b09dcc]">Net Debt/EBITDA</p>
                  <p className="text-[11px] font-mono text-[#4a2980]">{leverage}</p>
                </div>
              )}
              {coverage && (
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-[#b09dcc]">Interest Cover</p>
                  <p className="text-[11px] font-mono text-[#4a2980]">{coverage}</p>
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
                  <span className="text-[#8b6bb5] line-clamp-1">{c.top_bull}</span>
                </div>
              )}
              {c.top_bear && (
                <div className="flex items-start gap-1.5 text-[11px]">
                  <TrendingDown className="mt-0.5 h-2.5 w-2.5 shrink-0 text-red-400/60" />
                  <span className="text-[#8b6bb5] line-clamp-1">{c.top_bear}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-[#5b21b6]/10 pt-2.5 mt-1">
            <div className="flex items-center gap-2">
              {rec && (
                <span className={cn("text-[10px] font-bold uppercase tracking-wider", recommendationColour(rec))}>{rec}</span>
              )}
              {sv && (
                <span className={cn("text-[10px] font-mono", spreadViewColour(sv))}>Spreads {sv}</span>
              )}
            </div>
            <span className="text-[10px] text-[#b09dcc] font-mono">{c.doc_count} doc{c.doc_count !== 1 ? "s" : ""} · {formatDateShort(c.updated_at)}</span>
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
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-[#e0d8ee] bg-[#fafaf8] h-12 flex items-center px-5 gap-3">
        <div className="flex-1 flex items-center gap-3">
          <h1 className="text-[12px] font-semibold text-[#2d1654]">Corporate Tracker</h1>
          {processing.length > 0 && (
            <span className="flex items-center gap-1.5 text-[11px] text-amber-500/70 font-mono">
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
              {processing.length} analysing
            </span>
          )}
        </div>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-1.5 bg-[#5b21b6] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#5b21b6]/90 transition-colors rounded-sm">
          <Plus className="h-3 w-3" />
          Add Corporate
        </button>
      </div>

      {/* Stats strip */}
      {complete.length > 0 && (
        <div className="grid grid-cols-3 border-b border-[#e0d8ee] divide-x divide-[#e0d8ee]">
          {[
            { label: "Covered", value: String(complete.length), sub: "issuers",    colour: "text-[#1a0a2e]/80" },
            { label: "Buy",     value: String(buys.length),     sub: "buy-rated",  colour: "text-emerald-500" },
            { label: "Sell",    value: String(sells.length),    sub: "sell-rated", colour: "text-red-400" },
          ].map(({ label, value, sub, colour }) => (
            <div key={label} className="px-5 py-3">
              <p className="text-[10px] uppercase tracking-widest text-[#9a7cc0] mb-1.5">{label}</p>
              <p className={cn("font-mono text-[20px] font-bold leading-none", colour)}>{value}</p>
              <p className="text-[10px] text-[#b09dcc] mt-1 font-mono">{sub}</p>
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
                      <span className="text-[12px] font-medium text-[#2d1654]">
                        {c.ticker ? `${c.ticker} · ` : ""}{c.name}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-amber-500/50">{c.progress}%</span>
                  </div>
                  <div className="h-px w-full bg-[#5b21b6]/[0.12] mb-1.5">
                    <div className="h-px bg-amber-500/50 transition-all duration-1000" style={{ width: `${c.progress || 5}%` }} />
                  </div>
                  <p className="text-[11px] text-[#9a7cc0]">{c.progress_message || "Analysing..."}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {[1,2,3].map(i => <div key={i} className="h-40 animate-pulse border border-[#e0d8ee] bg-[#f0edf6] rounded-sm" />)}
          </div>
        ) : complete.length === 0 && !processing.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 w-8 h-8 border border-[#5b21b6]/20 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-[#b09dcc]" />
            </div>
            <h3 className="text-[14px] font-semibold text-[#6b4fa0] mb-2">No corporates tracked yet</h3>
            <p className="text-[12px] text-[#b09dcc] max-w-xs leading-relaxed mb-6">
              Upload annual reports, bond prospectuses, or investor presentations to get started.
            </p>
            <button onClick={() => setModal(true)}
              className="flex items-center gap-1.5 bg-[#5b21b6] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#5b21b6]/90 transition-colors rounded-sm">
              <Plus className="h-3 w-3" />
              Add First Corporate
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-px md:grid-cols-2 xl:grid-cols-3 bg-[#e0d8ee]">
            {complete.map(c => <CorporateCard key={c.id} c={c} />)}
          </div>
        )}

        {/* Pending/error */}
        {corporates.filter(c => c.status === "pending" || c.status === "error").length > 0 && (
          <div className="mt-6">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#b09dcc] mb-2">Awaiting Documents</p>
            <div className="grid grid-cols-1 gap-px md:grid-cols-2 xl:grid-cols-3 bg-[#e0d8ee]">
              {corporates.filter(c => c.status === "pending" || c.status === "error").map(c => (
                <Link key={c.id} href={`/dashboard/stocks/${c.id}`}>
                  <div className={cn("bg-[#fafaf8] px-4 py-3 hover:bg-[#f0edf6] transition-colors", c.status === "error" && "border-l-2 border-red-500/40")}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {c.ticker && <span className="font-mono text-[10px] text-[#8b6bb5]">{c.ticker}</span>}
                      <p className="text-[12px] font-medium text-[#4a2980]">{c.name}</p>
                    </div>
                    <p className={cn("text-[11px]", c.status === "error" ? "text-red-400/60" : "text-[#9a7cc0]")}>
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
