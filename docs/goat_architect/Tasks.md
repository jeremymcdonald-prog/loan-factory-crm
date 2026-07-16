# Tasks

Purpose: the Phase-1 execution backlog — every epic and task needed to ship the Phase-1 walking skeleton locked in [[Implementation_Roadmap]], ordered by dependency, sized, and mapped to the acceptance requirements in [[PRD]] so the implementation team can start pulling work without another planning round. This is Phase 1 only; Phase 2+ backlogs are authored when Phase 1's proof list is demonstrated. Related: [[QA_Plan]] · [[Data_Model]] · [[Technical_Architecture]] · [[Design_System]] · [[Decisions]].

## What Phase 1 is — and is not

Phase 1 is the Loan Factory CRM walking skeleton: exactly thirteen things. (1) Authentication; (2) organization and user tenancy; (3) People; (4) leads; (5) CRM opportunity records with mortgage stages; (6) tasks; (7) notes and activity history; (8) the Today command center; (9) seeded demonstration data; (10) responsive desktop and mobile web layouts; (11) basic Ally recommendation cards using controlled mock AI output; (12) the approval workflow shell; (13) the audit logging foundation. Every task below serves one of these thirteen.

Explicitly **excluded** from Phase 1 — no task in this backlog builds any of it: borrower portal, LOS functionality, loan applications, document uploads, underwriting, pricing, credit, disclosures, autonomous customer communication, and unverified external integrations. The CRM records the relationship and opportunity facts the team enters; it never performs loan work — that lives in the LOS/POS, permanently.

Deferred to the Phase-2 backlog (designed in [[PRD]], [[AI_Product_Architecture]], and [[Communication_Templates]]; ticketed only after the Phase-1 proof list is demonstrated): Conversations (Gmail integration), the 135-template EMT communication layer and compliance lint engine, the live Ally model gateway and drafting, hosted web lead forms, CSV import and book-of-record migration, and per-stage SLA automation.

## How to read this backlog

- **Sizes:** **S** (small, well-understood, one person, days-scale), **M** (moderate, some design/unknowns), **L** (large surface or real unknowns — split into sub-tickets at sprint planning). Sizes are complexity, not calendar commitments.
- **★ = critical path.** Delay on a ★ task delays Phase 1; everything else has float.
- **Acceptance ref** points to the stable requirement IDs in [[PRD]], the goals (G#) in PRD §2, the criteria in [[Acceptance_Criteria]], and QA instruments in [[QA_Plan]] (NTS thresholds, 12 critical-fail conditions).
- **Definition of done for every task:** code merged with tests; audit events emitted where the task mutates data; the screen (if any) passes its NTS threshold on desktop and in a phone-width mobile browser; no critical-fail condition introduced; docs/fixtures updated.

## Epic dependency order

| Order | Epic | Depends on | Why this order |
|---|---|---|---|
| 1 | E1 Foundations & platform | — | Everything consumes auth, tenancy, RBAC, audit, design tokens, telemetry |
| 2 | E2 Core data model | E1 | Every feature reads/writes this schema; RLS must exist before feature code |
| 3 | E3 People & leads | E2 | Contacts are the root object; leads feed everything downstream |
| 4 | E4 Pipeline — opportunities & stages | E2, E3 | Opportunities hang off contacts; stage events feed Today and Ally cards |
| 5 | E5 Tasks & notes | E2, E3 | Cheap, high-value; needed by Today's feed and activity history |
| 6 | E6 Ally cards & approval shell | E2, E4, E5 | Mock recommendation cards, the approval workflow shell, provenance |
| 7 | E7 Today | E3–E6 | The command center assembles everything; built last, designed first |
| 8 | E8 Settings & governance | E1, E2 | Profile, consent/DNC ledger, audit viewer; consent gates Ally cards |
| 9 | E9 QA & launch readiness | all | Continuous per-screen; consolidated gate at the end |

**Critical path:** T-101 → T-102 → T-103 → T-201 → T-202 → T-301 → T-401 → T-602 → T-604 → T-701 → T-902 → T-906.

**Long-lead note:** Phase 1 has no external integrations, so no ⚠ waits sit on this backlog. The one weeks-scale external item worth starting during Phase 1 *as Phase-2 preparation* is Google OAuth app verification for the Phase-2 Gmail integration — submit it early, track it outside this backlog.

---

## E1 — Foundations & platform

The plumbing every other epic stands on. Nothing user-visible ships from E1 except sign-in — and that's the point.

| ID | Task | Done means / acceptance ref | Size | Depends on | ★ |
|---|---|---|---|---|---|
| T-101 | Repository, CI/CD, environments (dev/staging/prod), serverless deploy pipeline (Next.js + TypeScript per [[Technical_Architecture]]) | Green pipeline deploys a hello-world app to all three environments; secrets in a manager, never in code | M | — | ★ |
| T-102 | Supabase provisioning: Postgres, migration tooling, RLS enabled by default, pgvector extension installed (used by Ally retrieval when the live gateway ships in Phase 2) | Migrations run in CI; a table without an RLS policy fails CI | M | T-101 | ★ |
| T-103 | Authentication: sign-in with MFA, session management, password reset (skeleton item 1) | FR-ST-1; auth flows pass NTS threshold (an NTS tester signs in unaided) | M | T-102 | ★ |
| T-104 | Organization & user tenancy + RBAC core (skeleton item 2): tenant model, the 8 user types as role presets, server-side permission checks, the "block explains who *can* act and offers a handoff" UI pattern | FR-TM-1; scorecard critical-fail "scary/vague permission blocks" cannot occur | M | T-103 | ★ |
| T-105 | Audit logging foundation (skeleton item 13): append-only audit log service; every mutation, approval, Ally-card action, and view emits an attributable, timestamped, immutable event | FR-ST-4; a mutation without an audit event fails code review checklist + integration test | M | T-102 | ★ |
| T-106 | Design system foundation: tokens (light + dark themes), typography with tabular numerals, urgency status color system, core component library ([[Design_System]]) | Components render in both themes; no coral/beige/emoji-as-UI anywhere (D-13) | L | T-101 | ★ |
| T-107 | App shell: navigation (Phase-1 items only — unbuilt nav items are absent, never dead links), routing per the [[Information_Architecture]] route map, basic ⌘K record search (people/opportunities by name) | Shell passes NTS; search returns a known record in <1s on fixture data | M | T-106 | |
| T-108 | Responsive web layouts (skeleton item 10): every Phase-1 screen works at desktop and phone-width browser breakpoints — layout, touch targets, and primary actions verified in mobile browsers; the responsive web app **is** the mobile experience (there is no native app) | AC-RW criteria in [[Acceptance_Criteria]]; scorecard mobile tasks pass in a phone-width browser | M | T-106, T-107 | ★ |
| T-109 | Telemetry pipeline: product event schema for G1 (adoption), G2 (time-to-first-action), G3 (SLA hit rate), G6 (Ally trust), G8 (compliance posture) | PRD §2; events verified end-to-end into the analytics store from staging | M | T-101 | |

## E2 — Core data model

One schema pass, reviewed against [[Data_Model]], so feature epics never block on each other's migrations.

| ID | Task | Done means / acceptance ref | Size | Depends on | ★ |
|---|---|---|---|---|---|
| T-201 | Core schema: tenants, users/roles, contacts (with language preference, per-channel consent, DNC), leads with structured source, **opportunities** (first-class, distinct from contact; stage catalog + immutable stage history; milestone timestamp fields as read-only visibility/trigger metadata — entered by the team in v1, syncable read-only from LOS/POS via future integrations, never loan-of-record data), tasks, notes, activity events, Ally recommendation cards + approvals, consent ledger, audit | FR-PE-1, FR-PL-2, FR-PL-7 structural basis; migration reviewed against [[Data_Model]] | L | T-102 | ★ |
| T-202 | RLS policies: tenant isolation + role-based row access for every table, with automated policy tests (each role can/cannot see exactly what the [[Information_Architecture]] permission matrix says) | Cross-tenant/cross-role access attempts fail at the database layer, proven by tests | M | T-201 | ★ |
| T-203 | Stage catalog seed: the 20 locked stage names grouped into 5 macro-phases; stage history is append-only by constraint | FR-PL-7; renaming a stage requires a migration + [[Decisions]] entry, not an edit | S | T-201 | |
| T-204 | Seeded demonstration data (skeleton item 9): realistic seeded tenant (contacts across stages/languages, opportunities, tasks, notes, Ally cards) for development, QA, and the Phase-1 proof demos | Every proof-list demo in [[Implementation_Roadmap]] can run on seed data before real data exists | S | T-201 | |

## E3 — People & leads

The root object. A lead that lands here within a minute of capture is the start of goal G2. Hosted web lead forms and CSV import are Phase-2 backlog items — Phase-1 leads are created in-app and by seed data.

| ID | Task | Done means / acceptance ref | Size | Depends on | ★ |
|---|---|---|---|---|---|
| T-301 | Contact record screen: identity, language preference (EN/VI first-class; ZH/ES/RU in model), per-channel consent flags, DNC, relationship links (co-borrower, referred-by, realtor) | FR-PE-1; NTS threshold passes; consent/DNC visibly govern what actions are offered | L | T-201, T-106 | ★ |
| T-302 | Quick-create contact/lead with inline validation, structured source (minimum "manual entry" by named user), instant duplicate warning (email, phone, name+DOB fuzzy), and guided merge preserving both histories | FR-PE-2, FR-PE-6; lead-creation NTS friction ≤ 2.5 (ship gate); scorecard critical-fail "unrecoverable duplicate" cannot occur | M | T-301 | ★ |
| T-303 | Simple lead routing: manual assignment, source-based and language-based rules, assignee notification within a minute, unassigned-lead alarm on Today | FR-PE-4 (P1); an unassigned lead older than the threshold is impossible to miss | M | T-302 | |
| T-304 | Activity timeline (skeleton item 7, with E5): one merged, filterable stream per contact — tasks, notes, stage changes, Ally-card actions — every entry timestamped and attributed | FR-PE-5; every event type from other epics renders here (integration checklist) | M | T-301, T-105 | ★ |

## E4 — Pipeline: opportunities & stages

The CRM tracks the relationship and where the opportunity stands — stage and milestone facts entered by the team (and later syncable read-only from external systems). It is never the place loan work happens.

| ID | Task | Done means / acceptance ref | Size | Depends on | ★ |
|---|---|---|---|---|---|
| T-401 | Opportunity CRUD: program, purpose, amount, property, key dates, participants (LO, coordinator, processor, realtor, lender) as descriptive relationship facts; one person, many opportunities | FR-PL-2; the prototype's contact-IS-the-loan model is structurally impossible; no loan-of-record data is stored | M | T-201, T-301 | ★ |
| T-402 | Pipeline board: 5 macro-phase columns, drill-in to 20 stages, drag-to-move with confirm, per-card urgency status colors | FR-PL-1 (P1); board NTS threshold passes; move emits stage-history + audit events | L | T-401, T-203 | |
| T-403 | Pipeline list view + filters: LO, stage, program, source, language, days-in-stage | FR-PL-1; a 25-opportunity book is triaged in minutes (high-volume QA test) | M | T-402 | |
| T-404 | Stage history display + days-in-stage computation on cards and records | FR-PL-7; history is immutable and matches the audit trail exactly | S | T-402 | |

## E5 — Tasks & notes

| ID | Task | Done means / acceptance ref | Size | Depends on | ★ |
|---|---|---|---|---|---|
| T-501 | Task CRUD: create/assign/due/complete, linked to contact and opportunity, surfaced on timeline and Today; due/overdue states feed Today's ranking | Task flows pass NTS; task events feed G3 telemetry | M | T-201, T-304 | ★ |
| T-502 | Notes on any contact or opportunity, rendered in the timeline, visually and structurally distinct from anything outbound | FR-PE-5; notes are attributable and exportable with the audit trail; Notes NTS friction ≤ 2.5 | S | T-304 | |

## E6 — Ally recommendation cards & approval shell

Everything here obeys one contract: **Ally prepares, the human approves** ([[Decisions]] D-05). In Phase 1 Ally runs on **controlled mock output** — deterministic, fixture-driven, no live model calls — so the approval workflow, labeling, provenance, and audit habits are proven before a single real token is generated. Nothing in Phase 1 sends anything to anyone: autonomous customer communication is excluded, and there is no send path to bypass.

| ID | Task | Done means / acceptance ref | Size | Depends on | ★ |
|---|---|---|---|---|---|
| T-601 | Controlled mock recommendation service (skeleton item 11): deterministic, fixture-driven Ally cards (follow-up nudges, stale-opportunity flags, task suggestions), each clearly labeled as Ally-prepared; no live model dependency exists in the Phase-1 build | AC-AL-1/2; a dependency and network audit shows zero model calls | M | T-201, T-204 | ★ |
| T-602 | Approval workflow shell (skeleton item 12): card states (pending / approved / edited-then-approved / dismissed / snoozed / expired), one-tap actions, dismissal-reason capture, stale-card expiry when the underlying trigger no longer applies; approving a card performs only in-app effects (create the task, open the record) — never an outbound communication | FR-TD-4, AC-AL-3/4; state machine tested exhaustively; queue telemetry feeds G6 | L | T-201, T-105 | ★ |
| T-603 | Provenance logging on every Ally card: generating rule/fixture, records referenced, who approved/dismissed, timestamps — into the audit trail | AC-AL-4, cross-cutting §5.5; "reviewed against source evidence before a human acts" answerable yes | S | T-601, T-105 | ★ |
| T-604 | Deterministic urgency ranking across leads/tasks/cards with visible factors ("why is this first?"); behavioral and stage-progress signals only — no protected-class features or proxies, factors documented in [[AI_Product_Architecture]] | FR-TD-1, D-11; SCN-AI explainability test passes against the mock ranker | L | T-602, T-501, T-303 | ★ |
| T-605 | Consent/DNC gate on cards: setting DNC or opt-out on a contact expires that contact's pending outreach-suggestion cards within one processing cycle | AC-AL-5 (INV-6 rehearsed on the shell before any real send path exists) | S | T-602, T-802 | ★ |

## E7 — Today

Built last because it assembles everything; designed first because it is the product's signature. The design question, verbatim from the usability scorecard: *"Does the dashboard show the next right action, or does it become another place to hunt?"*

| ID | Task | Done means / acceptance ref | Size | Depends on | ★ |
|---|---|---|---|---|---|
| T-701 | Urgency-ranked feed combining new leads awaiting first touch, tasks due, Ally cards pending — ranked by T-604, with "why is this first?" on demand | FR-TD-1; dashboard NTS friction ≤ 2.75 (ship gate); 7:45am proof demo passes on seed data | L | T-604, T-602, T-501, T-303 | ★ |
| T-702 | One primary action per feed item, executable without leaving Today (call log, approve card, complete task, open record) | FR-TD-2; the "one obvious primary action" standard verified per item type | M | T-701 | |
| T-703 | Role-aware composition: LO / assistant / processor / team-leader variants showing only owned or supervised work, with owners named on anything the viewer can't act on | FR-TD-3; RBAC visibility matrix verified per role | M | T-701, T-104 | |
| T-704 | Freshness indicators: every panel shows when its data was last updated | FR-TD-5; scorecard critical-fail "cannot tell if data is current" cannot occur | S | T-701 | |

## E8 — Settings & governance

| ID | Task | Done means / acceptance ref | Size | Depends on | ★ |
|---|---|---|---|---|---|
| T-801 | Profile: identity, personal NMLS (e.g. 1195266) alongside company NMLS #320841, licensed states, signature blocks, working schedule, language | FR-ST-2; signature data is correct and ready for the Phase-2 Conversations send path | S | T-103 | |
| T-802 | Consent & DNC ledger: per-contact per-channel consent with timestamp and source-of-consent; changes propagate instantly — in Phase 1, to pending Ally cards (T-605) | FR-ST-3; setting DNC expires pending cards for that contact immediately, proven by test | M | T-201, T-602 | ★ |
| T-803 | Audit trail viewer + export: complete history for any contact, opportunity, or Ally-card action, produced in minutes | FR-ST-4; the proof-list audit pull passes | M | T-105 | |
| T-804 | Integration management panel: honest connection states only — Phase 1 ships zero external integrations, so the panel shows zero "Connected" tiles; future integrations are read-only data in / communication out, never ownership of loan origination data ([[Integration_Map]]) | FR-ST-5; the fake-"Encompass Connected" anti-pattern is structurally impossible | S | T-107 | |

## E9 — QA & launch readiness

Runs continuously (per-screen gates), consolidated here for the phase gate. Full plan in [[QA_Plan]].

| ID | Task | Done means / acceptance ref | Size | Depends on | ★ |
|---|---|---|---|---|---|
| T-901 | Port the TERA+ scenario suites for P1 surfaces (lead capture → People, dashboard → Today, status → Pipeline, RBAC) with terminology remap to the 20-stage lifecycle | P1-relevant subset of the scenario matrix executable as the regression suite | M | T-204 | |
| T-902 | NTS usability rounds per the scorecard: per-screen friction thresholds as ship gates, testers matched to the persona grid (incl. NTS and Vietnamese-speaking profiles) | G7; every P1 screen at/below threshold; the 12 critical-fail conditions clear | L | continuous | ★ |
| T-903 | Ally acceptance tests on the mock surfaces: card labeling and explainability, approval-shell state machine, provenance completeness, and adversarial attempts to make a card cause any state change or outbound effect without human confirmation — all must fail and be visible in the audit trail | [[Acceptance_Criteria]] AC-AL set; INV-1/INV-4 hold by construction and by test | M | T-602, T-603 | ★ |
| T-904 | Responsive-web verification: the scorecard's mobile tasks (lookup, notes, status, Today review, card approval) pass in phone-width mobile browsers on every P1 screen | AC-RW criteria; T-108 proven as usability, not just CSS | M | T-108, T-701 | |
| T-905 | High-volume & performance tests: 25-opportunity LO triage in minutes; feed and board responsiveness at realistic book sizes | Cross-cutting §5.6; high-volume suite from [[QA_Plan]] passes | M | T-701, T-403 | |
| T-906 | Launch readiness: metrics dashboards live (G1–G3, G6–G8 baselines recording), proof-list demos rehearsed on seed data, pilot cohort onboarded, rollback plan documented | The Phase-1 proof list in [[Implementation_Roadmap]] demonstrated end-to-end | S | all | ★ |

---

## Phase-1 exit

Phase 1 is done when the acceptance criteria in [[Implementation_Roadmap]] Phase 1 hold and its proof list has been demonstrated live. The Phase-2 backlog is then authored from the P2 feature table using this same structure — Conversations, the EMT template and compliance-lint layer, the live Ally model gateway, imports and migration — informed by the first thing Phase 1 produces that no planning document can: real telemetry about how loan officers actually work.

Related: [[Implementation_Roadmap]] · [[PRD]] · [[QA_Plan]] · [[Data_Model]] · [[Technical_Architecture]] · [[AI_Product_Architecture]] · [[Design_System]] · [[Open_Issues]] · [[Decisions]]
