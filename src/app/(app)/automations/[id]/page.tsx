import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, ShieldAlert } from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import { getAutomation, listAutomationRuns } from "@/lib/queries/automations";
import { relativeTime, absoluteTime, fullName } from "@/lib/format";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, SectionLabel } from "@/components/ui/card";
import { AutomationLines } from "../automation-lines";
import { AutomationControls } from "../automation-controls";
import { AutomationStateBadge, RunStateBadge, TierBadge, TIER_MEANING } from "../labels";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const user = await requireUser();
  const record = await queryAs(user, (db) => getAutomation(db, id));
  if (!record) return { title: "Not found" };
  return { title: record.name };
}

export default async function AutomationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const data = await queryAs(user, async (db) => {
    const record = await getAutomation(db, id);
    if (!record) return null;
    return { record, runs: await listAutomationRuns(db, id) };
  });

  if (!data) notFound();

  const { record, runs } = data;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={record.name}
        subtitle={record.description ?? undefined}
        meta={
          <div className="flex flex-wrap items-center gap-2">
            {record.ref ? <span className="text-small text-muted tnum">{record.ref}</span> : null}
            <AutomationStateBadge state={record.status} />
            <TierBadge tier={record.tier} />
            {record.waitingCount > 0 ? (
              <Badge tone="ally">{record.waitingCount} waiting for you</Badge>
            ) : null}
          </div>
        }
        action={
          <AutomationControls
            automation={{
              id: record.id,
              name: record.name,
              description: record.description,
              triggerText: record.triggerText,
              audienceText: record.audienceText,
              actionText: record.actionText,
              tier: record.tier,
              status: record.status,
            }}
            onRecord
          />
        }
      />

      {/* The one rung where Ally is not involved at all. Say so before anything else. */}
      {record.tier === "t0" ? (
        <div className="px-4 pt-4 sm:px-6">
          <div className="flex items-start gap-2.5 rounded-md border border-critical/25 bg-critical-bg px-3 py-2.5">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-critical" aria-hidden />
            <div>
              <p className="text-body font-semibold text-critical">
                Ally drafts nothing for this one.
              </p>
              <p className="mt-0.5 max-w-2xl text-small text-critical">
                It never writes a message and it never sends one. It creates the task and tells
                you — the conversation is yours to have.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Card>
            <CardHeader title="What this one does" />
            <div className="p-4">
              <AutomationLines
                triggerText={record.triggerText}
                audienceText={record.audienceText}
                actionText={record.actionText}
              />
            </div>
            <div className="border-t border-subtle px-4 py-3">
              <SectionLabel>How much it&rsquo;s allowed to do</SectionLabel>
              <div className="mt-1.5">
                <TierBadge tier={record.tier} />
              </div>
              <p className="mt-1.5 max-w-2xl text-small text-secondary">
                {TIER_MEANING[record.tier]}
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader title="Run history" meta="What happened, and who it happened to." />
            <div className="p-4">
              {runs.length > 0 ? (
                <ol className="space-y-3">
                  {runs.map((run) => (
                    <li
                      key={run.id}
                      className={cn(
                        "border-l-2 pl-3",
                        run.status === "queued_for_approval"
                          ? "border-ally-border"
                          : run.status === "failed"
                            ? "border-critical/25"
                            : "border-subtle",
                      )}
                    >
                      <p className="text-body text-secondary">{run.outcome}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-small text-muted">
                        {/* A test run names nobody, and a person who has since
                            been removed can no longer be named. Either way the
                            outcome above still says what happened. */}
                        {run.personId && run.firstName ? (
                          <>
                            <Link
                              href={`/people/${run.personId}`}
                              className="font-semibold text-action hover:underline"
                            >
                              {fullName(run.firstName, run.lastName ?? "")}
                            </Link>
                            <span aria-hidden>·</span>
                          </>
                        ) : null}
                        <RunStateBadge state={run.status} />
                        {run.stoppedReason ? (
                          <>
                            <span aria-hidden>·</span>
                            <span>Stopped: {run.stoppedReason}</span>
                          </>
                        ) : null}
                        <span aria-hidden>·</span>
                        <time
                          dateTime={run.createdAt.toISOString()}
                          title={absoluteTime(run.createdAt)}
                          className="tnum"
                        >
                          {relativeTime(run.createdAt)}
                        </time>
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-small text-muted">
                  {record.runCount > 0
                    ? `This one has run ${record.runCount} times, but there's no detail on file for those runs.`
                    : "This one hasn't run yet."}
                </p>
              )}

              {runs.length >= 50 ? (
                <p className="mt-3 text-small text-muted">Showing the 50 most recent.</p>
              ) : null}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Details" />
            <dl className="space-y-3 p-4">
              {record.templateName ? (
                <div>
                  <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                    Template it uses
                  </dt>
                  <dd className="mt-0.5 flex items-start gap-1.5">
                    <FileText className="mt-1 size-3.5 shrink-0 text-muted" aria-hidden />
                    <span className="min-w-0">
                      <span className="block text-body text-primary">{record.templateName}</span>
                      <span className="block text-small text-muted tnum">
                        {record.templateRef}
                      </span>
                    </span>
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                  Runs so far
                </dt>
                <dd className="mt-0.5 text-body text-primary tnum">
                  {record.runCount.toLocaleString("en-US")}
                </dd>
              </div>
              <div>
                <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                  Last run
                </dt>
                <dd className="mt-0.5 text-body text-primary tnum">
                  {record.lastRunAt ? relativeTime(record.lastRunAt) : "Never"}
                </dd>
              </div>
              <div>
                <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                  Built
                </dt>
                <dd className="mt-0.5 text-body text-primary tnum">
                  {relativeTime(record.createdAt)}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
