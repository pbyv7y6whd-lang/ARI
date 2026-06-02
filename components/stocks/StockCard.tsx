"use client";

import Link from "next/link";
import { FileText, Loader2, AlertCircle, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Stock = {
  id: string;
  name: string;
  ticker: string | null;
  sector: string | null;
  status: string;
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

export default function StockCard({ stock, onRefresh }: { stock: Stock; onRefresh: () => void }) {
  const score = stock.overall_score?.total;
  const attractiveness = stock.investment_snapshot?.attractivenessScore;
  const sector = stock.sector || stock.investment_snapshot?.sector;

  if (stock.status === "processing") {
    return (
      <div className="bg-white/[0.02] border border-amber-500/20 rounded-2xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {stock.ticker && <span className="text-xs font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded">{stock.ticker}</span>}
            </div>
            <h3 className="font-bold text-white">{stock.name}</h3>
            {sector && <p className="text-xs text-white/35 mt-0.5">{sector}</p>}
          </div>
          <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
        </div>
        <div className="w-full bg-white/5 rounded-full h-1 mb-2">
          <div className="bg-amber-400 h-1 rounded-full transition-all duration-1000" style={{ width: `${stock.progress}%` }} />
        </div>
        <p className="text-xs text-white/30 animate-pulse">{stock.progress_message || "Analysing..."}</p>
      </div>
    );
  }

  if (stock.status === "pending" || stock.status === "error") {
    return (
      <Link href={`/dashboard/stocks/${stock.id}`}>
        <div className={cn(
          "border rounded-2xl p-5 cursor-pointer hover:bg-white/[0.03] transition-all group",
          stock.status === "error"
            ? "bg-red-950/10 border-red-500/15"
            : "bg-white/[0.02] border-white/8 border-dashed"
        )}>
          <div className="flex items-start justify-between">
            <div>
              {stock.ticker && <span className="text-xs font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded mb-1 inline-block">{stock.ticker}</span>}
              <h3 className="font-bold text-white">{stock.name}</h3>
              {sector && <p className="text-xs text-white/35 mt-0.5">{sector}</p>}
            </div>
            {stock.status === "error"
              ? <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              : <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
            }
          </div>
          <p className={cn("text-xs mt-3", stock.status === "error" ? "text-red-400/70" : "text-white/25")}>
            {stock.status === "error"
              ? stock.progress_message || "Analysis failed"
              : stock.doc_count === 0
              ? "No documents yet — click to upload"
              : `${stock.doc_count} document${stock.doc_count !== 1 ? "s" : ""} uploaded — click to analyse`
            }
          </p>
        </div>
      </Link>
    );
  }

  // Complete
  return (
    <Link href={`/dashboard/stocks/${stock.id}`}>
      <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5 cursor-pointer hover:bg-white/[0.04] hover:border-white/15 transition-all group relative overflow-hidden">
        {/* Score accent bar */}
        {score !== undefined && (
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-0.5",
              score >= 70 ? "bg-emerald-400" : score >= 50 ? "bg-amber-400" : "bg-red-400"
            )}
          />
        )}

        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              {stock.ticker && (
                <span className="text-xs font-mono text-white/50 bg-white/8 px-2 py-0.5 rounded font-bold">
                  {stock.ticker}
                </span>
              )}
              {sector && <span className="text-xs text-white/30 truncate">{sector}</span>}
            </div>
            <h3 className="font-bold text-white text-base leading-tight">{stock.name}</h3>
          </div>

          {/* Score */}
          {score !== undefined && (
            <div className="shrink-0 ml-3 text-right">
              <div className={cn(
                "text-2xl font-bold",
                score >= 70 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400"
              )}>
                {score}
              </div>
              <div className="text-[10px] text-white/20">/100</div>
            </div>
          )}
        </div>

        {/* Attractiveness */}
        {attractiveness !== undefined && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-0.5">
              {[1,2,3,4,5,6,7,8,9,10].map(i => (
                <div
                  key={i}
                  className={cn(
                    "h-1 w-3 rounded-full transition-colors",
                    i <= attractiveness
                      ? attractiveness >= 7 ? "bg-emerald-400" : attractiveness >= 5 ? "bg-amber-400" : "bg-red-400"
                      : "bg-white/10"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-white/30">{attractiveness}/10 attractiveness</span>
          </div>
        )}

        {/* Thesis */}
        {stock.thesis && (
          <p className="text-xs text-white/50 leading-relaxed line-clamp-2 mb-3">
            {stock.thesis}
          </p>
        )}

        {/* Bull / bear pills */}
        {(stock.top_bull || stock.top_bear) && (
          <div className="space-y-1.5 mb-3">
            {stock.top_bull && (
              <div className="flex items-start gap-1.5 text-xs">
                <span className="text-emerald-400 mt-px shrink-0">▲</span>
                <span className="text-white/40 line-clamp-1">{stock.top_bull}</span>
              </div>
            )}
            {stock.top_bear && (
              <div className="flex items-start gap-1.5 text-xs">
                <span className="text-red-400 mt-px shrink-0">▼</span>
                <span className="text-white/40 line-clamp-1">{stock.top_bear}</span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-1 text-xs text-white/20">
            <FileText className="w-3 h-3" />
            {stock.doc_count} doc{stock.doc_count !== 1 ? "s" : ""}
          </div>
          <span className="text-xs text-white/20 group-hover:text-white/40 transition-colors flex items-center gap-1">
            View research <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
