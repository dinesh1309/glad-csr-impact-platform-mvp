"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Download, RefreshCw, FileText, CheckCircle2 } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { useStore } from "@/lib/store";
import { ReportPreview } from "./ReportPreview";
import { PDFReport } from "./PDFDocument";

export function ReportGeneration() {
  const project = useStore((s) => s.getActiveProject());
  const updateActiveProject = useStore((s) => s.updateActiveProject);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!project) return;
    setGenerating(true);

    try {
      const blob = await pdf(<PDFReport project={project} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.name.replace(/[^a-zA-Z0-9]/g, "-")}-Impact-Report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setGenerated(true);

      // Mark stage 5 as complete and save generation timestamp
      updateActiveProject((p) => ({
        ...p,
        report: { generatedAt: new Date().toISOString() },
        stageStatus: { ...p.stageStatus, stage5Complete: true },
      }));
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setGenerating(false);
    }
  }, [project, updateActiveProject]);

  const handleRegenerate = useCallback(() => {
    setGenerated(false);
  }, []);

  if (!project) return null;

  const hasData =
    project.mou.kpis.length > 0 ||
    project.reports.progressData.length > 0 ||
    project.sroi.calculatedRatio !== null;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stage-5/10">
            <FileText className="h-5 w-5 text-stage-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-dark">
              Impact Assessment Report
            </h3>
            <p className="text-xs text-muted">
              {project.report.generatedAt
                ? `Last generated: ${new Date(project.report.generatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}`
                : "Preview your compiled report and download as PDF"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {generated && (
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-light-gray hover:text-dark"
            >
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </button>
          )}

          <button
            onClick={handleDownload}
            disabled={generating || !hasData}
            className="flex items-center gap-2 rounded-lg bg-teal px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-teal-dark disabled:opacity-50"
          >
            {generating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : generated ? (
              <>
                <Download className="h-4 w-4" />
                Download Again
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Success banner */}
      {generated && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl border border-success/20 bg-success/5 px-5 py-3"
        >
          <CheckCircle2 className="h-5 w-5 text-success" />
          <p className="text-sm font-medium text-success">
            PDF generated and downloaded successfully!
          </p>
        </motion.div>
      )}

      {/* No data warning */}
      {!hasData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-warning/20 bg-warning/5 px-5 py-4 text-center"
        >
          <p className="text-sm font-medium text-warning">
            Complete previous stages to generate a meaningful report.
          </p>
          <p className="mt-1 text-xs text-muted">
            Upload a MoU, progress reports, evidence, and calculate SROI first.
          </p>
        </motion.div>
      )}

      {/* Report Preview */}
      {hasData && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ReportPreview project={project} />
        </motion.div>
      )}
    </div>
  );
}
