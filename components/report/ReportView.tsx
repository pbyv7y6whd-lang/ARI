"use client";

import { useState } from "react";
import type { ReportAnalysis } from "@/lib/supabase";
import { cn, scoreToColour, severityBadge, ratingBadge } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  PieChart,
  AlertTriangle,
  Shield,
  DollarSign,
  BarChart3,
  Search,
  MessageSquare,
  FileText,
  Target,
  Zap,
  ChevronDown,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import type { YearOnYearTrends } from "@/lib/supabase";

const BASE_SECTIONS = [
  { id: "snapshot", label: "Snapshot", icon: Target },
  { id: "summary", label: "Summary", icon: FileText },
  { id: "drivers", label: "Drivers", icon: TrendingUp },
  { id: "bull", label: "Bull Case", icon: TrendingUp },
  { id: "bear", label: "Bear Case", icon: TrendingDown },
  { id: "variant", label: "Variant", icon: Eye },
  { id: "management", label: "Management", icon: Users },
  { id: "capital", label: "Capital", icon: DollarSign },
  { id: "financial", label: "Financial", icon: BarChart3 },
  { id: "accounting", label: "Accounting", icon: Search },
  { id: "governance", label: "Governance", icon: Shield },
  { id: "remuneration", label: "Remuneration", icon: PieChart },
  { id: "risks", label: "Risks", icon: AlertTriangle },
  { id: "catalysts", label: "Catalysts", icon: Zap },
  { id: "questions", label: "Questions", icon: MessageSquare },
  { id: "memo", label: "Memo", icon: FileText },
];

export default function ReportView({ analysis }: { analysis: ReportAnalysis }) {
  const [activeSection, setActiveSection] = useState("snapshot");
  const hasYoY = !!analysis.yearOnYearTrends?.yearsAnalysed?.length;
  const SECTIONS = hasYoY
    ? [...BASE_SECTIONS, { id: "trends", label: "YoY Trends", icon: CalendarDays }]
    : BASE_SECTIONS;

  return (
    <div className="flex gap-8">
      {/* Left nav */}
      <aside className="w-44 shrink-0 sticky top-24 self-start">
        <nav className="space-y-0.5">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveSection(id);
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={cn(
                "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-all text-left",
                activeSection === id
                  ? "bg-white/8 text-white"
                  : "text-white/35 hover:text-white/70 hover:bg-white/4"
              )}
            >
              <Icon className="w-3 h-3 shrink-0" />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 space-y-10 pb-24 min-w-0">
        <Section id="snapshot">
          <InvestmentSnapshot data={analysis.investmentSnapshot} />
        </Section>

        <Section id="summary">
          <SectionHeader
            number="02"
            title="Executive Investment Summary"
            subtitle="Buy-side briefing — what happened, what matters, why you should care"
          />
          <div className="grid gap-4 mt-6">
            <Card label="What happened this year">
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                {analysis.executiveSummary.whatHappened}
              </p>
            </Card>
            <Card label="What matters most">
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                {analysis.executiveSummary.whatMattersMost}
              </p>
            </Card>
            <Card label="Why investors should care">
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                {analysis.executiveSummary.whyInvestorsCare}
              </p>
            </Card>
          </div>
        </Section>

        <Section id="drivers">
          <SectionHeader
            number="03"
            title="Key Investment Drivers"
            subtitle="Ranked by importance to investment outcome"
          />
          <div className="mt-6 space-y-3">
            {analysis.keyDrivers?.drivers
              ?.sort((a, b) => a.rank - b.rank)
              .map((driver, i) => (
                <DriverCard key={i} driver={driver} />
              ))}
          </div>
        </Section>

        <Section id="bull">
          <SectionHeader
            number="04"
            title="Bull Case"
            subtitle="Top reasons to own the stock"
          />
          <div className="mt-6 space-y-3">
            {analysis.bullCase?.points?.map((point, i) => (
              <div
                key={i}
                className="bg-emerald-950/20 border border-emerald-500/15 rounded-xl p-5"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-6 h-6 bg-emerald-500/20 rounded-md flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-emerald-400 text-xs font-bold">
                      {i + 1}
                    </span>
                  </div>
                  <h4 className="font-semibold text-white">{point.title}</h4>
                </div>
                <p className="text-sm text-white/60 mb-3 leading-relaxed ml-9">
                  {point.evidence}
                </p>
                <div className="ml-9 flex flex-wrap gap-3 text-xs">
                  {point.catalyst && (
                    <span className="text-white/40">
                      <span className="text-white/20">Catalyst:</span>{" "}
                      {point.catalyst}
                    </span>
                  )}
                  {point.timeline && (
                    <span className="text-emerald-400/70 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {point.timeline}
                    </span>
                  )}
                  {point.confidence && (
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded",
                        point.confidence === "High"
                          ? "bg-emerald-500/10 text-emerald-400/80"
                          : point.confidence === "Medium"
                          ? "bg-amber-500/10 text-amber-400/80"
                          : "bg-red-500/10 text-red-400/80"
                      )}
                    >
                      {point.confidence} conviction
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="bear">
          <SectionHeader
            number="05"
            title="Bear Case"
            subtitle="Top reasons to avoid the stock"
          />
          <div className="mt-6 space-y-3">
            {analysis.bearCase?.points?.map((point, i) => (
              <div
                key={i}
                className="bg-red-950/20 border border-red-500/15 rounded-xl p-5"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-6 h-6 bg-red-500/20 rounded-md flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-red-400 text-xs font-bold">{i + 1}</span>
                  </div>
                  <h4 className="font-semibold text-white">{point.title}</h4>
                </div>
                <p className="text-sm text-white/60 mb-3 leading-relaxed ml-9">
                  {point.evidence}
                </p>
                <div className="ml-9 flex flex-wrap gap-3 text-xs">
                  {point.severity && (
                    <span className={cn("px-2 py-0.5 rounded", severityBadge(point.severity))}>
                      {point.severity} severity
                    </span>
                  )}
                  {point.likelihood && (
                    <span className={cn("px-2 py-0.5 rounded", severityBadge(point.likelihood))}>
                      {point.likelihood} likelihood
                    </span>
                  )}
                  {point.impact && (
                    <span className="text-white/40">
                      <span className="text-white/20">Impact:</span> {point.impact}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="variant">
          <SectionHeader
            number="06"
            title="Variant Perception"
            subtitle="What is the market most likely missing?"
          />
          <div className="mt-6">
            {analysis.variantPerception?.exists ? (
              <div className="bg-sky-950/20 border border-sky-500/15 rounded-xl p-6">
                {analysis.variantPerception.category && (
                  <div className="inline-flex items-center gap-1.5 bg-sky-500/15 text-sky-400 text-xs px-3 py-1 rounded-full mb-4">
                    <Eye className="w-3 h-3" />
                    {analysis.variantPerception.category}
                  </div>
                )}
                {analysis.variantPerception.thesis && (
                  <p className="text-white/80 font-medium mb-3 leading-relaxed">
                    {analysis.variantPerception.thesis}
                  </p>
                )}
                {analysis.variantPerception.evidence && (
                  <p className="text-sm text-white/50 mb-3 leading-relaxed">
                    {analysis.variantPerception.evidence}
                  </p>
                )}
                {analysis.variantPerception.magnitude && (
                  <div className="border-t border-white/5 pt-3 mt-3">
                    <span className="text-xs text-white/30">Potential magnitude: </span>
                    <span className="text-xs text-sky-400">{analysis.variantPerception.magnitude}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/[0.02] border border-white/8 rounded-xl p-6 text-center text-white/30 text-sm">
                No clear variant perception identified. The investment case appears
                broadly in line with likely consensus.
              </div>
            )}
          </div>
        </Section>

        <Section id="management">
          <SectionHeader
            number="07"
            title="Management Quality Review"
            subtitle="CEO credibility, capital allocation, shareholder alignment"
          />
          <div className="mt-6">
            <ScoreCard
              score={analysis.managementQuality?.score}
              max={10}
              label="Management Score"
            />
            <div className="mt-4 grid md:grid-cols-2 gap-3">
              {[
                { label: "CEO Credibility", value: analysis.managementQuality?.ceoCredibility },
                { label: "Strategic Consistency", value: analysis.managementQuality?.strategicConsistency },
                { label: "Capital Allocation", value: analysis.managementQuality?.capitalAllocationQuality },
                { label: "Shareholder Alignment", value: analysis.managementQuality?.shareholderAlignment },
                { label: "Communication Quality", value: analysis.managementQuality?.communicationQuality },
              ].map(({ label, value }) => value && (
                <Card key={label} label={label}>
                  <p className="text-sm text-white/60 leading-relaxed">{value}</p>
                </Card>
              ))}
            </div>
            {analysis.managementQuality?.evidence && (
              <div className="mt-3 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <p className="text-xs text-white/30 mb-1">Supporting evidence</p>
                <p className="text-sm text-white/50 leading-relaxed">
                  {analysis.managementQuality.evidence}
                </p>
              </div>
            )}
          </div>
        </Section>

        <Section id="capital">
          <SectionHeader
            number="08"
            title="Capital Allocation Review"
            subtitle="Buybacks, dividends, acquisitions, debt, reinvestment"
          />
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-sm text-white/40">Overall rating:</span>
              <span className={cn("text-sm font-bold px-3 py-1 rounded-lg", ratingBadge(analysis.capitalAllocation?.rating))}>
                {analysis.capitalAllocation?.rating}
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { label: "Buybacks", value: analysis.capitalAllocation?.buybacks },
                { label: "Dividends", value: analysis.capitalAllocation?.dividends },
                { label: "Acquisitions", value: analysis.capitalAllocation?.acquisitions },
                { label: "Debt Management", value: analysis.capitalAllocation?.debtManagement },
                { label: "Reinvestment", value: analysis.capitalAllocation?.reinvestment },
              ].map(({ label, value }) => value && (
                <Card key={label} label={label}>
                  <p className="text-sm text-white/60 leading-relaxed">{value}</p>
                </Card>
              ))}
            </div>
            {analysis.capitalAllocation?.rationale && (
              <div className="mt-3 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <p className="text-sm text-white/50 leading-relaxed">
                  {analysis.capitalAllocation.rationale}
                </p>
              </div>
            )}
          </div>
        </Section>

        <Section id="financial">
          <SectionHeader
            number="09"
            title="Financial Quality Review"
            subtitle="Revenue, margins, cash conversion, ROIC, leverage, liquidity"
          />
          <div className="mt-6">
            <ScoreCard
              score={analysis.financialQuality?.score}
              max={10}
              label="Financial Quality Score"
            />
            <div className="mt-4 grid md:grid-cols-2 gap-3">
              {[
                { label: "Revenue Growth", value: analysis.financialQuality?.revenueGrowth },
                { label: "Margins", value: analysis.financialQuality?.margins },
                { label: "Cash Conversion", value: analysis.financialQuality?.cashConversion },
                { label: "ROIC Indicators", value: analysis.financialQuality?.roicIndicators },
                { label: "Leverage", value: analysis.financialQuality?.leverage },
                { label: "Liquidity", value: analysis.financialQuality?.liquidity },
              ].map(({ label, value }) => value && (
                <Card key={label} label={label}>
                  <p className="text-sm text-white/60 leading-relaxed">{value}</p>
                </Card>
              ))}
            </div>
          </div>
        </Section>

        <Section id="accounting">
          <SectionHeader
            number="10"
            title="Accounting Red Flags"
            subtitle="Aggressive adjustments, working capital, exceptional items"
          />
          <div className="mt-6 space-y-2">
            {analysis.accountingFlags?.flags?.length === 0 ? (
              <div className="bg-emerald-950/20 border border-emerald-500/15 rounded-xl p-5 text-sm text-emerald-400/70">
                No significant accounting concerns identified.
              </div>
            ) : (
              analysis.accountingFlags?.flags?.map((flag, i) => (
                <div
                  key={i}
                  className="bg-white/[0.02] border border-white/8 rounded-xl p-4 flex items-start gap-3"
                >
                  <span className={cn("text-xs px-2 py-0.5 rounded shrink-0 mt-0.5", severityBadge(flag.severity))}>
                    {flag.severity}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white mb-1">
                      {flag.concern}
                    </p>
                    <p className="text-sm text-white/50 leading-relaxed">
                      {flag.detail}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Section>

        <Section id="governance">
          <SectionHeader
            number="11"
            title="Governance Review"
            subtitle="Board structure, independence, conflicts of interest"
          />
          <div className="mt-6">
            <ScoreCard
              score={analysis.governanceReview?.score}
              max={10}
              label="Governance Score"
            />
            <div className="mt-4 grid md:grid-cols-2 gap-3">
              {[
                { label: "Board Structure", value: analysis.governanceReview?.boardStructure },
                { label: "Independence", value: analysis.governanceReview?.independence },
                { label: "Governance Quality", value: analysis.governanceReview?.governanceQuality },
                { label: "Executive Influence", value: analysis.governanceReview?.executiveInfluence },
                { label: "Potential Conflicts", value: analysis.governanceReview?.potentialConflicts },
              ].map(({ label, value }) => value && (
                <Card key={label} label={label}>
                  <p className="text-sm text-white/60 leading-relaxed">{value}</p>
                </Card>
              ))}
            </div>
          </div>
        </Section>

        <Section id="remuneration">
          <SectionHeader
            number="12"
            title="Remuneration Analysis"
            subtitle="Incentive alignment, pay structure, value creation vs destruction"
          />
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-sm text-white/40">Pay orientation:</span>
              <span
                className={cn(
                  "text-sm font-semibold px-3 py-1 rounded-lg",
                  analysis.remunerationAnalysis?.orientation === "Long-term value creation"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : analysis.remunerationAnalysis?.orientation === "Short-term earnings management"
                    ? "bg-red-500/15 text-red-400 border border-red-500/30"
                    : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                )}
              >
                {analysis.remunerationAnalysis?.orientation}
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { label: "Incentive Alignment", value: analysis.remunerationAnalysis?.incentiveAlignment },
                { label: "Performance Metrics", value: analysis.remunerationAnalysis?.performanceMetrics },
                { label: "Value Destruction Risk", value: analysis.remunerationAnalysis?.potentialValueDestruction },
                { label: "Overall Assessment", value: analysis.remunerationAnalysis?.assessment },
              ].map(({ label, value }) => value && (
                <Card key={label} label={label}>
                  <p className="text-sm text-white/60 leading-relaxed">{value}</p>
                </Card>
              ))}
            </div>
          </div>
        </Section>

        <Section id="risks">
          <SectionHeader
            number="13"
            title="Risk Matrix"
            subtitle="Operational, financial, regulatory, competitive, technological, management"
          />
          <div className="mt-6">
            {(["High", "Medium", "Low"] as const).map((severity) => {
              const risks = analysis.riskMatrix?.risks?.filter(
                (r) => r.severity === severity
              );
              if (!risks?.length) return null;
              return (
                <div key={severity} className="mb-5">
                  <h4 className="text-xs text-white/30 uppercase tracking-widest mb-2">
                    {severity} severity
                  </h4>
                  <div className="space-y-2">
                    {risks.map((risk, i) => (
                      <div
                        key={i}
                        className="bg-white/[0.02] border border-white/8 rounded-xl p-4 flex items-start gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn("text-xs px-1.5 py-0.5 rounded text-[10px]", severityBadge(risk.severity))}>
                              {risk.category}
                            </span>
                            <p className="text-sm font-medium text-white">{risk.name}</p>
                          </div>
                          <p className="text-sm text-white/50 leading-relaxed">
                            {risk.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        <Section id="catalysts">
          <SectionHeader
            number="14"
            title="Investment Catalysts"
            subtitle="Potential value-unlocking events by time horizon"
          />
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            {[
              { label: "0–3 months", items: analysis.catalysts?.threeMonths, colour: "text-sky-400 border-sky-500/20 bg-sky-950/20" },
              { label: "3–6 months", items: analysis.catalysts?.sixMonths, colour: "text-violet-400 border-violet-500/20 bg-violet-950/20" },
              { label: "6–12 months", items: analysis.catalysts?.twelveMonths, colour: "text-amber-400 border-amber-500/20 bg-amber-950/20" },
              { label: "12–24 months", items: analysis.catalysts?.twentyFourMonths, colour: "text-emerald-400 border-emerald-500/20 bg-emerald-950/20" },
            ].map(({ label, items, colour }) => (
              <div key={label} className={cn("border rounded-xl p-4", colour)}>
                <p className="text-xs font-semibold mb-3 opacity-70 uppercase tracking-wide">
                  {label}
                </p>
                <ul className="space-y-2">
                  {items?.map((cat, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                      <ChevronRight className="w-3 h-3 mt-0.5 shrink-0 opacity-50" />
                      {cat}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section id="questions">
          <SectionHeader
            number="15"
            title="Questions for Management"
            subtitle="Institutional-quality questions — hedge fund meeting standard"
          />
          <div className="mt-6 space-y-2">
            {analysis.managementQuestions?.questions?.map((q, i) => (
              <div
                key={i}
                className="bg-white/[0.02] border border-white/8 rounded-xl p-4 flex items-start gap-3"
              >
                <span className="text-white/20 font-mono text-xs w-6 shrink-0 mt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-sm text-white/70 leading-relaxed">{q}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="memo">
          <SectionHeader
            number="16"
            title="One-Page Investment Memo"
            subtitle="Hedge fund analyst style — thesis, positives, risks, catalysts, further work"
          />
          <div className="mt-6 bg-white/[0.02] border border-white/10 rounded-2xl p-8">
            {analysis.investmentMemo?.thesis && (
              <div className="mb-6">
                <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Investment Thesis</p>
                <p className="text-white font-medium leading-relaxed text-base">
                  {analysis.investmentMemo.thesis}
                </p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {analysis.investmentMemo?.keyPositives?.length && (
                <div>
                  <p className="text-xs text-emerald-400/70 uppercase tracking-widest mb-3">
                    Key positives
                  </p>
                  <ul className="space-y-2">
                    {analysis.investmentMemo.keyPositives.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                        <span className="text-emerald-400 mt-1">+</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.investmentMemo?.keyRisks?.length && (
                <div>
                  <p className="text-xs text-red-400/70 uppercase tracking-widest mb-3">
                    Key risks
                  </p>
                  <ul className="space-y-2">
                    {analysis.investmentMemo.keyRisks.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                        <span className="text-red-400 mt-1">−</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.investmentMemo?.catalysts?.length && (
                <div>
                  <p className="text-xs text-sky-400/70 uppercase tracking-widest mb-3">
                    Catalysts
                  </p>
                  <ul className="space-y-2">
                    {analysis.investmentMemo.catalysts.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                        <span className="text-sky-400 mt-1">→</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.investmentMemo?.furtherWork?.length && (
                <div>
                  <p className="text-xs text-amber-400/70 uppercase tracking-widest mb-3">
                    Further work required
                  </p>
                  <ul className="space-y-2">
                    {analysis.investmentMemo.furtherWork.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                        <span className="text-amber-400 mt-1">?</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Overall Score */}
          {analysis.overallScore && (
            <div className="mt-6 bg-white/[0.02] border border-white/10 rounded-2xl p-8">
              <p className="text-xs text-white/30 uppercase tracking-widest mb-6">
                Investment Attractiveness Score
              </p>
              <div className="flex items-center gap-8 mb-6">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "text-6xl font-bold",
                      analysis.overallScore.total >= 70
                        ? "text-emerald-400"
                        : analysis.overallScore.total >= 50
                        ? "text-amber-400"
                        : "text-red-400"
                    )}
                  >
                    {analysis.overallScore.total}
                  </div>
                  <div className="text-white/20 text-sm mt-1">/100</div>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-3">
                  {[
                    { label: "Business", value: analysis.overallScore.businessQuality },
                    { label: "Financial", value: analysis.overallScore.financialQuality },
                    { label: "Management", value: analysis.overallScore.managementQuality },
                    { label: "Governance", value: analysis.overallScore.governanceQuality },
                    { label: "Risk Profile", value: analysis.overallScore.riskProfile },
                    { label: "Cap Alloc.", value: analysis.overallScore.capitalAllocationQuality },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center">
                      <div className={cn("text-xl font-bold", scoreToColour(value, 100))}>
                        {value}
                      </div>
                      <div className="text-xs text-white/25 mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                {analysis.overallScore.explanation}
              </p>
            </div>
          )}
        </Section>

        {/* Year-on-Year Trends — only shown when multiple years of data exist */}
        {hasYoY && analysis.yearOnYearTrends && (
          <Section id="trends">
            <SectionHeader
              number="17"
              title="Year-on-Year Trends"
              subtitle={`Multi-year analysis across ${analysis.yearOnYearTrends.yearsAnalysed.join(", ")}`}
            />
            <YearOnYearSection data={analysis.yearOnYearTrends} />
          </Section>
        )}

      </div>
    </div>
  );
}

function YearOnYearSection({ data }: { data: YearOnYearTrends }) {
  return (
    <div className="mt-6 space-y-6">
      {/* Years badge */}
      <div className="flex items-center gap-2 flex-wrap">
        {data.yearsAnalysed.map((y) => (
          <span key={y} className="text-xs font-mono bg-white/8 text-white/60 px-3 py-1 rounded-full border border-white/10">
            {y}
          </span>
        ))}
      </div>

      {/* Financial trends table */}
      {data.financialTrends?.length > 0 && (
        <div>
          <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Financial Metrics Over Time</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs text-white/30 font-medium py-2 pr-4">Metric</th>
                  {data.yearsAnalysed.map((y) => (
                    <th key={y} className="text-right text-xs text-white/30 font-mono font-medium py-2 px-3">{y}</th>
                  ))}
                  <th className="text-left text-xs text-white/30 font-medium py-2 pl-4">Trend</th>
                </tr>
              </thead>
              <tbody>
                {data.financialTrends.map((row, i) => (
                  <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 pr-4 text-white/70 font-medium">{row.metric}</td>
                    {data.yearsAnalysed.map((y) => {
                      const val = row.values?.find((v) => v.year === y);
                      return (
                        <td key={y} className="py-2.5 px-3 text-right font-mono text-white/60">
                          {val?.value || "—"}
                        </td>
                      );
                    })}
                    <td className="py-2.5 pl-4">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        row.trend === "improving" ? "bg-emerald-500/15 text-emerald-400" :
                        row.trend === "deteriorating" ? "bg-red-500/15 text-red-400" :
                        row.trend === "mixed" ? "bg-amber-500/15 text-amber-400" :
                        "bg-white/8 text-white/40"
                      )}>
                        {row.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Commentaries */}
          <div className="mt-3 space-y-2">
            {data.financialTrends.filter(r => r.commentary).map((row, i) => (
              <p key={i} className="text-xs text-white/40 leading-relaxed">
                <span className="text-white/60 font-medium">{row.metric}:</span> {row.commentary}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Strategy evolution */}
      {data.strategyEvolution?.length > 0 && (
        <div>
          <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Strategic Evolution</p>
          <div className="space-y-2">
            {data.strategyEvolution.map((s, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/[0.02] border border-white/8 rounded-xl p-4">
                <span className="text-xs font-mono text-white/40 bg-white/8 px-2 py-0.5 rounded shrink-0 mt-0.5">{s.year}</span>
                <div>
                  <p className="text-sm font-medium text-white mb-0.5">{s.keyTheme}</p>
                  <p className="text-xs text-white/50 leading-relaxed">{s.change}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improving / deteriorating */}
      <div className="grid md:grid-cols-2 gap-4">
        {data.improvingFactors?.length > 0 && (
          <div className="bg-emerald-950/20 border border-emerald-500/15 rounded-xl p-4">
            <p className="text-xs text-emerald-400/70 uppercase tracking-widest mb-3">Getting better</p>
            <ul className="space-y-1.5">
              {data.improvingFactors.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                  <span className="text-emerald-400 mt-0.5">↑</span>{f}
                </li>
              ))}
            </ul>
          </div>
        )}
        {data.deterioratingFactors?.length > 0 && (
          <div className="bg-red-950/20 border border-red-500/15 rounded-xl p-4">
            <p className="text-xs text-red-400/70 uppercase tracking-widest mb-3">Getting worse</p>
            <ul className="space-y-1.5">
              {data.deterioratingFactors.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                  <span className="text-red-400 mt-0.5">↓</span>{f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Narrative cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {data.managementToneShifts && (
          <Card label="Management tone shifts">
            <p className="text-sm text-white/60 leading-relaxed">{data.managementToneShifts}</p>
          </Card>
        )}
        {data.capitalAllocationEvolution && (
          <Card label="Capital allocation evolution">
            <p className="text-sm text-white/60 leading-relaxed">{data.capitalAllocationEvolution}</p>
          </Card>
        )}
        {data.keyNarrativeChanges && (
          <Card label="Key narrative changes">
            <p className="text-sm text-white/60 leading-relaxed">{data.keyNarrativeChanges}</p>
          </Card>
        )}
      </div>

      {/* Overall trend */}
      {data.overallTrendAssessment && (
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Overall trajectory</p>
          <p className="text-sm text-white/70 leading-relaxed">{data.overallTrendAssessment}</p>
        </div>
      )}
    </div>
  );
}

function InvestmentSnapshot({ data }: { data: ReportAnalysis["investmentSnapshot"] }) {
  if (!data) return null;
  return (
    <div>
      <SectionHeader
        number="01"
        title="Investment Snapshot"
        subtitle="Company overview, sector, geographic exposure, investment relevance"
      />
      <div className="mt-6 space-y-4">
        <div className="bg-white/[0.02] border border-white/8 rounded-xl p-6">
          <p className="text-white/70 leading-relaxed mb-4">
            {data.companyDescription}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs bg-white/8 text-white/60 px-3 py-1 rounded-full">
              {data.sector}
            </span>
            {data.geographicExposure?.map((geo) => (
              <span
                key={geo}
                className="text-xs bg-white/5 text-white/40 px-3 py-1 rounded-full"
              >
                {geo}
              </span>
            ))}
          </div>
          {data.keyProducts?.length > 0 && (
            <div>
              <p className="text-xs text-white/25 uppercase tracking-widest mb-2">
                Products & Services
              </p>
              <div className="flex flex-wrap gap-2">
                {data.keyProducts.map((p) => (
                  <span
                    key={p}
                    className="text-xs text-white/50 border border-white/10 px-2.5 py-1 rounded-md"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {data.investmentRelevance && (
          <div className="bg-sky-950/20 border border-sky-500/15 rounded-xl p-5">
            <p className="text-xs text-sky-400/60 uppercase tracking-widest mb-2">
              Investment relevance
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              {data.investmentRelevance}
            </p>
          </div>
        )}

        <div className="bg-white/[0.02] border border-white/8 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-white/30 uppercase tracking-widest">
              Investment Attractiveness
            </p>
            <span
              className={cn(
                "text-2xl font-bold",
                scoreToColour(data.attractivenessScore, 10)
              )}
            >
              {data.attractivenessScore}/10
            </span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5 mb-3">
            <div
              className={cn(
                "h-1.5 rounded-full transition-all",
                data.attractivenessScore >= 7
                  ? "bg-emerald-400"
                  : data.attractivenessScore >= 5
                  ? "bg-amber-400"
                  : "bg-red-400"
              )}
              style={{ width: `${(data.attractivenessScore / 10) * 100}%` }}
            />
          </div>
          <p className="text-sm text-white/50 leading-relaxed">
            {data.attractivenessRationale}
          </p>
        </div>
      </div>
    </div>
  );
}

function DriverCard({
  driver,
}: {
  driver: ReportAnalysis["keyDrivers"]["drivers"][0];
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="w-6 h-6 bg-white/8 rounded-md flex items-center justify-center shrink-0 text-xs font-bold text-white/50">
          {driver.rank}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/30 uppercase tracking-wide">
              {driver.category}
            </span>
          </div>
          <p className="font-medium text-sm text-white">{driver.name}</p>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-white/30 transition-transform shrink-0",
            expanded && "rotate-180"
          )}
        />
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-2 ml-9">
          <div>
            <p className="text-xs text-white/25 mb-1">Mechanism</p>
            <p className="text-sm text-white/60 leading-relaxed">{driver.mechanism}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-950/20 border border-emerald-500/10 rounded-lg p-3">
              <p className="text-xs text-emerald-400/60 mb-1">Upside</p>
              <p className="text-xs text-white/60 leading-relaxed">{driver.upside}</p>
            </div>
            <div className="bg-red-950/20 border border-red-500/10 rounded-lg p-3">
              <p className="text-xs text-red-400/60 mb-1">Downside</p>
              <p className="text-xs text-white/60 leading-relaxed">{driver.downside}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div id={id} className="section-fade scroll-mt-24">
      {children}
    </div>
  );
}

function SectionHeader({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="text-white/15 font-mono text-sm w-8 shrink-0 mt-0.5">
        {number}
      </span>
      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="text-sm text-white/35 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function Card({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-xl p-4">
      <p className="text-xs text-white/25 uppercase tracking-widest mb-2">
        {label}
      </p>
      {children}
    </div>
  );
}

function ScoreCard({
  score,
  max,
  label,
}: {
  score?: number;
  max: number;
  label: string;
}) {
  if (score === undefined) return null;
  return (
    <div className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/8 rounded-xl">
      <div
        className={cn(
          "text-3xl font-bold shrink-0",
          scoreToColour(score, max)
        )}
      >
        {score}/{max}
      </div>
      <div className="flex-1">
        <p className="text-xs text-white/30 mb-1.5">{label}</p>
        <div className="w-full bg-white/5 rounded-full h-1.5">
          <div
            className={cn(
              "h-1.5 rounded-full transition-all",
              score / max >= 0.7
                ? "bg-emerald-400"
                : score / max >= 0.5
                ? "bg-amber-400"
                : "bg-red-400"
            )}
            style={{ width: `${(score / max) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
