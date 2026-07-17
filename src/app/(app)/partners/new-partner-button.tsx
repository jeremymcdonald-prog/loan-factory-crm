"use client";

import { useActionState, useState } from "react";
import { UserPlus, X } from "lucide-react";
import { createPartner, type PartnerFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import {
  PARTNER_KINDS,
  PARTNER_KIND_LABELS,
  PARTNER_TIERS,
  PARTNER_TIER_LABELS,
  PARTNER_TIER_HINTS,
} from "./vocabulary";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "vi", label: "Vietnamese" },
  { value: "zh", label: "Chinese" },
  { value: "es", label: "Spanish" },
  { value: "ru", label: "Russian" },
];

export function NewPartnerButton() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<PartnerFormState, FormData>(
    createPartner,
    {},
  );

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)}>
        <UserPlus className="size-4" aria-hidden />
        Add a partner
      </Button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-partner-title"
    >
      <div className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-xl border border-subtle bg-surface shadow-e3 sm:rounded-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-subtle bg-surface px-4 py-3">
          <h2 id="new-partner-title" className="text-h3 font-semibold text-primary">
            Add a partner
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="rounded p-1 text-muted hover:bg-raised hover:text-primary"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <form action={formAction} className="space-y-4 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name" htmlFor="firstName" required>
              <Input id="firstName" name="firstName" required autoFocus autoComplete="off" />
            </Field>
            <Field label="Last name" htmlFor="lastName" required>
              <Input id="lastName" name="lastName" required autoComplete="off" />
            </Field>
          </div>

          <Field label="Company" htmlFor="company" hint="The brokerage, builder, or firm.">
            <Input id="company" name="company" autoComplete="off" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="What do they do?" htmlFor="kind">
              <Select id="kind" name="kind" defaultValue="real_estate_agent">
                {PARTNER_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {PARTNER_KIND_LABELS[k]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Where's the relationship?"
              htmlFor="tier"
              hint="You can change this any time."
            >
              <Select id="tier" name="tier" defaultValue="new">
                {PARTNER_TIERS.map((t) => (
                  <option key={t} value={t}>
                    {PARTNER_TIER_LABELS[t]} — {PARTNER_TIER_HINTS[t]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email" htmlFor="email">
              <Input id="email" name="email" type="email" autoComplete="off" />
            </Field>
            <Field label="Phone" htmlFor="phone">
              <Input id="phone" name="phone" type="tel" autoComplete="off" />
            </Field>
          </div>

          <Field
            label="Preferred language"
            htmlFor="preferredLanguage"
            hint="Ally drafts in this language."
          >
            <Select id="preferredLanguage" name="preferredLanguage" defaultValue="en">
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="What should you remember about them?"
            htmlFor="notesSummary"
            hint="Optional. How they like to work, what they send you, what they care about."
          >
            <Textarea
              id="notesSummary"
              name="notesSummary"
              rows={3}
              placeholder="Sends two or three buyers a quarter. Prefers a text before a call."
            />
          </Field>

          {state.error ? (
            <p
              role="alert"
              className="rounded-md border border-critical/25 bg-critical-bg px-3 py-2 text-small text-critical"
            >
              {state.error}
            </p>
          ) : null}

          <div className="flex items-center gap-2 pt-1">
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? "Saving…" : "Add partner"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
