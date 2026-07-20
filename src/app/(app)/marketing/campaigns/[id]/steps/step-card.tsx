"use client";

/**
 * One campaign_step, fully editable — channel, delay, send time, template,
 * content (with "Rewrite in my voice" on the body), approval rule, skip/stop
 * conditions, a live preview, and the reorder/duplicate/delete/add-language
 * controls. All in one <form> using multiple submit buttons with their own
 * `formAction` override (same pattern as people/[id]/bio-panel.tsx's
 * Accept/Regenerate buttons) — "Save step" uses the form's own action
 * (updateCampaignStepAction via useActionState); Move/Duplicate/Delete are
 * plain Server Actions that need no pending state of their own.
 */
import { useActionState, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  Globe,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { RewriteInMyVoice } from "@/app/(app)/settings/ai/rewrite-control";
import type { SignatureProfile } from "@/lib/signature";
import type { TemplateChoice } from "@/lib/queries/marketing";
import type { CampaignStepRow, StepLanguageValue } from "@/lib/queries/campaign-steps";
import {
  addLanguageVersionAction,
  duplicateCampaignStepAction,
  moveCampaignStepDownAction,
  moveCampaignStepUpAction,
  removeCampaignStepAction,
  updateCampaignStepAction,
  type StepFormState,
} from "./actions";
import {
  STEP_CHANNELS,
  STEP_CHANNEL_INFO,
  STEP_TRANSLATION_LANGUAGES,
  delayLabel,
  isStepChannel,
  stepFieldSet,
  type StepChannel,
} from "../../step-vocabulary";
import { CAMPAIGN_LANGUAGES, campaignLanguageName, policyRead } from "../../../vocabulary";
import { StepPreview } from "./step-preview";

export function StepCard({
  campaignId,
  step,
  index,
  total,
  templates,
  nmls,
  senderName,
  signatureProfile,
}: {
  campaignId: string;
  step: CampaignStepRow;
  index: number;
  total: number;
  templates: TemplateChoice[];
  nmls: string | null;
  senderName: string;
  signatureProfile: SignatureProfile;
}) {
  const [channel, setChannel] = useState<StepChannel>(step.channel);
  const [delayDays, setDelayDays] = useState(step.delayDays);
  const [sendTime, setSendTime] = useState(step.sendTime ?? "");
  const [templateId, setTemplateId] = useState(step.templateId ?? "");
  const [subject, setSubject] = useState(step.subject ?? "");
  const [body, setBody] = useState(step.body ?? "");
  const [approvalRequired, setApprovalRequired] = useState(step.approvalRequired);
  const [skipCondition, setSkipCondition] = useState(step.skipCondition ?? "");
  const [stopCondition, setStopCondition] = useState(step.stopCondition ?? "");
  const [language, setLanguage] = useState<StepLanguageValue>(step.language);
  const [showPreview, setShowPreview] = useState(false);
  const [addLangCode, setAddLangCode] = useState<(typeof STEP_TRANSLATION_LANGUAGES)[number]>(
    STEP_TRANSLATION_LANGUAGES[0],
  );

  const [state, formAction, pending] = useActionState<StepFormState, FormData>(
    updateCampaignStepAction,
    {},
  );

  const fields = stepFieldSet(channel);
  const info = STEP_CHANNEL_INFO[channel];
  const Icon = info.icon;
  const chosenTemplate = templates.find((t) => t.id === templateId);
  const templatePolicy = chosenTemplate ? policyRead(chosenTemplate.policy) : null;

  const grouped = new Map<string, TemplateChoice[]>();
  for (const t of templates) {
    const list = grouped.get(t.category);
    if (list) list.push(t);
    else grouped.set(t.category, [t]);
  }

  return (
    <div className="space-y-3 rounded-card border border-subtle bg-surface p-4 shadow-e1">
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="id" value={step.id} />
        <input type="hidden" name="campaignId" value={campaignId} />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-sunken text-small font-semibold text-primary tnum">
              {index + 1}
            </span>
            <Icon className="size-4 shrink-0 text-muted" aria-hidden />
            <span className="text-body font-semibold text-primary">{info.label}</span>
            <Badge tone="neutral">{delayLabel(delayDays)}</Badge>
            {approvalRequired ? <Badge tone="ai">Approval required</Badge> : null}
            {language !== "en" ? <Badge tone="warning">{campaignLanguageName(language)}</Badge> : null}
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="submit"
              formAction={moveCampaignStepUpAction}
              variant="ghost"
              size="sm"
              disabled={index === 0}
              aria-label="Move step up"
            >
              <ArrowUp className="size-3.5" aria-hidden />
            </Button>
            <Button
              type="submit"
              formAction={moveCampaignStepDownAction}
              variant="ghost"
              size="sm"
              disabled={index === total - 1}
              aria-label="Move step down"
            >
              <ArrowDown className="size-3.5" aria-hidden />
            </Button>
            <Button type="submit" formAction={duplicateCampaignStepAction} variant="ghost" size="sm">
              <Copy className="size-3.5" aria-hidden />
              Duplicate
            </Button>
            <Button
              type="submit"
              formAction={removeCampaignStepAction}
              variant="ghost"
              size="sm"
              onClick={(e) => {
                if (!window.confirm("Remove this step? This can't be undone.")) {
                  e.preventDefault();
                }
              }}
            >
              <Trash2 className="size-3.5" aria-hidden />
              Delete
            </Button>
          </div>
        </div>

        <p className="text-small text-muted">{info.hint}</p>

        <div className="grid gap-3 sm:grid-cols-4">
          <Field label="Channel" htmlFor={`channel-${step.id}`}>
            <Select
              id={`channel-${step.id}`}
              name="channel"
              value={channel}
              onChange={(e) => {
                if (isStepChannel(e.target.value)) setChannel(e.target.value);
              }}
            >
              {STEP_CHANNELS.map((c) => (
                <option key={c} value={c}>
                  {STEP_CHANNEL_INFO[c].label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Delay (days)" htmlFor={`delay-${step.id}`} hint={delayLabel(delayDays)}>
            <Input
              id={`delay-${step.id}`}
              name="delayDays"
              type="number"
              min={0}
              max={365}
              value={delayDays}
              onChange={(e) => setDelayDays(Number(e.target.value))}
            />
          </Field>
          <Field label="Send time" htmlFor={`time-${step.id}`} hint="Optional, local time.">
            <Input
              id={`time-${step.id}`}
              name="sendTime"
              type="time"
              value={sendTime}
              onChange={(e) => setSendTime(e.target.value)}
            />
          </Field>
          <Field label="Language" htmlFor={`lang-${step.id}`}>
            <Select
              id={`lang-${step.id}`}
              name="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as StepLanguageValue)}
            >
              {CAMPAIGN_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {language !== "en" ? (
          <p className="rounded-md border border-warning-border bg-warning-bg px-3 py-1.5 text-small font-semibold text-warning">
            Written in {campaignLanguageName(language)} — a human translation review is required
            before this sends.
          </p>
        ) : null}

        <Field
          label="Template"
          htmlFor={`template-${step.id}`}
          hint="Optional. Falls back to the content below when none is attached."
        >
          <Select
            id={`template-${step.id}`}
            name="templateId"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
          >
            <option value="">No template</option>
            {[...grouped.entries()].map(([category, items]) => (
              <optgroup key={category} label={category}>
                {items.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.ref} · {t.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
        </Field>

        {templatePolicy?.campaignBlock ? (
          <p className="rounded-md border border-warning-border bg-warning-bg px-3 py-1.5 text-small text-warning">
            {templatePolicy.campaignBlock}
          </p>
        ) : null}

        {fields.showSubject ? (
          <Field label={fields.subjectLabel} htmlFor={`subject-${step.id}`}>
            <Input
              id={`subject-${step.id}`}
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              autoComplete="off"
            />
          </Field>
        ) : (
          <input type="hidden" name="subject" value={subject} />
        )}

        {fields.showBody ? (
          <div className="space-y-1.5">
            <Field label={fields.bodyLabel} htmlFor={`body-${step.id}`} hint={fields.bodyHint}>
              <Textarea
                id={`body-${step.id}`}
                name="body"
                rows={channel === "sms" ? 3 : 6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </Field>
            <RewriteInMyVoice getText={() => body} onAccept={setBody} channel={channel} />
          </div>
        ) : (
          <input type="hidden" name="body" value={body} />
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Skip condition"
            htmlFor={`skip-${step.id}`}
            hint='Plain language, e.g. "Skip if they already replied."'
          >
            <Input
              id={`skip-${step.id}`}
              name="skipCondition"
              value={skipCondition}
              onChange={(e) => setSkipCondition(e.target.value)}
              autoComplete="off"
            />
          </Field>
          <Field
            label="Stop condition"
            htmlFor={`stop-${step.id}`}
            hint='Ends the whole sequence, e.g. "Stop if they book a call."'
          >
            <Input
              id={`stop-${step.id}`}
              name="stopCondition"
              value={stopCondition}
              onChange={(e) => setStopCondition(e.target.value)}
              autoComplete="off"
            />
          </Field>
        </div>

        <label className="flex items-start gap-2 text-small text-secondary">
          <input
            type="checkbox"
            name="approvalRequired"
            checked={approvalRequired}
            onChange={(e) => setApprovalRequired(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            {info.recipientFacing
              ? "Requires your approval before it's marked ready to send."
              : "Requires your approval before it's added to your list."}
          </span>
        </label>

        {state.error ? (
          <p role="alert" className="text-small text-critical">
            {state.error}
          </p>
        ) : null}
        {state.ok ? <p className="text-small text-healthy">{state.ok}</p> : null}

        <div className="flex flex-wrap items-center gap-2 border-t border-subtle pt-3">
          <Button type="submit" variant="primary" size="sm" disabled={pending}>
            {pending ? "Saving…" : "Save step"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowPreview((v) => !v)}>
            {showPreview ? (
              <EyeOff className="size-3.5" aria-hidden />
            ) : (
              <Eye className="size-3.5" aria-hidden />
            )}
            {showPreview ? "Hide preview" : "Preview"}
          </Button>
        </div>
      </form>

      {/* A sibling form, not nested — HTML forms cannot nest. */}
      <form
        action={addLanguageVersionAction}
        className="flex flex-wrap items-center gap-2 border-t border-subtle pt-3"
      >
        <input type="hidden" name="id" value={step.id} />
        <input type="hidden" name="campaignId" value={campaignId} />
        <Globe className="size-3.5 shrink-0 text-muted" aria-hidden />
        <span className="text-small text-secondary">Add a version of this step in</span>
        <Select
          name="language"
          value={addLangCode}
          onChange={(e) => setAddLangCode(e.target.value as (typeof STEP_TRANSLATION_LANGUAGES)[number])}
          className="h-8 w-32 text-small"
          aria-label="Language to add"
        >
          {STEP_TRANSLATION_LANGUAGES.map((code) => (
            <option key={code} value={code}>
              {campaignLanguageName(code)}
            </option>
          ))}
        </Select>
        <Button type="submit" size="sm">
          Add version
        </Button>
      </form>

      {showPreview ? (
        <div className="border-t border-subtle pt-3">
          <StepPreview
            channel={channel}
            subject={subject}
            body={body}
            language={language}
            senderName={senderName}
            nmls={nmls}
            signatureProfile={signatureProfile}
          />
        </div>
      ) : null}
    </div>
  );
}
