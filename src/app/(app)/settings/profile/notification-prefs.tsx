"use client";

import { useActionState } from "react";
import { updateNotificationPrefs, type ProfileState } from "./actions";
import { Button } from "@/components/ui/button";

const PREFS: { key: string; label: string; description: string }[] = [
  {
    key: "dailySummary",
    label: "Daily summary email",
    description: "One email each morning with your day: tasks, appointments, and files that moved.",
  },
  {
    key: "taskReminders",
    label: "Task reminders",
    description: "A nudge when a task you own comes due.",
  },
  {
    key: "leadAssigned",
    label: "Lead assigned to me",
    description: "The moment a new lead lands on your plate, so speed-to-contact stays fast.",
  },
  {
    key: "approvalAlerts",
    label: "AI approval alerts",
    description: "Know when the AI assistant has prepared something waiting on your approval.",
  },
  {
    key: "teamActivity",
    label: "Team activity",
    description: "Stage changes and new leads across your team.",
  },
];

export function NotificationPrefs({ prefs }: { prefs: Record<string, boolean> }) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    updateNotificationPrefs,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <ul className="space-y-3">
        {PREFS.map((pref) => (
          <li key={pref.key}>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name={pref.key}
                defaultChecked={prefs[pref.key] ?? true}
                className="mt-1 size-4 shrink-0 cursor-pointer rounded-sm border-strong accent-action"
              />
              <span className="min-w-0">
                <span className="block font-semibold text-primary">{pref.label}</span>
                <span className="block text-small text-muted">{pref.description}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>

      <p className="text-small text-muted">
        Delivery starts when an email account is connected in Settings → Integrations; your
        choices are saved now.
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
        {pending ? "Saving…" : "Save preferences"}
      </Button>
    </form>
  );
}
