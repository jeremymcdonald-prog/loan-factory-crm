"use client";

import { useTransition } from "react";
import { changeRole } from "./actions";
import { ROLES, ROLE_LABELS } from "@/lib/roles";

/**
 * Changing a role takes effect immediately and is audited. Kept as a plain
 * select — the change is reversible and low-stakes, so it does not deserve a
 * confirmation dialog.
 */
export function RoleSelect({
  userId,
  currentRole,
  personName,
}: {
  userId: string;
  currentRole: string;
  personName: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={currentRole}
      disabled={pending}
      aria-label={`Role for ${personName}`}
      onChange={(e) => {
        const formData = new FormData();
        formData.set("userId", userId);
        formData.set("role", e.target.value);
        startTransition(() => {
          void changeRole(formData);
        });
      }}
      className="h-8 rounded-md border border-subtle bg-transparent px-2 text-small text-secondary hover:border-strong focus:border-action focus:outline-none disabled:opacity-50"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {ROLE_LABELS[r]}
        </option>
      ))}
    </select>
  );
}
