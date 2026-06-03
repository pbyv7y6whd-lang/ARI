"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/dashboard");
    } else {
      setError("Incorrect password.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col">

      <div className="border-b border-white/[0.06] px-6">
        <div className="h-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 text-[12px] text-white/30 hover:text-white/60 transition-colors">
            <ArrowLeft className="h-3 w-3" />
            ARI Research
          </Link>
          <Link href="/dashboard" className="text-[12px] text-white/25 hover:text-white/50 transition-colors">
            Continue without signing in →
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">

          <div className="mb-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-5 h-5 bg-white flex items-center justify-center">
                <span className="text-black font-bold text-[9px]">ARI</span>
              </div>
              <span className="text-[12px] font-semibold text-white/50">Annual Report Intelligence</span>
            </div>
            <h1 className="text-[22px] font-bold text-white mb-2">Sign in</h1>
            <p className="text-[13px] text-white/30">
              Save your research and access additional features.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full bg-white/[0.04] border border-white/10 px-4 py-2.5 text-[13px] text-white placeholder-white/20 outline-none focus:border-white/25 transition-colors"
            />
            {error && <p className="text-[12px] text-red-400/80">{error}</p>}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full flex items-center justify-center gap-2 bg-white text-black py-2.5 text-[13px] font-semibold hover:bg-white/90 transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : <><span>Sign in</span> <ArrowRight className="h-3.5 w-3.5" /></>}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/[0.06]">
            <p className="text-[11px] text-white/20 leading-relaxed">
              The platform is openly accessible.{" "}
              <Link href="/dashboard" className="text-white/35 hover:text-white/60 transition-colors underline underline-offset-2">
                Continue without signing in
              </Link>{" "}
              to explore research and generate analysis.
            </p>
          </div>

        </div>
      </div>

      <div className="border-t border-white/[0.06] px-6 py-4">
        <p className="text-[11px] text-white/15 text-center">
          Not investment advice. For research and informational purposes only.
        </p>
      </div>
    </div>
  );
}
