/**
 * Intelligence queries — the CRM's report on how the team actually works.
 *
 * Every number here is counted in SQL from rows the team entered themselves.
 * Nothing is modelled, forecast, or estimated. Nothing crosses the CRM boundary
 * (D-22): there is no revenue, no margin, no pricing, and no loan-of-record
 * data in this file. The questions are all relationship questions — how fast a
 * lead gets answered, whether follow-ups get done, which files have gone quiet.
 *
 * Where a metric has nothing behind it the query returns null rather than 0, so
 * the screen can say "no data yet" instead of implying a real zero.
 */
import "server-only";
import { and, desc, eq, inArray, isNull, ne, sql } from "drizzle-orm";
import type { Db } from "@/db";
import {
  campaign,
  lead,
  loan,
  loanStageHistory,
  partner,
  partnerRelationship,
  person,
  task,
  user,
} from "@/db/schema";
import { seesWholeBook } from "@/lib/roles";
import type { CurrentUser } from "@/lib/auth";
import {
  MACRO_PHASES,
  PHASE_LABELS,
  phaseOf,
  stagesIn,
  stallDays,
  type MacroPhase,
  type Stage,
} from "@/lib/stages";

// --- Scope -------------------------------------------------------------------
// RLS already fences the tenant. These add the role rule on top: a loan officer
// reads their own book, a leader reads the whole team's.

function ownBookOnly(u: CurrentUser): boolean {
  return !seesWholeBook(u.role);
}

const loanScope = (u: CurrentUser) => (ownBookOnly(u) ? eq(loan.loUserId, u.userId) : undefined);
const taskScope = (u: CurrentUser) => (ownBookOnly(u) ? eq(task.ownerUserId, u.userId) : undefined);
const leadScope = (u: CurrentUser) =>
  ownBookOnly(u) ? eq(lead.assignedUserId, u.userId) : undefined;
const partnerScope = (u: CurrentUser) =>
  ownBookOnly(u) ? eq(partner.ownerUserId, u.userId) : undefined;
const campaignScope = (u: CurrentUser) =>
  ownBookOnly(u) ? eq(campaign.ownerUserId, u.userId) : undefined;
const userScope = (u: CurrentUser) => (ownBookOnly(u) ? eq(user.id, u.userId) : undefined);

/** Files that are still work: the same definition the pipeline board uses. */
const openBook = () =>
  and(ne(loan.status, "lost"), ne(loan.status, "withdrawn"), ne(loan.status, "denied"));

// --- 1. Lead response --------------------------------------------------------

export type LeadResponseRead = {
  totalLeads: number;
  answeredCount: number;
  medianMinutes: number | null;
  avgMinutes: number | null;
  uncontactedCount: number;
  oldestUncontactedHours: number | null;
};

/**
 * The speed-to-lead scoreboard: capture → first human response.
 *
 * `percentile_cont` and `avg` both skip null inputs, so leads that have never
 * been answered drop out of the timing maths on their own and are counted
 * separately as the ones still waiting.
 */
export async function leadResponse(db: Db, u: CurrentUser): Promise<LeadResponseRead> {
  const [row] = await db
    .select({
      totalLeads: sql<number>`count(*)::int`,
      answeredCount: sql<number>`count(*) FILTER (WHERE ${lead.firstResponseAt} IS NOT NULL)::int`,
      medianMinutes: sql<number | null>`percentile_cont(0.5) WITHIN GROUP (
        ORDER BY EXTRACT(EPOCH FROM (${lead.firstResponseAt} - ${lead.capturedAt}))::float / 60
      )`,
      avgMinutes: sql<number | null>`avg(
        EXTRACT(EPOCH FROM (${lead.firstResponseAt} - ${lead.capturedAt}))::float / 60
      )`,
      uncontactedCount: sql<number>`count(*) FILTER (WHERE ${lead.firstResponseAt} IS NULL)::int`,
      oldestUncontactedHours: sql<number | null>`max(
        EXTRACT(EPOCH FROM (now() - ${lead.capturedAt}))::float / 3600
      ) FILTER (WHERE ${lead.firstResponseAt} IS NULL)`,
    })
    .from(lead)
    .where(leadScope(u));

  return (
    row ?? {
      totalLeads: 0,
      answeredCount: 0,
      medianMinutes: null,
      avgMinutes: null,
      uncontactedCount: 0,
      oldestUncontactedHours: null,
    }
  );
}

// --- 2. Follow-up completion -------------------------------------------------

export type FollowUpRead = {
  openCount: number;
  doneCount: number;
  overdueCount: number;
  completionRate: number | null;
};

/** Cancelled work was never owed, so it stays out of the completion rate. */
export async function followUpCompletion(db: Db, u: CurrentUser): Promise<FollowUpRead> {
  const [row] = await db
    .select({
      openCount: sql<number>`count(*) FILTER (WHERE ${task.status} = 'open')::int`,
      doneCount: sql<number>`count(*) FILTER (WHERE ${task.status} = 'done')::int`,
      overdueCount: sql<number>`count(*) FILTER (
        WHERE ${task.status} = 'open' AND ${task.dueAt} < now()
      )::int`,
      completionRate: sql<number | null>`CASE
        WHEN count(*) FILTER (WHERE ${task.status} IN ('open', 'done')) = 0 THEN NULL
        ELSE count(*) FILTER (WHERE ${task.status} = 'done')::float
             / count(*) FILTER (WHERE ${task.status} IN ('open', 'done'))::float
      END`,
    })
    .from(task)
    .where(and(isNull(task.deletedAt), taskScope(u)));

  return row ?? { openCount: 0, doneCount: 0, overdueCount: 0, completionRate: null };
}

// --- 3. Pipeline movement ----------------------------------------------------

export type PhaseCount = { phase: MacroPhase; count: number };

export type MovementRead = {
  advances30d: number;
  byPhase: PhaseCount[];
  openTotal: number;
};

export async function pipelineMovement(db: Db, u: CurrentUser): Promise<MovementRead> {
  const [advances] = await db
    .select({
      // A file arriving at stage 1 is a file being created, not a file moving
      // forward. Only a transition that has a previous stage is an advance.
      advances30d: sql<number>`count(*) FILTER (
        WHERE ${loanStageHistory.fromStage} IS NOT NULL
          AND ${loanStageHistory.createdAt} >= now() - interval '30 days'
      )::int`,
    })
    .from(loanStageHistory)
    .innerJoin(loan, eq(loan.id, loanStageHistory.loanId))
    .where(and(isNull(loan.deletedAt), loanScope(u)));

  const stageRows = await db
    .select({ stage: loan.stage, count: sql<number>`count(*)::int` })
    .from(loan)
    .where(and(isNull(loan.deletedAt), openBook(), loanScope(u)))
    .groupBy(loan.stage);

  // Macro-phase is derived, never a column — roll the stage counts up in TS
  // through the one lookup that owns the mapping.
  const totals = new Map<MacroPhase, number>(MACRO_PHASES.map((p) => [p, 0]));
  for (const row of stageRows) {
    const phase = phaseOf(row.stage as Stage);
    totals.set(phase, (totals.get(phase) ?? 0) + row.count);
  }

  const byPhase = MACRO_PHASES.map((phase) => ({ phase, count: totals.get(phase) ?? 0 }));

  return {
    advances30d: advances?.advances30d ?? 0,
    byPhase,
    openTotal: byPhase.reduce((sum, p) => sum + p.count, 0),
  };
}

// --- 4. Conversion -----------------------------------------------------------

export type ConversionRead = {
  totalCreated: number;
  fundedCount: number;
  lostCount: number;
  activeCount: number;
  otherCount: number;
  funnel: { label: string; count: number }[];
};

export async function conversion(db: Db, u: CurrentUser): Promise<ConversionRead> {
  const [outcomes] = await db
    .select({
      totalCreated: sql<number>`count(*)::int`,
      fundedCount: sql<number>`count(*) FILTER (WHERE ${loan.status} = 'funded')::int`,
      lostCount: sql<number>`count(*) FILTER (WHERE ${loan.status} = 'lost')::int`,
      activeCount: sql<number>`count(*) FILTER (WHERE ${loan.status} = 'active')::int`,
      // withdrawn / denied / on hold — small, but never silently dropped.
      otherCount: sql<number>`count(*) FILTER (
        WHERE ${loan.status} NOT IN ('funded', 'lost', 'active')
      )::int`,
    })
    .from(loan)
    .where(and(isNull(loan.deletedAt), loanScope(u)));

  // The funnel reads stage history, not the current stage: a file that funded
  // still counts as having reached Qualify on its way through. The phase → stage
  // lists come from @/lib/stages so there is one definition of a phase.
  const [reached] = await db
    .select({
      engage: sql<number>`count(DISTINCT ${loanStageHistory.loanId}) FILTER (
        WHERE ${inArray(loanStageHistory.toStage, stagesIn("ENGAGE"))}
      )::int`,
      qualify: sql<number>`count(DISTINCT ${loanStageHistory.loanId}) FILTER (
        WHERE ${inArray(loanStageHistory.toStage, stagesIn("QUALIFY"))}
      )::int`,
      transact: sql<number>`count(DISTINCT ${loanStageHistory.loanId}) FILTER (
        WHERE ${inArray(loanStageHistory.toStage, stagesIn("TRANSACT"))}
      )::int`,
      funded: sql<number>`count(DISTINCT ${loanStageHistory.loanId}) FILTER (
        WHERE ${eq(loanStageHistory.toStage, "funded")}
      )::int`,
    })
    .from(loanStageHistory)
    .innerJoin(loan, eq(loan.id, loanStageHistory.loanId))
    .where(and(isNull(loan.deletedAt), loanScope(u)));

  return {
    totalCreated: outcomes?.totalCreated ?? 0,
    fundedCount: outcomes?.fundedCount ?? 0,
    lostCount: outcomes?.lostCount ?? 0,
    activeCount: outcomes?.activeCount ?? 0,
    otherCount: outcomes?.otherCount ?? 0,
    funnel: [
      { label: PHASE_LABELS.ENGAGE, count: reached?.engage ?? 0 },
      { label: PHASE_LABELS.QUALIFY, count: reached?.qualify ?? 0 },
      { label: PHASE_LABELS.TRANSACT, count: reached?.transact ?? 0 },
      { label: "Funded", count: reached?.funded ?? 0 },
    ],
  };
}

// --- 5. Partner activity -----------------------------------------------------

export type PartnerRow = {
  partnerId: string;
  name: string;
  company: string | null;
  referralCount: number;
  referredVolume: number;
  lastTouchAt: Date | null;
};

export type PartnerRead = {
  top: PartnerRow[];
  totalPartners: number;
  quietCount: number;
};

export async function partnerActivity(db: Db, u: CurrentUser): Promise<PartnerRead> {
  const top = await db
    .select({
      partnerId: partner.id,
      name: sql<string>`${partner.firstName} || ' ' || ${partner.lastName}`,
      company: partner.company,
      referralCount: sql<number>`count(DISTINCT ${partnerRelationship.id})::int`,
      referredVolume: sql<number>`COALESCE(sum(${loan.amount}), 0)::float`,
      lastTouchAt: partner.lastTouchAt,
    })
    .from(partner)
    .leftJoin(
      partnerRelationship,
      and(
        eq(partnerRelationship.partnerId, partner.id),
        eq(partnerRelationship.role, "referred"),
      ),
    )
    // Volume is what the referred files are worth; a referral with no amount
    // recorded yet still counts as a referral and adds nothing to the sum.
    .leftJoin(loan, and(eq(loan.id, partnerRelationship.loanId), isNull(loan.deletedAt)))
    .where(and(isNull(partner.deletedAt), partnerScope(u)))
    .groupBy(partner.id, partner.firstName, partner.lastName, partner.company, partner.lastTouchAt)
    .having(sql`count(${partnerRelationship.id}) > 0`)
    .orderBy(
      desc(sql`count(DISTINCT ${partnerRelationship.id})`),
      desc(sql`COALESCE(sum(${loan.amount}), 0)`),
    )
    .limit(5);

  const [totals] = await db
    .select({
      totalPartners: sql<number>`count(*)::int`,
      // A partner who asked not to be contacted is not a partner you are
      // neglecting, so they are not counted as quiet.
      quietCount: sql<number>`count(*) FILTER (
        WHERE ${partner.doNotContact} = false
          AND (${partner.lastTouchAt} IS NULL OR ${partner.lastTouchAt} < now() - interval '60 days')
      )::int`,
    })
    .from(partner)
    .where(and(isNull(partner.deletedAt), partnerScope(u)));

  return {
    top,
    totalPartners: totals?.totalPartners ?? 0,
    quietCount: totals?.quietCount ?? 0,
  };
}

// --- 6. Campaign activity ----------------------------------------------------

export type CampaignRead = {
  campaignCount: number;
  sent: number;
  opened: number;
  replied: number;
  openRate: number | null;
};

/** Drafts and scheduled sends have not done anything yet, so they are excluded. */
export async function campaignActivity(db: Db, u: CurrentUser): Promise<CampaignRead> {
  const [row] = await db
    .select({
      campaignCount: sql<number>`count(*)::int`,
      sent: sql<number>`COALESCE(sum(${campaign.sentCount}), 0)::int`,
      opened: sql<number>`COALESCE(sum(${campaign.openCount}), 0)::int`,
      replied: sql<number>`COALESCE(sum(${campaign.replyCount}), 0)::int`,
      openRate: sql<number | null>`CASE
        WHEN COALESCE(sum(${campaign.sentCount}), 0) = 0 THEN NULL
        ELSE sum(${campaign.openCount})::float / sum(${campaign.sentCount})::float
      END`,
    })
    .from(campaign)
    .where(
      and(
        isNull(campaign.deletedAt),
        inArray(campaign.status, ["finished", "running"]),
        campaignScope(u),
      ),
    );

  return row ?? { campaignCount: 0, sent: 0, opened: 0, replied: 0, openRate: null };
}

// --- 7. Stale opportunities --------------------------------------------------

export type StaleRow = {
  loanId: string;
  personName: string;
  stage: Stage;
  phase: MacroPhase;
  amount: string | null;
  idleDays: number;
  thresholdDays: number;
};

export type StaleRead = { rows: StaleRow[]; totalStale: number };

/** The shortest stall threshold on the board — the safe SQL pre-filter. */
const MIN_STALL_DAYS = Math.min(...MACRO_PHASES.map(stallDays));

/**
 * Active files nobody has touched inside the limit for their stage.
 *
 * The limit is per macro-phase and that rule already lives in @/lib/stages, so
 * SQL pre-filters on the shortest limit — a safe superset — and the exact
 * per-phase rule is applied here. One definition of "gone quiet", not two.
 */
export async function staleOpportunities(db: Db, u: CurrentUser): Promise<StaleRead> {
  const candidates = await db
    .select({
      loanId: loan.id,
      personName: sql<string>`${person.firstName} || ' ' || ${person.lastName}`,
      stage: loan.stage,
      amount: loan.amount,
      idleDays: sql<number>`EXTRACT(EPOCH FROM (now() - ${loan.lastActivityAt}))::float / 86400`,
    })
    .from(loan)
    .innerJoin(person, eq(person.id, loan.personId))
    .where(
      and(
        isNull(loan.deletedAt),
        eq(loan.status, "active"),
        sql`${loan.lastActivityAt} < now() - make_interval(days => ${MIN_STALL_DAYS})`,
        loanScope(u),
      ),
    )
    .orderBy(loan.lastActivityAt)
    .limit(100);

  const stale = candidates
    .map((row) => {
      const stage = row.stage as Stage;
      const phase = phaseOf(stage);
      return { ...row, stage, phase, thresholdDays: stallDays(phase) };
    })
    .filter((row) => row.idleDays >= row.thresholdDays);

  return { rows: stale.slice(0, 5), totalStale: stale.length };
}

// --- 8. Team workload --------------------------------------------------------

export type WorkloadRow = {
  userId: string;
  fullName: string;
  role: string;
  openTasks: number;
  activeOpportunities: number;
};

export async function teamWorkload(db: Db, u: CurrentUser): Promise<WorkloadRow[]> {
  const people = await db
    .select({ userId: user.id, fullName: user.fullName, role: user.role })
    .from(user)
    .where(and(isNull(user.deletedAt), eq(user.status, "active"), userScope(u)));

  const taskRows = await db
    .select({ userId: task.ownerUserId, count: sql<number>`count(*)::int` })
    .from(task)
    .where(and(isNull(task.deletedAt), eq(task.status, "open"), taskScope(u)))
    .groupBy(task.ownerUserId);

  const loanRows = await db
    .select({ userId: loan.loUserId, count: sql<number>`count(*)::int` })
    .from(loan)
    .where(and(isNull(loan.deletedAt), eq(loan.status, "active"), loanScope(u)))
    .groupBy(loan.loUserId);

  const tasksBy = new Map(taskRows.map((r) => [r.userId, r.count]));
  const loansBy = new Map(loanRows.map((r) => [r.userId, r.count]));

  // Everyone active is listed, including the people carrying nothing — an empty
  // row is the whole point of a workload view.
  return people
    .map((p) => ({
      ...p,
      openTasks: tasksBy.get(p.userId) ?? 0,
      activeOpportunities: loansBy.get(p.userId) ?? 0,
    }))
    .sort(
      (a, b) =>
        b.openTasks + b.activeOpportunities - (a.openTasks + a.activeOpportunities) ||
        a.fullName.localeCompare(b.fullName),
    );
}

// --- The whole report --------------------------------------------------------

export type IntelligenceReport = {
  /** Which book these numbers cover — drives the subtitle, and it must be said. */
  scope: "own" | "team";
  leads: LeadResponseRead;
  followUp: FollowUpRead;
  movement: MovementRead;
  conversion: ConversionRead;
  partners: PartnerRead;
  campaigns: CampaignRead;
  stale: StaleRead;
  workload: WorkloadRow[];
};

export async function intelligenceReport(
  db: Db,
  u: CurrentUser,
): Promise<IntelligenceReport> {
  return {
    scope: ownBookOnly(u) ? "own" : "team",
    leads: await leadResponse(db, u),
    followUp: await followUpCompletion(db, u),
    movement: await pipelineMovement(db, u),
    conversion: await conversion(db, u),
    partners: await partnerActivity(db, u),
    campaigns: await campaignActivity(db, u),
    stale: await staleOpportunities(db, u),
    workload: await teamWorkload(db, u),
  };
}

/** True when there is genuinely nothing to report — not merely a quiet week. */
export function hasNothingToReport(report: IntelligenceReport): boolean {
  return (
    report.conversion.totalCreated === 0 &&
    report.leads.totalLeads === 0 &&
    report.followUp.openCount + report.followUp.doneCount === 0 &&
    report.partners.totalPartners === 0 &&
    report.campaigns.campaignCount === 0
  );
}
