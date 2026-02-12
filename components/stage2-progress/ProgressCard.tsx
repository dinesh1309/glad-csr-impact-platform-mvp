"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Check, X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ProgressDataPoint } from "@/lib/types";

const STATUS_CONFIG = {
  "on-track": {
    label: "On Track",
    bar: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: TrendingUp,
  },
  "at-risk": {
    label: "At Risk",
    bar: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Minus,
  },
  behind: {
    label: "Behind",
    bar: "bg-red-500",
    badge: "bg-red-50 text-red-700 border-red-200",
    icon: TrendingDown,
  },
} as const;

interface ProgressCardProps {
  data: ProgressDataPoint;
  isLocked: boolean;
  onOverride: (kpiId: string, newValue: number) => void;
}

export function ProgressCard({ data, isLocked, onOverride }: ProgressCardProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(data.currentValue));
  const config = STATUS_CONFIG[data.status];
  const Icon = config.icon;
  const pct = Math.min(data.percentageAchieved, 100);

  const handleSave = () => {
    const num = parseFloat(editValue);
    if (!isNaN(num) && num >= 0) {
      onOverride(data.kpiId, num);
    }
    setEditing(false);
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-dark leading-tight">
          {data.kpiName}
        </h3>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${config.badge}`}
        >
          <Icon className="h-3 w-3" />
          {config.label}
        </span>
      </div>

      {/* Value row */}
      <div className="mt-4 flex items-baseline gap-2">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-24 rounded border border-border px-2 py-1 text-lg font-bold text-dark focus:border-teal focus:outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") setEditing(false);
              }}
            />
            <button onClick={handleSave} className="text-success hover:text-success/80">
              <Check className="h-4 w-4" />
            </button>
            <button onClick={() => setEditing(false)} className="text-muted hover:text-dark">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <span className="text-[28px] font-bold leading-none text-dark">
              {data.currentValue.toLocaleString()}
            </span>
            <span className="text-sm text-muted">
              / {data.targetValue.toLocaleString()} {data.unit}
            </span>
            {!isLocked && (
              <button
                onClick={() => {
                  setEditValue(String(data.currentValue));
                  setEditing(true);
                }}
                className="ml-auto opacity-0 transition-opacity group-hover:opacity-100"
                title="Override value"
              >
                <Pencil className="h-3.5 w-3.5 text-muted hover:text-teal" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Percentage */}
      <p className="mt-1 text-xs text-muted">
        {data.percentageAchieved.toFixed(1)}% achieved
      </p>

      {/* Progress bar */}
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className={`h-full rounded-full ${config.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
        />
      </div>

      {/* Sparkline (if history has 2+ points) */}
      {data.history.length >= 2 && (
        <div className="mt-3 flex items-end gap-[3px] h-8">
          {data.history.map((point, i) => {
            const max = Math.max(...data.history.map((h) => h.value), 1);
            const height = Math.max((point.value / max) * 100, 8);
            return (
              <motion.div
                key={i}
                className={`flex-1 rounded-sm ${config.bar} opacity-60`}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                title={`${point.date}: ${point.value}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
