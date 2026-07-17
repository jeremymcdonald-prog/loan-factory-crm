# Vision

Purpose: this is the product story for Loan Factory CRM (working name, [[Decisions]] D-12) — why the mortgage CRMs loan officers actually use keep failing them, what we are building instead, and what "winning" concretely looks like for each person who touches the product. Every other document in this plan ([[PRD]], [[Screen_Specifications]], [[Technical_Architecture]], [[Implementation_Roadmap]]) is an elaboration of the argument made here. If a future feature idea does not serve this story, it does not ship.

## One line

**An AI-powered mortgage CRM — the loan officer's daily command center that always knows what matters now and prepares the relationship work, with human approval.**

## Why existing mortgage CRMs fail loan officers

Every LO has bought a CRM. Almost none of them live in it. The failure pattern is consistent, and it is not a features problem — it is a design-philosophy problem:

| Failure | What it looks like in practice | Our answer |
|---|---|---|
| **It's a database, not a co-worker** | The LO opens the CRM and sees menus: Contacts, Campaigns, Reports. The system holds information but offers no opinion. Deciding what to do next — the hardest part of an LO's day — is left entirely to the human. | The default screen is **Today**: a ranked, reasoned list of what matters right now. The system tells you what to do next. |
| **Generic CRM wearing a mortgage costume** | Sales-pipeline software relabeled: "Opportunity" becomes "Loan," stages are whatever the admin typed in. No native concept of preapproval expiration, rate-lock windows, clear-to-close, or annual reviews. | The 20-stage lifecycle (ENGAGE → QUALIFY → TRANSACT → RETAIN → GROW) is the CRM's opportunity-stage vocabulary, built into the data model, the pipeline, the templates, and the automations. See [[Mortgage_Workflow_Map]]. |
| **The automation graveyard** | Powerful workflow builders that require an admin mindset to configure, so most LOs run 2 of 200 possible automations — usually a birthday email. The rest is shelfware. | Plain-language automations with recommended audiences and one-tap activation, backed by a curated catalog mapped to real loan events. See [[Automation_Catalog]]. |
| **"AI" bolted on as a chatbot** | A sidebar assistant that answers questions if you remember to ask. It doesn't know your pipeline, doesn't draft your follow-ups, doesn't watch your deadlines. | **AI** is the CRM's embedded AI layer, not a widget — present on every screen, preparing work before the LO asks (below). |
| **Compliance is the LO's problem** | The CRM will happily send "guaranteed lowest rate!" to 5,000 people. Licensing lines, Equal Housing, do-not-say language, consent — all left to the user to remember. | Compliance guardrails are product infrastructure: deterministic linting plus AI review on every outbound draft, built from Loan Factory's already-written rule corpus. See [[Mortgage_Compliance]]. |
| **Built for retail enterprises, not brokers** | The dominant platforms sell to retail lender marketing departments: corporate-controlled journeys, seat minimums, six-month implementations. A broker shop's speed, lender-choice story, and lean team don't fit. | Broker-first by design: broker positioning baked into content ("I compare options across lenders"), team-scale administration, days-not-months onboarding. |
| **English-only in a multilingual market** | Vietnamese-, Spanish-, and Chinese-speaking LOs serve their communities through workarounds: hand-translating templates, keeping notes in two languages, losing nuance and compliance discipline in both. | English + Vietnamese are first-class from early phases; per-contact language preference and per-template language variants are in the core data model ([[Decisions]] D-08). |
| **The follow-up black hole** | Everyone knows past clients are the best source of business. Almost no LO systematically works annual reviews, refinance triggers, and referral moments, because the CRM treats "post-close" as the end of the record. | RETAIN and GROW are lifecycle stages with the same urgency machinery as active loans. A funded loan is the beginning of the next one. |

The existing offline prototype in the workspace is a miniature of the industry problem: an email tool with feature-based navigation, a static "AI suggestions" list, and no pipeline — the user must decide everything ([[Current_State_Audit]]). We replace it; we do not evolve it.

## The command-center thesis

The core bet: **an LO's scarcest resource is not information, it is decision energy.** A producing LO juggles 15–40 active files, dozens of prospects, partner relationships, and a past-client database — while the highest-value actions (call the preapproved buyer going quiet, chase the missing bank statement blocking underwriting, congratulate the agent whose listing just went pending) are time-sensitive and easy to miss.

So the product's organizing principle is a command center, not a filing cabinet:

1. **Today is the product.** The default landing screen answers one question — *what should I do next, and why?* — as a ranked queue of actions with reasons attached ("Preapproval expires in 6 days and no contact in 12 — call Maria"). Everything else in the nav exists to feed or drill into Today.
2. **Urgency is computed, not remembered.** Stage, time-in-stage, docs-needed flags, expiration windows, and silence are signals the system watches continuously. Stage and milestone facts are entered by the team in v1 and may later sync read-only from external systems (LOS/POS); the CRM computes urgency from them but never owns the loan of record. Status colors mean urgency, never decoration ([[Design_System]]).
3. **Every insight arrives with its action attached.** The system never says "this lead is going cold" without a ready-to-approve next step: a drafted call script, a drafted text, a drafted email in the contact's preferred language.
4. **One obvious primary action per screen** — the "toddler simple" standard, made falsifiable by the usability scorecard we adopted from the persona framework ([[QA_Plan]]): a screen ships when a not-tech-savvy veteran LO passes it without help. The leadership question we test against, verbatim from that framework: *"Does the dashboard show the next right action, or does it become another place to hunt?"*

## AI: the embedded AI layer

AI is the name of the CRM's embedded AI layer — extending Loan Factory's existing internal "AI" automation concept, so the name carries recognition ([[Decisions]] D-04). AI is ambient across every screen; it is never a sidebar chatbot.

**The contract: AI prepares, the human approves.**

- AI drafts follow-ups, ranks the day, summarizes files, spots stalls, recommends the next best template — and puts every borrower-facing action into an approval queue. **No borrower-facing communication is ever sent autonomously in v1.**
- Every AI action is logged and attributable; the LO can always see *why* AI suggested something (source evidence, not vibes).
- AI is grounded in content that already exists and is already compliance-shaped: the 135-template communication framework (with automation policies of Fully/Semi/Manual per template), the Loan Factory do-not-say list, required disclosures, and brand voice rules. AI recommends from this library rather than inventing language from nothing. See [[AI_Product_Architecture]].
- Compliance boundaries are hard-coded, not suggested: templates marked Manual Only / Never Automate (rate locks, cash-to-close changes, closing delays, problem files) can never enter an auto-send path; lead scoring uses documented, fair-lending-safe factors only ([[Decisions]] D-11).

This trust model is deliberate product strategy, not caution for its own sake. LOs have been burned by "automation" that embarrassed them in front of clients. An AI that shows its work, asks permission, and never freelances is the AI a producing LO will actually let touch their database — and the approval queue itself becomes the habit loop that brings the LO back to Today every morning.

## The broker-first, multilingual edge

Two structural advantages competitors treat as afterthoughts, we treat as foundations:

**Broker-first.** Loan Factory CRM is built inside Loan Factory — a broker shop — for broker economics: the lender-comparison story is in the template copy ("as a broker, I compare options rather than one bank's menu"), the compliance line carries Loan Factory NMLS #320841 with Equal Housing display, per-LO websites/lead funnels/QM Pricer already exist as proven lead sources to ingest from ([[Integration_Map]]), and team structures follow how broker teams actually organize (by language, region, and niche), not retail branch hierarchies.

**Multilingual as architecture, not translation.** Per-contact language preference, per-template language variants, and localization standards (full Vietnamese diacritics, formal address conventions, "do not soften conditional language in non-English versions") live in the data model from day one. English + Vietnamese ship first-class early, with the framework's Chinese, Colombian Spanish, and Russian modules staged behind them. The demand is proven in our own materials: 111 usability personas across five languages, Vietnamese translation standards already written into the template library. An LO serving the Vietnamese community should never feel like they are using a translated product.

## What winning looks like, per user

| User | Winning is… |
|---|---|
| **Loan officer** (primary) | Opens Today each morning and trusts it. Works the queue: approve AI's drafts, make the flagged calls, done by the time competitors have finished checking three inboxes. Nothing time-sensitive slips. Past clients hear from them at the right moments without the LO remembering anything. |
| **LO assistant** | Always knows what's theirs vs. the LO's — clear ownership on every task, clean handoffs, and warnings before stepping outside their lane. No more "did anyone tell the borrower?" |
| **Processing / ops staff** | A follow-up queue ordered by what actually blocks closings. Docs-needed reminders are drafted for them; status updates to borrowers and agents go out (approved) without anyone composing from scratch. |
| **Team leader** | Sees the whole team's pipeline and today's risks in one view; spots the stalled files and the struggling LO without asking anyone for a report. Coaching from evidence, not anecdotes. |
| **Branch leader** | Production, pull-through, and follow-up discipline across teams, visible without exporting a spreadsheet. Knows the branch's compliance posture is enforced by the product, not by hope. |
| **Agent relationship manager** | Every referral partner has a relationship record with real history: referrals in/out, co-marketing, last touch. Privacy-safe status updates keep agents informed without leaking borrower financials. Partner value is measurable. |
| **Marketing coordinator** | Briefs in, compliant drafts out, one approval queue. Campaigns launch in an afternoon; nothing publishes without the required disclosures; every piece is attributable. |

Borrowers are deliberately absent from this table: they are CRM contacts, not product users. They feel the win as its output — timely, compliant, well-written communication in their preferred language, at the right moments in their loan and long after it. The borrower personas in [[User_Personas]] remain source material for designing that communication and QA-testing it, never a user base to build screens for.

And for **Jeremy / Loan Factory**: the CRM stops being a monthly software expense LOs grumble about and becomes a recruiting and retention weapon — the reason an LO joins, and the reason leaving would hurt.

## Explicit non-goals

We win by refusing the right fights. Loan Factory CRM is **not**:

1. **Not an LOS.** We do not underwrite, price, run AUS, generate disclosures, or originate the 1003. We track the relationship and the communication around the loan; the LOS remains the system of record for the loan file itself. Stage and milestone facts arrive in the CRM as team-entered data (later, read-only sync from external systems), never as loan work performed here. TERA+ discovery materials serve this plan as persona, scorecard, and QA source material ([[User_Personas]], [[QA_Plan]]) — TERA+ is not a dependency of this CRM and this CRM does not replace it.
2. **Not a POS or borrower portal.** Borrowers are CRM contacts, not product users. Document intake, application flows, and document collection/storage belong to dedicated tooling, permanently; the CRM's job is the follow-up conversation around them — a simple "docs still needed" flag that triggers a drafted reminder is in scope, a document repository or per-condition tracker is not. The Loan Factory 1003 widget already exists as a lead surface to ingest from.
3. **Not a generic CRM platform.** No industry-agnostic mode, no "customize your objects" escape hatch that dissolves the mortgage-native opinions. The 20 stages are the 20 stages.
4. **Not autonomous AI.** No self-sending borrower communication in v1, no AI lending judgments ever, no unsupervised outbound. AI's autonomy grows only as the approval-queue track record earns it, and never past compliance lines.
5. **Not an email-blast tool.** Volume marketing without lifecycle context is what the old prototype was; relationship intelligence is what this is.
6. **Not a rate-quoting or pricing engine.** The QM Pricer exists in the Loan Factory platform; we ingest its leads and alerts, we do not rebuild it.
7. **Not a social network or content platform.** Marketing produces and schedules compliant content; audience-building mechanics stay on the platforms themselves.
8. **Not everything at once.** Phase 1 is deliberately narrow — a walking skeleton of Today, People, Leads, opportunity records with mortgage stages, tasks, notes and activity history, responsive desktop and mobile web layouts, basic AI recommendation cards with the approval workflow shell, and the audit logging foundation — and deliberately independent of any external integration ([[Decisions]] D-10). Depth before breadth.

## Where this goes

Phase 1 earns the LO's morning. Phase 2 earns the whole team's workflow (full lifecycle automation, Partners, campaigns, reporting). Phase 3 earns the database (reactivation, conversation intelligence, read-only LOS/POS data sync). Phase 4 earns the enterprise (multi-branch, white-label, marketplace). Full sequencing in [[Implementation_Roadmap]]; how we stay differentiated while doing it in [[Competitive_Differentiation]].

Related: [[Competitive_Differentiation]] · [[PRD]] · [[User_Personas]] · [[AI_Product_Architecture]] · [[Decisions]]
