# Quick Start

## Start Here

Open [README.md](README.md) first. It explains the purpose, folder map, template count, safety rules, and upload steps.

## Source Library

Use [email-templates/](email-templates/) as the source library. The templates in files `01` through `14` are the English master templates. The supporting files in that folder preserve the original library documentation, multilingual index, search index, metadata, automation guidance, and statistics.

## Metadata

Use [metadata/](metadata/) for search and AI retrieval:

- [metadata/18_Search_Index.md](metadata/18_Search_Index.md)
- [metadata/19_AI_Metadata.md](metadata/19_AI_Metadata.md)
- [metadata/28_Email_Library_Statistics.md](metadata/28_Email_Library_Statistics.md)

## Documentation

Use [documentation/](documentation/) for workflow standards, style rules, naming conventions, CRM guidance, and translation standards.

## Examples

Use [examples/](examples/) for safe implementation patterns. The examples show how to retrieve templates by template ID, loan stage, borrower situation, loan product, workflow trigger, language need, and compliance sensitivity.

## Human Review Required

Never use templates without human review when the message is compliance sensitive.

Never auto-send borrower or partner communications without approval.

Never remove required placeholders, compliance notes, or conditional language.

Never use real borrower PII, secrets, API keys, tokens, or credentials in tests or examples.
