import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

const THEMES = [
  { name: "AI Infrastructure",       count: 12, tag: "ai-infra" },
  { name: "Semiconductor Equipment", count: 8,  tag: "semis" },
  { name: "Networking",              count: 6,  tag: "networking" },
  { name: "Data Centres",            count: 9,  tag: "datacentres" },
  { name: "Power & Cooling",         count: 5,  tag: "power" },
  { name: "UK Small Caps",           count: 14, tag: "uk-smid" },
  { name: "Governance Leaders",      count: 7,  tag: "governance" },
  { name: "Capital Allocation",      count: 10, tag: "capalloc" },
];

const RESEARCH = [
  {
    ticker: "NVDA",
    company: "Nvidia",
    sector: "Semiconductors",
    title: "What Changed In Nvidia's Annual Report",
    debate: "The market is pricing in sustained hyperscaler capex growth. The filing reveals growing customer concentration risk and a dependency on TSMC that isn't fully reflected in consensus models.",
    tags: ["AI Infrastructure", "Semiconductors", "What Changed"],
    date: "Jun 2025",
    readTime: "8 min read",
  },
  {
    ticker: "ANET",
    company: "Arista Networks",
    sector: "Networking",
    title: "Why Networking May Be The Most Underappreciated AI Trade",
    debate: "Arista's positioning in AI back-end networking is structurally undervalued. The debate centres on whether Ethernet displaces InfiniBand — the annual report language shifted materially this year.",
    tags: ["Networking", "AI Infrastructure", "Variant Perception"],
    date: "May 2025",
    readTime: "6 min read",
  },
  {
    ticker: "ASML",
    company: "ASML",
    sector: "Semiconductor Equipment",
    title: "ASML And The Limits Of Semiconductor Scaling",
    debate: "High-NA EUV creates a compelling long-term moat but introduces new execution risk. Management's tone on China restrictions shifted notably vs the prior year — more defensive, less dismissive.",
    tags: ["Semiconductor Equipment", "Governance", "Risk"],
    date: "Apr 2025",
    readTime: "10 min read",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white">

      {/* ── Nav ──────────────────────────────────────────────────────────────── */}
      <nav className="border-b border-white/[0.06] px-6 py-0">
        <div className="max-w-7xl mx-auto flex h-12 items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white flex items-center justify-center">
                <span className="text-black font-bold text-[10px] tracking-tight">ARI</span>
              </div>
              <span className="text-[13px] font-semibold text-white/80 tracking-tight">Annual Report Intelligence</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#research" className="text-[12px] text-white/40 hover:text-white/80 transition-colors">Research</a>
              <a href="#themes" className="text-[12px] text-white/40 hover:text-white/80 transition-colors">Themes</a>
              <a href="#about" className="text-[12px] text-white/40 hover:text-white/80 transition-colors">About</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="#access" className="text-[12px] text-white/40 hover:text-white/70 transition-colors">Request Access</a>
            <Link href="/login"
              className="flex items-center gap-1.5 border border-white/15 px-3 py-1.5 text-[12px] font-medium text-white/70 hover:border-white/30 hover:text-white transition-colors">
              Private Beta
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="border-b border-white/[0.06] px-6 py-20 md:py-28">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-white/10 px-3 py-1 text-[11px] text-white/35 mb-10 font-mono tracking-widest uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Private Beta · Institutional Access Only
          </div>
          <h1 className="text-[42px] md:text-[64px] font-bold leading-[1.02] tracking-tight text-white mb-6">
            AI-powered institutional<br />
            equity research.
          </h1>
          <p className="text-[15px] md:text-[17px] text-white/40 max-w-xl leading-relaxed mb-10">
            Annual report intelligence for hedge funds, portfolio managers, and
            equity research analysts. Focused on AI infrastructure, semiconductors,
            and public markets.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a href="#research"
              className="flex items-center gap-2 bg-white text-black px-5 py-2.5 text-[13px] font-semibold hover:bg-white/90 transition-colors">
              Explore Research
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <a href="#access"
              className="flex items-center gap-2 border border-white/15 px-5 py-2.5 text-[13px] text-white/60 hover:border-white/30 hover:text-white transition-colors">
              Request Private Beta Access
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────────────── */}
      <div className="border-b border-white/[0.06] grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.06]">
        {[
          { label: "Companies Analysed",  value: "60+" },
          { label: "Annual Reports Read", value: "120+" },
          { label: "Research Sections",   value: "16" },
          { label: "Analysis Focus",      value: "AI · Semis · UK" },
        ].map(({ label, value }) => (
          <div key={label} className="px-6 py-5">
            <p className="font-mono text-[22px] font-semibold text-white">{value}</p>
            <p className="text-[11px] text-white/30 mt-1 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Themes ───────────────────────────────────────────────────────────── */}
      <section id="themes" className="border-b border-white/[0.06] px-6 py-14">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/25 mb-2">Coverage Universe</p>
              <h2 className="text-[22px] font-bold text-white">Research Themes</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06]">
            {THEMES.map((theme) => (
              <div key={theme.tag}
                className="group bg-[#080808] px-5 py-5 hover:bg-[#0f0f0f] transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-1.5 h-1.5 bg-white/20 rounded-full mt-1.5 group-hover:bg-white/50 transition-colors" />
                  <ArrowUpRight className="h-3 w-3 text-white/15 group-hover:text-white/40 transition-colors" />
                </div>
                <h3 className="text-[13px] font-semibold text-white/70 group-hover:text-white transition-colors leading-tight mb-2">
                  {theme.name}
                </h3>
                <p className="text-[11px] text-white/25 font-mono">{theme.count} companies</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Research ─────────────────────────────────────────────────── */}
      <section id="research" className="border-b border-white/[0.06] px-6 py-14">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/25 mb-2">Latest</p>
              <h2 className="text-[22px] font-bold text-white">Featured Research</h2>
            </div>
            <Link href="/login" className="text-[12px] text-white/30 hover:text-white/70 transition-colors flex items-center gap-1">
              Full access <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.06]">
            {RESEARCH.map((r, i) => (
              <article key={i} className="group bg-[#080808] p-6 hover:bg-[#0d0d0d] transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-white/40">{r.ticker}</span>
                    <span className="text-white/15">·</span>
                    <span className="text-[11px] text-white/25">{r.sector}</span>
                  </div>
                  <span className="text-[10px] text-white/20 font-mono">{r.date}</span>
                </div>

                <h3 className="text-[14px] font-semibold text-white/80 group-hover:text-white leading-snug mb-3 transition-colors">
                  {r.title}
                </h3>

                <p className="text-[12px] text-white/35 leading-relaxed mb-5 line-clamp-3">
                  {r.debate}
                </p>

                <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
                  <div className="flex flex-wrap gap-1.5">
                    {r.tags.slice(0, 2).map(tag => (
                      <span key={tag}
                        className="border border-white/10 px-2 py-0.5 text-[10px] text-white/30 font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] text-white/20">{r.readTime}</span>
                </div>
              </article>
            ))}
          </div>

          {/* Blurred CTA */}
          <div className="border border-white/[0.06] bg-[#0d0d0d] px-6 py-8 mt-px text-center">
            <p className="text-[13px] text-white/40 mb-4">
              Full research access — including scoring, governance analysis, and "what changed" intelligence — is available in the private beta.
            </p>
            <Link href="/login"
              className="inline-flex items-center gap-2 border border-white/15 px-5 py-2.5 text-[12px] font-medium text-white/60 hover:border-white/30 hover:text-white transition-colors">
              Access Private Beta
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── About / Philosophy ───────────────────────────────────────────────── */}
      <section id="about" className="border-b border-white/[0.06] px-6 py-14">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/25 mb-4">Research Philosophy</p>
            <h2 className="text-[22px] font-bold text-white mb-5">
              We think like sceptical<br />buy-side analysts.
            </h2>
            <p className="text-[13px] text-white/40 leading-relaxed mb-4">
              ARI is not an AI summariser. It reads annual reports the way an experienced
              analyst does — looking for what changed, what management is obscuring, and
              where the market may be wrong.
            </p>
            <p className="text-[13px] text-white/40 leading-relaxed">
              Every output is evidence-linked. Every conclusion is challenged. The goal
              is one question: is this stock worth deeper work?
            </p>
          </div>
          <div className="space-y-px border border-white/[0.06]">
            {[
              ["Business Quality",      "Pricing power, switching costs, competitive position"],
              ["Financial Quality",      "Cash conversion, margin quality, leverage discipline"],
              ["Management Quality",    "Execution track record, capital allocation, candour"],
              ["Governance Intelligence","Board independence, remuneration alignment, disclosure"],
              ["What Changed Engine",   "Year-on-year strategy, tone, and risk delta analysis"],
              ["Variant Perception",    "What the market is missing or mispricing"],
            ].map(([label, desc]) => (
              <div key={label} className="flex gap-4 bg-[#0d0d0d] px-5 py-3.5">
                <div className="w-1 bg-white/10 shrink-0 rounded-full" />
                <div>
                  <p className="text-[12px] font-semibold text-white/70">{label}</p>
                  <p className="text-[11px] text-white/30 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Private Beta CTA ─────────────────────────────────────────────────── */}
      <section id="access" className="px-6 py-20 border-b border-white/[0.06]">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/25 mb-4 font-mono">
            Private Beta
          </p>
          <h2 className="text-[28px] font-bold text-white mb-4">
            Institutional access only.
          </h2>
          <p className="text-[13px] text-white/40 leading-relaxed mb-8">
            ARI is currently in private beta for hedge funds, portfolio managers,
            and equity research analysts. Access is by application only.
          </p>
          <div className="flex flex-col gap-3 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="your@fund.com"
              className="w-full bg-white/[0.04] border border-white/10 px-4 py-2.5 text-[13px] text-white placeholder-white/20 outline-none focus:border-white/25 transition-colors"
            />
            <button
              className="w-full bg-white text-black py-2.5 text-[13px] font-semibold hover:bg-white/90 transition-colors">
              Request Access
            </button>
          </div>
          <p className="text-[11px] text-white/20 mt-4">
            We review all applications. Not all requests will be approved.
          </p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white flex items-center justify-center">
              <span className="text-black font-bold text-[9px]">ARI</span>
            </div>
            <span className="text-[12px] text-white/25">Annual Report Intelligence</span>
          </div>
          <p className="text-[11px] text-white/20">
            Not investment advice. For professional research use only.
          </p>
        </div>
      </footer>

    </div>
  );
}
