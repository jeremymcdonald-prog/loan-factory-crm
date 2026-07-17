# Build_Log

Purpose: the factual record of what was done during Phase 0 planning (2026-07-16), so anyone can verify the process and reproduce the discovery. See [[Asset_Inventory]] for what was found and [[Decisions]] for what was concluded.

## Discovery run — 2026-07-16

### Sources located (LF-CRM workspace root)
| Source file | Size | Disposition |
|---|---|---|
| `CRM (offline) (3).html` | 649 KB | Inspected, rendered live, source extracted. Untouched. |
| `ai-personas-master.zip` | 92 KB | Extracted → `_product_discovery/ai_personas/` (18 files) |
| `mortgage-communication-framework-master.zip` | 156 KB | Extracted → `_product_discovery/communication_framework/` (46 files) |
| `loan-factory-marketing-content-os.zip` | 219 MB | Extracted → `_product_discovery/marketing_content_os/` (55,434 files incl. node_modules; knowledge content analyzed, dependencies ignored) |
| `Loan_Factory_Marketing_Training_Asset_Package.zip` | 7.8 MB | Extracted → `_product_discovery/marketing_training/` (28 files) |
| `LoanFactory_Social_Media_Assistant_FINAL_REVIEWED.zip` | 33 KB | Extracted → `_product_discovery/social_media_assistant/` (16 files) |
| `Loan_Factory_Team_Marketing_System_Knowledge_Pack.zip` | 4 KB | Extracted → `_product_discovery/team_marketing_knowledge/` (7 files) |

All archives extracted with no-overwrite mode into `_product_discovery/`; **no source file was modified or deleted.** No secret values were found in, or written to, any document.

### Prototype inspection method
1. Extracted the 4 script blocks from the bundled HTML; decoded 11 gzipped/base64 embedded assets (main app JS ~64 KB, library bundle ~132 KB, SearchSelect component, 7 woff2 fonts, static fallback page) → `_product_discovery/crm_html_extracted/`.
2. Served the workspace on a local HTTP server and rendered the app live in a browser; walked Home, Contacts, Campaigns, and Templates screens; captured findings in `_product_discovery/_working/UI_VISUAL_AUDIT_NOTES.md`.
3. Verdict recorded in [[Current_State_Audit]]: replace, salvage interaction ideas only.

### Analysis & authoring method
- Locked shared decisions in `_product_discovery/_working/CANON.md` before any authoring, so all documents agree on nav, lifecycle stages, phases, AI posture, and design direction.
- Ran a 4-phase multi-agent workflow: (1) five parallel deep-read analysts, one per asset domain, writing structured analyses to `_product_discovery/_analysis/`; (2) seventeen parallel specialist authors producing the blueprint documents; (3) a three-lens adversarial critique panel (product/UX · mortgage accuracy/compliance/security · executability/technical risk); (4) per-file revision agents applying every critical and major finding. Minor findings were logged to [[Open_Issues]].
- Screen specifications were authored in three parts and merged into the single [[Screen_Specifications]] document.

### Outputs
28 documents in `docs/goat_architect/` — the original 27-file plan plus [[Communication_Templates]], added when the template content layer needed its own contract document. Index in [[Obsidian_Index]].

## Scope correction — 2026-07-16 (post-acceptance, same day)

Jeremy accepted the blueprint as the baseline and issued a mandatory scope correction; every document was revised in place. What changed and why:

- **Product category.** The product is an **AI-powered mortgage CRM** — nothing more. All "operating system" framing was removed from the blueprint. (References to the external brand "Legends OS" as discovery source material remain valid provenance.)
- **Working name.** The codename "Foundry" was retired; the working name is **Loan Factory CRM** ([[Decisions]] D-12 updated). This entry is the historical record of the rename.
- **CRM-only boundary locked** ([[Decisions]] D-22). The CRM does not originate, underwrite, approve, price, disclose, process, or service loans, and is not an LOS, POS, borrower portal, loan application platform, underwriting platform, document collection system, pricing engine, mobile application suite, replacement for TERA+, or general Loan Factory platform. Communication and relationship work triggered by loan facts stays in scope; performing the loan work does not. Why: the blueprint had drifted toward platform scope; the correction re-anchors every document on the CRM purpose — leads, contacts, partners, stages, follow-up, campaigns, safe automation, AI-drafted communication with human approval.
- **Borrower portal removed from all phases**; borrowers are CRM contacts, not product users. **Native mobile apps removed**; responsive web on desktop and mobile browsers remains required ([[Decisions]] D-23).
- **TERA+ resolved without a conversation** ([[Decisions]] D-17; [[Open_Issues]] Q1 closed): its persona/scenario materials serve purely as source content for personas, usability scorecards, and QA — never an implementation dependency or positioning question.
- **20-stage lifecycle retained** strictly as CRM opportunity/relationship stage visibility: stage and milestone facts are team-entered in v1, with possible future **read-only** sync from external systems; the CRM never owns loan-of-record data. Work-surface features for conditions/disclosures/document collection were removed.
- **Official repository** named: `git@github.com:jeremymcdonald-prog/loan-factory-crm.git` ([[Decisions]] D-24).

Unchanged by the correction: AI as the embedded CRM AI layer and the "AI prepares, the human approves" contract, the T0–T3 safe-automation tiers, the 135 EMT templates, English + Vietnamese support, the 10-item navigation, the design system, the compliance guardrails, and the Q/D/T/C numbering systems.
