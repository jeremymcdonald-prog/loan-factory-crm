/**
 * People queries — the People module's read layer.
 *
 * Every query here runs inside the caller's tenant context via queryAs(), so
 * RLS scopes the rows. Role visibility (an LO sees their own book, a leader
 * sees the team's) is applied on top.
 */
import "server-only";
import { and, or, eq, ne, ilike, isNull, desc, sql, inArray } from "drizzle-orm";
import type { Db } from "@/db";
import {
  person,
  loan,
  lead,
  note,
  task,
  event,
  message,
  conversation,
  campaign,
  loanStageHistory,
  user as userTable,
} from "@/db/schema";
import { seesWholeBook } from "@/lib/roles";
import type { CurrentUser } from "@/lib/auth";
import { stageLabel, type Stage } from "@/lib/stages";

export type PersonListRow = {
  id: string;
  firstName: string;
  lastName: string;
  emails: { address: string }[];
  phones: { number: string }[];
  preferredLanguage: string;
  type: string;
  doNotContact: boolean;
  tags: string[] | null;
  // The person's current opportunity, if any.
  loanId: string | null;
  stage: Stage | null;
  loanStatus: string | null;
  amount: string | null;
  lastActivityAt: Date | null;
  rateLockExpiresAt: string | null;
  closingDate: string | null;
  docsNeeded: boolean | null;
  docsNeededSince: Date | null;
  preapprovalExpiresAt: string | null;
  capturedAt: Date | null;
  firstResponseAt: Date | null;
  leadChannel: string | null;
};

/** Restrict to the user's own book unless their role sees wider. */
function bookScope(user: CurrentUser) {
  return seesWholeBook(user.role) ? undefined : eq(person.ownerUserId, user.userId);
}

export type PeopleFilter = {
  q?: string;
  type?: string;
};

export async function listPeople(
  db: Db,
  user: CurrentUser,
  filter: PeopleFilter = {},
): Promise<PersonListRow[]> {
  const conditions = [isNull(person.deletedAt), bookScope(user)].filter(Boolean);

  if (filter.q) {
    const term = `%${filter.q}%`;
    conditions.push(
      or(
        ilike(person.firstName, term),
        ilike(person.lastName, term),
        sql`${person.firstName} || ' ' || ${person.lastName} ILIKE ${term}`,
        sql`${person.emails}::text ILIKE ${term}`,
        sql`${person.phones}::text ILIKE ${term}`,
      ),
    );
  }

  if (filter.type && filter.type !== "all") {
    conditions.push(eq(person.type, filter.type as "lead" | "borrower" | "past_client" | "other"));
  }

  const rows = await db
    .select({
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      emails: person.emails,
      phones: person.phones,
      preferredLanguage: person.preferredLanguage,
      type: person.type,
      doNotContact: person.doNotContact,
      tags: person.tags,
      loanId: loan.id,
      stage: loan.stage,
      loanStatus: loan.status,
      amount: loan.amount,
      lastActivityAt: loan.lastActivityAt,
      rateLockExpiresAt: loan.rateLockExpiresAt,
      closingDate: loan.closingDate,
      docsNeeded: loan.docsNeeded,
      docsNeededSince: loan.docsNeededSince,
      preapprovalExpiresAt: loan.preapprovalExpiresAt,
      capturedAt: lead.capturedAt,
      firstResponseAt: lead.firstResponseAt,
      leadChannel: sql<string | null>`${lead.source}->>'channel'`,
    })
    .from(person)
    // A person may have several opportunities over the years; the list shows
    // the most recent one. DISTINCT ON keeps one row per person.
    .leftJoin(
      loan,
      and(
        eq(loan.personId, person.id),
        isNull(loan.deletedAt),
        sql`${loan.id} = (
          SELECT l2.id FROM loan l2
           WHERE l2.person_id = ${person.id} AND l2.deleted_at IS NULL
           ORDER BY l2.created_at DESC LIMIT 1
        )`,
      ),
    )
    .leftJoin(lead, eq(lead.loanId, loan.id))
    .where(and(...conditions))
    // Active opportunities first; contacts with no opportunity fall to the
    // bottom rather than outranking a live file just because they were added
    // recently.
    .orderBy(sql`${loan.lastActivityAt} DESC NULLS LAST`)
    .limit(200);

  return rows as PersonListRow[];
}

export type PersonRecord = NonNullable<Awaited<ReturnType<typeof getPerson>>>;

export async function getPerson(db: Db, user: CurrentUser, personId: string) {
  const scope = bookScope(user);
  const [row] = await db
    .select()
    .from(person)
    .where(and(eq(person.id, personId), isNull(person.deletedAt), scope))
    .limit(1);

  if (!row) return null;

  const loans = await db
    .select()
    .from(loan)
    .where(and(eq(loan.personId, personId), isNull(loan.deletedAt)))
    .orderBy(desc(loan.createdAt));

  const leads = loans.length
    ? await db
        .select()
        .from(lead)
        .where(
          inArray(
            lead.loanId,
            loans.map((l) => l.id),
          ),
        )
    : [];

  return { person: row, loans, leads };
}

export async function countPeopleByType(
  db: Db,
  user: CurrentUser,
): Promise<Record<string, number>> {
  const rows = await db
    .select({ type: person.type, value: sql<number>`count(*)::int` })
    .from(person)
    .where(and(isNull(person.deletedAt), bookScope(user)))
    .groupBy(person.type);

  const counts: Record<string, number> = { all: 0 };
  for (const r of rows) {
    counts[r.type] = r.value;
    counts.all += r.value;
  }
  return counts;
}

// --- Campaign choices --------------------------------------------------------

export type CampaignChoice = {
  id: string;
  name: string;
  status: string;
  audienceSize: number;
};

/**
 * Campaigns a person can be enrolled in — the "Add to drip campaign" picker.
 * Finished campaigns are over; everything else (draft, scheduled, running,
 * paused) can still take people. Book-scoped like campaigns everywhere else.
 */
export async function listCampaignChoices(db: Db, user: CurrentUser): Promise<CampaignChoice[]> {
  const scope = seesWholeBook(user.role) ? undefined : eq(campaign.ownerUserId, user.userId);

  return db
    .select({
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      audienceSize: campaign.audienceSize,
    })
    .from(campaign)
    .where(and(isNull(campaign.deletedAt), ne(campaign.status, "finished"), scope))
    .orderBy(desc(campaign.createdAt))
    .limit(100);
}

// --- Import dedupe -----------------------------------------------------------

/**
 * Every email address already on a person in this tenant, lowercased.
 * RLS scopes the read; the import dedupes uploads against this set so the
 * same contact never lands in the book twice.
 */
export async function existingEmailSet(db: Db): Promise<Set<string>> {
  const rows = await db
    .select({ emails: person.emails })
    .from(person)
    .where(isNull(person.deletedAt));

  const set = new Set<string>();
  for (const row of rows) {
    for (const entry of row.emails ?? []) {
      if (entry.address) set.add(entry.address.toLowerCase());
    }
  }
  return set;
}

// --- Activity timeline -------------------------------------------------------

export type TimelineItem = {
  id: string;
  kind: "note" | "message" | "event" | "task" | "stage";
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

const CHANNEL_LABELS: Record<string, string> = {
  email: "Email",
  sms: "Text",
  video: "Video message",
  call: "Call",
  note: "Note",
  app: "App message",
};

const EVENT_TITLES: Record<string, string> = {
  "lead.captured": "Lead captured",
  "campaign.enrolled": "Added to drip campaign",
};

function messageTitle(channel: string, direction: string, status: string): string {
  const label = CHANNEL_LABELS[channel] ?? channel;
  if (direction === "inbound") return `${label} received`;
  if (status === "sent") return `${label} sent`;
  return `${label} draft`;
}

function messageBadge(status: string): string | null {
  if (status === "draft") return "Draft — not sent";
  if (status === "awaiting_approval") return "Awaiting approval";
  if (status === "approved") return "Approved — not sent";
  if (status === "failed") return "Failed";
  return null;
}

/**
 * Everything that has happened with a person, newest first: notes, messages,
 * domain events, tasks, and opportunity stage changes, merged into one list.
 *
 * Reads run sequentially on purpose — everything inside queryAs() shares one
 * pooled client and one transaction, so concurrent queries would interleave
 * statements on a single connection (see marketing.ts, audienceSizes).
 */
export async function personTimeline(
  db: Db,
  user: CurrentUser,
  personId: string,
  limit = 60,
): Promise<TimelineItem[]> {
  const items: TimelineItem[] = [];

  const notes = await db
    .select({
      id: note.id,
      body: note.body,
      createdAt: note.createdAt,
      preparedByAi: note.preparedByAi,
      authorName: userTable.fullName,
    })
    .from(note)
    .leftJoin(userTable, eq(userTable.id, note.authorUserId))
    .where(and(eq(note.personId, personId), isNull(note.deletedAt)))
    .orderBy(desc(note.createdAt))
    .limit(limit);

  for (const n of notes) {
    items.push({
      id: `note-${n.id}`,
      kind: "note",
      at: n.createdAt,
      title: "Note",
      body: n.body,
      actorName: n.authorName,
      href: null,
      badge: null,
      preparedByAi: n.preparedByAi,
    });
  }

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
    .where(eq(conversation.personId, personId))
    .orderBy(desc(message.occurredAt))
    .limit(limit);

  for (const m of messages) {
    items.push({
      id: `message-${m.id}`,
      kind: "message",
      at: m.occurredAt,
      title: m.subject
        ? `${messageTitle(m.channel, m.direction, m.status)} · ${m.subject}`
        : messageTitle(m.channel, m.direction, m.status),
      body: m.body,
      actorName: m.authorName,
      href: `/conversations/${m.conversationId}`,
      badge: messageBadge(m.status),
      preparedByAi: m.preparedByAi,
    });
  }

  const events = await db
    .select({
      id: event.id,
      kind: event.kind,
      payload: event.payload,
      createdAt: event.createdAt,
      actorName: userTable.fullName,
    })
    .from(event)
    .leftJoin(userTable, eq(userTable.id, event.actorUserId))
    // touch.logged writes its own human-readable note in the same transaction;
    // showing both would say the same thing twice.
    .where(and(eq(event.personId, personId), ne(event.kind, "touch.logged")))
    .orderBy(desc(event.createdAt))
    .limit(limit);

  for (const e of events) {
    const payload = (e.payload ?? {}) as Record<string, unknown>;
    const campaignName = typeof payload.campaignName === "string" ? payload.campaignName : null;
    const base = EVENT_TITLES[e.kind] ?? e.kind.replace(/[._]/g, " ");
    items.push({
      id: `event-${e.id}`,
      kind: "event",
      at: e.createdAt,
      title: e.kind === "campaign.enrolled" && campaignName ? `${base}: ${campaignName}` : base,
      body: null,
      actorName: e.actorName,
      href: null,
      badge:
        e.kind === "campaign.enrolled"
          ? "Enrolled — messages queue for sending when a provider is connected"
          : null,
      preparedByAi: false,
    });
  }

  const tasks = await db
    .select({
      id: task.id,
      title: task.title,
      status: task.status,
      dueAt: task.dueAt,
      createdAt: task.createdAt,
      ownerName: userTable.fullName,
    })
    .from(task)
    .leftJoin(userTable, eq(userTable.id, task.ownerUserId))
    .where(and(eq(task.personId, personId), isNull(task.deletedAt)))
    .orderBy(desc(task.createdAt))
    .limit(limit);

  for (const t of tasks) {
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

  const stages = await db
    .select({
      id: loanStageHistory.id,
      fromStage: loanStageHistory.fromStage,
      toStage: loanStageHistory.toStage,
      createdAt: loanStageHistory.createdAt,
      changedByName: userTable.fullName,
    })
    .from(loanStageHistory)
    .innerJoin(loan, eq(loan.id, loanStageHistory.loanId))
    .leftJoin(userTable, eq(userTable.id, loanStageHistory.changedByUserId))
    .where(eq(loan.personId, personId))
    .orderBy(desc(loanStageHistory.createdAt))
    .limit(limit);

  for (const s of stages) {
    items.push({
      id: `stage-${s.id}`,
      kind: "stage",
      at: s.createdAt,
      title: s.fromStage
        ? `Stage: ${stageLabel(s.fromStage as Stage)} → ${stageLabel(s.toStage as Stage)}`
        : `Opportunity opened at ${stageLabel(s.toStage as Stage)}`,
      body: null,
      actorName: s.changedByName,
      href: null,
      badge: null,
      preparedByAi: false,
    });
  }

  return items.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, limit);
}
