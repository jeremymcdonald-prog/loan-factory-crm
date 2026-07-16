# CRM Automation Map

## Purpose

This document provides safe, implementation-neutral CRM guidance. It does not create workflows, connect to a CRM, or define GoHighLevel, n8n, webhook, or production automation behavior.

## Automation Readiness

| Readiness | Meaning |
|---|---|
| Fully Automated | May be considered for automated sending only after source trigger, consent, merge fields, stop conditions, and compliance approval are verified. |
| Semi Automated | May be staged or suggested, but a human should review before sending. |
| Manual Only | Human review is required before sending. |
| Never Automate | Do not send automatically. |

## Safe CRM Use

- Retrieve by exact `EMT-*` ID when possible.
- Validate all required placeholders before staging.
- Route compliance-sensitive messages to human review.
- Stop sending if the loan stage changes, the borrower opts out, the record is stale, or the template no longer fits the facts.
- Never auto-send borrower or partner communications without approval.

## Sensitive Categories

Manual or human-reviewed handling is recommended for pricing, payment, rate lock, cash to close, credit rescore, reverse mortgage, construction, one time close, DSCR, ITIN, Foreign National, adverse file issues, closing delays, and marketing-oriented follow-up.
