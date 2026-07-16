# Automation_Catalog

Purpose: the complete catalog of automations Loan Factory CRM ships, written so Jeremy can approve each one without translation. Every automation is defined the same way — what kicks it off (trigger), what must be true (condition), what happens (action), what Ally does, how much freedom it has (tier), which loan stages it runs in, what consent and compliance gates protect it, and which build phase delivers it. Every row is CRM work: communication and relationship follow-up triggered by loan facts. The loan work itself — documents, disclosures, underwriting, pricing — happens in the LOS/POS and other source systems; the CRM only carries the facts, entered by the team in v1 and later optionally synced read-only ([[Integration_Map]]). Triggers and policies are grounded in the prior CRM automation thinking from the 135-template communication framework (its CRM Automation Map and Workflow Triggers docs), extended to cover the gaps that pack left open. The governing rule from [[Decisions]] D-05 applies everywhere: **Ally prepares, the human approves — no borrower-facing message ever sends on its own in v1.** Related: [[Mortgage_Workflow_Map]] · [[AI_Product_Architecture]] · [[Mortgage_Compliance]] · [[Communication_Templates]] · [[PRD]].

---

## 1. The safe-automation tier model

Every automation in Loan Factory CRM is assigned exactly one tier. The tier answers the only question that matters: **how much can this run without a human?** The model extends the five policy levels already defined in the communication framework's CRM Automation Map (Manual / Semi Automated / Fully Automated / Manual Only / Never Automate) and hardens them to CANON's v1 posture.

| Tier | Plain name | What it means | Maps to prior policy | Example |
|---|---|---|---|---|
| **T1** | **Runs itself** | Fully autonomous — but only for actions that never leave the building: creating tasks, alerting the LO, updating records, scheduling internal reminders, moving items onto Today. No borrower or partner ever sees a T1 output directly. | (new — internal actions were implicit in the pack's "Suggested Task Creation" and "Internal Notification" columns) | New Facebook lead arrives → LO gets an instant alert and a "call now" task appears on Today. |
| **T2** | **Ally prepares → you approve** | Ally drafts the message, fills every merge field, runs the compliance lint, and queues it with a one-tap **Approve & Send**. Nothing sends until a human taps. This is the ceiling for all borrower- and partner-facing communication in v1 — including everything the prior pack rated "Fully Automated." | Fully Automated + Semi Automated | Preapproval letter marked ready → Ally queues the congratulations email; LO reviews and taps send. |
| **T3** | **Ally suggests only** | Ally surfaces the opportunity and a recommended template or talking points, but the human composes or heavily edits before anything is queued. Used where facts must be human-verified or the relationship demands a personal touch. | Manual | Refi opportunity detected → Ally shows the math source and suggests a check-in; LO writes the message. |
| **T0** | **Human only — never automated** | The CRM will not draft or queue this communication at all. Ally's only role is detection: it creates a human-review task and notifies the LO and operations owner. Prior pack rule preserved verbatim: rate lock, cash-to-close change, payment change, closing delay, and problem-file messages must never be automated. | Manual Only / Never Automate | Closing delay risk identified → task "Call the Nguyens today — closing may slip" + ops notification. No draft. |

**Rules that bind every tier:**

1. **Stop conditions always override timing rules** (carried verbatim from the prior Workflow Triggers doc). Every queued item dies instantly when its trigger no longer applies, the recipient responds, the file advances past the stage, the item is received/waived, the milestone changes, or the contact opts out.
2. **Opt-out and DNC are supreme.** Unsubscribe, opt-out, active complaint, or relationship-owner suppression halts every automation for that contact — no exceptions, no automation may be configured to bypass it.
3. **One owner per topic.** A contact can never receive two automated touches on the same topic in the same window; the automation engine deduplicates by contact + topic.
4. **Trigger facts must be confirmed, never guessed.** Milestone-class triggers (Clear to Close, Funded, Disclosures Sent) fire only from a loan fact the assigned file owner has entered after verifying it in the source system — or, once future integrations land, from a read-only sync of that source record ([[Integration_Map]]). The CRM never owns the loan of record; it carries the facts for visibility and communication.
5. **Every action is logged and attributable**: who/what triggered it, what Ally drafted, who approved, what was sent, in the audit trail defined in [[Technical_Architecture]].
6. **Language follows the contact.** Every draft is prepared in the contact's preferred language where a reviewed variant exists; otherwise Ally drafts in English and flags "translation review required" per [[Communication_Templates]].

**Earned autonomy (proposed, needs Jeremy's sign-off — log in [[Decisions]]):** in Phase 3, an individual T2 automation that (a) was rated "Fully Automated" in the source framework, (b) has been approved 50+ times with an edit rate under 5%, and (c) Jeremy explicitly flips on per-automation, may graduate to sending without per-message approval — still consent-gated, stop-condition-gated, and lint-gated, with a daily digest of what went out and a one-tap kill switch. Until that decision, everything borrower-facing stays T2.

---

## 2. Consent & compliance gates (shared vocabulary)

Each catalog row cites gate codes instead of repeating paragraphs. Full rules live in [[Mortgage_Compliance]].

| Gate | Name | Rule |
|---|---|---|
| **G1** | Email consent | Valid email consent on record; CAN-SPAM-compliant footer and working unsubscribe on every send. |
| **G2** | SMS consent | Explicit SMS opt-in (TCPA). SMS is support-only, restricted to the three approved archetypes from the framework's SMS Cross Reference; **blocked SMS topics**: rate locks, payment changes, cash-to-close changes, closing delays, problem files, adverse outcomes, complaints, borrower-sensitive conditions. Quiet hours enforced (8am–8pm contact-local, configurable). *Note: no SMS provider is a confirmed integration yet — see [[Integration_Map]]; SMS actions ship when one is contracted.* |
| **G3** | Partner privacy wall | Agent-facing messages may share milestone, timeline, and file owner only — never credit, income, assets, AUS results, or condition details. Borrower authorization confirmed where applicable. |
| **G4** | Milestone source-confirmed | Exact milestone verified against the lender/source system before the trigger fires (CTC, Funded, Disclosures, CD) — the fact is entered by the file owner in v1 and may later sync read-only via [[Integration_Map]] integrations. "Clear to close means the file can move into final closing steps. It does not mean funding or recording is complete." |
| **G5** | Compliance lint | Deterministic pre-queue check on every draft: NMLS #320841 + LO NMLS + Equal Housing line present where required; no guarantee/rate/savings claims; do-not-say list; state rules; required footer. Blockers stop the queue, not just warn. |
| **G6** | Merge-field completeness | All required merge fields (the framework's 17-token vocabulary) populated from real records; a missing field blocks the queue with a named fix ("No email on file — add it"), never sends a blank. |
| **G7** | Fair-lending-safe targeting | Segment and scoring logic uses documented behavioral/file-progress factors only; no protected classes or proxies ([[AI_Product_Architecture]], D-11). |
| **G8** | Human fact review | The factual claim in the message (delay reason, payment figure, review-worthiness) must be human-verified before compose. Attached to all T0 and most T3 rows. |
| **G9** | RESPA-aware co-marketing | Anything co-branded with an agent (open house flyers, joint campaigns) passes the co-marketing review checklist before send — no thing-of-value problems. |

---

## 3. The catalog

Column key — **Tier** per §1; **Stages** use the locked 20-stage numbers from [[Mortgage_Workflow_Map]]; **Phase** per the [[Implementation_Roadmap]]; **EMT-###** = template IDs from [[Communication_Templates]].

**Fact provenance rule:** every loan-fact trigger below — milestones, application states, docs-needed and condition follow-up flags — fires from CRM stage/milestone visibility data the team enters in v1. Future LOS/POS integrations may supply the same facts as a read-only sync ([[Integration_Map]]); the CRM never owns loan-of-record data, and no row below performs loan work.

**Phase floor rule:** a row's Phase can never precede the phase of the engine capability it depends on. Multi-day cadences, timed reminders, and stage- and milestone-fact triggers all need the Phase 2 trigger engine (FR-AU-1 — the Roadmap's P1 ships task-based SLAs only), so Phase 1 rows are limited to record-creation events, single-shot drafts with approval, and task-based SLA mechanics. **SMS floor:** every SMS step anywhere in this catalog is Phase 2 at the earliest, must match an approved G2 archetype, and ships email + task until the SMS provider / 10DLC gate clears ([[Integration_Map]]).

### A. Speed-to-lead & contact cadence (ENGAGE)

The highest-ROI automations in the product. Design target: **first touch inside 5 minutes** of lead creation during working hours.

| ID | Automation | Trigger | Condition | What happens / Ally's role | Tier | Stages | Gates | Phase |
|---|---|---|---|---|---|---|---|---|
| A-01 | **Speed-to-lead alert** | New lead created — any source: LF website form/widget, Facebook lead tagged "Automatically Created," QM Pricer quote/apply/qualify, manual entry, CSV import | Lead has an assigned LO (routing rule or Default Loan Officer); dedupe check passed | Instant push + Today card "New lead — call now" with source, intent, and language; task auto-created with a 5-minute SLA timer; lead scored and slotted in [[Screen_Specifications]] Today queue | T1 | 1 | G7 | 1 |
| A-02 | **First-touch draft** | Same event as A-01 | Consent captured at the lead source | Ally drafts the source-matched intro — realtor referral → EMT-001, online lead → EMT-002, past-client referral → EMT-003 — plus a call opener script; LO taps Approve & Send or calls first | T2 | 1 | G1 G5 G6 | 1 |
| A-03 | **Contact-attempt ladder** | Contact attempt logged with no response | Lead still in stage 1–2; no reply; no opt-out | Escalating cadence, **email + task only**: Day 0 call + email · Day 2 second email (new angle) · Day 4 call task · Day 7 email · Day 10 "should I close your file?" breakup email · then move to long-term nurture. Every message T2-queued; every call is a T1 task. No SMS step: a stage-1 lead has no portal request, so no approved SMS archetype applies ([[Mortgage_Compliance]] §3). *The source pack has no borrower re-attempt sequence — these 3 new templates are commissioned in [[Communication_Templates]].* | T2 (messages) / T1 (tasks) | 1–2 | G1 G5 G6 | 2 (cadence needs the trigger engine) |
| A-04 | **Referral acknowledgment to agent** | Realtor referral received | Referring agent on file | Ally queues EMT-004 thank-you/confirmation to the agent; after first borrower contact attempt, queues EMT-005 status update ("I've reached out") | T2 | 1–2 | G1 G3 G5 | 2 |
| A-05 | **Rate-alert lead capture** | Borrower creates a rate alert in the QM Pricer | Pricer integration live (proven UI exists; API contract unproven — [[Integration_Map]]) | Lead created with intent "rate watcher," routed like A-01; feeds the refi-watch pool (G-04) | T1 | 1, 19 | G7 | 2 |

### B. Consultation & appointments (stages 3–4)

| ID | Automation | Trigger | Condition | What happens / Ally's role | Tier | Stages | Gates | Phase |
|---|---|---|---|---|---|---|---|---|
| B-01 | **Appointment confirmation** | Consultation booked | Valid email; appointment record exists (calendar sync ships Phase 1.5–2 — [[Integration_Map]]) | Ally queues a confirmation with date/time, what to bring, and reschedule link (EMT-049 pattern) | T2 | 3 | G1 G5 G6 | 2 (needs appointment records) |
| B-02 | **Appointment reminders** | 24 hours and 2 hours before appointment | Appointment still scheduled | 24h email reminder T2-queued in advance with the confirmation (approved as a set); 2h touch is **email + a T1 "confirm attendance" prompt to the LO** — an appointment reminder is not one of the three approved SMS archetypes ([[Mortgage_Compliance]] §3), so moving the 2h touch to SMS requires a formally reviewed fourth transactional-reminder archetype (propose via [[Decisions]]; not assumed here) | T2 / T1 | 3 | G1 G5 | 2 (needs appointment records + timed triggers) |
| B-03 | **No-show recovery** | Appointment time passed, no meeting outcome logged | No reschedule already booked | T1 task "Reschedule with {name}"; Ally drafts a warm no-blame reschedule email | T2 / T1 | 3 | G1 G5 | 2 |
| B-04 | **Post-consultation recap** | LO marks consultation completed | Meeting notes exist | Ally drafts a recap: what was discussed, agreed next steps, document list, application link — from the LO's notes, never invented | T2 | 4 | G1 G5 G6 G8 | 2 |

### C. Preapproval & home search (QUALIFY)

| ID | Automation | Trigger | Condition | What happens / Ally's role | Tier | Stages | Gates | Phase |
|---|---|---|---|---|---|---|---|---|
| C-01 | **Preapproval next steps** | File owner marks the application ready for preapproval review (loan fact — team-entered v1, read-only sync later) | Merge fields complete | Ally queues EMT-006 (what happens next, document list) | T2 | 5 | G1 G5 G6 | 2 (needs milestone-fact triggers) |
| C-02 | **Preapproval issued package** | Preapproval letter marked ready (fact recorded by the file owner; the letter is produced in the source system) | Letter confirmed in source system | Ally queues EMT-007 congratulations to the borrower (the letter itself is delivered from the source origination system — the CRM never sends loan documents), and EMT-008 privacy-safe update to the agent | T2 | 6 | G1 G3 G4 G5 | 2 |
| C-03 | **Preapproval follow-up while searching** | Every 14 days in Searching for Home | No contact logged in window; preapproval still valid | Ally queues a market-neutral check-in ("still searching? anything changed?") — *new template commissioned; no stage-7 content exists in the source pack* | T2 | 7 | G1 G5 | 2 |
| C-04 | **Preapproval expiration watch** | Preapproval letter within 21 days of expiry | Borrower still in stages 6–7 | T1 task "Refresh preapproval for {name}" + Ally drafts the re-verification request (updated paystub/statement per EMT-012/013 patterns) | T2 / T1 | 6–7 | G1 G5 G6 | 2 |
| C-05 | **Application completion chase** | Application flagged incomplete (fact from the external application platform — team-entered v1, read-only sync later) | Flag still active | Day 0: EMT-018 "finish your application" with the link to the external application platform · Day 1: portal-nudge SMS (a genuine request to visit the external application portal, so the archetype fits; email + task until the SMS provider/10DLC gate clears) · Day 3: T1 follow-up task · Day 5: LO call task. Stops the moment the team clears the flag | T2 / T1 | 5, 9 | G1 G2 G5 G6 | 2 (needs milestone-fact triggers + cadence engine) |

### D. Document & disclosure follow-up communication (TRANSACT)

The workhorse category — the prior pack's richest coverage, adopted nearly one-for-one *as communication*. The boundary is bright: documents and conditions are requested, collected, stored, and reviewed in the LOS/POS and its secure portal — never in the CRM. What the CRM holds is a simple docs-still-needed follow-up flag and the loan facts the team logs (read-only sync later); every row below is the follow-up message and task that flag drives.

| ID | Automation | Trigger | Condition | What happens / Ally's role | Tier | Stages | Gates | Phase |
|---|---|---|---|---|---|---|---|---|
| D-01 | **Document request follow-up** | Docs-needed follow-up flag set (team logs which items to request; the checklist itself lives in the LOS/POS) | Flag active with ≥1 named item | Ally queues EMT-010 (link to the external secure portal, itemized list from the LO's request). Specific-item variants auto-selected: paystub EMT-012, bank statement EMT-013, W2 EMT-014, tax returns EMT-015, letter of explanation EMT-016 | T2 | 9–13 | G1 G5 G6 | 2 |
| D-02 | **Document still-missing reminder** | Docs-needed flag still active after 1 day | Team hasn't cleared the flag (receipt or waiver in the source system clears it) | Ally queues EMT-011 reminder + same-day SMS archetype; T1 same-day follow-up task; LO and ops owner notified. Repeats every 2 business days, max 3 cycles, then escalates to a call task | T2 / T1 | 9–13 | G1 G2 G5 G6 | 2 |
| D-03 | **Unreadable/wrong document** | Team logs that a document came back unreadable or wrong (fact from the LOS/processor) | — | Ally queues EMT-051 (what was wrong, how to re-send) + same-day task + LO/ops notification | T2 / T1 | 9–13 | G1 G5 G6 | 2 |
| D-04 | **Disclosure signing follow-up** | Disclosure facts logged: sent → unsigned after 1 day → signed (team-entered v1, read-only sync later; the disclosures themselves are generated and signed in the source system) | Official document confirmed in source system | Sent: EMT-019 what-to-expect · +1 day unsigned: EMT-020 reminder + SMS archetype + same-day task + LO/ops notification · Signed: EMT-021 confirmation | T2 / T1 | 10 | G1 G2 G4 G5 G6 | 2 |
| D-05 | **Condition follow-up (borrower)** | Team logs a borrower-action follow-up (an outstanding condition — the condition itself is worked in the LOS) | Follow-up flag active | Ally queues EMT-026 with the needed item in plain language + same-day task; team clears the flag on receipt → EMT-054 "received, pending review" | T2 / T1 | 13 | G1 G5 G6 | 2 |
| D-06 | **Condition follow-up (agent/transaction)** | Team logs an agent/transaction-side follow-up item | Privacy-safe framing confirmed | Ally queues EMT-027 to the agent + same-day task + LO/ops notification | T2 | 13 | G1 G3 G5 | 2 |
| D-07 | **Third-party chase** | Team logs a third-party item to chase (title status, insurance evidence, VOE) | Vendor contact on file | Ally queues EMT-035/036/037/056 to the vendor; T1 follow-up task if no response by window; file owner notified if blocked | T2 / T1 | 11–14 | G5 G6 | 2 |

### E. Milestone updates — borrower and agent

Every milestone fires **two** mirrored updates: full detail to the borrower, privacy-safe status to the agent. Milestone triggers are source-confirmed (G4): the fact is entered by the file owner in v1 and may later sync read-only from the LOS/POS — the CRM never announces a milestone it can't prove.

| ID | Automation | Trigger | What happens / Ally's role | Tier | Stages | Gates | Phase |
|---|---|---|---|---|---|---|---|
| E-01 | **Application received** | Application-received fact logged (team-entered v1, read-only sync later) | EMT-017 confirmation + what happens next | T2 | 9 | G1 G5 G6 | 2 (needs milestone-fact triggers) |
| E-02 | **Submitted to underwriting** | File submitted to UW | EMT-022 to borrower; agent mirror status | T2 | 12 | G1 G3 G5 | 2 |
| E-03 | **Conditional approval** | Conditional approval received | EMT-024 to borrower (explains "conditional" without promising approval); EMT-025 when major conditions clear | T2 | 13 | G1 G5 G6 | 2 |
| E-04 | **Appraisal journey** | Ordered / paid / assigned / scheduled / received / revision requested | EMT-028–033 auto-selected per event; revision-needed adds SMS nudge + task | T2 / T1 | 8–11 | G1 G3 G5 G6 | 2 |
| E-05 | **Closing Disclosure sent** | CD sent | EMT-038 + same-day T1 task + LO/ops notification (CD acknowledgment starts the 3-day clock — chase matters). **Email + task only — no SMS**: a CD notice sits too close to the blocked closing-topic SMS class ([[Mortgage_Compliance]] §3) to risk over that channel | T2 / T1 | 14 | G1 G4 G5 | 2 |
| E-06 | **Clear to close** | CTC issued (source-confirmed) | EMT-039 — worded per compliance rule: CTC ≠ funded | T2 | 14 | G1 G4 G5 | 2 |
| E-07 | **Closing scheduled + wire-fraud warning** | Closing appointment scheduled | EMT-040 with date/place/what-to-bring + the wire-fraud warning template (EMT-120s set): never wire on emailed instructions alone, verify by phone | T2 | 15 | G1 G4 G5 G6 | 2 |
| E-08 | **Closing day & funded** | Closing day reached; funding and recording confirmed | EMT-041 congratulations; EMT-042 funded/recorded confirmation; agent mirror + thank-you | T2 | 15–16 | G1 G3 G4 G5 | 2 |
| E-09 | **Weekly status heartbeat** | Status update cadence due (no update sent in 7 days on an active file) | EMT-050 friendly "here's where we are" — prevents the "why haven't I heard anything" call | T2 | 11–14 | G1 G5 G6 | 2 |
| E-10 | **Team handoff intros** | Loan coordinator assigned; processor assigned | EMT-048 / EMT-052 introduce the new team member with photo, role, and contact | T2 | 9–11 | G1 G5 G6 | 2 |

### F. Stalled deals & problem files

Detection is autonomous; borrower-facing wording about problems is the most protected class in the product.

| ID | Automation | Trigger | Condition | What happens / Ally's role | Tier | Stages | Gates | Phase |
|---|---|---|---|---|---|---|---|---|
| F-01 | **Stalled-deal detector** | No stage movement or logged activity beyond the per-stage SLA ([[Mortgage_Workflow_Map]] sets days-in-stage norms) | Active file | File flagged amber→red on Pipeline; Today card "This file has been quiet {n} days — here's why it matters"; Ally states the last known blocker from record data. *Phase 1 ships only the task-based SLA subset of this (overdue tasks and SLA timers surfacing on Today — the Roadmap's P1 mechanism); the days-in-stage detector itself needs the P2 trigger engine (FR-PL-5)* | T1 | 1–15 | G7 | 2 (P1: task-SLA subset only) |
| F-02 | **Stalled-deal borrower nudge** | F-01 fired and the blocker is a borrower action (docs, signature, decision) | Blocker verified from records | Ally drafts a specific, non-alarming nudge tied to the open item (reuses D-category templates) | T2 | 5–14 | G1 G5 G6 | 2 |
| F-03 | **Problem file / delay communication** | File blocker identified · closing delay risk · cash-to-close changed · payment changed · rate-lock conversation needed | Always | **Never drafted, never queued.** T1 creates a human-review task for the LO/processor and notifies the LO and operations owner. Human composes after fact review. One adjacent exception, verified against the source framework: **EMT-062 is the Loan Estimate Explanation education template** (rated Semi Automated in the source — it explains how to read an LE and never announces a figure change), so Ally may draft that explainer for review. The actual cash-to-close and payment-change templates are **EMT-063 (Cash to Close Changed) and EMT-064 (Payment Changed)** — Manual Only in the source, T0 here, never drafted by any path | T0 (EMT-062 only: T2) | 8–15 | G8 | 1 (detection) |

### G. Retention, reviews & growth (RETAIN / GROW)

| ID | Automation | Trigger | Condition | What happens / Ally's role | Tier | Stages | Gates | Phase |
|---|---|---|---|---|---|---|---|---|
| G-01 | **Post-close thank you & nurture arc** | Loan funded · +30 days · +6 months | Not opted out; relationship owner hasn't suppressed | EMT-043 thank-you at funding; EMT-045 30-day check-in (payments set up? questions?); EMT-046 6-month check-in. Each queued as a scheduled T2 approval | T2 | 16–17 | G1 G5 G6 | 2 |
| G-02 | **Review request** | Post-closing review window reached (default: 3 days after funding) AND closing sentiment not flagged negative | No active complaint; happy-path only | Ally queues EMT-044 with the Google review link. If any complaint or negative flag exists, the ask is suppressed and a T1 "personal follow-up" task is created instead — never automate a review ask into a complaint | T2 / T1 | 17 | G1 G5 G8 | 2 |
| G-03 | **Annual mortgage review** | Funded date + 12 months, recurring | Contact still owns the home; not opted out | Ally prepares a review brief for the LO — loan terms on file, time elapsed, rate context from an authorized source, "worth a conversation?" — then queues EMT-047 inviting the borrower to an annual check-up. **No savings figures in the message without LO-verified numbers** | T2 (invite) / T3 (any numbers) | 18 | G1 G5 G6 G8 | 2 |
| G-04 | **Refi rate watch** | Market rate (authorized feed) drops ≥ 0.5% below a funded loan's note rate — threshold configurable per loan | Rate feed live (unproven integration — [[Integration_Map]]); consent current | T1: loan flagged into the Refinance Opportunity queue with the math shown (note rate, market rate, source, date). The borrower message is **suggest-only**: the source framework marks refi outreach (EMT-132) Manual Only, and any savings language must be LO-verified. Ally proposes talking points; LO composes | T1 (detect) / T3 (message) | 19 | G1 G5 G7 G8 | 3 |
| G-05 | **Past-client reactivation** | No touch logged in 6+ months for a past client | Consent current; not suppressed | Client enters the Reactivation queue on Today; Ally drafts a personalized re-engagement referencing their loan anniversary, market context, or life stage from record data (EMT-127–135 nurture set). Equity/move-up money talk stays T3 | T2 (check-in) / T3 (scenarios) | 17–20 | G1 G5 G6 G7 | 3 |
| G-06 | **Birthdays & home anniversaries** | Contact birthday · funding-date anniversary (year 1, 2, 3…) | Date on file; consent current | Ally queues the greeting the week before as a batch (LO approves the week's greetings in one pass). Home anniversary includes "one year in the house" framing. No loan pitch inside a greeting | T2 | any | G1 G5 | 2 |
| G-07 | **Life-event flag** | Explicit life-event data recorded (LO note: marriage, new baby, job change, listing spotted) | Human-entered signal only — the CRM does not scrape or infer life events | Ally suggests a congratulations touch and, where relevant, a "your situation changed — want to revisit?" talking point. Never auto-queued: life events are personal | T3 | any | G1 G5 G8 | 3 |

### H. Agent partner touch plans (Partners)

| ID | Automation | Trigger | Condition | What happens / Ally's role | Tier | Stages | Gates | Phase |
|---|---|---|---|---|---|---|---|---|
| H-01 | **Monthly agent nurture** | Monthly Realtor nurture date per partner plan | Partner opted in; owner hasn't suppressed | Ally queues EMT-057 value-first monthly touch (market-neutral content from the Marketing library — [[Screen_Specifications]]), personalized with shared-deal history | T2 | Partners | G1 G3 G5 | 2 |
| H-02 | **Open house support** | Agent requests open house support | Request logged | Ally queues EMT-058 offer (flyers, on-site preapprovals, QM Pricer link) | T2 | Partners | G1 G3 G5 G9 | 2 |
| H-03 | **Co-branded marketing offer** | Co-branded marketing requested | Compliance review of the specific asset | Ally queues EMT-059 + routes the asset through the Marketing approval flow ([[Screen_Specifications]]) with the RESPA-aware checklist | T2 | Partners | G1 G5 G9 | 2 |
| H-04 | **New-partner onboarding sequence** | First loan closed with a new agent | Agent record created | 3-touch sequence over 30 days: closing thank-you + reciprocity intro → "how I keep your clients updated" (the E-category mirror, sold as a feature) → monthly-nurture opt-in ask. *New templates commissioned* | T2 | Partners | G1 G3 G5 | 2 |
| H-05 | **Partner reciprocity report** | Quarterly, per active partner | ≥1 shared deal in trailing 12 months | Ally prepares a referrals-given vs. referrals-received summary with shared-deal outcomes; LO approves and sends. Powered by the Intelligence section's partner analytics ([[Screen_Specifications]]) | T2 | Partners | G1 G3 G5 | 3 |
| H-06 | **Partner gone-quiet alert** | No referral or interaction from a previously active partner in 90 days | Partner was active (≥2 deals trailing year) | T1 Today card "You haven't heard from {agent} in 90 days" + Ally-suggested reconnect angle | T1 / T3 | Partners | G7 | 2 |

### I. Recruiting sequences (Team growth)

Recruiting targets loan officers, not borrowers — different audience, same discipline. Content seeds exist in the marketing content kit (recruiting campaign brief + prompt) — see [[Asset_Inventory]].

| ID | Automation | Trigger | Condition | What happens / Ally's role | Tier | Stages | Gates | Phase |
|---|---|---|---|---|---|---|---|---|
| I-01 | **Recruit-lead first touch** | Recruiting lead captured (event, referral, inbound) | Candidate record created with source | T1 alert to the recruiting owner + Ally drafts the intro (broker model, comp structure talking points — **no income promises**, per do-not-say rules) | T2 / T1 | Team | G1 G5 | 3 |
| I-02 | **Candidate nurture sequence** | Candidate marked "interested, not ready" | Not opted out | Monthly value sequence: platform capabilities, team stories, market POV — drawn from the recruiting content family in the marketing kit; each touch T2-approved by the recruiting owner | T2 | Team | G1 G5 | 3 |
| I-03 | **Candidate gone-quiet nudge** | No candidate response in 14 days mid-conversation | Active recruiting thread | T1 task + Ally-drafted check-in | T2 / T1 | Team | G1 G5 | 3 |

### J. Internal operations (no external recipient)

Small set, listed for completeness — these are pure T1 and ship earliest because they carry zero compliance surface.

| ID | Automation | Trigger | What happens | Tier | Phase |
|---|---|---|---|---|---|
| J-01 | **Daily briefing** | Each morning, per user | Ally assembles Today: new leads, SLA breaches, stalled files, approvals waiting, milestones due ([[Screen_Specifications]]) | T1 | 1 |
| J-02 | **SLA breach escalation** | Any reminder-class automation exhausts its cycle | Notify assigned LO and operations owner (the pack's universal escalation rule) | T1 | 2 |
| J-03 | **Pre-send health check** | Any batch/scheduled send queued | Named blockers with one-tap fixes ("Emily has no email on file — this send will skip her · Add email") — pattern salvaged from the prototype audit ([[Current_State_Audit]]) | T1 | 2 |
| J-04 | **Approval-queue ageing** | Any T2 item unapproved after 24h | Re-surface at top of Today; after 48h notify team leader | T1 | 1 |

---

## 4. What Loan Factory CRM deliberately does NOT automate

Stating the negative space so nobody "helpfully" builds it later:

- **No loan work, ever.** The CRM never generates or sends disclosures, never collects or stores loan documents, never manages underwriting conditions as a work surface, never prices a scenario, never takes an application. It communicates *about* those events from team-entered (later read-only-synced) facts — the doing happens in the LOS/POS and other source systems.
- **No autonomous borrower-facing sends in v1** — even for the 44 templates the source framework rated Fully Automated. That rating becomes eligibility for the Phase 3 earned-autonomy proposal, nothing more.
- **No automated messages about rates, payments, cash to close, delays, or problem files** (T0 class) — and none of those topics over SMS, ever.
- **No AI-inferred life events, no scraping** — life-event touches require a human-entered signal.
- **No automation that bypasses opt-out, DNC, consent, quiet hours, or suppression** — not configurable, not overridable, not even by an admin.
- **No adverse-action or denial communications** — those follow the regulated manual process in [[Mortgage_Compliance]], full stop.
- **No automated review asks after a complaint** — reputation automation never argues with an unhappy client.

## 5. Coverage gaps inherited from the source material (build notes)

1. The prior automation map covers templates EMT-001–065 only; the 70 specialty templates (ITIN, DSCR, FN, reverse, etc.) have placeholder triggers. Real triggers for those are authored as part of Phase 2 automation work — they slot into the D and E categories as program-specific variants of existing rows, not new automations.
2. No source content exists for stages 3–4 (consultation), 7 (searching), or a borrower contact-attempt cadence — new templates are commissioned in [[Communication_Templates]] (rows A-03, B-01–B-04, C-03).
3. SMS ships behind a provider decision and 10DLC registration ([[Integration_Map]], Roadmap Q4); every SMS action above degrades gracefully to email + task until then, and every remaining SMS step (C-05, D-02, D-04, E-04) maps to an approved G2 archetype. Rows where no archetype fits (A-03, B-02, E-05) are specified email + task permanently unless a new archetype is formally reviewed and added to [[Mortgage_Compliance]] §3 via [[Decisions]].
4. The refi rate watch (G-04) needs an authorized rate feed — the QM Pricer's rate engine is the natural candidate but its API is unproven; treat as a Phase 3 integration dependency.

Related: [[Mortgage_Workflow_Map]] · [[Communication_Templates]] · [[AI_Product_Architecture]] · [[Mortgage_Compliance]] · [[Integration_Map]] · [[Implementation_Roadmap]] · [[Decisions]] · [[Open_Issues]]
