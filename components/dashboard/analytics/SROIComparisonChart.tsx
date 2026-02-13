"use client";

import { motion } from "framer-motion";
import type { SROIComparisonItem } from "@/lib/portfolio-analytics";

interface SROIComparisonChartProps {
  items: SROIComparisonItem[];
}

const BAR_COLORS = [
  "#0891B2", // teal
  "#059669", // emerald
  "#2563EB", // blue
  "#D97706", // amber
  "#7C3AED", // violet
  "#EC4899", // pink
  "#14B8A6", // teal-400
  "#8B5CF6", // violet-400
];

export function SROIComparisonChart({ items }: SROIComparisonChartProps) {
  if (items.length === 0) return null;

  const maxRatio = Math.max(...items.map((d) => d.ratio), 1);

  const barHeight = 32;
  const gap = 12;
  const labelWidth = 120;
  const valueWidth = 60;
  const chartPadding = 16;
  const totalHeight =
    items.length * (barHeight + gap) - gap + chartPadding * 2;

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-heading text-sm font-semibold text-dark">
        SROI Comparison
      </h3>

      <div className="overflow-x-auto">
        <svg
          width="100%"
          viewBox={`0 0 500 ${totalHeight}`}
          className="min-w-[400px]"
        >
          {items.map((item, i) => {
            const y = chartPadding + i * (barHeight + gap);
            const barWidth =
              (item.ratio / maxRatio) *
              (500 - labelWidth - valueWidth - chartPadding * 2);
            const color = BAR_COLORS[i % BAR_COLORS.length];

            return (
              <g key={item.projectId}>
                {/* Project name */}
                <text
                  x={labelWidth - 8}
                  y={y + barHeight / 2 + 1}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-muted text-[11px]"
                >
                  {item.projectName.length > 16
                    ? item.projectName.slice(0, 15) + "…"
                    : item.projectName}
                </text>

                {/* Bar background */}
                <rect
                  x={labelWidth}
                  y={y + 4}
                  width={500 - labelWidth - valueWidth - chartPadding * 2}
                  height={barHeight - 8}
                  rx={4}
                  className="fill-slate-100"
                />

                {/* Animated bar */}
                <motion.rect
                  x={labelWidth}
                  y={y + 4}
                  width={barWidth}
                  height={barHeight - 8}
                  rx={4}
                  fill={color}
                  initial={{ width: 0 }}
                  animate={{ width: barWidth }}
                  transition={{
                    duration: 0.8,
                    delay: 0.3 + i * 0.15,
                    ease: [0.33, 1, 0.68, 1],
                  }}
                />

                {/* Value label */}
                <text
                  x={500 - chartPadding}
                  y={y + barHeight / 2 + 1}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-dark text-[12px] font-semibold"
                >
                  {item.ratio.toFixed(2)}x
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
