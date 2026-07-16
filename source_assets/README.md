# Source assets — provenance

Curated source material required for implementation and QA traceability. The full discovery corpus (six ZIP archives, ~735MB including marketing training video and an HTML prototype) is **deliberately not committed** — it lives in Jeremy's local `LF-CRM/_product_discovery/` workspace and is inventoried, pack by pack, in [`docs/goat_architect/Asset_Inventory.md`](../docs/goat_architect/Asset_Inventory.md).

| Directory | Origin | Why it's in the repo |
|---|---|---|
| `communication-framework/` | `mortgage-communication-framework-master.zip` (discovery pack, 2026) | The 135 master email templates (EMT-001–135) with YAML metadata, merge fields, per-template automation notes, and compliance annotations. This is the CRM's communication content layer — the template import task in `docs/goat_architect/Tasks.md` reads directly from these files. |
| `usability-framework/` | `ai-personas-master.zip` (discovery pack; built for the separate TERA+ program, 2026) | 111 personas, 259 test scenarios, and the usability scorecard adopted as Loan Factory CRM's QA acceptance instrument (`docs/goat_architect/QA_Plan.md`). Used strictly as persona/usability/QA source material. Note: TERA-* IDs and status labels inside these files refer to the source program and require the terminology remap documented in the QA plan; the Vietnamese and Colombian-Spanish persona files need diacritic restoration before any publishable reuse. |

Rules: these files are reference material — do not edit them in place. Corrections or derived versions belong in the application codebase or docs, with a note here if a file is superseded.
