// ============================================================
// CSR Impact Assessment Platform — TypeScript Interfaces
// Source: PRD v2.0, Technical Architecture v3.0
// ============================================================

// ----- Module 1: MoU Upload -----

export interface ProjectDetails {
  projectName: string;
  ngoName: string;
  location: string;
  duration: string; // e.g., "12 months"
  startDate: string;
  totalBudget: number | null;
}

export interface KPI {
  id: string;
  name: string;
  targetValue: number;
  unit: string; // e.g., "%", "count", "₹"
  targetDate: string | null;
  category: "output" | "outcome" | "impact";
}

// ----- Module 2: Progress Reports -----

export interface ReportFile {
  id: string;
  fileName: string;
  uploadedAt: string;
  reportPeriod: string; // e.g., "Month 3", "Q1 2024"
  status: "pending" | "processing" | "completed" | "error";
  extractedData: ReportExtraction | null;
}

export interface ReportExtraction {
  reportDate: string;
  reportPeriod: string;
  kpiValues: KPIValue[];
}

export interface KPIValue {
  kpiId: string;
  reportedValue: number;
  reportDate: string;
  notes: string | null;
}

export interface ProgressDataPoint {
  kpiId: string;
  kpiName: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  percentageAchieved: number;
  status: "on-track" | "at-risk" | "behind";
  history: { date: string; value: number }[];
}

// ----- Module 3: Field Evidence -----

export interface EvidenceFile {
  id: string;
  fileName: string;
  fileType: "survey" | "photo" | "document";
  uploadedAt: string;
  linkedKpiIds: string[];
  notes: string | null;
  thumbnail: string | null; // Base64 for images
  metadata: {
    rowCount?: number; // For CSVs
    location?: string; // For photos with EXIF
    dateTaken?: string;
  };
}

export interface ValidationResult {
  kpiId: string;
  kpiName: string;
  reportedValue: number;
  evidenceValue: number | null;
  matchPercentage: number | null;
  status: "verified" | "discrepancy" | "no-evidence";
  evidenceCount: number;
}

// ----- Module 4: SROI Calculation -----

export interface OutcomeItem {
  kpiId: string;
  kpiName: string;
  achievedValue: number;
  unit: string;
  monetizedValue: number; // Value in ₹
  monetizationMethod: string;
}

export interface AdjustmentFactors {
  deadweight: number; // 0-50, percentage
  attribution: number; // 0-50, percentage
  dropoff: number; // 0-50, percentage
}

export interface SROICalculation {
  grossOutcomeValue: number;
  afterDeadweight: number;
  afterAttribution: number;
  afterDropoff: number;
  investment: number;
  sroiRatio: number;
}

// ----- Module Data Wrappers -----

export interface MoUData {
  fileName: string | null;
  uploadedAt: string | null;
  projectDetails: ProjectDetails | null;
  kpis: KPI[];
  isConfirmed: boolean;
}

export interface ReportsData {
  files: ReportFile[];
  progressData: ProgressDataPoint[];
}

export interface EvidenceData {
  files: EvidenceFile[];
  validationResults: ValidationResult[];
}

export interface SROIData {
  investment: number;
  outcomes: OutcomeItem[];
  adjustments: AdjustmentFactors;
  calculatedRatio: number | null;
}

export interface ReportData {
  generatedAt: string | null;
}

// ----- Multi-Project -----

export interface StageStatus {
  stage1Complete: boolean;
  stage2Complete: boolean;
  stage3Complete: boolean;
  stage4Complete: boolean;
  stage5Complete: boolean;
}

export interface Project {
  id: string;
  name: string;
  ngoName: string | null;
  createdAt: string;
  updatedAt: string;
  currentStage: 1 | 2 | 3 | 4 | 5;
  stageStatus: StageStatus;

  // Module data
  mou: MoUData;
  reports: ReportsData;
  evidence: EvidenceData;
  sroi: SROIData;
  report: ReportData;
}

// ----- App-Level State -----

export type AppView = "dashboard" | "project";
