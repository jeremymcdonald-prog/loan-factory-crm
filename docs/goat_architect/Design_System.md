# Design_System

Purpose: the complete visual and interaction language for Loan Factory CRM — tokens, components, and rules an implementation team can build from without asking follow-up questions. It turns the locked design direction (D-13: elite command center, high information density done calmly, status color tied to loan urgency) into concrete hex values, pixel sizes, and component contracts, defines the one consistent way AI appears on every screen, and formally retires the prototype's coral/beige/emoji aesthetic. It is grounded in the Loan Factory brand voice — clear, practical, human, confident without making promises — and consistent with [[Information_Architecture]] (navigation, approval queue, record anatomy), [[PRD]], and the locked decisions in [[Decisions]]. Where this document makes a new decision, it is flagged in §20 for [[Decisions]].

---

## 1. Kill list — retired prototype aesthetics (non-negotiable)

The offline HTML prototype's look is replaced wholesale (D-01, D-13, evidence in [[Current_State_Audit]]). None of the following may appear anywhere in Loan Factory CRM, including marketing screenshots and demo data:

| Retired | What it was | Why it dies |
|---|---|---|
| Coral `#E0603A` | Prototype primary/accent | Reads consumer-lifestyle, not command center; collides with urgency red semantics |
| Beige `#F6F1EA` + pastel card washes | Page and card backgrounds | Kills contrast headroom; makes density look cluttered instead of calm |
| Emoji as iconography (🎂 ✨ 👋 🏠 …) | Template cards, greetings, toasts | Unprofessional at broker-shop scale, inaccessible, inconsistent cross-platform; replaced by a single icon set (§8) |
| "Good morning, Minh 👋" greeting tone | Home header | Today opens with what matters now, not a greeting card. A date/context line is fine; waving is not |
| Gradient noise / decorative gradients | Buttons, banners | Only permitted gradient: none. Depth comes from layered neutrals and borders |
| Whitespace-first, 4-cards-per-screen layouts | Prototype Home | The CRM's density targets (§6) are the opposite: an LO with 25 files sees their day without scrolling |
| Mascot/tip widgets ("AI Assistant — 4 setup tips" pinned card) | Prototype sidebar | AI is ambient and operational (§15), never a mascot |
| Fake status decoration (e.g. "Encompass ✓ Connected") | Prototype settings | Never render an integration, sync, or send state that isn't real — CANON compliance posture |

---

## 2. Brand personality — what Loan Factory CRM should feel like

Loan Factory's voice rules (brand pack: "clear, practical, human, direct, helpful, confident without making promises") translate into five visual principles. Every component decision below traces to one of these.

1. **Calm authority.** The product of a shop that closes loans every day. Graphite surfaces, one accent, restrained motion. Nothing blinks, bounces, or celebrates with confetti.
2. **Density, composed.** Information-dense like a trading desk, organized like a well-run pipeline meeting. Density comes from tight type and spacing scales — never from shrinking touch targets or removing hierarchy.
3. **Color is meaning.** On working surfaces, hue is reserved for two jobs: loan urgency (§4.4) and AI identity (§4.3). Everything else is neutral. If a screen is colorful, something is wrong with the pipeline — and that is the point.
4. **Numbers are first-class citizens.** Loan amounts, rates, days-to-close, and counts always render in tabular numerals, right-aligned, consistently formatted (§5.4). A misaligned column of dollar figures is a bug.
5. **Confident, never promising.** The UI never over-claims, same as the copy rules: progress bars show verified milestones, not optimism; AI states confidence in words with reasons, never fake precision (§15.3). "Clear to close" is never rendered as "done" (compliance guide: CTC ≠ funded).

Voice in microcopy: plain mortgage language, second person, verbs first ("Advance stage", "Log a touch", "Approve & send"). No developer terms (no "sync entity", "null", "payload"). No hype ("supercharge"), no fear urgency, no exclamation points in system copy. EN and VI strings are peers, not translations bolted on (D-08) — layouts must tolerate Vietnamese diacritics and ~20–30% string expansion without truncating (§18.6).

---

## 3. Theming model

Two full themes. **Dark is the flagship** ("command center"); light is a first-class equal for bright offices and printing. Both ship in Phase 1 — theme is a user setting, defaulting to system preference.

- Tokens are semantic (`bg/surface`, `text/primary`, `status/critical/fg`), never raw hex in component code. One token map per theme.
- The **left navigation sidebar is graphite in both themes** — a brand constant that keeps the command-center identity even in light mode and anchors orientation (new decision, §20).
- No third "auto-mixed" theme. No per-user accent color customization in v1 (protects the color-is-meaning rule).

---

## 4. Color system

### 4.1 Neutrals — dark theme (flagship)

| Token | Hex | Use |
|---|---|---|
| `bg/canvas` | `#0B0E14` | App background behind everything |
| `bg/surface` | `#12161F` | Cards, panels, table bodies |
| `bg/raised` | `#1A2029` | Hover rows, popovers, dropdowns, sticky headers |
| `bg/sunken` | `#080B10` | Input wells, code/ID fields, timeline gutter |
| `bg/sidebar` | `#0A0D12` | Navigation sidebar (brand constant) |
| `border/subtle` | `#232B37` | Card edges, row dividers |
| `border/strong` | `#364153` | Input borders, focused-adjacent separators |
| `text/primary` | `#E8EDF4` | Headings, primary values (≈14:1 on surface) |
| `text/secondary` | `#A8B3C2` | Labels, body copy (≈8:1) |
| `text/muted` | `#8593A6` | Meta, timestamps, placeholders (≈5.5:1 — the floor) |
| `text/disabled` | `#5A6675` | Disabled only; never for readable content |

### 4.2 Neutrals — light theme

| Token | Hex | Use |
|---|---|---|
| `bg/canvas` | `#F6F7F9` | App background |
| `bg/surface` | `#FFFFFF` | Cards, panels, tables |
| `bg/raised` | `#FFFFFF` + `shadow/1` | Popovers, dropdowns |
| `bg/sunken` | `#EFF1F4` | Input wells, timeline gutter |
| `bg/sidebar` | `#0F1319` | Sidebar stays graphite (brand constant) |
| `border/subtle` | `#E4E7EC` | Card edges, dividers |
| `border/strong` | `#C9CFD9` | Inputs, emphasized separators |
| `text/primary` | `#171C24` | ≈16:1 on white |
| `text/secondary` | `#48505E` | ≈8.5:1 |
| `text/muted` | `#66707F` | ≈5.3:1 — the floor |
| `text/disabled` | `#9AA3B0` | Disabled only |

### 4.3 Brand action color + AI identity

| Token | Light | Dark | Use |
|---|---|---|---|
| `action/primary` | `#1D4ED8` (white label, ≈6.3:1) | `#4D8DFF` (label `#0A1428`, ≈7:1) | The one primary button per screen, links, active nav item, selected states |
| `action/primary-hover` | `#1E40AF` | `#6AA1FF` | Hover/pressed |
| `ai/fg` | `#6D28D9` (≈6:1 on white) | `#A78BFA` (≈6:1 on surface) | AI glyph, AI card accents, "Prepared by AI" attribution |
| `ai/bg` | `#F3EEFD` | `#221A33` | AI card fill tint, AI chips |
| `ai/border` | `#D6C9F5` | `#3D3159` | AI card border |

Rules: **violet belongs to AI alone.** No other component may use it. Blue = "you act here"; violet = "AI prepared this, it is waiting for you." AI never uses red/green — its outputs are proposals, not statuses.

### 4.4 Status colors — tied to loan urgency, not decoration

Status hue answers exactly one question: *how urgently does this relationship/task need a human?* The stage and milestone facts that drive urgency are CRM visibility data — entered by the team in v1, later syncable read-only from external systems — never loan-of-record data the CRM owns. Mapping is system-defined (same events → same color everywhere; users tune notification delivery, never color logic — see [[Information_Architecture]] §3.2).

| Level | Meaning (loan semantics) | Example triggers | Light `fg` | Light `bg` | Dark `fg` | Dark `bg` |
|---|---|---|---|---|---|---|
| `status/critical` | Act today or the deal is at risk | Rate lock expires ≤48h · closing date at risk · adverse milestone recorded · SLA breach on Act-now item | `#B42318` | `#FDEBE9` | `#F0716A` | `#2C1414` |
| `status/warning` | Needs attention this week | Lock expires 3–7 days · file stalled ≥5 business days · docs-needed follow-up past due · no outreach since a recorded milestone | `#9A6700` | `#FBF1DE` | `#E8A33D` | `#2A2210` |
| `status/healthy` | On track / milestone cleared | Stage advanced on schedule · milestone recorded on time · funded | `#16794C` | `#E7F6EE` | `#4CC38A` | `#0F2A1D` |
| `status/info` | Worth knowing, no action | Appraisal received · new FYI event · campaign stat | `#175CD3` | `#E8F0FD` | `#7DB1FF` | `#10203A` |
| `status/neutral` | Dormant / no urgency | Post-close nurture · archived · Quiet partner tier | `#66707F` | `#EFF1F4` | `#8593A6` | `#1A2029` |

Hard rules:

- **Red and amber are never decoration.** No red "delete" icons in idle states, no amber marketing badges. If it's red, a human must act today.
- Status is **never color-only**: every status pairing includes an icon and/or text label (§18.3). Urgency chips read "Lock expires in 41h", not just a red dot.
- Green is a status, not a button color. Approve actions use `action/primary` blue — approving is *acting*, not *celebrating*.
- Pipeline macro-phases (ENGAGE/QUALIFY/TRANSACT/RETAIN/GROW) carry **no hue of their own**. Phases are identified by name and position; urgency is the only color on the board (§12). This keeps a 60-loan board legible at a glance.
- Sensitive-category markers (rate lock, cash-to-close, payment change, delay, adverse outcome — the Never-Automate class from the communication framework) always render as `status/critical` fg text tag "Review required", never bulk-actionable (§16).

### 4.5 Contrast requirements (WCAG 2.2 AA, enforced)

| Pair | Requirement | This system |
|---|---|---|
| Body text on any surface | ≥ 4.5:1 | Lowest readable token (`text/muted`) ≈ 5.3:1 light / 5.5:1 dark |
| Large text (≥18.5px semibold / 24px) | ≥ 3:1 | All heading tokens exceed 8:1 |
| Button labels | ≥ 4.5:1 | Primary ≈ 6.3:1 light / 7:1 dark |
| Status fg on status bg tints | ≥ 4.5:1 | All pairs in §4.4 chosen to pass |
| Non-text UI (borders on inputs, focus ring, icons that carry meaning) | ≥ 3:1 | `border/strong` and focus ring meet 3:1 against adjacent surface |

Values above are design-time estimates; the build pipeline must include an automated contrast gate (axe/Stark or equivalent in CI) that fails on any token pair below threshold, in **both** themes. No hand-waving: a token change that breaks contrast breaks the build.

---

## 5. Typography

### 5.1 Typeface

**Inter** (variable), self-hosted, with the **Vietnamese subset always loaded** — not lazy-loaded — because per-contact language preference (D-08) means VI names and strings can appear on any screen at any time. Fallback stack: `Inter, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. One face for everything; no display font, no monospace except `ui-monospace` for raw IDs (EMT template IDs, reference codes) only.

Why Inter: proven UI workhorse at 12–14px, true tabular figures, excellent Vietnamese diacritic rendering (the one thing the old prototype got right — it shipped Inter VI subsets), variable weights keep the payload small.

### 5.2 Type scale (base 14 — density-first)

| Token | Size / line | Weight | Use |
|---|---|---|---|
| `type/metric-lg` | 28px / 34px · 1.75rem | 600, tabular | Stat tiles on Today and Intelligence |
| `type/metric-md` | 20px / 26px · 1.25rem | 600, tabular | Inline KPIs, pipeline column totals |
| `type/h1` | 22px / 28px · 1.375rem | 600 | Page title (one per page) |
| `type/h2` | 18px / 26px · 1.125rem | 600 | Section headers |
| `type/h3` | 16px / 24px · 1rem | 600 | Card titles, record header name |
| `type/body` | 14px / 22px · 0.875rem | 400 | Default text, table cells, forms |
| `type/body-strong` | 14px / 22px | 600 | Emphasis inside body, primary cell values |
| `type/small` | 13px / 20px · 0.8125rem | 400 | Secondary meta, timeline entries, help text |
| `type/label` | 12px / 16px · 0.75rem | 600, +0.4px tracking, uppercase optional | Column headers, chip labels, form labels |
| `type/micro` | 11px / 14px · 0.6875rem | 500 | Axis labels, dense badges only — never sentences |

Rules: nothing readable below 11px; body copy is never lighter than 400; maximum line length for prose blocks 72ch; headings use sentence case ("Approve & send", not "Approve & Send").

### 5.3 Weight discipline

Three weights only: 400 (read), 500 (micro/labels needing slight lift), 600 (structure and emphasis). 700 is reserved for `metric-lg` values if 600 proves too light in testing. No thin weights anywhere.

### 5.4 Numerals — the tabular rule

- `font-variant-numeric: tabular-nums lining-nums` on **every** metric, table cell, currency figure, countdown, count badge, and chart axis. No exceptions.
- Currency: `$420,000` in records and tables; `$420K` in cards and board tiles (one decimal only under $10K: `$9.5K`); never `$420k` lowercase.
- Rates: always with unit and precision the source provides — `6.625%`, never rounded for display.
- Countdowns: `41h` under 48h, `3d` under 14 days, date beyond (`Apr 22`); the unit switch is what moves urgency color (§4.4).
- Dates: relative in timelines ("2h ago"), absolute on hover and in audit views (`Apr 3, 2026 · 2:14 PM`); audit trail always absolute with timezone.

---

## 6. Spacing, grid, density

### 6.1 Spacing scale (4px base)

| Token | px | rem | Typical use |
|---|---|---|---|
| `space/1` | 4 | 0.25 | Chip internal gap, icon-to-text |
| `space/2` | 8 | 0.5 | Between related controls, cell padding-y |
| `space/3` | 12 | 0.75 | Cell padding-x, compact card padding |
| `space/4` | 16 | 1 | Card padding, form field gap |
| `space/5` | 20 | 1.25 | Between cards in a rail |
| `space/6` | 24 | 1.5 | Page gutter, section gap |
| `space/8` | 32 | 2 | Between major page zones |
| `space/10` | 40 | 2.5 | Above page title |
| `space/12` | 48 | 3 | Empty-state breathing room only |

### 6.2 Grid & chrome dimensions

| Element | Value |
|---|---|
| Layout grid | 12 columns, 24px gutters, fluid |
| Content max-width | 1440px (tables and board may go full-bleed) |
| Design/QA reference viewport | 1440 × 900 |
| Sidebar | 240px expanded / 64px collapsed (icons + tooltips) |
| Top bar | 56px |
| Right AI/facts rails on records | 320px |
| Minimum supported desktop width | 1280px (below → tablet layout) |

### 6.3 Density targets (acceptance criteria, not aspirations)

These are testable against the QA scorecard's high-volume workflows ([[QA_Plan]]):

| Surface | Target at 1440×900 |
|---|---|
| Today | ≥ 12 actionable items (tasks + approvals + alerts) visible without scrolling |
| Pipeline table | ≥ 16 loan rows visible (40px rows) · ≥ 20 in compact (32px) |
| Pipeline board | 5 phase columns fully visible; ≥ 5 cards per column |
| Conversations list | ≥ 14 threads |
| Record timeline | ≥ 8 events |
| Table row heights | 40px default · 32px compact · 48px never exceeded on desktop |

Calm comes from alignment and rhythm, not emptiness: consistent 4px baseline, right-aligned numerals, one accent color, ruthless icon consistency.

### 6.4 Radius & elevation

| Token | Value | Use |
|---|---|---|
| `radius/sm` | 6px | Buttons, inputs, chips |
| `radius/md` | 8px | Cards, AI cards, table container |
| `radius/lg` | 12px | Modals, popovers |
| `radius/full` | 999px | Pills, avatars, count badges |
| `shadow/1` (light theme) | `0 1px 2px rgba(23,28,36,.06), 0 1px 3px rgba(23,28,36,.10)` | Raised surfaces |
| `shadow/2` (light theme) | `0 4px 12px rgba(23,28,36,.12)` | Modals, dropdowns |
| Dark theme elevation | No shadows — elevation = lighter surface (`bg/raised`) + `border/subtle` | All raised surfaces |

---

## 7. Navigation chrome

Implements the locked 10-item nav ([[Information_Architecture]] §2).

**Sidebar** (graphite in both themes, §3):
- Logo/wordmark zone 56px; nav items 36px tall, 13px/600 labels, 20px icons, 8px icon-to-label gap.
- Active item: `action/primary` 3px left rail + tinted fill (`rgba(77,141,255,.10)` dark / `rgba(29,78,216,.08)` light against graphite) + `text/primary` label. Hover: `bg/raised` equivalent on graphite (`#141A23`).
- Count badges (Conversations unread, Approvals) are `radius/full`, 11px tabular, `bg` `#2C3543`, turning `status/critical` bg/fg only when a critical item is inside.
- Collapse control at bottom; collapsed state shows icons with 250ms-delay tooltips.
- Compliance footer (fixed, bottom): "Loan Factory, Inc. · NMLS #320841" + Equal Housing Lender glyph, 11px `text/muted`-on-graphite (`#6B7686`, ≥4.5:1). Always visible; per-LO NMLS renders in user menu and signatures.

**Top bar** (56px, `bg/surface`, `border/subtle` bottom):
- Left: breadcrumb (section / record).
- Center: global search field — ⌘K target, 320px, placeholder "Search or ask anything…" (the natural-language entry to AI per IA §3.1).
- Right, in order: **＋ Quick create** (menu: Lead · Task · Note · Message), **Approvals** icon with count (violet dot when AI items wait), **Notifications** (three-lane panel), user/workspace menu. Team leaders see the "Viewing as" workspace switch here as a persistent amber-outlined chip — impersonation is never invisible.

---

## 8. Iconography

**Lucide** icon set exclusively — 1.5px stroke, 16px inline / 20px nav-and-buttons, `currentColor`. No filled/outline mixing, no second icon pack, and — kill list — **no emoji anywhere in UI chrome** (emoji typed by users inside message content renders as content). Every icon that conveys state is paired with text or an accessible label (§18.3).

---

## 9. Buttons

| Variant | Fill / border | Label | Use |
|---|---|---|---|
| **Primary** | `action/primary` fill | white (light) / `#0A1428` (dark) | The one obvious action per screen ("toddler simple" rule). Also Approve & send |
| **Secondary** | transparent, `border/strong` 1px | `text/primary` | Peer actions ("Edit then send", "Export") |
| **Ghost** | transparent, no border | `text/secondary` | Tertiary, table row actions, "Not now" |
| **Destructive** | transparent, `border/strong`; fill `status/critical` fg only inside a confirm dialog | `status/critical` fg | Delete/suppress. Never a red button sitting idle on a page |
| **AI-inline** | `ai/bg` fill, `ai/border` | `ai/fg` | Only inside AI cards ("Show why", "Regenerate") — never for user-initiated actions |

Sizes: `md` 32px height / 12px padding-x (default everywhere), `lg` 36px (page-level primary only), `sm` 28px (dense table rows). Radius `radius/sm`. Icon+label gap 6px. Disabled = 45% opacity + `not-allowed` cursor + reason on tooltip (a disabled button must always explain itself — QA critical-fail: scary/vague blocks). Loading = spinner replaces icon, label stays, width locked (no layout jump). Focus: 2px ring `action/primary` at 2px offset (§18.2).

One primary button per viewport. If a screen seems to need two, the screen is wrong — escalate to design, don't add the button.

---

## 10. Cards

- Anatomy: `bg/surface`, `border/subtle` 1px, `radius/md`, `space/4` padding (16px; `space/3` for dense stat tiles). Title `type/h3` with optional right-aligned meta; body; optional footer separated by `border/subtle`.
- **Stat tile** (Today, Intelligence): label `type/label` `text/muted` → value `type/metric-lg` tabular → delta line `type/small` with `status/*` fg + arrow icon. No sparkline in v1 tiles.
- **Loan card** (board): §12.1.
- **AI card**: §15 — visually distinct from all other cards by `ai/border` + violet glyph, and the *only* tinted card in the system.
- Cards never nest more than one level. Cards are not buttons; if the whole card is clickable, the title is the link and the hover state is `bg/raised`.

---

## 11. Tables

The workhorse of Pipeline, People, Partners, and Intelligence.

- Container: `bg/surface`, `radius/md`, `border/subtle`; header row sticky (`bg/raised`), `type/label` `text/muted`, sortable columns get chevrons on hover and persist sort per saved view.
- Rows: 40px default / 32px compact (user toggle, persisted). Hover `bg/raised`; row click opens the record; row actions appear on hover as `sm` ghost buttons, always also reachable via overflow menu (keyboard/touch parity).
- **Urgency rail:** a 3px left border on each row in the row's `status/*` fg color when status ≥ warning; healthy/neutral rows get no rail. This is the scan line for a 60-loan book.
- Numerals right-aligned tabular; text left-aligned; status chips own a column, never mixed into name cells.
- Selection: leading checkbox column appears on hover/first selection; bulk bar slides over the header showing count + allowed bulk actions (bulk rules in §16).
- Empty/loading/error states per §14. Pagination: none for < 200 rows (virtualized scroll + sticky header); server pagination beyond, with "1–50 of 312" tabular counter.
- Freshness: any table backed by async data shows "Updated 2m ago · Refresh" in the toolbar (QA critical-fail: user can't tell if data is current).

---

## 12. Pipeline — board and table views

One dataset, two projections, toggle top-right (persisted per user). Both obey the 20-stage / 5-phase model (D-06).

### 12.1 Board view

- **5 columns = macro-phases** (ENGAGE · QUALIFY · TRANSACT · RETAIN · GROW), never 20 columns. Column header: phase name `type/label`, loan count + total volume `type/metric-md` tabular (e.g. "TRANSACT · 14 · $6.2M"). No phase hue (§4.4) — urgency is the only color on the board.
- Within a column, cards group under slim stage sub-headers (e.g. "Conditional Approval · 3") in stage order; sub-groups collapse. Default sort inside a stage: urgency desc, then days-in-stage desc.
- **Loan card** (fixed anatomy, ~84px, `space/3` padding): line 1 — borrower name `body-strong` + amount `body` tabular right; line 2 — program + purpose `small` `text/muted` (e.g. "Conv 30-yr · Purchase"); line 3 — stage chip + urgency chip ("Lock 41h" / "Stalled 6d") + owner avatar 20px right; a violet AI dot on the top-right when a prepared action awaits approval, opening the AI panel on click. Left urgency rail 3px, same rule as tables.
- Drag between stages is allowed **within** a phase; dragging across a phase boundary or into a gated stage (e.g. into Funded) opens the Advance-stage dialog listing unfinished checklist items (CRM tasks and follow-ups, not loan conditions) instead of silently moving — stage moves are CRM events with audit trail, not cosmetic repositioning.
- Board is virtualized; 200+ loans must scroll at 60fps.

### 12.2 Table view

Default columns: Borrower · Loan (program/purpose) · Amount · **Stage** (chip with days-in-stage) · **Urgency** (chip) · Next action (from AI/task engine, plain language) · Owner · Last activity. Column picker + saved views ("My locks expiring", "Team TRANSACT"). Group-by-stage renders sticky group headers with count + volume subtotals. Everything else per §11.

### 12.3 Stage stepper (record header)

On the Loan record: 5 phase segments with the 20 stages as dots inside the active phase; completed = filled `text/secondary`, current = `action/primary` ring + label, future = `border/strong` outline. Never green — completion is structure, urgency is color. Hover any dot: stage name + entry date. The stepper is display + navigation; advancing happens only via the **Advance stage** primary action with its checklist dialog.

---

## 13. Alerts, banners, toasts

| Pattern | Placement | Use | Rules |
|---|---|---|---|
| **Inline alert** | Inside cards/forms, `radius/sm`, status bg tint + fg text + icon | Contextual state ("Docs-needed follow-up open for 2 days") | Always includes the next step as a link/button; dismissible only if purely informational |
| **Page banner** | Full-width under top bar | Cross-cutting state (workspace in view-as mode · sync degraded · compliance hold) | Max one visible; queue by severity; critical banners are not dismissible while the condition holds |
| **Toast** | Bottom-right, 4s (8s with action), max 3 stacked | Confirmations ("Email approved & queued · Undo") | Never for errors that need decisions; always `aria-live="polite"`; undo offered wherever the action is reversible (CANON: reversible where possible) |
| **Confirm dialog** | Modal `radius/lg` | Destructive/irreversible acts (suppress automation for contact, delete note, send to 200 recipients) | States exact scope and count in the body ("Send 'Rate update' to 213 contacts in Past clients"); destructive confirm button is the only red-filled button in the system; type-to-confirm only for tenant-level deletions |

No blocking full-screen "success" interstitials, ever.

---

## 14. Empty, loading, error, and save states

These are specified because the QA scorecard makes them critical-fail conditions ([[QA_Plan]]: save-state ambiguity, stale data, vague blocks).

**Empty states** — teach, then offer one action:
- Anatomy: 20px Lucide icon in a `bg/sunken` circle (48px), one-line headline (what this screen will show), one-line body (how it fills), one primary button. Max width 360px, centered, `space/12` padding.
- Copy pattern: "No loans in TRANSACT yet. When a file goes under contract, it lands here with its milestones. → Add a loan". Never "Nothing here!", never an illustration set, never emoji.
- First-run vs. filtered-empty are different states: filtered-empty says "No results for these filters → Clear filters".

**Loading** — skeletons, not spinners:
- Every list/table/card region renders a skeleton matching its real layout (rows of the real height, shimmer at 1.2s). Full-page spinners are banned; the chrome (nav, top bar) renders immediately.
- Regions load independently — a slow Intelligence tile never blocks Today's task list.
- Anything cached shows data immediately + "Updated Xm ago"; background refresh swaps in place without layout shift.

**Errors** — what happened, what to do, who to call:
- Inline region error: icon + "Couldn't load conversations" + cause in plain words if known ("Connection timed out") + **Retry** button + reference code (`REF-7F3A2`) in `text/muted` for support. Never a raw stack trace, never "Error 500".
- Form errors: §17. Global failure page: same anatomy + link to status/support.
- Errors never lose user input: composer and form drafts persist locally through failures.

**Save states** — always explicit:
- Editable surfaces show one of three states near the edited region: "Saving…" (muted) → "Saved · 2:14 PM" (muted, timestamp) → "Couldn't save — Retry" (`status/critical` fg). Autosave on blur for notes/drafts; explicit Save button for records with validation. A user must never wonder whether their work saved (SCN-EDGE-001).

---

## 15. AI UI language — one card, everywhere

AI is ambient (D-04) but visually singular: **every AI recommendation, draft, or prepared action in the product renders as the same AI card**, whether it appears on Today, a record's right rail, the composer, the approval queue, Marketing, or Automations. Users learn the pattern once.

### 15.1 AI card anatomy (fixed, top to bottom)

1. **Header row:** AI glyph (violet spark, 16px — the only place violet iconography exists) + label "AI" `type/label` `ai/fg` + category tag (Draft email · Next best action · Risk flag · Stage suggestion) + **confidence chip** right-aligned (§15.3).
2. **Headline:** the recommendation in one plain sentence, `body-strong`. "Send Kim Tran the appraisal-received update." Verbs first; no hedging filler; no exclamation.
3. **Payload:** the prepared thing, fully rendered — email/SMS draft in a `bg/sunken` well with recipient + language chip (EN/VI) + template ID (`EMT-032`), or the proposed action stated exactly ("Move to Conditional Approval").
4. **Why row:** "Why:" + one-line rationale + **evidence chips** linking to the exact records it drew from ("Appraisal received 2:03 PM" · "Stage: Processing, day 9" · "Template EMT-032"). Every claim inspectable in one click — the scorecard's *source evidence clarity* requirement.
5. **Action row:** **Approve & send** (primary) · **Edit** (secondary) · **Dismiss** (ghost, opens reason menu: Not now / Wrong suggestion / Never for this contact). Labels adapt to payload ("Approve & advance" for a stage move) but always three verdicts in this order.
6. **Footer (after any verdict):** audit line, `type/small` `text/muted`: "Prepared by AI · Approved by Jeremy McDonald · Apr 3, 2:14 PM" (or "· Edited, then approved" with a diff link). Every AI action is attributable — CANON, verbatim.

Card styling: `ai/bg` fill, `ai/border`, `radius/md` — the only tinted card in the system, so AI-prepared content is unmistakable at a glance and can never impersonate a system fact or a human note.

### 15.2 AI card states

| State | Rendering |
|---|---|
| Prepared | Full card, actions live |
| Approved / executing | Actions collapse to footer audit line + toast with Undo where reversible |
| Edited | "Edited" tag + diff view accessible; approval applies to the edited version |
| Dismissed | Collapses to a single muted line ("Dismissed — wrong suggestion"), recoverable for 30 days from the record History |
| Expired | If the trigger invalidates (borrower replied, stage advanced — the framework's stop conditions), the card self-retires with an explanatory line; it never sends stale content |
| Low data | If AI can't ground a suggestion, it says so plainly ("Not enough activity to suggest a next step") — it never pads |

### 15.3 Confidence — words with reasons, never percentages

Confidence chip values: **High · Medium · Low**, `type/label` in `ai/fg` on `ai/bg`. Hover/tap reveals the drivers in plain language ("High: exact trigger match, all merge fields verified, Fully-Automated template class"). Rules:

- Never a percentage or score — false precision breeds the AI-OVERTRUST failure mode the QA framework flags.
- Low-confidence cards sort below high, never appear in bulk approval, and default their primary action to **Edit** instead of Approve.
- Confidence drivers must be real documented factors (fair-lending-safe, per D-11), listable in the audit trail.

### 15.4 Placement rules

- Today: AI cards in the "Review" lane, max 5 visible, "View all in Approvals" beyond.
- Records: right-rail AI panel holds at most the top 2 cards + next-best-action line.
- Composer: AI drafts appear *in* the composer as pre-filled content with the AI header attached — editing there is the Edit verdict.
- AI never interrupts: no modals, no popups, no unsolicited chat bubbles. Cards wait; they don't chase. The only proactive surface is the morning briefing block on Today.
- Chat/ask-AI (⌘K natural-language) answers render with the same header + evidence-chip pattern inline in the palette.

---

## 16. Approval controls

The physical form of "AI prepares, the human approves" (D-05), consistent with [[Information_Architecture]] §3.3:

- **Queue rows** are compact AI cards (payload collapsed to subject/preview, expandable). Keyboard-first: `J/K` move, `A` approve, `E` edit, `N` not-now, `⏎` expand. Hit-through rate matters more here than anywhere; every control ≥ 24px hit target.
- **Bulk approve** exists *only* for identical-template, Fully-Automated-class items (the 44-template class in the communication framework), shows the full recipient list first with per-row exclusion checkboxes, and is capped at 50 per action.
- **Sensitive categories** (rate lock, cash-to-close, payment change, closing delay, adverse outcomes, problem files) render with a `status/critical` "Review required" tag, can never be bulk items, and require the payload fully expanded before Approve enables.
- Every verdict writes user, timestamp, verdict, and diff-if-edited to the audit trail; the History tab renders these with the §15.1 footer format.
- Approvals icon in the top bar shows count; the count includes nothing the user lacks permission to act on (IA notification rule).

---

## 17. Forms

- Labels **above** inputs, `type/label` `text/secondary`; never placeholder-as-label. Optional fields marked "(optional)" — required is the default and unmarked.
- Inputs: 36px height, `bg/sunken` fill, `border/strong` 1px, `radius/sm`, `body` text; focus = `action/primary` border + ring; help text `type/small` `text/muted` below.
- Validation: on blur per field, on submit for the form; error = `status/critical` border + icon + specific message below the field ("Enter a phone number with area code" — never "Invalid input"). Error summary with anchor links at top for forms > 6 fields. Submit stays enabled; clicking it focuses the first error.
- Layout: single column, `space/4` between fields, related fields grouped under `h3` section heads; two-column only for tight pairs (City/State/ZIP). Max form width 560px.
- Mortgage-native inputs ship as system components: currency (auto-formats tabular with `$` prefix), percentage/rate (3-decimal), phone (US mask), NMLS ID, date with relative hints ("in 12 days"), **language preference** selector (EN/VI first, per D-08), and consent chips (email/SMS consent status rendered beside contact fields, `status/*` colored, never editable inline without the consent dialog).
- Selects and comboboxes are searchable past 7 options. Destructive selects (e.g. "Mark withdrawn") confirm per §13.

---

## 18. Accessibility standards (ship gates, not aspirations)

1. **WCAG 2.2 AA minimum** across both themes; contrast rules per §4.5 with CI enforcement.
2. **Focus visible always:** 2px `action/primary` ring, 2px offset, on every interactive element; never `outline: none` without replacement; logical tab order; focus trapped in modals and returned on close.
3. **Never color-only:** every status pairing has icon + text; urgency rails are always accompanied by a chip; charts use direct labeling, not legend-color-matching alone.
4. **Keyboard complete:** every flow (including board drag — via a "Move to stage…" menu equivalent, approval verdicts, table row actions) is operable without a pointer. ⌘K palette reaches everything.
5. **Hit targets:** ≥ 24×24px on desktop layouts, ≥ 44×44px on mobile-browser layouts.
6. **Language & script:** `lang` attributes switch per-content-language (VI content marked `vi`) so screen readers pronounce correctly; layouts tolerate diacritics (no clipped line-heights — 1.5+ line-height on VI-capable strings) and 30% expansion; dates/numbers localize with the UI language.
7. **Motion:** all animation ≤ 200ms ease-out, purposeful (state change, not delight); `prefers-reduced-motion` disables shimmer, slide, and board drag animations.
8. **Live regions:** toasts `aria-live="polite"`; critical banners `assertive`; approval count changes announced.
9. Screen-reader labels specified per component in build tickets (stage stepper announces "Stage 13 of 20, Conditional Approval, day 4"; urgency chip announces its full text).
10. Zoom to 200% loses no content or function (density modes reflow, never truncate).

---

## 19. Responsive web — mobile-browser behavior

Loan Factory CRM is one responsive web application; there is no native app, and these mobile-browser layouts are a Phase 1 requirement, not an add-on. On phone-sized browsers the CRM is the between-appointments companion (IA §3.5) — same tokens, adjusted density:

- **Bottom tab bar:** Today · Pipeline · Conversations · People · More (56px, labels always visible, approval count badges on Today).
- Base type stays 14px; row heights rise to 48px; touch targets 44px; page gutter `space/4`.
- **Pipeline:** board becomes a phase-segmented list (horizontal phase selector + stage-grouped loan cards); no drag on mobile — stage moves via the Advance dialog only.
- **Tables** collapse to list cards: each row renders its primary column as title, 2–3 key columns as meta lines, urgency rail preserved; column pickers hidden.
- **AI cards** render full-width with the same fixed anatomy; Approve & send requires one deliberate tap (no swipe-to-approve — approving borrower-facing communication is never a gesture).
- Record pages collapse to Header → AI panel → Timeline with facts behind "Details".
- Composer, forms, and approvals all support interruption/resume (mobile-resume edge case is a QA acceptance test). Desktop-only surfaces (automation builder, report builder, workspace admin) render read-only with a "Finish on desktop" note — never a broken editor.

---

## 20. Decisions proposed by this document (for [[Decisions]])

Per CANON, choices made here that weren't already locked, flagged for the log:

| Proposed decision | Rationale |
|---|---|
| UI typeface = Inter (variable, VI subset always loaded); base size 14px | Density target + tabular numerals + proven Vietnamese rendering |
| Violet is reserved exclusively for AI; blue = human action; status hues per §4.4 | Makes AI-prepared content unmistakable and un-impersonatable |
| Sidebar stays graphite in the light theme | Command-center brand constant; orientation anchor |
| Pipeline macro-phases carry no hue; urgency is the only color on the board | Keeps a 60-loan board scannable; protects color-is-meaning |
| Confidence displayed as High/Medium/Low words with inspectable drivers, never percentages | Counters AI-overtrust failure mode from the QA framework |
| Approve actions use primary blue, not green; green is status-only | Approving is acting; preserves status semantics |
| Icon set = Lucide only, 1.5px stroke | One consistent system replacing emoji-UI |
| Skeletons mandatory, full-page spinners banned; explicit save states on all editable surfaces | QA critical-fail conditions turned into system rules |
| Contrast checked in CI for both themes as a build gate | Makes AA enforceable, not aspirational |

Related: [[Information_Architecture]] · [[PRD]] · [[Vision]] · [[Current_State_Audit]] · [[Decisions]] · [[QA_Plan]] · [[Screen_Specifications]] · [[Technical_Architecture]]
