# PRD — Loan Factory CRM Product Requirements

Purpose: this is the master specification for Loan Factory CRM (working name, see [[Decisions]] D-12) — the AI-powered mortgage CRM for Loan Factory loan officers and their teams. It defines who the product is for and what hurts them today, what success is measured by, the 30 core capabilities grouped into the 10 locked navigation modules, and — for each module — the user stories, functional requirements, AI behaviors, and delivery phase. Every requirement here is consistent with [[Decisions]] and the locked product canon; deeper detail lives in the sibling documents linked throughout ([[Screen_Specifications]] for the UI, [[Data_Model]] for entities, [[Automation_Catalog]] for triggers, [[AI_Product_Architecture]] for AI internals, [[Mortgage_Compliance]] for the guardrails). If a build question is not answered here or in a linked doc, log it in [[Open_Issues]] before improvising.

---

## 1. Problem statements by user type

Loan Factory CRM serves 7 product user types (see [[User_Personas]] for the full persona set, built on the 111-persona TERA+ framework as discovery source material). Borrowers are deliberately not on this list: they live in the CRM as contacts, and the borrower personas inform communication content and QA scenarios only — they never become product users. Each product user type has a distinct daily pain the current tools do not solve. The existing prototype — an email-marketing micro-tool with no pipeline, no loan stages, no partner management, and no next-best-action ([[Current_State_Audit]]) — solves none of them.

| User | The problem today | What the CRM must change |
|---|---|---|
| **Loan officer** (primary) | Works out of an inbox, a spreadsheet, sticky notes, and the LOS. Leads from Facebook Ads, website widgets, and referrals arrive with no follow-up system; hot leads go cold in hours; past clients are forgotten the day after funding. Every morning starts with "what am I missing?" instead of "here's what matters." | One screen (Today) that already knows what matters now, with the work pre-drafted and one tap from done. Nothing falls through: not a new lead, not a stalled file, not a past client whose rate just became refinance-worthy. |
| **LO assistant / loan coordinator** | Lives in role-boundary anxiety: "am I allowed to send this?" Handoffs from the LO are verbal or buried in email. No clear queue of what the LO needs from them and by when. | A clear, permission-aware work queue with explicit ownership, safe pre-approved templates in the coordinator's sender voice (EMT-048–051), and blocks that explain *who* owns an action instead of a scary "access denied." |
| **Processor / ops staff** | Chases documents and third parties by memory. Status questions from LOs and borrowers interrupt all day because nobody can see file state without asking. | Stage and milestone visibility per file — facts the team records in the CRM — plus docs-needed follow-up cadences (drafted, human-approved) and status that answers itself so processors process instead of narrating. The chasing communication lives here; the documents themselves never do. |
| **Team leader** | Cannot see the team's pipeline without collecting screenshots. Coaching is anecdotal. No way to catch an overwhelmed LO before files stall. | A team view of pipeline health, SLA compliance, and stalled-file risk per LO; view-as workspaces; coaching signals grounded in real activity data. |
| **Branch leader** | Aggregated production numbers arrive late and hand-assembled. No early-warning on fallout trends or compliance exposure across teams. | Roll-up Intelligence dashboards: production, conversion by stage, fallout causes, template/automation compliance posture — current, not month-old. |
| **Agent relationship manager** | Realtor relationships live in one person's phone. No record of referral reciprocity, no consistent partner updates, and the #1 realtor complaint — "I never know where my buyer's loan stands" — has no systematic answer. | A Partners system of record: referral tracking in both directions, privacy-safe automated status updates (milestone/timeline/owner only — never credit, income, assets, or conditions), and co-marketing workflows. |
| **Marketing coordinator** | Content is produced ad hoc across Custom GPTs, Canva, and docs; compliance review is manual and inconsistent; nobody can answer "is this live, and was it approved?" | A Marketing module with a governed pipeline: brief → AI draft → deterministic compliance lint → human review → approval states → publish record. The 16 content families, risk tiers, and reviewer roles from the marketing content OS become product features. |

---

## 2. Goals and success metrics

The product thesis: **the system tells the user what to do next, and AI has already done most of the work — the human approves.** Success is measured against that thesis, not vanity engagement.

| # | Goal | Metric | Target | Phase measured | How measured |
|---|---|---|---|---|---|
| G1 | LOs adopt the CRM as the daily command center | Weekly active LOs ÷ licensed seats; Today screen opened ≥ 4 business days/week | ≥ 70% weekly active by end of first Phase-1 quarter; ≥ 85% by Phase 2 | P1→ | Auth/session analytics per role |
| G2 | New leads get touched fast | **Time-to-first-action**: median minutes from lead creation to first logged outbound attempt (call logged, email/SMS approved-and-sent) | Median < 5 minutes during business hours; 95th percentile < 4 business hours | P1→ | Lead record timestamps ([[Data_Model]]) |
| G3 | Follow-up commitments are kept | **Follow-up SLA hit rate**: % of due follow-ups (tasks + automation cadence steps) completed within their SLA window | ≥ 95% (per-stage SLAs defined in [[Mortgage_Workflow_Map]]) | P1→ | Task/cadence engine telemetry |
| G4 | Fewer files die of neglect | **Fallout reduction**: % of active files with zero activity > 7 days; ENGAGE→QUALIFY conversion rate | Stalled-file rate cut 25% vs baseline within 2 quarters of Phase 2; conversion up measurably (baseline set in Phase 1) | P2→ | Pipeline stage + activity analytics (Intelligence module, §4.8) |
| G5 | The database becomes a revenue engine | **Retention/reactivation revenue**: funded loans attributed to post-close, annual-review, and refinance-opportunity triggers (stages 17–20) | ≥ 10% of monthly funded units database-attributed by Phase 3; every funded loan enters RETAIN automations within 24h | P2→ | Loan source attribution on funded records |
| G6 | AI is trusted, not tolerated | AI draft approval rate; median edit distance on approved drafts; **zero** borrower-facing sends without human approval (hard invariant, not a target) | ≥ 60% of AI drafts approved (with or without edits) by end of Phase 2 — Phase 1 ships the approval shell on controlled mock output so the metric is instrumented from day one; unapproved-send count = 0, always | P1→ (instrumentation) / P2→ (target) | Approval-queue telemetry + audit trail ([[AI_Product_Architecture]]) |
| G7 | "Toddler simple" is real, not a slogan | Not-tech-savvy (NTS) friction thresholds from the TERA+ usability scorecard | A screen ships only when its NTS threshold passes (e.g. lead creation ≤ 2.5 friction, dashboard ≤ 2.75); the 12 critical-fail conditions are release blockers | Every phase | Usability testing per [[QA_Plan]] |
| G8 | Compliance posture holds | Pre-send lint pass rate; count of blocked sends that were correct blocks; audit-trail completeness for AI actions | 100% of borrower-facing/public content passes through lint + approval; 100% of AI actions logged and attributable | P1→ (audit trail; no outbound sends exist in Phase 1) / P2→ (lint gating) | Compliance engine + audit log ([[Mortgage_Compliance]]) |

Baseline note: Jeremy's current tooling produces no reliable baselines for G2–G5. Phase 1 instruments everything from day one so Phase 2 targets are measured against real Phase-1 data, not guesses.

---

## 3. The 30 core capabilities, mapped to the 10-item navigation

The locked navigation ([[Decisions]] D-03): **Today · Pipeline · People · Partners · Conversations · Marketing · Automations · Intelligence · Team · Settings.** The mission's 30 core capability areas distribute across it as follows. Phase tags follow the locked roadmap boundaries ([[Implementation_Roadmap]]): P1 foundation, P2 automation & partners, P3 intelligence, P4 enterprise.

Phase 1 is a walking skeleton, scoped to exactly thirteen items ([[Implementation_Roadmap]]): (1) authentication; (2) organization and user tenancy; (3) People; (4) Leads; (5) CRM opportunity records with mortgage stages; (6) Tasks; (7) Notes and activity history; (8) the Today command center; (9) seeded demonstration data; (10) responsive desktop and mobile web layouts; (11) basic AI recommendation cards using controlled mock AI output; (12) the approval workflow shell; (13) the audit logging foundation. Explicitly excluded from Phase 1: a borrower portal, LOS functionality, loan applications, document uploads, underwriting, pricing, credit, disclosures, autonomous customer communication, and unverified external integrations. P1 tags below always mean "within this skeleton."

| # | Capability | Module | Phase |
|---|---|---|---|
| 1 | Daily command center (urgency-ranked "what matters now") | Today | P1 |
| 2 | AI daily briefing (morning summary of pipeline, risks, wins) | Today | P1 (mock-content card) / P2 (live briefing) |
| 3 | Next-best-action approval queue (one-tap approve/edit/dismiss) | Today | P1 |
| 4 | 20-stage loan pipeline with 5 macro-phase board | Pipeline | P1 (basic) / P2 (full) |
| 5 | Milestone & status visibility per file (team-entered facts; future read-only sync) | Pipeline | P2 |
| 6 | Stall & fallout detection with rescue plays | Pipeline | P2 |
| 7 | Deadline watch (rate-lock expiry, closing dates, contract dates) | Pipeline | P2 |
| 8 | Contact & lead management (people, not "lists") | People | P1 |
| 9 | Lead capture & routing (forms, CSV, widgets, ad leads) | People | P1 (manual entry) / P2 (forms, CSV, LF platform streams) |
| 10 | Lead prioritization scoring (fair-lending-safe, explainable) | People | P2 |
| 11 | Segmentation: dynamic/static/combined smart lists | People | P2 |
| 12 | Duplicate detection & merge | People | P2 |
| 13 | Partner records & relationship strength tracking | Partners | P2 |
| 14 | Privacy-safe partner status sharing | Partners | P2 |
| 15 | Referral tracking & reciprocity ledger, co-marketing | Partners | P2 |
| 16 | Unified conversations inbox (email first; SMS later) | Conversations | P2 |
| 17 | Stage-aware template library (135 EMT masters) | Conversations | P2 |
| 18 | AI message drafting with mandatory approval | Conversations | P1 (approval shell + mock cards) / P2 (live drafting) |
| 19 | Multilingual communication (per-contact language, EN/VI first) | Conversations | P1 (data model) / P2 (EN/VI modules + variants) |
| 20 | Content generation studio (16 content families, risk-tiered) | Marketing | P2 |
| 21 | Campaigns, newsletters & content calendar | Marketing | P2 |
| 22 | Compliance pre-publish engine (lint + AI review + human approval) | Marketing | P2 (engine lands with Conversations sending; full marketing surface follows) |
| 23 | Trigger-based automation engine (triggers, prerequisites, stop conditions, policy tiers) | Automations | P2 |
| 24 | Follow-up cadences & SLA enforcement | Automations | P1 (task due dates + Today alerts) / P2 (full cadence engine) |
| 25 | Automation health monitoring & pre-send validation | Automations | P2 |
| 26 | Production & pipeline reporting | Intelligence | P2 |
| 27 | Database reactivation & retention radar (refi opportunity, annual review) | Intelligence | P2 (rules) / P3 (rate-aware) |
| 28 | Conversation intelligence & coaching | Intelligence | P3 |
| 29 | Team management (roles, assignment, view-as, workload, goals) | Team | P2 |
| 30 | Governance: auth, consent & DNC management, full audit trail | Settings | P1 (auth, audit foundation, consent fields) / P2 (consent/DNC enforcement across channels) |

Enterprise controls / white-label / marketplace (P4) are roadmap items specified at concept level in [[Screen_Specifications]] and [[Implementation_Roadmap]]; they are deliberately not among the 30 core areas because they extend the system rather than define it. There is no borrower portal on any horizon: borrowers are CRM contacts, and everything the product does for them is communication a team member approves (§6).

---

## 4. Module specifications

Requirement IDs are stable — reference them in tickets. "AI behaviors" always operate under the contract in [[Decisions]] D-05: **AI prepares, the human approves.** No borrower-facing communication ever sends autonomously in v1; every AI action is logged, attributable, and reversible where possible.

### 4.1 Today — the command center (capabilities 1–3)

Default landing for every role, never called "Home" ([[Decisions]] D-02). The design question, taken verbatim from the usability scorecard: *"Does the dashboard show the next right action, or does it become another place to hunt?"*

**User stories**
- As an LO, I open the CRM at 7:45am and in under 60 seconds I know: which files are at risk today, which new leads arrived overnight, what AI has drafted for my approval, and what I've committed to do — ranked by urgency, not recency.
- As an LO, I approve, edit, or dismiss each AI-prepared action with one tap, and the queue shrinks as I work.
- As a loan coordinator, my Today shows only work I own or that's been handed to me, with the owning LO named on anything I can't act on.
- As a team leader, my Today surfaces team-level exceptions (SLA breaches, stalled files, unassigned leads) above my personal tasks.

**Functional requirements**

| ID | Requirement | Phase |
|---|---|---|
| FR-TD-1 | Urgency-ranked feed combining: new leads awaiting first touch, tasks due, AI approval items, deadline alerts, stalled-file flags (deadline and stall items appear as their P2 engines ship — FR-TD-6, FR-PL-5). Ranking factors documented and visible ("why is this first?"). | P1 |
| FR-TD-2 | Every feed item carries one primary action (call, approve draft, complete task, open file) executable without leaving Today. One obvious primary action per item — the "toddler simple" standard. | P1 |
| FR-TD-3 | Role-aware composition: LO / assistant / processor / team-leader variants show only what that role owns or supervises (RBAC per [[Technical_Architecture]]). | P1 |
| FR-TD-4 | AI approval queue: pending drafts and suggested actions with approve / edit-then-approve / dismiss / snooze; dismissals capture an optional reason to improve suggestions. In Phase 1 this is the approval workflow shell running on controlled mock AI output; live drafting arrives in P2. | P1 |
| FR-TD-5 | Explicit freshness: every data panel shows when it was last updated (scorecard critical-fail: "cannot tell if data is current"). | P1 |
| FR-TD-6 | Deadline strip: rate-lock expirations, closing dates, contract contingency dates within the configurable horizon, colored by the urgency status system ([[Design_System]]). | P2 |
| FR-TD-7 | Team-leader exception view: cross-LO SLA breaches, aging unassigned leads, files stalled > threshold. | P2 |
| FR-TD-8 | Today calendar strip: today's appointments and scheduled calls, time-ordered, sourced from in-app appointments and the synced Google Calendar (FR-PE-9); each entry opens its contact or opportunity. | P2 (with FR-PE-9) |

**AI behaviors**
- **Daily briefing** (P2; Phase 1 stands in a controlled mock-content card): each morning AI composes a plain-language summary — pipeline movement since yesterday, top 3 risks, top 3 opportunities, today's commitments. Read-only; every claim links to its source record (scorecard requirement: source evidence must be verifiable).
- **Next best action** (P1 as basic recommendation cards on controlled mock AI output through the approval shell; live context-driven proposals P2): for each priority item AI proposes the concrete action *with the work already done* — the email drafted from the right EMT template, the call script prepared, the task pre-filled. Factors behind the ranking are shown on demand; no protected-class or proxy features, ever ([[Decisions]] D-11).
- **End-of-day sweep** (P2): "3 leads got no touch today; 2 tasks slipped — want me to draft tomorrow's catch-up plan?"

### 4.2 Pipeline — opportunity and stage visibility (capabilities 4–7)

The locked 20-stage lifecycle grouped into ENGAGE / QUALIFY / TRANSACT / RETAIN / GROW ([[Decisions]] D-06; full stage map, entry/exit criteria, and per-stage SLAs in [[Mortgage_Workflow_Map]]). Pipeline is CRM opportunity and relationship visibility, not loan origination: stage and milestone facts are entered by the team in v1 and may later sync read-only from external systems (LOS/POS) via future integrations ([[Integration_Map]]). The CRM never owns loan-of-record data — it uses these facts to prioritize relationship work and trigger communication.

**User stories**
- As an LO, I see my whole book as 5 macro-columns and drill into any of the 20 stages; I move a file by dragging it, and the CRM tells me what that stage change triggers before it happens.
- As a processor, I see every file in TRANSACT with its current milestone facts, its docs-needed flag, and how long it has sat there.
- As an LO, when my borrower's rate lock expires in 4 days, I don't have to remember — the file is flagged and AI has drafted the borrower conversation for me to review (rate-lock discussions are Never-Automate class: human-initiated, human-sent).
- As a team leader, I see which stages are the team's bottleneck this month.

**Functional requirements**

| ID | Requirement | Phase |
|---|---|---|
| FR-PL-1 | Pipeline board: 5 macro-phase columns with drill-in to the 20 stages; list and board views; filter by LO, stage, loan program, source, language, days-in-stage. | P1 (basic board + manual stage moves) |
| FR-PL-2 | The loan opportunity is a first-class CRM record distinct from the contact (one person, many opportunities over a lifetime) with program, purpose, amount, property, key dates, participants (LO, coordinator, processor, realtor(s), lender). It is a relationship and stage record only — the loan of record lives in the LOS, never here. The prototype's contact-IS-the-loan model is explicitly rejected ([[Current_State_Audit]]). | P1 |
| FR-PL-3 | Stage-change events feed the automation engine; before confirming a move, the CRM previews which automations will arm ("Moving to Disclosures will queue the disclosure-reminder cadence — pending your approval"). | P2 |
| FR-PL-4 | Milestone visibility within TRANSACT stages: appraisal (ordered/scheduled/received), title, insurance, and a simple docs-needed follow-up flag — team-entered facts (future read-only sync) whose timestamps exist purely as visibility and communication-trigger metadata, using the event vocabulary from the communication framework's trigger catalog ([[Automation_Catalog]]). No per-condition tracker, no disclosure work surface, no document collection — that work lives in the systems built for it; the CRM drafts the follow-up communication those facts warrant. | P2 |
| FR-PL-5 | Stall detection: configurable per-stage no-activity thresholds flag files; each flag proposes a rescue play (re-engage template, task, escalation to team leader). | P2 |
| FR-PL-6 | Deadline watch: lock expiry, closing date, contingency dates with escalating urgency states; "Clear to Close" language rules enforced (CTC ≠ funded — [[Mortgage_Compliance]]). | P2 |
| FR-PL-7 | Stage names are the locked plain-language names; no user-facing renames without a Decisions entry. Stage history is immutable audit data. | P1 |

**AI behaviors**
- Flags at-risk files with the *reason* ("no borrower contact in 9 days, disclosures unsigned") and drafts the rescue outreach for approval (P2).
- Summarizes any file on demand: plain-language status a borrower or realtor could hear, with the private/shareable distinction pre-applied (P2).
- Never moves a file between stages autonomously. Stage suggestions ("this file looks Clear to Close — confirm?") require human confirmation, and milestone claims must trace to a confirmed source event, per the trigger governance rule "trigger confirmation must come from a source system or assigned file owner."

### 4.3 People — contacts, leads, and the database (capabilities 8–12)

People are humans with histories, not rows in a mailing list. Segments serve the person model, not the reverse.

**User stories**
- As an LO, every lead — from a Loan Factory website widget, a Facebook ad, a realtor text, or a past-client referral — lands in one place with its source recorded, and I'm notified within a minute.
- As an LO, I open a contact and see everything: loans past and active, every conversation, every task, language preference, consent status, referral relationships.
- As an LO with 400 past clients, I can pull "funded 2023–2024, 30-yr fixed, no contact in 90 days" as a living segment without writing a query.
- As an assistant, when I accidentally create a duplicate, the CRM catches it and walks me through a merge instead of leaving two half-records (scorecard critical-fail: unrecoverable duplicates).
- As an LO, when a lead says yes to a consultation, I book it right from the lead — date, time, channel — it lands on my Google Calendar, and the CRM offers to move the lead to Consultation Scheduled with one confirmation.

**Functional requirements**

| ID | Requirement | Phase |
|---|---|---|
| FR-PE-1 | Contact record: identity, per-contact **language preference** (EN/VI first-class, ZH/ES/RU supported in the model — [[Decisions]] D-08), consent flags per channel (email/SMS/phone), DNC status, relationship links (borrower↔co-borrower, referred-by, realtor). | P1 |
| FR-PE-2 | Lead capture: in-app quick-create, web form, CSV import with field mapping and dedupe preview. Structured source model: channel → campaign → ad/widget → form (replacing the flat "Automatically Created" tag from the LF Facebook tool). | P1 (in-app quick-create, running on seeded demonstration data) / P2 (web form, CSV import) |
| FR-PE-3 | Lead ingestion from Loan Factory platform surfaces (13 website widget types incl. Quote form, Rate table, 1003 Application Widget; Facebook Ads lead stream; QM Pricer rate-alert/apply/qualify intents as distinct lead types). These are lead sources only — the application and pricing experiences live on the Loan Factory platform, never in the CRM. The surfaces are UI-proven only — no public API is documented — so build behind an ingestion adapter per [[Integration_Map]]. | P2 |
| FR-PE-4 | Lead routing: assignment rules (round-robin, source-based, language-based, Default-LO parity with the existing LF concept) with notification and an unassigned-lead alarm. | P1 (manual assignment) / P2 (rules engine) |
| FR-PE-5 | Activity timeline per contact: conversations, tasks, notes, stage changes, automation touches, AI actions — one merged, filterable stream. | P1 |
| FR-PE-6 | Duplicate detection on create/import (email, phone, name+DOB fuzzy) with guided merge preserving both histories. | P2 |
| FR-PE-7 | Segments: static lists, dynamic rule-based lists in plain English ("Funded & rate on file ≥ 0.5% above market"), combined lists (union/intersection — computed truthfully, unlike the prototype's faked intersection). Segments feed Marketing and Automations. | P2 |
| FR-PE-8 | Lead scoring: explainable priority score from behavioral and file-progress signals only (response recency, engagement, source quality, stage velocity). Factors documented in [[AI_Product_Architecture]]; disparate-impact review cadence in [[Mortgage_Compliance]]. Score shown with its top factors, never as a bare number. | P2 |
| FR-PE-9 | Consultation scheduling: an appointment record (date/time, channel — phone/video/in-person — linked contact and loan) created in-app via the lead inbox "Book consultation" quick action or from any contact/loan record. Two-way Google Calendar sync rides the same Google Workspace OAuth as FR-CO-1 — booked consultations write to the LO's calendar, and calendar events feed the Today strip (FR-TD-8) — per [[Integration_Map]] §2.1; Calendar scope is part of the Google OAuth verification track ([[Implementation_Roadmap]], T-602) — external connections ship only once verified, which places them after Phase 1. If the Calendar connection is absent or delayed, in-app appointments work standalone — nothing blocks. Booking prompts the move to stage 3 (Consultation Scheduled) — human-confirmed, never automatic — and the confirmed appointment is the stage-3 trigger that arms the confirmation/reminder/no-show automations ([[Automation_Catalog]] B-01–B-03). | P2 (booking + sync; reminder/no-show automations per [[Automation_Catalog]] phasing) |

**AI behaviors**
- On new lead arrival: enriches from what's already known (prior contact history, referral source), suggests the right first-touch template (EMT-001–003 by source type), drafts it in the contact's language preference, queues for approval (P2; Phase 1 exercises this surface with basic recommendation cards on controlled mock output).
- Answers "who should I call today?" with named people and reasons (P2).
- Flags data hygiene gaps that block automations ("12 contacts in this segment have no email — sends will skip them"), the prototype's one genuinely good pattern, generalized (P2).

### 4.4 Partners — realtors and referral sources (capabilities 13–15)

Realtor partners are the #1 referral engine of a purchase business. The 12 realtor personas in the discovery corpus are unanimous: speed and privacy-safe status visibility beat every other feature.

**User stories**
- As an LO, I see each realtor's referral history in both directions — what they've sent me, what I've sent them — so reciprocity is a fact, not a feeling.
- As an agent relationship manager, I run a book of 60 agents with tiered nurture cadences and see which relationships are cooling.
- As an LO, my realtor gets automatic milestone updates on our shared transaction — stage, timeline, who owns the next step — and *never* credit, income, assets, DTI, AUS findings, or condition details (the privacy matrix in [[Mortgage_Compliance]] is enforced by the system, not by discipline).

**Functional requirements**

| ID | Requirement | Phase |
|---|---|---|
| FR-PA-1 | Partner record: agent, brokerage, license, tier, preferred contact style; linked transactions and referral ledger (received/sent, converted, funded volume). | P2 |
| FR-PA-2 | Privacy-safe status sharing: per-transaction partner updates generated only from the shareable field set (milestone, timeline, next-step owner). Borrower-authorization flag required before any partner update flows, matching the communication framework's prerequisite ("borrower authorization/privacy-safe status confirmed"). | P2 |
| FR-PA-3 | Partner nurture: monthly-touch cadences using the realtor template set (EMT-004–005, 057–059) and the realtor-attraction playbooks from the social pack; all sends approval-gated. | P2 |
| FR-PA-4 | Co-marketing workflows: co-branded content requests routed through Marketing's compliance pipeline (RESPA-aware — cost-sharing questions escalate, never auto-approve). | P2 |
| FR-PA-5 | Relationship-health signal: referral recency/frequency trend per partner with "cooling" flags. | P2 |

**AI behaviors**
- Drafts the realtor milestone update the moment a shareable milestone is confirmed, pre-filtered to safe fields, queued for approval (P2).
- Weekly partner digest for the ARM: who referred, who went quiet, suggested touches with drafts attached (P2).
- Detects an unshareable-data request ("agent asked for the borrower's credit score") in conversation context and proposes the compliant deflection reply (P3, conversation intelligence).

### 4.5 Conversations — one inbox, stage-aware (capabilities 16–19)

All borrower and partner communication in one place, connected to the loan opportunity, powered by the 135-template communication layer ([[Decisions]] D-07).

**User stories**
- As an LO, I see every email thread with a borrower alongside their loan context — stage, open tasks, last touch — and reply without switching apps.
- As an LO, when I hit reply, the right template options for this person's stage and situation are already suggested, merge fields pre-filled.
- As an LO with Vietnamese-speaking clients, I communicate in Vietnamese using reviewed language modules — and the CRM never softens conditional language in translation (translation standards rule).
- As a processor, document-request emails come from templates in my sender voice (EMT-052–056) with the link to the company's secure document channel — a system outside the CRM, which never collects or stores loan documents — and never "email me your bank statements."

**Functional requirements**

| ID | Requirement | Phase |
|---|---|---|
| FR-CO-1 | Email integration (Google Workspace first — proven usage pattern): send/receive/thread, linked automatically to contact and opportunity records. Ships only as a verified connection — Phase 1 includes no external integrations. | P2 |
| FR-CO-2 | Template engine: all 135 EMT masters imported with full YAML metadata, stable IDs, related-template graph, and the 17-token merge-field vocabulary resolved from People/Loan/Team records (the vocabulary is enumerated in [[Communication_Templates]] §3 and is a hard data-model contract — [[Data_Model]]). Near-duplicate specialty variants (e.g. the eight "submitted to underwriting" clones) collapse into parameterized templates with a `loan_program` variable. | P2 |
| FR-CO-3 | Stage-aware suggestion: template recommendations filtered by loan stage, audience, situation, and language — never a flat gallery. Retrieval order per the framework's own spec: exact ID → stage → audience → situation → product → trigger → language → sensitivity. | P2 |
| FR-CO-4 | Automation-policy enforcement at the template level: Fully Automated (44) / Semi (71) / Manual Only + Never Automate (20) tiers imported as data. Manual/Never templates are hard-blocked from any automated queue; in v1 even "Fully" means AI-prepared, human-approved ([[Automation_Catalog]]). The authoritative policy column is the CRM Automation Map, not the metadata tags (known tag/policy contradiction on EMT-060–065). | P2 |
| FR-CO-5 | Pre-send compliance lint on every outbound: deterministic checks (no guarantee language, NMLS #320841 + LO NMLS + Equal Housing where required, standard footer, no sensitive data to partners, document requests may only link to the company's secure external channel — never request documents as attachments, since the CRM never collects them) + AI review layer. Block/revise reasons explained in plain language. | P2 (with first outbound sending) |
| FR-CO-6 | Multilingual: per-contact language drives template variant selection; EN masters + VI/ZH/ES-CO/RU lifecycle-stage modules ship first, flagged "human translation review required" until per-template variants exist. Placeholder tokens preserved across languages. | P1 (per-contact language field, via FR-PE-1) / P2 (modules + per-template variants, VI first) |
| FR-CO-7 | SMS channel: consent-gated, opt-out honored instantly, restricted to the three safe archetypes; blocked topics (rate locks, payment changes, cash-to-close, delays, adverse outcomes) enforced by policy, not convention. SMS supports email, never replaces it. Provider selection is open ([[Integration_Map]]). | P2 |
| FR-CO-8 | Sender-voice correctness: coordinator and processor templates send under the right team member's identity with their NMLS handled correctly. | P2 |
| FR-CO-9 | Missing content commissioned: templates for stages 3 (Consultation Scheduled), 4 (Consultation Completed), 7 (Searching for Home), 8 (Under Contract), and a borrower contact-attempt cadence — the verified gaps in the 135-set. | P2 |

**AI behaviors**
- Drafts replies with full opportunity context, in the contact's language, from the right template family — always into the approval queue (P2).
- Summarizes long threads ("what's the state of this conversation?") with linked evidence (P2).
- Suggests "next best message" from the related-template graph after any send (P2).
- Never sends, never removes compliance language, never converts conditional statements into guarantees — the framework's own AI rules, adopted verbatim as system policy.

### 4.6 Marketing — governed content production (capabilities 20–22)

The marketing content OS becomes product: its 16 content families, 3-tier risk model, reviewer roles, briefs, and compliance corpus are the functional spec ([[Decisions]] D-14). Seeded with 70+ finished artifacts (30 reels, 20 carousels, 20 story sequences) from the social media assistant pack.

**User stories**
- As a marketing coordinator, I file a brief (audience, channel, content family), AI generates drafts in brand voice, the compliance engine flags issues before any human reviews, and the approval trail is permanent.
- As an LO, I pick from a library of pre-approved, compliance-checked social content and schedule my week in ten minutes.
- As a compliance reviewer, high-risk drafts (anything touching rates, payments, fees, qualification, or guarantees) reach me automatically and cannot publish without my decision.

**Functional requirements**

| ID | Requirement | Phase |
|---|---|---|
| FR-MK-1 | Content pipeline: brief → generate → deterministic lint → AI compliance review → human review → approval state (Draft / Needs Review / Changes Requested / Approved / Rejected / Escalated) → publish record. States and roles from the review-process spec. | P2 |
| FR-MK-2 | 16 content families with per-family review posture; 3-tier risk model routes Medium/High to compliance reviewers automatically. High = anything involving rates, payments, APR, fees, down payments, guarantees, investor products, government programs, qualification, approval, or outbound follow-up. | P2 |
| FR-MK-3 | Compliance engine encodes: the do-not-say list, required disclosures (exact strings incl. "This is not a commitment to lend..." footer), trigger-term rules (rate/APR equal prominence), state rules as a **maintainable data table** (AZ/NJ/RI/MA seeded; not claimed as a 50-state matrix), Best Price Guarantee rules incl. the hard Washington exclusion, and the fair-lending targeting prohibition. | P2 (engine core lands with Conversations sending, then the full marketing surface) |
| FR-MK-4 | Campaigns & newsletters: audience from People segments, scheduling (now/one-time/recurring), per-send health checks with named blockers and one-tap fixes ("no email on file — will be skipped"), send analytics (delivered/opened/clicked/bounced/unsubscribed). | P2 |
| FR-MK-5 | Content calendar: the weekly cadence system (posts/stories/realtor touch/DM block) as the default template; batch production per the batch SOP. | P2 |
| FR-MK-6 | Escalation tickets with SLA (2–3 business days) for blocked or ambiguous content. | P2 |
| FR-MK-7 | Social publishing integrations are **not** claimed for P2 — the library assumes manual posting until platform integrations are validated ([[Integration_Map]]). Export/copy flows must be excellent instead. | P2 (manual-first) / P3 (publishing APIs if validated) |

**AI behaviors**
- Generates drafts using the near-production system prompts from the content OS (marketing master, compliance reviewer, brand voice editor), returning the standard output contract: draft + disclosures + risk level + compliance notes + open questions + review status (P2).
- Runs the compliance-review pass on every draft before a human sees it: blockers, warnings, missing disclosures, safer rewrite (P2).
- Builds a month's calendar from the content-mix rules on request — every item still individually approved (P2).

### 4.7 Automations — the follow-up engine (capabilities 23–25)

Plain-language automation built on the communication framework's trigger catalog: ~60 named lifecycle events with timing, prerequisites, stop conditions, and escalation rules already specified ([[Automation_Catalog]] is the full catalog). n8n executes behind a first-party UX — users never see n8n ([[Decisions]] D-09).

**User stories**
- As an LO, I set the docs-needed flag on a file and the CRM politely follows up with the borrower on cadence — each message drafted for my one-tap approval, stopping instantly when the team clears the flag. The documents themselves arrive through the company's secure channel, never through the CRM.
- As an LO, I read every automation as a plain-English card: *When* disclosures are unsigned after 1 day → *send* EMT-018 reminder → *stop if* signed, stage advances, or borrower replies → *escalate to* me and ops after 2 misses.
- As a compliance owner, I know Manual-Only and Never-Automate communications physically cannot enter an automated queue.

**Functional requirements**

| ID | Requirement | Phase |
|---|---|---|
| FR-AU-1 | Trigger engine on the lifecycle event catalog (lead events, document events, disclosure events, underwriting/condition events, appraisal/title/insurance events, closing/funding events, post-close dates, team events). Timing vocabulary: Immediately / Wait 1 Day / Wait 3 Days / Wait Until Trigger / Manual Only / Never Automate. Every event is a recorded fact — entered by the team, or later synced read-only from external systems — that triggers communication; the CRM never performs the underlying loan work those events describe. | P2 |
| FR-AU-2 | Every automation enforces: prerequisites before arming (merge fields populated, source trigger confirmed, consent present), stop conditions (**always override timing**), and escalation (notify assigned LO + ops owner on repeated misses). | P2 |
| FR-AU-3 | v1 execution posture: automations *prepare and queue*; borrower-facing steps require approval (single or batch). The path to true auto-send for the 44 Fully-Automated templates is a Phase 3 decision gated on trust metrics (G6) and compliance sign-off. | P2 |
| FR-AU-4 | Follow-up SLA engine: per-stage response-time commitments generate tasks and Today alerts; SLA breaches feed G3 metrics and team-leader exception views. | P1 (task due dates + Today alerts) / P2 (SLA cadence engine) |
| FR-AU-5 | Consent/DNC supremacy: opt-out, unsubscribe, DNC, and active-complaint flags stop all automations for that contact immediately, without exception. "Do not use this map to bypass opt-out, DNC, consent, or compliance controls" is a system invariant. | P2 |
| FR-AU-6 | Automation health: per-automation dashboard (armed/fired/queued/approved/stopped/escalated), pre-run validation with named blockers, and a global kill switch per automation and per contact. | P2 |
| FR-AU-7 | Keyword-triggered plays (P3 candidate): social DM keyword → checklist send + lead creation (the CTA-keyword system from the social pack), pending SMS/DM channel validation. | P3 |
| FR-AU-8 | Real triggers authored for EMT-066–135 (the specialty templates whose trigger metadata is auto-generated filler — a verified content debt). | P2 |

**AI behaviors**
- Recommends which automations to arm per file/segment, with plain-language previews of exactly what will go out and when (P2).
- Composes each automated step's actual message at fire time with live context (not a stale mail-merge), then queues it (P2).
- Monitors outcomes and proposes tuning ("this reminder gets replies at day 2, not day 1 — adjust?") (P3).

### 4.8 Intelligence — reporting, reactivation, coaching (capabilities 26–28)

Reporting lives here (no 11th nav item). Intelligence answers three questions: how is production doing, where is money hiding in the database, and how do we get better?

**User stories**
- As a branch leader, I see funded units/volume, conversion by stage, fallout causes, and source ROI — current, filterable by team/LO/timeframe/program.
- As an LO, the CRM watches my funded book and tells me when a past client's situation makes a refinance conversation worth having — with the outreach drafted (and no unsupported savings claims in it).
- As a team leader, I get coaching signals from real activity: response times, follow-up discipline, conversion deltas — presented as opportunities, not surveillance.

**Functional requirements**

| ID | Requirement | Phase |
|---|---|---|
| FR-IN-1 | Pipeline analytics: stage conversion funnel, velocity (days-in-stage), stall/fallout counts with reason codes, per-LO and per-team rollups. Tabular numerals, exportable. | P2 |
| FR-IN-2 | Source performance: leads → funded by channel/campaign/widget, made possible by the structured source model (FR-PE-2). | P2 |
| FR-IN-3 | Retention radar: post-close book monitoring — annual-review dates, milestone anniversaries, rules-based refinance-opportunity flags (rate-on-file vs. market threshold; market-rate feed is a P3 integration, manual threshold entry in P2). Every flag routes to stages 17–20 automations. | P2 (rules) / P3 (rate-aware) |
| FR-IN-4 | Attribution: funded loans tagged with driving trigger/campaign so G5 (reactivation revenue) is measurable, not anecdotal. | P2 |
| FR-IN-5 | Conversation intelligence: call transcription/summary, sentiment and commitment extraction into the timeline; borrower-consent and recording-law compliance required per [[Mortgage_Compliance]]. | P3 |
| FR-IN-6 | Coaching: per-LO scorecards vs. team benchmarks; AI-drafted coaching notes for team-leader review. Scoring factors documented and fair-lending-safe ([[Decisions]] D-11). | P3 |

**AI behaviors**
- Natural-language questions over the user's own data ("how many preapprovals went under contract last quarter?") with the answer's underlying records linked (P3).
- Weekly intelligence digest per role: what changed, what needs attention, one improvement suggestion (P2).
- Refi-opportunity briefs: the case for the conversation in plain language, with compliant outreach drafted — never a savings guarantee (P3).

### 4.9 Team — people running the system (capability 29)

**User stories**
- As a team leader, I manage seats, roles, and lead-routing membership; I "view as" any LO's workspace to help without asking for screenshots.
- As a branch leader, I organize multiple teams (including language/market-based teams per the Loan Factory team-marketing structure) with team-level branding and approval settings.
- As an admin, when an LO leaves, reassignment of their contacts, files, and automations is a guided flow, not a data-loss event.

**Functional requirements**

| ID | Requirement | Phase |
|---|---|---|
| FR-TM-1 | Roles & permissions: the 7 user types as role presets on an RBAC model ([[Technical_Architecture]]); permission blocks always say who *can* act and offer a handoff (scorecard critical-fail rule). | P1 (core roles) / P2 (full team surface) |
| FR-TM-2 | Team entity: membership, team-leader ownership, team-level template/branding defaults, routing pool membership. | P2 |
| FR-TM-3 | View-as workspace switching for leaders, fully audit-logged. | P2 |
| FR-TM-4 | Workload & goals: per-LO capacity signals (active files, overdue tasks, SLA trend), goal tracking (units/volume/activities). | P2 |
| FR-TM-5 | Offboarding/reassignment flow with bulk transfer of contacts, loans, tasks, and automation ownership. | P2 |
| FR-TM-6 | Multi-branch hierarchy, enterprise admin, white-label controls. | P4 |

**AI behaviors**
- Drafts the weekly team meeting brief from real pipeline data (P2).
- Suggests rebalancing when an LO shows overload signals ("Marcus has 31 active files and a rising SLA-miss trend — route new leads elsewhere this week?") — a suggestion, never an autonomous reroute (P2).

### 4.10 Settings — governance and trust (capability 30)

**User stories**
- As any user, I manage my profile, NMLS number, signature, notification preferences, and language.
- As a compliance owner, I can produce the complete audit trail for any contact, message, or AI action in minutes.
- As an admin, consent and DNC status are enforced system-wide the moment they change.

**Functional requirements**

| ID | Requirement | Phase |
|---|---|---|
| FR-ST-1 | Auth with MFA; session management; RBAC administration ([[Technical_Architecture]]). | P1 |
| FR-ST-2 | Profile: identity, personal NMLS (e.g. Jeremy: NMLS 1195266, alongside company NMLS #320841), licensed states, signature blocks, working schedule, language. | P1 |
| FR-ST-3 | Consent & DNC ledger: per-contact per-channel consent with timestamps and source-of-consent; changes propagate to Conversations and Automations instantly. | P1 (consent/DNC fields + audit) / P2 (instant propagation, with the channels themselves) |
| FR-ST-4 | Full audit trail: every AI action, send, approval, stage change, permission change, and view-as session — attributable, timestamped, immutable, exportable. | P1 |
| FR-ST-5 | Integration management: honest connection states only. A tile may show "Connected" solely when a live, verified connection exists — the prototype's fake "Encompass ✓ Connected" is the named anti-pattern. Phase 1 ships no external connections, so this surface arrives with the first verified integration. | P2 |
| FR-ST-6 | Compliance configuration: state-rules table maintenance, disclosure string management, do-not-say list versioning — data, not code deploys. Lender-paid-compensation-only is a locked default for Jeremy's configuration (verified operational fact; changing it requires explicit approval). | P2 |
| FR-ST-7 | Data export and deletion workflows (contact-level export; deletion is soft with retention rules — no user-facing permanent-delete). | P2 |

**AI behaviors**
- AI has **no autonomous authority in Settings**: it can explain any setting in plain language and flag risky configurations ("this automation targets a segment containing 3 DNC contacts — they will be excluded"), but every change is human-made.

---

## 5. Cross-cutting requirements

These apply to every module and every phase; each links to its owning document.

1. **Compliance** ([[Mortgage_Compliance]]): no autonomous lending decisions; no guaranteed-approval/rate/savings language anywhere; NMLS + Equal Housing display where required; human review for all borrower-facing and public content; consent-tracked email/SMS; fair-lending-safe AI factors with periodic disparate-impact review; full AI audit trail. These are release blockers, not preferences.
2. **"Toddler simple" UX** ([[Design_System]], [[QA_Plan]]): one obvious primary action per screen; plain mortgage language; explicit save states and data-freshness indicators; blocks that explain ownership; NTS scorecard thresholds as ship gates; the 12 critical-fail conditions and 20 risk tags adopted as the defect taxonomy.
3. **Multilingual** ([[Decisions]] D-08): per-contact language preference in the data model from day one; EN/VI first-class; conditional language never softened in translation; non-English sends flagged for human translation review until reviewed variants exist.
4. **Security & tenancy** ([[Technical_Architecture]]): row-level security for tenant/role separation; AI treats all inbound content as untrusted input (prompt-injection posture); no NPI/SSN/credentials ever placed into external AI tools outside the governed gateway.
5. **Auditability**: every AI output carries provenance (model, inputs summary, template IDs used, approver, timestamp). "Can AI-assisted workflows be reviewed against source evidence before a human acts?" must be answerable *yes* on every surface — this line is adopted verbatim as a PRD acceptance criterion.
6. **Performance & density**: high-volume usability is first-class (a 25-file LO must triage in minutes — the high-volume test suite in [[QA_Plan]] is acceptance, not aspiration).

---

## 6. Explicitly out of scope

Listed so nobody "helpfully" builds them. Rationale in [[Decisions]] and [[Open_Issues]].

| Out of scope | Why |
|---|---|
| LOS/POS functionality: 1003 intake or processing, AUS submission, pricing engine or pricing scenarios, disclosure generation, underwriting or per-condition management, loan document collection or storage | Loan Factory CRM is a CRM. Loan work happens in the systems built for it; the CRM may later sync stage/milestone facts read-only ([[Integration_Map]]) and never rebuilds or replaces any of this. A simple docs-needed follow-up flag for communication is the outer boundary. |
| Credit pulls, income/asset verification services | Loan work, not CRM work — it belongs to the systems of record and their vendors. |
| Autonomous borrower-facing sends (v1) | The AI contract (D-05). True auto-send is a P3 decision gated on trust metrics and compliance sign-off. |
| Any autonomous lending decision, prequalification verdict, or rate quote by AI | Compliance posture, non-negotiable. |
| Borrower portal, borrower logins, or any borrower-facing product surface — in any phase | Borrowers are CRM contacts, not product users (D-23). The borrower personas remain as source material for designing communication content and QA scenarios only. |
| Native iOS/Android apps and app-store distribution | Responsive web on desktop and mobile browsers is the required surface ([[Design_System]], [[Screen_Specifications]]); a native wrapper adds cost without CRM value. |
| Servicing, payments, escrow anything | Different business. |
| Social publishing APIs claimed in Phase 2 | Not a proven integration; manual-first with excellent export flows until validated. |
| A 50-state compliance matrix presented as complete | Only AZ/NJ/RI/MA rules are sourced; the state-rules table is maintainable data with a compliance owner, and the product must not imply completeness. |
| Recruiting/LO-onboarding module and the "101–601" training platform | Real Loan Factory initiatives, but training delivery is not CRM scope; revisit at P4/marketplace. |
| Evolving the offline HTML prototype or the archived marketing app | Both formally retired (D-01, D-14). Ideas salvaged; zero code carried. |
| Standalone chatbot UI for AI | AI is ambient in every workflow, never a sidebar destination (D-04). |
| Generic-CRM features with no mortgage job (deal "kanban" for arbitrary objects, custom object builder) | Every surface must serve the 20-stage lifecycle; configurability that dilutes opinionation is P4-at-earliest. |

---

## 7. Open questions

Tracked in [[Open_Issues]]; the ones that gate PRD-level scope are below. (Q1, the former TERA+ positioning question, is closed and off this list: TERA+ materials serve purely as source material for personas, usability scorecards, and QA scenarios — nothing about TERA+ blocks or shapes the CRM. See [[Open_Issues]].)

| # | Question | Blocks | Owner |
|---|---|---|---|
| Q2 | Does the Loan Factory platform expose (or can it be given) an API/webhook for widget leads, Facebook-ad leads, and QM Pricer alerts? Everything proven so far is UI-level only. | FR-PE-3 timeline; P2 lead-ingestion scope | Jeremy + it.dept@loanfactory.com |
| Q3 | LOS/POS landscape: which LOS do Loan Factory LOs actually close in, and what read-only sync surface exists for stage/milestone facts? (The prototype's "Encompass Connected" was fake; nothing is proven.) | Future read-only integration planning ([[Integration_Map]]) | Jeremy |
| Q4 | SMS provider and 10DLC/A2P registration path; who owns carrier compliance? | FR-CO-7 (P2 SMS) | Technical lead + compliance |
| Q5 | Vietnamese translation review: who is the qualified human reviewer for VI template variants (and for restoring diacritics in the persona/localization source files)? | FR-CO-6 P2 scope; multilingual credibility | Jeremy's team |
| Q6 | Final product name (Loan Factory CRM is the working name, D-12) and licensing display requirements for any name change. | Branding surfaces only — nothing structural | Jeremy |
| Q7 | Existing book-of-record migration: where do current contacts/past clients live today, and what does the import (volume, quality, consent status) look like? | P2 onboarding plan (Phase 1 runs on seeded demonstration data) | Jeremy |
| Q8 | Market-rate data source for the P3 rate-aware refi radar (vendor, cost, licensing of displayed rates). | FR-IN-3 P3 scope | Technical lead |
| Q9 | Pricing/packaging and tenant model (single Loan Factory tenant vs. multi-brokerage SaaS ambitions) — shapes P4 enterprise scope. | P4 only | Jeremy |
| Q10 | Authoring owner for the missing lifecycle content: stage 3/4/7/8 templates, contact-attempt cadence, and real triggers for EMT-066–135. | FR-CO-9, FR-AU-8 | Marketing coordinator + compliance reviewer |

---

## 8. Acceptance summary

A phase is done when: its functional requirements pass QA per [[QA_Plan]] (including the ported TERA+ scenario suites and all 9 AI-assisted acceptance tests for AI surfaces); NTS usability thresholds pass on every new screen; the compliance invariants in §5 hold under test (including adversarial prompt-injection tests on AI); and the metrics instrumentation for §2 is live. The [[Implementation_Roadmap]] sequences the work; [[Screen_Specifications]] defines what each screen must be; this PRD defines why and what — and it changes only through [[Decisions]].

Related: [[Vision]] · [[Decisions]] · [[Open_Issues]] · [[Implementation_Roadmap]] · [[Mortgage_Workflow_Map]] · [[Screen_Specifications]] · [[Design_System]] · [[Data_Model]] · [[Technical_Architecture]] · [[AI_Product_Architecture]] · [[Automation_Catalog]] · [[Communication_Templates]] · [[Integration_Map]] · [[Mortgage_Compliance]] · [[User_Personas]] · [[QA_Plan]] · [[Current_State_Audit]] · [[Asset_Inventory]] · [[Build_Log]] · [[Obsidian_Index]]
