"use client";

import React, { useState, useRef, useMemo } from "react";
import {
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  Users,
  Sparkles,
  RefreshCw,
  Search,
  Save,
  Check,
  FileWarning,
  X,
  FileSpreadsheet,
} from "lucide-react";
import Papa from "papaparse";
import { useCompliance } from "@/context/ComplianceContext";
import { FacultyRecord, InfrastructureRecord, RoomType, FacultyDesignation, HighestDegree } from "@/types/compliance";
import { PAN_REGEX } from "@/lib/validators/aicteRules";
import { cn } from "@/lib/utils";

export default function IngestPage() {
  const {
    institution,
    faculty,
    infrastructure,
    issues,
    stats,
    updateInstitution,
    setFacultyRecords,
    setInfrastructureRecords,
    loadDemoData,
    recalculateCompliance,
  } = useCompliance();

  // Institution Profile local edit state
  const [sanctionedIntake, setSanctionedIntake] = useState(institution.sanctionedIntake);
  const [builtUpArea, setBuiltUpArea] = useState(institution.builtUpAreaSqm);
  const [instSaved, setInstSaved] = useState(false);

  // Upload feedback states
  const [facultyUploadStatus, setFacultyUploadStatus] = useState<string | null>(null);
  const [infraUploadStatus, setInfraUploadStatus] = useState<string | null>(null);
  const [isDraggingFaculty, setIsDraggingFaculty] = useState(false);
  const [isDraggingInfra, setIsDraggingInfra] = useState(false);

  // Audit banner state
  const [auditBanner, setAuditBanner] = useState<{
    visible: boolean;
    timestamp: string;
  } | null>(null);

  // Table view states
  const [activeTab, setActiveTab] = useState<"faculty" | "infrastructure">("faculty");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOnlyErrors, setFilterOnlyErrors] = useState(false);

  const facultyInputRef = useRef<HTMLInputElement>(null);
  const infraInputRef = useRef<HTMLInputElement>(null);

  // Quick lookup of duplicate PANs and AICTE IDs
  const duplicatePans = useMemo(() => {
    const counts = new Map<string, number>();
    faculty.forEach((f) => {
      const pan = f.panNumber?.trim().toUpperCase();
      if (pan && PAN_REGEX.test(pan)) {
        counts.set(pan, (counts.get(pan) || 0) + 1);
      }
    });
    return new Set(Array.from(counts.entries()).filter(([, c]) => c > 1).map(([p]) => p));
  }, [faculty]);

  const duplicateAicteIds = useMemo(() => {
    const counts = new Map<string, number>();
    faculty.forEach((f) => {
      const id = f.aicteFacultyId?.trim();
      if (id) {
        counts.set(id, (counts.get(id) || 0) + 1);
      }
    });
    return new Set(Array.from(counts.entries()).filter(([, c]) => c > 1).map(([id]) => id));
  }, [faculty]);

  // Handle Institution Profile Update
  const handleSaveInstitution = () => {
    updateInstitution({
      sanctionedIntake: Number(sanctionedIntake),
      builtUpAreaSqm: Number(builtUpArea),
    });
    setInstSaved(true);
    setTimeout(() => setInstSaved(false), 2500);
  };

  // Run Manual Audit
  const handleRunAudit = () => {
    recalculateCompliance();
    setAuditBanner({
      visible: true,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  // Download Templates
  const handleDownloadFacultyTemplate = () => {
    const csvContent =
      "fullName,panNumber,aicteFacultyId,designation,highestDegree,department,joiningDate,isRegular\n" +
      "Dr. Anita Sharma,ABCDE1234F,1-9876543210,Professor,PhD,Computer Science & Engineering,2018-06-15,true\n" +
      "Prof. Sunil Rao,BKLPV9876K,1-9876543211,Assistant Professor,Masters,Mechanical Engineering,2021-08-01,true\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "aicte_faculty_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadInfraTemplate = () => {
    const csvContent =
      "roomNumber,roomType,areaSqm,seatingCapacity,hasSmartBoard\n" +
      "CR-101,Classroom,72,66,true\n" +
      "LAB-102,Laboratory,70,35,false\n" +
      "TR-201,Tutorial,36,30,false\n" +
      "SH-01,Seminar Hall,150,120,true\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "aicte_infrastructure_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PapaParse Faculty CSV
  const parseFacultyCSV = (file: File) => {
    Papa.parse<any>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedRecords: FacultyRecord[] = results.data.map((row, index) => {
            const rawDesig = (row.designation || row["Designation"] || "Assistant Professor").trim();
            let designation: FacultyDesignation = "Assistant Professor";
            if (rawDesig.toLowerCase() === "professor") designation = "Professor";
            else if (rawDesig.toLowerCase().includes("associate")) designation = "Associate Professor";

            const rawDeg = (row.highestDegree || row["Highest Degree"] || row["Degree"] || "Masters").trim();
            let highestDegree: HighestDegree = "Masters";
            if (rawDeg.toLowerCase().includes("phd") || rawDeg.toLowerCase().includes("doctor")) highestDegree = "PhD";
            else if (rawDeg.toLowerCase().includes("bachelor") || rawDeg.toLowerCase().includes("b.tech") || rawDeg.toLowerCase().includes("be")) highestDegree = "Bachelors";

            const rawRegular = (row.isRegular || row["Is Regular"] || "true").toString().toLowerCase();
            const isRegular = rawRegular === "true" || rawRegular === "yes" || rawRegular === "1";

            return {
              id: `fac-up-${Date.now()}-${index}`,
              fullName: (row.fullName || row["Full Name"] || row["Name"] || `Faculty Member ${index + 1}`).trim(),
              panNumber: (row.panNumber || row["PAN Number"] || row["PAN"] || "").trim().toUpperCase(),
              aicteFacultyId: (row.aicteFacultyId || row["AICTE Faculty ID"] || row["AICTE ID"] || "").trim(),
              designation,
              highestDegree,
              department: (row.department || row["Department"] || "Engineering").trim(),
              joiningDate: (row.joiningDate || row["Joining Date"] || "2020-01-01").trim(),
              isRegular,
            };
          });

          if (parsedRecords.length > 0) {
            setFacultyRecords(parsedRecords);
            setFacultyUploadStatus(`Successfully parsed & validated ${parsedRecords.length} faculty records.`);
            setAuditBanner({
              visible: true,
              timestamp: new Date().toLocaleTimeString(),
            });
          } else {
            setFacultyUploadStatus("Error: CSV did not contain any valid faculty rows.");
          }
        } catch {
          setFacultyUploadStatus("Failed to parse faculty CSV. Please verify headers.");
        }
      },
      error: (err) => {
        setFacultyUploadStatus(`Upload Error: ${err.message}`);
      },
    });
  };

  // PapaParse Infrastructure CSV
  const parseInfraCSV = (file: File) => {
    Papa.parse<any>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedRecords: InfrastructureRecord[] = results.data.map((row, index) => {
            const rawType = (row.roomType || row["Room Type"] || row["Type"] || "Classroom").trim();
            let roomType: RoomType = "Classroom";
            if (rawType.toLowerCase().includes("lab")) roomType = "Laboratory";
            else if (rawType.toLowerCase().includes("tutorial")) roomType = "Tutorial";
            else if (rawType.toLowerCase().includes("seminar")) roomType = "Seminar Hall";

            const rawSmart = (row.hasSmartBoard || row["Smart Board"] || "false").toString().toLowerCase();
            const hasSmartBoard = rawSmart === "true" || rawSmart === "yes" || rawSmart === "1";

            return {
              id: `infra-up-${Date.now()}-${index}`,
              roomNumber: (row.roomNumber || row["Room Number"] || row["Room No"] || `R-${index + 1}`).trim(),
              roomType,
              areaSqm: Number(row.areaSqm || row["Area"] || row["Carpet Area (sqm)"] || 66),
              seatingCapacity: Number(row.seatingCapacity || row["Capacity"] || 60),
              hasSmartBoard,
            };
          });

          if (parsedRecords.length > 0) {
            setInfrastructureRecords(parsedRecords);
            setInfraUploadStatus(`Successfully parsed & validated ${parsedRecords.length} infrastructure spaces.`);
            setAuditBanner({
              visible: true,
              timestamp: new Date().toLocaleTimeString(),
            });
          } else {
            setInfraUploadStatus("Error: CSV did not contain any valid infrastructure rows.");
          }
        } catch {
          setInfraUploadStatus("Failed to parse infrastructure CSV. Please verify headers.");
        }
      },
      error: (err) => {
        setInfraUploadStatus(`Upload Error: ${err.message}`);
      },
    });
  };

  // Row problem detectors
  const checkFacultyProblems = (f: FacultyRecord) => {
    const problems: { text: string; severity: "critical" | "warning" }[] = [];
    const pan = f.panNumber?.trim().toUpperCase();
    const aicteId = f.aicteFacultyId?.trim();

    if (!pan) {
      problems.push({ text: "Missing PAN", severity: "critical" });
    } else if (!PAN_REGEX.test(pan)) {
      problems.push({ text: "Invalid PAN Format", severity: "warning" });
    } else if (duplicatePans.has(pan)) {
      problems.push({ text: "Duplicate PAN", severity: "critical" });
    }

    if (!aicteId) {
      problems.push({ text: "Missing AICTE ID", severity: "critical" });
    } else if (duplicateAicteIds.has(aicteId)) {
      problems.push({ text: "Duplicate AICTE ID", severity: "critical" });
    }

    if ((f.designation === "Professor" || f.designation === "Associate Professor") && f.highestDegree !== "PhD") {
      problems.push({ text: `Non-PhD ${f.designation}`, severity: "critical" });
    }

    return problems;
  };

  const checkInfraProblems = (r: InfrastructureRecord) => {
    const problems: { text: string; severity: "critical" | "warning" }[] = [];
    if ((r.roomType === "Classroom" || r.roomType === "Laboratory") && r.areaSqm < 66) {
      problems.push({
        text: `Undersized (${r.areaSqm} sqm < 66 sqm norm)`,
        severity: "warning",
      });
    }
    return problems;
  };

  // Filtered lists
  const filteredFaculty = useMemo(() => {
    return faculty.filter((f) => {
      const matchesSearch =
        f.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.panNumber.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (filterOnlyErrors) {
        return checkFacultyProblems(f).length > 0;
      }
      return true;
    });
  }, [faculty, searchQuery, filterOnlyErrors, duplicatePans, duplicateAicteIds]);

  const filteredInfra = useMemo(() => {
    return infrastructure.filter((r) => {
      const matchesSearch =
        r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.roomType.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (filterOnlyErrors) {
        return checkInfraProblems(r).length > 0;
      }
      return true;
    });
  }, [infrastructure, searchQuery, filterOnlyErrors]);

  return (
    <div className="space-y-7">
      {/* Top Header & Global Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-white">
              Data Ingestion & Rule Validation
            </h1>
            <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 text-xs font-bold text-indigo-300">
              Deterministic AICTE Engine
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Upload institutional CSV data or run deterministic AICTE Approval Process Handbook (APH) norm checks
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={loadDemoData}
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-xs font-bold text-zinc-300 shadow-inner hover:bg-white/[0.08] hover:text-white transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            Load Demo College Data
          </button>
          <button
            onClick={handleRunAudit}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:from-indigo-500 hover:to-violet-500 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Run Compliance Audit
          </button>
        </div>
      </div>

      {/* Instant Audit Summary Toast/Banner */}
      {auditBanner?.visible && (
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-[#0d1222] to-slate-900/80 p-6 text-white shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-300">
          <button
            onClick={() => setAuditBanner(null)}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                  Audit Completed at {auditBanner.timestamp}
                </span>
              </div>
              <h3 className="mt-1 text-lg font-black tracking-tight text-white">
                AICTE APH Rule Engine Evaluation Complete
              </h3>
              <p className="mt-0.5 text-xs text-zinc-300">
                Processed across {faculty.length} Faculty and {infrastructure.length} Infrastructure records
              </p>
            </div>

            {/* Quick KPI Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl bg-white/[0.05] px-4 py-2.5 text-center backdrop-blur-md border border-white/[0.08]">
                <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">EoA Score</span>
                <p className="text-xl font-black text-white">{stats.eoaReadinessScore}%</p>
              </div>

              <div className="rounded-2xl bg-white/[0.05] px-4 py-2.5 text-center backdrop-blur-md border border-white/[0.08]">
                <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Current FSR</span>
                <p
                  className={cn(
                    "text-xl font-black",
                    stats.facultyStudentRatio <= 20 ? "text-emerald-400" : "text-amber-400"
                  )}
                >
                  1:{stats.facultyStudentRatio}
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.05] px-4 py-2.5 text-center backdrop-blur-md border border-white/[0.08]">
                <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Clean Data</span>
                <p className="text-xl font-black text-white">{stats.cleanDataPercentage}%</p>
              </div>

              <div className="rounded-2xl bg-rose-500/15 border border-rose-500/30 px-4 py-2.5 text-center backdrop-blur-md">
                <span className="text-[10px] text-rose-300 uppercase font-bold tracking-wider">Critical Blockers</span>
                <p className="text-xl font-black text-rose-300">{stats.criticalIssuesCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Institution Profile Bar */}
      <div className="dark-glass rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-400 border border-indigo-500/30">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">{institution.name}</h2>
                <span className="rounded-md bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 text-[10px] font-mono font-bold text-zinc-300">
                  {institution.aictePermanentId}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                Sanctioned Intake: <strong className="text-white">{institution.sanctionedIntake} Seats</strong> • Total Faculty:{" "}
                <strong className="text-white">{faculty.length}</strong> (Regular: {stats.totalRegularFaculty} / {stats.requiredFaculty} req)
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveInstitution}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-lg transition-all duration-200",
              instSaved
                ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:from-indigo-500 hover:to-violet-500"
            )}
          >
            {instSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {instSaved ? "Saved & Recalculated!" : "Save Profile & Re-audit"}
          </button>
        </div>

        {/* Editable profile fields */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          <div>
            <label className="font-bold text-zinc-300">Sanctioned Student Intake</label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                type="number"
                min="60"
                step="30"
                value={sanctionedIntake}
                onChange={(e) => setSanctionedIntake(Number(e.target.value))}
                className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
              <span className="text-zinc-500 font-semibold">Seats</span>
            </div>
          </div>

          <div>
            <label className="font-bold text-zinc-300">Total Built-up Area (Sq.m)</label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                type="number"
                min="1000"
                step="500"
                value={builtUpArea}
                onChange={(e) => setBuiltUpArea(Number(e.target.value))}
                className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
              <span className="text-zinc-500 font-semibold">Sqm</span>
            </div>
          </div>

          <div>
            <label className="font-bold text-zinc-300">Cadre Distribution (P : ASP : AP)</label>
            <div className="mt-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-mono font-bold text-zinc-200">
              {stats.cadreRatio.professors} : {stats.cadreRatio.associates} : {stats.cadreRatio.assistants}
            </div>
          </div>

          <div>
            <label className="font-bold text-zinc-300">EoA Scrutiny Status</label>
            <div className="mt-1.5 flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black border",
                  stats.eoaReadiness === "Ready"
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    : stats.eoaReadiness === "Deficient"
                    ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                    : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                )}
              >
                {stats.eoaReadiness === "Ready" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                )}
                {stats.eoaReadiness}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Drag-and-Drop Ingestion Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* CARD 1: Faculty Upload */}
        <div className="dark-glass rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-400 border border-indigo-500/20">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-white text-sm">Faculty Records Ingestion</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Detects duplicate PANs, missing AICTE IDs, cadre shortfalls & non-PhD senior faculty
                  </p>
                </div>
              </div>
              <button
                onClick={handleDownloadFacultyTemplate}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-zinc-300 hover:bg-white/[0.08] hover:text-white transition shadow-inner"
                title="Download CSV Template"
              >
                <Download className="h-3.5 w-3.5 text-indigo-400" />
                Template
              </button>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingFaculty(true);
              }}
              onDragLeave={() => setIsDraggingFaculty(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingFaculty(false);
                if (e.dataTransfer.files?.[0]) {
                  parseFacultyCSV(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => facultyInputRef.current?.click()}
              className={cn(
                "mt-5 flex flex-1 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200",
                isDraggingFaculty
                  ? "border-indigo-400 bg-indigo-500/15"
                  : "border-white/[0.12] bg-white/[0.02] hover:border-indigo-500/50 hover:bg-indigo-500/[0.05]"
              )}
            >
              <input
                ref={facultyInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    parseFacultyCSV(e.target.files[0]);
                  }
                }}
              />
              <div className="rounded-2xl bg-indigo-500/10 p-3.5 shadow-inner border border-indigo-500/20 text-indigo-400">
                <Upload className="h-6 w-6" />
              </div>
              <p className="mt-3 text-xs font-bold text-white">
                Drag & drop Faculty CSV, or <span className="text-indigo-400 underline underline-offset-2">browse file</span>
              </p>
              <p className="mt-1 text-[11px] text-zinc-500">
                Headers: fullName, panNumber, aicteFacultyId, designation, highestDegree, department
              </p>
            </div>

            {facultyUploadStatus && (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-white/[0.05] border border-white/[0.08] p-3 text-xs text-zinc-200">
                <span>{facultyUploadStatus}</span>
                <button onClick={() => setFacultyUploadStatus(null)} className="text-zinc-500 hover:text-zinc-300">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs text-zinc-400">
            <span>Loaded: <strong className="text-white">{faculty.length}</strong> records</span>
            <span>Regular Faculty: <strong className="text-indigo-300">{stats.totalRegularFaculty}</strong></span>
          </div>
        </div>

        {/* CARD 2: Infrastructure Upload */}
        <div className="dark-glass rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-400 border border-emerald-500/20">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-white text-sm">Infrastructure Spaces Ingestion</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Validates Classrooms and Laboratories against the 66 sq.m minimum carpet area norm
                  </p>
                </div>
              </div>
              <button
                onClick={handleDownloadInfraTemplate}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-zinc-300 hover:bg-white/[0.08] hover:text-white transition shadow-inner"
                title="Download CSV Template"
              >
                <Download className="h-3.5 w-3.5 text-emerald-400" />
                Template
              </button>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingInfra(true);
              }}
              onDragLeave={() => setIsDraggingInfra(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingInfra(false);
                if (e.dataTransfer.files?.[0]) {
                  parseInfraCSV(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => infraInputRef.current?.click()}
              className={cn(
                "mt-5 flex flex-1 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200",
                isDraggingInfra
                  ? "border-emerald-400 bg-emerald-500/15"
                  : "border-white/[0.12] bg-white/[0.02] hover:border-emerald-500/50 hover:bg-emerald-500/[0.05]"
              )}
            >
              <input
                ref={infraInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    parseInfraCSV(e.target.files[0]);
                  }
                }}
              />
              <div className="rounded-2xl bg-emerald-500/10 p-3.5 shadow-inner border border-emerald-500/20 text-emerald-400">
                <Upload className="h-6 w-6" />
              </div>
              <p className="mt-3 text-xs font-bold text-white">
                Drag & drop Infrastructure CSV, or <span className="text-emerald-400 underline underline-offset-2">browse file</span>
              </p>
              <p className="mt-1 text-[11px] text-zinc-500">
                Headers: roomNumber, roomType, areaSqm, seatingCapacity, hasSmartBoard
              </p>
            </div>

            {infraUploadStatus && (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-white/[0.05] border border-white/[0.08] p-3 text-xs text-zinc-200">
                <span>{infraUploadStatus}</span>
                <button onClick={() => setInfraUploadStatus(null)} className="text-zinc-500 hover:text-zinc-300">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs text-zinc-400">
            <span>Loaded: <strong className="text-white">{infrastructure.length}</strong> spaces</span>
            <span>Total Area: <strong className="text-emerald-300">{infrastructure.reduce((sum, r) => sum + r.areaSqm, 0)}</strong> sqm</span>
          </div>
        </div>
      </div>

      {/* Preview Section with Zebra-Striped Sticky Tables */}
      <div className="dark-glass rounded-3xl overflow-hidden shadow-2xl">
        {/* Table Controls */}
        <div className="flex flex-col gap-3 border-b border-white/[0.08] p-5 sm:flex-row sm:items-center sm:justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("faculty")}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200",
                activeTab === "faculty"
                  ? "bg-gradient-to-r from-indigo-500/25 to-violet-500/25 text-white border border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
              )}
            >
              <Users className="h-3.5 w-3.5 text-indigo-400" />
              Faculty Records ({faculty.length})
            </button>
            <button
              onClick={() => setActiveTab("infrastructure")}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200",
                activeTab === "infrastructure"
                  ? "bg-gradient-to-r from-indigo-500/25 to-violet-500/25 text-white border border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
              )}
            >
              <Building2 className="h-3.5 w-3.5 text-indigo-400" />
              Infrastructure Spaces ({infrastructure.length})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 shadow-inner hover:bg-white/[0.06] transition">
              <input
                type="checkbox"
                checked={filterOnlyErrors}
                onChange={(e) => setFilterOnlyErrors(e.target.checked)}
                className="h-3.5 w-3.5 rounded text-indigo-500 focus:ring-indigo-500"
              />
              <FileWarning className="h-3.5 w-3.5 text-rose-400" />
              <span className="font-bold text-[11px]">Only Flagged Rows</span>
            </label>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder={activeTab === "faculty" ? "Search name, PAN, dept..." : "Search room..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-64 rounded-xl border border-white/[0.09] bg-white/[0.04] py-1.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* FACULTY TABLE with Sticky Header & Zebra Striping */}
        {activeTab === "faculty" && (
          <div className="overflow-x-auto max-h-[520px]">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-[#0a0f1d]/95 backdrop-blur-xl border-b border-white/[0.08] text-zinc-400 font-bold z-10">
                <tr>
                  <th className="py-3.5 px-5">Audit Status</th>
                  <th className="py-3.5 px-5">Full Name</th>
                  <th className="py-3.5 px-5">PAN Number</th>
                  <th className="py-3.5 px-5">AICTE Faculty ID</th>
                  <th className="py-3.5 px-5">Cadre</th>
                  <th className="py-3.5 px-5">Highest Degree</th>
                  <th className="py-3.5 px-5">Department</th>
                  <th className="py-3.5 px-5 text-center">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredFaculty.map((f, index) => {
                  const problems = checkFacultyProblems(f);
                  const hasCritical = problems.some((p) => p.severity === "critical");
                  const hasWarning = problems.some((p) => p.severity === "warning");

                  return (
                    <tr
                      key={f.id}
                      className={cn(
                        "transition-colors duration-150",
                        index % 2 === 1 ? "bg-white/[0.015]" : "bg-transparent",
                        hasCritical
                          ? "hover:bg-rose-500/[0.08]"
                          : hasWarning
                          ? "hover:bg-amber-500/[0.08]"
                          : "hover:bg-white/[0.04]"
                      )}
                    >
                      <td className="py-3.5 px-5">
                        {problems.length === 0 ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-black text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3" />
                            Compliant
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {problems.map((p, idx) => (
                              <span
                                key={idx}
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black border",
                                  p.severity === "critical"
                                    ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                                    : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                )}
                              >
                                <span
                                  className={cn(
                                    "h-1.5 w-1.5 rounded-full",
                                    p.severity === "critical" ? "bg-rose-400 animate-pulse" : "bg-amber-400"
                                  )}
                                />
                                {p.text}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-5 font-bold text-white">{f.fullName}</td>

                      <td className="py-3.5 px-5 font-mono">
                        {f.panNumber ? (
                          <span
                            className={cn(
                              duplicatePans.has(f.panNumber)
                                ? "text-rose-400 font-black drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                                : !PAN_REGEX.test(f.panNumber)
                                ? "text-amber-400 font-bold"
                                : "text-zinc-300"
                            )}
                          >
                            {f.panNumber}
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold italic">Missing</span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 font-mono">
                        {f.aicteFacultyId ? (
                          <span
                            className={cn(
                              duplicateAicteIds.has(f.aicteFacultyId)
                                ? "text-rose-400 font-bold"
                                : "text-zinc-300"
                            )}
                          >
                            {f.aicteFacultyId}
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold italic">Not Registered</span>
                        )}
                      </td>

                      <td className="py-3.5 px-5">
                        <span
                          className={cn(
                            "inline-flex rounded-lg px-2.5 py-0.5 text-[11px] font-bold border",
                            f.designation === "Professor"
                              ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                              : f.designation === "Associate Professor"
                              ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                              : "bg-white/[0.05] text-zinc-300 border-white/[0.08]"
                          )}
                        >
                          {f.designation}
                        </span>
                      </td>

                      <td className="py-3.5 px-5">
                        <span
                          className={cn(
                            "inline-flex rounded-lg px-2.5 py-0.5 text-[11px] font-black border",
                            f.highestDegree === "PhD"
                              ? "text-emerald-300 bg-emerald-500/15 border-emerald-500/30"
                              : (f.designation === "Professor" || f.designation === "Associate Professor")
                              ? "text-rose-300 bg-rose-500/20 border-rose-500/40"
                              : "text-zinc-400 bg-white/[0.04] border-white/[0.06]"
                          )}
                        >
                          {f.highestDegree}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-zinc-300">{f.department}</td>

                      <td className="py-3.5 px-5 text-center">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border",
                            f.isRegular
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          )}
                        >
                          {f.isRegular ? "Regular" : "Adjunct"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* INFRASTRUCTURE TABLE with Sticky Header */}
        {activeTab === "infrastructure" && (
          <div className="overflow-x-auto max-h-[520px]">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-[#0a0f1d]/95 backdrop-blur-xl border-b border-white/[0.08] text-zinc-400 font-bold z-10">
                <tr>
                  <th className="py-3.5 px-5">Norm Compliance</th>
                  <th className="py-3.5 px-5">Room Number</th>
                  <th className="py-3.5 px-5">Space Type</th>
                  <th className="py-3.5 px-5">Carpet Area (Sq.m)</th>
                  <th className="py-3.5 px-5">AICTE Min Norm</th>
                  <th className="py-3.5 px-5">Capacity</th>
                  <th className="py-3.5 px-5 text-center">Smart Board</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredInfra.map((r, index) => {
                  const problems = checkInfraProblems(r);
                  const isUndersized = problems.length > 0;

                  return (
                    <tr
                      key={r.id}
                      className={cn(
                        "transition-colors duration-150",
                        index % 2 === 1 ? "bg-white/[0.015]" : "bg-transparent",
                        isUndersized ? "hover:bg-amber-500/[0.08]" : "hover:bg-white/[0.04]"
                      )}
                    >
                      <td className="py-3.5 px-5">
                        {isUndersized ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-black text-amber-300 border border-amber-500/30">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                            Undersized Area Deficit
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-black text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3" />
                            Compliant
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 font-bold text-white">{r.roomNumber}</td>

                      <td className="py-3.5 px-5">
                        <span className="inline-flex rounded-lg bg-white/[0.05] border border-white/[0.08] px-2.5 py-0.5 text-[11px] font-bold text-zinc-300">
                          {r.roomType}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 font-mono font-bold">
                        <span className={cn(isUndersized ? "text-amber-400 font-black" : "text-zinc-200")}>
                          {r.areaSqm} sqm
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-zinc-400 font-mono text-[11px]">
                        {r.roomType === "Classroom" || r.roomType === "Laboratory"
                          ? ">= 66 sqm"
                          : r.roomType === "Tutorial"
                          ? ">= 33 sqm"
                          : ">= 132 sqm"}
                      </td>

                      <td className="py-3.5 px-5 text-zinc-300 font-mono">{r.seatingCapacity} seats</td>

                      <td className="py-3.5 px-5 text-center">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border",
                            r.hasSmartBoard
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : "bg-white/[0.05] text-zinc-400 border-white/[0.08]"
                          )}
                        >
                          {r.hasSmartBoard ? "Equipped" : "Standard"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
