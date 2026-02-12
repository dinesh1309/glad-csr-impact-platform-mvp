"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Check, X, Trash2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { KPI } from "@/lib/types";

interface KPICardProps {
  kpi: KPI;
  isLocked: boolean;
  onUpdate: (kpi: KPI) => void;
  onDelete: () => void;
}

const categoryColors: Record<KPI["category"], { accent: string; bg: string; text: string; label: string }> = {
  output: { accent: "bg-teal", bg: "bg-teal/10", text: "text-teal", label: "Output" },
  outcome: { accent: "bg-success", bg: "bg-success/10", text: "text-success", label: "Outcome" },
  impact: { accent: "bg-gold", bg: "bg-gold/10", text: "text-gold", label: "Impact" },
};

export function KPICard({ kpi, isLocked, onUpdate, onDelete }: KPICardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<KPI>(kpi);
  const colors = categoryColors[kpi.category];

  const startEdit = () => {
    setDraft(kpi);
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft(kpi);
    setEditing(false);
  };

  const saveEdit = () => {
    onUpdate(draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <motion.div
        layout
        className="relative overflow-hidden rounded-xl border border-teal/30 bg-white shadow-sm"
      >
        <div className={`absolute inset-y-0 left-0 w-1 ${colors.accent}`} />
        <div className="space-y-3 p-4 pl-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted">Edit KPI</p>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon-xs" onClick={cancelEdit}>
                <X className="h-3.5 w-3.5 text-muted" />
              </Button>
              <Button variant="ghost" size="icon-xs" onClick={saveEdit}>
                <Check className="h-3.5 w-3.5 text-success" />
              </Button>
            </div>
          </div>
          <Input
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            placeholder="KPI name"
            className="h-8 text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              value={draft.targetValue}
              onChange={(e) => setDraft((d) => ({ ...d, targetValue: Number(e.target.value) }))}
              placeholder="Target"
              className="h-8 text-sm"
            />
            <Input
              value={draft.unit}
              onChange={(e) => setDraft((d) => ({ ...d, unit: e.target.value }))}
              placeholder="Unit (%, count, ₹)"
              className="h-8 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={draft.category}
              onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value as KPI["category"] }))}
              className="h-8 rounded-md border border-input bg-transparent px-2 text-sm text-dark outline-none"
            >
              <option value="output">Output</option>
              <option value="outcome">Outcome</option>
              <option value="impact">Impact</option>
            </select>
            <Input
              type="date"
              value={draft.targetDate ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, targetDate: e.target.value || null }))}
              className="h-8 text-sm"
            />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      className="group relative overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-sm"
    >
      {/* Left accent bar */}
      <div className={`absolute inset-y-0 left-0 w-1 ${colors.accent}`} />

      <div className="flex items-start justify-between p-4 pl-5">
        <div className="min-w-0 flex-1">
          {/* Category badge */}
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${colors.bg} ${colors.text}`}>
            {colors.label}
          </span>

          {/* KPI name */}
          <p className="mt-1.5 text-sm font-medium leading-snug text-dark">
            {kpi.name}
          </p>

          {/* Target */}
          <div className="mt-2 flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-muted" strokeWidth={1.5} />
            <span className="text-xs text-muted">
              Target: <span className="font-semibold text-dark">{kpi.targetValue.toLocaleString()}</span> {kpi.unit}
            </span>
          </div>

          {/* Target date */}
          {kpi.targetDate && (
            <p className="mt-1 text-xs text-muted">
              By {new Date(kpi.targetDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
            </p>
          )}
        </div>

        {/* Action buttons */}
        {!isLocked && (
          <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <Button variant="ghost" size="icon-xs" onClick={startEdit}>
              <Pencil className="h-3 w-3 text-muted" />
            </Button>
            <Button variant="ghost" size="icon-xs" onClick={onDelete}>
              <Trash2 className="h-3 w-3 text-danger" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
