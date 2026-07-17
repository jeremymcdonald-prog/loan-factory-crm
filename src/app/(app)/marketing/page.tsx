import type { Metadata } from "next";
import Link from "next/link";
import { Megaphone, LibraryBig, CheckCircle2, ArrowRight } from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import {
  listCampaigns,
  campaignTotals,
  listTemplateChoices,
  templatePolicyCounts,
  audienceSizes,
  companyNmls,
} from "@/lib/queries/marketing";
import { seesWholeBook } from "@/lib/roles";
import { absoluteTime, relativeTime } from "@/lib/format";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { NewCampaignButton } from "./new-campaign-button";
import {
  AUDIENCES,
  AUDIENCE_TYPES,
  CAMPAIGN_STATUS,
  CAMPAIGN_STATUS_ORDER,
  campaignStatusLabel,
  openRate,
  policyRead,
  type CampaignStatus,
} from "./vocabulary";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Marketing" };
export const dynamic = "force-dynamic";

/** Status carries no urgency, so it carries no hue — only the archive dims. */
const STATUS_TONE: Record<CampaignStatus, string> = {
  running: "border-strong/60 bg-sunken text-primary",
  scheduled: "border-strong/60 bg-sunken text-primary",
  draft: "border-subtle bg-sunken text-secondary",
  paused: "border-subtle bg-sunken text-secondary",
  finished: "border-subtle bg-sunken text-muted",
};

export default async function MarketingPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const { created } = await searchParams;
  const user = await requireUser();

  const { campaigns, totals, templates, policyCounts, sizes, nmls } = await queryAs(
    user,
    async (db) => ({
      campaigns: await listCampaigns(db, user),
      totals: await campaignTotals(db, user),
      templates: await listTemplateChoices(db),
      policyCounts: await templatePolicyCounts(db),
      sizes: await audienceSizes(db, user, AUDIENCE_TYPES),
      nmls: await companyNmls(db, user),
    }),
  );

  const audiences = AUDIENCES.map((a) => ({ ...a, size: sizes[a.type] ?? 0 }));
  const overallOpenRate = openRate(totals.sentTotal, totals.openTotal);
  const justCreated = created ? campaigns.find((c) => c.id === created) : undefined;
  const showOwner = seesWholeBook(user.role);

  // Grouped, not filtered: with a book this size you want to see all of it at
  // once, in the order the work matters. Empty groups say nothing, so they go.
  const groups = CAMPAIGN_STATUS_ORDER.map((status) => ({
    status,
    rows: campaigns.filter((c) => c.status === status),
  })).filter((g) => g.rows.length > 0);

  return (
    <>
      <PageHeader
        title="Marketing"
        subtitle="Campaigns you've sent, scheduled, or started — and the template library behind them."
        meta={
          <Link
            href="/marketing/templates"
            className="inline-flex items-center gap-1.5 text-small font-semibold text-action hover:underline"
          >
            <LibraryBig className="size-3.5" aria-hidden />
            Browse the template library
            <span className="font-normal text-muted tnum">{policyCounts.all ?? 0}</span>
          </Link>
        }
        action={
          <NewCampaignButton
            templates={templates}
            audiences={audiences}
            companyNmls={nmls}
          />
        }
      />

      {/* The four numbers that matter, computed from the same rows below. */}
      <div className="grid grid-cols-2 gap-px border-b border-subtle bg-subtle sm:grid-cols-4">
        {[
          { label: "Running now", value: String(totals.runningCount) },
          { label: "Scheduled", value: String(totals.scheduledCount) },
          {
            label: "People reached",
            value: String(totals.sentTotal),
            meta: totals.sentTotal > 0 ? `${totals.replyTotal} replied` : undefined,
          },
          {
            label: "Open rate",
            value: overallOpenRate === null ? "—" : `${overallOpenRate}%`,
            meta:
              overallOpenRate === null
                ? "Nothing sent yet"
                : `${totals.openTotal} of ${totals.sentTotal} opened`,
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-canvas px-4 py-3">
            <p className="text-label font-semibold uppercase tracking-wide text-muted">
              {stat.label}
            </p>
            <p className="mt-1 text-metric-md font-semibold text-primary tnum">{stat.value}</p>
            {stat.meta ? <p className="text-small text-muted tnum">{stat.meta}</p> : null}
          </div>
        ))}
      </div>

      <div className="px-4 py-4 sm:px-6">
        {justCreated ? (
          <p
            role="status"
            className="mb-4 flex items-start gap-2 rounded-md border border-healthy/25 bg-healthy-bg px-3 py-2.5 text-small text-secondary"
          >
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-healthy" aria-hidden />
            <span>
              <span className="font-semibold text-primary">{justCreated.name}</span> is saved
              {justCreated.status === "scheduled" && justCreated.scheduledFor ? (
                <> and goes out {absoluteTime(justCreated.scheduledFor)}.</>
              ) : (
                <> as a draft. Nothing goes out until you schedule it.</>
              )}
            </span>
          </p>
        ) : null}

        {campaigns.length === 0 ? (
          <div className="rounded-lg border border-subtle bg-surface px-6 py-14 text-center">
            <Megaphone className="mx-auto size-6 text-disabled" aria-hidden />
            <p className="mt-3 text-h3 font-semibold text-primary">No campaigns yet</p>
            <p className="mx-auto mt-1 max-w-md text-body text-secondary">
              A campaign takes one template from your library and sends it to a group of
              people — your past clients, your referral partners, or borrowers with a
              preapproval about to run out. Start one with the button above.
            </p>
            <Link
              href="/marketing/templates"
              className="mt-4 inline-flex items-center gap-1.5 text-small font-semibold text-action hover:underline"
            >
              See what&rsquo;s in the library first
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map(({ status, rows }) => (
              <section key={status}>
                <header className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <h2 className="text-label font-semibold uppercase tracking-wide text-primary">
                    {campaignStatusLabel(status)}
                    <span className="ml-1.5 font-normal text-muted tnum">{rows.length}</span>
                  </h2>
                  <p className="text-small text-muted">{CAMPAIGN_STATUS[status].blurb}</p>
                </header>

                <ul className="space-y-2">
                  {rows.map((c) => {
                    const rate = openRate(c.sentCount, c.openCount);
                    const policy = c.templatePolicy ? policyRead(c.templatePolicy) : null;

                    return (
                      <li
                        key={c.id}
                        className="rounded-lg border border-subtle bg-surface px-4 py-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                          <div className="min-w-0">
                            <h3 className="text-body font-semibold text-primary">{c.name}</h3>

                            {/* Who it goes to, in the words the LO chose it by. */}
                            <p className="mt-0.5 text-small text-secondary">
                              {c.audience?.label ?? "No audience set"}
                              <span className="text-muted">
                                {" · "}
                                <span className="tnum">{c.audienceSize}</span>{" "}
                                {c.audienceSize === 1 ? "person" : "people"}
                              </span>
                            </p>

                            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-small text-muted">
                              {c.templateId && c.templateRef ? (
                                <Link
                                  href={`/marketing/templates/${c.templateId}`}
                                  className="inline-flex items-center gap-1.5 hover:text-action"
                                >
                                  <span className="font-mono text-micro text-secondary">
                                    {c.templateRef}
                                  </span>
                                  <span className="truncate">{c.templateName}</span>
                                </Link>
                              ) : (
                                <span>No template attached</span>
                              )}
                              {policy ? <Badge tone={policy.tone}>{policy.label}</Badge> : null}
                              {showOwner && c.ownerName ? (
                                <span className="text-muted">{c.ownerName}</span>
                              ) : null}
                            </p>
                          </div>

                          <span
                            className={cn(
                              "shrink-0 rounded border px-1.5 py-0.5 text-label font-semibold whitespace-nowrap",
                              STATUS_TONE[status],
                            )}
                          >
                            {campaignStatusLabel(status)}
                          </span>
                        </div>

                        {/* What actually happened, once anything has. */}
                        {c.sentCount > 0 ? (
                          <dl className="mt-2.5 flex flex-wrap gap-x-6 gap-y-1 border-t border-subtle pt-2.5">
                            {[
                              { label: "Sent", value: String(c.sentCount) },
                              { label: "Opened", value: String(c.openCount) },
                              { label: "Replied", value: String(c.replyCount) },
                              { label: "Open rate", value: rate === null ? "—" : `${rate}%` },
                            ].map((m) => (
                              <div key={m.label}>
                                <dt className="text-micro font-semibold uppercase tracking-wide text-muted">
                                  {m.label}
                                </dt>
                                <dd className="text-body font-semibold text-primary tnum">
                                  {m.value}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        ) : status === "scheduled" && c.scheduledFor ? (
                          <p className="mt-2.5 border-t border-subtle pt-2.5 text-small text-secondary">
                            Goes out{" "}
                            <span className="font-semibold text-primary tnum">
                              {absoluteTime(c.scheduledFor)}
                            </span>
                            <span className="text-muted tnum">
                              {" · "}
                              {relativeTime(c.scheduledFor)}
                            </span>
                          </p>
                        ) : (
                          <p className="mt-2.5 border-t border-subtle pt-2.5 text-small text-muted">
                            Nothing has gone out yet.
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}

        <p className="mt-6 border-t border-subtle pt-3 text-small text-muted">
          Every message that goes out carries
          {nmls ? (
            <>
              {" "}
              Loan Factory, Inc. NMLS #<span className="tnum">{nmls}</span>
            </>
          ) : (
            " your company NMLS"
          )}{" "}
          and the Equal Housing Opportunity notice.
        </p>
      </div>
    </>
  );
}
