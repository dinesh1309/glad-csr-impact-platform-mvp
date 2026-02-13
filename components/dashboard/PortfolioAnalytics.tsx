"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Project } from "@/lib/types";
import {
  computePortfolioSummary,
  computeSROIComparison,
  computeRiskItems,
  computeEvidenceCoverage,
} from "@/lib/portfolio-analytics";
import { SummaryMetricCards } from "./analytics/SummaryMetricCards";
import { SROIComparisonChart } from "./analytics/SROIComparisonChart";
import { PipelineFunnel } from "./analytics/PipelineFunnel";
import { EvidenceCoverageMeter } from "./analytics/EvidenceCoverageMeter";
import { RiskBanner } from "./analytics/RiskBanner";

interface PortfolioAnalyticsProps {
  projects: Project[];
}

export function PortfolioAnalytics({ projects }: PortfolioAnalyticsProps) {
  const summary = useMemo(
    () => computePortfolioSummary(projects),
    [projects]
  );

  const sroiComparison = useMemo(
    () => computeSROIComparison(projects),
    [projects]
  );

  const riskItems = useMemo(() => computeRiskItems(projects), [projects]);

  const evidenceCoverage = useMemo(
    () => computeEvidenceCoverage(projects),
    [projects]
  );

  if (projects.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="mb-8 space-y-6"
    >
      <h2 className="font-heading text-lg font-semibold text-dark">
        Portfolio Overview
      </h2>

      <SummaryMetricCards summary={summary} projectCount={projects.length} />

      <div className="grid gap-6 lg:grid-cols-2">
        <SROIComparisonChart items={sroiComparison} />
        <div className="space-y-6">
          <PipelineFunnel
            stageCounts={summary.stageCounts}
            totalProjects={projects.length}
          />
          <EvidenceCoverageMeter coverage={evidenceCoverage} />
        </div>
      </div>

      <RiskBanner riskItems={riskItems} />
    </motion.section>
  );
}
