# UI/UX Strategy Document
## CSR Impact Assessment Platform — MVP

**Version:** 2.0
**Date:** February 11, 2026
**Visual Style:** Corporate Premium
**Display Target:** Laptop screen (exhibition booth, close viewing)

---

## 1. Design Vision

### 1.1 The Look & Feel

**Corporate Premium** — The UI should feel like enterprise-grade software built for senior CSR leadership. Think Salesforce meets McKinsey report. Dark navy headers with teal and gold accents communicate authority and trust. Structured layouts with clear hierarchy make complex data feel approachable.

### 1.2 First Impression Goal

When someone walks up to the booth and sees the laptop:
- "This looks like a real product, not a prototype"
- "This looks expensive / well-built"
- "I can immediately tell what it does"

### 1.3 Design References (Mood)

The visual direction draws from:
- **Enterprise dashboards** — Structured grids, data cards with clear status indicators
- **Financial reports** — Navy + gold, serif accents for headings, premium feel
- **Consulting firm aesthetics** — Clean data tables, professional charts, authoritative typography

---

## 2. Color System (Updated for Corporate Premium)

### 2.1 Primary Palette

| Name | Hex | Usage |
|------|-----|-------|
| **Navy** (Primary Dark) | `#0F172A` | Header bar, sidebar backgrounds, dark sections |
| **Navy Mid** | `#1E293B` | Card headers, secondary dark backgrounds |
| **Teal** (Primary Accent) | `#0891B2` | Primary buttons, active states, links, highlights |
| **Teal Dark** | `#0E7490` | Hover states for teal elements |
| **Gold** (Premium Accent) | `#D97706` | SROI display, premium highlights, achievement badges |
| **Gold Light** | `#F59E0B` | Star ratings, premium indicators |

### 2.2 Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Success** | `#059669` | On-track KPIs, verified evidence, completed stages |
| **Warning** | `#D97706` | At-risk KPIs, partial completion |
| **Danger** | `#DC2626` | Behind-target KPIs, errors, failed validation |
| **Info** | `#0891B2` | Informational badges, AI status |

### 2.3 Neutral Palette

| Name | Hex | Usage |
|------|-----|-------|
| **White** | `#FFFFFF` | Card backgrounds, input fields |
| **Off-White** | `#F8FAFC` | Page background |
| **Light Gray** | `#F1F5F9` | Alternate row backgrounds, subtle borders |
| **Border** | `#E2E8F0` | Card borders, dividers |
| **Muted Text** | `#64748B` | Secondary text, labels, captions |
| **Body Text** | `#334155` | Primary body text |
| **Dark Text** | `#0F172A` | Headings, emphasis text |

### 2.4 Stage Accent Colors

Each stage has a distinct accent used in the stepper and stage-specific highlights:

| Stage | Color | Hex |
|-------|-------|-----|
| Stage 1 — MoU Upload | Teal | `#0891B2` |
| Stage 2 — Reports | Emerald | `#059669` |
| Stage 3 — Evidence | Blue | `#2563EB` |
| Stage 4 — SROI | Gold | `#D97706` |
| Stage 5 — Report | Purple | `#7C3AED` |

---

## 3. Typography

### 3.1 Font Selection

| Role | Font | Fallback | Why |
|------|------|----------|-----|
| **Headings** | **Plus Jakarta Sans** | Inter, system-ui | Geometric, modern, slightly premium feel. Wider letterforms look great at large sizes. |
| **Body** | **Inter** | system-ui, sans-serif | Industry standard for dashboards. Excellent readability at all sizes. |
| **Data/Numbers** | **Inter (Tabular Nums)** | monospace | Tabular number alignment for tables and financial figures. |

Both fonts are available via Google Fonts / `next/font` — zero layout shift, loaded locally.

### 3.2 Type Scale

| Element | Font | Size | Weight | Line Height | Letter Spacing |
|---------|------|------|--------|-------------|----------------|
| Page Title | Plus Jakarta Sans | 28px | 700 (Bold) | 1.2 | -0.02em |
| Section Title | Plus Jakarta Sans | 22px | 600 (Semibold) | 1.3 | -0.01em |
| Card Title | Plus Jakarta Sans | 16px | 600 (Semibold) | 1.4 | 0 |
| Body | Inter | 14px | 400 (Regular) | 1.6 | 0 |
| Body Small | Inter | 13px | 400 (Regular) | 1.5 | 0 |
| Caption | Inter | 12px | 500 (Medium) | 1.4 | 0.01em |
| Overline/Label | Inter | 11px | 600 (Semibold) | 1.4 | 0.05em |
| Large Data Number | Plus Jakarta Sans | 48px | 700 (Bold) | 1.0 | -0.03em |
| Badge Text | Inter | 11px | 600 (Semibold) | 1.0 | 0.02em |

---

## 4. Layout System

### 4.1 Two-Level Layout

The app has two distinct layouts:

**Level 1 — Project Dashboard** (landing page):
```
┌──────────────────────────────────────────────────────────────────┐
│  HEADER BAR (navy #0F172A)                             h: 64px  │
│  ┌──────────┐                              ┌────────────────┐   │
│  │   Logo   │    CSR Impact Assessment     │ AI: Cloud ●    │   │
│  └──────────┘                              └────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  DASHBOARD CONTENT                    max-w: 1200px, centered   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                            │  │
│  │  Your Projects                    [+ New Project] button  │  │
│  │  X projects                                                │  │
│  │                                                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │ Project A    │  │ Project B    │  │ Project C    │   │  │
│  │  │ NGO Name     │  │ NGO Name     │  │ NGO Name     │   │  │
│  │  │ ●●●○○ Stg 3 │  │ ●○○○○ Stg 1 │  │ ●●●●● Done  │   │  │
│  │  │ Updated 2d   │  │ Updated 1h   │  │ SROI: 3.2x  │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  │                                                            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Level 2 — Project View** (5-stage flow):
```
┌──────────────────────────────────────────────────────────────────┐
│  HEADER BAR (navy #0F172A)                             h: 64px  │
│  ┌──────────┐                              ┌────────────────┐   │
│  │ ← Back   │    Project Name              │ AI: Cloud ●    │   │
│  └──────────┘                              └────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  STAGE STEPPER                                         h: 80px  │
│     ●━━━━━●━━━━━●━━━━━○━━━━━○                                  │
│     MoU   Reports Evidence SROI  Report                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  STAGE CONTENT AREA                   max-w: 1200px, centered   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                            │  │
│  │  Stage Title                              Stage X of 5    │  │
│  │  Stage description text                                    │  │
│  │                                                            │  │
│  │  ┌────────────────────────────────────────────────────┐   │  │
│  │  │                                                     │   │  │
│  │  │              Stage-specific content                 │   │  │
│  │  │                                                     │   │  │
│  │  └────────────────────────────────────────────────────┘   │  │
│  │                                                            │  │
│  │                    ┌──────────────┐ ┌──────────────────┐  │  │
│  │                    │  ← Back      │ │  Continue →       │  │  │
│  │                    └──────────────┘ └──────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

Key differences in Level 2 header:
- Logo area replaced with "← Back to Projects" link
- App name replaced with the current project name

### 4.2 Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| `space-xs` | 4px | Tight gaps (badge padding, icon margins) |
| `space-sm` | 8px | Inline element gaps |
| `space-md` | 16px | Element gaps, card internal padding |
| `space-lg` | 24px | Section gaps, card padding |
| `space-xl` | 32px | Major section separators |
| `space-2xl` | 48px | Page section breaks |

### 4.3 Card System

Cards are the primary content containers. Three tiers:

**Standard Card:**
```
- Background: white
- Border: 1px solid #E2E8F0
- Border radius: 12px
- Shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)
- Padding: 24px
- Hover: shadow increases to 0 4px 12px rgba(0,0,0,0.08)
```

**Elevated Card (for key metrics):**
```
- Background: white
- Border: 1px solid #E2E8F0
- Border radius: 12px
- Shadow: 0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)
- Padding: 24px
```

**Dark Card (for SROI display, headers):**
```
- Background: linear-gradient(135deg, #0F172A, #1E293B)
- Border: none
- Border radius: 12px
- Shadow: 0 8px 24px rgba(15,23,42,0.25)
- Text: white
- Padding: 32px
```

---

## 5. Component Styling Guide

### 5.0 Project Dashboard

**Dashboard Header Area:**
```
- "Your Projects" heading: 28px Plus Jakarta Sans bold, #0F172A
- Project count subtitle: 14px Inter, #64748B (e.g., "3 projects")
- "+ New Project" button: Primary teal button, right-aligned
```

**Project Card:**
```
- White card, 12px border radius, standard shadow
- Left accent bar: 4px wide, colored by furthest completed stage:
  - Not started: #CBD5E1 (gray)
  - Stage 1: #0891B2 (teal)
  - Stage 2: #059669 (emerald)
  - Stage 3: #2563EB (blue)
  - Stage 4: #D97706 (gold)
  - Stage 5 complete: #7C3AED (purple)
- Padding: 20px
- Top line: Project name (16px semibold) + delete icon (appears on hover, muted)
- Second line: NGO name (14px, #64748B muted)
- Middle: Mini stage indicator — 5 small circles (8px) showing stage completion
  - Completed: solid stage color
  - Current: stage color with pulse
  - Locked: gray outline
- Bottom row: "Updated 2h ago" (12px caption, #94A3B8) + SROI badge if available
- Hover: Shadow increases, cursor pointer, slight scale 1.01
- Click: Opens the project (transition to Level 2)
- Animate in: Staggered slide-up + fadeIn (same pattern as KPI cards)
```

**Grid Layout:**
```
- Desktop (>1024px): 3 columns, 16px gap
- Tablet (768-1024px): 2 columns, 16px gap
- Narrow: 1 column
```

**Empty State (no projects):**
```
- Centered vertically in content area
- Large folder/document icon (64px, #94A3B8)
- "No projects yet" — 22px Plus Jakarta Sans semibold, #0F172A
- "Create your first CSR impact assessment" — 14px Inter, #64748B
- Primary CTA: "Create New Project" button (teal, centered)
- Animate in: fadeIn + slight scale-up (400ms)
```

**Create Project Dialog:**
```
- Modal overlay with backdrop blur
- White card, 16px border radius, elevated shadow
- Title: "New Project" — 20px semibold
- Optional: Project name input (can be auto-filled from MoU later)
- Buttons: "Cancel" (secondary) + "Create" (primary teal)
```

### 5.1 Header Bar

```
- Background: #0F172A (navy)
- Height: 64px
- Left: Logo or app icon + "CSR Impact Assessment" in white
- Right: AI Status indicator badge
- Border-bottom: 1px solid rgba(255,255,255,0.1) (subtle light line)
- Position: sticky top
```

### 5.2 Stage Stepper

```
- Background: white
- Padding: 20px 0
- Border-bottom: 1px solid #E2E8F0

Stage circles:
- Completed: Solid green (#059669) with white checkmark, scale animation on complete
- Current: Solid stage accent color, subtle pulse glow animation
- Locked: Gray outline (#CBD5E1), gray fill

Connector lines:
- Completed: Solid green (#059669)
- Next: Gradient from green to gray
- Locked: Dashed gray (#CBD5E1)

Labels:
- Completed/Current: Dark text (#0F172A), 13px semibold
- Locked: Muted text (#94A3B8), 13px regular
```

### 5.3 Buttons

**Primary Button (Continue, Confirm):**
```
- Background: #0891B2 (teal)
- Text: white, 14px, semibold
- Padding: 12px 24px
- Border radius: 8px
- Shadow: 0 2px 4px rgba(8,145,178,0.3)
- Hover: Background darkens to #0E7490, shadow grows
- Active: Scale 0.98
- Transition: all 200ms ease
```

**Secondary Button (Back, Cancel):**
```
- Background: transparent
- Border: 1px solid #E2E8F0
- Text: #334155, 14px, medium
- Hover: Background #F8FAFC
```

**Danger Button (Delete, Reset):**
```
- Background: transparent
- Border: 1px solid #FCA5A5
- Text: #DC2626
- Hover: Background #FEF2F2
```

### 5.4 Upload Zone

```
Default state:
- Dashed border: 2px dashed #CBD5E1
- Border radius: 16px
- Background: #F8FAFC
- Center: Upload cloud icon (48px, #94A3B8) + text
- Padding: 48px

Hover / Drag-over state:
- Dashed border: 2px dashed #0891B2
- Background: rgba(8,145,178,0.04)
- Icon color: #0891B2
- Scale: 1.01
- Transition: all 300ms ease

Processing state:
- Solid border: 2px solid #0891B2
- Background: white
- Center: Animated spinner + "Extracting data..." text
- Pulsing glow effect on border
```

### 5.5 KPI Cards (Stage 1)

```
- White card with left accent bar (4px wide, colored by category):
  - Output: #0891B2 (teal)
  - Outcome: #059669 (green)
  - Impact: #D97706 (gold)
- Animate in: slideUp + fadeIn, staggered (each card 100ms delay)
- Hover: Slight elevation increase, pencil icon appears for editable fields
- Delete: Card slides out + fades
- Category badge: Small rounded pill in top-right corner
```

### 5.6 Progress Cards (Stage 2)

```
- White card, full-width progress bar at bottom
- Bar background: #F1F5F9
- Bar fill: Animated from 0 to value over 800ms, easeOutCubic
- Fill color based on status:
  - On Track (≥90%): #059669 (green)
  - At Risk (60-89%): #D97706 (gold/orange)
  - Behind (<60%): #DC2626 (red)
- Large current value (28px) + target value (14px muted) on same line
- Status badge: Rounded pill with background tint matching status color
```

### 5.7 SROI Display (Stage 4)

```
- Dark gradient card (#0F172A → #1E293B)
- SROI ratio: 48px bold, gold color (#F59E0B)
- Glow effect behind the number: radial gradient, gold, 20% opacity
- Counter animation: Number counts up from 0 to final value over 1.5s
- Plain English: "Every ₹1 invested created ₹X.XX of social value"
  - "₹X.XX" portion highlighted in gold
- Calculation breakdown: Horizontal flow with animated arrows
```

### 5.8 Status Badges

```
All badges: 11px semibold, rounded-full, px-3 py-1

On Track:    bg-emerald-50  text-emerald-700  border border-emerald-200
At Risk:     bg-amber-50    text-amber-700    border border-amber-200
Behind:      bg-red-50      text-red-700      border border-red-200
Verified:    bg-emerald-50  text-emerald-700  border border-emerald-200
Discrepancy: bg-red-50      text-red-700      border border-red-200
No Evidence: bg-slate-50    text-slate-500    border border-slate-200
```

---

## 6. Animation & Transitions

### 6.1 Animation Library

Use **Framer Motion** for React-based animations. It provides:
- Component mount/unmount animations (`AnimatePresence`)
- Layout animations (smooth reordering)
- Gesture animations (hover, tap)
- Spring physics for natural motion

### 6.2 Animation Catalog

| Animation | Where Used | Duration | Easing |
|-----------|-----------|----------|--------|
| **Dashboard ↔ Project transition** | Opening/closing a project from dashboard | 400ms | easeInOut |
| **Project card stagger** | Project cards appearing on dashboard | 500ms, staggered 80ms | easeOut (spring) |
| **Page/Stage transition** | Switching between stages | 400ms | easeInOut |
| **Card slide-up + fade** | KPI cards appearing after extraction | 500ms, staggered 100ms | easeOut (spring) |
| **Progress bar fill** | Progress cards in Stage 2 | 800ms | easeOutCubic |
| **Number count-up** | SROI ratio, percentage values | 1500ms | easeOut |
| **Spinner + pulse** | AI extraction loading state | Loop | linear |
| **Hover elevation** | Cards on hover | 200ms | ease |
| **Button press** | All buttons on click | 100ms | ease |
| **Slide-out + fade** | Deleting a KPI card | 300ms | easeIn |
| **Checkmark draw** | Stage completion in stepper | 400ms | easeOut |
| **Badge pop-in** | Status badges appearing | 300ms | spring (bounce) |
| **Skeleton shimmer** | Loading placeholders | Loop 1.5s | linear |

### 6.3 Stage Transition

When moving between stages:

```
Current stage: slides out left + fades (300ms)
New stage: slides in from right + fades in (400ms)

Going back: reverse direction (current slides right, previous slides in from left)
```

### 6.4 Data Extraction Animation

When AI extraction completes:

```
1. Upload zone shrinks up smoothly (300ms)
2. Brief "sparkle" or "success" pulse (200ms)
3. Project details card slides up + fades in (400ms)
4. KPI cards appear one by one, staggered (each 100ms delay, 500ms animation)
5. Confirm button fades in at the end (300ms)
```

This creates a satisfying "reveal" effect that makes AI extraction feel impressive.

### 6.5 Performance Rules

- All animations use `transform` and `opacity` only (GPU-accelerated)
- Respect `prefers-reduced-motion` media query (disable animations if set)
- No animation should block user interaction
- Stagger limits: Max 8 items staggered, then batch the rest

---

## 7. Loading & Empty States

### 7.1 Loading States

**Skeleton screens** (not spinners) for content loading:
```
- Gray animated shimmer blocks matching content layout
- Pulse animation: opacity 0.4 → 0.7, 1.5s cycle
- Replaces: cards, text blocks, progress bars
```

**AI Extraction loading:**
```
- Centered spinner (custom, teal colored)
- Below: "Analyzing document with AI..."
- Below that: Provider badge ("Using Claude" or "Using Local AI")
- Animated dots after text: "Analyzing..." → "Analyzing.." → "Analyzing..."
- Optional: Simulated progress bar (indeterminate, fills slowly)
```

### 7.2 Empty States

Before data is uploaded in each stage:

**Stage 1 (no MoU uploaded):**
```
- Large upload zone (prominent)
- Above: Illustration or icon of a document
- Text: "Upload your MoU to get started"
- Subtext: "We'll extract project details and KPIs automatically"
```

**Stage 2 (no reports yet):**
```
- KPI summary from Stage 1 shown as context
- Upload zone for reports
- Text: "Upload NGO progress reports"
- Subtext: "We'll match reported values against your KPIs"
```

---

## 8. Report Preview (Stage 5) — Premium Styling

The report preview should look like a real professional document:

```
- Container: Centered, white, A4 aspect ratio suggestion
- Shadow: Heavy paper shadow (0 8px 32px rgba(0,0,0,0.12))
- Border: 1px solid #E2E8F0

Cover page section:
- Dark navy background (#0F172A)
- "Impact Assessment Report" in white, 32px, Plus Jakarta Sans
- Project name in teal accent
- Date and company in light gray
- Subtle geometric pattern or line art in background

Section headings:
- Left teal accent bar (4px)
- Navy text, 20px semibold

Tables:
- Alternating row backgrounds (white / #F8FAFC)
- Header row: Navy background, white text
- Borders: 1px solid #E2E8F0

SROI highlight box:
- Dark card style within the report
- Gold SROI number
```

---

## 9. Responsive Considerations

### 9.1 Laptop Screen (Primary — 1366x768 to 1920x1080)

- Content max-width: 1200px
- Side padding: 32px
- Cards in 2-3 column grid
- Full stepper visible horizontally

### 9.2 Tablet (768px — Secondary)

- Content full-width with 16px padding
- Cards stack to single column
- Stepper compresses (numbers only, no labels)
- Upload zone full-width

---

## 10. Third-Party Addition for UI

| Package | Purpose | Size |
|---------|---------|------|
| **framer-motion** | Animations, transitions, gestures | ~32KB gzip |

This is the only additional UI dependency beyond what's in the Technical Architecture. Framer Motion is the industry standard for React animations and is worth the bundle size for exhibition impact.

---

## 11. Accessibility (Basic)

Even for an exhibition demo, basic accessibility ensures the app works reliably:

- Sufficient color contrast (all text meets WCAG AA)
- Focus states on all interactive elements
- Keyboard navigable (Tab, Enter, Escape)
- Alt text on icons and images
- `prefers-reduced-motion` respected

---

*This document guides all UI implementation decisions. It should be referenced alongside the Technical Architecture during development.*
