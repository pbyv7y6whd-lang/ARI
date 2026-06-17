"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutGrid, LogOut, TrendingUp, BookMarked,
  ShieldCheck, Clock, AlertTriangle, Settings,
  Layers, Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  {
    section: "Research",
    items: [
      { href: "/dashboard",             icon: LayoutGrid,   label: "Stock Universe" },
      { href: "/dashboard/themes",      icon: Layers,       label: "Themes" },
      { href: "/dashboard/watchlists",  icon: BookMarked,   label: "Watchlists" },
    ],
  },
  {
    section: "Intelligence",
    items: [
      { href: "/dashboard/governance",  icon: ShieldCheck,  label: "Governance Rankings" },
      { href: "/dashboard/risk",        icon: AlertTriangle,label: "Risk Monitor" },
      { href: "/dashboard/recent",      icon: Clock,        label: "Recent Research" },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="w-[200px] border-r border-[#161616] flex flex-col shrink-0 bg-[#080808]">

        {/* Logo */}
        <div className="border-b border-[#161616] px-4 py-0 h-12 flex items-center gap-2">
          <div className="w-5 h-5 bg-white flex items-center justify-center shrink-0">
            <span className="text-black font-bold text-[9px] tracking-tight">EMI</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-white/80 leading-none">EMI Research</p>
            <p className="text-[9px] text-white/25 mt-0.5 font-mono uppercase tracking-wider">Research Platform</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {NAV.map(({ section, items }) => (
            <div key={section}>
              <p className="px-2 mb-1 text-[9px] font-semibold uppercase tracking-widest text-white/20">
                {section}
              </p>
              <div className="space-y-px">
                {items.map(({ href, icon: Icon, label }) => {
                  const active = pathname === href;
                  return (
                    <Link key={href} href={href}
                      className={cn(
                        "flex items-center gap-2.5 px-2 py-2 text-[12px] transition-all rounded-sm",
                        active
                          ? "bg-white/[0.07] text-white"
                          : "text-white/35 hover:text-white/70 hover:bg-white/[0.04]"
                      )}>
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-[#161616] px-2 py-2 space-y-px">
          <Link href="/" target="_blank"
            className="flex items-center gap-2.5 px-2 py-2 text-[12px] text-white/25 hover:text-white/50 transition-all rounded-sm">
            <Globe className="w-3.5 h-3.5" />
            Public Site
          </Link>
          <Link href="/dashboard/settings"
            className={cn(
              "flex items-center gap-2.5 px-2 py-2 text-[12px] transition-all rounded-sm",
              pathname === "/dashboard/settings"
                ? "bg-white/[0.07] text-white"
                : "text-white/25 hover:text-white/50 hover:bg-white/[0.04]"
            )}>
            <Settings className="w-3.5 h-3.5" />
            Settings
          </Link>
          <button onClick={logout}
            className="w-full flex items-center gap-2.5 px-2 py-2 text-[12px] text-white/20 hover:text-white/50 transition-all rounded-sm">
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>

      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto min-w-0">{children}</main>

    </div>
  );
}
