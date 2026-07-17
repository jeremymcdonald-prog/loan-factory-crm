# Security

Purpose: the complete security specification for Loan Factory CRM — who can see and do what (RBAC), how tenants and roles are separated in the database (row-level security), how borrower personal information is classified and protected, how secrets, audit trails, AI action logs, backups, and incidents are handled, and what the implementation team must verify before each phase ships. Everything here is enforceable and testable; nothing is aspirational. The regulatory side (consent, fair lending, disclosures, retention) lives in [[Mortgage_Compliance]]; the entity and field definitions live in [[Data_Model]]; the platform choices behind these controls live in [[Technical_Architecture]]. Where this document says "must," it is a release blocker per [[PRD]] §5.

## 1. Security principles

1. **Least privilege, always.** Every role starts from zero and is granted only what its daily job requires. No role gets "everything just in case." Elevation is temporary, logged, and visible.
2. **The database enforces access, not the UI.** Hiding a button is not a security control. Every read and write is checked by Postgres row-level security (RLS) policies; the application layer is a second check, never the only one.
3. **AI prepares, the human approves** ([[Decisions]] D-05). The AI layer has no send, publish, delete, or money-adjacent capability. Its ceiling is the approval queue.
4. **All inbound content is untrusted input.** Emails, SMS replies, form submissions, inbound attachments, and web content are data, never instructions — the prompt-injection posture in §11.
5. **Everything is attributable.** Every state change and every AI action carries who/what/when/why in an append-only audit trail. "The system did it" is never an acceptable answer.
6. **Borrower NPI is minimized.** Loan Factory CRM stores the minimum borrower data the relationship workflow needs. Full credit reports, bank statements, and tax returns are never CRM data — see §5.
7. **Secure by default.** New tables get RLS enabled before first insert. New roles get no permissions until granted. New automations get the most restrictive tier until reviewed ([[Automation_Catalog]] §1).

## 2. RBAC role matrix

The 7 CANON staff user types plus a System Admin role = 8 role presets. Borrowers are CRM contacts, not product users — they hold no role and no login. Roles are presets on a permission model, not hardcoded — an admin can adjust within guardrails (Phase 4 adds custom roles). Access scopes: **Own** (records I own or am assigned to), **Team** (my team's records), **Branch** (all teams in my branch), **All** (whole tenant). Access levels: **R** read · **W** create/edit · **A** approve (can release items from an approval queue) · **—** none.

| Capability domain | Loan Officer | LO Assistant | Processor / Ops | Team Leader | Branch Leader | Agent Relationship Mgr | Marketing Coordinator | System Admin |
|---|---|---|---|---|---|---|---|---|
| People — contacts & leads | R/W Own+Team pool | R/W Own (assigned LOs) | R Own files | R/W Team | R Branch | R referral-linked only | R segment counts only (no drill-down to NPI) | R/W All |
| Pipeline — CRM opportunities & stages | R/W Own | R/W Own (assigned LOs), stage moves within TRANSACT | R/W Own files (TRANSACT stages) | R/W Team | R Branch | R milestone/status only on linked deals | — | R All |
| Opportunity loan-context fields (amount, program, key dates — team-entered visibility data; the CRM never owns loan-of-record data) | R/W Own | R/W Own | R/W Own files | R Team | R Branch | — | — | R All |
| Conversations — email/SMS with borrowers | R/W/Send Own (after approval) | R/W Own; Send only as delegated sender identity | R/W Own files (processor sender voice, EMT-052–056) | R Team; Send Own | R Branch | — | — | R All |
| Approval queue (T2 items) | **A** Own | A Own only if Team Leader delegates, logged | A Own-file ops messages | A Team (can approve for an absent LO — logged as "approved on behalf of") | R Branch | — | — | R All (cannot approve borrower comms) |
| Partners — agents & referral sources | R/W Own | R Own | R Own files (transaction contacts) | R/W Team | R Branch | **R/W All** (this is their job) | R (for co-marketing context) | R/W All |
| Marketing — content, campaigns, library | R/W Own drafts | R Own | — | R/W Team + **A** team content | R Branch | R/W agent-facing content, A own domain | **R/W All + A** (content approval owner) | R/W All |
| Automations — create/edit/pause | R/W Own (from approved recipes) | R Own | R Own files | R/W Team + A new team automations | R Branch | R/W partner-nurture recipes | R/W marketing recipes | R/W All + kill switch |
| Intelligence — reports & scorecards | R Own | R Own (assigned LOs) | R Own workload | R Team (incl. per-LO scorecards) | R Branch (rollups; per-LO detail via Team Leader) | R partner-sourced pipeline | R campaign performance | R All |
| Team — members, roles, quotas | R own profile | R own profile | R own profile | R/W Team membership; cannot change roles above own | R Branch structure; W team-leader assignments | R own profile | R own profile | **R/W All roles & permissions** |
| Settings — tenant config, integrations, compliance rules | Own preferences only | Own preferences only | Own preferences only | Team defaults | Branch defaults | Own preferences | Marketing defaults (sender domains, footers — with Admin co-sign) | **R/W All** |
| Audit logs & AI action logs | R Own actions | R Own actions | R Own actions | R Team | R Branch | R Own | R Own | **R All** (read-only — nobody edits audit logs, including Admin) |
| Data export (bulk) | Own contacts (CSV, logged) | — | — | Team (logged, Admin-notified) | Branch (logged, Admin-notified) | Own partner list | — (see matrix rule below) | All (logged) |

**Matrix rules the implementation team must enforce:**

- **Permission blocks explain themselves.** When a role is blocked, the message names who *can* act and offers a handoff ("Only Kim (Team Leader) can approve team automations — send it to her?"). This is a critical-fail condition from the usability scorecard, adopted in [[PRD]] FR-TM-1.
- **No self-approval above your scope.** A Marketing Coordinator can approve content but cannot approve a change to the compliance footer text — that requires Admin plus the compliance owner ([[Mortgage_Compliance]] §9).
- **"View as" is read-mostly and watermarked.** Team Leaders can open an LO's workspace (a proven pattern from the prototype's manager view — [[Current_State_Audit]]); every view-as session is logged, visually labeled, and actions taken while viewing-as are attributed to the leader, not the LO.
- **Borrowers have no role, no login, no access path.** Borrowers exist in the system only as CRM contact records; there is no borrower-facing surface, so the entire borrower attack class (credential theft, cross-borrower data access via a portal) is out of the product's surface area by design. Their data is protected by the staff scoping above and the PII classes in §5.
- **Marketing never touches member lists.** The Marketing Coordinator sees segment counts and campaign performance — never member names, emails, or phones. Campaign recipients are resolved server-side inside the Comms service at send time; no recipient list is ever surfaced to the role. If an operational export is genuinely unavoidable, it requires Admin co-sign, is logged as a bulk-export audit event (§8), and is limited to delivery-necessary fields only — never NPI.
- **Admin is an operations role, not a super-LO.** Admin reads everything for support and configures the system, but cannot approve borrower-facing communications (separation of duties) and cannot alter or delete audit records.

## 3. Least privilege in practice

| Rule | Implementation |
|---|---|
| Default deny | New user = no role until assigned; new role = no grants until configured; new table = RLS on with no permissive policy. |
| Time-boxed elevation | Temporary grants (e.g., covering an LO on vacation) carry an expiry date and auto-revoke; the grant and revocation are audit events. |
| Quarterly access review | Admin + Team Leaders review the role assignments and any custom grants each quarter; report generated by the system (Phase 2), signed off in writing. Orphaned accounts (departed staff) disabled within 1 business day of departure — an offboarding checklist item in Team settings. |
| Service accounts minimized | n8n and other backend services get scoped API credentials per job type, never a tenant-wide superuser key. The Supabase `service_role` key lives only in server-side environment config, is never shipped to any client, and its use paths are code-reviewed (see §7). |
| No shared logins | One human = one account = one MFA enrollment. Shared "front desk" logins are prohibited; use delegated permissions instead. |

## 4. Tenant separation — row-level security

Loan Factory CRM runs on Supabase Postgres with RLS as the primary isolation mechanism ([[Decisions]] D-09, [[Technical_Architecture]]).

- **Every tenant-owned table carries `tenant_id`** (and, where scoped, `team_id`, `branch_id`, `owner_user_id`). No exceptions — including junction tables, logs, and AI memory/embedding tables (pgvector rows carry `tenant_id` too; vector search filters by tenant before similarity, so one tenant's borrower data can never surface in another tenant's AI results).
- **RLS policy pattern:** policies derive the caller's tenant, roles, and scope from the authenticated JWT claims (Supabase Auth), never from client-supplied parameters. Read policies implement the Own/Team/Branch/All scopes from §2; write policies are stricter than read policies.
- **The `service_role` bypasses RLS by design — so it is treated as radioactive:** used only inside server-side jobs that must operate cross-user (imports, automation execution, scheduled sends), each such code path enumerated in a reviewed allowlist, each invocation logged with job identity.
- **RLS is tested, not trusted.** [[QA_Plan]] includes a standing cross-tenant test suite: for every table, an authenticated user from tenant A attempts reads and writes against tenant B rows and against out-of-scope rows in their own tenant (another LO's contacts, another team's pipeline). All must fail at the database. This suite runs in CI on every schema migration. The Supabase security advisors report (missing-RLS detection) is checked before every release.
- **v1 reality check:** Phase 1 ships with effectively one tenant (Loan Factory / Jeremy's team). RLS multi-tenancy is built from day one anyway — retrofitting tenancy is the classic unfixable mistake, and Phase 4 (enterprise/multi-branch/white-label) depends on it.

## 5. Borrower PII protection

Field-level data classification is defined per entity in [[Data_Model]]; this section defines the classes and handling rules.

| Class | Definition | Examples | Handling |
|---|---|---|---|
| **P0 — Public** | Safe if seen by anyone | Company NMLS, office address, published content | No restrictions |
| **P1 — Internal** | Business data, no personal harm if leaked internally | Stage names, template library, automation configs, team structure | Standard RBAC |
| **P2 — Personal** | Identifies a person; harm is embarrassment/spam | Name, email, phone, address, language preference, birthday, notes | RBAC scoping per §2; encrypted at rest; included in exports/deletion (§14); never placed in URLs or logs in plaintext |
| **P3 — Sensitive financial (NPI)** | Gramm-Leach-Bliley nonpublic personal information | Loan amount, program, property address, income band, credit-score band, milestone details, preapproval amounts | All P2 rules + partner privacy wall (agents never see it — [[Automation_Catalog]] gate G3); never sent over SMS; masked in Intelligence rollups; access logged at row level for non-owner reads |
| **P4 — Prohibited** | Loan Factory CRM does not store it, in any phase | SSN, full credit reports, bank statements, paystubs, tax returns, government ID images, full account numbers | Not collected, not stored, no fields exist for it. Document intake and storage live permanently in the source-of-truth systems (LOS/secure portal) — the CRM's role is limited to communication about documents (e.g., a docs-needed follow-up flag), never collecting or holding them. If a borrower emails a P4 document unprompted, the standard playbook is: do not forward, store a reference note only, direct the borrower to the secure channel (the framework's own compliance guide already mandates secure-portal-only for documents). |

Additional PII rules:

- **AI boundary:** no P3/P4 data is ever placed into external AI tools outside the governed model gateway ([[AI_Product_Architecture]]); the gateway contracts must guarantee no training on our data (verified per vendor in §12). This encodes the marketing-content-os `ai_public_tool_safety` never-enter list as product policy.
- **Merge fields are the leak surface.** The 17-token merge vocabulary is resolved server-side at queue time; drafts shown to AI for compliance review contain the resolved P2 fields it needs and nothing more.
- **Same-name collisions:** duplicate-detection and merge flows (a scorecard critical-fail area) must show enough distinguishing data to prevent cross-borrower mix-ups without exposing extra NPI (last-4 phone, city — never financial fields — in the disambiguation UI).
- **Screens honor classification:** Intelligence dashboards aggregate; drill-down to P3 requires pipeline-scope access. Marketing sees segment counts, never member NPI.

## 6. Encryption

| Layer | Standard |
|---|---|
| In transit | TLS 1.2+ everywhere (client↔app, app↔database, app↔model gateway, app↔n8n, webhooks). No plaintext listener anywhere. HSTS on all web surfaces. |
| At rest | Postgres storage encryption (AES-256, Supabase-managed) for the database; encrypted object storage for any file assets; encrypted backups (§13). |
| Application-level | P3 fields flagged in [[Data_Model]] get column-level encryption where the platform supports it without breaking RLS-filtered queries; decision per field documented in [[Technical_Architecture]]. Password handling is delegated entirely to Supabase Auth (bcrypt/argon2 — never custom crypto). |
| Keys | Managed by the platform (Supabase/host KMS). No key material in application code or env files. |

## 7. Secrets handling

- **`.env.example` convention:** every repository carries a committed `.env.example` listing each required variable with a placeholder and a one-line comment (what it is, where to get it, which environments need it). Real values live only in untracked `.env.local` files and in the deployment platform's secret manager. `.gitignore` covers all real env files; CI includes a secret-scanning step (e.g., gitleaks) that fails the build on committed credentials.
- **No secrets in docs, chat, tickets, or screenshots** — including this documentation set. Reference secrets by variable name only (`ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`), never by value. A secret pasted into a chat or ticket is treated as compromised: rotate immediately, log the incident (§15).
- **Separation by environment:** dev/staging/production have distinct credentials; production secrets are visible only to Admin-level operators; staging never holds production borrower data (§13).
- **Rotation:** provider API keys rotated on a schedule (at least annually) and immediately on staff departure or suspected exposure. The n8n instance's credentials store is treated as production secret storage: access restricted, credentials scoped per workflow.
- **Webhook authenticity:** inbound webhooks (lead sources, email events) carry signed secrets verified server-side; unsigned calls are rejected and logged.

## 8. Audit logs

One append-only audit trail covers the whole product ([[Technical_Architecture]] defines the table; this defines the contract):

- **Logged events:** authentication (login, MFA, failures, session revocation), role/permission changes, record create/update/delete on People/Pipeline/Partners (with field-level before/after for P2/P3 fields), every outbound communication (channel, template ID, approver, timestamp), consent changes, automation activations/pauses, exports, view-as sessions, settings changes, and every AI action (§9).
- **Every entry carries:** actor (user ID, or system job identity, or "AI" + triggering automation ID), tenant, timestamp (UTC), action, object type + ID, before/after where applicable, origin (UI / automation / API / import).
- **Append-only:** no update or delete path exists in the application; database privileges on the audit table are insert+select only, including for Admin. Corrections are new entries referencing the old.
- **Retention:** minimum 5 years, aligned to the communication-retention posture in [[Mortgage_Compliance]] §10 (audit trail must outlive the records it explains).
- **Usability:** the audit trail is a product surface, not just a table — "source evidence clarity" is a scored usability field ([[QA_Plan]]); a user must be able to answer "why did this happen / who did this" from the record's timeline.

## 9. AI action logs

Every AI action gets a structured log entry beyond the general audit trail (schema detail in [[AI_Product_Architecture]]):

| Field | Content |
|---|---|
| Action ID + timestamp | Unique, immutable |
| Trigger | What invoked AI (automation ID from [[Automation_Catalog]], user request, daily briefing job) |
| Inputs summary | Which records/templates/knowledge were retrieved (IDs, not full content dumps), model + prompt version identifiers |
| Output | The draft/recommendation produced, verbatim, with the compliance-lint result attached (pass/blockers/warnings) |
| Risk tier | T0–T3 tier and content risk level (Standard/Medium/High per [[Mortgage_Compliance]] §9) |
| Human decision | Approved / edited-then-approved (with diff) / rejected / expired — approver identity + timestamp |
| Outcome | Sent/published/task-created; message ID linkage for delivery events |

This makes three [[PRD]] guarantees checkable: unapproved-send count = 0 always (G6), 100% of AI actions logged and attributable (G8), and AI draft approval/edit-distance metrics for the trust goal. It is also the dataset for the earned-autonomy proposal ([[Automation_Catalog]] §1) and the fair-lending review evidence ([[Mortgage_Compliance]] §4).

## 10. Approval gates

The tier model (T0/T1/T2/T3) in [[Automation_Catalog]] §1 is the behavioral spec. Security invariants on top of it:

1. **No send path exists that bypasses the approval queue** for borrower/partner-facing content in v1 — architecturally: the send service accepts only queue-item IDs bearing an approval record, never raw content.
2. **Approval is authenticated and scoped**: only roles with **A** in §2 for that item's scope can approve; approvals via a stale/expired session are rejected.
3. **Approvals expire.** A queued T2 item unapproved after its stop-condition window dies rather than sending stale content ([[Automation_Catalog]] rule 1); ageing items resurface per J-04.
4. **The compliance lint (gate G5) runs at queue time and re-runs at approval time** if the draft was edited — an edit can introduce a violation the original didn't have.
5. **State-licensing gate (SAFE Act).** Every user record carries `licensed_states` ([[Data_Model]] `user`). A Layer-1 lint rule ([[Mortgage_Compliance]] §9, [[Automation_Catalog]] G-series) checks the borrower/property state against the sending LO's `licensed_states` at queue time: borrower-facing drafts — including refi outreach (G-04/G-05) and 1:1 drafts — are **blocked**, not warned, when the state is outside the sender's licensed states; lead assignment to an unlicensed LO is flagged for reroute/escalation before any solicitation can begin. Licensed states drive more than marketing distribution defaults — they gate every borrower solicitation path.
6. **Kill switch:** Admin and Team Leaders can pause any automation or the whole queue instantly; the pause is itself an audit event.

## 11. Prompt-injection defenses

AI reads emails, SMS replies, form submissions, and inbound attachments — all attacker-reachable. Defenses, layered:

1. **Instruction/data separation:** all retrieved and inbound content is wrapped and labeled as untrusted data in prompts; system instructions live server-side and are never concatenated from user-reachable fields. Contact names, notes, and email bodies are data, never template instructions.
2. **No consequential tools on untrusted input:** when processing inbound content (summarizing an email, classifying a lead), AI's toolset is read-only. Actions that change state (draft, queue, task-create) run from the CRM's own trigger logic, not from instructions found inside content. An email saying "send my file to X" produces at most a *suggested task for human review*, flagged as originating from message content.
3. **Output validation regardless of input:** every draft passes the deterministic compliance lint + the AI compliance reviewer ([[Mortgage_Compliance]] §9) after generation — so even a successfully manipulated generation cannot exit the system without human approval and lint pass.
4. **The human gate is the backstop:** the T2 ceiling means injection can, at worst, produce a bad draft a human sees — not a sent message, changed record, or leaked dataset.
5. **Egress control:** AI cannot construct arbitrary outbound requests; recipients come from records, links come from an allowlist (Loan Factory domains, configured booking/apply links).
6. **Adversarial testing:** [[QA_Plan]] includes a prompt-injection suite (hostile email bodies, hostile form fills, hostile attachment text) run before every phase release, per [[PRD]] §7.

## 12. Vendor risk process

Every third-party service that touches Loan Factory CRM data goes through this before integration (tracked in [[Integration_Map]]):

1. **Classify** the data it will receive (P0–P4 per §5). P4 = automatic escalation to Jeremy + counsel.
2. **Verify** security posture: SOC 2 Type II or equivalent, encryption at rest/in transit, breach-notification terms, data-processing agreement signed. For AI vendors additionally: no-training-on-customer-data commitment, data-retention window, region of processing.
3. **Scope** credentials to least privilege; store per §7.
4. **Record** the assessment (vendor, data classes, DPA date, review date) in a vendor register owned by Admin; re-review annually and on any breach disclosure.
5. **Exit plan:** how data is returned/deleted at contract end.

Current known vendor surface: Supabase (P2/P3 — the database), Anthropic via model gateway (P2, minimized P3 per §5), Vercel-class hosting (transit), n8n (self-hosted in Jeremy's stack — treated as internal infrastructure but secured per §7), future SMS provider (must clear this process **and** 10DLC registration per [[Mortgage_Compliance]] §2 before SMS ships), future email delivery provider. Nothing beyond these is confirmed ([[Integration_Map]]).

## 13. Backup & recovery

| Item | Standard |
|---|---|
| Database backups | Daily automated snapshots + point-in-time recovery (WAL) enabled; encrypted; retained ≥ 35 days rolling, monthly archives ≥ 1 year |
| Recovery objectives | RPO ≤ 1 hour (point-in-time), RTO ≤ 4 hours for full restore — validated, not assumed |
| Restore drills | Quarterly: restore a backup to an isolated environment, run integrity checks, record time-to-restore. A backup that has never been restored is a hope, not a backup. |
| Configuration | Automation definitions, n8n workflows, and settings are exported/versioned (git) so the system's *behavior* is recoverable, not just its data |
| Environment hygiene | Staging/dev run on synthetic data (the persona/fixture sets — [[QA_Plan]] data-safety rules: fake data only, no external sends from test environments). Production data is never copied down un-anonymized. |

## 14. Data export & deletion (CCPA-class)

Loan Factory CRM is built to honor consumer privacy requests (California CCPA/CPRA as the high-water mark; state privacy laws expanding):

- **Export (access request):** a per-contact export assembles everything held about that person — profile, loans, communications, consent history, notes, AI-log references — into a readable package. Admin-run (manual button + generated file) — borrowers and contacts request through the team, never through a login of their own. Fulfillment target: ≤ 30 days, tracked.
- **Deletion request:** deletion is honored **except where retention is legally required** — and mortgage records frequently are ([[Mortgage_Compliance]] §10). The implemented behavior: (1) delete P2 data not under a retention duty; (2) for records under retention (loan file communications, advertising records, audit trail), suppress-and-lock — the contact is excluded from all marketing/automation forever, flagged "deletion requested," access restricted to Admin + compliance owner, and physically deleted when the retention clock expires (deletion date recorded and enforced by a scheduled job); (3) the request and its disposition are logged.
- **Do-not-sell/share:** Loan Factory CRM does not sell or share personal data for cross-context advertising; state it in the privacy policy and keep it true — no third-party ad pixels inside the authenticated app.
- **Right to correct:** ordinary record editing satisfies it; the audit trail preserves the correction history.
- **Verification:** identity of the requester is verified (matching contact channel challenge) before export/deletion — otherwise the DSAR process itself becomes a data-leak vector.

## 15. Incident response runbook (outline)

The implementation team turns this outline into a one-page runbook stored in the repo and rehearsed once per phase:

1. **Severity levels:** SEV-1 confirmed data breach / credential compromise / unauthorized borrower-data access · SEV-2 suspected breach, injection success, vendor breach notice · SEV-3 policy violation without exposure (secret committed but not leaked, misconfigured permission caught internally).
2. **First hour (any SEV):** contain (revoke credentials/sessions, pause automations via kill switch, isolate affected service) → preserve evidence (do not delete logs) → open an incident record (owner, timeline, actions).
3. **Roles:** Incident owner (Admin/on-call engineer) · Decision owner (Jeremy) · Compliance owner (breach-notification duty assessment) · Comms owner (borrower/partner notification if required).
4. **Assess:** what data classes (§5) were touched, which tenants/contacts, root cause.
5. **Notify:** counsel-guided — GLBA Safeguards Rule and state breach-notification laws set clocks once borrower NPI is confirmed exposed; vendor DPAs set contractual clocks. Pre-draft notification templates in advance, not during the fire.
6. **Recover:** rotate all potentially exposed secrets, restore from backup if integrity is in doubt (§13), re-enable services with verification.
7. **Post-mortem within 5 business days:** blameless write-up, corrective actions with owners and dates, logged in [[Decisions]] if it changes policy.

## 16. Session & MFA policy

| Control | Policy |
|---|---|
| MFA | Required for every staff account at first login (TOTP app; SMS-based MFA discouraged). Admin role: MFA strictly required, no exceptions. All accounts are staff accounts — borrowers have no login (§2). |
| Sessions | JWT-based (Supabase Auth); access tokens short-lived (≤ 1 hour) with refresh rotation; absolute session lifetime ≤ 7 days; refresh revoked on password change, role change, or admin revocation ("sign out everywhere" available to users and Admin). |
| Idle timeout | Staff web sessions re-authenticate after 24h idle; approval actions (§10) always require a fresh (non-expired) session. |
| Password policy | Length ≥ 12, no composition theater, breached-password check on set; handled by Supabase Auth configuration. |
| Lockout & abuse | Progressive rate-limiting on failed logins; alerts to Admin on credential-stuffing patterns; login events in the audit trail (§8). |
| Device hygiene | No borrower NPI in push-notification bodies ("New lead: J. Nguyen" not loan details); mobile web honors the same session rules. |

## 17. Security audit-ready checklist

The pre-release verification list. Every phase release requires a signed pass (checked by engineering lead, countersigned by Admin/compliance owner):

- [ ] RLS enabled on every table; cross-tenant test suite green in CI; Supabase advisors report clean
- [ ] Role matrix (§2) implemented as policy tests — every cell verified by an automated permission test
- [ ] No **A**-capable action reachable without a valid, fresh, scoped session
- [ ] Field classification (P0–P4) present in [[Data_Model]] for every new field this release; no P4 field exists
- [ ] Partner privacy wall (gate G3) enforced at query level — verified by test, not review
- [ ] TLS on every hop; HSTS on; no mixed content
- [ ] `.env.example` current; secret scanner green; no secrets in repo history, docs, or tickets; rotation log current
- [ ] Audit trail append-only verified (attempted update/delete fails at DB level); all new event types logging
- [ ] AI action log: sampled AI actions reconstruct fully (trigger → inputs → output → lint → human decision → outcome)
- [ ] Unapproved-send invariant: automated test proves the send service rejects unapproved content
- [ ] State-licensing gate verified by fixture (release checklist 11a): draft to a borrower in an unlicensed state is blocked; lead assignment to an unlicensed LO is flagged for reroute
- [ ] Marketing Coordinator cannot reach any recipient list: segment-list export test fails; campaign recipients resolve server-side only; any Admin co-signed export appears as a bulk-export audit event
- [ ] Prompt-injection suite run and passed; new attack patterns added since last release
- [ ] Vendor register current; any new vendor cleared §12 before its integration shipped
- [ ] Backup restore drill completed this quarter; RPO/RTO measured and within target
- [ ] DSAR export produces a complete package for a test contact; deletion suppress-and-lock behavior verified
- [ ] Incident runbook current; on-call/contact list verified; one tabletop exercise this phase
- [ ] MFA enforced for all staff accounts; zero shared logins; offboarding removed all departed users
- [ ] Dependency and platform patch review completed (no known-critical CVEs shipped)

Related: [[Mortgage_Compliance]] · [[Technical_Architecture]] · [[Data_Model]] · [[AI_Product_Architecture]] · [[Automation_Catalog]] · [[QA_Plan]] · [[PRD]] · [[Decisions]] · [[Integration_Map]]
