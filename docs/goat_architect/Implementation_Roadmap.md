# Implementation_Roadmap

Purpose: the build sequence for Loan Factory CRM, phase by phase, written so Jeremy can see exactly what each phase buys the business, what it deliberately does not include, and what evidence proves it is done. Phases and their scope boundaries are locked in [[Decisions]] and CANON; this document turns them into an executable plan. It uses complexity ratings, not dates — dates come from the team that commits to the work, never from a planning document. The Phase-1 execution backlog lives in [[Tasks]]. Related: [[PRD]] · [[Vision]] · [[Automation_Catalog]] · [[QA_Plan]].

## How to read this roadmap

- **No dates.** Every phase carries complexity ratings per workstream: **S** (small, well-understood), **M** (moderate, few unknowns), **L** (large, or real unknowns), **XL** (major sustained effort). A phase is sequenced by dependency, sized by complexity, and gated by proof — never by a calendar promise.
- **Phase gates are evidence, not opinions.** Each phase lists *proof required*: the demoable things that must be shown working, live, on real data paths (never mock theater — the retired prototype's fake "Encompass ✓ Connected" tile is the standing anti-pattern, [[Current_State_Audit]]).
- **Nothing borrower-facing ever sends autonomously in v1** ([[Decisions]] D-05). Every phase inherits this; Phase 3 contains the only decision point that can change it (the "earned autonomy" proposal in [[Automation_Catalog]]).
- **The CRM boundary holds in every phase.** Loan Factory CRM manages relationships and communication. It never originates, underwrites, prices, discloses, processes, or services loans — loan facts enter as team-entered (later read-only-synced) stage and milestone visibility, and the CRM's job is the follow-up they trigger.
- **Workstreams used in the complexity tables:** Product & Design · Frontend · Backend & Data · AI (Ally) · Content & Compliance · Infrastructure/DevOps · QA.

| Phase | One-line outcome | Status |
|---|---|---|
| 0 | The plan itself: discovery, architecture, design direction, validated assumptions | Complete (sign-offs pending) |
| 1 | **Earn the LO's morning**: the 13-item walking skeleton — auth, tenancy, People, Leads, opportunities on the 20-stage model, tasks, notes, Today, seeded data, responsive web, mock-backed Ally cards, approval shell, audit foundation | Next |
| 2 | **Earn the whole team's workflow**: email + the 135 templates + compliance engine, live Ally, automation engine, milestone visibility, Partners, Marketing, segments, reporting, Team, SMS | After P1 proof |
| 3 | **Earn the database**: rate-aware reactivation radar, conversation intelligence, coaching, deeper read-only data connections, the earned-autonomy decision | After P2 proof |
| 4 | **Earn the enterprise**: multi-branch, white-label, advanced analytics, marketplace | After P3 proof + business decision (Q9) |

---

## Phase 0 — Discovery, architecture, design system, assumption validation

**Business outcome:** the implementation team can start building with zero re-litigation: every product decision, screen, data contract, compliance rule, and reusable asset is documented and internally consistent.

**Delivered (this document set):**
- Full discovery of all six source packs plus the offline CRM prototype, with honest verdicts ([[Asset_Inventory]], [[Current_State_Audit]], analyses in `_product_discovery/_analysis/`). The TERA+ materials in that corpus are carried forward purely as source material — personas, usability scorecards, and QA scenarios — not as a system the product must position against or integrate with.
- Locked canon: 10-item navigation, 20-stage lifecycle, Ally contract, design direction, phase boundaries ([[Decisions]]).
- The blueprint: [[Vision]], [[PRD]] (30 capabilities, module specs with stable FR IDs), [[Information_Architecture]], [[Screen_Specifications]], [[Design_System]], [[Data_Model]], [[Technical_Architecture]], [[AI_Product_Architecture]], [[Automation_Catalog]], [[Mortgage_Workflow_Map]], [[Mortgage_Compliance]], [[Integration_Map]], [[Communication_Templates]], [[User_Personas]], [[QA_Plan]], [[Competitive_Differentiation]], this roadmap, and [[Tasks]].

**Remaining Phase-0 exit items (owner: Jeremy, one working session):**

| Item | Blocks | Ref |
|---|---|---|
| Final product name confirmation (Loan Factory CRM is the working name) | Branding surfaces only | Q6, D-12 |
| Current book-of-record location, volume, consent quality | P2 import tooling; pilot onboarding | Q7 |
| Vietnamese translation reviewer named | P1 language foundation honesty flags; P2 VI variants | Q5 |
| Sign-off on [[Decisions]] entries marked Proposed | — | — |

**Acceptance criteria:** the document set is complete, cross-consistent with CANON, and Jeremy has answered the four exit items above (answers logged in [[Decisions]]/[[Open_Issues]]).

**Proof required:** this repository; Build process recorded in [[Build_Log]].

**Complexity:** delivered — not rated.

---

## Phase 1 — Walking skeleton: earn the LO's morning

**Business outcome:** a loan officer opens Loan Factory CRM at 7:45am and, in under 60 seconds, knows exactly what matters now — the ranked feed, the day's tasks, and Ally's recommendation cards waiting in the approval queue. Phase 1 replaces the LO's sticky notes and "who did I forget?" anxiety with a single trustworthy command center, and it proves the product's signature interaction — **Ally prepares, the human approves** — end to end on controlled mock AI output, before a single live model call or outbound send exists. It also quietly does the second-most-important job: the audit logging foundation instruments every action, so Phase 2+ targets are measured against real baselines instead of guesses ([[PRD]] §2).

Phase 1 deliberately runs with **zero external integrations** ([[Decisions]] D-10). Data is entered by the team and by the seeded demonstration set; even Google Workspace email waits for Phase 2, when its OAuth verification (submitted during P1) completes. This is a feature, not a gap: the #1 schedule killer for CRM builds is gating core UX on vendor integrations — and a skeleton with no send path makes "zero autonomous customer communication" structural, not aspirational.

### The 13-item walking skeleton (this list is closed — additions require a [[Decisions]] entry)

| # | Item | What ships (specific) | Acceptance ref |
|---|---|---|---|
| 1 | Authentication | Sign-in with MFA, session management, account recovery | FR-ST-1 |
| 2 | Organization & user tenancy | Organization tenant model with row-level-security isolation; the 8 user types as RBAC role presets; permission blocks that name who *can* act and offer a handoff | FR-TM-1 |
| 3 | People | Contact record with per-contact language preference (EN/VI first-class; ZH/ES/RU in the model), per-channel consent flags, DNC status, relationship links; quick create; merged activity timeline | FR-PE-1, FR-PE-5 |
| 4 | Leads | Lead creation with structured source (channel → campaign → form), manual assignment, new-lead visibility on Today within a minute, unassigned-lead alarm | FR-PE-2, FR-PE-4 (P1) |
| 5 | CRM opportunity records with mortgage stages | Opportunity as a first-class CRM record distinct from the contact (program, purpose, amount, property, key dates, participants — team-entered relationship and stage facts, never loan-of-record data); 5 macro-phase board with drill-in to the 20 locked stages; list view; filters (LO, stage, program, source, language, days-in-stage); manual stage moves; immutable stage history | FR-PL-1 (P1), FR-PL-2, FR-PL-7 |
| 6 | Tasks | Create/assign/due/complete, linked to contact and opportunity; simple per-stage SLA tasks with overdue states feeding Today | FR-AU-4 (P1) |
| 7 | Notes & activity history | Notes on any contact or opportunity; every action lands on the merged timeline | FR-PE-5 |
| 8 | Today command center | Urgency-ranked feed (new leads awaiting first touch, tasks due, Ally approval items); one primary action per item, executable inline; role-aware composition (LO / assistant / processor / team-leader variants); freshness timestamps on every panel | FR-TD-1..3, FR-TD-5 |
| 9 | Seeded demonstration data | A realistic seeded organization — contacts, leads, opportunities across all 20 stages, tasks, notes, both languages — so demos, training, and QA run on believable data from day one | [[QA_Plan]] |
| 10 | Responsive desktop & mobile web layouts | Every P1 screen works on desktop and phone browsers; the mobile collapse pattern from [[Information_Architecture]] ships in P1, not later — responsive web is the product's permanent mobile strategy | [[Information_Architecture]] |
| 11 | Basic Ally recommendation cards (controlled mock AI output) | The card anatomy the whole product bets on — recommendation, ranking factors visible on demand, evidence links resolving to real records — running on deterministic, controlled mock output with no live model calls; no protected-class or proxy factors, ever | PRD §4.1 Ally, D-11 |
| 12 | Approval workflow shell | One pattern everywhere: approve / edit-then-approve / dismiss (with optional reason) / snooze; every Ally card resolves only through the queue; verdict capture feeds G6 from day one | FR-TD-4, G6 |
| 13 | Audit logging foundation | Every action — sign-in, stage change, task completion, Ally card verdict — attributable, timestamped, immutable, exportable; the same event spine produces the G1/G2/G3/G6/G7 baselines | FR-ST-4, PRD §2 |

### Explicitly excluded from Phase 1

Borrower portal, LOS functionality, loan applications, document uploads, underwriting, pricing, credit, disclosures, autonomous customer communication, and unverified external integrations. The first eight are not deferrals — they are outside the product permanently ([[PRD]] §6): borrowers are CRM contacts the team communicates with, never product users, and the CRM communicates *about* loan work without ever performing it. Autonomous customer communication stays excluded until the Phase-3 earned-autonomy decision (D-05); external integrations arrive only once verified, starting with Google Workspace email in Phase 2.

### Everything cut from Phase 1, and why

Overbuild is the main risk of this phase — more than any technical risk. Every prior artifact in this discovery corpus that failed, failed by building breadth before proof: the offline prototype built seven screens of email marketing with zero pipeline; the marketing app prototype was abandoned one day after its first commit. Phase 1 is one loop, done excellently: **lead arrives → LO knows → Ally recommends → human approves → the outcome lands on the timeline → audit trail proves it.** Anything that doesn't serve that loop waits.

| Cut from Phase 1 | Why it waits | Lands in |
|---|---|---|
| Email channel (Google Workspace send/receive/thread) | The OAuth verification is weeks of external review (submitted during P1); the skeleton proves the approval loop on controlled mock output first, so the first real send lands on an already-trusted pattern | P2 (FR-CO-1, FR-CO-8) |
| Template layer (135 EMT masters, merge fields, stage-aware suggestion) | Templates exist to be sent; they land with the email channel and the compliance engine as one unit | P2 (FR-CO-2..4) |
| Compliance engine (pre-send lint + AI review) | There is no send path in P1 to lint; it ships with the first one, fully formed — never retrofitted | P2 (FR-CO-5) |
| Live Ally (model gateway, daily briefing, next-best-action, draft generation) | The mock-backed cards prove the interaction contract and collect verdict telemetry first; live output replaces the mock behind the same queue, changing nothing about the approval contract | P2 (PRD §4.1) |
| CSV import with dedupe preview and guided merge | Import tooling matters when real books of record arrive (Q7) at pilot; the seeded set covers P1 demo/QA needs | P2 (FR-PE-6) |
| Hosted web lead form | P1 lead capture is in-app; the public form follows with capture instrumentation | P2 (FR-PE-2 full) |
| Lead routing rules (source-based, language-based) | Manual assignment exercises the muscle; rules need real lead flow to route | P2 (FR-PE-4 full) |
| SMS channel | Consent/10DLC registration unresolved ([[Open_Issues]] Q4); email proves the approval loop first; SMS policy (3 safe archetypes, blocked topics) is already specified and ready | P2 (FR-CO-7) |
| Partners module (records, referral ledger, privacy-safe status sharing, nurture) | Privacy-safe sharing must be built right the first time — it needs the compliance engine and milestone visibility to exist; a rushed partner surface is a privacy incident waiting to happen | P2 (FR-PA-1..5) |
| Automation engine (triggers, cadences, stop conditions) | The trigger catalog needs real stage events flowing first; P1 ships task-based SLAs only, which exercise the same muscles safely | P2 (FR-AU-1..3, 5..6) |
| Milestone visibility, stall detection, deadline watch | Team-entered milestone facts and the deadline watch depend on the automation event backbone; manual stage moves generate the baseline data | P2 (FR-PL-3..6, FR-TD-6) |
| Dynamic/combined segments | A power feature; People must exist and fill with real data first. The prototype faked its intersections — ours will be computed truthfully, which takes real design | P2 (FR-PE-7) |
| Lead prioritization scoring | Needs behavioral data that only Phase 1 usage generates, plus a documented fair-lending factor review before any score ships | P2 (FR-PE-8, D-11) |
| Marketing module (content studio, campaigns, newsletters, calendar) | The compliance engine ships in P2 serving Conversations; the full 16-family content surface is a product on top of it | P2 (FR-MK-1..7) |
| Intelligence/reporting screens | P1 instruments everything but ships no reporting UI; shipping dashboards before there is data to report is decoration | P2 (FR-IN-1..4) |
| Team surface (team entity, view-as, workload, goals) | Core RBAC roles ship in P1; the management surface serves team leaders after LOs are living in the product | P2 (FR-TM-2..5) |
| Loan Factory platform lead streams (13 website widgets, Facebook Ads "Automatically Created" leads, QM Pricer alerts) | Proven to exist at UI level only — no API is documented ([[Integration_Map]], Q2). P2's web form + CSV covers capture; the ingestion adapter lands when the integration surface is validated | P2 (FR-PE-3) |
| Per-template Vietnamese variants | Requires the named human reviewer (Q5); P1 ships the per-contact language model, and P2's modules ship honestly flagged, which is more credible than unreviewed machine translation | P2 (FR-CO-6) |
| Missing lifecycle content (stage 3/4/7/8 templates, contact-attempt cadence, real triggers for EMT-066–135) | Content authoring workstream, not product-blocking; commissioned during P1, shipped with the P2 automation engine | P2 (FR-CO-9, FR-AU-8) |
| Batch approval of Ally items | Single-item approval builds trust and clean G6 data first; batch approval is a convenience earned by a high approval rate | P2 |
| End-of-day Ally sweep | Depends on a full day of task/lead telemetry patterns; the card/queue foundation comes first | P2 |
| Stage-change automation previews ("moving to Disclosures will queue…") | Meaningless until automations exist | P2 (FR-PL-3) |
| Natural-language search / Ally Q&A over data | ⌘K record search ships in P1; natural-language answers need the analytics layer | P2/P3 |
| Read-only LOS/POS data connections; conversation intelligence; voice | Vendor/legal validation required; nothing is proven ([[Open_Issues]] Q3). When they land, stage and milestone facts sync *in* read-only — the CRM never owns loan-of-record data | P3 |
| Native mobile apps | Not planned at all — responsive web on desktop and mobile browsers (skeleton item 10) is the permanent mobile strategy | — |
| Enterprise anything (multi-branch, white-label, marketplace) | No customer for it yet | P4 |

### Dependencies

| Dependency | Type | Note |
|---|---|---|
| Google OAuth app verification (Gmail restricted scopes) | External, **long lead time** | Needed for the P2 email channel, not for P1 — submit in the first week of P1 anyway; the review is measured in weeks and is outside our control ([[Tasks]] T-602) |
| Anthropic API access via model gateway | External | Needed when live Ally output replaces the controlled mock in P2; the gateway contract is designed against the P1 card/queue shapes; keys never in client code ([[Technical_Architecture]]) |
| Supabase project provisioning | External | Standard |
| Human compliance sign-off on the 135 EMT templates | Content/legal | Gates the P2 send path, not P1 — start the pass during P1 so review never blocks the P2 launch (the pack's own metadata says "final compliance approval required before live send" on every template) |
| Book-of-record answers (Q7) | Jeremy | Shapes the P2 import tooling and pilot onboarding; P1 does not block on it |
| Vietnamese reviewer named (Q5) | Jeremy | Gates P2 VI variants; the P1 per-contact language model ships regardless |
| Design system foundation | Internal | First build item; everything else consumes its tokens ([[Design_System]]) |

### Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Overbuild / scope creep into P2 features** | High | Phase never ships | The 13-item list is closed; any addition requires a [[Decisions]] entry; the cut list above is the standing answer to "while we're at it…" |
| Mock Ally output reads as fake and burns trust | Medium | Signature interaction discredited before live AI arrives | Mock output is clearly labeled as controlled demonstration content and grounded in the seeded records — every evidence link resolves; the retired prototype's fake "Connected" tile is the standing anti-pattern ([[Current_State_Audit]]) |
| Seeded data feels toy-like | Low/Medium | Demos, training, and NTS tests don't transfer to real work | Seed set authored from real mortgage scenarios ([[Mortgage_Workflow_Map]]), spanning all 20 stages and both languages |
| NTS usability thresholds fail late | Medium | Rework | Test per-screen as built, not at phase end; the scorecard is a per-screen ship gate ([[QA_Plan]]) |
| Responsive layouts treated as a polish pass | Medium | Mobile web unusable at pilot | Skeleton item 10 is a per-screen ship gate: no screen is "done" until the flow passes on a phone viewport |
| Single-approver bottleneck (everything queues to one busy LO) | Medium | Queue fatigue, stale cards | Snooze + stale-card expiry (cards die when their trigger no longer applies — stop-condition rule); queue depth telemetry from day one |

### Acceptance criteria

1. Every P1 functional requirement in [[PRD]] passes QA per [[QA_Plan]], including the ported TERA+ scenario suites (used as QA source material) for Today, People, Pipeline, and RBAC.
2. All 13 walking-skeleton items work end to end on the seeded data set — no mock theater anywhere except the clearly-labeled Ally mock output.
3. **The approval contract is structural:** every Ally recommendation card resolves only through approve / edit-then-approve / dismiss / snooze, and no code path exists from a card to any outbound customer communication — proven under adversarial test (G6 hard invariant; structurally guaranteed in P1 because no send path exists, and locked in as the pattern P2's live sends inherit).
4. NTS usability thresholds pass on every P1 screen (lead creation ≤ 2.5 friction, dashboard ≤ 2.75); none of the 12 critical-fail conditions occur (unclear save state, stale-data ambiguity, unrecoverable duplicate, scary permission blocks).
5. Responsive web passes on desktop and mobile browsers: the full morning triage — feed, card verdicts, task completion, stage move — is completable on a phone viewport.
6. The audit logging foundation records every action attributably, timestamped, immutable, exportable — and the G1, G2, G3, G6, G7 baselines are producing from the event spine.
7. A pilot cohort of real LOs (including at least one not-tech-savvy user and one Vietnamese-speaking user) has run their actual morning triage in Loan Factory CRM.

### Proof required (demoable evidence — shown live, on real data paths)

1. **The 7:45am demo:** sign in as an LO; within 60 seconds Today shows the ranked feed and the approval queue on the seeded organization. Every panel shows freshness.
2. **The lead loop (CRM-only):** create a lead with a structured source → it appears on Today within a minute → Ally's recommendation card (controlled mock output, evidence links resolving to the real records) proposes the next step → the LO edits, approves → the outcome lands on the contact timeline → the audit trail shows who/what/when, including the card's provenance and verdict.
3. **The pipeline walk:** create an opportunity (distinct from its contact), move it through three stages manually → stage history is immutable and days-in-stage computes.
4. **The phone demo:** the same morning triage completed end to end in a mobile browser — feed, one card verdict, one task completion, one stage move.
5. **The invariant:** a red-team attempt to make any Ally card produce outbound customer communication fails — there is no send path — and the attempt itself is visible in the audit trail.
6. **The tenancy proof:** two seeded organizations side by side; an attempt to read the other organization's records fails at the database layer (RLS), demonstrated with evidence, not assertion.
7. **The audit pull:** produce the complete audit trail for one contact — every note, task, stage change, and card verdict — in under five minutes (FR-ST-4).

### Estimated complexity by workstream

| Workstream | Rating | Driver |
|---|---|---|
| Product & Design | **L** | Design system foundation + the Today/queue interaction model — the product's signature — must be right |
| Frontend | **L** | App shell, design system build-out, Today, People, Leads, Pipeline board, and the responsive collapse pattern on every screen |
| Backend & Data | **L** | Core schema with RLS tenancy, the audit/event spine, seeded-data tooling |
| AI (Ally) | **M** | Card/queue infrastructure and the controlled mock harness; the live gateway contract is designed here, built in P2 |
| Content & Compliance | **S** | Start the EMT compliance pass for P2; encode the per-contact language model |
| Infrastructure/DevOps | **M** | Environments, CI/CD, serverless deploy, observability, secrets |
| QA | **L** | Scenario porting, per-screen NTS + responsive testing, tenancy and adversarial approval-path tests |

---

## Phase 2 — Communication, automation & the whole team's workflow

**Business outcome:** the CRM starts talking — email goes live through the compliance engine, the 135 EMT templates arrive stage-aware, and live Ally replaces the controlled mock behind the same approval queue. On top of that, the follow-up engine runs the shop: files stop dying of neglect (G4), realtor partners get privacy-safe updates that win repeat referrals, marketing becomes governed production instead of ad-hoc posting, and team leaders manage by exception. Phase 2 converts the Phase-1 baselines into measured improvement.

### Included features

| Area | Feature | Acceptance ref |
|---|---|---|
| Conversations (email) | Google Workspace email as the first verified integration: send/receive/thread, auto-linked to contact and opportunity; compose/reply with relationship context panel; sender-voice correctness (coordinator/processor identities with correct NMLS handling) | FR-CO-1, FR-CO-8 |
| Template layer | All 135 EMT masters imported with full YAML metadata, stable IDs, related-template graph; near-duplicate specialty clones collapsed into parameterized templates; the 17-token merge-field vocabulary resolved from People/Opportunity/Team records; stage-aware suggestion (never a flat gallery); automation-policy tiers imported as data with Manual-Only/Never-Automate hard-blocked from any queue | FR-CO-2..4 |
| Compliance engine (core) | Deterministic pre-send lint on every outbound (do-not-say list, required disclosures incl. the standard footer, NMLS #320841 + LO NMLS + Equal Housing where required, no sensitive data to partners; document requests always point the borrower to the secure external system — the CRM never collects or stores loan documents) + AI compliance review layer; block/revise reasons in plain language | FR-CO-5, FR-MK-3 (core) |
| Ally (live) | The model gateway goes live behind the unchanged P1 card/queue contract: morning daily briefing (pipeline movement, top risks, top opportunities — every claim linked to its source record); next-best-action with the work already done (email drafted from the right EMT template, call script prepared, task pre-filled); draft generation; prompt-injection defenses on all inbound content; end-of-day sweep; next-best-message from the related-template graph; automation recommendations with plain-language previews; live-context message composition at fire time; weekly partner digest for ARMs; rebalancing suggestions | PRD §4.1 Ally, PRD Ally behaviors (P2) |
| Multilingual | Per-contact language drives drafting; EN masters + VI/ZH/ES-CO/RU lifecycle-stage modules; per-template Vietnamese variants (human-reviewed per Q5 — unreviewed variants ship flagged, never silently); conditional language never softened | FR-CO-6 |
| Automation engine | Trigger engine on the full lifecycle event catalog (~60 named events) with timing vocabulary, prerequisites, stop conditions (**always override timing**), escalation, consent/DNC supremacy, health dashboard, per-automation and per-contact kill switches; T0–T3 tier enforcement per [[Automation_Catalog]]; v1 posture — automations prepare and queue, borrower-facing steps require approval | FR-AU-1..3, 5..6 |
| Pipeline (full) | Milestone visibility within TRANSACT: team-entered milestone facts (appraisal, title, insurance, clear-to-close) stored as read-only trigger metadata for communication; a simple "docs still needed" follow-up flag (a communication trigger only — never a per-condition underwriting tracker); stall detection with rescue plays; deadline watch (lock expiry, closing, contingencies) driving follow-up; stage-change automation previews | FR-PL-3..6, FR-TD-6..7 |
| Partners | Partner records with referral ledger (both directions), privacy-safe status sharing (shareable field set only, borrower-authorization gated), tiered nurture cadences, co-marketing via the compliance pipeline (RESPA-aware), relationship-health signals | FR-PA-1..5 |
| Marketing | Content pipeline (brief → generate → lint → AI review → human review → approval states), 16 content families with 3-tier risk routing, campaigns & newsletters with per-send health checks, content calendar, escalation tickets with SLA; manual-first publishing with excellent export (no social APIs claimed) | FR-MK-1..7 |
| People (full) | CSV import with field mapping, dedupe preview, and guided merge; hosted web lead form with structured source; dynamic/static/combined segments (truthful set math); explainable fair-lending-safe lead scoring; LF-platform lead ingestion adapters (widgets, Facebook Ads stream, QM Pricer intents — **gated on Q2 validation**); full routing rules engine | FR-PE-2..4, FR-PE-6..8 |
| Conversations (SMS & content debt) | SMS channel (consent-gated, 3 safe archetypes, blocked topics enforced by policy; 10DLC registration resolved per Q4); missing lifecycle content shipped (stage 3/4/7/8 templates, contact-attempt cadence, real triggers for EMT-066–135); batch approvals | FR-CO-7, FR-CO-9, FR-AU-8 |
| Intelligence | Pipeline analytics (funnel, velocity, stall/fallout with reasons), source performance, rules-based retention radar (manual rate thresholds), funded-loan attribution, weekly role digests | FR-IN-1..4 |
| Team | Team entity, view-as (audit-logged), workload & goals, offboarding/reassignment flows | FR-TM-2..5 |

### Dependencies

| Dependency | Note |
|---|---|
| Phase 1 shipped and adopted (G1 ≥ 70% weekly active) | Automation without adoption automates an empty room |
| Google OAuth app verification complete | Submitted in the first week of P1; the email channel gates on it |
| Human compliance sign-off on the 135 EMT templates | Pass started during P1; every template's own metadata requires it before live send |
| Q2 answered: LF platform API/webhook surface for widget/ad/pricer leads | If no API exists, the ingestion adapter scope changes; the adapter pattern in [[Integration_Map]] isolates the blast radius |
| Q4 answered: SMS provider + 10DLC/A2P registration (carrier lead times apply) | Registration is weeks of external process — start at P2 kickoff |
| Q5 delivered: Vietnamese reviewer producing per-template variants | VI-first is the differentiator; unreviewed variants do not ship |
| Content debt authored: stage 3/4/7/8 templates, EMT-066–135 real triggers | Commissioned during P1 (Q10 owner) |
| n8n execution backbone hardened for production automation jobs | Behind the first-party Automations UX — users never see n8n (D-09) |

### Risks

| Risk | Mitigation |
|---|---|
| Automation incident (wrong send, consent miss) destroys trust in one day | Tier enforcement is structural (T0 topics cannot be drafted; Manual-Only templates cannot enter queues); stop conditions and DNC supremacy tested adversarially; global and per-contact kill switches ship with the engine, not after |
| The first live sends expose gaps the mock never could | The P1 approval contract carries over unchanged; the compliance lint and adversarial send-path suite are release blockers before any real borrower receives anything |
| LF platform has no API (Q2 negative) | Fall back to supported capture (forms, CSV, forwarding parsers) and keep the adapter interface; do not scrape — brittle and unsupportable |
| SMS carrier compliance (10DLC) slips | SMS is additive; every SMS archetype has an email equivalent; the phase does not gate on it |
| Segment/scoring math errors (the prototype faked intersections; we must not fake anything) | Property-based tests on set operations; scoring factors documented + disparate-impact review before launch (D-11) |
| Partner privacy leak | The shareable field set is a hard allowlist at the API layer, not a UI filter; QA includes the "agent asks for private data" edge case |
| Migration data quality (duplicates, dead emails, unknown consent) | Dedupe preview + guided merge are P2 features precisely for this; unknown-consent contacts import as non-contactable until consent is recorded |
| Marketing surface sprawls (16 families is a lot) | Ship families in risk order: low-risk education content first; High-risk families ship only after the escalation/review loop is proven |

### Acceptance criteria

1. All P2 FRs pass QA including the full TERA+ suites (as QA source material) for Conversations, Automations, Marketing, and Partners, plus all 13 stress scenarios and remaining edge cases.
2. **Zero autonomous borrower-facing sends is proven under adversarial test** — now that a send path exists, there is no code path from Ally to a send that bypasses the approval queue, including under prompt-injected inbound email content (G6 hard invariant).
3. Every automation demonstrates: prerequisite enforcement, stop-condition override, consent/DNC supremacy, escalation, and complete audit trail — under adversarial test.
4. Compliance invariants hold under test: 100% of outbound passes lint + approval; NMLS/Equal Housing rendering correct; consent/DNC changes propagate instantly; audit trail complete for every AI action.
5. G3 (follow-up SLA ≥ 95%) and G4 baseline-vs-actual (stalled-file reduction trending toward 25%) measured on real usage.
6. Zero privacy-matrix violations in partner-facing outputs under test; zero blocked-topic SMS possible.
7. Disparate-impact review of lead scoring completed and documented before scores are user-visible.
8. NTS thresholds pass on all new screens; automation cards read as plain English to an NTS tester.

### Proof required

1. **The first real lead loop:** submit the hosted web form as a fake borrower → the LO is notified within a minute → the lead appears on Today with source recorded → Ally has drafted the first touch from the correct EMT template (EMT-001–003 by source type) with merge fields filled → the LO edits one line, approves → the email sends via the LO's real Gmail → the send appears on the contact timeline → the audit trail shows who/what/when, including Ally's provenance.
2. **The compliance block:** attempt to send a draft containing "guaranteed approval" → hard block with a plain-language reason; attempt a document-request email asking for attachments → block with the rule cited: documents go to the secure external system, never through the CRM.
3. **The docs-needed follow-up:** flag an opportunity "docs still needed" → the cadence queues an EMT reminder for approval on schedule → the team clears the flag → every pending step dies instantly (stop condition), shown live.
4. **The partner update:** confirm a shareable milestone → Ally drafts the realtor update containing only milestone/timeline/next-step-owner → attempt to inject a private detail → structurally impossible, not just hidden.
5. **The campaign:** build a dynamic segment in plain English → per-send health check names blockers with one-tap fixes ("no email on file — will be skipped") → send a newsletter → analytics report delivered/opened/clicked truthfully.
6. **The exception view:** as a team leader, see cross-LO SLA breaches and a stalled file → view-as the LO (audit-logged) → the rescue play is one tap.
7. **The kill switch:** mid-demo, kill one automation globally and one per-contact; queued items vanish; audit trail records both.
8. **The Vietnamese send:** a reviewed per-template VI variant sends to a VI-preference contact with placeholders intact and conditional language unsoftened.

### Estimated complexity by workstream

| Workstream | Rating | Driver |
|---|---|---|
| Product & Design | **L** | Conversations, automation cards, Partners, Marketing pipeline, Team — five new surfaces |
| Frontend | **XL** | Widest phase by screen count |
| Backend & Data | **XL** | The automation engine (triggers, timers, stop conditions, health) is the hardest system in the product; plus Gmail sync and template/merge-field services |
| AI (Ally) | **L** | Live gateway, briefing, draft generation, fire-time composition, recommendations, scoring explainability, injection defenses |
| Content & Compliance | **L** | EMT import + sign-off, lint rule encoding, VI variants, missing templates, EMT-066–135 triggers, 16-family review postures |
| Infrastructure/DevOps | **M** | n8n production hardening, job reliability, SMS provider |
| QA | **XL** | Send-path and automation adversarial testing is release-critical |

### Explicitly deferred from Phase 2

True auto-send for any template (P3 earned-autonomy decision) · rate-aware refi radar (needs market-rate feed, Q8) · conversation intelligence/voice · social publishing APIs (manual-first holds until validated) · read-only LOS/POS data connections · natural-language analytics Q&A · keyword-triggered DM plays (needs SMS/DM channel maturity) · enterprise/multi-branch anything.

---

## Phase 3 — Intelligence and the database

**Business outcome:** the database becomes a revenue engine (G5: ≥10% of monthly funded units database-attributed), the system starts making the team measurably better — and the first carefully-gated autonomy decision is made on evidence, not vibes.

### Included features

| Area | Feature | Acceptance ref |
|---|---|---|
| Retention radar (rate-aware) | Market-rate feed integration (vendor per Q8); refi-opportunity flags from rate-on-file vs. market; annual-review and anniversary automations at full strength; opportunity briefs with compliant outreach drafted — never a savings guarantee | FR-IN-3 (full) |
| Conversation intelligence | Call transcription/summary, sentiment and commitment extraction into timelines; recording-consent and state recording-law compliance built in; unshareable-data-request detection with compliant deflection drafts | FR-IN-5, FR-PA Ally (P3) |
| Coaching | Per-LO scorecards vs. team benchmarks, Ally-drafted coaching notes for team-leader review; factors documented, fair-lending-safe | FR-IN-6 |
| Read-only LOS/POS data connections | Stage and milestone facts sync **read-only** from whatever systems Loan Factory LOs actually close in (Q3 answers first); milestone-driven communication triggers move from manual team entry to source-system confirmation; sync in, communication out — the CRM never owns or edits loan-of-record data | [[Integration_Map]] |
| Earned autonomy decision | Per-automation graduation to true auto-send, only for source-framework "Fully Automated" templates with 50+ approvals and <5% edit rate, flipped on explicitly by Jeremy, with daily digest + kill switch — the proposal in [[Automation_Catalog]] §1, decided here on real G6 data | FR-AU-3 |
| Ally intelligence | Natural-language questions over the user's own data with linked underlying records; automation outcome tuning proposals; keyword-triggered plays (social DM keyword → checklist + lead) if channel validation lands | FR-IN Ally, FR-AU-7 |
| Social publishing APIs | Only if validated; manual-first export remains the fallback | FR-MK-7 (P3) |

### Dependencies

Phase 2 automation engine trusted in production (its telemetry is the input to the autonomy decision) · Q3 (LOS landscape) answered — a conversation, not code · Q8 market-rate vendor selected and licensed · recording-consent legal review for conversation intelligence.

### Risks

| Risk | Mitigation |
|---|---|
| LOS integration surface turns out to be poor or nonexistent | The adapter pattern isolates it; manual milestone entry (P2 behavior) remains the fallback — the product degrades gracefully, never blocks |
| Autonomy graduation causes the first unattended bad send | Graduation criteria are mechanical and per-automation; digest + kill switch ship first; one incident auto-revokes the automation to T2 |
| Recording laws (two-party consent states) | Consent capture is in-product and per-call; no consent, no recording — enforced structurally |
| Rate-display licensing on refi briefs | Briefs reference "rate on file vs. current market" direction, not quoted offers; compliance lint extends to rate language |

### Acceptance criteria

1. All P3 FRs pass QA including the LOS-adjacent TERA+ scenario suites and the borrower-communication scenarios (the 15 borrower personas and 10 borrower scenarios serve as QA source material for outreach content — the ~50–60 suites deferred in P1/P2).
2. G5 attribution measurable: funded loans carry driving-trigger provenance.
3. Autonomy graduations (if any) show zero incidents and a complete daily-digest trail.
4. Synced facts are visibly read-only: a milestone confirmed by a source system cannot be edited in the CRM — no edit path exists.
5. Conversation intelligence stores nothing without recorded consent.

### Proof required

1. **The reactivation win:** a 2023 funded client's rate-on-file exceeds market threshold → radar flags → Ally's brief shows the math source → LO approves outreach → reply lands → new opportunity created with database attribution visible in Intelligence.
2. **The graduation:** one automation crosses the threshold → Jeremy flips it on → it sends unattended → the daily digest reports it → the kill switch reverts it in one tap.
3. **The read-only handshake:** an LOS milestone (e.g. CTC) syncs read-only via integration and fires the follow-up trigger that previously required manual team entry — with the CTC ≠ funded language rule intact and no CRM-side edit path to the synced fact.
4. **The coaching note:** a team leader reviews an Ally-drafted coaching note grounded in real response-time data, edits, and delivers it.

### Estimated complexity by workstream

| Workstream | Rating | Driver |
|---|---|---|
| Product & Design | **M** | Intelligence, coaching, and conversation surfaces |
| Frontend | **L** | Intelligence surfaces + conversation timelines |
| Backend & Data | **XL** | Read-only LOS connections, rate feed, transcription pipeline |
| AI (Ally) | **XL** | NL analytics, conversation intelligence, coaching, autonomy governance |
| Content & Compliance | **M** | Rate-language rules, recording consent, reactivation content in EN/VI |
| Infrastructure/DevOps | **L** | Media/transcription infra, integration reliability |
| QA | **L** | Integration contract tests; borrower-persona-based communication QA |

### Explicitly deferred from Phase 3

Multi-branch/enterprise admin · white-label · marketplace · custom object configurability · servicing/payments (never — out of scope, [[PRD]] §6) · recruiting/training platform surfaces.

---

## Phase 4 — Enterprise, scale, and the platform play

**Business outcome:** Loan Factory CRM grows from Jeremy's team's daily CRM into an asset that can carry multiple branches — and, if the business chooses (Q9), other brokerages — without weakening the opinionated core that made it work.

### Included features

| Area | Feature |
|---|---|
| Multi-branch | Branch hierarchy, branch-leader role at full strength, cross-branch rollups, branch-level compliance configuration (state rules per footprint) |
| Enterprise admin | Org-wide policy management, SSO/SCIM evaluation, data-residency and retention controls, advanced RBAC administration |
| White-label | Theming/branding layer on the design token system (the token architecture from [[Design_System]] is the enabler — built once in P1, monetized here) |
| Advanced analytics | Cohort and forecasting views, source-ROI modeling, cross-branch benchmarks, exportable executive reporting |
| Marketplace | Curated extensions: template packs (multilingual content networks per the Loan Factory team-marketing vision), automation recipes, partner integrations; every extension passes the same compliance pipeline as first-party content |
| Configurability (bounded) | The carefully-limited custom-field/custom-view layer deferred since P1 — never a generic object builder; every surface still serves the 20-stage lifecycle |

### Dependencies

Q9 answered: tenant model (single Loan Factory tenant vs. multi-brokerage SaaS) — this decision shapes everything in the phase and is a business decision, not an engineering one · P1's RLS tenant isolation proven at scale · compliance ownership model for multi-state, multi-brand operation.

### Risks

| Risk | Mitigation |
|---|---|
| Enterprise features dilute the opinionated core | The 20-stage lifecycle and Ally contract are non-configurable at every tier; white-label changes skin, never behavior |
| Multi-tenant compliance liability (another brokerage's bad send) | Per-tenant compliance configuration with mandatory floors (the invariants in [[Mortgage_Compliance]] cannot be disabled by any tenant) |
| Marketplace quality erosion | Curated, not open; extensions pass the same lint + review pipeline |

### Acceptance criteria

All P4 FRs (FR-TM-6 among them) pass QA · tenant-isolation penetration testing passes · a second branch (or second tenant, per Q9) runs production workload with zero cross-tenant data visibility · white-label instance passes the full compliance display requirements under its own branding.

### Proof required

1. Two branches (or tenants) live side by side; an attempt to access cross-tenant data fails at the database layer (RLS), demonstrated with evidence, not assertion.
2. A white-labeled instance with different branding produces a compliant borrower-facing send with the correct entity's NMLS and disclosures.
3. A marketplace template pack installs, passes lint, and is used in a live approved send.
4. Branch-leader rollup reporting reconciles exactly with per-LO Intelligence numbers.

### Estimated complexity by workstream

| Workstream | Rating | Driver |
|---|---|---|
| Product & Design | **M** | Admin surfaces; the design system does the white-label heavy lifting |
| Frontend | **L** | Admin, analytics, marketplace surfaces |
| Backend & Data | **L** | Tenancy hardening, SSO/SCIM, retention controls |
| AI (Ally) | **M** | Per-tenant guardrail configuration |
| Content & Compliance | **L** | Multi-state/multi-brand compliance configuration |
| Infrastructure/DevOps | **L** | Scale, isolation, marketplace delivery |
| QA | **L** | Penetration/isolation testing |

---

## Cross-phase sequencing rules

1. **A phase starts only after the previous phase's proof list has been demonstrated** — live, on real data paths. Partial credit does not open the next phase.
2. **Compliance invariants never phase-gate downward.** Everything in [[Mortgage_Compliance]] and the tier rules in [[Automation_Catalog]] apply from Phase 1 forward, in full.
3. **Instrumentation precedes targets.** Phase 1 measures; Phase 2+ improves against those measurements. No target is ever declared against an unmeasured baseline.
4. **Integrations are adapters — and data connections are read-only.** Every external system (Google, LF platform, SMS, LOS, rate feeds) sits behind an adapter interface ([[Integration_Map]]); loan-side facts sync *in* read-only and communication flows *out* — the CRM never takes ownership of loan origination data — so a vendor surprise changes one module, not the product.
5. **Open issues gate scope, not starts.** Q-items block only the features that need them; the phase proceeds around them (e.g., P2 proceeds without SMS if 10DLC drags).
6. **Deferred means deferred.** Anything on a phase's deferred list that someone wants early goes through [[Decisions]] with Jeremy's sign-off — the roadmap changes by decision log, not by drift.

Related: [[Tasks]] · [[PRD]] · [[Decisions]] · [[Open_Issues]] · [[QA_Plan]] · [[Automation_Catalog]] · [[Integration_Map]] · [[Technical_Architecture]] · [[Vision]]
