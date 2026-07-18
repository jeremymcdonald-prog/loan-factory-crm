import type { Metadata } from "next";
import Link from "next/link";
import { Users, FileUp } from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import { listPeople, countPeopleByType, listCampaignChoices } from "@/lib/queries/people";
import { PageHeader } from "@/components/shell/page-header";
import { NewPersonButton } from "./new-person-button";
import { PeopleTable } from "./people-table";
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

  const { rows, counts, campaigns } = await queryAs(user, async (db) => ({
    rows: await listPeople(db, user, { q, type }),
    counts: await countPeopleByType(db, user),
    campaigns: await listCampaignChoices(db, user),
  }));

  return (
    <>
      <PageHeader
        title="People"
        subtitle="Everyone you're working with — leads, borrowers, past clients, and your sphere."
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/people/import"
              className="inline-flex h-9 items-center gap-2 rounded-control border border-strong bg-surface px-3.5 text-body font-semibold text-primary shadow-e1 hover:bg-sunken"
            >
              <FileUp className="size-4" aria-hidden />
              Import
            </Link>
            <NewPersonButton />
          </div>
        }
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
          <PeopleTable rows={rows} campaigns={campaigns} />
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
