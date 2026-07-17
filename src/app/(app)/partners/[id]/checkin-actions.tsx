"use client";

import { useActionState } from "react";
import { decidePartnerCheckin, type TouchState } from "./actions";
import { Button } from "@/components/ui/button";

/**
 * The verdict on Ally's check-in suggestion.
 *
 * There is no "Edit then send" here, and that is deliberate: Ally hasn't
 * written anything to send. Approve puts the reach-out on your task list; Skip
 * says no. Neither one contacts the partner.
 */
export function CheckinActions({
  partnerId,
  quietDays,
}: {
  partnerId: string;
  quietDays: number;
}) {
  const [state, formAction, pending] = useActionState<TouchState, FormData>(
    decidePartnerCheckin,
    {},
  );

  return (
    <form action={formAction} className="w-full space-y-2">
      <input type="hidden" name="partnerId" value={partnerId} />
      <input type="hidden" name="quietDays" value={quietDays} />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="submit"
          name="verdict"
          value="approve"
          variant="primary"
          size="sm"
          disabled={pending}
        >
          {pending ? "Saving…" : "Approve"}
        </Button>
        <Button type="submit" name="verdict" value="skip" variant="ghost" size="sm" disabled={pending}>
          Skip
        </Button>
      </div>

      {state.error ? (
        <p role="alert" className="text-small text-critical">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
