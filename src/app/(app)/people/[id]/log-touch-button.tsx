"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { PhoneCall, X } from "lucide-react";
import { logTouch, type NoteState } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/field";
import { cn } from "@/lib/cn";

const OUTCOMES = [
  { value: "connected", label: "Spoke with them" },
  { value: "voicemail", label: "Left a voicemail" },
  { value: "no_answer", label: "No answer" },
  { value: "emailed", label: "Sent an email" },
  { value: "texted", label: "Sent a text" },
  { value: "met", label: "Met in person" },
];

/**
 * The person record's one primary action: say what just happened.
 * Logging a touch is what keeps the relationship clock honest — it clears
 * stall flags and stops the speed-to-lead timer.
 */
export function LogTouchButton({
  personId,
  personName,
  loanId,
}: {
  personId: string;
  personName: string;
  loanId?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [outcome, setOutcome] = useState("connected");
  const [state, formAction, pending] = useActionState<NoteState, FormData>(logTouch, {});
  const submitted = useRef(false);

  // Close only on the pending -> settled transition of a real submission.
  // Watching `!pending` alone would fire the moment the dialog opens.
  useEffect(() => {
    if (pending) {
      submitted.current = true;
      return;
    }
    if (submitted.current && !state.error) {
      submitted.current = false;
      setOpen(false);
    }
  }, [pending, state.error]);

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)}>
        <PhoneCall className="size-4" aria-hidden />
        Log a touch
      </Button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="log-touch-title"
    >
      <div className="w-full max-w-md rounded-t-xl border border-subtle bg-surface shadow-e3 sm:rounded-xl">
        <div className="flex items-center justify-between border-b border-subtle px-4 py-3">
          <h2 id="log-touch-title" className="text-h3 font-semibold text-primary">
            Log a touch with {personName}
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
          <input type="hidden" name="personId" value={personId} />
          {loanId ? <input type="hidden" name="loanId" value={loanId} /> : null}
          <input type="hidden" name="outcome" value={outcome} />

          <fieldset>
            <legend className="mb-1.5 text-label font-semibold text-secondary">
              What happened?
            </legend>
            <div className="grid grid-cols-2 gap-1.5">
              {OUTCOMES.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setOutcome(o.value)}
                  aria-pressed={outcome === o.value}
                  className={cn(
                    "rounded-md border px-2.5 py-2 text-left text-small font-medium transition-colors",
                    outcome === o.value
                      ? "border-action bg-action/10 text-primary"
                      : "border-subtle text-secondary hover:border-strong hover:text-primary",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </fieldset>

          <Field label="Anything worth remembering?" htmlFor="touch-body">
            <Textarea
              id="touch-body"
              name="body"
              rows={3}
              placeholder="Optional — what was said, what's next."
            />
          </Field>

          {state.error ? (
            <p role="alert" className="text-small text-critical">
              {state.error}
            </p>
          ) : null}

          <div className="flex items-center gap-2">
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? "Saving…" : "Log it"}
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
