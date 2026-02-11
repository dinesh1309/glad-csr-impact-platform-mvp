# Master Task List
## CSR Impact Assessment Platform — MVP

**Last Updated:** February 11, 2026
**Status:** Step 1 — Not Started

---

## Document Reference Map

Each step pulls from specific documents. This is how the four docs work together:

| Document | Role | Used Primarily In |
|----------|------|-------------------|
| **PRD** | *What* to build (features, data schemas, user flows) | Steps 4–8 (each module) |
| **Technical Architecture** | *How* it connects (store, API routes, providers, data flow) | Steps 1–2 (setup), Steps 4–8 (wiring) |
| **UI/UX Strategy** | *How it looks and feels* (colors, typography, animations, component styling) | Step 1 (design tokens), Step 3 (base components), Step 9 (verification) |
| **Master Task List** | *Tracking progress* (this document) | Every step |

### How UI/UX Strategy Gets Into Code

```
Step 1:  UI/UX Strategy → tailwind.config.ts (design tokens: colors, fonts, shadows, spacing)
                        → globals.css (CSS variables, font imports)
                        → Install framer-motion
         Result: Every component built after this automatically uses the right colors/fonts/spacing.

Step 3:  UI/UX Strategy → AppShell, StageStepper, Buttons, Cards (base component styling)
         Result: All modules reuse these styled base components. The "premium look" is built-in.

Steps 4–8: Components inherit design tokens + reuse base components.
           Animations added per UI/UX Strategy animation catalog.
           No need to re-read the strategy doc — it's already in the code.

Step 9:  UI/UX Strategy used as a CHECKLIST to verify:
         ✓ All animations implemented?
         ✓ All colors/shadows/spacing match spec?
         ✓ Loading states, empty states, error states styled?
         ✓ Report preview has premium styling?
```

---

## Progress Overview

| Step | Name | Status | Started | Completed |
|------|------|--------|---------|-----------|
| 1 | Project Setup + Deployment Pipeline + Design Foundation | Not Started | — | — |
| 2 | AI Extraction Infrastructure | Not Started | — | — |
| 3 | App Shell + Base Components (Module 0) | Not Started | — | — |
| 4 | Module 1 — MoU Upload | Not Started | — | — |
| 5 | Module 2 — Progress Reports | Not Started | — | — |
| 6 | Module 3 — Field Evidence | Not Started | — | — |
| 7 | Module 4 — SROI Calculation | Not Started | — | — |
| 8 | Module 5 — Report Generation | Not Started | — | — |
| 9 | Polish & Exhibition Prep (UI/UX Verification) | Not Started | — | — |

---

## Step 1: Project Setup + Deployment Pipeline + Design Foundation

**Docs referenced:** Technical Architecture (project structure, deps) + UI/UX Strategy (design tokens)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.1 | Create GitHub repository | Done | github.com/dinesh1309/glad-csr-impact-platform-mvp |
| 1.2 | Initialize Next.js project with App Router | Not Started | |
| 1.3 | Install & configure Tailwind CSS | Not Started | |
| 1.4 | Install & configure shadcn/ui | Not Started | |
| 1.5 | Install Zustand + persist middleware | Not Started | |
| 1.6 | Install Framer Motion | Not Started | For animations (UI/UX Strategy §6) |
| 1.7 | Configure `tailwind.config.ts` with design tokens | Not Started | Colors, spacing, shadows from UI/UX Strategy §2, §4.2, §4.3 |
| 1.8 | Configure `globals.css` with CSS variables + font imports | Not Started | Plus Jakarta Sans + Inter (UI/UX Strategy §3) |
| 1.9 | Create `lib/types.ts` (all TypeScript interfaces) | Not Started | |
| 1.10 | Create `lib/store.ts` (empty slices with persist) | Not Started | |
| 1.11 | Create `.env.local` with placeholder values | Not Started | |
| 1.12 | Create basic landing page (app name + placeholder) | Not Started | Use navy header + teal accent as first visual test |
| 1.13 | Connect GitHub repo to Vercel | Not Started | |
| 1.14 | Set environment variables in Vercel dashboard | Not Started | |
| 1.15 | Push to main → verify Vercel deployment succeeds | Not Started | |
| | **CHECKPOINT:** Live URL shows styled landing page with correct fonts + colors | | |

---

## Step 2: AI Extraction Infrastructure

**Docs referenced:** Technical Architecture (§4 AI Extraction Architecture)

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

## Step 3: App Shell + Base Components (Module 0)

**Docs referenced:** PRD (§4 App Shell) + Technical Architecture (§5 State) + UI/UX Strategy (§4 Layout, §5 Component Styling, §6 Animations)

This is where the premium visual identity gets built into reusable components.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3.1 | Create `AppShell.tsx` — navy header, max-width content, sticky top | Not Started | UI/UX §5.1: Navy #0F172A, 64px height, logo + app name |
| 3.2 | Create `StageStepper.tsx` — 5-step horizontal stepper | Not Started | UI/UX §5.2: Colored circles, connector lines, pulse animation on current |
| 3.3 | Create `StageContainer.tsx` — stage content wrapper with title + nav buttons | Not Started | UI/UX §4.1: Layout structure, back/continue buttons |
| 3.4 | Create `AIStatusIndicator.tsx` — provider status badge in header | Not Started | UI/UX §4.7 from Tech Arch: Green/Blue/Red dot |
| 3.5 | Style base shadcn/ui Button variants (primary, secondary, danger) | Not Started | UI/UX §5.3: Teal primary, hover/active states, 200ms transition |
| 3.6 | Style base shadcn/ui Card variants (standard, elevated, dark) | Not Started | UI/UX §4.3: Three card tiers with correct shadows/borders |
| 3.7 | Style base Badge component (on-track, at-risk, behind, etc.) | Not Started | UI/UX §5.8: All status badge variants |
| 3.8 | Create reusable UploadZone component (shared by Stages 1, 2, 3) | Not Started | UI/UX §5.4: Dashed border, hover/drag states, processing state |
| 3.9 | Set up Framer Motion page transition wrapper | Not Started | UI/UX §6.3: Slide left/right + fade between stages |
| 3.10 | Create skeleton loading component | Not Started | UI/UX §7.1: Gray shimmer blocks, 1.5s pulse cycle |
| 3.11 | Implement navigation logic in store (currentStage, goToStage, etc.) | Not Started | |
| 3.12 | Implement stage locking logic | Not Started | |
| 3.13 | Add reset functionality | Not Started | |
| 3.14 | Responsive layout testing (desktop + tablet) | Not Started | UI/UX §9: 1200px max-width, tablet stacking |
| 3.15 | Push → verify deployment | Not Started | |
| | **CHECKPOINT:** Live URL shows premium-styled app shell with animated stepper, correct fonts, navy header | | |

---

## Step 4: Module 1 — MoU Upload & KPI Extraction

**Docs referenced:** PRD (§5 Module 1) + Technical Architecture (§4, §5 MoU Slice) + UI/UX Strategy (§5.5 KPI Cards, §6.4 Extraction Animation)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 4.1 | Create `MoUUpload.tsx` using shared UploadZone | Not Started | Accepts .pdf only |
| 4.2 | File validation (type check, 10MB size limit) | Not Started | |
| 4.3 | Wire upload to `POST /api/extract/mou` | Not Started | |
| 4.4 | AI extraction loading state (spinner + provider badge + animated dots) | Not Started | UI/UX §7.1: "Analyzing document with AI..." |
| 4.5 | Extraction reveal animation (upload shrinks, cards animate in staggered) | Not Started | UI/UX §6.4: Upload shrinks → success pulse → cards stagger in |
| 4.6 | Create `ProjectDetailsCard.tsx` (editable fields with hover pencil icon) | Not Started | UI/UX §7.4: Edit mode toggle |
| 4.7 | Create `KPICard.tsx` (left accent bar by category, inline edit, delete) | Not Started | UI/UX §5.5: Teal=output, Green=outcome, Gold=impact |
| 4.8 | Create `KPIList.tsx` (animated list + add KPI button) | Not Started | Framer Motion AnimatePresence for add/delete |
| 4.9 | Manual entry fallback (if AI extraction fails) | Not Started | Empty form with same fields |
| 4.10 | Confirm button → locks data, enables Stage 2 | Not Started | |
| 4.11 | Re-upload option (clears previous data) | Not Started | |
| 4.12 | Wire to Zustand store (MoU slice) | Not Started | |
| 4.13 | Push → verify deployment | Not Started | |
| | **CHECKPOINT:** Can upload MoU, see animated extraction reveal, edit KPIs on live URL | | |

---

## Step 5: Module 2 — Progress Report Matching

**Docs referenced:** PRD (§6 Module 2) + Technical Architecture (§5 Reports Slice) + UI/UX Strategy (§5.6 Progress Cards)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 5.1 | Create `ReportUpload.tsx` using shared UploadZone (multi-file) | Not Started | |
| 5.2 | Wire upload to `POST /api/extract/report` | Not Started | |
| 5.3 | Create `ReportList.tsx` (status per file, animated list) | Not Started | |
| 5.4 | Processing queue (sequential, animated progress per file) | Not Started | |
| 5.5 | Create `ProgressDashboard.tsx` (grid of progress cards) | Not Started | |
| 5.6 | Create `ProgressCard.tsx` with animated progress bar fill | Not Started | UI/UX §5.6: 800ms easeOutCubic fill, color by status |
| 5.7 | Status badges (On Track / At Risk / Behind) | Not Started | UI/UX §5.8: Colored pill badges |
| 5.8 | Gap highlighting (visual emphasis on behind-target KPIs) | Not Started | |
| 5.9 | Manual override for extracted values | Not Started | |
| 5.10 | Wire to Zustand store (Reports slice, reads KPIs from Module 1) | Not Started | |
| 5.11 | Push → verify deployment | Not Started | |
| | **CHECKPOINT:** Full Stage 1→2 flow with animated progress bars on live URL | | |

---

## Step 6: Module 3 — Field Evidence Validation

**Docs referenced:** PRD (§7 Module 3) + Technical Architecture (§5 Evidence Slice)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 6.1 | Create `EvidenceUpload.tsx` using shared UploadZone (PDF, CSV, images) | Not Started | |
| 6.2 | File type detection (auto-categorize: Survey, Photo, Document) | Not Started | |
| 6.3 | Create `EvidenceCard.tsx` (thumbnail + KPI tags + left color border) | Not Started | Blue=survey, Green=photo, Gray=document |
| 6.4 | Photo thumbnails (Base64 conversion, displayed in card) | Not Started | |
| 6.5 | CSV summary (row count, column summary via papaparse) | Not Started | |
| 6.6 | KPI linking dropdown (link evidence to KPIs) | Not Started | |
| 6.7 | Wire to `POST /api/extract/evidence` for validation | Not Started | |
| 6.8 | Create `ValidationSummary.tsx` (verified / discrepancy / no-evidence) | Not Started | |
| 6.9 | Evidence count summary (KPIs with/without linked evidence) | Not Started | |
| 6.10 | Notes field per evidence item | Not Started | |
| 6.11 | Wire to Zustand store (Evidence slice) | Not Started | |
| 6.12 | Push → verify deployment | Not Started | |
| | **CHECKPOINT:** Full Stage 1→2→3 flow works on live URL | | |

---

## Step 7: Module 4 — SROI Calculation

**Docs referenced:** PRD (§8 Module 4) + Technical Architecture (§5 SROI Slice) + UI/UX Strategy (§5.7 SROI Display)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 7.1 | Create `lib/calculations.ts` (SROI pure functions) | Not Started | |
| 7.2 | Create `OutcomesTable.tsx` (from Module 2 data, animated rows) | Not Started | |
| 7.3 | Monetization table (outcome → INR value mapping) | Not Started | |
| 7.4 | Investment input field | Not Started | |
| 7.5 | Create `AdjustmentSliders.tsx` (3 sliders with tooltips) | Not Started | Deadweight, Attribution, Drop-off |
| 7.6 | Slider tooltip explanations | Not Started | |
| 7.7 | Create `CalculationBreakdown.tsx` (step-by-step animated flow) | Not Started | UI/UX §5.7: Horizontal flow with animated arrows |
| 7.8 | Create `SROIDisplay.tsx` — dark gradient card, gold number, glow | Not Started | UI/UX §5.7: 48px bold, gold glow, counter animation 1.5s |
| 7.9 | Live calculation (updates in real-time as inputs change) | Not Started | |
| 7.10 | Plain English summary with gold highlight on the value | Not Started | "Every ₹1 invested created ₹X.XX of social value" |
| 7.11 | Wire to Zustand store (SROI slice) | Not Started | |
| 7.12 | Push → verify deployment | Not Started | |
| | **CHECKPOINT:** Full Stage 1→2→3→4 with animated SROI counter on live URL | | |

---

## Step 8: Module 5 — Report Generation

**Docs referenced:** PRD (§9 Module 5) + UI/UX Strategy (§8 Report Preview Premium Styling)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 8.1 | Install `@react-pdf/renderer` | Not Started | |
| 8.2 | Create `ReportPreview.tsx` (HTML preview, A4 paper shadow styling) | Not Started | UI/UX §8: Heavy shadow, navy cover, teal accents |
| 8.3 | Preview — Cover page (navy background, white text, project name) | Not Started | UI/UX §8: Dark navy, geometric pattern |
| 8.4 | Preview — Executive Summary section | Not Started | |
| 8.5 | Preview — Project Overview + KPI Achievement table | Not Started | UI/UX §8: Alternating row backgrounds, navy header row |
| 8.6 | Preview — Evidence Summary + SROI section (dark card style) | Not Started | |
| 8.7 | Create `PDFDocument.tsx` (@react-pdf, mirrors preview layout) | Not Started | |
| 8.8 | PDF generation + download button with loading state | Not Started | |
| 8.9 | Regenerate option (if user went back and changed data) | Not Started | |
| 8.10 | Wire to Zustand store (Report slice, reads all modules) | Not Started | |
| 8.11 | Push → verify deployment | Not Started | |
| | **CHECKPOINT:** Complete end-to-end flow with PDF download on live URL | | |

---

## Step 9: Polish & Exhibition Prep (UI/UX Verification)

**Docs referenced:** UI/UX Strategy (full document as verification checklist)

This step walks through the UI/UX Strategy section by section to verify everything is implemented.

| # | Task | Status | Notes |
|---|------|--------|-------|
| | **UI/UX §2 — Color System Verification** | | |
| 9.1 | Verify all colors match the design tokens | Not Started | Cross-check against UI/UX §2 |
| 9.2 | Verify stage accent colors are applied per stage | Not Started | Teal → Emerald → Blue → Gold → Purple |
| | **UI/UX §3 — Typography Verification** | | |
| 9.3 | Verify Plus Jakarta Sans on headings, Inter on body | Not Started | |
| 9.4 | Verify type scale matches spec (sizes, weights, spacing) | Not Started | |
| | **UI/UX §5 — Component Styling Verification** | | |
| 9.5 | Verify header bar styling (navy, 64px, sticky) | Not Started | |
| 9.6 | Verify stepper styling (states, colors, pulse animation) | Not Started | |
| 9.7 | Verify all button variants (primary, secondary, danger) | Not Started | |
| 9.8 | Verify card variants (standard, elevated, dark) | Not Started | |
| 9.9 | Verify upload zone states (default, hover, drag, processing) | Not Started | |
| | **UI/UX §6 — Animation Verification** | | |
| 9.10 | Verify stage transition animations (slide + fade) | Not Started | |
| 9.11 | Verify card stagger animations (KPI reveal, evidence) | Not Started | |
| 9.12 | Verify progress bar fill animation (800ms easeOutCubic) | Not Started | |
| 9.13 | Verify SROI counter animation (1.5s count-up) | Not Started | |
| 9.14 | Verify checkmark draw animation on stage completion | Not Started | |
| | **UI/UX §7 — States Verification** | | |
| 9.15 | Verify skeleton loading screens on all async operations | Not Started | |
| 9.16 | Verify empty states for each stage | Not Started | |
| 9.17 | Verify error states and error messages | Not Started | |
| | **Functional Testing** | | |
| 9.18 | Responsive testing (desktop + tablet 768px) | Not Started | |
| 9.19 | AI failover testing (online → offline → back) | Not Started | |
| 9.20 | Test with real MoU PDF | Not Started | |
| 9.21 | Test with real NGO report PDF | Not Started | |
| 9.22 | Test with real evidence files (CSV, images) | Not Started | |
| | **Deployment** | | |
| 9.23 | Ollama setup documentation | Not Started | |
| 9.24 | Production build + local run test | Not Started | |
| 9.25 | Final push → verify deployment | Not Started | |
| | **CHECKPOINT:** Production-ready on Vercel + tested offline + all UI/UX verified | | |

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
| 6 | Feb 11 | Corporate Premium visual style | Exhibition needs professional enterprise look |
| 7 | Feb 11 | Framer Motion for animations | Industry standard, polished transitions for exhibition impact |
| 8 | Feb 11 | Plus Jakarta Sans + Inter fonts | Premium heading font + reliable body font |
| 9 | Feb 11 | UI/UX baked into code at Step 1 | Design tokens in Tailwind config, not a separate reference doc |

---

*This document is updated after each step completion. It serves as the single source of truth for project progress.*
