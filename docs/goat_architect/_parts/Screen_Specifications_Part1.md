## Screens 1-8

This part specifies the eight core working screens of Loan Factory CRM — the screens a loan officer lives in every day: the Today command center, the Lead inbox, the two person views (Contact and Borrower), the Opportunity workspace, both Pipeline views, and the Task center. Every screen follows the same contract: one obvious primary action, plain mortgage language, the system tells the user what to do next, and AI prepares while the human approves. Every screen is a CRM surface — the communication and relationship work that loan facts trigger; the loan work itself (origination, underwriting, disclosures, document collection, pricing) lives in external systems and is never performed here. Component names used here (AICard, WorkQueue, StageRail, LoanCard, DataTable, etc.) are the canonical names that [[Design_System]] defines as tokens and build-ready components; roles and access rules resolve against [[Data_Model]] and [[Technical_Architecture]]; AI behaviors resolve against [[AI_Product_Architecture]] and [[Automation_Catalog]]; stage names are the locked 20-stage lifecycle in [[Mortgage_Workflow_Map]], rendered as CRM opportunity-stage visibility.

**Shared conventions for all screens in this part**

| Convention | Rule |
|---|---|
| Primary action | Exactly one visually dominant action per screen. Everything else is secondary or inside menus. |
| Responsive web | The product is a responsive web application. Every screen works fully in desktop and mobile browsers; "Mobile behavior" below always means the mobile-browser layout — there is no native app. |
| Stage facts | Stage and milestone facts (stages, lock dates, closing dates) are CRM visibility data entered by the team in v1, with read-only sync from external systems as a future integration. The CRM never owns loan-of-record data and never gates loan work. |
| Urgency colors | Status colors are tied to loan urgency, never decoration: Red = deadline/blocker at risk, Amber = aging toward a deadline, Blue = informational/next step, Green = healthy/complete. Defined as tokens in [[Design_System]]. |
| Numerals | All metrics render in tabular numerals. |
| Freshness | Every data surface shows a FreshnessStamp ("Updated 2 min ago"). A user must never wonder whether data is current (TERA+ critical-fail condition; see [[QA_Plan]]). |
| Save state | Every edit surface shows explicit saved/saving/unsaved state. No silent saves, no silent losses. |
| Language | Every person record carries a LanguageBadge (EN, VI, ZH, ES, RU). AI drafts in the contact's preferred language; non-English drafts are always flagged "human translation review required" until per-template variants exist ([[Mortgage_Compliance]]). |
| Consent | Email/SMS consent state renders as a ConsentBadge wherever a send can originate. No consent, no send — the composer physically disables the channel. |
| AI contract | AI prepares, the human approves. Nothing borrower-facing ever sends without a human tap. Every AI action is logged and attributable ([[AI_Product_Architecture]]). |
| Keyboard | Power-user keyboard flow on desktop (A approve, E edit, S skip, J/K move through queues, ⌘K CommandBar). Never required — everything works by touch/click. |

---

### 1. Today — the command center (flagship screen)

#### Purpose
Today is the default landing screen and the product's thesis made visible: when a loan officer opens Loan Factory CRM, the system already knows what matters right now and puts it in one prioritized queue with one-tap ways to get it done. Today replaces the morning ritual of checking the LOS, email, texts, sticky notes, and memory. If Today is right, an LO can run their entire day from this one screen; the leadership-readout question from the TERA+ scorecard — "Does the dashboard show the next right action, or does it become another place to hunt?" — is the standing acceptance test for this screen.

#### Primary user
Loan officer. (LO assistants and processors get a role-filtered variant of the same screen showing their own queue; team leaders land here too but their queue is escalations and approvals, per [[User_Personas]].)

#### Primary action
**Act on the top item in the work queue** — a single dominant button on WorkQueueItem #1 whose label matches the prepared action ("Approve & send", "Call now", "Complete task"). One tap executes it, logs it, and advances focus to item #2.

#### Information hierarchy (ordered)
1. **AIBriefing** — the morning brief (top of screen, collapsible after first read).
2. **WorkQueue** — the prioritized list of everything that needs the user today (the screen's body; gets the most space).
3. **StatRow** — four glanceable production numbers (below the briefing on desktop, behind a swipe on mobile).
4. **AIApprovalTray** — count-badged entry point to all pending AI drafts (persistent, right rail on desktop).
5. **Today's calendar strip** — appointments and scheduled calls, time-ordered.
6. **Recent activity** — what happened since the user last looked (inbound replies, stage changes, automation runs). Lowest priority; collapsed by default.

#### The briefing (AIBriefing)
A 3–6 sentence plain-language summary AI generates fresh each morning (and regenerates on demand), in the Loan Factory voice — clear, practical, human, confident without promises. It is prose, not a widget wall. Content, in order of mortgage urgency:

1. Greeting with date and a one-line read of the day ("Wednesday, July 16. Two closings this week and one lock that needs attention.")
2. Deadline risks: rate locks expiring within 7 days, contract/closing dates within 5 days, anything Clear to Close but not yet scheduled.
3. Overnight inputs: new leads captured (with source), inbound replies waiting.
4. Approvals waiting: count of AI drafts in the tray.
5. Pipeline delta: what moved since yesterday (stage advances, new blockers).
6. One suggested focus ("If you only do three things today: the Nguyen lock, the two new Facebook leads, and Friday's closing docs.")

Every factual sentence in the briefing is a link — tapping "one lock that needs attention" opens that opportunity's workspace. The briefing never states a rate, never promises an outcome, and follows the do-not-say rules in [[Mortgage_Compliance]].

#### The work queue and the 10 priority classes
The WorkQueue is a single ranked list — not tabs, not widgets. Every item belongs to exactly one of ten priority classes, ranked in this order. Class rank breaks ties; within a class, items sort by deadline proximity, then loan amount. The class taxonomy is a locked design decision for this spec (log in [[Decisions]]); thresholds are configurable defaults per [[Automation_Catalog]].

| # | Priority class | What puts an item here | Default urgency | Phase | Example queue item |
|---|---|---|---|---|---|
| 1 | **Deadline blockers** | Rate lock expiring ≤ 7 days (red ≤ 3), closing date ≤ 5 days with open follow-up tasks, contract contingency dates at risk, CTC entered but closing follow-up not started — all from team-entered stage/milestone facts | Red | **P1** from manually entered lock/closing dates; full deadline watch (FR-TD-6) **P2** | "Nguyen — lock expires Friday. Borrower not yet updated." |
| 2 | **New leads (speed-to-lead)** | Any lead with zero contact attempts. SLA timer starts at capture; amber at 5 minutes, red at 1 hour | Red/Amber | **P1** | "New lead: Maria Torres — Facebook ad 'Refinance 1', 4 min ago. Call now." |
| 3 | **Inbound waiting** | Unanswered borrower/agent replies in Conversations, missed calls, keyword DMs | Amber | **P2** | "Tran replied about the appraisal 2 hours ago." |
| 4 | **AI approvals** | Prepared drafts and actions awaiting one-tap approval (stage-triggered updates, follow-ups, milestone messages) | Blue | **P1** | "Approve: 'Disclosures reminder' to Pham (EMT-018 draft ready)." |
| 5 | **Overdue tasks** | Any task past its due date, oldest first | Amber | **P1** | "Overdue 2 days: order VOE for Le." |
| 6 | **Today's appointments** | Consultations, closings, scheduled calls in the next 12 hours, with prep links | Blue | **P1** (manually entered/scheduled events) | "Consultation 2:00 PM — first-time buyer, pre-review checklist ready." |
| 7 | **Waiting-on-borrower aging** | A "docs still needed" follow-up flag open > 2 business days without a reminder, or team-entered milestone facts aging without a follow-up (disclosures out but unsigned > 1 day, application started but stalled > 3 days) | Amber | **P2** (FR-PL-4/5) | "Bank statements flagged Monday — still waiting, no reminder sent (Vu)." |
| 8 | **Stalled files** | No activity: 3 days in TRANSACT stages, 7 days in ENGAGE/QUALIFY | Amber | **P2** (FR-PL-5) | "No movement 8 days: preapproved, searching for home (Kim)." |
| 9 | **Opportunities** | Rate-alert leads from the QM Pricer, refinance-opportunity flags, preapproval letters expiring ≤ 14 days, annual review dates reached | Blue | **P2/P3** (FR-PE-3, FR-IN-3) | "Rate alert triggered for a 2023 closing — refi review suggested (Hoang)." |
| 10 | **Relationship touches** | Birthdays, closing anniversaries, partner nurture dates, post-close check-ins due | Blue | **P2** (automations + Partners) | "Closing anniversary today: the Rodriguez family (funded 7/16/25)." |

**P1 subset.** The Phase 1 queue comprises classes 2, 4, 5, and 6, plus class 1 driven by manually entered lock and closing dates. Classes 3, 7, 8, and 10 arrive in Phase 2; class 9 in Phase 2/3 — mirroring how [[PRD]] phases FR-TD-1..7. The queue architecture (ranking, badges, actions, suppression) ships complete in P1; later phases only add signal sources, never new interaction models.

Queue behavior rules:
- The queue shows the top 20 items with a "Show all (N)" expander. It is finishable — completed items leave immediately with a subtle count-down ("14 left today").
- Every WorkQueueItem shows: PriorityBadge (class icon + urgency color), one-line plain-language description, the person/loan it belongs to, time context (SLA timer, "due 3 days ago"), the primary action button, and an overflow menu (Snooze to tomorrow / Reassign / Not relevant — with reason capture that feeds AI's learning per [[AI_Product_Architecture]]).
- "Not relevant" three times on the same generated class for the same contact suppresses that trigger and logs it — the queue must never train users to ignore it.
- Nothing in the queue is auto-executed. Class 4 items execute on approve; classes 1–3 and 5–10 open the right surface (dialer, composer, task, opportunity workspace) pre-loaded.

#### One-tap approve pattern (used queue-wide and in the AIApprovalTray)
The canonical AICard pattern, salvaged from the prototype's best idea and hardened:

- Card face: what AI prepared ("Email to Anna Pham — 'Your disclosures are ready to sign' — EMT-018"), why ("Disclosures sent yesterday, unsigned after 1 day"), the full draft one tap away, LanguageBadge, ConsentBadge, and the template's automation policy tier.
- Exactly three actions: **Approve** (primary — sends/executes immediately, logs actor + timestamp + draft version), **Edit** (opens AIComposer with the draft; approving from the composer logs the diff), **Skip** (dismiss with optional reason).
- Keyboard: A / E / S; approving auto-focuses the next card ("approve-and-next" flow).
- **Batch approve** (ships Phase 2 — Phase 1 approvals are one card at a time) exists only for a run of same-class, same-template, Fully-Automated-policy items (e.g., 6 birthday messages) and always shows the full recipient list first. Semi-Automated templates are approved one at a time. **Manual Only / Never Automate templates never appear as approvable cards** — they surface as class-5 tasks that open a blank-slate composer with the template as reference only ([[Automation_Catalog]]).
- Every approve renders the ComplianceFooterPreview (NMLS #320841, LO NMLS, Equal Housing line where required) before the tap. If the deterministic compliance lint flags the draft (rate language, guarantee language, missing disclosure), the Approve button is replaced by "Review flags" ([[Mortgage_Compliance]]).

#### Components
AppShell, GlobalNav, TopBar (with CommandBar), AIBriefing, WorkQueue, WorkQueueItem, PriorityBadge, UrgencyDot, SlaTimer, AICard, AIApprovalTray, AIComposer, ComplianceFooterPreview, StatRow (StatCard ×4: Active loans, Funded MTD $, Leads this week, Closings next 7 days), CalendarStrip, ActivityTimeline (collapsed), EmptyState, SkeletonLoader, ErrorPanel, ToastNotice, FreshnessStamp.

#### Empty state
Genuinely empty queue (rare): a calm full-width EmptyState — "You're caught up. Nothing needs you right now." with two useful next moves: "Review opportunities" (class 9–10 items scheduled for later this week) and "Look at your pipeline". Never confetti, never a dead end. First-run (new user, no data): the queue is replaced by a 3-step setup checklist (import contacts, connect email, review AI settings) framed as queue items so the interaction model is learned immediately.

#### Loading state
SkeletonLoader mirrors the final layout: briefing paragraph shimmer, 6 queue-item skeletons, 4 stat-card skeletons. Briefing text streams in as AI generates it; the queue renders from cache instantly (stale-marked) and reconciles, so the screen is interactive in under 1 second even while the briefing writes.

#### Error state
- Briefing generation fails: the briefing block shows "AI couldn't prepare your briefing — your work queue below is live and correct" with a Retry. The queue never depends on the briefing.
- Queue fetch fails: ErrorPanel with plain language ("We couldn't load your queue. Your data is safe.") + Retry; last-known queue renders read-only with a stale FreshnessStamp.
- A single approve fails (send bounce, network): the item stays in the queue, turns red, and states exactly what failed and what to do ("Email couldn't send — Anna's address bounced. Fix her email."), mirroring the prototype's named-blocker + one-tap-fix pattern.

#### Mobile behavior
Today is the home screen of the responsive mobile-web layout and is designed phone-first: briefing collapses to 2 lines with "Read more"; StatRow becomes a horizontal swipe; the WorkQueue is the screen. Swipe right on an item = primary action (with confirm for sends), swipe left = snooze. Call-type items launch the phone's dialer via tel: link with the outcome logger opening on return ("Connected / Voicemail / No answer — AI will suggest the follow-up"). Approvals remain full-card (never swipe-to-approve a borrower-facing send). Browser push notifications deep-link into the exact queue item; if the item is role-blocked, the notification target explains who owns it instead of dead-ending (TERA+ edge case SCN-EDGE-012).

#### AI behavior (AI)
AI owns this screen's intelligence: generates the briefing; scores and ranks the queue using documented, fair-lending-safe factors only (behavioral and file-progress signals — never protected classes or proxies; factor list in [[AI_Product_Architecture]], reviewed per [[Mortgage_Compliance]]); every ranked item exposes "Why is this here?" (AIExplainPopover) showing the trigger and factors in plain language with a link to the source record — source-evidence clarity is a scorecard field, not a nicety. AI prepares class-4 drafts overnight and after stage changes, drafting from the 135-template library (stage-keyed, per [[PRD]]), in the contact's preferred language. AI never sends, never advances a stage, never dismisses an item on its own.

#### Permissions
| Role | Sees |
|---|---|
| Loan officer | Own book only: own leads, loans, tasks, approvals. |
| LO assistant | Queues of assigned LOs, merged and labeled by LO; cannot approve borrower-facing sends unless granted per-LO send-on-behalf permission (logged as the assistant, on behalf of the LO). |
| Processor / ops | Own task and file queue: TRANSACT-stage items assigned to them; no marketing/opportunity classes. |
| Team leader | Own queue + team escalations (unclaimed leads past SLA, red blockers across the team) + "view as" a team member (read-only, logged). |
| Branch leader | Branch-level rollup variant; no individual approve rights on others' sends. |
| ARM / Marketing coordinator | Partner-touch and marketing-approval classes only; no borrower financial detail. |
Row-level security enforces all of the above at the data layer ([[Technical_Architecture]]). Blocked items in a shared context always state who owns the action and offer a handoff, never a bare "no access."

#### Phase 1 scope
P1 ships the full Today shell — briefing, queue, StatRow, calendar strip, approval tray, single-card one-tap approve — with the queue fed by P1 signals only: classes 2, 4, 5, 6, and class 1 from manually entered lock/closing dates. Classes 3, 7, 8, 10 (P2) and 9 (P2/P3) light up as their systems ship; the P1 briefing references only P1-available signals. Batch approve is P2. Criteria below are tagged accordingly.

#### Acceptance criteria
1. **TD-01 [P1]** — Logging in lands on Today in all roles; no configuration can change the default landing screen away from it.
2. **TD-02 [P1]** — With seeded data covering every P1 priority class (1 — manual dates, 2, 4, 5, 6), the queue orders items by class rank, and within a class by deadline proximity; verified against a fixture with a known correct order. **[P2]** re-runs the same fixture test across all 10 classes as classes 3, 7–10 come online.
3. **TD-03 [P1]** — A rate lock expiring in 3 days on an active opportunity appears as a class-1 red item within 60 seconds of the lock date being manually set/changed (Phase 1 has no automated deadline feed; the broader deadline watch is FR-TD-6, P2).
4. **TD-04 [P1]** — A newly captured lead appears in the queue within 60 seconds with a running SLA timer; the timer turns amber at 5 minutes and red at 60 minutes uncontacted.
5. **TD-05 [P1]** — Approving an AI draft from the queue sends exactly the previewed content, removes the item, logs actor / timestamp / template ID / draft version / language to the audit trail, and focuses the next item — all within 2 seconds perceived.
6. **TD-06 [P1]** — No borrower-facing message can be dispatched from Today by any path other than an explicit Approve tap on a previewed draft; attempted API-level bypass is rejected and logged.
7. **TD-07 [P1]** — A Manual Only or Never Automate template never renders an Approve button anywhere on Today (fixture test across all 20 such templates in the library).
8. **TD-08 [P1]** — Every queue item's "Why is this here?" opens an explanation naming the trigger and linking to the source record; zero queue items may render without an explanation.
9. **TD-09 [P2]** — Batch approve is offered only when selected items share priority class, template ID, and Fully-Automated policy; the recipient list renders before confirmation.
10. **TD-10 [P1]** — Briefing service failure leaves the queue fully functional; queue-fetch failure shows last-known data explicitly marked stale with a visible FreshnessStamp.
11. **TD-11 [P1]** — Completing or approving every queue item reaches the caught-up EmptyState; no phantom counts remain.
12. **TD-12 [P1]** — Screen is interactive (queue scrollable, first item actionable) in ≤ 1.0 s on a mid-tier laptop and ≤ 2.0 s on a mid-tier phone over 4G, with skeletons before that.
13. **TD-13 [P1]** — A not-tech-savvy tester (per [[QA_Plan]] NTS thresholds) completes "open the app, do the first three things it tells you" with a friction score ≤ 2.75 and zero help requests.
14. **TD-14 [P1]** — Snooze, Reassign, and Not-relevant each write an audit entry; three Not-relevant marks on the same trigger+contact suppress that trigger and surface the suppression in Settings.
15. **TD-15 [P1]** — With Vietnamese as a contact's preferred language, the prepared draft renders in Vietnamese with the "human translation review required" flag, and the Approve path forces the draft open at least once before enabling Approve.
16. **TD-16 [P1]** — Team leader "view as" is read-only, watermarked with the viewed user's name, and logged.

---

### 2. Lead inbox

#### Purpose
The Lead inbox is where every new lead lands and gets first contact — the speed-to-lead surface. It exists because minutes decide conversion: leads flow in from Loan Factory websites, QM Pricer actions (quote, alert, apply, qualify), the 13 embeddable widgets, Facebook Lead Ads ("Automatically Created" stream), manual entry, and CSV import ([[Integration_Map]]); the inbox normalizes them into one triage list with structured source attribution and gets the LO to "contacted" as fast as possible. It is deliberately not a pipeline view — a lead graduates out of the inbox the moment first contact is made and lifecycle handling takes over.

#### Primary user
Loan officer (LO assistants triage on behalf of assigned LOs; team leaders monitor unclaimed leads).

#### Primary action
**Contact this lead** — one dominant button on the selected lead that launches the right channel now (call by default; text/email per lead intent and consent), starting the contact-attempt log.

#### Information hierarchy (ordered)
1. New-lead list, newest first, each row led by its SlaTimer.
2. Selected lead's detail pane: who, what they asked for, where they came from.
3. Lead intent (quote request / rate alert / application started / qualification / contact form) — this drives the suggested channel and AI's suggested opener.
4. Source attribution (channel → campaign → ad/widget → form), structured, never just "Automatically Created."
5. AI's suggested first-touch draft and qualification hints.
6. Duplicate/prior-relationship flag (matches by phone/email against People).
7. Triage controls: assign/claim, mark contacted, disqualify.

#### Components
SplitPane (LeadList + LeadDetailPane), LeadRow (name, SlaTimer, SourceChip, intent label, LanguageBadge, ConsentBadge), FilterBar (source, intent, assignment, age), LeadDetailPane (contact block, intent summary, source trail, form answers verbatim, DuplicateFlag banner), AICard (suggested first touch), QuickActionBar (Call / Text / Email / Book consultation), AssignMenu, DisqualifyMenu (reason-coded), EmptyState, SkeletonLoader, ErrorPanel, FreshnessStamp.

#### Empty state
"No new leads right now. Average this week: N per day." with two actions: "Add a lead manually" and "Review lead sources" (link to Marketing). For a brand-new user: short explainer of where leads will come from with a link to widget/ads setup evidence-based sources ([[Integration_Map]]).

#### Loading state
List renders skeleton rows (8); detail pane skeletons on selection. New leads arriving while the user is in the inbox slide in at top with a soft highlight — no full refresh, no list jump under the user's finger.

#### Error state
- Ingestion lag/failure from a source: a banner names the source and last successful sync ("Facebook leads last received 09:12 — checking connection"), never silently shows an empty list.
- Contact-launch failure (no phone on record): inline named blocker with one-tap fix ("No phone number — add one or email instead").
- Duplicate-merge conflict: side-by-side compare, user picks the surviving record; nothing auto-merges destructively.

#### Mobile behavior
In the mobile-browser layout the inbox is a single-column list; tapping a lead opens a full-screen detail. The Contact button is thumb-anchored bottom. Calling flips to the dialer and returns to a mandatory-but-fast outcome logger (Connected / Voicemail / No answer / Bad number — one tap each); AI queues the matching follow-up suggestion. New-lead browser push notifications deep-link straight to the lead with Call as the primary target.

#### AI behavior (AI)
AI enriches each lead on arrival: normalizes source attribution, detects duplicates, infers intent from the external capturing surface (a "create alert" from QM Pricer is a rate-shopper; a start on Loan Factory's application widget signals application intent — the application itself lives entirely on that external surface), and prepares a first-touch draft per channel in the lead's language (from stage-1/2 templates, EMT-001–003 class). AI suggests — never auto-assigns beyond the deterministic Default-Loan-Officer routing rule, never auto-contacts. Lead scoring shown here uses the same documented fair-lending-safe factors as Today (no scoring on names, geography-as-proxy, or any protected class; [[AI_Product_Architecture]]). Every score and suggestion has the "Why?" popover.

#### Permissions
LOs see their own and unassigned leads in their routing pool. Assistants see assigned LOs' pools. Team leaders see the whole team's inbox with claim/assign rights and an unclaimed-past-SLA escalation view. Disqualification requires a reason code; reason distribution is visible to team leaders in Intelligence. Marketing coordinators see aggregate source counts only, no lead PII.

#### Phase 1 scope
P1 lead sources are manual entry and CSV import; the inbox itself — SLA timers, triage, assignment, duplicate detection, disqualify with reason codes, and AI's first-touch drafts — ships complete in P1 against those sources. Live capture (Loan Factory websites, QM Pricer, widgets, Facebook Lead Ads) connects in P2+ per [[Integration_Map]], activating LI-01's per-source clause and LI-08.

#### Acceptance criteria
1. **LI-01 [P1 for manual entry + CSV import; P2+ per connected source]** — A lead submitted through any connected capture source appears in the inbox within 60 seconds with structured attribution (channel, campaign, ad/widget name, form) populated when provided by the source. Phase 1 has no live source integrations; the criterion applies to manual entry and CSV import at P1 and re-runs source-by-source as [[Integration_Map]] integrations land.
2. **LI-02 [P1]** — Every lead row shows a live SLA timer from capture time; amber at 5:00, red at 60:00; ordering is newest-first by default with an "oldest uncontacted first" toggle.
3. **LI-03 [P1]** — Tapping Contact launches the correct channel (tel:, composer, or SMS composer) pre-filled, and logs a contact attempt with channel + timestamp + outcome on completion; the lead's stage advances 1 New Lead → 2 Contact Attempt automatically on the first logged attempt.
4. **LI-04 [P1]** — A lead matching an existing person by normalized phone or email shows the duplicate banner before any contact action; merging preserves both histories and is reversible via audit log.
5. **LI-05 [P1]** — AI's first-touch draft respects channel consent: with SMS consent absent, no SMS draft is offered and the SMS button is disabled with an explanation.
6. **LI-06 [P1]** — Disqualify always requires a reason code and removes the lead from the inbox without deleting the person record.
7. **LI-07 [P1]** — Team-leader escalation view lists exactly the leads uncontacted past SLA across the team, and claiming one reassigns it atomically (no two users can claim the same lead).
8. **LI-08 [P2]** — Source-sync failure surfaces the named-source banner within 5 minutes of missed heartbeat; the list never presents as empty-and-healthy when ingestion is down. (Activates with the first live source integration — there are none in Phase 1.)
9. **LI-09 [P1]** — NTS tester completes "a new lead just came in — get in touch with them" in ≤ 3 taps from the notification with friction ≤ 2.5 ([[QA_Plan]]).
10. **LI-10 [P1]** — No lead-scoring factor visible in any "Why?" explanation references a protected class or documented proxy; the factor list matches the published register in [[AI_Product_Architecture]].

---

### 3. Contact profile

#### Purpose
The Contact profile is the single source of truth for a person — any person: a lead, a past client's spouse, a referral source's assistant. It answers "who is this, what's our relationship, what happened last, what's next" in one glance, and is the base record view inside People. It fixes the prototype's core modeling error (contact-is-the-loan): here a contact is a person who may have zero, one, or many loans over a lifetime ([[Data_Model]]). When a contact has an active borrower relationship, the profile hands off to the Borrower profile view (screen 4); when they're a partner, to the Partner record.

#### Primary user
Loan officer; heavily used by LO assistants (data hygiene, logging) and ARMs (relationship context).

#### Primary action
**Send a message** — one dominant button opening AIComposer with channel per the contact's preference and consent, an AI-suggested draft ready.

#### Information hierarchy (ordered)
1. PersonHeader: name, photo/initials, LanguageBadge, relationship type (Lead / Borrower / Past client / Partner-linked / Other), owner (assigned LO), UrgencyDot if anything about them is in a work queue.
2. "What's next" strip: the single next planned touch or open task for this person, or AI's suggestion if none exists.
3. Contact channels with ConsentBadges (email, phone/SMS, preferred channel, best time).
4. Relationship facts: source and referral chain ("Referred by Linda Chen, Keller Williams"), tags/segments, birthday, address, household links (spouse/co-borrower).
5. Loan history summary: compact list of the person's loan opportunities (CRM stage or funded date, program, amount) linking into opportunity workspaces.
6. ActivityTimeline: every touch, note, send, call, automation run, and stage event — newest first, filterable by type, each entry attributed (human name or "AI — approved by X").
7. Notes and files.

#### Components
PersonHeader, NextTouchStrip, ChannelList (with ConsentBadge per channel), RelationshipPanel, LoanHistoryList, ActivityTimeline, TimelineEntry, NoteComposer, AIComposer, AICard (relationship suggestions), TagPicker, SegmentChips, DetailDrawer (edit person), MergeBanner (when a possible duplicate is detected), FreshnessStamp, EmptyState, SkeletonLoader, ErrorPanel.

#### Empty state
A just-created contact shows a "Complete this record" checklist (phone, email, consent capture, language, source) framed as 30-second tasks, plus AI's offer to draft an introduction message. Empty timeline reads "No activity yet — the first touch starts the story," with the primary action button repeated.

#### Loading state
Header and channel block render first (from list cache) so identity is instant; timeline and loan history stream with section skeletons. Perceived complete ≤ 1.5 s.

#### Error state
Timeline pagination failure keeps loaded entries and offers Retry inline. Edit-save failure keeps the DetailDrawer open with the user's input intact and a plain-language reason — user input is never lost. Concurrent edit by another user triggers a field-level conflict prompt showing both values (TERA+ edge case SCN-EDGE-013).

#### Mobile behavior
Single column: header → what's next → tap-to-call/text channel row → timeline. Message button is bottom-anchored. Phone numbers and emails are always native tap targets. Note capture supports voice-to-text. Editing uses full-screen sheets, one field group at a time.

#### AI behavior (AI)
AI maintains the "what's next" suggestion when no human-planned touch exists (e.g., "No contact in 90 days and their preapproval expired — suggest a check-in"), drafts messages in-language on request, summarizes long timelines on demand ("Catch me up on Maria" → 4-sentence relationship summary with linked evidence), and flags data-quality problems (missing consent, bouncing email, possible duplicate) as fix-it chips. All suggestions carry "Why?"; nothing executes without a tap.

#### Permissions
Visibility follows book-of-business ownership with RLS: LOs see their own contacts; assistants see assigned LOs' contacts; team/branch leaders see their rollup scope; ARMs see partner-linked contacts' relationship data but not borrower financial fields; marketing coordinators see segment membership and consent only (no timelines). Edit rights mirror visibility minus leaders-in-view-as (read-only). Every field edit is versioned in the audit trail.

#### Phase 1 scope
The Contact profile ships fully in P1 on the P1 data model: person records, channels and consent, language, timeline, notes, tasks, and email sends with AI drafts. ARM partner-linked views (CP-08) follow the Partners module in P2.

#### Acceptance criteria
1. **CP-01 [P1]** — Opening any contact renders identity, owner, language, and consent states above the fold on first paint.
2. **CP-02 [P1]** — The timeline contains every logged interaction across all channels and automations for this person, each entry attributed to a named human or "AI — approved by [name]"; a fixture person with 25 mixed events renders all 25 in correct order.
3. **CP-03 [P1]** — Send-a-message respects preferred channel and disables non-consented channels with an inline explanation; a send from this screen appears in the timeline within 5 seconds.
4. **CP-04 [P1]** — A contact with two loan opportunities (one funded 2023, one active in Processing) shows both in loan history, each linking to the correct opportunity workspace — proving person↔opportunity separation.
5. **CP-05 [P1]** — "What's next" is never empty: it shows a planned touch, an open task, or an AI suggestion (with Why), in that precedence.
6. **CP-06 [P1]** — An interrupted edit (network drop mid-save) preserves all entered values in the reopened drawer; zero data loss across 10 induced failures.
7. **CP-07 [P1]** — Changing the preferred language immediately changes the default draft language of the composer and re-tags future AI drafts.
8. **CP-08 [P2]** — An ARM viewing a partner-linked borrower contact sees relationship data but no income, asset, credit, or loan-condition fields (field-level test).
9. **CP-09 [P1]** — NTS tester completes "find Maria and see what happened with her last week, then send her a note" with friction ≤ 2.5.
10. **CP-10 [P1]** — Merge flow: given two duplicate records, merging keeps both timelines interleaved, preserves the older creation date, and is fully reversible from the audit log.

---

### 4. Borrower profile

#### Purpose
The Borrower profile is the Contact profile in borrower mode: the same person record, extended with the loan-relationship context the moment a contact has at least one active loan opportunity. It answers the borrower-shaped questions — where is their loan, what are we waiting on them for, what did we last tell them, what follow-up is due — without making the LO jump into the full Opportunity workspace for routine touches. Borrowers here are CRM contacts, never product users. It is a view mode of the person, not a second record; there is exactly one person entity underneath ([[Data_Model]]).

#### Primary user
Loan officer; processors and LO assistants use it constantly for "what's outstanding" checks before borrower calls.

#### Primary action
**Send a status update** — one dominant button that opens AIComposer preloaded with the stage-appropriate update draft for the borrower's most urgent active loan (from the 135-template library, keyed to current stage and last-communicated milestone).

#### Information hierarchy (ordered)
1. PersonHeader (as screen 3) plus borrower badges: active-loan count, co-borrower links.
2. **Active loan card(s)**: per active loan opportunity — StageRail mini (20-stage position within its macro-phase), program and amount ("Purchase · 30-yr Fixed · $420,000"), key dates (lock expiration, closing date) with urgency colors, top follow-up in plain language ("Waiting on: 2 bank statements").
3. **Waiting-on panel**: the open "still waiting on" follow-up flags the team has entered for this borrower (docs still needed, signatures outstanding, decisions pending), each a plain-language note with age and last-reminder date. This panel exists purely to drive reminder communication — the CRM never collects or stores the documents themselves, and there is no per-condition tracker.
4. Last-communication marker: what the borrower was last told and when ("Told 7/12: submitted to underwriting") — so no one ever re-tells or contradicts.
5. Consultation/qualification facts: preapproval amount and expiration, target price range, property address once under contract.
6. ActivityTimeline (borrower-filtered: this person's loan events and communications first).
7. Household/co-borrower panel.

#### Components
PersonHeader, ActiveLoanCard (with StageRail-mini, KeyDateChips, FollowUpLine), WaitingOnPanel (FollowUpFlagRow: team-entered note + age + Remind action), LastToldMarker, PreapprovalPanel, ActivityTimeline, AIComposer, AICard, CoBorrowerPanel, ConsentBadge, LanguageBadge, FreshnessStamp, EmptyState, SkeletonLoader, ErrorPanel.

#### Empty state
A borrower with a just-created loan opportunity and nothing outstanding shows the ActiveLoanCard with "Nothing waiting on [name] right now" in the waiting-on panel — an explicit healthy-empty, not a blank. If preapproval data is missing, the panel becomes a fill-it prompt.

#### Loading state
Header + active loan cards first (these are the reason anyone opens this screen), then waiting-on, then timeline. Skeletons per section; loan cards interactive ≤ 1.5 s.

#### Error state
If loan data fails while person data loads, the loan card area shows a scoped ErrorPanel ("Couldn't load loan details — contact info below is current") — partial failure never blanks the whole screen. Remind-action failures name the blocker (bounced email, no consent) inline with a fix.

#### Mobile behavior
The pre-call screen in the mobile-browser layout: single column ordered header → active loan card → waiting-on → last-told. A processor or LO can absorb relationship state in one thumb-scroll before dialing. Remind actions are one tap + approve. StageRail-mini renders as "Stage 12 of 20 — Submitted to Underwriting" text + phase dots to stay legible at 375px.

#### AI behavior (AI)
AI keeps the status-update draft perpetually current: whenever the loan's stage or milestones change, the prepared update regenerates (in the borrower's language) so the primary action is always one approve away from a truthful, stage-accurate message that never over-promises (CTC language rules from [[Mortgage_Compliance]]: "clear to close" never presented as "funded"). AI powers the Remind buttons in waiting-on (drafting reminder sends under the docs-needed reminder templates' policy tiers), summarizes "what changed since you last talked" before calls, and warns when a drafted message contradicts the LastToldMarker. Never sends autonomously.

#### Permissions
As Contact profile, plus: processors see borrower profiles for loan opportunities assigned to them including waiting-on follow-up flags, but not marketing/segment data; the WaitingOnPanel's Remind is available to whoever owns the underlying follow-up (LO, assistant with send-on-behalf, processor for processing follow-ups). Qualification facts (preapproval amount and expiration, target price range) render only for producing roles — never for ARMs or marketing; the CRM stores no income, asset, or credit detail. Borrowers themselves never see this screen — they are CRM contacts, not product users, and no borrower-facing surface exists.

#### Phase 1 scope
P1 renders borrower mode from manually entered stage and milestone facts: active loan cards, key dates, waiting-on follow-up flags, last-told marker, and the stage-appropriate status-update draft approved one at a time. Docs-needed reminder automation under template policy tiers (BP-06) and aging-driven escalation into Today's class 7 follow FR-PL-4/5 in P2.

#### Acceptance criteria
1. **BP-01 [P1]** — A contact with an active loan opportunity automatically renders in borrower mode; a contact with none renders the plain Contact profile — no manual toggle exists.
2. **BP-02 [P1]** — The ActiveLoanCard's stage, dates, and top follow-up match the Opportunity workspace exactly at all times (single source of truth; verified by mutation test: change stage in workspace, borrower profile reflects it ≤ 5 s).
3. **BP-03 [P1]** — Every open follow-up flag shows its age in business days and the date of the last reminder; sorting is oldest-first.
4. **BP-04 [P1]** — The one-tap status update draft always reflects the current stage: updating the opportunity's stage regenerates the draft, and the stale draft can no longer be approved (version check on approve).
5. **BP-05 [P1]** — The LastToldMarker updates on every outbound borrower communication (human or approved-AI) and is visible without scrolling on desktop.
6. **BP-06 [P2]** — A Remind on a disclosures-signature follow-up flag uses the correct template class, honors its Semi-Automated policy (single approval, no batch), and logs to both the opportunity and the person timeline.
7. **BP-07 [P1]** — Co-borrowers cross-link bidirectionally; a communication logged to one household loan opportunity appears on both borrower profiles' timelines tagged to the opportunity.
8. **BP-08 [P1]** — With two active loan opportunities (e.g., purchase + investment DSCR), both loan cards render, and the primary action targets the more urgent opportunity by deadline, stated explicitly ("Update about: 123 Main St purchase").
9. **BP-09 [P1]** — Partial-failure isolation: opportunity-service outage leaves person data usable and marks only the loan sections as errored (fault-injection test).
10. **BP-10 [P1]** — Processor role sees waiting-on follow-up detail but no segment/marketing panels; field-level access test passes for all 8 roles.

---

### 5. Opportunity workspace

#### Purpose
The Opportunity workspace is the deep, single-opportunity view — everything the team needs to stay ahead of one loan opportunity in one place: where the file sits in the 20-stage lifecycle (as stage facts the team enters), the dates that drive follow-up, who is involved, what the borrower and agent have been told, and the full communication record. It is the screen for managing the relationship around a file (versus the Borrower profile, which is for talking to a person). The loan work itself — conditions, underwriting, disclosures, document collection, pricing — happens in the LOS/POS and is never performed here; this workspace exists to trigger and track the communication that loan facts demand. Phase 1 runs entirely on team-entered facts; the layout deliberately reserves surface for future read-only stage/milestone sync from external systems ([[Implementation_Roadmap]], [[Integration_Map]]).

#### Primary user
Loan officer and processor (co-primary); LO assistants for hygiene; team leaders when unblocking escalations.

#### Primary action
**Update the stage** — one dominant button naming the next stage ("Mark as: Conditional Approval"), recording the stage the file has actually reached, behind a ConfirmDialog. A stage update is a statement of fact, never a work gate — the CRM records reality, it does not approve or advance loan work. From Phase 2 (FR-PL-4), every stage update also triggers AI's stage-keyed communication drafts and offers that stage's follow-up task checklist.

#### Information hierarchy (ordered)
1. LoanHeader: borrower name(s) (linked), property address, program + amount + purpose, loan number (a reference to the external file, never a live link into it), and the two dates that rule everything — lock expiration and closing date — with urgency colors.
2. **StageRail**: full 20-stage lifecycle grouped by the 5 macro-phases, current stage highlighted, elapsed-time-in-stage, and any stage-aging flag. Stage facts are team-entered in v1; read-only sync from external systems is a future integration.
3. **Follow-ups & next touches**: plain-language list of what needs communication or attention (docs-needed flag aging without a reminder, closing-date follow-up not yet sent, borrower not updated since the last stage change), each with owner and age.
4. Key dates panel: application date, lock date/expiration, appraisal dates, contingency dates, CTC date, closing date, funding date — team-entered milestone facts kept as read-only visibility and automation-trigger metadata, never loan-of-record data.
5. StageTaskChecklist: the CRM follow-up tasks for the current stage, instantiated from per-stage task templates (Task center) — touches, reminders, and prep, never underwriting conditions.
6. PartyPanel: all parties — borrower(s), agent(s) (with privacy-safe sharing rules noted), title, insurance, processor, coordinator — with roles and one-tap contact.
7. Docs-needed follow-up flag: a simple team-set flag with a plain-language note ("waiting on 2 bank statements"), age, and last-reminder date — for reminder communication only; the CRM stores no documents and tracks no per-condition status.
8. Opportunity-scoped ActivityTimeline and notes.
9. Opportunity-scoped conversations (borrower and partner threads).

#### Components
LoanHeader, KeyDateChips, StageRail, MacroPhaseHeader, UpdateStageButton (confirmed), StageTaskChecklist, FollowUpList (FollowUpRow: text + owner + age + action), PartyPanel (PartyCard with privacy-tier badge for agents), DocsNeededFlag (note + age + Remind), ActivityTimeline, NoteComposer, AICard (stage-triggered draft suggestions), AIComposer, DetailDrawer (edit stage/milestone facts), ConfirmDialog (stage changes, with reason on backward moves), FreshnessStamp, EmptyState, SkeletonLoader, ErrorPanel.

#### Empty state
A brand-new loan opportunity (just converted from a qualified lead) opens with stage set, borrower linked, and a "Set up this record" checklist: program, amount, key dates, parties, first follow-up. AI offers to pre-create the stage-1 task checklist and the intro communication drafts. No section renders as a bare void; each empty panel states what will appear there and how to start it.

#### Loading state
Header + StageRail first (identity and position ≤ 1 s), then follow-ups, then panels in priority order. Timeline lazy-loads below the fold.

#### Error state
A stage update that fails (permission or write conflict) states exactly why in plain language — never a generic failure toast. If another user updated the stage first, the workspace live-updates and says who and when. Date edits that create contradictions (closing before CTC) are blocked inline with the rule stated in plain language — data hygiene on team-entered facts, not a loan-work gate.

#### Mobile behavior
Read-and-nudge optimized in the mobile-browser layout: header, stage position, follow-ups, and one-tap Remind/contact actions work fully; heavy editing (party management, date restructuring) is available but desktop-preferred. StageRail collapses to current phase + "Stage 13 of 20". The stage-update button remains present but always shows its ConfirmDialog first on mobile (no accidental thumb updates).

#### AI behavior (AI)
AI is the opportunity's communication co-pilot: on every stage update it prepares (never sends) the stage-triggered communications for borrower and — behind the privacy wall — agent, per template policy tiers; it drafts the stage's follow-up task checklist from the opportunity's program and facts (a DSCR file gets DSCR-appropriate touches and reminders); it watches team-entered dates and raises deadline blockers into Today's class 1; it summarizes the relationship record on demand ("brief me on this file") with linked evidence; it flags contradictions in team-entered facts (stage says Clear to Close but no closing date entered; docs-needed flag still open after "all docs in" was noted). AI never changes stage facts and never communicates a milestone that isn't confirmed in the record ("Exact milestone confirmed" prerequisite from the automation map, [[Automation_Catalog]]).

#### Permissions
Record access follows assignment: LO-of-record and their assistants, assigned processor/coordinator, team/branch leaders in scope. Stage updates: LO and processor for stages in their lane (processors update the 9–14 operational stages; LOs update all), with every stage change logged (actor, from→to, timestamp). Backward stage moves require a reason code. Agents/partners have no access to this screen — partner-visible status is a separate privacy-safe communication surface governed by the sharing matrix in [[Mortgage_Compliance]] (milestone/timeline only; never credit, income, assets, conditions).

#### Phase 1 scope
P1 is the manual workspace: confirmed stage updates, hand-entered dates and parties, docs-needed follow-up flags, the follow-up list, notes, and timeline — fully operable with zero integrations (LW-12). The StageTaskChecklist, stage-aging flags, and AI's stage-triggered communication drafts arrive with FR-PL-4 stage automation in P2; partner-facing drafts (LW-07) follow Partners in P2.

#### Acceptance criteria
1. **LW-01 [P1]** — The StageRail always shows exactly the locked 20 stages in the locked order and grouping; stage names render verbatim from [[Mortgage_Workflow_Map]].
2. **LW-02 [P2]** — Updating the stage offers that stage's follow-up task checklist for one-tap creation (idempotent with TC-04); no stage update is ever blocked by loan-work state — the CRM records reality, it does not gate it.
3. **LW-03 [P1 audit trail; P2 stage-triggered drafts]** — Every stage change writes an immutable audit entry (actor, from, to, timestamp, reason if backward); from Phase 2, each change also triggers AI's stage-communication drafts within 30 seconds — as drafts requiring approval, never sends.
4. **LW-04 [P1]** — Setting a lock expiration ≤ 7 days out creates the class-1 Today item for the record owner within 60 seconds; clearing/extending the lock removes it.
5. **LW-05 [P1]** — Two users editing the same opportunity see each other's changes ≤ 5 s; a conflicting simultaneous stage update resolves to exactly one winner with the loser notified by name.
6. **LW-06 [P1]** — Setting, updating, or clearing a docs-needed follow-up flag logs to the timeline with its note text; the flag stores a plain-language note, age, and last-reminder date only — the CRM stores no documents and no per-condition status.
7. **LW-07 [P2]** — The PartyPanel's agent card displays the privacy-tier badge, and no agent-directed draft generated from this screen ever contains credit, income, asset, AUS, or condition detail (template-lint test across all partner-facing templates).
8. **LW-08 [P1]** — Date-contradiction rules block impossible entries (closing before CTC, funding before closing) with plain-language inline errors.
9. **LW-09 [P2]** — "Brief me on this file" produces a summary in which every factual claim links to a timeline entry or field (source-evidence spot check on 10 fixture opportunities).
10. **LW-10 [P1]** — NTS processor persona completes "find what this file is waiting on and send the borrower a reminder" with friction ≤ 2.5 and zero terminology confusion ([[QA_Plan]]).
11. **LW-11 [P1]** — Backward stage move without a reason code is impossible via UI and API.
12. **LW-12 [P1]** — Phase-1 constraint: the workspace is fully operable with zero external integrations connected (fixture: a hand-entered opportunity passes every criterion above).

---

### 6. Pipeline board

#### Purpose
The Pipeline board is the visual command view of every active loan at once — the "where is my whole book" screen. Per [[Decisions]] D-06 it renders the 5 macro-phases (ENGAGE / QUALIFY / TRANSACT / RETAIN / GROW) as columns with drill-in to the 20 stages, because a 20-column wall is unusable and the macro-phases match how LOs actually think about load. The board is for scanning health and updating stage facts; deep relationship work happens in the Opportunity workspace.

#### Primary user
Loan officer (own book); team leaders (team board).

#### Primary action
**Update a stage** — drag a LoanCard to its new stage position (or use the card's "Update stage" quick action, which is the same operation as the workspace button). A drop is a manual stage update behind the same ConfirmDialog as the workspace — a record of where the file actually is, never a work gate; from Phase 2, each move also triggers AI's stage-keyed drafts, and a backward drop prompts the same reason-code dialog as the workspace.

#### Information hierarchy (ordered)
1. Five PhaseColumns with per-column counts and dollar volume totals.
2. LoanCards within columns, urgency-sorted (red blockers float to top of their column, never buried).
3. Per-card facts: borrower name, amount + program shorthand, current stage (StageChip), days-in-stage, the one most urgent flag (lock timer / closing date / follow-up line), UrgencyDot.
4. Drill-in: expanding a phase column fans it into its constituent StageLanes (e.g., TRANSACT → 9 lanes).
5. BoardToolbar: scope switcher (My loans / Team), filters (program, stage, flag), search, volume/count toggle.

#### Components
PipelineBoard, PhaseColumn, StageLane (drill-in mode), LoanCard (compact: name, amount, StageChip, days-in-stage, UrgencyDot, flag line), BoardToolbar, FilterBar, CardPeek (hover/long-press preview with follow-ups + next step), ConfirmDialog (stage moves), AICard (board-level observations), EmptyState, SkeletonLoader, ErrorPanel, FreshnessStamp.

#### Empty state
New user: columns render with one-line descriptions of each phase and a single CTA — "Add your first lead" / "Import your pipeline (CSV)". An individual empty column states its meaning ("Nothing in QUALIFY — leads you consult with will move here"), so the lifecycle teaches itself.

#### Loading state
Column skeletons with card-shaped shimmer (5 per column). Counts and totals render before cards. Board is scroll-interactive ≤ 1.5 s at 200 loans.

#### Error state
Failed drag (permission, conflict, cancelled confirm) animates the card back and opens the reason — owner name for permission, "already moved by [name]" for conflicts. Board-level fetch failure shows the last-known board read-only with a stale banner.

#### Mobile behavior
No horizontal five-column drag in phone browsers. The board becomes a phase-segmented list: SegmentedControl across the top (ENGAGE · QUALIFY · TRANSACT · RETAIN · GROW with counts), urgency-sorted cards below, stage updates via an explicit "Update stage" action on the card (opening the ConfirmDialog) — drag-and-drop is desktop/tablet browsers only. Tablet browsers get the full board.

#### AI behavior (AI)
AI annotates rather than rearranges: a board-level AICard surfaces patterns ("3 files have sat in Disclosures over 4 days — unsigned disclosures are your bottleneck this week"), flags stalled cards (driving the class-8 queue), and on any card move prepares the stage-triggered drafts exactly as the workspace does. AI never moves cards. Card ordering is deterministic (urgency, then deadline, then amount) — not an opaque AI sort — so the board is predictable; AI's ranking intelligence lives in Today, not here.

#### Permissions
LOs see their own board. Assistants see assigned LOs' boards (switcher). Team leaders see the team board with per-LO filter and can move cards only where they hold stage-update rights (moves are logged with actor ≠ owner highlighted in the record's timeline). Branch leaders get read-only boards plus Intelligence rollups. Volume totals hide for roles without financial visibility.

#### Phase 1 scope
P1 ships the five-phase board, stage drill-in, urgency sort, filters, and drag/update as confirmed manual stage moves (the same P1 transaction as the workspace). Board-level AI pattern observations and stalled-card flags (class 8) follow P2 stage automation and stall detection.

#### Acceptance criteria
1. **PB-01 [P1]** — The board renders exactly 5 phase columns in lifecycle order; drill-in fans a phase into exactly its locked constituent stages and back.
2. **PB-02 [P1]** — A completed drag performs the identical stage-update transaction as the workspace's update button (same validations, same audit entry, and — from P2 — same AI draft trigger) — verified by comparing audit records. In every phase both surfaces perform the same confirmed move.
3. **PB-03 [P1]** — A backward drop requires a reason code before it commits; cancelling the confirm returns the card visibly to its origin; no partial state persists.
4. **PB-04 [P1]** — Cards with red urgency sort to the top of their column regardless of other sort keys.
5. **PB-05 [P1]** — Column counts and dollar totals always equal the sum of visible cards under active filters (property-based test at 0, 1, 200, 1000 loans).
6. **PB-06 [P1]** — Board reflects a stage change made anywhere else (workspace, table, another user) ≤ 5 s without user refresh.
7. **PB-07 [P1]** — 60 fps drag performance and ≤ 1.5 s initial interactive at 200 active loans on a mid-tier laptop; 1,000-loan boards degrade gracefully to virtualized columns, never crash.
8. **PB-08 [P1]** — In phone browsers, all board functionality (view, filter, update stage) is reachable without horizontal drag; a stage update via the card action uses the same confirmed transaction.
9. **PB-09 [P1]** — A team leader moving another LO's card produces a timeline entry naming the leader as actor and notifies the owning LO.
10. **PB-10 [P1]** — RETAIN and GROW columns correctly hold post-close records (funded loans in Post-Close/Annual Review; Refinance Opportunity and Referral & Retention items) — the board covers the full 20-stage lifecycle, not just origination.

---

### 7. Pipeline table

#### Purpose
The Pipeline table is the same pipeline as the board in high-density, sortable, filterable, bulk-operable form — for the moments the board can't serve: "every loan locked and expiring this month," "all files in Processing over 10 days, oldest first," "export my Q3 fundings." It is the power view for assistants, processors, and leaders who work in lists, with saved views so nobody rebuilds the same filter twice. Board and table are two projections of one dataset — never two sources of truth.

#### Primary user
LO assistants and processors (daily driver); team/branch leaders (review); LOs (occasional deep filtering).

#### Primary action
**Open an opportunity** — clicking/tapping a row opens that Opportunity workspace (in a DetailDrawer peek on desktop with "Open full workspace"; full screen in mobile browsers). Bulk actions exist but are deliberately secondary.

#### Information hierarchy (ordered)
1. SavedViewTabs: My active files · Closing this month · Locks expiring · Stalled files · + custom saved views.
2. FilterBar with plain-language chips ("Stage: Processing–CTC", "Lock expires: next 30 days") and result count.
3. The DataTable itself: default columns Borrower · Stage (StageChip) · Program · Amount · Lock exp. · Closing date · Days in stage · Waiting on · Owner — urgency color on date cells, tabular numerals, UrgencyDot leading each row.
4. BulkActionBar (appears on selection): assign, add task, tag, export CSV, request AI drafts.
5. ColumnPicker and sort state (visible, shareable via saved view).

#### Components
DataTable (virtualized), SavedViewTabs, FilterBar (FilterChip), TableToolbar (search, ColumnPicker, density toggle, export), BulkActionBar, StageChip, UrgencyDot, DetailDrawer (row peek), ConfirmDialog (bulk operations, with full affected-row list), AICard (view-level insights), EmptyState, SkeletonLoader, ErrorPanel, FreshnessStamp.

#### Empty state
Empty result set under filters: "No loans match these filters" with the active chips listed and one-tap "Clear filters" — never an ambiguous blank grid. Truly empty pipeline mirrors the board's first-run CTA (add lead / import CSV).

#### Loading state
Header + saved-view tabs instant; skeleton rows (15) while the query runs; a slow query (> 3 s) shows a progress note with the row-count estimate rather than an indefinite spinner.

#### Error state
Query failure keeps the last successful result visible, marked stale, with Retry. A bulk action that partially fails reports exactly which rows failed and why, leaves succeeded rows applied, and offers retry-failed-only — no silent partial application.

#### Mobile behavior
The table collapses to a stacked-card list (each row → a two-line card: borrower + stage / amount + urgent date), preserving saved views and filters. Column choice doesn't apply on phones; sort and filter do. Bulk selection is available but capped to visible-loaded rows with the count always displayed. Export is desktop-only.

#### AI behavior (AI)
AI converts natural language to filters via the CommandBar ("show me everything closing in the next two weeks with a docs-needed flag" → chips appear, user confirms) — the produced filter chips are always visible and editable, so the query is transparent, not magical. A view-level AICard summarizes the current result set on request ("These 12 stalled files share one pattern: 9 have a docs-needed flag open more than 5 days"). Bulk "Request AI drafts" prepares per-loan stage-appropriate drafts into the approval tray — one card per loan, individually approved; bulk-approve follows the Today rules (identical template + Fully-Automated policy only). AI never executes bulk mutations itself.

#### Permissions
Scope identical to the board (own book / assigned books / team / branch, RLS-enforced). Bulk mutations require the same per-row rights as single-row edits — rows the actor can't modify are excluded from selection with a visible count ("3 rows skipped — owned by others"). CSV export is permission-gated (leaders and owners only), watermarked with actor + timestamp in the file, and logged to the audit trail. Financial columns hide for non-financial roles.

#### Phase 1 scope
P1 ships the table, filters, sorting, column picker, saved views (except "Stalled files", which follows P2 stall detection), row peek, and bulk assign/task/tag/export. Natural-language filtering (PT-06) and bulk AI-draft requests (PT-07, PT-10) follow P2 AI recommendations; bulk-approve inherits Today's P2 batch rule.

#### Acceptance criteria
1. **PT-01 [P1]** — Board, table, and workspace always agree: a stage change in any surface appears in the others ≤ 5 s (tri-surface consistency test).
2. **PT-02 [P1; "Stalled files" view P2]** — Default saved views (My active files, Closing this month, Locks expiring; Stalled files once P2 stall detection exists) return provably correct sets against a labeled 100-loan fixture.
3. **PT-03 [P1]** — Any filter + sort + column combination can be saved as a named view, persists across sessions, and is private by default with explicit share-to-team.
4. **PT-04 [P1]** — Sorting and filtering 1,000 rows completes ≤ 500 ms perceived (virtualized); the table never paginates away a selected row silently.
5. **PT-05 [P1]** — A bulk action on N rows shows all N before confirm, applies only to permitted rows, reports skipped rows with reasons, and writes one audit entry per affected loan.
6. **PT-06 [P2]** — Natural-language filtering always materializes as visible, editable filter chips; clearing chips restores the unfiltered view; no hidden query state exists.
7. **PT-07 [P2]** — Bulk AI-draft requests create individually approvable cards; no path exists from the table to a multi-loan borrower-facing send without per-loan preview (except the Fully-Automated identical-template batch case, which shows the full recipient list).
8. **PT-08 [P1]** — CSV export is blocked for unpermitted roles, contains only visible (permitted) columns, and logs actor, filter state, and row count.
9. **PT-09 [P1]** — Date cells apply urgency colors by the same thresholds as Today's classes (lock ≤ 7 days amber / ≤ 3 red) — one threshold definition shared product-wide.
10. **PT-10 [P2]** — Assistant persona completes "find all of [LO]'s files with docs-needed flags older than 3 days and queue reminder drafts" in ≤ 5 interactions with friction ≤ 2.5 ([[QA_Plan]]).

---

### 8. Task center

#### Purpose
The Task center is the complete task system of record — everything committed-to, by whom, for which loan or person, due when. Today shows the tasks that matter *now*; the Task center is where tasks are managed in full: planning days, redistributing load, clearing overdue debt, and creating the recurring structures (per-stage task templates) that keep files moving. Tasks are first-class objects linked to loans/people, never free-floating text — every task knows its context and appears on the linked record's timeline ([[Data_Model]]).

#### Primary user
All internal producing roles; heaviest for LO assistants and processors, whose whole day is task-shaped.

#### Primary action
**Complete the next due task** — the topmost task in the default "Due now" view carries the dominant complete control; completing advances focus down the list (same finish-the-list mechanic as Today).

#### Information hierarchy (ordered)
1. View tabs: Due now (default) · Overdue · Upcoming (7 days) · Delegated by me · All.
2. TaskRows grouped by day, each: checkbox, title in plain language, linked record chip (loan or person — tap to peek), due date/time, owner avatar, source badge (Manual / Stage checklist / AI-suggested / Automation), priority flag.
3. TaskComposer (quick-add, one line + smart parse: "call Vu tomorrow 9am re appraisal" → task with contact link, due date).
4. Load summary strip: counts by day for the next 7 days (visual overload warning when a day exceeds a configurable cap).
5. Delegation and reassignment controls.

#### Components
TaskList, TaskRow (checkbox, LinkedRecordChip, DueChip, OwnerAvatar, SourceBadge), ViewTabs, TaskComposer (smart-parse quick add), SnoozeMenu (tonight / tomorrow / next week / pick date — every snooze logged), DelegateMenu, LoadStrip, DetailDrawer (task detail: description, checklist sub-items, activity), AICard (workload and follow-up suggestions), BulkActionBar (reassign, reschedule), EmptyState, SkeletonLoader, ErrorPanel, FreshnessStamp.

#### Empty state
Due-now empty: "Nothing due right now. Next up: [first upcoming task] — [when]." with a look-ahead list. Overdue empty gets the one earned positive note: "No overdue tasks." First-run: two example tasks pre-seeded and labeled as examples, teaching link-to-record and complete mechanics.

#### Loading state
Tab counts render first, then 10 skeleton rows. Quick-add is usable immediately (optimistic insert with visible saving state).

#### Error state
Failed completion (conflict: someone else completed/deleted it) updates the row in place with what happened and by whom. Failed quick-add keeps the typed text in the composer with retry. Offline on mobile: completions and adds queue locally with an explicit "will sync" badge, reconciling on reconnect — never silently dropped.

#### Mobile behavior
Full-function single column in the mobile-browser layout; checkbox targets ≥ 44px; swipe right completes, swipe left snoozes (both undoable via toast for 5 s); quick-add supports voice entry. The Due-now view is the field companion for a day of appointments.

#### AI behavior (AI)
AI creates *suggested* tasks from real signals — a logged call outcome "voicemail" suggests a retry task; a stage update instantiates that stage's follow-up checklist tasks; an inbound "we'll have statements Friday" suggests a Friday follow-up — all clearly SourceBadged as AI-suggested and accepted/declined in one tap (declines are logged and inform suppression). AI flags overload ("Thursday has 19 tasks; 6 aren't deadline-bound — move them?") and prepares the reshuffle for one-tap approval. AI never completes, deletes, or reassigns a task itself, and AI-suggested tasks never outnumber human-created ones in the default view without an explicit "show all suggestions" (noise control — DASHBOARD-NOISE is a named risk tag in [[QA_Plan]]).

#### Permissions
Users see their own tasks plus tasks they delegated. Assistants see assigned LOs' tasks with edit rights. Processors see file-tasks for their assigned loans. Team leaders see the team's task load (aggregate + drill-in) and can rebalance with every reassignment notifying both parties. Completing another user's task requires reassign-then-complete or explicit shared ownership — no anonymous completions; every state change is attributed.

#### Phase 1 scope
P1 tasks are the Roadmap's create / assign / due date / complete, plus views, record links, snooze, delegation, and a plain quick-add (typed fields — the P1 fallback for smart parse). Smart-parse quick-add (TC-03), stage-checklist instantiation (TC-04), offline queueing (TC-07), and AI-suggested tasks (TC-08) are P2; offline in P1 degrades to an explicit read-only state, never silent loss.

#### Acceptance criteria
1. **TC-01 [P1]** — Every task links to a person or loan (or is explicitly marked personal); linked tasks appear on the linked record's timeline on creation and completion.
2. **TC-02 [P1]** — Tasks due today or overdue appear in Today's work queue (classes 5/6) and completing them in either surface syncs to the other ≤ 5 s.
3. **TC-03 [P2]** — Quick-add smart parse resolves contact names, relative dates, and times correctly on a 20-utterance fixture set ≥ 90%, and always shows the parsed result for confirmation before save.
4. **TC-04 [P2]** — A stage update on a loan opportunity instantiates that stage's follow-up checklist tasks exactly once (idempotent under retries), owned per the stage's role lane.
5. **TC-05 [P1]** — Snoozes and reschedules are logged with actor and old→new dates; a task snoozed 3+ times is flagged to its owner (and the delegator, if delegated).
6. **TC-06 [P1]** — Swipe completion is undoable for 5 seconds and the undo fully restores prior state.
7. **TC-07 [P2]** — Offline completions/additions on mobile queue with visible pending state and reconcile without loss or duplication on reconnect (airplane-mode test).
8. **TC-08 [P2]** — AI-suggested tasks are visibly badged, require acceptance to become real tasks, and a declined suggestion of the same trigger+record does not reappear within 7 days.
9. **TC-09 [P1]** — Reassignment notifies both old and new owners and appears in both users' activity; bulk reassignment writes one entry per task.
10. **TC-10 [P1]** — NTS tester completes "see what you have to do today and finish the first item" in ≤ 2 interactions with friction ≤ 2.5 ([[QA_Plan]]).

---

*Continued in Screen_Specifications Part 2 (screens 9–15). Related: [[Design_System]] · [[PRD]] · [[Data_Model]] · [[AI_Product_Architecture]] · [[Automation_Catalog]] · [[Mortgage_Workflow_Map]] · [[Mortgage_Compliance]] · [[QA_Plan]] · [[Decisions]]*
