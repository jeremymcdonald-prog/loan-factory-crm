/**
 * Marketing queries — the Marketing module's read layer.
 *
 * Every query runs inside the caller's tenant context via queryAs(), so RLS
 * scopes the rows. Campaigns belong to a book the way people do: an LO sees the
 * campaigns they own, a leader sees the team's.
 *
 * The template library is deliberately NOT book-scoped. It is the tenant's
 * shared compliance-reviewed library — the same templates for everybody — so
 * RLS alone is the whole of its scoping and the library reads below take no
 * user at all. Their siblings here take one because they genuinely narrow by it.
 */
import "server-only";
import { and, or, eq, ilike, isNull, desc, asc, sql, count } from "drizzle-orm";
import type { Db } from "@/db";
import { campaign, template, person, partner, loan, user, tenant } from "@/db/schema";
import { seesWholeBook } from "@/lib/roles";
import type { CurrentUser } from "@/lib/auth";
import type { Stage } from "@/lib/stages";
import type { AudienceType } from "@/app/(app)/marketing/vocabulary";

/** Restrict to the user's own campaigns unless their role sees wider. */
function bookScope(u: CurrentUser) {
  return seesWholeBook(u.role) ? undefined : eq(campaign.ownerUserId, u.userId);
}

// --- Campaigns ---------------------------------------------------------------

export type CampaignRow = {
  id: string;
  name: string;
  status: string;
  audience: { label?: string; type?: string } | null;
  audienceSize: number;
  scheduledFor: Date | null;
  sentCount: number;
  openCount: number;
  replyCount: number;
  createdAt: Date;
  templateId: string | null;
  templateRef: string | null;
  templateName: string | null;
  templatePolicy: string | null;
  ownerName: string | null;
};

/** Every campaign in the caller's book, newest first. */
export async function listCampaigns(db: Db, u: CurrentUser): Promise<CampaignRow[]> {
  const rows = await db
    .select({
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      audience: campaign.audience,
      audienceSize: campaign.audienceSize,
      scheduledFor: campaign.scheduledFor,
      sentCount: campaign.sentCount,
      openCount: campaign.openCount,
      replyCount: campaign.replyCount,
      createdAt: campaign.createdAt,
      templateId: campaign.templateId,
      templateRef: template.ref,
      templateName: template.name,
      templatePolicy: template.policy,
      ownerName: user.fullName,
    })
    .from(campaign)
    .leftJoin(template, eq(template.id, campaign.templateId))
    .leftJoin(user, eq(user.id, campaign.ownerUserId))
    .where(and(isNull(campaign.deletedAt), bookScope(u)))
    .orderBy(desc(campaign.createdAt))
    .limit(200);

  return rows as CampaignRow[];
}

export type CampaignTotals = {
  runningCount: number;
  scheduledCount: number;
  /** People actually reached, across every campaign that has sent anything. */
  sentTotal: number;
  openTotal: number;
  replyTotal: number;
};

/** The numbers on the dashboard header. Computed in SQL, not in the page. */
export async function campaignTotals(db: Db, u: CurrentUser): Promise<CampaignTotals> {
  const [row] = await db
    .select({
      runningCount: sql<number>`count(*) FILTER (WHERE ${campaign.status} = 'running')::int`,
      scheduledCount: sql<number>`count(*) FILTER (WHERE ${campaign.status} = 'scheduled')::int`,
      sentTotal: sql<number>`COALESCE(sum(${campaign.sentCount}), 0)::int`,
      openTotal: sql<number>`COALESCE(sum(${campaign.openCount}), 0)::int`,
      replyTotal: sql<number>`COALESCE(sum(${campaign.replyCount}), 0)::int`,
    })
    .from(campaign)
    .where(and(isNull(campaign.deletedAt), bookScope(u)));

  return row ?? { runningCount: 0, scheduledCount: 0, sentTotal: 0, openTotal: 0, replyTotal: 0 };
}

// --- Templates ---------------------------------------------------------------

export type TemplateRow = {
  id: string;
  ref: string;
  name: string;
  category: string;
  channel: string;
  stage: Stage | null;
  policy: string;
  languageCode: string;
};

export type TemplateFilter = {
  q?: string;
  category?: string;
  policy?: string;
};

/**
 * The library, filtered. Ordered by ref so EMT-001 reads before EMT-010 —
 * the refs are zero-padded, so a plain sort is the numeric one.
 */
export async function listTemplates(
  db: Db,
  filter: TemplateFilter = {},
): Promise<TemplateRow[]> {
  const conditions = [];

  if (filter.q) {
    const term = `%${filter.q}%`;
    conditions.push(
      or(
        ilike(template.ref, term),
        ilike(template.name, term),
        ilike(template.category, term),
      ),
    );
  }
  if (filter.category && filter.category !== "all") {
    conditions.push(eq(template.category, filter.category));
  }
  if (filter.policy && filter.policy !== "all") {
    conditions.push(
      eq(
        template.policy,
        filter.policy as "fully_automated" | "semi_automated" | "manual_only" | "never_automate",
      ),
    );
  }

  return (await db
    .select({
      id: template.id,
      ref: template.ref,
      name: template.name,
      category: template.category,
      channel: template.channel,
      stage: template.stage,
      policy: template.policy,
      languageCode: template.languageCode,
    })
    .from(template)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(template.ref))) as TemplateRow[];
}

export type TemplateRecord = TemplateRow & {
  subject: string | null;
  body: string;
  mergeFields: string[] | null;
  complianceNotes: string | null;
};

export async function getTemplate(db: Db, id: string): Promise<TemplateRecord | null> {
  const [row] = await db.select().from(template).where(eq(template.id, id)).limit(1);
  return (row as TemplateRecord | undefined) ?? null;
}

/** Category names with how many templates each holds — drives the filter. */
export async function templateCategories(
  db: Db,
): Promise<{ category: string; count: number }[]> {
  return db
    .select({ category: template.category, count: count() })
    .from(template)
    .groupBy(template.category)
    .orderBy(asc(template.category));
}

/** How many templates sit under each policy, plus the total. */
export async function templatePolicyCounts(db: Db): Promise<Record<string, number>> {
  const rows = await db
    .select({ policy: template.policy, count: count() })
    .from(template)
    .groupBy(template.policy);

  const out: Record<string, number> = { all: 0 };
  for (const r of rows) {
    out[r.policy] = Number(r.count);
    out.all += Number(r.count);
  }
  return out;
}

export type TemplateChoice = {
  id: string;
  ref: string;
  name: string;
  category: string;
  policy: string;
};

/** Every template, for the New campaign picker. The dialog explains the policy. */
export async function listTemplateChoices(db: Db): Promise<TemplateChoice[]> {
  return db
    .select({
      id: template.id,
      ref: template.ref,
      name: template.name,
      category: template.category,
      policy: template.policy,
    })
    .from(template)
    .orderBy(asc(template.ref));
}

// --- Audiences ---------------------------------------------------------------
//
// One rule per audience, and each one has to mean exactly what its label in
// ../marketing/vocabulary says. Nobody who has asked not to be contacted is ever
// counted, on any of them.

function audienceBookScope(u: CurrentUser) {
  return seesWholeBook(u.role) ? undefined : eq(person.ownerUserId, u.userId);
}

/**
 * How many people an audience actually reaches right now, counted live against
 * the database. Never an estimate and never a stored guess.
 */
export async function audienceSize(
  db: Db,
  u: CurrentUser,
  type: AudienceType,
): Promise<number> {
  if (type === "partners") {
    const [row] = await db
      .select({ n: count() })
      .from(partner)
      .where(
        and(
          isNull(partner.deletedAt),
          eq(partner.doNotContact, false),
          seesWholeBook(u.role) ? undefined : eq(partner.ownerUserId, u.userId),
        ),
      );
    return Number(row?.n ?? 0);
  }

  if (type === "past_clients") {
    const [row] = await db
      .select({ n: count() })
      .from(person)
      .where(
        and(
          isNull(person.deletedAt),
          eq(person.doNotContact, false),
          eq(person.type, "past_client"),
          audienceBookScope(u),
        ),
      );
    return Number(row?.n ?? 0);
  }

  if (type === "preapproval_expiring") {
    const [row] = await db
      .select({ n: sql<number>`count(DISTINCT ${person.id})::int` })
      .from(loan)
      .innerJoin(person, eq(person.id, loan.personId))
      .where(
        and(
          isNull(loan.deletedAt),
          isNull(person.deletedAt),
          eq(person.doNotContact, false),
          eq(loan.status, "active"),
          sql`${loan.preapprovalExpiresAt} BETWEEN current_date AND current_date + 30`,
          audienceBookScope(u),
        ),
      );
    return Number(row?.n ?? 0);
  }

  // anniversary — closed in this calendar month, any year.
  const [row] = await db
    .select({ n: sql<number>`count(DISTINCT ${person.id})::int` })
    .from(loan)
    .innerJoin(person, eq(person.id, loan.personId))
    .where(
      and(
        isNull(loan.deletedAt),
        isNull(person.deletedAt),
        eq(person.doNotContact, false),
        eq(loan.status, "funded"),
        sql`EXTRACT(MONTH FROM ${loan.fundedAt}) = EXTRACT(MONTH FROM current_date)`,
        audienceBookScope(u),
      ),
    );
  return Number(row?.n ?? 0);
}

/**
 * Live size of every audience, so the picker can show what each one reaches.
 *
 * Sequential on purpose. Everything inside queryAs() shares one pooled client
 * and one transaction, so concurrent queries (Promise.all) would issue
 * overlapping statements on that single connection — node-postgres deprecates
 * it and the results can interleave. There are a handful of audiences; the
 * round-trips are cheap.
 */
export async function audienceSizes(
  db: Db,
  u: CurrentUser,
  types: readonly AudienceType[],
): Promise<Record<string, number>> {
  const sizes: Record<string, number> = {};
  for (const t of types) {
    sizes[t] = await audienceSize(db, u, t);
  }
  return sizes;
}

/**
 * The company NMLS every send has to carry. It is a fact about the tenant, so
 * it is read from the tenant rather than typed into a footer.
 */
export async function companyNmls(db: Db, u: CurrentUser): Promise<string | null> {
  const [row] = await db
    .select({ nmls: tenant.companyNmls })
    .from(tenant)
    .where(eq(tenant.id, u.tenantId))
    .limit(1);
  return row?.nmls ?? null;
}
