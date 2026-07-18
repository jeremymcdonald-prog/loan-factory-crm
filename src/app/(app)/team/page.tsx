import type { Metadata } from "next";
import Link from "next/link";
import { UsersRound, Trophy, Search } from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import {
  getMyTeam,
  listTeamMembers,
  teamTotals,
  leaderboard,
  isLeaderboardPeriod,
  searchLoanOfficers,
  listTeams,
  type LeaderboardPeriod,
} from "@/lib/queries/team";
import { ROLE_LABELS, canManageUsers, seesWholeBook } from "@/lib/roles";
import { moneyCompact, initialsOf } from "@/lib/format";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { WorkloadBar } from "./workload-bar";
import { responseTime } from "./response-time";
import {
  LeaderboardTable,
  rankLeaderboard,
  isLeaderboardSortKey,
  type LeaderboardSortKey,
} from "./leaderboard-table";
import { AddMemberButton, RemoveMemberButton, JoinTeamButton } from "./member-actions";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Team" };
export const dynamic = "force-dynamic";

const VIEW_TABS = [
  { key: "roster", label: "Workload" },
  { key: "leaderboard", label: "Leaderboard" },
] as const;

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; period?: string; sort?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const user = await requireUser();

  const view = sp.view === "leaderboard" ? "leaderboard" : "roster";
  const period: LeaderboardPeriod = isLeaderboardPeriod(sp.period ?? "")
    ? (sp.period as LeaderboardPeriod)
    : "month";
  const sort: LeaderboardSortKey = isLeaderboardSortKey(sp.sort ?? "")
    ? (sp.sort as LeaderboardSortKey)
    : "volume";
  const q = (sp.q ?? "").trim();

  // Whether the viewer shapes teams. Hiding controls is convenience only —
  // every action re-checks this server-side.
  const isLeader = seesWholeBook(user.role) || canManageUsers(user.role);

  const data = await queryAs(user, async (db) => {
    const myTeam = await getMyTeam(db, user);
    const members = await listTeamMembers(db, myTeam?.id ?? null);
    return {
      myTeam,
      members,
      totals: await teamTotals(
        db,
        members.map((m) => m.id),
      ),
      board: view === "leaderboard" ? await leaderboard(db, period) : null,
      // A leader's search across every LO in the company, driven by ?q=.
      loMatches: view === "roster" && isLeader && q ? await searchLoanOfficers(db, q) : null,
      // The self-service picker for everyone who doesn't shape teams.
      teams: view === "roster" && !isLeader ? await listTeams(db) : null,
    };
  });

  const { myTeam, members, totals, board, loMatches, teams } = data;
  const ranked = board ? rankLeaderboard(board, sort) : null;

  return (
    <>
      <PageHeader
        title="Team"
        subtitle="Who's carrying what, where the work is piling up — and who's out in front."
        meta={
          myTeam ? (
            <p className="text-small text-secondary">
              <span className="font-semibold text-primary">{myTeam.name}</span>
              {myTeam.branch ? <> · {myTeam.branch}</> : null}
              {myTeam.leaderName ? (
                <> · Led by {myTeam.leaderName}</>
              ) : (
                <> · No leader named yet</>
              )}
            </p>
          ) : (
            <p className="text-small text-secondary">
              You&rsquo;re not on a team yet, so this is everyone at your company.
            </p>
          )
        }
        action={
          canManageUsers(user.role) ? (
            <Link
              href="/settings/users"
              className="inline-flex h-9 items-center gap-2 rounded-control bg-action px-3.5 text-body font-semibold text-action-fg shadow-e1 hover:bg-action-hover"
            >
              <UsersRound className="size-4" aria-hidden />
              Manage members
            </Link>
          ) : null
        }
      />

      {/* The team's four numbers, counted over files — not summed from the rows
          below, where a shared file would be counted once per person on it. */}
      <div className="grid grid-cols-2 gap-px border-b border-subtle bg-subtle sm:grid-cols-4">
        {[
          { label: "Active files", value: String(totals.activeFiles) },
          { label: "Active volume", value: moneyCompact(totals.activeVolume) },
          { label: "Open tasks", value: String(totals.openTasks) },
          {
            label: "Overdue tasks",
            value: String(totals.overdueTasks),
            urgent: totals.overdueTasks > 0,
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-canvas px-4 py-3">
            <p className="text-label font-semibold uppercase tracking-wide text-muted">
              {stat.label}
            </p>
            <p
              className={cn(
                "mt-1 text-metric-md font-semibold tnum",
                stat.urgent ? "text-warning" : "text-primary",
              )}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="p-4 sm:p-6">
        <nav className="flex flex-wrap gap-1" aria-label="Team view">
          {VIEW_TABS.map((tab) => {
            const active = view === tab.key;
            return (
              <Link
                key={tab.key}
                href={tab.key === "roster" ? "/team" : "/team?view=leaderboard"}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-small font-semibold transition-colors",
                  active
                    ? "bg-action text-action-fg"
                    : "text-secondary hover:bg-sunken hover:text-primary",
                )}
              >
                {tab.key === "leaderboard" ? (
                  <Trophy className="size-3.5" aria-hidden />
                ) : null}
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {view === "leaderboard" && ranked ? (
          <section className="mt-4" aria-label="Loan officer leaderboard">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h2 className="text-h3 font-semibold text-primary">
                Loan officer leaderboard
              </h2>
              <Badge tone="neutral">Demo data</Badge>
            </div>
            {ranked.length === 0 ? (
              <div className="rounded-card border border-subtle bg-surface px-6 py-14 text-center">
                <Trophy className="mx-auto size-6 text-disabled" aria-hidden />
                <p className="mt-3 text-h3 font-semibold text-primary">
                  No loan officers to rank yet
                </p>
                <p className="mx-auto mt-1 max-w-sm text-body text-secondary">
                  Once loan officers are added and working files, their production
                  shows up here for every period.
                </p>
              </div>
            ) : (
              <LeaderboardTable
                rows={ranked}
                period={period}
                sort={sort}
                currentUserId={user.userId}
              />
            )}
          </section>
        ) : (
          <>
            {members.length === 0 ? (
              <div className="mt-4 rounded-card border border-subtle bg-surface px-6 py-14 text-center">
                <UsersRound className="mx-auto size-6 text-disabled" aria-hidden />
                <p className="mt-3 text-h3 font-semibold text-primary">Nobody here yet</p>
                <p className="mx-auto mt-1 max-w-sm text-body text-secondary">
                  Once teammates are added they show up here with the work they&rsquo;re
                  carrying, so you can see how it&rsquo;s spread.
                </p>
                {canManageUsers(user.role) ? (
                  <Link
                    href="/settings/users"
                    className="mt-4 inline-flex h-9 items-center rounded-control bg-action px-3.5 text-body font-semibold text-action-fg hover:bg-action-hover"
                  >
                    Add a teammate
                  </Link>
                ) : (
                  <p className="mx-auto mt-1 max-w-sm text-small text-muted">
                    An administrator adds teammates in Settings.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-4 overflow-hidden rounded-card border border-subtle bg-surface">
                <table className="w-full text-body">
                  <caption className="sr-only">
                    Team members and the work each one is carrying
                  </caption>
                  <thead>
                    <tr className="border-b border-subtle bg-sunken text-label uppercase tracking-wide text-muted">
                      <th scope="col" className="px-4 py-2 text-left font-semibold">
                        Name
                      </th>
                      <th
                        scope="col"
                        className="hidden px-4 py-2 text-left font-semibold md:table-cell"
                      >
                        Role
                      </th>
                      <th
                        scope="col"
                        className="hidden px-4 py-2 text-left font-semibold xl:table-cell"
                      >
                        NMLS
                      </th>
                      <th
                        scope="col"
                        className="hidden px-4 py-2 text-left font-semibold lg:table-cell"
                      >
                        Share of files
                      </th>
                      <th scope="col" className="px-4 py-2 text-right font-semibold">
                        Files
                      </th>
                      <th
                        scope="col"
                        className="hidden px-4 py-2 text-right font-semibold sm:table-cell"
                      >
                        Volume
                      </th>
                      <th scope="col" className="px-4 py-2 text-right font-semibold">
                        Tasks
                      </th>
                      <th
                        scope="col"
                        className="hidden px-4 py-2 text-right font-semibold xl:table-cell"
                      >
                        Median first reply
                      </th>
                      {isLeader && myTeam ? (
                        <th scope="col" className="px-4 py-2 text-right font-semibold">
                          <span className="sr-only">Membership</span>
                        </th>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr
                        key={member.id}
                        className="border-b border-subtle last:border-0 hover:bg-sunken"
                      >
                        <td className="px-4 py-2.5">
                          <Link href={`/team/${member.id}`} className="flex items-center gap-2.5">
                            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-sunken text-label font-semibold text-secondary">
                              {initialsOf(member.fullName)}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate font-semibold text-primary">
                                {member.fullName}
                                {member.id === user.userId ? (
                                  <span className="ml-1.5 text-small font-normal text-muted">
                                    (you)
                                  </span>
                                ) : null}
                              </span>
                              <span className="block truncate text-small text-muted">
                                {member.email}
                              </span>
                              {/* The role has its own column from md up. */}
                              <span className="block truncate text-small text-secondary md:hidden">
                                {ROLE_LABELS[member.role] ?? member.role}
                              </span>
                            </span>
                          </Link>
                        </td>

                        <td className="hidden px-4 py-2.5 text-secondary md:table-cell">
                          {ROLE_LABELS[member.role] ?? member.role}
                        </td>

                        <td className="hidden px-4 py-2.5 text-secondary tnum xl:table-cell">
                          {member.nmlsId ?? <span className="text-disabled">—</span>}
                        </td>

                        <td className="hidden px-4 py-2.5 lg:table-cell">
                          <WorkloadBar files={member.activeFiles} teamFiles={totals.activeFiles} />
                        </td>

                        <td className="px-4 py-2.5 text-right text-primary tnum">
                          {member.activeFiles}
                        </td>

                        <td className="hidden px-4 py-2.5 text-right text-secondary tnum sm:table-cell">
                          {member.activeVolume > 0 ? (
                            moneyCompact(member.activeVolume)
                          ) : (
                            <span className="text-disabled">—</span>
                          )}
                        </td>

                        <td className="px-4 py-2.5 text-right tnum">
                          <span className="block text-primary">{member.openTasks}</span>
                          {member.overdueTasks > 0 ? (
                            <span className="block text-small font-semibold text-warning">
                              {member.overdueTasks} overdue
                            </span>
                          ) : null}
                          {member.pendingApprovals > 0 ? (
                            <span className="block text-small text-ai tnum">
                              {member.pendingApprovals} to approve
                            </span>
                          ) : null}
                        </td>

                        <td
                          className="hidden px-4 py-2.5 text-right text-secondary tnum xl:table-cell"
                          title={
                            member.leadsAnswered > 0
                              ? `Median of ${member.leadsAnswered} answered lead${
                                  member.leadsAnswered === 1 ? "" : "s"
                                }`
                              : undefined
                          }
                        >
                          {member.medianResponseSeconds === null ? (
                            <span className="text-disabled">—</span>
                          ) : (
                            responseTime(member.medianResponseSeconds)
                          )}
                        </td>

                        {isLeader && myTeam ? (
                          <td className="px-4 py-2.5 text-right">
                            {member.id !== user.userId ? (
                              <RemoveMemberButton
                                userId={member.id}
                                fullName={member.fullName}
                                teamName={myTeam.name}
                              />
                            ) : null}
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <p className="mt-3 text-small text-muted">
              A file counts toward everyone working it — the loan officer, the processor,
              and the coordinator — so the shares above don&rsquo;t add up to 100%. Median
              first reply is measured from when a lead came in to the first response, and
              shows &ldquo;—&rdquo; for anyone who owns no answered leads.
            </p>

            {/* Leaders build the roster; the actions re-check the role server-side. */}
            {isLeader ? (
              <Card className="mt-6">
                <div className="border-b border-subtle px-4 py-3">
                  <h2 className="text-h3 font-semibold text-primary">
                    Add a loan officer{myTeam ? ` to ${myTeam.name}` : ""}
                  </h2>
                  <p className="mt-0.5 text-small text-secondary">
                    Search every loan officer at your company by name or email.
                    Adding someone moves them onto your roster and is recorded.
                  </p>
                </div>
                <div className="p-4">
                  {myTeam ? (
                    <>
                      <form method="get" action="/team" className="flex flex-wrap gap-2">
                        <input type="hidden" name="view" value="roster" />
                        <label htmlFor="lo-search" className="sr-only">
                          Search loan officers by name or email
                        </label>
                        <input
                          id="lo-search"
                          name="q"
                          defaultValue={q}
                          placeholder="Name or email…"
                          className="h-9 w-full max-w-xs rounded-control border border-strong bg-surface px-3 text-body text-primary placeholder:text-muted focus:border-brand focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="inline-flex h-9 items-center gap-2 rounded-control bg-action px-3.5 text-body font-semibold text-action-fg hover:bg-action-hover"
                        >
                          <Search className="size-4" aria-hidden />
                          Search
                        </button>
                      </form>

                      {loMatches ? (
                        loMatches.length > 0 ? (
                          <ul className="mt-4 divide-y divide-subtle rounded-card border border-subtle">
                            {loMatches.map((lo) => (
                              <li
                                key={lo.id}
                                className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5"
                              >
                                <span className="min-w-0">
                                  <span className="block truncate font-semibold text-primary">
                                    {lo.fullName}
                                  </span>
                                  <span className="block truncate text-small text-muted">
                                    {lo.email}
                                    {lo.nmlsId ? ` · NMLS ${lo.nmlsId}` : ""}
                                    {lo.teamName ? ` · Now on ${lo.teamName}` : " · No team"}
                                  </span>
                                </span>
                                {lo.teamId === myTeam.id ? (
                                  <Badge tone="healthy">On your team</Badge>
                                ) : (
                                  <AddMemberButton userId={lo.id} fullName={lo.fullName} />
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-4 text-small text-muted">
                            No loan officer matches &ldquo;{q}&rdquo;. Try part of a
                            name or an email address.
                          </p>
                        )
                      ) : null}
                    </>
                  ) : (
                    <p className="text-small text-muted">
                      You&rsquo;re not on a team yet, so there&rsquo;s no roster to add
                      anyone to. An administrator can put you on one in Settings.
                    </p>
                  )}
                </div>
              </Card>
            ) : (
              /* Everyone else picks their own seat. */
              teams && teams.length > 0 ? (
                <Card className="mt-6">
                  <div className="border-b border-subtle px-4 py-3">
                    <h2 className="text-h3 font-semibold text-primary">
                      {myTeam ? "Switch teams" : "Join a team"}
                    </h2>
                    <p className="mt-0.5 text-small text-secondary">
                      Pick the team you work with. Your book stays yours — this only
                      changes whose roster you appear on, and it&rsquo;s recorded.
                    </p>
                  </div>
                  <ul className="divide-y divide-subtle">
                    {teams.map((t) => {
                      const mine = myTeam?.id === t.id;
                      return (
                        <li
                          key={t.id}
                          className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5"
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-semibold text-primary">
                              {t.name}
                              {t.branch ? (
                                <span className="ml-1.5 font-normal text-muted">
                                  · {t.branch}
                                </span>
                              ) : null}
                            </span>
                            <span className="block truncate text-small text-muted tnum">
                              {t.memberCount} member{t.memberCount === 1 ? "" : "s"}
                              {t.leaderName ? ` · Led by ${t.leaderName}` : ""}
                            </span>
                          </span>
                          {mine ? (
                            <Badge tone="healthy">Your team</Badge>
                          ) : (
                            <JoinTeamButton teamId={t.id} teamName={t.name} />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </Card>
              ) : null
            )}
          </>
        )}
      </div>
    </>
  );
}
