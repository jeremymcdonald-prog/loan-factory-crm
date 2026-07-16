# Post Closing And Past Client Templates

## Table Of Contents

- [EMT-043 Post Closing Thank You](#emt-043-post-closing-thank-you)
- [EMT-044 Review Request](#emt-044-review-request)
- [EMT-045 Past Client 30 Day Follow Up](#emt-045-past-client-30-day-follow-up)
- [EMT-046 Past Client 6 Month Check In](#emt-046-past-client-6-month-check-in)
- [EMT-047 Annual Mortgage Review](#emt-047-annual-mortgage-review)
- [EMT-127 One Week After Closing](#emt-127-one-week-after-closing)
- [EMT-128 Thirty Day Check In](#emt-128-thirty-day-check-in)
- [EMT-129 Six Month Mortgage Review](#emt-129-six-month-mortgage-review)
- [EMT-130 One Year Home Anniversary](#emt-130-one-year-home-anniversary)
- [EMT-131 Annual Mortgage Checkup](#emt-131-annual-mortgage-checkup)
- [EMT-132 Refinance Opportunity Review](#emt-132-refinance-opportunity-review)
- [EMT-133 Investor Portfolio Review for DSCR Clients](#emt-133-investor-portfolio-review-for-dscr-clients)
- [EMT-134 Construction Warranty Follow Up](#emt-134-construction-warranty-follow-up)
- [EMT-135 Welcome Home](#emt-135-welcome-home)

---
id: EMT-043
title: "Post Closing Thank You"
category: "Post Closing and Past Client Templates"
loan_stage: "Past Client"
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
purpose: "Thank borrower after closing."
communication_type: "Status Update"
workflow_step: "Past Client - Post Closing Thank You"
workflow_trigger: "Loan closed"
automation_trigger: "Loan closed"
automation_timing: "Send Immediately"
automation_ready: "Fully Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Thank you again"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanOfficerName}}"
  - "{{NMLS}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
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
  - "closing"
  - "emt-043"
  - "past client"
  - "post closing and past client templates"
  - "post closing thank you"
related_templates:
  - "EMT-042"
  - "EMT-044"
  - "EMT-045"
tags:
  - "borrower"
  - "closing"
  - "emt-043"
  - "fully-automated"
  - "loan-officer"
  - "low"
  - "past-client"
  - "post-closing-and-past-client-templates"
  - "status-update"
---

## EMT-043 Post Closing Thank You

- Template name: Post closing thank you
- Use case: Thank borrower after closing.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: Thank you again
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{PropertyAddress}}`
- Compliance notes: Do not ask for referrals in a way that sounds transactional or pressured.
- Follow up timing: 1 to 3 business days after confirmed closing.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Thank you again for trusting me and our team with your mortgage.

I know the process can have a lot of moving pieces, and I appreciate you staying responsive through it. If a mortgage question comes up later, call or text me at `{{PhoneNumber}}`.

`{{LoanOfficerName}}`  
NMLS `{{NMLS}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.

---
id: EMT-044
title: "Review Request"
category: "Post Closing and Past Client Templates"
loan_stage: "Past Client"
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
purpose: "Ask a satisfied borrower for a review."
communication_type: "Request"
workflow_step: "Past Client - Review Request"
workflow_trigger: "Post-closing review window reached"
automation_trigger: "Post-closing review window reached"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Quick favor if we earned it"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanOfficerName}}"
  - "{{NMLS}}"
  - "{{PhoneNumber}}"
  - "{{Website}}"
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
  - "closing"
  - "emt-044"
  - "past client"
  - "post closing and past client templates"
  - "review request"
related_templates:
  - "EMT-043"
  - "EMT-045"
tags:
  - "borrower"
  - "closing"
  - "emt-044"
  - "loan-officer"
  - "low"
  - "past-client"
  - "post-closing-and-past-client-templates"
  - "request"
  - "semi-automated"
---

## EMT-044 Review Request

- Template name: Review request
- Use case: Ask a satisfied borrower for a review.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: Quick favor if we earned it
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{Website}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: none
- Compliance notes: Do not condition anything of value on the review. Keep it optional.
- Follow up timing: 3 to 7 days after closing.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

If we earned it, I would appreciate a quick review. It helps future clients know what to expect when working with our team.

You can leave it here:

`{{Website}}`

No pressure. Either way, I appreciate the chance to help.

`{{LoanOfficerName}}`  
`{{PhoneNumber}}`  
NMLS `{{NMLS}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.

---
id: EMT-045
title: "Past Client 30 Day Follow Up"
category: "Post Closing and Past Client Templates"
loan_stage: "Past Client"
audience:
  - "Past client"
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
purpose: "Check in after first month."
communication_type: "Status Update"
workflow_step: "Past Client - Past Client 30 Day Follow Up"
workflow_trigger: "30 days after closing"
automation_trigger: "30 days after closing"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Checking in after closing"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanOfficerName}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{PropertyAddress}}"
required_attachments: []
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "closing"
  - "emt-045"
  - "past client"
  - "past client 30 day follow up"
  - "post closing and past client templates"
related_templates:
  - "EMT-044"
  - "EMT-046"
tags:
  - "closing"
  - "emt-045"
  - "loan-officer"
  - "low"
  - "past-client"
  - "past-client-30-day-follow-up"
  - "post-closing-and-past-client-templates"
  - "semi-automated"
  - "status-update"
---

## EMT-045 Past Client 30 Day Follow Up

- Template name: Past client 30 day follow up
- Use case: Check in after first month.
- Audience: Past client
- Recommended sender: Loan Officer
- Subject line: Checking in after closing
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{PropertyAddress}}`
- Compliance notes: Keep service-focused, not aggressive marketing.
- Follow up timing: 30 days after closing.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

I wanted to check in now that you are about a month past closing.

If any mortgage questions came up, or if you are still sorting through first-payment or servicing information, let me know. I am happy to point you in the right direction.

`{{LoanOfficerName}}`  
`{{PhoneNumber}}`

---
id: EMT-046
title: "Past Client 6 Month Check In"
category: "Post Closing and Past Client Templates"
loan_stage: "Past Client"
audience:
  - "Past client"
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
purpose: "Relationship check-in with past client."
communication_type: "Marketing/Nurture"
workflow_step: "Past Client - Past Client 6 Month Check In"
workflow_trigger: "6 months after closing"
automation_trigger: "6 months after closing"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Hope everything is going well"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanOfficerName}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{PropertyAddress}}"
required_attachments: []
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "closing"
  - "emt-046"
  - "past client"
  - "past client 6 month check in"
  - "post closing and past client templates"
related_templates:
  - "EMT-045"
  - "EMT-047"
tags:
  - "closing"
  - "emt-046"
  - "loan-officer"
  - "low"
  - "marketing-nurture"
  - "past-client"
  - "past-client-6-month-check-in"
  - "post-closing-and-past-client-templates"
  - "semi-automated"
---

## EMT-046 Past Client 6 Month Check In

- Template name: Past client 6 month check in
- Use case: Relationship check-in with past client.
- Audience: Past client
- Recommended sender: Loan Officer
- Subject line: Hope everything is going well
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{PhoneNumber}}`
- Optional placeholders: `{{PropertyAddress}}`
- Compliance notes: Do not imply refinance benefit without review.
- Follow up timing: 6 months after closing.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

I hope everything is going well with the home and the mortgage.

No action needed. I just wanted to stay available in case anything comes up or if you have questions about your current loan.

`{{LoanOfficerName}}`  
`{{PhoneNumber}}`

---
id: EMT-047
title: "Annual Mortgage Review"
category: "Post Closing and Past Client Templates"
loan_stage: "Past Client"
audience:
  - "Past client"
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
purpose: "Offer an annual loan review."
communication_type: "Marketing/Nurture"
workflow_step: "Past Client - Annual Mortgage Review"
workflow_trigger: "Annual mortgage review date"
automation_trigger: "Annual mortgage review date"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Annual mortgage review"
required_merge_fields:
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
  - "annual mortgage review"
  - "closing"
  - "emt-047"
  - "past client"
  - "post closing and past client templates"
related_templates:
  - "EMT-046"
  - "EMT-048"
  - "EMT-061"
  - "EMT-064"
tags:
  - "annual-mortgage-review"
  - "closing"
  - "emt-047"
  - "loan-officer"
  - "low"
  - "marketing-nurture"
  - "past-client"
  - "post-closing-and-past-client-templates"
  - "semi-automated"
---

## EMT-047 Annual Mortgage Review

- Template name: Annual mortgage review
- Use case: Offer an annual loan review.
- Audience: Past client
- Recommended sender: Loan Officer
- Subject line: Annual mortgage review
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Do not imply savings or refinance benefit. Include compliance line because it is marketing-focused.
- Follow up timing: Annually after closing.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

It may be a good time to review your mortgage and make sure it still fits your goals.

This is not a sales pitch. Sometimes the best answer is to keep things exactly as they are. I can help you look at the current loan, your plans, and whether anything is worth watching.

Call or text me at `{{PhoneNumber}}` if you want to review it.

`{{LoanOfficerName}}`  
NMLS `{{NMLS}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.


---
id: EMT-127
title: "One Week After Closing"
category: "Post Closing and Past Client Templates"
loan_stage: "Past Client"
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
priority: "Low"
purpose: "Check in one week after closing and answer early post-closing questions."
communication_type: "Status Update"
workflow_step: "Past Client - One Week After Closing"
workflow_trigger: "One Week After Closing needed"
automation_trigger: "One Week After Closing needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Checking in after closing"
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
  - "emt-127"
  - "one week after closing"
  - "past client"
  - "post closing and past client templates"
related_templates:
  - "EMT-043"
  - "EMT-128"
  - "EMT-135"
tags:
  - "borrower"
  - "emt-127"
  - "loan-officer"
  - "low"
  - "one-week-after-closing"
  - "past-client"
  - "post-closing-and-past-client-templates"
  - "semi-automated"
  - "status-update"
---

## EMT-127 One Week After Closing

- Template name: One Week After Closing
- Use case: Check in one week after closing and answer early post-closing questions.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: Checking in after closing
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Keep warm and professional. Do not add marketing hype. Review request should be optional if included. Include compliance line.
- Follow up timing: One week after closing.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

I wanted to check in now that you are about a week past closing.

If anything from the first week raised questions, send it my way. I may not be the right contact for every servicing item, but I can help point you in the right direction.

No action is needed unless you have a question. I just wanted to make sure you are doing okay after closing.

`{{LoanOfficerName}}`  
NMLS `{{NMLS}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-128
title: "Thirty Day Check In"
category: "Post Closing and Past Client Templates"
loan_stage: "Past Client"
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
priority: "Low"
purpose: "Check in 30 days after closing."
communication_type: "Status Update"
workflow_step: "Past Client - Thirty Day Check In"
workflow_trigger: "Thirty Day Check In needed"
automation_trigger: "Thirty Day Check In needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "30 day check in"
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
  - "30 day check in"
  - "borrower"
  - "emt-128"
  - "past client"
  - "post closing and past client templates"
  - "thirty day check in"
related_templates:
  - "EMT-045"
  - "EMT-127"
  - "EMT-129"
tags:
  - "30-day-check-in"
  - "borrower"
  - "emt-128"
  - "loan-officer"
  - "low"
  - "past-client"
  - "post-closing-and-past-client-templates"
  - "semi-automated"
  - "status-update"
  - "thirty-day-check-in"
---

## EMT-128 Thirty Day Check In

- Template name: Thirty Day Check In
- Use case: Check in 30 days after closing.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: 30 day check in
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Keep warm and professional. Do not imply refinance benefit or savings. Include compliance line.
- Follow up timing: Thirty days after closing.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

I wanted to check in now that you are about 30 days past closing.

If you have questions about your first payment, servicing transfer, escrow, or anything else that came up after closing, reply here and I will help point you in the right direction.

No pressure and no action required. I just like to make sure clients are not left guessing after closing.

`{{LoanOfficerName}}`  
NMLS `{{NMLS}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-129
title: "Six Month Mortgage Review"
category: "Post Closing and Past Client Templates"
loan_stage: "Past Client"
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
priority: "Low"
purpose: "Offer a six month mortgage review without implying savings or refinance benefit."
communication_type: "Marketing/Nurture"
workflow_step: "Past Client - Six Month Mortgage Review"
workflow_trigger: "Six Month Mortgage Review needed"
automation_trigger: "Six Month Mortgage Review needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Six month mortgage review"
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
  - "emt-129"
  - "mortgage review"
  - "past client"
  - "post closing and past client templates"
  - "six month mortgage review"
  - "six month review"
related_templates:
  - "EMT-046"
  - "EMT-130"
  - "EMT-132"
tags:
  - "borrower"
  - "emt-129"
  - "loan-officer"
  - "low"
  - "marketing-nurture"
  - "mortgage-review"
  - "past-client"
  - "post-closing-and-past-client-templates"
  - "semi-automated"
  - "six-month-mortgage-review"
  - "six-month-review"
---

## EMT-129 Six Month Mortgage Review

- Template name: Six Month Mortgage Review
- Use case: Offer a six month mortgage review without implying savings or refinance benefit.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: Six month mortgage review
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Do not imply savings, eligibility, or refinance benefit. Include compliance line.
- Follow up timing: Six months after closing.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

It has been about six months since closing, so I wanted to offer a quick mortgage check-in.

This does not mean you need to refinance or change anything. Sometimes the best answer is to leave the loan alone.

If you want me to review your current loan, home plans, or questions that came up after closing, call or text me at `{{PhoneNumber}}`.

`{{LoanOfficerName}}`  
NMLS `{{NMLS}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-130
title: "One Year Home Anniversary"
category: "Post Closing and Past Client Templates"
loan_stage: "Past Client"
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
priority: "Low"
purpose: "Send a one year home anniversary message and optional check-in."
communication_type: "Marketing/Nurture"
workflow_step: "Past Client - One Year Home Anniversary"
workflow_trigger: "One Year Home Anniversary needed"
automation_trigger: "One Year Home Anniversary needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "One year home anniversary"
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
  - "emt-130"
  - "home anniversary"
  - "one year"
  - "one year home anniversary"
  - "past client"
  - "post closing and past client templates"
related_templates:
  - "EMT-047"
  - "EMT-131"
  - "EMT-132"
tags:
  - "borrower"
  - "emt-130"
  - "home-anniversary"
  - "loan-officer"
  - "low"
  - "marketing-nurture"
  - "one-year"
  - "one-year-home-anniversary"
  - "past-client"
  - "post-closing-and-past-client-templates"
  - "semi-automated"
---

## EMT-130 One Year Home Anniversary

- Template name: One Year Home Anniversary
- Use case: Send a one year home anniversary message and optional check-in.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: One year home anniversary
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Keep warm and professional. Review or referral asks should be optional and not pressured. Include compliance line.
- Follow up timing: One year after closing.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Happy one year home anniversary.

I hope the home has been treating you well. If questions have come up about the mortgage, escrow, value, or future plans, I am happy to help you think through them.

No action is needed. I just wanted to mark the milestone and let you know I am still here if you need anything.

`{{LoanOfficerName}}`  
NMLS `{{NMLS}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-131
title: "Annual Mortgage Checkup"
category: "Post Closing and Past Client Templates"
loan_stage: "Past Client"
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
priority: "Low"
purpose: "Offer an annual mortgage checkup without implying benefit."
communication_type: "Marketing/Nurture"
workflow_step: "Past Client - Annual Mortgage Checkup"
workflow_trigger: "Annual Mortgage Checkup needed"
automation_trigger: "Annual Mortgage Checkup needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Annual mortgage checkup"
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
  - "annual checkup"
  - "annual mortgage checkup"
  - "borrower"
  - "emt-131"
  - "mortgage review"
  - "past client"
  - "post closing and past client templates"
related_templates:
  - "EMT-047"
  - "EMT-130"
  - "EMT-132"
tags:
  - "annual-checkup"
  - "annual-mortgage-checkup"
  - "borrower"
  - "emt-131"
  - "loan-officer"
  - "low"
  - "marketing-nurture"
  - "mortgage-review"
  - "past-client"
  - "post-closing-and-past-client-templates"
  - "semi-automated"
---

## EMT-131 Annual Mortgage Checkup

- Template name: Annual Mortgage Checkup
- Use case: Offer an annual mortgage checkup without implying benefit.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: Annual mortgage checkup
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Do not imply savings, refinance benefit, approval, or better terms. Include compliance line.
- Follow up timing: Annually after closing.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

It is a good time for an annual mortgage checkup if you want one.

This is simply a review of where things stand. The answer may be to do nothing, and that is completely fine.

If your goals, income, family plans, investment plans, or home timeline have changed, call or text me and I can help you review options carefully.

`{{LoanOfficerName}}`  
NMLS `{{NMLS}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-132
title: "Refinance Opportunity Review"
category: "Post Closing and Past Client Templates"
loan_stage: "Past Client"
audience:
  - "Borrower"
loan_programs:
  - "Conventional"
  - "FHA"
  - "VA"
  - "USDA"
  - "Jumbo"
  - "Non-QM"
  - "Refinance"
language: "English"
priority: "Medium"
purpose: "Invite borrower to review refinance options without promising savings."
communication_type: "Marketing/Nurture"
workflow_step: "Past Client - Refinance Opportunity Review"
workflow_trigger: "Refinance Opportunity Review needed"
automation_trigger: "Refinance Opportunity Review needed"
automation_timing: "Manual Only"
automation_ready: "Manual Only"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Refinance review if it makes sense"
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
  - "emt-132"
  - "opportunity review"
  - "past client"
  - "post closing and past client templates"
  - "refinance"
  - "refinance opportunity review"
related_templates:
  - "EMT-073"
  - "EMT-074"
  - "EMT-131"
tags:
  - "borrower"
  - "emt-132"
  - "loan-officer"
  - "manual-only"
  - "marketing-nurture"
  - "medium"
  - "opportunity-review"
  - "past-client"
  - "post-closing-and-past-client-templates"
  - "refinance"
  - "refinance-opportunity-review"
---

## EMT-132 Refinance Opportunity Review

- Template name: Refinance Opportunity Review
- Use case: Invite borrower to review refinance options without promising savings.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: Refinance review if it makes sense
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Do not imply savings, lower payment, better rate, approval, or net benefit. Include compliance line.
- Follow up timing: When borrower requests review or market conditions suggest a manual review may be appropriate.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

If you want, I can review whether a refinance is worth looking at.

That does not mean refinancing is automatically a good idea. We would need to compare the current loan, possible new terms, costs, timing, break-even point, and your goals.

If you want the review, reply here or call me at `{{PhoneNumber}}`. If the numbers do not help you, I will tell you that plainly.

`{{LoanOfficerName}}`  
NMLS `{{NMLS}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-133
title: "Investor Portfolio Review for DSCR Clients"
category: "Post Closing and Past Client Templates"
loan_stage: "Past Client"
audience:
  - "Borrower"
loan_programs:
  - "DSCR"
  - "Investor"
  - "Non-QM"
language: "English"
priority: "Medium"
purpose: "Offer DSCR investor clients a portfolio review without promising loan options."
communication_type: "Marketing/Nurture"
workflow_step: "Past Client - Investor Portfolio Review for DSCR Clients"
workflow_trigger: "Investor Portfolio Review for DSCR Clients needed"
automation_trigger: "Investor Portfolio Review for DSCR Clients needed"
automation_timing: "Manual Only"
automation_ready: "Manual Only"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Investor portfolio review"
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
  - "dscr"
  - "emt-133"
  - "investor portfolio"
  - "investor portfolio review for dscr clients"
  - "past client"
  - "post closing and past client templates"
  - "rental"
related_templates:
  - "EMT-068"
  - "EMT-100"
  - "EMT-108"
tags:
  - "borrower"
  - "dscr"
  - "emt-133"
  - "investor-portfolio"
  - "investor-portfolio-review-for-dscr-clients"
  - "loan-officer"
  - "manual-only"
  - "marketing-nurture"
  - "medium"
  - "past-client"
  - "post-closing-and-past-client-templates"
  - "rental"
---

## EMT-133 Investor Portfolio Review for DSCR Clients

- Template name: Investor Portfolio Review for DSCR Clients
- Use case: Offer DSCR investor clients a portfolio review without promising loan options.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: Investor portfolio review
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Do not imply approval, cash-out availability, rate, payment, or investment outcome. DSCR review depends on property cash flow, rental income, credit, equity, reserves, and lender guidelines. Include compliance line.
- Follow up timing: After closing or periodically for DSCR investor clients.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

If you are reviewing your investment portfolio, I can help look at the mortgage side of the picture.

For DSCR loans, any new review would still depend on property cash flow, rental income, credit, equity, reserves, property details, appraisal, title, insurance, and lender guidelines.

If you want to talk through the portfolio, reply here or call me at `{{PhoneNumber}}`. No promises, just a clear review.

`{{LoanOfficerName}}`  
NMLS `{{NMLS}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-134
title: "Construction Warranty Follow Up"
category: "Post Closing and Past Client Templates"
loan_stage: "Past Client"
audience:
  - "Borrower"
loan_programs:
  - "Construction"
  - "One Time Close Construction"
  - "New Construction"
language: "English"
priority: "Low"
purpose: "Follow up after construction closing or completion about warranty questions."
communication_type: "Status Update"
workflow_step: "Past Client - Construction Warranty Follow Up"
workflow_trigger: "Construction Warranty Follow Up needed"
automation_trigger: "Construction Warranty Follow Up needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Construction warranty follow up"
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
  - "builder"
  - "construction warranty"
  - "construction warranty follow up"
  - "emt-134"
  - "past client"
  - "post closing"
  - "post closing and past client templates"
related_templates:
  - "EMT-120"
  - "EMT-121"
  - "EMT-127"
tags:
  - "borrower"
  - "builder"
  - "construction-warranty"
  - "construction-warranty-follow-up"
  - "emt-134"
  - "loan-officer"
  - "low"
  - "past-client"
  - "post-closing"
  - "post-closing-and-past-client-templates"
  - "semi-automated"
  - "status-update"
---

## EMT-134 Construction Warranty Follow Up

- Template name: Construction Warranty Follow Up
- Use case: Follow up after construction closing or completion about warranty questions.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: Construction warranty follow up
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Do not provide legal, construction, or warranty advice. Direct borrower to builder, warranty provider, or appropriate professional. Include compliance line.
- Follow up timing: After construction completion or post-closing warranty window begins.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

I wanted to check in on the construction side of things.

If you have warranty, builder, repair, or punch-list questions, those may need to go through the builder, warranty provider, or the right professional. I can still help point you to the right next contact if you are not sure where to start.

Reply here if you need help figuring out the next contact path.

`{{LoanOfficerName}}`  
NMLS `{{NMLS}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
---
id: EMT-135
title: "Welcome Home"
category: "Post Closing and Past Client Templates"
loan_stage: "Past Client"
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
priority: "Low"
purpose: "Send a warm post-closing welcome home message."
communication_type: "Status Update"
workflow_step: "Past Client - Welcome Home"
workflow_trigger: "Welcome Home needed"
automation_trigger: "Welcome Home needed"
automation_timing: "Wait Until Trigger"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Welcome home"
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
  - "emt-135"
  - "past client"
  - "post closing"
  - "post closing and past client templates"
  - "welcome home"
related_templates:
  - "EMT-042"
  - "EMT-043"
  - "EMT-127"
tags:
  - "borrower"
  - "emt-135"
  - "loan-officer"
  - "low"
  - "past-client"
  - "post-closing"
  - "post-closing-and-past-client-templates"
  - "semi-automated"
  - "status-update"
  - "welcome-home"
---

## EMT-135 Welcome Home

- Template name: Welcome Home
- Use case: Send a warm post-closing welcome home message.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: Welcome home
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Keep warm and professional. Do not add marketing hype. Optional review or referral asks should be separate and non-pressured. Include compliance line.
- Follow up timing: After funding and recording are confirmed.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Welcome home.

I am grateful I had the chance to help with this part of the process. Buying or refinancing a home takes a lot of moving parts, and I appreciate the trust.

If questions come up after closing, call or text me. I am still here to help point you in the right direction.

`{{LoanOfficerName}}`  
NMLS `{{NMLS}}`  
`{{PhoneNumber}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.
