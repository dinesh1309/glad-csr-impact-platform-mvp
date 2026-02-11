# Technical Architecture Document
## CSR Impact Assessment Platform — MVP

**Version:** 3.0
**Date:** February 2026
**Status:** Draft — Pending Review

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

The application is built with **Next.js (App Router)** running in **server mode** (not static export). It requires a server because AI extraction runs through Next.js API routes — calling either the Claude API (online) or a local Ollama instance (offline/low-internet).

```
┌──────────────────────────────────────────────────────────────────┐
│                          Browser                                  │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Next.js    │  │   Zustand    │  │    LocalStorage      │   │
│  │  App Router  │  │    Store     │◄─┤    Persistence       │   │
│  │  (Pages/UI)  │  │  (Central)   │  │    (Session Data)    │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────────┘   │
│         │                 │                                       │
│  ┌──────▼─────────────────▼───────────────────────────────────┐  │
│  │                  Component Layer                             │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │  │
│  │  │ Stage 1 │ │ Stage 2 │ │ Stage 3 │ │ Stage 4 │         │  │
│  │  │   MoU   │ │ Reports │ │Evidence │ │  SROI   │         │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘         │  │
│  │  ┌─────────┐                                               │  │
│  │  │ Stage 5 │  ◄── All stages read/write to Zustand        │  │
│  │  │ Report  │                                               │  │
│  │  └─────────┘                                               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                   Utility Layer                              │  │
│  │  FileReader API │ SROI Calculator │ PDF Generator           │  │
│  │  (File Parsing) │ (Pure Function) │ (@react-pdf)            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
└──────────────────────────────┬────────────────────────────────────┘
                               │  HTTP calls to /api/extract/*
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Next.js API Routes (Server)                    │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              AI Extraction Service Layer                     │  │
│  │                                                              │  │
│  │  ┌─────────────────────┐    ┌─────────────────────────┐    │  │
│  │  │   Connectivity      │    │   Extraction Router      │    │  │
│  │  │   Check             │───▶│                          │    │  │
│  │  │   (Can reach API?)  │    │  Online? → Claude API    │    │  │
│  │  └─────────────────────┘    │  Offline? → Ollama       │    │  │
│  │                              └──────────┬──────────────┘    │  │
│  │                                         │                    │  │
│  │                    ┌────────────────────┼──────────────┐    │  │
│  │                    ▼                    ▼              │    │  │
│  │  ┌──────────────────────┐  ┌────────────────────┐     │    │  │
│  │  │   Claude API         │  │   Ollama (Local)   │     │    │  │
│  │  │   @anthropic-ai/sdk  │  │   http://localhost  │     │    │  │
│  │  │                      │  │   :11434            │     │    │  │
│  │  │   Model: claude-     │  │                     │     │    │  │
│  │  │   sonnet-4-5         │  │   Model: mistral    │     │    │  │
│  │  │                      │  │   or llama3         │     │    │  │
│  │  └──────────────────────┘  └────────────────────┘     │    │  │
│  │                                                        │    │  │
│  └────────────────────────────────────────────────────────┘    │  │
│                                                                   │
│  API Routes:                                                      │
│  POST /api/extract/mou      → Extract project details + KPIs     │
│  POST /api/extract/report   → Extract progress data vs KPIs      │
│  POST /api/extract/evidence → Analyze evidence + validate        │
│  GET  /api/health           → Check AI provider availability     │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                                 ▼
┌──────────────────────┐          ┌──────────────────────────┐
│   Claude API         │          │   Ollama (Local)          │
│   (Anthropic Cloud)  │          │   (Runs on demo laptop)   │
│                      │          │                            │
│   Needs internet     │          │   Fully offline            │
│   Best quality       │          │   Good quality             │
│   Pay-per-use        │          │   Free, needs 8GB+ RAM     │
└──────────────────────┘          └──────────────────────────────┘
```

### 1.2 Key Architectural Principles

1. **Offline-first for exhibition** — The app must function fully without internet. Ollama provides local AI extraction. Claude API is used when internet is available for better quality.
2. **Automatic failover** — The extraction service checks connectivity and silently switches between Claude API and Ollama. The user never sees this switch.
3. **Single source of state** — Zustand store holds all application data. Components subscribe to the slices they need.
4. **Multi-project architecture** — Users manage multiple projects from a dashboard. Each project has its own independent 5-stage pipeline. All project data is scoped by project ID.
5. **Sequential stage flow** — Within each project, users progress linearly (1→2→3→4→5) with ability to go back. Stage locking is enforced at the store level.
6. **Real AI extraction** — All document extraction (MoU, reports, evidence) uses actual AI, not mock data. Users can upload their own documents and get real results.
6. **Server mode required** — Next.js runs with API routes (not static export) because AI calls happen server-side to protect API keys and handle Ollama communication.

---

## 2. Technology Stack Decisions

These answer the open questions (Q1–Q5) from the PRD.

### Q1: State Management → **Zustand**

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| React Context + useReducer | Built-in, no dependency | Boilerplate-heavy, re-render issues at scale | No |
| Zustand | Minimal API, slice pattern, built-in persist middleware, no provider wrapping | Extra dependency (~1KB) | **Selected** |
| Redux Toolkit | Powerful devtools, mature | Overkill for 5-stage linear flow | No |

**Rationale:** Zustand provides the simplest API for cross-module state. Its `persist` middleware gives us LocalStorage persistence for free. The slice pattern maps naturally to our 5 modules.

### Q2: AI Document Extraction → **Hybrid: Claude API + Ollama Fallback**

This is the most critical architectural decision. The app must extract structured data from real PDFs uploaded by users — at an exhibition with unreliable internet.

#### Solution: Dual-Provider with Automatic Failover

```
User uploads PDF
      │
      ▼
  API Route receives file
      │
      ▼
  Check: Is Claude API reachable?  ──Yes──▶  Use Claude API (best quality)
      │                                         │
      No (timeout after 3s)                     │
      │                                         │
      ▼                                         │
  Check: Is Ollama running?  ──Yes──▶  Use Ollama (good quality, offline)
      │                                         │
      No                                        │
      │                                         │
      ▼                                         ▼
  Return error:                          Return extracted data
  "No AI provider available.             to browser
   Please start Ollama or
   check internet connection."
```

#### Provider Details

| | Claude API (Primary) | Ollama (Fallback) |
|---|---|---|
| **When used** | Internet available | Offline / low internet |
| **Model** | claude-sonnet-4-5-20250929 | mistral (7B) or llama3 (8B) |
| **Quality** | Excellent PDF understanding | Good structured extraction |
| **Latency** | 3–8 seconds | 5–15 seconds (depends on hardware) |
| **Cost** | ~$0.01–0.05 per extraction | Free |
| **Setup** | API key in `.env.local` | Install Ollama + pull model |
| **RAM needed** | N/A | 8GB minimum, 16GB recommended |

#### Extraction Prompts

Both providers receive the same structured prompt. The prompt instructs the AI to return JSON matching our TypeScript interfaces. The prompt is provider-agnostic — only the API call mechanism differs.

```
Prompt Template (MoU Extraction):
─────────────────────────────────
"You are analyzing a Memorandum of Understanding (MoU) for a CSR project.
Extract the following structured data from this document:

1. Project Details: project name, NGO name, location, duration, start date, budget
2. KPIs: For each measurable KPI, extract name, target value, unit, target date
3. Classify each KPI as: output (activity), outcome (immediate result), or impact (long-term)

Return ONLY valid JSON matching this schema:
{
  "projectDetails": { ... },
  "kpis": [ ... ]
}

Document content:
<document>
{extracted_text_or_base64_pdf}
</document>"
```

#### PDF Text Extraction

Before sending to the AI model, PDFs need text extraction:
- **For Claude API:** Send the PDF as base64 directly (Claude supports PDF input natively)
- **For Ollama:** Extract text server-side using `pdf-parse` library, then send text to the model

#### Health Check Endpoint

`GET /api/health` returns the current status of both providers:

```json
{
  "claude": { "available": true, "latency": 245 },
  "ollama": { "available": true, "model": "mistral", "latency": 120 },
  "activeProvider": "claude"
}
```

The UI shows a small connectivity indicator (green/yellow/red dot) so the presenter knows which provider is active.

### Q3: PDF Generation → **@react-pdf/renderer**

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| @react-pdf/renderer | React component syntax, no server needed, good styling control | Bundle size (~200KB) | **Selected** |
| Puppeteer | Exact HTML-to-PDF | Requires headless browser, heavy | No |
| jsPDF | Lightweight | Low-level API, hard to style complex layouts | No |

**Rationale:** Runs entirely client-side. Report sections are built as React components mirroring the on-screen preview. No additional server dependency.

### Q4: File Upload Handling → **Client-side read, Server-side AI processing**

- Files are read in the browser using `FileReader` API
- The file content (base64 for PDFs, raw text for CSVs) is sent to the API route
- API route passes the content to the AI provider for extraction
- Extracted structured data is returned to the browser and stored in Zustand
- Images are converted to Base64 thumbnails client-side
- CSVs are parsed client-side using `papaparse`
- **No files are stored on disk** — everything is in-memory

### Q5: Data Persistence → **LocalStorage via Zustand Persist**

- Zustand's `persist` middleware auto-syncs the entire `projects[]` array to LocalStorage
- All projects and their data survive page refreshes and browser restarts
- "Reset Project" button clears data for a single project
- "Delete Project" removes a project entirely from the store and LocalStorage
- File blobs (PDFs, images) are **not** persisted — only metadata and extracted values are stored
- This is sufficient for a demo/exhibition context

---

## 3. Project Structure

```
glad-csr-impact-platform-mvp/
├── app/
│   ├── layout.tsx                # Root layout: fonts, metadata, global providers
│   ├── page.tsx                  # Entry point: renders <AppShell />
│   ├── globals.css               # Tailwind directives + custom CSS variables
│   │
│   └── api/                      # Server-side API routes
│       ├── extract/
│       │   ├── mou/route.ts      # POST: Extract project details + KPIs from MoU
│       │   ├── report/route.ts   # POST: Extract progress data from NGO report
│       │   └── evidence/route.ts # POST: Analyze evidence files
│       │
│       └── health/route.ts       # GET: Check AI provider availability
│
├── components/
│   ├── dashboard/
│   │   ├── ProjectDashboard.tsx  # Landing page: project list + create new
│   │   ├── ProjectCard.tsx       # Individual project card with status summary
│   │   └── CreateProjectDialog.tsx # Dialog for creating a new project
│   │
│   ├── shell/
│   │   ├── AppShell.tsx          # Main layout: header + stepper + content area (per project)
│   │   ├── StageStepper.tsx      # Horizontal 5-step progress indicator
│   │   ├── StageContainer.tsx    # Wrapper for stage content with title/description
│   │   └── AIStatusIndicator.tsx # Small dot showing Claude/Ollama/offline status
│   │
│   ├── stage1-mou/
│   │   ├── MoUUpload.tsx         # Drag-and-drop upload zone
│   │   ├── ProjectDetailsCard.tsx    # Editable project info card
│   │   ├── KPICard.tsx           # Single KPI with inline edit + delete
│   │   └── KPIList.tsx           # KPI list with add button
│   │
│   ├── stage2-reports/
│   │   ├── ReportUpload.tsx      # Multi-file upload for progress reports
│   │   ├── ReportList.tsx        # List of uploaded reports with status
│   │   ├── ProgressDashboard.tsx # Grid of progress cards
│   │   └── ProgressCard.tsx      # Single KPI progress (bar + status badge)
│   │
│   ├── stage3-evidence/
│   │   ├── EvidenceUpload.tsx    # Multi-type file upload (PDF, CSV, images)
│   │   ├── EvidenceCard.tsx      # Evidence item with thumbnail + KPI tags
│   │   └── ValidationSummary.tsx # Summary table of validation results
│   │
│   ├── stage4-sroi/
│   │   ├── OutcomesTable.tsx     # Monetized outcomes list
│   │   ├── AdjustmentSliders.tsx # Deadweight/Attribution/Drop-off sliders
│   │   ├── CalculationBreakdown.tsx  # Step-by-step visual breakdown
│   │   └── SROIDisplay.tsx       # Large SROI ratio display
│   │
│   ├── stage5-report/
│   │   ├── ReportPreview.tsx     # On-screen report preview (scrollable)
│   │   └── PDFDocument.tsx       # @react-pdf/renderer document definition
│   │
│   └── ui/                       # shadcn/ui components (auto-generated)
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── slider.tsx
│       ├── progress.tsx
│       ├── badge.tsx
│       ├── dialog.tsx
│       ├── tooltip.tsx
│       ├── skeleton.tsx
│       └── ...
│
├── lib/
│   ├── store.ts                  # Zustand store with slices + persist
│   ├── types.ts                  # All TypeScript interfaces
│   ├── mock-data.ts              # Fallback mock data (only if both AI providers fail)
│   ├── calculations.ts           # SROI calculation (pure functions)
│   ├── utils.ts                  # Shared utilities (cn helper, formatters)
│   │
│   └── ai/                       # AI extraction logic (server-side only)
│       ├── provider.ts           # Provider selection + failover logic
│       ├── claude.ts             # Claude API integration
│       ├── ollama.ts             # Ollama integration
│       ├── prompts.ts            # Extraction prompt templates (shared by both)
│       └── pdf-parser.ts         # PDF text extraction for Ollama (pdf-parse)
│
├── .env.local                    # API keys (not committed)
│   # ANTHROPIC_API_KEY=sk-ant-...
│   # OLLAMA_BASE_URL=http://localhost:11434
│   # AI_PROVIDER=auto            # auto | claude | ollama
│
├── public/
│   └── (static assets if needed)
│
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 4. AI Extraction Architecture (Detailed)

This is the most critical section. It covers how real document extraction works across both providers.

### 4.1 Extraction Service Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    API Route Handler                          │
│  (e.g., POST /api/extract/mou)                               │
│                                                               │
│  1. Receive file from client (base64 or FormData)            │
│  2. Call getActiveProvider() to determine which AI to use     │
│  3. Build extraction prompt from prompts.ts                   │
│  4. Call the provider                                         │
│  5. Parse JSON response                                       │
│  6. Validate response matches expected schema                 │
│  7. Return structured data to client                          │
│                                                               │
│  Error handling:                                               │
│  - If primary provider fails → retry with fallback provider   │
│  - If both fail → return error with manual entry option       │
│  - If JSON parse fails → retry once with stricter prompt      │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Provider Selection Logic (`lib/ai/provider.ts`)

```
function getActiveProvider():

  1. Check env: AI_PROVIDER setting
     - "claude" → Force Claude only
     - "ollama" → Force Ollama only
     - "auto"  → Automatic selection (default)

  2. If "auto":
     a. Ping Claude API (HEAD request, 3s timeout)
        - Reachable → return "claude"
     b. Ping Ollama (GET http://localhost:11434/api/tags, 2s timeout)
        - Reachable → return "ollama"
     c. Neither available → throw AIProviderUnavailableError

  3. Cache the result for 30 seconds to avoid repeated health checks
```

### 4.3 Claude Integration (`lib/ai/claude.ts`)

```
- Uses @anthropic-ai/sdk
- Sends PDF as base64 in a message with the extraction prompt
- Claude natively understands PDF content (no pre-processing needed)
- Model: claude-sonnet-4-5-20250929 (best balance of speed + quality + cost)
- Max tokens: 4096 (sufficient for structured JSON output)
- Temperature: 0 (deterministic output for consistent extraction)
```

### 4.4 Ollama Integration (`lib/ai/ollama.ts`)

```
- Uses Ollama REST API (http://localhost:11434/api/generate)
- PDFs must be pre-processed: extract text using pdf-parse library
- Sends extracted text + prompt to the model
- Model: mistral (7B) — good at structured output, runs on 8GB RAM
- Alternative: llama3 (8B) — if mistral is unavailable
- Response parsing: Extract JSON from model output (may need cleanup)
```

### 4.5 Prompt Templates (`lib/ai/prompts.ts`)

Three prompt templates, one per extraction type. Both providers use the same prompts:

| Prompt | Input | Output Schema | Used By |
|--------|-------|---------------|---------|
| `MOU_EXTRACTION_PROMPT` | MoU document content | `{ projectDetails: ProjectDetails, kpis: KPI[] }` | Stage 1 |
| `REPORT_EXTRACTION_PROMPT` | Report content + existing KPIs list | `{ reportDate, reportPeriod, kpiValues: KPIValue[] }` | Stage 2 |
| `EVIDENCE_ANALYSIS_PROMPT` | Evidence metadata + linked KPI data | `{ validationResults: ValidationResult[] }` | Stage 3 |

Each prompt:
- Describes the exact JSON schema expected
- Provides field-level instructions
- Includes examples for ambiguous fields
- Ends with "Return ONLY valid JSON, no explanation"

### 4.6 Error Handling & Fallback Chain

```
Attempt 1: Primary provider (based on connectivity)
    │
    ├── Success → Return data
    │
    └── Failure (timeout, parse error, model error)
            │
            ▼
Attempt 2: Secondary provider
    │
    ├── Success → Return data
    │
    └── Failure
            │
            ▼
Attempt 3: Return error to UI
    │
    └── UI shows: "AI extraction failed. You can enter data manually."
         └── Manual entry form appears (same fields, empty)
```

### 4.7 AI Status Indicator (UI Component)

A small status badge in the app header shows the current AI provider state:

| State | Display | Color |
|-------|---------|-------|
| Claude API connected | "AI: Cloud" | Green |
| Ollama connected (offline) | "AI: Local" | Blue |
| No provider available | "AI: Offline" | Red |
| Checking... | "AI: ..." | Gray |

This is polled every 30 seconds via `GET /api/health` and helps the exhibition presenter know the system state.

---

## 5. State Management Architecture

### 5.1 Zustand Store — Multi-Project Architecture

The store manages multiple projects. Each project contains its own module data organized into slices. A top-level `projects` slice manages the project list and active project selection.

```
┌──────────────────────────────────────────────────────────────┐
│                        Zustand Store                          │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │                   Projects Slice (Top Level)              ││
│  │                                                           ││
│  │  projects: Project[]       # All project data             ││
│  │  activeProjectId: string | null  # null = dashboard view  ││
│  │  view: 'dashboard' | 'project'   # Current screen         ││
│  │                                                           ││
│  │  createProject()    # Add new project, set as active       ││
│  │  deleteProject(id)  # Remove project + data                ││
│  │  openProject(id)    # Set activeProjectId, view='project'  ││
│  │  goToDashboard()    # Set activeProjectId=null, view='dash'││
│  │  getActiveProject() # Helper: returns current project data  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │          Per-Project Data (inside each Project)           ││
│  │                                                           ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ││
│  │  │  Navigation  │  │   MoU Data   │  │ Reports Data │  ││
│  │  │              │  │  (Stage 1)   │  │  (Stage 2)   │  ││
│  │  │ currentStage │  │ fileName     │  │ files[]      │  ││
│  │  │              │  │ projectInfo  │  │ progressData │  ││
│  │  │              │  │ kpis[]       │  │              │  ││
│  │  │              │  │ isConfirmed  │  │              │  ││
│  │  └──────────────┘  └──────────────┘  └──────────────┘  ││
│  │                                                           ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ││
│  │  │Evidence Data │  │  SROI Data   │  │ Report Data  │  ││
│  │  │  (Stage 3)   │  │  (Stage 4)   │  │  (Stage 5)   │  ││
│  │  │ files[]      │  │ investment   │  │ generatedAt  │  ││
│  │  │ validations[]│  │ outcomes[]   │  │ pdfBlob      │  ││
│  │  │              │  │ adjustments  │  │              │  ││
│  │  │              │  │ sroiRatio    │  │              │  ││
│  │  └──────────────┘  └──────────────┘  └──────────────┘  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │           Zustand Persist Middleware                      ││
│  │           → Syncs all projects to LocalStorage            ││
│  │           → Excludes: pdfBlob, file objects               ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Store actions for project-scoped operations** (e.g., `setProjectDetails`, `addKPI`, `addReport`) all operate on the active project. They find the project by `activeProjectId` and update its data in the `projects[]` array.

### 5.2 Stage Progression Logic (Per Project)

```
Stage 1 → Complete when: project.mou.isConfirmed === true
Stage 2 → Complete when: project.reports.progressData.length > 0
Stage 3 → Complete when: project.evidence.files.length > 0
Stage 4 → Complete when: project.sroi.calculatedRatio !== null (auto-completes)
Stage 5 → Final stage, always accessible once Stage 4 is reached
```

**Rules:**
- `project.currentStage` determines which stage the user sees within a project
- User can go back to any stage <= currentStage
- User cannot skip forward past the next incomplete stage
- Going back and editing data in an earlier stage does NOT reset later stages (data carries forward), but the user is shown a warning that downstream data may be affected
- Each project's stage progression is independent

---

## 6. Data Flow Between Modules

```
Module 1 (MoU)
  │
  ├── projectDetails ──────────────────────────────────► Module 5 (Report)
  │
  └── kpis[] ──────┬──────────────────────────────────► Module 5 (Report)
                    │
                    ▼
              Module 2 (Reports)
                │
                ├── progressData[] ────┬───────────────► Module 5 (Report)
                │                      │
                │                      ▼
                │               Module 4 (SROI)
                │                 │
                │                 └── sroiRatio ──────► Module 5 (Report)
                │                 └── outcomes[] ─────► Module 5 (Report)
                │
                └── kpiValues[] ──────► Module 3 (Evidence)
                                          │
                                          └── validationResults[] ► Module 5 (Report)
```

**Key data dependencies:**
- Module 2 reads `kpis[]` from Module 1 to match reported values against targets
- Module 3 reads `kpis[]` and `progressData[]` to link evidence and validate
- Module 4 reads `progressData[]` to auto-populate outcome items for monetization
- Module 5 reads everything from all prior modules to compile the report

---

## 7. Component Architecture — Key Patterns

### 7.1 Stage Components

Each stage follows a consistent pattern:

```
StageContainer (title, description, proceed button)
  └── Stage-specific content
       ├── Upload section (Stages 1, 2, 3)
       ├── AI processing indicator (loading + provider badge)
       ├── Data display/edit section
       └── Summary/status section
```

### 7.2 Upload Pattern (Reusable)

Stages 1, 2, and 3 all have file upload. A shared pattern is used:

```
<UploadZone>
  ├── Drag-and-drop area with visual states (idle, hover, error)
  ├── File type validation (per stage)
  ├── Size limit check (10MB)
  └── onFilesAccepted callback → sends to API route → AI extraction
```

### 7.3 AI Extraction UI Flow

When a user uploads a file:

```
1. File accepted → Show "Extracting..." with spinner + AI provider badge
2. POST to /api/extract/* → Wait for response (3–15 seconds)
3. Success → Display extracted data in editable cards
4. Failure → Show error message + manual entry option
```

### 7.4 Editable Field Pattern

Module 1 requires inline editing of extracted data. Pattern:

```
Display Mode:  value text + pencil icon on hover
Edit Mode:     input field + save/cancel buttons
```

This is implemented as a controlled component that toggles between display and edit modes. This allows users to correct any AI extraction errors.

---

## 8. PDF Generation Architecture

### 8.1 Approach

The PDF is built using `@react-pdf/renderer` which allows defining the PDF as a React component tree. The PDF component reads all data from the Zustand store.

```
PDFDocument.tsx
  ├── CoverPage         (project name, date, company)
  ├── ExecutiveSummary   (auto-generated text from data)
  ├── ProjectOverview    (details table + KPI list from Module 1)
  ├── ProgressSection    (KPI achievement table from Module 2)
  ├── EvidenceSection    (evidence list + validation from Module 3)
  ├── SROISection        (calculation breakdown from Module 4)
  └── Conclusion         (summary statement)
```

### 8.2 Preview vs PDF

- **On-screen preview** (`ReportPreview.tsx`): Regular HTML/React components styled to look like a document
- **PDF download** (`PDFDocument.tsx`): `@react-pdf/renderer` components that produce the actual PDF

These are separate component trees because `@react-pdf/renderer` uses its own primitives (`<Document>`, `<Page>`, `<View>`, `<Text>`) — not HTML elements.

---

## 9. Routing Strategy

### 9.1 Two-Level Navigation with API Routes

The app uses a **single page route** (`/`) with two-level state-driven navigation:

- **Level 1 — Dashboard**: Shows project list. Active when `view === 'dashboard'`.
- **Level 2 — Project**: Shows the 5-stage flow for the active project. Active when `view === 'project'` and `activeProjectId` is set.

Stage navigation within a project is handled through Zustand state (`project.currentStage`), not URL routes.

API routes exist only for server-side AI extraction:

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/extract/mou` | POST | Extract project details + KPIs from MoU PDF |
| `/api/extract/report` | POST | Extract progress data from NGO report |
| `/api/extract/evidence` | POST | Analyze evidence and validate against KPIs |
| `/api/health` | GET | Check AI provider availability |

### 9.2 View Rendering

```tsx
// Simplified rendering logic in page.tsx
const { view, activeProjectId } = useStore();

if (view === 'dashboard' || !activeProjectId) {
  return <ProjectDashboard />;
}

return <AppShell projectId={activeProjectId} />;
```

```tsx
// Inside AppShell — stage rendering for active project
const project = useActiveProject();
const stages = {
  1: <Stage1MoU />,
  2: <Stage2Reports />,
  3: <Stage3Evidence />,
  4: <Stage4SROI />,
  5: <Stage5Report />,
};

return stages[project.currentStage];
```

---

## 10. Third-Party Dependencies

### 10.1 Core Dependencies

| Package | Version | Purpose | Size Impact |
|---------|---------|---------|-------------|
| next | ^14 | Framework (App Router, API routes) | — (build tool) |
| react / react-dom | ^18 | UI library | — (peer dep) |
| tailwindcss | ^3 | Styling | — (build tool) |
| zustand | ^4 | State management | ~1KB gzip |
| @anthropic-ai/sdk | ^0.30 | Claude API client | ~15KB gzip |
| @react-pdf/renderer | ^3 | PDF generation | ~200KB gzip |
| pdf-parse | ^1.1 | PDF text extraction (for Ollama path) | ~5KB gzip |
| papaparse | ^5 | CSV parsing | ~7KB gzip |
| lucide-react | latest | Icons | Tree-shakeable |
| framer-motion | latest | Animations & transitions | ~32KB gzip |

**Not using a chart library.** Sparkline charts (Stage 2 trend lines) are implemented as lightweight hand-coded SVG components (~30 lines). This saves ~45KB vs Recharts and keeps animations consistent with Framer Motion. Can be revisited post-MVP if complex visualizations are needed.

### 10.2 shadcn/ui Components (Not a Dependency)

shadcn/ui components are copied into the project. They depend on:

| Package | Purpose |
|---------|---------|
| class-variance-authority | Component variant styling |
| clsx | Conditional class merging |
| tailwind-merge | Tailwind class deduplication |
| @radix-ui/* | Accessible primitives (only for components used) |

### 10.3 Dev Dependencies

| Package | Purpose |
|---------|---------|
| typescript | Type checking |
| eslint + eslint-config-next | Linting |
| @types/react | React type definitions |

### 10.4 External Software (Not npm packages)

| Software | Required? | Purpose |
|----------|-----------|---------|
| Ollama | Required for offline mode | Local AI model runtime |
| Mistral 7B model | Pulled via Ollama | Default local extraction model |

---

## 11. Styling Architecture

### 11.1 Approach

- **Tailwind CSS** for all styling — no CSS modules, no styled-components
- **shadcn/ui** for base component primitives
- **CSS variables** defined in `globals.css` for the design system colors
- **`cn()` utility** (clsx + tailwind-merge) for conditional classes

### 11.2 Design Token Mapping

```
Primary (Teal) #0891B2  →  colors.primary.DEFAULT
Teal Dark      #0D9488  →  colors.teal.600
Emerald        #10B981  →  colors.emerald.500
Orange         #F97316  →  colors.orange.500
Purple         #7C3AED  →  colors.violet.600
Navy           #1B2A4A  →  colors.navy.DEFAULT (custom)
```

### 11.3 Responsive Strategy

- **Desktop-first** design (minimum 768px as per PRD)
- Tailwind breakpoints: `md:` (768px) and `lg:` (1024px)
- Max content width: `max-w-6xl` (1152px) centered with `mx-auto`
- Cards stack vertically on tablet, grid on desktop

---

## 12. Error Handling Strategy

### 12.1 User-Facing Errors

| Scenario | Handling |
|----------|----------|
| Wrong file type uploaded | Inline error message below upload zone |
| File too large (>10MB) | Inline error message with size limit info |
| AI extraction fails (both providers) | Show error + enable manual data entry form |
| AI returns malformed JSON | Retry once, then show error + manual entry |
| Claude API key missing | Fall back to Ollama silently |
| Ollama not running | Fall back to Claude silently, or show setup instructions if both fail |
| SROI division by zero | Display "N/A" instead of ratio |
| PDF generation fails | Show error toast, allow retry |
| LocalStorage full | Graceful degradation — app works without persistence |

### 12.2 AI Extraction Errors (Server-side)

```
API route error responses:

200 OK           → { success: true, data: { ... }, provider: "claude" }
200 OK           → { success: true, data: { ... }, provider: "ollama" }
422 Unprocessable → { success: false, error: "Could not extract data", canRetry: true }
503 Unavailable   → { success: false, error: "No AI provider available", canRetry: false }
```

---

## 13. Performance Considerations

### 13.1 Bundle Size

Target: **< 500KB** initial JS bundle (gzipped)

- Next.js code splitting handles per-stage components automatically
- `@react-pdf/renderer` is dynamically imported only at Stage 5
- `@anthropic-ai/sdk` is server-only (not in client bundle)
- Tree-shaking for `lucide-react` icons

### 13.2 AI Extraction Latency

| Provider | Expected Latency | Mitigation |
|----------|-------------------|------------|
| Claude API | 3–8 seconds | Show progress animation with helpful text |
| Ollama (Mistral) | 5–15 seconds | Show progress animation + "Running locally..." |
| Connectivity check | 2–3 seconds | Cache result for 30 seconds |

### 13.3 Runtime Performance

- Zustand selectors prevent unnecessary re-renders
- File processing (CSV parsing, image thumbnails) runs asynchronously
- SROI calculation is a pure function — runs synchronously (fast)
- PDF generation is async and shows a loading state

---

## 14. Deployment Strategy — CI/CD First

### 14.1 Core Principle: Deploy from Day 1

The deployment pipeline is set up in **Step 1** of development, before any feature code is written. Every commit is automatically deployed to Vercel so issues are caught early and the live URL is always up-to-date.

```
Developer pushes to GitHub
        │
        ▼
┌──────────────────────────┐
│   GitHub Repository       │
│   (main branch)           │
└──────────┬───────────────┘
           │  Webhook trigger (automatic)
           ▼
┌──────────────────────────┐
│   Vercel Build Pipeline   │
│                           │
│   1. Install dependencies │
│   2. Lint check           │
│   3. TypeScript check     │
│   4. next build           │
│   5. Deploy               │
│                           │
│   If any step fails →     │
│   Build error notification│
│   (visible in Vercel UI)  │
└──────────┬───────────────┘
           │  On success
           ▼
┌──────────────────────────┐
│   Live Production URL     │
│   https://glad-csr-*.     │
│   vercel.app              │
│                           │
│   Updated on every push   │
│   to main branch          │
└──────────────────────────┘
```

### 14.2 CI/CD Workflow

| Event | Action | Result |
|-------|--------|--------|
| Push to `main` | Vercel auto-builds + deploys | Production URL updated |
| Push to any branch | Vercel creates preview deployment | Unique preview URL for testing |
| Build fails | Vercel shows error in dashboard | Previous deployment stays live |
| Environment variable change | Redeploy via Vercel dashboard | New config applied |

### 14.3 Development Workflow (Commit-Push-Verify Loop)

Every step of development follows this cycle:

```
Write code → Test locally → Commit → Push to GitHub → Vercel deploys
     │                                                        │
     │              ◄─── Fix if broken ◄──── Check live URL ──┘
     │
     └── Move to next step only when live deployment is green
```

This ensures:
- Build errors are caught immediately (not accumulated)
- The live URL is always demo-ready
- No "works on my machine" surprises
- Deployment issues (env vars, serverless function limits) are surfaced early

### 14.4 Two Runtime Modes

#### Mode A: Vercel (Online demo, good internet)

```
- Auto-deployed from GitHub on every push
- Claude API key set as Vercel environment variable
- Ollama not available (cloud-only)
- API routes run as Vercel Serverless Functions
- AI_PROVIDER=claude in environment
```

#### Mode B: Local (Exhibition, low/no internet)

```
- Run on demo laptop: npm run build && npm start
- Ollama installed + mistral model pulled
- Claude API key in .env.local (used if internet available)
- AI_PROVIDER=auto in environment (tries Claude, falls back to Ollama)
- Fully functional without internet
```

### 14.5 Exhibition Setup Checklist

Pre-exhibition preparation (with internet):
```
1. Clone repo and npm install
2. npm run build (build the production app)
3. Install Ollama (https://ollama.ai)
4. Pull model: ollama pull mistral
5. Set .env.local with ANTHROPIC_API_KEY (optional, for when internet works)
6. Test: Start Ollama, run npm start, upload a sample MoU
7. Verify offline: Disconnect internet, test again
```

At the exhibition:
```
1. Start Ollama (runs in background)
2. npm start (starts Next.js on http://localhost:3000)
3. Open browser to http://localhost:3000
4. AI Status indicator shows "AI: Local" (green/blue) = ready
```

### 14.6 Environment Variables

```
# .env.local (not committed to git)
ANTHROPIC_API_KEY=sk-ant-...          # Claude API key (optional for offline)
OLLAMA_BASE_URL=http://localhost:11434 # Ollama endpoint (default)
OLLAMA_MODEL=mistral                   # Which Ollama model to use
AI_PROVIDER=auto                       # auto | claude | ollama
```

### 14.7 Vercel Setup (Done in Step 1)

```
1. Create GitHub repo: glad-csr-impact-platform-mvp
2. Push initial Next.js scaffold to main branch
3. Connect repo to Vercel (import project)
4. Set environment variables in Vercel dashboard:
   - ANTHROPIC_API_KEY
   - AI_PROVIDER=claude
5. Verify first deployment succeeds with a basic landing page
6. Confirm auto-deploy works: make a small change → push → see it live
```

---

## 15. Build Order & Implementation Sequence

Each step ends with a **commit → push → verify on Vercel** checkpoint. No step is considered done until the live deployment is green.

```
Step 1: Project Setup + Deployment Pipeline
  ├── Create GitHub repository
  ├── Initialize Next.js + Tailwind + shadcn/ui + Zustand
  ├── Define types.ts (all TypeScript interfaces including Project)
  ├── Set up store.ts (multi-project store with persist)
  ├── Set up .env.local with placeholder values
  ├── Create basic landing page (app name + "Coming Soon")
  ├── Connect GitHub repo to Vercel
  ├── Set environment variables in Vercel dashboard
  ├── Push to main → verify Vercel deployment succeeds
  └── ✅ CHECKPOINT: Live URL shows landing page

Step 2: AI Extraction Infrastructure
  ├── lib/ai/provider.ts (provider selection + failover)
  ├── lib/ai/claude.ts (Claude API integration)
  ├── lib/ai/ollama.ts (Ollama integration)
  ├── lib/ai/prompts.ts (extraction prompt templates)
  ├── lib/ai/pdf-parser.ts (PDF text extraction)
  ├── API routes: /api/extract/mou, /api/extract/report, /api/extract/evidence
  ├── API route: /api/health
  ├── Test locally with sample PDF against both providers
  ├── Push → verify Vercel build succeeds
  └── ✅ CHECKPOINT: /api/health returns status on live URL

Step 3: Project Dashboard + App Shell (Module 0)
  ├── ProjectDashboard + ProjectCard + CreateProjectDialog
  ├── AppShell + StageStepper + StageContainer
  ├── AIStatusIndicator component
  ├── Multi-project store (projects[], activeProjectId, view)
  ├── Two-level navigation (dashboard ↔ project)
  ├── Push → verify deployment
  └── ✅ CHECKPOINT: Live URL shows project dashboard, can create project and enter 5-stage shell

Step 4: Module 1 (MoU Upload)
  ├── Upload zone → calls /api/extract/mou
  ├── Project details card (editable)
  ├── KPI cards (editable, add, delete)
  ├── Confirm flow + store wiring
  ├── Manual entry fallback if AI fails
  ├── Push → verify deployment
  └── ✅ CHECKPOINT: Can upload MoU and see extracted KPIs on live URL

Step 5: Module 2 (Reports)
  ├── Multi-file upload → calls /api/extract/report
  ├── Progress dashboard with status indicators
  ├── Manual override for extracted values
  ├── Store wiring (reads KPIs from Module 1)
  ├── Push → verify deployment
  └── ✅ CHECKPOINT: Full Stage 1→2 flow works on live URL

Step 6: Module 3 (Evidence)
  ├── Multi-type upload + file type detection
  ├── KPI linking + calls /api/extract/evidence
  ├── Validation summary
  ├── Store wiring
  ├── Push → verify deployment
  └── ✅ CHECKPOINT: Full Stage 1→2→3 flow works on live URL

Step 7: Module 4 (SROI)
  ├── Outcomes table (reads from Module 2)
  ├── Adjustment sliders + live calculation
  ├── SROI display + breakdown
  ├── calculations.ts (pure functions)
  ├── Push → verify deployment
  └── ✅ CHECKPOINT: Full Stage 1→2→3→4 flow works on live URL

Step 8: Module 5 (Report)
  ├── On-screen preview (reads all modules)
  ├── PDF generation + download
  ├── @react-pdf/renderer document
  ├── Push → verify deployment
  └── ✅ CHECKPOINT: Complete end-to-end flow works on live URL

Step 9: Polish & Exhibition Prep
  ├── Loading states, error states, responsive testing
  ├── AI failover testing (online → offline → back)
  ├── Final styling pass
  ├── Test with real MoU and report PDFs
  ├── Build production bundle + Ollama setup docs
  ├── Final push → verify deployment
  └── ✅ CHECKPOINT: Production-ready on Vercel + tested offline with Ollama
```

---

## 16. Future Considerations (Post-MVP)

These are **not built** in MVP but the architecture accommodates them:

| Feature | How Architecture Supports It |
|---------|------------------------------|
| Better AI models | Swap model name in .env.local or provider config. No code changes. |
| Database persistence | Replace Zustand persist (LocalStorage) with API calls. Store interface stays the same. |
| Authentication | Add Next.js middleware + auth provider wrapping the app. |
| Real-time collaboration | Replace Zustand with a synced store (e.g., Liveblocks). |
| Caching extractions | Add a cache layer in the API routes to avoid re-processing the same document. |
| Portfolio analytics | Add a cross-project view that aggregates SROI and progress data from all projects. |

---

## 17. Confirmed Decisions & Assumptions

| # | Item | Decision | Status |
|---|------|----------|--------|
| 1 | Node.js version | 18+ (LTS) | Confirmed |
| 2 | Package manager | **npm** — zero extra setup, universal compatibility, all docs/tutorials assume it | Confirmed |
| 3 | Next.js version | 14 (App Router) | Confirmed |
| 4 | Ollama model | **Mistral 7B** — best JSON compliance, lighter RAM (~6GB), faster responses. Reliable fallback for exhibition demos. | Confirmed |
| 5 | Claude model | **Claude Sonnet 4.5** (`claude-sonnet-4-5-20250929`) — best balance of speed, quality, and cost for document extraction | Confirmed |
| 6 | Currency | Indian Rupees (INR) throughout | Confirmed |
| 7 | Sparkline charts (Module 2) | **Lightweight SVG** — hand-coded `<polyline>` component (~30 lines). Zero bundle cost, Framer Motion compatible, full design system control. Recharts can be evaluated post-MVP if more complex visualizations are needed. | Confirmed |
| 8 | Exhibition hardware | Unknown — architecture supports 8GB+ RAM (Mistral 7B needs ~6GB) | Pending |
| 9 | Connectivity check interval | Every 30 seconds | Confirmed |

---

**End of Technical Architecture Document v3.0**

*v2 changes: Real AI extraction with Claude API + Ollama hybrid approach, offline-first exhibition support, Next.js server mode with API routes.*

*v2.1 changes: All open decisions resolved — npm, Claude Sonnet 4.5, Mistral 7B, Lightweight SVG for sparklines. Section 17 updated from "Open Decisions" to "Confirmed Decisions." Framer Motion added to dependencies table. Sparkline approach documented.*

*v3.0 changes: Multi-project architecture. Added project dashboard, Project entity wrapping all module data, two-level navigation (dashboard + project), multi-project Zustand store, dashboard components in project structure. Removed "Multi-project support" from Future Considerations (now in scope).*
