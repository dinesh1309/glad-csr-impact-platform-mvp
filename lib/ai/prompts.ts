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

export function buildKpiSuggestionPrompt(
  fileInfo: string,
  kpiList: string
): string {
  return `You are analyzing an uploaded evidence file for a CSR project.

File details:
${fileInfo}

The project tracks these KPIs:
${kpiList}

Which KPIs does this evidence file provide data for? Only return KPI IDs where
the file content clearly relates to that metric. Be selective — do not guess.

Return ONLY valid JSON: { "kpiIds": ["kpi-1", "kpi-3"] }`;
}

export function buildEvidenceAnalysisPrompt(
  evidenceMetadata: string,
  linkedKpiData: string
): string {
  return `You are validating field evidence for a CSR project impact assessment.

The following evidence files have been uploaded and linked to KPIs. Each file may include a DATA SUMMARY with column aggregates (sum, count, avg, min, max) and the full CSV data:

${evidenceMetadata}

The linked KPIs and their reported values are:

${linkedKpiData}

IMPORTANT — How to extract evidence values from data:
- Use column aggregates (sums, counts) to derive evidence values. For example:
  - A "Children_Attended" column with sum=869 across 31 rows means the evidence shows 869 children reached.
  - A "Digital_Downloads" column with sum=338 means 338 downloads evidenced.
  - Pre/Post score columns can be used to compute improvement percentages.
- The evidence is a SAMPLE of field data — it may cover only a portion of the full project. A sample that is directionally consistent with reported values (even if the absolute number is lower) should be considered supporting evidence.
- Compare evidence values against reported values. If the evidence is a clear sample/subset, assess whether it is consistent with the reported scale.

For each KPI that has linked evidence, assess whether the evidence supports the reported values:

- kpiId: The KPI ID
- kpiName: The KPI name
- reportedValue: The value reported in progress reports (use 0 if N/A)
- evidenceValue: The value you extracted/computed from the evidence data (null only if no data columns relate to this KPI)
- matchPercentage: How closely the evidence supports the reported value as a percentage (null only if evidenceValue is null)
- status: One of:
  - "verified" — evidence is consistent with and supports the reported value
  - "discrepancy" — evidence clearly contradicts the reported value
  - "no-evidence" — no data in the evidence files relates to this KPI
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
