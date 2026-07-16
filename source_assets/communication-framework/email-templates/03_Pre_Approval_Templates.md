# Pre Approval Templates

## Table Of Contents

- [EMT-006 Pre Approval Next Steps](#emt-006-pre-approval-next-steps)
- [EMT-007 Pre Approval Issued](#emt-007-pre-approval-issued)
- [EMT-008 Pre Approval Update To Realtor](#emt-008-pre-approval-update-to-realtor)
- [EMT-009 Credit Prescreen Complete](#emt-009-credit-prescreen-complete)
- [EMT-066 ITIN Borrower Pre Approval Introduction](#emt-066-itin-borrower-pre-approval-introduction)
- [EMT-067 Foreign National Pre Approval Introduction](#emt-067-foreign-national-pre-approval-introduction)
- [EMT-068 DSCR Investor Pre Approval](#emt-068-dscr-investor-pre-approval)
- [EMT-069 Reverse Mortgage Consultation Invitation](#emt-069-reverse-mortgage-consultation-invitation)
- [EMT-070 Asset Depletion Loan](#emt-070-asset-depletion-loan)
- [EMT-071 Bank Statement Loan](#emt-071-bank-statement-loan)
- [EMT-072 Jumbo Loan](#emt-072-jumbo-loan)
- [EMT-073 VA IRRRL](#emt-073-va-irrrl)
- [EMT-074 FHA Streamline](#emt-074-fha-streamline)

---
id: EMT-006
title: "Pre Approval Next Steps"
category: "Pre Approval Templates"
loan_stage: "Application"
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
purpose: "Explain what the borrower needs to complete before review."
communication_type: "Status Update"
workflow_step: "Application - Pre Approval Next Steps"
workflow_trigger: "Application ready for pre-approval review"
automation_trigger: "Application ready for pre-approval review"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Next steps for pre-approval"
required_merge_fields:
  - "{{ApplicationLink}}"
  - "{{BorrowerName}}"
  - "{{LoanOfficerName}}"
  - "{{NMLS}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{LoanProgram}}"
required_attachments: []
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "application"
  - "borrower"
  - "emt-006"
  - "pre approval"
  - "pre approval next steps"
  - "pre approval templates"
related_templates:
  - "EMT-005"
  - "EMT-007"
  - "EMT-010"
tags:
  - "application"
  - "borrower"
  - "emt-006"
  - "fully-automated"
  - "loan-officer"
  - "medium"
  - "pre-approval"
  - "pre-approval-next-steps"
  - "status-update"
---

## EMT-006 Pre Approval Next Steps

- Template name: Pre approval next steps
- Use case: Explain what the borrower needs to complete before review.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: Next steps for pre-approval
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Say review, not approval, until file is evaluated. Include compliance line.
- Follow up timing: Same day after first conversation.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

The next step is to complete the application and upload the basic items requested in the portal.

Start here:

`{{ApplicationLink}}`

Once I review everything, I will tell you what looks workable, what still needs attention, and what we need before anything can be treated as a real pre-approval.

Call or text me at `{{PhoneNumber}}` if you get stuck.

`{{LoanOfficerName}}`  
NMLS `{{NMLS}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.

---
id: EMT-007
title: "Pre Approval Issued"
category: "Pre Approval Templates"
loan_stage: "Application"
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
purpose: "Send borrower a pre-approval update after review."
communication_type: "Status Update"
workflow_step: "Application - Pre Approval Issued"
workflow_trigger: "Pre-approval letter marked ready"
automation_trigger: "Pre-approval letter marked ready"
automation_timing: "Send Immediately"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Your pre-approval is ready"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanOfficerName}}"
  - "{{LoanProgram}}"
  - "{{NMLS}}"
  - "{{PhoneNumber}}"
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
  - "application"
  - "borrower"
  - "emt-007"
  - "pre approval"
  - "pre approval issued"
  - "pre approval templates"
related_templates:
  - "EMT-006"
  - "EMT-008"
  - "EMT-024"
tags:
  - "application"
  - "borrower"
  - "emt-007"
  - "loan-officer"
  - "medium"
  - "pre-approval"
  - "pre-approval-issued"
  - "semi-automated"
  - "status-update"
---

## EMT-007 Pre Approval Issued

- Template name: Pre approval issued
- Use case: Send borrower a pre-approval update after review.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: Your pre-approval is ready
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{LoanProgram}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{RealtorName}}`
- Compliance notes: Pre-approval remains subject to underwriting, appraisal, title, insurance, and lender review. Include compliance line.
- Follow up timing: Immediately after pre-approval letter is ready.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Your pre-approval is ready based on the information reviewed so far for `{{LoanProgram}}`.

Please remember this is not a final loan approval. Final approval is still subject to underwriting, appraisal, title, insurance, program guidelines, and lender review.

Your next step is to stay close to your Realtor and let me know before making any major financial changes.

`{{LoanOfficerName}}`  
`{{PhoneNumber}}`  
NMLS `{{NMLS}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.

---
id: EMT-008
title: "Pre Approval Update To Realtor"
category: "Pre Approval Templates"
loan_stage: "Referral"
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
priority: "Low"
purpose: "Let a Realtor know the buyer has a reviewed pre-approval."
communication_type: "Status Update"
workflow_step: "Referral - Pre Approval Update To Realtor"
workflow_trigger: "Referral workflow trigger"
automation_trigger: "Referral workflow trigger"
automation_timing: "Send Immediately"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Pre-approval update for {{BorrowerName}}"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanOfficerName}}"
  - "{{PhoneNumber}}"
  - "{{RealtorName}}"
optional_merge_fields:
  - "{{LoanProgram}}"
  - "{{PropertyAddress}}"
required_attachments: []
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "emt-008"
  - "pre approval"
  - "pre approval templates"
  - "pre approval update to realtor"
  - "realtor"
  - "referral"
related_templates:
  - "EMT-007"
  - "EMT-009"
  - "EMT-027"
tags:
  - "emt-008"
  - "loan-officer"
  - "low"
  - "pre-approval"
  - "pre-approval-templates"
  - "pre-approval-update-to-realtor"
  - "realtor"
  - "referral"
  - "semi-automated"
  - "status-update"
---

## EMT-008 Pre Approval Update To Realtor

- Template name: Pre approval update to Realtor
- Use case: Let a Realtor know the buyer has a reviewed pre-approval.
- Audience: Realtor
- Recommended sender: Loan Officer
- Subject line: Pre-approval update for `{{BorrowerName}}`
- Required placeholders: `{{RealtorName}}`, `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`, `{{PropertyAddress}}`
- Compliance notes: Share only appropriate status. Do not disclose private borrower financial details.
- Follow up timing: After borrower authorizes Realtor update or status can be shared.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{RealtorName}}`,

`{{BorrowerName}}` has been reviewed for pre-approval based on the information currently available.

As always, this is subject to final underwriting, appraisal, title, insurance, and lender review. I will keep the file moving and let you know if anything needs attention.

Call or text me at `{{PhoneNumber}}` if you need to talk through offer timing.

`{{LoanOfficerName}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.

---
id: EMT-009
title: "Credit Prescreen Complete"
category: "Pre Approval Templates"
loan_stage: "Application"
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
purpose: "Let borrower know the credit prescreen step is done and next review continues."
communication_type: "Status Update"
workflow_step: "Application - Credit Prescreen Complete"
workflow_trigger: "Credit prescreen completed"
automation_trigger: "Credit prescreen completed"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Credit prescreen complete"
required_merge_fields:
  - "{{ApplicationLink}}"
  - "{{BorrowerName}}"
  - "{{LoanOfficerName}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{LoanProgram}}"
required_attachments: []
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "application"
  - "borrower"
  - "credit prescreen complete"
  - "emt-009"
  - "pre approval"
  - "pre approval templates"
related_templates:
  - "EMT-008"
  - "EMT-010"
tags:
  - "application"
  - "borrower"
  - "credit-prescreen-complete"
  - "emt-009"
  - "fully-automated"
  - "loan-officer"
  - "medium"
  - "pre-approval"
  - "status-update"
---

## EMT-009 Credit Prescreen Complete

- Template name: Credit prescreen complete
- Use case: Let borrower know the credit prescreen step is done and next review continues.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: Credit prescreen complete
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Do not imply approval from a prescreen. Include compliance line.
- Follow up timing: Same day after prescreen is completed.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

The credit prescreen step is complete. That does not mean the loan is approved, but it does help us understand the next review path.

Please finish any remaining items in the portal:

`{{ApplicationLink}}`

Once the file is more complete, I will update you on the next step.

`{{LoanOfficerName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.


---
id: EMT-066
title: "ITIN Borrower Pre Approval Introduction"
category: "Pre Approval Templates"
loan_stage: "Application"
audience:
  - "Borrower"
loan_programs:
  - "ITIN"
  - "Non-QM"
language: "English"
priority: "High"
purpose: "Introduce the ITIN pre-approval path and set document expectations without implying eligibility."
communication_type: "Introduction"
workflow_step: "Application - ITIN Borrower Pre Approval Introduction"
workflow_trigger: "ITIN Borrower Pre Approval Introduction needed"
automation_trigger: "ITIN Borrower Pre Approval Introduction needed"
automation_timing: "Manual Only"
automation_ready: "Manual Only"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "ITIN pre-approval next steps"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanOfficerName}}"
  - "{{ApplicationLink}}"
  - "{{PhoneNumber}}"
  - "{{NMLS}}"
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
  - "application"
  - "borrower"
  - "emt-066"
  - "itin"
  - "itin borrower pre approval introduction"
  - "non qm"
  - "pre approval templates"
  - "tax id"
related_templates:
  - "EMT-006"
  - "EMT-075"
  - "EMT-088"
tags:
  - "application"
  - "borrower"
  - "emt-066"
  - "high"
  - "introduction"
  - "itin"
  - "itin-borrower-pre-approval-introduction"
  - "loan-officer"
  - "manual-only"
  - "non-qm"
  - "pre-approval-templates"
  - "tax-id"
---

## EMT-066 ITIN Borrower Pre Approval Introduction

- Template name: ITIN Borrower Pre Approval Introduction
- Use case: Introduce the ITIN pre-approval path and set document expectations without implying eligibility.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: ITIN pre-approval next steps
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Do not imply citizenship, residency status, or ITIN status guarantees approval. Keep requests focused on lending requirements. Include compliance line.
- Follow up timing: After borrower asks about ITIN financing or an ITIN path is identified.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

I can help you review whether an ITIN loan path may be available. As your broker, I will look at available lender options and explain what each one requires.

This is only a review path. Approval still depends on credit, income, assets, property, lender guidelines, and the complete file.

Your next step is to complete the application and upload the items requested in the portal:

`{{ApplicationLink}}`

Please do not send immigration details that are not requested for the loan review. We will keep the request focused on lending documentation.

`{{LoanOfficerName}}`  
NMLS `{{NMLS}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-067
title: "Foreign National Pre Approval Introduction"
category: "Pre Approval Templates"
loan_stage: "Application"
audience:
  - "Borrower"
loan_programs:
  - "Foreign National"
  - "Non-QM"
language: "English"
priority: "High"
purpose: "Introduce the foreign national loan review path and explain that lender requirements drive next steps."
communication_type: "Introduction"
workflow_step: "Application - Foreign National Pre Approval Introduction"
workflow_trigger: "Foreign National Pre Approval Introduction needed"
automation_trigger: "Foreign National Pre Approval Introduction needed"
automation_timing: "Manual Only"
automation_ready: "Manual Only"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Foreign national loan review next steps"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanOfficerName}}"
  - "{{ApplicationLink}}"
  - "{{PhoneNumber}}"
  - "{{NMLS}}"
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
  - "application"
  - "borrower"
  - "emt-067"
  - "foreign national"
  - "foreign national pre approval introduction"
  - "international borrower"
  - "non qm"
  - "pre approval templates"
related_templates:
  - "EMT-006"
  - "EMT-076"
  - "EMT-089"
tags:
  - "application"
  - "borrower"
  - "emt-067"
  - "foreign-national"
  - "foreign-national-pre-approval-introduction"
  - "high"
  - "international-borrower"
  - "introduction"
  - "loan-officer"
  - "manual-only"
  - "non-qm"
  - "pre-approval-templates"
---

## EMT-067 Foreign National Pre Approval Introduction

- Template name: Foreign National Pre Approval Introduction
- Use case: Introduce the foreign national loan review path and explain that lender requirements drive next steps.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: Foreign national loan review next steps
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Do not imply citizenship, residency, visa type, or foreign national status guarantees approval. Request only lending-related documentation. Include compliance line.
- Follow up timing: After borrower asks about a foreign national loan option.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

I can help review whether a foreign national loan option may fit the file. As your broker, I will compare available lender requirements and explain the clearest next step.

This review does not guarantee approval. Lenders will still review credit, assets, income or alternative documentation, property details, reserves, and program guidelines.

Please start with the application and upload only the lending documents requested in the portal:

`{{ApplicationLink}}`

If a requested item is unclear, call or text me before sending extra personal documents that may not be needed.

`{{LoanOfficerName}}`  
NMLS `{{NMLS}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-068
title: "DSCR Investor Pre Approval"
category: "Pre Approval Templates"
loan_stage: "Application"
audience:
  - "Borrower"
loan_programs:
  - "DSCR"
  - "Investor"
  - "Non-QM"
language: "English"
priority: "High"
purpose: "Explain DSCR investor loan review and the property cash-flow focus."
communication_type: "Introduction"
workflow_step: "Application - DSCR Investor Pre Approval"
workflow_trigger: "DSCR Investor Pre Approval needed"
automation_trigger: "DSCR Investor Pre Approval needed"
automation_timing: "Manual Only"
automation_ready: "Manual Only"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "DSCR investor loan review"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanOfficerName}}"
  - "{{ApplicationLink}}"
  - "{{PhoneNumber}}"
  - "{{NMLS}}"
optional_merge_fields:
  - "{{PropertyAddress}}"
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
  - "application"
  - "borrower"
  - "cash flow"
  - "dscr"
  - "dscr investor pre approval"
  - "emt-068"
  - "investor"
  - "pre approval templates"
  - "rental income"
related_templates:
  - "EMT-006"
  - "EMT-077"
  - "EMT-100"
  - "EMT-133"
tags:
  - "application"
  - "borrower"
  - "cash-flow"
  - "dscr"
  - "dscr-investor-pre-approval"
  - "emt-068"
  - "high"
  - "introduction"
  - "investor"
  - "loan-officer"
  - "manual-only"
  - "pre-approval-templates"
  - "rental-income"
---

## EMT-068 DSCR Investor Pre Approval

- Template name: DSCR Investor Pre Approval
- Use case: Explain DSCR investor loan review and the property cash-flow focus.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: DSCR investor loan review
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{PropertyAddress}}`, `{{LoanProgram}}`
- Compliance notes: Make clear DSCR qualification is primarily based on property cash flow, rental income, credit, equity, reserves, and lender guidelines. Include compliance line.
- Follow up timing: When borrower is considering an investment property or DSCR option.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

For a DSCR investor loan, the review is primarily about the property, expected rental income, credit, equity, reserves, and lender guidelines.

This is different from a standard full-income loan, but it is still not automatic. The property numbers, appraisal, rental analysis, title, insurance, and full lender review all matter.

Please complete the application and upload the requested items here:

`{{ApplicationLink}}`

Once I have the basics, I can help you understand whether the file looks worth pursuing and what may need attention.

`{{LoanOfficerName}}`  
NMLS `{{NMLS}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-069
title: "Reverse Mortgage Consultation Invitation"
category: "Pre Approval Templates"
loan_stage: "Application"
audience:
  - "Borrower"
loan_programs:
  - "Reverse Mortgage"
  - "HECM"
language: "English"
priority: "High"
purpose: "Invite borrower to a reverse mortgage conversation without pressure or suitability claims."
communication_type: "Introduction"
workflow_step: "Application - Reverse Mortgage Consultation Invitation"
workflow_trigger: "Reverse Mortgage Consultation Invitation needed"
automation_trigger: "Reverse Mortgage Consultation Invitation needed"
automation_timing: "Manual Only"
automation_ready: "Manual Only"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Reverse mortgage conversation"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanOfficerName}}"
  - "{{PhoneNumber}}"
  - "{{NMLS}}"
optional_merge_fields:
  - "{{PropertyAddress}}"
required_attachments:
[]
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "application"
  - "borrower"
  - "counseling"
  - "emt-069"
  - "hecm"
  - "pre approval templates"
  - "reverse mortgage"
  - "reverse mortgage consultation invitation"
related_templates:
  - "EMT-082"
  - "EMT-095"
  - "EMT-105"
tags:
  - "application"
  - "borrower"
  - "counseling"
  - "emt-069"
  - "hecm"
  - "high"
  - "introduction"
  - "loan-officer"
  - "manual-only"
  - "pre-approval-templates"
  - "reverse-mortgage"
  - "reverse-mortgage-consultation-invitation"
---

## EMT-069 Reverse Mortgage Consultation Invitation

- Template name: Reverse Mortgage Consultation Invitation
- Use case: Invite borrower to a reverse mortgage conversation without pressure or suitability claims.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: Reverse mortgage conversation
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{PropertyAddress}}`
- Compliance notes: Do not make suitability claims or pressure the borrower. Mention required counseling when relevant. Include compliance line.
- Follow up timing: After borrower asks about reverse mortgage or age-based equity options.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

I can walk you through how a reverse mortgage review works and what questions to ask before deciding whether it is worth exploring.

This email is not a recommendation that a reverse mortgage is right for you. The decision depends on your goals, property, equity, age requirements, counseling, lender guidelines, and full review.

A required counseling step may apply before the loan can move forward.

Your next step is to call or text me at `{{PhoneNumber}}` so we can review the basics and decide whether it makes sense to continue.

`{{LoanOfficerName}}`  
NMLS `{{NMLS}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-070
title: "Asset Depletion Loan"
category: "Pre Approval Templates"
loan_stage: "Application"
audience:
  - "Borrower"
loan_programs:
  - "Asset Depletion"
  - "Non-QM"
  - "Jumbo"
language: "English"
priority: "Medium"
purpose: "Introduce asset depletion as a possible review path for borrowers with significant assets."
communication_type: "Introduction"
workflow_step: "Application - Asset Depletion Loan"
workflow_trigger: "Asset Depletion Loan needed"
automation_trigger: "Asset Depletion Loan needed"
automation_timing: "Manual Only"
automation_ready: "Manual Only"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Asset depletion loan review"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanOfficerName}}"
  - "{{ApplicationLink}}"
  - "{{PhoneNumber}}"
  - "{{NMLS}}"
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
  - "application"
  - "asset depletion"
  - "asset depletion loan"
  - "assets"
  - "borrower"
  - "emt-070"
  - "jumbo"
  - "non qm"
  - "pre approval templates"
related_templates:
  - "EMT-006"
  - "EMT-010"
  - "EMT-071"
tags:
  - "application"
  - "asset-depletion"
  - "asset-depletion-loan"
  - "assets"
  - "borrower"
  - "emt-070"
  - "introduction"
  - "jumbo"
  - "loan-officer"
  - "manual-only"
  - "medium"
  - "non-qm"
  - "pre-approval-templates"
---

## EMT-070 Asset Depletion Loan

- Template name: Asset Depletion Loan
- Use case: Introduce asset depletion as a possible review path for borrowers with significant assets.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: Asset depletion loan review
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Do not imply assets alone guarantee approval. Lender review of eligible assets, credit, property, reserves, and guidelines still applies. Include compliance line.
- Follow up timing: When income structure suggests asset depletion may be considered.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

An asset depletion loan may allow eligible assets to be considered as part of the loan review, depending on lender guidelines.

This does not mean assets alone approve the loan. Credit, property, reserves, documentation, and complete underwriting review still matter.

Please complete the application and upload the requested items in the portal:

`{{ApplicationLink}}`

After I review the file, I will explain which asset documentation appears relevant and what the lender may still require.

`{{LoanOfficerName}}`  
NMLS `{{NMLS}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-071
title: "Bank Statement Loan"
category: "Pre Approval Templates"
loan_stage: "Application"
audience:
  - "Borrower"
loan_programs:
  - "Bank Statement"
  - "Self Employed"
  - "Non-QM"
language: "English"
priority: "Medium"
purpose: "Introduce bank statement loan review for borrowers whose income may not fit standard documentation."
communication_type: "Introduction"
workflow_step: "Application - Bank Statement Loan"
workflow_trigger: "Bank Statement Loan needed"
automation_trigger: "Bank Statement Loan needed"
automation_timing: "Manual Only"
automation_ready: "Manual Only"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Bank statement loan review"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanOfficerName}}"
  - "{{ApplicationLink}}"
  - "{{PhoneNumber}}"
  - "{{NMLS}}"
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
  - "application"
  - "bank statement loan"
  - "borrower"
  - "emt-071"
  - "non qm"
  - "pre approval templates"
  - "self employed"
related_templates:
  - "EMT-010"
  - "EMT-086"
  - "EMT-090"
tags:
  - "application"
  - "bank-statement-loan"
  - "borrower"
  - "emt-071"
  - "introduction"
  - "loan-officer"
  - "manual-only"
  - "medium"
  - "non-qm"
  - "pre-approval-templates"
  - "self-employed"
---

## EMT-071 Bank Statement Loan

- Template name: Bank Statement Loan
- Use case: Introduce bank statement loan review for borrowers whose income may not fit standard documentation.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: Bank statement loan review
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Do not imply bank deposits guarantee qualifying income. Lender review of deposits, expense factors, credit, reserves, and property still applies. Include compliance line.
- Follow up timing: When a self-employed or non-traditional income borrower may need bank statement review.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

A bank statement loan may be worth reviewing if your income does not fit a standard W2 or tax-return path.

The lender will still review deposit history, eligible income, expense assumptions, credit, assets, reserves, property, and program guidelines. Deposits by themselves do not guarantee approval.

Please start the application and upload the items requested here:

`{{ApplicationLink}}`

Once the file is complete enough, I will explain what looks workable and what could be a challenge.

`{{LoanOfficerName}}`  
NMLS `{{NMLS}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-072
title: "Jumbo Loan"
category: "Pre Approval Templates"
loan_stage: "Application"
audience:
  - "Borrower"
loan_programs:
  - "Jumbo"
language: "English"
priority: "Medium"
purpose: "Introduce jumbo loan review and set expectations for reserves, credit, documentation, and property review."
communication_type: "Introduction"
workflow_step: "Application - Jumbo Loan"
workflow_trigger: "Jumbo Loan needed"
automation_trigger: "Jumbo Loan needed"
automation_timing: "Manual Only"
automation_ready: "Manual Only"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Jumbo loan review next steps"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanOfficerName}}"
  - "{{ApplicationLink}}"
  - "{{PhoneNumber}}"
  - "{{NMLS}}"
optional_merge_fields:
  - "{{PropertyAddress}}"
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
  - "application"
  - "borrower"
  - "emt-072"
  - "high balance"
  - "jumbo"
  - "jumbo loan"
  - "pre approval templates"
  - "reserves"
related_templates:
  - "EMT-006"
  - "EMT-010"
  - "EMT-019"
tags:
  - "application"
  - "borrower"
  - "emt-072"
  - "high-balance"
  - "introduction"
  - "jumbo"
  - "jumbo-loan"
  - "loan-officer"
  - "manual-only"
  - "medium"
  - "pre-approval-templates"
  - "reserves"
---

## EMT-072 Jumbo Loan

- Template name: Jumbo Loan
- Use case: Introduce jumbo loan review and set expectations for reserves, credit, documentation, and property review.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: Jumbo loan review next steps
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{PropertyAddress}}`, `{{LoanProgram}}`
- Compliance notes: Do not imply jumbo eligibility or terms before underwriting. Include compliance line.
- Follow up timing: When loan amount or property price suggests a jumbo review path.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

A jumbo loan review usually asks for a stronger look at credit, income, assets, reserves, property value, and title details.

As your broker, I can compare available jumbo lender options once the file is complete enough to review. Nothing is final until underwriting, appraisal, title, insurance, and lender review are complete.

Please start here and upload the requested items:

`{{ApplicationLink}}`

After review, I will tell you what appears strong, what may need attention, and what documents are still needed.

`{{LoanOfficerName}}`  
NMLS `{{NMLS}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-073
title: "VA IRRRL"
category: "Pre Approval Templates"
loan_stage: "Application"
audience:
  - "Borrower"
loan_programs:
  - "VA"
  - "VA IRRRL"
language: "English"
priority: "Medium"
purpose: "Introduce the VA IRRRL refinance review without promising savings or eligibility."
communication_type: "Introduction"
workflow_step: "Application - VA IRRRL"
workflow_trigger: "VA IRRRL needed"
automation_trigger: "VA IRRRL needed"
automation_timing: "Manual Only"
automation_ready: "Manual Only"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "VA IRRRL review next steps"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanOfficerName}}"
  - "{{ApplicationLink}}"
  - "{{PhoneNumber}}"
  - "{{NMLS}}"
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
  - "application"
  - "borrower"
  - "emt-073"
  - "pre approval templates"
  - "refinance"
  - "va irrrl"
  - "va streamline"
related_templates:
  - "EMT-006"
  - "EMT-019"
  - "EMT-132"
tags:
  - "application"
  - "borrower"
  - "emt-073"
  - "introduction"
  - "loan-officer"
  - "manual-only"
  - "medium"
  - "pre-approval-templates"
  - "refinance"
  - "va-irrrl"
  - "va-streamline"
---

## EMT-073 VA IRRRL

- Template name: VA IRRRL
- Use case: Introduce the VA IRRRL refinance review without promising savings or eligibility.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: VA IRRRL review next steps
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Do not imply VA IRRRL eligibility, savings, payment reduction, rate, or closing approval. Include compliance line.
- Follow up timing: When a VA borrower asks about a streamlined refinance review.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

A VA IRRRL may be available for some current VA borrowers, but it still needs a proper review before we know whether it makes sense.

I will not assume there is a benefit until we compare the current loan, the possible new terms, costs, timing, and VA/lender requirements.

Please start with the application link so I can review the basics:

`{{ApplicationLink}}`

After that, I will explain the options clearly, including when keeping the current loan may be the better answer.

`{{LoanOfficerName}}`  
NMLS `{{NMLS}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-074
title: "FHA Streamline"
category: "Pre Approval Templates"
loan_stage: "Application"
audience:
  - "Borrower"
loan_programs:
  - "FHA"
  - "FHA Streamline"
language: "English"
priority: "Medium"
purpose: "Introduce FHA Streamline refinance review without promising eligibility or savings."
communication_type: "Introduction"
workflow_step: "Application - FHA Streamline"
workflow_trigger: "FHA Streamline needed"
automation_trigger: "FHA Streamline needed"
automation_timing: "Manual Only"
automation_ready: "Manual Only"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "FHA Streamline review next steps"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanOfficerName}}"
  - "{{ApplicationLink}}"
  - "{{PhoneNumber}}"
  - "{{NMLS}}"
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
  - "application"
  - "borrower"
  - "emt-074"
  - "fha refinance"
  - "fha streamline"
  - "pre approval templates"
  - "refinance"
related_templates:
  - "EMT-006"
  - "EMT-019"
  - "EMT-132"
tags:
  - "application"
  - "borrower"
  - "emt-074"
  - "fha-refinance"
  - "fha-streamline"
  - "introduction"
  - "loan-officer"
  - "manual-only"
  - "medium"
  - "pre-approval-templates"
  - "refinance"
---

## EMT-074 FHA Streamline

- Template name: FHA Streamline
- Use case: Introduce FHA Streamline refinance review without promising eligibility or savings.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: FHA Streamline review next steps
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Do not imply FHA Streamline eligibility, savings, payment reduction, rate, or closing approval. Include compliance line.
- Follow up timing: When an FHA borrower asks about a streamlined refinance review.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

An FHA Streamline refinance may be an option for some current FHA borrowers, but it still needs review before we know whether it is useful.

I will look at the current loan, possible new terms, costs, timing, and FHA/lender requirements. There is no promise of savings, approval, or a specific payment.

Please start the review here:

`{{ApplicationLink}}`

Once I have the basics, I will explain whether it looks worth pursuing or whether staying put may make more sense.

`{{LoanOfficerName}}`  
NMLS `{{NMLS}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
