/**
 * Team queries — the Team module's read layer.
 *
 * Workload is computed in SQL, never by counting rows in the page: the numbers
 * a leader uses to decide who is drowning have to be the database's answer, not
 * whatever happened to fit inside a LIMIT.
 *
 * Scope: RLS pins every row to the caller's tenant (migration 0001). The
 * per-user book scoping that People and Pipeline apply is deliberately NOT
 * applied here — the roster and its workload read the same for everyone, which
 * is the point of the screen. The one privileged act, opening someone else's
 * queue, is gated by role and audited in the module's server action.
 *
 * Attribution: a file counts toward someone's workload when they are its loan
 * officer, its processor, or its coordinator — the people actually carrying it.
 * That is a different question from "whose book is it" (Pipeline's `loUserId`
 * scope), and asking it this way keeps a processor's real load visible instead
 * of reporting them as idle.
 */
import "server-only";
import { and, asc, desc, eq, inArray, isNotNull, isNull, or, sql, type SQLWrapper } from "drizzle-orm";
import type { Db } from "@/db";
import { user, team, task, loan, lead, event, person } from "@/db/schema";
import type { CurrentUser } from "@/lib/auth";
import type { Stage } from "@/lib/stages";

/**
 * The event kinds this module can say out loud, and the words it uses.
 *
 * The activity feed filters on these keys and renders these values, so a raw
 * kind like `loan.stage_advanced` can never reach a loan officer's screen: an
 * event we have no sentence for is simply not shown.
 */
export const ACTIVITY_LABELS: Record<string, string> = {
  "touch.logged": "Logged a touch",
  "loan.stage_advanced": "Moved a file forward",
  "lead.captured": "Captured a lead",
};

/**
 * Active, undeleted, and carried by this person in any of the three seats —
 * the one definition of "on their plate", stated once.
 *
 * `who` is either a member id or the `user.id` column of an enclosing query,
 * which is what lets the roster's correlated subqueries and the single-member
 * reads below share this rule instead of restating it.
 */
function carriesFile(who: string | SQLWrapper) {
  return and(
    eq(loan.status, "active"),
    isNull(loan.deletedAt),
    or(
      eq(loan.loUserId, who),
      eq(loan.processorUserId, who),
      eq(loan.coordinatorUserId, who),
    ),
  );
}

/** Open, undeleted, and owned by this person. */
function ownsOpenTask(who: string | SQLWrapper) {
  return and(
    eq(task.ownerUserId, who),
    eq(task.status, "open"),
    isNull(task.deletedAt),
  );
}

/** A lead they were assigned and actually answered. */
function answeredLead(who: string | SQLWrapper) {
  return and(eq(lead.assignedUserId, who), isNotNull(lead.firstResponseAt));
}

/**
 * Workload subqueries, correlated to the `user` row of whatever query spreads
 * them in. Both the roster and the single-member read select from `user`, so
 * they share these definitions verbatim and cannot drift apart.
 *
 * Every predicate is built with drizzle (`eq`, `and`) and then interpolated as
 * a nested fragment. That is load-bearing, not style. Drizzle emits fully
 * qualified names ("user"."id") for a nested fragment, but a column written
 * inline in a select-field template comes out bare ("id") — and inside
 * `SELECT ... FROM task` a bare "id" binds to task.id, not user.id. The
 * subquery then reads `task.owner_user_id = task.id`, matches nothing, and
 * reports every teammate as having zero work. Wrong, and quietly so.
 */
function workloadColumns() {
  const carrying = carriesFile(user.id);
  const openTask = ownsOpenTask(user.id);
  const overdueTask = and(openTask, sql`${task.dueAt} < now()`);
  const answered = answeredLead(user.id);

  return {
    openTasks: sql<number>`(
      SELECT count(*)::int FROM ${task} WHERE ${openTask}
    )`,
    overdueTasks: sql<number>`(
      SELECT count(*)::int FROM ${task} WHERE ${overdueTask}
    )`,
    activeFiles: sql<number>`(
      SELECT count(*)::int FROM ${loan} WHERE ${carrying}
    )`,
    activeVolume: sql<number>`(
      SELECT COALESCE(sum(${loan.amount}), 0)::float FROM ${loan} WHERE ${carrying}
    )`,
    /** How many answered leads the median rests on — a median of one is not a trend. */
    leadsAnswered: sql<number>`(
      SELECT count(*)::int FROM ${lead} WHERE ${answered}
    )`,
    /** NULL when they own no answered leads — the caller must say "—", not "0". */
    medianResponseSeconds: sql<number | null>`(
      SELECT percentile_cont(0.5) WITHIN GROUP (
               ORDER BY EXTRACT(
                 EPOCH FROM (${lead.firstResponseAt} - ${lead.capturedAt})
               )::float8
             )
        FROM ${lead}
       WHERE ${answered}
    )`,
  };
}

export type TeamIdentity = {
  id: string;
  name: string;
  branch: string | null;
  leaderName: string | null;
  leaderRole: string | null;
};

/** The signed-in user's team and its leader. Null when they're on no team. */
export async function getMyTeam(
  db: Db,
  currentUser: CurrentUser,
): Promise<TeamIdentity | null> {
  const [me] = await db
    .select({ teamId: user.teamId })
    .from(user)
    .where(eq(user.id, currentUser.userId))
    .limit(1);

  if (!me?.teamId) return null;

  const [row] = await db
    .select({
      id: team.id,
      name: team.name,
      branch: team.branch,
      leaderName: user.fullName,
      leaderRole: user.role,
    })
    .from(team)
    .leftJoin(user, eq(user.id, team.leaderUserId))
    .where(eq(team.id, me.teamId))
    .limit(1);

  return row ?? null;
}

export type TeamMemberRow = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  nmlsId: string | null;
  language: string;
  lastLoginAt: Date | null;
  openTasks: number;
  overdueTasks: number;
  activeFiles: number;
  activeVolume: number;
  leadsAnswered: number;
  medianResponseSeconds: number | null;
};

/**
 * Every active member with their workload. `teamId` scopes to one team; pass
 * null for a user who belongs to no team, who then sees everyone in the tenant
 * rather than an empty screen.
 */
export async function listTeamMembers(
  db: Db,
  teamId: string | null,
): Promise<TeamMemberRow[]> {
  const conditions = [
    isNull(user.deletedAt),
    eq(user.status, "active"),
    teamId ? eq(user.teamId, teamId) : undefined,
  ].filter(Boolean);

  const rows = await db
    .select({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      nmlsId: user.nmlsId,
      language: user.language,
      lastLoginAt: user.lastLoginAt,
      ...workloadColumns(),
    })
    .from(user)
    .where(and(...conditions))
    .orderBy(asc(user.fullName));

  return rows as TeamMemberRow[];
}

export type TeamTotals = {
  /** Distinct files, so a file with an LO and a processor is counted once. */
  activeFiles: number;
  activeVolume: number;
  openTasks: number;
  overdueTasks: number;
};

/**
 * The team's real totals — the denominator every workload bar is measured
 * against. Counted over distinct loans rather than summed from the member rows,
 * because a shared file would otherwise be counted once per person on it.
 */
export async function teamTotals(db: Db, memberIds: string[]): Promise<TeamTotals> {
  if (memberIds.length === 0) {
    return { activeFiles: 0, activeVolume: 0, openTasks: 0, overdueTasks: 0 };
  }

  const [files] = await db
    .select({
      activeFiles: sql<number>`count(*)::int`,
      activeVolume: sql<number>`COALESCE(sum(${loan.amount}), 0)::float`,
    })
    .from(loan)
    .where(
      and(
        eq(loan.status, "active"),
        isNull(loan.deletedAt),
        or(
          inArray(loan.loUserId, memberIds),
          inArray(loan.processorUserId, memberIds),
          inArray(loan.coordinatorUserId, memberIds),
        ),
      ),
    );

  const [tasks] = await db
    .select({
      openTasks: sql<number>`count(*)::int`,
      overdueTasks: sql<number>`count(*) FILTER (WHERE ${task.dueAt} < now())::int`,
    })
    .from(task)
    .where(
      and(
        eq(task.status, "open"),
        isNull(task.deletedAt),
        inArray(task.ownerUserId, memberIds),
      ),
    );

  return {
    activeFiles: files?.activeFiles ?? 0,
    activeVolume: files?.activeVolume ?? 0,
    openTasks: tasks?.openTasks ?? 0,
    overdueTasks: tasks?.overdueTasks ?? 0,
  };
}

export type TeamMember = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  nmlsId: string | null;
  language: string;
  status: string;
  lastLoginAt: Date | null;
  createdAt: Date;
  teamName: string | null;
  teamBranch: string | null;
  leadsTeam: boolean;
};

export async function getTeamMember(db: Db, memberId: string): Promise<TeamMember | null> {
  const [row] = await db
    .select({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      nmlsId: user.nmlsId,
      language: user.language,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      teamName: team.name,
      teamBranch: team.branch,
      leadsTeam: sql<boolean>`COALESCE(${team.leaderUserId} = ${user.id}, false)`,
    })
    .from(user)
    .leftJoin(team, eq(team.id, user.teamId))
    .where(and(eq(user.id, memberId), isNull(user.deletedAt)))
    .limit(1);

  return (row as TeamMember) ?? null;
}

/** One member's workload, using the same SQL the roster uses. */
export async function getMemberWorkload(
  db: Db,
  memberId: string,
): Promise<Pick<
  TeamMemberRow,
  "openTasks" | "overdueTasks" | "activeFiles" | "activeVolume" | "leadsAnswered" | "medianResponseSeconds"
> | null> {
  const [row] = await db
    .select(workloadColumns())
    .from(user)
    .where(eq(user.id, memberId))
    .limit(1);

  return row ?? null;
}

export type MemberTask = {
  id: string;
  title: string;
  dueAt: Date | null;
  priority: string;
  personId: string | null;
  personFirstName: string | null;
  personLastName: string | null;
};

export async function memberOpenTasks(db: Db, memberId: string): Promise<MemberTask[]> {
  const rows = await db
    .select({
      id: task.id,
      title: task.title,
      dueAt: task.dueAt,
      priority: task.priority,
      personId: task.personId,
      personFirstName: person.firstName,
      personLastName: person.lastName,
    })
    .from(task)
    .leftJoin(person, eq(person.id, task.personId))
    .where(
      and(
        eq(task.ownerUserId, memberId),
        eq(task.status, "open"),
        isNull(task.deletedAt),
      ),
    )
    // Soonest first; an undated task is not more urgent than a dated one.
    .orderBy(sql`${task.dueAt} ASC NULLS LAST`)
    .limit(15);

  return rows as MemberTask[];
}

export type MemberLoan = {
  id: string;
  stage: Stage;
  amount: string | null;
  preapprovalAmount: string | null;
  personId: string;
  personFirstName: string;
  personLastName: string;
  /** Which seat they hold on this file — why it's on their plate. */
  seat: "lo" | "processor" | "coordinator";
};

export async function memberActiveLoans(db: Db, memberId: string): Promise<MemberLoan[]> {
  const rows = await db
    .select({
      id: loan.id,
      stage: loan.stage,
      amount: loan.amount,
      preapprovalAmount: loan.preapprovalAmount,
      personId: person.id,
      personFirstName: person.firstName,
      personLastName: person.lastName,
      seat: sql<"lo" | "processor" | "coordinator">`CASE
        WHEN ${loan.loUserId} = ${memberId} THEN 'lo'
        WHEN ${loan.processorUserId} = ${memberId} THEN 'processor'
        ELSE 'coordinator'
      END`,
    })
    .from(loan)
    .innerJoin(person, eq(person.id, loan.personId))
    .where(carriesFile(memberId))
    .orderBy(desc(loan.lastActivityAt))
    .limit(25);

  return rows as MemberLoan[];
}

export type MemberActivity = {
  id: string;
  kind: string;
  createdAt: Date;
  personId: string | null;
  personFirstName: string | null;
  personLastName: string | null;
};

/** Recent activity, restricted to the kinds we have plain language for. */
export async function memberActivity(db: Db, memberId: string): Promise<MemberActivity[]> {
  const rows = await db
    .select({
      id: event.id,
      kind: event.kind,
      createdAt: event.createdAt,
      personId: event.personId,
      personFirstName: person.firstName,
      personLastName: person.lastName,
    })
    .from(event)
    .leftJoin(person, eq(person.id, event.personId))
    .where(
      and(
        eq(event.actorUserId, memberId),
        inArray(event.kind, Object.keys(ACTIVITY_LABELS)),
      ),
    )
    .orderBy(desc(event.createdAt))
    .limit(10);

  return rows as MemberActivity[];
}
