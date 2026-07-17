"use client";

import { useActionState, useState } from "react";
import { Plus, X } from "lucide-react";
import { createAutomation, type AutomationFormState } from "./actions";
import { TIER_LABEL } from "./labels";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";

/**
 * Building an automation is writing three sentences, not drawing a diagram.
 * The form asks the same three questions every card answers.
 */
export function NewAutomationButton() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<AutomationFormState, FormData>(
    createAutomation,
    {},
  );

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)}>
        <Plus className="size-4" aria-hidden />
        New automation
      </Button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-automation-title"
    >
      <div className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-xl border border-subtle bg-surface shadow-e3 sm:rounded-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-subtle bg-surface px-4 py-3">
          <h2 id="new-automation-title" className="text-h3 font-semibold text-primary">
            New automation
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

        <form action={formAction} className="space-y-4 p-4 text-left">
          <Field
            label="Name"
            htmlFor="name"
            required
            hint="What you'd call it when telling someone about it."
          >
            <Input
              id="name"
              name="name"
              placeholder="Preapproval expiring"
              required
              autoFocus
              autoComplete="off"
            />
          </Field>

          <Field
            label="Why it exists"
            htmlFor="description"
            hint="Optional. A line to remind you why you built it."
          >
            <Textarea
              id="description"
              name="description"
              rows={2}
              placeholder="A preapproval that lapses quietly costs a deal."
            />
          </Field>

          <Field
            label="When should it fire?"
            htmlFor="triggerText"
            required
            hint="The change that sets it off, in your own words."
          >
            <Input
              id="triggerText"
              name="triggerText"
              placeholder="A preapproval expires in 14 days"
              required
              autoComplete="off"
            />
          </Field>

          <Field
            label="Who does it touch?"
            htmlFor="audienceText"
            required
            hint="A person, a group, or nobody at all."
          >
            <Input
              id="audienceText"
              name="audienceText"
              placeholder="The borrower, and their agent if there is one"
              required
              autoComplete="off"
            />
          </Field>

          <Field label="What should happen?" htmlFor="actionText" required>
            <Input
              id="actionText"
              name="actionText"
              placeholder="Ally drafts a refresh offer — you approve before it sends"
              required
              autoComplete="off"
            />
          </Field>

          <p className="rounded-md border border-subtle bg-sunken px-3 py-2 text-small text-secondary">
            It saves as a draft, so nothing happens until you turn it on. And it starts at{" "}
            <span className="font-semibold text-primary">
              &ldquo;{TIER_LABEL.t2}&rdquo;
            </span>{" "}
            — Ally writes the message and holds it, and nothing reaches anyone until you say
            so.
          </p>

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
              {pending ? "Saving…" : "Save as draft"}
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
