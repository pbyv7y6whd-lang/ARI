"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Globe, Building2, ChevronRight, FileText } from "lucide-react";

type StatsData = {
  sovereigns: number;
  corporates: number;
  totalDocs: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsData>({ sovereigns: 0, corporates: 0, totalDocs: 0 });

  useEffect(() => {
    async function load() {
      const [sovRes, corpRes] = await Promise.all([
        fetch("/api/stocks?type=sovereign"),
        fetch("/api/stocks?type=corporate"),
      ]);
      const sovereigns = sovRes.ok ? await sovRes.json() : [];
      const corporates = corpRes.ok ? await corpRes.json() : [];
      const totalDocs = [...sovereigns, ...corporates].reduce((s: number, e: { doc_count?: number }) => s + (e.doc_count || 0), 0);
      setStats({ sovereigns: sovereigns.length, corporates: corporates.length, totalDocs });
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 border-b border-[#161616] bg-[#0a0a0a] h-12 flex items-center px-5">
        <h1 className="text-[12px] font-semibold text-white/60">EMI Dashboard</h1>
      </div>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 border-b border-[#161616] divide-x divide-[#161616]">
        {[
          { label: "Sovereigns",    value: String(stats.sovereigns), sub: "countries tracked" },
          { label: "Corporates",    value: String(stats.corporates), sub: "issuers tracked" },
          { label: "Documents",     value: String(stats.totalDocs),  sub: "docs uploaded" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="px-5 py-4">
            <p className="text-[10px] uppercase tracking-widest text-white/25 mb-1.5">{label}</p>
            <p className="font-mono text-[20px] font-bold leading-none text-white/70">{value}</p>
            <p className="text-[10px] text-white/20 mt-1 font-mono">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Tracker cards ────────────────────────────────────────────────── */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-px bg-[#161616] max-w-3xl">
        <Link href="/dashboard/sovereign">
          <div className="group bg-[#0a0a0a] hover:bg-[#0d0d0d] transition-colors p-6 flex flex-col gap-4 cursor-pointer h-full">
            <div className="w-8 h-8 bg-white/[0.05] border border-white/10 flex items-center justify-center">
              <Globe className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-[14px] font-semibold text-white/80 group-hover:text-white transition-colors mb-1.5">
                Sovereign Tracker
              </h2>
              <p className="text-[12px] text-white/30 leading-relaxed">
                Upload IMF Article IV reports, central bank publications, and Eurobond prospectuses for high-level sovereign credit analysis. Get fiscal profiles, external sector assessments, and Overweight/Neutral/Underweight recommendations.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-white/25 group-hover:text-white/50 transition-colors">
              <span>{stats.sovereigns} sovereigns tracked</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/corporate">
          <div className="group bg-[#0a0a0a] hover:bg-[#0d0d0d] transition-colors p-6 flex flex-col gap-4 cursor-pointer h-full">
            <div className="w-8 h-8 bg-white/[0.05] border border-white/10 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-[14px] font-semibold text-white/80 group-hover:text-white transition-colors mb-1.5">
                Corporate Tracker
              </h2>
              <p className="text-[12px] text-white/30 leading-relaxed">
                Drop in annual reports, bond prospectuses, and investor presentations for EM corporate credit analysis. Get leverage metrics, debt structure breakdowns, FX risk assessments, and Buy/Hold/Sell recommendations.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-white/25 group-hover:text-white/50 transition-colors">
              <span>{stats.corporates} corporates tracked</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </Link>
      </div>

      {/* ── Footer note ──────────────────────────────────────────────────── */}
      <div className="px-5 py-4 flex items-center gap-2 text-white/20">
        <FileText className="w-3.5 h-3.5" />
        <p className="text-[11px]">{stats.totalDocs} documents uploaded across all trackers</p>
      </div>
    </div>
  );
}
