# Open Issues — the questions that gate scope

Purpose: the single living register of unresolved questions across the Loan Factory CRM blueprint. The rule from [[PRD]] §Purpose applies to every author and builder: if a build question is not answered in the [[PRD]] or a linked document, **log it here before improvising**. Each issue gets a stable Q-number (never reused), a statement of what it blocks, and an owner. When an issue is resolved, the resolution is recorded in [[Decisions]] and the row here is marked Resolved with a pointer to the decision — rows are never deleted. Q1–Q10 are the PRD-level scope gates ([[PRD]] §7); Q11–Q13 carry the open technical items from [[Technical_Architecture]] §10 that are not already covered above.

## Issue register

| # | Question | Blocks | Owner | Status |
|---|---|---|---|---|
| Q1 | **TERA+ relationship**: is this CRM the CRM layer of TERA+, a complement to TERA as LOS/POS system of record, or a competing bet? TERA+'s own docs treat CRM as in-scope, and its 14 status labels conflict with our 20 stages (crosswalk hook reserved in [[Data_Model]] `external_refs`; see also [[Decisions]] D-17). | Integration architecture, naming, internal positioning | Jeremy | Resolved → D-17 (2026-07-16). The CRM-only boundary (D-22) makes positioning moot; TERA+ materials serve purely as persona, usability-scorecard, and QA source content. |
| Q2 | Does the Loan Factory platform expose (or can it be given) an API/webhook for widget leads, Facebook-ad leads, and QM Pricer alerts? Everything proven so far is UI-level only. | [[PRD]] FR-PE-3 timeline; P2 lead-ingestion scope ([[Integration_Map]]) | Jeremy + it.dept@loanfactory.com | Open |
| Q3 | LOS/POS landscape: which LOS do Loan Factory LOs actually close in, and what surface exists for a **future read-only data connection** (stage/milestone facts syncing into the CRM for visibility and communication triggers — never CRM ownership of loan-of-record data, per [[Decisions]] D-22)? (The prototype's "Encompass Connected" was fake; nothing is proven.) | P3 data-connection planning ([[Integration_Map]]) | Jeremy | Open |
| Q4 | SMS provider and 10DLC/A2P registration path; who owns carrier compliance? | [[PRD]] FR-CO-7 (P2 SMS) | Technical lead + compliance | Open |
| Q5 | Vietnamese translation review: who is the qualified human reviewer for VI template variants (and for restoring diacritics in the persona/localization source files)? | [[PRD]] FR-CO-6 P2 scope; multilingual credibility; [[Communication_Templates]] §5 | Jeremy's team | Open |
| Q6 | Final product name (see [[Decisions]] D-12) and licensing display requirements for any name change. | Branding surfaces only — nothing structural | Jeremy | Resolved → D-12 (2026-07-16). Working name locked as **Loan Factory CRM**; the final market name and licensing display remain a branding-only follow-up. |
| Q7 | Existing book-of-record migration: where do current contacts/past clients live today, and what does the import (volume, quality, consent status) look like? | P1 onboarding plan; [[Tasks]] T-1101 | Jeremy | Open |
| Q8 | Market-rate data source for the P3 rate-aware refi radar (vendor, cost, licensing of displayed rates) — a **future read-only data connection** feeding AI's outreach triggers and talking points; the CRM never becomes a pricing engine ([[Decisions]] D-22). | [[PRD]] FR-IN-3 P3 scope | Technical lead | Open |
| Q9 | Pricing/packaging and tenant model (single Loan Factory tenant vs. multi-brokerage SaaS ambitions) — shapes P4 enterprise scope. | P4 only | Jeremy | Open |
| Q10 | Authoring owner for the missing lifecycle content: stage 3/4/7/8 templates, contact-attempt cadence (the EMT-136+ backlog in [[Communication_Templates]] §6), and real triggers for EMT-066–135. | [[PRD]] FR-CO-9, FR-AU-8 | Marketing coordinator + compliance reviewer | Open |
| Q11 | Email fallback and SMS provider selection: procurement + deliverability review for the transactional-email contingency ([[Integration_Map]] §2.1 fallback checkpoint) and the P2 SMS provider (pairs with Q4's 10DLC/consent-flow legal review). Nothing is confirmed. | P1 email contingency readiness; FR-CO-7 | Technical lead | Open |
| Q12 | Hosting vendor confirmation: Vercel is assumed in [[Technical_Architecture]]; any serverless host with preview deploys works. | P1 infrastructure setup | Technical lead | Open |
| Q13 | n8n hosting hardening for production: dedicated instance, credential audit, version pinning ([[Technical_Architecture]] §10). | P2 automation backbone go-live | Technical lead | Open |

## Documentation cleanup backlog (minor findings from the critique pass)

Non-blocking consistency chores surfaced by the adversarial review. Fix opportunistically before build kickoff; none gates scope.

| # | Item | Where |
|---|---|---|
| C1 | Person record header primary action: IA §3.4 says "Log a touch" while the screen spec differs — align to one verb | [[Information_Architecture]] §3.4 vs [[Screen_Specifications]] Part 1 |
| C2 | National DNC registry: compliance covers internal DNC flags only; add a line on National Do-Not-Call handling for any future calling-list feature | [[Mortgage_Compliance]] §3 |
| C3 | Screen 14 approval-mode selector wording implies auto-queued sends for "fully-automatable templates"; tighten to match the T2 ceiling for borrower-facing sends | [[Screen_Specifications]] Part 2, Screen 14 |
| C4 | Consultation automation rows cite template IDs that don't exist or are misassigned (e.g. B-01 → "EMT-049 pattern"); reconcile against [[Communication_Templates]] and the EMT-136+ backlog | [[Automation_Catalog]] §B |
| C5 | Cross-reference drift in acceptance criteria (e.g. INV-8 cites QA_Plan §6.4 for the injection suite; section numbering shifted) — sweep all §-references after any doc restructure | [[Acceptance_Criteria]], [[QA_Plan]] |
| C6 | Decisions minted inside other documents are now logged as D-18–D-21; keep the rule that no document may mint a decision without a D-number | [[Decisions]] |

## Working rules

1. **Numbering is append-only.** New issues take the next Q-number; numbers are never reused or reassigned, so citations like "[[Tasks]] T-1101 is gated on Q7" stay stable forever.
2. **An issue must name what it blocks.** If it blocks nothing, it is a note for [[Build_Log]], not an open issue.
3. **Resolution path:** owner answers → decision logged in [[Decisions]] with a D-number → this row flips to `Resolved → D-xx`. The question text is never edited after resolution.
4. **Phase gates:** anything marked as blocking a P1 item is reviewed at every Phase-1 checkpoint; P2+ blockers are reviewed at phase kickoff ([[Implementation_Roadmap]]).

Related: [[PRD]] · [[Decisions]] · [[Implementation_Roadmap]] · [[Tasks]] · [[Technical_Architecture]] · [[Integration_Map]] · [[Communication_Templates]] · [[Obsidian_Index]]
