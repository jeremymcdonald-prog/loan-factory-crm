# Integration Map

This document is the single source of truth for what Loan Factory CRM connects to, when, and under what conditions. One boundary governs every row: integrations are **future data connections only — read-only sync in, communication out**. The CRM consumes facts from external systems to power relationship visibility and communication triggers; it never owns loan origination data and never performs loan work. Every integration is placed in one of three evidence tiers — **CONFIRMED** (proven to exist in the source materials), **LIKELY** (strongly implied by how Jeremy's business runs, but not yet proven or contracted), and **FUTURE** (real candidates that belong to later phases) — plus a cross-cutting **approval gate** for anything that touches borrower loan-status data, recorded calls, regulated messaging, or restricted email scopes. For each integration we state its purpose, what data flows in and out, the direction, the phase it belongs to, the risk, and the open questions Jeremy or the implementation team must answer. It ends with a recommended build order and one hard rule: Phase 1 must never be *blocked* by any external system — Phase 1 ships with no external connections at all, and its only integration work is paperwork and discovery. Related: [[PRD]], [[Automation_Catalog]], [[Information_Architecture]], [[Asset_Inventory]], [[Current_State_Audit]], [[Decisions]].

---

## How to read this map

| Term | Meaning |
|---|---|
| **CONFIRMED** | The source materials prove the system exists and is in use in the Loan Factory world today. Confirmed means *proven to exist* — it does **not** mean an API contract exists. No API documentation was found for any Loan Factory platform feature; all evidence is UI-level (training guides, screenshots, URLs). |
| **LIKELY** | Not proven in the sources, but justified by how the business demonstrably operates. Each entry carries its justification. Treat as planned, never as existing. |
| **FUTURE** | Belongs to Phase 3+ per the locked roadmap. Named vendors are examples of a class ("Encompass/ARIVE-class"), not commitments. |
| **Approval gate** | Legal, security, or vendor sign-off required before a single line of integration code is written. The gate is orthogonal to phase — an integration can be technically easy and still blocked here. |
| Direction | **Inbound** (data flows into the CRM), **Outbound** (the CRM pushes out — communication channels only), **Two-way** (reserved for communication channels like email and SMS, never for loan data). |
| Phase | Per [[PRD]] roadmap: 1 = command center core · 2 = automation/Partners/campaigns · 3 = intelligence/deep read-only integrations · 4 = enterprise. |

One structural decision that shapes everything below: **n8n is the integration backbone** (already in Jeremy's stack, per CANON). External systems talk to n8n jobs; n8n talks to Loan Factory CRM's API. Users never see n8n — they see the Automations screen. This means most integrations in this map are built as n8n workflows behind a first-party UX, which keeps the CRM's core clean and lets us swap vendors without touching product code.

---

## Tier 1 — CONFIRMED (proven in source materials)

### 1.1 Loan Factory LO websites — lead funnels, widgets, QM Pricer

Proven by the marketing training guides: per-LO websites with Website Settings (custom domain/slug, bio, custom scripts, Best Price Guarantee opt-in), a **Lead Funnels & Widgets** feature with a JavaScript SDK and 13 named embeddable widget types (Quote form, Long form, Long form 2, HomeReady First long form, Rate table, **1003 Application Widget**, Today's rate, Rate chart, VA loan, HELOC, HELOC Application, Basic form, Qualification Mortgage Calculator), each with an optional per-widget lead-source field — and the **QM Pricer**, a consumer-facing rate/quote engine whose results carry four actions: **create alert, apply, qualify, view fees**.

| Field | Detail |
|---|---|
| Purpose | Loan Factory CRM's highest-volume lead source. Every widget submission, quote request, pricer application, "qualify" submission, and rate alert becomes a lead in People with structured provenance. The widgets, funnels, and pricer themselves live entirely on the LF platform — the CRM only receives the resulting leads. |
| Data in | Lead contact fields, widget/funnel identity, per-widget lead source tag, lead intent (quote vs. long-form vs. 1003 start vs. rate alert vs. qualify), quote parameters where present (loan type, purpose, amount, property value, ZIP, occupancy, FICO range). |
| Data out | None. Everything from the LF platform flows read-only into the CRM. |
| Direction | Inbound. |
| Phase | Ingestion build is **Phase 2** via n8n (webhook, email-parse, or export polling — whatever the platform actually offers), matching the roadmap's deferral of "Loan Factory platform lead streams" to Phase 2 and [[PRD]] FR-PE-3 (P2). Phase 1 is zero-code: open the LF IT conversation and discover the mechanism. Deeper read-only sync is Phase 3 at earliest. |
| Risk | **Medium.** No published API. Ingestion mechanism must be discovered with Loan Factory IT (it.dept@loanfactory.com). URLs and nav paths were verified Dec 2025–Jan 2026 and may drift. |
| Open questions | Does the LF platform expose webhooks or a lead export? Can widget leads be delivered to an external endpoint per LO? Who owns the relationship with LF engineering? Does a QM Pricer "create alert" fire a retrievable event (this is a ready-made Stage 19 Refinance Opportunity trigger)? |

Two design consequences already locked into [[PRD]]: lead source must be a first-class structured field (channel → campaign → ad → form), not a text tag; and rate-alert leads are a distinct lead intent that maps to the GROW phase of the 20-stage lifecycle. One compliance default from the same source: **Jeremy's business uses lender-paid compensation only** — any rate- or pricing-related communication content in Loan Factory CRM inherits that default and never flips it without explicit approval.

### 1.2 Loan Factory Facebook Ads tool (Meta Ads)

Proven: a built-in Facebook Ads tool at `loanfactory.com/facebook_ads` with Meta OAuth, a pre-built ad template gallery, budget/targeting controls, and — critically — **leads auto-flowing into the Loan Factory pipeline tagged with source "Automatically Created,"** routed to a **Default Loan Officer**.

| Field | Detail |
|---|---|
| Purpose | Capture Meta lead-form leads with real attribution instead of the flat "Automatically Created" tag; give AI the first-touch context ("this lead came from the HELOC ad 4 minutes ago"). |
| Data in | Lead contact fields, ad/campaign/form identity, timestamp, assigned LO. Later (Phase 2–3, via Meta Marketing API directly): spend, impressions, cost-per-lead for the Intelligence screen. |
| Data out | Possibly offline conversion events back to Meta (Phase 3, improves ad optimization) — unproven, optional. |
| Direction | Inbound (conversions-out is a future option). |
| Phase | Lead ingestion **Phase 2** (same n8n pathway as 1.1, since these leads land in the same LF pipeline — and deferred with it per the roadmap cut list); ad-performance reporting Phase 2–3. |
| Risk | **Medium.** Two possible routes — through the LF platform's lead stream, or directly via Meta's Lead Ads API with the LO's own OAuth — and we don't yet know which is available. Meta app review is required for the direct route. |
| Open questions | Is the "Automatically Created" lead stream reachable from outside the LF platform? Do LOs run ads only through the LF tool, or also through their own Meta Ads Manager? Who is the Meta Business Manager admin? |

### 1.3 Google Ads + GA4

Proven: a trained, supported LO workflow — LOs paste GA4/Google Ads tags into Website Settings → Add Custom Scripts, link Ads to GA4, and build remarketing audiences from `loanfactory.com/quote` visitors. An LF escalation-desk ticketing system exists for support.

| Field | Detail |
|---|---|
| Purpose | Phase 1: capture the *attribution* (UTM/gclid on inbound leads). Phase 2–3: pull campaign performance into Marketing/Intelligence so LOs never hand-wire GA4 again. |
| Data in | UTM parameters and click IDs on lead records (Phase 1, free — just store what arrives); GA4 Data API metrics and Google Ads performance reports (Phase 2–3). |
| Data out | Offline conversion upload to Google Ads ("lead became a funded loan") — Phase 3, high value for ad optimization, needs consent review. |
| Direction | Inbound first; conversions-out later. |
| Phase | Attribution capture Phase 1; reporting APIs Phase 2–3. |
| Risk | **Low** for attribution capture; **Medium** for API reporting (OAuth per LO, Google Ads API developer token approval). |
| Open questions | Are LO Google Ads accounts individually owned or under one MCC? Which GA4 properties exist and who administers them? |

### 1.4 n8n (Jeremy's stack — the integration backbone)

Proven in Jeremy's stack and locked in CANON as the automation backbone. This is not one integration; it is **how most integrations in this map get built**.

| Field | Detail |
|---|---|
| Purpose | Runs integration jobs: lead ingestion, enrichment, scheduled syncs, webhook receipt, retry/error handling — all behind the CRM's first-party Automations UX. Users never see n8n. |
| Data in/out | Everything in this map that isn't a native SDK call. n8n reads/writes Loan Factory CRM via the CRM's own API with a service credential. |
| Direction | Two-way (as transport). |
| Phase | **Phase 1** infrastructure. Stood up with monitoring, error alerting, and an audit path from day one. Nothing in the Phase 1 walking skeleton depends on it — it is stood up early so every Phase 2 integration lands on proven plumbing. |
| Risk | **Low–Medium.** Single-instance reliability, credential hygiene (n8n holds many vendor secrets — vault them), and the temptation to let business logic leak into n8n workflows. Rule: n8n moves data; the CRM decides. Every n8n action that touches a contact record writes to the CRM's audit trail. |
| Open questions | Self-hosted vs. n8n cloud for production; who is on-call for failed workflows; workflow version control policy. |

### 1.5 Custom GPT workflows (existing AI usage)

Proven: three Custom GPTs (Marketing, Compliance reviewer, Image Prompt) with instruction files, a 20-prompt library, and a final-reviewed social content knowledge base are in live use in Jeremy's workflow.

| Field | Detail |
|---|---|
| Purpose | This is a **migration, not a runtime integration**. AI absorbs these workflows: the prompts, guardrails, output contracts, and knowledge files become AI's Marketing and compliance-review capabilities inside Loan Factory CRM. No production dependency on OpenAI/ChatGPT is planned. |
| Data in | One-time content import: system prompts, compliance rules, brand voice, 70+ finished content artifacts, the compliance-reviewer output contract (risk level → blockers → warnings → missing disclosures → safer rewrite → status). |
| Data out | None. |
| Direction | Inbound, one-time. |
| Phase | Phase 1 (AI guardrails) and Phase 2 (Marketing module content). |
| Risk | **Low.** The only risk is organizational: LOs keep using the GPTs after Loan Factory CRM ships, forking the content. Plan a sunset message once parity exists. |
| Open questions | None material. |

---

## Tier 2 — LIKELY (justified, not proven)

### 2.1 Google Workspace — Gmail + Google Calendar

**Justification:** CANON lists "Google Workspace usage patterns" among the proven facts of the Loan Factory world; the team-onboarding materials assume Google Forms/Chat; Jeremy's own git identity is a Workspace address; and the Conversations screen is email-first, which is pointless without the LO's real mailbox.

| Field | Detail |
|---|---|
| Purpose | Two-way email sync so Conversations shows real borrower threads and AI can draft replies in context; calendar sync so consultations (lifecycle stages 3–4) and closings appear in Today. |
| Data in | Message threads (matched to People records), calendar events, availability. |
| Data out | Sent emails (human-approved drafts), calendar events (consultation bookings). |
| Direction | Two-way. |
| Phase | **Phase 2 build** — the first integration Phase 2 ships, because Conversations is email-first ([[PRD]] FR-CO-1). Phase 1 itself ships with no external connections, but Google's CASA review is on the Phase 2 critical path, so OAuth verification paperwork starts on day one of Phase 1. **Fallback checkpoint:** if CASA has not cleared when Phase 2 email work opens, outbound send ships via a transactional email provider (a real contingency — provider selected and integrated early, not improvised) and Gmail sync lands as soon as the review clears. Calendar sync rides the same OAuth track. |
| Risk | **Medium–High effort, low legal risk.** Gmail's restricted OAuth scopes require Google's security review (CASA assessment) — weeks of lead time; start the verification process early. Email-thread matching to contacts is a known-hard problem; borrower email content is sensitive and must respect RBAC. |
| Open questions | Is every LO on the Workspace domain, or do some use personal Gmail? One domain-wide delegation vs. per-user OAuth? Does compliance require journaling/retention of synced mail? |

### 2.2 SMS — Twilio-class vendor

**Justification:** the 135-template communication framework ships a dedicated SMS cross-reference (three deliberately non-sensitive SMS archetypes, blocked-topic list), and the CRM Automation Map suggests SMS follow-ups per template. The business has clearly already designed for SMS; no vendor is contracted yet.

| Field | Detail |
|---|---|
| Purpose | Consent-gated SMS as an email-support channel (the framework's own positioning: SMS is never standalone). Appointment nudges, "check your email" pings, docs-needed follow-up reminders (the reminder only — the documents themselves are collected in the lender/LOS world, never in the CRM). |
| Data in | Inbound replies (routed to Conversations), delivery receipts, opt-out (STOP) events. |
| Data out | Templated, human-approved or policy-whitelisted SMS; every send consent-checked. |
| Direction | Two-way. |
| Phase | **Phase 2.** But see the approval gate: 10DLC registration paperwork starts during Phase 1 because it takes weeks. |
| Risk | **High (regulatory).** TCPA liability, consent recordkeeping, mandatory opt-out handling. Product rule inherited from the framework and enforced in code: **no rate locks, payment changes, cash-to-close changes, closing delays, problem files, or adverse outcomes over SMS — ever.** |
| Open questions | Vendor choice (Twilio vs. Telnyx vs. embedded provider); one brand/campaign registration for all LOs vs. per-LO numbers; where existing contacts' SMS consent status lives today (probably nowhere — assume no consent until captured). |

### 2.3 E-signature (DocuSign-class)

**Justification:** the relationship side of the business generates documents the CRM itself will originate — communication-consent forms, co-branded marketing agreements with agents, partner referral agreements. Loan documents of every kind — disclosures, authorizations, applications — are **not** in scope: those are generated and e-signed inside the lender/LOS world, and Loan Factory CRM must not duplicate that.

| Field | Detail |
|---|---|
| Purpose | Send-for-signature on CRM-originated relationship documents (communication consents, co-branded marketing and partner agreements); signed-status events feed automations ("partner agreement signed → co-marketing campaign unblocked"). |
| Data in | Envelope status events, signed PDFs. |
| Data out | Documents + recipient routing. |
| Direction | Two-way. |
| Phase | **Phase 2–3.** Nothing in Phase 1 requires it. |
| Risk | **Low–Medium.** Commodity APIs; the real question is scope discipline (do not creep into disclosure or loan-document delivery of any kind). |
| Open questions | Does Loan Factory corporate already have a DocuSign-class account the CRM can ride on? Which co-branded marketing agreements do agents sign today, and who owns those templates? |

### 2.4 Zoom (or Google Meet)

**Justification:** the lifecycle has two consultation stages (3 Consultation Scheduled, 4 Consultation Completed); LO websites carry a working-schedule feature implying bookable consultations; remote consultations are standard practice for a multilingual, multi-state broker base.

| Field | Detail |
|---|---|
| Purpose | Attach a meeting link automatically when a consultation is scheduled; log the meeting against the contact; (Phase 3) meeting transcripts/summaries feed conversation intelligence. |
| Data in | Meeting created/completed events; later, recordings/transcripts (see approval gate — recording consent). |
| Data out | Meeting creation requests. |
| Direction | Two-way. |
| Phase | **Phase 2** for scheduling; Phase 3 for transcripts. If Google Workspace lands first, Google Meet may cover this for free — decide once 2.1 is resolved. |
| Risk | **Low** for scheduling. Recording features move it into the consent gate below. |
| Open questions | What do LOs use today — Zoom, Meet, phone? Is a scheduling layer (Calendly-class) also in use? |

---

## Tier 3 — FUTURE (Phase 3+, named as classes not commitments)

Every row in this tier is a **read-only feed into the CRM**. Loan work — origination, underwriting, pricing, credit, applications, document collection — stays in the systems that own it; the CRM consumes their facts to keep relationship stages current and trigger communication.

| Integration | Purpose | Data in / out | Direction | Phase | Risk | Key open questions |
|---|---|---|---|---|---|---|
| **LOS (Encompass/ARIVE-class), read-only milestone sync** | Milestone visibility. The communication framework's own automation prerequisites say milestone templates fire only when "exact milestone confirmed in lender/source system" — full automation of stages 12–16 (Submitted to UW → Funded) ultimately needs an LOS feed. Until then, milestone facts are entered by the team in the CRM and everything still works. Either way the CRM records read-only visibility and trigger metadata; the LOS remains the system of record and the CRM never owns loan-of-record data. | In: loan milestones, key dates, loan-level fields for communication merge tokens. Out: none. | Inbound (read-only). | 3 | **High** — borrower NPI, vendor contracts, wholesale-lender fragmentation across many lenders. | Which LOS does Loan Factory actually broker through? Is there one system of record or one per lender? |
| **POS (online application intake), read-only status sync** | The LF platform's 1003 Application Widget proves online 1003 intake exists — entirely outside the CRM, and it stays there. Phase 3 subscribes read-only to application-status events so opportunity stages stay current and follow-up communication fires on time ("application started, not finished → nudge"). Application links are sent through the CRM's own communication channels; the intake itself is never rebuilt or hosted in the CRM. | In: application-status events. Out: none. | Inbound (read-only). | 3 | **High** — NPI in status payloads; keep fields minimal. | Where do 1003 Widget applications go today, and can the CRM subscribe to their status events? |
| **Real-estate data (home value / listing / MLS-class)** | Powers RETAIN/GROW: annual-review equity estimates, listing alerts on past clients ("your past client just listed their home"), refinance-opportunity detection alongside rate data — all as prompts for human-approved outreach. | In: AVM values, listing events, property records. Out: none. | Inbound. | 3 | Medium — data licensing costs, accuracy disclaimers (no unsupported savings claims per compliance rules). | Vendor class (ATTOM/CoreLogic-class vs. lighter AVM APIs); cost per contact monitored. |
| **Call recording / conversation intelligence** | Phase 3 voice intelligence: recorded call summaries, coaching, commitments extracted to tasks. | In: recordings, transcripts. Out: none. | Inbound. | 3 | **Very high** — consent law. Hard-gated below. | Telephony source (does SMS vendor also carry voice?); state-by-state consent map. |
| **Social publishing APIs (Meta/IG/LinkedIn/YouTube)** | The Marketing module's content library (70+ artifacts) currently assumes manual posting. Direct publish-with-approval is a Phase 3 convenience, never a Phase 2 blocker. | Out: approved posts. In: basic engagement metrics. | Two-way (communication out, metrics in). | 3 | Medium — platform API churn, per-LO OAuth sprawl. | Which platforms actually matter per team (VI-language teams skew differently). |

**A note on TERA+.** The discovery set includes a persona pack built around TERA+, a parallel Loan Factory platform effort. Those materials serve this blueprint purely as source material — they inform [[User_Personas]], the usability scorecards, and the scenarios in [[QA_Plan]] — and that is the full extent of their role. TERA+ is not an integration target, not a dependency, and nothing in this map waits on it. If a Loan Factory LOS/POS feed ever becomes available, it enters this map through the read-only LOS/POS rows above like any other external source.

---

## Approval gate — REQUIRES LEGAL / SECURITY / VENDOR APPROVAL

These are gates, not phases. No build starts, and no vendor sandbox account gets real data, until the named approval exists in writing. Each item below also appears in a tier above; this section is the checklist Jeremy's counsel and compliance owner sign.

| Gated item | Why it's gated | What approval must cover | When to start the paperwork |
|---|---|---|---|
| **LOS/POS borrower-status data** | GLBA/NPI. Even a read-only feed of milestones, key dates, and application status is borrower NPI — the most sensitive data class the CRM would ever hold, and it holds only these visibility facts, never the loan file itself. | Vendor/lender data-sharing agreements, field-minimization review (sync only what communication triggers need), security review of the CRM's storage (encryption, RLS, audit trail), incident-response plan, data-processing terms. | Phase 2–3. |
| **Call recording** | One-party vs. **two-party consent varies by state**; Loan Factory operates multi-state, so the design must assume two-party consent: announced recording, per-call consent capture, no silent recording ever. | State consent matrix from counsel, recording-announcement UX, retention/deletion policy, who may listen (RBAC). | Before any Phase 3 voice work. |
| **SMS 10DLC + TCPA** | Carrier-mandated A2P 10DLC brand and campaign registration; TCPA consent, quiet hours, opt-out handling, consent recordkeeping. | Brand/campaign registration filed, consent-capture design approved (per-contact, timestamped, channel-specific — matching the framework's "consent-tracked email/SMS" posture), opt-out supremacy verified. | **During Phase 1** — registration lead time is weeks, and Phase 2 SMS cannot slip waiting on it. |
| **Gmail restricted scopes** | Google security review (CASA) for restricted Gmail API scopes — a security gate rather than a legal one, and on the **Phase 2 critical path** because Gmail is the planned Phase 2 send/receive path (2.1). | Completed CASA assessment, scope minimization justification. | **Day one of Phase 1** (paperwork only — no Phase 1 code touches Gmail). The timeline is Google's, not ours — the transactional-provider fallback in 2.1 exists precisely for this. |

---

## Recommended build order

1. **Phase 1, week 1: n8n backbone (1.4).** Production instance, secrets vaulted, error alerting, CRM service API. Nothing in the Phase 1 walking skeleton depends on it, but everything in Phase 2 rides on it.
2. **Phase 1 (paperwork only): Gmail CASA verification (2.1).** OAuth verification starts day one because the timeline is Google's, not ours; the transactional-provider fallback is selected and integrated early so a slipped review never gates Phase 2 email.
3. **Phase 1 (discovery only, zero code): Loan Factory platform lead streams (1.1 + 1.2).** Open the conversation with LF IT immediately, because the mechanism (webhook vs. export vs. email-parse) is the biggest unknown and costs calendar time, not build time. The one Phase 1 build item here is UTM/gclid attribution fields on lead records (1.3) — free, just store what arrives.
4. **Phase 1 (in parallel, paperwork only): start the remaining gates.** File 10DLC registration; ask counsel for the call-recording state matrix. These cost weeks of calendar time and near-zero build time.
5. **Phase 1 content import: Custom GPT migration (1.5).** AI's guardrails and Marketing knowledge, imported once.
6. **Phase 2 (first): Google Workspace sync (2.1).** Gmail threads into Conversations, sends via the LO's real Gmail, Calendar into Today — on the CASA clearance secured during Phase 1, or on the transactional-provider fallback until it clears.
7. **Phase 2: lead ingestion build from the Loan Factory platform (1.1 + 1.2).** One n8n pathway that captures widget leads, QM Pricer actions, and "Automatically Created" Facebook leads with structured source attribution — the highest-value, lowest-legal-risk integration in the map, built as soon as Phase 2 opens on whatever mechanism the Phase 1 discovery surfaced.
8. **Phase 2: SMS (2.2)** once 10DLC clears — consent-gated, blocked-topics enforced in code.
9. **Phase 2: Zoom/Meet scheduling (2.4)** and **e-sign (2.3)** as automation needs pull them in (partner-agreement signing is the natural first e-sign use).
10. **Phase 2–3: Marketing/Intelligence reporting** (GA4 Data API, Google Ads, Meta Marketing API).
11. **Phase 3: read-only LOS/POS status sync and real-estate data** — strictly after the corresponding approval gates; sync-in only, and the CRM never owns loan-of-record data.
12. **Phase 3 (last): call recording / conversation intelligence**, only on top of a counsel-approved consent framework.

## Anti-pattern: never gate Phase 1 on an external system

The Phase 1 walking skeleton — Today, People, leads, CRM opportunity records with mortgage stages, tasks, notes and activity history, responsive desktop and mobile web layouts, foundational AI recommendation cards with the approval workflow shell — ships with **no external connection at all**, so nothing external can slip it: leads entered manually or via CSV import; stage and milestone facts entered by the team; AI cards running on controlled mock output. Every integration in this map is additive; none is load-bearing for launch. This is a lesson written into the discovery materials twice over: the old CRM prototype displayed "Encompass ✓ Connected" as a static decoration for an integration that never existed (see [[Current_State_Audit]]), and the LF platform integrations, while real, have no documented API and could change shape at any time. Loan Factory CRM never shows an integration as connected unless it is verifiably exchanging data, degrades gracefully when a connection drops, and treats every inbound payload — like every AI output — as untrusted until validated.
