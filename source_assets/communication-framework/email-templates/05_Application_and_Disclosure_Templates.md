# Application And Disclosure Templates

## Table Of Contents

- [EMT-017 Application Received](#emt-017-application-received)
- [EMT-018 Application Incomplete](#emt-018-application-incomplete)
- [EMT-019 Disclosures Sent](#emt-019-disclosures-sent)
- [EMT-020 Disclosures Reminder](#emt-020-disclosures-reminder)
- [EMT-021 Disclosures Signed](#emt-021-disclosures-signed)
- [EMT-088 ITIN Application Submitted](#emt-088-itin-application-submitted)
- [EMT-089 Foreign National Application Submitted](#emt-089-foreign-national-application-submitted)
- [EMT-090 DSCR Application Submitted](#emt-090-dscr-application-submitted)
- [EMT-091 Construction Loan Disclosures](#emt-091-construction-loan-disclosures)
- [EMT-092 One Time Close Disclosures](#emt-092-one-time-close-disclosures)
- [EMT-093 Manufactured Home Disclosures](#emt-093-manufactured-home-disclosures)
- [EMT-094 Renovation Loan Disclosures](#emt-094-renovation-loan-disclosures)
- [EMT-095 Reverse Mortgage Counseling Reminder](#emt-095-reverse-mortgage-counseling-reminder)
- [EMT-096 Down Payment Assistance Update](#emt-096-down-payment-assistance-update)
- [EMT-097 USDA Update](#emt-097-usda-update)

---
id: EMT-017
title: "Application Received"
category: "Application and Disclosure Templates"
loan_stage: "Disclosures"
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
purpose: "Confirm application receipt."
communication_type: "Status Update"
workflow_step: "Disclosures - Application Received"
workflow_trigger: "Application received"
automation_trigger: "Application received"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "We received your application"
required_merge_fields:
  - "{{ApplicationLink}}"
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
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
  - "application and disclosure templates"
  - "application received"
  - "borrower"
  - "disclosures"
  - "emt-017"
related_templates:
  - "EMT-016"
  - "EMT-018"
  - "EMT-019"
tags:
  - "application"
  - "application-and-disclosure-templates"
  - "application-received"
  - "borrower"
  - "disclosures"
  - "fully-automated"
  - "loan-coordinator"
  - "medium"
  - "status-update"
---

## EMT-017 Application Received

- Template name: Application received
- Use case: Confirm application receipt.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: We received your application
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{LoanOfficerName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Receipt is not approval. Include compliance line.
- Follow up timing: Immediately after application is received.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We received your application. Thank you for getting that started.

Our team will review it and let you know what is still needed. If you need to upload anything else, use this link:

`{{ApplicationLink}}`

`{{LoanOfficerName}}` remains your loan officer, and our team will help with the next steps.

Receiving the application does not mean the loan is approved. It means we can start reviewing the file.

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.

---
id: EMT-018
title: "Application Incomplete"
category: "Application and Disclosure Templates"
loan_stage: "Disclosures"
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
purpose: "Ask borrower to finish required application fields."
communication_type: "Request"
workflow_step: "Disclosures - Application Incomplete"
workflow_trigger: "Application marked incomplete"
automation_trigger: "Application marked incomplete"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Your application still needs a few items"
required_merge_fields:
  - "{{ApplicationLink}}"
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
  - "application"
  - "application and disclosure templates"
  - "application incomplete"
  - "borrower"
  - "disclosures"
  - "emt-018"
related_templates:
  - "EMT-017"
  - "EMT-019"
tags:
  - "application"
  - "application-and-disclosure-templates"
  - "application-incomplete"
  - "borrower"
  - "disclosures"
  - "fully-automated"
  - "loan-coordinator"
  - "medium"
  - "request"
---

## EMT-018 Application Incomplete

- Template name: Application incomplete
- Use case: Ask borrower to finish required application fields.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Your application still needs a few items
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanOfficerName}}`
- Compliance notes: Be direct and helpful. Do not imply fault.
- Follow up timing: Same day incomplete status is identified.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Your application is started, but a few required items are still incomplete.

Please log back in and finish the open sections:

`{{ApplicationLink}}`

If you are unsure how to answer something, call us at `{{PhoneNumber}}` before guessing.

Thank you,  
`{{LoanCoordinatorName}}`

---
id: EMT-019
title: "Disclosures Sent"
category: "Application and Disclosure Templates"
loan_stage: "Disclosures"
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
purpose: "Notify borrower disclosures have been sent."
communication_type: "Status Update"
workflow_step: "Disclosures - Disclosures Sent"
workflow_trigger: "Disclosures sent"
automation_trigger: "Disclosures sent"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Loan disclosures sent"
required_merge_fields:
  - "{{ApplicationLink}}"
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{LoanProgram}}"
required_attachments:
  - "Disclosure package"
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "application"
  - "application and disclosure templates"
  - "borrower"
  - "disclosures"
  - "disclosures sent"
  - "emt-019"
related_templates:
  - "EMT-018"
  - "EMT-020"
  - "EMT-021"
tags:
  - "application"
  - "application-and-disclosure-templates"
  - "borrower"
  - "disclosures"
  - "disclosures-sent"
  - "fully-automated"
  - "loan-coordinator"
  - "medium"
  - "status-update"
---

## EMT-019 Disclosures Sent

- Template name: Disclosures sent
- Use case: Notify borrower disclosures have been sent.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Loan disclosures sent
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Signing disclosures does not mean final approval. Include compliance line.
- Follow up timing: Immediately after disclosures are sent.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Your loan disclosures have been sent. Please review and sign them through the secure portal:

`{{ApplicationLink}}`

Signing disclosures allows the process to keep moving. It does not mean final approval or final loan terms.

Call us at `{{PhoneNumber}}` if you have trouble accessing them.

Thank you,  
`{{LoanCoordinatorName}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.

---
id: EMT-020
title: "Disclosures Reminder"
category: "Application and Disclosure Templates"
loan_stage: "Disclosures"
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
purpose: "Remind borrower to sign disclosures."
communication_type: "Reminder"
workflow_step: "Disclosures - Disclosures Reminder"
workflow_trigger: "Disclosures unsigned after delay"
automation_trigger: "Disclosures unsigned after delay"
automation_timing: "Wait 1 Day"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Reminder to sign your loan disclosures"
required_merge_fields:
  - "{{ApplicationLink}}"
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
optional_merge_fields:
  - "{{PhoneNumber}}"
required_attachments:
  - "Disclosure package"
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "application"
  - "application and disclosure templates"
  - "borrower"
  - "disclosures"
  - "disclosures reminder"
  - "emt-020"
related_templates:
  - "EMT-019"
  - "EMT-021"
tags:
  - "application"
  - "application-and-disclosure-templates"
  - "borrower"
  - "disclosures"
  - "disclosures-reminder"
  - "fully-automated"
  - "high"
  - "loan-coordinator"
  - "reminder"
---

## EMT-020 Disclosures Reminder

- Template name: Disclosures reminder
- Use case: Remind borrower to sign disclosures.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Reminder to sign your loan disclosures
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`
- Optional placeholders: `{{PhoneNumber}}`
- Compliance notes: Do not pressure; explain timing.
- Follow up timing: 24 hours after disclosures are sent if unsigned.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Quick reminder: your loan disclosures still need to be reviewed and signed.

Please use the secure portal:

`{{ApplicationLink}}`

This helps keep the loan moving and avoids unnecessary delays.

Thank you,  
`{{LoanCoordinatorName}}`

---
id: EMT-021
title: "Disclosures Signed"
category: "Application and Disclosure Templates"
loan_stage: "Disclosures"
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
purpose: "Confirm disclosures have been signed."
communication_type: "Status Update"
workflow_step: "Disclosures - Disclosures Signed"
workflow_trigger: "Disclosures signed"
automation_trigger: "Disclosures signed"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Disclosures received"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{ProcessorName}}"
required_attachments:
  - "Disclosure package"
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "application"
  - "application and disclosure templates"
  - "borrower"
  - "disclosures"
  - "disclosures signed"
  - "emt-021"
related_templates:
  - "EMT-020"
  - "EMT-022"
tags:
  - "application"
  - "application-and-disclosure-templates"
  - "borrower"
  - "disclosures"
  - "disclosures-signed"
  - "fully-automated"
  - "loan-coordinator"
  - "medium"
  - "status-update"
---

## EMT-021 Disclosures Signed

- Template name: Disclosures signed
- Use case: Confirm disclosures have been signed.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Disclosures received
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{ProcessorName}}`
- Compliance notes: Do not imply approval. Confirm next review step only.
- Follow up timing: Same day signatures are completed.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We received the signed disclosures. Thank you.

The next step is continued file review. If we need anything else, our team will reach out with a clear request.

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

---
id: EMT-088
title: "ITIN Application Submitted"
category: "Application and Disclosure Templates"
loan_stage: "Disclosures"
audience:
  - "Borrower"
loan_programs:
  - "ITIN"
  - "Non-QM"
language: "English"
priority: "High"
purpose: "Confirm an ITIN application was submitted and explain the next review step."
communication_type: "Status Update"
workflow_step: "Disclosures - ITIN Application Submitted"
workflow_trigger: "ITIN Application Submitted needed"
automation_trigger: "ITIN Application Submitted needed"
automation_timing: "Send Immediately"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "ITIN application received"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
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
  - "application and disclosure templates"
  - "application submitted"
  - "borrower"
  - "disclosures"
  - "emt-088"
  - "itin"
  - "itin application submitted"
related_templates:
  - "EMT-066"
  - "EMT-075"
  - "EMT-101"
tags:
  - "application-and-disclosure-templates"
  - "application-submitted"
  - "borrower"
  - "disclosures"
  - "emt-088"
  - "high"
  - "itin"
  - "itin-application-submitted"
  - "loan-coordinator"
  - "semi-automated"
  - "status-update"
---

## EMT-088 ITIN Application Submitted

- Template name: ITIN Application Submitted
- Use case: Confirm an ITIN application was submitted and explain the next review step.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: ITIN application received
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanOfficerName}}`, `{{LoanProgram}}`
- Compliance notes: Do not imply ITIN status guarantees approval. Keep next step limited to lending review. Include compliance line.
- Follow up timing: Same day ITIN application is submitted.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We received your ITIN loan application.

The next step is review of the application and supporting documents. This is not an approval. The lender still needs to review the complete file, property, credit, income, assets, and guidelines.

If any items are still missing, please upload them here:

`{{ApplicationLink}}`

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-089
title: "Foreign National Application Submitted"
category: "Application and Disclosure Templates"
loan_stage: "Disclosures"
audience:
  - "Borrower"
loan_programs:
  - "Foreign National"
  - "Non-QM"
language: "English"
priority: "High"
purpose: "Confirm a foreign national application was submitted and set review expectations."
communication_type: "Status Update"
workflow_step: "Disclosures - Foreign National Application Submitted"
workflow_trigger: "Foreign National Application Submitted needed"
automation_trigger: "Foreign National Application Submitted needed"
automation_timing: "Send Immediately"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Foreign national application received"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
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
  - "application and disclosure templates"
  - "application submitted"
  - "borrower"
  - "disclosures"
  - "emt-089"
  - "foreign national"
  - "foreign national application submitted"
related_templates:
  - "EMT-067"
  - "EMT-076"
  - "EMT-102"
tags:
  - "application-and-disclosure-templates"
  - "application-submitted"
  - "borrower"
  - "disclosures"
  - "emt-089"
  - "foreign-national"
  - "foreign-national-application-submitted"
  - "high"
  - "loan-coordinator"
  - "semi-automated"
  - "status-update"
---

## EMT-089 Foreign National Application Submitted

- Template name: Foreign National Application Submitted
- Use case: Confirm a foreign national application was submitted and set review expectations.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Foreign national application received
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanOfficerName}}`, `{{LoanProgram}}`
- Compliance notes: Do not imply citizenship, residency, or foreign national status guarantees approval. Include compliance line.
- Follow up timing: Same day foreign national application is submitted.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We received your foreign national loan application.

The next step is document and lender review. Approval is not based on status alone and is still subject to credit, assets, property, reserves, lender guidelines, and the full file.

Please upload any remaining requested items in the portal:

`{{ApplicationLink}}`

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-090
title: "DSCR Application Submitted"
category: "Application and Disclosure Templates"
loan_stage: "Disclosures"
audience:
  - "Borrower"
loan_programs:
  - "DSCR"
  - "Investor"
  - "Non-QM"
language: "English"
priority: "High"
purpose: "Confirm DSCR application submission and explain cash-flow review."
communication_type: "Status Update"
workflow_step: "Disclosures - DSCR Application Submitted"
workflow_trigger: "DSCR Application Submitted needed"
automation_trigger: "DSCR Application Submitted needed"
automation_timing: "Send Immediately"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "DSCR application received"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{ApplicationLink}}"
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
  - "application"
  - "application and disclosure templates"
  - "borrower"
  - "disclosures"
  - "dscr"
  - "dscr application submitted"
  - "emt-090"
  - "investor"
related_templates:
  - "EMT-068"
  - "EMT-077"
  - "EMT-100"
tags:
  - "application"
  - "application-and-disclosure-templates"
  - "borrower"
  - "disclosures"
  - "dscr"
  - "dscr-application-submitted"
  - "emt-090"
  - "high"
  - "investor"
  - "loan-coordinator"
  - "semi-automated"
  - "status-update"
---

## EMT-090 DSCR Application Submitted

- Template name: DSCR Application Submitted
- Use case: Confirm DSCR application submission and explain cash-flow review.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: DSCR application received
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{PropertyAddress}}`, `{{LoanOfficerName}}`
- Compliance notes: Make clear DSCR review depends on property cash flow, rental income, credit, equity, reserves, and lender guidelines. Include compliance line.
- Follow up timing: Same day DSCR application is submitted.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We received your DSCR application.

The lender will review the property cash flow, rental income support, credit, equity, reserves, appraisal, title, insurance, and program guidelines.

Please upload any remaining requested items here:

`{{ApplicationLink}}`

We will update you once the file is ready for the next review step.

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-091
title: "Construction Loan Disclosures"
category: "Application and Disclosure Templates"
loan_stage: "Disclosures"
audience:
  - "Borrower"
loan_programs:
  - "Construction"
  - "Conventional"
  - "Jumbo"
  - "Non-QM"
language: "English"
priority: "High"
purpose: "Tell borrower construction loan disclosures are available and explain review boundaries."
communication_type: "Request"
workflow_step: "Disclosures - Construction Loan Disclosures"
workflow_trigger: "Construction Loan Disclosures needed"
automation_trigger: "Construction Loan Disclosures needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Construction loan disclosures ready"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{ApplicationLink}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{LoanOfficerName}}"
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
  - "application and disclosure templates"
  - "borrower"
  - "construction"
  - "construction loan disclosures"
  - "disclosures"
  - "emt-091"
related_templates:
  - "EMT-078"
  - "EMT-098"
  - "EMT-106"
tags:
  - "application-and-disclosure-templates"
  - "borrower"
  - "construction"
  - "construction-loan-disclosures"
  - "disclosures"
  - "emt-091"
  - "high"
  - "loan-coordinator"
  - "request"
  - "semi-automated"
---

## EMT-091 Construction Loan Disclosures

- Template name: Construction Loan Disclosures
- Use case: Tell borrower construction loan disclosures are available and explain review boundaries.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Construction loan disclosures ready
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanOfficerName}}`, `{{PropertyAddress}}`
- Compliance notes: Do not promise construction approval. Builder approval, plans, specs, budget, appraisal, title, insurance, and underwriting still matter. Include compliance line.
- Follow up timing: When construction disclosures are issued.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Your construction loan disclosures are ready for review.

Please read and sign them through the portal. Signing disclosures does not mean the construction loan is approved. Builder approval, plans, specs, budget, appraisal, title, insurance, and underwriting still need review.

`{{ApplicationLink}}`

If you have questions before signing, call us at `{{PhoneNumber}}`.

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-092
title: "One Time Close Disclosures"
category: "Application and Disclosure Templates"
loan_stage: "Disclosures"
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
purpose: "Tell borrower One Time Close disclosures are available and explain remaining review items."
communication_type: "Request"
workflow_step: "Disclosures - One Time Close Disclosures"
workflow_trigger: "One Time Close Disclosures needed"
automation_trigger: "One Time Close Disclosures needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "One Time Close disclosures ready"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{ApplicationLink}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{LoanOfficerName}}"
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
  - "application and disclosure templates"
  - "borrower"
  - "disclosures"
  - "emt-092"
  - "one time close"
  - "one time close disclosures"
  - "otc"
related_templates:
  - "EMT-079"
  - "EMT-099"
  - "EMT-121"
tags:
  - "application-and-disclosure-templates"
  - "borrower"
  - "disclosures"
  - "emt-092"
  - "high"
  - "loan-coordinator"
  - "one-time-close"
  - "one-time-close-disclosures"
  - "otc"
  - "request"
  - "semi-automated"
---

## EMT-092 One Time Close Disclosures

- Template name: One Time Close Disclosures
- Use case: Tell borrower One Time Close disclosures are available and explain remaining review items.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: One Time Close disclosures ready
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanOfficerName}}`, `{{PropertyAddress}}`
- Compliance notes: Do not promise one time close approval. Builder, plans, specs, budget, appraisal, title, insurance, and underwriting remain required. Include compliance line.
- Follow up timing: When one time close disclosures are issued.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Your One Time Close construction disclosures are ready for review.

Please review and sign them in the portal. Signing disclosures does not mean the loan or construction project is approved.

`{{ApplicationLink}}`

The lender still needs to review builder approval, plans, specs, budget, appraisal, title, insurance, and underwriting conditions.

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-093
title: "Manufactured Home Disclosures"
category: "Application and Disclosure Templates"
loan_stage: "Disclosures"
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
purpose: "Tell borrower manufactured home disclosures are ready and property review remains open."
communication_type: "Request"
workflow_step: "Disclosures - Manufactured Home Disclosures"
workflow_trigger: "Manufactured Home Disclosures needed"
automation_trigger: "Manufactured Home Disclosures needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Manufactured home disclosures ready"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{ApplicationLink}}"
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
  - "application and disclosure templates"
  - "borrower"
  - "disclosures"
  - "emt-093"
  - "manufactured home"
  - "manufactured home disclosures"
related_templates:
  - "EMT-080"
  - "EMT-103"
  - "EMT-109"
tags:
  - "application-and-disclosure-templates"
  - "borrower"
  - "disclosures"
  - "emt-093"
  - "high"
  - "loan-coordinator"
  - "manufactured-home"
  - "manufactured-home-disclosures"
  - "request"
  - "semi-automated"
---

## EMT-093 Manufactured Home Disclosures

- Template name: Manufactured Home Disclosures
- Use case: Tell borrower manufactured home disclosures are ready and property review remains open.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Manufactured home disclosures ready
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{PropertyAddress}}`, `{{LoanOfficerName}}`
- Compliance notes: Do not assume all manufactured homes qualify. Title, foundation, HUD tags, data plate, engineer report, land ownership, and lender requirements may apply. Include compliance line.
- Follow up timing: When manufactured home disclosures are issued.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Your manufactured home disclosures are ready for review.

Please review and sign them in the portal. Signing disclosures does not mean the property has been approved.

`{{ApplicationLink}}`

The lender may still need title details, foundation information, HUD tags, data plate, engineer report, land ownership information, appraisal, insurance, and final underwriting review.

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-094
title: "Renovation Loan Disclosures"
category: "Application and Disclosure Templates"
loan_stage: "Disclosures"
audience:
  - "Borrower"
loan_programs:
  - "Renovation"
  - "FHA 203k"
  - "Conventional Renovation"
language: "English"
priority: "High"
purpose: "Tell borrower renovation loan disclosures are ready and scope/contractor review remains open."
communication_type: "Request"
workflow_step: "Disclosures - Renovation Loan Disclosures"
workflow_trigger: "Renovation Loan Disclosures needed"
automation_trigger: "Renovation Loan Disclosures needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Renovation loan disclosures ready"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{ApplicationLink}}"
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
  - "application and disclosure templates"
  - "borrower"
  - "contractor"
  - "disclosures"
  - "emt-094"
  - "renovation"
  - "renovation loan disclosures"
related_templates:
  - "EMT-081"
  - "EMT-104"
  - "EMT-110"
tags:
  - "application-and-disclosure-templates"
  - "borrower"
  - "contractor"
  - "disclosures"
  - "emt-094"
  - "high"
  - "loan-coordinator"
  - "renovation"
  - "renovation-loan-disclosures"
  - "request"
  - "semi-automated"
---

## EMT-094 Renovation Loan Disclosures

- Template name: Renovation Loan Disclosures
- Use case: Tell borrower renovation loan disclosures are ready and scope/contractor review remains open.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Renovation loan disclosures ready
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{PropertyAddress}}`, `{{LoanOfficerName}}`
- Compliance notes: Clarify final scope, contractor approval, bid, appraisal, and lender review determine approval. Include compliance line.
- Follow up timing: When renovation disclosures are issued.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Your renovation loan disclosures are ready for review.

Please review and sign them in the portal. Signing disclosures does not mean the renovation scope or contractor has been approved.

`{{ApplicationLink}}`

Final approval depends on the scope of work, contractor approval, bid, appraisal, property review, and lender guidelines.

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-095
title: "Reverse Mortgage Counseling Reminder"
category: "Application and Disclosure Templates"
loan_stage: "Disclosures"
audience:
  - "Borrower"
loan_programs:
  - "Reverse Mortgage"
  - "HECM"
language: "English"
priority: "High"
purpose: "Remind borrower about required reverse mortgage counseling without pressure."
communication_type: "Reminder"
workflow_step: "Disclosures - Reverse Mortgage Counseling Reminder"
workflow_trigger: "Reverse Mortgage Counseling Reminder needed"
automation_trigger: "Reverse Mortgage Counseling Reminder needed"
automation_timing: "Manual Only"
automation_ready: "Manual Only"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Reverse mortgage counseling reminder"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{LoanOfficerName}}"
  - "{{ApplicationLink}}"
required_attachments:
[]
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "application and disclosure templates"
  - "borrower"
  - "counseling"
  - "disclosures"
  - "emt-095"
  - "hecm"
  - "reverse mortgage"
  - "reverse mortgage counseling reminder"
related_templates:
  - "EMT-069"
  - "EMT-082"
  - "EMT-105"
tags:
  - "application-and-disclosure-templates"
  - "borrower"
  - "counseling"
  - "disclosures"
  - "emt-095"
  - "hecm"
  - "high"
  - "loan-coordinator"
  - "manual-only"
  - "reminder"
  - "reverse-mortgage"
  - "reverse-mortgage-counseling-reminder"
---

## EMT-095 Reverse Mortgage Counseling Reminder

- Template name: Reverse Mortgage Counseling Reminder
- Use case: Remind borrower about required reverse mortgage counseling without pressure.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Reverse mortgage counseling reminder
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanOfficerName}}`, `{{ApplicationLink}}`
- Compliance notes: Do not pressure borrower or make suitability claims. Required counseling should be framed as an independent step. Include compliance line.
- Follow up timing: When counseling is required and not yet documented.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

This is a reminder that reverse mortgage counseling may be required before the file can continue.

Counseling is an independent step. It is meant to help you understand the product, questions, costs, and alternatives before deciding whether to move forward.

Please let us know once counseling is scheduled or completed. If you are unsure what is needed, call us at `{{PhoneNumber}}`.

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-096
title: "Down Payment Assistance Update"
category: "Application and Disclosure Templates"
loan_stage: "Disclosures"
audience:
  - "Borrower"
loan_programs:
  - "Conventional"
  - "FHA"
  - "VA"
  - "USDA"
  - "Down Payment Assistance"
language: "English"
priority: "High"
purpose: "Update borrower on down payment assistance review without implying approval."
communication_type: "Status Update"
workflow_step: "Disclosures - Down Payment Assistance Update"
workflow_trigger: "Down Payment Assistance Update needed"
automation_trigger: "Down Payment Assistance Update needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Down payment assistance update"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
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
  - "application and disclosure templates"
  - "assistance"
  - "borrower"
  - "disclosures"
  - "down payment assistance"
  - "down payment assistance update"
  - "dpa"
  - "emt-096"
related_templates:
  - "EMT-019"
  - "EMT-026"
  - "EMT-085"
tags:
  - "application-and-disclosure-templates"
  - "assistance"
  - "borrower"
  - "disclosures"
  - "down-payment-assistance"
  - "down-payment-assistance-update"
  - "dpa"
  - "emt-096"
  - "high"
  - "loan-coordinator"
  - "semi-automated"
  - "status-update"
---

## EMT-096 Down Payment Assistance Update

- Template name: Down Payment Assistance Update
- Use case: Update borrower on down payment assistance review without implying approval.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Down payment assistance update
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanOfficerName}}`, `{{LoanProgram}}`
- Compliance notes: Do not imply DPA approval or final terms before program review, lender review, and disclosures. Include compliance line.
- Follow up timing: When DPA status changes or borrower asks for update.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We are still reviewing the down payment assistance piece of your file.

Assistance programs can have separate eligibility rules, documents, income limits, property rules, and timing requirements. Approval is not final until the program and lender complete their review.

Please upload any remaining requested items here:

`{{ApplicationLink}}`

We will update you when there is a confirmed next step.

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-097
title: "USDA Update"
category: "Application and Disclosure Templates"
loan_stage: "Disclosures"
audience:
  - "Borrower"
loan_programs:
  - "USDA"
language: "English"
priority: "Medium"
purpose: "Provide a plain-language USDA loan status update."
communication_type: "Status Update"
workflow_step: "Disclosures - USDA Update"
workflow_trigger: "USDA Update needed"
automation_trigger: "USDA Update needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "USDA loan review update"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{ApplicationLink}}"
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
  - "application and disclosure templates"
  - "borrower"
  - "disclosures"
  - "eligibility"
  - "emt-097"
  - "rural development"
  - "usda"
  - "usda update"
related_templates:
  - "EMT-019"
  - "EMT-022"
  - "EMT-026"
tags:
  - "application-and-disclosure-templates"
  - "borrower"
  - "disclosures"
  - "eligibility"
  - "emt-097"
  - "loan-coordinator"
  - "medium"
  - "rural-development"
  - "semi-automated"
  - "status-update"
  - "usda"
  - "usda-update"
---

## EMT-097 USDA Update

- Template name: USDA Update
- Use case: Provide a plain-language USDA loan status update.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: USDA loan review update
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{PropertyAddress}}`, `{{LoanOfficerName}}`
- Compliance notes: Do not imply USDA eligibility or approval before lender and USDA review are complete. Include compliance line.
- Follow up timing: When USDA review status changes or documents remain open.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We are continuing the USDA review for your file.

USDA loans can involve property eligibility, income eligibility, lender underwriting, and any required agency review. None of those steps should be treated as final until they are confirmed.

Please keep an eye on the portal and upload any open items here:

`{{ApplicationLink}}`

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
