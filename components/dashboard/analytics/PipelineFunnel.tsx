"use client";

import { motion } from "framer-motion";

interface PipelineFunnelProps {
  stageCounts: Record<1 | 2 | 3 | 4 | 5, number>;
  totalProjects: number;
}

const STAGE_META: {
  stage: 1 | 2 | 3 | 4 | 5;
  label: string;
  color: string;
  bgClass: string;
}[] = [
  { stage: 1, label: "MoU Upload", color: "#0891B2", bgClass: "bg-stage-1" },
  { stage: 2, label: "Progress Reports", color: "#059669", bgClass: "bg-stage-2" },
  { stage: 3, label: "Field Evidence", color: "#2563EB", bgClass: "bg-stage-3" },
  { stage: 4, label: "SROI Calc", color: "#D97706", bgClass: "bg-stage-4" },
  { stage: 5, label: "Report Gen", color: "#7C3AED", bgClass: "bg-stage-5" },
];

export function PipelineFunnel({
  stageCounts,
  totalProjects,
}: PipelineFunnelProps) {
  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-heading text-sm font-semibold text-dark">
        Pipeline Distribution
      </h3>

      <div className="space-y-3">
        {STAGE_META.map(({ stage, label, color }, i) => {
          const count = stageCounts[stage];
          const pct = totalProjects > 0 ? (count / totalProjects) * 100 : 0;

          return (
            <div key={stage} className="flex items-center gap-3">
              <span className="w-[100px] shrink-0 text-xs text-muted truncate">
                {label}
              </span>
              <div className="relative h-5 flex-1 overflow-hidden rounded bg-slate-100">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{
                    duration: 0.8,
                    delay: 0.2 + i * 0.1,
                    ease: [0.33, 1, 0.68, 1],
                  }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-xs font-semibold text-dark">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
