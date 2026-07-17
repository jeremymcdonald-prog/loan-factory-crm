"use client";

import { useFormStatus } from "react-dom";
import { Eye } from "lucide-react";
import { recordViewAs } from "./actions";
import { Button } from "@/components/ui/button";

/**
 * Lives inside the form so `useFormStatus` can see the submission. The audit
 * row is written before the redirect, so "Opening…" is honest: the wait is the
 * record being made.
 */
function ViewAsSubmit({ firstName }: { firstName: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="primary" disabled={pending}>
      <Eye className="size-4" aria-hidden />
      {pending ? "Opening…" : `View ${firstName}'s queue`}
    </Button>
  );
}

/**
 * A form rather than a link: opening someone's queue writes an audit row, and
 * a plain link would make that a side effect of a GET. It also still works if
 * JavaScript never arrives — only the pending label needs the client.
 */
export function ViewAsButton({
  userId,
  firstName,
}: {
  userId: string;
  firstName: string;
}) {
  return (
    <form action={recordViewAs}>
      <input type="hidden" name="userId" value={userId} />
      <ViewAsSubmit firstName={firstName} />
    </form>
  );
}
