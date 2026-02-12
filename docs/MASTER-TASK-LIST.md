# Master Task List
## CSR Impact Assessment Platform — MVP

**Last Updated:** February 11, 2026
**Status:** Step 8 — Complete (all 5 modules built)

---

## Document Reference Map

Each step pulls from specific documents. This is how the four docs work together:

| Document | Role | Used Primarily In |
|----------|------|-------------------|
| **PRD** | *What* to build (features, data schemas, user flows) | Step 3 (dashboard), Steps 4–8 (each module) |
| **Technical Architecture** | *How* it connects (store, API routes, providers, data flow) | Steps 1–2 (setup), Steps 4–8 (wiring) |
| **UI/UX Strategy** | *How it looks and feels* (colors, typography, animations, component styling) | Step 1 (design tokens), Step 3 (base components), Step 9 (verification) |
| **Master Task List** | *Tracking progress* (this document) | Every step |

### How UI/UX Strategy Gets Into Code

```
Step 1:  UI/UX Strategy → tailwind.config.ts (design tokens: colors, fonts, shadows, spacing)
                        → globals.css (CSS variables, font imports)
                        → Install framer-motion
         Result: Every component built after this automatically uses the right colors/fonts/spacing.

Step 3:  UI/UX Strategy → ProjectDashboard, ProjectCard, AppShell, StageStepper, Buttons, Cards
         Result: Dashboard + all modules reuse these styled base components. The "premium look" is built-in.

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
| 1 | Project Setup + Deployment Pipeline + Design Foundation | Done | Feb 11 | Feb 11 |
| 2 | AI Extraction Infrastructure | Done | Feb 11 | Feb 11 |
| 3 | Project Dashboard + App Shell + Base Components (Module 0) | Done | Feb 11 | Feb 11 |
| 4 | Module 1 — MoU Upload | Done | Feb 11 | Feb 11 |
| 5 | Module 2 — Progress Reports | Done | Feb 12 | Feb 12 |
| 6 | Module 3 — Field Evidence | Done | Feb 12 | Feb 12 |
| 7 | Module 4 — SROI Calculation | Done | Feb 12 | Feb 12 |
| 8 | Module 5 — Report Generation | Done | 10/11 | Push pending |
| 9 | Polish & Exhibition Prep (UI/UX Verification) | Not Started | — | — |

---

## Step 1: Project Setup + Deployment Pipeline + Design Foundation

**Docs referenced:** Technical Architecture (project structure, deps) + UI/UX Strategy (design tokens)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.1 | Create GitHub repository | Done | github.com/dinesh1309/glad-csr-impact-platform-mvp |
| 1.2 | Initialize Next.js project with App Router | Done | Next.js 16, React 19, TypeScript |
| 1.3 | Install & configure Tailwind CSS | Done | Tailwind v4 (CSS-based @theme inline) |
| 1.4 | Install & configure shadcn/ui | Done | new-york style, Tailwind v4 compatible |
| 1.5 | Install Zustand + persist middleware | Done | Zustand 5 |
| 1.6 | Install Framer Motion | Done | Framer Motion 12 |
| 1.7 | Configure `tailwind.config.ts` with design tokens | Done | Tailwind v4 uses globals.css @theme block instead |
| 1.8 | Configure `globals.css` with CSS variables + font imports | Done | Plus Jakarta Sans + Inter via next/font |
| 1.9 | Create `lib/types.ts` (all TypeScript interfaces including Project) | Done | Project entity wraps all module data |
| 1.10 | Create `lib/store.ts` (multi-project store with persist) | Done | projects[], activeProjectId, view state |
| 1.11 | Create `.env.local` with placeholder values | Done | |
| 1.12 | Create basic landing page (app name + placeholder) | Done | Navy header, stage pipeline preview, metric cards |
| 1.13 | Connect GitHub repo to Vercel | Done | |
| 1.14 | Set environment variables in Vercel dashboard | Done | |
| 1.15 | Push to main → verify Vercel deployment succeeds | Done | Live at glad-csr-impact-platform-mvp.vercel.app |
| | **CHECKPOINT:** Live URL shows styled landing page with correct fonts + colors | | |

---

## Step 2: AI Extraction Infrastructure

**Docs referenced:** Technical Architecture (§4 AI Extraction Architecture)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.1 | Install `@anthropic-ai/sdk` and `pdf-parse` | Done | Also installed papaparse + type defs |
| 2.2 | Create `lib/ai/provider.ts` (provider selection + failover) | Done | Auto-detect, 30s cache, primary→fallback chain |
| 2.3 | Create `lib/ai/claude.ts` (Claude API integration) | Done | Sonnet 4.5, native PDF, lazy client init |
| 2.4 | Create `lib/ai/ollama.ts` (Ollama integration) | Done | Mistral, 2s health timeout |
| 2.5 | Create `lib/ai/prompts.ts` (extraction prompt templates) | Done | MoU, Report, Evidence prompts |
| 2.6 | Create `lib/ai/pdf-parser.ts` (PDF text extraction) | Done | pdf-parse v3 class API (PDFParse) |
| 2.7 | Create API route: `POST /api/extract/mou` | Done | |
| 2.8 | Create API route: `POST /api/extract/report` | Done | |
| 2.9 | Create API route: `POST /api/extract/evidence` | Done | |
| 2.10 | Create API route: `GET /api/health` | Done | Dynamic import for resilience |
| 2.11 | Test locally with sample PDF (Claude) | Deferred | Will test during Module 1 (Step 4) |
| 2.12 | Test locally with sample PDF (Ollama) | Deferred | Will test during Module 1 (Step 4) |
| 2.13 | Push → verify Vercel build succeeds | Done | Live, /api/health returns JSON |
| | **CHECKPOINT:** `/api/health` returns status on live URL | | |

---

## Step 3: Project Dashboard + App Shell + Base Components (Module 0)

**Docs referenced:** PRD (§4 Dashboard, §5 App Shell) + Technical Architecture (§5 State, §9 Routing) + UI/UX Strategy (§4 Layout, §5 Component Styling, §6 Animations)

This is where the multi-project dashboard and premium visual identity get built into reusable components.

| # | Task | Status | Notes |
|---|------|--------|-------|
| | **Project Dashboard** | | |
| 3.1 | Create `ProjectDashboard.tsx` — landing page with project list | Done | Grid layout, project count, "New Project" button |
| 3.2 | Create `ProjectCard.tsx` — project card with stage progress + status | Done | Left accent bar, mini stage dots, SROI badge, hover elevation |
| 3.3 | Create `CreateProjectDialog.tsx` — new project creation dialog | Done | Modal with name input, auto-navigates on create |
| 3.4 | Implement dashboard empty state (no projects yet) | Done | FolderOpen icon, heading, CTA with fadeIn animation |
| 3.5 | Implement delete project with confirmation dialog | Done | Trash icon on hover, confirmation dialog |
| 3.6 | Implement two-level navigation (dashboard ↔ project) | Done | page.tsx uses store view state |
| 3.7 | Project card stagger animation | Done | Framer Motion, 400ms staggered 80ms |
| | **App Shell (per project)** | | |
| 3.8 | Create `AppShell.tsx` — navy header with project name + "← Back" link | Done | ArrowLeft + "Back to Projects", project name centered |
| 3.9 | Create `StageStepper.tsx` — 5-step horizontal stepper | Done | Colored circles, connector lines, check on complete, clickable |
| 3.10 | Create `StageContainer.tsx` — stage content wrapper with title + nav buttons | Done | Animated slide transitions, Back/Continue buttons |
| 3.11 | Create `AIStatusIndicator.tsx` — provider status badge in header | Done | Polls /api/health every 30s, Cloud/Local/Offline states |
| | **Base Components** | | |
| 3.12 | Style base shadcn/ui Button variants (primary, secondary, danger) | Done | Installed via shadcn CLI with project theme |
| 3.13 | Style base shadcn/ui Card variants (standard, elevated, dark) | Done | Installed via shadcn CLI |
| 3.14 | Style base Badge component (on-track, at-risk, behind, etc.) | Done | Installed via shadcn CLI |
| 3.15 | Create reusable UploadZone component (shared by Stages 1, 2, 3) | Deferred | Will build in Step 4 with Stage 1 |
| 3.16 | Set up Framer Motion transition wrappers (dashboard ↔ project + stage transitions) | Done | StageContainer uses AnimatePresence with directional slides |
| 3.17 | Create skeleton loading component | Done | Installed via shadcn CLI |
| | **Store Logic** | | |
| 3.18 | Implement project management in store (createProject, deleteProject, openProject, goToDashboard) | Done | Already in store from Step 1 |
| 3.19 | Implement per-project navigation (currentStage, goToStage, nextStage, prevStage) | Done | Already in store from Step 1 |
| 3.20 | Implement stage locking logic (per project) | Done | goToStage enforces maxAllowed = currentStage + 1 |
| 3.21 | Add reset project functionality | Done | Already in store from Step 1 |
| | **Testing** | | |
| 3.22 | Responsive layout testing (desktop + tablet) | Done | 3-col/2-col/1-col grid, stepper hides labels on mobile |
| 3.23 | Push → verify deployment | Done | Pushed to main, Vercel auto-deploys |
| | **CHECKPOINT:** Live URL shows project dashboard, can create project, enter 5-stage shell with animated stepper, correct fonts, navy header | | |

---

## Step 4: Module 1 — MoU Upload & KPI Extraction

**Docs referenced:** PRD (§5 Module 1) + Technical Architecture (§4, §5 MoU Slice) + UI/UX Strategy (§5.5 KPI Cards, §6.4 Extraction Animation)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 4.1 | Create `MoUUpload.tsx` using shared UploadZone | Done | Drag-drop + click, state machine (empty/uploading/extracted/confirmed/error) |
| 4.2 | File validation (type check, 10MB size limit) | Done | PDF-only, 10MB max, inline error messages |
| 4.3 | Wire upload to `POST /api/extract/mou` | Done | FormData POST, parses projectDetails + kpis |
| 4.4 | AI extraction loading state (spinner + provider badge + animated dots) | Done | Loader2 spin, "Analyzing document with AI..." |
| 4.5 | Extraction reveal animation (upload shrinks, cards animate in staggered) | Done | AnimatePresence exit + staggered entry (0.1s, 0.2s, 0.35s, 0.5s) |
| 4.6 | Create `ProjectDetailsCard.tsx` (editable fields with hover pencil icon) | Done | 6 fields, edit mode toggle, grid layout with icons |
| 4.7 | Create `KPICard.tsx` (left accent bar by category, inline edit, delete) | Done | Teal=output, Green=outcome, Gold=impact, full edit form |
| 4.8 | Create `KPIList.tsx` (animated list + add KPI button) | Done | 2-col grid, AnimatePresence, empty state, count badge |
| 4.9 | Manual entry fallback (if AI extraction fails) | Done | "Enter Manually" button in error state, creates blank form |
| 4.10 | Confirm button → locks data, enables Stage 2 | Done | "Confirm & Lock Data", disabled if 0 KPIs, green badge when confirmed |
| 4.11 | Re-upload option (clears previous data) | Done | "Re-upload" button resets MoU data and stage status |
| 4.12 | Wire to Zustand store (MoU slice) | Done | updateActiveProject for all state changes |
| 4.13 | Push → verify deployment | Done | Pushed to main, Vercel auto-deploys |
| | **CHECKPOINT:** Can upload MoU, see animated extraction reveal, edit KPIs on live URL | | |

---

## Step 5: Module 2 — Progress Report Matching

**Docs referenced:** PRD (§6 Module 2) + Technical Architecture (§5 Reports Slice) + UI/UX Strategy (§5.6 Progress Cards)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 5.1 | Create `ReportUpload.tsx` using shared UploadZone (multi-file) | Done | Multi-file drag-drop, sequential processing queue |
| 5.2 | Wire upload to `POST /api/extract/report` | Done | FormData with KPIs context, provider header |
| 5.3 | Create `ReportList.tsx` (status per file, animated list) | Done | Animated list with status icons, delete, KPI count |
| 5.4 | Processing queue (sequential, animated progress per file) | Done | Sequential await loop, per-file status updates |
| 5.5 | Create `ProgressDashboard.tsx` (grid of progress cards) | Done | 2-col grid, summary pills, gap warning banner |
| 5.6 | Create `ProgressCard.tsx` with animated progress bar fill | Done | 800ms easeOutCubic fill, sparkline bars |
| 5.7 | Status badges (On Track / At Risk / Behind) | Done | Emerald/amber/red pill badges per UI/UX §5.8 |
| 5.8 | Gap highlighting (visual emphasis on behind-target KPIs) | Done | Behind KPIs sorted first + red warning banner |
| 5.9 | Manual override for extracted values | Done | Hover pencil icon, inline edit with recalculation |
| 5.10 | Wire to Zustand store (Reports slice, reads KPIs from Module 1) | Done | computeProgressData aggregates across all reports |
| 5.11 | Push → verify deployment | Done | Pushed to main, Vercel auto-deploys |
| | **CHECKPOINT:** Full Stage 1→2 flow with animated progress bars on live URL | | |

---

## Step 6: Module 3 — Field Evidence Validation

**Docs referenced:** PRD (§7 Module 3) + Technical Architecture (§5 Evidence Slice)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 6.1 | Create `EvidenceUpload.tsx` using shared UploadZone (PDF, CSV, images) | Done | Multi-type drag-drop, accepts PDF/CSV/JPG/PNG |
| 6.2 | File type detection (auto-categorize: Survey, Photo, Document) | Done | Auto-detect from MIME type and extension |
| 6.3 | Create `EvidenceCard.tsx` (thumbnail + KPI tags + left color border) | Done | Blue=survey, Green=photo, Gray=document, 4px left border |
| 6.4 | Photo thumbnails (Base64 conversion, displayed in card) | Done | FileReader → Base64 data URL in card |
| 6.5 | CSV summary (row count, column summary via papaparse) | Done | Lightweight line-count parser, shows row count |
| 6.6 | KPI linking dropdown (link evidence to KPIs) | Done | Checkbox dropdown, tags with remove, multi-select |
| 6.7 | Wire to `POST /api/extract/evidence` for validation | Done | Sends metadata + KPI data, receives ValidationResult[] |
| 6.8 | Create `ValidationSummary.tsx` (verified / discrepancy / no-evidence) | Done | Table with status badges, match %, evidence count |
| 6.9 | Evidence count summary (KPIs with/without linked evidence) | Done | "X of Y KPIs have linked evidence" bar |
| 6.10 | Notes field per evidence item | Done | Toggle notes textarea per card |
| 6.11 | Wire to Zustand store (Evidence slice) | Done | files[] + validationResults[] in evidence slice |
| 6.12 | Push → verify deployment | Not Started | |
| | **CHECKPOINT:** Full Stage 1→2→3 flow works on live URL | | |

---

## Step 7: Module 4 — SROI Calculation

**Docs referenced:** PRD (§8 Module 4) + Technical Architecture (§5 SROI Slice) + UI/UX Strategy (§5.7 SROI Display)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 7.1 | Create `lib/calculations.ts` (SROI pure functions) | Done | calculateSROI + buildOutcomesFromProgress |
| 7.2 | Create `OutcomesTable.tsx` (from Module 2 data, animated rows) | Done | Auto-populates from progressData, animated rows |
| 7.3 | Monetization table (outcome → INR value mapping) | Done | Inline edit monetized value + method per outcome |
| 7.4 | Investment input field | Done | ₹ input with formatted display |
| 7.5 | Create `AdjustmentSliders.tsx` (3 sliders with tooltips) | Done | 0-50% range, navy tooltip on hover |
| 7.6 | Slider tooltip explanations | Done | Deadweight, Attribution, Drop-off explanations |
| 7.7 | Create `CalculationBreakdown.tsx` (step-by-step animated flow) | Done | Horizontal flow: Gross → Adjustments ÷ Investment = Ratio |
| 7.8 | Create `SROIDisplay.tsx` — dark gradient card, gold number, glow | Done | 48px gold #F59E0B, radial glow, counter animation 1.5s |
| 7.9 | Live calculation (updates in real-time as inputs change) | Done | useMemo recalculates on any input change |
| 7.10 | Plain English summary with gold highlight on the value | Done | "Every ₹1 invested created ₹X.XX of social value" |
| 7.11 | Wire to Zustand store (SROI slice) | Done | Auto-saves calculatedRatio, auto-completes stage4 |
| 7.12 | Push → verify deployment | Not Started | |
| | **CHECKPOINT:** Full Stage 1→2→3→4 with animated SROI counter on live URL | | |

---

## Step 8: Module 5 — Report Generation

**Docs referenced:** PRD (§9 Module 5) + UI/UX Strategy (§8 Report Preview Premium Styling)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 8.1 | Install `@react-pdf/renderer` | Done | v4.3.2 (React 19 compatible) |
| 8.2 | Create `ReportPreview.tsx` (HTML preview, A4 paper shadow styling) | Done | UI/UX §8: Heavy shadow, navy cover, teal accents |
| 8.3 | Preview — Cover page (navy background, white text, project name) | Done | UI/UX §8: Dark navy, geometric pattern |
| 8.4 | Preview — Executive Summary section | Done | Auto-generated from data |
| 8.5 | Preview — Project Overview + KPI Achievement table | Done | UI/UX §8: Alternating row backgrounds, navy header row |
| 8.6 | Preview — Evidence Summary + SROI section (dark card style) | Done | Gold SROI highlight |
| 8.7 | Create `PDFDocument.tsx` (@react-pdf, mirrors preview layout) | Done | 3-page PDF with all sections |
| 8.8 | PDF generation + download button with loading state | Done | Client-side blob + download |
| 8.9 | Regenerate option (if user went back and changed data) | Done | Regenerate button |
| 8.10 | Wire to Zustand store (Report slice, reads all modules) | Done | ReportGeneration.tsx orchestrator |
| 8.11 | Push → verify deployment | Pending | |
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
| | **Multi-Project Testing** | | |
| 9.18 | Verify creating, opening, and deleting multiple projects | Not Started | |
| 9.19 | Verify project data isolation (editing one doesn't affect another) | Not Started | |
| 9.20 | Verify dashboard updates when project data changes | Not Started | |
| | **Functional Testing** | | |
| 9.21 | Responsive testing (desktop + tablet 768px) | Not Started | |
| 9.22 | AI failover testing (online → offline → back) | Not Started | |
| 9.23 | Test with real MoU PDF | Not Started | |
| 9.24 | Test with real NGO report PDF | Not Started | |
| 9.25 | Test with real evidence files (CSV, images) | Not Started | |
| | **Deployment** | | |
| 9.26 | Ollama setup documentation | Not Started | |
| 9.27 | Production build + local run test | Not Started | |
| 9.28 | Final push → verify deployment | Not Started | |
| | **CHECKPOINT:** Production-ready on Vercel + tested offline + all UI/UX verified | | |

---

## Issues / Blockers Log

| # | Date | Issue | Resolution | Status |
|---|------|-------|------------|--------|
| 1 | Feb 11 | pdf-parse v3 API changed from function to class-based | Updated to `new PDFParse({ data })` + `.getText()` | Resolved |
| 2 | Feb 11 | Vercel 500 — pdf-parse/pdfjs-dist fails at module-level import in serverless | Lazy dynamic `import()` in provider.ts; lazy Anthropic client in claude.ts | Resolved |
| 3 | Feb 11 | Vercel Deployment Protection blocking public access (401) | Disabled Vercel Authentication for production | Resolved |

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
| 10 | Feb 11 | **npm** as package manager | Zero extra setup, universal compatibility, all Next.js/Vercel/shadcn docs assume npm |
| 11 | Feb 11 | **Claude Sonnet 4.5** as primary AI model | Best balance of speed, quality, and cost for document extraction |
| 12 | Feb 11 | **Mistral 7B** as Ollama fallback model | Best JSON compliance, lighter RAM (~6GB vs 8GB), faster responses, reliable for exhibition demos |
| 13 | Feb 11 | **Lightweight SVG** for sparkline charts | Zero bundle cost (~30 lines vs 45KB Recharts), Framer Motion compatible, full design system control. Recharts can be evaluated post-MVP if complex visualizations are needed |
| 14 | Feb 11 | **Multi-project support** in MVP | Users need to manage multiple CSR projects from a single dashboard. Each project has independent 5-stage pipeline. Data scoped by project ID in Zustand store, persisted to LocalStorage. Moved from "Out of Scope" to core MVP feature. |
| 15 | Feb 11 | **Next.js 16 / React 19 / Tailwind v4 / Zustand 5** | Latest versions installed (newer than architecture doc specs of 14/18/v3/4). Tailwind v4 uses CSS-based `@theme inline` blocks instead of tailwind.config.ts. All working. |
| 16 | Feb 11 | **Dynamic imports for Vercel serverless** | Heavy deps (pdf-parse, Anthropic SDK client) must be lazy-loaded to avoid module-level crashes in serverless functions. Pattern: `await import()` inside handler, not top-level import. |

---

*This document is updated after each step completion. It serves as the single source of truth for project progress.*
