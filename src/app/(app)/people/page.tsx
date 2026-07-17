import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import { listPeople, countPeopleByType } from "@/lib/queries/people";
import { personUrgency } from "@/lib/person-urgency";
import { moneyCompact, relativeTime, initialsOf } from "@/lib/format";
import { PageHeader } from "@/components/shell/page-header";
import { StageChip } from "@/components/crm/stage-chip";
import { LanguageBadge } from "@/components/crm/language-badge";
import { Badge, UrgencyDot } from "@/components/ui/badge";
import { NewPersonButton } from "./new-person-button";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "People" };
export const dynamic = "force-dynamic";

const TYPE_TABS = [
  { key: "all", label: "Everyone" },
  { key: "lead", label: "Leads" },
  { key: "borrower", label: "Borrowers" },
  { key: "past_client", label: "Past clients" },
  { key: "other", label: "Contacts" },
];

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { q, type = "all" } = await searchParams;
  const user = await requireUser();

  const { rows, counts } = await queryAs(user, async (db) => ({
    rows: await listPeople(db, user, { q, type }),
    counts: await countPeopleByType(db, user),
  }));

  const now = new Date();

  return (
    <>
      <PageHeader
        title="People"
        subtitle="Everyone you're working with — leads, borrowers, past clients, and your sphere."
        action={<NewPersonButton />}
      />

      <div className="px-4 py-4 sm:px-6">
        {/* Filters. Search is a form so it works without JavaScript. */}
        <div className="flex flex-wrap items-center gap-2">
          <nav className="flex flex-wrap gap-1" aria-label="Filter by type">
            {TYPE_TABS.map((tab) => {
              const active = type === tab.key;
              const count = counts[tab.key] ?? 0;
              const href = `/people?type=${tab.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
              return (
                <Link
                  key={tab.key}
                  href={href}
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

          <form className="ml-auto" action="/people">
            <input type="hidden" name="type" value={type} />
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search by name, email, or phone"
              aria-label="Search people"
              className="h-8 w-56 rounded-md border border-subtle bg-sunken px-3 text-small text-primary placeholder:text-disabled focus:border-action focus:outline-none"
            />
          </form>
        </div>

        {rows.length === 0 ? (
          <div className="mt-4 rounded-card border border-subtle bg-surface px-6 py-14 text-center">
            <Users className="mx-auto size-6 text-disabled" aria-hidden />
            <p className="mt-3 text-h3 font-semibold text-primary">
              {q ? `No one matches "${q}"` : "No one here yet"}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-body text-secondary">
              {q
                ? "Try a different name, email, or phone number."
                : "Add the people you're working with and their follow-up will start showing up on Today."}
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-card border border-subtle bg-surface">
            <table className="w-full text-body">
              <caption className="sr-only">People</caption>
              <thead>
                <tr className="border-b border-subtle bg-sunken text-label uppercase tracking-wide text-muted">
                  <th scope="col" className="px-4 py-2 text-left font-semibold">
                    Name
                  </th>
                  <th scope="col" className="hidden px-4 py-2 text-left font-semibold md:table-cell">
                    Stage
                  </th>
                  <th scope="col" className="hidden px-4 py-2 text-left font-semibold lg:table-cell">
                    Needs attention
                  </th>
                  <th scope="col" className="hidden px-4 py-2 text-right font-semibold sm:table-cell">
                    Amount
                  </th>
                  <th scope="col" className="px-4 py-2 text-right font-semibold">
                    Last activity
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const urgency = personUrgency(row, now);

                  return (
                    <tr
                      key={row.id}
                      className="border-b border-subtle last:border-0 hover:bg-sunken"
                    >
                      <td className="px-4 py-2.5">
                        <Link href={`/people/${row.id}`} className="flex items-center gap-2.5">
                          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-sunken text-label font-semibold text-secondary">
                            {initialsOf(`${row.firstName} ${row.lastName}`)}
                          </span>
                          <span className="min-w-0">
                            <span className="flex items-center gap-1.5">
                              <span className="truncate font-semibold text-primary">
                                {row.firstName} {row.lastName}
                              </span>
                              <LanguageBadge language={row.preferredLanguage} />
                              {row.doNotContact ? (
                                <Badge tone="critical">Do not contact</Badge>
                              ) : null}
                            </span>
                            <span className="block truncate text-small text-muted">
                              {row.emails?.[0]?.address ?? "—"}
                            </span>
                          </span>
                        </Link>
                      </td>

                      <td className="hidden px-4 py-2.5 md:table-cell">
                        {row.stage ? (
                          <StageChip stage={row.stage} />
                        ) : (
                          <span className="text-small text-muted">No opportunity</span>
                        )}
                      </td>

                      <td className="hidden px-4 py-2.5 lg:table-cell">
                        {urgency?.label && urgency.level !== "healthy" && urgency.level !== "neutral" ? (
                          <span className="inline-flex items-center gap-1.5">
                            <UrgencyDot tone={urgency.level} />
                            <span
                              className={cn(
                                "text-small",
                                urgency.level === "critical" && "font-semibold text-critical",
                                urgency.level === "warning" && "text-warning",
                                urgency.level === "info" && "text-info",
                              )}
                            >
                              {urgency.label}
                            </span>
                          </span>
                        ) : (
                          <span className="text-small text-disabled">—</span>
                        )}
                      </td>

                      <td className="hidden px-4 py-2.5 text-right text-secondary tnum sm:table-cell">
                        {moneyCompact(row.amount)}
                      </td>

                      <td className="px-4 py-2.5 text-right text-small text-muted tnum">
                        {relativeTime(row.lastActivityAt)}
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
            Showing the 200 most recently active. Search to narrow it down.
          </p>
        ) : null}
      </div>
    </>
  );
}
