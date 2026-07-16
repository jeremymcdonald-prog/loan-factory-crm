# TERA+ AI Personas & User Experience Testing Framework

![Status: Active](https://img.shields.io/badge/Status-Active-brightgreen)
![Personas: 111](https://img.shields.io/badge/Personas-111-blue)
![Scenarios: 259](https://img.shields.io/badge/Scenarios-259-purple)
![Languages: 5](https://img.shields.io/badge/Languages-5-orange)
![LoanFactory: Internal](https://img.shields.io/badge/LoanFactory-Internal-black)

This repository contains the official TERA+ persona and usability testing framework for evaluating whether the platform is easy enough for every type of mortgage user, from highly technical power users to users who struggle with technology.

## Languages

- English
- Tiếng Việt
- 简体中文
- Español Colombia
- Русский

English baseline personas remain the source framework. The multilingual expansion adds Vietnamese, simplified Mandarin Chinese, Colombian Spanish, and Russian persona coverage.

## Table Of Contents

- [Purpose](#purpose)
- [Vietnamese Introduction](#vietnamese-introduction)
- [Quick Navigation](#quick-navigation)
- [Why This Matters](#why-this-matters)
- [How To Use This Framework](#how-to-use-this-framework)
- [Data Safety](#data-safety)
- [Source Alignment](#source-alignment)
- [Functional Product OS IDs](#functional-product-os-ids)
- [Official ID Crosswalk](#official-id-crosswalk)
- [Supplemental Test Coverage IDs](#supplemental-test-coverage-ids)
- [Files](#files)
- [Persona Count](#persona-count)
- [Multilingual Persona Expansion](#multilingual-persona-expansion)
- [Scenario Count](#scenario-count)
- [Testing Rules](#testing-rules)
- [Recommended Test Method](#recommended-test-method)

## Purpose

This framework defines user testing personas, task scenarios, and a usability scorecard for evaluating whether the new TERA+ platform is easy enough for mortgage users with very different experience levels and technology comfort.

The goal is to help product, design, development, QA, training, operations, and leadership test whether TERA+ is both loan officer friendly and operations friendly.

The framework currently includes:

| Framework fact | Count |
|---|---:|
| Total personas | 111 |
| Total scenarios | 259 |
| Total languages | 5 |
| Framework files | 18 |
| Multilingual personas added | 56 |

## Vietnamese Introduction

Khung persona và kiểm thử trải nghiệm người dùng này giúp Loan Factory đánh giá xem TERA+ có đủ dễ dùng cho nhiều nhóm người dùng thế chấp khác nhau hay không, bao gồm loan officer, processor, loan coordinator, borrower/customer, real estate agent, và các nhóm vận hành nội bộ.

Mục tiêu là kiểm thử bằng dữ liệu giả và kịch bản demo, không dùng thông tin thật của borrower, nhân viên, đối tác, pricing, AUS, lender, hoặc dữ liệu production. Các persona tiếng Việt và các persona đa ngôn ngữ khác không chỉ là bản dịch; chúng được dùng để kiểm tra độ rõ ràng của ngôn ngữ, thuật ngữ mortgage, quy trình làm việc, quyền truy cập theo vai trò, cảnh báo, tài liệu, điều kiện, trạng thái hồ sơ, và mức độ người dùng có thể tự tin hoàn thành công việc trong TERA+.

## Quick Navigation

| Section | Link |
|---|---|
| Purpose | [Purpose](#purpose) |
| Vietnamese Introduction | [Vietnamese Introduction](#vietnamese-introduction) |
| Source Alignment | [Source Alignment](#source-alignment) |
| Functional Product OS IDs | [Functional Product OS IDs](#functional-product-os-ids) |
| Official ID Crosswalk | [Official ID Crosswalk](#official-id-crosswalk) |
| Supplemental Test Coverage IDs | [Supplemental Test Coverage IDs](#supplemental-test-coverage-ids) |
| Files | [Files](#files) |
| Persona Count | [Persona Count](#persona-count) |
| Multilingual Persona Expansion | [Multilingual Persona Expansion](#multilingual-persona-expansion) |
| Scenario Count | [Scenario Count](#scenario-count) |
| Testing Rules | [Testing Rules](#testing-rules) |
| Recommended Test Method | [Recommended Test Method](#recommended-test-method) |

## Why This Matters

TERA+ needs to work for the full mortgage operating system, not only for users who already understand every workflow and acronym. This framework helps product, design, development, QA, training, operations, and leadership test whether real mortgage users can find the right work, understand status, avoid duplicate entry, respect role boundaries, recover from mistakes, and use AI support safely.

## How To Use This Framework

- Product and design teams should use the personas to test workflow clarity, terminology, confidence, and friction across technical and non-technical users.
- Developers should use the Product OS ID mappings to connect usability findings back to the correct workflows, objects, modules, rules, APIs, roles, and backlog items.
- QA should run scenario scripts against demo data and record time, clicks, errors, confidence, help needed, duplicate data entry, recovery, privacy risk, role-based access behavior, and AI review safety.
- Training and operations teams should compare results across experience levels, technology comfort levels, roles, and languages to identify coaching needs and workflow gaps.

## Data Safety

Use fake and demo data only. Do not use borrower PII, NPI, income documents, credit reports, bank statements, real AUS findings, real pricing, lender credentials, production TERA records, or private employee/team data.

This framework is for local, sandbox, demo, and QA use. It does not authorize live TERA writes, production access, external sends, borrower-visible actions, partner-visible actions, real disclosures, real document requests, or real notifications.

## Source Alignment

These documents follow the current workspace guardrails:

- TERA is treated as Loan Factory's LOS, POS, and CRM system of record.
- No live TERA writes, production access, external sends, borrower-visible actions, or partner-visible actions are created by this packet.
- Demo testing must use fake data only. Do not use borrower PII, NPI, income docs, credit reports, bank statements, real AUS findings, real pricing, or private team records.
- Status testing should align to the existing mortgage status labels where applicable: New Lead, Docs Requested, Application Pending, Scenario Review, Preapproved, Submitted, Conditional Approval, Conditions Pending, Appraisal Ordered, Appraisal Completed, Clear To Close Pending QC, Clear To Close, Closed, Dead.
- Document and condition testing should account for the existing operating concepts of Master Pipeline, Conditions Tracker, Document Audit, Tasks, Dashboard, and auditability.

## Functional Product OS IDs

These functional testing labels are used to connect persona testing back to the TERA+ Product OS. They are retained as human-readable testing labels and should be reconciled to the official permanent ID Registry when integrating usability findings.

> **Integrated into the Product OS - 2026-06-29 (DEC-006).** These functional testing labels are **now mapped to the official permanent ID Registry** (`../registries/ID_Registry.md`). They are retained as human-readable testing labels; the authoritative crosswalk lives in `../PERSONA_TRACEABILITY_MATRIX.md` and `../WORKFLOW_TO_PERSONA_MATRIX.md` and is summarized below. The framework is now an official subsystem of the Product OS and may be used as a formal acceptance/QA reference.

## Official ID Crosswalk

| Testing label | Official Product OS IDs |
|---|---|
| TERA-LEAD | WF-001, OBJ-001, MOD-006, RULE-017 |
| TERA-APP | WF-002, OBJ-004, MOD-003, RULE-018/020 |
| TERA-1003 | WF-003, OBJ-006, MOD-004, RULE-023/024 |
| TERA-PRICING | WF-004, OBJ-030, MOD-007, RULE-001..016 |
| TERA-AUS | WF-005, OBJ-035, MOD-004, API-005/006 |
| TERA-CONDITIONS | WF-007, OBJ-017, BUG-010 (-> BL-013) |
| TERA-DOCS | WF-008, OBJ-018/019, MOD-004 |
| TERA-COMMS | OBJ-020/021, MOD-015, WF-013, API-022 |
| TERA-STATUS | OBJ-031, RULE-017/018/019 (-> BL-017) |
| TERA-DASH | MOD-002, BUG-006 (-> BL-019) |
| TERA-NOTIF | MOD-015, OBJ-032, BUG-004 (-> BL-020) |
| TERA-RBAC | Doc 09, ROLE-*/PERM-*, RULE-034/035 (-> BL-018) |
| TERA-TEAM | ROLE-013, MOD-009 |
| TERA-COACH | ROLE-012 |
| TERA-UW | ROLE-007, WF-006, AI-004 |
| TERA-DISCLOSURES | ROLE-005, OBJ-019, WF-008, RULE-032 |
| TERA-MARKETING | MOD-010, AI-009, ROLE-018 |
| TERA-COMPLIANCE | MOD-014, ROLE-006, RULE-027..030 |
| TERA-BD | ROLE-019, MOD-009 |
| TERA-BORROWER | ROLE-017, MOD-004 (POS) |
| TERA-AGENT | ROLE-010 (internal specialist), MOD-008 (external party) |
| TERA-AI | AI-001..006, MOD-013, WF-006 |
| TERA-HIGHVOL | MOD-015 (scale), SUCCESS_METRICS (performance) |
| TERA-STRESS | TESTING_PRINCIPLES (stress/edge); files 09 / 10 |

> ROLE-018 (Marketing Team) and ROLE-019 (Business Development) were **appended** to the ID Registry as real roles surfaced by this framework (DEC-006). External real-estate-agent personas (REA-*) are an external-party type interacting via MOD-008 and borrower-facing surfaces.

| Product OS ID | Functional area | What it covers |
|---|---|---|
| TERA-LEAD | Lead creation | Creating, assigning, and saving a new lead using demo data. |
| TERA-APP | Application creation | Starting or converting a lead into an application record. |
| TERA-1003 | 1003 completion | Completing or reviewing the core 1003 data flow. |
| TERA-PRICING | Pricing | Finding or requesting pricing guidance without using real rate data. |
| TERA-AUS | AUS | Preparing, running, reviewing, or routing AUS-related tasks with demo data. |
| TERA-CONDITIONS | Conditions | Viewing, assigning, updating, and clearing conditions. |
| TERA-DOCS | Documents | Uploading, labeling, finding, and auditing documents. |
| TERA-COMMS | Notes and communication | Adding notes, internal comments, and reviewed communication drafts. |
| TERA-STATUS | Status updates | Updating loan or lead status using approved labels. |
| TERA-DASH | Dashboard | Finding priority work, pipeline health, and next actions. |
| TERA-NOTIF | Notifications | Receiving, understanding, and acting on alerts. |
| TERA-RBAC | Role based permissions | Confirming users can access only the right surfaces. |

## Supplemental Test Coverage IDs

These IDs are also temporary testing references. They describe persona-facing coverage areas, not technical implementation.

| Test coverage ID | Functional area | What it covers |
|---|---|---|
| TERA-TEAM | Team leadership | Team pipeline, coaching, stuck files, performance review, and escalation. |
| TERA-COACH | Corporate coaching | LO progress, training gaps, coaching plans, and AI recommendation review. |
| TERA-UW | Underwriting review | File review, AUS comparison, condition review, risk flags, and evidence trail. |
| TERA-DISCLOSURES | Disclosures | Disclosure requests, missing data, generated document review, and timing review. |
| TERA-MARKETING | Marketing review | Campaign review, LO content approval, lead source reporting, and automation review. |
| TERA-COMPLIANCE | Compliance review | Ad review, communication review, opt-out/DNC review, and audit trail review. |
| TERA-BD | Business development | Candidate review, LO success dashboard, retention risk, and production trends. |
| TERA-BORROWER | Borrower/customer experience | Application, document upload, mobile use, status check, conditions, and communication clarity. |
| TERA-AGENT | Real estate agent experience | Buyer status, pre-approval status, updates, contracts, closing timeline, and privacy-safe communication. |
| TERA-AI | AI assisted workflows | AI audit, DTI comparison, document review, summaries, drafts, coaching, compliance, and lead prioritization. |
| TERA-HIGHVOL | High volume workflows | Heavy queues, many active files, many requests, and multi-user prioritization. |
| TERA-STRESS | Stress and edge cases | Urgent, unusual, high-risk, or recovery-focused workflows. |

## Files

The repository contains 18 framework files.

| File | Purpose |
|---|---|
| [`01_Loan_Officer_Personas.md`](01_Loan_Officer_Personas.md) | Six loan officer personas across new, mid-level, veteran, tech savvy, and not tech savvy profiles. |
| [`02_Processor_Personas.md`](02_Processor_Personas.md) | Four processor personas across new, experienced, tech savvy, and not tech savvy profiles. |
| [`03_Loan_Coordinator_Personas.md`](03_Loan_Coordinator_Personas.md) | Four loan coordinator personas across new, experienced, tech savvy, and not tech savvy profiles. |
| [`04_Testing_Scenarios.md`](04_Testing_Scenarios.md) | Preserved original 168 core scenarios plus focused internal business, borrower, and real estate agent scenario groups. |
| [`05_Usability_Scorecard.md`](05_Usability_Scorecard.md) | Scorecard for measuring time, clicks, confidence, errors, help needed, duplicate entry, recovery, mobile usability, role/privacy safety, AI review safety, and overall friction. |
| [`06_Internal_Business_Personas.md`](06_Internal_Business_Personas.md) | Fourteen internal business personas across team leadership, corporate coaching, underwriting, disclosures, marketing, compliance, and business development. |
| [`07_Borrower_Customer_Personas.md`](07_Borrower_Customer_Personas.md) | Fifteen borrower/customer personas across common loan, complexity, urgency, mobile, and low-tech profiles. |
| [`08_Real_Estate_Agent_Personas.md`](08_Real_Estate_Agent_Personas.md) | Twelve real estate agent personas across agent role, production level, technology comfort, speed, communication, and complex-buyer profiles. |
| [`09_Stress_Test_Scenarios.md`](09_Stress_Test_Scenarios.md) | Stress tests for urgent, high-pressure mortgage events. |
| [`10_Edge_Case_Scenarios.md`](10_Edge_Case_Scenarios.md) | Edge cases for recovery, privacy, permissions, stale data, mobile interruption, AI conflict, and unusual workflow states. |
| [`11_High_Volume_Workflows.md`](11_High_Volume_Workflows.md) | High-volume workflow tests for LOs, processors, coordinators, team leaders, marketing, and business development. |
| [`12_AI_Assisted_Workflows.md`](12_AI_Assisted_Workflows.md) | AI-assisted workflow tests where every AI output must remain reviewable and source-checked. |
| [`13_Vietnamese_LO_Processor_LC_Personas.md`](13_Vietnamese_LO_Processor_LC_Personas.md) | Vietnamese multilingual personas for loan officers, processors, and loan coordinators. |
| [`14_Mandarin_Chinese_LO_Processor_LC_Personas.md`](14_Mandarin_Chinese_LO_Processor_LC_Personas.md) | Mandarin Chinese personas in simplified Chinese for loan officers, processors, and loan coordinators. |
| [`15_Colombian_Spanish_LO_Processor_LC_Personas.md`](15_Colombian_Spanish_LO_Processor_LC_Personas.md) | Latin American Spanish personas with Colombian phrasing for loan officers, processors, and loan coordinators. |
| [`16_Russian_LO_Processor_LC_Personas.md`](16_Russian_LO_Processor_LC_Personas.md) | Russian multilingual personas for loan officers, processors, and loan coordinators. |
| [`PERSONA_FRAMEWORK_HANDOFF.md`](PERSONA_FRAMEWORK_HANDOFF.md) | Handoff receipt for Codex-to-Claude transfer, source/destination paths, file list, counts, and integration note. |
| [`README.md`](README.md) | GitHub-facing overview, navigation, safety rules, Product OS mappings, counts, and usage guidance. |

## Persona Count

The English baseline framework contains 55 source personas. The multilingual expansion adds 56 personas for a total of 111 personas.

| Group | Count |
|---|---:|
| Loan Officers | 6 |
| Processors | 4 |
| Loan Coordinators | 4 |
| Internal Business Personas | 14 |
| Borrowers / Customers | 15 |
| Real Estate Agents | 12 |
| English baseline total | 55 |
| Multilingual personas added | 56 |
| Expanded total | 111 |

## Multilingual Persona Expansion

The English personas remain the baseline framework. Files `13` through `16` expand the framework with multilingual loan officer, processor, and loan coordinator personas for localization and usability testing.

These personas are not simple translations. They are intended to test language clarity, mortgage terminology comprehension, support needs, workflow comprehension, role boundaries, document upload behavior, status and notification clarity, pricing/AUS risk language, and AI review discipline for multilingual mortgage users.

| File | Language coverage | Personas added |
|---|---|---:|
| [`13_Vietnamese_LO_Processor_LC_Personas.md`](13_Vietnamese_LO_Processor_LC_Personas.md) | Vietnamese | 14 |
| [`14_Mandarin_Chinese_LO_Processor_LC_Personas.md`](14_Mandarin_Chinese_LO_Processor_LC_Personas.md) | Mandarin Chinese, simplified Chinese characters | 14 |
| [`15_Colombian_Spanish_LO_Processor_LC_Personas.md`](15_Colombian_Spanish_LO_Processor_LC_Personas.md) | Latin American Spanish, Colombian dialect | 14 |
| [`16_Russian_LO_Processor_LC_Personas.md`](16_Russian_LO_Processor_LC_Personas.md) | Russian | 14 |
| Multilingual expansion total | Four language sets | 56 |

Expanded persona total: 111 personas.

## Scenario Count

The original 168 scenarios were preserved. New scenarios were added as focused groups rather than a 12-scenario matrix for every new persona.

| Scenario source | Count |
|---|---:|
| Original LO / Processor / Loan Coordinator matrix | 168 |
| Internal business focused scenarios in `04_Testing_Scenarios.md` | 29 |
| Borrower focused scenarios in `04_Testing_Scenarios.md` | 10 |
| Real estate agent focused scenarios in `04_Testing_Scenarios.md` | 10 |
| Stress test scenarios | 13 |
| Edge case scenarios | 14 |
| High volume workflow tests | 6 |
| AI assisted workflow tests | 9 |
| Total scenarios | 259 |

## Testing Rules

- Use only fake names such as Test Borrower A, Test Co-Borrower B, Demo Realtor, Demo Employer, and Demo Property.
- Do not use real borrower addresses, Social Security numbers, dates of birth, bank details, income documents, credit reports, AUS findings, pricing sheets, or lender credentials.
- Do not send real emails, texts, portal invitations, notifications, disclosures, or document requests.
- When a task touches pricing, AUS, conditions, or status, measure whether the user understands that final terms and approval remain subject to underwriting and lender review.
- When a task touches role access, measure whether blocked actions are explained in plain language and route the user to the right next step.
- When a task touches real estate agent access, measure whether the update is useful without exposing sensitive borrower details.
- When a task touches AI assistance, measure whether the user treats AI output as a draft or review aid and verifies source evidence.

## Recommended Test Method

1. Give each tester one persona profile.
2. For LO, processor, and loan coordinator personas, run the matching 12 core scenarios.
3. For internal business, borrower, and real estate agent personas, run the focused scenario group that matches their role.
4. Add at least one stress, edge-case, high-volume, or AI-assisted scenario when the persona naturally touches that workflow.
5. Record results in the usability scorecard after each task.
6. Compare results across tech savvy and not tech savvy users within the same role or relationship type.
7. Prioritize fixes where not tech savvy users fail, need help, lose confidence, create duplicate work, misunderstand approval/pricing, or hit unclear role/privacy boundaries.
