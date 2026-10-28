"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Bot,
  User,
  Send,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  FileText,
  ShieldAlert,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ChevronRight,
  ArrowRight,
  Terminal,
} from "lucide-react";
import { useCompliance } from "@/context/ComplianceContext";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  source?: string;
}

const QUICK_PROMPT_CHIPS = [
  {
    id: "hiring",
    title: "Calculate Faculty Hiring",
    badge: "FSR 1:20",
    prompt: "Calculate exact faculty hiring needed to hit 1:20 FSR and 1:2:6 Cadre Ratio",
    icon: Users,
  },
  {
    id: "undertaking",
    title: "Draft Scrutiny Undertaking",
    badge: "Letterhead",
    prompt: "Draft a formal Deficiency Compliance Undertaking letter for the AICTE Scrutiny Committee",
    icon: FileText,
  },
  {
    id: "evc",
    title: "EVC Inspection Checklist",
    badge: "Audit Ready",
    prompt: "Generate an EVC (Expert Visit Committee) Inspection Readiness Checklist for our current deficits",
    icon: ShieldAlert,
  },
  {
    id: "penalties",
    title: "Chapter VII Penalties",
    badge: "Statutory",
    prompt: "Explain AICTE Chapter VII penalties for duplicate PANs and missing PhDs",
    icon: AlertTriangle,
  },
];

/**
 * Enterprise Markdown & Table Renderer for AI responses (Dark Luxury Edition)
 */
function FormattedMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const renderedElements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  const flushTable = (key: string) => {
    if (tableRows.length > 0) {
      const header = tableRows[0];
      const body = tableRows.slice(1).filter((r) => !r.every((c) => c.match(/^:?-+:?$/)));
      renderedElements.push(
        <div key={key} className="my-3 overflow-x-auto rounded-2xl border border-white/[0.08] bg-black/40 shadow-inner">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.05] border-b border-white/[0.08] text-zinc-300 font-bold">
              <tr>
                {header.map((col, idx) => (
                  <th key={idx} className="py-2.5 px-3.5">
                    {col.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {body.map((row, rIdx) => (
                <tr key={rIdx} className={cn("transition-colors", rIdx % 2 === 1 ? "bg-white/[0.015]" : "bg-transparent")}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="py-2.5 px-3.5 text-zinc-200 font-medium">
                      {cell.trim()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Markdown Table Rows
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      inTable = true;
      const cells = trimmed
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      tableRows.push(cells);
      return;
    } else if (inTable) {
      flushTable(`table-${index}`);
      inTable = false;
    }

    // Heading 3
    if (trimmed.startsWith("### ")) {
      renderedElements.push(
        <h4 key={index} className="mt-3 mb-1 text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
          {trimmed.replace("### ", "")}
        </h4>
      );
      return;
    }

    // Heading 2
    if (trimmed.startsWith("## ")) {
      renderedElements.push(
        <h3 key={index} className="mt-3.5 mb-1.5 text-base font-black text-white tracking-tight">
          {trimmed.replace("## ", "")}
        </h3>
      );
      return;
    }

    // Bullet points
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const text = trimmed.slice(2);
      renderedElements.push(
        <li key={index} className="ml-4 list-disc text-zinc-200 py-0.5">
          {formatInlineMarkdown(text)}
        </li>
      );
      return;
    }

    // Numbered lists
    if (/^\d+\.\s/.test(trimmed)) {
      const text = trimmed.replace(/^\d+\.\s/, "");
      renderedElements.push(
        <li key={index} className="ml-4 list-decimal text-zinc-200 py-0.5">
          {formatInlineMarkdown(text)}
        </li>
      );
      return;
    }

    // Empty lines
    if (trimmed === "") {
      renderedElements.push(<div key={index} className="h-2" />);
      return;
    }

    // Standard Paragraph
    renderedElements.push(
      <p key={index} className="text-zinc-200 leading-relaxed">
        {formatInlineMarkdown(trimmed)}
      </p>
    );
  });

  if (inTable) {
    flushTable("table-end");
  }

  return <div className="space-y-1">{renderedElements}</div>;
}

/**
 * Helper to parse bold **text**, code `text`, and highlighted norms
 */
function formatInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[11px] text-indigo-300 font-bold border border-white/[0.06]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export default function CopilotPage() {
  const { institution, faculty, infrastructure, issues, stats } = useCompliance();

  // Chat message state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with greeting grounded in live institution context
  useEffect(() => {
    const greeting: ChatMessage = {
      id: "initial-greeting",
      role: "assistant",
      content: `### AICTE Compliance Copilot Initialized
I am your **Autonomous AICTE Regulatory Auditor & Nodal Officer Copilot**, calibrated with the **Approval Process Handbook (APH 2024-25)**.

**Live Context Loaded for ${institution.name}:**
- **Sanctioned Intake:** ${institution.sanctionedIntake} Seats (${institution.academicYear})
- **Current FSR:** 1:${stats.facultyStudentRatio} vs 1:20 Norm (${stats.totalRegularFaculty} Regular Faculty)
- **EoA Readiness Score:** ${stats.eoaReadinessScore}%
- **Active Scrutiny Deficits:** ${stats.criticalIssuesCount} Critical, ${stats.warningIssuesCount} Warnings

Ask me anything regarding faculty hiring calculations, AICTE Chapter VII penalties, or click one of the suggested prompts below to generate an official undertaking.`,
      timestamp: new Date(),
      source: "aicte-regulatory-engine",
    };
    setMessages([greeting]);
  }, [institution.name]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Context snapshot to pass into the API route
  const contextSnapshot = useMemo(() => {
    return {
      institution,
      stats,
      issues,
      activeIssuesCount: issues.filter((i) => !i.isResolved).length,
      criticalDeficits: issues
        .filter((i) => i.severity === "Critical" && !i.isResolved)
        .map((i) => ({
          ref: i.recordReference,
          description: i.description,
          norm: i.aicteNormReference,
        })),
      facultyCount: faculty.length,
      infrastructureCount: infrastructure.length,
    };
  }, [institution, stats, issues, faculty, infrastructure]);

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history,
          institutionContext: contextSnapshot,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.response || "No response received.",
        timestamp: new Date(),
        source: data.source || "aicte-knowledge-engine",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorFallback: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        role: "assistant",
        content: `### AICTE Compliance Copilot Notice
Unable to reach the AI server directly. Institutional snapshot:
- **Sanctioned Intake:** ${institution.sanctionedIntake} Seats
- **Regular Faculty:** ${stats.totalRegularFaculty} / ${stats.requiredFaculty} required
- **EoA Readiness Score:** ${stats.eoaReadinessScore}%

Please verify that the Next.js development server is live and retry.`,
        timestamp: new Date(),
        source: "local-fallback",
      };
      setMessages((prev) => [...prev, errorFallback]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex h-[calc(100vh-5.5rem)] flex-col gap-4">
      {/* Page Title & Context Bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-white">
              AI Compliance Copilot
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              APH 2024-25 RAG Grounded
            </span>
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">
            Autonomous regulatory auditor trained on AICTE Approval Process Handbook (APH 2024-25)
          </p>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: `reset-${Date.now()}`,
                role: "assistant",
                content: `Conversation restarted. All queries continue to reference live institutional context for **${institution.name}** (Intake: ${institution.sanctionedIntake}, FSR: 1:${stats.facultyStudentRatio}). What would you like to evaluate?`,
                timestamp: new Date(),
                source: "system",
              },
            ])
          }
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-1.5 text-xs font-bold text-zinc-300 hover:bg-white/[0.08] hover:text-white transition shadow-inner"
        >
          <RotateCcw className="h-3.5 w-3.5 text-zinc-400" />
          Reset Chat
        </button>
      </div>

      {/* Main Grid: Chat Area (8 cols) + Live Snapshot Panel (4 cols) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 flex-1 min-h-0">
        {/* Left: Chat Window (8 cols) */}
        <div className="lg:col-span-8 flex flex-col dark-glass rounded-3xl overflow-hidden min-h-0 shadow-2xl">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}
                >
                  {!isUser && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] ring-1 ring-white/20">
                      <Bot className="h-5 w-5" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "relative group max-w-[85%] rounded-2xl px-4.5 py-3.5 text-xs leading-relaxed shadow-lg transition-all",
                      isUser
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-xs shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                        : "bg-[#0c111e]/90 border border-white/[0.08] text-zinc-200 rounded-bl-xs"
                    )}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap font-semibold text-white">{message.content}</p>
                    ) : (
                      <FormattedMarkdown content={message.content} />
                    )}

                    {/* Metadata & Copy action */}
                    <div
                      className={cn(
                        "mt-3 flex items-center justify-between text-[10px] pt-2 border-t",
                        isUser ? "border-indigo-500/30 text-indigo-200" : "border-white/[0.06] text-zinc-500"
                      )}
                    >
                      <span>
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {message.source && ` • ${message.source}`}
                      </span>

                      {!isUser && (
                        <button
                          onClick={() => handleCopyMessage(message.id, message.content)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-zinc-400 hover:text-white hover:bg-white/[0.08]"
                          title="Copy response to clipboard"
                        >
                          {copiedId === message.id ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {isUser && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/[0.08] border border-white/[0.1] text-zinc-300">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 items-center">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                  <Bot className="h-5 w-5 animate-pulse" />
                </div>
                <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 flex items-center gap-3 text-xs text-zinc-300">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                  <span className="font-semibold">Auditing AICTE APH regulations against current state...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 4 Clickable Quick-Prompt Chips styled as interactive pills */}
          <div className="border-t border-white/[0.08] bg-white/[0.02] p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Recommended Scrutiny Queries
              </span>
              <span className="text-[10px] text-zinc-500">Injects real-time institutional metrics</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUICK_PROMPT_CHIPS.map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => handleSendMessage(chip.prompt)}
                  disabled={isLoading}
                  className="flex items-center justify-between gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-2.5 text-left hover:border-indigo-500/40 hover:bg-indigo-500/[0.08] transition disabled:opacity-50 shadow-inner group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <chip.icon className="h-4 w-4 shrink-0 text-indigo-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-zinc-200 truncate group-hover:text-white">
                      {chip.title}
                    </span>
                  </div>
                  <span className="shrink-0 rounded-md bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 text-[9px] font-bold text-zinc-400 uppercase">
                    {chip.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Linear / ChatGPT Style Bottom Input Bar */}
          <div className="border-t border-white/[0.08] p-3.5 bg-white/[0.01]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about AICTE norms, Chapter VII penalties, or hiring calculations..."
                disabled={isLoading}
                className="flex-1 rounded-2xl border border-white/[0.1] bg-white/[0.04] px-4.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500/70 focus:bg-white/[0.07] focus:outline-none transition"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:from-indigo-500 hover:to-violet-500 transition disabled:opacity-30 disabled:cursor-not-allowed"
                title="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500 px-1">
              <span>Grounded in AICTE Approval Process Handbook (2024-25)</span>
              <span className="hidden sm:inline">Press Enter to send</span>
            </div>
          </div>
        </div>

        {/* Right: Live Institution Snapshot Panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto">
          {/* Panel Card: Institution State */}
          <div className="dark-glass rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Institution Telemetry</h3>
              </div>
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                Live State
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Institution:</span>
                <span className="font-bold text-white truncate max-w-[170px]">
                  {institution.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">AICTE ID:</span>
                <span className="font-mono font-bold text-zinc-200">
                  {institution.aictePermanentId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Academic Year:</span>
                <span className="font-semibold text-zinc-300">{institution.academicYear}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Sanctioned Intake:</span>
                <span className="font-bold text-white">{institution.sanctionedIntake} Seats</span>
              </div>
            </div>

            {/* KPI Badges */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-white/[0.06]">
              <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-3 text-center">
                <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">EoA Score</span>
                <p
                  className={cn(
                    "text-xl font-black mt-0.5",
                    stats.eoaReadinessScore >= 85
                      ? "text-emerald-400"
                      : stats.eoaReadinessScore >= 60
                      ? "text-amber-400"
                      : "text-rose-400"
                  )}
                >
                  {stats.eoaReadinessScore}%
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-3 text-center">
                <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Current FSR</span>
                <p
                  className={cn(
                    "text-xl font-black mt-0.5",
                    stats.facultyStudentRatio <= 20 ? "text-emerald-400" : "text-amber-400"
                  )}
                >
                  1:{stats.facultyStudentRatio}
                </p>
              </div>
            </div>

            {/* Cadre Ratio Mini View */}
            <div className="rounded-2xl bg-indigo-500/10 border border-indigo-500/20 p-3.5 text-xs space-y-1.5">
              <span className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-wider">
                Cadre Ratio (P : ASP : AP)
              </span>
              <div className="flex justify-between font-mono font-extrabold text-white text-sm">
                <span>{stats.cadreRatio.professors} P</span>
                <span>:</span>
                <span>{stats.cadreRatio.associates} ASP</span>
                <span>:</span>
                <span>{stats.cadreRatio.assistants} AP</span>
              </div>
              <p className="text-[10px] text-indigo-300">
                Mandate: {stats.cadreRatio.requiredProfessors} : {stats.cadreRatio.requiredAssociates} : {stats.cadreRatio.requiredAssistants}
              </p>
            </div>
          </div>

          {/* Panel Card: Active Deficits Fed to AI */}
          <div className="dark-glass rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white">
                  Active Deficits ({issues.filter((i) => !i.isResolved).length})
                </h3>
              </div>
              <Link href="/audit" className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300">
                Open Audit
              </Link>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {issues
                .filter((i) => !i.isResolved)
                .slice(0, 4)
                .map((iss) => (
                  <div
                    key={iss.id}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[9px] font-bold border",
                          iss.severity === "Critical"
                            ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                            : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        )}
                      >
                        {iss.severity}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">{iss.category}</span>
                    </div>
                    <p className="text-[11px] font-medium text-zinc-300 line-clamp-2">
                      {iss.description}
                    </p>
                  </div>
                ))}
            </div>

            <div className="border-t border-white/[0.06] pt-3">
              <Link
                href="/audit"
                className="flex items-center justify-between w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2 text-xs font-bold text-zinc-300 hover:bg-white/[0.08] hover:text-white transition shadow-inner"
              >
                <span>Remediate Deficits in Audit</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
