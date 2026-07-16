# Appraisal Title Insurance Templates

## Table Of Contents

- [EMT-028 Appraisal Ordered](#emt-028-appraisal-ordered)
- [EMT-029 Appraisal Paid](#emt-029-appraisal-paid)
- [EMT-030 Appraisal Assigned](#emt-030-appraisal-assigned)
- [EMT-031 Appraisal Scheduled](#emt-031-appraisal-scheduled)
- [EMT-032 Appraisal Received](#emt-032-appraisal-received)
- [EMT-033 Appraisal Revision Needed](#emt-033-appraisal-revision-needed)
- [EMT-034 Title Ordered](#emt-034-title-ordered)
- [EMT-035 Title Request To Title Company](#emt-035-title-request-to-title-company)
- [EMT-036 Insurance Request](#emt-036-insurance-request)
- [EMT-037 Insurance Binder Request](#emt-037-insurance-binder-request)
- [EMT-113 Construction Appraisal Ordered](#emt-113-construction-appraisal-ordered)
- [EMT-114 Renovation Appraisal Ordered](#emt-114-renovation-appraisal-ordered)
- [EMT-115 Manufactured Home Inspection and Foundation Requirements](#emt-115-manufactured-home-inspection-and-foundation-requirements)
- [EMT-116 Reverse Mortgage Appraisal Scheduled](#emt-116-reverse-mortgage-appraisal-scheduled)
- [EMT-117 Condo Approval Status](#emt-117-condo-approval-status)
- [EMT-118 HOA Information Needed](#emt-118-hoa-information-needed)
- [EMT-119 Insurance Binder Reminder](#emt-119-insurance-binder-reminder)

---
id: EMT-028
title: "Appraisal Ordered"
category: "Appraisal Title Insurance Templates"
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
purpose: "Notify borrower appraisal order has been placed."
communication_type: "Status Update"
workflow_step: "Processing - Appraisal Ordered"
workflow_trigger: "Appraisal ordered"
automation_trigger: "Appraisal ordered"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Appraisal ordered"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{PhoneNumber}}"
  - "{{PropertyAddress}}"
optional_merge_fields:
  - "{{AppraisalDueDate}}"
required_attachments: []
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "appraisal"
  - "appraisal ordered"
  - "appraisal title insurance templates"
  - "borrower"
  - "emt-028"
  - "insurance"
  - "processing"
  - "title"
related_templates:
  - "EMT-027"
  - "EMT-029"
  - "EMT-030"
tags:
  - "appraisal"
  - "appraisal-ordered"
  - "appraisal-title-insurance-templates"
  - "borrower"
  - "emt-028"
  - "fully-automated"
  - "loan-coordinator"
  - "low"
  - "processing"
  - "status-update"
---

## EMT-028 Appraisal Ordered

- Template name: Appraisal ordered
- Use case: Notify borrower appraisal order has been placed.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Appraisal ordered
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{PropertyAddress}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{AppraisalDueDate}}`
- Compliance notes: Appraisal timing and value are not guaranteed. Include compliance line.
- Follow up timing: Same day appraisal is ordered.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

The appraisal has been ordered for `{{PropertyAddress}}`.

The appraiser controls scheduling and completion timing. We will update you when it is assigned, scheduled, or received.

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.

---
id: EMT-029
title: "Appraisal Paid"
category: "Appraisal Title Insurance Templates"
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
purpose: "Confirm appraisal payment is complete."
communication_type: "Status Update"
workflow_step: "Processing - Appraisal Paid"
workflow_trigger: "Appraisal payment received"
automation_trigger: "Appraisal payment received"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Appraisal payment received"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{PropertyAddress}}"
optional_merge_fields:
  - "{{PhoneNumber}}"
required_attachments: []
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "appraisal"
  - "appraisal paid"
  - "appraisal title insurance templates"
  - "borrower"
  - "emt-029"
  - "insurance"
  - "processing"
  - "title"
related_templates:
  - "EMT-028"
  - "EMT-030"
tags:
  - "appraisal"
  - "appraisal-paid"
  - "appraisal-title-insurance-templates"
  - "borrower"
  - "emt-029"
  - "fully-automated"
  - "loan-coordinator"
  - "low"
  - "processing"
  - "status-update"
---

## EMT-029 Appraisal Paid

- Template name: Appraisal paid
- Use case: Confirm appraisal payment is complete.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Appraisal payment received
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{PropertyAddress}}`
- Optional placeholders: `{{PhoneNumber}}`
- Compliance notes: Payment does not guarantee value, completion time, or approval.
- Follow up timing: Same day payment is confirmed.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

The appraisal payment has been received for `{{PropertyAddress}}`.

We will continue watching for assignment and scheduling updates.

Thank you,  
`{{LoanCoordinatorName}}`

---
id: EMT-030
title: "Appraisal Assigned"
category: "Appraisal Title Insurance Templates"
loan_stage: "Processing"
audience:
  - "Borrower"
  - "Realtor"
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
purpose: "Notify borrower or Realtor that appraiser has accepted assignment."
communication_type: "Status Update"
workflow_step: "Processing - Appraisal Assigned"
workflow_trigger: "Appraisal assigned"
automation_trigger: "Appraisal assigned"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Appraisal assigned"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{PropertyAddress}}"
optional_merge_fields:
  - "{{AppraisalDueDate}}"
  - "{{RealtorName}}"
required_attachments: []
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "appraisal"
  - "appraisal assigned"
  - "appraisal title insurance templates"
  - "borrower"
  - "borrower or realtor"
  - "emt-030"
  - "insurance"
  - "processing"
  - "realtor"
  - "title"
related_templates:
  - "EMT-029"
  - "EMT-031"
tags:
  - "appraisal"
  - "appraisal-assigned"
  - "appraisal-title-insurance-templates"
  - "borrower"
  - "borrower-or-realtor"
  - "fully-automated"
  - "loan-coordinator"
  - "low"
  - "processing"
  - "status-update"
---

## EMT-030 Appraisal Assigned

- Template name: Appraisal assigned
- Use case: Notify borrower or Realtor that appraiser has accepted assignment.
- Audience: Borrower or Realtor
- Recommended sender: Loan Coordinator
- Subject line: Appraisal assigned
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{PropertyAddress}}`
- Optional placeholders: `{{RealtorName}}`, `{{AppraisalDueDate}}`
- Compliance notes: Do not imply value or completion outcome.
- Follow up timing: Same day assignment is visible.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

The appraisal has been assigned for `{{PropertyAddress}}`.

We will keep tracking the status and will update you when it is scheduled or received.

Thank you,  
`{{LoanCoordinatorName}}`

---
id: EMT-031
title: "Appraisal Scheduled"
category: "Appraisal Title Insurance Templates"
loan_stage: "Processing"
audience:
  - "Borrower"
  - "Realtor"
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
purpose: "Notify parties of scheduled appraisal date."
communication_type: "Status Update"
workflow_step: "Processing - Appraisal Scheduled"
workflow_trigger: "Appraisal scheduled"
automation_trigger: "Appraisal scheduled"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Appraisal scheduled for {{PropertyAddress}}"
required_merge_fields:
  - "{{AppraisalDate}}"
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{PropertyAddress}}"
optional_merge_fields:
  - "{{PhoneNumber}}"
  - "{{RealtorName}}"
required_attachments: []
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "appraisal"
  - "appraisal scheduled"
  - "appraisal title insurance templates"
  - "borrower"
  - "borrower or realtor"
  - "emt-031"
  - "insurance"
  - "processing"
  - "realtor"
  - "title"
related_templates:
  - "EMT-030"
  - "EMT-032"
tags:
  - "appraisal"
  - "appraisal-scheduled"
  - "appraisal-title-insurance-templates"
  - "borrower"
  - "borrower-or-realtor"
  - "fully-automated"
  - "loan-coordinator"
  - "low"
  - "processing"
  - "status-update"
---

## EMT-031 Appraisal Scheduled

- Template name: Appraisal scheduled
- Use case: Notify parties of scheduled appraisal date.
- Audience: Borrower or Realtor
- Recommended sender: Loan Coordinator
- Subject line: Appraisal scheduled for `{{PropertyAddress}}`
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{PropertyAddress}}`, `{{AppraisalDate}}`
- Optional placeholders: `{{RealtorName}}`, `{{PhoneNumber}}`
- Compliance notes: Scheduling does not guarantee delivery date or value.
- Follow up timing: Same day schedule is confirmed.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

The appraisal for `{{PropertyAddress}}` is scheduled for `{{AppraisalDate}}`.

Once the report is completed and released, our team will review it and update you on the next step.

Thank you,  
`{{LoanCoordinatorName}}`

---
id: EMT-032
title: "Appraisal Received"
category: "Appraisal Title Insurance Templates"
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
purpose: "Notify borrower appraisal is received and under review."
communication_type: "Status Update"
workflow_step: "Processing - Appraisal Received"
workflow_trigger: "Appraisal received"
automation_trigger: "Appraisal received"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Appraisal received"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{PhoneNumber}}"
  - "{{ProcessorName}}"
  - "{{PropertyAddress}}"
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
  - "appraisal"
  - "appraisal received"
  - "appraisal title insurance templates"
  - "borrower"
  - "emt-032"
  - "insurance"
  - "processing"
  - "title"
related_templates:
  - "EMT-031"
  - "EMT-033"
  - "EMT-039"
tags:
  - "appraisal"
  - "appraisal-received"
  - "appraisal-title-insurance-templates"
  - "borrower"
  - "emt-032"
  - "fully-automated"
  - "low"
  - "processing"
  - "processor"
  - "status-update"
---

## EMT-032 Appraisal Received

- Template name: Appraisal received
- Use case: Notify borrower appraisal is received and under review.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Appraisal received
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PropertyAddress}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanOfficerName}}`
- Compliance notes: Do not discuss value unless reviewed and appropriate.
- Follow up timing: Same day appraisal is received.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

The appraisal for `{{PropertyAddress}}` has been received.

Our team is reviewing it with the rest of the file. If anything needs attention, we will let you know.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

---
id: EMT-033
title: "Appraisal Revision Needed"
category: "Appraisal Title Insurance Templates"
loan_stage: "Processing"
audience:
  - "Borrower"
  - "Realtor"
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
purpose: "Explain an appraisal revision is needed without blaming parties."
communication_type: "Request"
workflow_step: "Processing - Appraisal Revision Needed"
workflow_trigger: "Appraisal revision requested"
automation_trigger: "Appraisal revision requested"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Appraisal revision update"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{PhoneNumber}}"
  - "{{ProcessorName}}"
  - "{{PropertyAddress}}"
optional_merge_fields:
  - "{{RealtorName}}"
required_attachments: []
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "appraisal"
  - "appraisal revision needed"
  - "appraisal title insurance templates"
  - "borrower"
  - "borrower or realtor"
  - "emt-033"
  - "insurance"
  - "processing"
  - "realtor"
  - "title"
related_templates:
  - "EMT-032"
  - "EMT-034"
tags:
  - "appraisal"
  - "appraisal-revision-needed"
  - "appraisal-title-insurance-templates"
  - "borrower"
  - "borrower-or-realtor"
  - "fully-automated"
  - "low"
  - "processing"
  - "processor"
  - "request"
---

## EMT-033 Appraisal Revision Needed

- Template name: Appraisal revision needed
- Use case: Explain an appraisal revision is needed without blaming parties.
- Audience: Borrower or Realtor
- Recommended sender: Processor
- Subject line: Appraisal revision update
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PropertyAddress}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{RealtorName}}`
- Compliance notes: Do not promise outcome or timing. Keep neutral.
- Follow up timing: Same day revision request is confirmed.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

The appraisal for `{{PropertyAddress}}` needs a revision before the lender can complete review.

We have requested the update and will keep tracking it. Timing depends on the appraiser and lender review process.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

---
id: EMT-034
title: "Title Ordered"
category: "Appraisal Title Insurance Templates"
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
purpose: "Notify borrower title work has been ordered."
communication_type: "Status Update"
workflow_step: "Processing - Title Ordered"
workflow_trigger: "Title ordered"
automation_trigger: "Title ordered"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Title work ordered"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{ProcessorName}}"
  - "{{PropertyAddress}}"
optional_merge_fields:
  - "{{PhoneNumber}}"
required_attachments: []
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "appraisal"
  - "appraisal title insurance templates"
  - "borrower"
  - "emt-034"
  - "insurance"
  - "processing"
  - "title"
  - "title ordered"
related_templates:
  - "EMT-033"
  - "EMT-035"
tags:
  - "appraisal"
  - "appraisal-title-insurance-templates"
  - "borrower"
  - "emt-034"
  - "fully-automated"
  - "insurance"
  - "low"
  - "processing"
  - "processor"
  - "status-update"
---

## EMT-034 Title Ordered

- Template name: Title ordered
- Use case: Notify borrower title work has been ordered.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Title work ordered
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PropertyAddress}}`
- Optional placeholders: `{{PhoneNumber}}`
- Compliance notes: Title work may surface items that need resolution.
- Follow up timing: Same day title is ordered.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Title work has been ordered for `{{PropertyAddress}}`.

If the title company or lender needs anything else, we will reach out with the next step.

Thank you,  
`{{ProcessorName}}`

---
id: EMT-035
title: "Title Request To Title Company"
category: "Appraisal Title Insurance Templates"
loan_stage: "Processing"
audience:
  - "Title company"
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
purpose: "Request title work or status from title company."
communication_type: "Request"
workflow_step: "Processing - Title Request To Title Company"
workflow_trigger: "Title status needed"
automation_trigger: "Title status needed"
automation_timing: "Send Immediately"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Title request for {{PropertyAddress}}"
required_merge_fields:
  - "{{EmailAddress}}"
  - "{{PhoneNumber}}"
  - "{{ProcessorName}}"
  - "{{PropertyAddress}}"
optional_merge_fields:
  - "{{ClosingDate}}"
  - "{{LenderName}}"
required_attachments:
  - "Title commitment or status"
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "appraisal"
  - "appraisal title insurance templates"
  - "emt-035"
  - "insurance"
  - "processing"
  - "title"
  - "title company"
  - "title request to title company"
related_templates:
  - "EMT-034"
  - "EMT-036"
tags:
  - "appraisal"
  - "appraisal-title-insurance-templates"
  - "emt-035"
  - "insurance"
  - "low"
  - "processing"
  - "processor"
  - "request"
  - "semi-automated"
---

## EMT-035 Title Request To Title Company

- Template name: Title request to title company
- Use case: Request title work or status from title company.
- Audience: Title company
- Recommended sender: Processor
- Subject line: Title request for `{{PropertyAddress}}`
- Required placeholders: `{{PropertyAddress}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`, `{{EmailAddress}}`
- Optional placeholders: `{{ClosingDate}}`, `{{LenderName}}`
- Compliance notes: Do not include borrower private financial details.
- Follow up timing: At order and every 48 hours if pending.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi team,

Please send the title status for `{{PropertyAddress}}` when available.

If you need anything from our side, contact me at `{{PhoneNumber}}` or `{{EmailAddress}}`.

Thank you,  
`{{ProcessorName}}`

---
id: EMT-036
title: "Insurance Request"
category: "Appraisal Title Insurance Templates"
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
purpose: "Ask borrower to arrange insurance."
communication_type: "Request"
workflow_step: "Processing - Insurance Request"
workflow_trigger: "Insurance evidence needed"
automation_trigger: "Insurance evidence needed"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Home insurance needed"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{PhoneNumber}}"
  - "{{PropertyAddress}}"
optional_merge_fields:
  - "{{ClosingDate}}"
required_attachments:
  - "Insurance declarations page"
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "appraisal"
  - "appraisal title insurance templates"
  - "borrower"
  - "emt-036"
  - "insurance"
  - "insurance request"
  - "processing"
  - "title"
related_templates:
  - "EMT-035"
  - "EMT-037"
tags:
  - "appraisal"
  - "appraisal-title-insurance-templates"
  - "borrower"
  - "emt-036"
  - "fully-automated"
  - "insurance"
  - "loan-coordinator"
  - "low"
  - "processing"
  - "request"
---

## EMT-036 Insurance Request

- Template name: Insurance request
- Use case: Ask borrower to arrange insurance.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Home insurance needed
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{PropertyAddress}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{ClosingDate}}`
- Compliance notes: Insurance must be reviewed before closing. Do not promise closing date.
- Follow up timing: After contract and lender requirements are known.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We need home insurance set up for `{{PropertyAddress}}`.

Please contact your insurance agent and have the policy information sent to our team. If you need help understanding what to request, call us at `{{PhoneNumber}}`.

Thank you,  
`{{LoanCoordinatorName}}`

---
id: EMT-037
title: "Insurance Binder Request"
category: "Appraisal Title Insurance Templates"
loan_stage: "Processing"
audience:
  - "Insurance agent"
  - "borrower"
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
purpose: "Request binder or policy evidence from insurance agent."
communication_type: "Request"
workflow_step: "Processing - Insurance Binder Request"
workflow_trigger: "Insurance binder needed"
automation_trigger: "Insurance binder needed"
automation_timing: "Send Immediately"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Insurance binder needed for {{PropertyAddress}}"
required_merge_fields:
  - "{{EmailAddress}}"
  - "{{PhoneNumber}}"
  - "{{ProcessorName}}"
  - "{{PropertyAddress}}"
optional_merge_fields:
  - "{{BorrowerName}}"
  - "{{ClosingDate}}"
  - "{{LenderName}}"
required_attachments:
  - "Insurance binder"
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "appraisal"
  - "appraisal title insurance templates"
  - "borrower"
  - "emt-037"
  - "insurance"
  - "insurance agent or borrower"
  - "insurance binder request"
  - "processing"
  - "title"
related_templates:
  - "EMT-036"
  - "EMT-038"
tags:
  - "appraisal"
  - "appraisal-title-insurance-templates"
  - "borrower"
  - "emt-037"
  - "insurance"
  - "low"
  - "processing"
  - "processor"
  - "request"
  - "semi-automated"
---

## EMT-037 Insurance Binder Request

- Template name: Insurance binder request
- Use case: Request binder or policy evidence from insurance agent.
- Audience: Insurance agent or borrower
- Recommended sender: Processor
- Subject line: Insurance binder needed for `{{PropertyAddress}}`
- Required placeholders: `{{PropertyAddress}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`, `{{EmailAddress}}`
- Optional placeholders: `{{BorrowerName}}`, `{{ClosingDate}}`, `{{LenderName}}`
- Compliance notes: Do not include borrower private financial details.
- Follow up timing: Same day insurance requirement is open.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi team,

We need the insurance binder or policy evidence for `{{PropertyAddress}}`.

Please send it to `{{EmailAddress}}`, or call me at `{{PhoneNumber}}` if you need lender details.

Thank you,  
`{{ProcessorName}}`


---
id: EMT-113
title: "Construction Appraisal Ordered"
category: "Appraisal Title Insurance Templates"
loan_stage: "Processing"
audience:
  - "Borrower"
loan_programs:
  - "Construction"
  - "Conventional"
  - "Jumbo"
  - "Non-QM"
language: "English"
priority: "Medium"
purpose: "Notify borrower that construction appraisal has been ordered and explain remaining dependencies."
communication_type: "Status Update"
workflow_step: "Processing - Construction Appraisal Ordered"
workflow_trigger: "Construction Appraisal Ordered needed"
automation_trigger: "Construction Appraisal Ordered needed"
automation_timing: "Send Immediately"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Construction appraisal ordered"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{PropertyAddress}}"
  - "{{AppraisalDueDate}}"
  - "{{LoanOfficerName}}"
required_attachments:
[]
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "appraisal ordered"
  - "appraisal title insurance templates"
  - "borrower"
  - "construction appraisal"
  - "construction appraisal ordered"
  - "emt-113"
  - "processing"
related_templates:
  - "EMT-078"
  - "EMT-098"
  - "EMT-106"
tags:
  - "appraisal-ordered"
  - "appraisal-title-insurance-templates"
  - "borrower"
  - "construction-appraisal"
  - "construction-appraisal-ordered"
  - "emt-113"
  - "loan-coordinator"
  - "medium"
  - "processing"
  - "semi-automated"
  - "status-update"
---

## EMT-113 Construction Appraisal Ordered

- Template name: Construction Appraisal Ordered
- Use case: Notify borrower that construction appraisal has been ordered and explain remaining dependencies.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Construction appraisal ordered
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{PropertyAddress}}`, `{{AppraisalDueDate}}`, `{{LoanOfficerName}}`
- Compliance notes: Do not promise construction approval. Builder, plans, specs, budget, appraisal, title, insurance, and underwriting still matter. Include compliance line.
- Follow up timing: Same day construction appraisal order is confirmed.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

The construction appraisal has been ordered.

The appraiser may review the property, plans, specs, budget, and comparable sales. The appraisal is one part of the review and does not approve the construction loan by itself.

We will update you when the appraisal is received or if the appraiser needs access or additional information.

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-114
title: "Renovation Appraisal Ordered"
category: "Appraisal Title Insurance Templates"
loan_stage: "Processing"
audience:
  - "Borrower"
loan_programs:
  - "Renovation"
  - "FHA 203k"
  - "Conventional Renovation"
language: "English"
priority: "Medium"
purpose: "Notify borrower that renovation appraisal has been ordered."
communication_type: "Status Update"
workflow_step: "Processing - Renovation Appraisal Ordered"
workflow_trigger: "Renovation Appraisal Ordered needed"
automation_trigger: "Renovation Appraisal Ordered needed"
automation_timing: "Send Immediately"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Renovation appraisal ordered"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{PropertyAddress}}"
  - "{{AppraisalDueDate}}"
  - "{{LoanOfficerName}}"
required_attachments:
[]
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "appraisal ordered"
  - "appraisal title insurance templates"
  - "borrower"
  - "emt-114"
  - "processing"
  - "renovation appraisal"
  - "renovation appraisal ordered"
related_templates:
  - "EMT-081"
  - "EMT-104"
  - "EMT-110"
tags:
  - "appraisal-ordered"
  - "appraisal-title-insurance-templates"
  - "borrower"
  - "emt-114"
  - "loan-coordinator"
  - "medium"
  - "processing"
  - "renovation-appraisal"
  - "renovation-appraisal-ordered"
  - "semi-automated"
  - "status-update"
---

## EMT-114 Renovation Appraisal Ordered

- Template name: Renovation Appraisal Ordered
- Use case: Notify borrower that renovation appraisal has been ordered.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Renovation appraisal ordered
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{PropertyAddress}}`, `{{AppraisalDueDate}}`, `{{LoanOfficerName}}`
- Compliance notes: Clarify final scope, contractor approval, bid, appraisal, and lender review determine approval. Include compliance line.
- Follow up timing: Same day renovation appraisal order is confirmed.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

The renovation appraisal has been ordered.

For renovation loans, the appraiser may review the property along with the scope of work, contractor bid, and expected completed value. The appraisal is not final loan approval.

We will update you when the appraisal is received or if any project information is needed.

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-115
title: "Manufactured Home Inspection and Foundation Requirements"
category: "Appraisal Title Insurance Templates"
loan_stage: "Processing"
audience:
  - "Borrower"
loan_programs:
  - "Manufactured Home"
  - "Conventional"
  - "FHA"
  - "VA"
  - "USDA"
language: "English"
priority: "High"
purpose: "Explain manufactured home inspection and foundation documentation requirements."
communication_type: "Request"
workflow_step: "Processing - Manufactured Home Inspection and Foundation Requirements"
workflow_trigger: "Manufactured Home Inspection and Foundation Requirements needed"
automation_trigger: "Manufactured Home Inspection and Foundation Requirements needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Manufactured home inspection and foundation items"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{ProcessorName}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{LoanProgram}}"
required_attachments:
[]
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "appraisal title insurance templates"
  - "borrower"
  - "emt-115"
  - "engineer report"
  - "foundation"
  - "hud tags"
  - "manufactured home"
  - "manufactured home inspection and foundation requirements"
  - "processing"
related_templates:
  - "EMT-080"
  - "EMT-093"
  - "EMT-109"
tags:
  - "appraisal-title-insurance-templates"
  - "borrower"
  - "emt-115"
  - "engineer-report"
  - "foundation"
  - "high"
  - "hud-tags"
  - "manufactured-home"
  - "manufactured-home-inspection-and-foundation-requirements"
  - "processing"
  - "processor"
  - "request"
  - "semi-automated"
---

## EMT-115 Manufactured Home Inspection and Foundation Requirements

- Template name: Manufactured Home Inspection and Foundation Requirements
- Use case: Explain manufactured home inspection and foundation documentation requirements.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Manufactured home inspection and foundation items
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Mention title, foundation, HUD tags, data plate, engineer report, land ownership, and lender requirements where relevant. Do not assume all manufactured homes qualify. Include compliance line.
- Follow up timing: When manufactured home foundation or inspection item is opened.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We need to address manufactured home inspection and foundation requirements for the file.

Depending on the lender and property, this may include foundation details, an engineer report, HUD tags, data plate, title status, land ownership, appraisal, insurance, and other lender requirements.

Please watch the portal for any specific item assigned to you, or call us if you already have documents available.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-116
title: "Reverse Mortgage Appraisal Scheduled"
category: "Appraisal Title Insurance Templates"
loan_stage: "Processing"
audience:
  - "Borrower"
loan_programs:
  - "Reverse Mortgage"
  - "HECM"
language: "English"
priority: "Medium"
purpose: "Notify borrower that reverse mortgage appraisal is scheduled."
communication_type: "Status Update"
workflow_step: "Processing - Reverse Mortgage Appraisal Scheduled"
workflow_trigger: "Reverse Mortgage Appraisal Scheduled needed"
automation_trigger: "Reverse Mortgage Appraisal Scheduled needed"
automation_timing: "Send Immediately"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Reverse mortgage appraisal scheduled"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{AppraisalDate}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{PropertyAddress}}"
  - "{{LoanOfficerName}}"
required_attachments:
[]
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "appraisal scheduled"
  - "appraisal title insurance templates"
  - "borrower"
  - "emt-116"
  - "processing"
  - "reverse mortgage"
  - "reverse mortgage appraisal scheduled"
related_templates:
  - "EMT-082"
  - "EMT-095"
  - "EMT-111"
tags:
  - "appraisal-scheduled"
  - "appraisal-title-insurance-templates"
  - "borrower"
  - "emt-116"
  - "loan-coordinator"
  - "medium"
  - "processing"
  - "reverse-mortgage"
  - "reverse-mortgage-appraisal-scheduled"
  - "semi-automated"
  - "status-update"
---

## EMT-116 Reverse Mortgage Appraisal Scheduled

- Template name: Reverse Mortgage Appraisal Scheduled
- Use case: Notify borrower that reverse mortgage appraisal is scheduled.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Reverse mortgage appraisal scheduled
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{AppraisalDate}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{PropertyAddress}}`, `{{LoanOfficerName}}`
- Compliance notes: Do not make suitability claims or imply approval. Required counseling and lender review still apply. Include compliance line.
- Follow up timing: Same day reverse mortgage appraisal is scheduled.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

The reverse mortgage appraisal is scheduled for `{{AppraisalDate}}`.

The appraisal is part of the property review. It does not mean the loan is approved or that a reverse mortgage is right for your situation.

Please make sure the appraiser can access the property. We will update you after the appraisal is received and reviewed.

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-117
title: "Condo Approval Status"
category: "Appraisal Title Insurance Templates"
loan_stage: "Processing"
audience:
  - "Borrower"
loan_programs:
  - "Conventional"
  - "FHA"
  - "VA"
  - "Jumbo"
  - "Condo"
language: "English"
priority: "Medium"
purpose: "Update borrower on condo project review status."
communication_type: "Status Update"
workflow_step: "Processing - Condo Approval Status"
workflow_trigger: "Condo Approval Status needed"
automation_trigger: "Condo Approval Status needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Condo approval status"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{ProcessorName}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{PropertyAddress}}"
  - "{{LoanOfficerName}}"
required_attachments:
[]
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "appraisal title insurance templates"
  - "borrower"
  - "condo"
  - "condo approval status"
  - "emt-117"
  - "hoa"
  - "processing"
  - "project approval"
related_templates:
  - "EMT-034"
  - "EMT-035"
  - "EMT-118"
tags:
  - "appraisal-title-insurance-templates"
  - "borrower"
  - "condo"
  - "condo-approval-status"
  - "emt-117"
  - "hoa"
  - "medium"
  - "processing"
  - "processor"
  - "project-approval"
  - "semi-automated"
  - "status-update"
---

## EMT-117 Condo Approval Status

- Template name: Condo Approval Status
- Use case: Update borrower on condo project review status.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Condo approval status
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{PropertyAddress}}`, `{{LoanOfficerName}}`
- Compliance notes: Do not imply condo project approval until lender or agency review confirms it. Include compliance line.
- Follow up timing: When condo project review status changes or borrower asks for update.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We are still working through the condo project review for your file.

Condo review can involve HOA documents, project eligibility, insurance, budget details, questionnaire responses, lender rules, and sometimes agency requirements.

We will update you when the review is complete or if another HOA item is needed.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-118
title: "HOA Information Needed"
category: "Appraisal Title Insurance Templates"
loan_stage: "Processing"
audience:
  - "Borrower"
loan_programs:
  - "Conventional"
  - "FHA"
  - "VA"
  - "Jumbo"
  - "Condo"
language: "English"
priority: "High"
purpose: "Request HOA information needed for property or condo review."
communication_type: "Request"
workflow_step: "Processing - HOA Information Needed"
workflow_trigger: "HOA Information Needed needed"
automation_trigger: "HOA Information Needed needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "HOA information needed"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{ProcessorName}}"
  - "{{ApplicationLink}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{PropertyAddress}}"
  - "{{RealtorName}}"
  - "{{LoanOfficerName}}"
required_attachments:
[]
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "appraisal title insurance templates"
  - "borrower"
  - "condo"
  - "emt-118"
  - "hoa"
  - "hoa information needed"
  - "processing"
  - "questionnaire"
related_templates:
  - "EMT-117"
  - "EMT-034"
  - "EMT-035"
tags:
  - "appraisal-title-insurance-templates"
  - "borrower"
  - "condo"
  - "emt-118"
  - "high"
  - "hoa"
  - "hoa-information-needed"
  - "processing"
  - "processor"
  - "questionnaire"
  - "request"
  - "semi-automated"
---

## EMT-118 HOA Information Needed

- Template name: HOA Information Needed
- Use case: Request HOA information needed for property or condo review.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: HOA information needed
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{PropertyAddress}}`, `{{RealtorName}}`, `{{LoanOfficerName}}`
- Compliance notes: Do not disclose borrower private financial details when coordinating HOA items. Include compliance line when borrower-facing.
- Follow up timing: Same day HOA information is requested.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We need HOA information to continue the property review.

This may include HOA contact information, questionnaire details, insurance, budget items, or project documents depending on the lender and property type.

Please upload any requested HOA item here:

`{{ApplicationLink}}`

If your Realtor or HOA contact has the information, reply with the best contact path.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-119
title: "Insurance Binder Reminder"
category: "Appraisal Title Insurance Templates"
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
language: "English"
priority: "High"
purpose: "Remind borrower that the insurance binder or evidence is still needed."
communication_type: "Reminder"
workflow_step: "Processing - Insurance Binder Reminder"
workflow_trigger: "Insurance Binder Reminder needed"
automation_trigger: "Insurance Binder Reminder needed"
automation_timing: "Wait 1 Day"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Insurance binder still needed"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{ProcessorName}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{PropertyAddress}}"
  - "{{ClosingDate}}"
  - "{{EmailAddress}}"
required_attachments:
[]
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "appraisal title insurance templates"
  - "borrower"
  - "closing"
  - "emt-119"
  - "hazard insurance"
  - "insurance binder"
  - "insurance binder reminder"
  - "processing"
related_templates:
  - "EMT-036"
  - "EMT-037"
  - "EMT-038"
tags:
  - "appraisal-title-insurance-templates"
  - "borrower"
  - "closing"
  - "emt-119"
  - "hazard-insurance"
  - "high"
  - "insurance-binder"
  - "insurance-binder-reminder"
  - "processing"
  - "processor"
  - "reminder"
  - "semi-automated"
---

## EMT-119 Insurance Binder Reminder

- Template name: Insurance Binder Reminder
- Use case: Remind borrower that the insurance binder or evidence is still needed.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Insurance binder still needed
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{PropertyAddress}}`, `{{ClosingDate}}`, `{{EmailAddress}}`
- Compliance notes: Do not imply closing is guaranteed. Insurance must be reviewed and accepted by lender. Include compliance line.
- Follow up timing: One business day after insurance binder request remains open.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We still need the insurance binder or policy evidence for the file.

The lender must review insurance before the file can move through final closing steps. This does not guarantee closing, but it is an important open item.

Please have the insurance information sent to us, or call `{{PhoneNumber}}` if your agent needs lender details.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
