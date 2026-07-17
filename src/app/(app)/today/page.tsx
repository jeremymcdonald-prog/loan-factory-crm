import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Today" };
export const dynamic = "force-dynamic";

/**
 * Today — the command center (Screen 1).
 *
 * The full briefing + prioritised work queue lands with the Today milestone.
 * Until the signal sources exist (leads, opportunities, tasks, Ally drafts),
 * this renders the specified caught-up state rather than a fake dashboard.
 */
export default async function TodayPage() {
  const user = await requireUser();
  const firstName = user.fullName.split(" ")[0];

  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <p className="text-label font-semibold uppercase tracking-wide text-muted">
        {today}
      </p>
      <h1 className="mt-1 text-h1 font-semibold tracking-tight text-primary">Today</h1>

      <Card className="mt-6">
        <div className="px-6 py-10 text-center">
          <p className="text-h2 font-semibold text-primary">
            You&rsquo;re set up, {firstName}.
          </p>
          <p className="mx-auto mt-2 max-w-md text-body text-secondary">
            Your work queue starts here. Add the people you&rsquo;re working with and
            Loan Factory CRM will tell you who needs you first.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Link
              href="/people"
              className="inline-flex h-9 items-center rounded-md bg-action px-3.5 text-body font-semibold text-action-fg hover:bg-action-hover"
            >
              Go to People
            </Link>
            <Link
              href="/settings/users"
              className="inline-flex h-9 items-center rounded-md border border-strong bg-surface px-3.5 text-body font-semibold text-primary hover:bg-raised"
            >
              Add your team
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
