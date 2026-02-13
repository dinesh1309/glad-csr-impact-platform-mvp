"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import type { EvidenceCoverage } from "@/lib/portfolio-analytics";

interface EvidenceCoverageMeterProps {
  coverage: EvidenceCoverage;
}

function getColorTier(pct: number): { bar: string; text: string } {
  if (pct >= 75) return { bar: "bg-success", text: "text-success" };
  if (pct >= 40) return { bar: "bg-warning", text: "text-warning" };
  return { bar: "bg-danger", text: "text-danger" };
}

export function EvidenceCoverageMeter({
  coverage,
}: EvidenceCoverageMeterProps) {
  const { verifiedCount, totalKpiCount, percentage } = coverage;
  const colors = getColorTier(percentage);

  const noEvidence = totalKpiCount === 0;

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-heading text-sm font-semibold text-dark">
          Evidence Coverage
        </h3>
        <ShieldCheck className={`h-4 w-4 ${noEvidence ? "text-slate-300" : colors.text}`} />
      </div>

      {noEvidence ? (
        <p className="text-xs text-muted">No evidence validation data yet</p>
      ) : (
        <>
          <div className="relative h-3 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className={`absolute inset-y-0 left-0 rounded-full ${colors.bar}`}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{
                duration: 0.8,
                delay: 0.4,
                ease: [0.33, 1, 0.68, 1],
              }}
            />
          </div>
          <p className="mt-2 text-xs text-muted">
            <span className={`font-semibold ${colors.text}`}>
              {verifiedCount} of {totalKpiCount}
            </span>{" "}
            KPIs verified ({percentage}%)
          </p>
        </>
      )}
    </div>
  );
}
