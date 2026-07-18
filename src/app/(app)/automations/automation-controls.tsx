"use client";

import { useActionState, useId, useState, useTransition } from "react";
import Link from "next/link";
import { FlaskConical, Pause, Pencil, Play, X } from "lucide-react";
import {
  setAutomationStatus,
  testAutomation,
  updateAutomation,
  type AutomationActionState,
} from "./actions";
import {
  AUTOMATION_STATE_LABEL,
  SOURCES,
  SOURCE_LABEL,
  TIER_LABEL,
  TIER_LADDER,
  type AutomationState,
  type Tier,
} from "./labels";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

export type EditableAutomation = {
  id: string;
  name: string;
  description: string | null;
  triggerText: string;
  audienceText: string;
  actionText: string;
  source: string | null;
  campaignId: string | null;
  timingText: string | null;
  tier: Tier;
  status: AutomationState;
};

/** The campaigns the edit dialog offers to link. Fetched by the page, passed down. */
export type CampaignChoice = { id: string; name: string; status: string };

/**
 * The three things you can do to an automation: switch it, try it, reword it.
 *
 * `onRecord` marks the copy of these controls that sits on the automation's own
 * page. There, turning it on or off is the screen's one obvious action; on a
 * card in the list it is just another button, because the list's primary action
 * is building a new one.
 */
export function AutomationControls({
  automation,
  campaignChoices,
  canSetTier,
  onRecord = false,
}: {
  automation: EditableAutomation;
  campaignChoices: CampaignChoice[];
  canSetTier: boolean;
  onRecord?: boolean;
}) {
  const [statusState, statusAction, statusPending] = useActionState<
    AutomationActionState,
    FormData
  >(setAutomationStatus, {});
  const [testState, testAction, testPending] = useActionState<AutomationActionState, FormData>(
    testAutomation,
    {},
  );
  const [editing, setEditing] = useState(false);

  const live = automation.status === "active";
  const error = statusState.error ?? testState.error;

  return (
    <div className="flex flex-col items-start gap-1.5 sm:items-end">
      <div className="flex flex-wrap items-center gap-1.5">
        <form action={statusAction}>
          <input type="hidden" name="automationId" value={automation.id} />
          <input type="hidden" name="status" value={live ? "paused" : "active"} />
          <Button
            type="submit"
            variant={onRecord ? "primary" : "secondary"}
            disabled={statusPending}
          >
            {live ? (
              <Pause className="size-4" aria-hidden />
            ) : (
              <Play className="size-4" aria-hidden />
            )}
            {statusPending ? "Saving…" : live ? "Pause" : "Activate"}
          </Button>
        </form>

        <form action={testAction}>
          <input type="hidden" name="automationId" value={automation.id} />
          <Button
            type="submit"
            variant="ghost"
            disabled={testPending}
            title="Records what this would prepare. Nothing is sent."
          >
            <FlaskConical className="size-4" aria-hidden />
            {testPending ? "Testing…" : "Test it"}
          </Button>
        </form>

        <Button variant="ghost" onClick={() => setEditing(true)}>
          <Pencil className="size-4" aria-hidden />
          Edit
        </Button>
      </div>

      {error ? (
        <p role="alert" className="text-small text-critical">
          {error}
        </p>
      ) : null}

      {testState.tested && !testPending ? (
        <p className="text-small text-muted sm:text-right">
          Test recorded. Nothing was sent.{" "}
          {onRecord ? (
            "It's the newest row in the run history below."
          ) : (
            <Link
              href={`/automations/${automation.id}`}
              className="font-semibold text-action hover:underline"
            >
              See what it prepared
            </Link>
          )}
        </p>
      ) : null}

      {editing ? (
        <EditDialog
          automation={automation}
          campaignChoices={campaignChoices}
          canSetTier={canSetTier}
          onClose={() => setEditing(false)}
        />
      ) : null}
    </div>
  );
}

function EditDialog({
  automation,
  campaignChoices,
  canSetTier,
  onClose,
}: {
  automation: EditableAutomation;
  campaignChoices: CampaignChoice[];
  canSetTier: boolean;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // Several of these dialogs live on the list page, one per card. Scoping the
  // field ids keeps every label tied to its own input.
  const uid = useId();

  const onSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateAutomation(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      onClose();
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${uid}-title`}
    >
      <div className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-xl border border-subtle bg-surface shadow-e3 sm:rounded-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-subtle bg-surface px-4 py-3">
          <h2 id={`${uid}-title`} className="text-h3 font-semibold text-primary">
            Edit this automation
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-muted hover:bg-sunken hover:text-primary"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <form action={onSubmit} className="space-y-4 p-4 text-left">
          <input type="hidden" name="automationId" value={automation.id} />

          <Field label="Name" htmlFor={`${uid}-name`} required>
            <Input
              id={`${uid}-name`}
              name="name"
              defaultValue={automation.name}
              required
              autoFocus
              autoComplete="off"
            />
          </Field>

          <Field
            label="Why it exists"
            htmlFor={`${uid}-description`}
            hint="Optional. A line to remind you why you built it."
          >
            <Textarea
              id={`${uid}-description`}
              name="description"
              rows={2}
              defaultValue={automation.description ?? ""}
            />
          </Field>

          <Field
            label="When should it fire?"
            htmlFor={`${uid}-trigger`}
            required
            hint="The change that sets it off, in your own words."
          >
            <Input
              id={`${uid}-trigger`}
              name="triggerText"
              defaultValue={automation.triggerText}
              required
              autoComplete="off"
            />
          </Field>

          <Field
            label="Where does the lead come from?"
            htmlFor={`${uid}-source`}
            hint="The source that feeds this rule. Leave it blank for rules not tied to a lead source."
          >
            <Select id={`${uid}-source`} name="source" defaultValue={automation.source ?? ""}>
              <option value="">No particular source</option>
              {SOURCES.map((source) => (
                <option key={source} value={source}>
                  {SOURCE_LABEL[source]}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Who does it touch?" htmlFor={`${uid}-audience`} required>
            <Input
              id={`${uid}-audience`}
              name="audienceText"
              defaultValue={automation.audienceText}
              required
              autoComplete="off"
            />
          </Field>

          <Field label="What should happen?" htmlFor={`${uid}-action`} required>
            <Input
              id={`${uid}-action`}
              name="actionText"
              defaultValue={automation.actionText}
              required
              autoComplete="off"
            />
          </Field>

          <Field
            label="Which campaign does it start?"
            htmlFor={`${uid}-campaign`}
            hint="The campaign people get enrolled into when this fires."
          >
            <Select
              id={`${uid}-campaign`}
              name="campaignId"
              defaultValue={automation.campaignId ?? ""}
            >
              <option value="">No campaign linked</option>
              {campaignChoices.map((choice) => (
                <option key={choice.id} value={choice.id}>
                  {choice.name}
                  {choice.status === "running" ? "" : ` (${choice.status})`}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="When does it go out?"
            htmlFor={`${uid}-timing`}
            hint="Plain language — “Within 5 minutes”, “Next morning at 9am”."
          >
            <Input
              id={`${uid}-timing`}
              name="timingText"
              defaultValue={automation.timingText ?? ""}
              autoComplete="off"
            />
          </Field>

          <Field
            label="Status"
            htmlFor={`${uid}-status`}
            hint="A draft or paused automation never fires."
          >
            <Select id={`${uid}-status`} name="status" defaultValue={automation.status}>
              {(["active", "paused", "draft"] as const).map((state) => (
                <option key={state} value={state}>
                  {AUTOMATION_STATE_LABEL[state]}
                </option>
              ))}
            </Select>
          </Field>

          {canSetTier ? (
            <Field
              label="Approval rule"
              htmlFor={`${uid}-tier`}
              hint="The ceiling on what this automation may do without a human."
            >
              <Select id={`${uid}-tier`} name="tier" defaultValue={automation.tier}>
                {TIER_LADDER.map((tier) => (
                  <option key={tier} value={tier}>
                    {TIER_LABEL[tier]}
                  </option>
                ))}
              </Select>
            </Field>
          ) : (
            <>
              <input type="hidden" name="tier" value={automation.tier} />
              <p className="rounded-md border border-subtle bg-sunken px-3 py-2 text-small text-secondary">
                You&rsquo;re editing the words, not the permission. This one stays at{" "}
                <span className="font-semibold text-primary">
                  &ldquo;{TIER_LABEL[automation.tier]}&rdquo;
                </span>{" "}
                — only a team leader, branch leader, or admin can change that.
              </p>
            </>
          )}

          {error ? (
            <p
              role="alert"
              className="rounded-md border border-critical/25 bg-critical-bg px-3 py-2 text-small text-critical"
            >
              {error}
            </p>
          ) : null}

          <div className="flex items-center gap-2 pt-1">
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
