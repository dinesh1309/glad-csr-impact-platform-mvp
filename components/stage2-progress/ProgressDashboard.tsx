"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, AlertTriangle } from "lucide-react";
import { ProgressCard } from "./ProgressCard";
import type { ProgressDataPoint } from "@/lib/types";

interface ProgressDashboardProps {
  progressData: ProgressDataPoint[];
  isLocked: boolean;
  onOverride: (kpiId: string, newValue: number) => void;
}

export function ProgressDashboard({
  progressData,
  isLocked,
  onOverride,
}: ProgressDashboardProps) {
  if (progressData.length === 0) return null;

  const onTrack = progressData.filter((d) => d.status === "on-track").length;
  const atRisk = progressData.filter((d) => d.status === "at-risk").length;
  const behind = progressData.filter((d) => d.status === "behind").length;

  // Sort: behind first (gap highlighting), then at-risk, then on-track
  const sorted = [...progressData].sort((a, b) => {
    const order = { behind: 0, "at-risk": 1, "on-track": 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-stage-2" />
          <h2 className="font-heading text-lg font-semibold text-dark">
            Progress Dashboard
          </h2>
          <span className="rounded-full bg-stage-2/10 px-2.5 py-0.5 text-xs font-medium text-stage-2">
            {progressData.length} KPIs
          </span>
        </div>

        {/* Summary pills */}
        <div className="flex gap-2">
          {onTrack > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
              {onTrack} On Track
            </span>
          )}
          {atRisk > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
              {atRisk} At Risk
            </span>
          )}
          {behind > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-700">
              {behind} Behind
            </span>
          )}
        </div>
      </div>

      {/* Gap warning */}
      {behind > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
          <p className="text-sm text-red-700">
            <span className="font-semibold">{behind} KPI{behind > 1 ? "s" : ""}</span>{" "}
            behind target (&lt;60% achieved). Review these first.
          </p>
        </motion.div>
      )}

      {/* Progress cards grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AnimatePresence>
          {sorted.map((data, i) => (
            <motion.div
              key={data.kpiId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <ProgressCard
                data={data}
                isLocked={isLocked}
                onOverride={onOverride}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
