## Screens 16–21

This part specifies screens 16–21 of the product: the Reporting Dashboard, Team Performance, Notification Center, the AI Approval Queue (the trust centerpiece of the whole product), Settings, and the Mobile Daily Action View. Every screen follows the same 12-field structure used across all parts of [[Screen_Specifications]]: **1 Purpose · 2 Primary users & roles · 3 Nav location & entry points · 4 Primary action · 5 Layout & hierarchy · 6 Data displayed & sources · 7 AI on this screen · 8 Key interactions & flows · 9 States & edge cases · 10 Mobile behavior · 11 Permissions, compliance & audit · 12 Acceptance criteria & ship gate.** All specs conform to [[Decisions]] (D-02 Today-first, D-03 ten-item nav, D-05 AI prepares/human approves, D-13 command-center design) and to the [[Design_System]] token set: tabular numerals for every metric, status color tied to loan urgency, light and dark themes, no emoji-as-UI.

---

### Screen 16 — Reporting Dashboard

**1. Purpose.** One place where an LO or leader sees how the business is actually performing — pipeline health, conversion through the five macro-phases, funded production, lead-source ROI, and communication effectiveness — without exporting anything to a spreadsheet. Answers three questions in under ten seconds: *Am I on pace? Where is my pipeline leaking? Which lead sources are worth the money?*

**2. Primary users & roles.** Loan officers (own book), team leaders (team rollup), branch leaders (branch rollup), marketing coordinators (source/campaign views only). Processors and LO assistants get read access to operational widgets (files sitting in Processing/UW stages, docs-needed follow-up aging), not revenue widgets.

**3. Nav location & entry points.** Lives inside **Intelligence** (per D-03 there is no 11th nav item), using the tab structure from [[Information_Architecture]] §2.8: **Overview · Production · Funnel · Sources · Insights** (plus the AI-oversight surface). This screen is the **single canonical spec** for the analytics tabs — Overview is the default tab, and Bands A–D below map onto Overview/Production, Funnel, Sources, and Communication respectively. Screen 15's remit narrows to the **AI oversight** half of Intelligence only (AI activity log, approval statistics, scoring-factor documentation, fair-lending posture); its production snapshot, funnel, and source table are defined here and only here — builders implement them once, from this spec. Entry points: Intelligence nav item, "See the numbers" links on Today stat tiles, drill-through links from Pipeline column headers, weekly AI briefing ("Your funded volume is 22% ahead of last month — see report").

**4. Primary action.** **Change the date range / comparison period.** Everything else is drill-down. One selector, top right: This month · Last month · Quarter · YTD · Trailing 12 · Custom, each with automatic prior-period comparison deltas.

**5. Layout & hierarchy.** Four bands, top to bottom (the Overview tab renders all four; the Funnel and Sources tabs are expanded views of Bands B and C — same definitions and columns, never a divergent second implementation):
- **Band A — Production scoreboard** (4 stat tiles): Funded volume ($, units), Locked pipeline volume, Projected closings this month (stage-weighted), Avg days from Application to Funded. Deltas vs prior period in urgency colors (green ahead / amber flat / red behind).
- **Band B — Funnel** : horizontal conversion funnel across the five macro-phases (ENGAGE → QUALIFY → TRANSACT → RETAIN → GROW) with per-transition conversion % and median days-in-phase. Click any transition to open the list of loans that stalled there.
- **Band C — Lead sources**: table of sources (Facebook Ads "Automatically Created", LF website widgets by widget type, QM Pricer rate alerts, manual, referral partner, past-client referral) × leads, contact rate, consult rate, preapproval rate, funded, cost (manual entry or ad-spend import when available), cost per funded loan. **These columns are the canonical source-attribution definition** — any other screen or doc that shows source performance references this table's columns rather than redefining them.
- **Band D — Communication effectiveness**: template/campaign performance from the EMT library (sends, open, reply, unsubscribes) and speed-to-lead distribution (median minutes to first contact attempt on New Lead).

**6. Data displayed & sources.** All figures computed from first-party CRM records: opportunity records (the stage-history table — stage and milestone facts entered by the team in v1, read-only synced from external systems via future integrations — drives funnel and cycle times), activities (speed-to-lead), messages (send/open/reply), lead records (source is a structured field: channel + campaign + ad/widget + form — never a free-text tag, fixing the weak "Automatically Created" provenance from the existing LF Facebook tool). Ad spend: manual entry in Phase 2; Meta/Google spend import is a Phase 3 integration candidate per [[Integration_Map]] — never shown as connected until it is. Every widget carries a freshness timestamp ("as of 2 min ago") per the stale-data critical-fail in [[QA_Plan]].

**7. AI on this screen.** AI writes the **narrative strip** above Band A: three plain-language sentences max ("Preapproval-to-contract conversion dropped from 41% to 33% this quarter. 9 preapproved buyers have had no touch in 14+ days. Want drafts for all 9?") with a one-tap action that routes into Screen 19 (the AI Approval Queue). AI never invents numbers — every sentence links to the widget it was computed from (source-evidence rule from the TERA+ scorecard). Anomaly detection (sudden source drop-off, unsubscribe spike) surfaces here and in the Notification Center.

**8. Key interactions & flows.** Drill-through from any number to the underlying record list (loans, leads, or messages) with the filter pre-applied; save any filtered view as a named report; schedule a named report as a weekly email to self (internal-only send, allowed to be automatic); export CSV. Comparison toggle: vs prior period / vs team median (team median only for LOs who opt in via Team settings — see Screen 17 fairness rules).

**9. States & edge cases.** Empty (new LO, <10 loans): show the scoreboard with a "not enough history yet" explainer instead of misleading small-sample percentages; funnel suppresses conversion % under n=10 per transition and shows counts only. Partial-period data flagged. Timezone: all "days" computed in the tenant's business timezone. A stage skipped in Pipeline (e.g., lead jumps New Lead → Under Contract) counts as passing through skipped phases for funnel math — documented in [[Data_Model]].

**10. Mobile behavior.** Band A tiles + AI narrative only; funnel and tables collapse into tap-to-expand cards. No horizontal-scroll tables on phones; the source table becomes stacked cards sorted by cost per funded loan.

**11. Permissions, compliance & audit.** RBAC: an LO sees only their own book; leaders see their subtree; marketing coordinators see source/communication bands without loan-level dollar detail. No borrower PII in exports beyond name/stage unless the exporter has loan-record access. Report views are not audit-logged; exports are.

**12. Acceptance criteria & ship gate.** NTS tester answers "am I ahead or behind this month?" in ≤10s and ≤2 clicks (dashboard friction threshold ≤2.75 per [[QA_Plan]] scorecard). Every displayed number reconciles exactly with a drill-through list count. AI narrative sentences each carry a working evidence link. Phase 2 ship; Band C cost columns may ship manual-entry-only.

---

### Screen 17 — Team Performance

**1. Purpose.** Give team and branch leaders an honest, fair view of how each LO is producing and where coaching helps — volume, conversion, responsiveness, and AI adoption — plus the operational levers a leader owns (lead routing weights, view-as, quota administration). This is management visibility, not surveillance: it measures the book, not the person's keystrokes.

**2. Primary users & roles.** Team leaders (primary), branch leaders (multi-team rollup). LOs see their own row and the team medians only if the team enables shared medians. Not visible to LO assistants, processors, or marketing coordinators.

**3. Nav location & entry points.** **Team** nav item, first tab ("Performance"; other Team tabs: Roster, Routing, Quotas). Entry: nav, AI weekly team briefing, drill-through from Intelligence branch views.

**4. Primary action.** **Open an LO's detail panel** (click any row) — the leader's core loop is scan → spot → open → act (message the LO, reassign leads, adjust routing, start a coaching note).

**5. Layout & hierarchy.**
- **Header**: team scoreboard (funded $, units, active pipeline, avg speed-to-lead) with period selector shared with Screen 16.
- **LO table** (the heart of the screen): one row per LO — Name · Active loans by macro-phase (5 mini-cells) · Funded MTD ($/units) · Speed-to-lead median · Preapproval→Contract % · Overdue tasks · AI approval-queue backlog (items waiting >24h) · Trend sparkline. Sortable on every column; tabular numerals throughout.
- **LO detail panel** (slide-over): their Today summary, stalled loans list, last-10-touch history, coaching notes (leader-private), and leader actions: "View as" (read-only workspace impersonation, salvaged idea from the prototype audit in [[Current_State_Audit]]), reassign selected leads, adjust routing weight, send message.

**6. Data displayed & sources.** Same computation layer as Screen 16, grouped per LO. "AI backlog" comes from Screen 19 queue timestamps. Coaching notes are a leader-owned note type on the user record, never visible to the LO's own view. All metrics come from documented, fair-lending-safe factors — file-progress and behavior signals only, mirroring D-11.

**7. AI on this screen.** AI prepares a **weekly team briefing** draft (top 3 wins, top 3 risks, one suggested coaching conversation per flagged LO, each with evidence links). The leader approves before it posts to the team or sends 1:1 — internal comms still flow through approval because they reference performance. AI also flags **queue starvation** ("Duc has 14 approved-ready drafts older than 48h — his borrowers are waiting") since an unworked approval queue silently breaks the product promise.

**8. Key interactions & flows.** Sort/filter table → open detail → act. "View as" enters a clearly-bannered read-only mode ("Viewing as Duc Nguyen — read only", persistent top bar, one-click exit); no sends, edits, or approvals allowed while impersonating. Lead reassignment requires a reason (picklist: capacity, license state, language match, performance) which is audit-logged. Quotas tab: per-LO monthly send allowances with over-limit pause semantics (the one genuinely good management pattern in the old prototype), searchable and editable inline.

**9. States & edge cases.** New LO (<30 days): row shows onboarding progress instead of conversion stats. LO on leave: routing weight zero, row dimmed with a status chip. Small teams (n<4): median columns hidden (individuals would be identifiable as the median). Concurrent edit of routing weights by two leaders: last-write-wins with a visible "changed by X 2m ago" note.

**10. Mobile behavior.** Table collapses to LO cards ranked by "needs attention" score (backlog + stalled loans + overdue tasks). View-as is desktop-only.

**11. Permissions, compliance & audit.** Leader subtree scoping enforced at the row level (Supabase RLS per [[Technical_Architecture]]). Every view-as session, reassignment, routing change, and quota change is audit-logged with actor, subject, reason, timestamp. Coaching notes excluded from LO-visible exports. No protected-class or proxy fields anywhere in ranking or routing logic; the routing "language match" factor uses the LO's declared working languages and the contact's declared language preference only, and is documented in [[AI_Product_Architecture]] for fair-lending review.

**12. Acceptance criteria & ship gate.** Leader persona (IB-TL-NTS-02 "Grace" from [[User_Personas]]) identifies which LO needs help this week in ≤30s without training. View-as cannot produce any write (verified by test). Reassignment round-trips in ≤3 clicks. Phase 2 ship (quota tab may slip to Phase 4 enterprise controls without blocking).

---

### Screen 18 — Notification Center

**1. Purpose.** One inbox for everything the system wants a human to know, ranked by loan urgency rather than arrival time — so a Friday-afternoon closing blocker outranks forty birthday reminders. It is the pressure-release valve that lets every other screen stay calm: nothing anywhere else blinks or badges except through this system.

**2. Primary users & roles.** All internal roles. Borrowers never see this screen — they are CRM contacts, not product users.

**3. Nav location & entry points.** Bell control in the global top bar on every screen. Top-bar badge semantics, defined once for the whole product: **bell badge = Act-now count only** (not total — a badge that says 47 trains people to ignore it); **the separate "AI has N ready" chip (Screen 19) = approval-queue count**. Approvals live in the Review lane here but never inflate the bell badge — the two counts never overlap or double-count. Full-screen view at Today → Notifications. Web push and email digests deep-link into it.

**4. Primary action.** **Open the item it points at.** Every notification is a door, never a dead end; each carries exactly one primary action ("Review draft", "Open loan", "Call now") and resolves (auto-clears) when the underlying condition clears.

**5. Layout & hierarchy.** Three lanes — **Act now / Review / FYI**, the same taxonomy as [[Information_Architecture]] §3.2 (lane assignment is system-defined per event type; users tune *delivery*, never lane logic) — visually distinct via the status color system (not decoration — same semantics as Pipeline):
| Lane | Meaning | Examples (phase-tagged) | Delivery |
|---|---|---|---|
| **Act now** (red) | A blocker or time-critical event on something the user owns | **New lead awaiting first contact** (Phase 1 — the speed-to-lead SLA: amber at 5 min, red at 60 min, same as Today/Lead inbox), closing-day blocker recorded on the opportunity (Phase 2), rate-lock-expiring milestone fact ≤48h out (Phase 2), docs-needed follow-up overdue (Phase 2), overdue task on an at-risk file (Phase 2) | In-app + web push |
| **Review** (amber) | Something AI prepared, waiting for human approval | AI drafted stage-update emails, approval-queue items aging >24h | In-app; counts into the "AI has N ready" chip (Screen 19), never the bell badge; morning briefing rollup |
| **FYI** (neutral) | Awareness, no deadline | Stage advanced, appraisal scheduled, campaign completed, weekly report ready | In-app + daily digest |

Within each lane: grouped by loan, newest first. Right rail: filters (mine / my team, by type, by loan) and mute controls.

**6. Data displayed & sources.** Each notification: icon by type, one-sentence plain-language description with names not IDs ("Trần Thị Mai's appraisal came in $14k under contract price"), the loan/contact chip, age, lane, primary action button. Sources: pipeline events (the trigger catalog from the communication framework's 17_Workflow_Triggers becomes the internal event taxonomy per [[Automation_Catalog]]), AI queue events, task deadlines, read-only milestone facts arriving from future integrations (Phase 3, per [[Integration_Map]]), team events.

**7. AI on this screen.** AI performs **bundling and demotion, never promotion**: it can merge six FYI events on one loan into a single line, and it can propose muting a noisy notification type ("You've dismissed 'campaign completed' 12 times — mute it?"), but only deterministic rules can raise something to Act-now. AI's daily digest (part of the Today briefing) summarizes what it auto-resolved overnight.

**8. Key interactions & flows.** Click → deep-link to source with context preserved. Sweep actions per lane ("Mark all FYI read"). Per-type mute and per-loan follow/unfollow. Snooze (1h / today / tomorrow 9am) — snoozed Act-now items resurface with an "overdue snooze" marker and cannot be snoozed twice. Notification preferences (channels per lane, quiet hours) live in Settings but are linked from here.

**9. States & edge cases.** Empty state: "Nothing needs you — Pipeline is healthy," with the last-cleared timestamp. **Blocked-target case (SCN-EDGE-012 in [[QA_Plan]]):** if a notification points at a record the user can't access (e.g., reassigned loan), the item explains *who owns it now* and offers "Ask [owner] to handle" — never a bare permission error. Duplicate suppression: identical event within 10 minutes collapses. Offline/push failure: in-app center remains the source of truth; web push is best-effort, with email fallback for Act-now items when the browser has no push permission.

**10. Mobile behavior.** This is a primarily-mobile surface, rendered by the same responsive web layout. Lanes become swimlanes; swipe right = done, swipe left = snooze; primary action rendered as a full-width button. Web push notifications (with email fallback where the browser denies push permission) deep-link into the item view, not the list.

**11. Permissions, compliance & audit.** Notifications inherit the ACL of their target record. Borrower-sensitive facts never travel through web-push or email-notification text — the notification says "New update on the Nguyen file," details only after auth (aligned with the SMS blocked-topics list: no rate locks, payment changes, cash-to-close, delays, adverse outcomes in any unauthenticated channel). SMS-to-LO delivery is **deferred until an SMS provider is contracted** (P2, unconfirmed per [[Integration_Map]]) and is logged in [[Open_Issues]] — it is not part of this spec's delivery matrix. Notification delivery and dismissal are logged for the Act-now lane only.

**12. Acceptance criteria & ship gate.** In the high-volume test (25-file LO from [[QA_Plan]]), the tester finds the single most urgent item in ≤5s. Zero dead-end notifications (every one deep-links). Bell badge equals Act-now count exactly; the AI chip equals approval-queue count exactly; the two never overlap. Quiet hours verifiably suppress web push but never in-app. **Build dependency:** this screen requires a first-party notifications delivery service (in-app + web push) in [[Technical_Architecture]] and a notification entity in [[Data_Model]], plus a Phase-1 backlog item in [[Tasks]] — it sits on the Today/Lead-inbox critical path ("notified within a minute" of a new lead). Phase 1 ships the three lanes, the in-app center, deep-links, and web push for Act-now; digest and mute-learning in Phase 2.

---

### Screen 19 — AI Approval Queue  *(trust centerpiece)*

**1. Purpose.** The room where "AI prepares, the human approves" physically happens. Every borrower-facing or partner-facing thing AI drafts — emails, SMS, tasks it wants to schedule, campaign sends — waits here until a human approves, edits, or rejects it. If this screen is fast, honest, and safe, LOs will trust the whole product; if it is a chore, they will bypass AI entirely. Design target: **an LO clears a 20-item morning queue in under 4 minutes without once feeling unsafe.**

**2. Primary users & roles.** Loan officers (their own queue), LO assistants (delegated approval for message classes the LO explicitly grants — never problem-file or pricing-adjacent items), team leaders (visibility + reassignment, no approval on others' borrower comms by default), marketing coordinators (marketing-content approvals only, per the review roles in the marketing content OS).

**3. Nav location & entry points.** Persistent **"AI has N ready"** chip in the global top bar (N = items awaiting this user). Full screen at Today → Review queue. Entry also from Today's briefing, Notification Center amber items, and every "Draft with AI" action anywhere in the product (drafting from a loan screen creates a queue item pre-opened for review).

**4. Primary action.** **Approve & send** — one keystroke (Enter) or one tap on the reviewed item. The entire screen is engineered so the safe path is also the fastest path.

**5. Layout & hierarchy.** Split view. **Left: the queue**, grouped by risk class, then by kind:
| Group | Policy source | Batch-approvable? |
|---|---|---|
| **Routine** — occasion/nurture/status messages using Fully Automated templates (44 EMTs) with all merge fields resolved and lint clean | CRM Automation Map policy: Fully Automated | **Yes** |
| **Standard** — stage-triggered drafts from Semi Automated templates (71 EMTs), docs-needed follow-up messages, partner updates | Semi Automated | No — item-by-item |
| **Sensitive** — Semi Automated drafts that touch sensitive topics: rate-lock discussion prompts, delay notices, problem-file check-ins | Semi Automated (sensitive-topic subset) | **No, and visually distinct (red rail); requires opening full view; Approve is disabled for 3 seconds after open (forced read)** |

**What never appears here:** Manual Only / Never Automate templates (the 20 EMTs covering adverse outcomes, cash-to-close, payment changes, and the other hard-blocked classes) **never produce queue items** — per [[PRD]] FR-CO-4 they are hard-blocked from any automated queue. They surface as tasks that open a blank-slate composer with no AI draft and no Approve button, matching Today's TD-07 and Screen 14's "not selectable" rule. If a draft can appear in this queue, it is by definition not in those classes.

**Right: the review pane** for the selected item — recipient card (name, language preference, stage, last touch), the rendered message with merge fields resolved and highlighted, and the **"Why" panel**: the trigger event with evidence link ("Disclosures-out milestone recorded 7/15 2:14pm — no signed milestone after 26h, view event"), the template used (EMT-ID, version), the compliance lint result (see field 11), and AI's confidence note. Nothing is approvable whose "Why" panel is empty — no evidence, no send.

**6. Data displayed & sources.** Queue item schema (from [[Data_Model]]): id, kind (email/SMS/task/campaign), recipient(s), channel, template ref + version, resolved draft body, trigger event ref, risk class, language, created-at, age, lint result object, status (waiting / approved / sent / rejected / expired), and the full action history. Stop conditions are re-evaluated **at send time**, not just at draft time — if the borrower replied, opted out, or the stage advanced between draft and approval, the item auto-expires with an explanation ("Stop condition: borrower responded 9:32am"), honoring "stop conditions always override timing rules."

**7. AI on this screen.** AI is the author, so its on-screen role flips to **explaining itself**: every item answers *what, to whom, why now, based on what evidence, under which policy*. AI also orders the queue (deadline-driven items first), suggests the day's batch ("These 11 routine items are lint-clean and same-class — review the batch?"), and surfaces its own uncertainty ("Low confidence: two loans for this borrower — confirm which file this refers to") as a blocking question rather than a guess.

**8. Key interactions & flows.**
- **Single approve:** select → read → Enter. Approval is acknowledged instantly — the item is marked approved and queued within 2 seconds perceived (the TD-05 bar: *accepted/queued* in 2s, not delivered in 2s), sending exactly the previewed content. It then enters the **canonical send pipeline, defined once, here** (implemented in [[Technical_Architecture]]; no other doc may redefine it): **approve → outbox (60-second undo for email; SMS has no undo, stated honestly on the confirm) → send-time stop-condition re-check → quiet-hours check → provider.** Quiet hours apply to **all borrower-facing channels, email and SMS alike**: no borrower sends before 8am / after 8pm recipient-local unless the user overrides per item — this deliberately extends [[Automation_Catalog]] G2 (which scoped quiet hours to SMS only) to email as well. An item held by quiet hours waits visibly in the outbox ("Sending at 8:00am — cancel anytime before then").
- **Batch approve:** only within the Routine group. Select-all offers a **sampled review**: the batch view shows every distinct template+audience combination in the batch (not every item), each rendered with a real recipient's merged data; per-item lint must be clean or the item is silently excluded from the batch and left in the queue with its reason. Confirm shows the exact count and recipient list before commit ("Send 11 emails to 11 recipients — 2 excluded: missing {{ClosingDate}}, opt-out"). Batch cap: 50 items per action. Sensitive items can never enter a batch even by multi-select.
- **Edit-before-send:** opens an inline editor on the resolved draft. Merge fields stay tokenized (editing "{{BorrowerName}}" edits the token, not the resolved name, so the edit is reusable). On save: compliance lint re-runs; a diff of the edit is stored; the item returns to the review pane for final approve. If the same template is edited the same way 3+ times, AI proposes a template revision to the marketing coordinator ("You keep adding a Vietnamese greeting line to EMT-012 — make it the default for VI-preference contacts?") — the edit loop feeds content improvement, not just one-off fixes.
- **Reject with feedback loop:** rejection requires a structured reason — *Wrong timing · Wrong tone · Wrong recipient · Factually wrong · Compliance concern · Not needed / duplicate · Other (free text)* — one tap each. Consequences are immediate and visible: "Wrong timing" on a trigger class offers "Delay this trigger type by N days for you?"; "Not needed" 3× on the same automation offers a one-tap pause of that automation; "Factually wrong" and "Compliance concern" open a required note and flag the item for the weekly AI-quality review. All rejection reasons feed the tuning loop defined in [[AI_Product_Architecture]] (per-user suppression rules first, prompt/threshold changes only through the human-reviewed release process — AI never silently self-modifies). A monthly "What AI learned from you" note shows the user their feedback changed something, closing the trust loop.
- **Snooze / reassign:** snooze to a time; reassign to assistant/processor where the item's class permits.
- **Undo:** email sends offer a 60-second undo window (held in outbox); SMS sends do not (stated honestly on the confirm).

**9. States & edge cases.** Empty: "Queue clear — AI will add items as triggers fire," with a link to Automations to see what's armed. Aging: items older than 48h get an amber edge and appear in Notification Center; items whose trigger deadline passed auto-expire rather than send stale ("Birthday was yesterday — expired, not sent" — an expired birthday email is worse than none). Merge-field failure: item is created but blocked ("Missing {{ProcessorName}} — assign a processor to enable"), never sent with a blank. Two approvers race on one item: first approval wins, second sees "Already handled by Kim 40s ago." Language: a VI-preference contact receiving an English-only template gets a warning chip ("No Vietnamese variant exists for EMT-071 — sending English; flag for translation?") per the multilingual honesty rules in the communication framework analysis.

**10. Mobile behavior.** The queue is a first-class mobile surface (see Screen 21): card stack, tap to expand full draft (sensitive items always require full-screen open), Approve as the large right-thumb button, Reject reasons as a bottom sheet. Batch approve is **desktop/tablet only** — deliberate: batch decisions deserve a big screen.

**11. Permissions, compliance & audit.** Compliance lint runs twice on every item — a **deterministic pass** (required NMLS #320841 + LO NMLS + Equal Housing line present; do-not-say list; trigger-term rules; state-specific rules as maintainable data, incl. the WA Best-Price-Guarantee exclusion; consent/opt-out status of the recipient) modeled on the tested engine in the marketing content OS archive, and an **AI compliance review** (risk level, blockers, warnings, safer rewrite) using the compliance_reviewer prompt contract. A lint **blocker** disables Approve until resolved; a warning requires an explicit "approve despite warning" with note. **Audit trail (immutable, per item):** trigger evidence, template ID + version, original draft, every edit diff with editor identity, lint results (both passes), approver identity + timestamp, exact sent body, delivery result, and model/prompt version that generated the draft — exportable for exam/audit per [[Mortgage_Compliance]]. Delegated approvals record both the approver and the delegating LO. Nothing in this screen can be configured to auto-send borrower-facing content in v1 — there is no such setting to misconfigure (D-05 enforced by absence, not by toggle).

**12. Acceptance criteria & ship gate.** Passes all nine AI acceptance tests (SCN-AI-001..009) from [[QA_Plan]], especially: AI output is verifiable against source evidence before a human acts, and the AI-OVERTRUST scorecard field scores ≤2 (users demonstrably check evidence at least on sensitive items). NTS LO clears a seeded 10-item queue, correctly rejecting the 2 planted bad drafts (wrong name; missing disclosure) — planted-defect catch rate must be 100% for lint-detectable defects and ≥80% for judgment defects across the test cohort. Median per-item review time ≤12s for Routine after one week of use. 100% of sent items have a complete audit record (verified by automated test). Phase 1 ships single approve + edit + reject + audit trail; batch approve and the learning digest ship in Phase 2 once single-item trust is established.

---

### Screen 20 — Settings

**1. Purpose.** Every configuration surface in one predictable place, organized by what the user is trying to change, written in plain mortgage language, and honest to a fault about integration status. Settings is also where the product's compliance identity lives: NMLS numbers, licensed states, disclosure lines, and consent rules are treated as first-class managed data, not buried text fields.

**2. Primary users & roles.** All internal roles see their personal sections; admin sections (Team & roles, Compliance, Billing, Integrations) require the admin or leader role. Borrowers: never — they are contacts in the CRM, not users of it.

**3. Nav location & entry points.** **Settings** nav item (10th, per D-03). Deep links from everywhere a setting is referenced ("quiet hours — change in Settings").

**4. Primary action.** There is deliberately no single primary action; each panel has exactly one Save with unsaved-change protection ("You have unsaved changes — Save / Discard" on navigate-away; the save-state critical-fail from [[QA_Plan]] applies to Settings hardest of all).

**5. Layout & hierarchy.** Left rail of sections, content pane right:
| Section | Contents |
|---|---|
| **Profile** | Name, photo, title, phone, email signature block, **personal NMLS** (e.g., Jeremy McDonald NMLS 1195266), working languages, working schedule |
| **Notifications** | Channel matrix per tier (Screen 18), quiet hours, digest time, per-type mutes |
| **AI** | Drafting tone (professional/warm — bounded presets, not free prompts), per-trigger-class delays, paused automations list, delegated-approval grants, "What AI learned from you" history |
| **Templates & language** | Default sending language, VI variant availability overview, personal template overrides (tracked as versions of the EMT master, never forks) |
| **Team & roles** *(admin)* | Members, roles, RBAC grants, lead-routing defaults, quotas (links to Screen 17) |
| **Compliance** *(admin)* | Company NMLS #320841, per-state licensing table (maintainable data with per-state disclosure strings — AZ BK-2005457, NJ, RI, MA seeded from the marketing content OS; explicitly incomplete and flagged as such), required footer text, Equal Housing display, **compensation model: lender-paid only (locked default per training-pack directive; changing it requires admin + confirmation + audit log)**, consent & opt-out policy, data retention |
| **Integrations** *(admin)* | See field 6 — the honesty rules live here |
| **Appearance** | Light/dark/system theme, density (comfortable/compact), date & number formats |

**6. Data displayed & sources — Integrations honesty rules.** The old prototype showed "Encompass ✓ Connected" as a hardcoded lie; this screen is specified as its opposite. Integration tiles have exactly four states: **Connected** (live, last-sync timestamp shown) · **Available** (built, not yet connected by this tenant) · **Planned** (on the roadmap — labeled "Planned, not yet available", no Connect button) · absent (not shown at all). At launch, per [[Integration_Map]] and D-10: LF website widgets/lead ingestion and Facebook lead ingestion appear as Available/Planned per phase; read-only LOS/POS stage-and-milestone sync appears as Planned at most (data flows in for CRM visibility only — the CRM never owns loan-of-record data). **It is a build rule, verified in QA, that no tile may show Connected unless a real handshake succeeded.**

**7. AI on this screen.** Minimal by design — AI does not reconfigure the system. It may *suggest* settings changes as approval items ("You reject birthday drafts every Monday — pause the birthday automation?") that deep-link here, and it renders a plain-language preview of any compliance setting's effect ("With RI licensing enabled, footers on RI-addressed messages will add: 'Rhode Island Licensed Loan Broker'").

**8. Key interactions & flows.** Panel edit → Save → confirmation toast with undo where reversible. Compliance and role changes show a "this affects X" impact preview before save (e.g., "3 active automations send to NJ contacts and will pick up the new footer"). Licensing table supports add-state with required fields (license #, disclosure string, effective date) and a review reminder date.

**9. States & edge cases.** Concurrent admin edits: optimistic lock with "reloaded — Grace changed this 1m ago." A state deleted from the licensing table with active loans in that state: blocked with explanation. Language default changed: affects future drafts only, never queued items retroactively.

**10. Mobile behavior.** Profile, Notifications, Appearance, and AI sections fully usable on mobile; admin sections readable but edit-gated to desktop ("Edit on desktop for safety") except emergency actions (deactivate a user).

**11. Permissions, compliance & audit.** Every change in Team & roles, Compliance, and Integrations writes an audit event (who, what, old→new, when). Secrets (API keys for future integrations) are write-only: enter, verify, never redisplay. RBAC changes take effect on next request (no re-login required) and are covered by the RLS policies in [[Technical_Architecture]].

**12. Acceptance criteria & ship gate.** NTS tester changes their quiet hours and confirms the change took effect in ≤60s (role/permission-clarity scorecard field ≤2). Zero fake integration states (automated test asserts tile state derives from live connection records). Compliance table changes provably alter the very next lint run. Phase 1 ships Profile, Notifications, AI, Appearance, and read-only Compliance; admin Compliance editing and Integrations panels ship with Phase 2.

---

### Screen 21 — Mobile Daily Action View

**1. Purpose.** The between-appointments product: everything the Today command center knows, distilled into a one-thumb card flow an LO can work in a parking lot in 90 seconds. Not a shrunken dashboard — a different rendering of the same "what matters now" engine, biased ruthlessly toward *actions* (call, approve, reply) over *information*.

**2. Primary users & roles.** Loan officers overwhelmingly; LO assistants and processors get role-appropriate card decks (a processor's deck is docs-needed follow-ups and stage-update communications, not lead calls). Leaders get the team Act-now items appended.

**3. Nav location & entry points.** It **is** the home screen of the responsive web experience on mobile browsers (mobile equivalent of D-02). Web push notifications — with email fallback where the browser denies push permission — deep-link to the relevant card. Bottom tab bar carries only: **Now** (this screen) · Pipeline · Conversations · Queue (Screen 19 mobile) · More.

**4. Primary action.** **Do the top card.** The screen always leads with exactly one recommended next action, full-width button, e.g. "Call Nguyễn Văn An — new lead, 22 minutes old." Everything else is beneath it.

**5. Layout & hierarchy.** Vertical card stack in strict priority order (same ranking engine as Today, documented in [[AI_Product_Architecture]]):
1. **Act-now cards** (red rail): closing blockers, expiring locks, hot new leads within the speed-to-lead window.
2. **AI queue summary card**: "8 drafts ready — review" → Screen 19 mobile.
3. **Scheduled cards**: today's calls/appointments with one-tap call/directions.
4. **Momentum cards**: 2–3 stalled-file nudges ("Preapproved 21 days, no home search activity — check in?").
5. **Done state**: when the stack is cleared, the screen says so plainly ("You're clear. 3 loans advanced today.") — a real endpoint, not infinite feed.

Each card: contact name (rendered in correct diacritics), context line, age/deadline, **one primary action + one secondary** (never more; overflow behind a long-press sheet).

**6. Data displayed & sources.** Same records as Today; cards carry minimal PII (name, stage, action context — never SSN, document images, or pricing detail on the card face). Call cards launch the device dialer via tel: links and prompt a one-tap log on return to the browser tab ("Log it: Reached / Left voicemail / No answer" sheet — this single interaction is the difference between a CRM with call data and one without).

**7. AI on this screen.** AI does the ranking and writes each card's context line, and pre-drafts the follow-up for every action ("No answer? → Send the missed-you text (draft ready)" — which routes through the approval flow as a one-tap approve since the draft is shown right there). Voice note → AI-drafted opportunity note (transcription shown for confirmation before saving) is the flagship mobile AI feature (Phase 2).

**8. Key interactions & flows.** Tap primary action → do → auto-log → next card slides up. Swipe left = snooze (with time sheet), swipe right = done/dismiss (dismissing an Act-now card requires a reason tap). Pull-to-refresh re-ranks. Long-press → full loan view.

**9. States & edge cases.** Offline: the deck caches on last sync (service-worker cache); actions queue locally and sync with conflict detection ("This lead was called by your assistant 5 min ago — still send the text?"). Interrupted mid-card (phone call, tab or app switch): the card and any draft state persist exactly (the mobile-resume edge case SCN-EDGE-006 from [[QA_Plan]]). Empty morning: shows the daily briefing instead of a blank stack. Stale ranking (>15 min background): banner "Reordered — 2 new items" rather than silently reshuffling under the thumb.

**10. Mobile behavior.** This *is* the mobile web spec. Additional rules: minimum 44pt touch targets, primary buttons in the bottom half of the screen (thumb zone), no hover-dependent affordances, VI text verified at natural line lengths (Vietnamese runs longer than English — cards must not truncate names or CTAs), system font scaling respected to 200%.

**11. Permissions, compliance & audit.** Short session timeouts with re-authentication on mobile browsers (borrower contact data on a pocketable device), per the session policy in [[Security]]. Cards never render document images or pricing detail, so screenshots and shares cannot leak them. All actions log identically to desktop (call attempts, approvals, snoozes). Quiet-hours rules apply to any send initiated here just as on desktop.

**12. Acceptance criteria & ship gate.** The mobile-first borrower-era LO persona and the NTS veteran persona both complete "handle your top 3 items" in ≤2 minutes with zero mis-taps in usability testing (mobile usability scorecard field ≤2.5). Call logging captured on ≥90% of dialer-initiated calls in beta telemetry. Offline queue survives airplane-mode round trip. Ships in Phase 1 as part of the responsive desktop-and-mobile web layouts, covering card stack + call logging + queue access.

---

Related: [[Screen_Specifications]] · [[PRD]] · [[Design_System]] · [[AI_Product_Architecture]] · [[Automation_Catalog]] · [[Mortgage_Compliance]] · [[Data_Model]] · [[QA_Plan]] · [[Decisions]] · [[Open_Issues]]
