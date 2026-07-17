import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { CheckCircle2 } from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import { user as userTable } from "@/db/schema";
import { buildQueue, todayStats, recentActivity } from "@/lib/queries/today";
import { buildBriefing } from "./briefing";
import { QueueItemRow } from "./queue-item";
import { moneyCompact, relativeTime } from "@/lib/format";
import { AllyMark } from "@/components/ally/ally-card";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Today" };
export const dynamic = "force-dynamic";

const EVENT_LABELS: Record<string, string> = {
  "touch.logged": "Logged a touch with",
  "loan.stage_advanced": "Moved a file forward for",
  "lead.captured": "Captured a lead:",
  "message.approved": "Approved a message to",
};

export default async function TodayPage() {
  const user = await requireUser();
  const firstName = user.fullName.split(" ")[0];
  const now = new Date();

  const { items, stats, activity, nmls } = await queryAs(user, async (db) => {
    const [me] = await db
      .select({ nmlsId: userTable.nmlsId })
      .from(userTable)
      .where(eq(userTable.id, user.userId))
      .limit(1);

    return {
      items: await buildQueue(db, user, now),
      stats: await todayStats(db, user),
      activity: await recentActivity(db, user),
      nmls: me?.nmlsId ?? null,
    };
  });

  const briefing = buildBriefing(firstName, items, stats, now);
  const visible = items.slice(0, 20);
  const approvals = items.filter((i) => i.cls === "ally_approval").length;

  const statTiles = [
    { label: "Active files", value: String(stats.activeCount) },
    { label: "Funded this month", value: moneyCompact(stats.fundedMtdVolume) },
    { label: "Leads this week", value: String(stats.leadsThisWeek) },
    { label: "Closing in 7 days", value: String(stats.closingNext7) },
  ];

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      {/* The briefing: an executive summary, in the Loan Factory voice.
          Greeting + one-line read, concise bullets, then the top three as
          real, tappable actions. */}
      <section className="rounded-card border border-ally-border bg-ally-bg/40 p-5">
        <div className="flex items-center gap-2.5">
          <AllyMark />
          <h1 className="text-h1 font-semibold tracking-tight text-primary">
            {briefing.greeting}
          </h1>
          <span className="ml-auto hidden text-label font-semibold text-ally sm:block">
            Prepared by Ally
          </span>
        </div>

        {briefing.lead ? (
          <p className="mt-1.5 text-body text-secondary">{briefing.lead}</p>
        ) : null}

        {briefing.bullets.length > 0 ? (
          <ul className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {briefing.bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 text-body text-secondary">
                <span
                  aria-hidden
                  className="mt-[7px] size-1.5 shrink-0 rounded-full bg-ally/60"
                />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {briefing.topActions.length > 0 ? (
          <div className="mt-4 border-t border-ally-border/70 pt-3.5">
            <p className="text-label font-semibold uppercase tracking-wide text-ally">
              If you only do three things today
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {briefing.topActions.map((a, i) => (
                <Link
                  key={a.href + i}
                  href={a.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-control px-3 py-2 text-small font-semibold transition-colors",
                    i === 0
                      ? "bg-action text-action-fg shadow-e1 hover:bg-action-hover"
                      : "border border-strong bg-surface text-primary hover:border-brand hover:bg-action-tint",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-4 shrink-0 place-items-center rounded-full text-[10px] font-bold tnum",
                      i === 0 ? "bg-white/25 text-white" : "bg-brand text-white",
                    )}
                  >
                    {i + 1}
                  </span>
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {/* Four glanceable numbers. */}
      <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-subtle bg-subtle sm:grid-cols-4">
        {statTiles.map((s) => (
          <div key={s.label} className="bg-surface px-4 py-3">
            <p className="text-label font-semibold uppercase tracking-wide text-muted">
              {s.label}
            </p>
            <p className="mt-1 text-metric-md font-semibold text-primary tnum">{s.value}</p>
          </div>
        ))}
      </div>

      {/* The queue: one ranked list. */}
      <Card className="mt-4">
        {/* Wraps rather than collides once the chip and the heading can't share a line. */}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-b border-subtle px-4 py-3">
          <h2 className="text-h3 font-semibold text-primary">
            What needs you
            {items.length > 0 ? (
              <span className="ml-1.5 text-small font-normal text-muted tnum">
                {items.length}
              </span>
            ) : null}
          </h2>
          {approvals > 0 ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded border border-ally-border bg-ally-bg px-1.5 py-0.5 text-label font-semibold text-ally">
              {approvals} waiting for your approval
            </span>
          ) : null}
        </div>

        {items.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <CheckCircle2 className="mx-auto size-6 text-healthy" aria-hidden />
            <p className="mt-3 text-h3 font-semibold text-primary">
              You&rsquo;re caught up.
            </p>
            <p className="mx-auto mt-1 max-w-sm text-body text-secondary">
              Nothing needs you right now.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Link
                href="/pipeline"
                className="inline-flex h-9 items-center rounded-control bg-action px-3.5 text-body font-semibold text-action-fg hover:bg-action-hover"
              >
                Look at your pipeline
              </Link>
              <Link
                href="/people?type=past_client"
                className="inline-flex h-9 items-center rounded-control border border-strong bg-surface px-3.5 text-body font-semibold text-primary hover:bg-sunken"
              >
                Review past clients
              </Link>
            </div>
          </div>
        ) : (
          <ul>
            {visible.map((item) => (
              <QueueItemRow key={item.id} item={item} loNmls={nmls} />
            ))}
          </ul>
        )}

        {items.length > 20 ? (
          <p className="border-t border-subtle px-4 py-2.5 text-small text-muted">
            Showing the top 20 of {items.length}.
          </p>
        ) : null}
      </Card>

      {/* Recent activity, lowest priority. */}
      {activity.length > 0 ? (
        <details className="mt-4 group">
          <summary className="cursor-pointer list-none text-small font-semibold text-secondary hover:text-primary">
            What happened recently
          </summary>
          <Card className="mt-2">
            <ol className="divide-y divide-subtle">
              {activity.map((a) => (
                <li key={a.id} className="flex items-baseline gap-2 px-4 py-2">
                  <span className="text-small text-secondary">
                    {a.actorName ?? "Someone"}{" "}
                    <span className="text-muted">
                      {EVENT_LABELS[a.kind] ?? a.kind.replace(/[._]/g, " ")}
                    </span>{" "}
                    {a.firstName ? (
                      <Link
                        href={`/people/${a.personId}`}
                        className="font-semibold text-primary hover:text-action"
                      >
                        {a.firstName} {a.lastName}
                      </Link>
                    ) : null}
                  </span>
                  <span className="ml-auto shrink-0 text-small text-muted tnum">
                    {relativeTime(a.createdAt, now)}
                  </span>
                </li>
              ))}
            </ol>
          </Card>
        </details>
      ) : null}
    </div>
  );
}
