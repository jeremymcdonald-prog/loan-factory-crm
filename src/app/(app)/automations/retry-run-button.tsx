"use client";

import { useActionState } from "react";
import { RotateCcw } from "lucide-react";
import { retryAutomationRun, type AutomationActionState } from "./actions";
import { Button } from "@/components/ui/button";

/**
 * The one thing a failed run lets you do: queue a fresh attempt in its place.
 *
 * Nothing here replays whatever the failed run tried to send — see
 * `retryAutomationRun`. Once queued, the new row shows up on its own at the
 * top of the run history below; this button doesn't try to render it itself.
 */
export function RetryRunButton({ automationId, runId }: { automationId: string; runId: string }) {
  const [state, formAction, pending] = useActionState<AutomationActionState, FormData>(
    retryAutomationRun,
    {},
  );

  if (state.retried) {
    return <p className="mt-1 text-small text-muted">Retry queued. Nothing was sent.</p>;
  }

  return (
    <form action={formAction} className="mt-1 flex flex-wrap items-center gap-2">
      <input type="hidden" name="automationId" value={automationId} />
      <input type="hidden" name="runId" value={runId} />
      <Button type="submit" variant="ghost" size="sm" disabled={pending}>
        <RotateCcw className="size-3.5" aria-hidden />
        {pending ? "Queuing…" : "Retry"}
      </Button>
      {state.error ? (
        <span role="alert" className="text-small text-critical">
          {state.error}
        </span>
      ) : null}
    </form>
  );
}
