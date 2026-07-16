# SMS Cross Reference

## Table Of Contents

- [Purpose](#purpose)
- [SMS Rules](#sms-rules)
- [SMS Cross Reference](#sms-cross-reference)
- [Blocked Or Manual SMS Topics](#blocked-or-manual-sms-topics)

## Purpose

This file maps email templates to safe SMS follow-up behavior. SMS should support the email, not replace it.

## SMS Rules

- Use SMS only where consent and communication preference allow it.
- Keep SMS short and non-sensitive.
- Do not include private borrower financial details.
- Do not quote rates, payments, cash to close, or approval status in SMS unless a reviewed process allows it.
- Respect opt-outs immediately.

## SMS Cross Reference

| Template ID | Loan Stage | Audience | Email Timing | Suggested SMS Follow Up | Task Creation | Automation Policy |
|---|---|---|---|---|---|---|
| [EMT-001](./01_Borrower_First_Contact_Templates.md#emt-001-realtor-asked-me-to-reach-out-about-pre-approval) | Lead | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-002](./01_Borrower_First_Contact_Templates.md#emt-002-new-online-lead-introduction) | Lead | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-003](./01_Borrower_First_Contact_Templates.md#emt-003-past-client-referral-introduction) | Lead | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-004](./02_Realtor_Referral_Templates.md#emt-004-realtor-referral-received-confirmation) | Lead | Realtor | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-005](./02_Realtor_Referral_Templates.md#emt-005-early-borrower-contact-update-to-realtor) | Lead | Realtor | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-006](./03_Pre_Approval_Templates.md#emt-006-pre-approval-next-steps) | Application | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-007](./03_Pre_Approval_Templates.md#emt-007-pre-approval-issued) | Application | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Semi Automated |
| [EMT-008](./03_Pre_Approval_Templates.md#emt-008-pre-approval-update-to-realtor) | Referral | Realtor | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Semi Automated |
| [EMT-009](./03_Pre_Approval_Templates.md#emt-009-credit-prescreen-complete) | Application | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-010](./04_Document_Collection_Templates.md#emt-010-documents-needed) | Processing | Borrower | Send Immediately | Next-day SMS if no response: "We sent a secure portal request. Let us know if you need help." | Create follow-up task if no response by delay window. | Fully Automated |
| [EMT-011](./04_Document_Collection_Templates.md#emt-011-documents-still-missing) | Processing | Borrower | Wait 1 Day | Same-day SMS: "Quick update sent to your email. Please review when you can." | Create same-day follow-up task. | Fully Automated |
| [EMT-012](./04_Document_Collection_Templates.md#emt-012-need-updated-paystub) | Processing | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-013](./04_Document_Collection_Templates.md#emt-013-need-bank-statement) | Processing | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-014](./04_Document_Collection_Templates.md#emt-014-need-w2s) | Processing | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-015](./04_Document_Collection_Templates.md#emt-015-need-tax-returns) | Processing | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-016](./04_Document_Collection_Templates.md#emt-016-need-explanation-letter) | Processing | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-017](./05_Application_and_Disclosure_Templates.md#emt-017-application-received) | Disclosures | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-018](./05_Application_and_Disclosure_Templates.md#emt-018-application-incomplete) | Disclosures | Borrower | Send Immediately | Next-day SMS if no response: "We sent a secure portal request. Let us know if you need help." | Create follow-up task if no response by delay window. | Fully Automated |
| [EMT-019](./05_Application_and_Disclosure_Templates.md#emt-019-disclosures-sent) | Disclosures | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-020](./05_Application_and_Disclosure_Templates.md#emt-020-disclosures-reminder) | Disclosures | Borrower | Wait 1 Day | Same-day SMS: "Quick update sent to your email. Please review when you can." | Create same-day follow-up task. | Fully Automated |
| [EMT-021](./05_Application_and_Disclosure_Templates.md#emt-021-disclosures-signed) | Disclosures | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-022](./06_Submitted_to_Underwriting_Templates.md#emt-022-loan-submitted-to-underwriting) | Underwriting | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-023](./06_Submitted_to_Underwriting_Templates.md#emt-023-initial-approval-expected) | Underwriting | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-024](./07_Conditional_Approval_Templates.md#emt-024-conditional-approval-received) | Conditions | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Semi Automated |
| [EMT-025](./07_Conditional_Approval_Templates.md#emt-025-clean-approval-update) | Conditions | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Semi Automated |
| [EMT-026](./07_Conditional_Approval_Templates.md#emt-026-conditions-request-to-borrower) | Conditions | Borrower | Send Immediately | Same-day SMS: "Quick update sent to your email. Please review when you can." | Create same-day follow-up task. | Fully Automated |
| [EMT-027](./07_Conditional_Approval_Templates.md#emt-027-conditions-request-to-realtor) | Conditions | Realtor | Send Immediately | Same-day SMS: "Quick update sent to your email. Please review when you can." | Create same-day follow-up task. | Fully Automated |
| [EMT-028](./08_Appraisal_Title_Insurance_Templates.md#emt-028-appraisal-ordered) | Processing | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-029](./08_Appraisal_Title_Insurance_Templates.md#emt-029-appraisal-paid) | Processing | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-030](./08_Appraisal_Title_Insurance_Templates.md#emt-030-appraisal-assigned) | Processing | Borrower, Realtor | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-031](./08_Appraisal_Title_Insurance_Templates.md#emt-031-appraisal-scheduled) | Processing | Borrower, Realtor | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-032](./08_Appraisal_Title_Insurance_Templates.md#emt-032-appraisal-received) | Processing | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-033](./08_Appraisal_Title_Insurance_Templates.md#emt-033-appraisal-revision-needed) | Processing | Borrower, Realtor | Send Immediately | Next-day SMS if no response: "We sent a secure portal request. Let us know if you need help." | Create follow-up task if no response by delay window. | Fully Automated |
| [EMT-034](./08_Appraisal_Title_Insurance_Templates.md#emt-034-title-ordered) | Processing | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-035](./08_Appraisal_Title_Insurance_Templates.md#emt-035-title-request-to-title-company) | Processing | Title company | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | Create follow-up task if no response by delay window. | Semi Automated |
| [EMT-036](./08_Appraisal_Title_Insurance_Templates.md#emt-036-insurance-request) | Processing | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | Create follow-up task if no response by delay window. | Fully Automated |
| [EMT-037](./08_Appraisal_Title_Insurance_Templates.md#emt-037-insurance-binder-request) | Processing | Insurance agent, borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | Create follow-up task if no response by delay window. | Semi Automated |
| [EMT-038](./09_Clear_to_Close_and_Closing_Templates.md#emt-038-closing-disclosure-sent) | Closing | Borrower | Send Immediately | Same-day SMS: "Quick update sent to your email. Please review when you can." | Create same-day follow-up task. | Fully Automated |
| [EMT-039](./09_Clear_to_Close_and_Closing_Templates.md#emt-039-clear-to-close) | Closing | Borrower | Send Immediately | Same-day SMS: "Quick update sent to your email. Please review when you can." | Create same-day follow-up task. | Semi Automated |
| [EMT-040](./09_Clear_to_Close_and_Closing_Templates.md#emt-040-closing-scheduled) | Closing | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-041](./09_Clear_to_Close_and_Closing_Templates.md#emt-041-closing-day-congratulations) | Closing | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-042](./09_Clear_to_Close_and_Closing_Templates.md#emt-042-funded-and-recorded) | Funding | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-043](./10_Post_Closing_and_Past_Client_Templates.md#emt-043-post-closing-thank-you) | Past Client | Borrower | Send Immediately | SMS only with consent and relationship-owner approval. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-044](./10_Post_Closing_and_Past_Client_Templates.md#emt-044-review-request) | Past Client | Borrower | Wait Until Trigger | SMS only with consent and relationship-owner approval. | Create follow-up task if no response by delay window. | Semi Automated |
| [EMT-045](./10_Post_Closing_and_Past_Client_Templates.md#emt-045-past-client-30-day-follow-up) | Past Client | Past client | Wait Until Trigger | SMS only with consent and relationship-owner approval. | No task unless recipient replies or milestone stalls. | Semi Automated |
| [EMT-046](./10_Post_Closing_and_Past_Client_Templates.md#emt-046-past-client-6-month-check-in) | Past Client | Past client | Wait Until Trigger | SMS only with consent and relationship-owner approval. | No task unless recipient replies or milestone stalls. | Semi Automated |
| [EMT-047](./10_Post_Closing_and_Past_Client_Templates.md#emt-047-annual-mortgage-review) | Past Client | Past client | Wait Until Trigger | SMS only with consent and relationship-owner approval. | No task unless recipient replies or milestone stalls. | Semi Automated |
| [EMT-048](./11_Loan_Coordinator_Templates.md#emt-048-loan-coordinator-introduction) | Processing | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-049](./11_Loan_Coordinator_Templates.md#emt-049-appointment-scheduling) | Processing | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-050](./11_Loan_Coordinator_Templates.md#emt-050-friendly-status-nudge) | Processing | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | Create follow-up task if no response by delay window. | Fully Automated |
| [EMT-051](./11_Loan_Coordinator_Templates.md#emt-051-wrong-or-unreadable-document) | Processing | Borrower | Send Immediately | Same-day SMS: "Quick update sent to your email. Please review when you can." | Create same-day follow-up task. | Fully Automated |
| [EMT-052](./12_Loan_Processor_Templates.md#emt-052-processor-introduction) | Processing | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-053](./12_Loan_Processor_Templates.md#emt-053-underwriting-clarification-needed) | Conditions | Borrower | Send Immediately | Next-day SMS if no response: "We sent a secure portal request. Let us know if you need help." | Create follow-up task if no response by delay window. | Fully Automated |
| [EMT-054](./12_Loan_Processor_Templates.md#emt-054-condition-received-pending-review) | Conditions | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Fully Automated |
| [EMT-055](./12_Loan_Processor_Templates.md#emt-055-funding-review-in-progress) | Funding | Borrower | Send Immediately | Same-day SMS: "Quick update sent to your email. Please review when you can." | Create same-day follow-up task. | Fully Automated |
| [EMT-056](./12_Loan_Processor_Templates.md#emt-056-third-party-status-follow-up) | Processing | Third party partner | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Semi Automated |
| [EMT-057](./13_Realtor_Partner_Nurture_Templates.md#emt-057-realtor-partner-monthly-nurture) | Marketing | Realtor | Wait Until Trigger | SMS only with consent and relationship-owner approval. | No task unless recipient replies or milestone stalls. | Semi Automated |
| [EMT-058](./13_Realtor_Partner_Nurture_Templates.md#emt-058-realtor-open-house-support) | Marketing | Realtor | Wait Until Trigger | SMS only with consent and relationship-owner approval. | No task unless recipient replies or milestone stalls. | Semi Automated |
| [EMT-059](./13_Realtor_Partner_Nurture_Templates.md#emt-059-realtor-co-branded-marketing-offer) | Marketing | Realtor | Wait Until Trigger | SMS only with consent and relationship-owner approval. | No task unless recipient replies or milestone stalls. | Semi Automated |
| [EMT-060](./14_Problem_File_and_Delay_Templates.md#emt-060-problem-file-delay-update) | Processing | Borrower | Never Automate | No automated SMS. LO may send manual check-in after review. | Create human review task for LO/processor before send. | Manual Only |
| [EMT-061](./14_Problem_File_and_Delay_Templates.md#emt-061-rate-lock-discussion) | Processing | Borrower | Never Automate | No automated SMS. LO may send manual check-in after review. | Create human review task for LO/processor before send. | Manual Only |
| [EMT-062](./14_Problem_File_and_Delay_Templates.md#emt-062-loan-estimate-explanation) | Processing | Borrower | Send Immediately | Optional SMS only if consent exists and email is time-sensitive. | No task unless recipient replies or milestone stalls. | Semi Automated |
| [EMT-063](./14_Problem_File_and_Delay_Templates.md#emt-063-cash-to-close-changed-explanation) | Processing | Borrower | Never Automate | No automated SMS. LO may send manual check-in after review. | Create human review task for LO/processor before send. | Manual Only |
| [EMT-064](./14_Problem_File_and_Delay_Templates.md#emt-064-payment-changed-explanation) | Processing | Borrower | Never Automate | No automated SMS. LO may send manual check-in after review. | Create human review task for LO/processor before send. | Manual Only |
| [EMT-065](./14_Problem_File_and_Delay_Templates.md#emt-065-closing-delay-explanation) | Closing | Borrower | Never Automate | No automated SMS. LO may send manual check-in after review. | Create human review task for LO/processor before send. | Manual Only |

## Blocked Or Manual SMS Topics

Use manual review for SMS touching rate locks, payment changes, cash-to-close changes, closing delays, problem files, adverse outcomes, complaints, or borrower-sensitive conditions.
