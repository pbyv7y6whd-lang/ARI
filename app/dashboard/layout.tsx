"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Building2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  {
    section: "Research",
    items: [
      { href: "/dashboard/sovereign", icon: Globe,     label: "Sovereign Tracker" },
      { href: "/dashboard/corporate", icon: Building2, label: "Corporate Tracker" },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#fafaf8] flex">

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="w-[200px] border-r border-[#e0d8ee] flex flex-col shrink-0 bg-[#f4f0f8]">

        {/* Logo */}
        <div className="border-b border-[#e0d8ee] px-4 py-0 h-12 flex items-center gap-2">
          <div className="w-5 h-5 bg-[#5b21b6] flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-[9px] tracking-tight">EMI</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#1a0a2e]/80 leading-none">EMI</p>
            <p className="text-[9px] text-[#9a7cc0] mt-0.5 font-mono uppercase tracking-wider">EM Intelligence</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {NAV.map(({ section, items }) => (
            <div key={section}>
              <p className="px-2 mb-1 text-[9px] font-semibold uppercase tracking-widest text-[#b09dcc]">
                {section}
              </p>
              <div className="space-y-px">
                {items.map(({ href, icon: Icon, label }) => {
                  const active = pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Link key={href} href={href}
                      className={cn(
                        "flex items-center gap-2.5 px-2 py-2 text-[12px] transition-all rounded-sm",
                        active
                          ? "bg-[#5b21b6]/10 text-[#5b21b6]"
                          : "text-[#7a5aaa] hover:text-[#2d1654] hover:bg-[#5b21b6]/[0.06]"
                      )}
                      style={active ? { borderLeft: "2px solid #5b21b6", paddingLeft: "6px" } : {}}>
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
        <div className="border-t border-[#e0d8ee] px-2 py-2 space-y-px">
          <Link href="/" target="_blank"
            className="flex items-center gap-2.5 px-2 py-2 text-[12px] text-[#9a7cc0] hover:text-[#4a2980] transition-all rounded-sm">
            <Globe className="w-3.5 h-3.5" />
            Public Site
          </Link>
          <Link href="/dashboard/settings"
            className={cn(
              "flex items-center gap-2.5 px-2 py-2 text-[12px] transition-all rounded-sm",
              pathname === "/dashboard/settings"
                ? "bg-[#5b21b6]/10 text-[#5b21b6]"
                : "text-[#9a7cc0] hover:text-[#4a2980] hover:bg-[#5b21b6]/[0.06]"
            )}>
            <Settings className="w-3.5 h-3.5" />
            Settings
          </Link>
        </div>

      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto min-w-0">{children}</main>

    </div>
  );
}
