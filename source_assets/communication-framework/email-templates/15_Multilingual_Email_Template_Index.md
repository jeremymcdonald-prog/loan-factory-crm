# Multilingual Email Template Index

## Table Of Contents

- [Language Coverage](#language-coverage)
- [Template Coverage Matrix](#template-coverage-matrix)
- [Placeholder Preservation Matrix](#placeholder-preservation-matrix)
- [Localized Body Modules](#localized-body-modules)
- [Localization Rules](#localization-rules)

## Language Coverage

Every English master template in this library is written in English and has lifecycle-stage localization support for:

- English
- Vietnamese
- Simplified Chinese
- Colombian Spanish
- Russian

The English master template remains the source of truth. File 15 provides reusable lifecycle-stage localization modules, not a fully approved word-for-word translation of every `EMT-*` template. Full per-template localized variants should be created and reviewed before live multilingual sending.

Localized versions must preserve the same meaning, compliance limits, next step, required placeholders, and privacy boundaries.

## Template Coverage Matrix

| Template ID range | Source files | Localization support |
|---|---|---|
| EMT-001 to EMT-009 | First contact, Realtor referral, pre-approval | English masters plus VI, ZH, ES-CO, RU lifecycle modules |
| EMT-010 to EMT-021 | Document collection, application, disclosures | English masters plus VI, ZH, ES-CO, RU lifecycle modules |
| EMT-022 to EMT-027 | Underwriting and conditional approval | English masters plus VI, ZH, ES-CO, RU lifecycle modules |
| EMT-028 to EMT-037 | Appraisal, title, insurance | English masters plus VI, ZH, ES-CO, RU lifecycle modules |
| EMT-038 to EMT-042 | Clear to close, closing, funding | English masters plus VI, ZH, ES-CO, RU lifecycle modules |
| EMT-043 to EMT-047 | Post-closing and past client | English masters plus VI, ZH, ES-CO, RU lifecycle modules |
| EMT-048 to EMT-056 | Loan coordinator and processor | English masters plus VI, ZH, ES-CO, RU lifecycle modules |
| EMT-057 to EMT-065 | Realtor nurture and problem-file updates | English masters plus VI, ZH, ES-CO, RU lifecycle modules |
| EMT-066 to EMT-074 | Specialty pre-approval and product introductions | English masters plus VI, ZH, ES-CO, RU lifecycle modules |
| EMT-075 to EMT-087 | Specialty document collection and product-specific checklists | English masters plus VI, ZH, ES-CO, RU lifecycle modules |
| EMT-088 to EMT-097 | Specialty application, disclosures, DPA, and USDA updates | English masters plus VI, ZH, ES-CO, RU lifecycle modules |
| EMT-098 to EMT-105 | Specialty underwriting submissions | English masters plus VI, ZH, ES-CO, RU lifecycle modules |
| EMT-106 to EMT-112 | Specialty conditional approvals and credit rescore | English masters plus VI, ZH, ES-CO, RU lifecycle modules |
| EMT-113 to EMT-119 | Specialty appraisal, property, HOA, and insurance follow-up | English masters plus VI, ZH, ES-CO, RU lifecycle modules |
| EMT-120 to EMT-126 | Specialty closing, seller credit, VOE, wire fraud, and congratulations | English masters plus VI, ZH, ES-CO, RU lifecycle modules |
| EMT-127 to EMT-135 | Post-closing, past-client, investor, construction warranty, and welcome home | English masters plus VI, ZH, ES-CO, RU lifecycle modules |

## Placeholder Preservation Matrix

| Placeholder type | Localization requirement |
|---|---|
| Names | Keep `{{BorrowerName}}`, `{{RealtorName}}`, `{{LoanOfficerName}}`, `{{LoanCoordinatorName}}`, and `{{ProcessorName}}` unchanged. |
| Contact paths | Keep `{{PhoneNumber}}`, `{{EmailAddress}}`, `{{Website}}`, and `{{ApplicationLink}}` unchanged. |
| Licensing | Keep `{{NMLS}}` and `{{CompanyNMLS}}` unchanged when used. |
| Dates and property | Keep `{{ClosingDate}}`, `{{AppraisalDate}}`, `{{AppraisalDueDate}}`, and `{{PropertyAddress}}` unchanged. |
| Loan context | Keep `{{LenderName}}` and `{{LoanProgram}}` unchanged. |
| Template-specific fields | Every localized subject, body, signature, and compliance line must preserve the required merge fields from the English master template. |

## Localized Body Modules

Use these modules with the matching English master template. Replace only approved placeholders and preserve the compliance notes.

### First Contact And Application Start

Vietnamese:

Kính chào `{{BorrowerName}}`,

Cảm ơn Quý khách đã liên hệ. Chúng tôi sẽ giúp Quý khách hiểu bước tiếp theo và những thông tin cần xem xét cho khoản vay thế chấp.

Vui lòng bắt đầu bằng cổng thông tin bảo mật:

`{{ApplicationLink}}`

Sau khi nhận được thông tin, chúng tôi sẽ tiếp tục xem xét và cho Quý khách biết bước tiếp theo. Email này không phải là phê duyệt khoản vay, chốt lãi suất, khoản thanh toán, phí, chi phí ký kết, hoặc số tiền cần mang đến closing cuối cùng.

Simplified Chinese:

您好，`{{BorrowerName}}`：

感谢您联系。我们会帮助您了解下一步，以及贷款审核需要哪些信息。

请先通过安全门户开始：

`{{ApplicationLink}}`

收到信息后，我们会继续审核并告知下一步。此邮件不代表最终贷款批准、最终利率、最终付款、最终费用，或最终所需现金金额。

Colombian Spanish:

Hola `{{BorrowerName}}`,

Gracias por contactarnos. Vamos a ayudarle a entender el próximo paso y la información necesaria para revisar su préstamo hipotecario.

Por favor empiece en el portal seguro:

`{{ApplicationLink}}`

Cuando recibamos la información, continuaremos la revisión y le confirmaremos el próximo paso. Este mensaje no es una aprobación final ni una oferta definitiva de tasa, pago, costos, cargos o dinero final requerido para el cierre.

Russian:

Здравствуйте, `{{BorrowerName}}`.

Спасибо за обращение. Наша команда поможет Вам понять следующий шаг и какие данные нужны для проверки ипотечного кредита.

Пожалуйста, начните через защищенный портал:

`{{ApplicationLink}}`

После получения информации мы продолжим проверку и сообщим следующий шаг. Это сообщение не является окончательным одобрением кредита, окончательной ставкой, окончательным платежом, окончательными расходами или окончательной суммой к закрытию сделки.

### Document Collection And Missing Items

Vietnamese:

Kính chào `{{BorrowerName}}`,

Chúng tôi cần thêm một số giấy tờ để tiếp tục xem xét hồ sơ vay. Vui lòng tải giấy tờ lên cổng thông tin bảo mật:

`{{ApplicationLink}}`

Giấy tờ được nhận sẽ được chuyển sang bước xem xét. Việc tải lên giấy tờ không có nghĩa là giấy tờ đã được chấp nhận hoặc khoản vay đã được phê duyệt.

Simplified Chinese:

您好，`{{BorrowerName}}`：

我们需要补充一些文件，才能继续审核贷款文件。请通过安全门户上传：

`{{ApplicationLink}}`

文件上传后会进入审核。收到文件不代表文件已被接受，也不代表贷款已获最终批准。

Colombian Spanish:

Hola `{{BorrowerName}}`,

Necesitamos algunos documentos adicionales para continuar la revisión del préstamo. Por favor cárguelos en el portal seguro:

`{{ApplicationLink}}`

Cuando recibamos los documentos, pasarán a revisión. Recibirlos no significa que ya estén aceptados ni que el préstamo esté aprobado.

Russian:

Здравствуйте, `{{BorrowerName}}`.

Нам нужны дополнительные документы, чтобы продолжить проверку кредита. Пожалуйста, загрузите их через защищенный портал:

`{{ApplicationLink}}`

После загрузки документы будут направлены на проверку. Получение документов не означает, что они уже приняты или что кредит окончательно одобрен.

### Underwriting And Conditions

Vietnamese:

Kính chào `{{BorrowerName}}`,

Hồ sơ đang được thẩm định bởi bộ phận underwriting. Nếu có điều kiện hoặc giấy tờ cần bổ sung, chúng tôi sẽ gửi yêu cầu rõ ràng.

Chấp thuận có điều kiện không phải là phê duyệt cuối cùng. Hồ sơ vẫn cần hoàn tất các điều kiện, thẩm định giá, kiểm tra quyền sở hữu/title, bảo hiểm, và các bước xem xét cuối cùng.

Simplified Chinese:

您好，`{{BorrowerName}}`：

您的文件正在承保审核中。如果需要补充条件或文件，我们会发送明确的请求。

有条件批准不等于最终贷款批准。文件仍需完成条件、估价、产权、保险以及最终审核步骤。

Colombian Spanish:

Hola `{{BorrowerName}}`,

Su archivo está en revisión de underwriting. Si se requieren condiciones o documentos adicionales, le enviaremos una solicitud clara.

La aprobación condicional no es una aprobación final. El archivo aún debe completar condiciones, avalúo, título, seguro y revisiones finales.

Russian:

Здравствуйте, `{{BorrowerName}}`.

Ваша заявка находится на проверке андеррайтинга. Если потребуются дополнительные условия или документы, мы отправим конкретный запрос.

Условное одобрение не является окончательным одобрением кредита. Заявка еще должна пройти условия, оценку недвижимости, проверку прав собственности/title, страхование и финальные проверки.

### Appraisal Title Insurance And Closing

Vietnamese:

Kính chào `{{BorrowerName}}`,

Hồ sơ đang ở bước liên quan đến thẩm định giá, kiểm tra quyền sở hữu/title, bảo hiểm, hoặc ký kết hoàn tất khoản vay/closing. Chúng tôi sẽ cập nhật khi có thông tin đã được xác nhận.

Thời gian closing vẫn phụ thuộc vào lender, title, bảo hiểm, disclosure, underwriting, và các bước kiểm tra cuối cùng. Chúng tôi sẽ không xem bất kỳ khoản thanh toán, chi phí, hoặc số tiền cần mang đến closing nào là cuối cùng cho đến khi có tài liệu và xác nhận phù hợp.

Simplified Chinese:

您好，`{{BorrowerName}}`：

您的文件正在处理估价、产权、保险或过户相关步骤。我们会在有确认信息后更新您。

过户时间仍取决于贷款方、产权、保险、披露文件、承保审核以及最终检查。

Colombian Spanish:

Hola `{{BorrowerName}}`,

Su archivo está en una etapa relacionada con avalúo, título, seguro o cierre. Le mantendremos informado/a cuando tengamos información confirmada.

El tiempo de cierre todavía depende del lender, título, seguro, divulgaciones, underwriting y revisiones finales. No trataremos la tasa, el pago, los costos, cargos o dinero final para cierre como definitivos hasta que los documentos y revisiones correspondientes estén completos.

Russian:

Здравствуйте, `{{BorrowerName}}`.

Ваша заявка находится на этапе оценки недвижимости, проверки прав собственности/title, страхования или закрытия сделки. Мы сообщим Вам обновление, когда информация будет подтверждена.

Сроки закрытия зависят от кредитора, title, страхования, раскрытий, андеррайтинга и финальных проверок.

### Past Client And Realtor Nurture

Vietnamese:

Kính chào `{{BorrowerName}}`,

Chúng tôi chỉ muốn kiểm tra xem Quý khách có câu hỏi nào về khoản vay thế chấp hoặc kế hoạch nhà ở không. Không có áp lực. Nếu cần xem xét lựa chọn, mọi phương án đều cần được đánh giá dựa trên thông tin hiện tại.

Simplified Chinese:

您好，`{{BorrowerName}}`：

我们只是想确认您是否有任何关于抵押贷款或住房计划的问题。没有压力。如需查看任何选项，都必须基于当前信息进行审核。

Colombian Spanish:

Hola `{{BorrowerName}}`,

Solo queríamos saber si tiene alguna pregunta sobre su préstamo hipotecario o sus planes de vivienda. Sin presión. Cualquier opción debe revisarse con información actual.

Russian:

Здравствуйте, `{{BorrowerName}}`.

Мы просто хотели уточнить, есть ли у Вас вопросы по ипотечному кредиту или планам, связанным с жильем. Без давления. Любые варианты нужно проверять на основе актуальной информации.

## Localization Rules

- Keep disclosures and compliance warnings in the same language as the claim.
- Do not translate mortgage terms literally when the localized mortgage market uses a clearer phrase.
- Keep approved placeholder tokens unchanged.
- Keep borrower and Realtor privacy limits in every language.
- Do not soften conditional language in non-English versions.
- Avoid phrases that sound like guaranteed approval, guaranteed closing, final rate, final payment, final fees/costs, or final cash to close.
