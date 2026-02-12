"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, AlertCircle, RotateCcw, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { getSelectedProvider } from "@/components/shell/AIStatusIndicator";
import { ProjectDetailsCard } from "./ProjectDetailsCard";
import { KPIList } from "./KPIList";
import type { ProjectDetails, KPI } from "@/lib/types";

type UploadState = "empty" | "uploading" | "extracted" | "confirmed" | "error";

export function MoUUpload() {
  const project = useStore((s) => s.getActiveProject());
  const updateActiveProject = useStore((s) => s.updateActiveProject);

  const [state, setState] = useState<UploadState>(() => {
    if (!project) return "empty";
    if (project.mou.isConfirmed) return "confirmed";
    if (project.mou.projectDetails) return "extracted";
    return "empty";
  });
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showReUploadWarning, setShowReUploadWarning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      // Validate
      if (file.type !== "application/pdf") {
        setError("Only PDF files are accepted. Please upload a .pdf file.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit. Please upload a smaller file.");
        return;
      }

      setError(null);
      setState("uploading");

      try {
        const formData = new FormData();
        formData.append("file", file);

        const headers: HeadersInit = {};
        const provider = getSelectedProvider();
        if (provider !== "auto") {
          headers["x-ai-provider"] = provider;
        }

        const res = await fetch("/api/extract/mou", {
          method: "POST",
          headers,
          body: formData,
        });

        const json = await res.json();

        if (!json.success) {
          throw new Error(json.error || "Extraction failed");
        }

        const { projectDetails, kpis } = json.data as {
          projectDetails: ProjectDetails;
          kpis: KPI[];
        };

        setProvider(json.provider);

        updateActiveProject((p) => ({
          ...p,
          name: projectDetails.projectName || p.name,
          ngoName: projectDetails.ngoName || p.ngoName,
          mou: {
            fileName: file.name,
            uploadedAt: new Date().toISOString(),
            projectDetails,
            kpis,
            isConfirmed: false,
          },
        }));

        setState("extracted");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Extraction failed";
        setError(msg);
        setState("error");
      }
    },
    [updateActiveProject]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleReUpload = () => {
    // If already confirmed, show warning first
    if (state === "confirmed" || project?.mou.isConfirmed) {
      setShowReUploadWarning(true);
      return;
    }
    doReUpload();
  };

  const doReUpload = () => {
    const hasDownstreamData =
      project &&
      (project.reports.progressData.length > 0 ||
        project.evidence.files.length > 0 ||
        project.sroi.calculatedRatio !== null);

    updateActiveProject((p) => ({
      ...p,
      mou: {
        fileName: null,
        uploadedAt: null,
        projectDetails: null,
        kpis: [],
        isConfirmed: false,
      },
      stageStatus: { ...p.stageStatus, stage1Complete: false },
      // Clear downstream data that was linked to old KPIs
      ...(hasDownstreamData
        ? {
            reports: { files: p.reports.files, progressData: [] },
            evidence: { files: p.evidence.files, validationResults: [] },
            sroi: {
              investment: p.sroi.investment,
              outcomes: [],
              adjustments: p.sroi.adjustments,
              calculatedRatio: null,
            },
            report: { generatedAt: null },
            stageStatus: {
              stage1Complete: false,
              stage2Complete: false,
              stage3Complete: false,
              stage4Complete: false,
              stage5Complete: false,
            },
          }
        : {}),
    }));
    setState("empty");
    setError(null);
    setProvider(null);
    setShowReUploadWarning(false);
  };

  const handleConfirm = () => {
    updateActiveProject((p) => ({
      ...p,
      mou: { ...p.mou, isConfirmed: true },
      stageStatus: { ...p.stageStatus, stage1Complete: true },
    }));
    setState("confirmed");
  };

  const handleManualEntry = () => {
    updateActiveProject((p) => ({
      ...p,
      mou: {
        fileName: null,
        uploadedAt: new Date().toISOString(),
        projectDetails: {
          projectName: p.name,
          ngoName: p.ngoName || "",
          location: "",
          duration: "",
          startDate: "",
          totalBudget: null,
        },
        kpis: [],
        isConfirmed: false,
      },
    }));
    setState("extracted");
    setError(null);
  };

  if (!project) return null;

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {/* Upload zone - shown in empty and error states */}
        {(state === "empty" || state === "error") && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all duration-300 ${
                dragOver
                  ? "border-teal bg-teal/[0.04] scale-[1.01]"
                  : "border-slate-300 bg-offwhite hover:border-teal hover:bg-teal/[0.02]"
              }`}
            >
              <Upload
                className={`h-12 w-12 ${dragOver ? "text-teal" : "text-slate-400"}`}
                strokeWidth={1.5}
              />
              <p className="mt-4 text-base font-medium text-dark">
                Drop MoU PDF here or click to browse
              </p>
              <p className="mt-1 text-sm text-muted">
                PDF files up to 10MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                  e.target.value = "";
                }}
              />
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
                <div>
                  <p className="text-sm font-medium text-danger">{error}</p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleManualEntry();
                      }}
                    >
                      Enter Manually
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Processing state */}
        {state === "uploading" && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-teal bg-white p-16"
          >
            <Loader2 className="h-10 w-10 animate-spin text-teal" />
            <p className="mt-4 text-base font-medium text-dark">
              Analyzing document with AI...
            </p>
            <p className="mt-1 text-sm text-muted">
              Extracting project details and KPIs
            </p>
          </motion.div>
        )}

        {/* Extracted / Confirmed data */}
        {(state === "extracted" || state === "confirmed") &&
          project.mou.projectDetails && (
            <motion.div
              key="extracted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* File info bar */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-between rounded-lg border border-border bg-white px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-teal" />
                  <div>
                    <p className="text-sm font-medium text-dark">
                      {project.mou.fileName || "Manual Entry"}
                    </p>
                    {provider && (
                      <p className="text-xs text-muted">
                        Extracted using {provider === "claude" ? "Claude AI" : "Local AI"}
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleReUpload}>
                  <RotateCcw className="h-3.5 w-3.5" />
                  {project.mou.isConfirmed ? "Upload Revised MoU" : "Re-upload"}
                </Button>
              </motion.div>

              {/* Project Details Card */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <ProjectDetailsCard
                  details={project.mou.projectDetails}
                  isLocked={project.mou.isConfirmed}
                  onUpdate={(details) =>
                    updateActiveProject((p) => ({
                      ...p,
                      mou: { ...p.mou, projectDetails: details },
                    }))
                  }
                />
              </motion.div>

              {/* KPI List */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <KPIList
                  kpis={project.mou.kpis}
                  isLocked={project.mou.isConfirmed}
                  onUpdate={(kpis) =>
                    updateActiveProject((p) => ({
                      ...p,
                      mou: { ...p.mou, kpis },
                    }))
                  }
                />
              </motion.div>

              {/* Confirm / Locked status */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-end gap-3"
              >
                {project.mou.isConfirmed ? (
                  <div className="flex items-center gap-2 rounded-full bg-success/10 px-4 py-2 text-sm font-medium text-success">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    Data confirmed — proceed to Stage 2
                  </div>
                ) : (
                  <Button onClick={handleConfirm} disabled={project.mou.kpis.length === 0}>
                    Confirm & Lock Data
                  </Button>
                )}
              </motion.div>
            </motion.div>
          )}
      </AnimatePresence>

      {/* Re-upload warning modal */}
      <AnimatePresence>
        {showReUploadWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setShowReUploadWarning(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/10">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-dark">
                    Upload Revised MoU?
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    Uploading a new MoU will replace the current KPIs. The following
                    linked data will be reset:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-sm text-body">
                    {project!.reports.progressData.length > 0 && (
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                        Progress data ({project!.reports.progressData.length} KPI
                        matchings)
                      </li>
                    )}
                    {project!.evidence.validationResults.length > 0 && (
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                        Evidence validation results
                      </li>
                    )}
                    {project!.sroi.calculatedRatio !== null && (
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                        SROI calculation (ratio:{" "}
                        {project!.sroi.calculatedRatio.toFixed(2)})
                      </li>
                    )}
                  </ul>
                  <p className="mt-3 text-xs text-muted">
                    Uploaded files (reports, evidence) will be kept — only KPI-linked
                    data is reset. You can re-process them after the new MoU is confirmed.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReUploadWarning(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-warning text-white hover:bg-warning/90"
                  onClick={doReUpload}
                >
                  Replace MoU
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
