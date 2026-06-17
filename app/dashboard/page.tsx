"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Globe, Building2, ChevronRight, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GlobeCountry } from "@/components/SovereignGlobe";

// Load globe client-side only (WebGL)
const SovereignGlobe = dynamic(() => import("@/components/SovereignGlobe"), { ssr: false });

type StatsData  = { sovereigns: number; corporates: number; totalDocs: number };
type Sovereign  = {
  id: string; name: string; ticker: string | null; sector: string | null;
  status: string; doc_count: number; updated_at: string;
  overall_score: { total: number } | null;
  snapshot: { region?: string; creditView?: string; creditRationale?: string } | null;
  credit_verdict: { recommendation?: string; summary?: string } | null;
  fiscal_profile: { debtToGdp?: string; primaryBalanceGdp?: string; interestToRevenue?: string } | null;
  external_sector: { fxReservesUsd?: string } | null;
};

function recColour(rec?: string) {
  if (rec === "Overweight") return "text-emerald-400";
  if (rec === "Underweight") return "text-red-400";
  return "text-amber-400";
}
function viewColour(v?: string) {
  if (v === "Positive") return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
  if (v === "Negative") return "text-red-400 border-red-400/30 bg-red-400/10";
  return "text-amber-400 border-amber-400/30 bg-amber-400/10";
}
function scoreColour(s: number) {
  if (s >= 70) return "#22c55e"; if (s >= 50) return "#f59e0b"; return "#ef4444";
}

export default function DashboardPage() {
  const [stats,      setStats]      = useState<StatsData>({ sovereigns: 0, corporates: 0, totalDocs: 0 });
  const [sovereigns, setSovereigns] = useState<Sovereign[]>([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    async function load() {
      const [sovRes, corpRes] = await Promise.all([
        fetch("/api/stocks?type=sovereign"),
        fetch("/api/stocks?type=corporate"),
      ]);
      const sovs  = sovRes.ok  ? await sovRes.json()  : [];
      const corps = corpRes.ok ? await corpRes.json() : [];
      const totalDocs = [...sovs, ...corps].reduce((s: number, e: { doc_count?: number }) => s + (e.doc_count || 0), 0);
      setStats({ sovereigns: sovs.length, corporates: corps.length, totalDocs });
      setSovereigns(sovs);
      setLoading(false);
    }
    load();
  }, []);

  const complete = sovereigns.filter(s => s.status === "complete");

  const globeCountries: GlobeCountry[] = complete.map(s => ({
    id:             s.id,
    name:           s.name,
    creditView:     s.snapshot?.creditView as GlobeCountry["creditView"],
    recommendation: s.credit_verdict?.recommendation as GlobeCountry["recommendation"],
    score:          s.overall_score?.total,
    region:         s.snapshot?.region ?? s.sector ?? undefined,
  }));

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 border-b border-[#e0d8ee] bg-[#fafaf8] h-12 flex items-center px-5">
        <h1 className="text-[12px] font-semibold text-[#2d1654]">EM Intelligence</h1>
      </div>

      {/* ── Hero: globe + sovereign list ────────────────────────────────────── */}
      <div className="bg-[#0f0520] border-b border-[#2a1050]">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">

          {/* Globe */}
          <div className="w-full md:w-[340px] shrink-0 pb-14 md:pb-12">
            {!loading && (
              <SovereignGlobe countries={globeCountries} />
            )}
            {loading && (
              <div className="aspect-square max-w-[340px] mx-auto rounded-full bg-[#1a0a2e] border border-[#2a1050] animate-pulse" />
            )}
          </div>

          {/* Sovereign list */}
          <div className="flex-1 w-full">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7a5aaa] mb-4">
              Sovereign Coverage
            </p>

            {loading && (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-16 rounded-sm bg-[#1a0a2e] animate-pulse" />
                ))}
              </div>
            )}

            {!loading && complete.length === 0 && (
              <div className="text-[13px] text-[#5a3a8a] py-6">
                No sovereign analyses yet. Add a sovereign to see it on the map.
              </div>
            )}

            {!loading && complete.length > 0 && (
              <div className="space-y-2">
                {complete.map(s => {
                  const score = s.overall_score?.total;
                  const view  = s.snapshot?.creditView;
                  const rec   = s.credit_verdict?.recommendation;
                  return (
                    <Link key={s.id} href={`/dashboard/stocks/${s.id}`}>
                      <div className="group flex items-center gap-4 rounded-sm border border-[#2a1050] bg-[#160830] hover:bg-[#1f0d40] hover:border-[#3d1a6e] transition-colors px-4 py-3 cursor-pointer">
                        {/* Score arc mini */}
                        {score !== undefined && (
                          <div className="shrink-0 w-10 h-10 relative">
                            <svg viewBox="0 0 40 28" width="40" height="28">
                              <path d="M 3 20 A 17 17 0 0 1 37 20"
                                fill="none" stroke="#2a1050" strokeWidth="4" strokeLinecap="round" />
                              <path d="M 3 20 A 17 17 0 0 1 37 20"
                                fill="none" stroke={scoreColour(score)} strokeWidth="4" strokeLinecap="round"
                                strokeDasharray={Math.PI * 17}
                                strokeDashoffset={Math.PI * 17 * (1 - score / 100)} />
                              <text x="20" y="22" textAnchor="middle"
                                fill={scoreColour(score)} fontFamily="ui-monospace,monospace"
                                fontWeight="800" fontSize="10">{score}</text>
                            </svg>
                          </div>
                        )}

                        {/* Country info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[13px] font-semibold text-white/90 group-hover:text-white transition-colors truncate">
                              {s.name}
                            </span>
                            {s.ticker && (
                              <span className="text-[10px] font-mono text-[#7a5aaa] shrink-0">{s.ticker}</span>
                            )}
                            {view && (
                              <span className={cn("text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider border rounded-sm shrink-0", viewColour(view))}>
                                {view}
                              </span>
                            )}
                          </div>
                          {s.snapshot?.creditRationale && (
                            <p className="text-[11px] text-[#7a5aaa] line-clamp-1 leading-snug">
                              {s.snapshot.creditRationale}
                            </p>
                          )}
                        </div>

                        {/* Key metrics */}
                        <div className="shrink-0 text-right space-y-0.5">
                          {rec && (
                            <p className={cn("text-[11px] font-bold uppercase tracking-wider", recColour(rec))}>{rec}</p>
                          )}
                          {s.fiscal_profile?.debtToGdp && (
                            <p className="text-[10px] font-mono text-[#5a3a8a]">
                              D/GDP {s.fiscal_profile.debtToGdp.split(" ")[0]}
                            </p>
                          )}
                        </div>

                        <ChevronRight className="h-3.5 w-3.5 text-[#3d1a6e] shrink-0 group-hover:text-[#7a5aaa] transition-colors" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Stats row */}
            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-[#2a1050] pt-5">
              {[
                { label: "Sovereigns",  value: stats.sovereigns },
                { label: "Corporates",  value: stats.corporates },
                { label: "Documents",   value: stats.totalDocs  },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] uppercase tracking-widest text-[#5a3a8a] mb-1">{label}</p>
                  <p className="font-mono text-[22px] font-bold text-white/80 leading-none">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tracker cards ───────────────────────────────────────────────────── */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-px bg-[#e0d8ee] max-w-3xl">
        <Link href="/dashboard/sovereign">
          <div className="group bg-[#fafaf8] hover:bg-[#f0edf6] transition-colors p-6 flex flex-col gap-4 cursor-pointer h-full">
            <div className="w-8 h-8 bg-[#5b21b6]/[0.07] border border-[#5b21b6]/20 flex items-center justify-center">
              <Globe className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-[14px] font-semibold text-[#1a0a2e]/80 group-hover:text-[#1a0a2e] transition-colors mb-1.5">
                Sovereign Tracker
              </h2>
              <p className="text-[12px] text-[#8b6bb5] leading-relaxed">
                IMF reviews, CBE publications, MoF frameworks — sovereign credit analysis with fiscal profiles, external sector assessments, and Eurobond trade ideas.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#9a7cc0] group-hover:text-[#4a2980] transition-colors">
              <span>{stats.sovereigns} sovereign{stats.sovereigns !== 1 ? "s" : ""} tracked</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/corporate">
          <div className="group bg-[#fafaf8] hover:bg-[#f0edf6] transition-colors p-6 flex flex-col gap-4 cursor-pointer h-full">
            <div className="w-8 h-8 bg-[#5b21b6]/[0.07] border border-[#5b21b6]/20 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-[14px] font-semibold text-[#1a0a2e]/80 group-hover:text-[#1a0a2e] transition-colors mb-1.5">
                Corporate Tracker
              </h2>
              <p className="text-[12px] text-[#8b6bb5] leading-relaxed">
                Annual reports, bond prospectuses, investor presentations — EM corporate credit with leverage metrics, debt schedules, FX stress tests, and Buy/Hold/Sell calls.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#9a7cc0] group-hover:text-[#4a2980] transition-colors">
              <span>{stats.corporates} corporate{stats.corporates !== 1 ? "s" : ""} tracked</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </Link>
      </div>

      {/* ── Portfolio snapshot (if sovereigns exist) ─────────────────────────── */}
      {complete.length > 0 && (
        <div className="px-5 py-4 max-w-3xl">
          <p className="text-[10px] uppercase tracking-widest text-[#9a7cc0] mb-3">Portfolio Snapshot</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Overweight",   value: complete.filter(s => s.credit_verdict?.recommendation === "Overweight").length,   colour: "text-emerald-500", icon: <TrendingUp className="h-3 w-3" /> },
              { label: "Neutral",      value: complete.filter(s => s.credit_verdict?.recommendation === "Neutral").length,      colour: "text-amber-500",   icon: null },
              { label: "Underweight",  value: complete.filter(s => s.credit_verdict?.recommendation === "Underweight").length,  colour: "text-red-400",     icon: <TrendingDown className="h-3 w-3" /> },
            ].map(({ label, value, colour, icon }) => (
              <div key={label} className="border border-[#e0d8ee] rounded-sm px-3 py-2.5">
                <div className={cn("flex items-center gap-1 mb-1", colour)}>
                  {icon}
                  <p className="text-[9px] font-bold uppercase tracking-widest">{label}</p>
                </div>
                <p className={cn("font-mono text-[22px] font-bold leading-none", colour)}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <div className="px-5 py-4 flex items-center gap-2 text-[#b09dcc]">
        <FileText className="w-3.5 h-3.5" />
        <p className="text-[11px]">{stats.totalDocs} documents uploaded across all trackers</p>
      </div>
    </div>
  );
}
