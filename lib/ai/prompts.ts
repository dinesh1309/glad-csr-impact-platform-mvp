// Extraction prompt templates — shared by Claude and Ollama providers
// See: Technical Architecture §4.5

export const MOU_EXTRACTION_PROMPT = `You are analyzing a Memorandum of Understanding (MoU) for a CSR (Corporate Social Responsibility) project.

Extract the following structured data from this document:

1. **Project Details:**
   - projectName: The name of the CSR project
   - ngoName: The implementing NGO or partner organization
   - location: Geographic location(s) of the project
   - duration: Duration of the project (e.g., "12 months")
   - startDate: Project start date in YYYY-MM-DD format (estimate if only month/year given)
   - totalBudget: Total budget as a number in INR (null if not mentioned)

2. **KPIs (Key Performance Indicators):**
   For each measurable KPI found in the document, extract:
   - id: Generate a unique ID like "kpi-1", "kpi-2", etc.
   - name: Name/description of the KPI
   - targetValue: Numeric target value
   - unit: Unit of measurement (e.g., "%", "count", "days", "₹")
   - targetDate: Target completion date in YYYY-MM-DD format (null if not specified)
   - category: Classify as one of:
     - "output" — activity-level metric (e.g., people trained, sessions held)
     - "outcome" — immediate result (e.g., placement rate, satisfaction score)
     - "impact" — long-term change (e.g., income increase, quality of life)

Return ONLY valid JSON matching this exact schema, with no additional text or explanation:

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
      "targetDate": "string" | null,
      "category": "output" | "outcome" | "impact"
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
