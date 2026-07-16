# Translation Standards

## Table Of Contents

- [Purpose](#purpose)
- [Language Coverage Status](#language-coverage-status)
- [Locale Standards](#locale-standards)
- [Placeholder Rules](#placeholder-rules)
- [Terminology Standards](#terminology-standards)
- [Compliance Standards](#compliance-standards)
- [Translation QA Checklist](#translation-qa-checklist)

## Purpose

This guide controls multilingual mortgage communication quality across English, Vietnamese, Simplified Chinese, Colombian Spanish, and Russian.

## Language Coverage Status

The library has 65 English master templates and lifecycle-stage localization modules for Vietnamese, Simplified Chinese, Colombian Spanish, and Russian. Full per-template translations should be created and reviewed before live multilingual sends.

## Locale Standards

| Language | Standard |
|---|---|
| English | Plain, direct, broker-first when relevant. |
| Vietnamese | Use full diacritics and professional borrower-facing wording such as `Kính chào` or `Quý khách` where appropriate. |
| Simplified Chinese | Use Simplified characters and borrower-facing `您`; avoid stiff terms such as `我方团队` when simpler language works. |
| Colombian Spanish | Use neutral Colombian professional Spanish with `usted`; prefer `préstamo hipotecario`, `tasa`, and `cargar documentos`. |
| Russian | Use formal `Вы`; explain U.S. mortgage terms when direct translation may confuse. |

## Placeholder Rules

- Never translate placeholder tokens.
- Preserve every required merge field from the English master.
- Keep names, NMLS, dates, links, and contact information in the same position or a clearly equivalent position.
- Confirm subject lines, bodies, signatures, and compliance lines retain required placeholders.

## Terminology Standards

| Concept | Vietnamese | Simplified Chinese | Colombian Spanish | Russian |
|---|---|---|---|---|
| Mortgage loan | khoản vay thế chấp | 抵押贷款 | préstamo hipotecario | ипотечный кредит |
| Loan application | đơn đăng ký vay thế chấp | 贷款申请 | solicitud de préstamo hipotecario | заявка на ипотечный кредит |
| Underwriting | thẩm định hồ sơ vay | 承保审核 | revisión de underwriting | андеррайтинг / кредитная проверка |
| Title | kiểm tra quyền sở hữu/title | 产权审核 | revisión de título | проверка прав собственности/title |
| Closing | ký kết hoàn tất khoản vay/closing | 过户/closing | cierre | закрытие сделки |
| Conditional approval | chấp thuận có điều kiện | 有条件批准 | aprobación condicional | условное одобрение |
| Loan Estimate | Ước Tính Khoản Vay | 贷款估算表 | Estimación del Préstamo | предварительный расчет кредита |
| Closing Disclosure | Tờ khai ký kết vay thế chấp | 过户披露 | Divulgación del Cierre | информация о закрытии |

## Compliance Standards

- Keep approval, rate, payment, fees, costs, cash-to-close, and closing limitations equivalent across languages.
- Disclosures must be in the same language as the related claim when applicable.
- Do not make non-English versions warmer by weakening compliance limits.

## Translation QA Checklist

- Professional tone.
- Natural localization, not word-for-word translation.
- Required placeholders preserved.
- Mortgage terminology is understandable.
- Compliance meaning matches English.
- Formatting matches the English master.
- Human bilingual review completed before live send.
