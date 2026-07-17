import type { Metadata } from "next";
import Link from "next/link";
import { UsersRound } from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import { getMyTeam, listTeamMembers, teamTotals } from "@/lib/queries/team";
import { ROLE_LABELS, canManageUsers } from "@/lib/roles";
import { moneyCompact, initialsOf } from "@/lib/format";
import { PageHeader } from "@/components/shell/page-header";
import { WorkloadBar } from "./workload-bar";
import { responseTime } from "./response-time";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Team" };
export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const user = await requireUser();

  const { myTeam, members, totals } = await queryAs(user, async (db) => {
    const team = await getMyTeam(db, user);
    const rows = await listTeamMembers(db, team?.id ?? null);
    return {
      myTeam: team,
      members: rows,
      totals: await teamTotals(
        db,
        rows.map((m) => m.id),
      ),
    };
  });

  return (
    <>
      <PageHeader
        title="Team"
        subtitle="Who's carrying what, and where the work is piling up."
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
        {members.length === 0 ? (
          <div className="rounded-card border border-subtle bg-surface px-6 py-14 text-center">
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
          <div className="overflow-hidden rounded-card border border-subtle bg-surface">
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
      </div>
    </>
  );
}
