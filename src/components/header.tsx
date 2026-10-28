"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  RefreshCw,
  ChevronRight,
  Building2,
  ExternalLink,
} from "lucide-react";
import { useCompliance } from "@/context/ComplianceContext";

const routeNames: Record<string, { title: string; category: string }> = {
  "/": { title: "Executive Dashboard", category: "Compliance & EoA" },
  "/ingest": { title: "Data Ingestion", category: "Schema Validation" },
  "/audit": { title: "Audit & Deficit Engine", category: "Remediation Core" },
  "/copilot": { title: "AI Compliance Copilot", category: "Regulatory Assistant" },
};

export default function Header() {
  const pathname = usePathname();
  const { institution, recalculateCompliance, lastAuditTimestamp } = useCompliance();
  const currentRoute = routeNames[pathname] || { title: "AICTE Copilot", category: "Audit Platform" };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/[0.08] bg-[#070a10]/80 px-6 backdrop-blur-xl">
      {/* Breadcrumb Trail */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
          <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_6px_#6366f1]" />
            AICTE Core
          </Link>
          <ChevronRight className="h-3 w-3 text-zinc-600" />
          <span className="text-zinc-500 font-mono text-[11px]">{currentRoute.category}</span>
          <ChevronRight className="h-3 w-3 text-zinc-600" />
          <span className="font-bold text-white tracking-tight">{currentRoute.title}</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Live Institution Indicator Badge */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] py-1 px-3.5 shadow-inner">
          <Building2 className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-xs font-semibold text-zinc-200">
            {institution.name.replace(" - Demo", "")}
          </span>
          <span className="text-zinc-600">•</span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            2026-27 APH Cycle
          </span>
        </div>

        {/* Quick Action Button: Run Audit */}
        <button
          onClick={() => recalculateCompliance()}
          className="group inline-flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent px-3.5 py-1.5 text-xs font-bold text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.15)] hover:border-indigo-500/60 hover:text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-200"
          title="Trigger instant AICTE rules evaluation"
        >
          <RefreshCw className="h-3.5 w-3.5 text-indigo-400 group-hover:rotate-180 transition-transform duration-500" />
          <span className="hidden sm:inline">Run Audit</span>
          <span
            suppressHydrationWarning
            className="rounded bg-black/40 border border-white/10 px-1.5 py-0.2 text-[10px] font-mono text-zinc-400 group-hover:text-white"
          >
            {lastAuditTimestamp || "Live"}
          </span>
        </button>

        {/* Official Portal External Link */}
        <a
          href="https://www.aicte-india.org"
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:bg-white/[0.08] hover:text-white transition"
          title="Visit Official AICTE Portal"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </header>
  );
}
