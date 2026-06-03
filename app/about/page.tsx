import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white">

      {/* Nav */}
      <nav className="border-b border-white/[0.06] px-6">
        <div className="max-w-7xl mx-auto flex h-12 items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 text-[12px] text-white/30 hover:text-white/60 transition-colors">
            <ArrowLeft className="h-3 w-3" />
            ARI Research
          </Link>
          <Link href="/dashboard"
            className="flex items-center gap-1.5 border border-white/15 px-3 py-1.5 text-[11px] font-medium text-white/40 hover:border-white/25 hover:text-white/70 transition-colors">
            Research Platform
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="px-6 py-16 md:py-24">
        <div className="max-w-2xl mx-auto">

          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-6 font-mono">
            About
          </p>

          <h1 className="text-[32px] md:text-[42px] font-bold text-white leading-tight mb-10">
            ARI Research
          </h1>

          <div className="space-y-5 text-[14px] text-white/45 leading-relaxed">
            <p>
              ARI is an AI-powered institutional equity research platform focused on annual
              report intelligence, business quality analysis, governance, and long-term
              equity research.
            </p>
            <p>
              The platform combines AI-driven analysis with institutional investment
              frameworks — designed to help investors focus on what changed, what matters,
              and where risks are emerging.
            </p>
          </div>

          <div className="my-10 border-t border-white/[0.06]" />

          {/* Focus areas */}
          <div className="mb-10">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-4">
              Research Focus
            </p>
            <div className="grid grid-cols-2 gap-px bg-white/[0.06]">
              {[
                "AI Infrastructure",
                "Semiconductor Equipment",
                "Public Market Intelligence",
                "UK Small Caps & AIM",
                "Governance Analysis",
                "Capital Allocation",
              ].map(area => (
                <div key={area} className="bg-[#080808] px-4 py-3">
                  <span className="text-[12px] text-white/50">{area}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Framework */}
          <div className="mb-10">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-4">
              Research Framework
            </p>
            <div className="space-y-px border border-white/[0.06] divide-y divide-white/[0.06]">
              {[
                ["Business Quality",    "Pricing power, switching costs, competitive position, scalability"],
                ["Financial Quality",   "Cash conversion, margin quality, leverage discipline, FCF generation"],
                ["Management Quality",  "Execution track record, capital allocation, candour in disclosure"],
                ["Governance",          "Board independence, remuneration alignment, disclosure quality"],
                ["What Changed",        "Year-on-year strategy, tone, risk, and capital allocation delta"],
                ["Variant Perception",  "What the market may be missing or mispricing in the filing"],
              ].map(([label, desc]) => (
                <div key={label} className="flex gap-4 px-4 py-3.5">
                  <div className="w-px bg-white/10 shrink-0" />
                  <div>
                    <p className="text-[12px] font-semibold text-white/55">{label}</p>
                    <p className="text-[11px] text-white/25 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/[0.06] my-10" />

          {/* Creator */}
          <div className="mb-10">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-4">
              Creator
            </p>
            <div className="space-y-4 text-[13px] text-white/40 leading-relaxed">
              <p>
                ARI was created by Suleiman Ashraf, an MSc Finance student at the London
                School of Economics with prior experience in UK public markets and
                governance research.
              </p>
              <p>
                The platform is designed as an evolving research and analytical framework —
                not a traditional financial media platform or retail investing product.
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-4">
            <a
              href="https://www.linkedin.com/in/suleiman-ashraf/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[12px] text-white/30 hover:text-white/60 transition-colors border border-white/10 px-3 py-2 hover:border-white/20"
            >
              LinkedIn
              <ArrowUpRight className="h-3 w-3" />
            </a>
            <a
              href="https://x.com/suleimanashraf_"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[12px] text-white/30 hover:text-white/60 transition-colors border border-white/10 px-3 py-2 hover:border-white/20"
            >
              X / Twitter
              <ArrowUpRight className="h-3 w-3" />
            </a>
            <a
              href="mailto:suleimanashraf@outlook.com"
              className="flex items-center gap-1.5 text-[12px] text-white/30 hover:text-white/60 transition-colors border border-white/10 px-3 py-2 hover:border-white/20"
            >
              Contact
            </a>
          </div>

          <div className="border-t border-white/[0.06] mt-12 pt-6">
            <p className="text-[11px] text-white/15">
              Not investment advice. For research and informational purposes only.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
