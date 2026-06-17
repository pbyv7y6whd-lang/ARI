"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Loader2, AlertCircle, Plus, FileText,
  RefreshCw, Trash2, TrendingUp, TrendingDown,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
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
  entity_type: string;
  status: "pending" | "processing" | "complete" | "error";
  progress: number; progress_message: string | null;
  analysis: ReportAnalysis | null | Record<string, unknown>;
  doc_count: number;
  created_at: string; updated_at: string; documents: Document[];
};

// ── EM Credit type helpers ────────────────────────────────────────────────────

type SovereignAnalysis = {
  snapshot?: { country?: string; region?: string; creditView?: string; creditRationale?: string };
  fiscalProfile?: { fiscalBalanceGdp?: string; primaryBalanceGdp?: string; debtToGdp?: string; revenueToGdp?: string; interestToRevenue?: string; trend?: string; commentary?: string };
  externalSector?: { currentAccountGdp?: string; fxReservesUsd?: string; importCoverMonths?: string; externalDebtGdp?: string; commentary?: string };
  debtSustainability?: { refinancingRisk?: string; currencyMix?: string; maturityProfile?: string; imfProgramme?: { active?: boolean; details?: string }; commentary?: string };
  politicalEconomy?: { reformMomentum?: string; governanceQuality?: string; externalRelations?: string; commentary?: string };
  bullCase?: { points?: { title?: string; evidence?: string; trigger?: string }[] };
  bearCase?: { points?: { title?: string; evidence?: string; severity?: string }[] };
  creditVerdict?: { recommendation?: string; targetSpread?: string; keyCatalysts?: string[]; keyRisks?: string[]; summary?: string };
  overallScore?: { total?: number; rationale?: string };
};

type CorporateAnalysis = {
  snapshot?: { issuer?: string; country?: string; sector?: string; creditView?: string; creditRationale?: string };
  creditMetrics?: { netDebtToEbitda?: string; interestCoverage?: string; debtToEquity?: string; fcfConversion?: string; liquidityRatio?: string; trend?: string };
  debtStructure?: { totalDebt?: string; currencyMix?: string; maturityProfile?: string; nextMajorMaturity?: string; refinancingRisk?: string; commentary?: string };
  fxRisk?: { revenuesCurrency?: string; debtCurrency?: string; mismatch?: string; hedging?: string; commentary?: string };
  businessQuality?: { competitivePosition?: string; revenueVisibility?: string; marginTrend?: string; countryRisk?: string; commentary?: string };
  bullCase?: { points?: { title?: string; evidence?: string }[] };
  bearCase?: { points?: { title?: string; evidence?: string; severity?: string }[] };
  creditVerdict?: { recommendation?: string; spreadView?: string; keyRisks?: string[]; summary?: string };
  overallScore?: { total?: number; rationale?: string };
};

// ── Score colour ──────────────────────────────────────────────────────────────

function scoreColour(score: number) {
  if (score >= 70) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
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
            {a.snapshot?.region && (
              <span className="text-[10px] text-[#8b6bb5]">{a.snapshot.region}</span>
            )}
          </div>
          {a.snapshot?.creditRationale && (
            <p className="text-[13px] text-[#2d1654] leading-relaxed">{a.snapshot.creditRationale}</p>
          )}
        </div>
        {score !== undefined && (
          <div className="shrink-0 text-right border border-[#d8cfe8] rounded-sm px-3 py-2">
            <div className="font-mono text-[28px] font-bold leading-none" style={{ color: scoreColour(score) }}>{score}</div>
            <div className="text-[9px] text-[#9a7cc0] font-mono mt-0.5">/100</div>
          </div>
        )}
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
          <Commentary text={a.fiscalProfile.commentary} />
        </Section>
      )}

      {/* External Sector */}
      {a.externalSector && (
        <Section title="External Sector">
          <MetricGrid items={[
            { label: "Current Account/GDP", value: a.externalSector.currentAccountGdp },
            { label: "FX Reserves",         value: a.externalSector.fxReservesUsd },
            { label: "Import Cover",        value: a.externalSector.importCoverMonths ? `${a.externalSector.importCoverMonths} months` : null },
            { label: "External Debt/GDP",   value: a.externalSector.externalDebtGdp },
          ]} />
          <Commentary text={a.externalSector.commentary} />
        </Section>
      )}

      {/* Debt Sustainability */}
      {a.debtSustainability && (
        <Section title="Debt Sustainability">
          <MetricGrid items={[
            { label: "Refinancing Risk", value: a.debtSustainability.refinancingRisk },
            { label: "Currency Mix",     value: a.debtSustainability.currencyMix },
            { label: "Maturity Profile", value: a.debtSustainability.maturityProfile },
            { label: "IMF Programme",    value: a.debtSustainability.imfProgramme?.active
                ? `Active — ${a.debtSustainability.imfProgramme.details || ""}`
                : "None" },
          ]} />
          <Commentary text={a.debtSustainability.commentary} />
        </Section>
      )}

      {/* Political Economy */}
      {a.politicalEconomy && (
        <Section title="Political Economy">
          <MetricGrid items={[
            { label: "Reform Momentum",   value: a.politicalEconomy.reformMomentum },
            { label: "Governance",        value: a.politicalEconomy.governanceQuality },
            { label: "External Relations", value: a.politicalEconomy.externalRelations },
          ]} />
          <Commentary text={a.politicalEconomy.commentary} />
        </Section>
      )}

      {/* Bull / Bear */}
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
          {a.creditVerdict.summary && (
            <p className="text-[13px] text-[#2d1654] leading-relaxed mb-3">{a.creditVerdict.summary}</p>
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
          {a.overallScore?.rationale && (
            <div className="mt-3 pt-3 border-t border-[#ddd6ec]">
              <p className="text-[10px] uppercase tracking-widest text-[#9a7cc0] mb-1.5">Score Rationale</p>
              <p className="text-[11px] text-[#7a5aaa] leading-relaxed">{a.overallScore.rationale}</p>
            </div>
          )}
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
            {a.snapshot?.country && <span className="text-[10px] text-[#8b6bb5]">{a.snapshot.country}</span>}
            {a.snapshot?.sector && <span className="text-[10px] text-[#8b6bb5]">· {a.snapshot.sector}</span>}
          </div>
          {a.snapshot?.creditRationale && (
            <p className="text-[13px] text-[#2d1654] leading-relaxed">{a.snapshot.creditRationale}</p>
          )}
        </div>
        {score !== undefined && (
          <div className="shrink-0 text-right border border-[#d8cfe8] rounded-sm px-3 py-2">
            <div className="font-mono text-[28px] font-bold leading-none" style={{ color: scoreColour(score) }}>{score}</div>
            <div className="text-[9px] text-[#9a7cc0] font-mono mt-0.5">/100</div>
          </div>
        )}
      </div>

      {/* Credit Metrics */}
      {a.creditMetrics && (
        <Section title="Credit Metrics">
          <MetricGrid items={[
            { label: "Net Debt/EBITDA",    value: a.creditMetrics.netDebtToEbitda },
            { label: "Interest Coverage",  value: a.creditMetrics.interestCoverage },
            { label: "Debt/Equity",        value: a.creditMetrics.debtToEquity },
            { label: "FCF Conversion",     value: a.creditMetrics.fcfConversion },
            { label: "Liquidity Ratio",    value: a.creditMetrics.liquidityRatio },
            { label: "Trend",              value: a.creditMetrics.trend },
          ]} />
        </Section>
      )}

      {/* Debt Structure */}
      {a.debtStructure && (
        <Section title="Debt Structure">
          <MetricGrid items={[
            { label: "Total Debt",          value: a.debtStructure.totalDebt },
            { label: "Currency Mix",        value: a.debtStructure.currencyMix },
            { label: "Maturity Profile",    value: a.debtStructure.maturityProfile },
            { label: "Next Major Maturity", value: a.debtStructure.nextMajorMaturity },
            { label: "Refinancing Risk",    value: a.debtStructure.refinancingRisk },
          ]} />
          <Commentary text={a.debtStructure.commentary} />
        </Section>
      )}

      {/* FX Risk */}
      {a.fxRisk && (
        <Section title="FX Risk">
          <MetricGrid items={[
            { label: "Revenue Currency",  value: a.fxRisk.revenuesCurrency },
            { label: "Debt Currency",     value: a.fxRisk.debtCurrency },
            { label: "Mismatch",          value: a.fxRisk.mismatch },
            { label: "Hedging",           value: a.fxRisk.hedging },
          ]} />
          <Commentary text={a.fxRisk.commentary} />
        </Section>
      )}

      {/* Business Quality */}
      {a.businessQuality && (
        <Section title="Business Quality">
          <MetricGrid items={[
            { label: "Competitive Position", value: a.businessQuality.competitivePosition },
            { label: "Revenue Visibility",   value: a.businessQuality.revenueVisibility },
            { label: "Margin Trend",         value: a.businessQuality.marginTrend },
            { label: "Country Risk",         value: a.businessQuality.countryRisk },
          ]} />
          <Commentary text={a.businessQuality.commentary} />
        </Section>
      )}

      {/* Bull / Bear */}
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
          {a.creditVerdict.summary && (
            <p className="text-[13px] text-[#2d1654] leading-relaxed mb-3">{a.creditVerdict.summary}</p>
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
          {a.overallScore?.rationale && (
            <div className="mt-3 pt-3 border-t border-[#ddd6ec]">
              <p className="text-[10px] uppercase tracking-widest text-[#9a7cc0] mb-1.5">Score Rationale</p>
              <p className="text-[11px] text-[#7a5aaa] leading-relaxed">{a.overallScore.rationale}</p>
            </div>
          )}
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
    await fetch(`/api/stocks/${id}/analyse`, { method: "POST" });
    await fetchStock();
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
          <DocumentsTab stock={stock} onUpload={() => setUploadOpen(true)} />
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

      <UploadDocModal stockId={id} open={uploadOpen}
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

function DocumentsTab({ stock, onUpload }: { stock: StockData; onUpload: () => void }) {
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
            <a key={doc.id} href={doc.blob_url} target="_blank" rel="noopener noreferrer"
              className={cn("flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#f0edf6] group",
                i < stock.documents.length - 1 && "border-b border-[#e0d8ee]")}>
              <FileText className="h-3.5 w-3.5 shrink-0 text-[#9a7cc0]" />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-[#2d1654] truncate">{doc.file_name}</p>
                <p className="text-[11px] text-[#b09dcc]">
                  {DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}
                  {doc.year && ` · ${doc.year}`}
                  {doc.page_count && ` · ${doc.page_count} pages`}
                  {` · Added ${formatDate(doc.created_at)}`}
                </p>
              </div>
              <span className="text-[11px] text-[#c4b5d8] group-hover:text-[#6b4fa0] transition-colors">↗</span>
            </a>
          ))}
        </div>
      )}

      <p className="mt-4 text-[11px] text-[#9a7cc0] leading-relaxed">
        Add multiple documents and use &quot;Re-analyse&quot; to regenerate the credit assessment with all available data.
      </p>
    </div>
  );
}
