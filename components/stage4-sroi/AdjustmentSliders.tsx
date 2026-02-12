"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import type { AdjustmentFactors } from "@/lib/types";

const SLIDERS = [
  {
    key: "deadweight" as const,
    label: "Deadweight",
    tooltip:
      "What percentage of this outcome would have happened anyway, without the intervention? Higher deadweight = less credit to the project.",
    color: "accent-amber-500",
  },
  {
    key: "attribution" as const,
    label: "Attribution",
    tooltip:
      "What percentage of the outcome was caused by other organizations or factors? Higher attribution = less credit to this project alone.",
    color: "accent-orange-500",
  },
  {
    key: "dropoff" as const,
    label: "Drop-off",
    tooltip:
      "How much will the benefit decrease in future years? Higher drop-off = benefits fade faster over time.",
    color: "accent-red-500",
  },
] as const;

interface AdjustmentSlidersProps {
  adjustments: AdjustmentFactors;
  isLocked: boolean;
  onChange: (adjustments: AdjustmentFactors) => void;
}

export function AdjustmentSliders({
  adjustments,
  isLocked,
  onChange,
}: AdjustmentSlidersProps) {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-dark">Adjustment Factors</h3>
      <div className="space-y-5 rounded-xl border border-border bg-white p-5">
        {SLIDERS.map((slider) => (
          <div key={slider.key}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <label className="text-sm font-medium text-dark">
                  {slider.label}
                </label>
                <div className="relative">
                  <button
                    onMouseEnter={() => setShowTooltip(slider.key)}
                    onMouseLeave={() => setShowTooltip(null)}
                    className="text-muted hover:text-dark"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                  {showTooltip === slider.key && (
                    <div className="absolute bottom-full left-1/2 z-10 mb-2 w-64 -translate-x-1/2 rounded-lg border border-border bg-navy px-3 py-2 text-xs leading-relaxed text-white shadow-lg">
                      {slider.tooltip}
                      <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-navy" />
                    </div>
                  )}
                </div>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-dark">
                {adjustments[slider.key]}%
              </span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-[10px] text-muted">0%</span>
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={adjustments[slider.key]}
                onChange={(e) =>
                  onChange({
                    ...adjustments,
                    [slider.key]: parseInt(e.target.value),
                  })
                }
                disabled={isLocked}
                className={`h-2 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 ${slider.color} disabled:cursor-not-allowed disabled:opacity-60`}
              />
              <span className="text-[10px] text-muted">50%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
