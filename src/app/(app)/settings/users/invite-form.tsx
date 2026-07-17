"use client";

import { useActionState, useState } from "react";
import { UserPlus, X } from "lucide-react";
import { inviteUser, type UserFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/lib/roles";

export function InviteForm() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<string>("lo");
  const [state, formAction, pending] = useActionState<UserFormState, FormData>(
    inviteUser,
    {},
  );

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)}>
        <UserPlus className="size-4" aria-hidden />
        Add a teammate
      </Button>
    );
  }

  return (
    <div className="w-full rounded-card border border-subtle bg-surface">
      <div className="flex items-center justify-between border-b border-subtle px-4 py-3">
        <h2 className="text-h3 font-semibold text-primary">Add a teammate</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="rounded p-1 text-muted hover:bg-sunken hover:text-primary"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <form action={formAction} className="space-y-4 p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="fullName" required>
            <Input id="fullName" name="fullName" required autoComplete="off" />
          </Field>

          <Field label="Work email" htmlFor="email" required>
            <Input id="email" name="email" type="email" required autoComplete="off" />
          </Field>

          <Field label="Role" htmlFor="role" hint={ROLE_DESCRIPTIONS[role]} required>
            <Select
              id="role"
              name="role"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="NMLS ID"
            htmlFor="nmlsId"
            hint={
              role === "lo"
                ? "Required — it appears in every signature."
                : "Optional for this role."
            }
          >
            <Input id="nmlsId" name="nmlsId" inputMode="numeric" autoComplete="off" />
          </Field>

          <Field label="Phone" htmlFor="phone">
            <Input id="phone" name="phone" type="tel" autoComplete="off" />
          </Field>

          <Field
            label="Starter password"
            htmlFor="tempPassword"
            hint="Share it in person or by phone. They can change it after signing in."
            required
          >
            <Input
              id="tempPassword"
              name="tempPassword"
              type="text"
              minLength={10}
              required
              autoComplete="off"
            />
          </Field>
        </div>

        {state.error ? (
          <p
            role="alert"
            className="rounded-md border border-critical/25 bg-critical-bg px-3 py-2 text-small text-critical"
          >
            {state.error}
          </p>
        ) : null}
        {state.ok ? (
          <p
            role="status"
            className="rounded-md border border-healthy/25 bg-healthy-bg px-3 py-2 text-small text-healthy"
          >
            {state.ok}
          </p>
        ) : null}

        <div className="flex items-center gap-2">
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? "Adding…" : "Add teammate"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
