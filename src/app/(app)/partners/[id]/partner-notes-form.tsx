"use client";

import { useActionState, useState } from "react";
import { savePartnerNotes, type TouchState } from "./actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";

/**
 * The standing notes on a partner. Not a log — the one paragraph that tells you
 * how to work with this person before you pick up the phone.
 */
export function PartnerNotesForm({
  partnerId,
  notesSummary,
  partnerName,
}: {
  partnerId: string;
  notesSummary: string | null;
  partnerName: string;
}) {
  const [state, formAction, pending] = useActionState<TouchState, FormData>(savePartnerNotes, {});
  const [value, setValue] = useState(notesSummary ?? "");

  const dirty = value.trim() !== (notesSummary ?? "").trim();

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="partnerId" value={partnerId} />

      <label htmlFor="partner-notes" className="sr-only">
        What to remember about {partnerName}
      </label>
      <Textarea
        id="partner-notes"
        name="notesSummary"
        rows={4}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={`How ${partnerName} likes to work, what they send you, what they care about.`}
      />

      {state.error ? (
        <p role="alert" className="text-small text-critical">
          {state.error}
        </p>
      ) : null}

      {dirty ? (
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
