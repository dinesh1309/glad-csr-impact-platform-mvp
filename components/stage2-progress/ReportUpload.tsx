"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { getSelectedProvider } from "@/components/shell/AIStatusIndicator";
import { ReportList } from "./ReportList";
import { ProgressDashboard } from "./ProgressDashboard";
import type {
  ReportFile,
  ReportExtraction,
  ProgressDataPoint,
  KPI,
  KPIValue,
} from "@/lib/types";

export function ReportUpload() {
  const project = useStore((s) => s.getActiveProject());
  const updateActiveProject = useStore((s) => s.updateActiveProject);

  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLocked = project?.stageStatus.stage2Complete ?? false;

  // --- Process a single file through the extraction API ---
  const processFile = useCallback(
    async (reportFile: ReportFile, file: File, kpis: KPI[]) => {
      // Mark as processing
      updateActiveProject((p) => ({
        ...p,
        reports: {
          ...p.reports,
          files: p.reports.files.map((f) =>
            f.id === reportFile.id ? { ...f, status: "processing" as const } : f
          ),
        },
      }));

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("kpis", JSON.stringify(kpis));

        const headers: HeadersInit = {};
        const provider = getSelectedProvider();
        if (provider !== "auto") {
          headers["x-ai-provider"] = provider;
        }

        const res = await fetch("/api/extract/report", {
          method: "POST",
          headers,
          body: formData,
        });

        const json = await res.json();

        if (!json.success) {
          throw new Error(json.error || "Extraction failed");
        }

        const extraction = json.data as ReportExtraction;

        // Mark as completed with extracted data
        updateActiveProject((p) => {
          const updatedFiles = p.reports.files.map((f) =>
            f.id === reportFile.id
              ? {
                  ...f,
                  status: "completed" as const,
                  reportPeriod: extraction.reportPeriod || f.reportPeriod,
                  extractedData: extraction,
                }
              : f
          );

          // Recompute progress data from all completed reports
          const progressData = computeProgressData(p.mou.kpis, updatedFiles);

          return {
            ...p,
            reports: { files: updatedFiles, progressData },
          };
        });
      } catch {
        // Mark as error
        updateActiveProject((p) => ({
          ...p,
          reports: {
            ...p.reports,
            files: p.reports.files.map((f) =>
              f.id === reportFile.id ? { ...f, status: "error" as const } : f
            ),
          },
        }));
      }
    },
    [updateActiveProject]
  );

  // --- Handle multi-file selection ---
  const handleFiles = useCallback(
    async (fileList: FileList) => {
      if (!project || isLocked) return;

      const pdfs = Array.from(fileList).filter(
        (f) => f.type === "application/pdf" && f.size <= 10 * 1024 * 1024
      );
      if (pdfs.length === 0) return;

      // Create ReportFile entries for all files
      const newEntries: ReportFile[] = pdfs.map((f) => ({
        id: crypto.randomUUID(),
        fileName: f.name,
        uploadedAt: new Date().toISOString(),
        reportPeriod: "",
        status: "pending" as const,
        extractedData: null,
      }));

      // Add all to store
      updateActiveProject((p) => ({
        ...p,
        reports: {
          ...p.reports,
          files: [...p.reports.files, ...newEntries],
        },
      }));

      // Process sequentially
      setProcessing(true);
      const kpis = project.mou.kpis;
      for (let i = 0; i < pdfs.length; i++) {
        await processFile(newEntries[i], pdfs[i], kpis);
      }
      setProcessing(false);
    },
    [project, isLocked, updateActiveProject, processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDeleteReport = (id: string) => {
    updateActiveProject((p) => {
      const updatedFiles = p.reports.files.filter((f) => f.id !== id);
      const progressData = computeProgressData(p.mou.kpis, updatedFiles);
      return {
        ...p,
        reports: { files: updatedFiles, progressData },
      };
    });
  };

  const handleOverride = (kpiId: string, newValue: number) => {
    updateActiveProject((p) => {
      const progressData = p.reports.progressData.map((pd) => {
        if (pd.kpiId !== kpiId) return pd;
        const pct = pd.targetValue > 0 ? (newValue / pd.targetValue) * 100 : 0;
        return {
          ...pd,
          currentValue: newValue,
          percentageAchieved: pct,
          status: getStatus(pct),
        };
      });
      return {
        ...p,
        reports: { ...p.reports, progressData },
      };
    });
  };

  const handleConfirm = () => {
    updateActiveProject((p) => ({
      ...p,
      stageStatus: { ...p.stageStatus, stage2Complete: true },
    }));
  };

  if (!project) return null;

  const hasCompleted = project.reports.files.some((f) => f.status === "completed");
  const hasProgressData = project.reports.progressData.length > 0;

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {/* Upload zone — always visible unless locked */}
        {!isLocked && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !processing && fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-all duration-300 ${
                dragOver
                  ? "border-stage-2 bg-stage-2/[0.04] scale-[1.01]"
                  : processing
                    ? "pointer-events-none border-stage-2 bg-white"
                    : "border-slate-300 bg-offwhite hover:border-stage-2 hover:bg-stage-2/[0.02]"
              }`}
            >
              {processing ? (
                <>
                  <Loader2 className="h-10 w-10 animate-spin text-stage-2" />
                  <p className="mt-3 text-base font-medium text-dark">
                    Processing reports with AI...
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Matching reported values against KPIs
                  </p>
                </>
              ) : (
                <>
                  <Upload
                    className={`h-10 w-10 ${dragOver ? "text-stage-2" : "text-slate-400"}`}
                    strokeWidth={1.5}
                  />
                  <p className="mt-3 text-base font-medium text-dark">
                    Drop progress report PDFs here or click to browse
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Upload one or more PDF reports (up to 10MB each)
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFiles(e.target.files);
                  }
                  e.target.value = "";
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report list */}
      {project.reports.files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ReportList
            files={project.reports.files}
            isLocked={isLocked}
            onDelete={handleDeleteReport}
          />
        </motion.div>
      )}

      {/* Progress dashboard */}
      {hasProgressData && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ProgressDashboard
            progressData={project.reports.progressData}
            isLocked={isLocked}
            onOverride={handleOverride}
          />
        </motion.div>
      )}

      {/* Confirm / Locked */}
      {hasCompleted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-end gap-3"
        >
          {isLocked ? (
            <div className="flex items-center gap-2 rounded-full bg-success/10 px-4 py-2 text-sm font-medium text-success">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Progress confirmed — proceed to Stage 3
            </div>
          ) : (
            <Button
              onClick={handleConfirm}
              disabled={!hasProgressData}
            >
              Confirm & Lock Progress
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
}

// --- Helpers ---

function getStatus(pct: number): "on-track" | "at-risk" | "behind" {
  if (pct >= 90) return "on-track";
  if (pct >= 60) return "at-risk";
  return "behind";
}

/**
 * Compute ProgressDataPoint[] by aggregating all completed report extractions
 * against the MoU KPIs. For each KPI, takes the latest (highest) reported value
 * and builds a history from all reports.
 */
function computeProgressData(
  kpis: KPI[],
  files: ReportFile[]
): ProgressDataPoint[] {
  const completedFiles = files.filter(
    (f) => f.status === "completed" && f.extractedData
  );

  if (completedFiles.length === 0 || kpis.length === 0) return [];

  // Collect all KPI values across all reports
  const kpiValuesMap = new Map<string, KPIValue[]>();
  for (const file of completedFiles) {
    for (const kv of file.extractedData!.kpiValues) {
      const existing = kpiValuesMap.get(kv.kpiId) || [];
      existing.push(kv);
      kpiValuesMap.set(kv.kpiId, existing);
    }
  }

  return kpis
    .filter((kpi) => kpiValuesMap.has(kpi.id))
    .map((kpi) => {
      const values = kpiValuesMap.get(kpi.id)!;
      // Sort by date for history
      const sorted = [...values].sort(
        (a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime()
      );
      // Current value = latest reported value
      const currentValue = sorted[sorted.length - 1].reportedValue;
      const pct = kpi.targetValue > 0 ? (currentValue / kpi.targetValue) * 100 : 0;

      return {
        kpiId: kpi.id,
        kpiName: kpi.name,
        targetValue: kpi.targetValue,
        currentValue,
        unit: kpi.unit,
        percentageAchieved: pct,
        status: getStatus(pct),
        history: sorted.map((v) => ({
          date: v.reportDate,
          value: v.reportedValue,
        })),
      };
    });
}
