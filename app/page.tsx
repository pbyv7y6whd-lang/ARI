import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

const THEMES = [
  { name: "AI Infrastructure",       count: 12 },
  { name: "Semiconductor Equipment", count: 8  },
  { name: "Networking",              count: 6  },
  { name: "Data Centres",            count: 9  },
  { name: "Power & Cooling",         count: 5  },
  { name: "UK Small Caps",           count: 14 },
  { name: "Governance",              count: 7  },
  { name: "Capital Allocation",      count: 10 },
];

const RESEARCH = [
  {
    ticker: "NVDA",
    company: "Nvidia",
    sector: "Semiconductors",
    title: "What Changed In Nvidia's Annual Report",
    debate: "The market is pricing in sustained hyperscaler capex growth. The filing reveals growing customer concentration risk and a dependency on TSMC that isn't fully reflected in consensus models.",
    tags: ["What Changed", "AI Infrastructure"],
    date: "Jun 2025",
  },
  {
    ticker: "ANET",
    company: "Arista Networks",
    sector: "Networking",
    title: "Why Networking May Be The Most Underappreciated AI Trade",
    debate: "Arista's positioning in AI back-end networking is structurally undervalued. The debate centres on whether Ethernet displaces InfiniBand — the annual report language shifted materially this year.",
    tags: ["Variant Perception", "Networking"],
    date: "May 2025",
  },
  {
    ticker: "ASML",
    company: "ASML",
    sector: "Semiconductor Equipment",
    title: "ASML And The Limits Of Semiconductor Scaling",
    debate: "High-NA EUV creates a compelling long-term moat but introduces new execution risk. Management's tone on China restrictions shifted notably — more defensive, less dismissive than prior year.",
    tags: ["Semiconductor Equipment", "Governance"],
    date: "Apr 2025",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white">

      {/* ── Nav ────────────────────────────────────────────────────────── */}
      <nav className="border-b border-white/[0.06] px-6">
        <div className="max-w-7xl mx-auto flex h-12 items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white flex items-center justify-center shrink-0">
                <span className="text-black font-bold text-[9px]">ARI</span>
              </div>
              <span className="text-[12px] font-semibold text-white/70">Annual Report Intelligence</span>
            </div>
            <div className="hidden md:flex items-center gap-5">
              <a href="#research"     className="text-[12px] text-white/35 hover:text-white/70 transition-colors">Research</a>
              <a href="#themes"      className="text-[12px] text-white/35 hover:text-white/70 transition-colors">Themes</a>
              <Link href="/research" className="text-[12px] text-white/35 hover:text-white/70 transition-colors">Portfolio</Link>
              <Link href="/about"    className="text-[12px] text-white/35 hover:text-white/70 transition-colors">About</Link>
            </div>
          </div>
          <Link href="/dashboard"
            className="flex items-center gap-1.5 border border-white/15 px-3 py-1.5 text-[11px] font-medium text-white/50 hover:border-white/30 hover:text-white/80 transition-colors">
            Research Platform
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="border-b border-white/[0.06] px-6 py-20 md:py-28">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-6 font-mono">
            Open Research Platform
          </p>
          <h1 className="text-[40px] md:text-[62px] font-bold leading-[1.03] tracking-tight text-white mb-6">
            AI-powered institutional<br />equity research.
          </h1>
          <p className="text-[15px] text-white/40 max-w-lg leading-relaxed mb-3">
            Annual report intelligence focused on AI infrastructure, semiconductors,
            and public markets analysis.
          </p>
          <p className="text-[13px] text-white/25 max-w-lg leading-relaxed mb-10">
            Combining AI-driven analysis with institutional investment frameworks —
            business quality, governance, management, capital allocation.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard"
              className="flex items-center gap-2 bg-white text-black px-5 py-2.5 text-[13px] font-semibold hover:bg-white/90 transition-colors">
              Explore Research
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="/dashboard"
              className="flex items-center gap-2 border border-white/15 px-5 py-2.5 text-[13px] text-white/50 hover:border-white/30 hover:text-white/80 transition-colors">
              Generate Analysis
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <div className="border-b border-white/[0.06] grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.06]">
        {[
          { label: "Annual Reports Analysed", value: "60+"  },
          { label: "Research Sections",       value: "16"   },
          { label: "Research Focus",          value: "AI · Semis"   },
          { label: "Framework",               value: "Buy-side" },
        ].map(({ label, value }) => (
          <div key={label} className="px-6 py-5">
            <p className="font-mono text-[20px] font-bold text-white/80">{value}</p>
            <p className="text-[10px] text-white/25 mt-1 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Research ───────────────────────────────────────────────────── */}
      <section id="research" className="border-b border-white/[0.06] px-6 py-14">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-2">Latest</p>
              <h2 className="text-[20px] font-bold text-white">Featured Research</h2>
            </div>
            <Link href="/dashboard" className="text-[12px] text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
              Research library <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.06]">
            {RESEARCH.map((r, i) => (
              <article key={i} className="group bg-[#080808] p-6 hover:bg-[#0d0d0d] transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-white/35">{r.ticker}</span>
                    <span className="text-white/15">·</span>
                    <span className="text-[10px] text-white/20">{r.sector}</span>
                  </div>
                  <span className="text-[10px] text-white/20 font-mono">{r.date}</span>
                </div>
                <h3 className="text-[14px] font-semibold text-white/75 group-hover:text-white leading-snug mb-3 transition-colors">
                  {r.title}
                </h3>
                <p className="text-[12px] text-white/30 leading-relaxed mb-5 line-clamp-3">
                  {r.debate}
                </p>
                <div className="flex flex-wrap gap-1.5 border-t border-white/[0.05] pt-4">
                  {r.tags.map(tag => (
                    <span key={tag} className="border border-white/10 px-2 py-0.5 text-[10px] text-white/25 font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Themes ─────────────────────────────────────────────────────── */}
      <section id="themes" className="border-b border-white/[0.06] px-6 py-14">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-2">Coverage</p>
            <h2 className="text-[20px] font-bold text-white">Research Themes</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06]">
            {THEMES.map((theme) => (
              <Link key={theme.name} href="/dashboard">
                <div className="group bg-[#080808] px-5 py-5 hover:bg-[#0d0d0d] transition-colors cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-1 h-1 bg-white/20 rounded-full mt-2 group-hover:bg-white/50 transition-colors" />
                    <ArrowUpRight className="h-3 w-3 text-white/10 group-hover:text-white/30 transition-colors" />
                  </div>
                  <h3 className="text-[13px] font-semibold text-white/60 group-hover:text-white/90 transition-colors mb-1.5">
                    {theme.name}
                  </h3>
                  <p className="text-[10px] text-white/20 font-mono">{theme.count} companies</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Framework ──────────────────────────────────────────────────── */}
      <section className="border-b border-white/[0.06] px-6 py-14">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-4">Research Philosophy</p>
            <h2 className="text-[20px] font-bold text-white mb-5">
              Sceptical.<br />Evidence-based.<br />Buy-side.
            </h2>
            <p className="text-[13px] text-white/35 leading-relaxed mb-4">
              ARI reads annual reports the way an experienced analyst does — looking for what
              changed, what management is obscuring, and where the market may be wrong.
            </p>
            <p className="text-[13px] text-white/25 leading-relaxed mb-6">
              Every conclusion is evidence-linked. The goal is one question: is this stock
              worth deeper work?
            </p>
            <Link href="/about" className="text-[12px] text-white/40 hover:text-white/70 transition-colors flex items-center gap-1">
              About ARI <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="border border-white/[0.06] divide-y divide-white/[0.06]">
            {[
              ["Business Quality",       "Pricing power, switching costs, competitive position"],
              ["Financial Quality",      "Cash conversion, margins, leverage, FCF quality"],
              ["Management Quality",     "Execution record, capital allocation, candour"],
              ["Governance",             "Board structure, remuneration alignment, disclosure"],
              ["What Changed",           "Year-on-year strategy, tone, risk and narrative delta"],
              ["Variant Perception",     "What the market may be missing or mispricing"],
            ].map(([label, desc]) => (
              <div key={label} className="flex gap-4 px-5 py-3.5">
                <div className="w-px bg-white/10 shrink-0" />
                <div>
                  <p className="text-[12px] font-semibold text-white/60">{label}</p>
                  <p className="text-[11px] text-white/25 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="px-6 py-20 border-b border-white/[0.06]">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-[26px] font-bold text-white mb-4">Start generating research.</h2>
          <p className="text-[13px] text-white/35 leading-relaxed mb-8">
            Paste an annual report URL or upload a PDF. ARI generates a full institutional
            research report — business quality, governance, management, bull case, bear case,
            red flags — in minutes.
          </p>
          <Link href="/dashboard"
            className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 text-[13px] font-semibold hover:bg-white/90 transition-colors">
            Open Research Platform
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white flex items-center justify-center">
                <span className="text-black font-bold text-[9px]">ARI</span>
              </div>
              <span className="text-[11px] text-white/25">Annual Report Intelligence</span>
            </div>
            <Link href="/about" className="text-[11px] text-white/20 hover:text-white/40 transition-colors">About</Link>
          </div>
          <p className="text-[11px] text-white/15">
            Not investment advice. For research and informational purposes only.
          </p>
        </div>
      </footer>

    </div>
  );
}
