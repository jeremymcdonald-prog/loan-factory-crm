import Link from "next/link";
import { ArrowDown } from "lucide-react";
import type { LeaderboardPeriod, LeaderboardRow } from "@/lib/queries/team";
import { LEADERBOARD_PERIODS } from "@/lib/queries/team";
import { moneyCompact, initialsOf } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * The leaderboard — one ranked table, resortable by any metric column via
 * searchParams (`?sort=`), over the period the tabs pick (`?period=`).
 * Server-rendered end to end: every control is a link, so ranks are computed
 * once, here, from the database's numbers.
 */

export const LEADERBOARD_SORTS = [
  { key: "applications", label: "Apps", hide: "" },
  { key: "preapprovals", label: "Preapp", hide: "hidden lg:table-cell" },
  { key: "loans", label: "Active", hide: "hidden sm:table-cell" },
  { key: "closings", label: "Closings", hide: "" },
  { key: "volume", label: "Volume", hide: "" },
  { key: "conversion", label: "Conv.", hide: "hidden md:table-cell" },
  { key: "referrals", label: "Referrals", hide: "hidden lg:table-cell" },
  { key: "marketing", label: "Marketing", hide: "hidden xl:table-cell" },
] as const;

export type LeaderboardSortKey = (typeof LEADERBOARD_SORTS)[number]["key"];

export function isLeaderboardSortKey(value: string): value is LeaderboardSortKey {
  return LEADERBOARD_SORTS.some((s) => s.key === value);
}

export type RankedRow = LeaderboardRow & {
  /** Campaigns owned + video/message drafts created — one marketing number. */
  marketingActivity: number;
  /** Closings ÷ leads captured in the period; null when they had no leads. */
  conversionPct: number | null;
  rank: number;
};

function metricValue(row: Omit<RankedRow, "rank">, sort: LeaderboardSortKey): number {
  switch (sort) {
    case "applications":
      return row.applications;
    case "preapprovals":
      return row.preapprovals;
    case "loans":
      return row.activeLoans;
    case "closings":
      return row.closings;
    case "volume":
      return row.fundedVolume;
    case "conversion":
      // No leads means no conversion to speak of — rank below a real 0%.
      return row.conversionPct ?? -1;
    case "referrals":
      return row.referrals;
    case "marketing":
      return row.marketingActivity;
  }
}

/** Best first on the chosen metric; volume then name break ties, stably. */
export function rankLeaderboard(
  rows: LeaderboardRow[],
  sort: LeaderboardSortKey,
): RankedRow[] {
  const enriched = rows.map((r) => ({
    ...r,
    marketingActivity: r.campaignsOwned + r.draftsCreated,
    conversionPct: r.leadsCaptured > 0 ? (r.closings / r.leadsCaptured) * 100 : null,
  }));

  return enriched
    .sort(
      (a, b) =>
        metricValue(b, sort) - metricValue(a, sort) ||
        b.fundedVolume - a.fundedVolume ||
        a.fullName.localeCompare(b.fullName),
    )
    .map((r, i) => ({ ...r, rank: i + 1 }));
}

/** Podium chips for the top three; a plain number for everyone else. */
function RankMark({ rank }: { rank: number }) {
  const podium: Record<number, string> = {
    1: "bg-warning-bg text-warning border border-warning-border",
    2: "bg-neutral-bg text-neutral border border-neutral-border",
    3: "bg-action-tint text-action border border-action-tint-border",
  };
  return (
    <span
      className={cn(
        "inline-flex size-6 items-center justify-center rounded-full text-small font-semibold tnum",
        podium[rank] ?? "text-muted",
      )}
      aria-label={`Rank ${rank}`}
    >
      {rank}
    </span>
  );
}

function cell(row: RankedRow, key: LeaderboardSortKey): string {
  switch (key) {
    case "applications":
      return String(row.applications);
    case "preapprovals":
      return String(row.preapprovals);
    case "loans":
      return String(row.activeLoans);
    case "closings":
      return String(row.closings);
    case "volume":
      return row.fundedVolume > 0 ? moneyCompact(row.fundedVolume) : "—";
    case "conversion":
      return row.conversionPct === null ? "—" : `${Math.round(row.conversionPct)}%`;
    case "referrals":
      return String(row.referrals);
    case "marketing":
      return String(row.marketingActivity);
  }
}

export function LeaderboardTable({
  rows,
  period,
  sort,
  currentUserId,
}: {
  rows: RankedRow[];
  period: LeaderboardPeriod;
  sort: LeaderboardSortKey;
  currentUserId: string;
}) {
  const href = (p: LeaderboardPeriod, s: LeaderboardSortKey) =>
    `/team?view=leaderboard&period=${p}&sort=${s}`;

  return (
    <>
      <nav className="flex flex-wrap gap-1" aria-label="Leaderboard period">
        {LEADERBOARD_PERIODS.map((p) => {
          const active = p.key === period;
          return (
            <Link
              key={p.key}
              href={href(p.key, sort)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex items-center rounded-md px-2.5 py-1.5 text-small font-semibold transition-colors",
                active
                  ? "bg-action text-action-fg"
                  : "text-secondary hover:bg-sunken hover:text-primary",
              )}
            >
              {p.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 overflow-hidden rounded-card border border-subtle bg-surface">
        <table className="w-full text-body">
          <caption className="sr-only">
            Loan officer leaderboard, ranked by the selected metric for the
            selected period
          </caption>
          <thead>
            <tr className="border-b border-subtle bg-sunken text-label uppercase tracking-wide text-muted">
              <th scope="col" className="w-12 px-4 py-2 text-left font-semibold">
                Rank
              </th>
              <th scope="col" className="px-4 py-2 text-left font-semibold">
                Loan officer
              </th>
              {LEADERBOARD_SORTS.map((col) => {
                const active = col.key === sort;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={active ? "descending" : undefined}
                    className={cn("px-3 py-2 text-right font-semibold", col.hide)}
                  >
                    <Link
                      href={href(period, col.key)}
                      className={cn(
                        "inline-flex items-center gap-0.5 hover:text-primary",
                        active && "text-action",
                      )}
                    >
                      {col.label}
                      {active ? <ArrowDown className="size-3" aria-hidden /> : null}
                    </Link>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const you = row.id === currentUserId;
              return (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-subtle last:border-0",
                    you ? "bg-action-tint" : "hover:bg-sunken",
                  )}
                >
                  <td className="px-4 py-2.5">
                    <RankMark rank={row.rank} />
                  </td>
                  <td className="px-4 py-2.5">
                    <Link href={`/team/${row.id}`} className="flex items-center gap-2.5">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-sunken text-label font-semibold text-secondary">
                        {initialsOf(row.fullName)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-primary">
                          {row.fullName}
                          {you ? (
                            <span className="ml-1.5 text-small font-normal text-muted">
                              (you)
                            </span>
                          ) : null}
                        </span>
                        {row.nmlsId ? (
                          <span className="block truncate text-small text-muted tnum">
                            NMLS {row.nmlsId}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </td>
                  {LEADERBOARD_SORTS.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-3 py-2.5 text-right tnum",
                        col.key === sort ? "font-semibold text-primary" : "text-secondary",
                        col.hide,
                      )}
                      title={
                        col.key === "conversion" && row.conversionPct !== null
                          ? `${row.closings} closing${row.closings === 1 ? "" : "s"} from ${row.leadsCaptured} lead${row.leadsCaptured === 1 ? "" : "s"}`
                          : col.key === "marketing"
                            ? `${row.campaignsOwned} campaign${row.campaignsOwned === 1 ? "" : "s"} + ${row.draftsCreated} draft${row.draftsCreated === 1 ? "" : "s"}`
                            : undefined
                      }
                    >
                      {cell(row, col.key)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-small text-muted">
        Apps count files that entered the application stages in the period;
        preapprovals, files that reached preapproval. Closings and volume are files
        funded in the period. Conversion is closings ÷ leads captured in the period
        (&ldquo;—&rdquo; when no leads came in). Referrals are partner referrals
        received; marketing is campaigns created plus video and message drafts.
        Active files are today&rsquo;s book, whatever the period.
      </p>
    </>
  );
}
