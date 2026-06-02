"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LayoutGrid, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#090909] flex">
      <aside className="w-52 border-r border-white/5 flex flex-col py-6 px-4 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 mb-8 px-2">
          <div className="w-7 h-7 bg-white rounded-sm flex items-center justify-center shrink-0">
            <span className="text-black font-bold text-xs">ARI</span>
          </div>
          <span className="font-semibold text-sm text-white/80">ARI Research</span>
        </Link>

        <nav className="flex-1 space-y-0.5">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-2.5 px-2 py-2 rounded-md text-sm transition-all",
              pathname === "/dashboard"
                ? "bg-white/8 text-white"
                : "text-white/45 hover:text-white hover:bg-white/5"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
            Stock universe
          </Link>
        </nav>

        <button
          onClick={logout}
          className="flex items-center gap-2.5 px-2 py-2 rounded-md text-sm text-white/25 hover:text-white/60 hover:bg-white/5 transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
