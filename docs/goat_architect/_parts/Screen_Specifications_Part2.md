## Screens 9-15

This part specifies screens 9–15 of the Loan Factory CRM screen inventory: Conversations, Referral Partner Profile, Agent Relationship Dashboard, Campaign Builder, Template Library, Automation Builder, and the AI Intelligence Center. Each screen follows the same 12-field structure as its siblings in [[Screen_Specifications]] (Purpose · Primary user · Primary action · Information hierarchy · Components · Empty state · Loading state · Error state · Mobile · AI behavior · Permissions · Acceptance criteria) and is bound by the product CANON: Ally prepares, the human approves; plain mortgage language; one obvious primary action per screen; status color tied to loan urgency, not decoration. Throughout, **Mobile** means the responsive mobile-browser layout of the same web app — Loan Factory CRM ships as responsive web on desktop and mobile browsers; there is no native app. Related: [[Design_System]] · [[Data_Model]] · [[Automation_Catalog]] · [[AI_Product_Architecture]] · [[Mortgage_Compliance]] · [[Communication_Templates]].

---

### Screen 9 — Conversations

**Purpose.** One inbox for every borrower- and partner-facing conversation, organized by *person and loan*, not by channel. Email ships first; SMS joins in Phase 2 (consent-gated, non-sensitive topics only). The LO never asks "which app did that message come in on?" — they ask "who needs a reply?", and Loan Factory CRM answers with the CRM opportunity context already attached.

**Primary user.** Loan officer. Secondary: LO assistant and processor (threads on files they own), marketing coordinator (campaign reply triage).

**Primary action.** **Reply** — specifically, *approve and send an Ally-prepared reply draft*. The send button is the single dominant control in an open thread.

**Information hierarchy.**
1. Needs-reply queue (unanswered inbound, sorted by loan urgency then wait time — a borrower at stage 14 Clear to Close outranks a stage 1 New Lead at equal wait time)
2. Open thread: contact name, loan stage chip (one of the 20 locked stages), language preference flag, consent status
3. Message history with channel badges (Email / SMS) interleaved chronologically
4. Ally draft panel (reply draft + template provenance + compliance lint result)
5. Thread metadata rail: linked loan, assigned owner, related tasks, opt-out state

**Components.**

| Component | Behavior |
|---|---|
| Thread list | Grouped by contact; unread + needs-reply badges; filter by owner, stage macro-phase (ENGAGE/QUALIFY/TRANSACT/RETAIN/GROW), channel, language |
| Loan context header | Stage chip, days-in-stage, next milestone, property address; click-through to the loan record (the CRM opportunity record — stage and milestone facts entered by the team in v1, read-only synced from external systems later) |
| Composer | Rich text for email, plain text for SMS; merge fields resolve live from the contact/loan record (the 17-token vocabulary from the template library — `{{BorrowerName}}`, `{{PropertyAddress}}`, etc.); unresolved fields render as a named blocker, never send blank |
| Ally draft card | Draft + "why this draft" line citing the source template EMT ID and stage; one-tap **Approve & send**, **Edit first**, **Dismiss** |
| Compliance lint strip | Deterministic pre-send check (do-not-say list, required NMLS/Equal Housing footer for applicable content, trigger-term detection, opt-out/consent state) — blockers stop send, warnings require an explicit "send anyway" with reason logged |
| SMS policy guard (Phase 2) | SMS composer refuses blocked topics (rate locks, payment changes, cash-to-close, closing delays, problem files, adverse outcomes) and offers "move to email" — mirrors the communication framework's SMS cross-reference rules |
| Language toggle | When the contact's preferred language is Vietnamese (or other supported locale), Ally drafts in that language from the lifecycle localization modules and flags "human translation review required" until per-template variants exist |

**Empty state.** "No conversations yet. Messages to and from your contacts will appear here the moment your email account is connected." Primary CTA: **Connect email** (Settings deep link). If email is connected but the queue is clear: "Inbox zero — nothing needs a reply. Ally will surface the next inbound here." with a subdued link to browse all threads.

**Loading state.** Skeleton thread list (8 rows) + skeleton message bubbles; loan context header loads first (cached from the contact record) so the user always knows *who* before *what*.

**Error state.** Send failure: message stays in the composer, marked "Not sent — tap to retry," with the specific reason in plain language ("Their email address bounced last time — verify it on their profile"). Sync failure: banner "We can't reach your email account right now. You're seeing messages as of {timestamp}." Never silently drop a draft; drafts persist server-side.

**Mobile.** Thread list and open thread are separate full-screen views. Needs-reply queue is the mobile landing view. Approve & send works one-handed: draft card, two buttons, done. Voice-to-text dictation supported in the composer. Swipe actions: assign, snooze, mark done.

**AI behavior.** Ally (1) triages every inbound: classifies intent (question, docs-needed follow-up, scheduling, complaint, rate question), links it to the right opportunity, and re-ranks the needs-reply queue; (2) prepares a reply draft grounded in the stage-appropriate template and the thread history, always with source attribution; (3) detects escalation triggers (complaint, possible denial language, fair-lending or RESPA concern, pricing dispute) and routes to a human review task instead of drafting a casual reply; (4) deflects rate questions with the approved compliant pattern ("rates depend on the full scenario") rather than quoting numbers. Nothing sends without a human tap — no exceptions in v1.

**Permissions.** LOs see their own threads plus threads on loans they own. Assistants/processors see threads on assigned files. Team leaders see their team's threads read-only by default, with reply-as-self allowed. Marketing coordinators see campaign-reply threads only. No role can delete a message (audit trail); archive only.

**Acceptance criteria.**
- A not-tech-savvy LO can find the oldest unanswered borrower message and send an approved reply in ≤ 3 taps from landing (per the [[QA_Plan]] NTS thresholds).
- Every outbound message stores: sender, approver, timestamp, source template ID (if any), Ally involvement flag, and compliance lint result.
- A thread with an opted-out contact hard-blocks marketing sends and visibly labels transactional-only status.
- SMS composer (Phase 2) cannot send any blocked-topic content; test with all six blocked categories.
- Vietnamese-preference contact receives an Ally draft in Vietnamese with the translation-review flag set.
- Send failure never loses composed text (kill the tab mid-send; draft survives).

---

### Screen 10 — Referral Partner Profile

**Purpose.** The single record of one referral partner — usually a real estate agent, also builders, financial advisors, CPAs, attorneys — showing the whole relationship: referrals exchanged, loans in flight together, nurture cadence, co-marketing, and what to do next to keep the relationship producing. This is where "who sent me business and how do I repay it" stops living in the LO's head.

**Primary user.** Loan officer. Secondary: agent relationship manager (works these profiles all day), team leader.

**Primary action.** **Log a touch / send an update** — the partner-facing equivalent of "reply." One button that opens Ally's suggested next outreach (status update on a shared file, monthly nurture, congratulations, re-engagement).

**Information hierarchy.**
1. Partner identity: name, brokerage, photo, tier (A/B/C), relationship owner, preferred contact channel and language
2. Relationship health strip: referrals received (12 mo), referrals sent back, last touch date, active shared files
3. Active shared loans — **privacy-safe view only**: CRM stage/milestone, expected timeline, file owner (facts the team records in v1; read-only sync from external systems later). Never credit, income, assets, AUS results, or underwriting condition details — the CRM stores none of that, so the wall is structural (locked per [[Mortgage_Compliance]]; this is the partner privacy wall from the communication framework)
4. Referral history ledger (both directions, with outcomes: funded / lost / in progress)
5. Nurture & co-marketing: enrolled cadences (e.g., monthly Realtor nurture), co-branded pieces, open-house support requests
6. Notes and tasks

**Components.**

| Component | Behavior |
|---|---|
| Tier badge | A/B/C by referral production; editable with reason; tier drives nurture cadence defaults |
| Reciprocity meter | Referrals received vs. sent back, 12-month rolling — the "am I a good partner" number, tabular numerals |
| Shared-file cards | One per active loan referred by (or to) this partner; shows privacy-safe milestone status and a one-tap **Send status update** that drafts from the partner-facing template set (EMT-004/005 family), pre-linted for privacy violations |
| Referral ledger | Table: date, direction, borrower (name only), outcome, loan amount if funded; totals row |
| Cadence panel | Which automations this partner is enrolled in (Realtor monthly nurture, birthday, closing anniversary co-celebration); pause/resume per partner |
| Co-marketing shelf | Co-branded pieces produced (Phase 2, from Marketing module); RESPA-aware note that co-marketing cost sharing must be fair-market-value documented — surfaced as a persistent reminder, not buried |
| Ally next-touch card | "It's been 34 days since your last touch with Maria and her buyer just went Clear to Close — send the CTC update?" One-tap approve |

**Empty state.** New partner with no history: profile shell + "Start the relationship" checklist (log how you met, set tier, enroll in monthly nurture, add birthday). No fake charts — the reciprocity meter shows "No referral history yet" rather than zeros pretending to be data.

**Loading state.** Identity header renders immediately from the list cache; ledger and shared-file cards skeleton in below. Health strip shows placeholders with shimmer, never stale numbers without a freshness timestamp.

**Error state.** If shared-loan stage facts can't load: "We can't confirm the latest recorded milestone right now — last recorded: Processing as of {timestamp}." Status-update sending is disabled while stale (never let an LO send a partner an outdated milestone). Ledger load failure retries inline without collapsing the rest of the profile.

**Mobile.** Card-stack layout: identity → health strip → Ally next-touch → shared files. Tap-to-call/text/email from the header. Log-a-touch is a floating action with voice note support (Ally transcribes and files the note).

**AI behavior.** Ally computes relationship health (recency, frequency, reciprocity, shared-file activity — documented factors only, per [[AI_Product_Architecture]]); drafts every partner-facing update from the partner template set with the privacy wall enforced at draft time (it cannot include borrower financial detail because the CRM holds none — draft context is limited to stage, milestone, timeline, and owner facts); suggests re-engagement when a producing partner goes quiet; flags anniversary/birthday touches. All outreach lands in the approval queue.

**Permissions.** Partner profiles are visible team-wide by default (partners are a team asset), but relationship ownership gates outreach: only the owner and their assistant send touches unless the team leader reassigns. Agent relationship managers have edit rights across all partner profiles in their branch. Borrower data inside shared-file cards is role-trimmed at the API layer, not the UI layer.

**Acceptance criteria.**
- A partner status update draft can never contain credit, income, asset, AUS, or underwriting condition detail — verified by automated tests asserting the draft context schema exposes only stage, milestone, timeline, and owner fields (no such financial fields exist in the CRM to leak).
- Reciprocity meter matches the ledger exactly (no derived-number drift).
- Tier change writes an audit entry with actor and reason.
- Stale shared-file status (no recorded update in > 24 h) visibly disables the status-update CTA.
- An ARM can open a partner profile and know the last touch, next suggested touch, and active shared files within 5 seconds of landing (usability-tested against the REA persona set).

---

### Screen 11 — Agent Relationship Dashboard

**Purpose.** The portfolio view across all referral partners — where the agent relationship manager (and any LO who runs on referrals) sees which relationships are producing, which are cooling off, and where the next hour of outreach should go. This screen exists so partner management is proactive and measured instead of "whoever texted me last."

**Primary user.** Agent relationship manager. Secondary: loan officer (their own partner book), team leader / branch leader (roll-up).

**Primary action.** **Work the outreach list** — a prioritized queue of Ally-suggested partner touches, approved one at a time or in a reviewed batch.

**Information hierarchy.**
1. Headline numbers: active partners, referrals this month, funded-from-referral volume, partners at risk (tabular numerals, period comparators)
2. Ally outreach queue (ranked: at-risk A-tier first, then time-sensitive touches like CTC updates and birthdays)
3. Partner tier board: A/B/C columns with movement indicators (rising/falling production)
4. Referral flow chart: referrals in → funded loans out, by month, with source attribution
5. Coverage map: partners by brokerage/geography (Phase 2+)

**Components.**

| Component | Behavior |
|---|---|
| At-risk list | Partners whose touch recency or referral cadence dropped below their tier's threshold; each row shows the *reason* in plain language ("A-tier, no referral in 90 days, last touch 41 days ago") |
| Outreach queue | Ally cards, each with drafted message + one-tap approve; batch-review mode shows drafts sequentially, never a blind "approve all" |
| Tier board | Drag between tiers allowed (with reason prompt); tier definitions visible on hover — no hidden scoring |
| Referral trend chart | 12-month referrals received/funded; click any bar to the underlying ledger rows |
| Leaderboard (team view) | Partners ranked by funded volume; toggle to "most improved" to avoid pure recency bias |
| New-partner intake | Quick-add with duplicate detection against existing partner records |

**Empty state.** No partners yet: "Your partner book starts here. Add the agents who already send you business — Loan Factory CRM will track every referral both ways." CTA: **Add first partner** + CSV import. If partners exist but no at-risk items: the outreach queue says "All key relationships are current," and shows the next scheduled cadence touches instead of an empty pane.

**Loading state.** Headline numbers first (they anchor the page), then queue, then charts. Charts never render partial data without a "loading full period" note.

**Error state.** If referral attribution data is incomplete (e.g., a loan lacks a referral source), the dashboard shows an explicit "N loans missing referral source" chip that opens a fix-it list — data-quality problems become visible tasks, not silent miscounts.

**Mobile.** Outreach queue is the entire mobile experience: swipe through Ally cards, approve/edit/skip. Headline numbers in a compact strip. Charts collapse to sparklines with tap-to-expand.

**AI behavior.** Ally ranks the outreach queue using documented, fair-lending-irrelevant factors (recency, tier, referral cadence, active-file events); explains every ranking in a sentence; drafts each touch from the partner template set; detects "referral imbalance" (an agent sending consistently while receiving nothing) and suggests a reciprocity action (send a buyer lead, co-marketing offer, review request). No autonomous sending — the ARM taps every approval.

**Permissions.** ARMs and team leaders see all partners in their branch. LOs see their own book plus team-shared partners. Branch leaders see roll-ups across teams. The queue only offers outreach for partners the viewer owns or has been delegated.

**Acceptance criteria.**
- At-risk logic thresholds are visible and editable in Settings (per tier), and every at-risk row states its reason.
- Clearing the outreach queue (approve/skip each item) is possible entirely by keyboard on desktop and entirely by swipe on mobile.
- Referral counts on this dashboard reconcile exactly with the sum of partner-profile ledgers.
- A branch leader viewing roll-up cannot open borrower-level detail on loans outside their permission scope.
- Missing referral-source chip appears when ≥ 1 funded loan in the period lacks attribution.

---

### Screen 12 — Campaign Builder

**Purpose.** Where an LO or marketing coordinator builds an outbound campaign — audience, content, schedule, compliance — in one guided flow. Loan Factory CRM campaigns are audience-and-goal-first ("re-engage 12 refi-eligible past clients") rather than blast-first, and every campaign passes through compliance lint and human approval before anything sends. Plain-language trigger campaigns (evergreen automations) live in the Automation Builder (Screen 14); this screen builds *finite, scheduled* campaigns.

**Primary user.** Marketing coordinator, loan officer. Secondary: team leader (approval), compliance reviewer (high-risk content).

**Primary action.** **Review & launch** — the final step of the builder; disabled until audience, content, and compliance checks are green.

**Information hierarchy.** The builder is a 4-step guided flow; each step is one screen-region with a persistent progress rail:
1. **Goal & audience** — pick a goal (re-engage, nurture, announce, celebrate) and an audience segment (dynamic rule, static list, or combined; e.g., "Funded + rate drop ≥ 0.5%" refi-eligible segment)
2. **Content** — pick or generate the message(s); single-send or multi-step sequence; per-language variants for contacts with non-English preference
3. **Schedule & rules** — send time, throttle, quiet hours, stop conditions (replied, stage advanced, opted out, loan status changed)
4. **Review & launch** — full preview per recipient sample, compliance lint summary, risk tier, approval routing

**Components.**

| Component | Behavior |
|---|---|
| Audience picker | Segment library with plain-English rules and live counts; exclusion preview ("14 excluded: 9 opted out, 3 active problem files, 2 missing email"); consent state filters applied automatically and non-removably |
| Content composer | Start from the stage-aware Template Library (Screen 13), an Ally-generated draft from a brief, or blank; risk tier auto-classified (Standard / Medium / High — High = anything touching rates, payments, fees, savings, guarantees, government programs, qualification) |
| Sequence editor | Linear steps with waits ("Step 2: wait 3 days, then…"); stop conditions displayed on every step, not hidden in settings |
| Language variant tabs | EN primary; VI (and later ZH/ES/RU) variants side-by-side; missing variants route those contacts to the EN version with an explicit choice, never silently |
| Compliance panel | Deterministic lint (trigger terms, do-not-say list, required footer "This is not a commitment to lend. All loans subject to approval. Terms and conditions apply.", NMLS #320841 + LO NMLS, Equal Housing where required, state-rule checks for the audience's states, Best Price Guarantee terms-link + Washington exclusion) + Ally compliance review (blockers → warnings → safer rewrite suggestion) |
| Approval routing | Standard risk → self-approve (logged); Medium → team leader; High → compliance reviewer; statuses Draft / Needs Review / Changes Requested / Approved / Rejected |
| Launch summary | Recipients, steps, duration, estimated sends against the team's allowance meter, first-send time |

**Empty state.** No campaigns yet: three starter cards seeded from the goal taxonomy ("Annual review outreach," "Past-client rate-watch," "New-agent introduction") — each opens the builder pre-filled, nothing pre-approved. Audience picker with no segments: inline link to create one in People.

**Loading state.** Segment counts compute asynchronously with a spinner *on the number only*; the flow never blocks on counts. Preview rendering shows per-recipient merge-field resolution progressively.

**Error state.** Merge-field gaps at review time render as a named fix-list ("6 recipients missing {{PropertyAddress}} — fix or exclude"), with one-tap exclude and a deep link to fix each record. Lint blockers list the exact failing rule and the offending text span. A launch that partially fails (provider error mid-batch) pauses the campaign, reports exact sent/unsent counts, and never re-sends to the already-sent set on resume.

**Mobile.** Campaign *building* is desktop-first; mobile supports review-and-approve (the approval routing notifications open a mobile review screen with full preview and approve/request-changes), plus pause/resume of running campaigns.

**AI behavior.** Ally suggests the audience for a chosen goal (and vice versa); generates drafts from a structured brief (content family, audience, channel, tone) using the brand-voice rules as its system layer; runs the compliance review pass and proposes safer rewrites rather than just rejecting; predicts send-volume against the allowance meter; and after launch, summarizes performance in plain language. Ally never launches, resumes, or edits a live campaign on its own.

**Permissions.** Marketing coordinators and LOs create campaigns for audiences they own. Team-wide audiences require team-leader launch approval regardless of risk tier. Compliance reviewers can hard-stop any campaign (kill switch writes an audit entry). High-risk content cannot be self-approved by its author under any role.

**Acceptance criteria.**
- It is impossible to launch with: an opted-out recipient in the audience, a missing required footer, an unresolved merge field, or an unapproved High-risk draft. Four automated tests, four hard blocks.
- Stop conditions fire correctly: a recipient who replies after step 1 receives no step 2 (integration-tested).
- Per-language variants send to matching contacts; a VI-preference contact never silently receives EN without the reviewer having acknowledged the fallback.
- Every campaign stores its full approval chain (who approved what version, when) and the lint results at launch time.
- Partial-failure resume sends only to the unsent remainder (idempotency test).

---

### Screen 13 — Template Library

**Purpose.** The stage-aware home of the communication content layer — the 135-template mortgage email framework (EMT-001–135) plus team- and LO-authored templates — organized by *where the borrower is in the loan*, not by folder. The old prototype's flat, emoji-card template gallery is explicitly retired (D-01, D-07): a template in Loan Factory CRM is a governed object with a lifecycle stage, an automation policy, required merge fields, language variants, and a compliance status. The user's mental model is "what should I say to someone at this stage?" — the library answers that question directly.

**Primary user.** Loan officer, LO assistant, marketing coordinator. Secondary: compliance reviewer (approval states), team leader (team templates).

**Primary action.** **Use this template** — opens the composer (Conversations, Campaign Builder, or Automation Builder, depending on entry context) with the template loaded and merge fields resolved against the selected contact/loan.

**Information hierarchy.**
1. Stage navigator: the 5 macro-phases (ENGAGE / QUALIFY / TRANSACT / RETAIN / GROW) expanding to the 20 locked stages — selecting a stage shows its templates ranked by fit
2. Contextual entry (the more common path): arriving from a loan record or thread, the library pre-filters to that borrower's current stage and shows "next best message" first
3. Template cards: name, EMT ID, one-line use case, audience badge (Borrower / Realtor / Internal), automation policy badge, language availability, urgency fit (e.g., delay/problem templates surface when the file is stalled)
4. Template detail: full body preview with merge fields highlighted, compliance notes, related templates ("what usually follows this"), version history
5. Library management: team vs. personal tabs, search, gap report

**Components.**

| Component | Behavior |
|---|---|
| Stage navigator | Macro-phase → stage drill-down; per-stage template counts; stages with no coverage (3 Consultation Scheduled, 4 Consultation Completed, 7 Searching for Home, 8 Under Contract — the known gaps) show a "commission this template" placeholder rather than hiding the gap |
| Automation policy badge | **Fully automatable** (44) / **Semi — Ally drafts, human approves** (71) / **Manual only — never auto-send** (20), taken from the authoritative policy column, not tags; Manual-only templates are visually distinct and cannot be attached to automations in Screen 14 |
| Merge-field checklist | The template's required fields from the 17-token vocabulary, each showing resolved/missing state for the selected contact — a template is "ready" only when all required fields resolve |
| Language variants | EN master + locale variants keyed to the same EMT ID; where only lifecycle-module localization exists (VI/ZH/ES-CO/RU), the variant is labeled "module-based — human translation review required" |
| Related-templates rail | The framework's cross-reference graph rendered as "usually sent before / after" — powers next-best-message without guessing |
| Urgency filter | Surfaces the problem-file/delay set (EMT-060–065) when entered from a stalled or flagged loan; these are Manual-only and open with a human-review notice |
| Template editor | Team/personal template authoring with the same YAML-equivalent metadata (stage, audience, trigger, required fields); new templates start as Draft and require compliance approval before use in automations |
| Gap report | Admin view: stages/audiences/languages with thin or no coverage; feeds the content-commissioning backlog |

**Empty state.** Cannot practically occur for the seeded library (135 templates import at provisioning); the *personal* tab empty state: "You haven't saved any templates of your own. When you write something worth reusing, save it here — Loan Factory CRM will file it under the right stage." Stage-gap placeholders as above.

**Loading state.** Stage navigator renders instantly (static taxonomy); template cards skeleton per stage; body preview lazy-loads on card open.

**Error state.** If merge-field resolution fails (contact record unreachable), the checklist shows all fields as "unverified" and the Use CTA becomes "Use without verification" with a warning — never a false green. Import/version conflicts on team templates surface a side-by-side diff, not a silent overwrite.

**Mobile.** Read-and-use only: stage navigator as an accordion, template detail full-screen, Use-this-template hands off to the mobile composer. Authoring and gap management are desktop.

**AI behavior.** Ally recommends templates using the framework's retrieval order (exact ID → stage → audience → situation → product → trigger → language → sensitivity) and always returns the ID, match reason, required placeholders, compliance note, and human-review requirement — the RAG output contract from the source framework, verbatim as Loan Factory CRM's recommendation format. Ally may propose *parameterizing* near-duplicate specialty templates (e.g., the eight "submitted to underwriting" product variants) into one template with a `{{LoanProgram}}` variable, as a suggested edit for human approval. Ally never edits a compliance-approved template in place.

**Permissions.** Everyone reads the company library. Personal templates are private to their author. Team templates: team leader + marketing coordinator edit, compliance reviewer approves. Only compliance-approved templates are eligible for automations; Draft templates are usable in one-off manual sends with a visible Draft watermark.

**Acceptance criteria.**
- Opening the library from an opportunity at stage 13 Conditional Approval shows that stage's follow-up templates (e.g., the docs-still-needed reminder) first, with the borrower's merge-field readiness computed — zero-click stage relevance.
- A Manual-only template (e.g., EMT-062 rate lock) cannot be selected inside the Automation Builder; the attempt explains why in plain language.
- Policy badges derive from the authoritative automation-policy source; the known tag/policy contradiction on EMT-060–065 is resolved in favor of Manual-only (regression test pinned).
- Every EMT ID is stable and never reused; template edits create versions with full history.
- Search by plain-language situation ("borrower's appraisal came in low") returns the relevant template in the top 3 results (relevance test set maintained in [[QA_Plan]]).
- The four stage gaps display commission placeholders until real templates exist.

---

### Screen 14 — Automation Builder

**Purpose.** Where evergreen automations are created and managed as **plain-language trigger cards** — "When disclosures go unsigned for 1 day → send the reminder → stop if they sign" — not node graphs, not flowcharts, not n8n canvases. The n8n backbone is invisible (D-09); what users see is a sentence they could read aloud to a compliance officer. Every automation is built from the framework's trigger catalog, carries stop conditions as first-class citizens, and respects the automation-policy tiers absolutely.

**Primary user.** Loan officer (personal automations), team leader / marketing coordinator (team automations). Secondary: compliance reviewer (policy oversight).

**Primary action.** **Turn on** — activating a fully-configured trigger card. The toggle is the hero control; a card that isn't ready to activate says exactly what's missing.

**Information hierarchy.**
1. Active automations: cards grouped by lifecycle macro-phase (mirroring the trigger taxonomy: Lead & referral / Application & documents / Underwriting & conditions / Closing & funding / Post-close & nurture / Team & ops)
2. Each card reads as one sentence: **When** {trigger} · **Wait** {timing} · **Then** {action} · **Stop if** {stop conditions} · **Who approves** {approval mode}
3. Health strip per card: runs this month, drafts awaiting approval, skips with reasons
4. Suggested automations (Ally, from the catalog of not-yet-enabled patterns)
5. Run log (per card drill-in): every execution with outcome and attribution

**Components.**

| Component | Behavior |
|---|---|
| Trigger card | The complete automation as one readable sentence with each clause tappable to edit; no free-form logic — triggers come from the curated event catalog ([[Automation_Catalog]], seeded from the framework's workflow-trigger vocabulary: "Disclosures unsigned after delay," "Conditional approval received," "Annual mortgage review date," "New online lead captured," etc.). Every trigger fires on a stage/milestone or activity fact recorded in the CRM (team-entered in v1; read-only synced from external systems later) — the underlying loan work always happens outside the CRM |
| Timing picker | The framework's timing grammar only: Send immediately / Wait 1 day / Wait 3 days / Wait until trigger / Manual only — no arbitrary cron expressions in the UI |
| Action picker | Send template (compliance-approved, policy-eligible only) / Create task / Notify teammate / Update field / Enroll in cadence; multi-action allowed as an ordered "then… then…" sentence extension |
| Stop-conditions block | Pre-checked defaults per trigger family (responded / item received / stage advanced / opted out / milestone changed / relationship-owner suppression); users can add stop conditions but **cannot remove** the consent/opt-out stop — "Stop conditions always override timing rules" is enforced in the engine, displayed on the card |
| Approval-mode selector | Governed by the template's policy tier: Fully-automatable templates may run auto-queued *sends of transactional updates* only after explicit activation and remain consent/stop gated (and in v1, borrower-facing sends still land in a one-tap approval queue per CANON); Semi = Ally drafts → approval queue; Manual-only templates are not selectable |
| Health checks | Pre-activation validation with named blockers and one-tap fixes ("3 contacts in this audience have no email — they'll be skipped · Review list"), the pattern promoted from the prototype's scheduled-send health warnings |
| Suggested-automation cards | "You mark files Funded but have no post-close thank-you running — turn on EMT-043?" with the full card pre-built for review |
| Run log | Per-execution rows: trigger event, contact, action taken/drafted, approver, outcome, stop-condition hits; exportable for audit |

**Empty state.** First visit: a short stack of 3–5 suggested starter cards matched to the user's pipeline reality (e.g., if they have leads but no contact-attempt cadence: "When a new lead gets no contact for 1 day → draft the follow-up"). Each is fully assembled, off by default, one review away from on. No blank canvas, ever.

**Loading state.** Cards render from cache with a freshness stamp; health strips compute async. A card whose health check is still running shows "checking…" and cannot be toggled on until checks complete.

**Error state.** Engine failure on a run: the card shows a red count ("2 runs failed — view"), each failure with plain-language cause and retry state; failed borrower-facing actions are never silently retried into double-sends (idempotency keys per trigger event). If the underlying n8n job is unreachable, cards enter "paused by system" with a banner — user automations never show n8n error text.

**Mobile.** Cards are read-and-toggle plus approval-queue processing. Building/editing clauses is desktop-first, though the suggested-card review (read sentence → turn on) works fully on mobile.

**AI behavior.** Ally proposes automations from observed manual repetition ("you've sent this same reminder manually 6 times"); pre-assembles every suggested card with trigger, timing, template, and stop conditions from the framework's automation map; drafts each message execution for Semi-tier flows; explains every skip ("skipped: borrower replied 2 hours after trigger"); and monitors for automation collisions (two cards targeting the same contact in the same window → warns and proposes priority). Ally cannot activate, deactivate, or modify a card — humans toggle.

**Permissions.** LOs create/toggle personal automations over their own contacts. Team automations require team-leader activation. Compliance reviewers see all cards read-only and hold a global and per-card kill switch. Every activation, deactivation, and edit is audit-logged with actor and before/after card sentence.

**Acceptance criteria.**
- Every automation is fully expressible — and displayed — as one plain-language sentence; a compliance reviewer reading only card sentences can accurately describe system behavior (tested via the compliance personas).
- A Manual-only template can never be attached to any automation through any path (UI, API, import).
- Opt-out/consent stop conditions cannot be removed from any card; a contact who opts out mid-sequence receives nothing further (integration test).
- The same trigger event never produces duplicate sends (idempotency test under retry conditions).
- Health-check blockers must be resolved or explicitly acknowledged before activation.
- Run log reconstructs any borrower-facing send end-to-end: trigger event → draft → approver → send timestamp.

---

### Screen 15 — AI Intelligence Center

**Purpose.** The Intelligence nav destination: where production analytics and AI oversight live together. One half answers "how is my business doing?" (pipeline conversion, source attribution, production trends); the other answers "what has Ally been doing, and can I trust it?" (activity log, approval statistics, scoring factor documentation, fair-lending review posture). Putting reporting and AI accountability on the same screen is deliberate — the audit trail is a product feature, not a settings page.

**Primary user.** Loan officer (own book), team leader / branch leader (roll-ups). Secondary: compliance reviewer (AI oversight panels), marketing coordinator (campaign analytics).

**Primary action.** **Ask Intelligence** — a plain-language question box over the user's own data ("How many preapprovals went under contract last quarter?" "Which lead source funds fastest?") that returns an answer with the underlying numbers and a link to the source rows. This is the one screen where a query box is the primary action, because the screen's job is answering questions.

**Information hierarchy.**
1. Production snapshot: funded volume and units (MTD/QTD/YTD with comparators), active pipeline value by macro-phase, projected closings
2. Conversion funnel: the 20-stage lifecycle rendered as macro-phase conversion rates with drill-in to stage-level (where do deals stall, average days-in-stage vs. team baseline)
3. Source attribution: leads → funded by source (LF website widgets, QM Pricer rate alerts, Facebook "Automatically Created" leads, agent referrals, manual) — structured source as a first-class dimension
4. Ally accountability panel: actions prepared / approved / edited-then-approved / dismissed this period; approval rate trend; time saved estimate (drafting minutes reclaimed, labeled as an estimate)
5. AI activity log: every Ally action, filterable and exportable
6. Scoring transparency: the documented factor list behind lead priority and relationship health, with plain-language weight descriptions and the date of last fair-lending disparate-impact review

**Components.**

| Component | Behavior |
|---|---|
| Metric tiles | Tabular numerals, explicit period + comparator, freshness timestamp on every tile; no metric renders without its as-of time |
| Funnel view | Macro-phase bars → stage drill-down; each stage shows count, value, median days, and a "stalled here" list linking to the actual loans |
| Source table | Source → leads → conversations started → applications → funded, with cost-per-funded when ad-spend data exists (Phase 2, Facebook/Google); rows with unattributed leads shown honestly as "Unknown source" with a fix-it link |
| Ask Intelligence box | Natural-language query → Ally translates to a query over permitted data, returns answer + the numbers + "how I calculated this"; refuses questions outside the user's permission scope with a plain explanation |
| Ally activity log | Row per action: timestamp, action type (draft, ranking, classification, suggestion), subject, model-input summary, human decision, actor; export to CSV; retention per [[Mortgage_Compliance]] |
| Approval analytics | Where humans most often edit or reject Ally drafts (by template, stage, action type) — the feedback loop that tells us where Ally is weak |
| Factor documentation card | For each AI ranking (lead priority, partner health, next best action): the factor list, in plain language, with an explicit statement that protected-class attributes and proxies are excluded, and the last disparate-impact review date; links to [[AI_Product_Architecture]] |
| Report scheduler | Weekly/monthly digest email of selected tiles (to self or team leader), built on the same approval-visible pipeline |

**Empty state.** New account (< 2 weeks of data): the snapshot shows real small numbers, and Ally frames it honestly — "Not enough history for trends yet. Here's what's true so far." Funnel and source views appear with data thresholds noted, never simulated placeholder charts. The activity log is populated from day one (Ally acts from day one).

**Loading state.** Tiles load independently; slow aggregates show per-tile skeletons, never a full-page spinner. Ask Intelligence streams its answer with the computation note appended at the end.

**Error state.** An aggregation failure marks the affected tile "Couldn't compute — retry," leaving the rest of the page live. Ask Intelligence failures return "I couldn't answer that reliably" plus what it *can* answer — never a fabricated number. Stale-data condition (> 1 h ETL lag) banners the whole screen with the actual as-of time (the stale-dashboard edge case from the persona framework is an explicit test).

**Mobile.** Snapshot tiles + Ask Intelligence + approval-queue counts. Funnel and log views are simplified read-only; export and scheduling are desktop.

**AI behavior.** Ally powers Ask Intelligence (query translation with permission-scoped data access and shown work); writes a weekly plain-language narrative ("Your QUALIFY→TRANSACT conversion rose 8 points; the 3 stalled Processing files are the biggest risk to this month"); flags anomalies (stage-time regressions, source quality drops) as cards routed to Today; and self-reports — the accountability panel is Ally reporting on itself from the immutable log, not a marketing surface. Ally never mutates data from this screen and never presents an estimate as a measurement (estimates are labeled).

**Permissions.** LOs: own book only. Team leaders: team roll-up + per-LO drill-in. Branch leaders: cross-team roll-ups. Compliance reviewers: full AI activity log and factor documentation across the tenant, without borrower financial detail beyond what oversight requires. Ask Intelligence enforces the same row-level security as every other surface — it cannot be used to escalate visibility.

**Acceptance criteria.**
- Every displayed metric carries an as-of timestamp; the stale-data banner triggers at the defined lag threshold (SCN-EDGE-003 equivalent passes).
- The Ally activity log accounts for 100% of AI actions — verified by reconciling log rows against action-emitting services in integration tests; no unlogged path exists.
- Ask Intelligence answers respect RLS: a crafted question about another LO's borrower returns a permission-scoped refusal, not data (adversarial test set).
- Factor documentation renders for every live AI ranking, and the disparate-impact review date is required, displayed, and alert-flagged when overdue per the cadence in [[Mortgage_Compliance]].
- Funnel counts reconcile with Pipeline screen counts for the same filters (single source of truth test).
- The leadership readout question from the usability framework — "Can AI-assisted workflows be reviewed against source evidence before a human acts?" — is demonstrably yes from this screen: any Ally draft in the approval analytics links back to its source template, input context, and approver.

---

Continue to [[Screen_Specifications]] siblings for screens 1–8 and 16+. Cross-cutting patterns used above (Ally card anatomy, approval queue, compliance lint strip, freshness timestamps, health-check blockers with one-tap fixes) are defined once in [[Design_System]] and referenced here rather than redefined.
