import type { Metadata } from "next";
import Link from "next/link";
import { Columns3, Rows3, Filter } from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import {
  listPipeline,
  listLeadOnlyContacts,
  type PipelineCard,
} from "@/lib/queries/pipeline";
import { stageLabel } from "@/lib/stages";
import { personUrgency } from "@/lib/person-urgency";
import { moneyCompact } from "@/lib/format";
import { PageHeader } from "@/components/shell/page-header";
import { LoanCard } from "@/components/crm/loan-card";
import { ContactCard } from "./contact-card";
import { PipelineTable } from "./pipeline-table";
import { PipelineBoard } from "./pipeline-board";
import { PipelineFilters, type FilterOption } from "./pipeline-filters";
import {
  PIPELINE_VIEWS,
  VIEW_LABELS,
  AMOUNT_BUCKETS,
  ACTIVITY_WINDOWS,
  STATUS_LABELS,
  viewOf,
  stagesInView,
  isPipelineView,
  channelLabel,
  recordAmount,
  recordLastActivity,
  type PipelineView,
  type PipelineRecord,
  type PipelineFilterState,
} from "./views";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Pipeline" };
export const dynamic = "force-dynamic";

const DAY_MS = 86_400_000;

/** Days until a date-only column (noon-anchored, matching lib/urgency.ts). */
function daysUntil(date: string | null, now: Date): number | null {
  if (!date) return null;
  return (new Date(`${date}T12:00:00`).getTime() - now.getTime()) / DAY_MS;
}

function applyFilters(
  records: PipelineRecord[],
  f: PipelineFilterState,
  now: Date,
): PipelineRecord[] {
  return records.filter((r) => {
    if (f.owner !== "all" && r.card.ownerUserId !== f.owner) return false;
    if (f.source !== "all" && r.card.leadChannel !== f.source) return false;

    if (f.status !== "all") {
      if (r.kind !== "loan" || r.card.loanStatus !== f.status) return false;
    }

    if (f.amt !== "all") {
      const bucket = AMOUNT_BUCKETS.find((b) => b.value === f.amt);
      const amount = recordAmount(r);
      if (!bucket || amount == null) return false;
      if (amount < bucket.min || amount >= bucket.max) return false;
    }

    if (f.act !== "all") {
      const window = ACTIVITY_WINDOWS.find((w) => w.value === f.act);
      if (!window) return false;
      const ageDays = (now.getTime() - recordLastActivity(r).getTime()) / DAY_MS;
      if (window.value === "older") {
        if (ageDays <= 30) return false;
      } else if (ageDays > window.maxDays) {
        return false;
      }
    }

    if (f.attn) {
      // Stalled files, overdue clocks, expiring locks — reusing lib/urgency.ts
      // via personUrgency, the same read every other screen uses.
      if (r.kind !== "loan") return false;
      const urgency = personUrgency(r.card, now);
      if (!urgency || (urgency.level !== "critical" && urgency.level !== "warning")) {
        return false;
      }
    }

    return true;
  });
}

/** The four numbers above each view, computed from the view's own rows. */
function tilesFor(
  view: PipelineView,
  loans: PipelineCard[],
  contactCount: number,
  now: Date,
): { label: string; value: string; meta?: string }[] {
  const volume = loans.reduce(
    (sum, c) => sum + Number(c.amount ?? c.preapprovalAmount ?? 0),
    0,
  );

  if (view === "leads") {
    const uncontacted = loans.filter((c) => c.capturedAt && !c.firstResponseAt).length;
    const consults = loans.filter((c) => c.stage === "consultation_scheduled").length;
    return [
      { label: "Leads", value: String(loans.length + contactCount) },
      { label: "Uncontacted", value: String(uncontacted) },
      { label: "Consultations set", value: String(consults) },
      { label: "Potential volume", value: moneyCompact(volume) },
    ];
  }

  if (view === "applications") {
    const docs = loans.filter((c) => c.docsNeeded).length;
    const uw = loans.filter((c) => c.stage === "submitted_to_underwriting").length;
    return [
      { label: "Files in process", value: String(loans.length) },
      { label: "Volume", value: moneyCompact(volume) },
      { label: "Waiting on docs", value: String(docs) },
      { label: "In underwriting", value: String(uw) },
    ];
  }

  if (view === "loans") {
    const closing7 = loans.filter((c) => {
      const d = daysUntil(c.closingDate, now);
      return d != null && d >= 0 && d <= 7;
    }).length;
    const locks7 = loans.filter((c) => {
      const d = daysUntil(c.rateLockExpiresAt, now);
      return d != null && d <= 7;
    }).length;
    return [
      { label: "Active files", value: String(loans.length) },
      { label: "Volume", value: moneyCompact(volume) },
      { label: "Closing in 7 days", value: String(closing7) },
      { label: "Locks expiring in 7 days", value: String(locks7) },
    ];
  }

  // Past clients.
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const fundedMtd = loans.filter(
    (c) => c.fundedAt && new Date(`${c.fundedAt}T12:00:00`) >= monthStart,
  );
  const refi = loans.filter((c) => c.stage === "refinance_opportunity").length;
  return [
    { label: "Past clients", value: String(loans.length) },
    { label: "Funded volume", value: moneyCompact(volume) },
    {
      label: "Funded this month",
      value: String(fundedMtd.length),
      meta: fundedMtd.length
        ? moneyCompact(
            fundedMtd.reduce((s, c) => s + Number(c.amount ?? 0), 0),
          )
        : undefined,
    },
    { label: "Refi opportunities", value: String(refi) },
  ];
}

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const tab: PipelineView =
    params.tab && isPipelineView(params.tab) ? params.tab : "leads";
  // `view` is the pre-rebuild param name for board/table; honor old links.
  const mode = (params.mode ?? params.view) === "table" ? "table" : "board";
  const filters: PipelineFilterState = {
    owner: params.owner ?? "all",
    source: params.source ?? "all",
    status: params.status ?? "all",
    amt: params.amt ?? "all",
    act: params.act ?? "all",
    attn: params.attn === "1",
  };
  const filtersActive =
    filters.owner !== "all" ||
    filters.source !== "all" ||
    filters.status !== "all" ||
    filters.amt !== "all" ||
    filters.act !== "all" ||
    filters.attn;

  const user = await requireUser();

  const { cards, contacts } = await queryAs(user, async (db) => ({
    cards: await listPipeline(db, user),
    contacts: await listLeadOnlyContacts(db, user),
  }));

  const now = new Date();

  // One dataset, four views: every loan lands in exactly one tab, and
  // lead-type people without a file yet appear alongside the earliest leads.
  const loansByView = new Map<PipelineView, PipelineCard[]>(
    PIPELINE_VIEWS.map((v): [PipelineView, PipelineCard[]] => [v, []]),
  );
  for (const card of cards) {
    loansByView.get(viewOf(card.stage, card.loanStatus))!.push(card);
  }

  const tabCounts: Record<PipelineView, number> = {
    leads: loansByView.get("leads")!.length + contacts.length,
    applications: loansByView.get("applications")!.length,
    loans: loansByView.get("loans")!.length,
    past: loansByView.get("past")!.length,
  };

  const viewLoans = loansByView.get(tab)!;
  const viewRecords: PipelineRecord[] = [
    ...viewLoans.map((card): PipelineRecord => ({ kind: "loan", card })),
    ...(tab === "leads"
      ? contacts.map((card): PipelineRecord => ({ kind: "contact", card }))
      : []),
  ];

  // Filter options come from the rows in this view — never a hardcoded list
  // that promises data we don't have.
  const owners: FilterOption[] = [];
  const sources: FilterOption[] = [];
  const statuses: FilterOption[] = [];
  {
    const ownerSeen = new Map<string, string>();
    const sourceSeen = new Set<string>();
    const statusSeen = new Set<string>();
    for (const r of viewRecords) {
      if (r.card.ownerUserId && r.card.ownerName) {
        ownerSeen.set(r.card.ownerUserId, r.card.ownerName);
      }
      if (r.card.leadChannel) sourceSeen.add(r.card.leadChannel);
      if (r.kind === "loan") statusSeen.add(r.card.loanStatus);
    }
    for (const [value, label] of [...ownerSeen].sort((a, b) => a[1].localeCompare(b[1]))) {
      owners.push({ value, label });
    }
    for (const value of [...sourceSeen].sort()) {
      sources.push({ value, label: channelLabel(value) });
    }
    for (const value of [...statusSeen].sort()) {
      statuses.push({ value, label: STATUS_LABELS[value] ?? value });
    }
  }

  const filtered = applyFilters(viewRecords, filters, now);
  const filteredLoans = filtered.flatMap((r) => (r.kind === "loan" ? [r.card] : []));
  const filteredContacts = filtered.flatMap((r) =>
    r.kind === "contact" ? [r.card] : [],
  );

  const tiles = tilesFor(tab, viewLoans, contacts.length, now);
  const stages = stagesInView(tab);

  const modeHref = (m: "board" | "table") => {
    const qs = new URLSearchParams();
    qs.set("tab", tab);
    qs.set("mode", m);
    for (const key of ["owner", "source", "status", "amt", "act"] as const) {
      if (filters[key] !== "all") qs.set(key, filters[key]);
    }
    if (filters.attn) qs.set("attn", "1");
    return `/pipeline?${qs.toString()}`;
  };

  return (
    // A column so the board (and only the board) can claim exactly the
    // height left over below the header/filters/tiles and scroll within
    // it — see pipeline-board.tsx for why that's what makes the sticky
    // column headers work.
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        className="shrink-0"
        title="Pipeline"
        subtitle="Your book in four working views — leads, applications, active loans, and past clients."
        action={
          <div className="flex rounded-md border border-subtle p-0.5">
            <Link
              href={modeHref("board")}
              aria-current={mode === "board" ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-small font-semibold transition-colors",
                mode === "board" ? "bg-action text-action-fg" : "text-secondary hover:text-primary",
              )}
            >
              <Columns3 className="size-3.5" aria-hidden />
              Board
            </Link>
            <Link
              href={modeHref("table")}
              aria-current={mode === "table" ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-small font-semibold transition-colors",
                mode === "table" ? "bg-action text-action-fg" : "text-secondary hover:text-primary",
              )}
            >
              <Rows3 className="size-3.5" aria-hidden />
              Table
            </Link>
          </div>
        }
      />

      {/* View tabs + filters share one row, like People. Switching tabs
          resets filters — each view derives its own options. */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-subtle px-4 py-3 sm:px-6">
        <nav className="flex flex-wrap gap-1" aria-label="Pipeline view">
          {PIPELINE_VIEWS.map((v) => {
            const active = tab === v;
            return (
              <Link
                key={v}
                href={`/pipeline?tab=${v}&mode=${mode}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-small font-semibold transition-colors",
                  active
                    ? "bg-action text-action-fg"
                    : "text-secondary hover:bg-sunken hover:text-primary",
                )}
              >
                {VIEW_LABELS[v]}
                <span className={cn("tnum text-micro", active ? "opacity-80" : "text-muted")}>
                  {tabCounts[v]}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto">
          <PipelineFilters
            tab={tab}
            mode={mode}
            owner={filters.owner}
            source={filters.source}
            status={filters.status}
            amt={filters.amt}
            act={filters.act}
            attn={filters.attn}
            owners={owners}
            sources={sources}
            statuses={statuses}
            amounts={AMOUNT_BUCKETS.map((b) => ({ value: b.value, label: b.label }))}
            activity={ACTIVITY_WINDOWS.map((w) => ({ value: w.value, label: w.label }))}
          />
        </div>
      </div>

      {/* The four numbers that matter for this view, from the same rows below. */}
      <div className="grid shrink-0 grid-cols-2 gap-px border-b border-subtle bg-subtle sm:grid-cols-4">
        {tiles.map((stat) => (
          <div key={stat.label} className="bg-canvas px-4 py-3">
            <p className="text-label font-semibold uppercase tracking-wide text-muted">
              {stat.label}
            </p>
            <p className="mt-1 text-metric-md font-semibold text-primary tnum">{stat.value}</p>
            {stat.meta ? <p className="text-small text-muted tnum">{stat.meta}</p> : null}
          </div>
        ))}
      </div>

      {viewRecords.length === 0 ? (
        <div className="shrink-0 p-6">
          <div className="rounded-card border border-subtle bg-surface px-6 py-14 text-center">
            <Columns3 className="mx-auto size-6 text-disabled" aria-hidden />
            <p className="mt-3 text-h3 font-semibold text-primary">
              Nothing in {VIEW_LABELS[tab].toLowerCase()} yet
            </p>
            <p className="mx-auto mt-1 max-w-sm text-body text-secondary">
              {tab === "leads"
                ? "Add someone in People with an intent and they'll appear here at stage 1."
                : "Files land here as their stage moves through the lifecycle."}
            </p>
            <Link
              href="/people"
              className="mt-4 inline-flex h-9 items-center rounded-control bg-action px-3.5 text-body font-semibold text-action-fg hover:bg-action-hover"
            >
              Go to People
            </Link>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="shrink-0 p-6">
          <div className="rounded-card border border-subtle bg-surface px-6 py-14 text-center">
            <Filter className="mx-auto size-6 text-disabled" aria-hidden />
            <p className="mt-3 text-h3 font-semibold text-primary">
              No records match these filters
            </p>
            <p className="mx-auto mt-1 max-w-sm text-body text-secondary">
              {viewRecords.length} record{viewRecords.length === 1 ? "" : "s"} in{" "}
              {VIEW_LABELS[tab].toLowerCase()} are hidden by the current filters.
            </p>
            <Link
              href={`/pipeline?tab=${tab}&mode=${mode}`}
              className="mt-4 inline-flex h-9 items-center rounded-control border border-strong bg-surface px-3.5 text-body font-semibold text-primary hover:bg-sunken"
            >
              Clear filters
            </Link>
          </div>
        </div>
      ) : mode === "table" ? (
        <div className="shrink-0">
          <PipelineTable records={filtered} />
        </div>
      ) : (
        /* Board: one column per stage in this view — the real stages, not
           macro phases. Lead-type people with no file yet get a column of
           their own at the front of Leads. Columns stay a comfortable fixed
           width (never crushed) and the board scrolls horizontally when
           they don't all fit. */
        <PipelineBoard className="min-h-0 flex-1">
          {tab === "leads" && contacts.length > 0 ? (
            <section className="flex w-[280px] shrink-0 flex-col pt-4 sm:pt-6">
              <header className="sticky top-0 z-10 flex items-baseline justify-between gap-2 bg-canvas px-0.5 pb-2">
                <h2 className="text-label font-semibold uppercase tracking-wide text-primary">
                  No file yet
                  <span className="ml-1.5 font-normal text-muted tnum">
                    {filteredContacts.length}
                  </span>
                </h2>
              </header>
              <div className="flex-1 space-y-1.5 rounded-lg bg-sunken/60 p-2">
                {filteredContacts.map((contact) => (
                  <ContactCard key={contact.personId} contact={contact} now={now} />
                ))}
                {filteredContacts.length === 0 ? (
                  <p className="px-1 py-6 text-center text-small text-disabled">
                    Filtered out
                  </p>
                ) : null}
              </div>
            </section>
          ) : null}

          {stages.map((stage) => {
            const stageCards = filteredLoans.filter((c) => c.stage === stage);
            const volume = stageCards.reduce(
              (sum, c) => sum + Number(c.amount ?? c.preapprovalAmount ?? 0),
              0,
            );
            return (
              <section key={stage} className="flex w-[280px] shrink-0 flex-col">
                <header className="sticky top-0 z-10 flex items-baseline justify-between gap-2 bg-canvas px-0.5 pb-2">
                  <h2 className="text-label font-semibold uppercase tracking-wide text-primary">
                    {stageLabel(stage)}
                    <span className="ml-1.5 font-normal text-muted tnum">
                      {stageCards.length}
                    </span>
                  </h2>
                  {volume > 0 ? (
                    <span className="text-small text-muted tnum">{moneyCompact(volume)}</span>
                  ) : null}
                </header>

                <div className="flex-1 space-y-1.5 rounded-lg bg-sunken/60 p-2">
                  {stageCards.map((card) => (
                    <LoanCard key={card.loanId} card={card} now={now} />
                  ))}
                  {stageCards.length === 0 ? (
                    <p className="px-1 py-6 text-center text-small text-disabled">
                      {filtersActive ? "Nothing matches here" : "Nothing here"}
                    </p>
                  ) : null}
                </div>
              </section>
            );
          })}
        </PipelineBoard>
      )}
    </div>
  );
}
