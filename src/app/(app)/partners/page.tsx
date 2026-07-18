import type { Metadata } from "next";
import Link from "next/link";
import { Handshake, Upload } from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import { listPartners, countPartnersByTier, partnerHealth } from "@/lib/queries/partners";
import { relativeTime, initialsOf } from "@/lib/format";
import { PageHeader } from "@/components/shell/page-header";
import { NewPartnerButton } from "./new-partner-button";
import { PartnersTable, type PartnerTableRow } from "./partners-table";
import {
  PARTNER_KIND_LABELS,
  PARTNER_TIER_TABS,
  PARTNER_TIER_EXPLAINERS,
  PARTNER_NEXT_ACTIONS,
} from "./vocabulary";
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

  // Everything the client table needs, computed once on the server: the health
  // read (one rule, every surface) and the dates preformatted so server and
  // browser can't disagree about what "3 weeks ago" means.
  const tableRows: PartnerTableRow[] = rows.map((row) => {
    const health = partnerHealth(row.tier, row.lastTouchAt, now);
    return {
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      company: row.company,
      email: row.emails?.[0]?.address ?? null,
      kindLabel: PARTNER_KIND_LABELS[row.kind] ?? row.kind,
      tier: row.tier,
      healthLevel: health.level,
      healthLabel: health.label,
      referralCount: row.referralCount,
      closingCount: row.closingCount,
      lastReferral: row.lastReferralAt ? relativeTime(row.lastReferralAt, now) : "—",
      lastTouch: row.lastTouchAt ? relativeTime(row.lastTouchAt, now) : "—",
      ownerName: row.ownerName,
      nextAction: PARTNER_NEXT_ACTIONS[row.tier] ?? "Follow up",
      initials: initialsOf(`${row.firstName} ${row.lastName}`),
    };
  });

  return (
    <>
      <PageHeader
        title="Partners"
        subtitle="The agents, builders, and advisors who send you business — ordered by who has waited longest to hear from you."
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/partners/import"
              className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-control border border-strong bg-surface px-3.5 text-body font-semibold text-primary shadow-e1 transition-colors hover:bg-sunken"
            >
              <Upload className="size-4" aria-hidden />
              Import
            </Link>
            <NewPartnerButton />
          </div>
        }
      />

      <div className="px-4 py-4 sm:px-6">
        {/* The tier system, in plain language. Five relationships, five moves. */}
        <section
          aria-label="How partner tiers work"
          className="grid gap-px overflow-hidden rounded-card border border-subtle bg-subtle sm:grid-cols-2 lg:grid-cols-5"
        >
          {PARTNER_TIER_EXPLAINERS.map((t) => (
            <Link
              key={t.key}
              href={`/partners?tier=${t.key}`}
              className="block bg-surface px-3.5 py-3 transition-colors hover:bg-sunken"
            >
              <p className="flex items-baseline justify-between gap-2">
                <span className="text-label font-semibold uppercase tracking-wide text-secondary">
                  {t.label}
                </span>
                <span className="text-small font-semibold text-muted tnum">
                  {counts[t.key] ?? 0}
                </span>
              </p>
              <p className="mt-1 text-small text-secondary">{t.description}</p>
              <p className="mt-1.5 text-small font-semibold text-action">
                {PARTNER_NEXT_ACTIONS[t.key]}
              </p>
            </Link>
          ))}
        </section>

        <nav className="mt-4 flex flex-wrap gap-1" aria-label="Filter by relationship">
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
                    : "text-secondary hover:bg-sunken hover:text-primary",
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
          <div className="mt-4 rounded-card border border-subtle bg-surface px-6 py-14 text-center">
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
          <div className="mt-4">
            <PartnersTable rows={tableRows} />
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
