# Roadmap

## Table Of Contents

- [Purpose](#purpose)
- [Current State](#current-state)
- [Phase 1 Quality Hardening](#phase-1-quality-hardening)
- [Phase 2 Full Localization](#phase-2-full-localization)
- [Phase 3 CRM And TERA Integration](#phase-3-crm-and-tera-integration)
- [Phase 4 AI Retrieval And Governance](#phase-4-ai-retrieval-and-governance)
- [Future Template Expansion](#future-template-expansion)

## Purpose

This roadmap identifies the next improvements needed to make the email library production-grade across operations, compliance, multilingual support, CRM automation, and AI retrieval.

## Current State

- 65 English master templates.
- YAML metadata on every template.
- Search, AI, CRM, SMS, compliance, translation, and QA documentation.
- Lifecycle-stage localization modules for four non-English languages.

## Phase 1 Quality Hardening

- Human compliance review of all borrower and Realtor-facing templates.
- Operations review of trigger timing and stop conditions.
- CRM merge-field test with fake/demo records.
- Add physical address and unsubscribe conventions for marketing templates when production channel is known.

## Phase 2 Full Localization

- Create full per-template VI, ZH, ES-CO, and RU variants for the highest-volume 20 templates first.
- Run bilingual mortgage review for placeholders, subject lines, compliance meaning, and tone.
- Add locale-specific subject lines and SMS variants.

## Phase 3 CRM And TERA Integration

- Map workflow triggers to TERA+ Product OS IDs and CRM events.
- Add send eligibility rules for Manual Only, Semi Automated, and Fully Automated templates.
- Create sandbox automation tests with fake borrower and Realtor records only.

## Phase 4 AI Retrieval And Governance

- Convert metadata into a retrieval dataset or vector index.
- Add prompt rules requiring template ID, compliance note, and source trigger explanation.
- Log AI-suggested template usage for QA review.
- Add approval state and version history for every template.

## Future Template Expansion

- Recruiting templates.
- Product-specific paths for FHA, VA, USDA, jumbo, DSCR, bank statement, ITIN, foreign national, and reverse mortgage scenarios.
- Complaint and escalation templates.
- Co-borrower and non-borrowing spouse messaging.
- Servicing transfer and first-payment support templates.
