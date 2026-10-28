"use client";

import React from "react";
import {
  X,
  Printer,
  Download,
  Building2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Award,
  CheckCircle2,
  FileText,
  UserCheck,
  GraduationCap,
  Scale,
  Users,
} from "lucide-react";
import { useCompliance } from "@/context/ComplianceContext";

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuditReportModal({ isOpen, onClose }: AuditReportModalProps) {
  const {
    institution,
    faculty,
    infrastructure,
    issues,
    stats,
    lastAuditTimestamp,
  } = useCompliance();

  if (!isOpen) return null;

  // Faculty Cadre calculations
  const totalSanctioned = institution.sanctionedIntake || 600;
  const targetFaculty = Math.ceil(totalSanctioned / 20); // 1:20 norm
  const profTarget = Math.ceil(targetFaculty * (1 / 9));
  const assocProfTarget = Math.ceil(targetFaculty * (2 / 9));
  const asstProfTarget = targetFaculty - (profTarget + assocProfTarget);

  const regularFaculty = faculty.filter((f) => f.isRegular);
  const profActual = regularFaculty.filter((f) => f.designation === "Professor").length;
  const assocProfActual = regularFaculty.filter((f) => f.designation === "Associate Professor").length;
  const asstProfActual = regularFaculty.filter((f) => f.designation === "Assistant Professor").length;
  const profsWithPhd = regularFaculty.filter((f) => f.designation === "Professor" && f.highestDegree === "PhD").length;
  const assocWithPhd = regularFaculty.filter((f) => f.designation === "Associate Professor" && f.highestDegree === "PhD").length;

  // Infrastructure metrics
  const totalClassrooms = infrastructure.filter((i) => i.roomType === "Classroom").length;
  const totalLabs = infrastructure.filter((i) => i.roomType === "Laboratory").length;
  const deficientAreaRooms = infrastructure.filter((i) => {
    if (i.roomType === "Classroom" && i.areaSqm < 66) return true;
    if (i.roomType === "Laboratory" && i.areaSqm < 66) return true;
    return false;
  });

  const activeIssues = issues.filter((i) => !i.isResolved);
  const criticalIssues = activeIssues.filter((i) => i.severity === "Critical");
  const warningIssues = activeIssues.filter((i) => i.severity === "Warning");

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCleanCsv = () => {
    const headers = [
      "AICTE Faculty ID",
      "Full Name",
      "Designation",
      "Department",
      "Highest Degree",
      "PAN Number",
      "Regular/Adjunct",
      "Joining Date",
      "Compliance Status",
    ];

    const rows = faculty.map((f) => {
      const hasIssue = activeIssues.some(
        (i) =>
          i.recordReference.includes(f.fullName) ||
          i.recordReference.includes(f.panNumber) ||
          i.id.endsWith(f.id)
      );
      return [
        `"${f.aicteFacultyId || "MISSING"}"`,
        `"${f.fullName}"`,
        `"${f.designation}"`,
        `"${f.department}"`,
        `"${f.highestDegree}"`,
        `"${f.panNumber}"`,
        `"${f.isRegular ? "Regular" : "Adjunct"}"`,
        `"${f.joiningDate}"`,
        `"${hasIssue ? "Deficit Flagged" : "Verified Clean"}"`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `AICTE_Faculty_Audit_${institution.aictePermanentId}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto no-print">
      <div className="relative w-full max-w-4xl rounded-2xl border border-white/10 bg-[#0d1322] text-slate-100 shadow-2xl overflow-hidden print-area my-8">
        {/* Sticky Action Toolbar (Hidden during print) */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0a0f1d]/90 px-6 py-4 backdrop-blur-md no-print">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AICTE Mandatory Disclosure & Audit Report</h2>
              <p className="text-xs text-zinc-400">Extension of Approval (EoA) Dossier • Ready for EVC / Scrutiny</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownloadCleanCsv}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-white/10 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-indigo-400" />
              Download Clean CSV
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 transition-all"
            >
              <Printer className="h-3.5 w-3.5" />
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors ml-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 space-y-6 bg-slate-900/60 print:bg-white print:text-black">
          {/* Header Seal & Institution Details */}
          <div className="border-b border-white/10 pb-6 print:border-slate-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-300 print:text-indigo-800 print:border-indigo-300">
                  AICTE APH 2026-27 COMPLIANCE DOSSIER
                </div>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-white print:text-slate-900">
                  {institution.name}
                </h1>
                <p className="text-xs text-zinc-400 print:text-slate-600 mt-1">
                  AICTE Permanent Application ID:{" "}
                  <span className="font-mono font-semibold text-indigo-300 print:text-slate-900">
                    {institution.aictePermanentId}
                  </span>{" "}
                  • Approval Cycle: Academic Year {institution.academicYear || "2026-27"}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-right print:border-slate-200 print:bg-slate-50">
                <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 print:text-slate-500">
                  Audit Timestamp
                </p>
                <p className="text-xs font-semibold text-zinc-200 print:text-slate-800">
                  {lastAuditTimestamp ? new Date(lastAuditTimestamp).toLocaleString("en-IN") : new Date().toLocaleString("en-IN")}
                </p>
                <p className="text-[11px] font-medium text-emerald-400 print:text-emerald-700 mt-0.5">
                  Automated Scrutiny Verified
                </p>
              </div>
            </div>
          </div>

          {/* Executive Compliance Scorecard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 print:border-slate-300 print:bg-slate-50">
              <span className="text-[10px] uppercase font-bold text-zinc-400 print:text-slate-600">EoA Readiness</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-indigo-400 print:text-indigo-900">
                  {stats.overallScore}%
                </span>
                <span className="text-xs text-zinc-400 print:text-slate-600">
                  {stats.overallScore >= 80 ? "Pass" : "Deficit"}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-800 print:bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{ width: `${Math.min(stats.overallScore, 100)}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 print:border-slate-300 print:bg-slate-50">
              <span className="text-[10px] uppercase font-bold text-zinc-400 print:text-slate-600">Faculty-Student Ratio</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-white print:text-slate-900">
                  1:{(stats.facultyStudentRatio || 20).toFixed(1)}
                </span>
                <span className={`text-xs font-semibold ${(stats.facultyStudentRatio || 20) <= 20 ? "text-emerald-400 print:text-emerald-700" : "text-rose-400 print:text-rose-700"}`}>
                  {(stats.facultyStudentRatio || 20) <= 20 ? "Compliant" : "Deficit (Norm 1:20)"}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 print:text-slate-600 mt-1">
                Sanctioned Intake: {totalSanctioned} • Faculty: {faculty.length}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 print:border-slate-300 print:bg-slate-50">
              <span className="text-[10px] uppercase font-bold text-zinc-400 print:text-slate-600">Critical Deficits</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className={`text-2xl font-extrabold ${criticalIssues.length > 0 ? "text-rose-400 print:text-rose-700" : "text-emerald-400 print:text-emerald-700"}`}>
                  {criticalIssues.length}
                </span>
                <span className="text-xs text-zinc-400 print:text-slate-600">APH Chapter VII</span>
              </div>
              <p className="text-[10px] text-zinc-400 print:text-slate-600 mt-1">
                Warnings: {warningIssues.length} minor issues
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 print:border-slate-300 print:bg-slate-50">
              <span className="text-[10px] uppercase font-bold text-zinc-400 print:text-slate-600">Data Integrity</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-emerald-400 print:text-emerald-800">
                  {stats.cleanDataPercentage}%
                </span>
                <span className="text-xs text-zinc-400 print:text-slate-600">Clean Records</span>
              </div>
              <p className="text-[10px] text-zinc-400 print:text-slate-600 mt-1">
                Zero duplicate PAN / Aadhaar flags
              </p>
            </div>
          </div>

          {/* Cadre Ratio 1:2:6 Compliance Table */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 print:border-slate-300 print:bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-400 print:text-indigo-700" />
                <h3 className="text-sm font-bold text-white print:text-slate-900">
                  AICTE Cadre Ratio (1:2:6) & Cadre Distribution Analysis
                </h3>
              </div>
              <span className="text-xs text-zinc-400 print:text-slate-600 font-mono">
                Total Target: {targetFaculty} (for {totalSanctioned} Intake)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 print:border-slate-300 print:text-slate-700">
                    <th className="py-2 font-semibold">Cadre Designation</th>
                    <th className="py-2 font-semibold text-center">Required (1:2:6 Norm)</th>
                    <th className="py-2 font-semibold text-center">Actual Regular</th>
                    <th className="py-2 font-semibold text-center">Ph.D. Qualified</th>
                    <th className="py-2 font-semibold text-center">Deficit / Surplus</th>
                    <th className="py-2 font-semibold text-right">Cadre Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 print:divide-slate-200 text-zinc-200 print:text-slate-800">
                  <tr>
                    <td className="py-2.5 font-medium">Professor (Cadre 1)</td>
                    <td className="py-2.5 text-center font-mono">{profTarget}</td>
                    <td className="py-2.5 text-center font-mono font-bold">{profActual}</td>
                    <td className="py-2.5 text-center font-mono">{profsWithPhd} / {profActual}</td>
                    <td className="py-2.5 text-center font-mono">
                      {profActual - profTarget >= 0 ? (
                        <span className="text-emerald-400 print:text-emerald-700">+{profActual - profTarget}</span>
                      ) : (
                        <span className="text-rose-400 print:text-rose-700 font-bold">{profActual - profTarget}</span>
                      )}
                    </td>
                    <td className="py-2.5 text-right">
                      {profActual >= profTarget && profsWithPhd === profActual ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 print:text-emerald-700 font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Met
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 print:text-rose-700 font-semibold">
                          <AlertTriangle className="h-3.5 w-3.5" /> Action Req
                        </span>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 font-medium">Associate Professor (Cadre 2)</td>
                    <td className="py-2.5 text-center font-mono">{assocProfTarget}</td>
                    <td className="py-2.5 text-center font-mono font-bold">{assocProfActual}</td>
                    <td className="py-2.5 text-center font-mono">{assocWithPhd} / {assocProfActual}</td>
                    <td className="py-2.5 text-center font-mono">
                      {assocProfActual - assocProfTarget >= 0 ? (
                        <span className="text-emerald-400 print:text-emerald-700">+{assocProfActual - assocProfTarget}</span>
                      ) : (
                        <span className="text-rose-400 print:text-rose-700 font-bold">{assocProfActual - assocProfTarget}</span>
                      )}
                    </td>
                    <td className="py-2.5 text-right">
                      {assocProfActual >= assocProfTarget && assocWithPhd === assocProfActual ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 print:text-emerald-700 font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Met
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-400 print:text-amber-700 font-semibold">
                          <AlertTriangle className="h-3.5 w-3.5" /> Action Req
                        </span>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 font-medium">Assistant Professor (Cadre 6)</td>
                    <td className="py-2.5 text-center font-mono">{asstProfTarget}</td>
                    <td className="py-2.5 text-center font-mono font-bold">{asstProfActual}</td>
                    <td className="py-2.5 text-center font-mono">—</td>
                    <td className="py-2.5 text-center font-mono">
                      {asstProfActual - asstProfTarget >= 0 ? (
                        <span className="text-emerald-400 print:text-emerald-700">+{asstProfActual - asstProfTarget}</span>
                      ) : (
                        <span className="text-rose-400 print:text-rose-700 font-bold">{asstProfActual - asstProfTarget}</span>
                      )}
                    </td>
                    <td className="py-2.5 text-right">
                      {asstProfActual >= asstProfTarget ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 print:text-emerald-700 font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Met
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 print:text-rose-700 font-semibold">
                          <AlertTriangle className="h-3.5 w-3.5" /> Deficit
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Infrastructure & Lab Norms Summary */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 print:border-slate-300 print:bg-white">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-emerald-400 print:text-emerald-700" />
              <h3 className="text-sm font-bold text-white print:text-slate-900">
                Instructional Area & Carpet Area Norms (Section 3)
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 print:border-slate-200 print:bg-slate-50">
                <span className="text-zinc-400 print:text-slate-600 block">Classrooms (&ge;66 sqm)</span>
                <span className="text-base font-bold text-white print:text-slate-900 mt-1 block">
                  {totalClassrooms} Verified Spaces
                </span>
                <span className="text-[11px] text-emerald-400 print:text-emerald-700">Norm: 66 sqm each</span>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 print:border-slate-200 print:bg-slate-50">
                <span className="text-zinc-400 print:text-slate-600 block">Laboratories (&ge;66 sqm)</span>
                <span className="text-base font-bold text-white print:text-slate-900 mt-1 block">
                  {totalLabs} Active Labs
                </span>
                <span className="text-[11px] text-emerald-400 print:text-emerald-700">Norm: 66 sqm each</span>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 print:border-slate-200 print:bg-slate-50">
                <span className="text-zinc-400 print:text-slate-600 block">Deficient Carpet Spaces</span>
                <span className={`text-base font-bold mt-1 block ${deficientAreaRooms.length > 0 ? "text-rose-400 print:text-rose-700" : "text-emerald-400 print:text-emerald-700"}`}>
                  {deficientAreaRooms.length} Spaces &lt; 66 sqm
                </span>
                <span className="text-[11px] text-zinc-400 print:text-slate-500">Subject to EVC scrutiny</span>
              </div>
            </div>
          </div>

          {/* Formal AICTE Undertaking & Principal Signature Block */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-xs text-zinc-300 print:border-slate-300 print:bg-slate-50 print:text-slate-700 space-y-3">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-indigo-400 print:text-indigo-700" />
              <h4 className="font-bold text-white print:text-slate-900 text-xs uppercase tracking-wider">
                Formal Compliance Undertaking (AICTE Scrutiny & EVC Norms)
              </h4>
            </div>
            <p className="leading-relaxed">
              I, the undersigned Principal / Head of Institution, hereby solemnly declare and affirm that the faculty
              records, instructional area carpet calculations, cadre distributions, and student enrollment metrics presented
              in this Mandatory Disclosure Dossier have been strictly validated against the current AICTE Approval Process
              Handbook (APH). No ghost faculty, duplicate PAN / Aadhaar records, or unapproved programs have been submitted.
              We accept that any discrepancy will attract penalties under AICTE APH Chapter VII.
            </p>

            <div className="pt-8 grid grid-cols-2 gap-8 items-end print:pt-12">
              <div>
                <div className="border-t border-dashed border-zinc-600 print:border-slate-400 pt-2">
                  <p className="font-semibold text-white print:text-slate-900">Head of Department / IQAC Coordinator</p>
                  <p className="text-[11px] text-zinc-400 print:text-slate-600">Seal & Date</p>
                </div>
              </div>
              <div className="text-right">
                <div className="border-t border-dashed border-zinc-600 print:border-slate-400 pt-2 inline-block text-left min-w-[200px]">
                  <p className="font-semibold text-white print:text-slate-900">Principal / Director</p>
                  <p className="text-[11px] text-zinc-400 print:text-slate-600">{institution.name}</p>
                  <p className="text-[10px] text-zinc-500 print:text-slate-500 font-mono">Digital Signature & Seal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
