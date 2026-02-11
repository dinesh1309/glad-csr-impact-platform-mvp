# Master Task List
## CSR Impact Assessment Platform — MVP

**Last Updated:** February 11, 2026
**Status:** Step 1 — Not Started

---

## Progress Overview

| Step | Name | Status | Started | Completed |
|------|------|--------|---------|-----------|
| 1 | Project Setup + Deployment Pipeline | Not Started | — | — |
| 2 | AI Extraction Infrastructure | Not Started | — | — |
| 3 | App Shell (Module 0) | Not Started | — | — |
| 4 | Module 1 — MoU Upload | Not Started | — | — |
| 5 | Module 2 — Progress Reports | Not Started | — | — |
| 6 | Module 3 — Field Evidence | Not Started | — | — |
| 7 | Module 4 — SROI Calculation | Not Started | — | — |
| 8 | Module 5 — Report Generation | Not Started | — | — |
| 9 | Polish & Exhibition Prep | Not Started | — | — |

---

## Step 1: Project Setup + Deployment Pipeline

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.1 | Create GitHub repository | Done | github.com/dinesh1309/glad-csr-impact-platform-mvp |
| 1.2 | Initialize Next.js project with App Router | Not Started | |
| 1.3 | Install & configure Tailwind CSS | Not Started | |
| 1.4 | Install & configure shadcn/ui | Not Started | |
| 1.5 | Install Zustand + persist middleware | Not Started | |
| 1.6 | Create `lib/types.ts` (all TypeScript interfaces) | Not Started | |
| 1.7 | Create `lib/store.ts` (empty slices with persist) | Not Started | |
| 1.8 | Create `.env.local` with placeholder values | Not Started | |
| 1.9 | Create basic landing page (app name + placeholder) | Not Started | |
| 1.10 | Connect GitHub repo to Vercel | Not Started | |
| 1.11 | Set environment variables in Vercel dashboard | Not Started | |
| 1.12 | Push to main → verify Vercel deployment succeeds | Not Started | |
| | **CHECKPOINT:** Live URL shows landing page | | |

---

## Step 2: AI Extraction Infrastructure

| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.1 | Install `@anthropic-ai/sdk` and `pdf-parse` | Not Started | |
| 2.2 | Create `lib/ai/provider.ts` (provider selection + failover) | Not Started | |
| 2.3 | Create `lib/ai/claude.ts` (Claude API integration) | Not Started | |
| 2.4 | Create `lib/ai/ollama.ts` (Ollama integration) | Not Started | |
| 2.5 | Create `lib/ai/prompts.ts` (extraction prompt templates) | Not Started | |
| 2.6 | Create `lib/ai/pdf-parser.ts` (PDF text extraction) | Not Started | |
| 2.7 | Create API route: `POST /api/extract/mou` | Not Started | |
| 2.8 | Create API route: `POST /api/extract/report` | Not Started | |
| 2.9 | Create API route: `POST /api/extract/evidence` | Not Started | |
| 2.10 | Create API route: `GET /api/health` | Not Started | |
| 2.11 | Test locally with sample PDF (Claude) | Not Started | |
| 2.12 | Test locally with sample PDF (Ollama) | Not Started | |
| 2.13 | Push → verify Vercel build succeeds | Not Started | |
| | **CHECKPOINT:** `/api/health` returns status on live URL | | |

---

## Step 3: App Shell (Module 0)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3.1 | Create `components/shell/AppShell.tsx` | Not Started | |
| 3.2 | Create `components/shell/StageStepper.tsx` | Not Started | |
| 3.3 | Create `components/shell/StageContainer.tsx` | Not Started | |
| 3.4 | Create `components/shell/AIStatusIndicator.tsx` | Not Started | |
| 3.5 | Implement navigation logic in store (currentStage, goToStage, etc.) | Not Started | |
| 3.6 | Implement stage locking logic | Not Started | |
| 3.7 | Add reset functionality | Not Started | |
| 3.8 | Responsive layout (desktop + tablet) | Not Started | |
| 3.9 | Push → verify deployment | Not Started | |
| | **CHECKPOINT:** Live URL shows app shell with 5-stage stepper | | |

---

## Step 4: Module 1 — MoU Upload & KPI Extraction

| # | Task | Status | Notes |
|---|------|--------|-------|
| 4.1 | Create `components/stage1-mou/MoUUpload.tsx` (drag-and-drop) | Not Started | |
| 4.2 | File validation (type check, 10MB size limit) | Not Started | |
| 4.3 | Wire upload to `POST /api/extract/mou` | Not Started | |
| 4.4 | Processing state (spinner + "Extracting KPIs...") | Not Started | |
| 4.5 | Create `components/stage1-mou/ProjectDetailsCard.tsx` (editable) | Not Started | |
| 4.6 | Create `components/stage1-mou/KPICard.tsx` (inline edit + delete) | Not Started | |
| 4.7 | Create `components/stage1-mou/KPIList.tsx` (list + add button) | Not Started | |
| 4.8 | Manual entry fallback (if AI extraction fails) | Not Started | |
| 4.9 | Confirm button → locks data, enables Stage 2 | Not Started | |
| 4.10 | Re-upload option (clears previous data) | Not Started | |
| 4.11 | Wire to Zustand store (MoU slice) | Not Started | |
| 4.12 | Push → verify deployment | Not Started | |
| | **CHECKPOINT:** Can upload MoU and see extracted KPIs on live URL | | |

---

## Step 5: Module 2 — Progress Report Matching

| # | Task | Status | Notes |
|---|------|--------|-------|
| 5.1 | Create `components/stage2-reports/ReportUpload.tsx` (multi-file) | Not Started | |
| 5.2 | Wire upload to `POST /api/extract/report` | Not Started | |
| 5.3 | Create `components/stage2-reports/ReportList.tsx` (status per file) | Not Started | |
| 5.4 | Processing queue (sequential processing, progress shown) | Not Started | |
| 5.5 | Create `components/stage2-reports/ProgressDashboard.tsx` | Not Started | |
| 5.6 | Create `components/stage2-reports/ProgressCard.tsx` (bar + badge) | Not Started | |
| 5.7 | Status indicators (green/yellow/red based on % achieved) | Not Started | |
| 5.8 | Gap highlighting (emphasis on behind-target KPIs) | Not Started | |
| 5.9 | Manual override for extracted values | Not Started | |
| 5.10 | Wire to Zustand store (Reports slice, reads KPIs from Module 1) | Not Started | |
| 5.11 | Push → verify deployment | Not Started | |
| | **CHECKPOINT:** Full Stage 1→2 flow works on live URL | | |

---

## Step 6: Module 3 — Field Evidence Validation

| # | Task | Status | Notes |
|---|------|--------|-------|
| 6.1 | Create `components/stage3-evidence/EvidenceUpload.tsx` (PDF, CSV, images) | Not Started | |
| 6.2 | File type detection (auto-categorize: Survey, Photo, Document) | Not Started | |
| 6.3 | Create `components/stage3-evidence/EvidenceCard.tsx` (thumbnail + tags) | Not Started | |
| 6.4 | Photo thumbnails (Base64 conversion) | Not Started | |
| 6.5 | CSV summary (row count, column summary via papaparse) | Not Started | |
| 6.6 | KPI linking dropdown (link evidence to KPIs) | Not Started | |
| 6.7 | Wire to `POST /api/extract/evidence` for validation | Not Started | |
| 6.8 | Create `components/stage3-evidence/ValidationSummary.tsx` | Not Started | |
| 6.9 | Evidence count summary (KPIs with/without linked evidence) | Not Started | |
| 6.10 | Notes field per evidence item | Not Started | |
| 6.11 | Wire to Zustand store (Evidence slice) | Not Started | |
| 6.12 | Push → verify deployment | Not Started | |
| | **CHECKPOINT:** Full Stage 1→2→3 flow works on live URL | | |

---

## Step 7: Module 4 — SROI Calculation

| # | Task | Status | Notes |
|---|------|--------|-------|
| 7.1 | Create `lib/calculations.ts` (SROI pure functions) | Not Started | |
| 7.2 | Create `components/stage4-sroi/OutcomesTable.tsx` (from Module 2 data) | Not Started | |
| 7.3 | Monetization table (outcome → INR value mapping) | Not Started | |
| 7.4 | Investment input field | Not Started | |
| 7.5 | Create `components/stage4-sroi/AdjustmentSliders.tsx` (3 sliders) | Not Started | |
| 7.6 | Slider tooltip explanations (deadweight, attribution, drop-off) | Not Started | |
| 7.7 | Create `components/stage4-sroi/CalculationBreakdown.tsx` (step-by-step) | Not Started | |
| 7.8 | Create `components/stage4-sroi/SROIDisplay.tsx` (large ratio number) | Not Started | |
| 7.9 | Live calculation (updates in real-time as inputs change) | Not Started | |
| 7.10 | Plain English summary ("Every ₹1 invested created ₹X.XX...") | Not Started | |
| 7.11 | Wire to Zustand store (SROI slice) | Not Started | |
| 7.12 | Push → verify deployment | Not Started | |
| | **CHECKPOINT:** Full Stage 1→2→3→4 flow works on live URL | | |

---

## Step 8: Module 5 — Report Generation

| # | Task | Status | Notes |
|---|------|--------|-------|
| 8.1 | Install `@react-pdf/renderer` | Not Started | |
| 8.2 | Create `components/stage5-report/ReportPreview.tsx` (HTML preview) | Not Started | |
| 8.3 | Preview sections: Cover, Executive Summary, Project Overview | Not Started | |
| 8.4 | Preview sections: KPI Achievement, Evidence Summary, SROI | Not Started | |
| 8.5 | Create `components/stage5-report/PDFDocument.tsx` (@react-pdf) | Not Started | |
| 8.6 | PDF generation + download button | Not Started | |
| 8.7 | Loading state during PDF generation | Not Started | |
| 8.8 | Regenerate option (if user went back and changed data) | Not Started | |
| 8.9 | Wire to Zustand store (Report slice, reads all modules) | Not Started | |
| 8.10 | Push → verify deployment | Not Started | |
| | **CHECKPOINT:** Complete end-to-end flow works on live URL | | |

---

## Step 9: Polish & Exhibition Prep

| # | Task | Status | Notes |
|---|------|--------|-------|
| 9.1 | Loading states for all async operations | Not Started | |
| 9.2 | Error states and error messages | Not Started | |
| 9.3 | Responsive testing (desktop + tablet 768px) | Not Started | |
| 9.4 | AI failover testing (online → offline → back) | Not Started | |
| 9.5 | Final styling pass (colors, spacing, typography) | Not Started | |
| 9.6 | Test with real MoU PDF | Not Started | |
| 9.7 | Test with real NGO report PDF | Not Started | |
| 9.8 | Test with real evidence files (CSV, images) | Not Started | |
| 9.9 | Ollama setup documentation | Not Started | |
| 9.10 | Production build + local run test | Not Started | |
| 9.11 | Final push → verify deployment | Not Started | |
| | **CHECKPOINT:** Production-ready on Vercel + tested offline with Ollama | | |

---

## Issues / Blockers Log

| # | Date | Issue | Resolution | Status |
|---|------|-------|------------|--------|
| — | — | — | — | — |

---

## Decision Log

| # | Date | Decision | Rationale |
|---|------|----------|-----------|
| 1 | Feb 11 | Hybrid AI (Claude + Ollama) | Exhibition has low/no internet; need offline fallback |
| 2 | Feb 11 | Deploy pipeline in Step 1 | Catch issues early, always have live demo URL |
| 3 | Feb 11 | Zustand for state management | Simplest API, persist middleware, slice pattern fits modules |
| 4 | Feb 11 | @react-pdf/renderer for PDF | Client-side, React syntax, no server dependency |
| 5 | Feb 11 | Next.js server mode (not static) | API routes needed for AI extraction |

---

*This document is updated after each step completion. It serves as the single source of truth for project progress.*
