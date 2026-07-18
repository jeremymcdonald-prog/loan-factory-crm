"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { Megaphone, X, ShieldAlert, ExternalLink } from "lucide-react";
import { createCampaign, type CampaignFormState } from "./actions";
import {
  CAMPAIGN_LANGUAGES,
  campaignLanguageName,
  isCampaignLanguage,
  policyRead,
  type AudienceOption,
  type CampaignLanguage,
} from "./vocabulary";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Input, Select } from "@/components/ui/field";

export type TemplateChoice = {
  id: string;
  ref: string;
  name: string;
  category: string;
  policy: string;
};

export type AudienceChoice = AudienceOption & { size: number };

/**
 * New campaign.
 *
 * Two things this dialog will not do: let a template that is never sent to a
 * list get as far as the submit button, and imply that picking an audience
 * sends anything. The block below is a courtesy — the same rule is enforced
 * again inside the Server Action, which is where it actually holds.
 */
export function NewCampaignButton({
  templates,
  audiences,
  companyNmls,
  defaultTemplateId = "",
  label = "New campaign",
}: {
  templates: TemplateChoice[];
  audiences: AudienceChoice[];
  companyNmls: string | null;
  /** Preselects the template — set when opening from a template record. */
  defaultTemplateId?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [templateId, setTemplateId] = useState(defaultTemplateId);
  const [audienceType, setAudienceType] = useState(audiences[0]?.type ?? "past_clients");
  // English is the default: every campaign starts in it unless deliberately changed.
  const [language, setLanguage] = useState<CampaignLanguage>("en");
  const [timing, setTiming] = useState<"draft" | "scheduled">("draft");
  const [state, formAction, pending] = useActionState<CampaignFormState, FormData>(
    createCampaign,
    {},
  );

  // Templates arrive ordered by ref; grouping preserves that inside each group.
  const grouped = useMemo(() => {
    const groups = new Map<string, TemplateChoice[]>();
    for (const t of templates) {
      const list = groups.get(t.category);
      if (list) list.push(t);
      else groups.set(t.category, [t]);
    }
    return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [templates]);

  const chosen = templates.find((t) => t.id === templateId);
  const policy = chosen ? policyRead(chosen.policy) : null;
  const blocked = policy?.campaignBlock ?? null;

  const audience = audiences.find((a) => a.type === audienceType);
  const emptyAudience = audience?.size === 0;

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)}>
        <Megaphone className="size-4" aria-hidden />
        {label}
      </Button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-campaign-title"
    >
      <div className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-xl border border-subtle bg-surface shadow-e3 sm:rounded-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-subtle bg-surface px-4 py-3">
          <h2 id="new-campaign-title" className="text-h3 font-semibold text-primary">
            New campaign
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="rounded p-1 text-muted hover:bg-sunken hover:text-primary"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <form action={formAction} className="space-y-4 p-4">
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
              autoFocus
              autoComplete="off"
              placeholder="Past client check-in — fall"
            />
          </Field>

          <Field
            label="Which template?"
            htmlFor="templateId"
            required
            hint="Every template in your library, grouped by what it's for."
          >
            <Select
              id="templateId"
              name="templateId"
              required
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
            >
              <option value="">Choose a template…</option>
              {grouped.map(([category, items]) => (
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

          {chosen && policy ? (
            <div className="-mt-1 flex flex-wrap items-center gap-2">
              <Badge tone={policy.tone}>{policy.label}</Badge>
              <Link
                href={`/marketing/templates/${chosen.id}`}
                className="inline-flex items-center gap-1 text-small font-semibold text-action hover:underline"
              >
                Read {chosen.ref}
                <ExternalLink className="size-3" aria-hidden />
              </Link>
            </div>
          ) : null}

          {/* The compliance gate. Nothing below it is submittable. */}
          {blocked ? (
            <div
              role="alert"
              className="flex gap-2.5 rounded-md border border-critical/25 bg-critical-bg px-3 py-2.5"
            >
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-critical" aria-hidden />
              <div>
                <p className="text-small font-semibold text-critical">
                  This template can&rsquo;t go out as a campaign
                </p>
                <p className="mt-0.5 text-small text-secondary">{blocked}</p>
              </div>
            </div>
          ) : null}

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
              onChange={(e) => setAudienceType(e.target.value as AudienceChoice["type"])}
            >
              {audiences.map((a) => (
                <option key={a.type} value={a.type}>
                  {a.label} ({a.size})
                </option>
              ))}
            </Select>
          </Field>

          {audience ? (
            <p className="-mt-1 text-small text-muted">
              {emptyAudience ? (
                <span className="text-warning">
                  Nobody matches this one right now, so there&rsquo;s no one to send to yet.
                </span>
              ) : (
                <>
                  That&rsquo;s{" "}
                  <span className="font-semibold text-primary tnum">
                    {audience.size} {audience.size === 1 ? "person" : "people"}
                  </span>{" "}
                  today. Anyone who asked not to be contacted is already left out.
                </>
              )}
            </p>
          ) : null}

          <Field
            label="Language"
            htmlFor="language"
            hint="English is the default. Non-English campaigns need a human translation review before they send."
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

          {language !== "en" ? (
            <p className="-mt-1 rounded-md border border-warning-border bg-warning-bg px-3 py-1.5 text-small font-semibold text-warning">
              Written in {campaignLanguageName(language)} — a human translation review is
              required before this sends.
            </p>
          ) : null}

          <Field label="When?" htmlFor="timing">
            <Select
              id="timing"
              name="timing"
              value={timing}
              onChange={(e) => setTiming(e.target.value as "draft" | "scheduled")}
            >
              <option value="draft">Save as a draft — I&rsquo;ll send it later</option>
              <option value="scheduled">Schedule it for a date and time</option>
            </Select>
          </Field>

          {timing === "scheduled" ? (
            <Field
              label="Goes out"
              htmlFor="scheduledFor"
              required
              hint="Your local time."
            >
              <Input id="scheduledFor" name="scheduledFor" type="datetime-local" required />
            </Field>
          ) : null}

          {state.error ? (
            <p
              role="alert"
              className="rounded-md border border-critical/25 bg-critical-bg px-3 py-2 text-small text-critical"
            >
              {state.error}
            </p>
          ) : null}

          <div className="flex items-center gap-2 pt-1">
            <Button
              type="submit"
              variant="primary"
              disabled={pending || Boolean(blocked) || emptyAudience}
            >
              {pending
                ? "Saving…"
                : timing === "scheduled"
                  ? "Schedule campaign"
                  : "Save draft"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>

          <p className="border-t border-subtle pt-3 text-small text-muted">
            Every message that goes out carries
            {companyNmls ? (
              <>
                {" "}
                Loan Factory, Inc. NMLS #<span className="tnum">{companyNmls}</span>
              </>
            ) : (
              " your company NMLS"
            )}{" "}
            and the Equal Housing Opportunity notice. They&rsquo;re added to the footer of the
            send — you don&rsquo;t have to type them into the template.
          </p>
        </form>
      </div>
    </div>
  );
}
