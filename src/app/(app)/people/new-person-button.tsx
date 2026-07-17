"use client";

import { useActionState, useState } from "react";
import { UserPlus, X } from "lucide-react";
import { createPerson, type PersonFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

const INTENTS = [
  { value: "none", label: "No opportunity yet — just a contact" },
  { value: "purchase", label: "Buying a home" },
  { value: "refinance", label: "Refinancing" },
  { value: "heloc", label: "HELOC / second mortgage" },
  { value: "quote", label: "Asked for a quote" },
  { value: "rate_alert", label: "Watching rates" },
  { value: "qualify", label: "Wants to know what they qualify for" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "vi", label: "Vietnamese" },
  { value: "zh", label: "Chinese" },
  { value: "es", label: "Spanish" },
  { value: "ru", label: "Russian" },
];

export function NewPersonButton() {
  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState("purchase");
  const [state, formAction, pending] = useActionState<PersonFormState, FormData>(
    createPerson,
    {},
  );

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)}>
        <UserPlus className="size-4" aria-hidden />
        Add a person
      </Button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-person-title"
    >
      <div className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-xl border border-subtle bg-surface shadow-e3 sm:rounded-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-subtle bg-surface px-4 py-3">
          <h2 id="new-person-title" className="text-h3 font-semibold text-primary">
            Add a person
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
            label="What do they need?"
            htmlFor="intent"
            hint={
              intent === "none"
                ? "They'll be saved as a contact. You can open an opportunity later."
                : "This opens an opportunity at stage 1, New lead."
            }
          >
            <Select
              id="intent"
              name="intent"
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
            >
              {INTENTS.map((i) => (
                <option key={i.value} value={i.value}>
                  {i.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Where did they come from?" htmlFor="source" hint="Optional.">
            <Input
              id="source"
              name="source"
              placeholder="Referral from Jenna Alvarez, open house, Facebook ad…"
              autoComplete="off"
            />
          </Field>

          <Field label="First note" htmlFor="note" hint="Optional. What should you remember?">
            <Textarea id="note" name="note" rows={3} />
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
              {pending ? "Saving…" : "Add person"}
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
