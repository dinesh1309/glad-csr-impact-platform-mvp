// Portfolio Analytics — Pure computation functions
// See: PRD §4A, Technical Architecture §7.5

import type { Project, ProgressDataPoint, ValidationResult } from "./types";

// ----- Types -----

export interface PortfolioSummary {
  totalInvestment: number;
  portfolioSROI: number | null; // weighted average; null if no SROI calculated
  totalSocialValue: number;
  kpiHealth: {
    onTrack: number;
    atRisk: number;
    behind: number;
    total: number;
  };
  stageCounts: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface SROIComparisonItem {
  projectId: string;
  projectName: string;
  ratio: number;
  investment: number;
}

export interface RiskItem {
  projectId: string;
  projectName: string;
  behindCount: number;
  totalKpis: number;
  behindKpis: string[]; // KPI names
}

export interface EvidenceCoverage {
  verifiedCount: number;
  totalKpiCount: number;
  percentage: number;
}

// ----- Helpers -----

function getInvestment(project: Project): number {
  return (
    project.sroi.investment ||
    project.mou.projectDetails?.totalBudget ||
    0
  );
}

// ----- Computation Functions -----

export function computePortfolioSummary(projects: Project[]): PortfolioSummary {
  let totalInvestment = 0;
  let weightedSROISum = 0;
  let sroiInvestmentSum = 0;
  let totalSocialValue = 0;

  const kpiHealth = { onTrack: 0, atRisk: 0, behind: 0, total: 0 };
  const stageCounts: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  for (const p of projects) {
    const inv = getInvestment(p);
    totalInvestment += inv;

    // SROI weighted average
    if (p.sroi.calculatedRatio !== null && inv > 0) {
      weightedSROISum += p.sroi.calculatedRatio * inv;
      sroiInvestmentSum += inv;
      totalSocialValue += p.sroi.calculatedRatio * inv;
    }

    // KPI health from progress data
    for (const kpi of p.reports.progressData) {
      kpiHealth.total++;
      if (kpi.status === "on-track") kpiHealth.onTrack++;
      else if (kpi.status === "at-risk") kpiHealth.atRisk++;
      else if (kpi.status === "behind") kpiHealth.behind++;
    }

    // Stage distribution — count the highest completed stage
    stageCounts[p.currentStage]++;
  }

  const portfolioSROI =
    sroiInvestmentSum > 0
      ? Math.round((weightedSROISum / sroiInvestmentSum) * 100) / 100
      : null;

  return {
    totalInvestment,
    portfolioSROI,
    totalSocialValue,
    kpiHealth,
    stageCounts,
  };
}

export function computeSROIComparison(projects: Project[]): SROIComparisonItem[] {
  return projects
    .filter((p) => p.sroi.calculatedRatio !== null)
    .map((p) => ({
      projectId: p.id,
      projectName: p.name,
      ratio: p.sroi.calculatedRatio!,
      investment: getInvestment(p),
    }))
    .sort((a, b) => b.ratio - a.ratio);
}

export function computeRiskItems(projects: Project[]): RiskItem[] {
  const items: RiskItem[] = [];

  for (const p of projects) {
    const progressData = p.reports.progressData;
    if (progressData.length === 0) continue;

    const behindKpis = progressData
      .filter((kpi: ProgressDataPoint) => kpi.status === "behind")
      .map((kpi: ProgressDataPoint) => kpi.kpiName);

    if (behindKpis.length > 0) {
      items.push({
        projectId: p.id,
        projectName: p.name,
        behindCount: behindKpis.length,
        totalKpis: progressData.length,
        behindKpis,
      });
    }
  }

  return items.sort((a, b) => b.behindCount - a.behindCount);
}

export function computeEvidenceCoverage(projects: Project[]): EvidenceCoverage {
  let verifiedCount = 0;
  let totalKpiCount = 0;

  for (const p of projects) {
    const results = p.evidence.validationResults;
    if (results.length === 0) continue;

    for (const r of results) {
      totalKpiCount++;
      if ((r as ValidationResult).status === "verified") {
        verifiedCount++;
      }
    }
  }

  const percentage = totalKpiCount > 0
    ? Math.round((verifiedCount / totalKpiCount) * 100)
    : 0;

  return { verifiedCount, totalKpiCount, percentage };
}

/**
 * Format INR values with Indian abbreviations:
 * >= 1 Cr (10M) → "₹X.X Cr"
 * >= 1 L (100K) → "₹X.X L"
 * < 1 L → "₹X,XXX"
 */
export function formatINR(value: number): string {
  if (value === 0) return "₹0";

  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1_00_00_000) {
    const cr = abs / 1_00_00_000;
    return `${sign}₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(1)} Cr`;
  }

  if (abs >= 1_00_000) {
    const lakh = abs / 1_00_000;
    return `${sign}₹${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)} L`;
  }

  return `${sign}₹${abs.toLocaleString("en-IN")}`;
}
