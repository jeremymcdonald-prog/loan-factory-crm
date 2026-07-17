import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone, ArrowRight, Activity } from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import {
  getTeamMember,
  getMemberWorkload,
  memberOpenTasks,
  memberActiveLoans,
  memberActivity,
  listTeamMembers,
  ACTIVITY_LABELS,
} from "@/lib/queries/team";
import { ReassignTask } from "./reassign-task";
import { ROLE_LABELS, ROLE_DESCRIPTIONS, seesWholeBook, canManageUsers } from "@/lib/roles";
import { moneyCompact, relativeTime, absoluteTime, initialsOf, phoneNumber } from "@/lib/format";
import { taskUrgency } from "@/lib/urgency";
import { languageName } from "@/components/crm/language-badge";
import { StageChip } from "@/components/crm/stage-chip";
import { Badge, UrgencyDot } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ViewAsButton } from "../view-as-button";
import { responseTime } from "../response-time";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const user = await requireUser();
  const member = await queryAs(user, (db) => getTeamMember(db, id));
  if (!member) return { title: "Not found" };
  return { title: member.fullName };
}

/** Why this file is on their plate. */
const SEAT_LABELS: Record<string, string> = {
  lo: "Loan officer",
  processor: "Processing",
  coordinator: "Coordinator",
};

export default async function TeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const data = await queryAs(user, async (db) => {
    const member = await getTeamMember(db, id);
    if (!member) return null;

    return {
      member,
      workload: await getMemberWorkload(db, id),
      tasks: await memberOpenTasks(db, id),
      loans: await memberActiveLoans(db, id),
      activity: await memberActivity(db, id),
      // The reassign picker's targets — every active teammate in the tenant.
      roster: await listTeamMembers(db, null),
    };
  });

  if (!data) notFound();

  const { member, workload, tasks, loans, activity, roster } = data;
  const now = new Date();
  const firstName = member.fullName.split(/\s+/)[0] ?? member.fullName;
  const isSelf = member.id === user.userId;

  // Hiding the control is not access control — the action re-checks the role.
  // Nobody needs an audited look at their own book, so it's self-excluded too.
  const canViewAs = seesWholeBook(user.role) && !isSelf;
  // Reassignment is a leader's balancing tool — allowed on anyone's tasks,
  // including their own (moving your own work to a teammate is legitimate).
  const canActFor = seesWholeBook(user.role);

  const wholeBook = seesWholeBook(member.role);
  const managesUsers = canManageUsers(member.role);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="border-b border-subtle px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-sunken text-h3 font-semibold text-secondary">
              {initialsOf(member.fullName)}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-h1 font-semibold tracking-tight text-primary">
                  {member.fullName}
                  {isSelf ? (
                    <span className="ml-1.5 text-body font-normal text-muted">(you)</span>
                  ) : null}
                </h1>
                <Badge tone="neutral">{ROLE_LABELS[member.role] ?? member.role}</Badge>
                {member.leadsTeam && member.teamName ? (
                  <Badge tone="neutral">Leads {member.teamName}</Badge>
                ) : null}
                {/* The roster only lists active people, but this page is
                    reachable by link. Say so rather than let them look active. */}
                {member.status === "invited" ? (
                  <Badge tone="neutral">Invited — hasn&rsquo;t signed in yet</Badge>
                ) : null}
                {member.status === "disabled" ? (
                  <Badge tone="neutral">Access turned off</Badge>
                ) : null}
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-small text-secondary">
                <a
                  href={`mailto:${member.email}`}
                  className="inline-flex items-center gap-1.5 hover:text-action"
                >
                  <Mail className="size-3.5 text-muted" aria-hidden />
                  {member.email}
                </a>
                {member.phone ? (
                  <a
                    href={`tel:${member.phone.replace(/\D/g, "")}`}
                    className="inline-flex items-center gap-1.5 hover:text-action"
                  >
                    <Phone className="size-3.5 text-muted" aria-hidden />
                    {phoneNumber(member.phone)}
                  </a>
                ) : null}
                {member.teamName ? (
                  <span>
                    {member.teamName}
                    {member.teamBranch ? ` · ${member.teamBranch}` : ""}
                  </span>
                ) : null}
                {member.nmlsId ? <span className="tnum">NMLS {member.nmlsId}</span> : null}
              </div>
            </div>
          </div>

          {canViewAs ? (
            <div className="shrink-0">
              <ViewAsButton userId={member.id} firstName={firstName} />
              <p className="mt-1.5 max-w-56 text-small text-muted">
                You&rsquo;ll see {firstName}&rsquo;s queue exactly as it is — you
                can&rsquo;t change anything from there, and every time you open it,
                it&rsquo;s recorded.
              </p>
            </div>
          ) : null}
        </div>
      </header>

      <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_320px]">
        {/* Left: who they are here, then the work itself */}
        <div className="space-y-4">
          <Card>
            <div className="border-b border-subtle px-4 py-3">
              <h2 className="text-h3 font-semibold text-primary">
                What {firstName} can see
              </h2>
            </div>
            <div className="p-4">
              {/* Naming the role here rather than folding it into the heading:
                  lowercasing a label turns "LO assistant" into "lo assistant"
                  and "Administrator" into "a administrator". */}
              <p className="text-body text-secondary">
                <span className="font-semibold text-primary">
                  {ROLE_LABELS[member.role] ?? member.role}
                </span>
                {ROLE_DESCRIPTIONS[member.role]
                  ? ` — ${ROLE_DESCRIPTIONS[member.role]}`
                  : null}
              </p>

              <ul className="mt-3 space-y-2">
                {[
                  wholeBook
                    ? `${firstName} can see every person and every opportunity in the CRM, not only the ones they own.`
                    : `${firstName} sees only the people and opportunities they own. Everyone else's book is hidden from them.`,
                  managesUsers
                    ? `${firstName} can add teammates, change what role someone has, and turn someone's access on or off.`
                    : `${firstName} can't change anyone's access or role. That's an administrator's job.`,
                  wholeBook
                    ? `${firstName} can open a teammate's queue to see their day. It's read-only, and each time leaves a record.`
                    : `${firstName} can't open anyone else's queue.`,
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <span
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted"
                      aria-hidden
                    />
                    <span className="text-body text-secondary">{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3 border-b border-subtle px-4 py-3">
              <h2 className="text-h3 font-semibold text-primary">
                Active opportunities
                {workload && workload.activeFiles > 0 ? (
                  <span className="ml-1.5 text-small font-normal text-muted tnum">
                    {workload.activeFiles}
                  </span>
                ) : null}
              </h2>
              {workload && workload.activeVolume > 0 ? (
                <span className="text-small text-muted tnum">
                  {moneyCompact(workload.activeVolume)}
                </span>
              ) : null}
            </div>

            {loans.length > 0 ? (
              <ul className="divide-y divide-subtle">
                {loans.map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/opportunities/${l.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-sunken"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-primary">
                          {l.personFirstName} {l.personLastName}
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                          <StageChip stage={l.stage} />
                          <span className="text-small text-muted">
                            {SEAT_LABELS[l.seat] ?? l.seat}
                          </span>
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block font-semibold text-primary tnum">
                          {moneyCompact(l.amount ?? l.preapprovalAmount)}
                        </span>
                        <span className="mt-0.5 inline-flex items-center gap-1 text-small text-action">
                          Open
                          <ArrowRight className="size-3.5" aria-hidden />
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-6 text-center text-small text-muted">
                {firstName} isn&rsquo;t carrying any active files right now.
              </p>
            )}
          </Card>

          <Card>
            <div className="border-b border-subtle px-4 py-3">
              <h2 className="text-h3 font-semibold text-primary">Recent activity</h2>
            </div>
            <div className="p-4">
              {activity.length > 0 ? (
                <ol className="space-y-3">
                  {activity.map((a) => (
                    <li key={a.id} className="border-l-2 border-subtle pl-3">
                      <p className="text-body text-secondary">
                        {ACTIVITY_LABELS[a.kind]}
                        {a.personFirstName ? (
                          <>
                            {" with "}
                            {a.personId ? (
                              <Link
                                href={`/people/${a.personId}`}
                                className="font-semibold text-primary hover:text-action"
                              >
                                {a.personFirstName} {a.personLastName}
                              </Link>
                            ) : (
                              <span className="font-semibold text-primary">
                                {a.personFirstName} {a.personLastName}
                              </span>
                            )}
                          </>
                        ) : null}
                      </p>
                      <p className="mt-0.5 text-small text-muted tnum">
                        <time
                          dateTime={a.createdAt.toISOString()}
                          title={absoluteTime(a.createdAt)}
                        >
                          {relativeTime(a.createdAt, now)}
                        </time>
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="py-4 text-center">
                  <Activity className="mx-auto size-5 text-disabled" aria-hidden />
                  <p className="mt-2 text-small text-muted">
                    Nothing recorded yet. When {firstName} logs a touch, captures a
                    lead, or moves a file forward, it shows up here.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right rail: what's on their plate, and the facts behind it */}
        <div className="space-y-4">
          <Card>
            <div className="border-b border-subtle px-4 py-3">
              <h2 className="text-h3 font-semibold text-primary">
                Open tasks
                {workload && workload.openTasks > 0 ? (
                  <span className="ml-1.5 text-small font-normal text-muted tnum">
                    {workload.openTasks}
                  </span>
                ) : null}
              </h2>
              {workload && workload.overdueTasks > 0 ? (
                <p className="mt-0.5 text-small font-semibold text-warning tnum">
                  {workload.overdueTasks} overdue
                </p>
              ) : null}
              {workload && workload.pendingApprovals > 0 ? (
                <p className="mt-0.5 text-small text-ai tnum">
                  {workload.pendingApprovals} AI draft
                  {workload.pendingApprovals === 1 ? "" : "s"} awaiting their approval
                </p>
              ) : null}
            </div>

            <div className="p-4">
              {tasks.length > 0 ? (
                <ul className="space-y-3">
                  {tasks.map((t) => {
                    const urgency = taskUrgency(t.dueAt, now);
                    return (
                      <li key={t.id} className="flex items-start gap-2">
                        <span
                          className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted"
                          aria-hidden
                        />
                        <span className="min-w-0">
                          <span className="block text-body text-primary">{t.title}</span>
                          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            {urgency.label ? (
                              <span className="inline-flex items-center gap-1.5">
                                <UrgencyDot tone={urgency.level} />
                                <span
                                  className={cn(
                                    "text-small tnum",
                                    urgency.level === "warning" && "font-semibold text-warning",
                                    urgency.level === "info" && "text-info",
                                    urgency.level === "neutral" && "text-muted",
                                  )}
                                >
                                  {urgency.label}
                                </span>
                              </span>
                            ) : (
                              <span className="text-small text-muted">No due date</span>
                            )}
                            {t.personId ? (
                              <Link
                                href={`/people/${t.personId}`}
                                className="text-small text-action hover:underline"
                              >
                                {t.personFirstName} {t.personLastName}
                              </Link>
                            ) : null}
                            {canActFor ? (
                              <ReassignTask
                                taskId={t.id}
                                currentOwnerId={member.id}
                                targets={roster.map((r) => ({
                                  id: r.id,
                                  fullName: r.fullName,
                                }))}
                              />
                            ) : null}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-small text-muted">
                  Nothing open for {firstName}.
                </p>
              )}
            </div>
          </Card>

          <Card>
            <div className="border-b border-subtle px-4 py-3">
              <h2 className="text-h3 font-semibold text-primary">Details</h2>
            </div>
            <dl className="space-y-3 p-4">
              <div>
                <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                  NMLS ID
                </dt>
                <dd className="mt-0.5 text-body text-primary tnum">
                  {member.nmlsId ?? "Not set"}
                </dd>
              </div>
              <div>
                <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                  Works in
                </dt>
                <dd className="mt-0.5 text-body text-primary">
                  {languageName(member.language)}
                </dd>
              </div>
              <div>
                <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                  Median first reply to a lead
                </dt>
                <dd className="mt-0.5 text-body text-primary tnum">
                  {workload && workload.leadsAnswered > 0
                    ? `${responseTime(workload.medianResponseSeconds)} · ${
                        workload.leadsAnswered
                      } answered lead${workload.leadsAnswered === 1 ? "" : "s"}`
                    : "— no answered leads yet"}
                </dd>
              </div>
              <div>
                <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                  Last signed in
                </dt>
                <dd className="mt-0.5 text-body text-primary tnum">
                  {member.lastLoginAt ? absoluteTime(member.lastLoginAt) : "Never"}
                </dd>
              </div>
              <div>
                <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                  Added
                </dt>
                <dd className="mt-0.5 text-body text-primary tnum">
                  {relativeTime(member.createdAt, now)}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
