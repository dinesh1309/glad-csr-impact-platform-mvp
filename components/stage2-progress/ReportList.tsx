"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FileText, Loader2, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import type { ReportFile } from "@/lib/types";

const STATUS_DISPLAY = {
  pending: {
    icon: FileText,
    color: "text-slate-400",
    label: "Queued",
    bg: "bg-slate-50",
  },
  processing: {
    icon: Loader2,
    color: "text-teal",
    label: "Processing...",
    bg: "bg-teal/5",
  },
  completed: {
    icon: CheckCircle2,
    color: "text-success",
    label: "Completed",
    bg: "bg-success/5",
  },
  error: {
    icon: XCircle,
    color: "text-danger",
    label: "Failed",
    bg: "bg-danger/5",
  },
} as const;

interface ReportListProps {
  files: ReportFile[];
  isLocked: boolean;
  onDelete: (id: string) => void;
}

export function ReportList({ files, isLocked, onDelete }: ReportListProps) {
  if (files.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-dark">Uploaded Reports</h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-muted">
          {files.length}
        </span>
      </div>
      <div className="space-y-2">
        <AnimatePresence>
          {files.map((file) => {
            const status = STATUS_DISPLAY[file.status];
            const Icon = status.icon;
            return (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, height: 0 }}
                className={`group flex items-center gap-3 rounded-lg border border-border px-4 py-3 ${status.bg}`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${status.color} ${
                    file.status === "processing" ? "animate-spin" : ""
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-dark">
                    {file.fileName}
                  </p>
                  <p className="text-xs text-muted">
                    {file.reportPeriod || "Period not yet extracted"}
                    {file.extractedData &&
                      ` — ${file.extractedData.kpiValues.length} KPI values matched`}
                  </p>
                </div>
                <span className={`text-xs font-medium ${status.color}`}>
                  {status.label}
                </span>
                {!isLocked && file.status !== "processing" && (
                  <button
                    onClick={() => onDelete(file.id)}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    title="Remove report"
                  >
                    <Trash2 className="h-4 w-4 text-muted hover:text-danger" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
