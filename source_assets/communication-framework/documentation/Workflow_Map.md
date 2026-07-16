# Workflow Map

## Purpose

This document gives an implementation-neutral view of how the email templates map to the mortgage lifecycle. It does not create CRM workflows or automation rules.

## Lifecycle Stages

| Stage | Template Coverage |
|---|---|
| Lead | First contact, Realtor referral, online inquiry, past-client referral. |
| Application | Pre-approval, specialty product introductions, credit prescreen, borrower next steps. |
| Disclosures | Application receipt, disclosures, specialty disclosures, DPA, USDA, counseling reminders. |
| Processing | Document collection, property review, appraisal, title, insurance, condo, HOA, specialty checklists. |
| Underwriting | Submission updates and underwriting timing messages. |
| Conditions | Conditional approvals, condition requests, credit rescore requests, specialty conditions. |
| Closing | Closing Disclosure, clear to close, closing scheduled, seller credit, VOE, wire fraud, congratulations. |
| Funding | Funding review, funded and recorded confirmation. |
| Past Client | Post-closing check-ins, annual reviews, refinance review, DSCR portfolio review, welcome home. |

## Safe Use

- Match templates by loan stage first.
- Confirm audience before sending.
- Confirm borrower-facing messages have human review when compliance sensitive.
- Do not treat workflow status as approval unless the source system explicitly confirms the milestone.
- Preserve template IDs and YAML metadata for auditability.
