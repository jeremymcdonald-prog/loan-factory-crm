# Current_State_Audit

Purpose: the honest, evidence-backed diagnosis of the existing offline CRM prototype (`CRM (offline) (3).html`) — what it actually is, what it lacks measured against what an AI-powered mortgage CRM must do, which interaction ideas are worth carrying forward, and the formal replace-vs-evolve verdict. Every claim below is grounded in either the live rendering walkthrough or the line-by-line code audit of the extracted source (`_product_discovery/crm_html_extracted/`, audited 2026-07-16). This document is the evidence base for decision D-01 in [[Decisions]]; the full asset context lives in [[Asset_Inventory]].

## 1. What it is

A single 649 KB HTML file containing a bundled, offline React 18.3.1 application styled as **"CRM — Client care"** — in truth an **email-marketing micro-tool**, not a CRM. It manages mailing lists and sends trigger-based email campaigns, newsletters, and holiday greetings for a fictional loan officer ("Minh Tran · Loan Factory") over 84 mock contacts.

Technically, it is not even a standard React app. The application is written in a proprietary "DC" export format (Claude "Bundled Page" style): a ~145 KB static HTML mustache template (`{{ }}` bindings, `sc-if`/`sc-for` control tags) bound at runtime by a generated `dc-runtime` loader to **one monolithic 938-line `Component extends DCLogic` class** that holds all data, all logic, and all inline-string CSS. There is no component tree, no build system, no TypeScript, no tests, no routing, no backend, no persistence of any kind — every record is a hardcoded constant mutated in memory and lost on refresh.

What it does contain (fully inventoried in the code audit):

| Surface | Contents |
|---|---|
| 10 screens | Home, Contacts (mailing *lists*, not people), Campaigns, Newsletters, Templates, Campaign calendar, Email history, Team (manager role w/ per-LO quota table), Profile, Settings |
| 9 modals | Campaign builder, newsletter wizard, new-list (CSV / conditions / combine), compose, list drawer, template, template editor, email detail, calendar item |
| 1 reusable component | SearchSelect (typed-props dropdown) — the entire "component library" |
| Content | ~35 pieces of complete email copy: 10 trigger campaigns, 13 editable holidays, 8 company templates, 4 newsletters. One merge tag (`{{first_name}}`) |
| Real (in-memory) logic | List CRUD incl. combined-list recompute; campaign lifecycle; newsletter scheduling (now / one-time / recurring); compose w/ save-as-template; manager role with view-as-LO and quota editing over a synthetic 2,000-LO pool |
| Fake logic | Everything labeled "AI" (`setTimeout` + hardcoded strings); combined-list intersection (`min(counts) × 0.55`); CSV import (`nlFile ? 156 : 0`); sends (records appended, nothing transmitted); the Settings integrations panel |

## 2. What it lacks — the 16 problems, evidenced

Each problem is stated as the gap against the product this must become ([[PRD]], [[Vision]]), with the specific evidence from the visual and code audits.

| # | Problem | Evidence |
|---|---|---|
| 1 | **Wrong product scope: an email tool, not a mortgage CRM.** Its universe is lists → campaigns → sends. | Nav is Home/Contacts/Campaigns/Newsletter/Templates/Campaign calendar/Email history; sidebar logo reads "Client care"; the only channel anywhere is `channel:"Email"`. |
| 2 | **No pipeline or opportunity stages.** The contact IS the deal: one deal per person, no opportunity entity, no stage model for relationship visibility. | Contact shape is `{id, name, initials, av, status, sub, email, phone, bod}` with a 6-value status enum (`closed/funded/withdrawn/incomplete/nocontact/prospect`); deal facts exist only as display strings like `"Purchase · 30-yr Fixed · $420K"`. Nothing maps to the 20-stage lifecycle in [[Mortgage_Workflow_Map]]. |
| 3 | **No lead capture or routing.** Leads cannot enter the system; there is no source model, no assignment, no speed-to-lead concept. | "CSV import" is the boolean `nlFile ? 156 : 0`; no forms, no webhooks, no fetch calls exist in the codebase. |
| 4 | **No lead prioritization / next best action.** The user must decide what to do; the system never tells them what matters now. | Home is stat cards + a static suggestions list; the "AI suggestions" are `SUG_CATALOG`, a fixed rules list filtered by which campaign kinds are toggled off. There is no scoring, urgency, or ranking of people. |
| 5 | **No tasks.** No to-dos, reminders, follow-up queue, or ownership of work items. | No task entity or screen exists anywhere in the state or template. |
| 6 | **No notes or activity timeline per person.** Relationship history cannot be recorded. | Contacts have 9 fields, none of them notes; the only "activity feed" is a hardcoded Home list. |
| 7 | **No partner/realtor management.** Agents — the #1 broker referral source — are absent as entities. | The sole trace of realtors is a `realtor_bday` email trigger. No partner records, pipelines, or scorecards; contrast the Partners section in [[Screen_Specifications]]. |
| 8 | **No conversations/inbox and no channel besides one-way email.** No SMS, no call logging, no two-way threads. | `channel:"Email"` is the only channel constant; there is no inbox screen, no message thread model, no reply handling. |
| 9 | **The "AI" is theater.** Nothing intelligent exists — a deal-breaker for a product whose thesis is an embedded AI layer (Ally). | `cmpWriteAI()` waits 850 ms then inserts one hardcoded string; `aiRewrite(tone)` waits 700 ms and toasts "✨ AI rewrote your draft"; "shorter" tone literally deletes middle paragraphs. No model, no API, no prompt anywhere. |
| 10 | **Fake integrations presented as real.** Actively dangerous if ever demoed. | Settings shows **Encompass as "✓ Connected" via a static style string**; Salesforce/Google Contacts "Connect" buttons are dead. Zero integration code exists — directly violating CANON's "never claim an unproven integration is confirmed." |
| 11 | **No backend, persistence, auth, or tenancy.** Nothing survives refresh; anyone is "Minh Tran"; no roles enforced beyond a client-side toggle. | All data is hardcoded constants + in-memory `state`; no localStorage, no fetch, no login. The manager role is a UI switch, not access control. |
| 12 | **No reporting or intelligence.** CRM activity, conversion, pipeline visibility, and source ROI are unknowable. | The only metrics anywhere are email stats (delivered/opened/clicked/bounced) and open-rate strings on team cards — nothing feeds an Intelligence-class module ([[Screen_Specifications]]). |
| 13 | **No multilingual support**, despite Loan Factory's Vietnamese-heavy LO base being a locked differentiator. | The bundle embeds 7 Inter woff2 fonts *including Vietnamese unicode-range subsets* — yet every string in the app is English. Fonts were bought; the feature never was. |
| 14 | **Wrong design language.** Coral/beige pastel, emoji-as-iconography, low density — the opposite of the locked elite-command-center direction in [[Design_System]]. | Coral #E0603A / beige #F6F1EA cards; emoji-decorated template cards; "Good morning, Minh 👋"; large whitespace, low information density. |
| 15 | **Unportable, untestable architecture.** Nothing can be lifted into a real codebase. | Proprietary DC runtime (not standard React project code); one 938-line god class; styles as concatenated JS strings (e.g. `swOn="width:40px;height:23px;..."`); no types, tests, error handling, or routing (screen is a `state.screen` string — no URLs, no deep links, no back button). |
| 16 | **Fragile and faked data semantics.** The data layer lies about its own results. | Campaigns reference lists **by display name** (`c.list === l.name` — rename a list and its campaigns silently detach); combined-list intersection is `Math.round(min(counts) × 0.55)`; `importBirthdays()` just toasts "18 birthdays imported ✓"; sends set `delivered = count, opened = 0`. Also absent: any accessibility structure. |

## 3. What deserves to survive — interaction ideas only

The prototype's *concepts* are frequently better than its code. These patterns are salvaged into the new design (none as code — see verdict):

| Idea | Where it appears in the prototype | Where it lands in Loan Factory CRM |
|---|---|---|
| AI suggestion cards with one-tap primary action ("Finish & send" / "Turn on") + secondary "Later / Review" | Home "AI suggestions for you" | The seed of Ally's approval-queue card pattern — [[AI_Product_Architecture]], [[Screen_Specifications]] (Today) |
| Plain-language trigger cards ("When: rates drop ≥ 0.25%") | Campaigns screen | [[Automation_Catalog]] automation cards — automations described in mortgage English, never node graphs |
| Trigger → recommended-audience mapping (`RECO`) | Campaign builder auto-suggests the right list per trigger | "Toddler simple" default segmentation in [[Automation_Catalog]] |
| Scheduled-send health checks with named blockers and one-tap fixes ("Emily Pham has no email on file — this send will be skipped." / "Add her email") | Campaign calendar needs-attention panel | Ally's pre-send validation pattern — [[AI_Product_Architecture]] |
| Allowance/quota meter with over-limit pause semantics ("New sends are paused") | Home quota banner + Team quota table | Team-level send governance — Team module ([[Screen_Specifications]]), Phase 2 |
| Manager "view as LO" workspace switch + per-LO quota administration (searchable, paginated) | Team screen | Team/branch-leader oversight pattern — [[Screen_Specifications]] (Team) |
| Dynamic vs Static vs Combined list taxonomy with plain-English rules ("Funded & rate drop ≥ 0.5%") | Contacts screen | People smart segments — [[Data_Model]], [[Screen_Specifications]] (People) |
| Trigger taxonomy grouping (Occasions / Loan milestones / Application / New leads) | Campaign builder trigger groups | Loose precedent for macro-phase grouping of automations |
| Time-aware greeting + date context on landing | Home | Today screen header |
| ~35 pieces of warm, plain-language email copy | Triggers/holidays/templates | **Cross-check for tone only** — the 135-template framework ([[Asset_Inventory]] §2) supersedes it as the communication content layer per D-07 |

Anti-patterns to explicitly avoid (also evidence-backed): entity linkage by display-name string; integration status shown without a live connection behind it; emoji as iconography (banned by [[Design_System]]); "AI" labels on non-AI behavior.

## 4. Verdict: REPLACE — formally, with rationale

**The prototype is replaced, not evolved. Zero lines of it are portable.** (Decision D-01, Locked, in [[Decisions]].)

Four independent grounds, any one of which would be sufficient:

1. **Wrong framework.** The app is proprietary DC-runtime template code, not standard React/JSX. Nothing compiles inside a Next.js + TypeScript project ([[Technical_Architecture]]) without a total rewrite — porting cost exceeds rewrite cost by a wide margin.
2. **Wrong architecture.** One in-memory god class with no backend, persistence, auth, routing, types, or tests. There is no foundation to extend; problems 11, 15, and 16 are structural, not fixable by iteration.
3. **Wrong scope.** It is an email micro-tool. The product to be built is an AI-powered mortgage CRM — pipeline, people, partners, conversations, automations, intelligence (problems 1–8, 12). Evolving it means building ~90% of the product around a hostile 10%.
4. **Fake core claims.** The two things the new product must be most trustworthy about — AI and integrations — are exactly the two things the prototype fakes (problems 9–10). Its "Encompass ✓ Connected" tile is a standing compliance hazard if the file is ever demoed.

Disposition: the source file and extracted directory (`_product_discovery/crm_html_extracted/`) are kept **untouched as a read-only reference artifact and idea board**. The salvage list in §3 is the complete and only inheritance.

Related: [[Asset_Inventory]] · [[Decisions]] · [[Build_Log]] · [[PRD]] · [[Design_System]] · [[AI_Product_Architecture]] · [[Automation_Catalog]]
