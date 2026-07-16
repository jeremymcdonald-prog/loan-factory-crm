# Loan Processor Templates

## Table Of Contents

- [EMT-052 Processor Introduction](#emt-052-processor-introduction)
- [EMT-053 Underwriting Clarification Needed](#emt-053-underwriting-clarification-needed)
- [EMT-054 Condition Received Pending Review](#emt-054-condition-received-pending-review)
- [EMT-055 Funding Review In Progress](#emt-055-funding-review-in-progress)
- [EMT-056 Third Party Status Follow Up](#emt-056-third-party-status-follow-up)

---
id: EMT-052
title: "Processor Introduction"
category: "Loan Processor Templates"
loan_stage: "Processing"
audience:
  - "Borrower"
loan_programs:
  - "Conventional"
  - "FHA"
  - "VA"
  - "USDA"
  - "Jumbo"
  - "Non-QM"
  - "Investor"
language: "English"
priority: "Low"
purpose: "Introduce processor after file moves to processing."
communication_type: "Introduction"
workflow_step: "Processing - Processor Introduction"
workflow_trigger: "Processor assigned"
automation_trigger: "Processor assigned"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "I will help process your loan file"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanOfficerName}}"
  - "{{PhoneNumber}}"
  - "{{ProcessorName}}"
optional_merge_fields:
  - "{{ApplicationLink}}"
required_attachments: []
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "borrower"
  - "emt-052"
  - "loan processor templates"
  - "processing"
  - "processor introduction"
related_templates:
  - "EMT-051"
  - "EMT-053"
tags:
  - "borrower"
  - "emt-052"
  - "fully-automated"
  - "introduction"
  - "loan-processor-templates"
  - "low"
  - "processing"
  - "processor"
  - "processor-introduction"
---

## EMT-052 Processor Introduction

- Template name: Processor introduction
- Use case: Introduce processor after file moves to processing.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: I will help process your loan file
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{LoanOfficerName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{ApplicationLink}}`
- Compliance notes: Clarify processing role and review status.
- Follow up timing: When processor takes ownership.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

I am `{{ProcessorName}}`, and I will help process your loan file from here.

`{{LoanOfficerName}}` remains involved, and our team will work together to keep the file moving. If we need anything from you, we will send a clear request.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

---
id: EMT-053
title: "Underwriting Clarification Needed"
category: "Loan Processor Templates"
loan_stage: "Conditions"
audience:
  - "Borrower"
loan_programs:
  - "Conventional"
  - "FHA"
  - "VA"
  - "USDA"
  - "Jumbo"
  - "Non-QM"
  - "Investor"
language: "English"
priority: "Medium"
purpose: "Ask borrower for a clarification requested by underwriting."
communication_type: "Request"
workflow_step: "Conditions - Underwriting Clarification Needed"
workflow_trigger: "Underwriting clarification requested"
automation_trigger: "Underwriting clarification requested"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Clarification needed for underwriting"
required_merge_fields:
  - "{{ApplicationLink}}"
  - "{{BorrowerName}}"
  - "{{PhoneNumber}}"
  - "{{ProcessorName}}"
optional_merge_fields: []
required_attachments: []
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "borrower"
  - "conditions"
  - "emt-053"
  - "loan processor templates"
  - "underwriting"
  - "underwriting clarification needed"
related_templates:
  - "EMT-052"
  - "EMT-054"
tags:
  - "borrower"
  - "conditions"
  - "emt-053"
  - "fully-automated"
  - "loan-processor-templates"
  - "medium"
  - "processor"
  - "request"
  - "underwriting"
---

## EMT-053 Underwriting Clarification Needed

- Template name: Underwriting clarification needed
- Use case: Ask borrower for a clarification requested by underwriting.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Clarification needed for underwriting
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: none
- Compliance notes: Do not coach a specific answer. Ask for truthful clarification.
- Follow up timing: Same day request is received.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Underwriting requested clarification on an item in the file.

Please review the request in the portal and provide a truthful explanation or document:

`{{ApplicationLink}}`

Call us at `{{PhoneNumber}}` if you need help understanding the request.

Thank you,  
`{{ProcessorName}}`

---
id: EMT-054
title: "Condition Received Pending Review"
category: "Loan Processor Templates"
loan_stage: "Conditions"
audience:
  - "Borrower"
loan_programs:
  - "Conventional"
  - "FHA"
  - "VA"
  - "USDA"
  - "Jumbo"
  - "Non-QM"
  - "Investor"
language: "English"
priority: "Medium"
purpose: "Confirm condition item was received but not cleared yet."
communication_type: "Status Update"
workflow_step: "Conditions - Condition Received Pending Review"
workflow_trigger: "Condition item uploaded"
automation_trigger: "Condition item uploaded"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Item received and pending review"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{PhoneNumber}}"
  - "{{ProcessorName}}"
optional_merge_fields:
  - "{{ApplicationLink}}"
required_attachments: []
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "borrower"
  - "condition received pending review"
  - "conditions"
  - "emt-054"
  - "loan processor templates"
related_templates:
  - "EMT-053"
  - "EMT-055"
tags:
  - "borrower"
  - "condition-received-pending-review"
  - "conditions"
  - "emt-054"
  - "fully-automated"
  - "loan-processor-templates"
  - "medium"
  - "processor"
  - "status-update"
---

## EMT-054 Condition Received Pending Review

- Template name: Condition received pending review
- Use case: Confirm condition item was received but not cleared yet.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Item received and pending review
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{ApplicationLink}}`
- Compliance notes: Keep received and cleared separate.
- Follow up timing: Same day item is received.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We received the item you uploaded. Thank you.

It is now pending review. We will let you know if the reviewer accepts it or needs anything else.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

---
id: EMT-055
title: "Funding Review In Progress"
category: "Loan Processor Templates"
loan_stage: "Funding"
audience:
  - "Borrower"
loan_programs:
  - "Conventional"
  - "FHA"
  - "VA"
  - "USDA"
  - "Jumbo"
  - "Non-QM"
  - "Investor"
language: "English"
priority: "High"
purpose: "Explain post-signing funding review."
communication_type: "Status Update"
workflow_step: "Funding - Funding Review In Progress"
workflow_trigger: "Signed package in funding review"
automation_trigger: "Signed package in funding review"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Funding review update"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{PhoneNumber}}"
  - "{{ProcessorName}}"
optional_merge_fields:
  - "{{ClosingDate}}"
required_attachments: []
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "borrower"
  - "emt-055"
  - "funding"
  - "funding review in progress"
  - "loan processor templates"
related_templates:
  - "EMT-054"
  - "EMT-056"
tags:
  - "borrower"
  - "emt-055"
  - "fully-automated"
  - "funding"
  - "funding-review-in-progress"
  - "high"
  - "loan-processor-templates"
  - "processor"
  - "status-update"
---

## EMT-055 Funding Review In Progress

- Template name: Funding review in progress
- Use case: Explain post-signing funding review.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Funding review update
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{ClosingDate}}`
- Compliance notes: Funding is not complete until lender authorizes it.
- Follow up timing: After signing while awaiting funding confirmation.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Your signed documents are in funding review.

Funding is not complete until the lender authorizes it and confirmation is received. We will update you once that is confirmed.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

---
id: EMT-056
title: "Third Party Status Follow Up"
category: "Loan Processor Templates"
loan_stage: "Processing"
audience:
  - "Third party partner"
loan_programs:
  - "Conventional"
  - "FHA"
  - "VA"
  - "USDA"
  - "Jumbo"
  - "Non-QM"
  - "Investor"
language: "English"
priority: "Low"
purpose: "Ask title, insurance, appraisal, or partner contact for status."
communication_type: "Status Update"
workflow_step: "Processing - Third Party Status Follow Up"
workflow_trigger: "Third-party status needed"
automation_trigger: "Third-party status needed"
automation_timing: "Send Immediately"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Status request for {{PropertyAddress}}"
required_merge_fields:
  - "{{EmailAddress}}"
  - "{{PhoneNumber}}"
  - "{{ProcessorName}}"
  - "{{PropertyAddress}}"
optional_merge_fields:
  - "{{ClosingDate}}"
  - "{{LenderName}}"
required_attachments: []
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "emt-056"
  - "loan processor templates"
  - "processing"
  - "third party partner"
  - "third party status follow up"
related_templates:
  - "EMT-055"
  - "EMT-057"
tags:
  - "emt-056"
  - "loan-processor-templates"
  - "low"
  - "processing"
  - "processor"
  - "semi-automated"
  - "status-update"
  - "third-party-partner"
  - "third-party-status-follow-up"
---

## EMT-056 Third Party Status Follow Up

- Template name: Third party status follow up
- Use case: Ask title, insurance, appraisal, or partner contact for status.
- Audience: Third party partner
- Recommended sender: Processor
- Subject line: Status request for `{{PropertyAddress}}`
- Required placeholders: `{{PropertyAddress}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`, `{{EmailAddress}}`
- Optional placeholders: `{{ClosingDate}}`, `{{LenderName}}`
- Compliance notes: Do not share borrower private financial information.
- Follow up timing: Every 24 to 48 hours while blocking.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi team,

Can you please send a status update for `{{PropertyAddress}}`?

If you need anything from our side, contact me at `{{PhoneNumber}}` or `{{EmailAddress}}`.

Thank you,  
`{{ProcessorName}}`

