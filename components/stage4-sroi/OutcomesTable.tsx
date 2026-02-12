"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TableProperties, Pencil, Check, X } from "lucide-react";
import type { OutcomeItem } from "@/lib/types";

interface OutcomesTableProps {
  outcomes: OutcomeItem[];
  isLocked: boolean;
  onUpdate: (outcomes: OutcomeItem[]) => void;
}

export function OutcomesTable({
  outcomes,
  isLocked,
  onUpdate,
}: OutcomesTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editMethod, setEditMethod] = useState("");

  const startEdit = (item: OutcomeItem) => {
    setEditingId(item.kpiId);
    setEditValue(String(item.monetizedValue));
    setEditMethod(item.monetizationMethod);
  };

  const saveEdit = (kpiId: string) => {
    const num = parseFloat(editValue);
    if (!isNaN(num) && num >= 0) {
      onUpdate(
        outcomes.map((o) =>
          o.kpiId === kpiId
            ? { ...o, monetizedValue: num, monetizationMethod: editMethod }
            : o
        )
      );
    }
    setEditingId(null);
  };

  const total = outcomes.reduce((sum, o) => sum + o.monetizedValue, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <TableProperties className="h-5 w-5 text-stage-4" />
        <h2 className="font-heading text-lg font-semibold text-dark">
          Outcomes & Monetization
        </h2>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-slate-50/80">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted">
                Outcome (KPI)
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted">
                Achieved
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted">
                Monetized Value (₹)
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted">
                Method
              </th>
              {!isLocked && (
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-muted w-16">
                  Edit
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {outcomes.map((item, i) => (
              <motion.tr
                key={item.kpiId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-border last:border-0"
              >
                <td className="px-4 py-3 text-sm font-medium text-dark">
                  {item.kpiName}
                </td>
                <td className="px-4 py-3 text-right text-sm text-dark">
                  {item.achievedValue.toLocaleString()} {item.unit}
                </td>
                <td className="px-4 py-3 text-right">
                  {editingId === item.kpiId ? (
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-32 rounded border border-border px-2 py-1 text-right text-sm focus:border-teal focus:outline-none"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(item.kpiId);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                  ) : (
                    <span
                      className={`text-sm font-semibold ${
                        item.monetizedValue > 0 ? "text-dark" : "text-muted"
                      }`}
                    >
                      {item.monetizedValue > 0
                        ? `₹${item.monetizedValue.toLocaleString()}`
                        : "—"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === item.kpiId ? (
                    <input
                      type="text"
                      value={editMethod}
                      onChange={(e) => setEditMethod(e.target.value)}
                      placeholder="How was this valued?"
                      className="w-full rounded border border-border px-2 py-1 text-sm focus:border-teal focus:outline-none"
                    />
                  ) : (
                    <span className="text-xs text-muted">
                      {item.monetizationMethod || "Not specified"}
                    </span>
                  )}
                </td>
                {!isLocked && (
                  <td className="px-4 py-3 text-center">
                    {editingId === item.kpiId ? (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => saveEdit(item.kpiId)}
                          className="text-success hover:text-success/80"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-muted hover:text-dark"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(item)}
                        className="text-muted hover:text-teal"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50/80">
              <td className="px-4 py-2.5 text-sm font-semibold text-dark">
                Total Gross Outcome Value
              </td>
              <td />
              <td className="px-4 py-2.5 text-right text-sm font-bold text-dark">
                ₹{total.toLocaleString()}
              </td>
              <td colSpan={isLocked ? 1 : 2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
