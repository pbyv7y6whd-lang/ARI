"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, TrendingUp, TrendingDown, AlertTriangle, BarChart3, Clock } from "lucide-react";
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
  const [stocks,   setStocks]   = useState<Stock[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [search,   setSearch]   = useState("");
  const [sector,   setSector]   = useState("all");

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
  const warnings    = complete.filter(s => (s.overall_score?.total ?? 0) < 48);

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
      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div className="border-b border-[#1a1a1a] bg-[#0a0a0a] px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-[13px] font-semibold text-[#e0e0e0]">Stock Universe</h1>
            <p className="text-[11px] text-[#444] mt-0.5">
              {complete.length} companies covered
              {processing.length > 0 && <span className="ml-2 text-[#f59e0b]">· {processing.length} analysing</span>}
            </p>
          </div>

          {/* Search */}
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#3a3a3a]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search company or ticker..."
              className="w-full rounded-sm border border-[#1e1e1e] bg-[#0f0f0f] pl-7 pr-3 py-1.5 text-[12px] text-[#c0c0c0] placeholder-[#333] outline-none focus:border-[#2a2a2a] transition-colors"
            />
          </div>

          {/* Sector pills */}
          {sectors.length > 2 && (
            <div className="flex gap-1">
              {sectors.slice(0, 6).map(s => (
                <button key={s} onClick={() => setSector(s)}
                  className={cn(
                    "rounded-sm px-2.5 py-1 text-[11px] font-medium transition-colors",
                    sector === s
                      ? "bg-white text-black"
                      : "border border-[#1e1e1e] text-[#555] hover:border-[#2a2a2a] hover:text-[#888]"
                  )}>
                  {s === "all" ? "All" : s}
                </button>
              ))}
            </div>
          )}

          <button onClick={() => setModal(true)}
            className="flex items-center gap-1.5 rounded-sm bg-white px-3 py-1.5 text-[12px] font-semibold text-black hover:bg-[#e8e8e8] transition-colors">
            <Plus className="h-3 w-3" />
            Initiate Coverage
          </button>
        </div>
      </div>

      {/* ── Metrics strip ─────────────────────────────────────────────────── */}
      {complete.length > 0 && (
        <div className="grid grid-cols-4 divide-x divide-[#1a1a1a] border-b border-[#1a1a1a]">
          {[
            { label: "Companies Covered",   value: complete.length,       colour: "#9a9a9a" },
            { label: "High Quality",         value: highQuality.length,    colour: "#22c55e" },
            { label: "Governance Warnings",  value: warnings.length,       colour: "#ef4444" },
            { label: "Avg Investment Score", value: complete.length
                ? Math.round(complete.reduce((s, c) => s + (c.overall_score?.total ?? 0), 0) / complete.length)
                : 0,
              colour: "#9a9a9a", suffix: "/100" },
          ].map(({ label, value, colour, suffix }) => (
            <div key={label} className="px-6 py-3">
              <p className="text-label">{label}</p>
              <p className="mt-1 font-mono text-[20px] font-semibold leading-none" style={{ color: colour }}>
                {value}{suffix}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="px-6 py-5">
        {/* ── Processing ──────────────────────────────────────────────────── */}
        {processing.length > 0 && (
          <div className="mb-6">
            <p className="text-label mb-3">Analysing</p>
            <div className="space-y-2">
              {processing.map(s => <ProcessingRow key={s.id} stock={s} />)}
            </div>
          </div>
        )}

        {/* ── Stock grid ──────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-44 animate-pulse rounded-sm border border-[#1a1a1a] bg-[#0f0f0f]" />
            ))}
          </div>
        ) : filtered.length === 0 && !processing.length ? (
          <EmptyState onAdd={() => setModal(true)} hasStocks={complete.length > 0} />
        ) : (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map(s => <StockCard key={s.id} stock={s} />)}
          </div>
        )}

        {/* Pending/error stocks */}
        {stocks.filter(s => s.status === "pending" || s.status === "error").length > 0 && (
          <div className="mt-6">
            <p className="text-label mb-3">Awaiting Filings</p>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
              {stocks.filter(s => s.status === "pending" || s.status === "error").map(s => (
                <Link key={s.id} href={`/dashboard/stocks/${s.id}`}>
                  <div className={cn(
                    "rounded-sm border p-4 transition-colors hover:bg-[#111] cursor-pointer",
                    s.status === "error" ? "border-[#ef4444]/20 bg-[#ef4444]/5" : "border-[#1e1e1e] bg-[#0f0f0f]"
                  )}>
                    <div className="flex items-center gap-2">
                      {s.ticker && <span className="text-mono text-[11px] text-[#555]">{s.ticker}</span>}
                      <span className="text-[13px] font-medium text-[#c0c0c0]">{s.name}</span>
                    </div>
                    <p className={cn("mt-1.5 text-[11px]", s.status === "error" ? "text-[#ef4444]/70" : "text-[#444]")}>
                      {s.status === "error" ? s.progress_message || "Analysis failed" : "No filings uploaded — click to add"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <InitiateCoverageModal open={modal} onClose={() => setModal(false)} onSuccess={() => { setModal(false); fetchStocks(); }} />
    </div>
  );
}

// ── Stock card ─────────────────────────────────────────────────────────────────

function StockCard({ stock }: { stock: Stock }) {
  const score       = stock.overall_score?.total;
  const attract     = stock.investment_snapshot?.attractivenessScore;
  const sector      = stock.sector || stock.investment_snapshot?.sector;
  const verdict     = score !== undefined ? verdictFromScore(score) : null;

  return (
    <Link href={`/dashboard/stocks/${stock.id}`}>
      <div className="group cursor-pointer rounded-sm border border-[#1e1e1e] bg-[#0f0f0f] transition-all hover:border-[#2a2a2a] hover:bg-[#111]">
        {/* Score accent */}
        {score !== undefined && (
          <div className="h-px w-full rounded-t-sm" style={{ background: scoreColour(score) }} />
        )}

        <div className="p-4">
          {/* ── Row 1: name + score ──── */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                {stock.ticker && (
                  <span className="text-mono text-[11px] font-semibold text-[#555]">{stock.ticker}</span>
                )}
                {sector && <span className="text-[11px] text-[#3a3a3a]">· {sector}</span>}
              </div>
              <h3 className="text-[13px] font-semibold text-[#e0e0e0] leading-tight">{stock.name}</h3>
              {verdict && (
                <span className={cn("mt-1.5 inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-sm", verdict.className)}>
                  {verdict.label}
                </span>
              )}
            </div>
            {score !== undefined && (
              <div className="shrink-0 text-right">
                <div className="text-mono text-[22px] font-bold leading-none" style={{ color: scoreColour(score) }}>
                  {score}
                </div>
                <div className="text-[10px] text-[#3a3a3a]">/100</div>
              </div>
            )}
          </div>

          {/* ── Row 2: attractiveness bar ── */}
          {attract !== undefined && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-label">Attractiveness</span>
                <span className="text-mono text-[11px] text-[#555]">{attract}/10</span>
              </div>
              <div className="h-0.5 w-full bg-[#1a1a1a] rounded-full">
                <div className="h-0.5 rounded-full transition-all"
                  style={{ width: `${attract * 10}%`, background: scoreColour(attract, 10) }} />
              </div>
            </div>
          )}

          {/* ── Row 3: thesis ── */}
          {stock.thesis && (
            <p className="mb-3 text-[11px] leading-relaxed text-[#666] line-clamp-2">{stock.thesis}</p>
          )}

          {/* ── Row 4: bull / bear ── */}
          {(stock.top_bull || stock.top_bear) && (
            <div className="mb-3 space-y-1">
              {stock.top_bull && (
                <div className="flex items-start gap-1.5 text-[11px]">
                  <TrendingUp className="mt-0.5 h-2.5 w-2.5 shrink-0 text-[#22c55e]" />
                  <span className="text-[#555] line-clamp-1">{stock.top_bull}</span>
                </div>
              )}
              {stock.top_bear && (
                <div className="flex items-start gap-1.5 text-[11px]">
                  <TrendingDown className="mt-0.5 h-2.5 w-2.5 shrink-0 text-[#ef4444]" />
                  <span className="text-[#555] line-clamp-1">{stock.top_bear}</span>
                </div>
              )}
            </div>
          )}

          {/* ── Footer ── */}
          <div className="flex items-center justify-between border-t border-[#141414] pt-2.5 mt-1">
            <div className="flex items-center gap-1 text-[10px] text-[#3a3a3a]">
              <BarChart3 className="h-2.5 w-2.5" />
              {stock.doc_count} filing{stock.doc_count !== 1 ? "s" : ""}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[#3a3a3a]">
              <Clock className="h-2.5 w-2.5" />
              {formatDateShort(stock.updated_at)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Processing row ─────────────────────────────────────────────────────────────

function ProcessingRow({ stock }: { stock: Stock }) {
  return (
    <div className="rounded-sm border border-[#f59e0b]/15 bg-[#f59e0b]/[0.03] px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-[#f59e0b] processing-pulse" />
          <span className="text-[13px] font-medium text-[#c0c0c0]">
            {stock.ticker ? `${stock.ticker} · ` : ""}{stock.name}
          </span>
        </div>
        <span className="text-mono text-[11px] text-[#555]">{stock.progress}%</span>
      </div>
      <div className="h-px w-full bg-[#1a1a1a]">
        <div className="h-px bg-[#f59e0b] transition-all duration-1000 processing-pulse"
          style={{ width: `${stock.progress || 5}%` }} />
      </div>
      <p className="mt-1.5 text-[11px] text-[#555] processing-pulse">{stock.progress_message || "Analysing..."}</p>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState({ onAdd, hasStocks }: { onAdd: () => void; hasStocks: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-sm border border-[#1e1e1e] bg-[#111]">
        <BarChart3 className="h-4 w-4 text-[#333]" />
      </div>
      <h3 className="text-[14px] font-semibold text-[#888]">
        {hasStocks ? "No stocks match your filters" : "No coverage initiated"}
      </h3>
      <p className="mt-1.5 max-w-xs text-[12px] text-[#444]">
        {hasStocks
          ? "Clear your search or sector filter to see all stocks."
          : "Paste an annual report URL to generate institutional-grade research."}
      </p>
      {!hasStocks && (
        <button onClick={onAdd}
          className="mt-5 flex items-center gap-1.5 rounded-sm bg-white px-4 py-2 text-[12px] font-semibold text-black hover:bg-[#e8e8e8] transition-colors">
          <Plus className="h-3 w-3" />
          Initiate Coverage
        </button>
      )}
    </div>
  );
}
