# Product Requirements Document (PRD)
## CSR Impact Assessment Platform — MVP

**Version:** 2.0
**Date:** February 2026
**Author:** Product Team  
**For:** Claude Code Development Agent  

---

## 1. Executive Summary

### 1.1 What We're Building
A multi-project web application that digitizes the CSR impact assessment workflow. Users manage multiple CSR projects from a central dashboard. Each project takes the MoU (Memorandum of Understanding) as the single source of truth and tracks project progress through NGO reports, field evidence, SROI calculation, and report generation.

### 1.2 Core Value Proposition
- **For CSR Managers:** Single dashboard to track all CSR projects, with visibility into progress without waiting for annual assessments
- **For Assessment Teams:** Transparent SROI calculation with auditable evidence chain, per project
- **For Leadership:** Professional reports generated in minutes, not months, across the entire CSR portfolio

### 1.3 MVP Scope
A multi-project dashboard + 5 functional modules per project that can be demonstrated end-to-end with sample data. Users can create and manage multiple projects, each running the full 5-stage assessment pipeline independently. AI document extraction is real (Claude API + Ollama fallback) — the UI and data flow must be complete.

---

## 2. Technical Context

### 2.1 Confirmed Decisions
| Decision | Choice |
|----------|--------|
| Framework | Next.js (React) |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Deployment | Vercel (primary), Local backup |
| Design Quality | Professional — first impressions matter |

### 2.2 Questions for Technical Agent

> **Q1: State Management**  
> The app has 5 sequential stages where data flows from one to the next. User can navigate back and forth.  
> - Recommendation: Zustand or React Context with useReducer  
> - Question: What's your preferred approach for cross-module state that persists during session?

> **Q2: AI Document Extraction API**  
> Stages 1, 2, 3 require extracting structured data from PDFs.  
> - Recommendation: Claude API (Anthropic) or OpenAI GPT-4 Vision for PDF parsing  
> - Question: Which API will you use? This affects how we structure the extraction prompts and response schemas.

> **Q3: PDF Generation**  
> Stage 5 generates a downloadable PDF report.  
> - Recommendation: `@react-pdf/renderer` or `puppeteer` for HTML-to-PDF  
> - Question: What's your preferred approach for generating styled PDF reports?

> **Q4: File Upload Handling**  
> Users upload PDFs, CSVs, and images.  
> - Recommendation: Local processing with FileReader API for MVP (no backend storage needed)  
> - Question: Do you want to store uploaded files temporarily, or process everything client-side?

> **Q5: Data Persistence**  
> For MVP demo, does data need to persist across browser sessions?  
> - Recommendation: LocalStorage for demo persistence, or in-memory only  
> - Question: What level of persistence do you want for the MVP?

---

## 3. Module Breakdown

The application has two levels: a **Project Dashboard** (listing all projects) and a **5-stage pipeline** per project. Build in this order.

```
┌─────────────────────────────────────────────────────────────┐
│               PROJECT DASHBOARD (Landing Page)               │
│  (List all projects, create new, open existing)              │
└──────────────────────────┬──────────────────────────────────┘
                           │  User selects or creates a project
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              MODULE 0: App Shell (per project)               │
│  (Navigation, Layout, Project-Scoped State, Theme)           │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   MODULE 1    │───▶│   MODULE 2    │───▶│   MODULE 3    │
│  MoU Upload   │    │Report Matching│    │Field Evidence │
└───────────────┘    └───────────────┘    └───────────────┘
                                                  │
                     ┌────────────────────────────┘
                     ▼
        ┌───────────────┐    ┌───────────────┐
        │   MODULE 4    │───▶│   MODULE 5    │
        │     SROI      │    │ Report Gen    │
        └───────────────┘    └───────────────┘
```

Each project is a self-contained instance of the 5-stage flow with its own MoU, KPIs, reports, evidence, SROI calculation, and generated report.

---

## 4. Project Dashboard (Landing Page)

### 4.1 Purpose
The first screen users see. Lists all CSR projects with their current status and allows creating new projects or opening existing ones.

### 4.2 User Flow
```
Landing Page → View Project List → Create New / Open Existing → Enter 5-Stage Flow
```

### 4.3 Features

| Feature ID | Feature | Description | Priority |
|------------|---------|-------------|----------|
| PD-F1 | Project List | Display all projects as cards with name, NGO, status, current stage, last updated | Must Have |
| PD-F2 | Create Project | Button to create a new project (enters Stage 1 with empty state) | Must Have |
| PD-F3 | Open Project | Click a project card to enter its 5-stage flow at the current stage | Must Have |
| PD-F4 | Project Status Summary | Each card shows: stage progress (1-5), completion percentage, SROI if calculated | Must Have |
| PD-F5 | Delete Project | Delete a project with confirmation dialog | Should Have |
| PD-F6 | Empty State | When no projects exist, show a welcome message with "Create Your First Project" CTA | Must Have |
| PD-F7 | Project Count | Header shows total number of projects | Should Have |

### 4.4 Data Schemas

```typescript
interface Project {
  id: string;
  name: string; // Derived from MoU extraction or user input
  ngoName: string | null; // Populated after Stage 1
  createdAt: string;
  updatedAt: string;
  currentStage: 1 | 2 | 3 | 4 | 5;
  stageStatus: {
    stage1Complete: boolean;
    stage2Complete: boolean;
    stage3Complete: boolean;
    stage4Complete: boolean;
    stage5Complete: boolean;
  };

  // All module data is scoped to this project
  mou: MoUData;
  reports: ReportsData;
  evidence: EvidenceData;
  sroi: SROIData;
  report: ReportData;
}
```

### 4.5 UI Specifications

**Project Card:**
- White card with subtle shadow, 12px border radius
- Left accent bar colored by furthest completed stage (teal→emerald→blue→gold→purple)
- Top: Project name (16px semibold) + NGO name (14px muted)
- Middle: Mini stage progress bar (5 dots showing stage completion)
- Bottom: Last updated date + SROI ratio badge (if available)
- Hover: Elevation increases, cursor pointer

**Empty State:**
- Centered illustration/icon
- "No projects yet" heading
- "Create your first CSR impact assessment" subtext
- Primary CTA button: "Create New Project"

---

## 5. Module 0: Application Shell (Per Project)

### 5.1 Purpose
Provides the navigation, layout, and project-scoped state container for all modules within a single project.

### 5.2 Features

| Feature ID | Feature | Description | Priority |
|------------|---------|-------------|----------|
| M0-F1 | Stage Navigation | Horizontal stepper showing 5 stages with current stage highlighted | Must Have |
| M0-F2 | Stage Locking | User cannot skip ahead — must complete each stage sequentially | Must Have |
| M0-F3 | Back Navigation | User can go back to previous stages to review/edit | Must Have |
| M0-F4 | Progress Indicator | Visual indicator of completion status per stage | Should Have |
| M0-F5 | Project-Scoped State | State holding all data for the active project | Must Have |
| M0-F6 | Reset Project | Button to clear all data for the current project and start fresh | Should Have |
| M0-F7 | Responsive Layout | Works on desktop and tablet (minimum 768px width) | Must Have |
| M0-F8 | Back to Dashboard | Button/link in header to return to the project dashboard | Must Have |
| M0-F9 | Project Name in Header | Display the current project name in the app header | Must Have |

### 5.3 UI Specifications

**Stage Stepper:**
- Horizontal bar at top of content area
- 5 circles with stage numbers, connected by lines
- States: Completed (green check), Current (teal filled), Locked (gray outline)
- Stage labels below circles

**Layout:**
- Max content width: 1200px, centered
- Side padding: 24px on desktop, 16px on tablet
- Background: Off-white (#F8FAFC)

### 5.4 Global State Schema

```typescript
interface AppState {
  // Multi-project support
  projects: Project[];
  activeProjectId: string | null; // null = on dashboard

  // Navigation
  view: 'dashboard' | 'project'; // Which screen is showing
}

interface Project {
  id: string;
  name: string;
  ngoName: string | null;
  createdAt: string;
  updatedAt: string;
  currentStage: 1 | 2 | 3 | 4 | 5;

  // Module 1 data
  mou: {
    fileName: string | null;
    uploadedAt: Date | null;
    projectDetails: ProjectDetails | null;
    kpis: KPI[];
    isConfirmed: boolean;
  };

  // Module 2 data
  reports: {
    files: ReportFile[];
    progressData: ProgressDataPoint[];
  };

  // Module 3 data
  evidence: {
    files: EvidenceFile[];
    validationResults: ValidationResult[];
  };

  // Module 4 data
  sroi: {
    investment: number;
    outcomes: OutcomeItem[];
    adjustments: AdjustmentFactors;
    calculatedRatio: number | null;
  };

  // Module 5 data
  report: {
    generatedAt: Date | null;
    pdfBlob: Blob | null;
  };
}
```

---

## 6. Module 1: MoU Upload & KPI Extraction

### 6.1 Purpose
User uploads the MoU document. System extracts project details and KPIs. User reviews, edits if needed, and confirms.

### 6.2 User Flow
```
Upload MoU PDF → Loading/Processing → Review Extracted Data → Edit if needed → Confirm → Proceed to Stage 2
```

### 6.3 Features

| Feature ID | Feature | Description | Priority |
|------------|---------|-------------|----------|
| M1-F1 | PDF Upload | Drag-and-drop zone + click to browse, accepts .pdf only | Must Have |
| M1-F2 | Upload Validation | File type check, size limit (10MB), error messages | Must Have |
| M1-F3 | Processing State | Loading spinner with "Extracting KPIs..." message | Must Have |
| M1-F4 | Project Details Card | Display extracted: Project Name, NGO Name, Location, Duration, Start Date | Must Have |
| M1-F5 | KPI Cards | Display each extracted KPI with: Name, Target Value, Unit, Target Date | Must Have |
| M1-F6 | Inline Editing | User can click to edit any extracted value | Must Have |
| M1-F7 | Add KPI | Button to manually add a KPI that wasn't extracted | Should Have |
| M1-F8 | Delete KPI | Remove an incorrectly extracted KPI | Should Have |
| M1-F9 | Confirm Button | Locks in the data and enables Stage 2 | Must Have |
| M1-F10 | Re-upload Option | User can upload a different file, clears previous data | Should Have |

### 6.4 Data Schemas

```typescript
interface ProjectDetails {
  projectName: string;
  ngoName: string;
  location: string;
  duration: string; // e.g., "12 months"
  startDate: string;
  totalBudget: number | null;
}

interface KPI {
  id: string;
  name: string;
  targetValue: number;
  unit: string; // e.g., "%", "count", "₹"
  targetDate: string | null;
  category: 'output' | 'outcome' | 'impact';
}
```

### 6.5 AI Extraction Interface

```typescript
// Stub function — technical agent to implement with chosen AI API
async function extractFromMoU(pdfFile: File): Promise<{
  projectDetails: ProjectDetails;
  kpis: KPI[];
}> {
  // TODO: Implement with Claude/OpenAI API
  // For now, return mock data after 2-second delay
}
```

**Prompt Guidance for AI Extraction:**
The AI should be instructed to extract:
1. Project name and implementing NGO name
2. Geographic location(s)
3. Project duration and start date
4. Budget if mentioned
5. All measurable KPIs with their target values
6. Classify each KPI as output (activity), outcome (immediate result), or impact (long-term change)

### 6.6 Mock Data for Development

```typescript
const mockProjectDetails: ProjectDetails = {
  projectName: "Employment-Led Training for Rural Youth with Disabilities",
  ngoName: "Association for People with Disabilities (APD)",
  location: "Chennai and Bangalore, Karnataka & Tamil Nadu",
  duration: "12 months",
  startDate: "2024-01-01",
  totalBudget: 52400000 // ₹5.24 Cr
};

const mockKPIs: KPI[] = [
  { id: "kpi-1", name: "Youth Trained", targetValue: 500, unit: "count", targetDate: "2024-12-31", category: "output" },
  { id: "kpi-2", name: "Placement Rate", targetValue: 80, unit: "%", targetDate: "2024-12-31", category: "outcome" },
  { id: "kpi-3", name: "Training Completion Rate", targetValue: 90, unit: "%", targetDate: null, category: "output" },
  { id: "kpi-4", name: "Employer Satisfaction", targetValue: 85, unit: "%", targetDate: null, category: "outcome" },
  { id: "kpi-5", name: "Salary Increase (Post-Training)", targetValue: 30, unit: "%", targetDate: null, category: "impact" },
  { id: "kpi-6", name: "Mobility Aids Distributed", targetValue: 200, unit: "count", targetDate: null, category: "output" },
  { id: "kpi-7", name: "Training Duration", targetValue: 45, unit: "days", targetDate: null, category: "output" },
  { id: "kpi-8", name: "Program Recommendation Rate", targetValue: 75, unit: "%", targetDate: null, category: "impact" }
];
```

### 6.7 UI Specifications

**Upload Zone:**
- Dashed border (#0891B2), rounded corners
- Icon: Document upload icon
- Text: "Drop MoU PDF here or click to browse"
- Hover state: Border becomes solid, background tint

**KPI Card:**
- White background, subtle shadow
- Left color accent bar (teal for output, green for outcome, orange for impact)
- Editable fields show pencil icon on hover
- Delete button (trash icon) appears on hover

---

## 7. Module 2: Progress Report Matching

### 7.1 Purpose
User uploads NGO progress reports. System extracts reported values and matches them against the KPIs defined in Module 1. Displays progress dashboard.

### 7.2 User Flow
```
Upload Report(s) → Processing → View Progress Dashboard → Upload More (optional) → Proceed to Stage 3
```

### 7.3 Features

| Feature ID | Feature | Description | Priority |
|------------|---------|-------------|----------|
| M2-F1 | Multi-file Upload | Upload multiple report PDFs at once | Must Have |
| M2-F2 | Report List | Show uploaded reports with filename, date, processing status | Must Have |
| M2-F3 | Processing Queue | Process reports sequentially, show progress | Must Have |
| M2-F4 | Progress Dashboard | KPI cards showing Target vs Actual with progress bars | Must Have |
| M2-F5 | Status Indicators | Green (≥90% of target), Yellow (60-89%), Red (<60%) | Must Have |
| M2-F6 | Trend Sparklines | Small charts showing progress over time if multiple reports | Should Have |
| M2-F7 | Gap Highlighting | Visual emphasis on KPIs that are behind target | Must Have |
| M2-F8 | Manual Override | User can manually enter/correct values if extraction is wrong | Should Have |
| M2-F9 | Report Timeline | Visual timeline showing which report contributed which data | Should Have |
| M2-F10 | Proceed Button | Enabled when at least 1 report is processed | Must Have |

### 7.4 Data Schemas

```typescript
interface ReportFile {
  id: string;
  fileName: string;
  uploadedAt: Date;
  reportPeriod: string; // e.g., "Month 3", "Q1 2024"
  status: 'pending' | 'processing' | 'completed' | 'error';
  extractedData: ReportExtraction | null;
}

interface ReportExtraction {
  reportDate: string;
  reportPeriod: string;
  kpiValues: KPIValue[];
}

interface KPIValue {
  kpiId: string; // References KPI from Module 1
  reportedValue: number;
  reportDate: string;
  notes: string | null;
}

interface ProgressDataPoint {
  kpiId: string;
  kpiName: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  percentageAchieved: number;
  status: 'on-track' | 'at-risk' | 'behind';
  history: { date: string; value: number }[];
}
```

### 7.5 AI Extraction Interface

```typescript
async function extractFromReport(
  pdfFile: File, 
  kpis: KPI[] // Pass KPIs from Module 1 to guide extraction
): Promise<ReportExtraction> {
  // TODO: Implement with chosen AI API
  // AI should match reported values to the provided KPI list
}
```

### 7.6 Mock Data for Development

```typescript
const mockProgressData: ProgressDataPoint[] = [
  {
    kpiId: "kpi-1",
    kpiName: "Youth Trained",
    targetValue: 500,
    currentValue: 127,
    unit: "count",
    percentageAchieved: 25.4,
    status: "on-track", // On track for Month 3 of 12
    history: [
      { date: "2024-01", value: 45 },
      { date: "2024-02", value: 89 },
      { date: "2024-03", value: 127 }
    ]
  },
  {
    kpiId: "kpi-2",
    kpiName: "Placement Rate",
    targetValue: 80,
    currentValue: 35,
    unit: "%",
    percentageAchieved: 43.75,
    status: "at-risk",
    history: [
      { date: "2024-01", value: 20 },
      { date: "2024-02", value: 28 },
      { date: "2024-03", value: 35 }
    ]
  },
  {
    kpiId: "kpi-3",
    kpiName: "Training Completion Rate",
    targetValue: 90,
    currentValue: 95,
    unit: "%",
    percentageAchieved: 105.5,
    status: "on-track",
    history: [
      { date: "2024-01", value: 92 },
      { date: "2024-02", value: 94 },
      { date: "2024-03", value: 95 }
    ]
  }
];
```

### 7.7 UI Specifications

**Progress Card:**
- Full-width progress bar (gray background, colored fill)
- Large current value + target value on same line
- Status badge (On Track / At Risk / Behind)
- Expand to show history sparkline

**Status Colors:**
- On Track (≥90%): #22C55E (green)
- At Risk (60-89%): #F97316 (orange)
- Behind (<60%): #EF4444 (red)

---

## 8. Module 3: Field Evidence Validation

### 8.1 Purpose
User uploads field evidence (surveys, photos, observation notes). System links evidence to KPIs and shows validation status.

### 8.2 User Flow
```
Upload Evidence Files → Link to KPIs → View Validation Status → Proceed to Stage 4
```

### 8.3 Features

| Feature ID | Feature | Description | Priority |
|------------|---------|-------------|----------|
| M3-F1 | Multi-type Upload | Accept PDFs, CSVs, JPG/PNG images | Must Have |
| M3-F2 | File Type Detection | Auto-detect and categorize: Survey, Photo, Document | Must Have |
| M3-F3 | Evidence Cards | Display each uploaded file as a card with preview | Must Have |
| M3-F4 | KPI Linking | Dropdown to link each evidence item to relevant KPI(s) | Must Have |
| M3-F5 | Photo Thumbnails | Show image thumbnails for photo evidence | Should Have |
| M3-F6 | Survey Summary | For CSV uploads, show row count and column summary | Should Have |
| M3-F7 | Validation Status | Show if evidence supports or contradicts reported values | Must Have |
| M3-F8 | Evidence Count | Summary showing how many KPIs have linked evidence | Must Have |
| M3-F9 | Add Notes | Free text field for each evidence item | Should Have |
| M3-F10 | Proceed Button | Enabled when at least 1 evidence item is uploaded | Must Have |

### 8.4 Data Schemas

```typescript
interface EvidenceFile {
  id: string;
  fileName: string;
  fileType: 'survey' | 'photo' | 'document';
  uploadedAt: Date;
  linkedKpiIds: string[];
  notes: string | null;
  thumbnail: string | null; // Base64 for images
  metadata: {
    rowCount?: number; // For CSVs
    location?: string; // For photos with EXIF
    dateTaken?: string;
  };
}

interface ValidationResult {
  kpiId: string;
  kpiName: string;
  reportedValue: number;
  evidenceValue: number | null;
  matchPercentage: number | null;
  status: 'verified' | 'discrepancy' | 'no-evidence';
  evidenceCount: number;
}
```

### 8.5 Mock Data for Development

```typescript
const mockEvidenceFiles: EvidenceFile[] = [
  {
    id: "ev-1",
    fileName: "beneficiary_survey_march.csv",
    fileType: "survey",
    uploadedAt: new Date(),
    linkedKpiIds: ["kpi-1", "kpi-2"],
    notes: "Survey conducted across both locations",
    thumbnail: null,
    metadata: { rowCount: 118 }
  },
  {
    id: "ev-2",
    fileName: "training_center_chennai.jpg",
    fileType: "photo",
    uploadedAt: new Date(),
    linkedKpiIds: ["kpi-3"],
    notes: null,
    thumbnail: "data:image/jpeg;base64,...", // Placeholder
    metadata: { location: "Chennai", dateTaken: "2024-03-15" }
  },
  {
    id: "ev-3",
    fileName: "attendance_records.pdf",
    fileType: "document",
    uploadedAt: new Date(),
    linkedKpiIds: ["kpi-1"],
    notes: "Official attendance sheets",
    thumbnail: null,
    metadata: {}
  }
];

const mockValidationResults: ValidationResult[] = [
  {
    kpiId: "kpi-1",
    kpiName: "Youth Trained",
    reportedValue: 127,
    evidenceValue: 118,
    matchPercentage: 93,
    status: "verified",
    evidenceCount: 2
  },
  {
    kpiId: "kpi-2",
    kpiName: "Placement Rate",
    reportedValue: 35,
    evidenceValue: 38,
    matchPercentage: 108,
    status: "verified",
    evidenceCount: 1
  }
];
```

### 8.6 UI Specifications

**Evidence Card:**
- White card with left border (color by type: blue=survey, green=photo, gray=document)
- File icon or thumbnail
- Filename + file type badge
- Linked KPIs shown as tags
- Validation status icon (checkmark, warning, dash)

---

## 9. Module 4: SROI Calculation

### 9.1 Purpose
Calculate Social Return on Investment with full transparency. User inputs investment amount, system shows step-by-step calculation with adjustable factors.

### 9.2 User Flow
```
View Outcomes Summary → Input Investment → Adjust Factors (optional) → View Calculation → Proceed to Stage 5
```

### 10.3 Features

| Feature ID | Feature | Description | Priority |
|------------|---------|-------------|----------|
| M4-F1 | Outcomes Summary | List of achieved outcomes from Module 2 data | Must Have |
| M4-F2 | Monetization Table | Show how each outcome is converted to ₹ value | Must Have |
| M4-F3 | Investment Input | Number input for total project investment | Must Have |
| M4-F4 | Adjustment Sliders | Deadweight, Attribution, Drop-off — each with slider (0-50%) | Must Have |
| M4-F5 | Slider Explanations | Tooltip/help text explaining each adjustment factor | Must Have |
| M4-F6 | Live Calculation | SROI updates in real-time as inputs change | Must Have |
| M4-F7 | Calculation Breakdown | Step-by-step: Gross → -Deadweight → -Attribution → -Dropoff → ÷Investment | Must Have |
| M4-F8 | SROI Display | Large, prominent display of final SROI ratio | Must Have |
| M4-F9 | Plain English Summary | "Every ₹1 invested created ₹X.XX of social value" | Must Have |
| M4-F10 | Proceed Button | Always enabled (calculation is automatic) | Must Have |

### 9.4 Data Schemas

```typescript
interface OutcomeItem {
  kpiId: string;
  kpiName: string;
  achievedValue: number;
  unit: string;
  monetizedValue: number; // Value in ₹
  monetizationMethod: string; // Explanation of how value was calculated
}

interface AdjustmentFactors {
  deadweight: number; // 0-50, percentage
  attribution: number; // 0-50, percentage  
  dropoff: number; // 0-50, percentage
}

interface SROICalculation {
  grossOutcomeValue: number;
  afterDeadweight: number;
  afterAttribution: number;
  afterDropoff: number;
  investment: number;
  sroiRatio: number;
}
```

### 9.5 SROI Calculation Logic

```typescript
function calculateSROI(
  outcomes: OutcomeItem[],
  investment: number,
  adjustments: AdjustmentFactors
): SROICalculation {
  const grossOutcomeValue = outcomes.reduce((sum, o) => sum + o.monetizedValue, 0);
  
  const afterDeadweight = grossOutcomeValue * (1 - adjustments.deadweight / 100);
  const afterAttribution = afterDeadweight * (1 - adjustments.attribution / 100);
  const afterDropoff = afterAttribution * (1 - adjustments.dropoff / 100);
  
  const sroiRatio = investment > 0 ? afterDropoff / investment : 0;
  
  return {
    grossOutcomeValue,
    afterDeadweight,
    afterAttribution,
    afterDropoff,
    investment,
    sroiRatio: Math.round(sroiRatio * 100) / 100 // Round to 2 decimal places
  };
}
```

### 9.6 Mock Data for Development

```typescript
const mockOutcomes: OutcomeItem[] = [
  {
    kpiId: "kpi-2",
    kpiName: "Employment Generated",
    achievedValue: 45,
    unit: "placements",
    monetizedValue: 27000000, // ₹2.7 Cr (assuming ₹6L annual salary × 45)
    monetizationMethod: "Average annual salary × number of placements"
  },
  {
    kpiId: "kpi-5",
    kpiName: "Income Increase",
    achievedValue: 127,
    unit: "beneficiaries",
    monetizedValue: 15240000, // ₹1.52 Cr
    monetizationMethod: "Average income increase × beneficiaries × duration"
  }
];

const defaultAdjustments: AdjustmentFactors = {
  deadweight: 15,
  attribution: 20,
  dropoff: 10
};
```

### 9.7 UI Specifications

**SROI Display:**
- Large number (48-64px font) in colored box
- Color: Teal for ratio > 1, Orange for ratio = 1, Red for ratio < 1

**Adjustment Sliders:**
- Horizontal slider with current value displayed
- Range: 0% to 50%
- Default values pre-set
- Help icon (?) with tooltip explanation

**Calculation Breakdown:**
- Horizontal flow diagram showing each step
- Values displayed at each step
- Arrows showing the flow

---

## 10. Module 5: Report Generation

### 10.1 Purpose
Generate a professional PDF report compiling all data from previous modules.

### 10.2 User Flow
```
View Report Preview → Download PDF
```

### 10.3 Features

| Feature ID | Feature | Description | Priority |
|------------|---------|-------------|----------|
| M5-F1 | Report Preview | On-screen preview of the report | Must Have |
| M5-F2 | Executive Summary | Auto-generated 2-3 sentence summary | Must Have |
| M5-F3 | Project Overview Section | From Module 1: Project details, NGO, location, duration | Must Have |
| M5-F4 | KPI Achievement Table | From Module 2: Target vs Actual for each KPI | Must Have |
| M5-F5 | Evidence Summary | From Module 3: List of evidence with validation status | Should Have |
| M5-F6 | SROI Section | From Module 4: Calculation breakdown and ratio | Must Have |
| M5-F7 | Download PDF | Generate and download as PDF | Must Have |
| M5-F8 | Regenerate Option | Button to regenerate if user went back and changed data | Should Have |

### 10.4 Report Structure

```
1. Cover Page
   - Title: "Impact Assessment Report"
   - Project Name
   - Assessment Date
   - Prepared for: [Company Name]

2. Executive Summary (1 paragraph)
   - Project objective
   - Key achievement (1-2 highlights)
   - SROI ratio

3. Project Overview
   - Project Details table
   - KPI list from MoU

4. Progress & Achievement
   - KPI Achievement table (Target | Actual | Status)
   - Progress visualization

5. Evidence Summary
   - Evidence items table
   - Validation summary

6. SROI Analysis
   - Investment amount
   - Outcome monetization table
   - Adjustment factors applied
   - Calculation breakdown
   - Final SROI ratio

7. Conclusion
   - Summary statement
```

### 10.5 UI Specifications

**Preview Container:**
- Scrollable preview area with page-like appearance
- White background with subtle shadow
- A4 aspect ratio representation

**Download Button:**
- Primary button style (teal background)
- Shows loading state during PDF generation
- Icon: Download icon

---

## 11. Design System

### 11.1 Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Primary (Teal) | #0891B2 | CTAs, highlights, Stage 1 accent |
| Teal Dark | #0D9488 | Stage 2 accent |
| Emerald | #10B981 | Success states, Stage 3 accent |
| Orange | #F97316 | Warning states, Stage 4 accent |
| Purple | #7C3AED | Stage 5 accent |
| Navy | #1B2A4A | Headers, dark backgrounds |
| Dark Text | #1E293B | Primary text |
| Slate | #64748B | Secondary text |
| Light Gray | #E2E8F0 | Borders, dividers |
| Off White | #F8FAFC | Page background |
| White | #FFFFFF | Card backgrounds |
| Red | #EF4444 | Error states |
| Green | #22C55E | Success indicators |

### 11.2 Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Page Title | System Sans | 24-28px | Bold |
| Section Title | System Sans | 18-20px | Semibold |
| Card Title | System Sans | 16px | Semibold |
| Body Text | System Sans | 14px | Regular |
| Small Text | System Sans | 12px | Regular |
| Caption | System Sans | 11px | Regular |

### 11.3 Spacing

- Page padding: 24px (desktop), 16px (tablet)
- Card padding: 20px
- Section gap: 32px
- Element gap: 16px
- Tight gap: 8px

### 11.4 Components to Use (shadcn/ui)

- Button (primary, secondary, ghost variants)
- Card
- Input
- Slider
- Progress
- Badge
- Tabs (for sub-navigation if needed)
- Dialog (for confirmations)
- Tooltip
- Skeleton (for loading states)

---

## 12. File Structure Recommendation

```
/app
  /page.tsx                 # Main entry, renders AppShell
  /layout.tsx               # Root layout with providers
  
/components
  /dashboard
    /ProjectDashboard.tsx   # Landing page — project list
    /ProjectCard.tsx        # Individual project card
    /CreateProjectDialog.tsx # New project creation dialog

  /shell
    /AppShell.tsx           # Main layout wrapper (per project)
    /StageStepper.tsx       # Navigation stepper
    /StageContainer.tsx     # Container for stage content
    
  /stage1-mou
    /MoUUpload.tsx          # Upload zone
    /ProjectDetailsCard.tsx # Display project info
    /KPICard.tsx            # Individual KPI card
    /KPIList.tsx            # List of KPIs
    
  /stage2-reports
    /ReportUpload.tsx       # Multi-file upload
    /ReportList.tsx         # Uploaded reports list
    /ProgressDashboard.tsx  # KPI progress cards
    /ProgressCard.tsx       # Individual progress card
    
  /stage3-evidence
    /EvidenceUpload.tsx     # Multi-type upload
    /EvidenceCard.tsx       # Individual evidence card
    /ValidationSummary.tsx  # Validation status overview
    
  /stage4-sroi
    /OutcomesTable.tsx      # Monetized outcomes
    /AdjustmentSliders.tsx  # Deadweight, attribution, dropoff
    /CalculationBreakdown.tsx # Step-by-step visual
    /SROIDisplay.tsx        # Big number display
    
  /stage5-report
    /ReportPreview.tsx      # On-screen preview
    /PDFGenerator.tsx       # PDF generation logic
    
  /ui                       # shadcn components
  
/lib
  /store.ts                 # Zustand/Context store
  /types.ts                 # TypeScript interfaces
  /mock-data.ts             # All mock data
  /calculations.ts          # SROI calculation functions
  /ai-extraction.ts         # AI extraction stubs
  
/public
  /sample-mou.pdf           # Sample file for testing
  /sample-report.pdf        # Sample file for testing
```

---

## 13. Development Phases

### Phase 1: Foundation (Day 1)
- [ ] Set up Next.js project with Tailwind + shadcn/ui
- [ ] Create AppShell with StageStepper
- [ ] Set up global state store
- [ ] Create all TypeScript interfaces
- [ ] Add all mock data

### Phase 2: Module 1 - MoU (Day 1-2)
- [ ] Build upload zone component
- [ ] Create ProjectDetailsCard
- [ ] Create KPICard with edit functionality
- [ ] Create KPIList with add/delete
- [ ] Wire up to global state
- [ ] Add stub AI extraction function

### Phase 3: Module 2 - Reports (Day 2)
- [ ] Build multi-file upload
- [ ] Create ReportList
- [ ] Build ProgressDashboard with progress bars
- [ ] Add status indicators
- [ ] Wire up to global state

### Phase 4: Module 3 - Evidence (Day 2-3)
- [ ] Build multi-type upload
- [ ] Create EvidenceCard with thumbnails
- [ ] Add KPI linking dropdown
- [ ] Create ValidationSummary
- [ ] Wire up to global state

### Phase 5: Module 4 - SROI (Day 3)
- [ ] Build OutcomesTable
- [ ] Create AdjustmentSliders with tooltips
- [ ] Build CalculationBreakdown visualization
- [ ] Create SROIDisplay component
- [ ] Implement calculation logic
- [ ] Wire up to global state

### Phase 6: Module 5 - Report (Day 3-4)
- [ ] Build ReportPreview
- [ ] Implement PDF generation
- [ ] Add download functionality

### Phase 7: Polish (Day 4)
- [ ] Responsive testing
- [ ] Loading states
- [ ] Error handling
- [ ] Final styling pass
- [ ] Deploy to Vercel

---

## 14. Success Criteria

The MVP is complete when:

1. **Multi-project works:** User can create multiple projects from the dashboard, open any project, and each has independent data

2. **End-to-end flow works per project:** User can upload sample MoU → See extracted KPIs → Upload sample reports → See progress dashboard → Upload sample evidence → See validation → View SROI calculation → Download PDF report

3. **Professional appearance:** UI looks polished enough for an exhibition demo

4. **Data flows correctly:** Changes in earlier stages reflect in later stages, within each project

5. **Project isolation:** Each project's data is independent — editing one project does not affect another

6. **Works offline-capable:** Core functionality works without internet using Ollama fallback

7. **Deployable:** Running on Vercel with stable URL

---

## 15. Out of Scope for MVP

The following are explicitly NOT included in this MVP:

- User authentication / login
- Database / persistent storage (uses LocalStorage)
- Edit history / versioning
- Export to formats other than PDF
- Email / sharing functionality
- Mobile-optimized UI (tablet minimum)
- Multi-language support
- Accessibility audit (basic only)
- Cross-project reporting / portfolio-level analytics

---

## 16. Appendix: Sample Data Files

> **Note to Technical Agent:** 
> We can provide sample PDF files (MoU, NGO reports) for testing if needed. Let us know if you want these created, or if the mock data in code is sufficient for MVP development.

---

**End of PRD**

*Questions? Clarifications? Flag them and we'll address before you start building.*
