/**
 * Intelligence queries — production reporting for a loan officer or a team.
 *
 * Every number is counted in SQL from rows the team entered themselves.
 * Nothing is modelled, forecast, or estimated, and nothing crosses the CRM
 * boundary (D-22): no revenue, no margin, no pricing. Volume is the sum of
 * amounts the team typed on their own opportunities — a relationship fact.
 *
 * Two dimensions run through every read:
 *  - scope: "own" (one loan officer's book) or "team" (the whole tenant's).
 *    A leader (seesWholeBook) can toggle; everyone else is fenced to "own".
 *  - range: [from, to) — inclusive start, exclusive end, resolved by the page.
 *
 * Where a metric has nothing behind it the query returns null rather than 0,
 * so the screen can say "no data yet" instead of implying a real zero.
 */
import "server-only";
import {
  and,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  sql,
  type AnyColumn,
  type SQL,
} from "drizzle-orm";
import type { Db } from "@/db";
import {
  campaign,
  event,
  lead,
  loan,
  loanStageHistory,
  partner,
  partnerRelationship,
  person,
} from "@/db/schema";
import { seesWholeBook } from "@/lib/roles";
import type { CurrentUser } from "@/lib/auth";
import { stagesIn } from "@/lib/stages";

// --- Scope & range -----------------------------------------------------------

export type ReportScope = "own" | "team";

export type DateRange = { from: Date; to: Date };

/**
 * The scope this user is allowed to run the report at. A leader may ask for
 * either; a loan officer always gets their own book no matter what the URL says.
 */
export function resolveScope(u: CurrentUser, requested: string | undefined): ReportScope {
  if (!seesWholeBook(u.role)) return "own";
  return requested === "me" ? "own" : "team";
}

// RLS already fences the tenant. These add the role rule on top: "own" reads
// one person's book, "team" reads everything the tenant holds.
const loanScope = (u: CurrentUser, s: ReportScope) =>
  s === "own" ? eq(loan.loUserId, u.userId) : undefined;
const leadScope = (u: CurrentUser, s: ReportScope) =>
  s === "own" ? eq(lead.assignedUserId, u.userId) : undefined;
const partnerScope = (u: CurrentUser, s: ReportScope) =>
  s === "own" ? eq(partner.ownerUserId, u.userId) : undefined;
const campaignScope = (u: CurrentUser, s: ReportScope) =>
  s === "own" ? eq(campaign.ownerUserId, u.userId) : undefined;
const personScope = (u: CurrentUser, s: ReportScope) =>
  s === "own" ? eq(person.ownerUserId, u.userId) : undefined;

/** `col >= from AND col < to` for a timestamptz column. */
const inRange = (col: AnyColumn, r: DateRange): SQL =>
  sql`(${col} >= ${r.from} AND ${col} < ${r.to})`;

/** Same fence for a `date` column, which Postgres compares as a calendar day. */
const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const dateInRange = (col: AnyColumn, r: DateRange): SQL =>
  sql`(${col} >= ${isoDay(r.from)} AND ${col} < ${isoDay(r.to)})`;

// --- 1–5. Production counts --------------------------------------------------

/**
 * The stage-history milestones this report counts. Reaching `prequalification`
 * is the moment a lead becomes an applicant (stages.ts); `preapproval` is the
 * letter in the borrower's hand. The two are separate steps, so a file that
 * reaches preapproval is counted under preapprovals, not a second application.
 */
const APPLICATION_STAGES = ["prequalification"] as const;
const PREAPPROVAL_STAGES = ["preapproval"] as const;

export type ProductionRead = {
  /** New leads captured in range. */
  leads: number;
  /** Distinct files that entered an application stage in range (stage history). */
  applications: number;
  /** Distinct files that entered the preapproval stage in range (stage history). */
  preapprovals: number;
  /** Active files right now — a point-in-time count, not a range count. */
  activeLoans: number;
  /** Files funded in range, by the team-entered funded date. */
  closings: number;
  /** Team-entered amounts on those funded files. */
  closedVolume: number;
};

export async function production(
  db: Db,
  u: CurrentUser,
  s: ReportScope,
  r: DateRange,
): Promise<ProductionRead> {
  const [leadsRow] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(lead)
    .where(and(inRange(lead.capturedAt, r), leadScope(u, s)));

  const [historyRow] = await db
    .select({
      applications: sql<number>`count(DISTINCT ${loanStageHistory.loanId}) FILTER (
        WHERE ${inArray(loanStageHistory.toStage, [...APPLICATION_STAGES])}
      )::int`,
      preapprovals: sql<number>`count(DISTINCT ${loanStageHistory.loanId}) FILTER (
        WHERE ${inArray(loanStageHistory.toStage, [...PREAPPROVAL_STAGES])}
      )::int`,
    })
    .from(loanStageHistory)
    .innerJoin(loan, eq(loan.id, loanStageHistory.loanId))
    .where(
      and(
        isNull(loan.deletedAt),
        inRange(loanStageHistory.createdAt, r),
        inArray(loanStageHistory.toStage, [...APPLICATION_STAGES, ...PREAPPROVAL_STAGES]),
        loanScope(u, s),
      ),
    );

  const [loanRow] = await db
    .select({
      activeLoans: sql<number>`count(*) FILTER (WHERE ${loan.status} = 'active')::int`,
      closings: sql<number>`count(*) FILTER (WHERE ${dateInRange(loan.fundedAt, r)})::int`,
      closedVolume: sql<number>`COALESCE(
        sum(${loan.amount}) FILTER (WHERE ${dateInRange(loan.fundedAt, r)}), 0
      )::float`,
    })
    .from(loan)
    .where(and(isNull(loan.deletedAt), loanScope(u, s)));

  return {
    leads: leadsRow?.n ?? 0,
    applications: historyRow?.applications ?? 0,
    preapprovals: historyRow?.preapprovals ?? 0,
    activeLoans: loanRow?.activeLoans ?? 0,
    closings: loanRow?.closings ?? 0,
    closedVolume: loanRow?.closedVolume ?? 0,
  };
}

// --- 6. Conversion rates -----------------------------------------------------

export type ConversionRead = {
  /** Applications in range ÷ leads in range. Null when there were no leads. */
  leadToApplication: number | null;
  /** Closings in range ÷ applications in range. Null when there were none. */
  applicationToClosing: number | null;
  /** Closings in range ÷ leads in range. Null when there were no leads. */
  leadToClosing: number | null;
};

/**
 * These compare activity volumes inside one window — the leads counted are not
 * necessarily the same files as the closings counted, because a mortgage takes
 * longer than most ranges. The screen says so; the maths just guards zero.
 */
export function conversionRates(p: ProductionRead): ConversionRead {
  const ratio = (num: number, den: number) => (den > 0 ? num / den : null);
  return {
    leadToApplication: ratio(p.applications, p.leads),
    applicationToClosing: ratio(p.closings, p.applications),
    leadToClosing: ratio(p.closings, p.leads),
  };
}

// --- 7. Lead source performance ----------------------------------------------

/** Friendly names for the source channels the capture forms write. */
const CHANNEL_LABELS: Record<string, string> = {
  facebook_ads: "Facebook ads",
  lf_website: "Loan Factory website",
  qm_pricer: "QuickMatch pricer",
  partner_referral: "Partner referral",
  manual: "Added by hand",
  unknown: "No source recorded",
};

export function channelLabel(channel: string): string {
  return CHANNEL_LABELS[channel] ?? channel.replace(/_/g, " ");
}

export type LeadSourceRow = {
  channel: string;
  /** Leads captured in range from this source. */
  leads: number;
  /** Of those, how many have a first response recorded. */
  contacted: number;
  /** Of those leads' files, how many have funded — a lifetime outcome. */
  closed: number;
  closeRate: number | null;
};

export async function leadSourcePerformance(
  db: Db,
  u: CurrentUser,
  s: ReportScope,
  r: DateRange,
): Promise<LeadSourceRow[]> {
  const channelExpr = sql<string>`COALESCE(${lead.source}->>'channel', 'unknown')`;

  const rows = await db
    .select({
      channel: channelExpr,
      leads: sql<number>`count(*)::int`,
      contacted: sql<number>`count(*) FILTER (WHERE ${lead.firstResponseAt} IS NOT NULL)::int`,
      // The close is credited whenever it lands: a Facebook lead captured this
      // month that funds in October still tells you Facebook leads close.
      closed: sql<number>`count(*) FILTER (WHERE ${loan.fundedAt} IS NOT NULL)::int`,
    })
    .from(lead)
    .leftJoin(loan, and(eq(loan.id, lead.loanId), isNull(loan.deletedAt)))
    .where(and(inRange(lead.capturedAt, r), leadScope(u, s)))
    .groupBy(channelExpr)
    .orderBy(desc(sql`count(*)`));

  return rows.map((row) => ({
    ...row,
    closeRate: row.leads > 0 ? row.closed / row.leads : null,
  }));
}

// --- 8. Referral partner production ------------------------------------------

export type PartnerProductionRow = {
  partnerId: string;
  name: string;
  company: string | null;
  /** Referred files opened in range (falls back to the referral record date). */
  referrals: number;
  /** Referred files that funded in range. */
  closings: number;
};

export async function partnerProduction(
  db: Db,
  u: CurrentUser,
  s: ReportScope,
  r: DateRange,
): Promise<{ top: PartnerProductionRow[]; totalPartners: number; quietCount: number }> {
  // When a referral carries a file, the file's created date is when the business
  // arrived; a bare referral record only has its own timestamp.
  const referredAt = sql`COALESCE(${loan.createdAt}, ${partnerRelationship.createdAt})`;
  const referredInRange = sql`${referredAt} >= ${r.from} AND ${referredAt} < ${r.to}`;

  const top = await db
    .select({
      partnerId: partner.id,
      name: sql<string>`${partner.firstName} || ' ' || ${partner.lastName}`,
      company: partner.company,
      referrals: sql<number>`count(DISTINCT ${partnerRelationship.id}) FILTER (
        WHERE ${referredInRange}
      )::int`,
      closings: sql<number>`count(DISTINCT ${loan.id}) FILTER (
        WHERE ${dateInRange(loan.fundedAt, r)}
      )::int`,
    })
    .from(partner)
    .innerJoin(
      partnerRelationship,
      and(eq(partnerRelationship.partnerId, partner.id), eq(partnerRelationship.role, "referred")),
    )
    .leftJoin(loan, and(eq(loan.id, partnerRelationship.loanId), isNull(loan.deletedAt)))
    .where(and(isNull(partner.deletedAt), partnerScope(u, s)))
    .groupBy(partner.id, partner.firstName, partner.lastName, partner.company)
    .having(
      sql`count(DISTINCT ${partnerRelationship.id}) FILTER (WHERE ${referredInRange}) > 0
       OR count(DISTINCT ${loan.id}) FILTER (WHERE ${dateInRange(loan.fundedAt, r)}) > 0`,
    )
    .orderBy(
      desc(sql`count(DISTINCT ${partnerRelationship.id}) FILTER (WHERE ${referredInRange})`),
      desc(sql`count(DISTINCT ${loan.id}) FILTER (WHERE ${dateInRange(loan.fundedAt, r)})`),
    )
    .limit(6);

  const [totals] = await db
    .select({
      totalPartners: sql<number>`count(*)::int`,
      // A partner who asked not to be contacted is not being neglected.
      quietCount: sql<number>`count(*) FILTER (
        WHERE ${partner.doNotContact} = false
          AND (${partner.lastTouchAt} IS NULL OR ${partner.lastTouchAt} < now() - interval '60 days')
      )::int`,
    })
    .from(partner)
    .where(and(isNull(partner.deletedAt), partnerScope(u, s)));

  return {
    top,
    totalPartners: totals?.totalPartners ?? 0,
    quietCount: totals?.quietCount ?? 0,
  };
}

// --- 9. Active drip campaigns ------------------------------------------------

export type DripRead = {
  count: number;
  campaigns: { id: string; name: string; audienceSize: number; steps: number }[];
};

/** Campaigns running right now — a point-in-time fact, not a range one. */
export async function activeDripCampaigns(
  db: Db,
  u: CurrentUser,
  s: ReportScope,
): Promise<DripRead> {
  const rows = await db
    .select({
      id: campaign.id,
      name: campaign.name,
      audienceSize: campaign.audienceSize,
      steps: sql<number>`COALESCE(jsonb_array_length(${campaign.drip}), 0)::int`,
    })
    .from(campaign)
    .where(
      and(isNull(campaign.deletedAt), eq(campaign.status, "running"), campaignScope(u, s)),
    )
    .orderBy(desc(campaign.updatedAt))
    .limit(8);

  return { count: rows.length, campaigns: rows };
}

// --- 10. Newsletters sent ----------------------------------------------------

export type NewsletterRow = {
  id: string;
  name: string;
  status: string;
  sent: number;
  opened: number;
};

/**
 * Campaigns that have actually sent something. Honest framing: the CRM records
 * lifetime send totals per campaign, not per-send dates, so this list cannot be
 * fenced to the selected range — the screen says exactly that.
 */
export async function newslettersSent(
  db: Db,
  u: CurrentUser,
  s: ReportScope,
): Promise<NewsletterRow[]> {
  return db
    .select({
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      sent: campaign.sentCount,
      opened: campaign.openCount,
    })
    .from(campaign)
    .where(
      and(
        isNull(campaign.deletedAt),
        inArray(campaign.status, ["finished", "running"]),
        sql`${campaign.sentCount} > 0`,
        campaignScope(u, s),
      ),
    )
    .orderBy(desc(campaign.sentCount))
    .limit(8);
}

// --- 11. Database size -------------------------------------------------------

export type DatabaseSizeRead = {
  total: number;
  byType: { type: string; count: number }[];
};

const PERSON_TYPE_ORDER = ["lead", "borrower", "past_client", "other"] as const;

export const PERSON_TYPE_LABELS: Record<string, string> = {
  lead: "Leads",
  borrower: "Borrowers",
  past_client: "Past clients",
  other: "Other contacts",
};

export async function databaseSize(
  db: Db,
  u: CurrentUser,
  s: ReportScope,
): Promise<DatabaseSizeRead> {
  const rows = await db
    .select({ type: person.type, count: sql<number>`count(*)::int` })
    .from(person)
    .where(
      and(isNull(person.deletedAt), isNull(person.mergedIntoPersonId), personScope(u, s)),
    )
    .groupBy(person.type);

  const byType = PERSON_TYPE_ORDER.map((type) => ({
    type,
    count: rows.find((row) => row.type === type)?.count ?? 0,
  }));

  return { total: byType.reduce((sum, t) => sum + t.count, 0), byType };
}

// --- 12. Past client activity ------------------------------------------------

export type PastClientTouch = {
  personId: string;
  name: string;
  kind: string;
  at: Date;
};

export type Anniversary = {
  personId: string;
  loanId: string;
  name: string;
  /** Which anniversary it is — "2" means two years since funding. */
  years: number;
  inDays: number;
};

export type PastClientRead = {
  pastClientCount: number;
  touchesInRange: number;
  recent: PastClientTouch[];
  /** Loan anniversaries landing in the next 45 days. */
  anniversaries: Anniversary[];
};

export async function pastClientActivity(
  db: Db,
  u: CurrentUser,
  s: ReportScope,
  r: DateRange,
): Promise<PastClientRead> {
  const [counts] = await db
    .select({ pastClientCount: sql<number>`count(*)::int` })
    .from(person)
    .where(
      and(
        isNull(person.deletedAt),
        isNull(person.mergedIntoPersonId),
        eq(person.type, "past_client"),
        personScope(u, s),
      ),
    );

  const [touches] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(event)
    .innerJoin(person, eq(person.id, event.personId))
    .where(
      and(
        isNull(person.deletedAt),
        eq(person.type, "past_client"),
        inRange(event.createdAt, r),
        personScope(u, s),
      ),
    );

  const recent = await db
    .select({
      personId: person.id,
      name: sql<string>`${person.firstName} || ' ' || ${person.lastName}`,
      kind: event.kind,
      at: event.createdAt,
    })
    .from(event)
    .innerJoin(person, eq(person.id, event.personId))
    .where(
      and(
        isNull(person.deletedAt),
        eq(person.type, "past_client"),
        inRange(event.createdAt, r),
        personScope(u, s),
      ),
    )
    .orderBy(desc(event.createdAt))
    .limit(5);

  // The next anniversary of the funded date. age() gives whole years elapsed,
  // so funded + (years + 1) is the next one coming — computed in SQL because
  // date arithmetic across leap years is Postgres's job, not ours.
  const nextAnniversary = sql`(${loan.fundedAt}::date + make_interval(
    years => EXTRACT(YEAR FROM age(now(), ${loan.fundedAt}::date))::int + 1
  ))`;

  const anniversaries = await db
    .select({
      personId: person.id,
      loanId: loan.id,
      name: sql<string>`${person.firstName} || ' ' || ${person.lastName}`,
      years: sql<number>`EXTRACT(YEAR FROM age(now(), ${loan.fundedAt}::date))::int + 1`,
      inDays: sql<number>`floor(
        EXTRACT(EPOCH FROM (${nextAnniversary} - now())) / 86400
      )::int`,
    })
    .from(loan)
    .innerJoin(person, eq(person.id, loan.personId))
    .where(
      and(
        isNull(loan.deletedAt),
        isNull(person.deletedAt),
        isNotNull(loan.fundedAt),
        sql`${nextAnniversary} < now() + interval '45 days'`,
        loanScope(u, s),
      ),
    )
    .orderBy(sql`${nextAnniversary}`)
    .limit(8);

  return {
    pastClientCount: counts?.pastClientCount ?? 0,
    touchesInRange: touches?.n ?? 0,
    recent,
    anniversaries,
  };
}

// --- 13. Opportunities to improve --------------------------------------------

export type Opportunity = {
  finding: string;
  nextStep: string;
  href: string;
};

/** The extra scalar facts the opportunities list needs beyond the main reads. */
type HealthRead = {
  uncontactedLeads: number;
  staleFiles: number;
  anniversaryCampaignLive: boolean;
};

async function health(db: Db, u: CurrentUser, s: ReportScope): Promise<HealthRead> {
  const [leads] = await db
    .select({ n: sql<number>`count(*) FILTER (WHERE ${lead.firstResponseAt} IS NULL)::int` })
    .from(lead)
    .where(leadScope(u, s));

  // Gone quiet past the stall limit for its stage: 3 days in Transact, 7
  // elsewhere — the same thresholds stages.ts gives the pipeline board.
  const transact = stagesIn("LOANS");
  const [stale] = await db
    .select({
      n: sql<number>`(
        count(*) FILTER (
          WHERE ${inArray(loan.stage, transact)}
            AND ${loan.lastActivityAt} < now() - interval '3 days'
        )
        + count(*) FILTER (
          WHERE NOT (${inArray(loan.stage, transact)})
            AND ${loan.lastActivityAt} < now() - interval '7 days'
        )
      )::int`,
    })
    .from(loan)
    .where(and(isNull(loan.deletedAt), eq(loan.status, "active"), loanScope(u, s)));

  const [anniversary] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(campaign)
    .where(
      and(
        isNull(campaign.deletedAt),
        inArray(campaign.status, ["running", "scheduled"]),
        sql`${campaign.audience}->>'type' = 'anniversary'`,
        campaignScope(u, s),
      ),
    );

  return {
    uncontactedLeads: leads?.n ?? 0,
    staleFiles: stale?.n ?? 0,
    anniversaryCampaignLive: (anniversary?.n ?? 0) > 0,
  };
}

function pct(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

/**
 * Plain-language findings computed from the counts above — worst first, capped
 * at six. If the book is genuinely clean, fewer than three appear; nothing is
 * manufactured to fill space.
 */
function buildOpportunities(
  h: HealthRead,
  sources: LeadSourceRow[],
  partners: { quietCount: number; totalPartners: number },
  pastClients: PastClientRead,
  drips: DripRead,
): Opportunity[] {
  const out: Opportunity[] = [];

  if (h.uncontactedLeads > 0) {
    out.push({
      finding: `${h.uncontactedLeads} ${
        h.uncontactedLeads === 1 ? "lead has" : "leads have"
      } never been contacted.`,
      nextStep: "Work the lead list today — a first call beats any campaign.",
      href: "/people?type=lead",
    });
  }

  // Compare close rates only where both sources have enough leads to mean it.
  const rated = sources.filter((row) => row.leads >= 3 && row.closeRate !== null);
  if (rated.length >= 2) {
    const best = rated.reduce((a, b) => (b.closeRate! > a.closeRate! ? b : a));
    const worst = rated.reduce((a, b) => (b.closeRate! < a.closeRate! ? b : a));
    if (best.channel !== worst.channel && best.closeRate! >= worst.closeRate! * 2) {
      out.push({
        finding: `${channelLabel(worst.channel)} leads close at ${pct(
          worst.closeRate!,
        )} — less than half the ${pct(best.closeRate!)} that ${channelLabel(
          best.channel,
        )} leads close at.`,
        nextStep: `Tighten follow-up on ${channelLabel(
          worst.channel,
        )} leads, or shift that effort toward ${channelLabel(best.channel)}.`,
        href: "/people?type=lead",
      });
    }
  }

  if (pastClients.anniversaries.length > 0 && !h.anniversaryCampaignLive) {
    const n = pastClients.anniversaries.length;
    out.push({
      finding: `${n} past ${
        n === 1 ? "client hits a loan anniversary" : "clients hit loan anniversaries"
      } in the next 45 days with no anniversary campaign running.`,
      nextStep: "Launch the anniversary campaign, or put a personal call on the calendar.",
      href: "/marketing",
    });
  }

  if (partners.quietCount > 0) {
    out.push({
      finding: `${partners.quietCount} of ${partners.totalPartners} referral ${
        partners.quietCount === 1 ? "partner has" : "partners have"
      } had no recorded touch in 60 days or more.`,
      nextStep: "Book coffee or a call with the quiet ones — referrals follow attention.",
      href: "/partners",
    });
  }

  if (h.staleFiles > 0) {
    out.push({
      finding: `${h.staleFiles} active ${
        h.staleFiles === 1 ? "file has" : "files have"
      } gone quiet past the limit for their stage.`,
      nextStep: "Open the pipeline and touch the oldest ones first.",
      href: "/pipeline",
    });
  }

  if (drips.count === 0) {
    out.push({
      finding: "No drip campaign is running right now.",
      nextStep: "Start one — leads captured this week should hear from you next week too.",
      href: "/marketing",
    });
  }

  return out.slice(0, 6);
}

// --- The whole report --------------------------------------------------------

export type IntelligenceReport = {
  /** Which book these numbers cover — drives the subtitle, and it must be said. */
  scope: ReportScope;
  production: ProductionRead;
  conversion: ConversionRead;
  sources: LeadSourceRow[];
  partners: Awaited<ReturnType<typeof partnerProduction>>;
  drips: DripRead;
  newsletters: NewsletterRow[];
  database: DatabaseSizeRead;
  pastClients: PastClientRead;
  opportunities: Opportunity[];
};

export async function intelligenceReport(
  db: Db,
  u: CurrentUser,
  scope: ReportScope,
  range: DateRange,
): Promise<IntelligenceReport> {
  const prod = await production(db, u, scope, range);
  const sources = await leadSourcePerformance(db, u, scope, range);
  const partners = await partnerProduction(db, u, scope, range);
  const drips = await activeDripCampaigns(db, u, scope);
  const newsletters = await newslettersSent(db, u, scope);
  const database = await databaseSize(db, u, scope);
  const pastClients = await pastClientActivity(db, u, scope, range);
  const h = await health(db, u, scope);

  return {
    scope,
    production: prod,
    conversion: conversionRates(prod),
    sources,
    partners,
    drips,
    newsletters,
    database,
    pastClients,
    opportunities: buildOpportunities(h, sources, partners, pastClients, drips),
  };
}

/** True when there is genuinely nothing in the book — not merely a quiet range. */
export function hasNothingToReport(report: IntelligenceReport): boolean {
  return report.database.total === 0 && report.partners.totalPartners === 0;
}
