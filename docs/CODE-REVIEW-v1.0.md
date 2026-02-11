# Code Review Report v1.0

**Project**: GLAD CSR Impact Assessment Platform MVP
**Reviewed**: February 11, 2026
**Reviewer**: Claude Code (Automated Architecture Audit)
**Docs analyzed**: PRD v2.0, Technical Architecture v3.0, UI/UX Strategy v2.0, Master Task List
**Scope**: Steps 1-2 (Project Setup + AI Extraction Infrastructure)

---

## Review Summary

| Severity | Count |
|----------|-------|
| Critical | 2 |
| Warning | 8 |
| Info | 5 |
| Passing | 7 |
| **Total** | **22** |

**Architecture compliance**: ~80% for implemented code (Steps 1-2)

---

## Critical Issues

| # | File | Finding | Expected (source) | Recommendation | Status |
|---|------|---------|-------------------|----------------|--------|
| C1 | `lib/ai/pdf-parser.ts:1-16` | pdf-parse v2 class API (`PDFParse`) needs runtime verification — Ollama extraction path may fail | Tech Arch §4.4: "extract text using pdf-parse" | Verify with a sample PDF test; the build passes but runtime is untested | Open |
| C2 | `package.json` | Missing `@react-pdf/renderer` | Tech Arch §10.1: listed as core dependency | Install when implementing Stage 5 (expected; not a bug yet) | Deferred to Step 8 |

---

## Warnings

| # | File | Finding | Expected (source) | Recommendation | Status |
|---|------|---------|-------------------|----------------|--------|
| W1 | `lib/types.ts:141-143` | `ReportData` missing `pdfBlob: Blob \| null` | PRD §5.4: `report.pdfBlob: Blob \| null` | Add field; update store `partialize` to exclude it | Open |
| W2 | `lib/ai/claude.ts:88-104` | Health check uses full `messages.create` call (costs money per check) | Tech Arch §4.2: "Ping Claude API (HEAD request, 3s timeout)" | Use lighter check or cache more aggressively | Open |
| W3 | `lib/ai/claude.ts:88-104` | Health check has no timeout — can hang indefinitely | Tech Arch §4.2: "3s timeout" | Add `AbortController` with 3s timeout | Open |
| W4 | `lib/ai/provider.ts:152-166` | No JSON parse retry with stricter prompt on failure | Tech Arch §4.1: "If JSON parse fails -> retry once with stricter prompt" | Add retry logic in extraction functions | Open |
| W5 | All 3 extraction routes | All errors return 422; no 503 for "no provider available" | Tech Arch §12.2: 503 with `canRetry: false` for no provider | Check error message, return 503 when no provider | Open |
| W6 | `package.json` | All dependency versions in Tech Architecture doc are outdated | Tech Arch §10.1, §17 list Next 14, React 18, Tailwind 3 | Update the **docs** to match actual versions (Next 16, React 19, Tailwind 4, Zustand 5) | Open |
| W7 | `lib/store.ts:80-103` | Missing module-specific actions (setProjectDetails, addKPI, etc.) | Tech Arch §5.1: explicit action names listed | Add as thin wrappers when building Stages 3-8 | Deferred to Steps 3-8 |
| W8 | `app/globals.css` | Missing named spacing tokens (space-xs through space-2xl) | UI/UX Strategy §4.2 | Tailwind defaults cover this; add comment mapping or aliases | Open |

---

## Info

| # | File | Finding | Expected (source) | Recommendation | Status |
|---|------|---------|-------------------|----------------|--------|
| I1 | `lib/store.ts:206-210` | `view` + `activeProjectId` persisted — user resumes mid-project on refresh | Not explicitly required by spec | Consider excluding for cleaner UX (always land on dashboard) | Open |
| I2 | `lib/types.ts:29,32,63` | Date fields use `string` instead of `Date` | PRD §5.4 specifies `Date` type | Actually better for JSON/LocalStorage serialization — document the deviation | Accepted |
| I3 | `lib/ai/ollama.ts:21-33` | No timeout on Ollama extraction fetch | Not specified, but Ollama can be slow (5-15s per §13.2) | Add 60-90s timeout | Open |
| I4 | `app/globals.css` | Missing card shadow tokens (standard/elevated/dark) | UI/UX §4.3 | Define when building card components in Step 3 | Deferred to Step 3 |
| I5 | `app/page.tsx` | Static placeholder, not wired to Zustand store | Tech Arch §9.2: store-driven view routing | Expected — will be replaced in Step 3 | Deferred to Step 3 |

---

## Passing Checks

| # | File | What was verified | Source |
|---|------|-------------------|--------|
| P1 | `lib/ai/claude.ts:26-48` | Claude model (`claude-sonnet-4-5-20250929`), temperature (0), PDF document type all correct | Tech Arch §4.3 |
| P2 | `lib/ai/provider.ts:64-105` | Failover chain primary -> fallback -> error correctly implemented | Tech Arch §4.6 |
| P3 | `lib/ai/provider.ts:15-16,29-31` | 30-second provider cache correctly implemented | Tech Arch §4.2 |
| P4 | `lib/ai/provider.ts:152-166` | Markdown code block stripping in `parseJSONResponse` works | Tech Arch §4.1 |
| P5 | `app/globals.css:11-88` | All color design tokens present and matching spec (navy, teal, gold, stages, semantics) | UI/UX §2 |
| P6 | `app/globals.css, app/layout.tsx` | Font families (Plus Jakarta Sans + Inter) and weights correctly loaded | UI/UX §3 |
| P7 | `lib/ai/ollama.ts:27` | Ollama `stream: false` correctly set | Tech Arch §4.4 |

---

## Task / Roadmap Status

| Step | Name | Status | Done / Total |
|------|------|--------|--------------|
| 1 | Project Setup + Deployment Pipeline + Design Foundation | Done | 15/15 |
| 2 | AI Extraction Infrastructure | Done | 11/13 (2 deferred) |
| 3 | Project Dashboard + App Shell + Base Components | Not Started | 0/23 |
| 4 | Module 1 — MoU Upload | Not Started | 0/13 |
| 5 | Module 2 — Progress Reports | Not Started | 0/11 |
| 6 | Module 3 — Field Evidence | Not Started | 0/12 |
| 7 | Module 4 — SROI Calculation | Not Started | 0/12 |
| 8 | Module 5 — Report Generation | Not Started | 0/11 |
| 9 | Polish & Exhibition Prep | Not Started | 0/28 |

---

## Priority Actions (Recommended Fix Order)

1. **W2 + W3**: Fix Claude health check — add 3s timeout + use lighter API call (saves money, prevents hangs)
2. **W5**: Add 503 error differentiation in extraction routes (no provider -> 503, extraction fail -> 422)
3. **W1**: Add `pdfBlob` field to `ReportData` type + exclude from persist
4. **W4**: Add JSON parse retry with stricter prompt
5. **W6**: Update Technical Architecture doc versions to match actual (Next 16, React 19, etc.)
6. **C1**: Test pdf-parser.ts with a real PDF to verify runtime behavior

---

## Next Review

Schedule after Step 3 (Project Dashboard + App Shell + Base Components) is complete. Focus areas:
- Component structure compliance with Tech Arch §3
- UI/UX token usage in actual components
- Store-driven navigation (dashboard <-> project view)
- Animation implementation vs UI/UX §6
- Responsive layout compliance vs UI/UX §9

---

*Generated by Claude Code — code-review skill v1.0*
