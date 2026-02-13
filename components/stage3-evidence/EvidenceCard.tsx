"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  FileSpreadsheet,
  Image as ImageIcon,
  FileText,
  Trash2,
  MessageSquare,
  Tag,
  X,
  Loader2,
} from "lucide-react";
import type { EvidenceFile, KPI } from "@/lib/types";

const TYPE_CONFIG = {
  survey: {
    icon: FileSpreadsheet,
    color: "border-l-blue-500",
    badge: "bg-blue-50 text-blue-700",
    label: "Survey",
  },
  photo: {
    icon: ImageIcon,
    color: "border-l-emerald-500",
    badge: "bg-emerald-50 text-emerald-700",
    label: "Photo",
  },
  document: {
    icon: FileText,
    color: "border-l-slate-400",
    badge: "bg-slate-100 text-slate-600",
    label: "Document",
  },
} as const;

interface EvidenceCardProps {
  evidence: EvidenceFile;
  kpis: KPI[];
  isLocked: boolean;
  isSuggesting?: boolean;
  onUpdate: (updated: EvidenceFile) => void;
  onDelete: () => void;
}

export function EvidenceCard({
  evidence,
  kpis,
  isLocked,
  isSuggesting = false,
  onUpdate,
  onDelete,
}: EvidenceCardProps) {
  const [showNotes, setShowNotes] = useState(!!evidence.notes);
  const [showKpiDropdown, setShowKpiDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const config = TYPE_CONFIG[evidence.fileType];

  // Close dropdown on outside click
  useEffect(() => {
    if (!showKpiDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowKpiDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showKpiDropdown]);
  const Icon = config.icon;

  const handleToggleKpi = (kpiId: string) => {
    const linked = evidence.linkedKpiIds.includes(kpiId)
      ? evidence.linkedKpiIds.filter((id) => id !== kpiId)
      : [...evidence.linkedKpiIds, kpiId];
    onUpdate({ ...evidence, linkedKpiIds: linked });
  };

  const handleNotesChange = (notes: string) => {
    onUpdate({ ...evidence, notes: notes || null });
  };

  return (
    <div
      className={`group relative rounded-xl border border-border border-l-4 bg-white shadow-sm transition-shadow hover:shadow-md ${config.color}`}
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Thumbnail or icon */}
          {evidence.thumbnail ? (
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border">
              <img
                src={evidence.thumbnail}
                alt={evidence.fileName}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-50">
              <Icon className="h-6 w-6 text-slate-400" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-dark">
              {evidence.fileName}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.badge}`}
              >
                {config.label}
              </span>
              {evidence.metadata.rowCount != null && (
                <span className="text-xs text-muted">
                  {evidence.metadata.rowCount} rows
                </span>
              )}
              {evidence.metadata.location && (
                <span className="text-xs text-muted">
                  {evidence.metadata.location}
                </span>
              )}
              {evidence.metadata.dateTaken && (
                <span className="text-xs text-muted">
                  {evidence.metadata.dateTaken}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          {!isLocked && (
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="rounded p-1 text-muted hover:bg-slate-100 hover:text-dark"
                title="Add notes"
              >
                <MessageSquare className="h-4 w-4" />
              </button>
              <button
                onClick={onDelete}
                className="rounded p-1 text-muted hover:bg-red-50 hover:text-danger"
                title="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* KPI tags */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {evidence.linkedKpiIds.map((kpiId) => {
            const kpi = kpis.find((k) => k.id === kpiId);
            if (!kpi) return null;
            return (
              <span
                key={kpiId}
                className="inline-flex items-center gap-1 rounded-full bg-teal/10 px-2 py-0.5 text-[11px] font-medium text-teal"
              >
                {kpi.name}
                {!isLocked && (
                  <button
                    onClick={() => handleToggleKpi(kpiId)}
                    className="hover:text-teal/70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            );
          })}

          {isSuggesting && (
            <span className="inline-flex items-center gap-1 rounded-full bg-stage-3/10 px-2 py-0.5 text-[11px] font-medium text-stage-3">
              <Loader2 className="h-3 w-3 animate-spin" />
              Linking KPIs...
            </span>
          )}

          {!isLocked && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowKpiDropdown(!showKpiDropdown)}
                className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-2 py-0.5 text-[11px] text-muted hover:border-teal hover:text-teal"
              >
                <Tag className="h-3 w-3" />
                Link KPI
              </button>

              {showKpiDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-0 top-full z-10 mt-1 max-h-56 w-80 overflow-y-auto rounded-lg border border-border bg-white p-1 shadow-lg"
                >
                  {kpis.map((kpi) => {
                    const isLinked = evidence.linkedKpiIds.includes(kpi.id);
                    return (
                      <button
                        key={kpi.id}
                        onClick={() => {
                          handleToggleKpi(kpi.id);
                          setShowKpiDropdown(false);
                        }}
                        className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors ${
                          isLinked
                            ? "bg-teal/10 text-teal"
                            : "text-dark hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`h-3 w-3 rounded border ${
                            isLinked
                              ? "border-teal bg-teal"
                              : "border-slate-300"
                          }`}
                        >
                          {isLinked && (
                            <svg viewBox="0 0 12 12" className="text-white">
                              <path
                                d="M10 3L4.5 8.5 2 6"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="leading-tight">{kpi.name}</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Notes */}
        {showNotes && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3"
          >
            <textarea
              value={evidence.notes || ""}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Add notes about this evidence..."
              disabled={isLocked}
              rows={2}
              className="w-full rounded-lg border border-border bg-slate-50 px-3 py-2 text-xs text-dark placeholder:text-muted focus:border-teal focus:outline-none disabled:opacity-60"
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
