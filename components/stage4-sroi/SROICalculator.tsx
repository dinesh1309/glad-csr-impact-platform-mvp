"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { IndianRupee } from "lucide-react";
import { useStore } from "@/lib/store";
import { calculateSROI, buildOutcomesFromProgress } from "@/lib/calculations";
import { OutcomesTable } from "./OutcomesTable";
import { AdjustmentSliders } from "./AdjustmentSliders";
import { CalculationBreakdown } from "./CalculationBreakdown";
import { SROIDisplay } from "./SROIDisplay";
import type { OutcomeItem, AdjustmentFactors } from "@/lib/types";

export function SROICalculator() {
  const project = useStore((s) => s.getActiveProject());
  const updateActiveProject = useStore((s) => s.updateActiveProject);

  // Auto-populate outcomes from progress data on first visit,
  // or re-populate if all monetized values are still zero (pre-fill upgrade)
  useEffect(() => {
    if (!project) return;
    if (project.reports.progressData.length === 0) return;

    const allZero =
      project.sroi.outcomes.length === 0 ||
      project.sroi.outcomes.every((o) => o.monetizedValue === 0);
    if (!allZero) return;

    const outcomes = buildOutcomesFromProgress(project.reports.progressData);
    updateActiveProject((p) => ({
      ...p,
      sroi: { ...p.sroi, outcomes },
    }));
  }, [project, updateActiveProject]);

  // Live SROI calculation
  const calc = useMemo(() => {
    if (!project) return null;
    return calculateSROI(
      project.sroi.outcomes,
      project.sroi.investment,
      project.sroi.adjustments
    );
  }, [project]);

  // Auto-save calculatedRatio (enables Continue button) but don't lock the stage
  useEffect(() => {
    if (!project || !calc) return;
    const newRatio = calc.sroiRatio > 0 ? calc.sroiRatio : null;
    if (project.sroi.calculatedRatio !== newRatio) {
      updateActiveProject((p) => ({
        ...p,
        sroi: { ...p.sroi, calculatedRatio: newRatio },
      }));
    }
  }, [calc, project, updateActiveProject]);

  if (!project) return null;

  const isLocked = project.stageStatus.stage4Complete;

  const handleOutcomesUpdate = (outcomes: OutcomeItem[]) => {
    updateActiveProject((p) => ({
      ...p,
      sroi: { ...p.sroi, outcomes },
    }));
  };

  const handleInvestmentChange = (value: number) => {
    updateActiveProject((p) => ({
      ...p,
      sroi: { ...p.sroi, investment: value },
    }));
  };

  const handleAdjustmentsChange = (adjustments: AdjustmentFactors) => {
    updateActiveProject((p) => ({
      ...p,
      sroi: { ...p.sroi, adjustments },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Outcomes table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <OutcomesTable
          outcomes={project.sroi.outcomes}
          isLocked={isLocked}
          onUpdate={handleOutcomesUpdate}
        />
      </motion.div>

      {/* Investment input + Adjustment sliders side by side */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Investment input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-semibold text-dark">
            Total Investment
          </h3>
          <div className="rounded-xl border border-border bg-white p-5">
            <label className="text-xs text-muted">
              Project investment amount (₹)
            </label>
            <div className="mt-2 flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-muted" />
              <input
                type="number"
                value={project.sroi.investment || ""}
                onChange={(e) =>
                  handleInvestmentChange(parseFloat(e.target.value) || 0)
                }
                placeholder="Enter total investment"
                disabled={isLocked}
                className="flex-1 rounded-lg border border-border px-3 py-2 text-lg font-semibold text-dark placeholder:text-muted focus:border-teal focus:outline-none disabled:opacity-60"
              />
            </div>
            {project.sroi.investment > 0 && (
              <p className="mt-2 text-xs text-muted">
                ₹{project.sroi.investment.toLocaleString()}
              </p>
            )}
          </div>
        </motion.div>

        {/* Adjustment sliders */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AdjustmentSliders
            adjustments={project.sroi.adjustments}
            isLocked={isLocked}
            onChange={handleAdjustmentsChange}
          />
        </motion.div>
      </div>

      {/* Calculation breakdown */}
      {calc && calc.grossOutcomeValue > 0 && calc.investment > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <CalculationBreakdown calc={calc} />
        </motion.div>
      )}

      {/* SROI Display */}
      {calc && calc.sroiRatio > 0 && <SROIDisplay ratio={calc.sroiRatio} />}

      {/* Auto-complete indicator */}
      {isLocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-end"
        >
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
            SROI calculated — proceed to Stage 5
          </div>
        </motion.div>
      )}
    </div>
  );
}
