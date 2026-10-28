"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  AlertTriangle,
  XCircle,
  Search,
  CheckCircle2,
  Save,
  Check,
  X,
  Copy,
  ChevronRight,
  FileText,
  RotateCcw,
  Building2,
  Users,
  Wrench,
  Sparkles,
  ArrowRight,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { useCompliance } from "@/context/ComplianceContext";
import {
  ComplianceIssue,
  FacultyRecord,
  InfrastructureRecord,
  FacultyDesignation,
  HighestDegree,
  RoomType,
} from "@/types/compliance";
import { PAN_REGEX } from "@/lib/validators/aicteRules";
import { cn } from "@/lib/utils";
import AuditReportModal from "@/components/AuditReportModal";

type FilterTab = "all" | "critical" | "data_quality" | "norm_deficits" | "resolved";

export default function AuditPage() {
  const {
    institution,
    faculty,
    infrastructure,
    issues,
    stats,
    updateFaculty,
    updateInfrastructure,
    resolveIssue,
    loadDemoData,
  } = useCompliance();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Search & Filter state
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Slide-over Drawer state
  const [selectedIssue, setSelectedIssue] = useState<ComplianceIssue | null>(null);

  // Remediation local draft state
  const [facultyDraft, setFacultyDraft] = useState<Partial<FacultyRecord> | null>(null);
  const [infraDraft, setInfraDraft] = useState<Partial<InfrastructureRecord> | null>(null);
  const [undertakingCopied, setUndertakingCopied] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Associated records for the selected issue
  const associatedFaculty = useMemo(() => {
    if (!selectedIssue) return null;
    const issId = selectedIssue.id;

    if (issId.includes("dq-pan-missing-")) return faculty.find((f) => issId.endsWith(f.id));
    if (issId.includes("dq-pan-format-")) return faculty.find((f) => issId.endsWith(f.id));
    if (issId.includes("dq-aicte-id-missing-")) return faculty.find((f) => issId.endsWith(f.id));
    if (issId.includes("norm-phd-")) return faculty.find((f) => issId.endsWith(f.id));
    if (issId.startsWith("dq-dup-pan-")) {
      const pan = issId.replace("dq-dup-pan-", "").toUpperCase();
      return faculty.find((f) => f.panNumber.toUpperCase() === pan);
    }
    if (issId.startsWith("dq-dup-aicte-")) {
      const id = issId.replace("dq-dup-aicte-", "");
      return faculty.find((f) => f.aicteFacultyId === id);
    }
    return faculty.find(
      (f) =>
        selectedIssue.recordReference.includes(f.fullName) ||
        selectedIssue.description.includes(f.fullName)
    );
  }, [selectedIssue, faculty]);

  const associatedInfra = useMemo(() => {
    if (!selectedIssue) return null;
    const issId = selectedIssue.id;
    if (issId.startsWith("norm-infra-area-")) {
      const id = issId.replace("norm-infra-area-", "");
      return infrastructure.find((r) => r.id === id);
    }
    return infrastructure.find(
      (r) =>
        selectedIssue.recordReference.includes(r.roomNumber) ||
        selectedIssue.description.includes(r.roomNumber)
    );
  }, [selectedIssue, infrastructure]);

  // Open drawer and initialize draft
  const handleOpenRemediation = (issue: ComplianceIssue) => {
    setSelectedIssue(issue);
    setSaveSuccessMsg(null);
    setUndertakingCopied(false);

    const fac = faculty.find(
      (f) =>
        issue.id.endsWith(f.id) ||
        issue.recordReference.includes(f.fullName) ||
        issue.description.includes(f.fullName)
    );
    if (fac) {
      setFacultyDraft({ ...fac });
    } else {
      setFacultyDraft(null);
    }

    const inf = infrastructure.find(
      (r) =>
        issue.id.endsWith(r.id) ||
        issue.recordReference.includes(r.roomNumber) ||
        issue.description.includes(r.roomNumber)
    );
    if (inf) {
      setInfraDraft({ ...inf });
    } else {
      setInfraDraft(null);
    }
  };

  // Save Faculty edits inline
  const handleSaveFacultyRemediation = () => {
    if (!associatedFaculty || !facultyDraft) return;

    updateFaculty(associatedFaculty.id, facultyDraft);
    setSaveSuccessMsg("Faculty record successfully updated in Compliance State!");

    if (selectedIssue && !selectedIssue.isResolved) {
      resolveIssue(selectedIssue.id);
    }

    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 3000);
  };

  // Save Infrastructure edits inline
  const handleSaveInfraRemediation = () => {
    if (!associatedInfra || !infraDraft) return;

    updateInfrastructure(associatedInfra.id, infraDraft);
    setSaveSuccessMsg("Room carpet area updated. AICTE norm deficit resolved!");

    if (selectedIssue && !selectedIssue.isResolved) {
      resolveIssue(selectedIssue.id);
    }

    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 3000);
  };

  // Copy formal Undertaking Note to clipboard
  const handleCopyUndertaking = () => {
    if (!selectedIssue) return;
    const text =
      `AICTE EXTENSION OF APPROVAL (EoA) COMPLIANCE UNDERTAKING\n` +
      `Academic Year: ${institution.academicYear}\n` +
      `Institution: ${institution.name} (AICTE ID: ${institution.aictePermanentId})\n\n` +
      `Subject: Remediation Undertaking for Finding '${selectedIssue.recordReference}'\n` +
      `Reference AICTE Regulation: ${selectedIssue.aicteNormReference}\n\n` +
      `We hereby solemnly affirm that the deficit regarding "${selectedIssue.description}" has been formally tabled before the Governing Body.\n` +
      `Action Plan: ${selectedIssue.suggestedFix}\n` +
      `The institution undertakes to complete compliance within 30 days and submit the certified compliance report on the AICTE Portal.\n\n` +
      `Authorized Signatory,\n` +
      `Principal / Director, ${institution.name}`;

    navigator.clipboard.writeText(text);
    setUndertakingCopied(true);
    setTimeout(() => setUndertakingCopied(false), 2500);
  };

  // Filter issues
  const filteredIssues = useMemo(() => {
    return issues.filter((iss) => {
      if (activeTab === "critical" && iss.severity !== "Critical") return false;
      if (activeTab === "data_quality" && iss.category !== "Data Quality") return false;
      if (activeTab === "norm_deficits" && iss.category !== "AICTE Norm Deficit") return false;
      if (activeTab === "resolved" && !iss.isResolved) return false;
      if (activeTab !== "resolved" && iss.isResolved && activeTab !== "all") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          iss.description.toLowerCase().includes(q) ||
          iss.recordReference.toLowerCase().includes(q) ||
          iss.aicteNormReference.toLowerCase().includes(q) ||
          iss.suggestedFix.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [issues, activeTab, searchQuery]);

  // Tab counts
  const criticalCount = issues.filter((i) => i.severity === "Critical" && !i.isResolved).length;
  const dqCount = issues.filter((i) => i.category === "Data Quality" && !i.isResolved).length;
  const normCount = issues.filter((i) => i.category === "AICTE Norm Deficit" && !i.isResolved).length;
  const resolvedCount = issues.filter((i) => i.isResolved).length;

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-white">
              Data Quality & Deficit Engine
            </h1>
            <span className="rounded-full bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 text-xs font-bold text-rose-300">
              {stats.criticalIssuesCount} Blockers Active
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Real-time Scrutiny & Expert Visit Committee (EVC) findings with interactive inline remediation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:bg-emerald-500/20 hover:text-white transition"
          >
            <FileText className="h-3.5 w-3.5 text-emerald-400" />
            <span>Generate EoA Report</span>
          </button>
          <button
            onClick={loadDemoData}
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-xs font-bold text-zinc-300 shadow-inner hover:bg-white/[0.08] hover:text-white transition"
          >
            <RotateCcw className="h-3.5 w-3.5 text-zinc-400" />
            Reset Demo Data
          </button>
          <Link
            href="/ingest"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:from-indigo-500 hover:to-violet-500 transition"
          >
            <span>Upload New CSV</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Pills Bar */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-white/[0.08] bg-[#0c101d]/90 p-1.5 shadow-xl backdrop-blur-xl">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200",
              activeTab === "all"
                ? "bg-gradient-to-r from-indigo-500/25 to-violet-500/25 text-white border border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
            )}
          >
            All Findings ({issues.length})
          </button>

          <button
            onClick={() => setActiveTab("critical")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200",
              activeTab === "critical"
                ? "bg-rose-500/20 text-rose-200 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]"
                : "text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
            Critical Blockers ({criticalCount})
          </button>

          <button
            onClick={() => setActiveTab("data_quality")}
            className={cn(
              "rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200",
              activeTab === "data_quality"
                ? "bg-gradient-to-r from-indigo-500/25 to-violet-500/25 text-white border border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
            )}
          >
            Data Quality ({dqCount})
          </button>

          <button
            onClick={() => setActiveTab("norm_deficits")}
            className={cn(
              "rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200",
              activeTab === "norm_deficits"
                ? "bg-gradient-to-r from-indigo-500/25 to-violet-500/25 text-white border border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
            )}
          >
            AICTE Norm Deficits ({normCount})
          </button>

          <button
            onClick={() => setActiveTab("resolved")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200",
              activeTab === "resolved"
                ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Remediated ({resolvedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search issues, norms, names..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-80 rounded-2xl border border-white/[0.09] bg-white/[0.04] py-2 pl-10 pr-4 text-xs text-white placeholder-zinc-500 shadow-inner backdrop-blur-md focus:border-indigo-500/60 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition"
          />
        </div>
      </div>

      {/* Enterprise Audit Table with Sticky Header & Zebra Striping */}
      <div className="dark-glass rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto max-h-[620px]">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-[#0a0f1d]/95 backdrop-blur-xl border-b border-white/[0.08] text-zinc-400 font-bold z-10">
              <tr>
                <th className="py-4 px-5">Severity</th>
                <th className="py-4 px-5">Category</th>
                <th className="py-4 px-5">Entity / Reference</th>
                <th className="py-4 px-5">Problem Description</th>
                <th className="py-4 px-5">AICTE APH Norm Cited</th>
                <th className="py-4 px-5 text-center">Status</th>
                <th className="py-4 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredIssues.map((issue, index) => (
                <tr
                  key={issue.id}
                  onClick={() => handleOpenRemediation(issue)}
                  className={cn(
                    "cursor-pointer transition-colors duration-150",
                    index % 2 === 1 ? "bg-white/[0.015]" : "bg-transparent",
                    issue.isResolved
                      ? "opacity-50 hover:opacity-100 hover:bg-white/[0.03]"
                      : issue.severity === "Critical"
                      ? "hover:bg-rose-500/[0.07]"
                      : "hover:bg-indigo-500/[0.05]"
                  )}
                >
                  <td className="py-4 px-5 whitespace-nowrap">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-wide border",
                        issue.severity === "Critical"
                          ? "bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.2)]"
                          : issue.severity === "Warning"
                          ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          : "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          issue.severity === "Critical"
                            ? "bg-rose-400 animate-pulse"
                            : issue.severity === "Warning"
                            ? "bg-amber-400"
                            : "bg-indigo-400"
                        )}
                      />
                      {issue.severity}
                    </span>
                  </td>

                  <td className="py-4 px-5 whitespace-nowrap">
                    <span className="rounded-lg bg-white/[0.05] border border-white/[0.08] px-2.5 py-1 text-[11px] font-bold text-zinc-300">
                      {issue.category}
                    </span>
                  </td>

                  <td className="py-4 px-5 font-bold text-white max-w-[190px] truncate">
                    {issue.recordReference}
                  </td>

                  <td className="py-4 px-5 text-zinc-200 max-w-sm">
                    <p className="line-clamp-2 leading-relaxed">{issue.description}</p>
                  </td>

                  <td className="py-4 px-5 text-zinc-400 max-w-[210px]">
                    <span className="line-clamp-2 italic text-[11px] font-medium text-indigo-300/80">
                      {issue.aicteNormReference}
                    </span>
                  </td>

                  <td className="py-4 px-5 text-center whitespace-nowrap">
                    {issue.isResolved ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-black text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        Remediated
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-black text-rose-300 border border-rose-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                        Open Deficit
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-5 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenRemediation(issue);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-indigo-300 shadow-inner hover:border-indigo-400/50 hover:bg-indigo-500/15 hover:text-white transition"
                    >
                      <Wrench className="h-3 w-3 text-indigo-400" />
                      Remediate
                    </button>
                  </td>
                </tr>
              ))}

              {filteredIssues.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-400">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]" />
                    <p className="mt-3 text-sm font-bold text-white">No Issues In This View</p>
                    <p className="text-xs text-zinc-500 mt-1">All filtered items are clean or successfully remediated.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Remediate Slide-Over Drawer with Smooth Glassmorphism Backdrop Blur */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-md flex justify-end animate-in fade-in duration-200">
          <div
            className="w-full max-w-xl bg-[#090d18] border-l border-white/[0.12] shadow-2xl flex flex-col h-full overflow-y-auto animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-white/[0.08] p-6 bg-white/[0.02]">
              <div className="space-y-2 pr-4">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black border",
                      selectedIssue.severity === "Critical"
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        selectedIssue.severity === "Critical" ? "bg-rose-400 animate-pulse" : "bg-amber-400"
                      )}
                    />
                    {selectedIssue.severity}
                  </span>
                  <span className="rounded-md bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 text-[10px] font-bold text-zinc-300">
                    {selectedIssue.category}
                  </span>
                  <span className="text-xs font-semibold text-zinc-400">
                    {selectedIssue.entityType}
                  </span>
                </div>
                <h2 className="text-lg font-black text-white leading-snug">
                  {selectedIssue.recordReference}
                </h2>
              </div>

              <button
                onClick={() => setSelectedIssue(null)}
                className="rounded-xl p-2 text-zinc-400 hover:bg-white/[0.08] hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 p-6 space-y-6">
              {saveSuccessMsg && (
                <div className="rounded-2xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-xs text-emerald-200 flex items-center gap-2.5 animate-in fade-in shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold">{saveSuccessMsg}</span>
                </div>
              )}

              {/* 1. Problem Description & AICTE Norm Cited */}
              <div className="space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4.5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    Scrutiny Defect Summary
                  </span>
                  <p className="mt-1 text-sm font-semibold text-white leading-relaxed">
                    {selectedIssue.description}
                  </p>
                </div>

                <div className="border-t border-white/[0.06] pt-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    AICTE Approval Process Handbook (APH) Citation
                  </span>
                  <p className="mt-0.5 text-xs text-indigo-300 font-semibold italic">
                    {selectedIssue.aicteNormReference}
                  </p>
                </div>
              </div>

              {/* 2. EVC & Scrutiny Impact Analysis */}
              <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-4 text-xs text-amber-200/90 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>EVC & AICTE Scrutiny Impact</span>
                </div>
                <p className="leading-relaxed">
                  {selectedIssue.severity === "Critical"
                    ? "Under AICTE Chapter VII penalties, Critical deficiencies in faculty cadre or identity anomalies trigger immediate intake reductions (up to 50%) or withholding of the Extension of Approval (EoA)."
                    : "Under Chapter IV procedural scrutiny, area or minor documentation deviations require an authorized Undertaking from the head of the institution before physical verification."}
                </p>
              </div>

              {/* 3. Inline Interactive Remediation: FACULTY RECORD */}
              {associatedFaculty && facultyDraft && (
                <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/[0.04] p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2.5">
                    <div className="flex items-center gap-2 font-bold text-sm text-indigo-300">
                      <Users className="h-4 w-4 text-indigo-400" />
                      <span>Inline Faculty Remediation Form</span>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                      Live State Sync
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-semibold text-zinc-300">Full Name</label>
                      <input
                        type="text"
                        value={facultyDraft.fullName || ""}
                        onChange={(e) =>
                          setFacultyDraft((prev) => ({ ...prev, fullName: e.target.value }))
                        }
                        className="mt-1 w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-zinc-300">
                        PAN Number (10 Alphanumeric)
                      </label>
                      <input
                        type="text"
                        maxLength={10}
                        placeholder="e.g. ABCDE1234F"
                        value={facultyDraft.panNumber || ""}
                        onChange={(e) =>
                          setFacultyDraft((prev) => ({
                            ...prev,
                            panNumber: e.target.value.toUpperCase(),
                          }))
                        }
                        className="mt-1 w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-zinc-300">AICTE Faculty ID</label>
                      <input
                        type="text"
                        placeholder="e.g. 1-1029384759"
                        value={facultyDraft.aicteFacultyId || ""}
                        onChange={(e) =>
                          setFacultyDraft((prev) => ({
                            ...prev,
                            aicteFacultyId: e.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-zinc-300">Highest Degree</label>
                      <select
                        value={facultyDraft.highestDegree || "Masters"}
                        onChange={(e) =>
                          setFacultyDraft((prev) => ({
                            ...prev,
                            highestDegree: e.target.value as HighestDegree,
                          }))
                        }
                        className="mt-1 w-full rounded-xl border border-white/[0.1] bg-[#0c101d] px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="PhD">PhD (Doctorate)</option>
                        <option value="Masters">Masters (M.Tech / ME)</option>
                        <option value="Bachelors">Bachelors (B.Tech / BE)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-zinc-300">Cadre</label>
                      <select
                        value={facultyDraft.designation || "Assistant Professor"}
                        onChange={(e) =>
                          setFacultyDraft((prev) => ({
                            ...prev,
                            designation: e.target.value as FacultyDesignation,
                          }))
                        }
                        className="mt-1 w-full rounded-xl border border-white/[0.1] bg-[#0c101d] px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="Professor">Professor</option>
                        <option value="Associate Professor">Associate Professor</option>
                        <option value="Assistant Professor">Assistant Professor</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-zinc-300">Department</label>
                      <input
                        type="text"
                        value={facultyDraft.department || ""}
                        onChange={(e) =>
                          setFacultyDraft((prev) => ({ ...prev, department: e.target.value }))
                        }
                        className="mt-1 w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveFacultyRemediation}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:from-indigo-500 hover:to-violet-500 transition"
                  >
                    <Save className="h-4 w-4" />
                    Save & Update Faculty Record
                  </button>
                </div>
              )}

              {/* 4. Inline Interactive Remediation: INFRASTRUCTURE RECORD */}
              {associatedInfra && infraDraft && (
                <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.04] p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2.5">
                    <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                      <Building2 className="h-4 w-4 text-emerald-400" />
                      <span>Inline Room Specifications Remediation</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                      Norm: &gt;= 66 sqm
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-semibold text-zinc-300">Room Number</label>
                      <input
                        type="text"
                        value={infraDraft.roomNumber || ""}
                        onChange={(e) =>
                          setInfraDraft((prev) => ({ ...prev, roomNumber: e.target.value }))
                        }
                        className="mt-1 w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-zinc-300">Space Type</label>
                      <select
                        value={infraDraft.roomType || "Classroom"}
                        onChange={(e) =>
                          setInfraDraft((prev) => ({
                            ...prev,
                            roomType: e.target.value as RoomType,
                          }))
                        }
                        className="mt-1 w-full rounded-xl border border-white/[0.1] bg-[#0c101d] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="Classroom">Classroom</option>
                        <option value="Laboratory">Laboratory</option>
                        <option value="Tutorial">Tutorial</option>
                        <option value="Seminar Hall">Seminar Hall</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-zinc-300">Carpet Area (Sq.m)</label>
                      <input
                        type="number"
                        step="1"
                        value={infraDraft.areaSqm || 66}
                        onChange={(e) =>
                          setInfraDraft((prev) => ({
                            ...prev,
                            areaSqm: Number(e.target.value),
                          }))
                        }
                        className="mt-1 w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-zinc-300">Seating Capacity</label>
                      <input
                        type="number"
                        value={infraDraft.seatingCapacity || 30}
                        onChange={(e) =>
                          setInfraDraft((prev) => ({
                            ...prev,
                            seatingCapacity: Number(e.target.value),
                          }))
                        }
                        className="mt-1 w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveInfraRemediation}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:from-emerald-500 hover:to-teal-500 transition"
                  >
                    <Save className="h-4 w-4" />
                    Update Room Specifications to Compliant Norm
                  </button>
                </div>
              )}

              {/* 5. Systemic Norm Deficit Action: AICTE Undertaking Generator */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-white">
                    <FileText className="h-4 w-4 text-indigo-400" />
                    <span>AICTE Compliance Undertaking</span>
                  </div>
                  <button
                    onClick={handleCopyUndertaking}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 text-[11px] font-bold text-zinc-300 hover:text-white hover:bg-white/[0.08] transition shadow-inner"
                  >
                    {undertakingCopied ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    {undertakingCopied ? "Copied!" : "Copy Undertaking"}
                  </button>
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  For cadre and ratio adjustments pending recruitment, institutions submit a
                  notarized Undertaking note attested by the Chairman/Secretary for provisional EoA clearance.
                </p>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
                  <span className="text-xs text-zinc-300">
                    Status: <strong className={selectedIssue.isResolved ? "text-emerald-400" : "text-rose-400"}>
                      {selectedIssue.isResolved ? "Remediated" : "Unresolved Deficit"}
                    </strong>
                  </span>
                  <button
                    onClick={() => resolveIssue(selectedIssue.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition",
                      selectedIssue.isResolved
                        ? "bg-white/[0.08] text-zinc-300 hover:bg-white/[0.12] hover:text-white"
                        : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:from-emerald-500 hover:to-teal-500"
                    )}
                  >
                    {selectedIssue.isResolved ? (
                      <>
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reopen Issue
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Mark Resolved / Submit Undertaking
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="border-t border-white/[0.08] p-4 bg-white/[0.02] flex items-center justify-between text-xs">
              <span className="text-zinc-400">
                Live EoA Score: <strong className="text-white">{stats.eoaReadinessScore}%</strong>
              </span>
              <button
                onClick={() => setSelectedIssue(null)}
                className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2 font-bold text-zinc-300 hover:bg-white/[0.08] hover:text-white transition shadow-inner"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Disclosure & Audit Report Modal */}
      <AuditReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}
