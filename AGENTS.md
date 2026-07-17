<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
# Agent Guide — Loan Factory CRM

Instructions for any AI coding agent working in this repository.

## Product scope — the hard boundary

This is an **AI-powered mortgage CRM**, nothing more. Never describe or build it as an "operating system" or platform. It does not originate, underwrite, approve, price, disclose, process, or service loans. Do not add: borrower portals, loan applications, document upload/collection, underwriting or condition work-surfaces, pricing engines, credit pulls, disclosure generation, native mobile apps, or autonomous customer communication. Loan/milestone facts in the CRM are read-only visibility data (manual entry in v1; read-only external sync later).

If a request appears to cross this boundary, stop and flag it against `docs/goat_architect/Decisions.md` before writing code.

## Non-negotiable rules

1. **Ally prepares, the human approves.** No AI-generated communication reaches a borrower or partner without explicit human approval. Autonomy tiers T0–T3 are defined once in `docs/goat_architect/Automation_Catalog.md` §1 — never invent a new ladder.
2. **Compliance guardrails** in `docs/goat_architect/Mortgage_Compliance.md` are product requirements, not suggestions: no guaranteed-approval language, no unsupported rate claims, consent supremacy, unsubscribe handling, audit trails on every AI action.
3. **No secrets** in code, docs, or commits. `.env.example` carries variable names only.
4. **Tenancy and RLS from the first migration** — see `docs/goat_architect/Data_Model.md`.
5. **English + Vietnamese** are both first-class; don't hard-code English-only UI strings.
6. **Responsive web** (desktop + mobile browser). No native app code.

## Where truth lives

- Blueprint index: `docs/goat_architect/Obsidian_Index.md`
- What to build next: `docs/goat_architect/Next_Actions.md` and `Tasks.md`
- Decisions are append-only D-numbers in `Decisions.md`; open questions are Q-numbers in `Open_Issues.md`. If a build question isn't answered in the docs, log it in `Open_Issues.md` before improvising.
- Screen behavior: `docs/goat_architect/Screen_Specifications.md` (index over three part files, 21 screens).
- Templates: `source_assets/communication-framework/` (EMT-001–135); QA instrument: `source_assets/usability-framework/`.

## Definition of done

A screen ships only when it passes its usability threshold for not-tech-savvy users and none of the critical-fail conditions in `docs/goat_architect/QA_Plan.md` occur. Every feature needs its acceptance criteria from `Acceptance_Criteria.md` verified, and AI features must pass the eval golden sets before release.
