# RAG Examples

## Purpose

These examples show safe retrieval-augmented generation patterns for internal tools and AI assistants. They are guidance only.

## Recommended Retrieval Order

1. Exact template ID.
2. Loan stage.
3. Audience.
4. Borrower situation.
5. Loan product.
6. Workflow trigger.
7. Language need.
8. Compliance sensitivity.

## Example Retrieval Inputs

| Retrieval Input | Metadata Fields To Match | Review Level |
|---|---|---|
| `EMT-083` | `id` | Human review because credit rescore is sensitive. |
| `loan_stage: Closing`, `topic: wire fraud` | `loan_stage`, `search_keywords`, `tags` | Human review before sending. |
| `loan_program: DSCR`, `workflow_trigger: submitted to underwriting` | `loan_programs`, `workflow_trigger` | Human review recommended. |
| `language: Vietnamese`, `stage: Document Collection` | `language_availability`, multilingual index | Use English master plus language standards. Human translation review required. |
| `audience: Realtor`, `topic: condition item` | `audience`, `purpose`, `tags` | Protect borrower privacy before sending. |

## Safe Output Pattern

When an AI assistant recommends a template, it should return:

- Template ID.
- Template name.
- Source file.
- Why it matched.
- Required placeholders.
- Compliance note.
- Human review requirement.

The assistant should not invent final loan facts, final costs, final approval status, final closing status, or borrower-specific private details.
