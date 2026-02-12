// Extraction prompt templates — shared by Claude and Ollama providers
// See: Technical Architecture §4.5

export const MOU_EXTRACTION_PROMPT = `You are an expert CSR impact analyst extracting structured data from a Memorandum of Understanding (MoU) between organizations.

IMPORTANT: CSR/government MoUs often do NOT have a dedicated "KPI" section. Measurable commitments are typically scattered across purpose/scope sections, role descriptions, deliverables lists, and reporting clauses. You MUST scan the ENTIRE document thoroughly.

Extract the following:

1. **Project Details:**
   - projectName: The project or initiative name (look at the title, subject line, or "purpose" section)
   - ngoName: The implementing/partner organization (not the government body)
   - location: Geographic location(s) — city, state, or "Pan-India" / "National" if multi-location
   - duration: Duration (e.g., "36 months", "3 years") — check the Duration/Validity clause
   - startDate: Start date in YYYY-MM-DD format (use signing date if no separate start date)
   - totalBudget: Total budget as a number in INR (null if not mentioned anywhere)

2. **KPIs (Key Performance Indicators):**
   Search ALL sections for any quantifiable commitments, targets, or deliverables. These include:
   - Explicit numeric targets (e.g., "2 lakh students", "5 centres", "15 partnerships")
   - Frequency-based commitments (e.g., "quarterly reports" → 4/year, "annual report" → 1/year)
   - Personnel commitments (e.g., "deploy two fellows" → target: 2)
   - Event/activity counts (e.g., "national hackathons", "workshops", "training programs")
   - Infrastructure targets (e.g., "R&D labs", "innovation hubs", "centres of excellence")
   - Outreach/engagement targets (e.g., "student engagement", "industry partnerships")
   - Deliverables listed in any "deliverables management" or "role/responsibility" section

   For deliverables without an explicit number, infer a reasonable annual target from context:
   - "organize hackathons" with no count → estimate 2-3 per year based on typical CSR programs
   - "capacity-building workshops" → estimate 8-12 per year
   - "facilitate industry collaborations" → estimate 5-10 per year

   Aim to extract 8-15 KPIs. If you find fewer than 5, re-read the document — you are likely missing deliverables embedded in role descriptions or scope clauses.

   For each KPI:
   - id: Generate sequential IDs: "kpi-1", "kpi-2", etc.
   - name: Clear, concise name (e.g., "Student Outreach & Engagement")
   - targetValue: Numeric target (annual target if the MoU spans multiple years)
   - unit: "count", "%", "₹", etc.
   - targetDate: Target date in YYYY-MM-DD (null if not specified; use MoU end date for overall targets)
   - category: Classify as:
     - "output" — activities/deliverables (people trained, events held, reports submitted, fellows deployed, labs set up)
     - "outcome" — immediate results (placements made, partnerships formed, institutions engaged)
     - "impact" — long-term systemic change (policy influence, ecosystem development, sustained engagement)

Return ONLY valid JSON matching this exact schema, with no additional text:

{
  "projectDetails": {
    "projectName": "string",
    "ngoName": "string",
    "location": "string",
    "duration": "string",
    "startDate": "string",
    "totalBudget": number | null
  },
  "kpis": [
    {
      "id": "string",
      "name": "string",
      "targetValue": number,
      "unit": "string",
      "targetDate": "string | null",
      "category": "output | outcome | impact"
    }
  ]
}`;

export function buildReportExtractionPrompt(existingKpis: string): string {
  return `You are analyzing an NGO progress report for a CSR project.

The project has these KPIs that you need to match reported values against:

${existingKpis}

Extract the following from this progress report:

1. **Report metadata:**
   - reportDate: The date of the report in YYYY-MM-DD format
   - reportPeriod: The period covered (e.g., "Month 3", "Q1 2024", "January-March 2024")

2. **KPI Values:**
   For each KPI listed above that has a reported value in this document:
   - kpiId: The ID of the matching KPI from the list above
   - reportedValue: The numeric value reported
   - reportDate: Date of this measurement in YYYY-MM-DD format
   - notes: Any relevant notes or context (null if none)

Return ONLY valid JSON matching this exact schema:

{
  "reportDate": "string",
  "reportPeriod": "string",
  "kpiValues": [
    {
      "kpiId": "string",
      "reportedValue": number,
      "reportDate": "string",
      "notes": "string" | null
    }
  ]
}`;
}

export function buildEvidenceAnalysisPrompt(
  evidenceMetadata: string,
  linkedKpiData: string
): string {
  return `You are validating field evidence for a CSR project impact assessment.

The following evidence files have been uploaded and linked to KPIs:

${evidenceMetadata}

The linked KPIs and their reported values are:

${linkedKpiData}

For each KPI that has linked evidence, assess whether the evidence supports the reported values:

- kpiId: The KPI ID
- kpiName: The KPI name
- reportedValue: The value reported in progress reports
- evidenceValue: The value you can extract/infer from the evidence (null if not determinable)
- matchPercentage: How closely the evidence matches the reported value as a percentage (null if not determinable)
- status: One of:
  - "verified" — evidence supports the reported value (within 20% margin)
  - "discrepancy" — evidence contradicts the reported value (>20% difference)
  - "no-evidence" — insufficient evidence to validate
- evidenceCount: Number of evidence files linked to this KPI

Return ONLY valid JSON matching this exact schema:

{
  "validationResults": [
    {
      "kpiId": "string",
      "kpiName": "string",
      "reportedValue": number,
      "evidenceValue": number | null,
      "matchPercentage": number | null,
      "status": "verified" | "discrepancy" | "no-evidence",
      "evidenceCount": number
    }
  ]
}`;
}
