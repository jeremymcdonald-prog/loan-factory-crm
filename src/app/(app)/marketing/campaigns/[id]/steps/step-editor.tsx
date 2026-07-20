"use client";

/**
 * The step list — one campaign_step per StepCard, plus "Add a step". A new
 * step is created with plain defaults (email, appended after the last day
 * offset, English, approval on) and immediately editable in its own card;
 * there's no separate "new step" form to keep in sync with the editor.
 */
import { useActionState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SignatureProfile } from "@/lib/signature";
import type { TemplateChoice } from "@/lib/queries/marketing";
import type { CampaignStepRow } from "@/lib/queries/campaign-steps";
import { addCampaignStepAction, type StepFormState } from "./actions";
import { StepCard } from "./step-card";
import { MAX_CAMPAIGN_STEPS } from "../../step-vocabulary";

export function StepEditor({
  campaignId,
  steps,
  templates,
  nmls,
  senderName,
  signatureProfile,
}: {
  campaignId: string;
  steps: CampaignStepRow[];
  templates: TemplateChoice[];
  nmls: string | null;
  senderName: string;
  signatureProfile: SignatureProfile;
}) {
  const [state, formAction, pending] = useActionState<StepFormState, FormData>(
    addCampaignStepAction,
    {},
  );

  const atLimit = steps.length >= MAX_CAMPAIGN_STEPS;
  const nextDelay = steps.length
    ? Math.max(...steps.map((s) => s.delayDays)) + 3
    : 0;

  return (
    <div className="space-y-4">
      {steps.length > 0 ? (
        <div className="space-y-3">
          {steps.map((step, i) => (
            <StepCard
              key={step.id}
              campaignId={campaignId}
              step={step}
              index={i}
              total={steps.length}
              templates={templates}
              nmls={nmls}
              senderName={senderName}
              signatureProfile={signatureProfile}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-card border border-dashed border-strong bg-surface px-4 py-8 text-center text-small text-secondary">
          No steps yet — add the first one below.
        </p>
      )}

      <form action={formAction} className="space-y-2">
        <input type="hidden" name="campaignId" value={campaignId} />
        <input type="hidden" name="channel" value="email" />
        <input type="hidden" name="delayDays" value={nextDelay} />
        <input type="hidden" name="language" value="en" />
        <input type="hidden" name="approvalRequired" value="on" />

        {state.error ? (
          <p role="alert" className="text-small text-critical">
            {state.error}
          </p>
        ) : null}

        {atLimit ? (
          <p className="text-small text-muted">
            That&rsquo;s the limit — {MAX_CAMPAIGN_STEPS} steps or fewer.
          </p>
        ) : (
          <Button type="submit" disabled={pending}>
            <Plus className="size-3.5" aria-hidden />
            {pending ? "Adding…" : "Add a step"}
          </Button>
        )}
      </form>
    </div>
  );
}
