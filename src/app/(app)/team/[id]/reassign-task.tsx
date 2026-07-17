"use client";

import { useActionState, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { reassignTask, type ReassignState } from "../actions";
import { cn } from "@/lib/cn";

export type ReassignTarget = { id: string; fullName: string };

/**
 * Leader-only control on a teammate's task: move it to someone else.
 * The action re-checks the role server-side; this is just the handle.
 */
export function ReassignTask({
  taskId,
  currentOwnerId,
  targets,
}: {
  taskId: string;
  currentOwnerId: string;
  targets: ReassignTarget[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ReassignState, FormData>(
    reassignTask,
    {},
  );

  if (state.ok) {
    return <span className="text-small text-healthy">{state.ok}</span>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-small font-semibold text-secondary hover:text-action"
      >
        <ArrowLeftRight className="size-3.5" aria-hidden />
        Reassign
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-1.5">
      <input type="hidden" name="taskId" value={taskId} />
      <label htmlFor={`reassign-${taskId}`} className="sr-only">
        Move this task to
      </label>
      <select
        id={`reassign-${taskId}`}
        name="toUserId"
        defaultValue=""
        disabled={pending}
        className="h-7 rounded-control border border-strong bg-surface px-1.5 text-small text-primary focus:border-brand focus:outline-none"
      >
        <option value="" disabled>
          Move to…
        </option>
        {targets
          .filter((t) => t.id !== currentOwnerId)
          .map((t) => (
            <option key={t.id} value={t.id}>
              {t.fullName}
            </option>
          ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className={cn(
          "h-7 rounded-control bg-action px-2 text-small font-semibold text-action-fg",
          "hover:bg-action-hover disabled:opacity-50",
        )}
      >
        {pending ? "Moving…" : "Move"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-small text-muted hover:text-primary"
      >
        Cancel
      </button>
      {state.error ? <span className="text-small text-critical">{state.error}</span> : null}
    </form>
  );
}
