import type { Metadata } from "next";
import { Workflow } from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import { listAutomations, listCampaignChoices } from "@/lib/queries/automations";
import { seesWholeBook } from "@/lib/roles";
import { PageHeader } from "@/components/shell/page-header";
import { NewAutomationButton } from "./new-automation-button";
import { AutomationCard } from "./automation-card";
import { TIER_LADDER, TIER_MEANING, TierBadge } from "./labels";

export const metadata: Metadata = { title: "Automations" };
export const dynamic = "force-dynamic";

export default async function AutomationsPage() {
  const user = await requireUser();
  const [rows, campaignChoices] = await queryAs(user, (db) =>
    Promise.all([listAutomations(db), listCampaignChoices(db)]),
  );
  const canSetTier = seesWholeBook(user.role);

  // Every number up here is counted from the same rows the cards render, so the
  // header can never disagree with the list underneath it.
  const activeCount = rows.filter((r) => r.status === "active").length;
  const pausedCount = rows.filter((r) => r.status === "paused").length;
  const draftCount = rows.filter((r) => r.status === "draft").length;
  const totalRuns = rows.reduce((sum, r) => sum + r.runCount, 0);
  const waitingCount = rows.reduce((sum, r) => sum + r.waitingCount, 0);

  const stats = [
    { label: "Active", value: String(activeCount) },
    {
      label: "Paused",
      value: String(pausedCount),
      meta: draftCount > 0 ? `${draftCount} more in draft` : undefined,
    },
    { label: "Runs so far", value: totalRuns.toLocaleString("en-US") },
    { label: "Waiting for you", value: String(waitingCount) },
  ];

  return (
    <>
      <PageHeader
        title="Automations"
        subtitle="Rules that watch your files and act when a date arrives or a fact changes."
        action={<NewAutomationButton />}
      />

      <div className="grid grid-cols-2 gap-px border-b border-subtle bg-subtle sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-canvas px-4 py-3">
            <p className="text-label font-semibold uppercase tracking-wide text-muted">
              {stat.label}
            </p>
            <p className="mt-1 text-metric-md font-semibold text-primary tnum">{stat.value}</p>
            {stat.meta ? <p className="text-small text-muted tnum">{stat.meta}</p> : null}
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="p-4 sm:p-6">
          <div className="rounded-card border border-subtle bg-surface px-6 py-14 text-center">
            <Workflow className="mx-auto size-6 text-disabled" aria-hidden />
            <p className="mt-3 text-h3 font-semibold text-primary">No automations yet</p>
            <p className="mx-auto mt-1 max-w-md text-body text-secondary">
              An automation watches for one thing — a new lead, a preapproval about to expire, a
              file that has gone quiet — and does something about it. Build your first one with
              New automation above. It saves as a draft, so nothing happens until you turn it
              on.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-3 p-4 sm:p-6">
            {rows.map((row) => (
              <AutomationCard
                key={row.id}
                automation={row}
                campaignChoices={campaignChoices}
                canSetTier={canSetTier}
              />
            ))}
          </div>

          {/* The ladder, spelled out. Every badge above is one of these four rungs. */}
          <section className="px-4 pb-6 sm:px-6" aria-labelledby="approval-ladder">
            <div className="rounded-card border border-subtle bg-surface p-4">
              <h2 id="approval-ladder" className="text-h3 font-semibold text-primary">
                How much each one is allowed to do
              </h2>
              <p className="mt-1 max-w-3xl text-body text-secondary">
                Every automation carries an approval level. It is the ceiling on what that
                automation may do without you, and it never moves on its own.
              </p>

              <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {TIER_LADDER.map((tier) => {
                  const count = rows.filter((r) => r.tier === tier).length;
                  return (
                    <div key={tier} className="rounded-md border border-subtle bg-sunken p-3">
                      <dt>
                        <TierBadge tier={tier} />
                      </dt>
                      <dd className="mt-2 text-small text-secondary">{TIER_MEANING[tier]}</dd>
                      <dd className="mt-2 text-small text-muted tnum">
                        {count === 0
                          ? "None at this level"
                          : `${count} automation${count === 1 ? "" : "s"}`}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </section>
        </>
      )}
    </>
  );
}
