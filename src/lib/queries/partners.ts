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
import { and, asc, eq, isNull, desc, inArray, like, sql } from "drizzle-orm";
import type { Db } from "@/db";
import {
  partner,
  partnerRelationship,
  person,
  loan,
  conversation,
  message,
  event,
  task,
  user as userTable,
} from "@/db/schema";
import { seesWholeBook } from "@/lib/roles";
import type { CurrentUser } from "@/lib/auth";
import type { Urgency } from "@/components/ui/badge";
import type { Stage } from "@/lib/stages";

/**
 * Silence is the risk this module exists to surface. One threshold, computed in
 * one place, so the list, the record, and AI all read the same quiet the same
 * way.
 */
export const QUIET_AFTER_DAYS = 60;

/**
 * AI's check-in suggestion is computed from partner facts rather than stored:
 * `ai_insight` has no partner column, and inventing one is out of scope. The
 * human's verdict IS durable — it lands in `event`, keyed by partner id in the
 * payload, which is what lets the card settle instead of nagging forever.
 */
export const CHECKIN_APPROVED = "ai.partner_checkin.approved";
export const CHECKIN_SKIPPED = "ai.partner_checkin.skipped";

/**
 * Campaign enrollment for a partner is recorded as an event: `campaign` has an
 * audience rule, not a member table, and inventing one is out of scope. The
 * event is the durable, honest record — "this partner was put on this
 * campaign, by this person, on this date" — and nothing about it implies a
 * send happened.
 */
export const PARTNER_ENROLLED = "partner.campaign_enrolled";

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
  target: { level: "brand", label: "Target" },
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
  /** Funded loans that came through this partner's referrals. */
  closingCount: number;
  /** When they last sent someone — null for a target who hasn't yet. */
  lastReferralAt: Date | null;
  ownerName: string | null;
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
    conditions.push(
      eq(partner.tier, filter.tier as "target" | "core" | "growing" | "quiet" | "new"),
    );
  }

  // Built as their own fragments, not written inline below. Drizzle only emits
  // qualified column names ("partner"."id") for a nested sql fragment; inline
  // in a select field it emits a bare "id", which inside
  // `SELECT ... FROM partner_relationship` binds to that table's own id and
  // silently counts zero referrals for everyone.
  const sentByThisPartner = sql`${partnerRelationship.partnerId} = ${partner.id}`;
  const fundedThroughThisPartner = sql`${partnerRelationship.partnerId} = ${partner.id}
    AND ${loan.id} = ${partnerRelationship.loanId}
    AND ${loan.status} = 'funded'
    AND ${loan.deletedAt} IS NULL`;

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
      closingCount: sql<number>`(
        SELECT count(*)::int FROM ${partnerRelationship}, ${loan} WHERE ${fundedThroughThisPartner}
      )`,
      lastReferralAt: sql<Date | null>`(
        SELECT max(${partnerRelationship.createdAt}) FROM ${partnerRelationship} WHERE ${sentByThisPartner}
      )`,
      ownerName: userTable.fullName,
    })
    .from(partner)
    .leftJoin(userTable, eq(userTable.id, partner.ownerUserId))
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
  /** "draft" renders with an explicit "not sent" label — nothing sends here. */
  status: string;
  subject: string | null;
  body: string;
  preparedByAi: boolean;
  occurredAt: Date;
  authorName: string | null;
};

export type PartnerEnrollment = {
  campaignId: string;
  campaignName: string;
  enrolledAt: Date;
  enrolledByName: string | null;
};

export type PartnerRecord = NonNullable<Awaited<ReturnType<typeof getPartner>>>;

export async function getPartner(db: Db, currentUser: CurrentUser, partnerId: string) {
  const [row] = await db
    .select()
    .from(partner)
    .where(and(eq(partner.id, partnerId), isNull(partner.deletedAt), bookScope(currentUser)))
    .limit(1);

  if (!row) return null;

  // The book owner's name for display — a small extra lookup rather than a
  // join on the row query above, so `row` stays a flat `partner` shape (the
  // page reads its fields directly, e.g. `partner.firstName`).
  let ownerName: string | null = null;
  if (row.ownerUserId) {
    const [owner] = await db
      .select({ fullName: userTable.fullName })
      .from(userTable)
      .where(eq(userTable.id, row.ownerUserId))
      .limit(1);
    ownerName = owner?.fullName ?? null;
  }

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
      status: message.status,
      subject: message.subject,
      body: message.body,
      preparedByAi: message.preparedByAi,
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

  // The campaigns this partner has been put on. Read from events (see
  // PARTNER_ENROLLED) with the campaign's current name looked up so a rename
  // doesn't strand the history.
  const enrollmentRows = await db
    .select({
      payload: event.payload,
      createdAt: event.createdAt,
      enrolledByName: userTable.fullName,
    })
    .from(event)
    .leftJoin(userTable, eq(userTable.id, event.actorUserId))
    .where(
      and(eq(event.kind, PARTNER_ENROLLED), sql`${event.payload}->>'partnerId' = ${partnerId}`),
    )
    .orderBy(desc(event.createdAt))
    .limit(20);

  const enrollments: PartnerEnrollment[] = enrollmentRows.map((e) => ({
    campaignId: String((e.payload as Record<string, unknown>)?.campaignId ?? ""),
    campaignName: String((e.payload as Record<string, unknown>)?.campaignName ?? "Campaign"),
    enrolledAt: e.createdAt,
    enrolledByName: e.enrolledByName,
  }));

  return {
    partner: row,
    ownerName,
    referrals: referrals as PartnerReferral[],
    messages: messages as PartnerMessage[],
    verdict: verdict ?? null,
    enrollments,
  };
}

// ---------------------------------------------------------------------------
// Tasks & activity timeline
//
// `task` has no partner column — the schema is fixed — so addPartnerTask and
// bulkAddTask (partners/[id]/actions.ts, partners/actions.ts) both title the
// task "<what> — <First> <Last>", and that suffix is the only handle left to
// find it again here. This is a best-effort match: two partners who share an
// identical first + last name would surface each other's tasks. That is the
// same trade-off the write side already accepted; it is not made worse here.
// ---------------------------------------------------------------------------

export type PartnerTask = {
  id: string;
  title: string;
  status: string;
  dueAt: Date | null;
};

/** Open (and recently completed) tasks about a partner, for the Tasks card. */
export async function partnerTasks(db: Db, fullName: string, limit = 10): Promise<PartnerTask[]> {
  const rows = await db
    .select({ id: task.id, title: task.title, status: task.status, dueAt: task.dueAt })
    .from(task)
    .where(
      and(
        isNull(task.deletedAt),
        like(task.title, `%— ${fullName}`),
        inArray(task.status, ["open", "done"]),
      ),
    )
    .orderBy(desc(task.dueAt))
    .limit(limit);
  return rows;
}

export type PartnerTimelineItem = {
  id: string;
  kind: "message" | "task" | "event";
  at: Date;
  title: string;
  body: string | null;
  actorName: string | null;
  /** Where to go for the full record (a conversation), when there is one. */
  href: string | null;
  /** Honest status chip text, e.g. "Draft — not sent". */
  badge: string | null;
  preparedByAi: boolean;
};

const TIMELINE_CHANNEL_LABELS: Record<string, string> = {
  email: "Email",
  sms: "Text",
  video: "Video message",
  call: "Call",
  note: "Note",
  app: "App message",
};

function timelineMessageTitle(channel: string, direction: string, status: string): string {
  const label = TIMELINE_CHANNEL_LABELS[channel] ?? channel;
  if (direction === "inbound") return `${label} received`;
  if (status === "sent") return `${label} sent`;
  return `${label} draft`;
}

function timelineMessageBadge(status: string): string | null {
  if (status === "draft") return "Draft — not sent";
  if (status === "awaiting_approval") return "Awaiting approval";
  if (status === "approved") return "Approved — not sent";
  if (status === "failed") return "Failed";
  return null;
}

/**
 * Everything that has happened with a partner, newest first: contact-history
 * messages (which is also where logged touches and standalone notes live —
 * see logPartnerTouch/addPartnerNote in actions.ts, both of which write to
 * `message` because `note` has no partner column), tasks, and
 * campaign-enrollment events, merged into one list. Mirrors personTimeline in
 * queries/people.ts.
 *
 * Reads run sequentially on purpose — everything inside queryAs() shares one
 * pooled client (see marketing.ts, audienceSizes).
 */
export async function partnerTimeline(
  db: Db,
  partnerId: string,
  fullName: string,
  limit = 60,
): Promise<PartnerTimelineItem[]> {
  const items: PartnerTimelineItem[] = [];

  const messages = await db
    .select({
      id: message.id,
      conversationId: message.conversationId,
      channel: message.channel,
      direction: message.direction,
      status: message.status,
      subject: message.subject,
      body: message.body,
      occurredAt: message.occurredAt,
      preparedByAi: message.preparedByAi,
      authorName: userTable.fullName,
    })
    .from(message)
    .innerJoin(conversation, eq(conversation.id, message.conversationId))
    .leftJoin(userTable, eq(userTable.id, message.authorUserId))
    .where(eq(conversation.partnerId, partnerId))
    .orderBy(desc(message.occurredAt))
    .limit(limit);

  for (const m of messages) {
    items.push({
      id: `message-${m.id}`,
      kind: "message",
      at: m.occurredAt,
      title: m.subject
        ? `${timelineMessageTitle(m.channel, m.direction, m.status)} · ${m.subject}`
        : timelineMessageTitle(m.channel, m.direction, m.status),
      body: m.body,
      actorName: m.authorName,
      href: `/conversations/${m.conversationId}`,
      badge: timelineMessageBadge(m.status),
      preparedByAi: m.preparedByAi,
    });
  }

  const taskRows = await db
    .select({
      id: task.id,
      title: task.title,
      status: task.status,
      createdAt: task.createdAt,
      ownerName: userTable.fullName,
    })
    .from(task)
    .leftJoin(userTable, eq(userTable.id, task.ownerUserId))
    .where(and(isNull(task.deletedAt), like(task.title, `%— ${fullName}`)))
    .orderBy(desc(task.createdAt))
    .limit(limit);

  for (const t of taskRows) {
    items.push({
      id: `task-${t.id}`,
      kind: "task",
      at: t.createdAt,
      title: `Task: ${t.title}`,
      body: null,
      actorName: t.ownerName,
      href: null,
      badge: t.status === "done" ? "Done" : t.status === "cancelled" ? "Cancelled" : null,
      preparedByAi: false,
    });
  }

  const enrollmentRows = await db
    .select({
      id: event.id,
      payload: event.payload,
      createdAt: event.createdAt,
      actorName: userTable.fullName,
    })
    .from(event)
    .leftJoin(userTable, eq(userTable.id, event.actorUserId))
    .where(
      and(eq(event.kind, PARTNER_ENROLLED), sql`${event.payload}->>'partnerId' = ${partnerId}`),
    )
    .orderBy(desc(event.createdAt))
    .limit(limit);

  for (const e of enrollmentRows) {
    const payload = (e.payload ?? {}) as Record<string, unknown>;
    const campaignName =
      typeof payload.campaignName === "string" ? payload.campaignName : "Campaign";
    items.push({
      id: `event-${e.id}`,
      kind: "event",
      at: e.createdAt,
      title: `Added to drip campaign: ${campaignName}`,
      body: null,
      actorName: e.actorName,
      href: null,
      badge: "Enrolled — messages queue for sending when a provider is connected",
      preparedByAi: false,
    });
  }

  return items.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, limit);
}
