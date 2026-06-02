"use client";

import { useEffect, useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import AddStockModal from "@/components/stocks/AddStockModal";
import StockCard from "@/components/stocks/StockCard";

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
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string>("all");

  const fetchStocks = async () => {
    const res = await fetch("/api/stocks");
    if (res.ok) setStocks(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(() => {
      setStocks((prev) => {
        if (prev.some((s) => s.status === "processing")) fetchStocks();
        return prev;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const sectors = ["all", ...Array.from(new Set(stocks.map(s => s.sector || s.investment_snapshot?.sector).filter(Boolean) as string[]))];

  const filtered = stocks.filter((s) => {
    const matchSearch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.ticker?.toLowerCase().includes(search.toLowerCase());
    const matchSector = sectorFilter === "all" ||
      (s.sector || s.investment_snapshot?.sector) === sectorFilter;
    return matchSearch && matchSector;
  });

  const complete = filtered.filter(s => s.status === "complete");
  const processing = filtered.filter(s => s.status === "processing");
  const pending = filtered.filter(s => s.status === "pending");
  const errored = filtered.filter(s => s.status === "error");

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Stock Universe</h1>
          <p className="text-white/40 text-sm">
            {complete.length} stock{complete.length !== 1 ? "s" : ""} with research
            {processing.length > 0 && <span className="ml-2 text-amber-400">· {processing.length} analysing</span>}
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add stock
        </button>
      </div>

      {/* Search + filter */}
      {stocks.length > 0 && (
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stocks..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/25 transition-colors"
            />
          </div>
          {sectors.length > 2 && (
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-white/30" />
              <div className="flex gap-1.5">
                {sectors.map(s => (
                  <button
                    key={s}
                    onClick={() => setSectorFilter(s)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                      sectorFilter === s
                        ? "bg-white text-black font-semibold"
                        : "bg-white/5 text-white/50 hover:bg-white/10"
                    }`}
                  >
                    {s === "all" ? "All sectors" : s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl h-52 animate-pulse" />
          ))}
        </div>
      ) : stocks.length === 0 ? (
        <EmptyState onAdd={() => setAddOpen(true)} />
      ) : (
        <div className="space-y-8">
          {/* Processing */}
          {processing.length > 0 && (
            <div>
              <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Analysing</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {processing.map(s => <StockCard key={s.id} stock={s} onRefresh={fetchStocks} />)}
              </div>
            </div>
          )}

          {/* Complete */}
          {complete.length > 0 && (
            <div>
              {processing.length > 0 && <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Research ready</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {complete.map(s => <StockCard key={s.id} stock={s} onRefresh={fetchStocks} />)}
              </div>
            </div>
          )}

          {/* Pending / error */}
          {(pending.length > 0 || errored.length > 0) && (
            <div>
              <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Awaiting documents</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...pending, ...errored].map(s => <StockCard key={s.id} stock={s} onRefresh={fetchStocks} />)}
              </div>
            </div>
          )}
        </div>
      )}

      <AddStockModal open={addOpen} onClose={() => setAddOpen(false)} onSuccess={() => { setAddOpen(false); fetchStocks(); }} />
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="border border-dashed border-white/10 rounded-2xl p-20 text-center">
      <div className="text-4xl mb-4">📊</div>
      <h3 className="font-semibold text-white text-lg mb-2">Your research library is empty</h3>
      <p className="text-white/40 text-sm mb-8 max-w-sm mx-auto">
        Add a stock, upload its annual report, and ARI generates institutional-grade research you can share with your team.
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add your first stock
      </button>
    </div>
  );
}
