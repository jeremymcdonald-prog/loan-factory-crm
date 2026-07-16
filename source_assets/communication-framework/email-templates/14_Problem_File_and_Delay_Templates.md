# Problem File And Delay Templates

## Table Of Contents

- [EMT-060 Problem File Delay Update](#emt-060-problem-file-delay-update)
- [EMT-061 Rate Lock Discussion](#emt-061-rate-lock-discussion)
- [EMT-062 Loan Estimate Explanation](#emt-062-loan-estimate-explanation)
- [EMT-063 Cash To Close Changed Explanation](#emt-063-cash-to-close-changed-explanation)
- [EMT-064 Payment Changed Explanation](#emt-064-payment-changed-explanation)
- [EMT-065 Closing Delay Explanation](#emt-065-closing-delay-explanation)

---
id: EMT-060
title: "Problem File Delay Update"
category: "Problem File and Delay Templates"
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
purpose: "Explain a file issue without guessing or blaming."
communication_type: "Status Update"
workflow_step: "Processing - Problem File Delay Update"
workflow_trigger: "File blocker identified"
automation_trigger: "File blocker identified"
automation_timing: "Never Automate"
automation_ready: "Manual Only"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "File update and next step"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanOfficerName}}"
  - "{{NMLS}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{ProcessorName}}"
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
  - "emt-060"
  - "problem file and delay templates"
  - "problem file delay update"
  - "processing"
related_templates:
  - "EMT-059"
  - "EMT-061"
  - "EMT-065"
tags:
  - "borrower"
  - "emt-060"
  - "loan-officer"
  - "low"
  - "problem-file-and-delay-templates"
  - "problem-file-delay-update"
  - "processing"
  - "semi-automated"
  - "status-update"
---

## EMT-060 Problem File Delay Update

- Template name: Problem file delay update
- Use case: Explain a file issue without guessing or blaming.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: File update and next step
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{ProcessorName}}`, `{{PropertyAddress}}`
- Compliance notes: Do not promise outcome or timeline. Include compliance line.
- Follow up timing: Same day issue is confirmed.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

I want to give you a clear update. We found an item in the file that needs additional review before we can give the next answer.

I do not want to guess or overpromise. Our team is reviewing it and will tell you what is needed as soon as we have a confirmed next step.

You can reach me at `{{PhoneNumber}}` if you want to talk through what we know today.

`{{LoanOfficerName}}`  
NMLS `{{NMLS}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.

---
id: EMT-061
title: "Rate Lock Discussion"
category: "Problem File and Delay Templates"
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
purpose: "Discuss lock timing before or after formal lock review."
communication_type: "Education"
workflow_step: "Processing - Rate Lock Discussion"
workflow_trigger: "Rate lock conversation needed"
automation_trigger: "Rate lock conversation needed"
automation_timing: "Never Automate"
automation_ready: "Manual Only"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Rate lock discussion"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanOfficerName}}"
  - "{{NMLS}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{ClosingDate}}"
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
  - "emt-061"
  - "problem file and delay templates"
  - "processing"
  - "rate lock"
  - "rate lock discussion"
related_templates:
  - "EMT-060"
  - "EMT-062"
  - "EMT-064"
tags:
  - "borrower"
  - "education"
  - "emt-061"
  - "high"
  - "loan-officer"
  - "problem-file-and-delay-templates"
  - "processing"
  - "rate-lock"
  - "semi-automated"
---

## EMT-061 Rate Lock Discussion

- Template name: Rate lock discussion
- Use case: Discuss lock timing before or after formal lock review.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: Rate lock discussion
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{LoanProgram}}`, `{{ClosingDate}}`
- Compliance notes: Do not say locked unless formal lock confirmation exists. Include compliance line.
- Follow up timing: Before lock decision or when borrower asks about rates.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

I want to talk through rate lock timing and what it means for your file.

Rates, pricing, and options can change until a lock is formally confirmed through the correct process. Before treating anything as locked, we need to review the loan stage, property details, timing, and available options.

Call or text me at `{{PhoneNumber}}`, and I will walk you through it.

`{{LoanOfficerName}}`  
NMLS `{{NMLS}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.

---
id: EMT-062
title: "Loan Estimate Explanation"
category: "Problem File and Delay Templates"
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
purpose: "Explain the Loan Estimate in plain language."
communication_type: "Education"
workflow_step: "Processing - Loan Estimate Explanation"
workflow_trigger: "Loan Estimate question received"
automation_trigger: "Loan Estimate question received"
automation_timing: "Send Immediately"
automation_ready: "Semi Automated"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Understanding your Loan Estimate"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanOfficerName}}"
  - "{{NMLS}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{LoanProgram}}"
required_attachments:
  - "Loan Estimate"
language_availability:
  - "English"
  - "Vietnamese"
  - "Simplified Chinese"
  - "Colombian Spanish"
  - "Russian"
search_keywords:
  - "borrower"
  - "emt-062"
  - "loan estimate"
  - "loan estimate explanation"
  - "problem file and delay templates"
  - "processing"
related_templates:
  - "EMT-061"
  - "EMT-063"
  - "EMT-064"
tags:
  - "borrower"
  - "education"
  - "emt-062"
  - "loan-estimate"
  - "loan-estimate-explanation"
  - "loan-officer"
  - "low"
  - "problem-file-and-delay-templates"
  - "processing"
  - "semi-automated"
---

## EMT-062 Loan Estimate Explanation

- Template name: Loan estimate explanation
- Use case: Explain the Loan Estimate in plain language.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: Understanding your Loan Estimate
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Loan Estimate is an official estimate, not the final closing statement. Include compliance line.
- Follow up timing: After Loan Estimate is issued or borrower asks.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

Your Loan Estimate is meant to show estimated loan terms, payment information, and closing costs in a standard format.

Some figures can still change based on final details, third-party services, timing, title, insurance, escrow, and required review. Please use it as an estimate, not the final closing statement.

If you want, we can walk through it together.

`{{LoanOfficerName}}`  
`{{PhoneNumber}}`  
NMLS `{{NMLS}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.

---
id: EMT-063
title: "Cash To Close Changed Explanation"
category: "Problem File and Delay Templates"
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
purpose: "Explain changed cash to close without implying final figures early."
communication_type: "Education"
workflow_step: "Processing - Cash To Close Changed Explanation"
workflow_trigger: "Cash to close estimate changed"
automation_trigger: "Cash to close estimate changed"
automation_timing: "Never Automate"
automation_ready: "Manual Only"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Cash to close update"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{LoanOfficerName}}"
  - "{{NMLS}}"
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
  - "cash to close"
  - "cash to close changed explanation"
  - "emt-063"
  - "problem file and delay templates"
  - "processing"
related_templates:
  - "EMT-062"
  - "EMT-064"
tags:
  - "borrower"
  - "cash-to-close"
  - "cash-to-close-changed-explanation"
  - "education"
  - "emt-063"
  - "high"
  - "loan-officer"
  - "problem-file-and-delay-templates"
  - "processing"
  - "semi-automated"
---

## EMT-063 Cash To Close Changed Explanation

- Template name: Cash to close changed explanation
- Use case: Explain changed cash to close without implying final figures early.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: Cash to close update
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{ClosingDate}}`
- Compliance notes: Direct borrower to official disclosure or settlement figures. Include compliance line.
- Follow up timing: Same day change is identified and reviewed.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

I want to flag that the estimated cash to close changed.

Cash to close can change when taxes, insurance, escrow, title fees, credits, payoff information, or other settlement items update. Please review the latest official disclosure or settlement figures before relying on the amount.

Call me at `{{PhoneNumber}}`, and I can walk you through what changed.

`{{LoanOfficerName}}`  
NMLS `{{NMLS}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.

---
id: EMT-064
title: "Payment Changed Explanation"
category: "Problem File and Delay Templates"
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
purpose: "Explain a payment estimate change."
communication_type: "Education"
workflow_step: "Processing - Payment Changed Explanation"
workflow_trigger: "Payment estimate changed"
automation_trigger: "Payment estimate changed"
automation_timing: "Never Automate"
automation_ready: "Manual Only"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Payment estimate update"
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
  - "borrower"
  - "emt-064"
  - "payment"
  - "payment changed explanation"
  - "problem file and delay templates"
  - "processing"
related_templates:
  - "EMT-063"
  - "EMT-065"
  - "EMT-062"
tags:
  - "borrower"
  - "education"
  - "emt-064"
  - "high"
  - "loan-officer"
  - "payment"
  - "payment-changed-explanation"
  - "problem-file-and-delay-templates"
  - "processing"
  - "semi-automated"
---

## EMT-064 Payment Changed Explanation

- Template name: Payment changed explanation
- Use case: Explain a payment estimate change.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: Payment estimate update
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{LoanProgram}}`
- Compliance notes: Say estimate unless final documents support the amount. Include compliance line.
- Follow up timing: Same day reviewed payment estimate changes.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

I want to explain why the payment estimate changed.

Payment estimates can change because of rate, taxes, insurance, escrow, loan amount, program details, or final settlement figures. I do not want you relying on an outdated estimate.

Call or text me at `{{PhoneNumber}}`, and I will walk through the current numbers and what may still be subject to change.

`{{LoanOfficerName}}`  
NMLS `{{NMLS}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.

---
id: EMT-065
title: "Closing Delay Explanation"
category: "Problem File and Delay Templates"
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
purpose: "Explain a closing delay with a clear next action."
communication_type: "Education"
workflow_step: "Closing - Closing Delay Explanation"
workflow_trigger: "Closing delay risk identified"
automation_trigger: "Closing delay risk identified"
automation_timing: "Never Automate"
automation_ready: "Manual Only"
compliance_reviewed: "Draft reviewed - final compliance approval required before live send"
recommended_sender: "Loan Officer"
recommended_subject: "Closing timing update"
required_merge_fields:
  - "{{BorrowerName}}"
  - "{{ClosingDate}}"
  - "{{LoanOfficerName}}"
  - "{{NMLS}}"
  - "{{PhoneNumber}}"
optional_merge_fields:
  - "{{ProcessorName}}"
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
  - "closing delay explanation"
  - "emt-065"
  - "problem file and delay templates"
related_templates:
  - "EMT-064"
  - "EMT-060"
  - "EMT-040"
tags:
  - "borrower"
  - "closing"
  - "closing-delay-explanation"
  - "education"
  - "emt-065"
  - "high"
  - "loan-officer"
  - "problem-file-and-delay-templates"
  - "semi-automated"
---

## EMT-065 Closing Delay Explanation

- Template name: Closing delay explanation
- Use case: Explain a closing delay with a clear next action.
- Audience: Borrower
- Recommended sender: Loan Officer
- Subject line: Closing timing update
- Required placeholders: `{{BorrowerName}}`, `{{LoanOfficerName}}`, `{{ClosingDate}}`, `{{PhoneNumber}}`, `{{NMLS}}`
- Optional placeholders: `{{ProcessorName}}`, `{{PropertyAddress}}`
- Compliance notes: Do not guarantee revised date until all parties confirm. Include compliance line.
- Follow up timing: Same day delay risk is confirmed.
- Language versions if applicable: English master; localized versions supported in file 15.

Email body:

Hi `{{BorrowerName}}`,

I want to be direct: the closing timeline may need to move from `{{ClosingDate}}`.

Our team is working through the item causing the delay. I know timing matters, but I do not want to promise a date until the required review is complete and the new timing is confirmed.

I will keep you updated as soon as we have the next confirmed step.

`{{LoanOfficerName}}`  
`{{PhoneNumber}}`  
NMLS `{{NMLS}}`

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.

