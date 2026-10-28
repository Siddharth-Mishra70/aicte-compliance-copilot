"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Users,
  Database,
  ArrowRight,
  TrendingUp,
  Building2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Sparkles,
  ArrowUpRight,
  Clock,
  Layers,
  Award,
  FileText,
} from "lucide-react";
import AuditReportModal from "@/components/AuditReportModal";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useCompliance } from "@/context/ComplianceContext";
import { cn } from "@/lib/utils";

/**
 * High-End Circular Progress Ring with Glowing Gradients
 */
function CircularScoreRing({ score }: { score: number }) {
  const radius = 42;
  const stroke = 6.5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const color =
    score >= 85
      ? { stroke: "#10b981", glow: "rgba(16, 185, 129, 0.4)", text: "text-emerald-400" }
      : score >= 60
      ? { stroke: "#f59e0b", glow: "rgba(245, 158, 11, 0.4)", text: "text-amber-400" }
      : { stroke: "#f43f5e", glow: "rgba(244, 63, 94, 0.4)", text: "text-rose-400" };

  return (
    <div className="relative flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="-rotate-90 transform">
        <circle
          stroke="rgba(255, 255, 255, 0.08)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color.stroke}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + " " + circumference}
          style={{
            strokeDashoffset,
            transition: "stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)",
            filter: `drop-shadow(0 0 6px ${color.glow})`,
          }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className={cn("text-2xl font-black tracking-tight", color.text)}>
          {score}%
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { institution, issues, stats } = useCompliance();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Active unresolved issues
  const activeIssues = issues.filter((iss) => !iss.isResolved);
  const topCriticalIssues = activeIssues
    .filter((iss) => iss.severity === "Critical")
    .slice(0, 3);

  // Cadre chart data
  const cadreData = [
    {
      cadre: "Professors",
      Actual: stats.cadreRatio.professors,
      Required: stats.cadreRatio.requiredProfessors,
    },
    {
      cadre: "Associate Prof",
      Actual: stats.cadreRatio.associates,
      Required: stats.cadreRatio.requiredAssociates,
    },
    {
      cadre: "Assistant Prof",
      Actual: stats.cadreRatio.assistants,
      Required: stats.cadreRatio.requiredAssistants,
    },
  ];

  // Issues Breakdown data
  const dqCount = activeIssues.filter((i) => i.category === "Data Quality").length;
  const normCount = activeIssues.filter((i) => i.category === "AICTE Norm Deficit").length;
  const resolvedCount = issues.filter((i) => i.isResolved).length;

  const issueDistribution = [
    { name: "Data Quality Deficits", value: dqCount, color: "#818cf8" },
    { name: "AICTE Norm Deficits", value: normCount, color: "#f43f5e" },
    { name: "Remediated Records", value: resolvedCount, color: "#34d399" },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-7">
      {/* Hero Ambient Status Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.09] bg-gradient-to-br from-indigo-950/40 via-zinc-900/60 to-black/80 p-7 shadow-2xl backdrop-blur-2xl">
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 text-white font-black text-xl shadow-[0_0_25px_rgba(99,102,241,0.5)] ring-1 ring-white/30">
              AI
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-black animate-pulse" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black tracking-tight text-white">
                  {institution.name}
                </h1>
                <span className="rounded-full bg-indigo-500/15 border border-indigo-400/30 px-3 py-0.5 text-xs font-mono font-bold text-indigo-300 shadow-inner">
                  ID: {institution.aictePermanentId}
                </span>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                  APH 2024-25 Verified
                </span>
              </div>
              <p className="mt-1.5 text-xs text-zinc-400 flex flex-wrap items-center gap-2 font-medium">
                <span>Academic Cycle: <strong className="text-zinc-200">{institution.academicYear}</strong></span>
                <span className="text-zinc-600">•</span>
                <span>Sanctioned Intake: <strong className="text-zinc-200">{institution.sanctionedIntake} Seats</strong></span>
                <span className="text-zinc-600">•</span>
                <span>Instructional Built-up: <strong className="text-zinc-200">{institution.builtUpAreaSqm.toLocaleString()} Sq.m</strong></span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.2)] hover:bg-emerald-500/20 hover:text-white transition"
            >
              <FileText className="h-4 w-4 text-emerald-400" />
              Generate EoA Report
            </button>
            <Link
              href="/ingest"
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-xs font-bold text-zinc-300 shadow-inner hover:bg-white/[0.08] hover:text-white transition"
            >
              <Database className="h-4 w-4 text-indigo-400" />
              Manage Ingestion
            </Link>
            <Link
              href="/audit"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4.5 py-2.5 text-xs font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:from-indigo-500 hover:to-violet-500 transition"
            >
              <ShieldAlert className="h-4 w-4" />
              Scrutiny Audit Engine ({activeIssues.length})
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Crisp KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: EoA Readiness Score */}
        <div className="dark-glass rounded-3xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
              EoA Readiness Score
            </span>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border",
                stats.eoaReadinessScore >= 85
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  : stats.eoaReadinessScore >= 60
                  ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                  : "bg-rose-500/15 text-rose-300 border-rose-500/30"
              )}
            >
              {stats.eoaReadinessScore >= 85 ? "Approved" : stats.eoaReadinessScore >= 60 ? "Conditional" : "Deficient"}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-3xl font-black tracking-tight text-white">
                {stats.eoaReadinessScore}%
              </p>
              <p className="mt-1 text-xs text-zinc-400 font-medium">
                {stats.criticalIssuesCount === 0 ? "Scrutiny cleared" : `${stats.criticalIssuesCount} blockers active`}
              </p>
            </div>
            <CircularScoreRing score={stats.eoaReadinessScore} />
          </div>

          <div className="mt-4 border-t border-white/[0.06] pt-2.5 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Audit Standard:</span>
            <span className="font-bold text-zinc-200">AICTE APH 2024-25</span>
          </div>
        </div>

        {/* KPI 2: Faculty-Student Ratio */}
        <div className="dark-glass rounded-3xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
              Faculty-Student Ratio
            </span>
            <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-400 border border-indigo-500/20">
              <Users className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  "text-3xl font-black tracking-tight",
                  stats.facultyStudentRatio <= 20 ? "text-emerald-400" : "text-amber-400"
                )}
              >
                1:{stats.facultyStudentRatio}
              </span>
              <span className="text-xs font-mono font-bold text-zinc-400">Norm: 1:20</span>
            </div>
            <p className="mt-1 text-xs text-zinc-400 font-medium">
              {stats.totalRegularFaculty} regular / {stats.requiredFaculty} mandated teachers
            </p>
          </div>

          <div className="mt-4 border-t border-white/[0.06] pt-2.5 flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">Headcount Shortfall:</span>
            {stats.totalRegularFaculty < stats.requiredFaculty ? (
              <span className="font-extrabold text-rose-400">
                -{stats.requiredFaculty - stats.totalRegularFaculty} faculty gap
              </span>
            ) : (
              <span className="font-bold text-emerald-400">1:20 Ratio Satisfied</span>
            )}
          </div>
        </div>

        {/* KPI 3: Data Quality Health */}
        <div className="dark-glass rounded-3xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
              Data Quality Health
            </span>
            <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-400 border border-indigo-500/20">
              <Database className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-white">
                {stats.cleanDataPercentage}%
              </span>
              <span className="text-xs font-semibold text-zinc-400">clean rows</span>
            </div>
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-700"
                style={{ width: `${stats.cleanDataPercentage}%` }}
              />
            </div>
          </div>

          <div className="mt-4 border-t border-white/[0.06] pt-2.5 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Identity Check:</span>
            <span className="font-bold text-zinc-200">PAN & AICTE ID Verification</span>
          </div>
        </div>

        {/* KPI 4: Active Critical Deficits */}
        <div className="dark-glass rounded-3xl p-5 relative overflow-hidden group border-rose-500/20 bg-rose-500/[0.03]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest text-rose-300 uppercase">
              Active Critical Deficits
            </span>
            <div className="rounded-xl bg-rose-500/10 p-2 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-rose-400">
                {stats.criticalIssuesCount}
              </span>
              <span className="text-xs font-semibold text-rose-300/80">
                +{stats.warningIssuesCount} warnings
              </span>
            </div>
            <p className="mt-1 text-xs text-rose-300 font-medium flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping" />
              Scrutiny sanction risk
            </p>
          </div>

          <div className="mt-4 border-t border-white/[0.06] pt-2.5 flex items-center justify-between text-[11px] text-rose-300">
            <span>Inspection Status:</span>
            <span className="font-bold">Chapter VII Action</span>
          </div>
        </div>
      </div>

      {/* Recharts Visualizations Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Cadre BarChart (7 cols) */}
        <div className="lg:col-span-7 dark-glass rounded-3xl p-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/[0.06] pb-4">
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white">
                AICTE 1:2:6 Cadre Norm vs Actual Faculty
              </h2>
              <p className="text-xs text-zinc-400">
                Mandate: 1 Professor : 2 Associate Professors : 6 Assistant Professors
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-zinc-300">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 shadow-[0_0_6px_#6366f1]" />
                Actual
              </span>
              <span className="flex items-center gap-1.5 font-medium text-zinc-400">
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
                Required
              </span>
            </div>
          </div>

          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cadreData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="cadre"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  contentStyle={{
                    backgroundColor: "#0d111c",
                    borderRadius: "14px",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#f8fafc",
                    fontSize: "12px",
                    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.6)",
                  }}
                />
                <Bar dataKey="Actual" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={34} />
                <Bar dataKey="Required" fill="#334155" radius={[6, 6, 0, 0]} barSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] p-3 text-xs text-zinc-300 flex flex-wrap items-center justify-between gap-2">
            <span>Professors: <strong className="text-white">{stats.cadreRatio.professors}</strong> / {stats.cadreRatio.requiredProfessors} req</span>
            <span>Associate Prof: <strong className="text-white">{stats.cadreRatio.associates}</strong> / {stats.cadreRatio.requiredAssociates} req</span>
            <span>Assistant Prof: <strong className="text-white">{stats.cadreRatio.assistants}</strong> / {stats.cadreRatio.requiredAssistants} req</span>
          </div>
        </div>

        {/* Issues Donut Chart (5 cols) */}
        <div className="lg:col-span-5 dark-glass rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
          <div className="border-b border-white/[0.06] pb-4">
            <h2 className="text-sm font-bold tracking-tight text-white">
              Audit Findings Distribution
            </h2>
            <p className="text-xs text-zinc-400">
              Categorization across Regulatory Checks & Remediation
            </p>
          </div>

          <div className="h-64 my-auto">
            {issueDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={issueDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {issueDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        style={{ filter: `drop-shadow(0 0 6px ${entry.color}40)` }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0d111c",
                      borderRadius: "14px",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: "#f8fafc",
                      fontSize: "12px",
                      boxShadow: "0 20px 25px -5px rgba(0,0,0,0.6)",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: "11px", paddingTop: "10px", color: "#94a3b8" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                <p className="mt-2 text-sm font-bold text-white">Zero Active Deficits</p>
                <p className="text-xs text-zinc-400">All statutory audit criteria satisfied</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 text-xs text-zinc-300 flex items-center justify-between">
            <span>Total Active Issues: <strong className="text-white">{activeIssues.length}</strong></span>
            <span>Remediated: <strong className="text-emerald-400">{resolvedCount}</strong></span>
          </div>
        </div>
      </div>

      {/* Top Priority Action Items */}
      <div className="dark-glass rounded-3xl overflow-hidden shadow-2xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] bg-white/[0.02] p-5.5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
              <h2 className="text-sm font-bold text-white">
                Top Priority Action Items (Extension of Approval Blockers)
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              AICTE Scrutiny Committee issues official Deficiencies for these critical findings
            </p>
          </div>

          <Link
            href="/audit"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:from-indigo-500 hover:to-violet-500 transition"
          >
            <span>Open Audit & Remediation</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="divide-y divide-white/[0.05]">
          {topCriticalIssues.length > 0 ? (
            topCriticalIssues.map((issue) => (
              <div
                key={issue.id}
                className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-5.5 hover:bg-white/[0.02] transition-colors"
              >
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 text-[10px] font-black text-rose-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                      Critical Deficit
                    </span>
                    <span className="rounded-md bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 text-[11px] font-semibold text-zinc-300">
                      {issue.category}
                    </span>
                    <span className="text-xs font-bold text-zinc-200">
                      {issue.recordReference}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-white leading-snug">
                    {issue.description}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <span className="font-bold text-indigo-400">Norm Cited:</span>
                    <span>{issue.aicteNormReference}</span>
                  </div>

                  <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-3 text-xs text-indigo-200">
                    <strong className="text-white">Suggested Remediation:</strong> {issue.suggestedFix}
                  </div>
                </div>

                <Link
                  href="/audit"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 py-2 text-xs font-bold text-zinc-300 shadow-inner hover:border-indigo-400/50 hover:text-white transition"
                >
                  <span>Remediate</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))
          ) : (
            <div className="py-14 text-center">
              <CheckCircle2 className="mx-auto h-11 w-11 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]" />
              <p className="mt-3 text-sm font-bold text-white">
                All Critical Deficits Remediated
              </p>
              <p className="text-xs text-zinc-400">
                Your institution satisfies all primary AICTE Extension of Approval statutory thresholds.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mandatory Disclosure & PDF Audit Report Modal */}
      <AuditReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}
