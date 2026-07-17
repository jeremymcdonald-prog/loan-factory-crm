import type { Metadata } from "next";
import Link from "next/link";
import { ChartNoAxesCombined, Sparkles } from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import { intelligenceReport, hasNothingToReport } from "@/lib/queries/intelligence";
import { moneyCompact, relativeTime } from "@/lib/format";
import { ROLE_LABELS } from "@/lib/roles";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { StageChip } from "@/components/crm/stage-chip";
import { UrgencyDot } from "@/components/ui/badge";
import { StatTile, Figure, Bar, NoData, durationLabel, percentLabel } from "./report-ui";
import { allySummary } from "./summary";

export const metadata: Metadata = { title: "Intelligence" };
export const dynamic = "force-dynamic";

/**
 * Intelligence — how the team actually works, counted from its own records
 * (Screen 8).
 *
 * This is a CRM report and nothing else: how fast leads get answered, whether
 * follow-ups get done, which files went quiet, who sends business. There is no
 * revenue, no margin, and no rate data here, because the CRM does not originate,
 * price, or service anything (D-22). Volume is the sum of amounts the team
 * entered on their own opportunities — a relationship fact, not an accounting one.
 */
export default async function IntelligencePage() {
  const user = await requireUser();
  const report = await queryAs(user, (db) => intelligenceReport(db, user));

  const { leads, followUp, movement, conversion, partners, campaigns, stale, workload } = report;

  const subtitle =
    report.scope === "team"
      ? "Whole team. Every number here is counted from your team's own records — nothing is estimated."
      : "Your book. Every number here is counted from your own records — nothing is estimated.";

  // The one obvious action is whatever the numbers say is worst. Both targets
  // are real screens; neither promises anything that does not exist.
  const action =
    leads.uncontactedCount > 0
      ? { label: "Call the waiting leads", href: "/people?type=lead" }
      : { label: "Open the pipeline", href: "/pipeline" };

  if (hasNothingToReport(report)) {
    return (
      <>
        <PageHeader title="Intelligence" subtitle={subtitle} />
        <div className="p-4 sm:p-6">
          <div className="rounded-lg border border-subtle bg-surface px-6 py-14 text-center">
            <ChartNoAxesCombined className="mx-auto size-6 text-disabled" aria-hidden />
            <p className="mt-3 text-h3 font-semibold text-primary">
              There is nothing to report yet
            </p>
            <p className="mx-auto mt-1 max-w-md text-body text-secondary">
              This screen counts what your book has actually done — how fast leads get answered,
              whether follow-ups get done, which files went quiet. Add the people you&rsquo;re
              working with and the numbers will fill in on their own.
            </p>
            <Link
              href="/people"
              className="mt-4 inline-flex h-9 items-center rounded-md bg-action px-3.5 text-body font-semibold text-action-fg hover:bg-action-hover"
            >
              Go to People
            </Link>
          </div>
        </div>
      </>
    );
  }

  const followUpTotal = followUp.openCount + followUp.doneCount;
  const maxPhaseCount = Math.max(0, ...movement.byPhase.map((p) => p.count));
  const maxReferrals = Math.max(0, ...partners.top.map((p) => p.referralCount));
  const maxLoad = Math.max(0, ...workload.map((w) => w.openTasks + w.activeOpportunities));

  return (
    <>
      <PageHeader
        title="Intelligence"
        subtitle={subtitle}
        action={
          <Link
            href={action.href}
            className="inline-flex h-9 items-center rounded-md bg-action px-3.5 text-body font-semibold text-action-fg hover:bg-action-hover"
          >
            {action.label}
          </Link>
        }
      />

      {/* Ally reads the numbers back. It proposes nothing and contacts nobody. */}
      <section className="border-b border-subtle px-4 py-4 sm:px-6">
        <div className="rounded-lg border border-ally-border bg-ally-bg p-4">
          <div className="flex items-start gap-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-full border border-ally-border bg-surface">
              <Sparkles className="size-3.5 text-ally" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="text-h3 font-semibold text-primary">What the numbers say</h2>
              <p className="mt-1 text-body text-primary">{allySummary(report).join(" ")}</p>
              <p className="mt-2 text-small text-ally">
                Ally read this from the counts on this page. Nothing here is estimated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The four numbers a leader checks first. */}
      <div className="grid grid-cols-2 gap-px border-b border-subtle bg-subtle sm:grid-cols-4">
        <StatTile
          label="Waiting on a first call"
          value={String(leads.uncontactedCount)}
          urgent={leads.uncontactedCount > 0}
          meta={
            leads.uncontactedCount > 0 && leads.oldestUncontactedHours !== null
              ? `Oldest ${durationLabel(leads.oldestUncontactedHours * 60)}`
              : leads.totalLeads > 0
                ? "Every lead has been answered"
                : undefined
          }
        />
        <StatTile
          label="Median first response"
          value={leads.medianMinutes !== null ? durationLabel(leads.medianMinutes) : "—"}
          meta={
            leads.answeredCount > 0
              ? `From ${leads.answeredCount} answered ${leads.answeredCount === 1 ? "lead" : "leads"}`
              : "No lead answered yet"
          }
        />
        <StatTile
          label="Overdue follow-ups"
          value={String(followUp.overdueCount)}
          urgent={followUp.overdueCount > 0}
          meta={
            followUpTotal > 0
              ? `Of ${followUp.openCount} still open`
              : "No follow-ups on the books"
          }
        />
        <StatTile
          label="Files gone quiet"
          value={String(stale.totalStale)}
          urgent={stale.totalStale > 0}
          meta={
            conversion.activeCount > 0
              ? `Of ${conversion.activeCount} active ${conversion.activeCount === 1 ? "file" : "files"}`
              : undefined
          }
        />
      </div>

      <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-2">
        {/* 1. Lead response */}
        <Card>
          <CardHeader
            title="Lead response"
            meta="How long a new lead waits for a first answer. Speed here is the part of the job you control."
          />
          <div className="p-4">
            {leads.totalLeads === 0 ? (
              <NoData>
                No leads have been captured yet, so there is no response time to measure.
              </NoData>
            ) : (
              <>
                <dl className="grid grid-cols-2 gap-4">
                  <Figure
                    label="Median"
                    value={leads.medianMinutes !== null ? durationLabel(leads.medianMinutes) : "—"}
                  />
                  <Figure
                    label="Average"
                    value={leads.avgMinutes !== null ? durationLabel(leads.avgMinutes) : "—"}
                  />
                </dl>

                <p className="mt-2 text-small text-muted">
                  {leads.answeredCount === 0
                    ? "No lead has had a first response recorded yet, so there is no speed to read."
                    : `Measured on ${leads.answeredCount} answered ${
                        leads.answeredCount === 1 ? "lead" : "leads"
                      }${leads.answeredCount < 3 ? " — too few to read as a trend yet." : "."}`}
                </p>

                <div className="mt-3 border-t border-subtle pt-3">
                  {leads.uncontactedCount > 0 ? (
                    <>
                      <p className="flex items-center gap-1.5 text-body font-semibold text-warning">
                        <UrgencyDot tone="warning" />
                        <span className="tnum">
                          {leads.uncontactedCount} of {leads.totalLeads}{" "}
                          {leads.totalLeads === 1 ? "lead is" : "leads are"} still waiting on a
                          first call
                        </span>
                      </p>
                      {leads.oldestUncontactedHours !== null ? (
                        <p className="mt-0.5 text-small text-muted tnum">
                          The oldest has been waiting{" "}
                          {durationLabel(leads.oldestUncontactedHours * 60)}.
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-body text-secondary">
                      Every lead captured has had a first response.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </Card>

        {/* 2. Follow-up completion */}
        <Card>
          <CardHeader
            title="Follow-up completion"
            meta="Whether the work you promised yourself gets done. An overdue task is a relationship cooling off."
          />
          <div className="p-4">
            {followUpTotal === 0 ? (
              <NoData>No follow-up tasks have been created yet, so there is nothing to finish.</NoData>
            ) : (
              <>
                <Bar
                  label="Completed"
                  value={followUp.doneCount}
                  max={followUpTotal}
                  valueLabel={
                    followUp.completionRate !== null ? percentLabel(followUp.completionRate) : "—"
                  }
                  meta={`${followUp.doneCount} done of ${followUpTotal} on the books.`}
                />

                <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-subtle pt-3">
                  <Figure label="Still open" value={String(followUp.openCount)} />
                  <Figure
                    label="Past due"
                    value={String(followUp.overdueCount)}
                    urgent={followUp.overdueCount > 0}
                  />
                </dl>
              </>
            )}
          </div>
        </Card>

        {/* 7. Stale opportunities — the most actionable list on the page. */}
        <Card>
          <CardHeader
            title="Files that have gone quiet"
            meta="Active files nobody has touched inside the limit for their stage: 3 days in Transact, 7 days everywhere else."
          />
          <div className="p-4">
            {stale.totalStale === 0 ? (
              <NoData>
                Nothing has gone quiet. Every active file has been touched inside the limit for its
                stage.
              </NoData>
            ) : (
              <>
                <ul className="space-y-1">
                  {stale.rows.map((row) => (
                    <li key={row.loanId}>
                      <Link
                        href={`/opportunities/${row.loanId}`}
                        className="-mx-2 flex items-start justify-between gap-3 rounded px-2 py-1.5 hover:bg-raised"
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-primary">
                            {row.personName}
                          </span>
                          <span className="mt-1 flex flex-wrap items-center gap-1.5">
                            <StageChip stage={row.stage} />
                            {row.amount ? (
                              <span className="text-small text-muted tnum">
                                {moneyCompact(row.amount)}
                              </span>
                            ) : null}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-1.5 text-small font-semibold text-warning tnum">
                          <UrgencyDot tone="warning" />
                          No movement {Math.floor(row.idleDays)}d
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>

                {stale.totalStale > stale.rows.length ? (
                  <p className="mt-3 border-t border-subtle pt-3 text-small text-muted tnum">
                    Showing the {stale.rows.length} longest of {stale.totalStale}.
                  </p>
                ) : null}
              </>
            )}
          </div>
        </Card>

        {/* 3. Pipeline movement */}
        <Card>
          <CardHeader
            title="Pipeline movement"
            meta="How many files moved forward in the last 30 days, and where the open book sits right now."
          />
          <div className="p-4">
            <dl className="grid grid-cols-2 gap-4">
              <Figure label="Stage moves, 30 days" value={String(movement.advances30d)} />
              <Figure label="Open files" value={String(movement.openTotal)} />
            </dl>

            {movement.openTotal === 0 ? (
              <div className="mt-3 border-t border-subtle pt-3">
                <NoData>No open files, so there is no book to break down by phase.</NoData>
              </div>
            ) : (
              <div className="mt-4 space-y-3 border-t border-subtle pt-3">
                {movement.byPhase.map((p) => (
                  <Bar
                    key={p.phase}
                    label={p.phase}
                    value={p.count}
                    max={maxPhaseCount}
                    valueLabel={String(p.count)}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* 4. Conversion */}
        <Card>
          <CardHeader
            title="Conversion"
            meta="Of every opportunity ever opened, how far it got. This is the shape of your funnel, not a forecast."
          />
          <div className="p-4">
            {conversion.totalCreated === 0 ? (
              <NoData>No opportunities have been opened yet, so there is no funnel to show.</NoData>
            ) : (
              <>
                <div className="space-y-3">
                  {conversion.funnel.map((step) => (
                    <Bar
                      key={step.label}
                      label={step.label}
                      value={step.count}
                      max={conversion.totalCreated}
                      valueLabel={`${step.count} · ${percentLabel(
                        step.count / conversion.totalCreated,
                      )}`}
                    />
                  ))}
                </div>

                <p className="mt-3 text-small text-muted tnum">
                  Out of {conversion.totalCreated} opportunities ever opened. A file that funded
                  still counts at every phase it passed through on the way.
                </p>

                <dl className="mt-4 grid grid-cols-3 gap-4 border-t border-subtle pt-3">
                  <Figure label="Funded" value={String(conversion.fundedCount)} />
                  <Figure label="Lost" value={String(conversion.lostCount)} />
                  <Figure label="Still active" value={String(conversion.activeCount)} />
                </dl>

                {conversion.otherCount > 0 ? (
                  <p className="mt-2 text-small text-muted tnum">
                    {conversion.otherCount}{" "}
                    {conversion.otherCount === 1 ? "file is" : "files are"} withdrawn, denied, or on
                    hold.
                  </p>
                ) : null}
              </>
            )}
          </div>
        </Card>

        {/* 5. Partner activity */}
        <Card>
          <CardHeader
            title="Partner activity"
            meta="Who actually sends you business, and who has gone quiet on you."
          />
          <div className="p-4">
            {partners.totalPartners === 0 ? (
              <NoData>No referral partners have been added yet.</NoData>
            ) : (
              <>
                {partners.top.length === 0 ? (
                  <NoData>
                    None of your partners has a referral recorded yet, so there is nothing to rank.
                  </NoData>
                ) : (
                  <div className="space-y-3">
                    {partners.top.map((p) => (
                      <Bar
                        key={p.partnerId}
                        label={p.company ? `${p.name} · ${p.company}` : p.name}
                        value={p.referralCount}
                        max={maxReferrals}
                        valueLabel={`${p.referralCount} ${
                          p.referralCount === 1 ? "referral" : "referrals"
                        }`}
                        meta={[
                          p.referredVolume > 0
                            ? `${moneyCompact(p.referredVolume)} referred`
                            : "No amount recorded yet",
                          p.lastTouchAt
                            ? `last touch ${relativeTime(p.lastTouchAt)}`
                            : "no touch recorded",
                        ].join(" · ")}
                      />
                    ))}
                  </div>
                )}

                <p className="mt-4 border-t border-subtle pt-3 text-small text-muted tnum">
                  {partners.quietCount > 0
                    ? `${partners.quietCount} of ${partners.totalPartners} partners ${
                        partners.quietCount === 1 ? "has" : "have"
                      } had no recorded touch in 60 days or more.`
                    : `All ${partners.totalPartners} partners have been touched in the last 60 days.`}
                </p>
              </>
            )}
          </div>
        </Card>

        {/* 6. Campaign activity */}
        <Card>
          <CardHeader
            title="Campaign activity"
            meta="What your finished and running campaigns did. Drafts and scheduled sends have not done anything yet."
          />
          <div className="p-4">
            {campaigns.campaignCount === 0 ? (
              <NoData>
                No campaign has finished or is running, so there is nothing to measure yet.
              </NoData>
            ) : (
              <>
                <dl className="grid grid-cols-3 gap-4">
                  <Figure label="Sent" value={String(campaigns.sent)} />
                  <Figure label="Opened" value={String(campaigns.opened)} />
                  <Figure label="Replied" value={String(campaigns.replied)} />
                </dl>

                <div className="mt-4 border-t border-subtle pt-3">
                  {campaigns.openRate !== null ? (
                    <Bar
                      label="Open rate"
                      value={campaigns.opened}
                      max={campaigns.sent}
                      valueLabel={percentLabel(campaigns.openRate)}
                      meta={`${campaigns.opened} of ${campaigns.sent} sent were opened, across ${
                        campaigns.campaignCount
                      } ${campaigns.campaignCount === 1 ? "campaign" : "campaigns"}.`}
                    />
                  ) : (
                    <NoData>
                      Nothing has been sent on these campaigns yet, so there is no open rate.
                    </NoData>
                  )}
                </div>
              </>
            )}
          </div>
        </Card>

        {/* 8. Team workload */}
        <Card>
          <CardHeader
            title={report.scope === "team" ? "Team workload" : "Your workload"}
            meta="Open follow-ups and active files per person, so you can see where the load actually sits."
          />
          <div className="p-4">
            {workload.length === 0 ? (
              <NoData>No active people to show.</NoData>
            ) : (
              <div className="space-y-3">
                {workload.map((w) => {
                  const total = w.openTasks + w.activeOpportunities;
                  return (
                    <Bar
                      key={w.userId}
                      label={`${w.fullName} · ${ROLE_LABELS[w.role] ?? w.role}`}
                      value={total}
                      max={maxLoad}
                      valueLabel={String(total)}
                      meta={`${w.openTasks} open ${
                        w.openTasks === 1 ? "follow-up" : "follow-ups"
                      } · ${w.activeOpportunities} active ${
                        w.activeOpportunities === 1 ? "file" : "files"
                      }`}
                      // Load is not an achievement — a brand-orange bar would read
                      // as "more is better". A neutral tint says what it is.
                      tone="neutral"
                    />
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
