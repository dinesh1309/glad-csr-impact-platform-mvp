"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Loader2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { getSelectedProvider } from "@/components/shell/AIStatusIndicator";
import { EvidenceCard } from "./EvidenceCard";
import { ValidationSummary } from "./ValidationSummary";
import type { EvidenceFile, ValidationResult } from "@/lib/types";

const ACCEPTED_TYPES = [
  "application/pdf",
  "text/csv",
  "image/jpeg",
  "image/png",
];
const MAX_SIZE = 10 * 1024 * 1024;

function detectFileType(file: File): EvidenceFile["fileType"] {
  if (file.type === "text/csv" || file.name.endsWith(".csv")) return "survey";
  if (file.type.startsWith("image/")) return "photo";
  return "document";
}

async function readImageThumbnail(file: File): Promise<string | null> {
  if (!file.type.startsWith("image/")) return null;
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

async function parseCSVMeta(
  file: File
): Promise<{ rowCount: number } | null> {
  try {
    const text = await file.text();
    const lines = text.trim().split("\n");
    // Subtract 1 for header row
    return { rowCount: Math.max(lines.length - 1, 0) };
  } catch {
    return null;
  }
}

export function EvidenceUpload() {
  const project = useStore((s) => s.getActiveProject());
  const updateActiveProject = useStore((s) => s.updateActiveProject);

  const [dragOver, setDragOver] = useState(false);
  const [validating, setValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLocked = project?.stageStatus.stage3Complete ?? false;

  // --- Handle file uploads ---
  const handleFiles = useCallback(
    async (fileList: FileList) => {
      if (!project || isLocked) return;

      const validFiles = Array.from(fileList).filter(
        (f) =>
          (ACCEPTED_TYPES.includes(f.type) || f.name.endsWith(".csv")) &&
          f.size <= MAX_SIZE
      );
      if (validFiles.length === 0) return;

      // Build evidence entries with metadata
      const newEntries: EvidenceFile[] = await Promise.all(
        validFiles.map(async (file) => {
          const fileType = detectFileType(file);
          const thumbnail = await readImageThumbnail(file);
          const csvMeta =
            fileType === "survey" ? await parseCSVMeta(file) : null;

          return {
            id: crypto.randomUUID(),
            fileName: file.name,
            fileType,
            uploadedAt: new Date().toISOString(),
            linkedKpiIds: [],
            notes: null,
            thumbnail,
            metadata: {
              ...(csvMeta ? { rowCount: csvMeta.rowCount } : {}),
            },
          };
        })
      );

      updateActiveProject((p) => ({
        ...p,
        evidence: {
          ...p.evidence,
          files: [...p.evidence.files, ...newEntries],
        },
      }));
    },
    [project, isLocked, updateActiveProject]
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

  const handleUpdateEvidence = (updated: EvidenceFile) => {
    updateActiveProject((p) => ({
      ...p,
      evidence: {
        ...p.evidence,
        files: p.evidence.files.map((f) =>
          f.id === updated.id ? updated : f
        ),
      },
    }));
  };

  const handleDeleteEvidence = (id: string) => {
    updateActiveProject((p) => ({
      ...p,
      evidence: {
        ...p.evidence,
        files: p.evidence.files.filter((f) => f.id !== id),
      },
    }));
  };

  // --- Run AI validation ---
  const handleValidate = async () => {
    if (!project) return;
    setValidating(true);

    try {
      const linkedFiles = project.evidence.files.filter(
        (f) => f.linkedKpiIds.length > 0
      );

      // Build evidence metadata string
      const evidenceMetadata = linkedFiles
        .map(
          (f) =>
            `- ${f.fileName} (${f.fileType}): linked to KPIs [${f.linkedKpiIds.join(", ")}]` +
            (f.metadata.rowCount != null
              ? `, ${f.metadata.rowCount} data rows`
              : "") +
            (f.notes ? `, notes: "${f.notes}"` : "")
        )
        .join("\n");

      // Build KPI data with reported values from progress data
      const kpis = project.mou.kpis;
      const progress = project.reports.progressData;
      const linkedKpiData = kpis
        .filter((kpi) =>
          linkedFiles.some((f) => f.linkedKpiIds.includes(kpi.id))
        )
        .map((kpi) => {
          const pd = progress.find((p) => p.kpiId === kpi.id);
          return `- ${kpi.id}: ${kpi.name} (target: ${kpi.targetValue} ${kpi.unit}, reported: ${pd?.currentValue ?? "N/A"})`;
        })
        .join("\n");

      const provider = getSelectedProvider();
      const res = await fetch("/api/extract/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evidenceMetadata,
          linkedKpiData,
          ...(provider !== "auto" ? { providerOverride: provider } : {}),
        }),
      });

      const json = await res.json();

      if (json.success) {
        const results = json.data as ValidationResult[];
        updateActiveProject((p) => ({
          ...p,
          evidence: { ...p.evidence, validationResults: results },
        }));
      }
    } catch (err) {
      console.error("Validation failed:", err);
    } finally {
      setValidating(false);
    }
  };

  const handleConfirm = () => {
    updateActiveProject((p) => ({
      ...p,
      stageStatus: { ...p.stageStatus, stage3Complete: true },
    }));
  };

  if (!project) return null;

  const kpis = project.mou.kpis;
  const files = project.evidence.files;
  const hasFiles = files.length > 0;
  const hasLinkedFiles = files.some((f) => f.linkedKpiIds.length > 0);
  const hasValidation = project.evidence.validationResults.length > 0;

  // Evidence count summary
  const kpisWithEvidence = new Set(files.flatMap((f) => f.linkedKpiIds)).size;

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      {!isLocked && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-all duration-300 ${
              dragOver
                ? "border-stage-3 bg-stage-3/[0.04] scale-[1.01]"
                : "border-slate-300 bg-offwhite hover:border-stage-3 hover:bg-stage-3/[0.02]"
            }`}
          >
            <Upload
              className={`h-10 w-10 ${dragOver ? "text-stage-3" : "text-slate-400"}`}
              strokeWidth={1.5}
            />
            <p className="mt-3 text-base font-medium text-dark">
              Drop evidence files here or click to browse
            </p>
            <p className="mt-1 text-sm text-muted">
              PDF documents, CSV surveys, or JPG/PNG photos (up to 10MB each)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.csv,.jpg,.jpeg,.png"
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

      {/* Evidence count bar */}
      {hasFiles && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between rounded-lg border border-border bg-white px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <FolderOpen className="h-5 w-5 text-stage-3" />
            <div>
              <p className="text-sm font-medium text-dark">
                {files.length} evidence file{files.length !== 1 ? "s" : ""}{" "}
                uploaded
              </p>
              <p className="text-xs text-muted">
                {kpisWithEvidence} of {kpis.length} KPIs have linked evidence
              </p>
            </div>
          </div>
          {!isLocked && hasLinkedFiles && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleValidate}
              disabled={validating}
            >
              {validating ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Validating...
                </>
              ) : (
                "Run Validation"
              )}
            </Button>
          )}
        </motion.div>
      )}

      {/* Evidence cards */}
      {hasFiles && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <AnimatePresence>
            {files.map((evidence, i) => (
              <motion.div
                key={evidence.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.1 }}
              >
                <EvidenceCard
                  evidence={evidence}
                  kpis={kpis}
                  isLocked={isLocked}
                  onUpdate={handleUpdateEvidence}
                  onDelete={() => handleDeleteEvidence(evidence.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Validation results */}
      {hasValidation && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ValidationSummary results={project.evidence.validationResults} />
        </motion.div>
      )}

      {/* Confirm / Locked */}
      {hasFiles && (
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
              Evidence confirmed — proceed to Stage 4
            </div>
          ) : (
            <Button onClick={handleConfirm}>Confirm & Lock Evidence</Button>
          )}
        </motion.div>
      )}
    </div>
  );
}
