# AI Search Examples

## Purpose

These examples show safe ways an AI assistant can retrieve the correct email template. They are examples only and do not send messages.

## Retrieval Examples

| User Need | Safe Retrieval Approach | Expected Result |
|---|---|---|
| "Find the ITIN pre-approval intro." | Search exact topic and stage. | `EMT-066 ITIN Borrower Pre Approval Introduction` |
| "Borrower needs DSCR document checklist." | Search loan product plus document collection. | `EMT-077 DSCR Required Documents` |
| "Reverse mortgage counseling reminder." | Search product plus workflow need. | `EMT-095 Reverse Mortgage Counseling Reminder` |
| "Manufactured home foundation issue." | Search loan product plus property requirement. | `EMT-115 Manufactured Home Inspection and Foundation Requirements` |
| "Wire fraud warning before closing." | Search compliance-sensitive closing safety topic. | `EMT-126 Wire Fraud Reminder` |
| "One year post-closing message." | Search past-client timing. | `EMT-130 One Year Home Anniversary` |

## Safe AI Behavior

- Prefer exact `EMT-*` ID matches.
- If no ID is supplied, match by loan stage, audience, loan product, workflow trigger, and compliance sensitivity.
- Return the template ID, template name, source file, required placeholders, and compliance note.
- Do not rewrite compliance-sensitive templates without human review.
- Do not auto-send messages.
