# Asset_Inventory

Purpose: the complete inventory of everything Jeremy handed over for this build — six zip archives plus the HTML prototype — with verified contents and counts, an honest quality grade per pack, what is reusable versus discardable, where packs duplicate or contradict each other, and a master map of which asset feeds which product module and blueprint document. Verified counts come from the discovery analyses (all counts grep-checked against source, not taken from READMEs on faith); extraction record in [[Build_Log]]; prototype deep-dive in [[Current_State_Audit]].

## 1. Overview scorecard

| # | Asset (source file) | Extracted to `_product_discovery/` | Size / counts | Grade | One-line verdict |
|---|---|---|---|---|---|
| 1 | `mortgage-communication-framework-master.zip` | `communication_framework/` | 46 md files, 15,593 lines; **135 templates** | **A** | Best-engineered pack; becomes the communication content layer (D-07) |
| 2 | `ai-personas-master.zip` | `ai_personas/` | 18 md files, ~332 KB; **111 personas, 259 scenarios, 5 languages** | **A−** | QA/usability backbone (D-15); minor authoring defects; built for TERA+ |
| 3 | `loan-factory-marketing-content-os.zip` | `marketing_content_os/` | 219 MB (55,434 files incl. node_modules); **~56 curated md files (~2,245 lines)** + archived app + raw source packs | **A−** | The single highest-value compliance asset — Ally's guardrail content (D-14); wrapped in cruft |
| 4 | `Loan_Factory_Marketing_Training_Asset_Package.zip` | `marketing_training/` | 28 files: 5 guides (~1,100 md lines), 5 PDF twins, 13 PNGs | **B+** | Value is *evidence*: the only screen-by-screen proof of the live Loan Factory platform |
| 5 | `LoanFactory_Social_Media_Assistant_FINAL_REVIEWED.zip` | `social_media_assistant/` | 16 files, ~1,000 lines; **70+ finished content artifacts** | **A−** | Ready-made Ally marketing skill: rules + 30 reels, 20 carousels, 20 stories, 20 prompts; English-only |
| 6 | `Loan_Factory_Team_Marketing_System_Knowledge_Pack.zip` | `team_marketing_knowledge/` | 7 md files, 334 lines | **C+** | Aspirational strategy notes; origin of the "Ally" name; cite as *planned*, never as *exists* |
| 7 | `CRM (offline) (3).html` | `crm_html_extracted/` | 649 KB; 10 screens, 9 modals, 1 component, ~35 email copies | **D** | Concept prototype only; **REPLACE** — interaction ideas salvaged, zero code ([[Current_State_Audit]]) |

Grading key: A = load-bearing, production-adjacent, minimal rework · B = valuable with curation · C = context only · D = reference artifact, do not build on.

## 2. Pack 1 — Mortgage Communication Framework (Grade A)

**Contents:** GitHub-style repo (bilingual EN/VI README) with 14 template files (135 emails, EMT-001–135, every one with 26-field YAML front matter), an automation layer (`17_Workflow_Triggers`, `20_CRM_Automation_Map`, `23_SMS_Cross_Reference`), a metadata/search layer (`18_Search_Index`, `19_AI_Metadata`, `28_Statistics`), and style/compliance/multilingual/process docs (16, 21, 22, 24–27, 29 + `documentation/`, `languages/`, `examples/`).

**Verified counts:** 135 templates exactly (grep of `^id: EMT-`); 17-token merge-field vocabulary (`{{BorrowerName}}` ×472 down to `{{CompanyNMLS}}` ×6) — a de facto data-model contract for [[Data_Model]]; automation policy split Fully 44 / Semi 71 / Manual-Only 20; audience split Borrower 123 / Realtor 10.

**Reusable:** everything. Templates load into a `templates` table + pgvector index near-verbatim; the trigger catalog (~60 named source-system events) becomes the Automations event taxonomy; the 3-tier automation policy maps directly onto Ally behavior tiers; `16_Compliance_and_Usage_Guide`'s block/revise list and the partner privacy matrix become deterministic pre-send lint rules; the SMS cross-reference (3 archetypes + blocked-topics list) seeds channel policy; the 5-language lifecycle modules + terminology table seed multilingual.

**Discard / fix before use:** stale "65 templates" counts in files 25 and 29; the `metadata/18|19|28` byte-identical duplicates (keep the `email-templates/` copies as canonical); the auto-generated filler triggers on EMT-066–135 ("DSCR Submitted needed" is not a real event — real triggers must be authored); the `semi-automated` *tags* on EMT-060–065, which contradict their Manual-Only/Never-Automate policy (treat the policy column as authoritative — a compliance hazard if tags ever feed a filter); the language column in `18_Search_Index` (implies 135×4 translations; reality is 5 body modules per language).

**Known gaps:** no templates for lifecycle stages 3, 4, 7, or 8; automation docs stop at EMT-065; nothing is compliance-final (`compliance_reviewed` uniformly says final approval required); TERA+ referenced in the pack's own roadmap — provenance context only, since TERA+ materials serve this build purely as persona and QA source material.

## 3. Pack 2 — AI Personas / TERA+ Usability Framework (Grade A−)

**Contents:** 18 files: README, 8 English persona files (LO ×6, Processor ×4, Coordinator ×4, Internal Business ×14, Borrower ×15, Real-Estate Agent ×12), 4 multilingual persona files (VI/ZH/ES-CO/RU, 14 each), 4 scenario files (217 matrix rows + 13 stress + 14 edge + 6 high-volume + 9 AI-assisted = 259), the usability scorecard, and a Codex→Claude handoff receipt.

**Reusable (~90% with terminology remap):** the 55 English personas → [[User_Personas]]; ~200 of 259 scenarios → [[QA_Plan]] after remapping TERA labels to the 20-stage lifecycle; **`05_Usability_Scorecard` nearly verbatim** as the UX acceptance instrument — its NTS (not-tech-savvy) thresholds are the "toddler simple" standard made falsifiable, its 12 critical-fail conditions are design mandates, its 20 risk tags are the defect taxonomy; **SCN-AI-001..009 are Ally's acceptance-test suite, pre-written**; data-safety test rules transfer wholesale.

**Discard:** all TERA+ scaffolding (ID crosswalk to WF-/OBJ-/MOD- IDs — the referenced ID Registry and traceability matrices are *not in the pack*, so every mapping dangles); the handoff file (keep only as provenance); ~50–60 LOS-adjacent scenarios (1003/pricing/AUS/disclosures) — loan-origination work surfaces are permanently outside the CRM's boundary, so these are discarded, not deferred.

**Fix before use:** Vietnamese (file 13) and Colombian Spanish (file 15) are written **without diacritics/accents** — content is good, text is unpublishable; restore orthography first. **Gaps:** no branch-leader or agent-relationship-manager personas (2 of CANON's 8 users), zero multilingual *borrower* personas; all AI-authored — treat as hypotheses to validate with real LF staff, not field research.

**Landscape signal:** the README states TERA is "treated as Loan Factory's LOS, POS, and CRM system of record," with its own Product OS, decision logs, and a 14-label status model that conflicts with our 20 stages. For this build that context matters only as translation guidance: TERA+ materials are consumed strictly as persona, usability-scorecard, and QA source material, and every TERA label must be remapped to the 20-stage lifecycle at import ([[QA_Plan]]).

## 4. Pack 3 — Marketing Content OS (Grade A−)

**Contents:** a git repo (5 commits, Jun 30–Jul 8 2026, Jeremy authored) that pivoted from a Next.js app to a **markdown-first marketing AI knowledge kit**: root guidance (README/CLAUDE/AGENTS), `docs/` ×12 (incl. the 16-content-family / 3-tier-risk `Marketing_Content_System.md` and `Compliance_Rules.md`), **`compliance/` ×6 — THE Ally guardrail corpus** (do-not-say list with fair-lending section, exact disclosure strings, state rules AZ/NJ/RI/MA, Best Price Guarantee rules incl. hard Washington exclusion, AI-tool safety, pre-publish checklist), `prompts/` ×13, `templates/` ×8 briefs, `gpts/` ×4, `sop/` ×2, `agent_tasks/` ×7, `examples/` ×5, `source_inventory/` ×4, plus `_archive/app-prototype/` (Next.js 16 + TS, ~3,100 lines) and `tmp/source-packs/` raw duplicates.

**Reusable:** the entire compliance corpus as Ally guardrail knowledge ([[Mortgage_Compliance]], [[AI_Product_Architecture]]); `prompts/system/compliance_reviewer.md` is essentially a ready Ally compliance-review agent; the 16 content families, risk model, review roles/decisions, brief schemas, batch SOP, and escalation ticket (with SLA) are the Marketing module functional spec; from the archived prototype: `src/lib/compliance.ts` (208 lines, **tested**) as the reference deterministic compliance-lint pass, `types.ts`/`Data_Model.md` entities as Marketing data-model seed, `mock-data.ts` as demo fixtures, and a Loan Factory logo PNG.

**Discard:** `node_modules/`, `.next/`, `.playwright-cli/`, build debris (all gitignored cruft); `tmp/source-packs/` (duplicates of packs 5 and 6 — the dedicated discovery folders are canonical); the archived app as a product path (D-14 — knowledge content only, prototype not revived).

**Cautions:** state rules cover only 4 states and self-describe as changeable — must be a maintainable data table, not hardcoded (verify AZ license `BK-2005457` before use); the regex compliance engine is naive (flags the bare word "rates") — first-pass layer only, AI review on top; the kit is English-only; and its "do not build software" rule is a repo-scoped guardrail for the kit, **not** a mandate against building the CRM.

## 5. Pack 4 — Marketing Training Asset Package (Grade B+)

**Contents:** 5 training guides (Facebook Ads, Google Ads/GA4, Visitor Audiences, Lead Funnels & Widgets, Website Settings & QM Pricer) + 5 PDF twins + 13 annotated screenshots + 3 duplicate source files + README/MANIFEST.

**Real value = integration evidence.** These are the only documents in discovery that describe the *actual live Loan Factory platform* screen by screen. Proven facts for [[Integration_Map]]:

| Proven surface | Key facts |
|---|---|
| Facebook Ads tool (`loanfactory.com/facebook_ads`) | Meta OAuth, template gallery, budget/targeting; **leads auto-flow into the LF pipeline tagged "Automatically Created"** with Default Loan Officer routing |
| Per-LO Loan Factory websites | Custom domain/slug, bio/video, custom scripts (GA4 installable), Best Price Guarantee opt-in |
| QM Pricer (consumer quote engine) | Configurable disclaimers, default quote values, rate display rules; result buttons **create alert / apply / qualify / view fees** — distinct lead intents to model, "create alert" maps to stage 19 Refinance Opportunity |
| Lead Funnels & Widgets SDK | JS SDK + **13 named widget types incl. a 1003 Application Widget and Rate table**, per-widget lead-source attribution |
| LF escalation desk + IT support | `loanfactory.com/my_escalation_desk?...`; `it.dept@loanfactory.com` |

**Compliance-critical fact (verbatim from guide 05):** "Jeremy's business uses lender-paid compensation only" — a system configuration default, logged in [[Mortgage_Compliance]].

**Reusable:** guides 01/02/04/05 as integration requirements + seed content for a future in-app LO help center ("101–601" curriculum taxonomy); the "AI Advantage" sections as ready Ally use-case examples. **Discard:** guide 03 (28 thin lines of generic Google steps — keep only the fact that LOs retarget `loanfactory.com/quote` visitors), `source_markdown/` duplicates, PDF twins, quiz/video-script sections. **Caution:** all paths dated Dec 2025–Jan 2026, UI-level only — *proven to exist*, not stable API contracts; no API documentation exists anywhere in this pack.

## 6. Pack 5 — Social Media Assistant (Grade A−)

**Contents:** 15 content folders + README, explicitly written to train an AI content assistant. Rules layer (README global rules, `brand.md`, `compliance.md`, `system.md` cadence/content-mix) + finished library (**30 reel scripts, 20 carousel frameworks, 20 story sequences, 5 emails, ~10 DM scripts**) + feature-grade specs (`cta.md` keyword-CTA system — PLAN/SECOND LOOK/INVEST/PARTNER…; `prompts.md` — 20 parameterized prompts incl. a Compliance Check and Final Publishing Review).

**Reusable:** nearly everything. Rules files → Ally marketing system-prompt scaffolding; 70+ artifacts → the Marketing module's seeded content library; `cta.md` + `prompts.md` → concrete Phase 2 feature specs ("comment PLAN → Ally sends checklist + creates lead" is a keyword-triggered automation, [[Automation_Catalog]]); `buyer.md`'s 5-question DM intake maps to lead-qualification fields; `dm.md`'s compliant rate-deflection script → Conversations reply drafts.

**Discard/minor:** nothing is junk; `hashtags.md` is lowest-value and perishable; folder-name typo "DSRC" is cosmetic. **Gaps/cautions:** English-only (multilingual variants must be produced, not assumed); assumes manual posting — proves no social-publishing API integration; its short compliance footer must be layered with NMLS #320841 + Equal Housing per CANON (the file itself acknowledges this).

## 7. Pack 6 — Team Marketing Knowledge (Grade C+)

**Contents:** 7 strategy notes (334 lines): project overview (Thuan Nguyen's multilingual-teams vision), team structure, marketing infrastructure, **`03_Automation_and_Ally.md` — the origin of the "Ally" name** and a 10-workflow automation wishlist + 1-to-8 content repurposing pipeline, podcast/YouTube strategy, onboarding workflow, and a duplicate slide-deck outline.

**Reusable:** `01_Team_Structure` (team entity, team-leader role, team-level branding/approvals) as requirements input for the Team module; `03_Automation_and_Ally` as the Automations-module workflow backlog and the naming lineage behind D-04; `05_Onboarding` as a team-launch workflow sketch. **Discard:** `04` (thin), `06` (pure duplicate). **Hard caution:** everything is written in "should/could" language — *nothing here proves an existing system*. Cite as planned/desired only. Note the scope difference: here "Ally" = marketing automation engine; CANON deliberately broadens it to the whole AI layer — extension, not conflict.

## 8. Asset 7 — The HTML prototype (Grade D)

Fully diagnosed in [[Current_State_Audit]]: an offline email-marketing micro-tool in a proprietary runtime, one 938-line god class, fake AI, fake integrations, no backend/auth/persistence, wrong scope, wrong design language. **Verdict REPLACE (D-01)** — zero code salvage; ~10 interaction ideas salvaged (one-tap AI suggestion cards, plain-language trigger cards, trigger→audience mapping, pre-send health checks with fixes, quota meter with pause semantics, view-as-LO, dynamic/static/combined segments). Its ~35 email copies are a tone cross-check only — the 135-template framework supersedes them. Kept read-only as a reference artifact.

## 9. Duplicates and contradictions across packs

| Issue | Where | Resolution |
|---|---|---|
| Social Media Assistant + Team Marketing packs duplicated inside content-OS `tmp/source-packs/` (SMA present **twice** there — up to 4 copies corpus-wide) | Packs 3, 5, 6 | Canonical = the dedicated `_product_discovery/` folders; ignore all `tmp/` copies |
| Brand/compliance rules exist in ≥3 places (content-OS `compliance/` + docs, SMA `brand.md`/`compliance.md`, training-pack README notes) | Packs 3, 4, 5 | Same voice, **no factual contradictions found**. Merge into one canonical guardrail source: content-OS rules as base, fold in SMA's specialty-program (DSCR/non-QM) guardrails and short footer |
| Two email libraries (135-template framework vs SMA's 5 follow-up emails) | Packs 1, 5 | Framework is canonical (D-07); map SMA's 5 as social-follow-up variants — never fork a second library |
| Template automation *tags* vs *policy* on EMT-060–065 (sensitive templates tagged `semi-automated` but policy Manual-Only/Never-Automate) | Pack 1 internal | Policy column authoritative; tags must never feed automation filters |
| Stale counts ("65 templates") | Pack 1 files 25, 29 | Trust grep-verified 135; fix at import |
| TERA 14-stage status model vs locked 20-stage lifecycle | Pack 2 vs CANON | Remap at QA import — TERA+ materials are persona/QA source material only, so the crosswalk exists solely to translate scenario labels into the 20-stage lifecycle ([[QA_Plan]]) |
| "Ally" scope (marketing engine vs whole AI layer) | Pack 6 vs CANON | Deliberate extension; do not cite Pack 6 as defining Ally's full scope |
| Terminology drift: live platform says "Marketing Features / Leads pipeline / Default Loan Officer" vs our "Marketing / Pipeline / People" | Pack 4 vs CANON | Bridge old terms in migration/onboarding copy |
| Missing-diacritics files (VI, ES-CO personas) vs the multilingual-first claim | Pack 2 | Restore orthography before any stakeholder-facing use |
| Two *different* prototypes exist (coral/beige CRM HTML vs archived marketing-ops Next.js app) | Assets 7 and 3 | Both shelved; do not conflate — the Next.js one has salvageable *logic references* (compliance.ts), the HTML one has *interaction ideas* only |

Safety check: no secrets, no borrower PII, and no non-compliant claims found in any pack ([[Build_Log]]). The only integration-claim hazard is inside the HTML prototype (fake "Encompass ✓ Connected").

## 10. Master map — what feeds what

| Asset → | Product module(s) | Blueprint document(s) | Phase |
|---|---|---|---|
| 135 templates + YAML metadata (Pack 1) | Conversations, Marketing — template store, "next best message" | [[Data_Model]] · [[Screen_Specifications]] | 1–2 |
| 17-token merge-field vocabulary (Pack 1) | People / Pipeline / Team record joins | [[Data_Model]] | 1 |
| Trigger catalog + automation policies + stop conditions (Pack 1) | Automations engine; Ally behavior tiers | [[Automation_Catalog]] · [[AI_Product_Architecture]] | 2 |
| SMS cross-reference archetypes + blocked topics (Pack 1) | Conversations SMS channel policy | [[Automation_Catalog]] · [[Mortgage_Compliance]] | 2 |
| Multilingual modules + translation standards (Pack 1) | Per-contact language, template variants | [[Data_Model]] · [[Screen_Specifications]] | 1 (schema), 2 (content) |
| 55 EN personas + gap list (Pack 2) | — | [[User_Personas]] | 0 |
| 259 scenarios, scorecard, NTS thresholds, risk tags (Pack 2) | Ship gates for every screen | [[QA_Plan]] · [[Design_System]] | 0–2 |
| SCN-AI-001..009 (Pack 2) | Ally acceptance testing | [[QA_Plan]] · [[AI_Product_Architecture]] | 1–2 |
| Compliance corpus: do-not-say, disclosures, state rules, BPG rules, pre-publish checklist (Pack 3) | Ally guardrails; content approval state machine | [[Mortgage_Compliance]] · [[AI_Product_Architecture]] | 1 |
| 16 content families, risk tiers, review roles, briefs, batch SOP, escalation tickets (Pack 3) | Marketing module functional spec | [[Screen_Specifications]] · [[PRD]] | 2 |
| System/content prompts + compliance-reviewer prompt (Packs 3, 5) | Ally generation + review agents | [[AI_Product_Architecture]] | 1–2 |
| `compliance.ts` reference engine + typed entities (Pack 3 archive) | Deterministic pre-send lint; Marketing data model | [[Technical_Architecture]] · [[Data_Model]] | 1–2 |
| Proven LF platform surfaces: FB Ads lead stream, widgets SDK, QM Pricer, per-LO websites (Pack 4) | Lead ingestion, source attribution model, rate-alert leads | [[Integration_Map]] · [[Data_Model]] | 2+ |
| Lender-paid-compensation-only fact (Pack 4) | System configuration default | [[Mortgage_Compliance]] | 1 |
| 101–601 curriculum + AI Advantage examples (Pack 4) | Future in-app LO help center; Ally use cases | [[Implementation_Roadmap]] | 3+ |
| 70+ content artifacts + keyword-CTA system (Pack 5) | Marketing seeded library; keyword-DM automations | [[Screen_Specifications]] · [[Automation_Catalog]] | 2 |
| DM intake questions + rate-deflection scripts (Pack 5) | Lead qualification fields; Conversations reply drafts | [[Data_Model]] · [[Screen_Specifications]] | 1–2 |
| Team structure + Ally workflow backlog (Pack 6) | Team module; Automations backlog | [[Screen_Specifications]] · [[Automation_Catalog]] | 2 |
| Prototype interaction ideas (Asset 7) | Today, Automations, Team, People patterns | [[Current_State_Audit]] §3 · [[Design_System]] | 1–2 |
| TERA+ landscape evidence (Packs 1, 2) | — (persona/QA source context only) | [[User_Personas]] · [[QA_Plan]] | 0 |

Related: [[Current_State_Audit]] · [[Build_Log]] · [[Decisions]] · [[PRD]] · [[QA_Plan]] · [[Integration_Map]] · [[Mortgage_Compliance]] · [[Obsidian_Index]]
