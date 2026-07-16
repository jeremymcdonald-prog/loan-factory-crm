# Submitted To Underwriting Templates

## Table Of Contents

- [EMT-022 Loan Submitted To Underwriting](#emt-022-loan-submitted-to-underwriting)
- [EMT-023 Initial Approval Expected](#emt-023-initial-approval-expected)
- [EMT-098 Construction Loan Submitted](#emt-098-construction-loan-submitted)
- [EMT-099 One Time Close Submitted](#emt-099-one-time-close-submitted)
- [EMT-100 DSCR Submitted](#emt-100-dscr-submitted)
- [EMT-101 ITIN Submitted](#emt-101-itin-submitted)
- [EMT-102 Foreign National Submitted](#emt-102-foreign-national-submitted)
- [EMT-103 Manufactured Home Submitted](#emt-103-manufactured-home-submitted)
- [EMT-104 Renovation Loan Submitted](#emt-104-renovation-loan-submitted)
- [EMT-105 Reverse Mortgage Submitted](#emt-105-reverse-mortgage-submitted)

---
id: EMT-022
title: "Loan Submitted To Underwriting"
category: "Submitted to Underwriting Templates"
loan_stage: "Underwriting"
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
purpose: "Tell borrower file has moved to underwriting."
communication_type: "Status Update"
workflow_step: "Underwriting - Loan Submitted To Underwriting"
workflow_trigger: "File submitted to underwriting"
automation_trigger: "File submitted to underwriting"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Your loan has been submitted to underwriting"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanOfficerName}}"
  - "{{PhoneNumber}}"
  - "{{ProcessorName}}"
optional_merge_fields:
  - "{{LenderName}}"
  - "{{LoanProgram}}"
required_attachments: []
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "borrower"
  - "emt-022"
  - "loan submitted to underwriting"
  - "submitted to underwriting templates"
  - "underwriting"
related_templates:
  - "EMT-021"
  - "EMT-023"
  - "EMT-024"
tags:
  - "borrower"
  - "emt-022"
  - "fully-automated"
  - "loan-submitted-to-underwriting"
  - "medium"
  - "processor"
  - "status-update"
  - "submitted-to-underwriting-templates"
  - "underwriting"
---

## EMT-022 Loan Submitted To Underwriting

- Template name: Loan submitted to underwriting
- Use case: Tell borrower file has moved to underwriting.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Your loan has been submitted to underwriting
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{LoanOfficerName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LenderName}}`, `{{LoanProgram}}`
- Compliance notes: Submission is not approval. Include compliance line when borrower-facing.
- Follow up timing: Same day file is submitted.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Your loan file has been submitted to underwriting.

This means the file is now being reviewed by the lender. It does not mean the loan is approved yet. Underwriting may ask for conditions or updated items before the file can move forward.

`{{LoanOfficerName}}` remains involved, and I will help coordinate the processing updates from here.

We will update you when we receive the next response.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.

---
id: EMT-023
title: "Initial Approval Expected"
category: "Submitted to Underwriting Templates"
loan_stage: "Underwriting"
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
purpose: "Set expectations while waiting on first underwriting response."
communication_type: "Status Update"
workflow_step: "Underwriting - Initial Approval Expected"
workflow_trigger: "Underwriting response pending"
automation_trigger: "Underwriting response pending"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Underwriting timing update"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{PhoneNumber}}"
  - "{{ProcessorName}}"
optional_merge_fields:
  - "{{LenderName}}"
required_attachments: []
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "borrower"
  - "emt-023"
  - "initial approval expected"
  - "submitted to underwriting templates"
  - "underwriting"
related_templates:
  - "EMT-022"
  - "EMT-024"
tags:
  - "borrower"
  - "emt-023"
  - "fully-automated"
  - "initial-approval-expected"
  - "medium"
  - "processor"
  - "status-update"
  - "submitted-to-underwriting-templates"
  - "underwriting"
---

## EMT-023 Initial Approval Expected

- Template name: Initial approval expected
- Use case: Set expectations while waiting on first underwriting response.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Underwriting timing update
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LenderName}}`
- Compliance notes: Use expected timing, not guaranteed timing.
- Follow up timing: When borrower asks for status or underwriting timing changes.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Your file is still in underwriting review. We are watching for the initial response and will update you when it comes in.

Underwriting timing can change based on lender volume and file complexity, so we do not want to promise an exact response time.

We will keep you posted.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

---
id: EMT-098
title: "Construction Loan Submitted"
category: "Submitted to Underwriting Templates"
loan_stage: "Underwriting"
audience:
  - "Borrower"
loan_programs:
  - "Construction"
  - "Conventional"
  - "Jumbo"
  - "Non-QM"
language: "English"
priority: "Medium"
purpose: "Notify borrower that the construction loan submitted file was submitted to underwriting."
communication_type: "Status Update"
workflow_step: "Underwriting - Construction Loan Submitted"
workflow_trigger: "Construction Loan Submitted needed"
automation_trigger: "Construction Loan Submitted needed"
automation_timing: "Send Immediately"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Construction Loan submitted to underwriting"
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
  - "construction loan submitted"
  - "emt-098"
  - "submitted to underwriting templates"
  - "underwriting"
  - "underwriting submitted"
related_templates:
  - "EMT-091"
  - "EMT-106"
  - "EMT-113"
tags:
  - "borrower"
  - "construction-loan-submitted"
  - "emt-098"
  - "medium"
  - "processor"
  - "semi-automated"
  - "status-update"
  - "submitted-to-underwriting-templates"
  - "underwriting"
  - "underwriting-submitted"
---

## EMT-098 Construction Loan Submitted

- Template name: Construction Loan Submitted
- Use case: Notify borrower that the construction loan submitted file was submitted to underwriting.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Construction Loan submitted to underwriting
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Do not imply approval or guaranteed timing. Include compliance line when borrower-facing.
- Follow up timing: Same day the file is submitted to underwriting.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Your file has been submitted to underwriting.

This is an important step, but it is not a final approval. Builder approval, plans, specs, budget, appraisal, title, insurance, and underwriting all still matter.

We will update you when underwriting responds or if another item is needed.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-099
title: "One Time Close Submitted"
category: "Submitted to Underwriting Templates"
loan_stage: "Underwriting"
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
priority: "Medium"
purpose: "Notify borrower that the one time close submitted file was submitted to underwriting."
communication_type: "Status Update"
workflow_step: "Underwriting - One Time Close Submitted"
workflow_trigger: "One Time Close Submitted needed"
automation_trigger: "One Time Close Submitted needed"
automation_timing: "Send Immediately"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "One Time Close submitted to underwriting"
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
  - "emt-099"
  - "one time close submitted"
  - "submitted to underwriting templates"
  - "underwriting"
  - "underwriting submitted"
related_templates:
  - "EMT-092"
  - "EMT-107"
  - "EMT-121"
tags:
  - "borrower"
  - "emt-099"
  - "medium"
  - "one-time-close-submitted"
  - "processor"
  - "semi-automated"
  - "status-update"
  - "submitted-to-underwriting-templates"
  - "underwriting"
  - "underwriting-submitted"
---

## EMT-099 One Time Close Submitted

- Template name: One Time Close Submitted
- Use case: Notify borrower that the one time close submitted file was submitted to underwriting.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: One Time Close submitted to underwriting
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Do not imply approval or guaranteed timing. Include compliance line when borrower-facing.
- Follow up timing: Same day the file is submitted to underwriting.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Your file has been submitted to underwriting.

This is an important step, but it is not a final approval. Builder approval, plans, specs, budget, appraisal, title, insurance, construction review, and underwriting all still matter.

We will update you when underwriting responds or if another item is needed.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-100
title: "DSCR Submitted"
category: "Submitted to Underwriting Templates"
loan_stage: "Underwriting"
audience:
  - "Borrower"
loan_programs:
  - "DSCR"
  - "Investor"
  - "Non-QM"
language: "English"
priority: "Medium"
purpose: "Notify borrower that the dscr submitted file was submitted to underwriting."
communication_type: "Status Update"
workflow_step: "Underwriting - DSCR Submitted"
workflow_trigger: "DSCR Submitted needed"
automation_trigger: "DSCR Submitted needed"
automation_timing: "Send Immediately"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "DSCR submitted to underwriting"
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
  - "dscr submitted"
  - "emt-100"
  - "submitted to underwriting templates"
  - "underwriting"
  - "underwriting submitted"
related_templates:
  - "EMT-068"
  - "EMT-077"
  - "EMT-108"
tags:
  - "borrower"
  - "dscr-submitted"
  - "emt-100"
  - "medium"
  - "processor"
  - "semi-automated"
  - "status-update"
  - "submitted-to-underwriting-templates"
  - "underwriting"
  - "underwriting-submitted"
---

## EMT-100 DSCR Submitted

- Template name: DSCR Submitted
- Use case: Notify borrower that the dscr submitted file was submitted to underwriting.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: DSCR submitted to underwriting
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Do not imply approval or guaranteed timing. Include compliance line when borrower-facing.
- Follow up timing: Same day the file is submitted to underwriting.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Your file has been submitted to underwriting.

This is an important step, but it is not a final approval. The lender will focus on property cash flow, rental income support, credit, equity, reserves, appraisal, title, insurance, and program guidelines.

We will update you when underwriting responds or if another item is needed.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-101
title: "ITIN Submitted"
category: "Submitted to Underwriting Templates"
loan_stage: "Underwriting"
audience:
  - "Borrower"
loan_programs:
  - "ITIN"
  - "Non-QM"
language: "English"
priority: "Medium"
purpose: "Notify borrower that the itin submitted file was submitted to underwriting."
communication_type: "Status Update"
workflow_step: "Underwriting - ITIN Submitted"
workflow_trigger: "ITIN Submitted needed"
automation_trigger: "ITIN Submitted needed"
automation_timing: "Send Immediately"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "ITIN submitted to underwriting"
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
  - "emt-101"
  - "itin submitted"
  - "submitted to underwriting templates"
  - "underwriting"
  - "underwriting submitted"
related_templates:
  - "EMT-066"
  - "EMT-075"
  - "EMT-088"
tags:
  - "borrower"
  - "emt-101"
  - "itin-submitted"
  - "medium"
  - "processor"
  - "semi-automated"
  - "status-update"
  - "submitted-to-underwriting-templates"
  - "underwriting"
  - "underwriting-submitted"
---

## EMT-101 ITIN Submitted

- Template name: ITIN Submitted
- Use case: Notify borrower that the itin submitted file was submitted to underwriting.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: ITIN submitted to underwriting
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Do not imply approval or guaranteed timing. Include compliance line when borrower-facing.
- Follow up timing: Same day the file is submitted to underwriting.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Your file has been submitted to underwriting.

This is an important step, but it is not a final approval. ITIN status does not guarantee approval. The lender still reviews the full lending file and guidelines.

We will update you when underwriting responds or if another item is needed.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-102
title: "Foreign National Submitted"
category: "Submitted to Underwriting Templates"
loan_stage: "Underwriting"
audience:
  - "Borrower"
loan_programs:
  - "Foreign National"
  - "Non-QM"
language: "English"
priority: "Medium"
purpose: "Notify borrower that the foreign national submitted file was submitted to underwriting."
communication_type: "Status Update"
workflow_step: "Underwriting - Foreign National Submitted"
workflow_trigger: "Foreign National Submitted needed"
automation_trigger: "Foreign National Submitted needed"
automation_timing: "Send Immediately"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Foreign National submitted to underwriting"
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
  - "emt-102"
  - "foreign national submitted"
  - "submitted to underwriting templates"
  - "underwriting"
  - "underwriting submitted"
related_templates:
  - "EMT-067"
  - "EMT-076"
  - "EMT-089"
tags:
  - "borrower"
  - "emt-102"
  - "foreign-national-submitted"
  - "medium"
  - "processor"
  - "semi-automated"
  - "status-update"
  - "submitted-to-underwriting-templates"
  - "underwriting"
  - "underwriting-submitted"
---

## EMT-102 Foreign National Submitted

- Template name: Foreign National Submitted
- Use case: Notify borrower that the foreign national submitted file was submitted to underwriting.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Foreign National submitted to underwriting
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Do not imply approval or guaranteed timing. Include compliance line when borrower-facing.
- Follow up timing: Same day the file is submitted to underwriting.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Your file has been submitted to underwriting.

This is an important step, but it is not a final approval. Foreign national status does not guarantee approval. The lender still reviews assets, credit, property, reserves, and guidelines.

We will update you when underwriting responds or if another item is needed.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-103
title: "Manufactured Home Submitted"
category: "Submitted to Underwriting Templates"
loan_stage: "Underwriting"
audience:
  - "Borrower"
loan_programs:
  - "Manufactured Home"
  - "Conventional"
  - "FHA"
  - "VA"
  - "USDA"
language: "English"
priority: "Medium"
purpose: "Notify borrower that the manufactured home submitted file was submitted to underwriting."
communication_type: "Status Update"
workflow_step: "Underwriting - Manufactured Home Submitted"
workflow_trigger: "Manufactured Home Submitted needed"
automation_trigger: "Manufactured Home Submitted needed"
automation_timing: "Send Immediately"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Manufactured Home submitted to underwriting"
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
  - "emt-103"
  - "manufactured home submitted"
  - "submitted to underwriting templates"
  - "underwriting"
  - "underwriting submitted"
related_templates:
  - "EMT-080"
  - "EMT-093"
  - "EMT-109"
tags:
  - "borrower"
  - "emt-103"
  - "manufactured-home-submitted"
  - "medium"
  - "processor"
  - "semi-automated"
  - "status-update"
  - "submitted-to-underwriting-templates"
  - "underwriting"
  - "underwriting-submitted"
---

## EMT-103 Manufactured Home Submitted

- Template name: Manufactured Home Submitted
- Use case: Notify borrower that the manufactured home submitted file was submitted to underwriting.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Manufactured Home submitted to underwriting
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Do not imply approval or guaranteed timing. Include compliance line when borrower-facing.
- Follow up timing: Same day the file is submitted to underwriting.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Your file has been submitted to underwriting.

This is an important step, but it is not a final approval. The lender may still review title, foundation, HUD tags, data plate, engineer report, land ownership, appraisal, insurance, and guidelines.

We will update you when underwriting responds or if another item is needed.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-104
title: "Renovation Loan Submitted"
category: "Submitted to Underwriting Templates"
loan_stage: "Underwriting"
audience:
  - "Borrower"
loan_programs:
  - "Renovation"
  - "FHA 203k"
  - "Conventional Renovation"
language: "English"
priority: "Medium"
purpose: "Notify borrower that the renovation loan submitted file was submitted to underwriting."
communication_type: "Status Update"
workflow_step: "Underwriting - Renovation Loan Submitted"
workflow_trigger: "Renovation Loan Submitted needed"
automation_trigger: "Renovation Loan Submitted needed"
automation_timing: "Send Immediately"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Renovation Loan submitted to underwriting"
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
  - "emt-104"
  - "renovation loan submitted"
  - "submitted to underwriting templates"
  - "underwriting"
  - "underwriting submitted"
related_templates:
  - "EMT-081"
  - "EMT-094"
  - "EMT-110"
tags:
  - "borrower"
  - "emt-104"
  - "medium"
  - "processor"
  - "renovation-loan-submitted"
  - "semi-automated"
  - "status-update"
  - "submitted-to-underwriting-templates"
  - "underwriting"
  - "underwriting-submitted"
---

## EMT-104 Renovation Loan Submitted

- Template name: Renovation Loan Submitted
- Use case: Notify borrower that the renovation loan submitted file was submitted to underwriting.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Renovation Loan submitted to underwriting
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Do not imply approval or guaranteed timing. Include compliance line when borrower-facing.
- Follow up timing: Same day the file is submitted to underwriting.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Your file has been submitted to underwriting.

This is an important step, but it is not a final approval. Final scope, contractor approval, bid, appraisal, and lender review still determine the next step.

We will update you when underwriting responds or if another item is needed.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-105
title: "Reverse Mortgage Submitted"
category: "Submitted to Underwriting Templates"
loan_stage: "Underwriting"
audience:
  - "Borrower"
loan_programs:
  - "Reverse Mortgage"
  - "HECM"
language: "English"
priority: "Medium"
purpose: "Notify borrower that the reverse mortgage submitted file was submitted to underwriting."
communication_type: "Status Update"
workflow_step: "Underwriting - Reverse Mortgage Submitted"
workflow_trigger: "Reverse Mortgage Submitted needed"
automation_trigger: "Reverse Mortgage Submitted needed"
automation_timing: "Send Immediately"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Reverse Mortgage submitted to underwriting"
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
  - "emt-105"
  - "reverse mortgage submitted"
  - "submitted to underwriting templates"
  - "underwriting"
  - "underwriting submitted"
related_templates:
  - "EMT-069"
  - "EMT-095"
  - "EMT-111"
tags:
  - "borrower"
  - "emt-105"
  - "medium"
  - "processor"
  - "reverse-mortgage-submitted"
  - "semi-automated"
  - "status-update"
  - "submitted-to-underwriting-templates"
  - "underwriting"
  - "underwriting-submitted"
---

## EMT-105 Reverse Mortgage Submitted

- Template name: Reverse Mortgage Submitted
- Use case: Notify borrower that the reverse mortgage submitted file was submitted to underwriting.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Reverse Mortgage submitted to underwriting
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Do not imply approval or guaranteed timing. Include compliance line when borrower-facing.
- Follow up timing: Same day the file is submitted to underwriting.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Your file has been submitted to underwriting.

This is an important step, but it is not a final approval. Required counseling, property review, title, appraisal, insurance, and lender guidelines still apply.

We will update you when underwriting responds or if another item is needed.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
