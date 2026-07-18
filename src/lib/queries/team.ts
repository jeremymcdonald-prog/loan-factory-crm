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
import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  isNotNull,
  isNull,
  notInArray,
  or,
  sql,
  type SQL,
  type SQLWrapper,
} from "drizzle-orm";
import type { Db } from "@/db";
import {
  user,
  team,
  task,
  loan,
  lead,
  event,
  person,
  aiInsight,
  loanStageHistory,
  partnerRelationship,
  campaign,
  message,
} from "@/db/schema";
import type { CurrentUser } from "@/lib/auth";
import { STAGES, type Stage } from "@/lib/stages";

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
  const pendingApproval = and(
    eq(aiInsight.forUserId, user.id),
    eq(aiInsight.status, "pending"),
  );

  return {
    /** AI drafts waiting on this person — the leader's review-queue lens. */
    pendingApprovals: sql<number>`(
      SELECT count(*)::int FROM ${aiInsight} WHERE ${pendingApproval}
    )`,
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
  pendingApprovals: number;
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
  "pendingApprovals" | "openTasks" | "overdueTasks" | "activeFiles" | "activeVolume" | "leadsAnswered" | "medianResponseSeconds"
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

// ---------------------------------------------------------------------------
// Leaderboard — production over a period, ranked
// ---------------------------------------------------------------------------

/**
 * The four windows the leaderboard can be read over. Keys are the URL
 * vocabulary (`?period=`), labels are what the tabs say.
 */
export const LEADERBOARD_PERIODS = [
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "quarter", label: "90 days" },
  { key: "ytd", label: "Year to date" },
] as const;

export type LeaderboardPeriod = (typeof LEADERBOARD_PERIODS)[number]["key"];

export function isLeaderboardPeriod(value: string): value is LeaderboardPeriod {
  return LEADERBOARD_PERIODS.some((p) => p.key === value);
}

/**
 * Where the window opens, as a SQL fragment evaluated by the database — the
 * same clock every count is measured against. The period vocabulary is closed
 * (see the type), so each branch is a static template, never user input.
 */
function periodStart(period: LeaderboardPeriod): SQL {
  switch (period) {
    case "week":
      return sql`now() - interval '7 days'`;
    case "month":
      return sql`now() - interval '30 days'`;
    case "quarter":
      return sql`now() - interval '90 days'`;
    case "ytd":
      return sql`date_trunc('year', now())`;
  }
}

/**
 * The stages that mean "this file is an application in flight" — from
 * `prequalification` (where a lead becomes an applicant, per src/lib/stages.ts)
 * through the last active loan stage, stopping before `funded`. An "application
 * taken" is a stage-history entry that CROSSES INTO this set from outside it,
 * so a file marching from processing to underwriting is not counted twice.
 */
export const APPLICATION_STAGES: Stage[] = STAGES.slice(
  STAGES.indexOf("prequalification"),
  STAGES.indexOf("funded"),
);

/**
 * Leaderboard aggregates, correlated to the `user` row of the enclosing query.
 *
 * Same load-bearing pattern as `workloadColumns()` above (the canonical
 * `pendingApprovals` example): every predicate is built with drizzle operators
 * against the table objects and then interpolated as a nested fragment, so the
 * generated SQL carries fully qualified names. A bare column here would bind to
 * the subquery's own table and silently zero the board.
 */
function leaderboardColumns(start: SQL) {
  const applicationStages = [...APPLICATION_STAGES];

  /** Crossed into the application stages during the window. */
  const enteredApplication = and(
    inArray(loanStageHistory.toStage, applicationStages),
    or(
      isNull(loanStageHistory.fromStage),
      notInArray(loanStageHistory.fromStage, applicationStages),
    ),
    sql`${loanStageHistory.createdAt} >= ${start}`,
  );

  /** Reached preapproval during the window. */
  const enteredPreapproval = and(
    eq(loanStageHistory.toStage, "preapproval"),
    sql`${loanStageHistory.createdAt} >= ${start}`,
  );

  /** Their active book as originator — the LO seat only, not processor seats. */
  const activeBook = and(
    eq(loan.loUserId, user.id),
    eq(loan.status, "active"),
    isNull(loan.deletedAt),
  );

  /** Funded during the window, on their book. */
  const fundedInPeriod = and(
    eq(loan.loUserId, user.id),
    isNull(loan.deletedAt),
    isNotNull(loan.fundedAt),
    sql`${loan.fundedAt} >= ${start}`,
  );

  /** Leads assigned to them that arrived during the window. */
  const leadInPeriod = and(
    eq(lead.assignedUserId, user.id),
    sql`${lead.capturedAt} >= ${start}`,
  );

  /** Campaigns they own, created during the window. */
  const campaignInPeriod = and(
    eq(campaign.ownerUserId, user.id),
    isNull(campaign.deletedAt),
    sql`${campaign.createdAt} >= ${start}`,
  );

  /** Video/message drafts they authored during the window, not yet sent. */
  const draftInPeriod = and(
    eq(message.authorUserId, user.id),
    inArray(message.status, ["draft", "awaiting_approval"]),
    sql`${message.createdAt} >= ${start}`,
  );

  return {
    /** Distinct files that crossed into the application stages. */
    applications: sql<number>`(
      SELECT count(DISTINCT ${loanStageHistory.loanId})::int
        FROM ${loanStageHistory}
        JOIN ${loan} ON ${eq(loan.id, loanStageHistory.loanId)}
       WHERE ${and(eq(loan.loUserId, user.id), enteredApplication)}
    )`,
    /** Distinct files that reached preapproval. */
    preapprovals: sql<number>`(
      SELECT count(DISTINCT ${loanStageHistory.loanId})::int
        FROM ${loanStageHistory}
        JOIN ${loan} ON ${eq(loan.id, loanStageHistory.loanId)}
       WHERE ${and(eq(loan.loUserId, user.id), enteredPreapproval)}
    )`,
    activeLoans: sql<number>`(
      SELECT count(*)::int FROM ${loan} WHERE ${activeBook}
    )`,
    closings: sql<number>`(
      SELECT count(*)::int FROM ${loan} WHERE ${fundedInPeriod}
    )`,
    fundedVolume: sql<number>`(
      SELECT COALESCE(sum(${loan.amount}), 0)::float FROM ${loan} WHERE ${fundedInPeriod}
    )`,
    /** The conversion denominator — the page divides closings by this. */
    leadsCaptured: sql<number>`(
      SELECT count(*)::int FROM ${lead} WHERE ${leadInPeriod}
    )`,
    /**
     * Partner referrals received: relationship rows created in the window,
     * attributed through the referred file's LO — or, for a referral that
     * arrived as a person with no file attached, the person's owner.
     */
    referrals: sql<number>`(
      SELECT count(*)::int
        FROM ${partnerRelationship}
        LEFT JOIN ${loan} ON ${eq(loan.id, partnerRelationship.loanId)}
        LEFT JOIN ${person} ON ${eq(person.id, partnerRelationship.personId)}
       WHERE ${and(
         sql`${partnerRelationship.createdAt} >= ${start}`,
         or(
           eq(loan.loUserId, user.id),
           and(isNull(partnerRelationship.loanId), eq(person.ownerUserId, user.id)),
         ),
       )}
    )`,
    campaignsOwned: sql<number>`(
      SELECT count(*)::int FROM ${campaign} WHERE ${campaignInPeriod}
    )`,
    draftsCreated: sql<number>`(
      SELECT count(*)::int FROM ${message} WHERE ${draftInPeriod}
    )`,
  };
}

export type LeaderboardRow = {
  id: string;
  fullName: string;
  email: string;
  nmlsId: string | null;
  applications: number;
  preapprovals: number;
  activeLoans: number;
  closings: number;
  fundedVolume: number;
  leadsCaptured: number;
  referrals: number;
  campaignsOwned: number;
  draftsCreated: number;
};

/**
 * Every active loan officer in the tenant with their production over the
 * period. Ranking and sort order are presentation — the page decides them —
 * so rows come back in a stable name order.
 */
export async function leaderboard(
  db: Db,
  period: LeaderboardPeriod,
): Promise<LeaderboardRow[]> {
  const start = periodStart(period);

  const rows = await db
    .select({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      nmlsId: user.nmlsId,
      ...leaderboardColumns(start),
    })
    .from(user)
    .where(and(isNull(user.deletedAt), eq(user.status, "active"), eq(user.role, "lo")))
    .orderBy(asc(user.fullName));

  return rows as LeaderboardRow[];
}

// ---------------------------------------------------------------------------
// Team membership — the reads behind add / remove / join
// ---------------------------------------------------------------------------

export type LoanOfficerMatch = {
  id: string;
  fullName: string;
  email: string;
  nmlsId: string | null;
  teamId: string | null;
  teamName: string | null;
};

/**
 * Tenant-wide loan-officer search for a leader building their team. RLS keeps
 * it inside the tenant; deliberately NOT team-scoped, because the point is
 * finding people who aren't on your team yet.
 */
export async function searchLoanOfficers(db: Db, query: string): Promise<LoanOfficerMatch[]> {
  const needle = `%${query}%`;

  const rows = await db
    .select({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      nmlsId: user.nmlsId,
      teamId: user.teamId,
      teamName: team.name,
    })
    .from(user)
    .leftJoin(team, eq(team.id, user.teamId))
    .where(
      and(
        isNull(user.deletedAt),
        eq(user.status, "active"),
        eq(user.role, "lo"),
        or(ilike(user.fullName, needle), ilike(user.email, needle)),
      ),
    )
    .orderBy(asc(user.fullName))
    .limit(20);

  return rows as LoanOfficerMatch[];
}

export type TeamOption = {
  id: string;
  name: string;
  branch: string | null;
  leaderName: string | null;
  memberCount: number;
};

/**
 * Every team in the tenant, for the "Join a team" picker. Member counts are
 * correlated the same way the workload columns are — the inner `user` binds the
 * subquery, the outer `team` the correlation.
 */
export async function listTeams(db: Db): Promise<TeamOption[]> {
  const onThisTeam = and(
    eq(user.teamId, team.id),
    isNull(user.deletedAt),
    eq(user.status, "active"),
  );

  const rows = await db
    .select({
      id: team.id,
      name: team.name,
      branch: team.branch,
      leaderName: user.fullName,
      memberCount: sql<number>`(
        SELECT count(*)::int FROM ${user} WHERE ${onThisTeam}
      )`,
    })
    .from(team)
    .leftJoin(user, eq(user.id, team.leaderUserId))
    .orderBy(asc(team.name));

  return rows as TeamOption[];
}
