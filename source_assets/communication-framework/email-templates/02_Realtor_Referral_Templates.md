# Realtor Referral Templates

## Table Of Contents

- [EMT-004 Realtor Referral Received Confirmation](#emt-004-realtor-referral-received-confirmation)
- [EMT-005 Early Borrower Contact Update To Realtor](#emt-005-early-borrower-contact-update-to-realtor)

---
id: EMT-004
title: "Realtor Referral Received Confirmation"
category: "Realtor Referral Templates"
loan_stage: "Lead"
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
priority: "Medium"
purpose: "Confirm receipt of a Realtor referral."
communication_type: "Status Update"
workflow_step: "Lead - Realtor Referral Received Confirmation"
workflow_trigger: "Realtor referral received"
automation_trigger: "Realtor referral received"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "I received the referral"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanOfficerName}}"
  - "{{NMLS}}"
  - "{{PhoneNumber}}"
  - "{{RealtorName}}"
optional_merge_fields:
  - "{{EmailAddress}}"
  - "{{PropertyAddress}}"
required_attachments: []
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "emt-004"
  - "lead"
  - "realtor"
  - "realtor referral received confirmation"
  - "realtor referral templates"
  - "referral"
related_templates:
  - "EMT-003"
  - "EMT-005"
  - "EMT-001"
  - "EMT-008"
tags:
  - "emt-004"
  - "fully-automated"
  - "lead"
  - "loan-officer"
  - "medium"
  - "realtor"
  - "realtor-referral-received-confirmation"
  - "realtor-referral-templates"
  - "status-update"
---

## EMT-004 Realtor Referral Received Confirmation

- Template name: Realtor referral received confirmation
- Use case: Confirm receipt of a Realtor referral.
- Audience: Realtor
- Recommended sender: Loan Officer
- Subject line: I received the referral
- Required placeholders: `{{RealtorName}}`, `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{PropertyAddress}}`, `{{EmailAddress}}`
- Compliance notes: Do not share borrower private details unless authorized. Include compliance line when used as partner communication.
- Follow up timing: Immediately after referral is received.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{RealtorName}}`,

I received the referral for `{{BorrowerName}}`. Thank you for sending them over.

I will reach out, help them understand the next step, and keep you updated with appropriate status information, subject to borrower authorization and privacy limits. I will not overstate approval or pricing before the file is reviewed.

If anything is urgent, call or text me at `{{PhoneNumber}}`.

`{{LoanOfficerName}}`  
NMLS `{{NMLS}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.

---
id: EMT-005
title: "Early Borrower Contact Update To Realtor"
category: "Realtor Referral Templates"
loan_stage: "Lead"
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
priority: "Medium"
purpose: "Notify Realtor that borrower contact has started."
communication_type: "Status Update"
workflow_step: "Lead - Early Borrower Contact Update To Realtor"
workflow_trigger: "Borrower contact attempt logged"
automation_trigger: "Borrower contact attempt logged"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Quick update on {{BorrowerName}}"
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
  - "borrower"
  - "early borrower contact update to realtor"
  - "emt-005"
  - "lead"
  - "realtor"
  - "realtor referral templates"
  - "referral"
related_templates:
  - "EMT-004"
  - "EMT-006"
tags:
  - "borrower"
  - "early-borrower-contact-update-to-realtor"
  - "emt-005"
  - "fully-automated"
  - "lead"
  - "loan-officer"
  - "medium"
  - "realtor"
  - "status-update"
---

## EMT-005 Early Borrower Contact Update To Realtor

- Template name: Early borrower contact update to Realtor
- Use case: Notify Realtor that borrower contact has started.
- Audience: Realtor
- Recommended sender: Loan Officer
- Subject line: Quick update on `{{BorrowerName}}`
- Required placeholders: `{{RealtorName}}`, `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`, `{{PropertyAddress}}`
- Compliance notes: Keep the update high level. Do not disclose credit, income, assets, or private borrower details.
- Follow up timing: After first contact attempt or conversation.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{RealtorName}}`,

Quick update: I reached out to `{{BorrowerName}}` and started the mortgage conversation.

Next step is getting the application and supporting information reviewed. Once we have something appropriate to share, and subject to borrower authorization and privacy limits, I will keep you posted.

Thanks again for trusting me with the referral.

`{{LoanOfficerName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
