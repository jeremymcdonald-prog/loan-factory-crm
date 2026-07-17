# Mortgage Compliance

Purpose: the compliance operating manual for Loan Factory CRM — the rules that keep every message, campaign, score, and AI action inside mortgage-marketing and lending law, written as executable checklists the implementation team can build and an auditor can verify. It covers consent (CAN-SPAM email, TCPA/10DLC SMS), fair lending in AI scoring, prohibited claims and required disclosures, licensing display, human-review gates, state rules, record retention, and how AI's compliance-review capability enforces all of it at draft time. The source rules come from Loan Factory's own reviewed compliance corpus (the marketing-content-os `do_not_say`, `required_disclosures`, `state_rules`, and pre-publish checklist, plus the 135-template framework's compliance guide — see [[Asset_Inventory]]); this document turns them into product behavior. The CANON posture is non-negotiable and restated here as invariants. Security mechanics (audit trail, RLS, PII classes) live in [[Security]]; automation gate codes (G1–G9) live in [[Automation_Catalog]] §2.

## 1. Compliance invariants (release blockers, per [[PRD]] §5)

1. **No autonomous lending decisions.** Loan Factory CRM never approves, denies, prequalifies, or prices a loan — origination, underwriting, and pricing are not what a CRM does, and the guardrail holds even for language that merely *implies* such a decision. AI never states or implies a credit decision. Scoring (§4) prioritizes *work*, never *creditworthiness communicated to a borrower*.
2. **No guaranteed approval, no unsupported rate claims, no misleading savings** — the automatic-block list in §5.
3. **Licensing and Equal Housing displayed wherever required** (§6): Loan Factory NMLS #320841, the sending LO's NMLS, Equal Housing language.
4. **Human review for all borrower-facing and public content** — the tier model's T2 ceiling and the T0 never-automate list (§8).
5. **Consent-tracked email and SMS** with instant opt-out supremacy (§2, §3).
6. **Fair-lending-safe AI** — documented factors, no protected classes or proxies, scheduled disparate-impact review (§4, [[Decisions]] D-11).
7. **Full audit trail of AI actions** ([[Security]] §9).
8. **Stop conditions always override timing rules** — carried verbatim from the communication framework into every automation ([[Automation_Catalog]]).

## 2. Consent management — email (CAN-SPAM)

CAN-SPAM governs every commercial email Loan Factory CRM sends. The CRM treats *transactional/relationship* email (status updates on an active loan, docs-needed follow-up reminders) and *commercial* email (nurture, marketing, refi outreach) as distinct classes in the data model, because the rules differ — and when a message mixes both, it is treated as commercial.

| Requirement | Product behavior |
|---|---|
| Accurate header/sender | Sends go out under the authenticated LO/team sender identity only (SPF/DKIM/DMARC-aligned domains configured in Settings, Admin + Marketing Coordinator co-sign per [[Security]] §2). No spoofed or "reply-to nowhere" sends. |
| Non-deceptive subject lines | Subject lines pass the same lint as bodies (§9) — no fake urgency, no misleading claims (do-not-say list includes fear-urgency phrasing). |
| Physical postal address | The compliance footer block (§6) includes the licensed business address; injected automatically on every commercial send — not editable per message. |
| Working unsubscribe | Every commercial email carries a one-click unsubscribe link + List-Unsubscribe headers. Opt-outs process **immediately in-product** (well inside the 10-business-day legal window): the contact's email-consent flag flips, every queued item for that contact dies, every automation suppresses ([[Automation_Catalog]] rule 2). No fee, no login, no "tell us why" gate before the opt-out takes effect. |
| Unsubscribe scope | Default = all commercial email from the tenant. Preference-center granularity (e.g., keep transaction updates, stop marketing) is allowed but "unsubscribe all" must always be one click. Transactional messages on an active loan continue after marketing opt-out — and are kept strictly transactional. |
| Consent records | Per contact, per channel: consent status, source (form, import, verbal-logged, widget — including the Loan Factory widget/Facebook-lead surfaces in [[Integration_Map]]), timestamp, and evidence text. Imported lists require a declared consent basis before they can be mailed; "found a CSV" is not a consent basis and the import flow enforces the question. |
| Suppression is permanent and global | Opt-out survives re-import, list merges, and CSV round-trips. The suppression check runs at send time, not just at queue time. |

## 3. Consent management — SMS (TCPA / 10DLC)

SMS is higher-risk than email (TCPA statutory damages are per-message) and Loan Factory CRM's posture is conservative by design. Note: **no SMS provider is a confirmed integration yet** — SMS features ship only after a provider clears vendor review ([[Security]] §12) and 10DLC registration completes ([[Integration_Map]]).

| Requirement | Product behavior |
|---|---|
| Express written consent before any marketing SMS | SMS opt-in is its own consent record — never inferred from email consent, never pre-checked on forms. Opt-in capture stores the exact disclosure language shown, timestamp, source, and phone number. Lead forms that collect phone numbers display the consent language ("msg & data rates may apply, frequency, reply STOP to stop, HELP for help") at the point of capture. |
| 10DLC registration | Before the first message: brand registration and campaign registration through the chosen provider (mortgage/financial-services campaign use case, sample messages submitted, opt-in flow documented). Unregistered A2P traffic gets filtered/blocked by carriers — this is an operational prerequisite, not just legal hygiene. Owner: Admin + the SMS vendor, tracked in [[Integration_Map]]. |
| STOP/HELP handling | STOP (and stop-family keywords) processed automatically and instantly: consent flag off, confirmation message sent (the one permitted reply), all queued SMS killed. HELP returns identification + support contact. Keyword handling is provider-level + product-level (belt and suspenders). |
| Quiet hours | No SMS outside 8am–8pm in the **contact's** local time (configurable narrower, never wider) — gate G2. |
| Content restrictions | SMS is support-only, limited to the three safe archetypes from the framework's SMS Cross-Reference (portal-request nudge — pointing the borrower to the external secure document portal, not to any CRM surface — "update sent to your email," consent-gated optional check-in). **Blocked SMS topics, enforced by policy code not convention:** rate locks, payment changes, cash-to-close changes, closing delays, problem files, adverse outcomes, complaints, borrower-sensitive conditions. No NPI in SMS bodies, ever ([[Security]] §5). |
| DNC awareness | Phone-channel consent flags include call consent distinct from SMS; contacts flagged DNC are excluded from any calling-list export or click-to-call prompt. An active complaint suppresses all channels ([[Automation_Catalog]] rule 2). |
| Frequency cap | Per-contact SMS frequency capped in the automation engine (default ≤ 4/month marketing-class) to match the registered 10DLC campaign description. |

## 4. Fair lending and AI scoring

Fair-lending law (ECOA/Reg B, Fair Housing Act) reaches marketing and lead prioritization, not just underwriting. Loan Factory CRM's exposure points: lead scoring, next-best-action ranking, segment building, refi-opportunity detection, and any AI recommendation about *who* to contact first. Policy ([[Decisions]] D-11):

**Permitted factors — single source of truth:** the versioned **Factor Registry** in [[AI_Product_Architecture]] §5.1 is the one authoritative list of what may enter any score, ranking, segment, or model. This document deliberately does not restate that table — a second copy is how contradictions are born. In brief, the registry admits only behavioral and transactional factor classes (responsiveness, engagement events, stated intent, source & channel history, file progress, date pressure, relationship history); nothing scores unless it has a registry row, and any addition requires a compliance sign-off logged in [[Decisions]].

Two items were disputed between early drafts and are resolved here, once:

- **Loan program interest (ITIN, foreign-national, DSCR, bank-statement, VA, etc.) is checklist/template routing data only — never a score input.** Program interest determines *which document checklist and templates apply*; it never raises or lowers an intent, health, or priority score. Specialty-program interest is a strong national-origin proxy, and the registry's banned-proxy list ([[AI_Product_Architecture]] §5.1) names it explicitly.
- **Stated price range is banned as a score input.** It is not in the approved factor classes, and price/loan-size data correlates with geography and protected-class patterns. It remains usable as declared-need data for content and checklist relevance (which templates make sense to draft), never for weighting who gets attention first. If a future case for scoring it emerges, it enters only via the registry process with compliance sign-off logged in [[Decisions]].

**Prohibited features — never inputs to any score, segment, ranking, or model, including as proxies** (the authoritative banned list also lives in the registry; restated here for the compliance reader): race, color, religion, national origin, sex, marital status, familial status, age, disability, receipt of public assistance; and known proxy variables — geography at neighborhood/census-tract granularity, surname or name-derived ethnicity/gender inference, language preference as a scoring weight, loan program as a person-signal (above), age-revealing fields (birth year) as a weight. ZIP-level data may be used only for logistics (state licensing checks, timezone/quiet hours), never as a score input. This encodes the `do_not_say` fair-lending section ("Do not target or exclude people based on protected characteristics... different access, pricing, service, or approval standards") as model policy.

**Controls:**

1. **Explainability is mandatory UI.** Every score is shown with its top factors, never as a bare number ([[PRD]] FR-PE-8). If a factor can't be shown to a regulator and a borrower, it isn't a factor.
2. **Documented factor registry:** the exact feature list, weights/method, and version history live in [[AI_Product_Architecture]]; every model/prompt change to scoring is a versioned, logged event.
3. **Disparate-impact review — quarterly**, starting the quarter scoring ships (Phase 2). Method: compare score distributions and downstream treatment (time-to-first-touch, automation coverage, approval-queue attention) across available neutral cohorts (language preference, geography at state level, lead source) as *canaries* for disparate impact; investigate any material skew; document findings, remediation, and sign-off (Jeremy + compliance owner). The review packet is generated from the AI action logs and scoring telemetry ([[Security]] §9) — the system must make this report producible in under a day, or the cadence will silently die.
4. **Annual deeper review** with counsel once volume justifies it; immediately after any scoring-model change that alters factor families.
5. **Segment lint:** Marketing segment builders refuse prohibited fields as filter criteria at the UI and API level (gate G7). "Vietnamese-speaking contacts" is a permitted *delivery-language* segment for sending the Vietnamese template variant; it is never a permitted *exclusion or priority* criterion.

## 5. Prohibited claims — the automatic-block list

Sourced from the reviewed `do_not_say` asset, the framework's Compliance and Usage Guide block list, and the social-assistant compliance rules. These are **hard blockers** in the draft-time lint (§9) — a blocked draft cannot enter the approval queue until fixed:

| Never say or imply | Notes |
|---|---|
| Guaranteed approval, guaranteed eligibility, guaranteed closing, guaranteed rate, guaranteed savings | Any "guarantee" of an outcome. Includes soft forms: "you'll definitely qualify," "this will close by…" |
| "Everyone qualifies" / "no documentation needed" | Includes specialty-program overpromises (ITIN, DSCR, bank-statement) |
| Specific rates, APR, payments, fees, closing costs, or savings figures **without** the required disclosures and an authorized rate source | Reg Z trigger terms (rate, APR, payment amount, down payment, finance charge, term, points, fees, closing costs, savings) require accompanying disclosures; rate ≠ APR and equal-prominence rules apply. Daily-rate content requires an authorized source input — AI never invents a number. |
| "Locked" before a formal rate lock exists | Lock language only from a confirmed lock record (gate G4 pattern) |
| Fear urgency ("rates will explode tomorrow") | Brand rule + UDAAP hygiene |
| Government endorsement or affiliation implications | FHA/VA/USDA described accurately, never as sponsorship |
| Tax, legal, credit-repair, or investment advice | Advice-boundary rule; AI deflects and refers out |
| "Clear to close" presented as done | Required framing, verbatim from the framework: "Clear to close means the file can move into final closing steps. It does not mean funding or recording is complete." |
| Best Price Guarantee content without the official terms link — and **never in Washington** | Terms link `www.loanfactory.com/best-price-guarantee` required in caption AND creative; hard WA exclusion (§7) |
| Borrower-sensitive details in partner-facing messages | Partner privacy wall — milestone/timeline/owner only, never credit, income, assets, AUS findings, or condition details (gate G3) |
| Requests to email sensitive documents | Secure channel only; the lint flags any draft asking a borrower to email paystubs/statements ([[Security]] §5 P4 rules) |
| Unsupported superlatives: "lowest rate," "best rate," "no closing costs" | From the tested block-pattern set in the archived compliance engine — carried forward |

**Also prohibited as product behavior (not just language):** AI issuing anything that functions as a preapproval, denial, or counteroffer; any automation that sends adverse or pricing-change news (those are T0 — §8); marketing that displays borrower-paid compensation as a default (Jeremy's business is **lender-paid compensation only** — configuration default, flagged in discovery, needs Jeremy's confirmation as a locked setting).

## 6. Required disclosures & licensing display

From the reviewed `required_disclosures` asset and the 135-template signature standard:

| Element | Exact content | Where |
|---|---|---|
| Company license | `Loan Factory, Inc. NMLS #320841` | Every commercial email footer, every marketing asset, public pages, video/image assets where mortgage services are discussed |
| LO license | `{{LoanOfficerName}} NMLS {{NMLS}}` — resolved per sender (e.g., Jeremy McDonald NMLS 1195266) | Same surfaces, tied to the sending/authoring LO; a missing LO NMLS is a lint blocker |
| Equal Housing | "Equal Housing Opportunity" language and/or logo | Email footers, marketing assets; **required on image/flyer/video formats** (the archived compliance engine blocked these formats without EHL — behavior carried forward) |
| Standard footer | "This is not a commitment to lend. All loans subject to approval. Terms and conditions apply." | Every commercial/marketing message; injected by the template engine, not typed by hand |
| Physical address | Licensed business address | Commercial email (CAN-SPAM, §2) |
| Rate-content disclosures | APR shown with equal prominence to rate; assumptions disclosed; authorized source cited internally | Any content that survives the trigger-term gate |
| State appendices | Per §7 | Appended based on distribution states |

Product behavior: the footer/disclosure block is a **system-owned component** — templates reference it, users cannot delete it from commercial sends, and its text is versioned (a change requires Admin + compliance-owner co-sign, [[Security]] §2). The template engine resolves `{{NMLS}}` and `{{CompanyNMLS}}` from Team records ([[Data_Model]] — two of the 17 contract merge fields). In-product display: NMLS #320841 and Equal Housing appear on any public-facing surface the CRM renders (e.g., scheduling/booking pages) per CANON design direction.

## 7. State rules awareness

The reviewed `state_rules` asset covers four states today and self-describes as a working checklist that changes. Therefore: **state rules are maintainable data, not code.** Loan Factory CRM ships a `state_rules` table (state, required language, applies-to channels/formats, escalation notes, effective date, source, reviewer, review date) editable by the compliance owner, consumed by the lint.

Seed rows (verify before production — these are from the July 2026 asset):

| State | Rule |
|---|---|
| AZ | Include company license number `BK-2005457` (**verify this license number with Jeremy/licensing before hardcoding** — flagged in discovery) |
| NJ | "Licensed by the NJ Department of Banking and Insurance." |
| RI | MLO + "Licensed Loan Broker" language; business-card-format content escalates to human review |
| MA | "We arrange but do not make loans." when advertising rates/terms |
| WA | **Best Price Guarantee content excluded entirely** |

Behavior: every marketing asset and campaign declares its distribution states (default: the LO's licensed states from their Team profile); the lint appends required state language and blocks state-excluded content. Multi-state distribution uses the asset's multi-state checklist. Unknown state + rate-trigger content = escalate, don't guess. A quarterly review task prompts the compliance owner to reconfirm the table; each row shows its last-reviewed date so staleness is visible, not silent.

## 8. Human-review gates for high-stakes communication

The tier model in [[Automation_Catalog]] §1 is the enforcement mechanism; this is the compliance rationale and the fixed assignments:

| Gate | Rule |
|---|---|
| **T2 ceiling (v1)** | No borrower- or partner-facing communication sends without a named human approving that specific message — including everything the source framework rated "Fully Automated." Approval identity, timestamp, and diff-from-draft are logged ([[Security]] §9–10). |
| **T0 — never automated, never drafted** | Rate lock conversations, cash-to-close changes, payment changes, closing delays, problem files, adverse outcomes, complaint responses, anything resembling adverse action. AI's only role is detection: create a human task + notify LO and ops owner. Preserved verbatim from the framework's Never Automate class. |
| **High-risk content class** | The content-OS 3-tier risk model applies to marketing: High risk = "rates, payments, APR, fees, down payments, guarantee claims, investor products, government programs, qualification, approval, or outbound follow-up" → requires compliance-owner review, not just LO self-approval. Medium → LO + one reviewer. Standard → LO approval. Risk level is computed by the lint and displayed on the queue item. |
| **Review roles** | Drafter (AI or human) · Brand reviewer · Compliance reviewer · Marketing owner — the content-OS four-role model maps onto the RBAC matrix ([[Security]] §2): Marketing Coordinator = brand/marketing owner approvals; compliance-owner review is a named responsibility (Jeremy or designee) with its own approval records. Decisions: Approved / Changes Requested / Rejected / Escalated. |
| **Escalation triggers** | Anything on the do-not-say list surviving to review, state-rule uncertainty, Best Price Guarantee content, RI business-card formats, co-branded/RESPA questions (gate G9), fair-lending concern, complaint or possible-denial context, pricing disputes, closing-delay communications — escalation creates a ticket with an SLA (the content-OS escalation-ticket pattern, 2–3 business day SLA). |
| **Non-English sends** | Flagged "human translation review required" until a reviewed variant exists; conditional language is never softened in translation ([[PRD]] §5.3). |
| **Earned autonomy** | Any future relaxation of the T2 ceiling is Jeremy's explicit per-automation decision under the criteria in [[Automation_Catalog]] §1 — logged in [[Decisions]], reversible by kill switch, and never applicable to T0 classes or High-risk content. |

## 9. AI's compliance-review capability — enforcement at draft time

This is the mechanism that makes the rest of this document real. Every draft — borrower email, SMS, partner update, marketing asset, social post — passes a **two-layer check between generation and the approval queue**, and again at approval time if edited ([[Security]] §10). Architecture detail in [[AI_Product_Architecture]]; behavior contract here:

**Layer 1 — deterministic lint (code, not AI; runs in milliseconds; cannot be talked out of anything):**

- Required elements present: NMLS #320841, LO NMLS, Equal Housing where format requires, standard footer, physical address (email), state appendices per declared distribution states (§7).
- Trigger-term scan (rate/APR/payment/fees/savings/points/term/down payment) → if found without disclosure block and authorized source, **block**.
- Do-not-say pattern scan (§5 list, including the tested patterns from the archived compliance engine: "lowest rate," "best rate," "guaranteed," "no closing costs") → **block**.
- Channel policy: SMS archetype + blocked-topics check (§3); partner privacy wall scan on agent-facing drafts (credit/income/asset/AUS/condition terms) → **block**.
- Consent + merge-field gates: valid channel consent on record (G1/G2), all required merge fields resolved (G6 — a missing field blocks with a named fix, never sends a blank).
- Best Price Guarantee: terms-link presence + WA exclusion.
- Output: pass / blockers / warnings, attached to the queue item and the AI action log. **Blockers stop the queue; warnings surface to the approver.** Known limitation, carried from discovery honestly: regex-class lint over-flags and can be evaded — which is exactly why Layer 2 exists and why the human gate is the backstop.

**Layer 2 — AI compliance reviewer (the content-OS `compliance_reviewer` prompt, productized):**

Runs on every Medium/High-risk draft and any Layer-1 warning. Returns a fixed structured object — the same contract as Loan Factory's existing Compliance GPT, so reviewers already know the shape:

| Field | Content |
|---|---|
| Risk level | Standard / Medium / High (per the §8 definition) |
| Blockers | Violations that must be fixed |
| Warnings | Judgment calls for the human reviewer |
| Missing disclosures | Named, with the exact required text |
| Safer rewrite | A compliant alternative draft, offered — never silently substituted |
| Reviewer questions | What the AI couldn't verify (facts, sources, state distribution) |
| Status recommendation | Approved / Needs Review / Changes Requested / Rejected / Escalated |

**Properties the implementation team must guarantee:** the reviewer's verdict is advisory *upward* only — it can raise the required review level (Standard→High) and add blockers, but can never clear a Layer-1 blocker or lower the review level. Both layers' outputs are stored on the AI action log and re-run on human edits. The pre-publish checklist (Identity & Brand / Compliance / Privacy & Consent / Channel & Use) renders in the approval UI so the human check is guided, not vibes. The whole pipeline runs on Loan Factory's own reviewed rule corpus, versioned as data — updating a rule updates enforcement without a code deploy, with the change logged.

## 10. Record retention

Retention is configured, documented, and enforced by scheduled jobs — not left to "we never delete anything" (which collides with §14 deletion duties in [[Security]]). Baselines below are conservative defaults pending counsel confirmation (open item, §12):

| Record class | Minimum retention | Basis |
|---|---|---|
| Advertising & marketing content as published (incl. the approval record, lint results, distribution states, and the version of the disclosure block used) | 2 years from last use | Reg Z advertising record expectations; state rules may extend |
| Borrower communications tied to a loan file (email/SMS bodies, timestamps, template IDs) | 5 years from loan action | Aligns to the longest common state SAFE-Act-class and GLBA-adjacent expectations; some states demand more — table-driven per state like §7 |
| Consent and opt-out records | Life of the consent + 5 years after revocation | TCPA/CAN-SPAM defense evidence — the opt-out record must outlive the opt-out |
| Fair-lending review packets (§4) | 5 years | ECOA posture (Reg B's 25-month floor is for applications; reviews kept longer deliberately) |
| Audit trail & AI action logs | 5 years minimum, append-only | [[Security]] §8–9 — the trail must outlive what it explains |
| Escalation tickets & compliance decisions | 5 years | Demonstrates the review system functioning |
| Deleted-on-request records | Suppress-and-lock until retention expiry, then physical deletion on schedule | [[Security]] §14 mechanism |

Every retention clock is a field, every expiry is a job, every deletion is a logged event. Legal hold: Admin + compliance owner can freeze deletion jobs tenant-wide or per contact when litigation/examination requires it.

## 11. Compliance audit-ready checklists

### 11a. Per-release checklist (signed by compliance owner each phase release)

- [ ] Lint rule corpus current: do-not-say list, disclosure strings, state table, trigger terms match the latest reviewed versions; changes since last release logged
- [ ] Layer-1 lint blockers verified by test fixtures (one failing fixture per §5 row — each must block)
- [ ] Layer-2 reviewer returns the full structured object on Medium/High drafts; "advisory upward only" property verified by test
- [ ] Footer/disclosure block system-owned and non-deletable on commercial sends; NMLS #320841 + LO NMLS + EHL render correctly per format
- [ ] Unsubscribe: one-click works, flag flips instantly, queued items die, suppression survives re-import (test fixture)
- [ ] SMS (if live): STOP/HELP verified end-to-end, quiet hours enforced, blocked-topics fixtures block, 10DLC registration current
- [ ] T0 classes cannot be drafted or queued by any path (negative tests: rate lock, cash-to-close, payment change, closing delay, problem file)
- [ ] Unapproved-send count = 0 verified architecturally ([[Security]] §10 invariant test)
- [ ] Scoring factor registry matches deployed model; no prohibited feature reachable by the scoring pipeline (schema-level test)
- [ ] Segment builder refuses prohibited filter criteria (UI + API tests)
- [ ] State table rows all carry a last-reviewed date within the last quarter
- [ ] Retention jobs running; sample expiry executed correctly in staging
- [ ] Partner-facing draft fixtures containing credit/income/asset/AUS/condition terms are blocked (G3 test)

### 11b. Quarterly operating checklist (compliance owner)

- [ ] Disparate-impact review completed, documented, signed (§4) — findings and remediation logged
- [ ] State rules table reviewed and re-dated; licensing changes (new states, renewals, AZ number verification status) reflected
- [ ] Sample audit: pull 25 random sent messages — verify approval record, lint result, disclosures, consent status on each
- [ ] Opt-out latency spot-check (email and SMS): measured, inside policy
- [ ] Escalation tickets reviewed: all closed within SLA or explained
- [ ] AI metrics reviewed: approval rate, edit distance, blocker frequency by rule (a rule that never fires or always fires needs attention)
- [ ] Do-not-say / disclosure corpus reviewed against any new Loan Factory guidance; version bumped if changed
- [ ] Access review completed with [[Security]] §3 (roles still match jobs)

### 11c. Per-new-feature checklist (product/engineering, before build)

- [ ] Does it create a new borrower-facing or public output path? → must route through lint + approval queue; no new send paths outside §10 of [[Security]]
- [ ] Does it add a scoring/ranking/segmentation input? → factor registry + fair-lending sign-off first ([[Decisions]] entry)
- [ ] Does it touch a new channel? → consent model + channel policy defined before build
- [ ] Does it store new personal data? → classify per [[Security]] §5, add to [[Data_Model]] with class
- [ ] Does it involve a partner/co-marketing surface? → RESPA review (gate G9): no paying for referrals, co-marketing costs split at fair value, checklist applied
- [ ] Does it claim an integration? → only integrations validated in [[Integration_Map]] may be presented as connected — never a static "Connected" badge (the prototype's fake Encompass tile is the named anti-pattern, [[Current_State_Audit]])

## 12. Open compliance items (need Jeremy / counsel — tracked in [[Open_Issues]])

| # | Item | Why it matters |
|---|---|---|
| C-1 | Verify AZ company license `BK-2005457` before it enters the state table | Flagged unverified in discovery |
| C-2 | Counsel confirmation of the §10 retention baselines and the per-state extensions | Defaults are conservative but unratified |
| C-3 | Confirm "lender-paid compensation only" as a locked product default | Discovery flags it; affects compensation-related marketing claims and template language |
| C-4 | SMS provider selection + 10DLC registration ownership | Gates all SMS features (§3) |
| C-5 | State licensing footprint (which states are LOs licensed in) as Team-profile data | Drives §7 distribution defaults |
| C-6 | Name the compliance owner (Jeremy or designee) for the §8 review role and §11 checklists | The system assumes a named human owner |
| C-7 | Counsel review of the disparate-impact methodology (§4) before Phase 2 scoring ships | Method should be blessed before it generates records |

Related: [[Security]] · [[Automation_Catalog]] · [[AI_Product_Architecture]] · [[Data_Model]] · [[PRD]] · [[Decisions]] · [[Integration_Map]] · [[Asset_Inventory]] · [[QA_Plan]] · [[Open_Issues]]
