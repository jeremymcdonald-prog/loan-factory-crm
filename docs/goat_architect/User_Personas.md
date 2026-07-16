# User_Personas

Purpose: this document distills the 111 TERA+ usability personas (source: `_product_discovery/ai_personas/ai-personas-master/`, verified counts in the discovery analysis) into the **7 primary product personas** for Loan Factory CRM, locked in [[Vision]] and the product canon — plus a source-material profile of the borrower, who is a **CRM contact, never a product user**. Each persona defines who the CRM must serve, the full tech-comfort spectrum inside that role, their daily jobs, their pains with today's tools, exactly what the Today screen must show them, the Ally moments that win their loyalty, measurable success criteria tied to the TERA+ usability scorecard, and a mapping back to TERA+ persona IDs and scenario families so [[QA_Plan]] can reuse the existing 259 test scenarios instead of writing new ones. Two personas the source pack does not cover (Branch Leader, Agent Relationship Manager) are authored here from adjacent evidence and flagged as hypotheses to validate with Jeremy's team.

Related: [[PRD]] · [[Screen_Specifications]] · [[Mortgage_Workflow_Map]] · [[AI_Product_Architecture]] · [[QA_Plan]] · [[Design_System]] · [[Mortgage_Compliance]] · [[Open_Issues]]

---

## How to read this document

- **Every persona is a spectrum, not a point.** The TERA+ pack's most important finding is that tech comfort varies enormously *within* every role — a brand-new not-tech-savvy LO (Maria Carter) and a veteran power user (Priya Shah) are both "Loan Officers." Each persona below states its spectrum and names the anchor personas at each end. Design for the low-tech end; never cap the high-tech end.
- **The ship gate is the not-tech-savvy (NTS) user.** Per the TERA+ scorecard, every workflow has a friction threshold for NTS users (1–5 scale, lower is better). We adopt that rule: **a screen ships when its NTS threshold passes.** This is the canon "toddler simple" standard made falsifiable. Thresholds are quoted per persona below.
- **TERA+ IDs are preserved for QA reuse.** IDs follow `ROLE-[LANG-]LEVEL-TECH-##` (e.g. `LO-VI-VET-NTS-05`); scenarios follow `SCN-<persona>-<functional area>`. Most of the 259 scenarios port to Loan Factory CRM with a terminology remap only (TERA-DASH→Today, TERA-STATUS→Pipeline, TERA-COMMS→Conversations, TERA-AI→Ally). Scenarios that exercise loan work the CRM does not perform — document upload mechanics, condition clearing, borrower portal flows — either port as **communication-QA scenarios** (does the message the team sends make sense to this persona?) or retire; the crosswalk tables below mark them. Treat all personas as **hypotheses authored by AI, to be validated against real Loan Factory staff** — not field research.
- **Ally's contract applies to every persona:** Ally prepares, the human approves. Each "Ally moments" list below contains only draft/flag/prioritize behaviors — nothing sends autonomously.

## The 7 product personas at a glance

| # | Persona | Role in the loan | Primary surface | Tech spectrum | TERA+ coverage |
|---|---|---|---|---|---|
| 1 | **The Producer** — Loan Officer | Owns the borrower relationship and the deal | Today, Pipeline, Conversations | Very wide: NTS veteran → TS power user | Strong: 6 EN + 24 multilingual LO personas |
| 2 | **The Right Hand** — LO Assistant | Keeps follow-up moving for one or more LOs | Today (task view), People, Conversations | Wide | Strong: 4 EN + 16 multilingual "Loan Coordinator" personas |
| 3 | **The File Guardian** — Processing/Ops | Keeps file status true and every chase moving | Pipeline (ops queue), Today | Wide | Strong: 4 EN + 16 multilingual Processor personas |
| 4 | **The Player-Coach** — Team Leader | Watches team pipeline, coaches LOs, unblocks files | Team, Intelligence, Today | Wide (explicitly includes NTS leaders) | Adequate: 2 personas + coaching personas |
| 5 | **The Franchise Builder** — Branch Leader | Multi-team production, recruiting, risk | Intelligence, Team | Moderate–high | **Gap — authored here** (composite) |
| 6 | **The Rainmaker's Rainmaker** — Agent Relationship Manager | Grows and protects Realtor referral relationships | Partners, Today | Moderate–high | **Gap — authored here**; the 12 REA personas define who they manage |
| 7 | **The Brand Keeper** — Marketing Coordinator | Produces compliant content and campaigns at scale | Marketing, Automations | Moderate–high | Strong: 2 marketing + 2 compliance personas |

**Borrowers are CRM contacts, not product users.** They never log into Loan Factory CRM; they experience it only through the communications the loan team sends. The TERA+ pack's 15 borrower personas remain in this document — see [[#The Borrower — CRM contact, not a product persona]] — purely as source material for designing communication content and for QA of outbound messages.

---

## Persona 1 — The Producer (Loan Officer)

**The primary persona. When trade-offs collide, the Producer wins.**

### Profile

Commission-paid originator living on referrals and follow-up speed. May be brand new (learning what a 1003 even is), mid-career juggling 15–25 active files, or a 20-year veteran with deep relationships who considers software a tax on their time. At Loan Factory, a large share are Vietnamese-first bilingual LOs serving Vietnamese-speaking borrowers (see [[#Multilingual considerations]]). Works from phone between appointments as much as from a desk.

### Tech comfort spectrum

| End of spectrum | Anchor personas | What they sound like |
|---|---|---|
| Low (NTS) | Maria Carter (LO-NEW-NTS-01), Robert Mitchell (LO-VET-NTS-05), Hoa Vo (LO-VI-VET-NTS-05) | "Just tell me what to click next and show me that I did it right." / "I know mortgages. I just need the software to stay out of my way." |
| High (TS) | Jordan Lee (LO-NEW-TS-02), Ethan Brooks (LO-MID-TS-04), Priya Shah (LO-VET-TS-06), Bao Huynh (LO-VI-VET-TS-06) | "I want the system to show me the file story in one place, then let me act fast." / "Give me a fast path, but make sure it does not break the ops team downstream." |

Design consequence: one obvious primary action per screen for the NTS end; keyboard flows, dense filters, bulk visibility, and full audit history for the TS end — present but never dominant.

### Daily jobs-to-be-done

1. Know, within 60 seconds of opening the app, which files and leads need action **today** — and in what order.
2. Capture a new lead fast (from call, referral, Facebook lead tagged "Automatically Created," QM Pricer alert, or website widget) without duplicating an existing contact.
3. Keep every borrower moving toward the next lifecycle stage through timely communication: the consultation booked, the application nudged along, docs-needed reminders sent, milestone news delivered — with the stage facts kept current on the CRM record so the whole team sees true status.
4. Answer "where is my file?" — from a borrower or Realtor — in one lookup, in language safe to repeat.
5. Send the right message at the right stage without writing it from scratch or saying something non-compliant.
6. Keep past clients warm: birthdays, anniversaries, annual reviews, refi opportunities.

### Top pains with current tools

- No pipeline at all in the existing prototype — the LO must remember what matters; the tool is email-only.
- Too many tabs and systems; the same borrower data re-entered in multiple places (DUPLICATE-DATA is a named TERA+ risk tag for a reason).
- Acronyms without explanation (AUS, DTI, LE) — terrifying for new LOs, alienating for Vietnamese-first LOs.
- Cannot tell if work saved, if data is current, or who owns the next follow-up.
- Notification noise: many alert types, no urgency ranking, urgent items dismissed by accident.
- Fear of the tool: "fear of deleting or changing the wrong thing" (Maria) — the single biggest adoption killer for NTS users.

### What Today must show them

| Slot | Content | Why |
|---|---|---|
| Top | **Daily briefing** — plain-language, 3–5 lines: what changed overnight, what's at risk, what wins are close | Answers "what matters now" before any hunting |
| Priority queue | Ranked next actions with **reason attached** ("Rate lock on Nguyen expires Friday" · "New lead from Facebook, 12 min old, untouched") | The scorecard's leadership question — "Does the dashboard show the next right action, or is it another place to hunt?" — is this persona's pass/fail |
| Urgency strip | Files in danger: expiring locks, stalled stages, closing-week blockers | Sourced from the 13 TERA+ stress scenarios (SCN-STRESS-*) |
| Approval queue | Ally drafts waiting for one-tap approve/edit/dismiss | Ally prepares, the Producer approves |
| Pipeline pulse | Counts per macro-phase (Engage/Qualify/Transact/Retain/Grow) with deltas | Orientation, not analytics |

Every item: clear owner, timestamp, and freshness indicator (STALE-DATA is a critical-fail condition).

### Ally moments that win them over

1. **Morning briefing that's actually right** — names the file at risk before the LO remembered it.
2. **New-lead first touch in 30 seconds:** lead arrives, Ally has a compliant intro draft (from the EMT template library) ready with merge fields filled — one tap to approve.
3. **"Where is my file?" answered:** Ally assembles a privacy-safe status summary the LO can read to a borrower or forward to a Realtor without checking three screens.
4. **Stage-change follow-through:** the team marks a file Conditional Approval → Ally drafts a plain-language borrower note explaining what that stage means and what the team still needs, queued for approval.
5. **Refi radar:** Ally flags a funded client whose rate context has changed (stage 19 Refinance Opportunity) with a Manual-Only review task — never an auto-send.
6. **Bilingual drafting:** for a Vietnamese-preference contact, Ally drafts in Vietnamese with correct diacriticals and mortgage terms kept precise (see multilingual section).

### Success metrics

| Metric | Target | Source |
|---|---|---|
| Dashboard (Today) friction | ≤ 2.0 TS / ≤ 2.75 NTS | TERA+ scorecard threshold |
| Lead creation friction | ≤ 2.0 TS / ≤ 2.5 NTS; zero unrecoverable duplicates | Scorecard + critical-fail list |
| Notes/communication friction | ≤ 2.0 TS / ≤ 2.5 NTS; user always distinguishes internal note from outbound message | Scorecard red flag |
| Time to first touch on a new lead | Measurably down vs. baseline (instrument from day 1) | Product metric |
| % of Ally drafts approved without edit | Trending up; edits captured as learning signal | Ally quality metric |
| Adoption proxy | Veteran NTS LO completes daily routine without calling ops for navigation | LO-VET-NTS-05 success criteria |

### TERA+ mapping for QA reuse

| Persona slice | TERA+ persona IDs | Scenario families |
|---|---|---|
| New LO, low tech | LO-NEW-NTS-01 (Maria Carter) | SCN-LO-NEW-NTS-* rows in 04; SCN-STRESS-013 (overwhelmed new LO) |
| New LO, high tech | LO-NEW-TS-02 (Jordan Lee) | SCN-LO-NEW-TS-*; duplicate-prevention edges |
| Mid LO | LO-MID-NTS-03 (Denise Parker), LO-MID-TS-04 (Ethan Brooks) | SCN-LO-MID-*; follow-up-ownership scenarios (ported from the condition-ownership rows, remapped to CRM tasks) |
| Veteran LO | LO-VET-NTS-05 (Robert Mitchell), LO-VET-TS-06 (Priya Shah) | SCN-LO-VET-*; SCN-HV-001 (25-file prioritization); SCN-STRESS-012 (high-volume LO) |
| Vietnamese-first LO | LO-VI-NEW-NTS-01 (Linh Tran), LO-VI-NEW-TS-02 (Minh Nguyen), LO-VI-MID-NTS-03 (An Pham), LO-VI-MID-TS-04 (Quang Le), LO-VI-VET-NTS-05 (Hoa Vo), LO-VI-VET-TS-06 (Bao Huynh) | Same functional rows executed in Vietnamese UI/content; translation-ready guidance edge case (SCN-EDGE-014) |
| Other languages | LO-ZH-*, LO-ES-*, LO-RU-* (6 each) | Localization regression suite |
| Ally acceptance | — | SCN-AI-009 (lead prioritization explainability), SCN-AI-005 (borrower update draft) |

---

## Persona 2 — The Right Hand (LO Assistant)

### Profile

Maps to TERA+'s "Loan Coordinator." Supports one to several LOs: chases applications and documents, keeps follow-up organized, preps clean handoffs to processing, and shields the LO from admin work. The defining trait in every source persona is **role-boundary anxiety**: they want to help aggressively but are afraid of stepping outside their lane — updating a status they shouldn't, or seeing something they're not permitted to.

### Tech comfort spectrum

Low end: Hannah Flores (LC-NEW-NTS-01) — "I want to help the LO, but I need the system to tell me what I am allowed to do." High end: Nina Patel (LC-EXP-TS-04) — "I need a command center for follow-up, not another place to copy the same update." Middle: Angela Reed (LC-EXP-NTS-03), who will abandon side spreadsheets only "if I can trust the reminders."

### Daily jobs-to-be-done

1. Work a follow-up queue across multiple LOs' files without anything falling through.
2. Keep every docs-needed follow-up moving: know which files still carry the flag, when the last nudge went out, and when to escalate. (The documents themselves live in the LOS/POS — the CRM tracks the *communication*, not the paperwork.)
3. Complete clean handoffs to processing — and *know* the handoff is complete.
4. Draft routine borrower nudges (application incomplete, documents outstanding) for approval.
5. Stay inside role permissions without hitting scary, unexplained blocks.

### Top pains with current tools

- Side trackers: the system can't be trusted, so they maintain a parallel spreadsheet (Sandra/Angela pattern) — the #1 sign of product failure for this persona.
- Vague permission blocks with no explanation of who *does* own the action.
- No confirmation after updates; unclear save states.
- Duplicate data entry between LO notes, their tracker, and the system of record.
- Not knowing whether a handoff landed or evaporated.

### What Today must show them

- **Cross-LO task queue** grouped by urgency, then by LO — with explicit owner on every item.
- **Docs-needed follow-up view:** every file the team has flagged docs-needed, with age of the flag, last-nudge timestamp, and a ready-to-approve reminder draft — a communication tracker, not a document repository.
- **Handoff tracker:** files staged for processing, with an open-task completeness check and an explicit "handoff accepted" state.
- **Role-safe action affordances:** actions outside their permission render as *routed requests* ("Ask Denise to approve stage change"), never dead-end blocks. This is a TERA+ critical-fail condition turned into a design mandate.
- Ally-drafted follow-up nudges awaiting their (or the LO's, per permission config) approval.

### Ally moments that win them over

1. **The trusted reminder:** Ally surfaces "3 docs-needed follow-ups open > 48h" with one-tap re-request drafts (EMT document-collection communication templates) — the moment Angela deletes her spreadsheet.
2. **Handoff pre-flight:** before routing to processing, Ally lists what's still unresolved on the CRM record — open tasks, a docs-needed flag still set, unanswered borrower nudges — so handoffs stop ping-ponging.
3. **Lane guardian:** when they attempt an out-of-scope action, Ally explains who owns it and drafts the handoff message instead of just blocking.
4. **Note hygiene:** Ally suggests standard-format note structure so processors can trust coordinator notes.

### Success metrics

| Metric | Target |
|---|---|
| Notes/communication friction | ≤ 2.0 TS / ≤ 2.5 NTS |
| Docs-needed follow-up friction | ≤ 2.25 TS / ≤ 2.75 NTS (scorecard documents-workflow threshold, remapped to the CRM's follow-up flow); zero dropped follow-ups in test |
| Permission clarity | Scorecard "role/privacy/permission clarity" = clear; no scary/vague blocks (critical-fail condition) |
| Side-tracker elimination | Experienced coordinator completes a demo week without an external tracker (LC-EXP-NTS-03 success criteria, verbatim from source) |
| Handoff rework | Files bounced back from processing for completeness trending toward zero |

### TERA+ mapping for QA reuse

| Slice | TERA+ IDs | Scenarios |
|---|---|---|
| New assistant | LC-NEW-NTS-01 (Hannah Flores), LC-NEW-TS-02 (Tyler Morgan) | SCN-LC-NEW-*; role-block edge case (SCN-EDGE-002) |
| Experienced assistant | LC-EXP-NTS-03 (Angela Reed), LC-EXP-TS-04 (Nina Patel) | SCN-LC-EXP-*; SCN-HV-003 (busy coordinator queue) |
| Multilingual | LC-VI-*, LC-ZH-*, LC-ES-*, LC-RU-* (4 each) | Localized reruns of the above |

---

## Persona 3 — The File Guardian (Processing/Ops)

### Profile

Maps to TERA+ Processor personas. Owns file quality from application intake through closing: document audit, condition clearing, status integrity, lender-ready packaging — all of which happens **in the LOS, not in the CRM, and always will**. Loan Factory CRM is not an LOS: what it gives this persona is the relationship-and-communication layer around that work — pipeline stage visibility, a prioritized queue, tasks, notes, activity history, and drafted chase communications. Stage and milestone facts are entered by the team in v1 and may later sync read-only from the LOS via future integrations. Measured in clean files and cleared conditions, not relationships. Deeply allergic to tools that slow proven workflows or lack audit trails.

### Tech comfort spectrum

Low end: Olivia Grant (PR-NEW-NTS-01) — "make the checklist obvious"; Sandra Hill (PR-EXP-NTS-03) — "I will use it if it makes the file cleaner and does not make me do the work twice." High end: Caleb Nguyen (PR-EXP-TS-04) — "Give me clean queues, clean ownership, and clean history. I can handle the rest."

### Daily jobs-to-be-done

1. Work a prioritized queue of files by urgency (closing date, stage age, lock expiration).
2. Keep the CRM's stage and milestone facts current on every file so the LO, assistant, and leadership see true status without calling ops.
3. Chase what's outstanding through communication: send docs-needed reminders to borrowers and follow-ups to third parties, and log every response. (Auditing documents and clearing conditions happens in the LOS.)
4. Keep the CRM's notes and activity history immaculate so anyone can reconstruct the relationship story of the file.
5. Escalate blockers to the right owner fast (LO, borrower, third party).

### Top pains with current tools

- File status scattered across systems; no single place where the story of a file is current, so everyone asks ops.
- Missing audit trails; edits with no history; "did that save?"
- Duplicate manual tracking forced by unreliable systems.
- Notification noise burying the one alert that matters on a Friday-afternoon closing.
- New software that renames everything they know without a side-by-side bridge.

### What Today must show them

- **Ops queue:** files ranked by closing date proximity, stage age, and blocker severity — high-volume usable (SCN-HV-002 is the acceptance test).
- **Outstanding-chase board:** files flagged docs-needed or awaiting a third party, with owner, flag age, and last-nudge timestamp; borrower-facing vs. internal communication clearly separated.
- **Stage-freshness view:** which files' stage/milestone facts were updated recently vs. going stale — so the record everyone reads can be trusted.
- **Escalations & stop-conditions:** items where an automation stopped or a reminder needs human judgment ("Notify assigned LO and operations owner" per the communication framework's escalation rule).
- Freshness timestamps on everything.

### Ally moments that win them over

1. **Docs-needed drafts:** when the processor flags a file docs-needed and notes what's outstanding, Ally turns that note into a plain-language borrower follow-up — draft only, with the source note linked (SCN-AI-004's contract, remapped from condition summarization to communication drafting).
2. **Note-to-update drafts:** Ally turns a processor's shorthand status note into a privacy-safe update the LO or ARM can forward — the "where is my file?" answer, pre-written.
3. **Queue triage:** "These 3 of your 22 files can slip this week's closing" with the reason chain visible.
4. **Third-party chase drafts:** processor-voiced follow-ups to title/insurance (EMT-052–056) prepared and queued for approval.

### Success metrics

| Metric | Target |
|---|---|
| Chase/follow-up friction | ≤ 2.25 TS / ≤ 2.75 NTS (scorecard conditions/documents thresholds, remapped to the CRM's chase-communication flow); zero dropped chases in test |
| Stage-update friction | ≤ 2.25 TS / ≤ 2.75 NTS; a stage/milestone fact takes seconds to record, never minutes |
| Source-evidence clarity | Scorecard field = "clear" — the activity trail behind any status is findable without help |
| Parallel-tracking elimination | Experienced NTS processor trusts the system without a side spreadsheet (PR-EXP-NTS-03 success criteria) |
| High-volume usability | SCN-HV-002 passes: urgent file never missed in a full queue |

### TERA+ mapping for QA reuse

| Slice | TERA+ IDs | Scenarios |
|---|---|---|
| New processor | PR-NEW-NTS-01 (Olivia Grant), PR-NEW-TS-02 (Marcus Rivera) | SCN-PR-NEW-* |
| Experienced processor | PR-EXP-NTS-03 (Sandra Hill), PR-EXP-TS-04 (Caleb Nguyen) | SCN-PR-EXP-*; SCN-HV-002; SCN-STRESS-001 (Friday closing blocker), -002 (wrong docs), -010 (missing condition) |
| Multilingual | PR-VI-*, PR-ZH-*, PR-ES-*, PR-RU-* (4 each) | Localized reruns |
| Out of product scope | Underwriter (IB-UW-05/06), Disclosure Specialist (IB-DS-07/08) | Their work lives in the LOS, which the CRM does not replace; retain the personas only as source material for QA of loan-fact-triggered communications |

---

## Persona 4 — The Player-Coach (Team Leader)

### Profile

Runs a team of LOs — often still originating themselves. Splits attention between their own pipeline and the team's: spotting stuck files, coaching the right LO at the right moment, escalating what needs leadership. Loan Factory's team model (language/region/niche teams per the team marketing knowledge pack) makes this persona structurally important: team leaders own team branding, newsletters, and approval workflows too.

### Tech comfort spectrum

Explicitly wide — the source pack deliberately includes an NTS team leader. High end: Marcus Bennett (IB-TL-TS-01) — "Show me where the team is stuck before it becomes a fire." Low end: Grace Whitman (IB-TL-NTS-02) — "I need the dashboard to tell me who needs help, not make me decode reports." If team analytics require decoding, Grace reverts to asking staff manually and the module fails.

### Daily jobs-to-be-done

1. See team pipeline health in one view: stuck files, at-risk closings, untouched leads per LO.
2. Identify which LO needs help today — including **quiet underperformers**, not just loud problems.
3. Create and track coaching follow-ups distinct from file tasks.
4. Escalate or reassign files with a clean record.
5. Report production upward without exporting to spreadsheets.

### Top pains with current tools

- Shallow dashboards and stale data — "assuming all metrics are current" is a named mistake; freshness must be visible.
- Asking three people for the same status.
- No separation between coaching tasks and file tasks.
- Filter states that hide problems (over-filtering is Marcus's named failure mode; obvious filter-reset is Grace's named need).

### What Today must show them

- **Team risk strip:** top 3 team priorities in plain language ("2 files stuck in Disclosures > 4 days · Kim's new leads untouched 2 days").
- **Their own Producer view** beneath the team layer (player-coach: their personal pipeline doesn't disappear).
- **Coaching queue:** open coaching follow-ups with owner and due date, visually distinct from file tasks.
- **Escalation tracker:** what they escalated, current owner, and age.
- Data-freshness timestamps on every metric (critical-fail condition).

### Ally moments that win them over

1. **Stuck-file radar:** Ally flags files whose stage-time exceeds team norms, with the *why* attached — before the Realtor calls.
2. **Coaching recommendation with receipts:** "Jordan's leads convert to consultation at half the team rate; contact attempts average 1.2 vs team 3.4" — pattern + evidence + suggested action, reviewable per SCN-AI-007; never auto-applied, never generic.
3. **Quiet-underperformer catch:** Ally surfaces the LO who isn't generating alarms but is trending down.
4. **Monday team brief:** drafted team performance summary the leader edits and owns.

### Success metrics

| Metric | Target |
|---|---|
| Team leadership friction | ≤ 2.25 TS / ≤ 2.75 NTS |
| Red-flag avoidance | Never misses a stuck file or wrong LO support need in test (scorecard red flag) |
| NTS acceptance | Grace-profile tester finds top-3 priorities and creates a coaching follow-up unaided (IB-TL-NTS-02 success criteria) |
| Coaching loop | Coaching recommendations reviewed against source data before acting (SCN-AI-007 passes) |
| High-volume | SCN-HV-004 (leader across many LOs) passes |

### TERA+ mapping for QA reuse

| Slice | TERA+ IDs | Scenarios |
|---|---|---|
| Team leader | IB-TL-TS-01 (Marcus Bennett), IB-TL-NTS-02 (Grace Whitman) | SCN-IB-TL-001..005; SCN-HV-004 |
| Coaching layer (Phase 3) | IB-CC-NEWLO-03 (Dana Brooks), IB-CC-GROWTH-04 (Victor Chen) | SCN-AI-007 (coaching recommendation review) |

---

## Persona 5 — The Franchise Builder (Branch Leader)

> **Authored persona — no direct TERA+ source.** Composite of the two team-leader personas scaled up, the BD retention persona (IB-BD-RETENTION-14, Jonah Pierce), and the compliance-policy persona (IB-COMP-POLICY-11, Renee Martin). Flagged in [[Open_Issues]] for validation with Jeremy; QA scenarios must be authored new (reusing SCN-IB-TL-* and SCN-IB-BD-* as starting templates).

### Profile

Runs a branch or multi-team region: several team leaders, dozens of LOs. Rarely touches individual files; lives in aggregates, exceptions, recruiting, and risk. Cares about production trends, LO retention (recruiting an LO costs far more than keeping one), compliance exposure, and whether the branch's marketing and automation footprint is on-brand and in-policy. The person who decides whether Loan Factory CRM rolls out to the whole branch — commercially, the highest-leverage persona in the roster.

### Tech comfort spectrum

Moderate to high, but time-poor: will not learn a complex analytics product. Wants Grace Whitman's plain-language simplicity applied to Marcus Bennett's depth of data. Assume executive-grade patience: three clicks or it didn't happen.

### Daily jobs-to-be-done

1. Scan branch production vs. goal across teams; spot the trend break early.
2. Watch retention risk: which producing LO is disengaging (login decay, pipeline shrink, output drop).
3. Monitor compliance posture: outstanding review items, automation exceptions, audit readiness.
4. Support recruiting: pipeline of candidate LOs, kept strictly separate from borrower data (BD-CONTEXT-MIX is a named TERA+ risk tag).
5. Allocate coaching and marketing resources where they move production.

### Top pains with current tools

- Data assembled by hand from team leaders' verbal reports and spreadsheets — days stale by arrival.
- No early-warning system for LO attrition; resignations arrive as surprises.
- No single view of compliance exposure across teams.
- Metrics without definitions ("what counts as 'active pipeline' here?") — black-box numbers get ignored.

### What Today must show them

- **Branch scoreboard:** funded volume, units, pipeline by macro-phase, per team, with plain-metric definitions on hover and freshness timestamps.
- **Exception list, not dashboards-of-everything:** the 3–5 things outside tolerance this week.
- **Retention watch:** LOs with declining engagement/production signals — explainable factors only, no black-box risk labels (Jonah Pierce's explicit demand: "Do not just show me risk. Show me what support action should happen next.").
- **Compliance summary:** open review items, aging approvals, automation exceptions across the branch.

### Ally moments that win them over

1. **Weekly branch brief drafted:** production, risks, wins, recommended focus — the leader edits and sends; Ally never sends.
2. **Retention early-warning with a suggested support action** routed to the right team leader or coach — no duplicate follow-ups across coaching and leadership (Jonah's named failure mode).
3. **Anomaly explanation:** "Team Saigon's conversion dropped 18% — traceable to lead-source mix change, not LO behavior."
4. **Recruiting research prep:** Ally assembles candidate-facing follow-up drafts, kept fully outside borrower data scope.

### Success metrics

| Metric | Target |
|---|---|
| Time to weekly branch picture | Minutes in-app, replacing hours of assembly |
| Retention signal lead time | Disengagement flagged ≥ 30 days before resignation events (validate the target with Jeremy) |
| BD review friction | ≤ 2.25 TS / ≤ 2.75 NTS; zero candidate/borrower context mixing (scorecard red flag) |
| Metric trust | Every branch metric has a visible definition and freshness stamp |
| Rollout decision proxy | Branch leader can defend a Loan Factory CRM rollout to leadership using only in-app views |

### TERA+ mapping for QA reuse

| Slice | TERA+ IDs | Scenarios |
|---|---|---|
| Nearest sources (composite basis) | IB-TL-TS-01, IB-TL-NTS-02, IB-BD-RETENTION-14 (Jonah Pierce), IB-COMP-POLICY-11 (Renee Martin) | SCN-IB-TL-*, SCN-IB-BD-* as templates; **new branch-level scenarios required** — logged for [[QA_Plan]] |

---

## Persona 6 — The Rainmaker's Rainmaker (Agent Relationship Manager)

> **Authored persona — no direct internal TERA+ source.** The 12 Real Estate Agent personas (REA-01..12) are the *external counterparties* this role manages — agents are Partners contacts, not product users — and are directly reusable to test every agent-facing communication the ARM sends from the CRM. Internal-role behaviors are composed from IB-BD patterns and REA-TEAMLEAD-07. Flagged in [[Open_Issues]] for validation. On many teams this is a hat worn by the LO or team leader, not a separate hire — the Partners module must work for both configurations.

### Profile

Owns the Realtor referral engine: recruiting new agent partners, keeping top referrers warm, making sure every referred buyer's experience makes the agent look good. Works Partners the way an LO works Pipeline. Knows that one top producer like Grant Ellis (REA-TOP-02) is worth dozens of cold contacts, and that the fastest way to lose him is a vague update or a privacy slip.

### Tech comfort spectrum

Moderate to high; field-heavy and mobile-heavy (open houses, broker events, coffee meetings). Needs one-hand phone workflows for logging touches and checking referral status.

### Daily jobs-to-be-done

1. Track every agent relationship: referral volume in/out, last touch, momentum (rising/flat/cooling).
2. Ensure every referred buyer generates proactive, privacy-safe status updates back to the agent — the product feature that retains partners.
3. Run partner nurture: monthly touches, co-branded content requests, open-house support (EMT-057–059 and the realtor playbook content).
4. Recruit new partners with a deliberate pipeline (met → pitched → first referral → active).
5. Protect the privacy wall: agents get milestone/timeline/owner — **never** credit, income, assets, AUS findings, or condition details (the communication framework's Realtor privacy matrix, verbatim).

### Top pains with current tools

- Agent relationships live in the LO's head or phone; when an LO leaves, the referral book leaves too.
- No referral attribution: who sent what, what closed, who's owed gratitude — unmeasured.
- Update requests answered by interrupting the LO or processor for each one.
- No cooling-relationship alarm: a top referrer quietly routes to a competitor and nobody notices for a quarter.

### What Today must show them

- **Partner momentum board:** agents ranked by referral value with trend arrows; cooling top referrers surfaced first.
- **Referred-buyer status roll-up:** every active referred loan with a privacy-safe status the ARM can forward in one tap.
- **Touch queue:** which partners are due contact, with the reason and a drafted opener.
- **Recruiting pipeline:** candidate agents by stage, kept distinct from active partners.

### Ally moments that win them over

1. **Privacy-safe update drafts:** on milestone change, Ally drafts the agent-facing update inside the privacy matrix — approve, personalize, send (SCN-AI-006's exact test).
2. **Cooling alarm:** "Grant Ellis: no referral in 6 weeks vs. a 2/month baseline" plus a suggested re-engagement touch.
3. **Meeting prep card:** referral history, active files, open promises, last conversation — assembled before the coffee meeting.
4. **Co-branded content routing:** agent requests flyer support → Ally drafts the request into the Marketing queue with compliance flags pre-checked.

### Success metrics

| Metric | Target |
|---|---|
| REA communication quality | ≤ 2.25 TS / ≤ 2.75 NTS across all 12 REA personas evaluating the updates and touches the ARM sends from the CRM |
| Privacy wall | Zero PRIVACY-LEAK tags in testing — a leak is an automatic critical fail |
| Speed of answer | The ARM answers a Grant Ellis / Trevor Miles status ask in under a minute from the roll-up, without interrupting the LO (REA-SPEED-10 success criteria, remapped) |
| Referral attribution | Every referred loan carries source agent from lead to funded, feeding [[Integration_Map]] lead-source model |
| Cooling-catch | Declining top-referrer pattern surfaced in test data before the quarter ends |

### TERA+ mapping for QA reuse

| Slice | TERA+ IDs | Scenarios |
|---|---|---|
| Agents they manage (direct reuse, as recipients of CRM communications) | REA-NEW-01 (Kylie Adams), REA-TOP-02 (Grant Ellis), REA-BUYER-03 (Monica Lane), REA-LISTING-04 (Peter Novak), REA-INVESTOR-05 (Daniel Ortiz), REA-LUXURY-06 (Camille Stone), REA-TEAMLEAD-07 (Nathan Gray), REA-TECH-08 (Alexis Nguyen), REA-NONTECH-09 (Linda Parker), REA-SPEED-10 (Trevor Miles), REA-COMM-11 (Rachel Kim), REA-COMPLEX-12 (Omar Diaz) | 10 REA-focused scenario rows in 04; SCN-EDGE-008 (agent asks for private data); SCN-AI-006 (Realtor update draft) |
| Internal ARM role | Composite (authored) | SCN-IB-BD-* as templates; **new ARM scenarios required** — logged for [[QA_Plan]] |

---

## Persona 7 — The Brand Keeper (Marketing Coordinator)

### Profile

Produces and reviews content at team or company scale: social posts, campaigns, newsletters, co-branded pieces, recruiting content. Lives between two fears: shipping something non-compliant (a rate claim, a missing NMLS/Equal Housing line, a guarantee) and being the bottleneck everyone routes around. The marketing-content-os pack is effectively this persona's rulebook: 16 content families, 3-tier risk model, 4 review roles, and the do-not-say list they enforce daily.

### Tech comfort spectrum

Moderate (Elena Scott, IB-MKT-CONTENT-09 — content-focused: "I need to know which version is approved and what still needs compliance review") to high (Ian Walker, IB-MKT-AUTO-10 — automation-focused: "Show me whether it is draft, approved, or live before anyone clicks anything").

### Daily jobs-to-be-done

1. Turn LO/team requests into on-brand drafts fast — 30 reels, 20 carousels, and the full seeded library exist to be adapted, not rewritten.
2. Route every draft through the right review depth by risk tier (Standard/Medium/High — anything touching rates, payments, fees, or qualification is High).
3. Track version and approval state so exactly one approved version exists and nothing unapproved can go live.
4. Manage campaign automations: what's live, what's paused, opt-out handling, lead-source attribution back into People.
5. Maintain per-state disclosure correctness (state rules as maintainable data — AZ/NJ/RI/MA rules exist today, more will come).

### Top pains with current tools

- Approvals over email/DM: no versioning, edits happening outside the system, "which file is final?"
- Manual compliance checking of every piece against the do-not-say list.
- Broken attribution: campaigns generate leads nobody can trace.
- Automation state ambiguity — Ian's named fear: is this workflow draft, approved, or actually live?

### What Today must show them

- **Review queue by risk tier:** High-risk items pinned first, each with side-by-side draft view, version label, and visible approval state.
- **Automation status board:** every campaign draft/approved/live/paused, with opt-out counts and last-run health — no ambiguity about what's touching the outside world.
- **Content calendar health:** this week's planned content vs. gaps (the weekly cadence system from the social pack).
- **Escalations:** items awaiting compliance decision, with age against the 2–3 business day SLA.

### Ally moments that win them over

1. **Pre-review lint:** every draft arrives pre-scanned — trigger terms, guarantee language, missing NMLS #320841/Equal Housing, state-rule conflicts (deterministic pass + AI review, per [[AI_Product_Architecture]]), with a safer rewrite proposed. The reviewer decides; Ally never approves its own work.
2. **Campaign pack generation:** brief in → 5 social drafts + image prompts + video script + compliance notes out, all marked Draft (the agent-task spec that already exists in the kit, productized).
3. **Best Price Guarantee guard:** Ally flags any BPG mention missing the terms link — and hard-flags Washington distribution (a locked rule).
4. **Keyword-DM automation drafting:** "comment PLAN" flows drafted end-to-end for approval before anything activates.

### Success metrics

| Metric | Target |
|---|---|
| Marketing/compliance review friction | ≤ 2.25 TS / ≤ 2.75 NTS |
| Red-flag avoidance | Risky content never *appears* approved or sendable (scorecard red flag); zero MARKETING-RISK criticals |
| Review throughput | Time from draft to decision down vs. email baseline; SLA breaches visible and trending to zero |
| Lint precision | Ally compliance flags reviewed-and-agreed rate high enough that reviewers trust, not tune out (measure both false-negative escapes and false-positive fatigue) |
| Automation clarity | Ian-profile tester confirms a demo automation cannot send externally (IB-MKT-AUTO-10 success criteria) |

### TERA+ mapping for QA reuse

| Slice | TERA+ IDs | Scenarios |
|---|---|---|
| Content reviewer | IB-MKT-CONTENT-09 (Elena Scott) | SCN-IB-MKT-*; SCN-AI-008 (marketing compliance flags) |
| Automation manager | IB-MKT-AUTO-10 (Ian Walker) | SCN-EDGE-009 (opt-out/DNC); SCN-HV-005 (marketing triage) |
| Compliance backstop | IB-COMP-POLICY-11 (Renee Martin), IB-COMP-ADCOMM-12 (Omar Haddad) | SCN-IB-COMP-*; SCN-STRESS-011 (marketing compliance issue) |

---

## The Borrower — CRM contact, not a product persona

Borrowers never log into Loan Factory CRM. There is no borrower portal, no borrower login, no borrower-facing surface — borrowers apply, upload documents, and track their loan in the systems built for that work. What borrowers experience of this product is **the communication it produces**: the emails, texts, and milestone updates the loan team sends — drafted by Ally, approved by a human, delivered in the borrower's preferred language. The TERA+ pack's 15 borrower personas therefore stay in this document **explicitly as source material for communication design and QA**, not as a user persona: they define who is on the other end of every EMT template, every Ally draft, and every wording-safety test.

### Why the borrower personas still matter

The 15 personas prove the borrower audience has extreme variance across three axes: **loan complexity** (first-timer → jumbo/DSCR/ITIN/foreign national/reverse), **communication comfort** (Harold Evans, who needs everything plain and patient, → self-employed detail-hound Nadia Kim), and **urgency** (browsing → closing this week). One background truth for all of them: anxiety. A mortgage is the largest transaction of their life, and silence reads as bad news. That single fact justifies the CRM's proactive, stage-triggered communication model: the borrower should hear news from their LO before they think to worry.

### What the borrower personas dictate about communication design

| Band | Anchors | Communication consequence |
|---|---|---|
| Very low comfort | Harold Evans (BOR-LOWTECH-13), Elaine Foster (BOR-REVERSE-11) | Plain language, no jargon or acronyms, one ask per message, patient tone, always a phone-call path |
| Phone-reader | Keisha Brown (BOR-MOBILE-12) | Messages are read on a phone: short paragraphs, front-loaded asks, SMS-friendly length — and the team's responsive web UI must make sending them from a phone just as easy |
| Moderate | Maya Johnson (BOR-FTB-01), Ben Carter (BOR-URGENT-14), Serena Davis (BOR-COMPLEX-15) | Progress clarity, honest urgency, judgment-free tone |
| High sophistication | Nadia Kim (BOR-SELFEMP-05), Leo Ramirez (BOR-DSCR-06), Malcolm Reed (BOR-JUMBO-10), Isabelle Laurent (BOR-FOREIGN-09) | Precise, complete asks — a docs-needed follow-up must say exactly what is outstanding; never re-ask for what was already provided; specialist tone for specialists |

Their pains with today's communication set the quality bar: hearing nothing after sending documents in (Priya Singh: "I need to know exactly what you received and what is still missing" — the docs-needed follow-up must close that loop when the team clears the flag); jargon and approval-wording confusion — mistaking preapproval or conditional approval for done (a compliance hazard, not just tone); repeated requests for the same item; generic consumer messaging sent to specialists and intimidating language sent to the anxious.

### Communication moments the borrower personas define (Ally drafts, the team approves)

1. **Proactive milestone notices:** the team records a stage change → Ally drafts the borrower update in borrower-safe language mapped from the 20-stage lifecycle — approved and sent before the borrower calls to ask.
2. **Plain-language explainers:** any draft that mentions a stage or mortgage term (VOE, conditional approval) explains it in the borrower's language. Ally never states approval odds, rates, or promises (hard guardrail per [[Mortgage_Compliance]]), and estimate vs. final wording is never blurred — a TERA+ critical-fail condition carried over verbatim as a message-QA rule.
3. **Docs-needed follow-ups:** built from the team's flag and note, stating exactly what is still outstanding and why — precise enough for Nadia Kim, plain enough for Harold Evans.
4. **Closing-week urgency:** when closing is near, drafts carry honest urgency without panic (Ben Carter's test).

### Success metrics (for the communications, not a surface)

| Metric | Target |
|---|---|
| Wording safety | Zero critical fails: no borrower-persona reader treats estimate/status language as final approval |
| First-read comprehension | FTB reader profile (Maya) explains the next step from the message alone, without calling the LO (BOR-FTB-01 success criteria, remapped to message QA) |
| "Where's my loan?" call deflection | Status-inquiry calls per file down vs. baseline as proactive stage-triggered updates ship |
| Tone fit across the spectrum | Harold-profile and Nadia-profile readers both rate the same template family appropriate for them |
| Language fit | Per-contact language preference respected on every send; Vietnamese drafts pass the same wording-safety bar as English |

### TERA+ mapping for QA reuse (as message-QA readers)

| Slice | TERA+ IDs | Scenarios |
|---|---|---|
| Mainstream | BOR-FTB-01 (Maya Johnson), BOR-VA-02 (Chris Miller), BOR-FHA-03 (Talia Green), BOR-USDA-04 (Aaron Cole) | 10 borrower scenario rows in 04, ported as message-comprehension tests |
| Complex income/asset | BOR-SELFEMP-05 (Nadia Kim), BOR-BANKSTATEMENT-07 (Priya Singh), BOR-JUMBO-10 (Malcolm Reed), BOR-COMPLEX-15 (Serena Davis) | Docs-needed follow-up precision tests; SCN-STRESS-008 (self-employed income problem) as a communication scenario |
| Specialty programs | BOR-DSCR-06 (Leo Ramirez), BOR-ITIN-08 (Mateo Alvarez), BOR-FOREIGN-09 (Isabelle Laurent), BOR-REVERSE-11 (Elaine Foster) | Program-specific template-content tests; multilingual message tests (see below) |
| Behavior extremes | BOR-MOBILE-12 (Keisha Brown), BOR-LOWTECH-13 (Harold Evans), BOR-URGENT-14 (Ben Carter) | SCN-EDGE-007 (premature approval wording); SCN-STRESS-006 (expiring lock), -007 (job change). Portal-mechanics scenarios (SCN-EDGE-006 mobile resume, SCN-EDGE-011 interrupted upload) **retire** — there is no borrower surface to test |

---

## Multilingual considerations

Multilingual is a canon differentiator, and the persona evidence makes it concrete — 56 of the 111 TERA+ personas are non-English staff personas (14 each in Vietnamese, Mandarin, Colombian Spanish, Russian).

### Vietnamese-first LOs are the priority case

The six LO-VI personas (Linh Tran, Minh Nguyen, An Pham, Quang Le, Hoa Vo, Bao Huynh) are culturally specific, not translations, and they define real requirements:

| Requirement | Persona evidence | Product consequence |
|---|---|---|
| **Mixed-language reality, not full translation.** Vietnamese LOs work in Vietnamese *around* English mortgage terms — "AUS," "1003," "condition" stay English. | LO-VI-NEW-NTS-01: confusion "giữa thuật ngữ tiếng Anh và tiếng Việt"; the ZH personas show the same embedded-English pattern | UI translation must keep canonical mortgage terms in English with Vietnamese explanation on tap — never machine-translate term-for-term. Quang Le, verbatim concern: translation must not "turn mortgage terms into vague sentences." |
| **Bilingual glossary in the workflow.** | Linh Tran needs acronyms explained "ngay trong workflow" (right inside the workflow), not in a help center | Inline term tooltips (EN term → VI plain-language explanation) shipped as first-class UI, sourced from the communication framework's 5-language terminology table |
| **Bilingual search.** | LO-VI-NEW-TS-02 needs "search song ngữ" | People/template search matches both the English term and its Vietnamese equivalent |
| **Safe-wording drafts in Vietnamese.** | An Pham's core worry: explaining status to borrowers "without saying the wrong thing about approval" | Ally's Vietnamese drafts inherit the same compliance guardrails as English — the framework's localization rule is explicit: "Do not soften conditional language in non-English versions" |
| **Vietnamese-speaking borrowers follow.** | Per-contact language preference is canon; Loan Factory's team model includes Vietnamese teams | Contact records carry language preference from Phase 1 so Conversations, templates, and campaign content render and send accordingly |

### Content and data facts to build on

- The 135-template email library has **lifecycle-stage localization modules** (5 body modules per language for VI/ZH/ES-CO/RU), not per-template translations. Ship those as seeds; flag every non-English send "human translation review required" until per-template variants exist.
- **Known defect to fix before any user-facing reuse:** TERA+ Vietnamese (file 13) and Colombian Spanish (file 15) persona files were authored without diacritics/accents ("Moi vao nghe" instead of "Mới vào nghề"). Restore correct orthography before these personas appear in any stakeholder material or test script. Locale standards exist in the framework (VI full diacritics, "Kính chào"/"Quý khách"; ES-CO "usted"; ZH "您"; RU formal "Вы").
- The prototype's embedded fonts already included Vietnamese unicode-range subsets — the [[Design_System]] type stack must do the same deliberately.

### Known gap: zero multilingual borrower personas

All 56 multilingual TERA+ personas are staff. Per-contact language preference chiefly shapes *borrower-facing communications*, so QA has no non-English borrower reader profiles on file to judge those messages. **Action for [[QA_Plan]]:** author 3–4 multilingual borrower personas (minimum: Vietnamese first-time buyer, Spanish-speaking ITIN borrower building on Mateo Alvarez, Chinese-speaking foreign national building on Isabelle Laurent) as message-QA readers before non-English borrower communication content ships. Logged in [[Open_Issues]].

---

## QA reuse summary

For [[QA_Plan]] — the complete crosswalk in one table:

| Loan Factory CRM persona | Direct TERA+ persona IDs | Scenario suites to port | New authoring required |
|---|---|---|---|
| 1 Producer (LO) | LO-01..06 + LO-VI/ZH/ES/RU-01..06 (30 personas) | SCN-LO-* matrix rows; SCN-HV-001; SCN-STRESS-012/-013; SCN-AI-005/-009 | None |
| 2 Right Hand (LO Assistant) | LC-01..04 + multilingual (20) | SCN-LC-*; SCN-HV-003; SCN-EDGE-002 | None |
| 3 File Guardian (Processing) | PR-01..04 + multilingual (20) | SCN-PR-*; SCN-HV-002; SCN-STRESS-001/-002/-010; SCN-AI-004 (remapped to communication drafting) | None (IB-UW/IB-DS are out of product scope — LOS work; keep only as communication-QA source) |
| 4 Player-Coach (Team Leader) | IB-TL-TS-01, IB-TL-NTS-02 (+ IB-CC-03/04 Phase 3) | SCN-IB-TL-001..005; SCN-HV-004; SCN-AI-007 | None |
| 5 Franchise Builder (Branch Leader) | — (composite: IB-TL-*, IB-BD-RETENTION-14, IB-COMP-POLICY-11) | SCN-IB-TL-*/SCN-IB-BD-* as templates | **Yes — branch-level scenarios** |
| 6 ARM (Partners) | REA-01..12 as recipients of agent-facing communications | 10 REA rows; SCN-EDGE-008; SCN-AI-006 | **Yes — internal ARM scenarios** |
| 7 Brand Keeper (Marketing) | IB-MKT-09/10, IB-COMP-11/12 | SCN-IB-MKT-*/SCN-IB-COMP-*; SCN-HV-005; SCN-AI-008; SCN-EDGE-009; SCN-STRESS-011 | None |
| — Borrower (contact — message QA only) | BOR-01..15 | 10 borrower rows as message-comprehension tests; SCN-EDGE-007; SCN-STRESS-006/-007/-008. SCN-EDGE-006/-011 retire (portal mechanics — no borrower surface exists) | **Yes — 3–4 multilingual borrower message-QA readers** |

Cross-cutting suites that apply to all personas: the 12 critical-fail conditions, the 20 risk tags as defect taxonomy, and the AI-assisted tests (SCN-AI-001..009, minus SCN-AI-003 document classification, which drops out with the CRM-only boundary — documents live in the LOS) as Ally's acceptance suite, plus the data-safety rules (fake data only, no external sends, no production writes during testing). Remap all TERA status labels to the 20-stage lifecycle per [[Mortgage_Workflow_Map]] — in the CRM those stages are relationship/opportunity visibility, entered by the team in v1 and later optionally synced read-only from external systems. Discard the TERA-* ID crosswalk (dangling references, per discovery analysis).
