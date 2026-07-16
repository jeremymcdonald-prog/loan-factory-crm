# Information_Architecture

Purpose: this document defines how Loan Factory CRM is organized so a user always knows where they are, what they're looking at, and what to do next — the 10-item primary navigation in full detail, the global patterns that behave identically on every screen (search, notifications, approvals, record pages, responsive mobile web), the object model users actually perceive and how those objects link, the URL map that makes every record shareable, and the role-by-role visibility matrix. It is the structural contract between [[PRD]], [[Screen_Specifications]], and [[Design_System]]: if a screen or route isn't placed here, it doesn't exist. Everything below conforms to the locked CANON navigation and the "toddler simple" standard — one obvious primary action per section, plain mortgage language, and Ally present on every screen as a preparer, never an autonomous actor (see [[AI_Product_Architecture]]).

---

## 1. Organizing principles

1. **Navigation is organized by what the user is doing, not by what the software contains.** The retired prototype's nav (Home / Contacts / Campaigns / Newsletter / Templates / Campaign calendar / Email history) was a feature list — seven items, five of which were flavors of "email." Loan Factory CRM's ten items are work surfaces: *Today* (what needs me now), *Pipeline* (my opportunities), *People* (my relationships), and so on. Templates, calendars, and send history still exist — inside the surface where they're used.
2. **The system carries the burden of prioritization.** Users never open a section and hunt. Every list defaults to a "needs attention" sort; every section header answers "is anything here urgent?" before the user scrolls.
3. **Objects have one home and many doorways.** A Loan lives at one URL. It is reachable from Pipeline, from its borrower's Person page, from a Task, from a Conversation, from an approval card, from search. Same record, same page, every path.
4. **Ally is ambient, not a destination.** There is no "AI" nav item. Ally appears as contextual cards, drafts, and briefings inside each section, and as the answer layer of the command palette. Every Ally output routes through the approval pattern (§3.3).
5. **Depth is capped at three levels**: Section → Sub-view → Record. Nothing in the product requires a fourth click to reach.

---

## 2. The 10 primary navigation items (locked), fully specified

### 2.1 Today — the command center (default landing)

| | |
|---|---|
| **Purpose** | Answer one question the moment the app opens: *what matters right now, and what should I do about it?* This is the product thesis rendered as a screen. |
| **What lives here** | The daily briefing; the prioritized action stack (blockers first: expiring rate locks, docs-needed follow-ups still open three days before closing, borrowers who haven't replied to a follow-up in 24h, untouched new leads); the approval queue summary; today's calendar (consultations, closings); pipeline pulse (files that moved / stalled overnight); wins feed (funded, CTC). |
| **Key sub-views** | None — Today is deliberately a **single surface** (per [[Screen_Specifications]] Screen 1): Ally's collapsible morning briefing at top ("3 closings this week, 2 files stalled in Processing, 1 rate-alert lead overnight"), the ranked WorkQueue as the screen itself, and a *Done today* tally for end-of-day confidence. The full approval queue is its own screen (Screen 19), one tap away via the persistent top-bar chip and `/today/approvals` — a doorway from Today, not a tab inside it. |
| **Primary action** | **Clear the next item** — every card carries its one-tap resolution (Approve & send / Call / Reschedule / Snooze with reason). The screen is designed to be emptied. |
| **Ally here** | Ally *builds* this screen: it ranks the stack (documented, fair-lending-safe factors only — see [[AI_Product_Architecture]]), writes the briefing, pre-drafts the response attached to each card, and explains every ranking in plain language ("This lead is #1 because it arrived 40 minutes ago from your Facebook ad and hasn't been called"). The scorecard question from the persona pack is the acceptance test: *"Does the dashboard show the next right action, or does it become another place to hunt?"* |

### 2.2 Pipeline — every active loan, by stage

| | |
|---|---|
| **Purpose** | Show where every opportunity stands in the locked 20-stage lifecycle and which files need a push. Pipeline is the CRM's relationship view of each file: stage and milestone facts are entered by the team in v1 (with read-only sync from LOS/POS systems as a future integration); the loan of record lives in the LOS, never here. |
| **What lives here** | The board (5 macro-phase columns — ENGAGE / QUALIFY / TRANSACT / RETAIN / GROW — each expandable to its numbered stages, per [[Decisions]] D-06); the table view (sortable, filterable: stage, days-in-stage, lock expiration, closing date, partner, program); stale-file alerts (days-in-stage exceeds the stage's healthy threshold); milestone dates (lock, appraisal, CTC, closing, funding — team-entered visibility facts that drive follow-up timing, not loan-of-record data). |
| **Key sub-views** | *Board* (default) · *Table* · *Closing calendar* (loans by closing date, month grid) · *Stalled* (saved filter, one tap from the board header) · per-stage drill-in (e.g. tap "TRANSACT · 12 Submitted to Underwriting" to see just those files). |
| **Primary action** | **Advance an opportunity** — move it to the next stage (drag on board, or the stage stepper on the record), which fires the stage's communication automations and Ally's stage-entry checklist. |
| **Ally here** | Stage-entry cards ("Moved to Conditional Approval — here's the congratulations-and-what's-next email, ready to approve"); stall detection with a named reason and a drafted fix ("No borrower contact in 6 days at Disclosures — a check-in email is drafted"); closing-week risk sweeps (the Friday-afternoon-blocker stress scenario from the persona pack is the design target). |

### 2.3 People — every human relationship (borrowers, leads, past clients)

| | |
|---|---|
| **Purpose** | One place for every person the LO serves — before, during, and long after a loan. Relationship memory, not a rolodex. |
| **What lives here** | The full contact database; new-lead intake (auto-ingested from Loan Factory websites, lead funnels/widgets, and Facebook Ads leads tagged "Automatically Created" — proven surfaces per [[Integration_Map]] — plus manual and CSV entry per D-10); segments (dynamic rules like "Funded & rate drop ≥ 0.5%", static imports, and combined lists — the one taxonomy worth keeping from the prototype — built in a plain-English segment builder whose combine step is truthful about union vs. intersection: "anyone in either list" vs. "only people in both", with a live count for each reading; this builder is the UI home of FR-PE-7 in [[PRD]] and the audience engine Campaign Builder and Automations depend on); duplicate detection and merge; per-contact language preference (EN/VI first-class, per D-08); consent and DNC status. |
| **Key sub-views** | *All people* · *New leads* (untouched first) · *In process* (has an active loan) · *Past clients* · *Segments* (rule-based lists in plain English) · Person record (§3.4). |
| **Primary action** | **Add / work a lead** — capture or open a person and log the next touch. |
| **Ally here** | Lead triage on arrival (source, intent, suggested first touch drafted in the contact's language); enrichment prompts ("No birthday on file for 12 past clients — want to request it in the next check-in?"); reactivation surfacing (Phase 3: "38 past clients could benefit from a rate review") routed as approval cards, never auto-sent. |

### 2.4 Partners — referral relationships (agents first)

| | |
|---|---|
| **Purpose** | Grow and protect the referral engine: real-estate agents, builders, financial planners, attorneys, CPAs. Absent from the prototype entirely; first-class here. |
| **What lives here** | Partner records with referral scorecards (leads sent, loans funded, cycle time, last touch); the partner's active files (privacy-safe view: milestone, timeline, file owner — never borrower financial details, which the CRM does not store in any case, per the compliance framework's Realtor privacy matrix in [[Mortgage_Compliance]]); co-branded marketing requests; partner nurture cadences; agent-facing milestone status updates (Phase 2). |
| **Key sub-views** | *All partners* · *Top referrers* (ranked by funded volume) · *Going quiet* (no referral or touch in N days) · *Prospecting* (agents being courted, for agent relationship managers) · Partner record (§3.4). |
| **Primary action** | **Log / plan a partner touch** — the discipline the referral business runs on. |
| **Ally here** | Per-transaction agent updates drafted at every milestone (privacy-filtered automatically — the update Ally writes to an agent physically cannot contain borrower financials); "going quiet" alerts with a drafted re-engagement; co-branded content drafts routed through the Marketing compliance check. All 12 REA personas in [[User_Personas]] emphasize privacy-safe speed of status — this section is built for that. |

### 2.5 Conversations — every message, one inbox

| | |
|---|---|
| **Purpose** | All communication with borrowers and partners in one threaded place, so nothing lives in a personal inbox the system can't see. |
| **What lives here** | Unified inbox (email in Phase 1; SMS in Phase 2 under the consent-gated, non-sensitive SMS policy from the communication framework — no rates, payment changes, or problem-file content by SMS, ever); threads bound to Person or Partner records; Ally-drafted replies awaiting approval; scheduled/queued sends with pre-send health checks ("no email on file — this send will be skipped · Add it"); send history with delivery/open status. |
| **Key sub-views** | *Needs reply* (default) · *Awaiting approval* (drafts Ally prepared) · *Scheduled* · *Sent* · thread view (right rail shows the person's stage, loan, and tasks so context never requires a tab switch). |
| **Primary action** | **Reply** — with Ally's draft pre-loaded in the composer, in the contact's preferred language, editable, one tap to approve and send. |
| **Ally here** | Drafts every reply from the 135-template library (stage-aware retrieval by EMT ID — see the template mapping in [[Communication_Templates]]); flags sensitive topics that must never be automated (rate locks, cash-to-close changes, closing delays — the framework's Never-Automate class becomes a hard composer warning); summarizes long threads on open. Nothing sends without a human tap (D-05). |

### 2.6 Marketing — campaigns, content, and compliance in one flow

| | |
|---|---|
| **Purpose** | Stay top-of-mind at scale — newsletters, social content, partner campaigns — with compliance built into the path, not bolted after. |
| **What lives here** | Campaigns (audience segment + content + schedule); the content library (135 email templates keyed to lifecycle stage; 70+ seeded social assets — reels, carousels, stories — from the reviewed social pack); content briefs and the batch workflow (16 content families, 3-tier risk model from the marketing content playbook); the content calendar; the pre-publish compliance check (deterministic lint — NMLS #320841, Equal Housing, trigger-term scan, do-not-say list, state rules — plus Ally review, per [[Mortgage_Compliance]]); send allowance meter; performance (sends, opens, replies, leads attributed). |
| **Key sub-views** | *Campaigns* · *Content library* (by stage and family, EN/VI variants side by side) · *Calendar* · *Review queue* (items awaiting brand/compliance approval, with the Draft → Needs Review → Approved / Changes Requested / Rejected state machine) · *Performance*. |
| **Primary action** | **Create a campaign** — pick audience, pick or generate content, schedule; the compliance check runs before the schedule button enables. |
| **Ally here** | Generates drafts from briefs (social post, video script, realtor co-brand, rate-context content flagged high-risk); runs the compliance-reviewer pass and explains every block ("Missing Equal Housing line — required for this format"); proposes next month's calendar from the content-mix system (40% buyer education / 25% scenarios / 20% realtor / 10% investor / 5% conversion). High-risk families always route to human compliance review. |

### 2.7 Automations — the rules that work while you don't

| | |
|---|---|
| **Purpose** | Let a non-technical LO see, trust, and control every automatic behavior in plain language. (n8n executes underneath; users never see it — D-09.) |
| **What lives here** | Automation cards in plain trigger language ("**When** a file reaches Clear to Close → **send** the CTC congratulations email → **unless** the borrower already replied today"); the recipe gallery (pre-built from the communication framework's trigger catalog and automation policies: Fully Automated templates become one-tap-enable recipes, Semi-Automated become draft-for-approval recipes, Manual Only / Never Automate are not offered as recipes at all); run history ("what did this do, to whom, when"); per-automation stop conditions, visible and editable. |
| **Key sub-views** | *My automations* · *Recipe gallery* (grouped by lifecycle macro-phase: Occasions / Loan milestones / Application / New leads — the grouping salvaged from the prototype) · *Run history* · *Paused & issues* (automations that hit an error or a stop condition, with the reason in plain words). |
| **Primary action** | **Turn a recipe on** — one tap, with a preview of exactly who it will affect first ("This will queue 4 emails tomorrow — review them?"). |
| **Ally here** | Recommends the right recipe at the right moment ("You've manually sent 6 doc-reminder emails this week — this automation does it with your approval each time"); pre-send validation on every automated run (missing merge fields, consent, stop conditions); drafts the content each run produces, into the approval queue when the policy tier requires it. Stop conditions always override timing — the framework's rule, enforced in the engine (see [[Automation_Catalog]]). |

### 2.8 Intelligence — answers, numbers, and foresight

| | |
|---|---|
| **Purpose** | Tell the LO and the leader the truth about the business — production, sources, conversion, and what to do differently — in one place. |
| **What lives here** | **Reporting lives here, deliberately** (see §6 for the justification): production dashboards (funded volume, units, pipeline value by stage); conversion funnel across the 5 macro-phases (lead → consultation → preapproval → contract → funded, with drop-off rates); lead-source ROI (Facebook Ads, website widgets, QM Pricer alerts, partner referrals — attribution from the structured lead-source model); partner production reports; Ally Insights (the named Insight objects of §4: "Your Tuesday-called leads convert 2.1× better", each with its evidence and a suggested action); saved reports and scheduled report delivery. |
| **Key sub-views** | *Overview* (the numbers that matter this month) · *Production* · *Funnel* · *Sources* · *Partners* · *Insights* (Ally's findings feed) · *Saved reports*. |
| **Primary action** | **Ask a question** — a natural-language query box is the section's front door ("How many VA loans did I fund this quarter?" → chart + the underlying loan list, always drillable to records). |
| **Ally here** | This is Ally's most analytical surface: it composes the answers, generates Insights on a schedule, and attaches a recommended action to every finding (which becomes a Today card if accepted). Every number cites its records — the persona scorecard's "source evidence clarity" field is the acceptance bar. No AI scoring shown here uses protected-class features or proxies (D-11). |

### 2.9 Team — people who run the shop

| | |
|---|---|
| **Purpose** | Give team leaders and branch leaders visibility and control without turning the CRM into surveillance software — and give teams a shared operating picture. |
| **What lives here** | Team roster with role assignments; team pipeline (aggregate board across LOs); workload and coverage view (who owns what, who's overloaded — the high-volume persona scenarios drive this); lead-routing rules (round-robin, language match, source-based — supersedes the platform's single "Default Loan Officer" concept); send-allowance administration per LO (over-limit pauses sends, salvaged pattern); "view as" (a leader can see the CRM through a team member's eyes, read-only, logged); team onboarding checklists; coaching views (Phase 3). |
| **Key sub-views** | *Roster* · *Team pipeline* · *Routing rules* · *Allowances* · *View as* · *Onboarding*. |
| **Primary action** | **Route or reassign** — put the right file or lead in the right hands. |
| **Ally here** | Coverage alerts ("Maria has 3 closings Friday and 14 open tasks — reassign these 4?"); team briefing for leaders (the Today briefing, aggregated); coaching observations in Phase 3 (always framed as private, evidence-linked suggestions to the leader, never public shaming). |

### 2.10 Settings — the quiet room

| | |
|---|---|
| **Purpose** | Everything configured once and rarely touched — kept out of the way of daily work. |
| **What lives here** | Profile & licensing (name, photo, NMLS number, licensed states — these feed template merge fields and compliance footers); notification preferences (§3.2 lanes and quiet hours); language preferences (UI language; default outbound language); email/calendar connection; integrations (only proven ones listed as available; everything else marked "planned" — never a fake "Connected" badge, the prototype's cardinal sin); compliance defaults (company NMLS #320841, Equal Housing display, state-rule table maintained as data, lender-paid-compensation-only default); Ally preferences (briefing time, draft tone, approval thresholds); security (MFA, sessions); data (import/export); billing & workspace admin (admin-only). |
| **Key sub-views** | *Profile & licensing* · *Notifications* · *Connections & integrations* · *Compliance* · *Ally* · *Security* · *Data* · *Workspace* (admin). |
| **Primary action** | **Connect your email** — the one setting that unlocks the most product value on day one. |
| **Ally here** | Minimal by design. Setup guidance only ("Your Texas license isn't entered — templates sent to Texas borrowers will hold until it is"). No Ally cards compete for attention in Settings. |

---

## 3. Global patterns (identical on every screen)

### 3.1 Command palette + natural-language search (⌘K / Ctrl-K)

One search surface, three behaviors, resolved by intent — the user never chooses a "mode":

| Input looks like | Behavior | Example |
|---|---|---|
| A name/identifier | **Jump** — ranked records grouped by type (People, Loans, Partners, Conversations, Campaigns), fuzzy, diacritic-insensitive (searching "Nguyen" finds "Nguyễn" and vice versa — non-negotiable for the EN/VI base) | "tran" → Minh Tran (Person), Tran refi (Loan) |
| A verb | **Act** — creates or navigates | "new lead", "log a call with Sarah", "go to closing calendar" |
| A question | **Answer** — Ally responds with data + cited records, inline | "which files close this week?", "what's my pull-through rate this quarter?" |

Rules: available on every screen including record pages; recent items shown on empty query; results respect the permissions matrix (§7) — search never leaks a record the role can't open; answer-mode responses always link to the underlying records (source-evidence rule).

### 3.2 Notification model — three lanes, zero badge storms

Every notification belongs to exactly one lane; lanes have different delivery rights:

| Lane | What qualifies | Delivery | Example |
|---|---|---|---|
| **Act now** | A blocker or time-critical event on something the user owns | In-app + browser push (mobile web, where the user enables it) + optional SMS-to-self | "Rate lock on Nguyen expires in 48h" · "New lead from your Facebook ad" |
| **Review** | Something prepared and waiting for human approval | In-app; enters the approval queue; morning briefing rollup | "Ally drafted 3 stage-update emails" |
| **FYI** | State changes worth knowing, not acting on | Digest only (briefing + optional end-of-day email) | "Appraisal received on Chen" · "Your March newsletter: 62% open" |

Rules: every notification deep-links to the exact record with the relevant panel open; the Notification Center is a **delivery and history log, never a second to-do list** (§3.6); lane assignment is system-defined per event type (users tune *delivery*, not lane logic, in Settings); quiet hours suppress push but never suppress the in-app record of an Act-now item; a notification about a record the user can't access is never sent (edge case SCN-EDGE-012 in the QA pack — see [[QA_Plan]]).

### 3.3 Approval queue — one pattern for every AI output

The physical form of "Ally prepares, the human approves" (D-05):

- **Access:** persistent icon in the top bar with a count (visible on every screen); the full approval queue screen at `/today/approvals` (Screen 19 — reached from Today, the mobile *Queue* tab, and the top-bar chip); and inline — every Ally draft can be approved where it appears (composer, loan record, campaign) without visiting the queue.
- **Card anatomy (fixed):** *What* (the drafted email/SMS/post/action, fully rendered) · *Who* (recipient, with stage and language) · *Why* (which trigger or request produced it) · *Evidence* (the records and template ID it drew from).
- **Verdicts — the canonical AllyCard set, defined once in [[Design_System]] and used verbatim on every surface that renders an Ally output (Today, the approval queue, composer, loan record, campaign):** **Approve & send** · **Edit then send** (diff logged) · **Reject** (requires a structured reason — *Wrong timing · Wrong tone · Wrong recipient · Factually wrong · Compliance concern · Not needed / duplicate · Other* — because rejection reasons feed Ally's learning loop, per [[AI_Product_Architecture]]) · **Snooze** (to a time) · **Reassign** (where the item's class permits). No screen invents its own verdict set or subset labels.
- **Rules:** keyboard-first (J/K to move, A to approve, E to edit); batch approve is **Phase 2** (single-item trust first, per [[Implementation_Roadmap]]) and, when it ships, exists only within the Routine group (identical-template, Fully-Automated-tier, lint-clean items) with a sampled review and the full recipient list shown before commit; sensitive categories (rate lock, cash-to-close, payment change, delays, adverse outcomes) can never appear as batch items and are visually marked; every verdict is written to the audit trail with user, timestamp, and diff-if-edited.

### 3.4 Record page anatomy — Person, Loan, Partner share one skeleton

Learn one record page, know them all:

| Zone | Person | Loan | Partner |
|---|---|---|---|
| **Header** (identity + state + one primary action) | Name, photo, language chip, consent/DNC chips, owner · **Log a touch** | Borrower name + program + amount, stage stepper (20 stages in 5 groups), urgency chip (lock/closing countdown), owner · **Advance stage** | Name, brokerage, tier (Top / Active / Quiet / Prospect), owner · **Log a touch** |
| **Left rail** (facts) | Contact info, employment basics, preferences, source, tags | Terms (program, rate-lock status + expiry, LTV band, closing date — team-entered visibility facts; read-only LOS/POS sync is a future integration), property, participants (borrower, co-borrower, agent, processor, coordinator), docs-needed follow-up flag (a communication cue only — documents themselves live in the LOS/POS, never here) | Contact info, coverage area, referral scorecard (sent / funded / cycle time), co-brand assets |
| **Center: unified timeline** | Every touch, message, note, task, stage event, and Ally action — one stream, filterable by type, newest first, with explicit save states | Same stream scoped to this loan | Same stream + referral events ("Sent lead: the Parks, 3/12") |
| **Right rail: Ally panel** | Next best action + drafted message + relationship summary | Stage checklist, stall risk + reason, drafted next communication, milestone countdown | Drafted status update (privacy-filtered), nurture suggestion, "going quiet" risk |
| **Tabs** | Overview · Loans (all, past and active) · Conversations · Tasks · Notes | Overview · Conversations · Tasks · History (full audit) | Overview · Referred loans · Conversations · Tasks · Marketing |

Rules: the Person↔Loan relationship is explicit and navigable in both directions (one person, many loans over a lifetime — the prototype's contact-*is*-the-loan flaw is structurally impossible here); the audit History tab on Loan shows every AI action attributably; nothing on a Partner record ever renders borrower financial data, enforced at the query layer, not the template layer (see [[Technical_Architecture]]).

### 3.5 Mobile web navigation collapse (responsive)

There is one product — a responsive web application — and the mobile-browser layout is a required, first-class rendering of it, not a separate app (no native iOS/Android builds, no app store). Mobile web is the between-appointments companion, not a shrunken desktop:

- **Bottom tab bar (4 + More):** **Today · Pipeline · Conversations · Queue · More**. These four cover >90% of mobile moments (triage, check a file, reply, clear approvals between appointments). *Queue* is the Ally approval queue (Screen 19's mobile-web form) — the trust centerpiece earns the fourth slot; person lookup is one tap away via the persistent search field, and the full People section lives in More.
- **More sheet:** People, Partners, Marketing, Automations, Intelligence, Team, Settings — full sections, one tap deeper.
- **Rules:** the approval count rides on the Queue tab badge; ⌘K becomes a persistent search field at the top of every tab; Act-now browser push notifications (where the user has enabled them) deep-link into the record; every mobile-web flow supports interruption and resume (the mobile-resume edge case in [[QA_Plan]] is an acceptance test); record pages collapse to Header → Ally panel → Timeline, with facts behind a "Details" disclosure; layouts are breakpoint-driven from one codebase, so the same URL works on any device. Desktop-first surfaces (automation building, report building, workspace admin) render read-only on small screens rather than badly.

### 3.6 One to-do list — Today is the authoritative work surface

The same item legitimately has many doorways (a new lead is reachable from People › New leads, a push notification, and the mobile home screen); it must never have many *lists*. Three rules keep "toddler simple" true:

1. **Today's WorkQueue is the single authoritative ranked to-do list.** If something needs a human, it appears in Today — no exceptions. Every actionable item surfaced anywhere else (People › *New leads*, Conversations › *Needs reply* and *Awaiting approval*, task views, the approval queue) is guaranteed to also appear in Today; those surfaces are scoped doorways into the same underlying items. Acting on an item through any doorway clears it everywhere, instantly — clearing is one state, not per-surface.
2. **The Notification Center is a delivery and history log, not a work list.** Its items only deep-link to the record or queue item; it accumulates no work of its own, and completing the work clears the corresponding badge automatically.
3. **One user-visible urgency vocabulary.** Users see exactly one urgency system: the **red / amber / blue** status colors defined in [[Design_System]] (red = act now, amber = handle today, blue = FYI). The three notification lanes (§3.2) render as exactly these colors; the approval queue's risk groups (Routine / Standard / Sensitive) are *policy* groupings rendered with the same colors. The 10 internal priority classes that rank the WorkQueue are ranking machinery only — they never appear as user-facing labels or a second taxonomy.

---

## 4. The object model users perceive

Eight nouns. Users never see tables, IDs, or joins — they see these words, used consistently in every label, notification, and Ally sentence. (Physical schema in [[Data_Model]].)

| Object | Plain definition | Primary home | Created by |
|---|---|---|---|
| **Person** | A human you serve: lead, borrower, co-borrower, past client | People | Lead capture, import, manual add |
| **Loan** | The CRM opportunity record for one financing journey of a Person, in one of the 20 stages — relationship and stage visibility only; the loan of record lives in the LOS | Pipeline | User (from a Person), or automation on qualified-lead conversion |
| **Partner** | A referral relationship: agent, builder, CPA, attorney, planner | Partners | Manual add, referral detection |
| **Task** | A committed piece of work with an owner and a due moment | Today (aggregated); attached to its record | User, automation, or Ally (accepted suggestion) |
| **Conversation** | A message thread with a Person or Partner, across channels | Conversations | Inbound message, outbound send |
| **Campaign** | A one-to-many communication: audience + content + schedule | Marketing | User (Ally can propose) |
| **Automation** | A standing rule: trigger → action → stop conditions | Automations | User enabling a recipe; custom (advanced) |
| **Insight** | A named, evidenced finding from Ally with a suggested action | Intelligence › Insights | Ally only |

### How objects interlink

| Relationship | Cardinality | What the user experiences |
|---|---|---|
| Person ↔ Loan | one Person → many Loans (over a lifetime); a Loan → one primary borrower + optional co-borrowers | The Loans tab on a Person; the borrower name in every Loan header. Past loans stay attached forever — that's the RETAIN/GROW engine. |
| Partner → Loan | one Partner → many Loans (as referral source or transaction agent) | "Referred by" on the Loan; the Referred-loans tab on the Partner; scorecards computed from this link |
| Partner ↔ Person | a Partner referred this Person | Source line on the Person; closes the referral-thank-you loop |
| Task → any of Person / Loan / Partner / Campaign | a Task points at exactly one record (or none, for personal to-dos) | The task shows its record inline; completing it writes to that record's timeline |
| Conversation → Person or Partner | every thread binds to exactly one relationship | Open a thread, see the relationship's context in the right rail; threads about an active file also badge the Loan |
| Campaign → Segment of People/Partners | audience is a saved segment (dynamic rule or static list) | "Who gets this" is always inspectable before send |
| Automation → creates Tasks, Conversations (drafts), and timeline events | runs are visible on the affected records | "Sent by: *Doc reminder* automation, approved by Jeremy" on the timeline |
| Insight → cites Persons/Loans/Partners/Campaigns | every Insight lists its evidence records | Tap through from claim to proof, always |

One deliberate omission: **Document** is not a CRM object at all. Loan documents are collected, stored, and managed in the LOS/POS — that is loan work, and it stays outside this product's boundary. What the CRM keeps is a simple docs-needed follow-up flag on the Loan record, because "the borrower still owes documents" is a communication fact worth chasing; the documents themselves never enter the CRM (see [[Integration_Map]]).

---

## 5. URL / route map

Stable, human-guessable, shareable URLs. Every record has exactly one canonical URL; IDs are short opaque slugs; a pasted link always lands on the record with permissions enforced (a user without access sees "This record belongs to another team — request access", never a blank error, per the persona pack's permission-clarity requirement).

| Route | Screen |
|---|---|
| `/today` | Command center (default post-login redirect from `/`) |
| `/today/approvals` | Full approval queue |
| `/pipeline` · `/pipeline/table` · `/pipeline/calendar` · `/pipeline/stage/:stageNo` | Board (default) · table · closing calendar · single-stage drill-in |
| `/loans/:loanId` (+ `/conversations` · `/tasks` · `/history`) | Loan record (the CRM opportunity record) and tabs |
| `/people` · `/people/leads` · `/people/segments` · `/people/segments/:segmentId` | People lists and segments |
| `/people/:personId` (+ `/loans` · `/conversations` · `/tasks` · `/notes`) | Person record and tabs |
| `/partners` · `/partners/:partnerId` (+ `/loans` · `/conversations` · `/marketing`) | Partner lists, record, tabs |
| `/conversations` · `/conversations/:threadId` · `/conversations/scheduled` | Inbox (needs-reply default) · thread · scheduled sends |
| `/marketing` · `/marketing/campaigns/:campaignId` · `/marketing/library` · `/marketing/library/:templateId` · `/marketing/calendar` · `/marketing/review` | Marketing surfaces (review = compliance/brand queue) |
| `/automations` · `/automations/gallery` · `/automations/:automationId` · `/automations/:automationId/runs` | Automations, recipes, detail, run history |
| `/intelligence` · `/intelligence/production` · `/intelligence/funnel` · `/intelligence/sources` · `/intelligence/partners` · `/intelligence/insights` · `/intelligence/insights/:insightId` · `/intelligence/reports/:reportId` | Intelligence and reporting (saved reports have URLs — a leader can bookmark "March production") |
| `/team` · `/team/pipeline` · `/team/routing` · `/team/allowances` · `/team/members/:userId` | Team surfaces |
| `/settings/*` | `profile` · `notifications` · `connections` · `compliance` · `ally` · `security` · `data` · `workspace` |
| `/search?q=` | Full-page results (palette handles the common case; this is the overflow) |

Coverage note: three routed surfaces above are first-class screens that require dedicated specs (or explicit sections within an existing spec) in [[Screen_Specifications]] — the **People index** (`/people`, with the All people / New leads / In process / Past clients sub-views), the **Segment builder** (`/people/segments`, home of FR-PE-7), and the **Pipeline closing calendar** (`/pipeline/calendar`). These are the lists and builders LO assistants live in daily; a record spec (Person, Loan) does not substitute for them.

Conventions: list-view filters serialize to query params (`/pipeline/table?stage=13&sort=lock_expiry`) so any working view is shareable with a teammate; language preference never appears in URLs (it's per-user and per-contact data, not routing); no personal data ever appears in URLs or query strings.

---

## 6. Why this beats the proposed alternatives (justifications)

| Choice | Alternative considered | Why the locked/chosen structure wins |
|---|---|---|
| **Reporting lives inside Intelligence** | An 11th nav item, "Reports" | Three reasons. (1) *Behavioral:* standalone Reports sections in CRMs become graveyards — visited monthly, dreaded, decoupled from action. Fusing numbers with Ally's Insights means every metric arrives next to "and here's what to do about it," which converts reporting from homework into fuel for Today. (2) *Cognitive:* ten items is already the ceiling for scanability; an 11th forces either crowding or demoting Team/Settings into a junk drawer. (3) *Honest naming:* the natural-language question box means most "reporting" happens by asking, not by browsing report lists — "Intelligence" describes what the section does; "Reports" describes a 2010 artifact format. Saved/scheduled reports still exist, with URLs, inside `/intelligence/reports/`. |
| **Today, not Home** | "Home" / "Dashboard" | "Home" promises a lobby; "Today" promises an answer. The screen is built to be *emptied*, not admired — a dashboard is something you look at, Today is something you clear (D-02). |
| **Templates are not a nav item** | Prototype had top-level Templates | Nobody's job is "templates." Content surfaces where it's used: in the composer (Conversations), in campaign building (Marketing › Library), in automation recipes. A top-level Templates section trains users to browse content instead of working relationships. |
| **Newsletter / Campaign calendar / Email history are not nav items** | Prototype had all three | All are facets of Marketing (campaign type, calendar view, performance view) — three of the prototype's seven nav slots were spent on one feature's views. Collapsing them funds Pipeline, Partners, Conversations, and Intelligence — the sections a mortgage business actually runs on. |
| **Partners is top-level, not a People tag** | Fold agents into contacts with a "partner" tag | Partners are a different *business motion* (recurring referral relationships, privacy walls, co-marketing, scorecards) with different fields, different compliance rules (never show borrower financials), and a different owner persona (agent relationship managers). Tag-based partner management is how agent relationships rot. |
| **Approvals live under Today (plus a global icon), not as a nav item** | Standalone "Approvals" section | Approving is not a place you go; it's part of clearing your day. Housing the queue screen at `/today/approvals` keeps the approval habit inside the daily loop while the global icon guarantees one-tap access from anywhere (and the mobile Queue tab makes it a thumb-reach surface). An 11th nav item was rejected for the same crowding reason as Reports. |
| **Automations separate from Marketing** | Merge them ("campaigns are automations") | Automations govern *operational* behavior across the whole lifecycle (doc reminders, stage updates, lead follow-up), not just marketing sends. Merging them would bury pipeline automation inside a marketing context where processors and assistants — heavy automation stakeholders — never look. |
| **Five-macro-phase board with drill-in** | A 20-column board | Twenty columns is a wall, not a board. The macro-phases (ENGAGE/QUALIFY/TRANSACT/RETAIN/GROW) give the at-a-glance answer; the numbered stages appear on expansion and on the loan's stage stepper. Locked as D-06. |

---

## 7. Permissions visibility matrix by role

Legend — **F**: full (see + act on everything in section) · **T**: team scope (own team's records) · **O**: own records only · **R**: read-only · **—**: hidden. Enforcement is row-level security in the data layer (see [[Technical_Architecture]]), so scope holds in search, notifications, and deep links too — not just in menus. Borrowers never see this application at all: borrowers are CRM contacts the team communicates with, not product users.

| Section / capability | Loan Officer | LO Assistant | Processing / Ops | Team Leader | Branch Leader | Agent Rel. Manager | Marketing Coordinator | Workspace Admin |
|---|---|---|---|---|---|---|---|---|
| Today | O | O (+ assigned LOs' items) | O (assigned files) | T | F | O | O | F |
| Pipeline | O | O (assigned LOs) | T (assigned files, ops fields) | T | F | R (referred-loan milestones only) | — | F |
| People | O | O (assigned LOs) | R (people on assigned files) | T | F | R | R (segments only, no PII export) | F |
| Partners | O | O | — | T | F | F | R | F |
| Conversations | O | O (send as self; drafts for LO require LO approval) | O (ops threads on assigned files) | T (read) + O | T (read) + O | O | O (campaign replies) | F |
| Marketing — create/campaign | O | O (draft only) | — | T | F | O (partner-facing) | F | F |
| Marketing — approve high-risk content | — | — | — | T | F | — | F (brand) — compliance owner required for High tier | F |
| Automations — enable/edit | O | R | R | T | F | O (partner recipes) | O (marketing recipes) | F |
| Intelligence | O | R (assigned LOs) | R (ops metrics) | T | F | O (partner reports) | O (campaign performance) | F |
| Team | R (own team roster) | R | R | T (manage) | F (manage) | R | R | F |
| Team — allowances, routing, view-as | — | — | — | T | F | — | — | F |
| Settings — personal | F | F | F | F | F | F | F | F |
| Settings — compliance, workspace, integrations | — | — | — | R | R | — | R | F |
| Approve borrower-facing sends | O | — (prepares; LO approves) | — | O + T (delegate coverage) | O + T | — | — | F |
| Export data | O (own, logged) | — | — | T (logged) | F (logged) | O (partner data, logged) | O (campaign data, logged) | F (logged) |
| See audit trail on a record | O | O (assigned) | O (assigned) | T | F | O | — | F |

Matrix rules worth stating in prose: (1) **borrower-facing approval authority never delegates below the relationship owner** — an assistant preparing a message does not satisfy the human-approval contract; the LO (or covering leader) taps send. (2) **"View as" is leader-only, read-only, and itself audit-logged.** (3) **Partner-facing scope for ARMs is milestone-deep only** — the privacy matrix is a permission, not a formatting choice. (4) Every export writes an audit event with actor, scope, and row count. (5) Role definitions and any custom-role needs are logged for Jeremy in [[Open_Issues]]; the matrix above is the v1 default set matching CANON's eight user types plus the necessary Workspace Admin.

---

Related: [[PRD]] · [[Screen_Specifications]] · [[Design_System]] · [[Data_Model]] · [[AI_Product_Architecture]] · [[Automation_Catalog]] · [[Mortgage_Workflow_Map]] · [[Mortgage_Compliance]] · [[Integration_Map]] · [[Technical_Architecture]] · [[User_Personas]] · [[QA_Plan]] · [[Decisions]] · [[Open_Issues]]
