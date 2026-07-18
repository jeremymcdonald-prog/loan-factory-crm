import type { Metadata } from "next";
import Link from "next/link";
import { ChartNoAxesCombined, Lightbulb, User, Users } from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import {
  channelLabel,
  hasNothingToReport,
  intelligenceReport,
  resolveScope,
  PERSON_TYPE_LABELS,
} from "@/lib/queries/intelligence";
import { seesWholeBook } from "@/lib/roles";
import { moneyCompact, relativeTime } from "@/lib/format";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { StatTile, Figure, Bar, NoData, DemoTag, percentLabel } from "./report-ui";
import { RANGE_CHOICES, rangeHref, resolveRange } from "./range";

export const metadata: Metadata = { title: "Intelligence" };
export const dynamic = "force-dynamic";

/** "1st", "2nd", "3rd", "4th" — for loan anniversaries. */
function ordinal(n: number): string {
  const rem10 = n % 10;
  const rem100 = n % 100;
  if (rem10 === 1 && rem100 !== 11) return `${n}st`;
  if (rem10 === 2 && rem100 !== 12) return `${n}nd`;
  if (rem10 === 3 && rem100 !== 13) return `${n}rd`;
  return `${n}th`;
}

const EVENT_KIND_LABELS: Record<string, string> = {
  "touch.logged": "Touch logged",
  "loan.stage_advanced": "File moved forward",
};

/**
 * Intelligence — production reporting, counted from the team's own records
 * (Screen 8).
 *
 * Two views of one report: a loan officer reads their own production, a leader
 * reads the team's and can flip to their own. Every number is fenced by the
 * date range in the URL. This is a CRM report and nothing else (D-22): no
 * revenue, no margin, no rate data. Volume is the sum of amounts the team
 * entered on their own opportunities — a relationship fact, not an accounting
 * one. All panels carry a "Demo data" tag because the rows behind them are
 * seeded fixtures; the queries themselves are real.
 */
export default async function IntelligencePage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string; view?: string }>;
}) {
  const params = await searchParams;
  const user = await requireUser();
  const scope = resolveScope(user, params.view);
  const range = resolveRange(params);

  const report = await queryAs(user, (db) => intelligenceReport(db, user, scope, range));

  const { production, conversion, sources, partners, drips, newsletters, database, pastClients } =
    report;

  const subtitle =
    scope === "team"
      ? `Team production, ${range.label.toLowerCase()}. Counted from your team's own records — nothing is estimated.`
      : `Your production, ${range.label.toLowerCase()}. Counted from your own records — nothing is estimated.`;

  // Leaders can flip between the whole book and their own; everyone else has
  // exactly one view, so the toggle never renders for them.
  const isLeader = seesWholeBook(user.role);
  const viewHref = (view: "team" | "me") => {
    const qs = new URLSearchParams();
    if (range.key !== "mtd") qs.set("range", range.key);
    if (range.customFrom) qs.set("from", range.customFrom);
    if (range.customTo) qs.set("to", range.customTo);
    if (view === "me") qs.set("view", "me");
    const s = qs.toString();
    return s ? `/intelligence?${s}` : "/intelligence";
  };

  if (hasNothingToReport(report)) {
    return (
      <>
        <PageHeader title="Intelligence" subtitle={subtitle} />
        <div className="p-4 sm:p-6">
          <div className="rounded-card border border-subtle bg-surface px-6 py-14 text-center">
            <ChartNoAxesCombined className="mx-auto size-6 text-disabled" aria-hidden />
            <p className="mt-3 text-h3 font-semibold text-primary">
              There is nothing to report yet
            </p>
            <p className="mx-auto mt-1 max-w-md text-body text-secondary">
              This screen counts what your book has actually produced — leads, applications,
              closings, and where they came from. Add the people you&rsquo;re working with and the
              numbers will fill in on their own.
            </p>
            <Link
              href="/people"
              className="mt-4 inline-flex h-9 items-center rounded-control bg-action px-3.5 text-body font-semibold text-action-fg hover:bg-action-hover"
            >
              Go to People
            </Link>
          </div>
        </div>
      </>
    );
  }

  const maxSourceLeads = Math.max(0, ...sources.map((s) => s.leads));
  const maxReferrals = Math.max(0, ...partners.top.map((p) => Math.max(p.referrals, p.closings)));
  const maxTypeCount = Math.max(0, ...database.byType.map((t) => t.count));

  return (
    <>
      <PageHeader
        title="Intelligence"
        subtitle={subtitle}
        action={
          isLeader ? (
            <div className="flex rounded-md border border-subtle p-0.5">
              <Link
                href={viewHref("team")}
                aria-current={scope === "team" ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-small font-semibold transition-colors",
                  scope === "team"
                    ? "bg-action text-action-fg"
                    : "text-secondary hover:text-primary",
                )}
              >
                <Users className="size-3.5" aria-hidden />
                Team
              </Link>
              <Link
                href={viewHref("me")}
                aria-current={scope === "own" ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-small font-semibold transition-colors",
                  scope === "own"
                    ? "bg-action text-action-fg"
                    : "text-secondary hover:text-primary",
                )}
              >
                <User className="size-3.5" aria-hidden />
                My production
              </Link>
            </div>
          ) : undefined
        }
      />

      {/* Date range — every number below obeys it. searchParams-driven, so a
          range is a URL you can share. */}
      <div className="flex flex-wrap items-center gap-2 border-b border-subtle px-4 py-3 sm:px-6">
        {RANGE_CHOICES.map((choice) => (
          <Link
            key={choice.key}
            href={rangeHref(choice.key, scope === "own" && isLeader ? "me" : undefined)}
            aria-current={range.key === choice.key ? "page" : undefined}
            className={cn(
              "inline-flex h-8 items-center rounded-full border px-3 text-small font-semibold transition-colors",
              range.key === choice.key
                ? "border-action bg-action text-action-fg"
                : "border-subtle text-secondary hover:text-primary",
            )}
          >
            {choice.label}
          </Link>
        ))}

        {/* Custom range: a plain GET form — no client JS, just searchParams. */}
        <form method="get" action="/intelligence" className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="range" value="custom" />
          {scope === "own" && isLeader ? <input type="hidden" name="view" value="me" /> : null}
          <label className="flex items-center gap-1.5 text-small text-secondary">
            From
            <input
              type="date"
              name="from"
              defaultValue={range.customFrom}
              required
              className="h-8 rounded-control border border-subtle bg-surface px-2 text-small text-primary"
            />
          </label>
          <label className="flex items-center gap-1.5 text-small text-secondary">
            To
            <input
              type="date"
              name="to"
              defaultValue={range.customTo}
              required
              className="h-8 rounded-control border border-subtle bg-surface px-2 text-small text-primary"
            />
          </label>
          <button
            type="submit"
            className={cn(
              "inline-flex h-8 items-center rounded-full border px-3 text-small font-semibold transition-colors",
              range.key === "custom"
                ? "border-action bg-action text-action-fg"
                : "border-subtle text-secondary hover:text-primary",
            )}
          >
            {range.key === "custom" ? range.label : "Apply"}
          </button>
        </form>
      </div>

      {/* The five production numbers, in pipeline order. */}
      <div className="grid grid-cols-2 gap-px border-b border-subtle bg-subtle sm:grid-cols-3 lg:grid-cols-5">
        <StatTile
          label="Leads"
          value={String(production.leads)}
          meta={`Captured ${range.label.toLowerCase()}`}
        />
        <StatTile
          label="Applications"
          value={String(production.applications)}
          meta="Files that entered Application"
        />
        <StatTile
          label="Preapprovals"
          value={String(production.preapprovals)}
          meta="Files that entered Preapproval"
        />
        <StatTile label="Loans" value={String(production.activeLoans)} meta="Active files right now" />
        <StatTile
          label="Closings"
          value={String(production.closings)}
          meta={
            production.closedVolume > 0
              ? `${moneyCompact(production.closedVolume)} funded`
              : "Funded in range"
          }
        />
      </div>

      <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-2">
        {/* 13. Opportunities to improve — the report's whole point, so it leads. */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Opportunities to improve"
            meta="Read from the numbers on this page — each one names the fact and the next step."
            action={<DemoTag />}
          />
          <div className="p-4">
            {report.opportunities.length === 0 ? (
              <NoData>
                Nothing is flagged. Every lead has been contacted, no file has gone quiet, and your
                partners have been touched recently.
              </NoData>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {report.opportunities.map((opp) => (
                  <li key={opp.finding}>
                    <Link
                      href={opp.href}
                      className="flex h-full items-start gap-3 rounded-lg border border-subtle p-3 hover:bg-sunken"
                    >
                      <span className="grid size-7 shrink-0 place-items-center rounded-full border border-subtle bg-surface">
                        <Lightbulb className="size-3.5 text-warning" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-body font-semibold text-primary">
                          {opp.finding}
                        </span>
                        <span className="mt-0.5 block text-small text-secondary">
                          {opp.nextStep}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        {/* 6. Conversion rates */}
        <Card>
          <CardHeader
            title="Conversion"
            meta="Activity volumes compared inside this range. A loan takes longer than most ranges, so these are pace ratios, not one cohort tracked end to end."
            action={<DemoTag />}
          />
          <div className="p-4">
            {production.leads === 0 && production.applications === 0 ? (
              <NoData>No leads or applications in this range, so there is no rate to compute.</NoData>
            ) : (
              <div className="space-y-3">
                <Bar
                  label="Lead → application"
                  value={conversion.leadToApplication ?? 0}
                  max={1}
                  valueLabel={
                    conversion.leadToApplication !== null
                      ? percentLabel(conversion.leadToApplication)
                      : "—"
                  }
                  meta={`${production.applications} applications from ${production.leads} leads`}
                />
                <Bar
                  label="Application → closing"
                  value={conversion.applicationToClosing ?? 0}
                  max={1}
                  valueLabel={
                    conversion.applicationToClosing !== null
                      ? percentLabel(conversion.applicationToClosing)
                      : "—"
                  }
                  meta={`${production.closings} closings against ${production.applications} applications`}
                />
                <Bar
                  label="Lead → closing"
                  value={conversion.leadToClosing ?? 0}
                  max={1}
                  valueLabel={
                    conversion.leadToClosing !== null
                      ? percentLabel(conversion.leadToClosing)
                      : "—"
                  }
                  meta={`${production.closings} closings against ${production.leads} leads`}
                />
              </div>
            )}
          </div>
        </Card>

        {/* 7. Lead source performance */}
        <Card>
          <CardHeader
            title="Lead source performance"
            meta="Where the leads in this range came from, and how each source's leads have closed over their lifetime."
            action={<DemoTag />}
          />
          <div className="p-4">
            {sources.length === 0 ? (
              <NoData>No leads were captured in this range, so there are no sources to rank.</NoData>
            ) : (
              <div className="space-y-3">
                {sources.map((row) => (
                  <Bar
                    key={row.channel}
                    label={channelLabel(row.channel)}
                    value={row.leads}
                    max={maxSourceLeads}
                    valueLabel={`${row.leads} ${row.leads === 1 ? "lead" : "leads"}`}
                    meta={[
                      `${row.contacted} contacted`,
                      `${row.closed} closed`,
                      row.closeRate !== null && row.closed > 0
                        ? `closes at ${percentLabel(row.closeRate)}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* 8. Referral partner production */}
        <Card>
          <CardHeader
            title="Referral partner production"
            meta="Who sent business in this range, and whose referrals funded."
            action={<DemoTag />}
          />
          <div className="p-4">
            {partners.totalPartners === 0 ? (
              <NoData>No referral partners have been added yet.</NoData>
            ) : partners.top.length === 0 ? (
              <NoData>
                No partner sent a referral or had one fund in this range. Widen the range to see
                longer-term production.
              </NoData>
            ) : (
              <>
                <div className="space-y-3">
                  {partners.top.map((p) => (
                    <Bar
                      key={p.partnerId}
                      label={p.company ? `${p.name} · ${p.company}` : p.name}
                      value={p.referrals}
                      max={maxReferrals}
                      valueLabel={`${p.referrals} ${p.referrals === 1 ? "referral" : "referrals"}`}
                      meta={
                        p.closings > 0
                          ? `${p.closings} ${p.closings === 1 ? "closing" : "closings"} in range`
                          : "No closings in range yet"
                      }
                    />
                  ))}
                </div>
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

        {/* 12. Past client activity */}
        <Card>
          <CardHeader
            title="Past client activity"
            meta="Recent touches on past clients, and the loan anniversaries coming up."
            action={<DemoTag />}
          />
          <div className="p-4">
            {pastClients.pastClientCount === 0 ? (
              <NoData>No past clients in the book yet — they appear here after a file funds.</NoData>
            ) : (
              <>
                <dl className="grid grid-cols-2 gap-4">
                  <Figure label="Past clients" value={String(pastClients.pastClientCount)} />
                  <Figure label="Touches in range" value={String(pastClients.touchesInRange)} />
                </dl>

                <div className="mt-4 border-t border-subtle pt-3">
                  <p className="text-label font-semibold uppercase tracking-wide text-muted">
                    Anniversaries, next 45 days
                  </p>
                  {pastClients.anniversaries.length === 0 ? (
                    <p className="mt-1 text-small text-muted">
                      No loan anniversaries land in the next 45 days.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-1">
                      {pastClients.anniversaries.map((a) => (
                        <li key={a.loanId}>
                          <Link
                            href={`/people/${a.personId}`}
                            className="-mx-2 flex items-baseline justify-between gap-3 rounded px-2 py-1 hover:bg-sunken"
                          >
                            <span className="truncate text-body font-semibold text-primary">
                              {a.name}
                            </span>
                            <span className="shrink-0 text-small text-secondary tnum">
                              {ordinal(a.years)} anniversary{" "}
                              {a.inDays <= 0 ? "today" : `in ${a.inDays}d`}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {pastClients.recent.length > 0 ? (
                  <div className="mt-4 border-t border-subtle pt-3">
                    <p className="text-label font-semibold uppercase tracking-wide text-muted">
                      Recent touches
                    </p>
                    <ul className="mt-2 space-y-1">
                      {pastClients.recent.map((t) => (
                        <li
                          key={`${t.personId}-${t.at.toISOString()}`}
                          className="flex items-baseline justify-between gap-3 text-small"
                        >
                          <span className="truncate text-secondary">
                            <span className="font-semibold text-primary">{t.name}</span> ·{" "}
                            {EVENT_KIND_LABELS[t.kind] ?? t.kind}
                          </span>
                          <span className="shrink-0 text-muted">{relativeTime(t.at)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </Card>

        {/* 9. Active drip campaigns */}
        <Card>
          <CardHeader
            title="Active drip campaigns"
            meta="Campaigns running right now — a point-in-time fact, not fenced by the range."
            action={<DemoTag />}
          />
          <div className="p-4">
            {drips.count === 0 ? (
              <NoData>
                No campaign is running right now. Scheduled and draft campaigns appear once they
                start.
              </NoData>
            ) : (
              <>
                <Figure label="Running now" value={String(drips.count)} />
                <ul className="mt-3 space-y-1 border-t border-subtle pt-3">
                  {drips.campaigns.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-baseline justify-between gap-3 text-body"
                    >
                      <span className="truncate font-semibold text-primary">{c.name}</span>
                      <span className="shrink-0 text-small text-muted tnum">
                        {c.audienceSize} {c.audienceSize === 1 ? "person" : "people"}
                        {c.steps > 0 ? ` · ${c.steps} steps` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </Card>

        {/* 10. Newsletters sent */}
        <Card>
          <CardHeader
            title="Newsletters sent"
            meta="Campaigns that have actually sent. The CRM keeps lifetime totals per campaign, not send dates, so this list is not fenced by the range."
            action={<DemoTag />}
          />
          <div className="p-4">
            {newsletters.length === 0 ? (
              <NoData>Nothing has been sent yet — finished and running campaigns appear here.</NoData>
            ) : (
              <ul className="space-y-2">
                {newsletters.map((n) => (
                  <li key={n.id} className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate text-body font-semibold text-primary">
                        {n.name}
                      </span>
                      <span className="text-small text-muted">
                        {n.status === "running" ? "Still running" : "Finished"}
                      </span>
                    </span>
                    <span className="shrink-0 text-small text-secondary tnum">
                      {n.sent} sent · {n.opened} opened
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        {/* 11. Database size */}
        <Card>
          <CardHeader
            title="Database"
            meta="Everyone in the book right now, by relationship. The database is the asset — this is its size."
            action={<DemoTag />}
          />
          <div className="p-4">
            <Figure label="Total people" value={String(database.total)} />
            <div className="mt-4 space-y-3 border-t border-subtle pt-3">
              {database.byType.map((t) => (
                <Bar
                  key={t.type}
                  label={PERSON_TYPE_LABELS[t.type] ?? t.type}
                  value={t.count}
                  max={maxTypeCount}
                  valueLabel={String(t.count)}
                  tone="neutral"
                />
              ))}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
