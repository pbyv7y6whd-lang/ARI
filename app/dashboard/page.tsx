"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus, Search, TrendingUp, TrendingDown, BarChart3, Clock,
  AlertTriangle, ChevronRight, Loader2,
} from "lucide-react";
import InitiateCoverageModal from "@/components/stocks/InitiateCoverageModal";
import { cn, verdictFromScore, scoreColour, formatDateShort } from "@/lib/utils";

type Stock = {
  id: string;
  name: string;
  ticker: string | null;
  sector: string | null;
  status: "pending" | "processing" | "complete" | "error";
  progress: number;
  progress_message: string | null;
  doc_count: number;
  updated_at: string;
  overall_score: { total: number } | null;
  investment_snapshot: { sector: string; attractivenessScore: number } | null;
  thesis: string | null;
  top_bull: string | null;
  top_bear: string | null;
};

export default function DashboardPage() {
  const [stocks,  setStocks]  = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [search,  setSearch]  = useState("");
  const [sector,  setSector]  = useState("all");

  const fetchStocks = async () => {
    const res = await fetch("/api/stocks");
    if (res.ok) setStocks(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchStocks();
    const iv = setInterval(() => {
      setStocks(prev => {
        if (prev.some(s => s.status === "processing")) fetchStocks();
        return prev;
      });
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  const complete   = stocks.filter(s => s.status === "complete");
  const processing = stocks.filter(s => s.status === "processing");
  const highQuality = complete.filter(s => (s.overall_score?.total ?? 0) >= 75);
  const flagged     = complete.filter(s => (s.overall_score?.total ?? 0) < 48);
  const avgScore    = complete.length
    ? Math.round(complete.reduce((s, c) => s + (c.overall_score?.total ?? 0), 0) / complete.length)
    : null;

  const sectors = ["all", ...Array.from(new Set(
    stocks.map(s => s.sector || s.investment_snapshot?.sector).filter(Boolean) as string[]
  ))];

  const filtered = complete.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.ticker?.toLowerCase().includes(q);
    const matchSector = sector === "all" || (s.sector || s.investment_snapshot?.sector) === sector;
    return matchSearch && matchSector;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 border-b border-[#161616] bg-[#0a0a0a] h-12 flex items-center px-5 gap-3">
        <div className="flex-1 flex items-center gap-3">
          <h1 className="text-[12px] font-semibold text-white/60">Stock Universe</h1>
          {processing.length > 0 && (
            <span className="flex items-center gap-1.5 text-[11px] text-amber-500/70 font-mono">
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
              {processing.length} analysing
            </span>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-white/20" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-48 border border-[#1e1e1e] bg-transparent pl-7 pr-3 py-1.5 text-[12px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors rounded-sm"
          />
        </div>

        <button onClick={() => setModal(true)}
          className="flex items-center gap-1.5 bg-white px-3 py-1.5 text-[11px] font-semibold text-black hover:bg-white/90 transition-colors rounded-sm">
          <Plus className="h-3 w-3" />
          Initiate Coverage
        </button>
      </div>

      {/* ── Metrics strip ────────────────────────────────────────────────── */}
      {complete.length > 0 && (
        <div className="grid grid-cols-4 border-b border-[#161616] divide-x divide-[#161616]">
          {[
            { label: "Covered",       value: String(complete.length),       sub: "companies",       colour: "text-white/70" },
            { label: "High Quality",  value: String(highQuality.length),    sub: "score ≥ 75",      colour: "text-emerald-500" },
            { label: "Flagged",       value: String(flagged.length),        sub: "score < 48",      colour: "text-red-400" },
            { label: "Avg Score",     value: avgScore ? `${avgScore}` : "—", sub: "out of 100",    colour: "text-white/50" },
          ].map(({ label, value, sub, colour }) => (
            <div key={label} className="px-5 py-3">
              <p className="text-[10px] uppercase tracking-widest text-white/25 mb-1.5">{label}</p>
              <p className={cn("font-mono text-[20px] font-bold leading-none", colour)}>{value}</p>
              <p className="text-[10px] text-white/20 mt-1 font-mono">{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Sector filter ────────────────────────────────────────────────── */}
      {sectors.length > 2 && (
        <div className="border-b border-[#161616] px-5 py-2 flex items-center gap-1.5 overflow-x-auto">
          {sectors.slice(0, 8).map(s => (
            <button key={s} onClick={() => setSector(s)}
              className={cn(
                "shrink-0 px-2.5 py-1 text-[11px] font-medium transition-colors rounded-sm",
                sector === s
                  ? "bg-white text-black"
                  : "text-white/30 hover:text-white/60 border border-white/10 hover:border-white/20"
              )}>
              {s === "all" ? "All Sectors" : s}
            </button>
          ))}
        </div>
      )}

      <div className="p-5">

        {/* ── Processing ───────────────────────────────────────────────── */}
        {processing.length > 0 && (
          <div className="mb-6 space-y-2">
            {processing.map(s => <ProcessingRow key={s.id} stock={s} />)}
          </div>
        )}

        {/* ── Stock grid ───────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-40 animate-pulse border border-[#161616] bg-[#0d0d0d] rounded-sm" />
            ))}
          </div>
        ) : filtered.length === 0 && !processing.length ? (
          <EmptyState onAdd={() => setModal(true)} hasStocks={complete.length > 0} />
        ) : (
          <div className="grid grid-cols-1 gap-px md:grid-cols-2 xl:grid-cols-3 bg-[#161616]">
            {filtered.map(s => <StockCard key={s.id} stock={s} />)}
          </div>
        )}

        {/* ── Pending / error ──────────────────────────────────────────── */}
        {stocks.filter(s => s.status === "pending" || s.status === "error").length > 0 && (
          <div className="mt-6">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/20 mb-2">Awaiting Filings</p>
            <div className="grid grid-cols-1 gap-px md:grid-cols-2 xl:grid-cols-3 bg-[#161616]">
              {stocks.filter(s => s.status === "pending" || s.status === "error").map(s => (
                <Link key={s.id} href={`/dashboard/stocks/${s.id}`}>
                  <div className={cn(
                    "bg-[#0a0a0a] px-4 py-3 hover:bg-[#0d0d0d] transition-colors cursor-pointer",
                    s.status === "error" && "border-l-2 border-red-500/40"
                  )}>
                    <div className="flex items-center gap-1.5 mb-1">
                      {s.ticker && <span className="font-mono text-[10px] text-white/30">{s.ticker}</span>}
                      <span className="text-[12px] font-medium text-white/50">{s.name}</span>
                    </div>
                    <p className={cn("text-[11px]", s.status === "error" ? "text-red-400/60" : "text-white/25")}>
                      {s.status === "error" ? s.progress_message || "Analysis failed" : "No filings — click to add"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      <InitiateCoverageModal
        open={modal}
        onClose={() => setModal(false)}
        onSuccess={() => { setModal(false); fetchStocks(); }}
      />
    </div>
  );
}

// ── Stock card ──────────────────────────────────────────────────────────────────

function StockCard({ stock }: { stock: Stock }) {
  const score   = stock.overall_score?.total;
  const attract = stock.investment_snapshot?.attractivenessScore;
  const sector  = stock.sector || stock.investment_snapshot?.sector;
  const verdict = score !== undefined ? verdictFromScore(score) : null;

  return (
    <Link href={`/dashboard/stocks/${stock.id}`}>
      <div className="group bg-[#0a0a0a] hover:bg-[#0d0d0d] transition-colors cursor-pointer h-full">

        {/* Score line */}
        {score !== undefined && (
          <div className="h-[2px]" style={{ background: scoreColour(score) }} />
        )}

        <div className="p-4">
          {/* Row 1: identifiers + score */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                {stock.ticker && (
                  <span className="font-mono text-[11px] font-bold text-white/40">{stock.ticker}</span>
                )}
                {sector && (
                  <span className="text-[10px] text-white/20">· {sector}</span>
                )}
              </div>
              <h3 className="text-[13px] font-semibold text-white/75 group-hover:text-white transition-colors leading-tight truncate">
                {stock.name}
              </h3>
              {verdict && (
                <span className={cn("mt-1.5 inline-block text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider", verdict.className)}>
                  {verdict.label}
                </span>
              )}
            </div>
            {score !== undefined && (
              <div className="shrink-0 text-right">
                <div className="font-mono text-[24px] font-bold leading-none" style={{ color: scoreColour(score) }}>
                  {score}
                </div>
                <div className="text-[9px] text-white/20 font-mono">/100</div>
              </div>
            )}
          </div>

          {/* Attractiveness bar */}
          {attract !== undefined && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-white/25 uppercase tracking-wider">Attractiveness</span>
                <span className="font-mono text-[10px] text-white/30">{attract}/10</span>
              </div>
              <div className="h-px w-full bg-white/[0.06]">
                <div className="h-px transition-all" style={{ width: `${attract * 10}%`, background: scoreColour(attract, 10) }} />
              </div>
            </div>
          )}

          {/* Thesis */}
          {stock.thesis && (
            <p className="mb-3 text-[11px] leading-relaxed text-white/30 line-clamp-2">{stock.thesis}</p>
          )}

          {/* Bull / bear */}
          {(stock.top_bull || stock.top_bear) && (
            <div className="mb-3 space-y-1">
              {stock.top_bull && (
                <div className="flex items-start gap-1.5 text-[11px]">
                  <TrendingUp className="mt-0.5 h-2.5 w-2.5 shrink-0 text-emerald-500/60" />
                  <span className="text-white/30 line-clamp-1">{stock.top_bull}</span>
                </div>
              )}
              {stock.top_bear && (
                <div className="flex items-start gap-1.5 text-[11px]">
                  <TrendingDown className="mt-0.5 h-2.5 w-2.5 shrink-0 text-red-400/60" />
                  <span className="text-white/30 line-clamp-1">{stock.top_bear}</span>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/[0.05] pt-2.5 mt-1">
            <span className="text-[10px] text-white/20 font-mono">
              {stock.doc_count} filing{stock.doc_count !== 1 ? "s" : ""}
            </span>
            <span className="text-[10px] text-white/20 font-mono">{formatDateShort(stock.updated_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Processing row ──────────────────────────────────────────────────────────────

function ProcessingRow({ stock }: { stock: Stock }) {
  return (
    <Link href={`/dashboard/stocks/${stock.id}`}>
      <div className="border border-amber-500/10 bg-amber-500/[0.03] px-4 py-3 hover:bg-amber-500/[0.05] transition-colors cursor-pointer rounded-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Loader2 className="h-3 w-3 text-amber-500/60 animate-spin shrink-0" />
            <span className="text-[12px] font-medium text-white/60">
              {stock.ticker ? `${stock.ticker} · ` : ""}{stock.name}
            </span>
          </div>
          <span className="font-mono text-[11px] text-amber-500/50">{stock.progress}%</span>
        </div>
        <div className="h-px w-full bg-white/[0.05] mb-1.5">
          <div className="h-px bg-amber-500/50 transition-all duration-1000"
            style={{ width: `${stock.progress || 5}%` }} />
        </div>
        <p className="text-[11px] text-white/25">{stock.progress_message || "Analysing..."}</p>
      </div>
    </Link>
  );
}

// ── Empty state ─────────────────────────────────────────────────────────────────

function EmptyState({ onAdd, hasStocks }: { onAdd: () => void; hasStocks: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 w-8 h-8 border border-white/10 flex items-center justify-center">
        <BarChart3 className="h-4 w-4 text-white/20" />
      </div>
      <h3 className="text-[14px] font-semibold text-white/40 mb-2">
        {hasStocks ? "No stocks match your filters" : "No coverage initiated"}
      </h3>
      <p className="text-[12px] text-white/20 max-w-xs leading-relaxed mb-6">
        {hasStocks
          ? "Clear your search or sector filter."
          : "Paste an annual report URL or upload a PDF to generate institutional-grade research."}
      </p>
      {!hasStocks && (
        <button onClick={onAdd}
          className="flex items-center gap-1.5 bg-white px-4 py-2 text-[12px] font-semibold text-black hover:bg-white/90 transition-colors rounded-sm">
          <Plus className="h-3 w-3" />
          Initiate Coverage
        </button>
      )}
    </div>
  );
}
