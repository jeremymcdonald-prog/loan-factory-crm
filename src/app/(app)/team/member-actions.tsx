"use client";

import { useActionState } from "react";
import { UserPlus, UserMinus } from "lucide-react";
import {
  addTeamMember,
  removeTeamMember,
  joinTeam,
  type TeamActionState,
} from "./actions";
import { cn } from "@/lib/cn";

/**
 * Membership controls — thin handles over the server actions, which re-check
 * every role themselves. Each renders its own success/error line in place, the
 * same pattern ReassignTask uses.
 */

/** Leader-only: pull a searched loan officer onto the leader's team. */
export function AddMemberButton({
  userId,
  fullName,
}: {
  userId: string;
  fullName: string;
}) {
  const [state, formAction, pending] = useActionState<TeamActionState, FormData>(
    addTeamMember,
    {},
  );

  if (state.ok) {
    return <span className="text-small font-semibold text-healthy">{state.ok}</span>;
  }

  return (
    <form action={formAction} className="flex flex-wrap items-center justify-end gap-1.5">
      <input type="hidden" name="userId" value={userId} />
      <button
        type="submit"
        disabled={pending}
        aria-label={`Add ${fullName} to your team`}
        className={cn(
          "inline-flex h-7 items-center gap-1.5 rounded-control bg-action px-2.5",
          "text-small font-semibold text-action-fg hover:bg-action-hover disabled:opacity-50",
        )}
      >
        <UserPlus className="size-3.5" aria-hidden />
        {pending ? "Adding…" : "Add to team"}
      </button>
      {state.error ? (
        <span className="text-small text-critical">{state.error}</span>
      ) : null}
    </form>
  );
}

/** Leader-only: take a member off the team, with a confirm first. */
export function RemoveMemberButton({
  userId,
  fullName,
  teamName,
}: {
  userId: string;
  fullName: string;
  teamName: string;
}) {
  const [state, formAction, pending] = useActionState<TeamActionState, FormData>(
    removeTeamMember,
    {},
  );

  if (state.ok) {
    return <span className="text-small font-semibold text-healthy">{state.ok}</span>;
  }

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (
          !window.confirm(
            `Remove ${fullName} from ${teamName}? Their work stays theirs — they just won't be on this roster.`,
          )
        ) {
          e.preventDefault();
        }
      }}
      className="flex flex-wrap items-center justify-end gap-1.5"
    >
      <input type="hidden" name="userId" value={userId} />
      <button
        type="submit"
        disabled={pending}
        aria-label={`Remove ${fullName} from ${teamName}`}
        className={cn(
          "inline-flex items-center gap-1 text-small font-semibold",
          "text-secondary hover:text-critical disabled:opacity-50",
        )}
      >
        <UserMinus className="size-3.5" aria-hidden />
        {pending ? "Removing…" : "Remove"}
      </button>
      {state.error ? (
        <span className="text-small text-critical">{state.error}</span>
      ) : null}
    </form>
  );
}

/** Self-service: put yourself on a team. */
export function JoinTeamButton({ teamId, teamName }: { teamId: string; teamName: string }) {
  const [state, formAction, pending] = useActionState<TeamActionState, FormData>(
    joinTeam,
    {},
  );

  if (state.ok) {
    return <span className="text-small font-semibold text-healthy">{state.ok}</span>;
  }

  return (
    <form action={formAction} className="flex flex-wrap items-center justify-end gap-1.5">
      <input type="hidden" name="teamId" value={teamId} />
      <button
        type="submit"
        disabled={pending}
        aria-label={`Join ${teamName}`}
        className={cn(
          "inline-flex h-7 items-center rounded-control border border-strong bg-surface px-2.5",
          "text-small font-semibold text-primary hover:border-brand hover:text-action disabled:opacity-50",
        )}
      >
        {pending ? "Joining…" : "Join"}
      </button>
      {state.error ? (
        <span className="text-small text-critical">{state.error}</span>
      ) : null}
    </form>
  );
}
