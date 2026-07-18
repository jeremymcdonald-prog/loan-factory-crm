"use client";

import { useActionState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { submitForApproval, approveMessage, type ApprovalState } from "../actions";
import { Button } from "@/components/ui/button";

/**
 * The two moves in the approval flow, on the message they apply to.
 *
 * Neither button sends anything. "Submit for approval" hands a draft to
 * leadership; "Approve" marks it ready and leaves `sent_at` NULL — it queues
 * until an email/SMS provider is connected. The status badge next to these
 * buttons says exactly that, so the buttons themselves stay short.
 */
export function MessageActions({
  messageId,
  status,
  canApprove,
}: {
  messageId: string;
  status: string;
  canApprove: boolean;
}) {
  const [submitState, submitAction, submitting] = useActionState<ApprovalState, FormData>(
    submitForApproval,
    {},
  );
  const [approveState, approveAction, approving] = useActionState<ApprovalState, FormData>(
    approveMessage,
    {},
  );

  const error = submitState.error ?? approveState.error;

  if (status !== "draft" && !(status === "awaiting_approval" && canApprove)) {
    return null;
  }

  return (
    <div className="mt-2 space-y-1.5">
      {status === "draft" ? (
        <form action={submitAction}>
          <input type="hidden" name="messageId" value={messageId} />
          <Button type="submit" size="sm" variant="secondary" disabled={submitting}>
            <Send className="size-3.5" aria-hidden />
            {submitting ? "Submitting…" : "Submit for approval"}
          </Button>
        </form>
      ) : (
        <form action={approveAction}>
          <input type="hidden" name="messageId" value={messageId} />
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" size="sm" variant="primary" disabled={approving}>
              <CheckCircle2 className="size-3.5" aria-hidden />
              {approving ? "Approving…" : "Approve"}
            </Button>
            <span className="text-micro text-muted">
              Approving queues it — nothing sends until a provider is connected.
            </span>
          </div>
        </form>
      )}

      {error ? (
        <p role="alert" className="text-small text-critical">
          {error}
        </p>
      ) : null}
    </div>
  );
}
