"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import type { RiskItem } from "@/lib/portfolio-analytics";

interface RiskBannerProps {
  riskItems: RiskItem[];
}

export function RiskBanner({ riskItems }: RiskBannerProps) {
  if (riskItems.length === 0) return null;

  const totalBehind = riskItems.reduce((sum, r) => sum + r.behindCount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      className="rounded-xl border border-danger/20 bg-danger/5 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-danger/10">
          <AlertTriangle className="h-4 w-4 text-danger" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-dark">
            {totalBehind} KPI{totalBehind === 1 ? "" : "s"} behind target across{" "}
            {riskItems.length} project{riskItems.length === 1 ? "" : "s"}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
            {riskItems.map((item) => (
              <span key={item.projectId} className="text-xs text-muted">
                <span className="font-medium text-danger">
                  {item.projectName}
                </span>
                : {item.behindKpis.slice(0, 2).join(", ")}
                {item.behindKpis.length > 2 &&
                  ` +${item.behindKpis.length - 2} more`}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
