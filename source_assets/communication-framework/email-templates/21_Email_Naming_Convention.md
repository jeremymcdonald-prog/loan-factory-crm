# Email Naming Convention

## Table Of Contents

- [Purpose](#purpose)
- [Template ID Format](#template-id-format)
- [File Naming](#file-naming)
- [Template Heading Format](#template-heading-format)
- [Metadata Naming](#metadata-naming)
- [Subject Line Naming](#subject-line-naming)
- [Versioning Rules](#versioning-rules)

## Purpose

A stable naming convention lets product, QA, CRM, AI retrieval, compliance, and operations refer to the same email without ambiguity.

## Template ID Format

Use `EMT-###` for all master email templates. IDs are permanent once published.

- `EMT` = Email Master Template.
- `###` = three-digit sequence number.
- Do not reuse deleted IDs.
- Add new templates with the next available ID.

## File Naming

Use numbered markdown files with title case concepts joined by underscores:

`30_New_Template_Group.md`

Keep lifecycle files grouped by stage and do not rename existing files unless a migration map is created.

## Template Heading Format

Each template section should start with YAML front matter followed by the heading:

```md
---
id: EMT-066
title: "Example Template"
...
---

## EMT-066 Example Template
```

## Metadata Naming

Use lowercase snake case values when metadata will feed automation systems. Use human-readable title case for display fields.

## Subject Line Naming

Subject lines should be clear, short, and truthful. Do not put sensitive borrower details, credit information, income information, or private conditions in subject lines.

## Versioning Rules

- Minor wording edits keep the same ID.
- New audience, stage, or compliance intent should get a new ID.
- Multilingual variants should reference the same English master ID plus a locale code.
