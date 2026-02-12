"use client";

import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, HelpCircle } from "lucide-react";
import type { ValidationResult } from "@/lib/types";

const STATUS_CONFIG = {
  verified: {
    icon: ShieldCheck,
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "Verified",
  },
  discrepancy: {
    icon: AlertTriangle,
    badge: "bg-red-50 text-red-700 border-red-200",
    label: "Discrepancy",
  },
  "no-evidence": {
    icon: HelpCircle,
    badge: "bg-slate-50 text-slate-500 border-slate-200",
    label: "No Evidence",
  },
} as const;

interface ValidationSummaryProps {
  results: ValidationResult[];
}

export function ValidationSummary({ results }: ValidationSummaryProps) {
  if (results.length === 0) return null;

  const verified = results.filter((r) => r.status === "verified").length;
  const discrepancy = results.filter((r) => r.status === "discrepancy").length;
  const noEvidence = results.filter((r) => r.status === "no-evidence").length;

  return (
    <div className="space-y-4">
      {/* Header with summary counts */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-stage-3" />
          <h2 className="font-heading text-lg font-semibold text-dark">
            Validation Summary
          </h2>
        </div>
        <div className="flex gap-2">
          {verified > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
              {verified} Verified
            </span>
          )}
          {discrepancy > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-700">
              {discrepancy} Discrepancy
            </span>
          )}
          {noEvidence > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
              {noEvidence} No Evidence
            </span>
          )}
        </div>
      </div>

      {/* Validation table */}
      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-slate-50/80">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted">
                KPI
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted">
                Reported
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted">
                Evidence
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted">
                Match
              </th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold text-muted">
                Status
              </th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold text-muted">
                Files
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, i) => {
              const config = STATUS_CONFIG[result.status];
              const Icon = config.icon;
              return (
                <motion.tr
                  key={result.kpiId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3 text-sm font-medium text-dark">
                    {result.kpiName}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-dark">
                    {result.reportedValue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-dark">
                    {result.evidenceValue != null
                      ? result.evidenceValue.toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-dark">
                    {result.matchPercentage != null
                      ? `${result.matchPercentage}%`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${config.badge}`}
                    >
                      <Icon className="h-3 w-3" />
                      {config.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-muted">
                    {result.evidenceCount}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
