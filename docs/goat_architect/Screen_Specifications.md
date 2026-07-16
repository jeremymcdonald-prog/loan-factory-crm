# Screen Specifications — index

Purpose: the screen-by-screen UI specification for Loan Factory CRM lives in three part files (kept separate for size); this index is the canonical [[Screen_Specifications]] entry point that every other document links to. All 21 screens follow the same contract from [[PRD]] §5 and [[Decisions]]: one obvious primary action per screen, plain mortgage language, the system tells the user what to do next, Ally prepares while the human approves, status color tied to deadline urgency, tabular numerals, light and dark themes. Every screen is a CRM surface — communication and relationship work triggered by loan facts; the loan work itself (origination, underwriting, disclosures, document collection, pricing) happens in external systems and is never performed here. Component names (AllyCard, WorkQueue, StageRail, LoanCard, DataTable, …) are the canonical tokens defined in [[Design_System]].

## Parts

| Part | Screens | Contents |
|---|---|---|
| [Part 1](_parts/Screen_Specifications_Part1.md) | 1–8 | The daily working core: Today command center (incl. the calendar strip, [[PRD]] FR-TD-8), Lead inbox (incl. the "Book consultation" quick action, [[PRD]] FR-PE-9), Contact view, Borrower view, Opportunity workspace, Pipeline board + Pipeline table, Task center |
| [Part 2](_parts/Screen_Specifications_Part2.md) | 9–15 | Conversations, Referral Partner Profile, Agent Relationship Dashboard, Campaign Builder, Template Library, Automation Builder, AI Intelligence Center |
| [Part 3](_parts/Screen_Specifications_Part3.md) | 16–21 | Reporting Dashboard, Team Performance, Notification Center, Ally Approval Queue, Settings, Mobile Daily Action View (the responsive mobile-web layout) |

## Conventions

1. Every screen is specified with the same 12-field structure (Purpose · Primary users & roles · Nav location & entry points · Primary action · Layout & hierarchy · Data displayed & sources · Ally on this screen · Key interactions & flows · States & edge cases · Mobile behavior · Permissions, compliance & audit · Acceptance criteria & ship gate). "Mobile behavior" means the responsive mobile-browser layout: the product is a responsive web application on desktop and mobile browsers — there is no native app, and mobile-web parity is a ship requirement, not a nice-to-have.
2. Roles and access resolve against [[Data_Model]] and [[Technical_Architecture]]; AI behavior resolves against [[AI_Product_Architecture]] and [[Automation_Catalog]]; stage names are the locked 20-stage lifecycle in [[Mortgage_Workflow_Map]] — rendered everywhere as CRM stage visibility (stage and milestone facts are entered by the team in v1 and may later sync read-only from external systems; the CRM never owns loan-of-record data); templates and merge fields per [[Communication_Templates]].
3. A screen ships only when its NTS usability threshold passes and none of the 12 critical-fail conditions occur ([[QA_Plan]], [[PRD]] G7).

Related: [[PRD]] · [[Design_System]] · [[Information_Architecture]] · [[Data_Model]] · [[AI_Product_Architecture]] · [[QA_Plan]] · [[Obsidian_Index]]
