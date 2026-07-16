# Loan Factory CRM

**An AI-powered mortgage CRM** for loan officers and mortgage teams: leads, contacts, borrowers as CRM contacts, referral partners, opportunity stages, daily follow-up prioritization, notes and communication history, tasks, compliant campaigns, mortgage-specific templates, safe workflow automation, and AI-drafted communication that a human always approves.

## What this product is — and is not

Loan Factory CRM is a **CRM only**. It may display loan stages and relationship context, but it does **not** originate, underwrite, approve, price, disclose, process, or service loans. It is not an LOS, a POS, a borrower portal, a loan application platform, an underwriting platform, a document collection system, a pricing engine, or a mobile application suite. Loan facts shown in the CRM are visibility data — entered by the team in v1, read-only synced from external systems later.

## The AI layer: Ally

Ally is embedded across the product (not a chatbot bolted on). The contract is absolute: **Ally prepares, the human approves.** Nothing borrower-facing ever sends itself. Every AI action is tiered (T0 never-automated → T3 internal-only automation), gated, and audit-logged.

## Repository layout

| Path | Contents |
|---|---|
| `docs/goat_architect/` | The complete product blueprint — 28 documents covering vision, PRD, personas, the 20-stage CRM visibility model, information architecture, 21 screen specifications, AI architecture, data model, integrations, design system, security, mortgage compliance, roadmap, tasks, QA, and launch. Start at `Obsidian_Index.md`. |
| `source_assets/communication-framework/` | The 135 mortgage email templates (EMT-001–135) with metadata, merge fields, and compliance notes — the CRM's communication content layer. |
| `source_assets/usability-framework/` | 111 personas and 259 test scenarios plus the usability scorecard used as the QA acceptance instrument. |

Provenance for all source material is documented in `docs/goat_architect/Asset_Inventory.md`.

## Status

Planning baseline complete (2026-07-16). Next step: the Phase 1 walking skeleton — authentication, tenancy, People, Leads, opportunity records with mortgage stages, Tasks, notes/activity history, the Today command center, seeded demo data, responsive web layouts, mock-AI Ally recommendation cards, the approval workflow shell, and audit logging. See `docs/goat_architect/Next_Actions.md`.

## Working agreements

- English and Vietnamese are first-class languages.
- No secrets in the repo — copy `.env.example` to `.env.local` and fill values locally.
- AI contributors: read `AGENTS.md` / `CLAUDE.md` before making changes. The CRM-only scope boundary is non-negotiable.
