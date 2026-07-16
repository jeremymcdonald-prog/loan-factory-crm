# Next_Actions

Purpose: the short, ordered list of what happens next. Jeremy's approvals are in — he accepted the blueprint on 2026-07-16 along with the CRM-only scope correction ([[Decisions]] D-22–D-24) — so everything below is execution work the implementation team can start immediately. Everything here traces to [[Implementation_Roadmap]], [[Tasks]], and [[Open_Issues]].

## Jeremy's approvals — given 2026-07-16

| # | Decision | What was approved |
|---|---|---|
| 1 | **Product direction** | The command-center thesis for the CRM: Today-first, Ally prepares / human approves, 10-item nav, 20-stage CRM opportunity visibility, replace the old HTML prototype ([[Vision]] + the executive summary of [[PRD]]) — with the CRM-only boundary locked as [[Decisions]] D-22 |
| 2 | **Screen behavior** | The Today command center, Pipeline, and Ally Approval Queue as specified — these three screens define the product feel ([[Screen_Specifications]] Screens 1, 6, 19) |
| 3 | **Roadmap & Phase 1 scope** | What ships first and, just as important, the explicit Phase-1 cut list ([[Implementation_Roadmap]] Phase 1) |

No conversation or document review gates the build.

## The single next execution step

**Build the Phase-1 walking skeleton (Epic 1 in [[Tasks]]).** The exact first implementation task: initialize the official repository — `git@github.com:jeremymcdonald-prog/loan-factory-crm.git` ([[Decisions]] D-24) — with the [[Technical_Architecture]] scaffold, then stand up authentication and organization/user tenancy. From there the skeleton grows in this order: People; Leads; CRM opportunity records with mortgage stages; Tasks; notes and activity history; the Today command center rendering a real prioritized work queue from seeded demonstration data; responsive desktop and mobile web layouts; basic Ally recommendation cards using controlled mock AI output; the approval workflow shell; and the audit logging foundation. Every other Phase-1 feature hangs off it, and it makes the command-center thesis demoable to Jeremy's team within the first build cycle.

Explicitly excluded from Phase 1: borrower portal, LOS functionality, loan applications, document uploads, underwriting, pricing, credit, disclosures, autonomous customer communication, and unverified external integrations.

## Implementation team — start immediately (no approvals needed)

1. Stand up the official repo (`git@github.com:jeremymcdonald-prog/loan-factory-crm.git`), environments, and CI per [[Technical_Architecture]] (includes `.env.example` with variable names only — no secret values anywhere).
2. Implement the [[Data_Model]] core entities with row-level security from the first migration.
3. Build the design-token foundation and AllyCard component from [[Design_System]] (one component, used everywhere, per [[Decisions]] D-19).
4. Import the 135-template library per [[Communication_Templates]] with stage keys and Never-Automate flags intact.
5. Set up the AI eval harness golden sets from [[QA_Plan]] before the first Ally feature — evals precede features.

## Parallel non-engineering work

1. Answer [[Open_Issues]] Q7 (where the current book of contacts lives) — gates the Phase-1 onboarding import.
2. Identify the Vietnamese translation reviewer (Q5).
3. Marketing coordinator + compliance reviewer begin the EMT-136+ template backlog (Q10): consultation-stage and contact-cadence templates the automation catalog needs.
4. Recruit the pilot cohort for internal alpha per [[Launch_Plan]] (Jeremy's own team first).

Related: [[Implementation_Roadmap]] · [[Tasks]] · [[Open_Issues]] · [[Launch_Plan]] · [[Obsidian_Index]]
