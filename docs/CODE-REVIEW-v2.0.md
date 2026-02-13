# Code Review Report v2.0

**Project**: GLAD CSR Impact Assessment Platform MVP
**Reviewed**: February 13, 2026
**Reviewer**: Claude Code (Automated Architecture Audit)
**Docs analyzed**: PRD v2.0, Technical Architecture v3.0, UI/UX Strategy v2.0, Master Task List
**Scope**: Full codebase — Steps 1-8 (all 5 modules built)
**Previous review**: CODE-REVIEW-v1.0.md (Feb 11, 2026 — Steps 1-2 only)

---

## Review Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| Warning | 9 |
| Info | 5 |
| Passing | 18 |
| **Total** | **32** |

**Architecture compliance**: ~90%
**v1.0 open items resolved**: 5 of 8 (W2/W3, W5, C1, C2, I3)

---

## v1.0 Issue Resolution Status

| v1.0 ID | Issue | Status | Notes |
|---------|-------|--------|-------|
| C1 | pdf-parse v2 runtime risk | **Resolved** | Replaced with `unpdf` library — server-friendly, no web worker dep |
| C2 | Missing `@react-pdf/renderer` | **Resolved** | Installed v4.3.2 in package.json |
| W1 | `ReportData` missing `pdfBlob` | **Still Open** | → W1 below |
| W2 | Claude health check costs money | **Fixed** | Now uses `models.list` (free, no tokens) |
| W3 | Claude health check no timeout | **Fixed** | Added `AbortController` with 3s timeout (`claude.ts:95-101`) |
| W4 | No JSON parse retry | **Still Open** | → W2 below |
| W5 | All errors return 422 | **Fixed** | All 3 routes now return 503 for "No AI provider" (`mou/route.ts:54-57`, etc.) |
| W6 | Doc versions outdated | **Still Open** | → W3 below |
| W7 | Missing module-specific store actions | **Accepted** | Uses generic `updateActiveProject(updater)` pattern instead — works well |
| W8 | Missing spacing tokens | **Accepted** | Tailwind v4 defaults cover this adequately |
| I1 | `view` + `activeProjectId` persisted | **Still Open** | → I2 below |
| I3 | No timeout on Ollama extraction | **Fixed** | Streaming + 15-min AbortController + custom undici Agent (`ollama.ts:13-16,36`) |

---

## Critical Issues

None.

All 5 modules are built and functional. No broken data flows, no security issues, no missing core files.

---

## Warnings

| # | File | Finding | Expected (source) | Recommendation |
|---|------|---------|-------------------|----------------|
| W1 | `lib/types.ts:141-143` | `ReportData` still missing `pdfBlob: Blob \| null` field | PRD §5.4: `report.pdfBlob: Blob \| null` | Add field to type; exclude from Zustand `partialize`. Low priority since PDF download works without it (generated transiently in ReportGeneration) |
| W2 | `lib/ai/provider.ts:154-168` | No JSON parse retry with stricter prompt on failure | Tech Arch §4.1: "If JSON parse fails → retry once with stricter prompt" | Add retry in `parseJSONResponse` or in each route handler's catch block. Would improve robustness with Ollama especially |
| W3 | `docs/TECHNICAL-ARCHITECTURE.md` | Doc lists Next 14, React 18, Tailwind 3, Zustand 4, pdf-parse — all outdated vs actual | Actual: Next 16, React 19, Tailwind 4, Zustand 5, unpdf | Update §10.1 dependency table and §17 confirmed decisions to match reality |
| W4 | `components/stage2-progress/` | Directory named `stage2-progress/` | Tech Arch §3: `components/stage2-reports/` | Either rename directory or update Tech Arch §3. Code works either way — purely a consistency issue |
| W5 | `package.json:38` | `@types/pdf-parse` in devDeps but `pdf-parse` is no longer used (replaced by `unpdf`) | — | Remove stale type package: `npm uninstall @types/pdf-parse` |
| W6 | `package.json:37` | `pdfkit` in devDeps — unclear purpose, not listed in Tech Arch §10 | — | If unused, remove: `npm uninstall pdfkit`. If used for PDF generation, document it |
| W7 | `components/shell/AIStatusIndicator.tsx:14-28` | Provider selection uses module-level globals (`_selectedProvider`, `_listeners`) instead of Zustand | Tech Arch §1.2: "Single source of state — Zustand store holds all application data" | Move provider choice into Zustand store for consistency. Current approach doesn't persist across refreshes and bypasses the store pattern |
| W8 | `components/ui/` | Missing `slider.tsx` and `progress.tsx` shadcn components listed in Tech Arch §3 | Tech Arch §3: `ui/slider.tsx`, `ui/progress.tsx` | AdjustmentSliders and ProgressCard implement these with native HTML/Tailwind instead. Either install via `npx shadcn add slider progress` or remove from Tech Arch listing |
| W9 | `lib/mock-data.ts` | Missing fallback mock data file | Tech Arch §3: `lib/mock-data.ts — Fallback mock data (only if both AI providers fail)` | Not needed since manual entry serves as fallback. Remove from Tech Arch §3 or create as optional |

---

## Info

| # | File | Finding | Expected (source) | Recommendation |
|---|------|---------|-------------------|----------------|
| I1 | Root directory | `nul` file exists in repo root (visible in git status) | — | Windows artifact (likely from `> nul` shell command). Delete the file and add to `.gitignore` |
| I2 | `lib/store.ts:206-210` | `view` + `activeProjectId` still persisted to LocalStorage | Not explicitly required | User always resumes where they left off. Consider excluding from `partialize` for cleaner UX (always land on dashboard) |
| I3 | `package.json:24` | `undici` dependency added for Ollama custom dispatcher | Not in Tech Arch §10.1 | Legitimate use for extending fetch timeout. Add to dependency table in Tech Arch |
| I4 | `components/stage5-report/PDFDocument.tsx` | PDFDocument is 686 lines — largest component in the codebase | — | Functional but could be split into sub-components (CoverPage, ProgressSection, etc.) for maintainability. Low priority |
| I5 | `components/stage5-report/ReportPreview.tsx` | ReportPreview is 580 lines — second largest component | — | Same suggestion as I4. Helper components (`ReportSection`, `StatCard`, etc.) are already defined inline |

---

## Passing Checks

| # | Area | What was verified | Source |
|---|------|-------------------|--------|
| P1 | **Project structure** | All expected directories exist: `app/`, `components/{dashboard,shell,stage1-5}/`, `lib/ai/`, `app/api/` | Tech Arch §3 |
| P2 | **API routes** | All 4 routes present and functional: `/api/extract/mou`, `/api/extract/report`, `/api/extract/evidence`, `/api/health` | Tech Arch §9.1 |
| P3 | **Error handling** | All extraction routes return 503 for no provider, 422 for extraction failure, 400 for bad input | Tech Arch §12.2 |
| P4 | **Color tokens** | All colors match UI/UX §2 exactly: navy `#0F172A`, teal `#0891B2`, gold `#D97706`, all stage accents, all semantics | UI/UX §2.1-2.4 |
| P5 | **Typography** | Plus Jakarta Sans for headings, Inter for body. Both loaded via `next/font` with CSS variables | UI/UX §3.1 |
| P6 | **Stage stepper** | 5 circles with connector lines, completed/current/locked states, clickable navigation, responsive labels | UI/UX §5.2 |
| P7 | **Card system** | Standard card styling with borders, shadows, left accent bars on KPI and project cards | UI/UX §4.3 |
| P8 | **Animations** | Stage transitions (slide + fade), card stagger animations, progress bar fill, SROI counter, AnimatePresence | UI/UX §6.2 |
| P9 | **AI failover** | Primary → fallback → error chain correctly implemented in `provider.ts` | Tech Arch §4.6 |
| P10 | **Provider cache** | 30-second TTL cache on provider health checks | Tech Arch §4.2 |
| P11 | **Claude integration** | Model `claude-sonnet-4-5-20250929`, temperature 0, PDF document type, lazy client init | Tech Arch §4.3 |
| P12 | **Ollama integration** | Streaming mode, custom undici dispatcher for long timeouts, 2s health check timeout | Tech Arch §4.4 |
| P13 | **SROI calculation** | Formula matches PRD §9.5 exactly: gross → deadweight → attribution → dropoff → ÷ investment | PRD §9.5 |
| P14 | **Stage completion** | All 5 stages enforce correct completion criteria per Tech Arch §5.2 | Tech Arch §5.2 |
| P15 | **Data flow** | Module 2 reads KPIs from Module 1, Module 4 reads progress from Module 2, Module 5 reads all | Tech Arch §6 |
| P16 | **Zustand persist** | Full `projects[]` array persisted to LocalStorage via middleware | Tech Arch §5.1, Q5 |
| P17 | **Accessibility** | `prefers-reduced-motion` respected in globals.css, keyboard navigation, focus states | UI/UX §11 |
| P18 | **Multi-project** | Create, open, delete projects; each project has independent pipeline data; dashboard ↔ project navigation | PRD §4, Tech Arch §1.2 |

---

## Task / Roadmap Status

| Step | Name | Status | Done / Total |
|------|------|--------|--------------|
| 1 | Project Setup + Deployment Pipeline + Design Foundation | Done | 15/15 |
| 2 | AI Extraction Infrastructure | Done | 11/13 (2 deferred) |
| 3 | Project Dashboard + App Shell + Base Components | Done | 22/23 (UploadZone shared pattern deferred) |
| 4 | Module 1 — MoU Upload | Done | 13/13 |
| 5 | Module 2 — Progress Reports | Done | 11/11 |
| 6 | Module 3 — Field Evidence | Done | 11/12 (push pending) |
| 7 | Module 4 — SROI Calculation | Done | 11/12 (push pending) |
| 8 | Module 5 — Report Generation | Done | 10/11 (push pending) |
| 9 | Polish & Exhibition Prep | Done (partial) | 2/28 (button variants, accessibility) |

**Overall**: 106/128 tasks done (~83%). Steps 1-8 functionally complete. Step 9 (Polish) is next.

---

## Architecture Compliance Summary

| Area | Compliance | Notes |
|------|-----------|-------|
| Project structure | 95% | Minor naming deviation (stage2-progress vs stage2-reports) |
| Dependencies | 85% | pdf-parse → unpdf swap, stale types, undocumented deps |
| AI extraction layer | 95% | Missing JSON retry, everything else excellent |
| State management | 90% | Provider selection outside Zustand, store pattern solid |
| Component architecture | 95% | All modules built, data flows correct |
| API layer | 100% | All routes present, proper error codes, proper validation |
| Styling/tokens | 100% | All design tokens match UI/UX v2.0 exactly |
| Animations | 95% | Core animations implemented; Step 9 verifies completeness |
| Data flow | 100% | All inter-module dependencies correctly wired |
| Types/schemas | 95% | Missing `pdfBlob` on ReportData |

**Overall architecture compliance: ~90%**

---

## Priority Actions (Recommended Fix Order)

1. **W3**: Update Technical Architecture doc — versions, deps table, unpdf reference (prevents confusion)
2. **W5 + W6**: Clean up stale dependencies — `npm uninstall @types/pdf-parse pdfkit` (if pdfkit unused)
3. **I1**: Delete `nul` file from repo root
4. **W1**: Add `pdfBlob` field to `ReportData` type (optional — download works without it)
5. **W2**: Add JSON parse retry logic in extraction routes (improves Ollama reliability)
6. **W7**: Move provider selection into Zustand (architectural consistency)
7. **W4 + W8 + W9**: Align Tech Arch §3 with actual codebase (directory names, file listing)

Items 1-3 are quick wins (< 5 minutes each). Items 4-7 are improvements for robustness.

---

## Comparison: v1.0 → v2.0

| Metric | v1.0 (Steps 1-2) | v2.0 (Steps 1-8) | Change |
|--------|-------------------|-------------------|--------|
| Critical issues | 2 | 0 | All resolved |
| Warnings | 8 | 9 | +1 new, 5 resolved, 3 carried over |
| Info items | 5 | 5 | Stable |
| Passing checks | 7 | 18 | +11 new verifications |
| Architecture compliance | ~80% | ~90% | +10% |
| Code files reviewed | 12 | 34 | Full codebase |
| Tasks complete | 26/128 | 106/128 | +80 tasks |

---

## Next Review

Schedule after Step 9 (Polish & Exhibition Prep) is complete. Focus areas:
- UI/UX Strategy checklist verification (§2-§8)
- Responsive layout testing results
- AI failover testing results (online → offline → back)
- Real PDF testing with MoU and reports
- Production build verification
- Final accessibility pass

---

*Generated by Claude Code — code-review skill v2.0*
