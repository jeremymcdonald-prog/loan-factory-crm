# Mortgage Communication Framework

Production-ready communication templates for AI-powered mortgage platforms.

![Status Active](https://img.shields.io/badge/Status-Active-brightgreen)
![Templates 135](https://img.shields.io/badge/Templates-135-blue)
![Language English](https://img.shields.io/badge/Language-English-lightgrey)
![Vietnamese Ready](https://img.shields.io/badge/Vietnamese-Ready-orange)
![LoanFactory Internal](https://img.shields.io/badge/LoanFactory-Internal-purple)

## Overview

This repository packages the Loan Factory mortgage email template library into an upload-ready framework for product, design, development, QA, operations, training, and leadership teams.

It includes 135 English master email templates, AI metadata, workflow mapping guidance, search indexes, CRM integration guidance, multilingual planning notes, and borrower communication standards. The framework is designed to support AI-assisted mortgage platforms without allowing unsupported promises, unsafe automation, or borrower-facing communication without human review.

## Vietnamese Overview

Kho lưu trữ này cung cấp bộ mẫu giao tiếp thế chấp được chuẩn hóa cho ứng dụng AI, hệ thống CRM, nền tảng LOS/POS, và tự động hóa nội bộ. Mục tiêu là giúp đội ngũ Loan Factory giao tiếp nhất quán hơn, nhanh hơn, rõ ràng hơn, và cải thiện trải nghiệm của người vay trong toàn bộ quy trình vay mua nhà.

Các mẫu tiếng Anh là nguồn chính. Hỗ trợ tiếng Việt được định hướng qua chỉ mục đa ngôn ngữ và tiêu chuẩn dịch thuật, nhưng mọi nội dung gửi thật cho khách hàng cần được con người kiểm tra trước khi sử dụng.

## Quick Navigation

- [Overview](#overview)
- [Vietnamese Overview](#vietnamese-overview)
- [Repository Structure](#repository-structure)
- [Template Library Statistics](#template-library-statistics)
- [How Developers Should Use This](#how-developers-should-use-this)
- [How AI Assistants Should Use This](#how-ai-assistants-should-use-this)
- [Data Safety](#data-safety)
- [Compliance Notes](#compliance-notes)
- [Folder Map](#folder-map)
- [Template ID Range](#template-id-range)
- [Metadata and Search](#metadata-and-search)
- [Future Language Expansion](#future-language-expansion)
- [Recommended GitHub Upload Steps](#recommended-github-upload-steps)

## Repository Structure

| Path | Purpose |
|---|---|
| [00_Quick_Start.md](00_Quick_Start.md) | First-read setup and usage guide. |
| [email-templates/](email-templates/) | Source email template library and original supporting files. |
| [metadata/](metadata/) | Copied search, AI metadata, and library statistics files for easier retrieval. |
| [documentation/](documentation/) | Concise workflow, style, naming, CRM, and translation guidance. |
| [languages/](languages/) | Language source-of-truth notes for English and Vietnamese. |
| [examples/](examples/) | Safe examples for AI search, CRM use, and RAG retrieval patterns. |

## Template Library Statistics

| Metric | Count |
|---|---:|
| English master templates | 135 |
| Original baseline templates | 65 |
| Specialty templates added | 70 |
| Template ID range | EMT-001 through EMT-135 |
| Specialty ID range | EMT-066 through EMT-135 |
| Supported repository languages | 5 |
| Primary source language | English |

## How Developers Should Use This

Use [email-templates/](email-templates/) as the source library. Use [metadata/18_Search_Index.md](metadata/18_Search_Index.md) and [metadata/19_AI_Metadata.md](metadata/19_AI_Metadata.md) for search, retrieval, and template recommendation. Use [documentation/](documentation/) for implementation guidance and guardrails.

Developers should preserve template IDs, YAML metadata, required placeholders, compliance notes, and local links. Any production implementation should require a human approval step before borrower-facing or partner-facing messages are sent.

## How AI Assistants Should Use This

AI assistants should retrieve templates by exact `EMT-*` ID when available. If no ID is provided, match by loan stage, audience, borrower situation, loan product, workflow trigger, language need, and compliance sensitivity.

AI assistants may suggest templates, summarize compliance notes, and identify required placeholders. They should not auto-send messages, remove compliance language, promise approval, promise timing, quote final pricing, or convert a conditional statement into a guarantee.

## Data Safety

Use fake or demo borrower data only when testing. Do not place real borrower PII, Social Security numbers, tax IDs, bank account numbers, credit details, income documents, or private partner contact details in examples, prompts, tests, or public commits.

Do not store secrets, API keys, tokens, credentials, webhook URLs, or production system identifiers in this repository.

## Compliance Notes

These templates are production-oriented drafts, not legal advice. Compliance-sensitive templates must be reviewed before live use.

Borrower-facing and marketing-oriented templates use plain language and guardrails against unsupported promises. They should not guarantee approval, closing, rate, payment, program eligibility, cash to close, score improvement, savings, or underwriting results.

Use the compliance line where appropriate:

Equal Housing Opportunity. Loan Factory, Inc. NMLS 320841. Jeremy McDonald NMLS 1195266.

## Folder Map

```text
mortgage-communication-framework/
  README.md
  00_Quick_Start.md
  email-templates/
  metadata/
  documentation/
  languages/
  examples/
```

## Template ID Range

| Range | Coverage |
|---|---|
| EMT-001 to EMT-065 | Original mortgage lifecycle email templates. |
| EMT-066 to EMT-135 | Specialty mortgage templates including ITIN, Foreign National, DSCR, construction, manufactured home, renovation, reverse mortgage, credit rescore, closing, and post-closing follow-up. |

## Metadata and Search

The metadata files make the framework easier to use in AI retrieval, QA, and internal tools:

- [metadata/18_Search_Index.md](metadata/18_Search_Index.md)
- [metadata/19_AI_Metadata.md](metadata/19_AI_Metadata.md)
- [metadata/28_Email_Library_Statistics.md](metadata/28_Email_Library_Statistics.md)

Each template includes YAML metadata for template ID, title, category, loan stage, audience, loan programs, language, purpose, workflow trigger, automation readiness, required placeholders, related templates, and tags.

## Future Language Expansion

English templates are the master source. Vietnamese, Simplified Chinese, Colombian Spanish, and Russian support are indexed through the multilingual template index in [email-templates/15_Multilingual_Email_Template_Index.md](email-templates/15_Multilingual_Email_Template_Index.md).

Full translated template sets should be created and reviewed before live multilingual sending.

## Recommended GitHub Upload Steps

1. Create a new GitHub repository named `mortgage-communication-framework`.
2. Use this folder as the repository root.
3. Confirm `README.md`, `00_Quick_Start.md`, and all folders are present.
4. Confirm no real borrower data, secrets, API keys, tokens, or credentials are included.
5. Upload or commit the folder manually.
6. Run repository link and markdown checks after upload.
