# Workflow Triggers

## Table Of Contents

- [Purpose](#purpose)
- [Trigger Timing Definitions](#trigger-timing-definitions)
- [Workflow Trigger Map](#workflow-trigger-map)
- [Governance Notes](#governance-notes)

## Purpose

This file maps every email template to the lifecycle event that should make a human or system consider sending it. Trigger language is intentionally source-system friendly so CRM, TERA+, LOS/POS, and QA teams can map it to real workflow events later.

## Trigger Timing Definitions

- Send Immediately: Send as soon as the source event is confirmed and required merge fields are present.
- Wait 1 Day: Send after one business day if the condition remains open.
- Wait 3 Days: Send after three days if the condition remains open.
- Wait Until Trigger: Send only when a date, cadence, or external event occurs.
- Manual Only: Human may send after review.
- Never Automate: Do not send automatically; use human review first.

## Workflow Trigger Map

| Template ID | Template Name | Loan Stage | Workflow Trigger | Automation Timing | Stop Condition | Automation Policy |
|---|---|---|---|---|---|---|
| [EMT-001](./01_Borrower_First_Contact_Templates.md#emt-001-realtor-asked-me-to-reach-out-about-pre-approval) | Realtor Asked Me To Reach Out About Pre Approval | Lead | Realtor referral created | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Fully Automated |
| [EMT-002](./01_Borrower_First_Contact_Templates.md#emt-002-new-online-lead-introduction) | New Online Lead Introduction | Lead | New online lead captured | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Fully Automated |
| [EMT-003](./01_Borrower_First_Contact_Templates.md#emt-003-past-client-referral-introduction) | Past Client Referral Introduction | Lead | Past client referral captured | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Fully Automated |
| [EMT-004](./02_Realtor_Referral_Templates.md#emt-004-realtor-referral-received-confirmation) | Realtor Referral Received Confirmation | Lead | Realtor referral received | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Fully Automated |
| [EMT-005](./02_Realtor_Referral_Templates.md#emt-005-early-borrower-contact-update-to-realtor) | Early Borrower Contact Update To Realtor | Lead | Borrower contact attempt logged | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Fully Automated |
| [EMT-006](./03_Pre_Approval_Templates.md#emt-006-pre-approval-next-steps) | Pre Approval Next Steps | Application | Application ready for pre-approval review | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Fully Automated |
| [EMT-007](./03_Pre_Approval_Templates.md#emt-007-pre-approval-issued) | Pre Approval Issued | Application | Pre-approval letter marked ready | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Semi Automated |
| [EMT-008](./03_Pre_Approval_Templates.md#emt-008-pre-approval-update-to-realtor) | Pre Approval Update To Realtor | Referral | Referral workflow trigger | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Semi Automated |
| [EMT-009](./03_Pre_Approval_Templates.md#emt-009-credit-prescreen-complete) | Credit Prescreen Complete | Application | Credit prescreen completed | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Fully Automated |
| [EMT-010](./04_Document_Collection_Templates.md#emt-010-documents-needed) | Documents Needed | Processing | Document checklist created | Send Immediately | Stop when item is received, waived, no longer needed, or file status changes. | Fully Automated |
| [EMT-011](./04_Document_Collection_Templates.md#emt-011-documents-still-missing) | Documents Still Missing | Processing | Document request still open | Wait 1 Day | Stop when item is received, waived, no longer needed, or file status changes. | Fully Automated |
| [EMT-012](./04_Document_Collection_Templates.md#emt-012-need-updated-paystub) | Need Updated Paystub | Processing | Updated paystub condition opened | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Fully Automated |
| [EMT-013](./04_Document_Collection_Templates.md#emt-013-need-bank-statement) | Need Bank Statement | Processing | Bank statement condition opened | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Fully Automated |
| [EMT-014](./04_Document_Collection_Templates.md#emt-014-need-w2s) | Need W2s | Processing | W2 condition opened | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Fully Automated |
| [EMT-015](./04_Document_Collection_Templates.md#emt-015-need-tax-returns) | Need Tax Returns | Processing | Tax return condition opened | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Fully Automated |
| [EMT-016](./04_Document_Collection_Templates.md#emt-016-need-explanation-letter) | Need Explanation Letter | Processing | Explanation letter condition opened | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Fully Automated |
| [EMT-017](./05_Application_and_Disclosure_Templates.md#emt-017-application-received) | Application Received | Disclosures | Application received | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Fully Automated |
| [EMT-018](./05_Application_and_Disclosure_Templates.md#emt-018-application-incomplete) | Application Incomplete | Disclosures | Application marked incomplete | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Fully Automated |
| [EMT-019](./05_Application_and_Disclosure_Templates.md#emt-019-disclosures-sent) | Disclosures Sent | Disclosures | Disclosures sent | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Fully Automated |
| [EMT-020](./05_Application_and_Disclosure_Templates.md#emt-020-disclosures-reminder) | Disclosures Reminder | Disclosures | Disclosures unsigned after delay | Wait 1 Day | Stop when trigger no longer applies, recipient responds, or file status advances. | Fully Automated |
| [EMT-021](./05_Application_and_Disclosure_Templates.md#emt-021-disclosures-signed) | Disclosures Signed | Disclosures | Disclosures signed | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Fully Automated |
| [EMT-022](./06_Submitted_to_Underwriting_Templates.md#emt-022-loan-submitted-to-underwriting) | Loan Submitted To Underwriting | Underwriting | File submitted to underwriting | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Fully Automated |
| [EMT-023](./06_Submitted_to_Underwriting_Templates.md#emt-023-initial-approval-expected) | Initial Approval Expected | Underwriting | Underwriting response pending | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Fully Automated |
| [EMT-024](./07_Conditional_Approval_Templates.md#emt-024-conditional-approval-received) | Conditional Approval Received | Conditions | Conditional approval received | Send Immediately | Stop when item is received, waived, no longer needed, or file status changes. | Semi Automated |
| [EMT-025](./07_Conditional_Approval_Templates.md#emt-025-clean-approval-update) | Clean Approval Update | Conditions | Major conditions cleared | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Semi Automated |
| [EMT-026](./07_Conditional_Approval_Templates.md#emt-026-conditions-request-to-borrower) | Conditions Request To Borrower | Conditions | Borrower condition assigned | Send Immediately | Stop when item is received, waived, no longer needed, or file status changes. | Fully Automated |
| [EMT-027](./07_Conditional_Approval_Templates.md#emt-027-conditions-request-to-realtor) | Conditions Request To Realtor | Conditions | Realtor or transaction condition assigned | Send Immediately | Stop when item is received, waived, no longer needed, or file status changes. | Fully Automated |
| [EMT-028](./08_Appraisal_Title_Insurance_Templates.md#emt-028-appraisal-ordered) | Appraisal Ordered | Processing | Appraisal ordered | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Fully Automated |
| [EMT-029](./08_Appraisal_Title_Insurance_Templates.md#emt-029-appraisal-paid) | Appraisal Paid | Processing | Appraisal payment received | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Fully Automated |
| [EMT-030](./08_Appraisal_Title_Insurance_Templates.md#emt-030-appraisal-assigned) | Appraisal Assigned | Processing | Appraisal assigned | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Fully Automated |
| [EMT-031](./08_Appraisal_Title_Insurance_Templates.md#emt-031-appraisal-scheduled) | Appraisal Scheduled | Processing | Appraisal scheduled | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Fully Automated |
| [EMT-032](./08_Appraisal_Title_Insurance_Templates.md#emt-032-appraisal-received) | Appraisal Received | Processing | Appraisal received | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Fully Automated |
| [EMT-033](./08_Appraisal_Title_Insurance_Templates.md#emt-033-appraisal-revision-needed) | Appraisal Revision Needed | Processing | Appraisal revision requested | Send Immediately | Stop when item is received, waived, no longer needed, or file status changes. | Fully Automated |
| [EMT-034](./08_Appraisal_Title_Insurance_Templates.md#emt-034-title-ordered) | Title Ordered | Processing | Title ordered | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Fully Automated |
| [EMT-035](./08_Appraisal_Title_Insurance_Templates.md#emt-035-title-request-to-title-company) | Title Request To Title Company | Processing | Title status needed | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Semi Automated |
| [EMT-036](./08_Appraisal_Title_Insurance_Templates.md#emt-036-insurance-request) | Insurance Request | Processing | Insurance evidence needed | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Fully Automated |
| [EMT-037](./08_Appraisal_Title_Insurance_Templates.md#emt-037-insurance-binder-request) | Insurance Binder Request | Processing | Insurance binder needed | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Semi Automated |
| [EMT-038](./09_Clear_to_Close_and_Closing_Templates.md#emt-038-closing-disclosure-sent) | Closing Disclosure Sent | Closing | Closing Disclosure sent | Send Immediately | Stop if closing/funding milestone changes, title/lender status changes, or borrower opts out. | Fully Automated |
| [EMT-039](./09_Clear_to_Close_and_Closing_Templates.md#emt-039-clear-to-close) | Clear To Close | Closing | Clear to close issued | Send Immediately | Stop if closing/funding milestone changes, title/lender status changes, or borrower opts out. | Semi Automated |
| [EMT-040](./09_Clear_to_Close_and_Closing_Templates.md#emt-040-closing-scheduled) | Closing Scheduled | Closing | Closing appointment scheduled | Send Immediately | Stop if closing/funding milestone changes, title/lender status changes, or borrower opts out. | Fully Automated |
| [EMT-041](./09_Clear_to_Close_and_Closing_Templates.md#emt-041-closing-day-congratulations) | Closing Day Congratulations | Closing | Closing day reached | Send Immediately | Stop if closing/funding milestone changes, title/lender status changes, or borrower opts out. | Fully Automated |
| [EMT-042](./09_Clear_to_Close_and_Closing_Templates.md#emt-042-funded-and-recorded) | Funded And Recorded | Funding | Funding and recording confirmed | Send Immediately | Stop if closing/funding milestone changes, title/lender status changes, or borrower opts out. | Fully Automated |
| [EMT-043](./10_Post_Closing_and_Past_Client_Templates.md#emt-043-post-closing-thank-you) | Post Closing Thank You | Past Client | Loan closed | Send Immediately | Stop on unsubscribe, opt-out, active complaint, or relationship owner suppression. | Fully Automated |
| [EMT-044](./10_Post_Closing_and_Past_Client_Templates.md#emt-044-review-request) | Review Request | Past Client | Post-closing review window reached | Wait Until Trigger | Stop on unsubscribe, opt-out, active complaint, or relationship owner suppression. | Semi Automated |
| [EMT-045](./10_Post_Closing_and_Past_Client_Templates.md#emt-045-past-client-30-day-follow-up) | Past Client 30 Day Follow Up | Past Client | 30 days after closing | Wait Until Trigger | Stop on unsubscribe, opt-out, active complaint, or relationship owner suppression. | Semi Automated |
| [EMT-046](./10_Post_Closing_and_Past_Client_Templates.md#emt-046-past-client-6-month-check-in) | Past Client 6 Month Check In | Past Client | 6 months after closing | Wait Until Trigger | Stop on unsubscribe, opt-out, active complaint, or relationship owner suppression. | Semi Automated |
| [EMT-047](./10_Post_Closing_and_Past_Client_Templates.md#emt-047-annual-mortgage-review) | Annual Mortgage Review | Past Client | Annual mortgage review date | Wait Until Trigger | Stop on unsubscribe, opt-out, active complaint, or relationship owner suppression. | Semi Automated |
| [EMT-048](./11_Loan_Coordinator_Templates.md#emt-048-loan-coordinator-introduction) | Loan Coordinator Introduction | Processing | Loan coordinator assigned | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Fully Automated |
| [EMT-049](./11_Loan_Coordinator_Templates.md#emt-049-appointment-scheduling) | Appointment Scheduling | Processing | Call needed | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Fully Automated |
| [EMT-050](./11_Loan_Coordinator_Templates.md#emt-050-friendly-status-nudge) | Friendly Status Nudge | Processing | Status update cadence due | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Fully Automated |
| [EMT-051](./11_Loan_Coordinator_Templates.md#emt-051-wrong-or-unreadable-document) | Wrong Or Unreadable Document | Processing | Document rejected or unreadable | Send Immediately | Stop when item is received, waived, no longer needed, or file status changes. | Fully Automated |
| [EMT-052](./12_Loan_Processor_Templates.md#emt-052-processor-introduction) | Processor Introduction | Processing | Processor assigned | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Fully Automated |
| [EMT-053](./12_Loan_Processor_Templates.md#emt-053-underwriting-clarification-needed) | Underwriting Clarification Needed | Conditions | Underwriting clarification requested | Send Immediately | Stop when item is received, waived, no longer needed, or file status changes. | Fully Automated |
| [EMT-054](./12_Loan_Processor_Templates.md#emt-054-condition-received-pending-review) | Condition Received Pending Review | Conditions | Condition item uploaded | Send Immediately | Stop when item is received, waived, no longer needed, or file status changes. | Fully Automated |
| [EMT-055](./12_Loan_Processor_Templates.md#emt-055-funding-review-in-progress) | Funding Review In Progress | Funding | Signed package in funding review | Send Immediately | Stop if closing/funding milestone changes, title/lender status changes, or borrower opts out. | Fully Automated |
| [EMT-056](./12_Loan_Processor_Templates.md#emt-056-third-party-status-follow-up) | Third Party Status Follow Up | Processing | Third-party status needed | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Semi Automated |
| [EMT-057](./13_Realtor_Partner_Nurture_Templates.md#emt-057-realtor-partner-monthly-nurture) | Realtor Partner Monthly Nurture | Marketing | Monthly Realtor nurture date | Wait Until Trigger | Stop on unsubscribe, opt-out, active complaint, or relationship owner suppression. | Semi Automated |
| [EMT-058](./13_Realtor_Partner_Nurture_Templates.md#emt-058-realtor-open-house-support) | Realtor Open House Support | Marketing | Open house support requested | Wait Until Trigger | Stop on unsubscribe, opt-out, active complaint, or relationship owner suppression. | Semi Automated |
| [EMT-059](./13_Realtor_Partner_Nurture_Templates.md#emt-059-realtor-co-branded-marketing-offer) | Realtor Co Branded Marketing Offer | Marketing | Co-branded marketing requested | Wait Until Trigger | Stop on unsubscribe, opt-out, active complaint, or relationship owner suppression. | Semi Automated |
| [EMT-060](./14_Problem_File_and_Delay_Templates.md#emt-060-problem-file-delay-update) | Problem File Delay Update | Processing | File blocker identified | Never Automate | Stop if facts are not human-confirmed or compliance review is needed. | Manual Only |
| [EMT-061](./14_Problem_File_and_Delay_Templates.md#emt-061-rate-lock-discussion) | Rate Lock Discussion | Processing | Rate lock conversation needed | Never Automate | Stop if facts are not human-confirmed or compliance review is needed. | Manual Only |
| [EMT-062](./14_Problem_File_and_Delay_Templates.md#emt-062-loan-estimate-explanation) | Loan Estimate Explanation | Processing | Loan Estimate question received | Send Immediately | Stop when trigger no longer applies, recipient responds, or file status advances. | Semi Automated |
| [EMT-063](./14_Problem_File_and_Delay_Templates.md#emt-063-cash-to-close-changed-explanation) | Cash To Close Changed Explanation | Processing | Cash to close estimate changed | Never Automate | Stop if facts are not human-confirmed or compliance review is needed. | Manual Only |
| [EMT-064](./14_Problem_File_and_Delay_Templates.md#emt-064-payment-changed-explanation) | Payment Changed Explanation | Processing | Payment estimate changed | Never Automate | Stop if facts are not human-confirmed or compliance review is needed. | Manual Only |
| [EMT-065](./14_Problem_File_and_Delay_Templates.md#emt-065-closing-delay-explanation) | Closing Delay Explanation | Closing | Closing delay risk identified | Never Automate | Stop if facts are not human-confirmed or compliance review is needed. | Manual Only |

## Governance Notes

- Trigger confirmation must come from a source system or assigned file owner.
- Never automate templates marked Manual Only or Never Automate without explicit compliance and operations approval.
- Stop conditions always override timing rules.
