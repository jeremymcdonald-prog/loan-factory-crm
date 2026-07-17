/**
 * Partners queries — the Partners module's read layer.
 *
 * Every query here runs inside the caller's tenant context via queryAs(), so
 * RLS scopes the rows. Role visibility (an LO sees the partners they own, a
 * leader sees the whole book) is applied on top, exactly as it is in People.
 *
 * A partner is a referral relationship — an agent, a builder, an advisor. The
 * only thing this module measures is whether that relationship is being kept
 * up, and the only fact it measures it with is `lastTouchAt`, which a human
 * enters by logging a touch.
 */
import "server-only";
import { and, asc, eq, isNull, desc, inArray, sql } from "drizzle-orm";
import type { Db } from "@/db";
import {
  partner,
  partnerRelationship,
  person,
  loan,
  conversation,
  message,
  event,
  user as userTable,
} from "@/db/schema";
import { seesWholeBook } from "@/lib/roles";
import type { CurrentUser } from "@/lib/auth";
import type { Urgency } from "@/components/ui/badge";
import type { Stage } from "@/lib/stages";

/**
 * Silence is the risk this module exists to surface. One threshold, computed in
 * one place, so the list, the record, and Ally all read the same quiet the same
 * way.
 */
export const QUIET_AFTER_DAYS = 60;

/**
 * Ally's check-in suggestion is computed from partner facts rather than stored:
 * `ai_insight` has no partner column, and inventing one is out of scope. The
 * human's verdict IS durable — it lands in `event`, keyed by partner id in the
 * payload, which is what lets the card settle instead of nagging forever.
 */
export const CHECKIN_APPROVED = "ally.partner_checkin.approved";
export const CHECKIN_SKIPPED = "ally.partner_checkin.skipped";

export type PartnerHealth = {
  level: Urgency;
  label: string;
  /** Days of silence, set only when the partner has actually gone quiet. */
  quietDays: number | null;
};

export function daysSinceTouch(lastTouchAt: Date | null, now = new Date()): number | null {
  if (!lastTouchAt) return null;
  return Math.floor((now.getTime() - lastTouchAt.getTime()) / 86_400_000);
}

const TIER_HEALTH: Record<string, { level: Urgency; label: string }> = {
  core: { level: "healthy", label: "Core" },
  growing: { level: "info", label: "Growing" },
  new: { level: "neutral", label: "New" },
  quiet: { level: "warning", label: "Quiet" },
};

/**
 * How the relationship is actually doing.
 *
 * Silence outranks the stored tier on purpose: a core agent who hasn't heard
 * from you in two months is a core agent you are losing, and the badge has to
 * say so — on the list, on the record, and in the Core tab.
 */
export function partnerHealth(
  tier: string,
  lastTouchAt: Date | null,
  now = new Date(),
): PartnerHealth {
  const days = daysSinceTouch(lastTouchAt, now);

  if (days === null) {
    return { level: "neutral", label: "No touch logged", quietDays: null };
  }
  if (days >= QUIET_AFTER_DAYS) {
    return { level: "warning", label: `Quiet ${days}d`, quietDays: days };
  }
  return { ...(TIER_HEALTH[tier] ?? TIER_HEALTH.new), quietDays: null };
}

/** Restrict to the partners the user owns unless their role sees wider. */
function bookScope(currentUser: CurrentUser) {
  return seesWholeBook(currentUser.role) ? undefined : eq(partner.ownerUserId, currentUser.userId);
}

export type PartnerListRow = {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  kind: string;
  tier: string;
  emails: { address: string }[];
  phones: { number: string }[];
  lastTouchAt: Date | null;
  referralCount: number;
};

export type PartnersFilter = { tier?: string };

/**
 * Every partner, ordered by who has waited longest to hear from you. The point
 * of the screen is the neglected relationship, so it sits at the top rather
 * than at the bottom of an alphabet.
 */
export async function listPartners(
  db: Db,
  currentUser: CurrentUser,
  filter: PartnersFilter = {},
): Promise<PartnerListRow[]> {
  const conditions = [isNull(partner.deletedAt), bookScope(currentUser)].filter(Boolean);

  if (filter.tier && filter.tier !== "all") {
    conditions.push(eq(partner.tier, filter.tier as "core" | "growing" | "quiet" | "new"));
  }

  // Built as its own fragment, not written inline below. Drizzle only emits
  // qualified column names ("partner"."id") for a nested sql fragment; inline
  // in a select field it emits a bare "id", which inside
  // `SELECT ... FROM partner_relationship` binds to that table's own id and
  // silently counts zero referrals for everyone.
  const sentByThisPartner = sql`${partnerRelationship.partnerId} = ${partner.id}`;

  const rows = await db
    .select({
      id: partner.id,
      firstName: partner.firstName,
      lastName: partner.lastName,
      company: partner.company,
      kind: partner.kind,
      tier: partner.tier,
      emails: partner.emails,
      phones: partner.phones,
      lastTouchAt: partner.lastTouchAt,
      referralCount: sql<number>`(
        SELECT count(*)::int FROM ${partnerRelationship} WHERE ${sentByThisPartner}
      )`,
    })
    .from(partner)
    .where(and(...conditions))
    // Never touched sits above longest-silent: both are people waiting on you.
    // The name breaks ties so the list doesn't reshuffle between loads.
    .orderBy(sql`${partner.lastTouchAt} ASC NULLS FIRST`, asc(partner.lastName), asc(partner.firstName))
    .limit(200);

  return rows as PartnerListRow[];
}

export async function countPartnersByTier(
  db: Db,
  currentUser: CurrentUser,
): Promise<Record<string, number>> {
  const rows = await db
    .select({ tier: partner.tier, value: sql<number>`count(*)::int` })
    .from(partner)
    .where(and(isNull(partner.deletedAt), bookScope(currentUser)))
    .groupBy(partner.tier);

  const counts: Record<string, number> = { all: 0 };
  for (const r of rows) {
    counts[r.tier] = r.value;
    counts.all += r.value;
  }
  return counts;
}

export type PartnerReferral = {
  id: string;
  personId: string | null;
  firstName: string | null;
  lastName: string | null;
  loanId: string | null;
  stage: Stage | null;
  loanStatus: string | null;
  purpose: string | null;
  amount: string | null;
  fundedAt: string | null;
  referredAt: Date;
};

export type PartnerMessage = {
  id: string;
  channel: string;
  direction: string;
  subject: string | null;
  body: string;
  preparedByAlly: boolean;
  occurredAt: Date;
  authorName: string | null;
};

export type PartnerRecord = NonNullable<Awaited<ReturnType<typeof getPartner>>>;

export async function getPartner(db: Db, currentUser: CurrentUser, partnerId: string) {
  const [row] = await db
    .select()
    .from(partner)
    .where(and(eq(partner.id, partnerId), isNull(partner.deletedAt), bookScope(currentUser)))
    .limit(1);

  if (!row) return null;

  // The people they sent, newest first, with what became of each file.
  const referrals = await db
    .select({
      id: partnerRelationship.id,
      personId: partnerRelationship.personId,
      firstName: person.firstName,
      lastName: person.lastName,
      loanId: loan.id,
      stage: loan.stage,
      loanStatus: loan.status,
      purpose: loan.purpose,
      amount: loan.amount,
      fundedAt: loan.fundedAt,
      referredAt: partnerRelationship.createdAt,
    })
    .from(partnerRelationship)
    .leftJoin(person, eq(person.id, partnerRelationship.personId))
    .leftJoin(loan, and(eq(loan.id, partnerRelationship.loanId), isNull(loan.deletedAt)))
    .where(eq(partnerRelationship.partnerId, partnerId))
    // Referrals seeded in one transaction share a timestamp, so the name
    // settles the tie and "their last referral" means the same thing twice.
    .orderBy(desc(partnerRelationship.createdAt), asc(person.lastName), asc(person.firstName));

  // Contact history is message-level: the threads are how it's stored, but what
  // a loan officer wants is "what have we actually said to each other".
  const messages = await db
    .select({
      id: message.id,
      channel: message.channel,
      direction: message.direction,
      subject: message.subject,
      body: message.body,
      preparedByAlly: message.preparedByAlly,
      occurredAt: message.occurredAt,
      authorName: userTable.fullName,
    })
    .from(message)
    .innerJoin(conversation, eq(conversation.id, message.conversationId))
    .leftJoin(userTable, eq(userTable.id, message.authorUserId))
    .where(eq(conversation.partnerId, partnerId))
    .orderBy(desc(message.occurredAt))
    .limit(50);

  const [verdict] = await db
    .select({ kind: event.kind, createdAt: event.createdAt })
    .from(event)
    .where(
      and(
        inArray(event.kind, [CHECKIN_APPROVED, CHECKIN_SKIPPED]),
        sql`${event.payload}->>'partnerId' = ${partnerId}`,
      ),
    )
    .orderBy(desc(event.createdAt))
    .limit(1);

  return {
    partner: row,
    referrals: referrals as PartnerReferral[],
    messages: messages as PartnerMessage[],
    verdict: verdict ?? null,
  };
}
