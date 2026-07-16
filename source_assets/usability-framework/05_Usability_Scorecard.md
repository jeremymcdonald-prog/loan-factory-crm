# TERA+ Usability Scorecard

## Purpose

Use this scorecard after each testing scenario in `04_Testing_Scenarios.md` and after the focused scenarios in files `09` through `12`. The scorecard is designed to compare usability across loan officers, processors, loan coordinators, internal business users, borrowers/customers, and real estate agents, especially between tech savvy users and users who struggle with technology.

## Scoring Direction

Lower friction is better.

| Score | Meaning |
|---:|---|
| 1 | Very easy. User completes task confidently with no meaningful friction. |
| 2 | Easy. Minor hesitation, but task is completed without help. |
| 3 | Usable but rough. User completes task with confusion, extra clicks, or one hint. |
| 4 | Difficult. User needs repeated help, makes errors, or loses confidence. |
| 5 | Fails usability. User cannot complete the task, makes a critical mistake, or would abandon the system. |

## Required Measurement Fields

| Field | What to record | Score guidance |
|---|---|---|
| Time to complete task | Actual time from task start to correct end state. | 1 = faster than expected, 3 = slow but completed, 5 = cannot complete. |
| Number of clicks | Actual clicks or taps required. | 1 = direct path, 3 = extra exploration, 5 = excessive wandering or repeated backtracking. |
| User confidence | Ask user to rate confidence from 1 to 5 after task. | Convert so low confidence increases friction: 5 confidence = 1 friction, 1 confidence = 5 friction. |
| Error rate | Count wrong field, wrong file, wrong status, duplicate record, or unsafe action attempts. | 1 = no errors, 3 = one recoverable error, 5 = critical or repeated errors. |
| Help needed | Record none, hint, guided, takeover. | 1 = none, 2 = small hint, 3 = guided, 5 = tester cannot proceed without takeover. |
| Confusion points | Write exact words, labels, screens, or decisions that confused the user. | 1 = none, 3 = one clear confusion point, 5 = multiple or blocking confusion points. |
| Duplicate data entry | Count fields or notes the user had to re-enter. | 1 = none, 3 = some repeated entry, 5 = repeated entry caused frustration or error. |
| Ability to recover from mistakes | Observe whether the user can undo, correct, or understand the error. | 1 = easy recovery, 3 = recovery after help, 5 = cannot recover or makes worse change. |
| Mobile usability if applicable | Record mobile or tablet result only for realistic mobile tasks such as lookup, notes, status, notifications, and dashboard review. | 1 = mobile works well, 3 = cramped but usable, 5 = unusable on mobile. Mark N/A when not tested. |
| Role, privacy, or permission clarity | Record whether the user understood what they were allowed to see or do. | 1 = clear and safe, 3 = confusing but recovered, 5 = data leak, unsafe access, or dead-end block. |
| Source evidence clarity | Record whether the user could find the source record, document, status history, or audit trail behind a decision. | 1 = source was obvious, 3 = found after search/help, 5 = source could not be verified. |
| AI review safety if applicable | Record whether AI output was treated as draft/review aid and checked against source evidence. | 1 = verified safely, 3 = partial verification, 5 = AI accepted blindly or produced unsafe action. |
| High-volume usability if applicable | Record whether the user could prioritize many records without losing urgent work. | 1 = priorities obvious, 3 = usable with filter effort, 5 = urgent work missed or dashboard unusable. |
| Overall friction score | Average the task's scored items, with notes for any critical failure. | 1 to 2 = strong, 2.1 to 3 = needs polish, 3.1 to 4 = needs redesign, 4.1 to 5 = blocker. |

## Task Score Sheet

Copy this table for each tester and each scenario.

| Field | Entry |
|---|---|
| Tester name or anonymous code |  |
| Persona ID |  |
| Persona group | LO / processor / coordinator / internal business / borrower / real estate agent |
| Scenario ID |  |
| Product OS ID |  |
| Device | Desktop / laptop / tablet / phone |
| Browser, if applicable |  |
| Started at |  |
| Completed at |  |
| Time to complete task |  |
| Number of clicks or taps |  |
| User confidence, 1 to 5 |  |
| Error count |  |
| Help needed | None / hint / guided / takeover |
| Confusion points |  |
| Duplicate data entry observed | None / minor / repeated / severe |
| Recovery from mistake | Easy / slow / helped / failed / N/A |
| Mobile usability | Strong / acceptable / weak / failed / N/A |
| Role, privacy, or permission clarity | Clear / minor confusion / confusing / unsafe / N/A |
| Source evidence clarity | Clear / found after search / helped / not found / N/A |
| AI review safety | Safe / partial / unsafe / N/A |
| High-volume usability | Strong / acceptable / weak / failed / N/A |
| Overall friction score |  |
| Pass or fail | Pass / fail |
| Tester quote |  |
| Observer notes |  |
| Recommended fix |  |
| Severity | Low / medium / high / blocker |

## Critical Fail Conditions

Mark the scenario as failed immediately if any of these occur:

- Tester uses or is prompted to use real borrower PII, NPI, income documents, credit reports, real AUS findings, real pricing, or real lender credentials.
- Tester believes a demo pricing result is final borrower-facing pricing.
- Tester believes a demo AUS result is a final approval when it is not.
- Tester sends or appears able to send a real borrower, Realtor, partner, or public communication during testing.
- Tester accesses another user's restricted file, admin setting, or role-specific area unexpectedly.
- Tester exposes sensitive borrower details to a real estate agent or internal user who should not see them.
- Tester treats an AI output as final without reviewing source evidence for a review-sensitive workflow.
- Tester cannot determine whether a dashboard, notification, AI result, or status value is current enough to act on.
- Tester clears a condition without supporting review or evidence.
- Tester creates a duplicate lead, application, condition, or document record and cannot recover.
- Tester cannot tell whether work was saved.
- Tester abandons the task or asks another person to do it.

## Suggested Thresholds

| Workflow type | Target for tech savvy users | Target for not tech savvy users | Red flag |
|---|---:|---:|---|
| Lead creation | Overall friction 2.0 or lower | Overall friction 2.5 or lower | Duplicate lead or wrong owner. |
| Application creation | 2.0 or lower | 2.75 or lower | User cannot tell lead became application. |
| 1003 completion/review | 2.5 or lower | 3.0 or lower | User cannot find missing required fields. |
| Pricing | 2.5 or lower | 3.0 or lower | User thinks demo output is final pricing. |
| AUS | 2.5 or lower | 3.0 or lower | User overstates approval or cannot identify owner. |
| Conditions | 2.25 or lower | 2.75 or lower | User clears wrong condition or cannot find borrower-facing items. |
| Documents | 2.25 or lower | 2.75 or lower | Wrong file, wrong category, or duplicate upload. |
| Notes and communication | 2.0 or lower | 2.5 or lower | User cannot tell internal note from outbound message. |
| Status updates | 2.0 or lower | 2.5 or lower | Wrong status label or unclear save state. |
| Dashboard | 2.0 or lower | 2.75 or lower | User cannot identify top priority. |
| Notifications | 2.25 or lower | 2.75 or lower | User dismisses urgent alert without action. |
| Role based permissions | 2.0 or lower | 2.5 or lower | Permission block is scary, vague, or leaks data. |
| Team leadership | 2.25 or lower | 2.75 or lower | Team leader misses stuck file or wrong LO support need. |
| Corporate coaching | 2.25 or lower | 2.75 or lower | Coach cannot identify skill gap or applies generic plan. |
| Underwriting review | 2.5 or lower | 3.0 or lower | Reviewer cannot verify source evidence or misses planted risk. |
| Disclosure workflow | 2.25 or lower | 2.75 or lower | Missing data or timing warning is missed. |
| Marketing/compliance review | 2.25 or lower | 2.75 or lower | Risky content appears approved or sendable. |
| Business development review | 2.25 or lower | 2.75 or lower | Candidate, LO success, and borrower contexts are mixed. |
| Borrower experience | 2.25 or lower | 3.0 or lower | Borrower cannot explain next step or treats estimate as final. |
| Real estate agent experience | 2.25 or lower | 2.75 or lower | Agent update leaks private data or is too vague to use. |
| Stress and edge cases | 2.5 or lower | 3.0 or lower | User cannot recover or routes wrong urgent action. |
| High volume workflows | 2.5 or lower | 3.0 or lower | Urgent item is missed because of filtering or noise. |
| AI assisted workflows | 2.5 or lower | 3.0 or lower | AI output is accepted without source review. |

## Usability Risk Tags

Use these tags when summarizing findings:

| Tag | Meaning |
|---|---|
| JARGON | User struggled with mortgage or system terminology. |
| SAVE-STATE | User could not tell whether work was saved. |
| DUPLICATE-DATA | User had to re-enter or duplicated information. |
| ROLE-BOUNDARY | User did not understand what their role could or could not do. |
| STATUS-MISMATCH | User selected or interpreted the wrong status. |
| DOC-MISFILE | User uploaded, labeled, or found a document incorrectly. |
| CONDITION-RISK | User cleared, routed, or interpreted a condition incorrectly. |
| PRICING-RISK | User treated demo or unreviewed pricing as final. |
| AUS-RISK | User treated demo AUS output as final approval or missed AUS ownership. |
| DASHBOARD-NOISE | Dashboard did not make priority work obvious. |
| NOTIF-NOISE | Notifications were too noisy, vague, or easy to dismiss. |
| MOBILE-FRICTION | Mobile or tablet use was cramped, incomplete, or confusing. |
| PRIVACY-LEAK | Real estate agent, borrower, or internal user could see information outside their safe scope. |
| AI-OVERTRUST | User treated AI output as final instead of reviewable. |
| SOURCE-UNCLEAR | User could not find source evidence behind a status, condition, document, AI summary, or decision. |
| STALE-DATA | User could not tell whether data was current enough to act on. |
| HIGHVOL-MISS | User missed an urgent item in a high-volume queue or dashboard. |
| DISCLOSURE-RISK | Missing data, timing, or document generation warning was unclear. |
| MARKETING-RISK | Content, campaign, or automation status made unapproved public use possible. |
| BD-CONTEXT-MIX | Candidate, LO success, borrower, or partner contexts were confused. |

## Rollup Summary Template

Use this after a testing session.

| Summary field | Entry |
|---|---|
| Persona tested |  |
| Scenarios completed |  |
| Scenarios passed |  |
| Scenarios failed |  |
| Average overall friction score |  |
| Highest friction Product OS ID |  |
| Lowest friction Product OS ID |  |
| Most common confusion point |  |
| Most common error |  |
| Critical failures |  |
| Recommended product fix |  |
| Recommended training fix |  |
| Recommended policy or permission fix |  |
| Should retest? | Yes / no |

## Leadership Readout Questions

- Can a brand new, not tech savvy loan officer create a lead, start an application, add a note, and find next action without help?
- Can an experienced, not tech savvy processor trust the conditions and document audit without keeping a side tracker?
- Can a loan coordinator support follow-up without accidentally crossing role boundaries?
- Can expert users move quickly without creating duplicates or bypassing review gates?
- Are pricing, AUS, conditions, and borrower communication clearly marked as review-sensitive?
- Does the dashboard show the next right action, or does it become another place to hunt?
- Are notifications helpful, or do they add noise?
- Can users recover from mistakes without fear?
- Can team leaders, coaches, underwriters, disclosures, marketing, compliance, and business development users complete their work without seeing data they should not see?
- Can borrowers understand the next step without treating pricing, AUS, or status language as final approval?
- Can real estate agents get useful updates without sensitive borrower details?
- Can high-volume users prioritize urgent work without missing quiet risks?
- Can AI-assisted workflows be reviewed against source evidence before a human acts?
