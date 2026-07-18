"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updateProfile, type ProfileState } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { US_TIMEZONES, LANGUAGE_OPTIONS } from "@/lib/profile-validation";

export function ProfileForm({
  fullName,
  title,
  phone,
  email,
  nmlsId,
  teamName,
  timezone,
  language,
  links,
}: {
  fullName: string;
  title: string;
  phone: string;
  email: string;
  nmlsId: string;
  teamName: string | null;
  timezone: string;
  language: string;
  links: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    updateProfile,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="fullName" required>
          <Input id="fullName" name="fullName" defaultValue={fullName} required />
        </Field>
        <Field label="Job title" htmlFor="title" hint="Shown in your standard signature.">
          <Input id="title" name="title" defaultValue={title} placeholder="Loan officer" />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <Input id="phone" name="phone" type="tel" defaultValue={phone} />
        </Field>
        <Field
          label="Email"
          htmlFor="email"
          hint="Your sign-in email; an administrator changes this."
        >
          <Input id="email" name="email" defaultValue={email} readOnly disabled />
        </Field>
        <Field label="NMLS ID" htmlFor="nmlsId" hint="Appears on every outbound message.">
          <Input id="nmlsId" name="nmlsId" defaultValue={nmlsId} inputMode="numeric" />
        </Field>
        <div className="space-y-1.5">
          <span className="block text-label font-semibold text-secondary">Team</span>
          <div className="flex h-10 w-full items-center rounded-control border border-strong bg-sunken px-3 text-body text-primary">
            {teamName ?? "No team assigned"}
          </div>
          <p className="text-small text-muted">
            Change this on the{" "}
            <Link
              href="/team"
              className="font-semibold text-action hover:underline"
            >
              Team page
            </Link>
            .
          </p>
        </div>
        <Field label="Timezone" htmlFor="timezone" hint="Used for reminders and daily summaries.">
          <Select id="timezone" name="timezone" defaultValue={timezone}>
            <option value="">Not set</option>
            {US_TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Preferred language" htmlFor="language">
          <Select id="language" name="language" defaultValue={language}>
            {LANGUAGE_OPTIONS.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div>
        <h3 className="text-label font-semibold uppercase tracking-wide text-muted">
          Your links
        </h3>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <Field label="Website" htmlFor="website">
            <Input
              id="website"
              name="website"
              type="url"
              defaultValue={links.website ?? ""}
              placeholder="https://…"
            />
          </Field>
          <Field label="LinkedIn" htmlFor="linkedin">
            <Input
              id="linkedin"
              name="linkedin"
              type="url"
              defaultValue={links.linkedin ?? ""}
              placeholder="https://linkedin.com/in/…"
            />
          </Field>
          <Field label="Facebook" htmlFor="facebook">
            <Input
              id="facebook"
              name="facebook"
              type="url"
              defaultValue={links.facebook ?? ""}
              placeholder="https://facebook.com/…"
            />
          </Field>
          <Field label="Instagram" htmlFor="instagram">
            <Input
              id="instagram"
              name="instagram"
              type="url"
              defaultValue={links.instagram ?? ""}
              placeholder="https://instagram.com/…"
            />
          </Field>
        </div>
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
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
