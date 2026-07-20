"use client";

/**
 * Edit campaign form.
 *
 * The audience editor speaks the same plain language as the New campaign
 * dialog: a rule type picked from the known audiences, plus an optional
 * description in the LO's own words that becomes the label on the card.
 *
 * The multi-step sequence itself moved to a dedicated editor backed by
 * `campaign_step` (M6) — see the "Manage steps" link below. `campaign.drip`
 * (the flat legacy shape) is no longer edited here, but its value is still
 * carried through untouched on every save via the hidden field below: it
 * stays intact for offline export, per the M6 brief ("keep the drip column
 * untouched — do not remove it").
 */
import { useActionState, useState } from "react";
import Link from "next/link";
import { ListChecks, Video } from "lucide-react";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { updateCampaign, type CampaignFormState } from "../../../actions";
import {
  AUDIENCES,
  CAMPAIGN_LANGUAGES,
  isCampaignLanguage,
  type CampaignLanguage,
  type DripStep,
} from "../../../vocabulary";
import { ComplianceStrip } from "../../compliance-strip";

export type EditableCampaign = {
  id: string;
  name: string;
  status: string;
  language: string;
  emailBody: string | null;
  smsBody: string | null;
  videoTitle: string;
  videoCaption: string;
  audienceType: string;
  audienceLabel: string;
  scheduledForIso: string | null;
  drip: DripStep[];
};

/** ISO → the value a datetime-local input wants, in the browser's timezone. */
function toLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function isKnownAudience(type: string): boolean {
  return AUDIENCES.some((a) => a.type === type);
}

export function EditCampaignForm({
  campaign,
  nmls,
}: {
  campaign: EditableCampaign;
  nmls: string | null;
}) {
  const [language, setLanguage] = useState<CampaignLanguage>(
    isCampaignLanguage(campaign.language) ? campaign.language : "en",
  );
  const [audienceType, setAudienceType] = useState(
    isKnownAudience(campaign.audienceType) ? campaign.audienceType : "past_clients",
  );
  // A description in the LO's words; seeded custom audiences keep theirs.
  const defaultLabel = AUDIENCES.find((a) => a.type === audienceType)?.label ?? "";
  const [audienceDescription, setAudienceDescription] = useState(
    campaign.audienceLabel && campaign.audienceLabel !== defaultLabel
      ? campaign.audienceLabel
      : "",
  );
  const [timing, setTiming] = useState<"none" | "scheduled">(
    campaign.scheduledForIso ? "scheduled" : "none",
  );
  const [scheduledFor, setScheduledFor] = useState(
    toLocalInputValue(campaign.scheduledForIso),
  );
  // No longer edited here (see the file header comment) — carried through to
  // the Server Action unchanged, so the legacy export stays intact.
  const drip: DripStep[] = campaign.drip;

  const [state, formAction, pending] = useActionState<CampaignFormState, FormData>(
    updateCampaign,
    {},
  );

  const audience = AUDIENCES.find((a) => a.type === audienceType);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="id" value={campaign.id} />
      <input type="hidden" name="drip" value={JSON.stringify(drip)} />

      <ComplianceStrip nmls={nmls} language={language} />

      <section className="space-y-4 rounded-card border border-subtle bg-surface p-4 shadow-e1 sm:p-5">
        <Field
          label="Campaign name"
          htmlFor="name"
          required
          hint="Only your team sees this. Name it so you know it in six months."
        >
          <Input
            id="name"
            name="name"
            required
            defaultValue={campaign.name}
            autoComplete="off"
          />
        </Field>

        <Field
          label="Language"
          htmlFor="language"
          hint="English is the default. Your words are never machine-translated."
        >
          <Select
            id="language"
            name="language"
            value={language}
            onChange={(e) => {
              if (isCampaignLanguage(e.target.value)) setLanguage(e.target.value);
            }}
          >
            {CAMPAIGN_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </Select>
        </Field>

        {/* ---------------- Audience ---------------- */}
        <Field
          label="Who should get it?"
          htmlFor="audienceType"
          required
          hint={audience?.hint}
        >
          <Select
            id="audienceType"
            name="audienceType"
            required
            value={audienceType}
            onChange={(e) => setAudienceType(e.target.value)}
          >
            {AUDIENCES.map((a) => (
              <option key={a.type} value={a.type}>
                {a.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Describe the audience in your own words"
          htmlFor="audienceDescription"
          hint="Optional. Shows on the campaign card in place of the standard label. The rule above still decides who's counted."
        >
          <Input
            id="audienceDescription"
            name="audienceDescription"
            value={audienceDescription}
            onChange={(e) => setAudienceDescription(e.target.value)}
            autoComplete="off"
            placeholder={audience?.label}
          />
        </Field>
      </section>

      {/* ---------------- Content ---------------- */}
      <section className="space-y-4 rounded-card border border-subtle bg-surface p-4 shadow-e1 sm:p-5">
        <h2 className="text-h3 font-semibold text-primary">What it says</h2>

        <Field
          label="Email content"
          htmlFor="emailBody"
          hint="Leave empty to send the attached template as-is. {{merge_fields}} are swapped for each recipient's details."
        >
          <Textarea
            id="emailBody"
            name="emailBody"
            rows={8}
            defaultValue={campaign.emailBody ?? ""}
          />
        </Field>

        <Field
          label="Text (SMS) content"
          htmlFor="smsBody"
          hint="Keep it short — texts over 160 characters split into segments."
        >
          <Textarea
            id="smsBody"
            name="smsBody"
            rows={3}
            defaultValue={campaign.smsBody ?? ""}
          />
        </Field>

        <div className="space-y-3 rounded-card border border-subtle bg-sunken/50 p-3">
          <p className="flex items-center gap-1.5 text-label font-semibold text-secondary">
            <Video className="size-4" aria-hidden />
            Video
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Video title" htmlFor="videoTitle">
              <Input
                id="videoTitle"
                name="videoTitle"
                defaultValue={campaign.videoTitle}
                autoComplete="off"
                placeholder="July market update"
              />
            </Field>
            <Field label="Caption" htmlFor="videoCaption">
              <Input
                id="videoCaption"
                name="videoCaption"
                defaultValue={campaign.videoCaption}
                autoComplete="off"
                placeholder="3-minute update"
              />
            </Field>
          </div>
          <p className="text-small text-muted">
            Demo video conventions: recordings stay on the device that made them — only
            the title and caption are stored here. Clear both fields to remove the
            video.{" "}
            <Link
              href="/marketing/compose"
              className="font-semibold text-action hover:underline"
            >
              Record one in the video composer
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ---------------- Timing ---------------- */}
      <section className="space-y-4 rounded-card border border-subtle bg-surface p-4 shadow-e1 sm:p-5">
        <h2 className="text-h3 font-semibold text-primary">When it goes</h2>

        <Field
          label="Send timing"
          htmlFor="timing"
          hint={
            campaign.status === "draft" || campaign.status === "scheduled"
              ? "Setting a date schedules the campaign; clearing it returns it to a draft."
              : "Changing the date won't change the campaign's status."
          }
        >
          <Select
            id="timing"
            name="timing"
            value={timing}
            onChange={(e) => setTiming(e.target.value as "none" | "scheduled")}
          >
            <option value="none">No send date</option>
            <option value="scheduled">On a date and time</option>
          </Select>
        </Field>

        {timing === "scheduled" ? (
          <Field label="Goes out" htmlFor="scheduledFor" required hint="Your local time.">
            <Input
              id="scheduledFor"
              name="scheduledFor"
              type="datetime-local"
              required
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
            />
          </Field>
        ) : null}

        {/* ---------------- Multi-step sequence ---------------- */}
        <div className="space-y-2 border-t border-subtle pt-4">
          <p className="text-label font-semibold text-secondary">Multi-step sequence</p>
          <p className="text-small text-secondary">
            Step-by-step editing — channel, delay, send time, template, approval, skip
            and stop conditions, and language versions — now lives on its own screen.
          </p>
          <Link
            href={`/marketing/campaigns/${campaign.id}/steps`}
            className="inline-flex items-center gap-1.5 text-small font-semibold text-action hover:underline"
          >
            <ListChecks className="size-3.5" aria-hidden />
            Manage steps
          </Link>
          {drip.length > 0 ? (
            <p className="text-small text-muted">
              This campaign also carries {drip.length} legacy drip {drip.length === 1 ? "step" : "steps"}{" "}
              from before the step editor — kept for offline export, untouched by this form.
            </p>
          ) : null}
        </div>
      </section>

      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-critical/25 bg-critical-bg px-3 py-2 text-small text-critical"
        >
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
        <Link
          href={`/marketing/campaigns/${campaign.id}`}
          className="inline-flex h-9 items-center rounded-control px-3.5 text-body font-medium text-secondary transition-colors hover:bg-sunken hover:text-primary"
        >
          Cancel
        </Link>
        <p className="text-small text-muted">
          Audience size is recounted when you save. Nothing sends until sending
          providers are connected.
        </p>
      </div>
    </form>
  );
}
