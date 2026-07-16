# Launch Plan

Purpose: how Loan Factory CRM gets from a passing build to loan officers' daily hands without burning trust — a three-stage rollout (internal alpha on Jeremy's team → Loan Factory pilot cohort → broader rollout), with explicit success gates between stages, structured feedback loops, a training-asset program that reuses the proven Loan Factory marketing-training-pack format, a clear rollback stance, and a support model. The governing principle: **the CRM earns each expansion by hitting its gates, not by hitting a date.** A stage that misses its gate repeats; it does not get waved through. Feature scope per phase is in [[Implementation_Roadmap]]; what "passing" means is in [[Acceptance_Criteria]] and [[QA_Plan]].

---

## 1. Rollout stages at a glance

| Stage | Who | Size | Duration (working target) | Entry condition | Exit gate |
|---|---|---|---|---|---|
| **S0 — Internal alpha** | Jeremy + his immediate team (LO, coordinator, processor roles all represented) | 5–10 users | 4–6 weeks | Phase 1 features pass [[QA_Plan]] phase gate | Gate G-A (§3) |
| **S1 — Loan Factory pilot cohort** | Hand-picked LOs across the experience × tech-comfort grid, including at least one Vietnamese-language team | 25–50 users | 8–10 weeks | Gate G-A passed; training assets live; support model staffed | Gate G-B (§3) |
| **S2 — Broader rollout** | Loan Factory LO base in waves | Waves of ~100–200 seats | Ongoing | Gate G-B passed; migration/import tooling proven at pilot scale | Gate G-C per wave (§3) |

Phase 2 capabilities (email + templates, live Ally, automations, Partners, Marketing, Intelligence, Team) ride the same ladder: each significant Phase 2 capability goes internal-alpha → pilot-cohort-first → waves, behind feature flags, even after S2 is general. Nothing skips the ladder because "the CRM is already launched."

### Stage 0 — Internal alpha (Jeremy's team)

- **Purpose:** prove daily-driver viability with the people who can shout across the room when something's wrong. Real workflows, real (own-team) book of business, real mornings.
- **Composition matters:** at minimum one LO, one coordinator, one processing-side user — so role-aware Today, task handoffs, and permission blocks all get exercised, not just the LO path.
- **Working agreement:** the team runs their actual day in Loan Factory CRM (dual-running alongside existing tools is expected and fine); every Ally recommendation card gets an honest approve/edit/dismiss verdict; dismiss reasons are filled in.
- **What is deliberately ON:** the full Ally approval queue and recommendation cards (controlled mock output in Phase 1, clearly labeled), the audit trail, role-aware Today on desktop and phone browsers — trust surfaces need alpha mileage most.
- **What stays OFF:** all external integrations, any outbound email/SMS sending (these are Phase 2 capabilities per [[Implementation_Roadmap]]), any Loan Factory platform ingestion (Q2 unresolved), and anything not through its QA phase gate.

### Stage 1 — Loan Factory pilot cohort

- **Selection is deliberate, not volunteers-only:** recruit across the persona grid ([[User_Personas]]) — new/mid/veteran × tech-savvy/not-tech-savvy — because NTS veterans are where CRMs die. Include at least one full Vietnamese-language team (leader + LOs) so EN/VI parity is tested by people who live it, plus at least one team leader running the team view.
- **Cohort charter:** pilots commit to (a) Loan Factory CRM as the system of record for new leads during the pilot, (b) weekly feedback participation, (c) honest quitting — if a pilot LO abandons the CRM, that abandonment is recorded as data (which workflow, which day, why), not shamed.
- **Champion structure:** each pilot team names one champion who gets champion-track training (§4) and a direct line to the product team.
- **Book-of-record import** happens here for real: each pilot LO's existing contacts/past clients imported via the CSV path with dedupe preview (a Phase 2 capability riding the ladder into the pilot; [[PRD]] Q7 answered in practice). Import quality issues found here fix the tooling before S2 depends on it.

### Stage 2 — Broader rollout

- **Waves, not a flood:** ~100–200 seats per wave, each wave 2+ weeks after the last, gated on G-C. Wave order favors teams adjacent to pilot champions (peer pull beats top-down push).
- **Self-serve onboarding by design:** by S2, a new LO must reach their first approved Ally recommendation within their first session without human hand-holding — that is a G-B gate condition, proven before S2 begins.
- **Legacy sunset:** any tools Loan Factory CRM replaces are sunset per team only after that team's wave passes its 30-day adoption check — never globally by decree.

---

## 2. Feedback loops (all stages)

| Loop | Mechanism | Cadence | Feeds |
|---|---|---|---|
| In-app feedback | One-tap "this was wrong/confusing" on any Ally card, feed item, or block message; screenshot + context auto-attached | Continuous | Defect triage with the [[QA_Plan]] risk tags (JARGON, DASHBOARD-NOISE, AI-OVERTRUST…) |
| Approval-queue telemetry | Approve rate, edit distance, dismissal reasons per recommendation/draft type | Continuous | Ally tuning (mock-content tuning in P1, prompt/guardrail tuning once live); the G6 trust metric; golden-set additions |
| Office hours | Live session with pilot users (video, recorded) | Weekly in S0/S1; biweekly in S2 | Product backlog; training-asset gaps |
| Champion channel | Direct chat channel per cohort with product team | Continuous in S1/S2 | Fast-path bug reports; rollout-readiness signal |
| Usability re-tests | Scorecard sessions on the worst-scoring screens of the prior cycle | Every 2 weeks during S0/S1 | NTS threshold compliance ([[QA_Plan]] §3) |
| Escalation desk | Support tickets (§6) tagged by module and severity | Continuous | Support-model load data; G-gate defect counts |
| Leadership readout | The 13 scorecard readout questions + gate metrics presented to Jeremy | At every gate | Go/repeat/rollback decision |

Rule of the loops: **every dismissed Ally suggestion and every abandoned workflow is treated as free QA.** The telemetry exists ([[Acceptance_Criteria]] AC-TD-6); the discipline is reviewing it weekly and closing the loop visibly ("you told us X, we changed Y" in the weekly pilot note).

---

## 3. Success gates between stages

Gates are numeric where possible, and every gate includes the standing invariant check: **unapproved borrower-facing sends = 0, always** ([[Acceptance_Criteria]] INV-1). One confirmed violation at any stage freezes expansion and triggers the rollback stance (§5) for the affected capability.

### Gate G-A (alpha → pilot)

| # | Condition | Threshold |
|---|---|---|
| A1 | Daily-driver adoption | Every alpha user opens Today ≥ 4 business days/week for the final 3 alpha weeks |
| A2 | Ally trust | Recommendation approval rate (with or without edits) ≥ 50% and rising month-over-month; dismissal reasons reviewed and top-3 causes fixed |
| A3 | Recommendation grounding | Zero fabricated-record incidents in alpha — every Ally card's evidence links resolve to real records; golden set still ≥ 98% ([[QA_Plan]] §6.2) |
| A4 | Invariants | 0 unapproved sends; 0 privacy-wall incidents; audit trail complete on spot-audit |
| A5 | Stability | No data-loss incidents; crash/blocking-bug rate at agreed floor; all blocker-severity defects closed |
| A6 | Usability | All Phase 1 screens pass NTS thresholds and the <10s toddler-simple protocol; zero open critical-fail conditions |
| A7 | Readiness | Training assets for the pilot curriculum (§4) exist and were validated by an alpha NTS user; support desk staffed and reachable |

### Gate G-B (pilot → broad)

| # | Condition | Threshold |
|---|---|---|
| B1 | Adoption | ≥ 70% of pilot LOs weekly-active in the final month (the [[PRD]] G1 bar) |
| B2 | Speed-to-lead | Median time-to-first-action on new leads < 5 minutes in business hours across the cohort (G2) |
| B3 | Follow-up discipline | Follow-up SLA hit rate ≥ 90% and trending toward the 95% target (G3) |
| B4 | Ally trust | Approval rate on Ally recommendations and drafts ≥ 60% (G6); AI-OVERTRUST incidents = 0 in scorecard re-tests |
| B5 | Multilingual parity | VI-preference pilot users pass the same NTS thresholds as EN; VI reviewer sign-off current; zero diacritics/terminology defects open |
| B6 | Import proven | Pilot book-of-record imports completed with 0 unrecovered duplicate/merge failures; import runbook written from real cases |
| B7 | Support load | Ticket volume per user per week at a level the S2 support model can carry at 10× users (measured, not guessed) |
| B8 | Retention signal | ≥ 80% of pilot users say they would keep Loan Factory CRM if given the choice (simple exit survey); every "no" interviewed |
| B9 | Invariants | Same as A4, across the whole pilot period |

### Gate G-C (per S2 wave)

| # | Condition | Threshold |
|---|---|---|
| C1 | Prior wave healthy at 30 days | ≥ 70% weekly-active; support tickets per user flat or falling; 0 invariant violations |
| C2 | Onboarding self-serve | ≥ 80% of prior-wave users reached their first approved Ally recommendation in session one without human help |
| C3 | No open blockers | Zero blocker-severity defects; compliance QA suite green on the current release |

**Gate discipline:** a missed gate means the stage repeats its final measurement window after fixes — it is never "close enough." Gates are decided at the leadership readout with the numbers on the table; Jeremy holds the go/repeat call.

---

## 4. Training assets

Reuse the format that already works inside Loan Factory: the marketing training pack's guide template. Every Loan Factory CRM training guide follows the same 9-section pattern — **Source Digest → Screen Walkthrough (annotated screenshots) → Training Module → curriculum placement (101–601 track) → AI Advantage → 90-second video script → Resource Card → Quiz → Implementation Note** — so LOs who've done the Facebook Ads or QM Pricer training recognize the shape instantly, and the assets slot into the existing "LO Development Platform" curriculum structure if that initiative proceeds.

### Curriculum (Phase 1 set, built during alpha, validated by an NTS alpha user before pilot)

| Level | Guide | Covers | Primary persona |
|---|---|---|---|
| 101 | Your first morning in Loan Factory CRM | Today, the feed, one-tap actions, the <10s habit — on desktop or your phone's browser | New NTS LO |
| 101 | Approving Ally's work | Approval queue: approve / edit / dismiss / snooze; why dismiss-reasons matter; "Ally prepares, you approve" | All |
| 201 | Leads that never go cold | Lead capture, sources, assignment, first follow-up tasks | LO + assistant |
| 201 | Your pipeline in 5 columns | Board, 20 stages, stage moves entered by your team, what a stage change means | LO |
| 301 | Working as a team | Roles, handoffs, permission blocks | Coordinator + processor |
| 301 | Tiếng Việt trong Loan Factory CRM | The full EN guide set's VI counterpart — language preference, EN/VI interface parity, and (P2) the reviewed VI templates with the translation-review flag (native-quality VI, reviewer-approved, full diacritics) | VI-language teams |
| 401 (P2) | One inbox, right template | Conversations, stage-aware suggestions, merge fields, the compliance lint (what blocks mean and why they're protecting you), sender voices | LO + coordinator + processor |
| 401 (P2) | Automations you can read | Plain-English automation cards, stop conditions, the approval posture | LO |
| 401 (P2) | Partners without privacy risk | Referral ledger, safe status sharing, what agents never see | LO + ARM |
| 501 (P2) | Marketing that clears compliance | Brief → draft → review pipeline, risk tiers, escalation | Marketing coordinator |
| 601 (P2) | Leading with Intelligence | Team view, exception management, coaching signals | Team/branch leaders |

**Format rules carried over from the marketing pack:** every guide gets its markdown master + annotated screenshots + the 90-second video script (recorded as short videos for the champion track); quizzes are 5 questions, plain language; each guide ends with an Implementation Note listing known gaps ("needs confirmation") — the honesty convention from the source pack. Every guide's AI Advantage section shows one concrete Ally moment for that workflow (e.g., 201 Leads: "Ally has already prioritized this lead and prepared the recommended next step — your job is the 20-second review").

**Champion track:** pilot champions get the full curriculum early, plus a troubleshooting supplement (top block messages and what they mean, how to file great feedback) and direct product-team contact. Champions co-deliver wave onboarding in S2.

**Maintenance:** training assets version with the product; a screen change that invalidates a screenshot is a release checklist item, not a someday-task.

---

## 5. Rollback stance

Loan Factory CRM's rollback posture is **capability-level first, stage-level second, never data-destructive**:

1. **Feature flags on everything user-facing.** Every Phase 1/2 capability ships behind a flag togglable per user, per team, per cohort. Rolling back a misbehaving capability means flipping its flag for the affected population — minutes, not a redeploy.
2. **Ally kill switches.** Each Ally surface (recommendation cards, briefing, next-best-action, draft generation, compliance AI review) has an independent off switch. Turning Ally surfaces off degrades the product to a fully usable manual CRM — it is deliberately viable with AI off, so an AI-quality incident never forces a full retreat. The deterministic compliance lint is **not** switchable — it is part of the send path from the moment Phase 2 introduces one.
3. **Automation global stops** ([[Acceptance_Criteria]] AC-AU-6): per-automation and per-contact kill switches, plus a single all-automations pause per tenant for incident response. Anything already queued waits for approval anyway (INV-1), so "runaway sends" are structurally impossible; rollback is about stopping queue noise, not recalling messages.
4. **No stranded data, ever.** Dual-running with legacy tools is supported through S1 by design; contact-level export ([[PRD]] FR-ST-7) works from day one, so a team that rolls back to prior tools leaves with their book intact. Stage-level rollback (returning a cohort to prior tools) is a defined, tested runbook: flags off → export delivered → import into legacy verified → retro scheduled.
5. **Database migrations are backward-compatible** for at least one release window (expand-migrate-contract), so a build rollback never corrupts records; audit trail data is never rolled back — it is append-only through any incident.
6. **Trigger conditions:** an INV-1 violation, a privacy-wall breach, a data-loss incident, or a fabricated-briefing-claim incident in production triggers immediate capability rollback for the affected surface + incident review before re-enable. Adoption misses trigger gate-repeat, not rollback — slow love is fixable, broken trust is not.

---

## 6. Support model

| Tier | Who/what | Handles | Target response |
|---|---|---|---|
| 0 — In-product help | Contextual help on every screen; block messages that explain themselves and name the owner; the training library in-app; Ally explains any setting or block in plain language (explain-only — no settings changes, per [[Acceptance_Criteria]]) | "What does this mean / what do I do" | Immediate |
| 1 — Champion network | Trained pilot/wave champions in each team | How-to questions, workflow habits, first-look triage | Same day, informal |
| 2 — CRM support desk | Named support owner(s); intake via the escalation-desk pattern Loan Factory LOs already know (the existing `my_escalation_desk` ticketing convention) plus the champion channel | Bugs, data questions, import help, account/role changes | Business-hours response same day; blocker acknowledgment < 2 hours |
| 3 — Product/engineering on-call | Engineering rotation during S0–S1 and each S2 wave window | Incidents: send-path faults, data integrity, invariant alarms | Page immediately; incident runbook |
| Compliance escalation | Direct route to the compliance reviewer, bypassing queue | Anything smelling like a compliance event (leak, bad content live, consent violation) | Immediate, treated as an incident, logged in the audit record |

Support instrumentation: every ticket tagged by module + [[QA_Plan]] risk tag; weekly ticket review feeds the same triage as in-app feedback. During S0/S1 the product team **is** tier 2 on purpose — nothing teaches a roadmap like the support queue. The S2 staffing decision is made from measured pilot ticket volume (Gate B7), not hope.

**Onboarding support per wave:** each S2 wave gets a live kickoff (champion-delivered, product-supported), the 101 curriculum assigned, and a 30-day check with the wave's adoption numbers reviewed against Gate C1.

---

## 7. Launch communications and expectation-setting

- **Position honestly:** Phase 1 is the command center + people + leads + pipeline visibility + tasks and notes + the Ally recommendation cards and approval workflow, on desktop and mobile web. It does not send email, run automations, manage partners, or do marketing yet ([[Implementation_Roadmap]] says when) — and it is a CRM, full stop: it never takes applications, collects documents, prices, or discloses, and it never will. Overpromising Phase 2 at S1 kickoff is the fastest way to manufacture disappointment.
- **The Ally promise, stated everywhere, in one sentence:** *"Ally prepares, you approve — nothing reaches a borrower without your say-so."* This is the adoption message and the compliance message at once; it is also literally enforced (INV-1).
- **Name note:** all launch materials use the working name Loan Factory CRM with "final brand name pending" discipline until [[Decisions]] D-12 resolves; no printed/recorded asset ships with an unconfirmed name in a form that's expensive to redo.
- **No integration claims:** launch materials never state or imply LOS/POS/social-publishing integrations exist until they are live and verified ([[Acceptance_Criteria]] INV-9 applies to marketing decks too).

Related: [[Implementation_Roadmap]] · [[Acceptance_Criteria]] · [[QA_Plan]] · [[PRD]] · [[User_Personas]] · [[Decisions]] · [[Open_Issues]] · [[Mortgage_Compliance]]
