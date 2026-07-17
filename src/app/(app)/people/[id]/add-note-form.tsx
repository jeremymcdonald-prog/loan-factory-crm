"use client";

import { useActionState, useRef, useEffect } from "react";
import { addNote, type NoteState } from "./actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";

export function AddNoteForm({
  personId,
  loanId,
}: {
  personId: string;
  loanId: string | null;
}) {
  const [state, formAction, pending] = useActionState<NoteState, FormData>(addNote, {});
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the box once the note is saved, so the field never holds stale text.
  useEffect(() => {
    if (!pending && !state.error) formRef.current?.reset();
  }, [pending, state.error]);

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <input type="hidden" name="personId" value={personId} />
      {loanId ? <input type="hidden" name="loanId" value={loanId} /> : null}

      <label htmlFor="note-body" className="sr-only">
        Add a note
      </label>
      <Textarea
        id="note-body"
        name="body"
        rows={2}
        required
        placeholder="What happened? What should you remember?"
      />

      {state.error ? (
        <p role="alert" className="text-small text-critical">
          {state.error}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Save note"}
        </Button>
      </div>
    </form>
  );
}
