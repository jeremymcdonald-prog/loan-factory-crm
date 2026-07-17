# Communication Templates — the 135-template content layer and its contracts

Purpose: this document is the product-side registry for Loan Factory CRM's communication content layer — the 135 verified English master email templates (EMT-001–135) from the mortgage-communication-framework source pack, plus everything a builder must treat as a contract when importing them: the complete 17-token merge-field vocabulary ([[PRD]] FR-CO-2, [[Tasks]] T-702), the automation-policy tiers and their authoritative source (FR-CO-4), the language-variant reality and review status (FR-CO-6), and the commissioned EMT-136+ backlog that fills the verified lifecycle gaps (FR-CO-9, [[Automation_Catalog]] rows A-03, B-01–B-04, C-03). Template *content* lives in the source pack (`_product_discovery/communication_framework/`); this doc governs how that content becomes product.

## 1. Library at a glance

- **135 templates, EMT-001–135, every one with full YAML front matter** (verified by grep of `^id: EMT-` across the source's template files 01–14). EMT-001–065 are the original lifecycle set; EMT-066–135 are 70 specialty-product templates (ITIN, Foreign National, DSCR, construction/OTC, renovation, reverse, jumbo, bank statement, VA IRRRL, FHA Streamline, DPA, USDA, condo/HOA, wire fraud, credit rescore, final VOE, post-close nurture, and more).
- Each template carries: YAML metadata (26 fields incl. `id`, `loan_stage`, `audience`, `loan_programs`, `workflow_trigger`, `automation_timing`, `automation_ready`, `compliance_reviewed`, `required_merge_fields`, `related_templates`, `tags`), a structured header (use case, sender, subject, placeholders, compliance notes, follow-up timing), and the email body ending in the Loan Factory signature block (Equal Housing Opportunity · Loan Factory, Inc. NMLS 320841 · sender's personal NMLS).
- **ID policy (adopted as system policy):** `EMT-###` IDs are permanent — never reused, never renamed. A new audience, stage, or compliance intent means a new ID. Multilingual variants reference the same English master ID plus a locale code.
- **Import posture ([[PRD]] FR-CO-2):** near-duplicate specialty variants (e.g. the eight "submitted to underwriting" clones EMT-098–105 and six conditional-approval variants EMT-106–111) collapse into parameterized templates with a `loan_program` variable; the source IDs remain addressable as aliases so the related-template graph and automation map stay valid.

## 2. Where the templates live in the lifecycle

| Source file | Templates | IDs |
|---|---|---|
| 01 Borrower first contact | 3 | 001–003 |
| 02 Realtor referral | 2 | 004–005 |
| 03 Pre-approval (+ specialty intros) | 13 | 006–009, 066–074 |
| 04 Document collection | 20 | 010–016, 075–087 |
| 05 Application & disclosures | 15 | 017–021, 088–097 |
| 06 Submitted to underwriting | 10 | 022–023, 098–105 |
| 07 Conditional approval | 11 | 024–027, 106–112 |
| 08 Appraisal / title / insurance | 17 | 028–037, 113–119 |
| 09 Clear to close & closing | 12 | 038–042, 120–126 |
| 10 Post-closing & past client | 14 | 043–047, 127–135 |
| 11 Loan coordinator sender voice | 4 | 048–051 |
| 12 Loan processor sender voice | 5 | 052–056 |
| 13 Realtor partner nurture | 3 | 057–059 |
| 14 Problem file & delay (high-sensitivity) | 6 | 060–065 |

## 3. The 17-token merge-field vocabulary (hard contract)

This is the complete placeholder vocabulary used across all 135 templates, verified by grep of `{{Token}}` occurrences in the source pack. It is a **hard data-model contract**: [[Data_Model]]'s `person`, `opportunity`, `user`, and `tenant` records must resolve every token from live CRM data. Loan-fact tokens (program, property, key dates, lender) resolve from the opportunity record's read-only visibility fields — entered by the team in v1, optionally synced read-only from the LOS/POS later ([[Integration_Map]]); the CRM never needs to own loan-of-record data to populate a message. A draft with an unresolvable token is blocked from the send path with a named gap ([[Tasks]] T-702). No 18th token may be introduced without updating this table and [[Data_Model]] together.

| # | Token | Resolves from | Notes |
|---|---|---|---|
| 1 | `{{BorrowerName}}` | `person` (recipient) | Highest-frequency token (~476 uses) |
| 2 | `{{PhoneNumber}}` | `user` (sender) | Sender's direct phone, signature block |
| 3 | `{{LoanOfficerName}}` | `user` via opportunity participant (LO) | |
| 4 | `{{ApplicationLink}}` | `user`/`tenant` settings | The LO's Loan Factory application URL — external application platform, linked in messages, never a CRM surface |
| 5 | `{{LoanCoordinatorName}}` | `user` via opportunity participant (coordinator) | Sender voice for EMT-048–051 |
| 6 | `{{ProcessorName}}` | `user` via opportunity participant (processor) | Sender voice for EMT-052–056 |
| 7 | `{{LoanProgram}}` | `opportunity` loan-fact field | Also the parameter that collapses specialty clones |
| 8 | `{{NMLS}}` | `user.nmls` (sender) | Personal NMLS (e.g. Jeremy: 1195266) |
| 9 | `{{PropertyAddress}}` | `opportunity` loan-fact field | |
| 10 | `{{RealtorName}}` | linked partner/`person` (realtor) | Partner-facing and referral templates |
| 11 | `{{ClosingDate}}` | `opportunity` key dates (read-only visibility metadata) | |
| 12 | `{{Website}}` | `user`/`tenant` settings | LO website URL |
| 13 | `{{EmailAddress}}` | `user.email` (sender) | |
| 14 | `{{LenderName}}` | `opportunity` loan-fact field | |
| 15 | `{{AppraisalDueDate}}` | `opportunity` milestone dates (read-only visibility metadata) | |
| 16 | `{{AppraisalDate}}` | `opportunity` milestone dates (read-only visibility metadata) | |
| 17 | `{{CompanyNMLS}}` | `tenant` | Constant for Loan Factory: **#320841** |

Send-time behavior: resolved values are snapshotted into the message's `merge_data` (what the borrower actually saw — auditability per [[Data_Model]]); templates declare their tokens in `merge_fields` so pre-run validation fails fast on unpopulatable fields.

## 4. Automation-policy tiers (EMT-001–135)

The source pack's CRM Automation Map assigns every EMT-001–065 template a policy, with per-template triggers, delays, prerequisites, stop conditions, and escalation. Authoritative counts from the library's own statistics file, adopted by [[PRD]] FR-CO-4:

| Policy | Count | Loan Factory CRM behavior |
|---|---|---|
| Fully Automated | 44 | Eligible for automated queueing — but in v1 still **AI-prepared, human-approved** ([[Decisions]] D-05); true auto-send is a P3 decision gated on G6 trust metrics |
| Semi Automated | 71 | AI drafts on trigger; always through the approval queue |
| Manual Only + Never Automate | 20 | **Hard-blocked** from any automated queue; human-initiated, human-sent (rate lock, cash-to-close, payment change, delays, problem files) |

**Authority rule (adopted verbatim as system policy):** the CRM Automation Map's policy column is authoritative; the `tags` field in the AI-metadata file is **ignored for policy**. Known contradiction: EMT-060–065 are Manual Only / Never Automate in every authoritative table but tagged `semi-automated` in metadata — a compliance hazard if tags ever fed an automation filter.

**Known trigger debt:** the `workflow_trigger` metadata on EMT-066–135 is auto-generated filler. Real triggers must be authored before those templates enter the automation engine ([[PRD]] FR-AU-8, owner per [[Open_Issues]] Q10).

## 5. Language variants and review status

- English masters: all 135, reviewed source content.
- VI / ZH / ES-CO / RU: the source ships **5 lifecycle-stage body modules per language, not 135 per-template translations** — the source's own language files warn against treating it as a send-ready non-English set. The search index's per-template language column must not be shipped at face value.
- Product behavior ([[PRD]] FR-CO-6): per-contact language preference drives variant selection; until a reviewed per-template variant exists, non-English drafts assemble from the stage modules and are flagged **"human translation review required."** Conditional language is never softened in translation.
- Variant rollout: Vietnamese first ([[Decisions]] D-08), starting with the top-20 highest-use templates; reviewer assignment is [[Open_Issues]] Q5. Variant status per template is tracked as data (None / Module-assembled / Drafted / Human-reviewed) — a template's variant is selectable for send only at Human-reviewed.

## 6. Commissioned templates — the EMT-136+ backlog

Verified gaps in the 135-set ([[PRD]] FR-CO-9): no content exists for stages 3–4 (consultation), 7 (searching), a stage-8 Under Contract kickoff, or a borrower contact-attempt cadence. New IDs follow the naming convention (new intent ⇒ new permanent ID). Proposed allocation — final IDs assigned at authoring time by the owner named in [[Open_Issues]] Q10, with compliance review before first use:

| Proposed ID | Template | Stage | Commissioned by |
|---|---|---|---|
| EMT-136–138 | Borrower contact-attempt ladder (day-2 new-angle, day-7 check-in, day-10 "should I close your file?" breakup) | 1–2 | [[Automation_Catalog]] A-03 |
| EMT-139 | Consultation confirmation (date/time, what to bring, reschedule link — EMT-049 pattern) | 3 | [[Automation_Catalog]] B-01 |
| EMT-140 | Consultation prep note ("what we'll cover + what to have ready") | 3 | [[Mortgage_Workflow_Map]] stage 3 |
| EMT-141 | Consultation reminder (T-24h email; the T-2h touch is email + an internal LO prompt per [[Automation_Catalog]] B-02 — no approved SMS archetype covers it) | 3 | [[Automation_Catalog]] B-02 |
| EMT-142 | No-show recovery (warm, no-blame reschedule) | 3 | [[Automation_Catalog]] B-03 |
| EMT-143 | Post-consultation recap (discussed / agreed next steps / document list / application link — from LO notes, never invented) | 4 | [[Automation_Catalog]] B-04 |
| EMT-144 | Searching-for-home 14-day check-in (market-neutral; no rate/payment figures) | 7 | [[Automation_Catalog]] C-03 |
| EMT-145 | Under Contract kickoff (congratulations + what happens next + timeline) | 8 | [[PRD]] FR-CO-9 |

All commissioned templates inherit the full contract of this document: 17-token vocabulary only, YAML metadata, policy assignment via the automation map (not tags), Loan Factory footer/NMLS/Equal Housing display, and pre-send lint ([[PRD]] FR-CO-5). Consultation reminders are transactional, not marketing — but still carry the required footer, and never rate or payment figures (trigger-term rule, [[Mortgage_Compliance]]).

Related: [[PRD]] · [[Data_Model]] · [[Automation_Catalog]] · [[Mortgage_Workflow_Map]] · [[Mortgage_Compliance]] · [[Asset_Inventory]] · [[Open_Issues]] · [[Decisions]] · [[Obsidian_Index]]
