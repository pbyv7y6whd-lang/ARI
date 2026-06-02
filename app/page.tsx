import Link from "next/link";
import { ArrowRight, BarChart3, Brain, FileSearch, Shield, TrendingUp, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#090909] text-white">
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white rounded-sm flex items-center justify-center">
              <span className="text-black font-bold text-xs">ARI</span>
            </div>
            <span className="font-semibold text-sm text-white/90">Annual Report Intelligence</span>
          </div>
          <Link href="/login" className="text-sm bg-white text-black px-4 py-1.5 rounded-md font-medium hover:bg-white/90 transition-colors">
            Sign in
          </Link>
        </div>
      </nav>

      <section className="px-6 pt-24 pb-20 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/60 mb-8">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Powered by Claude Sonnet · Built for institutional investors
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
          Annual reports.<br />
          <span className="bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
            Institutional research.
          </span>
        </h1>
        <p className="text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload any annual report PDF. Get a 16-section institutional research report — bull case, bear case, management quality, accounting red flags, variant perception — in minutes.
        </p>
        <Link href="/login" className="inline-flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-md font-semibold hover:bg-white/90 transition-colors text-lg">
          Start analysing
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      <footer className="border-t border-white/5 px-6 py-8 text-center text-xs text-white/20">
        Not investment advice. For professional research use only.
      </footer>
    </div>
  );
}
