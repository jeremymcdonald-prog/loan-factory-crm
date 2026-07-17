"use client";

import { useActionState, useState } from "react";
import { PenLine } from "lucide-react";
import { updateSignature, type ProfileState } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";

/** The standard Loan Factory signature, built from the user's real details. */
function standardSignature(details: {
  fullName: string;
  title: string;
  nmlsId: string;
  phone: string;
}): string {
  const lines = [
    details.fullName,
    details.title,
    details.nmlsId ? `NMLS #${details.nmlsId}` : "",
    details.phone,
    "Loan Factory · Company NMLS 320841",
    "Equal Housing Opportunity",
  ];
  return lines.filter(Boolean).join("\n");
}

export function SignatureEditor({
  signature,
  defaultSenderName,
  replyToEmail,
  fullName,
  title,
  nmlsId,
  phone,
}: {
  signature: string;
  defaultSenderName: string;
  replyToEmail: string;
  fullName: string;
  title: string;
  nmlsId: string;
  phone: string;
}) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    updateSignature,
    {},
  );
  const [value, setValue] = useState(signature);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Field
          label="Signature"
          htmlFor="signature"
          hint="Plain text; line breaks are kept."
        >
          <Textarea
            id="signature"
            name="signature"
            rows={7}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Your name, title, NMLS, and phone…"
          />
        </Field>

        <div className="space-y-1.5">
          <p className="text-label font-semibold text-secondary">Preview</p>
          <div className="rounded-card border border-subtle bg-sunken p-4">
            <p className="text-small text-muted">— sent from Loan Factory CRM —</p>
            {value.trim() ? (
              <p className="mt-2 whitespace-pre-line border-t border-subtle pt-2 text-body text-secondary">
                {value}
              </p>
            ) : (
              <p className="mt-2 border-t border-subtle pt-2 text-body text-disabled">
                Nothing yet — write a signature or insert the standard one.
              </p>
            )}
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => setValue(standardSignature({ fullName, title, nmlsId, phone }))}
      >
        <PenLine className="size-4" aria-hidden />
        Insert standard signature
      </Button>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Default sender name"
          htmlFor="defaultSenderName"
          hint="The name recipients see in their inbox."
        >
          <Input
            id="defaultSenderName"
            name="defaultSenderName"
            defaultValue={defaultSenderName}
            placeholder={fullName}
          />
        </Field>
        <Field
          label="Reply-to address"
          htmlFor="replyToEmail"
          hint="Replies go here instead of the sending address."
        >
          <Input
            id="replyToEmail"
            name="replyToEmail"
            type="email"
            defaultValue={replyToEmail}
            placeholder="you@example.com"
          />
        </Field>
      </div>

      <p className="text-small text-muted">
        Your signature is added to campaigns, newsletters, and approved one-to-one messages.
      </p>

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
        {pending ? "Saving…" : "Save signature"}
      </Button>
    </form>
  );
}
