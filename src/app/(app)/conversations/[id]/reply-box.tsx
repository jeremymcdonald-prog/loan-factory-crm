"use client";

import { useActionState, useRef, useEffect } from "react";
import { FileText } from "lucide-react";
import { sendReply, type ReplyState } from "../actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";

/**
 * What actually happens when the button is pressed, said in advance and said
 * again afterwards. No email or texting account is connected to this CRM, so
 * a reply is written down and nothing leaves the building. The officer needs
 * to know that before they type, not after the borrower stops answering.
 */
const AFTER_SAVE: Record<"email" | "sms", string> = {
  email: "Saved as a draft. Sending connects when your email account is linked in Settings.",
  sms: "Saved as a draft. Sending connects when your texting number is linked in Settings.",
};

export function ReplyBox({
  conversationId,
  channel,
  toName,
}: {
  conversationId: string;
  channel: "email" | "sms";
  toName: string;
}) {
  const [state, formAction, pending] = useActionState<ReplyState, FormData>(sendReply, {});
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the box once the draft is saved — the thread above now holds it, and
  // a filled box would invite the same reply twice.
  useEffect(() => {
    if (state.savedAt) formRef.current?.reset();
  }, [state.savedAt]);

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <input type="hidden" name="conversationId" value={conversationId} />

      <label htmlFor="reply-body" className="sr-only">
        Write your reply to {toName}
      </label>
      <Textarea
        id="reply-body"
        name="body"
        rows={4}
        required
        placeholder={`Write your reply to ${toName}…`}
      />

      {state.error ? (
        <p role="alert" className="text-small text-critical">
          {state.error}
        </p>
      ) : null}

      {state.savedAt ? (
        <p
          role="status"
          className="flex items-start gap-2 rounded-md border border-warning/25 bg-warning-bg px-2.5 py-2 text-small text-warning"
        >
          <FileText className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {AFTER_SAVE[channel]}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-small text-muted">
          Nothing sends from here yet. Your reply is saved as a draft on this thread.
        </p>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving…" : "Save draft"}
        </Button>
      </div>
    </form>
  );
}
