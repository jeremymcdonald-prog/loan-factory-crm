# Clear To Close And Closing Templates

## Table Of Contents

- [EMT-038 Closing Disclosure Sent](#emt-038-closing-disclosure-sent)
- [EMT-039 Clear To Close](#emt-039-clear-to-close)
- [EMT-040 Closing Scheduled](#emt-040-closing-scheduled)
- [EMT-041 Closing Day Congratulations](#emt-041-closing-day-congratulations)
- [EMT-042 Funded And Recorded](#emt-042-funded-and-recorded)
- [EMT-120 Construction Clear to Close](#emt-120-construction-clear-to-close)
- [EMT-121 One Time Close Ready to Close](#emt-121-one-time-close-ready-to-close)
- [EMT-122 Reverse Mortgage Closing Scheduled](#emt-122-reverse-mortgage-closing-scheduled)
- [EMT-123 Congratulations on Closing Day](#emt-123-congratulations-on-closing-day)
- [EMT-124 Seller Credit Update](#emt-124-seller-credit-update)
- [EMT-125 Final Verification of Employment](#emt-125-final-verification-of-employment)
- [EMT-126 Wire Fraud Reminder](#emt-126-wire-fraud-reminder)

---
id: EMT-038
title: "Closing Disclosure Sent"
category: "Clear to Close and Closing Templates"
loan_stage: "Closing"
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
purpose: "Tell borrower the Closing Disclosure is available for review."
communication_type: "Status Update"
workflow_step: "Closing - Closing Disclosure Sent"
workflow_trigger: "Closing Disclosure sent"
automation_trigger: "Closing Disclosure sent"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Closing Disclosure ready for review"
required_merge_fields:
  - "{{ApplicationLink}}"
  - "{{BorrowerName}}"
  - "{{PhoneNumber}}"
  - "{{ProcessorName}}"
optional_merge_fields:
  - "{{ClosingDate}}"
required_attachments:
  - "Closing Disclosure"
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "borrower"
  - "clear to close and closing templates"
  - "closing"
  - "closing disclosure sent"
  - "emt-038"
related_templates:
  - "EMT-037"
  - "EMT-039"
  - "EMT-040"
tags:
  - "borrower"
  - "clear-to-close-and-closing-templates"
  - "closing"
  - "closing-disclosure-sent"
  - "emt-038"
  - "fully-automated"
  - "high"
  - "processor"
  - "status-update"
---

## EMT-038 Closing Disclosure Sent

- Template name: Closing disclosure sent
- Use case: Tell borrower the Closing Disclosure is available for review.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Closing Disclosure ready for review
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{ApplicationLink}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{ClosingDate}}`
- Compliance notes: Closing Disclosure is not final funding or closing confirmation. Include compliance line.
- Follow up timing: Immediately after Closing Disclosure is sent.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Your Closing Disclosure is ready for review in the secure portal:

`{{ApplicationLink}}`

Please review it carefully. Some items may still be updated before final closing, so contact us if anything looks different than expected.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.

---
id: EMT-039
title: "Clear To Close"
category: "Clear to Close and Closing Templates"
loan_stage: "Closing"
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
purpose: "Notify borrower that lender issued clear to close."
communication_type: "Status Update"
workflow_step: "Closing - Clear To Close"
workflow_trigger: "Clear to close issued"
automation_trigger: "Clear to close issued"
automation_timing: "Send Immediately"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Clear to close update"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{PhoneNumber}}"
  - "{{ProcessorName}}"
optional_merge_fields:
  - "{{ClosingDate}}"
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
  - "clear to close"
  - "clear to close and closing templates"
  - "closing"
  - "emt-039"
related_templates:
  - "EMT-038"
  - "EMT-040"
  - "EMT-042"
tags:
  - "borrower"
  - "clear-to-close"
  - "clear-to-close-and-closing-templates"
  - "closing"
  - "emt-039"
  - "high"
  - "processor"
  - "semi-automated"
  - "status-update"
---

## EMT-039 Clear To Close

- Template name: Clear to close
- Use case: Notify borrower that lender issued clear to close.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Clear to close update
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{ClosingDate}}`, `{{PropertyAddress}}`
- Compliance notes: Clear to close does not mean funding is complete. Closing logistics and final review still matter.
- Follow up timing: Same day lender issues clear to close.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Good news: the lender has issued clear to close.

This means we can move into the final closing steps. Timing still depends on closing documents, title coordination, any final lender or QC checks, and the scheduled signing.

We will send the next steps as soon as they are confirmed.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

---
id: EMT-040
title: "Closing Scheduled"
category: "Clear to Close and Closing Templates"
loan_stage: "Closing"
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
purpose: "Confirm a scheduled closing appointment."
communication_type: "Status Update"
workflow_step: "Closing - Closing Scheduled"
workflow_trigger: "Closing appointment scheduled"
automation_trigger: "Closing appointment scheduled"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Closing scheduled for {{ClosingDate}}"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{ClosingDate}}"
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
  - "borrower"
  - "clear to close and closing templates"
  - "closing"
  - "closing scheduled"
  - "emt-040"
related_templates:
  - "EMT-039"
  - "EMT-041"
tags:
  - "borrower"
  - "clear-to-close-and-closing-templates"
  - "closing"
  - "closing-scheduled"
  - "emt-040"
  - "fully-automated"
  - "medium"
  - "processor"
  - "status-update"
---

## EMT-040 Closing Scheduled

- Template name: Closing scheduled
- Use case: Confirm a scheduled closing appointment.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Closing scheduled for `{{ClosingDate}}`
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{ClosingDate}}`, `{{PropertyAddress}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{RealtorName}}`
- Compliance notes: Include wire-fraud caution. Do not guarantee funding.
- Follow up timing: As soon as appointment is confirmed.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Your closing for `{{PropertyAddress}}` is scheduled for `{{ClosingDate}}`.

Please watch for final signing instructions from the settlement team. Do not trust wiring instructions sent by an unexpected email or text. Always verify wiring instructions directly with the title or settlement company using a known phone number.

We will keep tracking the file through signing and funding.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

---
id: EMT-041
title: "Closing Day Congratulations"
category: "Clear to Close and Closing Templates"
loan_stage: "Closing"
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
purpose: "Congratulate borrower on signing day without claiming funding unless confirmed."
communication_type: "Status Update"
workflow_step: "Closing - Closing Day Congratulations"
workflow_trigger: "Closing day reached"
automation_trigger: "Closing day reached"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Congratulations on closing day"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanOfficerName}}"
  - "{{NMLS}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{PropertyAddress}}"
  - "{{RealtorName}}"
required_attachments: []
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "borrower"
  - "clear to close and closing templates"
  - "closing"
  - "closing day congratulations"
  - "emt-041"
related_templates:
  - "EMT-040"
  - "EMT-042"
tags:
  - "borrower"
  - "clear-to-close-and-closing-templates"
  - "closing"
  - "closing-day-congratulations"
  - "emt-041"
  - "fully-automated"
  - "loan-officer"
  - "medium"
  - "status-update"
---

## EMT-041 Closing Day Congratulations

- Template name: Closing day congratulations
- Use case: Congratulate borrower on signing day without claiming funding unless confirmed.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: Congratulations on closing day
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{PropertyAddress}}`, `{{RealtorName}}`
- Compliance notes: If funding/recording is not confirmed, say signing or closing appointment only.
- Follow up timing: Day of signing or confirmed closing.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Congratulations on closing day. This is a big step, and I appreciate the trust you placed in our team.

Our team will keep watching the final funding and recording confirmations. If anything still needs attention, we will reach out quickly.

I am grateful we had the chance to help.

`{{LoanOfficerName}}`  
`{{PhoneNumber}}`  
NMLS `{{NMLS}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.

---
id: EMT-042
title: "Funded And Recorded"
category: "Clear to Close and Closing Templates"
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
priority: "Medium"
purpose: "Confirm funding and recording are complete."
communication_type: "Status Update"
workflow_step: "Funding - Funded And Recorded"
workflow_trigger: "Funding and recording confirmed"
automation_trigger: "Funding and recording confirmed"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Your loan has funded and recorded"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{PhoneNumber}}"
  - "{{ProcessorName}}"
optional_merge_fields:
  - "{{LoanOfficerName}}"
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
  - "clear to close and closing templates"
  - "closing"
  - "emt-042"
  - "funded and recorded"
  - "funding"
related_templates:
  - "EMT-041"
  - "EMT-043"
tags:
  - "borrower"
  - "clear-to-close-and-closing-templates"
  - "closing"
  - "emt-042"
  - "fully-automated"
  - "funded-and-recorded"
  - "funding"
  - "medium"
  - "processor"
  - "status-update"
---

## EMT-042 Funded And Recorded

- Template name: Funded and recorded
- Use case: Confirm funding and recording are complete.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Your loan has funded and recorded
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{PropertyAddress}}`, `{{LoanOfficerName}}`
- Compliance notes: Send only after funding and recording are confirmed by source record.
- Follow up timing: Same day confirmation is received.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Your loan has funded and recorded based on the confirmation we received.

Congratulations again. If you have questions after closing, our team is still here to help point you in the right direction.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`


---
id: EMT-120
title: "Construction Clear to Close"
category: "Clear to Close and Closing Templates"
loan_stage: "Closing"
audience:
  - "Borrower"
loan_programs:
  - "Construction"
  - "Conventional"
  - "Jumbo"
  - "Non-QM"
language: "English"
priority: "High"
purpose: "Notify borrower that construction file is clear to close while keeping construction dependencies clear."
communication_type: "Status Update"
workflow_step: "Closing - Construction Clear to Close"
workflow_trigger: "Construction Clear to Close needed"
automation_trigger: "Construction Clear to Close needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Construction loan clear to close update"
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
  - "clear to close"
  - "clear to close and closing templates"
  - "closing"
  - "construction"
  - "construction clear to close"
  - "emt-120"
related_templates:
  - "EMT-106"
  - "EMT-113"
  - "EMT-040"
tags:
  - "borrower"
  - "clear-to-close"
  - "clear-to-close-and-closing-templates"
  - "closing"
  - "construction"
  - "construction-clear-to-close"
  - "emt-120"
  - "high"
  - "processor"
  - "semi-automated"
  - "status-update"
---

## EMT-120 Construction Clear to Close

- Template name: Construction Clear to Close
- Use case: Notify borrower that construction file is clear to close while keeping construction dependencies clear.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Construction loan clear to close update
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Send only after clear to close is confirmed. Do not promise funding or construction approval beyond confirmed status. Include compliance line.
- Follow up timing: Same day clear to close is confirmed.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Your construction loan file has reached clear to close based on the confirmation we received.

This means the lender has cleared the file for closing preparation. Funding, final signing, title, insurance, and any construction-specific closing requirements still need to be completed correctly.

We will send the final closing details as soon as they are confirmed.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-121
title: "One Time Close Ready to Close"
category: "Clear to Close and Closing Templates"
loan_stage: "Closing"
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
purpose: "Notify borrower that One Time Close file is ready for closing preparation."
communication_type: "Status Update"
workflow_step: "Closing - One Time Close Ready to Close"
workflow_trigger: "One Time Close Ready to Close needed"
automation_trigger: "One Time Close Ready to Close needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "One Time Close ready to close"
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
  - "clear to close and closing templates"
  - "closing"
  - "construction"
  - "emt-121"
  - "one time close"
  - "one time close ready to close"
  - "ready to close"
related_templates:
  - "EMT-107"
  - "EMT-092"
  - "EMT-040"
tags:
  - "borrower"
  - "clear-to-close-and-closing-templates"
  - "closing"
  - "construction"
  - "emt-121"
  - "high"
  - "one-time-close"
  - "one-time-close-ready-to-close"
  - "processor"
  - "ready-to-close"
  - "semi-automated"
  - "status-update"
---

## EMT-121 One Time Close Ready to Close

- Template name: One Time Close Ready to Close
- Use case: Notify borrower that One Time Close file is ready for closing preparation.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: One Time Close ready to close
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Send only after readiness is confirmed. Do not promise funding, construction start, or final approval beyond confirmed status. Include compliance line.
- Follow up timing: Same day closing readiness is confirmed.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Your One Time Close construction file is ready for closing preparation based on the confirmation we received.

This is a strong milestone, but final signing, funding, title, insurance, and construction-specific closing requirements still need to be completed correctly.

We will send the closing appointment details once they are confirmed.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-122
title: "Reverse Mortgage Closing Scheduled"
category: "Clear to Close and Closing Templates"
loan_stage: "Closing"
audience:
  - "Borrower"
loan_programs:
  - "Reverse Mortgage"
  - "HECM"
language: "English"
priority: "High"
purpose: "Confirm reverse mortgage closing appointment without pressure or suitability claims."
communication_type: "Status Update"
workflow_step: "Closing - Reverse Mortgage Closing Scheduled"
workflow_trigger: "Reverse Mortgage Closing Scheduled needed"
automation_trigger: "Reverse Mortgage Closing Scheduled needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Reverse mortgage closing scheduled"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{ProcessorName}}"
  - "{{ClosingDate}}"
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
  - "borrower"
  - "clear to close and closing templates"
  - "closing"
  - "closing scheduled"
  - "emt-122"
  - "reverse mortgage"
  - "reverse mortgage closing scheduled"
related_templates:
  - "EMT-111"
  - "EMT-095"
  - "EMT-040"
tags:
  - "borrower"
  - "clear-to-close-and-closing-templates"
  - "closing"
  - "closing-scheduled"
  - "emt-122"
  - "high"
  - "processor"
  - "reverse-mortgage"
  - "reverse-mortgage-closing-scheduled"
  - "semi-automated"
  - "status-update"
---

## EMT-122 Reverse Mortgage Closing Scheduled

- Template name: Reverse Mortgage Closing Scheduled
- Use case: Confirm reverse mortgage closing appointment without pressure or suitability claims.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Reverse mortgage closing scheduled
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{ClosingDate}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{PropertyAddress}}`, `{{LoanOfficerName}}`
- Compliance notes: Do not pressure borrower or make suitability claims. Send only after closing is scheduled. Include compliance line.
- Follow up timing: Same day reverse mortgage closing appointment is confirmed.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Your reverse mortgage closing appointment is scheduled for `{{ClosingDate}}`.

Please review the appointment details carefully and bring any items requested by the closing team. You should ask questions before signing anything you do not understand.

If anything changes or you need help, call us at `{{PhoneNumber}}`.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-123
title: "Congratulations on Closing Day"
category: "Clear to Close and Closing Templates"
loan_stage: "Closing"
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
priority: "Medium"
purpose: "Congratulate borrower on closing day without implying funding unless confirmed."
communication_type: "Status Update"
workflow_step: "Closing - Congratulations on Closing Day"
workflow_trigger: "Congratulations on Closing Day needed"
automation_trigger: "Congratulations on Closing Day needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Congratulations on closing day"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanOfficerName}}"
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
  - "borrower"
  - "clear to close and closing templates"
  - "closing"
  - "closing congratulations"
  - "closing day"
  - "congratulations on closing day"
  - "emt-123"
related_templates:
  - "EMT-041"
  - "EMT-042"
  - "EMT-127"
tags:
  - "borrower"
  - "clear-to-close-and-closing-templates"
  - "closing"
  - "closing-congratulations"
  - "closing-day"
  - "congratulations-on-closing-day"
  - "emt-123"
  - "loan-officer"
  - "medium"
  - "semi-automated"
  - "status-update"
---

## EMT-123 Congratulations on Closing Day

- Template name: Congratulations on Closing Day
- Use case: Congratulate borrower on closing day without implying funding unless confirmed.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: Congratulations on closing day
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Do not imply funding or recording is complete unless confirmed. Include compliance line.
- Follow up timing: On closing day after signing is confirmed or scheduled.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Congratulations on reaching closing day.

This is a big milestone. If funding or recording still needs to be completed, our team will continue watching that process and update you when it is confirmed.

Please keep copies of your signed documents and call or text me if anything feels unclear after the appointment.

`{{LoanOfficerName}}`  
NMLS `{{NMLS}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-124
title: "Seller Credit Update"
category: "Clear to Close and Closing Templates"
loan_stage: "Closing"
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
purpose: "Explain seller credit status or update without treating final cash to close as final too early."
communication_type: "Status Update"
workflow_step: "Closing - Seller Credit Update"
workflow_trigger: "Seller Credit Update needed"
automation_trigger: "Seller Credit Update needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Seller credit update"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{ProcessorName}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{PropertyAddress}}"
  - "{{ClosingDate}}"
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
  - "borrower"
  - "cash to close"
  - "clear to close and closing templates"
  - "closing"
  - "emt-124"
  - "seller credit"
  - "seller credit update"
related_templates:
  - "EMT-038"
  - "EMT-063"
  - "EMT-040"
tags:
  - "borrower"
  - "cash-to-close"
  - "clear-to-close-and-closing-templates"
  - "closing"
  - "emt-124"
  - "high"
  - "processor"
  - "seller-credit"
  - "seller-credit-update"
  - "semi-automated"
  - "status-update"
---

## EMT-124 Seller Credit Update

- Template name: Seller Credit Update
- Use case: Explain seller credit status or update without treating final cash to close as final too early.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Seller credit update
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{PropertyAddress}}`, `{{ClosingDate}}`, `{{LoanOfficerName}}`
- Compliance notes: Do not state final cash to close until verified through current disclosures and closing documents. Include compliance line.
- Follow up timing: When seller credit amount or treatment changes.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

We have an update on the seller credit for your file.

Seller credits must fit lender guidelines and be reflected correctly in the closing documents. They can affect costs or cash to close, but final numbers should only be trusted once the current disclosure and closing package are confirmed.

We will update you if the lender, title company, or closing team needs anything else.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-125
title: "Final Verification of Employment"
category: "Clear to Close and Closing Templates"
loan_stage: "Closing"
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
purpose: "Explain final verification of employment before closing."
communication_type: "Status Update"
workflow_step: "Closing - Final Verification of Employment"
workflow_trigger: "Final Verification of Employment needed"
automation_trigger: "Final Verification of Employment needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Final employment verification update"
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
  - "clear to close and closing templates"
  - "closing"
  - "emt-125"
  - "final verification of employment"
  - "verification of employment"
  - "voe"
related_templates:
  - "EMT-039"
  - "EMT-040"
  - "EMT-038"
tags:
  - "borrower"
  - "clear-to-close-and-closing-templates"
  - "closing"
  - "emt-125"
  - "final-verification-of-employment"
  - "high"
  - "processor"
  - "semi-automated"
  - "status-update"
  - "verification-of-employment"
  - "voe"
---

## EMT-125 Final Verification of Employment

- Template name: Final Verification of Employment
- Use case: Explain final verification of employment before closing.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Final employment verification update
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Do not imply closing is guaranteed. Employment verification must be completed according to lender requirements. Include compliance line.
- Follow up timing: When final verification of employment is required before closing.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

The lender needs a final verification of employment as part of the closing review.

This is a normal step on many files. The lender may verify current employment before final closing or funding steps are completed.

Please continue to avoid major employment, income, credit, or asset changes before closing. Call us if anything changes so we can review it quickly.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-126
title: "Wire Fraud Reminder"
category: "Clear to Close and Closing Templates"
loan_stage: "Closing"
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
purpose: "Warn borrower about wire fraud risk before closing."
communication_type: "Reminder"
workflow_step: "Closing - Wire Fraud Reminder"
workflow_trigger: "Wire Fraud Reminder needed"
automation_trigger: "Wire Fraud Reminder needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Processor"
recommended_subject: "Important wire fraud reminder"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{ProcessorName}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{ClosingDate}}"
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
  - "borrower"
  - "clear to close and closing templates"
  - "closing"
  - "closing funds"
  - "emt-126"
  - "title"
  - "wire fraud"
  - "wire fraud reminder"
related_templates:
  - "EMT-040"
  - "EMT-038"
  - "EMT-042"
tags:
  - "borrower"
  - "clear-to-close-and-closing-templates"
  - "closing"
  - "closing-funds"
  - "emt-126"
  - "high"
  - "processor"
  - "reminder"
  - "semi-automated"
  - "title"
  - "wire-fraud"
  - "wire-fraud-reminder"
---

## EMT-126 Wire Fraud Reminder

- Template name: Wire Fraud Reminder
- Use case: Warn borrower about wire fraud risk before closing.
- Audience: Borrower
- Recommended sender: Processor
- Subject line: Important wire fraud reminder
- Required placeholders: `{{BorrowerName}}`, `{{ProcessorName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{ClosingDate}}`, `{{PropertyAddress}}`
- Compliance notes: Provide safety warning without giving wiring instructions. Borrower should verify directly with title or escrow using a trusted number. Include compliance line.
- Follow up timing: Before closing when wire instructions may be sent by title or escrow.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Please be careful with any wire instructions you receive for closing.

Do not rely only on email instructions. Before sending money, call the title or escrow company using a trusted phone number you already verified, not a number from a new or unexpected email.

Our team will not ask you to change wiring instructions by email. If something feels off, pause and call us at `{{PhoneNumber}}`.

Thank you,  
`{{ProcessorName}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
