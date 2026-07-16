# Document Collection Templates

## Table Of Contents

- [EMT-010 Documents Needed](#emt-010-documents-needed)
- [EMT-011 Documents Still Missing](#emt-011-documents-still-missing)
- [EMT-012 Need Updated Paystub](#emt-012-need-updated-paystub)
- [EMT-013 Need Bank Statement](#emt-013-need-bank-statement)
- [EMT-014 Need W2s](#emt-014-need-w2s)
- [EMT-015 Need Tax Returns](#emt-015-need-tax-returns)
- [EMT-016 Need Explanation Letter](#emt-016-need-explanation-letter)
- [EMT-075 ITIN Required Documents](#emt-075-itin-required-documents)
- [EMT-076 Foreign National Required Documents](#emt-076-foreign-national-required-documents)
- [EMT-077 DSCR Required Documents](#emt-077-dscr-required-documents)
- [EMT-078 Construction Loan Document Checklist](#emt-078-construction-loan-document-checklist)
- [EMT-079 One Time Close Construction Checklist](#emt-079-one-time-close-construction-checklist)
- [EMT-080 Manufactured Home Documentation](#emt-080-manufactured-home-documentation)
- [EMT-081 Renovation Loan Documentation](#emt-081-renovation-loan-documentation)
- [EMT-082 Reverse Mortgage Documentation](#emt-082-reverse-mortgage-documentation)
- [EMT-083 Credit Rescore Documentation Request](#emt-083-credit-rescore-documentation-request)
- [EMT-084 Gift Funds Received](#emt-084-gift-funds-received)
- [EMT-085 Gift Funds Still Needed](#emt-085-gift-funds-still-needed)
- [EMT-086 Self Employed Borrower Documents](#emt-086-self-employed-borrower-documents)
- [EMT-087 Builder Package Needed](#emt-087-builder-package-needed)

---
id: EMT-010
title: "Documents Needed"
category: "Document Collection Templates"
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
purpose: "Request the first set of supporting documents."
communication_type: "Request"
workflow_step: "Processing - Documents Needed"
workflow_trigger: "Document checklist created"
automation_trigger: "Document checklist created"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Documents needed for your loan review"
required_merge_fields:
  - "{{ApplicationLink}}"
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{LoanOfficerName}}"
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
  - "document collection templates"
  - "documents"
  - "documents needed"
  - "emt-010"
  - "processing"
related_templates:
  - "EMT-009"
  - "EMT-011"
  - "EMT-017"
tags:
  - "borrower"
  - "document-collection-templates"
  - "documents"
  - "documents-needed"
  - "emt-010"
  - "fully-automated"
  - "loan-coordinator"
  - "low"
  - "processing"
  - "request"
---

## EMT-010 Documents Needed

- Template name: Documents needed
- Use case: Request the first set of supporting documents.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Documents needed for your loan review
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanOfficerName}}`, `{{LoanProgram}}`
- Compliance notes: Do not say documents guarantee approval. Include compliance line when borrower-facing.
- Follow up timing: Same day application is started or reviewed.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We need a few documents to keep your loan review moving. Please log in here and upload the items requested:

`{{ApplicationLink}}`

If you are not sure what a requested item means, reply to this email or call `{{PhoneNumber}}`. We would rather help now than have the file delayed later.

Thank you,  
`{{LoanCoordinatorName}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.

---
id: EMT-011
title: "Documents Still Missing"
category: "Document Collection Templates"
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
purpose: "Follow up when requested items are still open."
communication_type: "Request"
workflow_step: "Processing - Documents Still Missing"
workflow_trigger: "Document request still open"
automation_trigger: "Document request still open"
automation_timing: "Wait 1 Day"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Still needed for your loan file"
required_merge_fields:
  - "{{ApplicationLink}}"
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{PhoneNumber}}"
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
  - "document collection templates"
  - "documents"
  - "documents still missing"
  - "emt-011"
  - "processing"
related_templates:
  - "EMT-010"
  - "EMT-012"
tags:
  - "borrower"
  - "document-collection-templates"
  - "documents"
  - "documents-still-missing"
  - "emt-011"
  - "fully-automated"
  - "high"
  - "loan-coordinator"
  - "processing"
  - "request"
---

## EMT-011 Documents Still Missing

- Template name: Documents still missing
- Use case: Follow up when requested items are still open.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Still needed for your loan file
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{ClosingDate}}`
- Compliance notes: Use urgency without pressure or blame.
- Follow up timing: 24 hours after first request, then every 48 hours while active.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We are still missing items in your loan portal. Please upload the remaining documents here:

`{{ApplicationLink}}`

Missing items can slow down underwriting and closing, so the sooner we receive them, the better we can keep the file moving.

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

---
id: EMT-012
title: "Need Updated Paystub"
category: "Document Collection Templates"
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
purpose: "Request a more recent paystub."
communication_type: "Status Update"
workflow_step: "Processing - Need Updated Paystub"
workflow_trigger: "Updated paystub condition opened"
automation_trigger: "Updated paystub condition opened"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Updated paystub needed"
required_merge_fields:
  - "{{ApplicationLink}}"
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
optional_merge_fields:
  - "{{PhoneNumber}}"
required_attachments:
  - "Updated paystub"
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "borrower"
  - "document collection templates"
  - "emt-012"
  - "need updated paystub"
  - "processing"
related_templates:
  - "EMT-011"
  - "EMT-013"
tags:
  - "borrower"
  - "document-collection-templates"
  - "emt-012"
  - "fully-automated"
  - "loan-coordinator"
  - "low"
  - "need-updated-paystub"
  - "processing"
  - "status-update"
---

## EMT-012 Need Updated Paystub

- Template name: Need updated paystub
- Use case: Request a more recent paystub.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Updated paystub needed
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`
- Optional placeholders: `{{PhoneNumber}}`
- Compliance notes: Do not imply approval depends only on this item.
- Follow up timing: Same day the need is identified.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We need an updated paystub for the loan file. Please upload the most recent paystub through the secure portal:

`{{ApplicationLink}}`

Once it is uploaded, our team will review it and let you know if anything else is needed.

Thank you,  
`{{LoanCoordinatorName}}`

---
id: EMT-013
title: "Need Bank Statement"
category: "Document Collection Templates"
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
purpose: "Request a bank statement for asset review."
communication_type: "Status Update"
workflow_step: "Processing - Need Bank Statement"
workflow_trigger: "Bank statement condition opened"
automation_trigger: "Bank statement condition opened"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Bank statement needed"
required_merge_fields:
  - "{{ApplicationLink}}"
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
optional_merge_fields:
  - "{{PhoneNumber}}"
required_attachments:
  - "Bank statement"
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "borrower"
  - "document collection templates"
  - "emt-013"
  - "need bank statement"
  - "processing"
related_templates:
  - "EMT-012"
  - "EMT-014"
tags:
  - "borrower"
  - "document-collection-templates"
  - "emt-013"
  - "fully-automated"
  - "loan-coordinator"
  - "low"
  - "need-bank-statement"
  - "processing"
  - "status-update"
---

## EMT-013 Need Bank Statement

- Template name: Need bank statement
- Use case: Request a bank statement for asset review.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Bank statement needed
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`
- Optional placeholders: `{{PhoneNumber}}`
- Compliance notes: Use secure upload only. Do not ask borrower to email sensitive documents.
- Follow up timing: Same day the need is identified.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We need a bank statement uploaded through the secure portal. Please do not email bank documents directly.

Upload here:

`{{ApplicationLink}}`

After it is uploaded, our team will review it and update you if anything else is needed.

Thank you,  
`{{LoanCoordinatorName}}`

---
id: EMT-014
title: "Need W2s"
category: "Document Collection Templates"
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
purpose: "Request W2s for income review."
communication_type: "Status Update"
workflow_step: "Processing - Need W2s"
workflow_trigger: "W2 condition opened"
automation_trigger: "W2 condition opened"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "W2s needed for your loan file"
required_merge_fields:
  - "{{ApplicationLink}}"
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
optional_merge_fields:
  - "{{PhoneNumber}}"
required_attachments:
  - "W2"
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "borrower"
  - "document collection templates"
  - "emt-014"
  - "need w2s"
  - "processing"
related_templates:
  - "EMT-013"
  - "EMT-015"
tags:
  - "borrower"
  - "document-collection-templates"
  - "emt-014"
  - "fully-automated"
  - "loan-coordinator"
  - "low"
  - "need-w2s"
  - "processing"
  - "status-update"
---

## EMT-014 Need W2s

- Template name: Need W2s
- Use case: Request W2s for income review.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: W2s needed for your loan file
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`
- Optional placeholders: `{{PhoneNumber}}`
- Compliance notes: Keep request specific and secure.
- Follow up timing: Same day the need is identified.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We need your W2s for the loan review. Please upload them through the secure portal:

`{{ApplicationLink}}`

Reply here if you are not sure which document to upload.

Thank you,  
`{{LoanCoordinatorName}}`

---
id: EMT-015
title: "Need Tax Returns"
category: "Document Collection Templates"
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
purpose: "Request tax returns for income or self-employed review."
communication_type: "Status Update"
workflow_step: "Processing - Need Tax Returns"
workflow_trigger: "Tax return condition opened"
automation_trigger: "Tax return condition opened"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Tax returns needed"
required_merge_fields:
  - "{{ApplicationLink}}"
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
optional_merge_fields:
  - "{{PhoneNumber}}"
required_attachments:
  - "Tax returns"
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "borrower"
  - "document collection templates"
  - "emt-015"
  - "need tax returns"
  - "processing"
related_templates:
  - "EMT-014"
  - "EMT-016"
tags:
  - "borrower"
  - "document-collection-templates"
  - "emt-015"
  - "fully-automated"
  - "loan-coordinator"
  - "low"
  - "need-tax-returns"
  - "processing"
  - "status-update"
---

## EMT-015 Need Tax Returns

- Template name: Need tax returns
- Use case: Request tax returns for income or self-employed review.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Tax returns needed
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`
- Optional placeholders: `{{PhoneNumber}}`
- Compliance notes: Do not diagnose income eligibility in the request.
- Follow up timing: Same day the need is identified.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We need tax returns uploaded for the loan review. Please use the secure portal:

`{{ApplicationLink}}`

Once uploaded, the team will review them with the rest of your file.

Thank you,  
`{{LoanCoordinatorName}}`

---
id: EMT-016
title: "Need Explanation Letter"
category: "Document Collection Templates"
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
purpose: "Ask borrower for a written explanation without suggesting exact content."
communication_type: "Education"
workflow_step: "Processing - Need Explanation Letter"
workflow_trigger: "Explanation letter condition opened"
automation_trigger: "Explanation letter condition opened"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Explanation letter needed"
required_merge_fields:
  - "{{ApplicationLink}}"
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{LoanOfficerName}}"
required_attachments:
  - "Explanation letter"
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "borrower"
  - "document collection templates"
  - "emt-016"
  - "need explanation letter"
  - "processing"
related_templates:
  - "EMT-015"
  - "EMT-017"
tags:
  - "borrower"
  - "document-collection-templates"
  - "education"
  - "emt-016"
  - "fully-automated"
  - "loan-coordinator"
  - "low"
  - "need-explanation-letter"
  - "processing"
---

## EMT-016 Need Explanation Letter

- Template name: Need explanation letter
- Use case: Ask borrower for a written explanation without suggesting exact content.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Explanation letter needed
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanOfficerName}}`
- Compliance notes: Do not coach borrower to misstate facts. Ask for a truthful explanation.
- Follow up timing: Same day the need is identified.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We need a short written explanation for the item requested in your portal. Please keep it truthful, simple, and in your own words.

Upload it here:

`{{ApplicationLink}}`

If you are unsure what the request is asking for, call us at `{{PhoneNumber}}` before writing it.

Thank you,  
`{{LoanCoordinatorName}}`


---
id: EMT-075
title: "ITIN Required Documents"
category: "Document Collection Templates"
loan_stage: "Processing"
audience:
  - "Borrower"
loan_programs:
  - "ITIN"
  - "Non-QM"
language: "English"
priority: "High"
purpose: "Request ITIN loan documents while limiting requests to lending requirements."
communication_type: "Request"
workflow_step: "Processing - ITIN Required Documents"
workflow_trigger: "ITIN Required Documents needed"
automation_trigger: "ITIN Required Documents needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Documents needed for ITIN loan review"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{ApplicationLink}}"
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
  - "document collection templates"
  - "documents"
  - "emt-075"
  - "itin"
  - "itin required documents"
  - "non qm"
  - "processing"
related_templates:
  - "EMT-066"
  - "EMT-088"
  - "EMT-010"
tags:
  - "borrower"
  - "document-collection-templates"
  - "documents"
  - "emt-075"
  - "high"
  - "itin"
  - "itin-required-documents"
  - "loan-coordinator"
  - "non-qm"
  - "processing"
  - "request"
  - "semi-automated"
---

## EMT-075 ITIN Required Documents

- Template name: ITIN Required Documents
- Use case: Request ITIN loan documents while limiting requests to lending requirements.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Documents needed for ITIN loan review
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Keep requests focused on lending requirements. Do not request unnecessary immigration details or imply ITIN status guarantees approval. Include compliance line.
- Follow up timing: Same day the ITIN document checklist is created.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We need the documents listed in your portal to continue the ITIN loan review.

Please upload only the items requested for the lending review. If something is not listed, ask us before sending extra personal documents.

`{{ApplicationLink}}`

Receiving documents does not mean the file is approved. It gives the lender what they need to continue review.

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-076
title: "Foreign National Required Documents"
category: "Document Collection Templates"
loan_stage: "Processing"
audience:
  - "Borrower"
loan_programs:
  - "Foreign National"
  - "Non-QM"
language: "English"
priority: "High"
purpose: "Request foreign national loan documents without asking for unnecessary immigration details."
communication_type: "Request"
workflow_step: "Processing - Foreign National Required Documents"
workflow_trigger: "Foreign National Required Documents needed"
automation_trigger: "Foreign National Required Documents needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Documents needed for foreign national loan review"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{ApplicationLink}}"
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
  - "document collection templates"
  - "documents"
  - "emt-076"
  - "foreign national"
  - "foreign national required documents"
  - "non qm"
  - "processing"
related_templates:
  - "EMT-067"
  - "EMT-089"
  - "EMT-010"
tags:
  - "borrower"
  - "document-collection-templates"
  - "documents"
  - "emt-076"
  - "foreign-national"
  - "foreign-national-required-documents"
  - "high"
  - "loan-coordinator"
  - "non-qm"
  - "processing"
  - "request"
  - "semi-automated"
---

## EMT-076 Foreign National Required Documents

- Template name: Foreign National Required Documents
- Use case: Request foreign national loan documents without asking for unnecessary immigration details.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Documents needed for foreign national loan review
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Request only documents needed for lending review. Do not imply citizenship, residency, or foreign national status guarantees approval. Include compliance line.
- Follow up timing: Same day the foreign national checklist is created.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We need the documents listed in your portal to continue the foreign national loan review.

Please upload only the lending documents requested. If a request is unclear, reply here before sending extra personal information.

`{{ApplicationLink}}`

The lender still needs to review the complete file, including assets, credit, property, reserves, and program guidelines.

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-077
title: "DSCR Required Documents"
category: "Document Collection Templates"
loan_stage: "Processing"
audience:
  - "Borrower"
loan_programs:
  - "DSCR"
  - "Investor"
  - "Non-QM"
language: "English"
priority: "High"
purpose: "Request documents needed for DSCR investor review."
communication_type: "Request"
workflow_step: "Processing - DSCR Required Documents"
workflow_trigger: "DSCR Required Documents needed"
automation_trigger: "DSCR Required Documents needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Documents needed for DSCR review"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{ApplicationLink}}"
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
  - "document collection templates"
  - "documents"
  - "dscr"
  - "dscr required documents"
  - "emt-077"
  - "investor"
  - "processing"
  - "rental income"
related_templates:
  - "EMT-068"
  - "EMT-090"
  - "EMT-100"
tags:
  - "borrower"
  - "document-collection-templates"
  - "documents"
  - "dscr"
  - "dscr-required-documents"
  - "emt-077"
  - "high"
  - "investor"
  - "loan-coordinator"
  - "processing"
  - "rental-income"
  - "request"
  - "semi-automated"
---

## EMT-077 DSCR Required Documents

- Template name: DSCR Required Documents
- Use case: Request documents needed for DSCR investor review.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Documents needed for DSCR review
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Make clear DSCR review depends on property cash flow, rental income, credit, equity, reserves, and lender guidelines. Include compliance line.
- Follow up timing: Same day DSCR checklist is created.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We need the DSCR documents listed in your portal so the file can move forward.

The lender will review property cash flow, rental income support, credit, equity, reserves, appraisal, title, insurance, and program guidelines.

`{{ApplicationLink}}`

Please upload the requested items and let us know if any rental or property document is not available yet.

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-078
title: "Construction Loan Document Checklist"
category: "Document Collection Templates"
loan_stage: "Processing"
audience:
  - "Borrower"
loan_programs:
  - "Construction"
  - "Conventional"
  - "Jumbo"
  - "Non-QM"
language: "English"
priority: "High"
purpose: "Request construction loan documents needed for lender review."
communication_type: "Request"
workflow_step: "Processing - Construction Loan Document Checklist"
workflow_trigger: "Construction Loan Document Checklist needed"
automation_trigger: "Construction Loan Document Checklist needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Construction loan documents needed"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{ApplicationLink}}"
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
  - "budget"
  - "builder"
  - "construction"
  - "construction loan document checklist"
  - "document collection templates"
  - "emt-078"
  - "plans"
  - "processing"
related_templates:
  - "EMT-091"
  - "EMT-098"
  - "EMT-113"
tags:
  - "borrower"
  - "budget"
  - "builder"
  - "construction"
  - "construction-loan-document-checklist"
  - "document-collection-templates"
  - "emt-078"
  - "high"
  - "loan-coordinator"
  - "plans"
  - "processing"
  - "request"
  - "semi-automated"
---

## EMT-078 Construction Loan Document Checklist

- Template name: Construction Loan Document Checklist
- Use case: Request construction loan documents needed for lender review.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Construction loan documents needed
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Make clear builder approval, plans, specs, budget, appraisal, title, insurance, and underwriting all matter. Do not promise construction approval. Include compliance line.
- Follow up timing: When construction loan checklist is opened.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We need the construction documents listed in your portal before the lender can complete a meaningful review.

Construction loans usually require builder information, plans, specs, budget, contract details, property information, title, insurance, and full underwriting review.

`{{ApplicationLink}}`

Please upload what you have now. If the builder package or budget is still being prepared, reply with that status so we can plan the next step.

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-079
title: "One Time Close Construction Checklist"
category: "Document Collection Templates"
loan_stage: "Processing"
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
purpose: "Request documents for a one time close construction review."
communication_type: "Request"
workflow_step: "Processing - One Time Close Construction Checklist"
workflow_trigger: "One Time Close Construction Checklist needed"
automation_trigger: "One Time Close Construction Checklist needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "One Time Close construction documents needed"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{ApplicationLink}}"
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
  - "builder"
  - "construction"
  - "document collection templates"
  - "emt-079"
  - "one time close"
  - "one time close construction checklist"
  - "otc"
  - "processing"
related_templates:
  - "EMT-092"
  - "EMT-099"
  - "EMT-121"
tags:
  - "borrower"
  - "builder"
  - "construction"
  - "document-collection-templates"
  - "emt-079"
  - "high"
  - "loan-coordinator"
  - "one-time-close"
  - "one-time-close-construction-checklist"
  - "otc"
  - "processing"
  - "request"
  - "semi-automated"
---

## EMT-079 One Time Close Construction Checklist

- Template name: One Time Close Construction Checklist
- Use case: Request documents for a one time close construction review.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: One Time Close construction documents needed
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Make clear one time close review still depends on builder approval, plans, specs, budget, appraisal, title, insurance, disclosures, and underwriting. Include compliance line.
- Follow up timing: When one time close checklist is opened.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We need the One Time Close construction documents listed in your portal to continue the review.

This type of loan has several moving pieces: builder approval, plans, specs, budget, appraisal, title, insurance, disclosures, and underwriting review.

`{{ApplicationLink}}`

Please upload the available items and let us know what is still pending from the builder or contractor.

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-080
title: "Manufactured Home Documentation"
category: "Document Collection Templates"
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
purpose: "Request manufactured home documents needed for lender and property review."
communication_type: "Request"
workflow_step: "Processing - Manufactured Home Documentation"
workflow_trigger: "Manufactured Home Documentation needed"
automation_trigger: "Manufactured Home Documentation needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Manufactured home documents needed"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{ApplicationLink}}"
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
  - "data plate"
  - "document collection templates"
  - "emt-080"
  - "foundation"
  - "hud tags"
  - "manufactured home"
  - "manufactured home documentation"
  - "processing"
related_templates:
  - "EMT-093"
  - "EMT-103"
  - "EMT-115"
tags:
  - "borrower"
  - "data-plate"
  - "document-collection-templates"
  - "emt-080"
  - "foundation"
  - "high"
  - "hud-tags"
  - "loan-coordinator"
  - "manufactured-home"
  - "manufactured-home-documentation"
  - "processing"
  - "request"
  - "semi-automated"
---

## EMT-080 Manufactured Home Documentation

- Template name: Manufactured Home Documentation
- Use case: Request manufactured home documents needed for lender and property review.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Manufactured home documents needed
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Mention title, foundation, HUD tags, data plate, engineer report, land ownership, and lender requirements where relevant. Do not assume all manufactured homes qualify. Include compliance line.
- Follow up timing: When manufactured home documentation is needed.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We need the manufactured home documents listed in your portal to continue the property review.

Depending on the file, the lender may need title details, foundation information, HUD tags, the data plate, an engineer report, land ownership details, appraisal, insurance, and lender-specific requirements.

`{{ApplicationLink}}`

Not every manufactured home qualifies for every loan program, so the documentation review is important before we can confirm the next step.

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-081
title: "Renovation Loan Documentation"
category: "Document Collection Templates"
loan_stage: "Processing"
audience:
  - "Borrower"
loan_programs:
  - "Renovation"
  - "FHA 203k"
  - "Conventional Renovation"
language: "English"
priority: "High"
purpose: "Request renovation loan documents for contractor, bid, scope, and lender review."
communication_type: "Request"
workflow_step: "Processing - Renovation Loan Documentation"
workflow_trigger: "Renovation Loan Documentation needed"
automation_trigger: "Renovation Loan Documentation needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Renovation loan documents needed"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{ApplicationLink}}"
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
  - "bid"
  - "borrower"
  - "contractor"
  - "document collection templates"
  - "emt-081"
  - "processing"
  - "renovation"
  - "renovation loan documentation"
  - "scope"
related_templates:
  - "EMT-094"
  - "EMT-104"
  - "EMT-114"
tags:
  - "bid"
  - "borrower"
  - "contractor"
  - "document-collection-templates"
  - "emt-081"
  - "high"
  - "loan-coordinator"
  - "processing"
  - "renovation"
  - "renovation-loan-documentation"
  - "request"
  - "scope"
  - "semi-automated"
---

## EMT-081 Renovation Loan Documentation

- Template name: Renovation Loan Documentation
- Use case: Request renovation loan documents for contractor, bid, scope, and lender review.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Renovation loan documents needed
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Clarify final scope, contractor approval, bid, appraisal, and lender review determine approval. Include compliance line.
- Follow up timing: When renovation checklist is created.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We need the renovation documents listed in your portal before the lender can complete the review.

Renovation files usually depend on the final scope of work, contractor approval, bid, appraisal review, property eligibility, and lender guidelines.

`{{ApplicationLink}}`

Please upload the available contractor and project documents. If the bid or scope is still being finalized, reply with that update.

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-082
title: "Reverse Mortgage Documentation"
category: "Document Collection Templates"
loan_stage: "Processing"
audience:
  - "Borrower"
loan_programs:
  - "Reverse Mortgage"
  - "HECM"
language: "English"
priority: "High"
purpose: "Request reverse mortgage documents and explain counseling/document review boundaries."
communication_type: "Request"
workflow_step: "Processing - Reverse Mortgage Documentation"
workflow_trigger: "Reverse Mortgage Documentation needed"
automation_trigger: "Reverse Mortgage Documentation needed"
automation_timing: "Manual Only"
automation_ready: "Manual Only"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Reverse mortgage documents needed"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{ApplicationLink}}"
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
  - "counseling"
  - "document collection templates"
  - "documents"
  - "emt-082"
  - "hecm"
  - "processing"
  - "reverse mortgage"
  - "reverse mortgage documentation"
related_templates:
  - "EMT-069"
  - "EMT-095"
  - "EMT-105"
tags:
  - "borrower"
  - "counseling"
  - "document-collection-templates"
  - "documents"
  - "emt-082"
  - "hecm"
  - "high"
  - "loan-coordinator"
  - "manual-only"
  - "processing"
  - "request"
  - "reverse-mortgage"
  - "reverse-mortgage-documentation"
---

## EMT-082 Reverse Mortgage Documentation

- Template name: Reverse Mortgage Documentation
- Use case: Request reverse mortgage documents and explain counseling/document review boundaries.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Reverse mortgage documents needed
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Do not make suitability claims or pressure borrower. Mention required counseling when relevant. Include compliance line.
- Follow up timing: When reverse mortgage document checklist is opened.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We need the reverse mortgage documents listed in your portal to continue the file review.

This review may include required counseling, property details, payoff information, occupancy items, age-related eligibility requirements, appraisal, title, insurance, and lender guidelines.

`{{ApplicationLink}}`

Please upload the requested items when ready. This request is not a recommendation that a reverse mortgage is right for you.

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-083
title: "Credit Rescore Documentation Request"
category: "Document Collection Templates"
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
purpose: "Request documentation needed to review a possible credit rescore."
communication_type: "Request"
workflow_step: "Processing - Credit Rescore Documentation Request"
workflow_trigger: "Credit Rescore Documentation Request needed"
automation_trigger: "Credit Rescore Documentation Request needed"
automation_timing: "Manual Only"
automation_ready: "Manual Only"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Documentation needed for credit rescore review"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{ApplicationLink}}"
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
  - "credit bureau"
  - "credit rescore"
  - "credit rescore documentation request"
  - "document collection templates"
  - "emt-083"
  - "processing"
  - "score"
related_templates:
  - "EMT-009"
  - "EMT-112"
  - "EMT-010"
tags:
  - "borrower"
  - "credit-bureau"
  - "credit-rescore"
  - "credit-rescore-documentation-request"
  - "document-collection-templates"
  - "emt-083"
  - "high"
  - "loan-coordinator"
  - "manual-only"
  - "processing"
  - "request"
  - "score"
---

## EMT-083 Credit Rescore Documentation Request

- Template name: Credit Rescore Documentation Request
- Use case: Request documentation needed to review a possible credit rescore.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Documentation needed for credit rescore review
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Do not guarantee score increases. Explain results depend on bureau update and credit model. Include compliance line.
- Follow up timing: When a possible rescore path is identified.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We need documentation to review whether a credit rescore request can be submitted.

A rescore does not guarantee a score increase. Results depend on the creditor update, credit bureau processing, the credit model, and lender review.

`{{ApplicationLink}}`

Please upload the requested proof of the update. If you are unsure what document is needed, call us before uploading.

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-084
title: "Gift Funds Received"
category: "Document Collection Templates"
loan_stage: "Processing"
audience:
  - "Borrower"
loan_programs:
  - "Conventional"
  - "FHA"
  - "VA"
  - "USDA"
  - "Jumbo"
language: "English"
priority: "Medium"
purpose: "Confirm gift fund documentation was received and remains subject to review."
communication_type: "Status Update"
workflow_step: "Processing - Gift Funds Received"
workflow_trigger: "Gift Funds Received needed"
automation_trigger: "Gift Funds Received needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Gift fund documents received"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{ApplicationLink}}"
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
  - "assets"
  - "borrower"
  - "document collection templates"
  - "emt-084"
  - "gift funds"
  - "gift funds received"
  - "gift letter"
  - "processing"
related_templates:
  - "EMT-085"
  - "EMT-026"
  - "EMT-010"
tags:
  - "assets"
  - "borrower"
  - "document-collection-templates"
  - "emt-084"
  - "gift-funds"
  - "gift-funds-received"
  - "gift-letter"
  - "loan-coordinator"
  - "medium"
  - "processing"
  - "semi-automated"
  - "status-update"
---

## EMT-084 Gift Funds Received

- Template name: Gift Funds Received
- Use case: Confirm gift fund documentation was received and remains subject to review.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Gift fund documents received
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Do not imply gift funds are accepted until lender review is complete. Include compliance line.
- Follow up timing: Same day gift documentation is received.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We received the gift fund documentation. Thank you.

The next step is lender review. Please do not move funds or make additional transfers without checking with us first, because gift funds usually need a clear paper trail.

If anything else is needed, we will send a specific request through the portal:

`{{ApplicationLink}}`

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-085
title: "Gift Funds Still Needed"
category: "Document Collection Templates"
loan_stage: "Processing"
audience:
  - "Borrower"
loan_programs:
  - "Conventional"
  - "FHA"
  - "VA"
  - "USDA"
  - "Jumbo"
language: "English"
priority: "High"
purpose: "Follow up when gift fund documentation remains open."
communication_type: "Request"
workflow_step: "Processing - Gift Funds Still Needed"
workflow_trigger: "Gift Funds Still Needed needed"
automation_trigger: "Gift Funds Still Needed needed"
automation_timing: "Wait 1 Day"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Gift fund documents still needed"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{ApplicationLink}}"
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
  - "assets missing"
  - "borrower"
  - "document collection templates"
  - "emt-085"
  - "gift funds"
  - "gift funds still needed"
  - "gift letter"
  - "processing"
related_templates:
  - "EMT-084"
  - "EMT-026"
  - "EMT-011"
tags:
  - "assets-missing"
  - "borrower"
  - "document-collection-templates"
  - "emt-085"
  - "gift-funds"
  - "gift-funds-still-needed"
  - "gift-letter"
  - "high"
  - "loan-coordinator"
  - "processing"
  - "request"
  - "semi-automated"
---

## EMT-085 Gift Funds Still Needed

- Template name: Gift Funds Still Needed
- Use case: Follow up when gift fund documentation remains open.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Gift fund documents still needed
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Do not imply blame or acceptance. Ask for clear documentation and lender review. Include compliance line.
- Follow up timing: One business day after gift fund request remains open.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We still need the gift fund documentation requested in your portal.

Gift funds usually need a clear paper trail, and the lender must review the documents before we can treat the item as cleared.

Please upload the requested item here:

`{{ApplicationLink}}`

If you are not sure what to provide, call us before moving money or uploading the wrong document.

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-086
title: "Self Employed Borrower Documents"
category: "Document Collection Templates"
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
  - "Self Employed"
language: "English"
priority: "High"
purpose: "Request self-employed borrower documents in plain language."
communication_type: "Request"
workflow_step: "Processing - Self Employed Borrower Documents"
workflow_trigger: "Self Employed Borrower Documents needed"
automation_trigger: "Self Employed Borrower Documents needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Self-employed documents needed"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{ApplicationLink}}"
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
  - "business income"
  - "document collection templates"
  - "emt-086"
  - "processing"
  - "self employed"
  - "self employed borrower documents"
  - "tax returns"
related_templates:
  - "EMT-015"
  - "EMT-071"
  - "EMT-090"
tags:
  - "borrower"
  - "business-income"
  - "document-collection-templates"
  - "emt-086"
  - "high"
  - "loan-coordinator"
  - "processing"
  - "request"
  - "self-employed"
  - "self-employed-borrower-documents"
  - "semi-automated"
  - "tax-returns"
---

## EMT-086 Self Employed Borrower Documents

- Template name: Self Employed Borrower Documents
- Use case: Request self-employed borrower documents in plain language.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Self-employed documents needed
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Do not imply self-employment income is accepted until lender review is complete. Include compliance line.
- Follow up timing: When self-employed income documentation is required.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We need the self-employed borrower documents listed in your portal to continue the income review.

Self-employed income can require a closer look at tax returns, business activity, deposits, year-to-date information, and lender guidelines.

`{{ApplicationLink}}`

Please upload the requested items. If an item does not apply to your business, reply and we will help clarify the next step.

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-087
title: "Builder Package Needed"
category: "Document Collection Templates"
loan_stage: "Processing"
audience:
  - "Borrower"
loan_programs:
  - "Construction"
  - "One Time Close Construction"
  - "New Construction"
language: "English"
priority: "High"
purpose: "Request builder package information for construction or new construction review."
communication_type: "Request"
workflow_step: "Processing - Builder Package Needed"
workflow_trigger: "Builder Package Needed needed"
automation_trigger: "Builder Package Needed needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Coordinator"
recommended_subject: "Builder package needed"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanCoordinatorName}}"
  - "{{ApplicationLink}}"
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
  - "builder approval"
  - "builder package"
  - "builder package needed"
  - "construction"
  - "document collection templates"
  - "emt-087"
  - "processing"
related_templates:
  - "EMT-078"
  - "EMT-079"
  - "EMT-091"
tags:
  - "borrower"
  - "builder-approval"
  - "builder-package"
  - "builder-package-needed"
  - "construction"
  - "document-collection-templates"
  - "emt-087"
  - "high"
  - "loan-coordinator"
  - "processing"
  - "request"
  - "semi-automated"
---

## EMT-087 Builder Package Needed

- Template name: Builder Package Needed
- Use case: Request builder package information for construction or new construction review.
- Audience: Borrower
- Recommended sender: Loan Coordinator
- Subject line: Builder package needed
- Required placeholders: `{{BorrowerName}}`, `{{LoanCoordinatorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Do not promise builder or construction approval. Builder approval, plans, specs, budget, appraisal, title, insurance, and underwriting all matter. Include compliance line.
- Follow up timing: When builder package is missing or incomplete.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We still need the builder package for the construction review.

The lender may need builder approval documents, plans, specs, budget, contract details, insurance, license information, and other items before the file can move forward.

`{{ApplicationLink}}`

Please upload anything you have now, and reply with the builder contact if you want us to coordinate the missing items.

Thank you,  
`{{LoanCoordinatorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
