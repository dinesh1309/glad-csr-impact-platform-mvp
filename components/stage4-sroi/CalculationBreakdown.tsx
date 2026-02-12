"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { SROICalculation } from "@/lib/types";

interface CalculationBreakdownProps {
  calc: SROICalculation;
}

const STEPS = [
  { key: "grossOutcomeValue" as const, label: "Gross Value" },
  { key: "afterDeadweight" as const, label: "After Deadweight" },
  { key: "afterAttribution" as const, label: "After Attribution" },
  { key: "afterDropoff" as const, label: "After Drop-off" },
] as const;

export function CalculationBreakdown({ calc }: CalculationBreakdownProps) {
  if (calc.grossOutcomeValue === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-dark">
        Calculation Breakdown
      </h3>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-white p-5">
        {STEPS.map((step, i) => (
          <div key={step.key} className="flex items-center gap-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15 }}
              className="rounded-lg bg-slate-50 px-3 py-2 text-center"
            >
              <p className="text-[10px] font-medium text-muted">
                {step.label}
              </p>
              <p className="text-sm font-bold text-dark">
                ₹{calc[step.key].toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </p>
            </motion.div>
            {i < STEPS.length - 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.15 + 0.1 }}
              >
                <ArrowRight className="h-4 w-4 text-slate-300" />
              </motion.div>
            )}
          </div>
        ))}

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mx-1 text-lg font-bold text-slate-300"
        >
          ÷
        </motion.div>

        {/* Investment */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="rounded-lg bg-navy/5 px-3 py-2 text-center"
        >
          <p className="text-[10px] font-medium text-muted">Investment</p>
          <p className="text-sm font-bold text-navy">
            ₹{calc.investment.toLocaleString()}
          </p>
        </motion.div>

        {/* Equals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mx-1 text-lg font-bold text-slate-300"
        >
          =
        </motion.div>

        {/* Result */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
          className="rounded-lg bg-amber-50 px-4 py-2 text-center"
        >
          <p className="text-[10px] font-medium text-amber-600">SROI Ratio</p>
          <p className="text-sm font-bold text-amber-700">
            ₹{calc.sroiRatio.toFixed(2)}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
