# Loan Coordinator Templates

## Table Of Contents

- [EMT-048 Loan Coordinator Introduction](#emt-048-loan-coordinator-introduction)
- [EMT-049 Appointment Scheduling](#emt-049-appointment-scheduling)
- [EMT-050 Friendly Status Nudge](#emt-050-friendly-status-nudge)
- [EMT-051 Wrong Or Unreadable Document](#emt-051-wrong-or-unreadable-document)

---
id: EMT-048
title: "Loan Coordinator Introduction"
category: "Loan Coordinator Templates"
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
purpose: "Introduce coordinator as borrower support contact."
communication_type: "Introduction"
workflow_step: "Processing - Loan Coordinator Introduction"
workflow_trigger: "Loan coordinator assigned"
automation_trigger: "Loan coordinator assigned"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "I will help coordinate your loan file"
required_merge_fields:
  - "{{ApplicationLink}}"
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{LoanOfficerName}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{EmailAddress}}"
required_attachments: []
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "borrower"
  - "emt-048"
  - "loan coordinator introduction"
  - "loan coordinator templates"
  - "processing"
related_templates:
  - "EMT-047"
  - "EMT-049"
tags:
  - "borrower"
  - "emt-048"
  - "fully-automated"
  - "introduction"
  - "loan-coordinator"
  - "loan-coordinator-introduction"
  - "loan-coordinator-templates"
  - "low"
  - "processing"
---

## EMT-048 Loan Coordinator Introduction

- Template name: Loan coordinator introduction
- Use case: Introduce coordinator as borrower support contact.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: I will help coordinate your loan file
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{LoanOfficerName}}`, `{{PhoneNumber}}`, `{{ApplicationLink}}`
- Optional placeholders: `{{EmailAddress}}`
- Compliance notes: Clarify LO remains the primary loan advice contact.
- Follow up timing: After application starts or file is assigned.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

I am `{{LoanCoordinatorName}}`, and I will help coordinate documents and follow-up items for your loan file.

`{{LoanOfficerName}}` remains your main loan contact. My role is to help keep requests clear and keep the file moving.

Please use the secure portal for uploads:

`{{ApplicationLink}}`

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

---
id: EMT-049
title: "Appointment Scheduling"
category: "Loan Coordinator Templates"
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
purpose: "Schedule a quick borrower call."
communication_type: "Status Update"
workflow_step: "Processing - Appointment Scheduling"
workflow_trigger: "Call needed"
automation_trigger: "Call needed"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Quick appointment for your loan file"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{LoanOfficerName}}"
required_attachments: []
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "appointment scheduling"
  - "borrower"
  - "emt-049"
  - "loan coordinator templates"
  - "processing"
related_templates:
  - "EMT-048"
  - "EMT-050"
tags:
  - "appointment-scheduling"
  - "borrower"
  - "emt-049"
  - "fully-automated"
  - "loan-coordinator"
  - "loan-coordinator-templates"
  - "low"
  - "processing"
  - "status-update"
---

## EMT-049 Appointment Scheduling

- Template name: Appointment scheduling
- Use case: Schedule a quick borrower call.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Quick appointment for your loan file
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanOfficerName}}`
- Compliance notes: Keep topic general in writing when sensitive.
- Follow up timing: When a call is needed to clarify missing items.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We would like to schedule a quick call to go over the next item needed for your loan file.

Please reply with a good time, or call us at `{{PhoneNumber}}`.

Thank you,  
`{{LoanCoordinatorName}}`

---
id: EMT-050
title: "Friendly Status Nudge"
category: "Loan Coordinator Templates"
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
purpose: "Send a clear status update without overstating approval."
communication_type: "Reminder"
workflow_step: "Processing - Friendly Status Nudge"
workflow_trigger: "Status update cadence due"
automation_trigger: "Status update cadence due"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Quick status update"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{ApplicationLink}}"
  - "{{LoanOfficerName}}"
required_attachments: []
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "borrower"
  - "emt-050"
  - "friendly status nudge"
  - "loan coordinator templates"
  - "processing"
related_templates:
  - "EMT-049"
  - "EMT-051"
tags:
  - "borrower"
  - "emt-050"
  - "friendly-status-nudge"
  - "fully-automated"
  - "loan-coordinator"
  - "loan-coordinator-templates"
  - "low"
  - "processing"
  - "reminder"
---

## EMT-050 Friendly Status Nudge

- Template name: Friendly status nudge
- Use case: Send a clear status update without overstating approval.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Quick status update
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanOfficerName}}`, `{{ApplicationLink}}`
- Compliance notes: Do not include final approval or final terms language.
- Follow up timing: Every 3 to 5 business days during active waiting periods.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Quick update: your file is still moving through review. We do not need anything new from you right now.

If that changes, our team will send a specific request. You can reach us at `{{PhoneNumber}}` if you have questions.

Thank you,  
`{{LoanCoordinatorName}}`

---
id: EMT-051
title: "Wrong Or Unreadable Document"
category: "Loan Coordinator Templates"
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
priority: "High"
purpose: "Ask borrower to replace a document without blame."
communication_type: "Status Update"
workflow_step: "Processing - Wrong Or Unreadable Document"
workflow_trigger: "Document rejected or unreadable"
automation_trigger: "Document rejected or unreadable"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "New copy needed for your file"
required_merge_fields:
  - "{{ApplicationLink}}"
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{PhoneNumber}}"
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
  - "emt-051"
  - "loan coordinator templates"
  - "processing"
  - "wrong or unreadable document"
related_templates:
  - "EMT-050"
  - "EMT-052"
tags:
  - "borrower"
  - "emt-051"
  - "fully-automated"
  - "high"
  - "loan-coordinator"
  - "loan-coordinator-templates"
  - "processing"
  - "status-update"
  - "wrong-or-unreadable-document"
---

## EMT-051 Wrong Or Unreadable Document

- Template name: Wrong or unreadable document
- Use case: Ask borrower to replace a document without blame.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: New copy needed for your file
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: none
- Compliance notes: Do not shame the borrower. Keep the document pending review.
- Follow up timing: Same day issue is identified.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We received a document, but we need a new copy before it can be reviewed.

Please upload the replacement through the secure portal:

`{{ApplicationLink}}`

If you are unsure what to upload, call us at `{{PhoneNumber}}`.

Thank you,  
`{{LoanCoordinatorName}}`

