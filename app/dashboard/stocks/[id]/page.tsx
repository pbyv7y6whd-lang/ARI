"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Loader2, AlertCircle, Plus, FileText,
  RefreshCw, Trash2, TrendingUp, TrendingDown,
  MoreHorizontal, Check, X as XIcon,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { ReportAnalysis } from "@/lib/supabase";
import ReportView from "@/components/report/ReportView";
import UploadDocModal from "@/components/stocks/UploadDocModal";

type Document = {
  id: string; file_name: string; display_name: string | null; doc_type: string;
  year: string | null; blob_url: string;
  page_count: number | null; created_at: string;
};

type StockData = {
  id: string; name: string; ticker: string | null; sector: string | null;
  entity_type: string;
  status: "pending" | "processing" | "complete" | "error";
  progress: number; progress_message: string | null;
  analysis: ReportAnalysis | null | Record<string, unknown>;
  doc_count: number;
  created_at: string; updated_at: string; documents: Document[];
};

// ── EM Credit type helpers ────────────────────────────────────────────────────

type TradeIdea = {
  type?: string; bond?: string; direction?: string; entryLevel?: string; target?: string;
  stop?: string; riskReward?: string; horizon?: string; rationale?: string; keyMonitor?: string;
};
type CatalystItem = { catalyst?: string; timing?: string; spreadImpact?: string };
type RiskItem     = { risk?: string; probability?: string; spreadImpact?: string };

type SovereignAnalysis = {
  snapshot?: { country?: string; region?: string; creditView?: string; creditRationale?: string };
  fiscalProfile?: { fiscalBalanceGdp?: string; primaryBalanceGdp?: string; debtToGdp?: string; revenueToGdp?: string; interestToRevenue?: string; trend?: string; keyMetric?: string; commentary?: string };
  financingSourcesAndUses?: { grossFinancingNeed?: string; fundingSources?: string; fundingGap?: string; domesticFundingCapacity?: string; commentary?: string };
  debtRepaymentSchedule?: { next12Months?: string; next24Months?: string; imfTranchePipeline?: string; refinancingStrategy?: string };
  externalSector?: { currentAccountGdp?: string; fxReservesUsd?: string; importCoverMonths?: string; externalDebtGdp?: string; externalFinancingNeed?: string; keyVulnerability?: string; keyRisk?: string; commentary?: string };
  debtSustainability?: { refinancingRisk?: string; currencyMix?: string; maturityWall?: string; maturityProfile?: string; debtTrajectory?: string; imfProgramme?: { active?: boolean; details?: string; continuationRisk?: string }; commentary?: string };
  politicalEconomy?: { reformMomentum?: string; keyReform?: string; socialRisk?: string; governanceQuality?: string; externalRelations?: string; commentary?: string };
  relativeValue?: { currentSpread?: string; peerComparison?: string; curveShape?: string; historicalContext?: string; rvConclusion?: string };
  catalystsAndRisks?: { positiveCatalysts?: CatalystItem[]; negativeRisks?: RiskItem[] };
  bullCase?: { points?: { title?: string; evidence?: string; trigger?: string }[] };
  bearCase?: { points?: { title?: string; evidence?: string; severity?: string }[] };
  tradeIdeas?: TradeIdea[];
  portfolioSizing?: { recommendation?: string; convictionLevel?: string; sizingRationale?: string; addLevels?: string; exitStrategy?: string };
  creditVerdict?: { recommendation?: string; targetSpread?: string; currentSpreadContext?: string; keyCatalysts?: string[]; keyRisks?: string[]; summary?: string };
  overallScore?: { total?: number; breakdown?: { fiscal?: string; external?: string; debtSustainability?: string; politicalEconomy?: string }; rationale?: string };
};

type CorporateAnalysis = {
  snapshot?: { issuer?: string; country?: string; sector?: string; isQuasiSovereign?: boolean; sovereignOwnership?: string; creditView?: string; creditRationale?: string };
  threeStatementSummary?: { revenue?: string; ebitda?: string; interestExpense?: string; netIncome?: string; capex?: string; freeCashFlow?: string; workingCapital?: string; cashAndEquivalents?: string };
  creditMetrics?: { netDebtToEbitda?: string; interestCoverage?: string; ebitdaToInterest?: string; fcfDebtServiceCoverage?: string; fcfYield?: string; debtToEquity?: string; fcfConversion?: string; liquidityRatio?: string; liquidityRunway?: string; trend?: string; keyWeakness?: string };
  financingSourcesAndUses?: { annualDebtService?: string; fundingSources?: string; fundingGap?: string; accessToMarkets?: string; parentOrSovereignSupport?: string };
  debtRepaymentSchedule?: { next12Months?: string; next24Months?: string; beyondTwoYears?: string; refinancingStrategy?: string; refinancingRisk?: string };
  quasiSovereignAssessment?: { applicable?: boolean; ownershipStructure?: string; strategicImportance?: string; supportTrackRecord?: string; spreadToSovereign?: string; supportAssumption?: string };
  fxRisk?: { revenuesCurrency?: string; debtCurrency?: string; mismatch?: string; stressTest?: string; hedging?: string; commentary?: string };
  businessQuality?: { marketPosition?: string; competitivePosition?: string; revenueVisibility?: string; marginTrend?: string; sovereignCeiling?: string; countryRisk?: string; keyRisk?: string; commentary?: string };
  relativeValue?: { currentSpread?: string; peerComparison?: string; seniorSubStack?: string; historicalContext?: string; rvConclusion?: string };
  catalystsAndRisks?: { positiveCatalysts?: CatalystItem[]; negativeRisks?: RiskItem[] };
  bullCase?: { points?: { title?: string; evidence?: string }[] };
  bearCase?: { points?: { title?: string; evidence?: string; severity?: string }[] };
  tradeIdeas?: TradeIdea[];
  portfolioSizing?: { recommendation?: string; convictionLevel?: string; sizingRationale?: string; addLevels?: string; exitStrategy?: string };
  creditVerdict?: { recommendation?: string; spreadView?: string; currentSpreadContext?: string; keyRisks?: string[]; summary?: string };
  overallScore?: { total?: number; breakdown?: { leverage?: string; liquidity?: string; businessQuality?: string; fxAndCountryRisk?: string }; rationale?: string };
};

// ── Score colour ──────────────────────────────────────────────────────────────

function scoreColour(score: number) {
  if (score >= 70) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

// ── Score Gauge (semi-circle arc) ─────────────────────────────────────────────

function ScoreGauge({ score }: { score: number }) {
  const cx = 50, cy = 44, r = 34;
  const arcLen = Math.PI * r;
  const filled = (score / 100) * arcLen;
  const color = scoreColour(score);
  const path = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  return (
    <svg viewBox="0 0 100 68" width="90" height="60" aria-label={`${score}/100`}>
      <path d={path} fill="none" stroke="#e8e2f0" strokeWidth="7" strokeLinecap="round" />
      <path d={path} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
        strokeDasharray={arcLen} strokeDashoffset={arcLen - filled} />
      <text x={cx} y={cy + 10} textAnchor="middle" fill={color}
        fontFamily="ui-monospace,monospace" fontWeight="800" fontSize="22">{score}</text>
      <text x={cx} y={cy + 24} textAnchor="middle" fill="#b09dcc"
        fontFamily="ui-monospace,monospace" fontSize="9">/100</text>
    </svg>
  );
}

// ── Pillar Radar (spider chart) ───────────────────────────────────────────────

const PILLAR_LABELS: Record<string, string[]> = {
  fiscal:             ["Fiscal"],
  external:           ["External"],
  debtSustainability: ["Debt", "Sust."],
  politicalEconomy:   ["Political", "Economy"],
  leverage:           ["Leverage"],
  liquidity:          ["Liquidity"],
  businessQuality:    ["Business", "Quality"],
  fxAndCountryRisk:   ["FX &", "Country"],
};

function PillarRadar({ breakdown }: { breakdown: Record<string, string | undefined> }) {
  const cx = 100, cy = 100, r = 58;
  const entries = Object.entries(breakdown);
  const n = entries.length;

  function parsePillarVal(s?: string): number {
    if (!s) return 0;
    const m = s.match(/^(\d+)/);
    return m ? Math.min(parseInt(m[1]), 25) : 0;
  }

  const axes = entries.map(([key, val], i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    const score = parsePillarVal(val);
    const pct = score / 25;
    const lx = cx + (r + 26) * Math.cos(angle);
    const ly = cy + (r + 26) * Math.sin(angle);
    const anchor = lx > cx + 6 ? "start" : lx < cx - 6 ? "end" : "middle";
    const lines = PILLAR_LABELS[key] ?? [key.charAt(0).toUpperCase() + key.slice(1)];
    return { key, score, pct, angle, lines, anchor,
      px: cx + r * pct * Math.cos(angle),
      py: cy + r * pct * Math.sin(angle),
      ax: cx + r * Math.cos(angle),
      ay: cy + r * Math.sin(angle),
      lx, ly };
  });

  const filledPoly = axes.map(a => `${a.px},${a.py}`).join(" ");

  return (
    <svg viewBox="0 0 200 200" className="w-36 h-36 shrink-0">
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map((pct, gi) => (
        <polygon key={gi}
          points={entries.map((_, i) => {
            const ang = (i / n) * 2 * Math.PI - Math.PI / 2;
            return `${cx + r * pct * Math.cos(ang)},${cy + r * pct * Math.sin(ang)}`;
          }).join(" ")}
          fill="none" stroke={gi === 3 ? "#d8cfe8" : "#ede8f5"} strokeWidth={gi === 3 ? "0.75" : "0.5"} />
      ))}
      {/* Spokes */}
      {axes.map((a, i) => (
        <line key={i} x1={cx} y1={cy} x2={a.ax} y2={a.ay} stroke="#e0d8ee" strokeWidth="0.5" />
      ))}
      {/* Data polygon */}
      <polygon points={filledPoly} fill="#5b21b6" fillOpacity="0.13"
        stroke="#5b21b6" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Dots */}
      {axes.map((a, i) => (
        <circle key={i} cx={a.px} cy={a.py} r="2.5" fill="#5b21b6" />
      ))}
      {/* Axis labels */}
      {axes.map((a, i) => (
        <text key={i} textAnchor={a.anchor as "start" | "middle" | "end"}
          fill="#9a7cc0" fontSize="7.5" fontFamily="system-ui,sans-serif">
          {a.lines.map((line, li) => (
            <tspan key={li} x={a.lx}
              y={a.ly - ((a.lines.length - 1) * 5) + li * 10}
              dominantBaseline="middle">{line}</tspan>
          ))}
        </text>
      ))}
    </svg>
  );
}

function creditViewClass(view?: string) {
  if (view === "Positive") return "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20";
  if (view === "Negative") return "text-red-400 bg-red-400/10 border border-red-400/20";
  return "text-amber-500 bg-amber-500/10 border border-amber-500/20";
}

function recClass(rec?: string) {
  if (rec === "Overweight" || rec === "Buy")  return "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20";
  if (rec === "Underweight" || rec === "Sell") return "text-red-400 bg-red-400/10 border border-red-400/20";
  return "text-amber-500 bg-amber-500/10 border border-amber-500/20";
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[#d8cfe8] rounded-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[#d8cfe8] bg-[#ede8f5]">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8b6bb5]">{title}</p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function MetricGrid({ items }: { items: { label: string; value?: string | null }[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {items.filter(i => i.value).map(({ label, value }) => (
        <div key={label}>
          <p className="text-[9px] uppercase tracking-widest text-[#9a7cc0] mb-0.5">{label}</p>
          <p className="text-[13px] font-mono font-semibold text-[#1a0a2e]/80">{value}</p>
        </div>
      ))}
    </div>
  );
}

function Commentary({ text }: { text?: string }) {
  if (!text) return null;
  return <p className="mt-3 text-[12px] text-[#6b4fa0] leading-relaxed">{text}</p>;
}

// ── Trade Ideas card ─────────────────────────────────────────────────────────

function TradeIdeasSection({ ideas }: { ideas: TradeIdea[] }) {
  if (!ideas || ideas.length === 0) return null;
  return (
    <Section title="Trade Ideas — Fixed Income Credit">
      <div className="space-y-4">
        {ideas.map((t, i) => (
          <div key={i} className="rounded-sm border border-[#d8cfe8] overflow-hidden">
            {/* Bond header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#f4f0f8] border-b border-[#d8cfe8]">
              <div className="flex items-center gap-2.5">
                {t.direction && (
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider rounded-sm",
                    t.direction === "Long"  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                    t.direction === "Short" ? "bg-red-400/10 text-red-500 border border-red-400/20" :
                    "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                  )}>{t.direction}</span>
                )}
                <span className="text-[12px] font-mono font-semibold text-[#1a0a2e]">{t.bond || "—"}</span>
              </div>
              <div className="flex items-center gap-3">
                {t.horizon && <span className="text-[10px] text-[#9a7cc0] font-mono">{t.horizon}</span>}
                {t.riskReward && <span className="text-[10px] font-mono font-semibold text-[#5b21b6]">R:R {t.riskReward}</span>}
              </div>
            </div>

            {/* Entry / Target / Stop row */}
            <div className="grid grid-cols-3 divide-x divide-[#e0d8ee] border-b border-[#d8cfe8]">
              {[
                { label: "Entry", value: t.entryLevel, colour: "text-[#1a0a2e]" },
                { label: "Target", value: t.target, colour: "text-emerald-600" },
                { label: "Stop", value: t.stop, colour: "text-red-500" },
              ].map(({ label, value, colour }) => (
                <div key={label} className="px-3 py-2.5">
                  <p className="text-[9px] uppercase tracking-widest text-[#9a7cc0] mb-1">{label}</p>
                  <p className={cn("text-[11px] font-mono font-semibold leading-snug", colour)}>{value || "—"}</p>
                </div>
              ))}
            </div>

            {/* Rationale + monitor */}
            <div className="px-4 py-3 space-y-2">
              {t.rationale && <p className="text-[12px] text-[#2d1654] leading-relaxed">{t.rationale}</p>}
              {t.keyMonitor && (
                <p className="text-[11px] text-[#8b6bb5]">
                  <span className="font-semibold text-[#6b4fa0]">Monitor: </span>{t.keyMonitor}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ── Catalysts & Risks section ────────────────────────────────────────────────

function CatalystsRisksSection({ data }: { data?: { positiveCatalysts?: CatalystItem[]; negativeRisks?: RiskItem[] } }) {
  if (!data) return null;
  const cats  = data.positiveCatalysts || [];
  const risks = data.negativeRisks || [];
  if (!cats.length && !risks.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {cats.length > 0 && (
        <Section title="Positive Catalysts">
          <div className="space-y-3">
            {cats.map((c, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <TrendingUp className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500/60" />
                <div>
                  <p className="text-[12px] font-medium text-[#1a0a2e]/80">{c.catalyst}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {c.timing && <span className="text-[10px] font-mono text-[#8b6bb5]">{c.timing}</span>}
                    {c.spreadImpact && <span className="text-[10px] font-mono text-emerald-600/70">{c.spreadImpact}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
      {risks.length > 0 && (
        <Section title="Downside Risks">
          <div className="space-y-3">
            {risks.map((r, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <TrendingDown className="mt-0.5 h-3 w-3 shrink-0 text-red-400/60" />
                <div>
                  <p className="text-[12px] font-medium text-[#1a0a2e]/80">{r.risk}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {r.probability && (
                      <span className={cn("text-[9px] font-bold uppercase tracking-wider",
                        r.probability === "High" ? "text-red-400" : r.probability === "Medium" ? "text-amber-500" : "text-[#b09dcc]")}>
                        {r.probability}
                      </span>
                    )}
                    {r.spreadImpact && <span className="text-[10px] font-mono text-red-400/70">{r.spreadImpact}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

// ── Portfolio Sizing card ─────────────────────────────────────────────────────

function PortfolioSizingSection({ ps }: { ps?: SovereignAnalysis["portfolioSizing"] | CorporateAnalysis["portfolioSizing"] }) {
  if (!ps) return null;
  return (
    <Section title="Portfolio Sizing">
      <div className="flex items-center gap-3 mb-3">
        {ps.recommendation && (
          <span className="text-[12px] font-mono font-semibold text-[#5b21b6] border border-[#c8b6e0] bg-[#f4f0f8] px-3 py-1.5 rounded-sm">
            {ps.recommendation}
          </span>
        )}
        {ps.convictionLevel && (
          <span className={cn("text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider rounded-sm",
            ps.convictionLevel === "High"   ? "text-emerald-600 bg-emerald-50 border border-emerald-200" :
            ps.convictionLevel === "Medium" ? "text-amber-600 bg-amber-50 border border-amber-200" :
            "text-[#9a7cc0] bg-[#f4f0f8] border border-[#d8cfe8]")}>
            {ps.convictionLevel} conviction
          </span>
        )}
      </div>
      <div className="space-y-2">
        {ps.sizingRationale && <p className="text-[12px] text-[#2d1654] leading-relaxed">{ps.sizingRationale}</p>}
        {ps.addLevels && (
          <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-sm px-3 py-2">
            <span className="font-semibold">Add: </span>{ps.addLevels}
          </p>
        )}
        {ps.exitStrategy && (
          <p className="text-[11px] text-[#8b6bb5] bg-[#f8f5fc] border border-[#e0d8ee] rounded-sm px-3 py-2">
            <span className="font-semibold">Exit: </span>{ps.exitStrategy}
          </p>
        )}
      </div>
    </Section>
  );
}

// ── Relative Value section ────────────────────────────────────────────────────

function RelativeValueSection({ rv }: { rv?: { currentSpread?: string; peerComparison?: string; curveShape?: string; seniorSubStack?: string; historicalContext?: string; rvConclusion?: string } }) {
  if (!rv) return null;
  const items = [
    { label: "Current Spread",    value: rv.currentSpread },
    { label: "Peer Comparison",   value: rv.peerComparison },
    { label: "Curve Shape",       value: rv.curveShape },
    { label: "Senior/Sub Stack",  value: rv.seniorSubStack },
    { label: "Historical Context",value: rv.historicalContext },
  ].filter(i => i.value);
  if (!items.length && !rv.rvConclusion) return null;
  return (
    <Section title="Relative Value">
      <div className="space-y-2.5">
        {items.map(({ label, value }) => (
          <div key={label}>
            <p className="text-[9px] uppercase tracking-widest text-[#9a7cc0] mb-0.5">{label}</p>
            <p className="text-[11px] font-mono text-[#2d1654] leading-relaxed">{value}</p>
          </div>
        ))}
      </div>
      {rv.rvConclusion && (
        <div className="mt-3 pt-3 border-t border-[#ddd6ec]">
          <p className="text-[10px] uppercase tracking-widest text-[#9a7cc0] mb-1.5">RV Conclusion</p>
          <p className="text-[12px] text-[#2d1654] font-medium leading-relaxed">{rv.rvConclusion}</p>
        </div>
      )}
    </Section>
  );
}

// ── Financing Sources & Uses ──────────────────────────────────────────────────

function FinancingSection({ data }: { data?: { grossFinancingNeed?: string; fundingSources?: string; fundingGap?: string; domesticFundingCapacity?: string; annualDebtService?: string; accessToMarkets?: string; parentOrSovereignSupport?: string; commentary?: string } }) {
  if (!data) return null;
  const items = [
    { label: "Gross Financing Need",     value: data.grossFinancingNeed },
    { label: "Annual Debt Service",      value: data.annualDebtService },
    { label: "Funding Sources",          value: data.fundingSources },
    { label: "Funding Gap",              value: data.fundingGap },
    { label: "Domestic Funding Capacity",value: data.domesticFundingCapacity },
    { label: "Market Access",            value: data.accessToMarkets },
    { label: "Parent/Sovereign Support", value: data.parentOrSovereignSupport },
  ].filter(i => i.value);
  if (!items.length) return null;
  return (
    <Section title="Financing Sources & Uses">
      <div className="space-y-2.5">
        {items.map(({ label, value }) => (
          <div key={label}>
            <p className="text-[9px] uppercase tracking-widest text-[#9a7cc0] mb-0.5">{label}</p>
            <p className="text-[11px] font-mono text-[#1a0a2e]/80 leading-relaxed">{value}</p>
          </div>
        ))}
      </div>
      {data.commentary && <Commentary text={data.commentary} />}
    </Section>
  );
}

// ── Debt Repayment Schedule ───────────────────────────────────────────────────

function DebtScheduleSection({ data }: { data?: { next12Months?: string; next24Months?: string; beyondTwoYears?: string; imfTranchePipeline?: string; refinancingStrategy?: string; refinancingRisk?: string } }) {
  if (!data) return null;
  const items = [
    { label: "Next 12 Months",    value: data.next12Months },
    { label: "12–24 Months",      value: data.next24Months },
    { label: "Beyond 2 Years",    value: data.beyondTwoYears },
    { label: "IMF Tranche Pipeline", value: data.imfTranchePipeline },
    { label: "Refinancing Risk",  value: data.refinancingRisk },
  ].filter(i => i.value);
  if (!items.length) return null;
  return (
    <Section title="Debt Repayment Schedule">
      <div className="space-y-2.5">
        {items.map(({ label, value }) => (
          <div key={label} className={cn("", label === "Next 12 Months" ? "" : "")}>
            <p className="text-[9px] uppercase tracking-widest text-[#9a7cc0] mb-0.5">{label}</p>
            <p className="text-[11px] font-mono text-[#1a0a2e]/80 leading-relaxed">{value}</p>
          </div>
        ))}
      </div>
      {data.refinancingStrategy && (
        <div className="mt-3 pt-3 border-t border-[#ddd6ec]">
          <p className="text-[9px] uppercase tracking-widest text-[#9a7cc0] mb-1">Refinancing Strategy</p>
          <p className="text-[11px] text-[#6b4fa0] leading-relaxed">{data.refinancingStrategy}</p>
        </div>
      )}
    </Section>
  );
}

// ── Three-Statement Summary ───────────────────────────────────────────────────

function ThreeStatementSection({ data }: { data?: CorporateAnalysis["threeStatementSummary"] }) {
  if (!data) return null;
  const items = [
    { label: "Revenue",          value: data.revenue },
    { label: "EBITDA",           value: data.ebitda },
    { label: "Interest Expense", value: data.interestExpense },
    { label: "Net Income",       value: data.netIncome },
    { label: "Capex",            value: data.capex },
    { label: "Free Cash Flow",   value: data.freeCashFlow },
    { label: "Working Capital",  value: data.workingCapital },
    { label: "Cash & Equivalents",value: data.cashAndEquivalents },
  ].filter(i => i.value);
  if (!items.length) return null;
  return (
    <Section title="Three-Statement Summary">
      <div className="grid grid-cols-2 gap-3">
        {items.map(({ label, value }) => (
          <div key={label}>
            <p className="text-[9px] uppercase tracking-widest text-[#9a7cc0] mb-0.5">{label}</p>
            <p className="text-[11px] font-mono text-[#1a0a2e]/80 leading-snug">{value}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ── Quasi-Sovereign Assessment ────────────────────────────────────────────────

function QuasiSovereignSection({ data }: { data?: CorporateAnalysis["quasiSovereignAssessment"] }) {
  if (!data?.applicable) return null;
  return (
    <Section title="Quasi-Sovereign Assessment">
      <div className="space-y-2.5">
        {[
          { label: "Ownership",           value: data.ownershipStructure },
          { label: "Strategic Importance",value: data.strategicImportance },
          { label: "Support Track Record",value: data.supportTrackRecord },
          { label: "Spread to Sovereign", value: data.spreadToSovereign },
        ].filter(i => i.value).map(({ label, value }) => (
          <div key={label}>
            <p className="text-[9px] uppercase tracking-widest text-[#9a7cc0] mb-0.5">{label}</p>
            <p className="text-[11px] font-mono text-[#1a0a2e]/80 leading-relaxed">{value}</p>
          </div>
        ))}
      </div>
      {data.supportAssumption && (
        <div className="mt-3 pt-3 border-t border-[#ddd6ec]">
          <p className="text-[9px] uppercase tracking-widest text-[#9a7cc0] mb-1">Support Assumption</p>
          <p className={cn("text-[11px] font-semibold leading-relaxed",
            data.supportAssumption.startsWith("Explicit") ? "text-emerald-600" :
            data.supportAssumption.startsWith("Implicit") ? "text-amber-600" : "text-red-500")}>
            {data.supportAssumption}
          </p>
        </div>
      )}
    </Section>
  );
}

// ── Score breakdown ───────────────────────────────────────────────────────────

function ScoreBreakdown({ breakdown, rationale }: {
  breakdown?: Record<string, string | undefined>;
  rationale?: string;
}) {
  if (!breakdown && !rationale) return null;
  return (
    <div className="mt-3 pt-3 border-t border-[#ddd6ec] space-y-3">
      {breakdown && (
        <div className="flex items-center gap-4">
          <PillarRadar breakdown={breakdown} />
          <div className="flex-1 space-y-2">
            {Object.entries(breakdown).map(([k, v]) => {
              const num = v ? parseInt(v.match(/^(\d+)/)?.[1] ?? "0") : 0;
              const pct = (num / 25) * 100;
              return (
                <div key={k}>
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-[9px] uppercase tracking-widest text-[#9a7cc0]">
                      {k.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <p className="text-[11px] font-mono font-bold text-[#5b21b6]">{v ?? "—"}</p>
                  </div>
                  <div className="h-1 rounded-full bg-[#ede8f5] overflow-hidden">
                    <div className="h-full rounded-full bg-[#5b21b6]/40 transition-all"
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {rationale && <p className="text-[11px] text-[#7a5aaa] leading-relaxed">{rationale}</p>}
    </div>
  );
}

// ── Sovereign View ────────────────────────────────────────────────────────────

function SovereignView({ a }: { a: SovereignAnalysis }) {
  const score = a.overallScore?.total;

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Header card */}
      <div className="border border-[#d8cfe8] rounded-sm p-4 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {a.snapshot?.creditView && (
              <span className={cn("text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider rounded-sm", creditViewClass(a.snapshot.creditView))}>
                {a.snapshot.creditView}
              </span>
            )}
            {a.snapshot?.region && <span className="text-[10px] text-[#8b6bb5]">{a.snapshot.region}</span>}
          </div>
          {a.snapshot?.creditRationale && (
            <p className="text-[13px] text-[#2d1654] leading-relaxed">{a.snapshot.creditRationale}</p>
          )}
        </div>
        {score !== undefined && <ScoreGauge score={score} />}
      </div>

      {/* Fiscal Profile */}
      {a.fiscalProfile && (
        <Section title="Fiscal Profile">
          <MetricGrid items={[
            { label: "Fiscal Balance/GDP",  value: a.fiscalProfile.fiscalBalanceGdp },
            { label: "Primary Balance/GDP", value: a.fiscalProfile.primaryBalanceGdp },
            { label: "Debt/GDP",            value: a.fiscalProfile.debtToGdp },
            { label: "Revenue/GDP",         value: a.fiscalProfile.revenueToGdp },
            { label: "Interest/Revenue",    value: a.fiscalProfile.interestToRevenue },
            { label: "Trend",               value: a.fiscalProfile.trend },
          ]} />
          {(a.fiscalProfile.keyMetric || a.fiscalProfile.commentary) && (
            <Commentary text={a.fiscalProfile.keyMetric || a.fiscalProfile.commentary} />
          )}
        </Section>
      )}

      {/* External Sector */}
      {a.externalSector && (
        <Section title="External Sector">
          <MetricGrid items={[
            { label: "Current Account/GDP",    value: a.externalSector.currentAccountGdp },
            { label: "FX Reserves",            value: a.externalSector.fxReservesUsd },
            { label: "Import Cover",           value: a.externalSector.importCoverMonths },
            { label: "External Debt/GDP",      value: a.externalSector.externalDebtGdp },
            { label: "External Financing Need", value: a.externalSector.externalFinancingNeed },
          ]} />
          {(a.externalSector.keyRisk || a.externalSector.commentary) && (
            <Commentary text={a.externalSector.keyRisk || a.externalSector.commentary} />
          )}
        </Section>
      )}

      {/* Debt Sustainability */}
      {a.debtSustainability && (
        <Section title="Debt Sustainability">
          <MetricGrid items={[
            { label: "Refinancing Risk",  value: a.debtSustainability.refinancingRisk },
            { label: "Currency Mix",      value: a.debtSustainability.currencyMix },
            { label: "Maturity Wall",     value: a.debtSustainability.maturityWall || a.debtSustainability.maturityProfile },
            { label: "Debt Trajectory",   value: a.debtSustainability.debtTrajectory },
            { label: "IMF Programme",     value: a.debtSustainability.imfProgramme?.active
                ? `Active — ${a.debtSustainability.imfProgramme.details || ""}` : "None" },
          ]} />
          {a.debtSustainability.imfProgramme?.continuationRisk && (
            <p className="mt-3 text-[11px] text-amber-600/80 leading-relaxed">
              <span className="font-semibold">Programme Risk: </span>{a.debtSustainability.imfProgramme.continuationRisk}
            </p>
          )}
          {a.debtSustainability.commentary && !a.debtSustainability.imfProgramme?.continuationRisk && (
            <Commentary text={a.debtSustainability.commentary} />
          )}
        </Section>
      )}

      {/* Political Economy */}
      {a.politicalEconomy && (
        <Section title="Political Economy">
          <MetricGrid items={[
            { label: "Reform Momentum",    value: a.politicalEconomy.reformMomentum },
            { label: "Governance",         value: a.politicalEconomy.governanceQuality },
            { label: "External Relations", value: a.politicalEconomy.externalRelations },
          ]} />
          {(a.politicalEconomy.keyReform || a.politicalEconomy.socialRisk) && (
            <div className="mt-3 space-y-1.5">
              {a.politicalEconomy.keyReform && (
                <p className="text-[11px] text-[#6b4fa0] leading-relaxed">
                  <span className="font-semibold">Key Reform: </span>{a.politicalEconomy.keyReform}
                </p>
              )}
              {a.politicalEconomy.socialRisk && (
                <p className="text-[11px] text-amber-600/80 leading-relaxed">
                  <span className="font-semibold">Social Risk: </span>{a.politicalEconomy.socialRisk}
                </p>
              )}
            </div>
          )}
          {a.politicalEconomy.commentary && !a.politicalEconomy.keyReform && (
            <Commentary text={a.politicalEconomy.commentary} />
          )}
        </Section>
      )}

      {/* Financing Sources & Uses + Debt Repayment Schedule */}
      <FinancingSection data={a.financingSourcesAndUses} />
      <DebtScheduleSection data={a.debtRepaymentSchedule} />

      {/* Catalysts & Risks */}
      {a.catalystsAndRisks ? <CatalystsRisksSection data={a.catalystsAndRisks} /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {a.bullCase?.points && a.bullCase.points.length > 0 && (
            <Section title="Bull Case">
              <div className="space-y-3">
                {a.bullCase.points.map((p, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <TrendingUp className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500/60" />
                    <div>
                      <p className="text-[12px] font-medium text-[#1a0a2e]/80">{p.title}</p>
                      {p.evidence && <p className="text-[11px] text-[#7a5aaa] mt-0.5">{p.evidence}</p>}
                      {p.trigger && <p className="text-[10px] text-emerald-500/50 mt-0.5">Trigger: {p.trigger}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
          {a.bearCase?.points && a.bearCase.points.length > 0 && (
            <Section title="Bear Case">
              <div className="space-y-3">
                {a.bearCase.points.map((p, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <TrendingDown className="mt-0.5 h-3 w-3 shrink-0 text-red-400/60" />
                    <div>
                      <p className="text-[12px] font-medium text-[#1a0a2e]/80">{p.title}</p>
                      {p.evidence && <p className="text-[11px] text-[#7a5aaa] mt-0.5">{p.evidence}</p>}
                      {p.severity && (
                        <span className={cn("text-[9px] font-bold uppercase tracking-wider",
                          p.severity === "High" ? "text-red-400" : p.severity === "Medium" ? "text-amber-500" : "text-[#b09dcc]")}>
                          {p.severity} severity
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}

      {/* Relative Value */}
      <RelativeValueSection rv={a.relativeValue} />

      {/* Trade Ideas */}
      {a.tradeIdeas && a.tradeIdeas.length > 0 && <TradeIdeasSection ideas={a.tradeIdeas} />}

      {/* Portfolio Sizing */}
      <PortfolioSizingSection ps={a.portfolioSizing} />

      {/* Credit Verdict */}
      {a.creditVerdict && (
        <Section title="Credit Verdict">
          <div className="flex items-center gap-3 mb-3">
            {a.creditVerdict.recommendation && (
              <span className={cn("text-[11px] font-bold px-2.5 py-1 uppercase tracking-wider rounded-sm", recClass(a.creditVerdict.recommendation))}>
                {a.creditVerdict.recommendation}
              </span>
            )}
            {a.creditVerdict.targetSpread && (
              <span className="text-[12px] font-mono text-[#6b4fa0]">{a.creditVerdict.targetSpread}</span>
            )}
          </div>
          {a.creditVerdict.currentSpreadContext && (
            <p className="text-[11px] font-mono text-[#8b6bb5] mb-3 border border-[#e0d8ee] rounded-sm px-3 py-2 bg-[#f8f5fc]">
              {a.creditVerdict.currentSpreadContext}
            </p>
          )}
          {a.creditVerdict.summary && (
            <p className="text-[13px] text-[#2d1654] leading-relaxed">{a.creditVerdict.summary}</p>
          )}
          {a.creditVerdict.keyCatalysts && a.creditVerdict.keyCatalysts.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] uppercase tracking-widest text-[#9a7cc0] mb-1.5">Key Catalysts</p>
              <ul className="space-y-1">
                {a.creditVerdict.keyCatalysts.map((c, i) => (
                  <li key={i} className="text-[11px] text-[#6b4fa0] flex items-start gap-1.5">
                    <span className="text-emerald-500/40 shrink-0">+</span>{c}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {a.creditVerdict.keyRisks && a.creditVerdict.keyRisks.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] uppercase tracking-widest text-[#9a7cc0] mb-1.5">Key Risks</p>
              <ul className="space-y-1">
                {a.creditVerdict.keyRisks.map((r, i) => (
                  <li key={i} className="text-[11px] text-[#6b4fa0] flex items-start gap-1.5">
                    <span className="text-red-400/40 shrink-0">−</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <ScoreBreakdown
            breakdown={a.overallScore?.breakdown as Record<string, string | undefined>}
            rationale={a.overallScore?.rationale}
          />
        </Section>
      )}
    </div>
  );
}

// ── Corporate View ────────────────────────────────────────────────────────────

function CorporateView({ a }: { a: CorporateAnalysis }) {
  const score = a.overallScore?.total;

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Header card */}
      <div className="border border-[#d8cfe8] rounded-sm p-4 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {a.snapshot?.creditView && (
              <span className={cn("text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider rounded-sm", creditViewClass(a.snapshot.creditView))}>
                {a.snapshot.creditView}
              </span>
            )}
            {a.snapshot?.isQuasiSovereign && (
              <span className="text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider rounded-sm text-blue-600 bg-blue-50 border border-blue-200">
                Quasi-Sovereign
              </span>
            )}
            {a.snapshot?.country && <span className="text-[10px] text-[#8b6bb5]">{a.snapshot.country}</span>}
            {a.snapshot?.sector && <span className="text-[10px] text-[#8b6bb5]">· {a.snapshot.sector}</span>}
          </div>
          {a.snapshot?.creditRationale && (
            <p className="text-[13px] text-[#2d1654] leading-relaxed">{a.snapshot.creditRationale}</p>
          )}
        </div>
        {score !== undefined && <ScoreGauge score={score} />}
      </div>

      {/* Three-Statement Summary */}
      <ThreeStatementSection data={a.threeStatementSummary} />

      {/* Credit Metrics */}
      {a.creditMetrics && (
        <Section title="Credit Metrics">
          <MetricGrid items={[
            { label: "Net Debt/EBITDA",      value: a.creditMetrics.netDebtToEbitda },
            { label: "EBITDA/Interest",      value: a.creditMetrics.ebitdaToInterest || a.creditMetrics.interestCoverage },
            { label: "FCF/Debt Service",     value: a.creditMetrics.fcfDebtServiceCoverage },
            { label: "FCF Yield",            value: a.creditMetrics.fcfYield || a.creditMetrics.fcfConversion },
            { label: "Liquidity Runway",     value: a.creditMetrics.liquidityRunway || a.creditMetrics.liquidityRatio },
            { label: "Trend",                value: a.creditMetrics.trend },
          ]} />
          {a.creditMetrics.keyWeakness && (
            <p className="mt-3 text-[11px] text-red-500/80 border border-red-100 bg-red-50 rounded-sm px-3 py-2 leading-relaxed">
              <span className="font-semibold">Key Weakness: </span>{a.creditMetrics.keyWeakness}
            </p>
          )}
        </Section>
      )}

      {/* Financing Sources & Uses + Debt Repayment */}
      <FinancingSection data={a.financingSourcesAndUses} />
      <DebtScheduleSection data={a.debtRepaymentSchedule} />

      {/* Quasi-Sovereign Assessment */}
      <QuasiSovereignSection data={a.quasiSovereignAssessment} />


      {/* FX Risk */}
      {a.fxRisk && (
        <Section title="FX Risk">
          <MetricGrid items={[
            { label: "Revenue Currency", value: a.fxRisk.revenuesCurrency },
            { label: "Debt Currency",    value: a.fxRisk.debtCurrency },
            { label: "Mismatch",         value: a.fxRisk.mismatch },
            { label: "Hedging",          value: a.fxRisk.hedging },
          ]} />
          {a.fxRisk.stressTest && (
            <p className="mt-3 text-[11px] font-mono text-amber-700 border border-amber-200 bg-amber-50 rounded-sm px-3 py-2">
              <span className="font-semibold">FX Stress: </span>{a.fxRisk.stressTest}
            </p>
          )}
          {a.fxRisk.commentary && !a.fxRisk.stressTest && <Commentary text={a.fxRisk.commentary} />}
        </Section>
      )}

      {/* Business Quality */}
      {a.businessQuality && (
        <Section title="Business Quality">
          <MetricGrid items={[
            { label: "Market Position",    value: a.businessQuality.marketPosition || a.businessQuality.competitivePosition },
            { label: "Revenue Visibility", value: a.businessQuality.revenueVisibility },
            { label: "Margin Trend",       value: a.businessQuality.marginTrend },
            { label: "Sovereign Ceiling",  value: a.businessQuality.sovereignCeiling },
            { label: "Country Risk",       value: a.businessQuality.countryRisk },
          ]} />
          {(a.businessQuality.keyRisk || a.businessQuality.commentary) && (
            <Commentary text={a.businessQuality.keyRisk || a.businessQuality.commentary} />
          )}
        </Section>
      )}

      {/* Catalysts & Risks */}
      {a.catalystsAndRisks ? <CatalystsRisksSection data={a.catalystsAndRisks} /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {a.bullCase?.points && a.bullCase.points.length > 0 && (
            <Section title="Bull Case">
              <div className="space-y-3">
                {a.bullCase.points.map((p, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <TrendingUp className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500/60" />
                    <div>
                      <p className="text-[12px] font-medium text-[#1a0a2e]/80">{p.title}</p>
                      {p.evidence && <p className="text-[11px] text-[#7a5aaa] mt-0.5">{p.evidence}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
          {a.bearCase?.points && a.bearCase.points.length > 0 && (
            <Section title="Bear Case">
              <div className="space-y-3">
                {a.bearCase.points.map((p, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <TrendingDown className="mt-0.5 h-3 w-3 shrink-0 text-red-400/60" />
                    <div>
                      <p className="text-[12px] font-medium text-[#1a0a2e]/80">{p.title}</p>
                      {p.evidence && <p className="text-[11px] text-[#7a5aaa] mt-0.5">{p.evidence}</p>}
                      {p.severity && (
                        <span className={cn("text-[9px] font-bold uppercase tracking-wider",
                          p.severity === "High" ? "text-red-400" : p.severity === "Medium" ? "text-amber-500" : "text-[#b09dcc]")}>
                          {p.severity} severity
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}

      {/* Relative Value */}
      <RelativeValueSection rv={a.relativeValue} />

      {/* Trade Ideas */}
      {a.tradeIdeas && a.tradeIdeas.length > 0 && <TradeIdeasSection ideas={a.tradeIdeas} />}

      {/* Portfolio Sizing */}
      <PortfolioSizingSection ps={a.portfolioSizing} />

      {/* Credit Verdict */}
      {a.creditVerdict && (
        <Section title="Credit Verdict">
          <div className="flex items-center gap-3 mb-3">
            {a.creditVerdict.recommendation && (
              <span className={cn("text-[11px] font-bold px-2.5 py-1 uppercase tracking-wider rounded-sm", recClass(a.creditVerdict.recommendation))}>
                {a.creditVerdict.recommendation}
              </span>
            )}
            {a.creditVerdict.spreadView && (
              <span className={cn("text-[11px] font-mono",
                a.creditVerdict.spreadView === "Tighten" ? "text-emerald-500/70" :
                a.creditVerdict.spreadView === "Widen" ? "text-red-400/70" : "text-amber-500/70")}>
                Spreads: {a.creditVerdict.spreadView}
              </span>
            )}
          </div>
          {a.creditVerdict.currentSpreadContext && (
            <p className="text-[11px] font-mono text-[#8b6bb5] mb-3 border border-[#e0d8ee] rounded-sm px-3 py-2 bg-[#f8f5fc]">
              {a.creditVerdict.currentSpreadContext}
            </p>
          )}
          {a.creditVerdict.summary && (
            <p className="text-[13px] text-[#2d1654] leading-relaxed">{a.creditVerdict.summary}</p>
          )}
          {a.creditVerdict.keyRisks && a.creditVerdict.keyRisks.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] uppercase tracking-widest text-[#9a7cc0] mb-1.5">Key Risks</p>
              <ul className="space-y-1">
                {a.creditVerdict.keyRisks.map((r, i) => (
                  <li key={i} className="text-[11px] text-[#6b4fa0] flex items-start gap-1.5">
                    <span className="text-red-400/40 shrink-0">−</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <ScoreBreakdown
            breakdown={a.overallScore?.breakdown as Record<string, string | undefined>}
            rationale={a.overallScore?.rationale}
          />
        </Section>
      )}
    </div>
  );
}

// ── Pipeline steps ────────────────────────────────────────────────────────────

const PIPELINE_STEPS = [
  { pct: 0,  label: "Fetching documents" },
  { pct: 18, label: "Parsing document structure" },
  { pct: 28, label: "Building analysis context" },
  { pct: 42, label: "Running credit analysis" },
  { pct: 58, label: "Assessing debt sustainability" },
  { pct: 70, label: "Building bull case and bear case" },
  { pct: 80, label: "Generating credit verdict" },
  { pct: 90, label: "Finalising assessment" },
  { pct: 97, label: "Complete" },
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
  prospectus: "Bond Prospectus", imf_article_iv: "IMF Article IV",
  central_bank_report: "Central Bank Report", mof_fiscal_framework: "MoF Fiscal Framework",
  eurobond_prospectus: "Eurobond Prospectus", rating_agency_report: "Rating Agency Report",
  other: "Filing",
};

// ── Main page ─────────────────────────────────────────────────────────────────

export default function StockPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [stock,          setStock]          = useState<StockData | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [uploadOpen,     setUploadOpen]     = useState(false);
  const [reanalysing,    setReanalysing]    = useState(false);
  const [activeTab,      setActiveTab]      = useState<"research" | "documents">("research");
  const [displayProgress, setDisplayProgress] = useState(0);

  const fetchStock = async () => {
    const res = await fetch(`/api/stocks/${id}`);
    if (!res.ok) { router.push("/dashboard"); return; }
    const data: StockData = await res.json();
    setStock(data);
    setDisplayProgress(prev => Math.max(prev, data.progress));
    setLoading(false);
  };

  useEffect(() => {
    if (!stock || stock.status !== "processing") return;
    const tick = setInterval(() => {
      setDisplayProgress(prev => {
        const real = stock.progress;
        const ceiling = Math.min(95, real + 60);
        if (prev >= ceiling) return prev;
        const step = Math.max(0.1, (ceiling - prev) * 0.012);
        return Math.min(ceiling, prev + step);
      });
    }, 500);
    return () => clearInterval(tick);
  }, [stock?.status, stock?.progress]);

  useEffect(() => {
    fetchStock();
    const iv = setInterval(() => {
      setStock(prev => { if (prev?.status === "processing") fetchStock(); return prev; });
    }, 4000);
    return () => clearInterval(iv);
  }, [id]);

  const handleReanalyse = async () => {
    setReanalysing(true);
    setStock(prev => prev ? { ...prev, status: "processing", progress: 0, progress_message: "Starting analysis..." } : prev);
    fetch(`/api/stocks/${id}/analyse`, { method: "POST" }).catch(console.error);
    setReanalysing(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${stock?.name}? This cannot be undone.`)) return;
    await fetch(`/api/stocks/${id}`, { method: "DELETE" });
    const entityType = stock?.entity_type || "corporate";
    router.push(entityType === "sovereign" ? "/dashboard/sovereign" : "/dashboard/corporate");
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#fafaf8]">
      <Loader2 className="h-5 w-5 animate-spin text-[#9a7cc0]" />
    </div>
  );
  if (!stock) return null;

  const entityType = stock.entity_type || "corporate";
  const backHref   = entityType === "sovereign" ? "/dashboard/sovereign" : "/dashboard/corporate";
  const score      = (stock.analysis as SovereignAnalysis | CorporateAnalysis)?.overallScore?.total;
  const sector     = stock.sector;

  // Detect EM credit analysis by checking for 'snapshot' key
  const isEmAnalysis = stock.analysis && typeof stock.analysis === "object" && "snapshot" in stock.analysis;

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b border-[#ddd6ec] bg-white/90 backdrop-blur-sm">
        <div className="flex items-center gap-4 px-6 py-3">
          <Link href={backHref} className="text-[#9a7cc0] transition-colors hover:text-[#7a5aaa]">
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {stock.ticker && (
                <span className="text-mono text-[12px] font-bold text-[#6b4fa0] bg-[#f0edf6] border border-[#d0c6e0] px-2 py-0.5 rounded-sm">
                  {stock.ticker}
                </span>
              )}
              <h1 className="text-[14px] font-semibold text-[#1a0a2e]">{stock.name}</h1>
              {sector && <span className="text-[12px] text-[#c4b5d8]">· {sector}</span>}
              <span className="text-[10px] text-[#b09dcc] uppercase tracking-wider font-mono">{entityType}</span>
            </div>
            <p className="text-[11px] text-[#9a7cc0] mt-0.5">
              {stock.documents.length} filing{stock.documents.length !== 1 ? "s" : ""} · Updated {formatDate(stock.updated_at)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {score !== undefined && (
              <div className="text-right px-3 py-1 rounded-sm border border-[#d8cfe8]">
                <div className="text-mono text-[18px] font-bold leading-none" style={{ color: scoreColour(score) }}>
                  {score}
                </div>
                <div className="text-[10px] text-[#9a7cc0]">/100</div>
              </div>
            )}
            <button onClick={() => setUploadOpen(true)}
              className="flex items-center gap-1.5 rounded-sm border border-[#d0c6e0] px-2.5 py-1.5 text-[11px] text-[#8b6bb5] transition-colors hover:border-[#5b21b6]/50 hover:text-[#4a2980]">
              <Plus className="h-3 w-3" /> Add Doc
            </button>
            {stock.documents.length > 0 && stock.status !== "processing" && (
              <button onClick={handleReanalyse} disabled={reanalysing}
                className="flex items-center gap-1.5 rounded-sm border border-[#d0c6e0] px-2.5 py-1.5 text-[11px] text-[#8b6bb5] transition-colors hover:border-[#5b21b6]/50 hover:text-[#4a2980] disabled:opacity-40">
                <RefreshCw className={cn("h-3 w-3", reanalysing && "animate-spin")} />
                Re-analyse
              </button>
            )}
            <button onClick={handleDelete} title="Delete"
              className="rounded-sm p-1.5 text-[#c4b5d8] transition-colors hover:text-[#ef4444]">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-t border-[#e0d8ee] px-6">
          {(["research", "documents"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn(
                "border-b-2 px-4 py-2.5 text-[12px] font-medium capitalize transition-colors",
                activeTab === tab
                  ? "border-[#5b21b6] text-[#5b21b6]"
                  : "border-transparent text-[#b09dcc] hover:text-[#7a5aaa]"
              )}>
              {tab === "research" ? "Credit Assessment" : `Documents (${stock.documents.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="px-6 py-6">
        {activeTab === "documents" ? (
          <DocumentsTab stock={stock} onUpload={() => setUploadOpen(true)} onRefresh={fetchStock} />
        ) : stock.status === "processing" ? (
          <ProcessingView stock={stock} displayProgress={displayProgress} />
        ) : stock.status === "pending" || stock.documents.length === 0 ? (
          <PendingView onUpload={() => setUploadOpen(true)} entityType={entityType} />
        ) : stock.status === "error" ? (
          <ErrorView message={stock.progress_message} onRetry={handleReanalyse} />
        ) : stock.analysis && isEmAnalysis && entityType === "sovereign" ? (
          <SovereignView a={stock.analysis as SovereignAnalysis} />
        ) : stock.analysis && isEmAnalysis && entityType === "corporate" ? (
          <CorporateView a={stock.analysis as CorporateAnalysis} />
        ) : stock.analysis ? (
          <ReportView analysis={stock.analysis as ReportAnalysis} />
        ) : null}
      </div>

      <UploadDocModal stockId={id} entityType={stock?.entity_type} open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => { setUploadOpen(false); fetchStock(); }} />
    </div>
  );
}

// ── Processing view ────────────────────────────────────────────────────────────

function ProcessingView({ stock, displayProgress }: { stock: StockData; displayProgress: number }) {
  const activeStep = getActiveStep(displayProgress);

  return (
    <div className="max-w-lg mx-auto py-16">
      <div className="rounded-sm border border-[#d8cfe8] bg-[#ede8f5] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#b09dcc]">Credit Analysis Pipeline</p>
            <h3 className="mt-1 text-[14px] font-semibold text-[#1a0a2e]">{stock.name}</h3>
          </div>
          <div className="text-right">
            <div className="text-mono text-[20px] font-bold text-[#f59e0b] leading-none">{Math.round(displayProgress)}%</div>
            <div className="text-[10px] text-[#b09dcc] mt-0.5">complete</div>
          </div>
        </div>

        <div className="h-px w-full bg-[#ddd6ec] mb-5">
          <div className="h-px bg-[#f59e0b] transition-all duration-1000" style={{ width: `${displayProgress || 3}%` }} />
        </div>

        <div className="space-y-2">
          {PIPELINE_STEPS.map((step, i) => {
            const done    = i < activeStep;
            const current = i === activeStep;
            return (
              <div key={i} className={cn(
                "flex items-center gap-2.5 text-[11px] transition-colors",
                done ? "text-[#b09dcc]" : current ? "text-[#2d1654]" : "text-[#c4b5d8]"
              )}>
                <div className={cn(
                  "h-1 w-1 shrink-0 rounded-full transition-colors",
                  done ? "bg-[#22c55e]" : current ? "bg-[#f59e0b]" : "bg-[#d8cfe8]"
                )} />
                <span>{step.label}</span>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-[11px] text-[#9a7cc0]">Typically takes 2–4 minutes. Page updates automatically.</p>
      </div>
    </div>
  );
}

// ── Pending view ───────────────────────────────────────────────────────────────

function PendingView({ onUpload, entityType }: { onUpload: () => void; entityType: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-sm border border-[#d8cfe8] bg-[#f0edf6]">
        <FileText className="h-4 w-4 text-[#9a7cc0]" />
      </div>
      <h3 className="text-[14px] font-semibold text-[#7a5aaa]">No documents uploaded</h3>
      <p className="mt-1.5 max-w-xs text-[12px] text-[#b09dcc]">
        {entityType === "sovereign"
          ? "Upload an IMF Article IV, central bank report, or Eurobond prospectus to generate the credit assessment."
          : "Upload an annual report, bond prospectus, or investor presentation to generate the credit assessment."}
      </p>
      <button onClick={onUpload}
        className="mt-5 flex items-center gap-1.5 rounded-sm bg-[#5b21b6] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#5b21b6]/90 transition-colors">
        <Plus className="h-3 w-3" /> Add Document
      </button>
    </div>
  );
}

// ── Error view ─────────────────────────────────────────────────────────────────

function ErrorView({ message, onRetry }: { message: string | null; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <AlertCircle className="mb-3 h-8 w-8 text-[#ef4444]/60" />
      <h3 className="text-[14px] font-semibold text-[#7a5aaa]">Analysis failed</h3>
      <p className="mt-1.5 max-w-sm text-[12px] text-[#9a7cc0]">{message || "An error occurred."}</p>
      <button onClick={onRetry}
        className="mt-5 flex items-center gap-1.5 rounded-sm border border-[#d0c6e0] px-4 py-2 text-[12px] text-[#7a5aaa] hover:border-[#5b21b6]/50 hover:text-[#4a2980] transition-colors">
        <RefreshCw className="h-3 w-3" /> Retry Analysis
      </button>
    </div>
  );
}

// ── Documents tab ──────────────────────────────────────────────────────────────

function DocumentsTab({ stock, onUpload, onRefresh }: { stock: StockData; onUpload: () => void; onRefresh: () => void }) {
  const [menuOpen,  setMenuOpen]  = useState<string | null>(null); // docId
  const [editing,   setEditing]   = useState<string | null>(null); // docId
  const [editName,  setEditName]  = useState("");
  const [editType,  setEditType]  = useState("");
  const [editYear,  setEditYear]  = useState("");
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState<string | null>(null);

  const DOC_TYPE_OPTIONS = [
    { value: "imf_article_iv",       label: "IMF Article IV" },
    { value: "central_bank_report",  label: "Central Bank Report" },
    { value: "mof_fiscal_framework", label: "MoF Fiscal Framework" },
    { value: "eurobond_prospectus",  label: "Eurobond Prospectus" },
    { value: "rating_agency_report", label: "Rating Agency Report" },
    { value: "annual_report",        label: "Annual Report" },
    { value: "bond_prospectus",      label: "Bond Prospectus" },
    { value: "investor_presentation",label: "Investor Presentation" },
    { value: "earnings_transcript",  label: "Earnings Transcript" },
    { value: "other",                label: "Other" },
  ];

  const startEdit = (doc: Document) => {
    setEditing(doc.id);
    setEditName(doc.display_name || "");
    setEditType(doc.doc_type);
    setEditYear(doc.year || "");
    setMenuOpen(null);
  };

  const saveEdit = async (doc: Document) => {
    setSaving(true);
    await fetch(`/api/stocks/${stock.id}/documents/${doc.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        display_name: editName.trim() || null,
        doc_type: editType,
        year: editYear.trim() || null,
      }),
    });
    setSaving(false);
    setEditing(null);
    onRefresh();
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm(`Delete "${doc.display_name || doc.file_name}"?`)) return;
    setDeleting(doc.id);
    setMenuOpen(null);
    await fetch(`/api/stocks/${stock.id}/documents/${doc.id}`, { method: "DELETE" });
    setDeleting(null);
    onRefresh();
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[13px] font-semibold text-[#2d1654]">Documents</h2>
        <button onClick={onUpload}
          className="flex items-center gap-1.5 rounded-sm bg-[#5b21b6] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#5b21b6]/90 transition-colors">
          <Plus className="h-3 w-3" /> Add Document
        </button>
      </div>

      {stock.documents.length === 0 ? (
        <p className="text-[12px] text-[#b09dcc]">No documents yet.</p>
      ) : (
        <div className="rounded-sm border border-[#d8cfe8] overflow-hidden">
          {stock.documents.map((doc, i) => (
            <div key={doc.id} className={cn(i < stock.documents.length - 1 && "border-b border-[#e0d8ee]")}>

              {editing === doc.id ? (
                /* ── Inline edit form ── */
                <div className="px-4 py-3 bg-[#f8f5fc] space-y-3">
                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-[#9a7cc0] mb-1 block">Document Name</label>
                    <input
                      autoFocus
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      placeholder={doc.file_name}
                      className="w-full rounded-sm border border-[#d0c6e0] bg-white px-3 py-1.5 text-[12px] text-[#1a0a2e] placeholder-[#c4b5d8] outline-none focus:border-[#5b21b6] transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-[#9a7cc0] mb-1 block">Type</label>
                      <select value={editType} onChange={e => setEditType(e.target.value)}
                        className="w-full rounded-sm border border-[#d0c6e0] bg-white px-2 py-1.5 text-[12px] text-[#1a0a2e] outline-none focus:border-[#5b21b6]">
                        {DOC_TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-[#9a7cc0] mb-1 block">Year</label>
                      <input value={editYear} onChange={e => setEditYear(e.target.value)} placeholder="2025"
                        className="w-full rounded-sm border border-[#d0c6e0] bg-white px-3 py-1.5 font-mono text-[12px] text-[#1a0a2e] placeholder-[#c4b5d8] outline-none focus:border-[#5b21b6] transition-colors" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => saveEdit(doc)} disabled={saving}
                      className="flex items-center gap-1.5 rounded-sm bg-[#5b21b6] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#5b21b6]/90 disabled:opacity-40 transition-colors">
                      {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                      Save
                    </button>
                    <button onClick={() => setEditing(null)} disabled={saving}
                      className="flex items-center gap-1.5 rounded-sm border border-[#d0c6e0] px-3 py-1.5 text-[11px] text-[#8b6bb5] hover:border-[#5b21b6]/40 disabled:opacity-40 transition-colors">
                      <XIcon className="h-3 w-3" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Normal row ── */
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 transition-colors group",
                  deleting === doc.id && "opacity-40"
                )}>
                  <FileText className="h-3.5 w-3.5 shrink-0 text-[#9a7cc0]" />

                  <a href={doc.blob_url.startsWith("uploaded:") ? undefined : doc.blob_url}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
                    <p className="text-[12px] font-medium text-[#2d1654] truncate">
                      {doc.display_name || doc.file_name}
                    </p>
                    {doc.display_name && (
                      <p className="text-[10px] text-[#c4b5d8] truncate font-mono">{doc.file_name}</p>
                    )}
                    <p className="text-[11px] text-[#b09dcc]">
                      {DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}
                      {doc.year && ` · ${doc.year}`}
                      {doc.page_count && ` · ${doc.page_count} pages`}
                      {` · Added ${formatDate(doc.created_at)}`}
                    </p>
                  </a>

                  {/* 3-dot menu */}
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setMenuOpen(menuOpen === doc.id ? null : doc.id)}
                      className="flex h-6 w-6 items-center justify-center rounded-sm text-[#c4b5d8] hover:bg-[#ede8f5] hover:text-[#6b4fa0] transition-colors">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>

                    {menuOpen === doc.id && (
                      <>
                        {/* Click-away backdrop */}
                        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                        <div className="absolute right-0 top-7 z-20 w-32 rounded-sm border border-[#d8cfe8] bg-white shadow-lg overflow-hidden">
                          <button onClick={() => startEdit(doc)}
                            className="w-full px-3 py-2 text-left text-[12px] text-[#2d1654] hover:bg-[#f4f0f8] transition-colors">
                            Edit details
                          </button>
                          <button onClick={() => handleDelete(doc)}
                            className="w-full px-3 py-2 text-left text-[12px] text-red-500 hover:bg-red-50 transition-colors border-t border-[#e0d8ee]">
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-[11px] text-[#9a7cc0] leading-relaxed">
        Add documents then hit &quot;Re-analyse&quot; to generate the credit assessment across all of them.
      </p>
    </div>
  );
}
