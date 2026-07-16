# Borrower First Contact Templates

## Table Of Contents

- [EMT-001 Realtor Asked Me To Reach Out About Pre Approval](#emt-001-realtor-asked-me-to-reach-out-about-pre-approval)
- [EMT-002 New Online Lead Introduction](#emt-002-new-online-lead-introduction)
- [EMT-003 Past Client Referral Introduction](#emt-003-past-client-referral-introduction)

---
id: EMT-001
title: "Realtor Asked Me To Reach Out About Pre Approval"
category: "Borrower First Contact Templates"
loan_stage: "Lead"
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
purpose: "A Realtor referred a buyer who needs pre-approval help."
communication_type: "Status Update"
workflow_step: "Lead - Realtor Asked Me To Reach Out About Pre Approval"
workflow_trigger: "Realtor referral created"
automation_trigger: "Realtor referral created"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Your pre-approval conversation"
required_merge_fields:
  - "{{ApplicationLink}}"
  - "{{BorrowerName}}"
  - "{{CompanyNMLS}}"
  - "{{LoanOfficerName}}"
  - "{{NMLS}}"
  - "{{PhoneNumber}}"
  - "{{RealtorName}}"
optional_merge_fields:
  - "{{LoanProgram}}"
  - "{{Website}}"
required_attachments: []
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "borrower"
  - "borrower first contact templates"
  - "emt-001"
  - "lead"
  - "pre approval"
  - "realtor"
  - "realtor asked me to reach out about pre approval"
related_templates:
  - "EMT-002"
  - "EMT-004"
  - "EMT-006"
tags:
  - "borrower"
  - "borrower-first-contact-templates"
  - "emt-001"
  - "fully-automated"
  - "lead"
  - "loan-officer"
  - "medium"
  - "pre-approval"
  - "status-update"
---

## EMT-001 Realtor Asked Me To Reach Out About Pre Approval

- Template name: Realtor asked me to reach out about pre approval
- Use case: A Realtor referred a buyer who needs pre-approval help.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: Your pre-approval conversation
- Required placeholders: `{{BorrowerName}}`, `{{RealtorName}}`, `{{LoanOfficerName}}`, `{{PhoneNumber}}`, `{{ApplicationLink}}`, `{{NMLS}}`, `{{CompanyNMLS}}`
- Optional placeholders: `{{LoanProgram}}`, `{{Website}}`
- Compliance notes: Do not imply approval. Position the next step as a review. Include compliance line.
- Follow up timing: Same day, then next business day if no response.
- Language versions if applicable: English master; localized versions supported in [15_Multilingual_Email_Template_Index.md](15_Multilingual_Email_Template_Index.md).

Email body:

Hi `{{BorrowerName}}`,

`{{RealtorName}}` asked me to reach out and help you get clear on your pre-approval options.

I am a mortgage broker, so my job is to compare options and help you find a path that fits your situation. The next step is simple: complete the secure application here:

`{{ApplicationLink}}`

Once I review it, I will let you know what we need next and where things stand. You can also call or text me at `{{PhoneNumber}}`.

`{{LoanOfficerName}}`  
NMLS `{{NMLS}}`  
Company NMLS `{{CompanyNMLS}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.

---
id: EMT-002
title: "New Online Lead Introduction"
category: "Borrower First Contact Templates"
loan_stage: "Lead"
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
purpose: "A borrower submitted an online inquiry and needs a human first response."
communication_type: "Introduction"
workflow_step: "Lead - New Online Lead Introduction"
workflow_trigger: "New online lead captured"
automation_trigger: "New online lead captured"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "I received your mortgage request"
required_merge_fields:
  - "{{ApplicationLink}}"
  - "{{BorrowerName}}"
  - "{{LoanOfficerName}}"
  - "{{NMLS}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{LoanProgram}}"
  - "{{Website}}"
required_attachments: []
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "borrower"
  - "borrower first contact templates"
  - "emt-002"
  - "lead"
  - "new online lead introduction"
related_templates:
  - "EMT-001"
  - "EMT-003"
tags:
  - "borrower"
  - "borrower-first-contact-templates"
  - "emt-002"
  - "fully-automated"
  - "introduction"
  - "lead"
  - "loan-officer"
  - "medium"
  - "new-online-lead-introduction"
---

## EMT-002 New Online Lead Introduction

- Template name: New online lead introduction
- Use case: A borrower submitted an online inquiry and needs a human first response.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: I received your mortgage request
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{PhoneNumber}}`, `{{ApplicationLink}}`, `{{NMLS}}`
- Optional placeholders: `{{LoanProgram}}`, `{{Website}}`
- Compliance notes: Keep options general until reviewed. Include compliance line.
- Follow up timing: Within 15 minutes during business hours when possible.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

I received your mortgage request. I will help you look at the options, explain what is realistic, and keep the process clear.

The fastest next step is to complete the secure application:

`{{ApplicationLink}}`

After I review it, I will follow up with the next items we need. If you want to talk first, call or text me at `{{PhoneNumber}}`.

`{{LoanOfficerName}}`  
NMLS `{{NMLS}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.

---
id: EMT-003
title: "Past Client Referral Introduction"
category: "Borrower First Contact Templates"
loan_stage: "Lead"
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
purpose: "A past client referred a borrower."
communication_type: "Introduction"
workflow_step: "Lead - Past Client Referral Introduction"
workflow_trigger: "Past client referral captured"
automation_trigger: "Past client referral captured"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Glad to connect"
required_merge_fields:
  - "{{ApplicationLink}}"
  - "{{BorrowerName}}"
  - "{{LoanOfficerName}}"
  - "{{NMLS}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{RealtorName}}"
  - "{{Website}}"
required_attachments: []
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "borrower"
  - "borrower first contact templates"
  - "emt-003"
  - "lead"
  - "past client"
  - "past client referral introduction"
  - "referral"
related_templates:
  - "EMT-002"
  - "EMT-004"
tags:
  - "borrower"
  - "borrower-first-contact-templates"
  - "emt-003"
  - "fully-automated"
  - "introduction"
  - "lead"
  - "loan-officer"
  - "medium"
  - "past-client"
---

## EMT-003 Past Client Referral Introduction

- Template name: Past client referral introduction
- Use case: A past client referred a borrower.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: Glad to connect
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{PhoneNumber}}`, `{{ApplicationLink}}`, `{{NMLS}}`
- Optional placeholders: `{{RealtorName}}`, `{{Website}}`
- Compliance notes: Thank the referral source without disclosing private details. Include compliance line.
- Follow up timing: Same day.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

I am glad we were connected. I help borrowers compare mortgage options and understand the next step without making the process harder than it needs to be.

Start here when you are ready:

`{{ApplicationLink}}`

Once I review the application, I will reach out with a clear next step. You can also call or text me at `{{PhoneNumber}}`.

`{{LoanOfficerName}}`  
NMLS `{{NMLS}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
