"use client";

import { motion } from "framer-motion";
import {
  Banknote,
  TrendingUp,
  HeartHandshake,
  Activity,
  Layers,
} from "lucide-react";
import type { PortfolioSummary } from "@/lib/portfolio-analytics";
import { formatINR } from "@/lib/portfolio-analytics";

interface SummaryMetricCardsProps {
  summary: PortfolioSummary;
  projectCount: number;
}

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

export function SummaryMetricCards({
  summary,
  projectCount,
}: SummaryMetricCardsProps) {
  const { kpiHealth, stageCounts } = summary;

  // Pipeline mini: find the furthest stage with projects
  const pipelineLabel =
    projectCount === 0
      ? "No projects"
      : `${Object.values(stageCounts).filter((c) => c > 0).length} active stages`;

  const cards = [
    {
      label: "Total Investment",
      value: formatINR(summary.totalInvestment),
      sub: `Across ${projectCount} project${projectCount === 1 ? "" : "s"}`,
      icon: Banknote,
      iconBg: "bg-teal/10",
      iconColor: "text-teal",
    },
    {
      label: "Portfolio SROI",
      value:
        summary.portfolioSROI !== null
          ? `${summary.portfolioSROI.toFixed(2)}x`
          : "—",
      sub:
        summary.portfolioSROI !== null
          ? "Weighted average"
          : "No SROI calculated yet",
      icon: TrendingUp,
      dark: true,
    },
    {
      label: "Total Social Value",
      value: summary.totalSocialValue > 0 ? formatINR(summary.totalSocialValue) : "—",
      sub:
        summary.totalSocialValue > 0
          ? "Net outcome value"
          : "Complete SROI to see",
      icon: HeartHandshake,
      iconBg: "bg-success/10",
      iconColor: "text-success",
    },
    {
      label: "KPI Health",
      value:
        kpiHealth.total > 0
          ? `${kpiHealth.onTrack}/${kpiHealth.total}`
          : "—",
      sub:
        kpiHealth.total > 0
          ? `${kpiHealth.atRisk} at risk · ${kpiHealth.behind} behind`
          : "No KPIs tracked yet",
      icon: Activity,
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
    },
    {
      label: "Pipeline",
      value: `${projectCount}`,
      sub: pipelineLabel,
      icon: Layers,
      iconBg: "bg-info/10",
      iconColor: "text-info",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card, i) => {
        const Icon = card.icon;

        if (card.dark) {
          return (
            <motion.div
              key={card.label}
              custom={i}
              variants={cardVariant}
              initial="hidden"
              animate="visible"
              className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-5 shadow-sm"
            >
              {/* Gold glow */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 70% 30%, rgba(245,158,11,0.15) 0%, transparent 60%)",
                }}
              />
              <div className="relative">
                <div className="mb-1 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    <Icon className="h-4 w-4 text-[#F59E0B]" />
                  </div>
                  <span className="text-xs font-medium text-white/60">
                    {card.label}
                  </span>
                </div>
                <p className="mt-2 font-heading text-2xl font-bold text-[#F59E0B]">
                  {card.value}
                </p>
                <p className="mt-0.5 text-xs text-white/50">{card.sub}</p>
              </div>
            </motion.div>
          );
        }

        return (
          <motion.div
            key={card.label}
            custom={i}
            variants={cardVariant}
            initial="hidden"
            animate="visible"
            className="rounded-xl border border-border bg-white p-5 shadow-sm"
          >
            <div className="mb-1 flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.iconBg}`}
              >
                <Icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
              <span className="text-xs font-medium text-muted">
                {card.label}
              </span>
            </div>
            <p className="mt-2 font-heading text-2xl font-bold text-dark">
              {card.value}
            </p>
            <p className="mt-0.5 text-xs text-muted">{card.sub}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
