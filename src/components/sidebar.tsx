"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  ShieldAlert,
  Bot,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Command,
  Lock,
} from "lucide-react";
import { useCompliance } from "@/context/ComplianceContext";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    badgeKey: null,
  },
  {
    label: "Data Ingestion",
    href: "/ingest",
    icon: Upload,
    badgeKey: null,
  },
  {
    label: "Audit Engine",
    href: "/audit",
    icon: ShieldAlert,
    badgeKey: "issues",
  },
  {
    label: "AI Copilot",
    href: "/copilot",
    icon: Bot,
    badgeKey: "ai",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { stats, issues } = useCompliance();

  const activeIssuesCount = issues.filter((i) => !i.isResolved).length;

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-white/[0.08] bg-[#070a10]/95 backdrop-blur-2xl transition-all duration-300 z-40 shadow-2xl",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-white/[0.08] px-4">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white font-black text-sm shadow-[0_0_16px_rgba(99,102,241,0.4)] ring-1 ring-white/30">
            AC
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#070a10]" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-white">
                  AICTE Copilot
                </span>
                <span className="rounded bg-indigo-500/20 border border-indigo-500/40 px-1 py-0.2 text-[9px] font-mono font-bold text-indigo-300">
                  PRO
                </span>
              </div>
              <p className="truncate text-[10px] text-zinc-400 font-medium">
                Autonomous Compliance Core
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1.5 p-3">
        {!collapsed && (
          <div className="flex items-center justify-between px-3 pt-2 pb-1 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
            <span>Navigation</span>
            <Command className="h-2.5 w-2.5 text-zinc-600" />
          </div>
        )}
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-indigo-500/20 via-indigo-500/10 to-transparent text-white border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                  : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200"
              )}
              title={collapsed ? item.label : undefined}
            >
              {/* Left active glow bar */}
              {isActive && (
                <span className="absolute -left-1 top-2 bottom-2 w-1.5 rounded-r-md bg-gradient-to-b from-indigo-400 to-violet-500 shadow-[0_0_8px_#818cf8]" />
              )}

              <item.icon
                className={cn(
                  "h-4.5 w-4.5 shrink-0 transition-transform duration-200 group-hover:scale-105",
                  isActive
                    ? "text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.6)]"
                    : "text-zinc-500 group-hover:text-zinc-300"
                )}
              />

              {!collapsed && (
                <div className="flex flex-1 items-center justify-between">
                  <span className={cn(isActive && "font-bold tracking-tight text-white")}>
                    {item.label}
                  </span>
                  {item.badgeKey === "issues" && activeIssuesCount > 0 && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.2 text-[10px] font-black tracking-wide",
                        isActive
                          ? "bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      )}
                    >
                      {activeIssuesCount}
                    </span>
                  )}
                  {item.badgeKey === "ai" && (
                    <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-500/30 to-violet-500/30 border border-indigo-500/40 px-2 py-0.2 text-[9px] font-bold text-indigo-300">
                      <Sparkles className="h-2.5 w-2.5 text-indigo-400 animate-pulse" />
                      RAG
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Pill at Bottom */}
      <div className="border-t border-white/[0.08] p-3 space-y-2">
        {!collapsed ? (
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5 backdrop-blur-md">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-slate-700 to-slate-900 border border-white/20 text-white font-bold text-xs">
              SK
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-[#070a10] bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-white">Dr. S. K. Raman</p>
              <p className="truncate text-[10px] text-zinc-400 font-mono">
                Principal & Nodal Officer
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-slate-700 to-slate-900 border border-white/20 text-white font-bold text-xs">
              SK
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-[#070a10] bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg py-1 text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-300 transition"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
