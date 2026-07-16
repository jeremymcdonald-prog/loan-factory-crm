# Conditional Approval Templates

## Table Of Contents

- [EMT-024 Conditional Approval Received](#emt-024-conditional-approval-received)
- [EMT-025 Clean Approval Update](#emt-025-clean-approval-update)
- [EMT-026 Conditions Request To Borrower](#emt-026-conditions-request-to-borrower)
- [EMT-027 Conditions Request To Realtor](#emt-027-conditions-request-to-realtor)
- [EMT-106 Construction Loan Conditional Approval](#emt-106-construction-loan-conditional-approval)
- [EMT-107 One Time Close Conditional Approval](#emt-107-one-time-close-conditional-approval)
- [EMT-108 DSCR Conditional Approval](#emt-108-dscr-conditional-approval)
- [EMT-109 Manufactured Home Conditional Approval](#emt-109-manufactured-home-conditional-approval)
- [EMT-110 Renovation Loan Conditional Approval](#emt-110-renovation-loan-conditional-approval)
- [EMT-111 Reverse Mortgage Conditional Approval](#emt-111-reverse-mortgage-conditional-approval)
- [EMT-112 Credit Rescore Required](#emt-112-credit-rescore-required)

---
id: EMT-024
title: "Conditional Approval Received"
category: "Conditional Approval Templates"
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
purpose: "Tell borrower underwriting issued conditions."
communication_type: "Status Update"
workflow_step: "Conditions - Conditional Approval Received"
workflow_trigger: "Conditional approval received"
automation_trigger: "Conditional approval received"
automation_timing: "Send Immediately"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Conditional approval received"
required_merge_fields:
  - "{{ApplicationLink}}"
  - "{{BorrowerName}}"
  - "{{PhoneNumber}}"
  - "{{ProcessorName}}"
optional_merge_fields:
  - "{{LenderName}}"
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
  - "conditional approval received"
  - "conditional approval templates"
  - "conditions"
  - "emt-024"
related_templates:
  - "EMT-023"
  - "EMT-025"
  - "EMT-026"
  - "EMT-027"
tags:
  - "borrower"
  - "conditional-approval-received"
  - "conditional-approval-templates"
  - "conditions"
  - "emt-024"
  - "medium"
  - "processor"
  - "semi-automated"
  - "status-update"
---

## EMT-024 Conditional Approval Received

- Template name: Conditional approval received
- Use case: Tell borrower underwriting issued conditions.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Conditional approval received
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanOfficerName}}`, `{{LenderName}}`
- Compliance notes: Conditional approval is not final approval. Include compliance line.
- Follow up timing: Same day conditional approval is received.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We received conditional approval from underwriting. That is a good step forward, but it is not final approval yet.

There are still items that must be reviewed and cleared. Please check the secure portal for anything assigned to you:

`{{ApplicationLink}}`

We will keep working through the conditions and update you as the file moves.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.

---
id: EMT-025
title: "Clean Approval Update"
category: "Conditional Approval Templates"
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
purpose: "Tell borrower major underwriting conditions are cleared while avoiding final closing promises."
communication_type: "Status Update"
workflow_step: "Conditions - Clean Approval Update"
workflow_trigger: "Major conditions cleared"
automation_trigger: "Major conditions cleared"
automation_timing: "Send Immediately"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "File review update"
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
  - "clean approval update"
  - "conditional approval templates"
  - "conditions"
  - "emt-025"
related_templates:
  - "EMT-024"
  - "EMT-026"
tags:
  - "borrower"
  - "clean-approval-update"
  - "conditional-approval-templates"
  - "conditions"
  - "emt-025"
  - "medium"
  - "processor"
  - "semi-automated"
  - "status-update"
---

## EMT-025 Clean Approval Update

- Template name: Clean approval update
- Use case: Tell borrower major underwriting conditions are cleared while avoiding final closing promises.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: File review update
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{ClosingDate}}`
- Compliance notes: Do not say final approval, clear to close, or closing is guaranteed unless lender has issued it.
- Follow up timing: Same day clean approval or major condition clearance is confirmed.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Good update: the major underwriting items we were tracking have been cleared.

We are still watching the remaining closing-related steps and will let you know when the lender issues the next milestone.

Please do not make major financial changes before closing.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

---
id: EMT-026
title: "Conditions Request To Borrower"
category: "Conditional Approval Templates"
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
priority: "High"
purpose: "Request borrower-owned underwriting conditions."
communication_type: "Request"
workflow_step: "Conditions - Conditions Request To Borrower"
workflow_trigger: "Borrower condition assigned"
automation_trigger: "Borrower condition assigned"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Conditions needed for underwriting"
required_merge_fields:
  - "{{ApplicationLink}}"
  - "{{BorrowerName}}"
  - "{{PhoneNumber}}"
  - "{{ProcessorName}}"
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
  - "borrower"
  - "conditional approval templates"
  - "conditions"
  - "conditions request to borrower"
  - "emt-026"
related_templates:
  - "EMT-025"
  - "EMT-027"
  - "EMT-024"
  - "EMT-054"
tags:
  - "borrower"
  - "conditional-approval-templates"
  - "conditions"
  - "conditions-request-to-borrower"
  - "emt-026"
  - "fully-automated"
  - "high"
  - "processor"
  - "request"
---

## EMT-026 Conditions Request To Borrower

- Template name: Conditions request to borrower
- Use case: Request borrower-owned underwriting conditions.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Conditions needed for underwriting
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanOfficerName}}`
- Compliance notes: Keep request factual. Do not imply conditions are optional.
- Follow up timing: Same day conditions are assigned.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Underwriting needs a few items before the file can continue.

Please log in and complete the requested items here:

`{{ApplicationLink}}`

If something does not make sense, call us at `{{PhoneNumber}}` before uploading the wrong item.

Thank you,  
`{{ProcessorName}}`

---
id: EMT-027
title: "Conditions Request To Realtor"
category: "Conditional Approval Templates"
loan_stage: "Conditions"
audience:
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
priority: "High"
purpose: "Ask Realtor for property or transaction-related help without sharing private borrower data."
communication_type: "Request"
workflow_step: "Conditions - Conditions Request To Realtor"
workflow_trigger: "Realtor or transaction condition assigned"
automation_trigger: "Realtor or transaction condition assigned"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Item needed for {{PropertyAddress}}"
required_merge_fields:
  - "{{PhoneNumber}}"
  - "{{ProcessorName}}"
  - "{{PropertyAddress}}"
  - "{{RealtorName}}"
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
  - "conditional approval templates"
  - "conditions"
  - "conditions request to realtor"
  - "emt-027"
  - "realtor"
related_templates:
  - "EMT-026"
  - "EMT-028"
tags:
  - "conditional-approval-templates"
  - "conditions"
  - "conditions-request-to-realtor"
  - "emt-027"
  - "fully-automated"
  - "high"
  - "processor"
  - "realtor"
  - "request"
---

## EMT-027 Conditions Request To Realtor

- Template name: Conditions request to Realtor
- Use case: Ask Realtor for property or transaction-related help without sharing private borrower data.
- Audience: Realtor
- Recommended sender: Processor
- Subject line: Item needed for `{{PropertyAddress}}`
- Required placeholders: `{{RealtorName}}`, `{{PropertyAddress}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{ClosingDate}}`
- Compliance notes: Do not disclose private borrower credit, income, assets, or underwriting details.
- Follow up timing: Same day Realtor-owned item is identified.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{RealtorName}}`,

We need help with a transaction-related item for `{{PropertyAddress}}`.

I am keeping this high level to protect borrower privacy. Please call or reply when you have a moment, and I can explain what is needed within the appropriate limits.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`


---
id: EMT-106
title: "Construction Loan Conditional Approval"
category: "Conditional Approval Templates"
loan_stage: "Conditions"
audience:
  - "Borrower"
loan_programs:
  - "Construction"
  - "Conventional"
  - "Jumbo"
  - "Non-QM"
language: "English"
priority: "High"
purpose: "Explain conditional approval for construction loan conditional approval without implying final approval."
communication_type: "Status Update"
workflow_step: "Conditions - Construction Loan Conditional Approval"
workflow_trigger: "Construction Loan Conditional Approval needed"
automation_trigger: "Construction Loan Conditional Approval needed"
automation_timing: "Send Immediately"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Construction Loan Conditional Approval"
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
  - "borrower"
  - "conditional approval"
  - "conditional approval templates"
  - "conditions"
  - "construction loan conditional approval"
  - "emt-106"
related_templates:
  - "EMT-098"
  - "EMT-078"
  - "EMT-113"
tags:
  - "borrower"
  - "conditional-approval"
  - "conditional-approval-templates"
  - "conditions"
  - "construction-loan-conditional-approval"
  - "emt-106"
  - "high"
  - "processor"
  - "semi-automated"
  - "status-update"
---

## EMT-106 Construction Loan Conditional Approval

- Template name: Construction Loan Conditional Approval
- Use case: Explain conditional approval for construction loan conditional approval without implying final approval.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Construction Loan Conditional Approval
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Conditional approval is not final approval. Do not promise closing, approval, rate, payment, or timing. Include compliance line.
- Follow up timing: Same day conditional approval is received.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We received a conditional approval on your file.

Conditional approval means underwriting has reviewed the file and listed items that still need to be completed or cleared. It is not final approval.

Construction conditions may involve borrower documents, builder approval, plans, specs, budget, appraisal, title, insurance, or lender review.

We will send or update the specific condition request in the portal if anything is needed from you.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-107
title: "One Time Close Conditional Approval"
category: "Conditional Approval Templates"
loan_stage: "Conditions"
audience:
  - "Borrower"
loan_programs:
  - "One Time Close Construction"
  - "Construction"
  - "FHA"
  - "VA"
  - "USDA"
  - "Conventional"
language: "English"
priority: "High"
purpose: "Explain conditional approval for one time close conditional approval without implying final approval."
communication_type: "Status Update"
workflow_step: "Conditions - One Time Close Conditional Approval"
workflow_trigger: "One Time Close Conditional Approval needed"
automation_trigger: "One Time Close Conditional Approval needed"
automation_timing: "Send Immediately"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "One Time Close Conditional Approval"
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
  - "borrower"
  - "conditional approval"
  - "conditional approval templates"
  - "conditions"
  - "emt-107"
  - "one time close conditional approval"
related_templates:
  - "EMT-099"
  - "EMT-079"
  - "EMT-121"
tags:
  - "borrower"
  - "conditional-approval"
  - "conditional-approval-templates"
  - "conditions"
  - "emt-107"
  - "high"
  - "one-time-close-conditional-approval"
  - "processor"
  - "semi-automated"
  - "status-update"
---

## EMT-107 One Time Close Conditional Approval

- Template name: One Time Close Conditional Approval
- Use case: Explain conditional approval for one time close conditional approval without implying final approval.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: One Time Close Conditional Approval
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Conditional approval is not final approval. Do not promise closing, approval, rate, payment, or timing. Include compliance line.
- Follow up timing: Same day conditional approval is received.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We received a conditional approval on your file.

Conditional approval means underwriting has reviewed the file and listed items that still need to be completed or cleared. It is not final approval.

One Time Close conditions may involve borrower documents, builder approval, plans, specs, budget, appraisal, title, insurance, and construction review.

We will send or update the specific condition request in the portal if anything is needed from you.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-108
title: "DSCR Conditional Approval"
category: "Conditional Approval Templates"
loan_stage: "Conditions"
audience:
  - "Borrower"
loan_programs:
  - "DSCR"
  - "Investor"
  - "Non-QM"
language: "English"
priority: "High"
purpose: "Explain conditional approval for dscr conditional approval without implying final approval."
communication_type: "Status Update"
workflow_step: "Conditions - DSCR Conditional Approval"
workflow_trigger: "DSCR Conditional Approval needed"
automation_trigger: "DSCR Conditional Approval needed"
automation_timing: "Send Immediately"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "DSCR Conditional Approval"
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
  - "borrower"
  - "conditional approval"
  - "conditional approval templates"
  - "conditions"
  - "dscr conditional approval"
  - "emt-108"
related_templates:
  - "EMT-100"
  - "EMT-077"
  - "EMT-133"
tags:
  - "borrower"
  - "conditional-approval"
  - "conditional-approval-templates"
  - "conditions"
  - "dscr-conditional-approval"
  - "emt-108"
  - "high"
  - "processor"
  - "semi-automated"
  - "status-update"
---

## EMT-108 DSCR Conditional Approval

- Template name: DSCR Conditional Approval
- Use case: Explain conditional approval for dscr conditional approval without implying final approval.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: DSCR Conditional Approval
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Conditional approval is not final approval. Do not promise closing, approval, rate, payment, or timing. Include compliance line.
- Follow up timing: Same day conditional approval is received.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We received a conditional approval on your file.

Conditional approval means underwriting has reviewed the file and listed items that still need to be completed or cleared. It is not final approval.

DSCR conditions may involve rental income support, property cash flow, reserves, appraisal, title, insurance, or lender review.

We will send or update the specific condition request in the portal if anything is needed from you.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-109
title: "Manufactured Home Conditional Approval"
category: "Conditional Approval Templates"
loan_stage: "Conditions"
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
purpose: "Explain conditional approval for manufactured home conditional approval without implying final approval."
communication_type: "Status Update"
workflow_step: "Conditions - Manufactured Home Conditional Approval"
workflow_trigger: "Manufactured Home Conditional Approval needed"
automation_trigger: "Manufactured Home Conditional Approval needed"
automation_timing: "Send Immediately"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Manufactured Home Conditional Approval"
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
  - "borrower"
  - "conditional approval"
  - "conditional approval templates"
  - "conditions"
  - "emt-109"
  - "manufactured home conditional approval"
related_templates:
  - "EMT-103"
  - "EMT-080"
  - "EMT-115"
tags:
  - "borrower"
  - "conditional-approval"
  - "conditional-approval-templates"
  - "conditions"
  - "emt-109"
  - "high"
  - "manufactured-home-conditional-approval"
  - "processor"
  - "semi-automated"
  - "status-update"
---

## EMT-109 Manufactured Home Conditional Approval

- Template name: Manufactured Home Conditional Approval
- Use case: Explain conditional approval for manufactured home conditional approval without implying final approval.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Manufactured Home Conditional Approval
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Conditional approval is not final approval. Do not promise closing, approval, rate, payment, or timing. Include compliance line.
- Follow up timing: Same day conditional approval is received.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We received a conditional approval on your file.

Conditional approval means underwriting has reviewed the file and listed items that still need to be completed or cleared. It is not final approval.

Manufactured home conditions may involve title, foundation, HUD tags, data plate, engineer report, land ownership, appraisal, insurance, or lender requirements.

We will send or update the specific condition request in the portal if anything is needed from you.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-110
title: "Renovation Loan Conditional Approval"
category: "Conditional Approval Templates"
loan_stage: "Conditions"
audience:
  - "Borrower"
loan_programs:
  - "Renovation"
  - "FHA 203k"
  - "Conventional Renovation"
language: "English"
priority: "High"
purpose: "Explain conditional approval for renovation loan conditional approval without implying final approval."
communication_type: "Status Update"
workflow_step: "Conditions - Renovation Loan Conditional Approval"
workflow_trigger: "Renovation Loan Conditional Approval needed"
automation_trigger: "Renovation Loan Conditional Approval needed"
automation_timing: "Send Immediately"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Renovation Loan Conditional Approval"
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
  - "borrower"
  - "conditional approval"
  - "conditional approval templates"
  - "conditions"
  - "emt-110"
  - "renovation loan conditional approval"
related_templates:
  - "EMT-104"
  - "EMT-081"
  - "EMT-114"
tags:
  - "borrower"
  - "conditional-approval"
  - "conditional-approval-templates"
  - "conditions"
  - "emt-110"
  - "high"
  - "processor"
  - "renovation-loan-conditional-approval"
  - "semi-automated"
  - "status-update"
---

## EMT-110 Renovation Loan Conditional Approval

- Template name: Renovation Loan Conditional Approval
- Use case: Explain conditional approval for renovation loan conditional approval without implying final approval.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Renovation Loan Conditional Approval
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Conditional approval is not final approval. Do not promise closing, approval, rate, payment, or timing. Include compliance line.
- Follow up timing: Same day conditional approval is received.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We received a conditional approval on your file.

Conditional approval means underwriting has reviewed the file and listed items that still need to be completed or cleared. It is not final approval.

Renovation conditions may involve final scope, contractor approval, bid, appraisal, permits, property review, or lender requirements.

We will send or update the specific condition request in the portal if anything is needed from you.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-111
title: "Reverse Mortgage Conditional Approval"
category: "Conditional Approval Templates"
loan_stage: "Conditions"
audience:
  - "Borrower"
loan_programs:
  - "Reverse Mortgage"
  - "HECM"
language: "English"
priority: "High"
purpose: "Explain conditional approval for reverse mortgage conditional approval without implying final approval."
communication_type: "Status Update"
workflow_step: "Conditions - Reverse Mortgage Conditional Approval"
workflow_trigger: "Reverse Mortgage Conditional Approval needed"
automation_trigger: "Reverse Mortgage Conditional Approval needed"
automation_timing: "Send Immediately"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Reverse Mortgage Conditional Approval"
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
  - "borrower"
  - "conditional approval"
  - "conditional approval templates"
  - "conditions"
  - "emt-111"
  - "reverse mortgage conditional approval"
related_templates:
  - "EMT-105"
  - "EMT-095"
  - "EMT-122"
tags:
  - "borrower"
  - "conditional-approval"
  - "conditional-approval-templates"
  - "conditions"
  - "emt-111"
  - "high"
  - "processor"
  - "reverse-mortgage-conditional-approval"
  - "semi-automated"
  - "status-update"
---

## EMT-111 Reverse Mortgage Conditional Approval

- Template name: Reverse Mortgage Conditional Approval
- Use case: Explain conditional approval for reverse mortgage conditional approval without implying final approval.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Reverse Mortgage Conditional Approval
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Conditional approval is not final approval. Do not promise closing, approval, rate, payment, or timing. Include compliance line.
- Follow up timing: Same day conditional approval is received.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We received a conditional approval on your file.

Conditional approval means underwriting has reviewed the file and listed items that still need to be completed or cleared. It is not final approval.

Reverse mortgage conditions may involve counseling documentation, property review, title, appraisal, insurance, payoff details, or lender requirements.

We will send or update the specific condition request in the portal if anything is needed from you.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-112
title: "Credit Rescore Required"
category: "Conditional Approval Templates"
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
language: "English"
priority: "High"
purpose: "Explain that a credit rescore is needed or being reviewed without promising results."
communication_type: "Request"
workflow_step: "Conditions - Credit Rescore Required"
workflow_trigger: "Credit Rescore Required needed"
automation_trigger: "Credit Rescore Required needed"
automation_timing: "Manual Only"
automation_ready: "Manual Only"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Credit rescore review needed"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{ProcessorName}}"
  - "{{ApplicationLink}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{LoanOfficerName}}"
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
  - "borrower"
  - "conditional approval templates"
  - "conditions"
  - "credit rescore"
  - "credit rescore required"
  - "credit score"
  - "emt-112"
related_templates:
  - "EMT-083"
  - "EMT-009"
  - "EMT-026"
tags:
  - "borrower"
  - "conditional-approval-templates"
  - "conditions"
  - "credit-rescore"
  - "credit-rescore-required"
  - "credit-score"
  - "emt-112"
  - "high"
  - "manual-only"
  - "processor"
  - "request"
---

## EMT-112 Credit Rescore Required

- Template name: Credit Rescore Required
- Use case: Explain that a credit rescore is needed or being reviewed without promising results.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Credit rescore review needed
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanOfficerName}}`, `{{LoanProgram}}`
- Compliance notes: Do not guarantee score increases. Explain results depend on bureau update and credit model. Include compliance line.
- Follow up timing: When underwriting or pricing review requires a rescore attempt.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

A credit rescore review is needed before we can confirm the next step.

A rescore does not guarantee a score increase. Results depend on the creditor update, credit bureau processing, the credit model, and lender review.

Please upload the requested documentation here:

`{{ApplicationLink}}`

If you have questions before uploading anything, call us at `{{PhoneNumber}}`.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
