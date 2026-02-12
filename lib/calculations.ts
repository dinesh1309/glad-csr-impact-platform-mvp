// SROI Calculation — Pure functions
// See: PRD §9.5, Technical Architecture §5

import type {
  OutcomeItem,
  AdjustmentFactors,
  SROICalculation,
  ProgressDataPoint,
} from "./types";

/**
 * Calculate SROI from outcomes, investment, and adjustment factors.
 */
export function calculateSROI(
  outcomes: OutcomeItem[],
  investment: number,
  adjustments: AdjustmentFactors
): SROICalculation {
  const grossOutcomeValue = outcomes.reduce(
    (sum, o) => sum + o.monetizedValue,
    0
  );

  const afterDeadweight =
    grossOutcomeValue * (1 - adjustments.deadweight / 100);
  const afterAttribution =
    afterDeadweight * (1 - adjustments.attribution / 100);
  const afterDropoff = afterAttribution * (1 - adjustments.dropoff / 100);

  const sroiRatio = investment > 0 ? afterDropoff / investment : 0;

  return {
    grossOutcomeValue,
    afterDeadweight,
    afterAttribution,
    afterDropoff,
    investment,
    sroiRatio: Math.round(sroiRatio * 100) / 100,
  };
}

/**
 * Heuristic monetization: maps common CSR KPI keywords to per-unit
 * rupee values and standard valuation methods. Users can override these.
 */
const MONETIZATION_HEURISTICS: {
  keywords: string[];
  perUnit: number;
  method: string;
}[] = [
  {
    keywords: ["student", "outreach", "engagement", "mobilized"],
    perUnit: 500,
    method: "Value of skill exposure per student (industry benchmark ₹500)",
  },
  {
    keywords: ["fellow", "deployed", "personnel"],
    perUnit: 600000,
    method: "Market salary for equivalent role (₹6L/year)",
  },
  {
    keywords: ["centre", "center", "excellence", "lab", "hub"],
    perUnit: 5000000,
    method: "Infrastructure + equipment setup cost (₹50L per centre)",
  },
  {
    keywords: ["hackathon", "innovation showcase"],
    perUnit: 1500000,
    method: "Event organization + participant value (₹15L per event)",
  },
  {
    keywords: ["workshop", "capacity", "training"],
    perUnit: 500000,
    method: "Equivalent commercial training cost (₹5L per workshop)",
  },
  {
    keywords: ["session", "industry-led", "seminar"],
    perUnit: 300000,
    method: "Expert time + knowledge transfer value (₹3L per session)",
  },
  {
    keywords: ["partnership", "corporate", "funding"],
    perUnit: 2500000,
    method: "Avg CSR funding mobilized per partnership (₹25L)",
  },
  {
    keywords: ["collaboration", "academia", "connect"],
    perUnit: 1000000,
    method: "Value of research/internship opportunities (₹10L per collab)",
  },
  {
    keywords: ["roundtable", "stakeholder"],
    perUnit: 200000,
    method: "Convening cost + policy influence value (₹2L per roundtable)",
  },
  {
    keywords: ["report", "dashboard", "documentation"],
    perUnit: 100000,
    method: "Equivalent consulting cost for report preparation (₹1L)",
  },
  {
    keywords: ["database", "repository", "compendium"],
    perUnit: 200000,
    method: "Knowledge asset development cost (₹2L per asset)",
  },
];

function estimateMonetization(
  kpiName: string,
  achievedValue: number
): { value: number; method: string } {
  const nameLower = kpiName.toLowerCase();
  for (const h of MONETIZATION_HEURISTICS) {
    if (h.keywords.some((kw) => nameLower.includes(kw))) {
      return {
        value: achievedValue * h.perUnit,
        method: h.method,
      };
    }
  }
  return { value: 0, method: "" };
}

/**
 * Auto-populate outcome items from progress data.
 * Applies keyword-based monetization heuristics as defaults.
 * Users can override all values in the UI.
 */
export function buildOutcomesFromProgress(
  progressData: ProgressDataPoint[]
): OutcomeItem[] {
  return progressData.map((pd) => {
    const estimate = estimateMonetization(pd.kpiName, pd.currentValue);
    return {
      kpiId: pd.kpiId,
      kpiName: pd.kpiName,
      achievedValue: pd.currentValue,
      unit: pd.unit,
      monetizedValue: estimate.value,
      monetizationMethod: estimate.method,
    };
  });
}
