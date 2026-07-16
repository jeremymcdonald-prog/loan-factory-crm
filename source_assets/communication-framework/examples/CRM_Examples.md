# CRM Examples

## Purpose

These examples show implementation-neutral CRM usage patterns. They do not define a specific CRM system, workflow, webhook, GoHighLevel setup, n8n workflow, or production automation.

## Safe Staging Examples

| Trigger Type | Retrieval Key | Suggested Handling |
|---|---|---|
| Application submitted | Loan stage: Disclosures | Stage the matching application received or specialty application submitted template for review. |
| Document checklist opened | Loan stage: Processing, communication type: Request | Stage the appropriate document checklist template and validate required placeholders. |
| Underwriting submission confirmed | Loan stage: Underwriting | Stage the matching submitted-to-underwriting update. |
| Conditional approval received | Loan stage: Conditions | Route to human review before sending if conditions are complex or specialty-product related. |
| Closing scheduled | Loan stage: Closing | Validate closing date, recipient, property, and compliance language before staging. |
| Past-client milestone reached | Loan stage: Past Client | Stage nurture message only if consent and suppression rules allow contact. |

## Required Checks

- Confirm the record stage matches the template stage.
- Confirm recipient audience.
- Confirm all required placeholders are populated.
- Confirm no borrower PII is inserted into examples or logs.
- Confirm human approval before borrower or partner communications are sent.
