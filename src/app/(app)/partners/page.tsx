import type { Metadata } from "next";
import Link from "next/link";
import { Handshake } from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import { listPartners, countPartnersByTier, partnerHealth } from "@/lib/queries/partners";
import { relativeTime, initialsOf } from "@/lib/format";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { NewPartnerButton } from "./new-partner-button";
import { PARTNER_KIND_LABELS, PARTNER_TIER_TABS } from "./vocabulary";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Partners" };
export const dynamic = "force-dynamic";

export default async function PartnersPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>;
}) {
  const { tier: requestedTier } = await searchParams;
  const user = await requireUser();

  // The tier goes into an enum comparison, so a hand-typed URL must never reach
  // the database as a value the enum has never heard of.
  const tier = PARTNER_TIER_TABS.some((t) => t.key === requestedTier)
    ? (requestedTier as string)
    : "all";

  const { rows, counts } = await queryAs(user, async (db) => ({
    rows: await listPartners(db, user, { tier }),
    counts: await countPartnersByTier(db, user),
  }));

  const now = new Date();
  const activeTab = PARTNER_TIER_TABS.find((t) => t.key === tier);
  const hasAnyPartners = (counts.all ?? 0) > 0;

  return (
    <>
      <PageHeader
        title="Partners"
        subtitle="The agents, builders, and advisors who send you business — ordered by who has waited longest to hear from you."
        action={<NewPartnerButton />}
      />

      <div className="px-4 py-4 sm:px-6">
        <nav className="flex flex-wrap gap-1" aria-label="Filter by relationship">
          {PARTNER_TIER_TABS.map((tab) => {
            const active = tier === tab.key;
            const count = counts[tab.key] ?? 0;
            return (
              <Link
                key={tab.key}
                href={`/partners?tier=${tab.key}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-small font-semibold transition-colors",
                  active
                    ? "bg-action text-action-fg"
                    : "text-secondary hover:bg-raised hover:text-primary",
                )}
              >
                {tab.label}
                <span className={cn("tnum text-micro", active ? "opacity-80" : "text-muted")}>
                  {count}
                </span>
              </Link>
            );
          })}
        </nav>

        {rows.length === 0 ? (
          <div className="mt-4 rounded-lg border border-subtle bg-surface px-6 py-14 text-center">
            <Handshake className="mx-auto size-6 text-disabled" aria-hidden />
            <p className="mt-3 text-h3 font-semibold text-primary">
              {hasAnyPartners
                ? `Nobody is marked ${activeTab?.label.toLowerCase() ?? "that"} right now`
                : "No partners yet"}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-body text-secondary">
              {hasAnyPartners
                ? "Everyone else is under the other tabs."
                : "Add the agents, builders, and advisors who send you business. This is where you'll see who's due for a call."}
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-lg border border-subtle bg-surface">
            <table className="w-full text-body">
              <caption className="sr-only">Referral partners</caption>
              <thead>
                <tr className="border-b border-subtle bg-sunken text-label uppercase tracking-wide text-muted">
                  <th scope="col" className="px-4 py-2 text-left font-semibold">
                    Name
                  </th>
                  <th scope="col" className="hidden px-4 py-2 text-left font-semibold md:table-cell">
                    What they do
                  </th>
                  <th scope="col" className="px-4 py-2 text-left font-semibold">
                    Relationship
                  </th>
                  <th scope="col" className="hidden px-4 py-2 text-right font-semibold sm:table-cell">
                    Referrals
                  </th>
                  <th scope="col" className="px-4 py-2 text-right font-semibold">
                    Last touch
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const health = partnerHealth(row.tier, row.lastTouchAt, now);
                  const name = `${row.firstName} ${row.lastName}`;

                  return (
                    <tr
                      key={row.id}
                      className="border-b border-subtle last:border-0 hover:bg-raised"
                    >
                      <td className="px-4 py-2.5">
                        <Link href={`/partners/${row.id}`} className="flex items-center gap-2.5">
                          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-sunken text-label font-semibold text-secondary">
                            {initialsOf(name)}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-semibold text-primary">
                              {name}
                            </span>
                            <span className="block truncate text-small text-muted">
                              {row.company ?? row.emails?.[0]?.address ?? "—"}
                            </span>
                          </span>
                        </Link>
                      </td>

                      <td className="hidden px-4 py-2.5 text-secondary md:table-cell">
                        {PARTNER_KIND_LABELS[row.kind] ?? row.kind}
                      </td>

                      <td className="px-4 py-2.5">
                        <Badge tone={health.level}>{health.label}</Badge>
                      </td>

                      <td className="hidden px-4 py-2.5 text-right text-secondary tnum sm:table-cell">
                        {row.referralCount > 0 ? row.referralCount : "—"}
                      </td>

                      <td className="px-4 py-2.5 text-right text-small text-muted tnum">
                        {row.lastTouchAt ? relativeTime(row.lastTouchAt, now) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {rows.length >= 200 ? (
          <p className="mt-3 text-small text-muted">
            Showing the 200 who have waited longest. Filter by relationship to narrow it down.
          </p>
        ) : null}
      </div>
    </>
  );
}
