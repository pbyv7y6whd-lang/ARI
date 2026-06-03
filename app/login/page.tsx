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

      {/* Nav */}
      <div className="border-b border-white/[0.06] px-6 py-0">
        <div className="h-12 flex items-center">
          <Link href="/" className="flex items-center gap-1.5 text-[12px] text-white/30 hover:text-white/60 transition-colors">
            <ArrowLeft className="h-3 w-3" />
            Back
          </Link>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 bg-white flex items-center justify-center">
                <span className="text-black font-bold text-[10px]">ARI</span>
              </div>
              <span className="text-[13px] font-semibold text-white/60">Annual Report Intelligence</span>
            </div>
            <h1 className="text-[22px] font-bold text-white mb-1.5">Private Beta Access</h1>
            <p className="text-[13px] text-white/35">
              Institutional access only. Enter your password to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Access password"
              autoFocus
              className="w-full bg-white/[0.04] border border-white/10 px-4 py-2.5 text-[13px] text-white placeholder-white/20 outline-none focus:border-white/25 transition-colors"
            />
            {error && (
              <p className="text-[12px] text-red-400/80">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full flex items-center justify-center gap-2 bg-white text-black py-2.5 text-[13px] font-semibold hover:bg-white/90 transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : (
                <>Access Research Platform <ArrowRight className="h-3.5 w-3.5" /></>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-white/[0.06] pt-6">
            <p className="text-[11px] text-white/20 leading-relaxed">
              Don't have access?{" "}
              <Link href="/#access" className="text-white/40 hover:text-white/70 transition-colors underline underline-offset-2">
                Request private beta access
              </Link>
            </p>
          </div>

        </div>
      </div>

      <div className="px-6 py-5 border-t border-white/[0.06]">
        <p className="text-[11px] text-white/15 text-center">
          Not investment advice. For professional research use only.
        </p>
      </div>
    </div>
  );
}
