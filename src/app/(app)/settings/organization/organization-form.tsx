"use client";

import { useActionState } from "react";
import { updateOrganization, type OrgState } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export function OrganizationForm({
  name,
  companyNmls,
}: {
  name: string;
  companyNmls: string;
}) {
  const [state, formAction, pending] = useActionState<OrgState, FormData>(
    updateOrganization,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company name" htmlFor="name" required>
          <Input id="name" name="name" defaultValue={name} required />
        </Field>
        <Field
          label="Company NMLS"
          htmlFor="companyNmls"
          hint="Appears on every outbound message."
          required
        >
          <Input
            id="companyNmls"
            name="companyNmls"
            defaultValue={companyNmls}
            inputMode="numeric"
            required
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

      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
