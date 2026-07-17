/**
 * Conversations queries — the unified inbox's read layer.
 *
 * One thread is one relationship on one channel. The person or partner it is
 * with lives in their own table, so every read joins both and resolves who the
 * thread is actually with (Data_Model §3, `conversation.person_id` /
 * `conversation.partner_id` are mutually exclusive in practice).
 *
 * Every query runs inside the caller's tenant context via queryAs(), so RLS
 * scopes the rows. Role visibility (an LO sees their own threads, a leader sees
 * the team's) is applied on top.
 */
import "server-only";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import type { Db } from "@/db";
import {
  conversation,
  message,
  person,
  partner,
  user as userTable,
  type EmailEntry,
  type PhoneEntry,
} from "@/db/schema";
import { seesWholeBook } from "@/lib/roles";
import type { CurrentUser } from "@/lib/auth";

export type Channel = "email" | "sms" | "call" | "note";
export type Direction = "inbound" | "outbound";
export type MessageStatus =
  | "received"
  | "draft"
  | "awaiting_approval"
  | "approved"
  | "sent"
  | "failed";

export const THREAD_FILTERS = ["all", "waiting", "email", "sms", "call"] as const;
export type ThreadFilter = (typeof THREAD_FILTERS)[number];

export function isThreadFilter(value: string): value is ThreadFilter {
  return (THREAD_FILTERS as readonly string[]).includes(value);
}

/** Who a thread is with. A person and a partner are the same shape to the UI. */
export type Counterparty = {
  kind: "person" | "partner" | "unknown";
  id: string | null;
  name: string;
  company: string | null;
  language: string;
  emails: EmailEntry[];
  phones: PhoneEntry[];
  doNotContact: boolean;
  /** The record this thread belongs to, when we know it. */
  href: string | null;
};

export type ThreadListRow = {
  id: string;
  subject: string | null;
  channel: Channel;
  awaitingReply: boolean;
  lastMessageAt: Date;
  with: Counterparty;
  /** The newest message in the thread — what the row previews. */
  previewBody: string | null;
  previewDirection: Direction | null;
  previewStatus: MessageStatus | null;
};

/** Restrict to the user's own threads unless their role sees wider. */
function bookScope(user: CurrentUser) {
  return seesWholeBook(user.role) ? undefined : eq(conversation.ownerUserId, user.userId);
}

/**
 * The newest message in a thread, one column at a time.
 *
 * `column` is a literal from this module — never user input — so `sql.raw` is
 * closed over a fixed set. The lookup rides `message_tenant_conversation_idx`
 * and stays inside RLS like every other read.
 */
function newestMessage<T>(column: "body" | "direction" | "status") {
  return sql<T>`(
    SELECT m.${sql.raw(column)}
      FROM message m
     WHERE m.conversation_id = ${conversation.id}
     ORDER BY m.occurred_at DESC
     LIMIT 1
  )`;
}

/** The person/partner columns every read needs to resolve a counterparty. */
const COUNTERPARTY_COLUMNS = {
  personId: conversation.personId,
  partnerId: conversation.partnerId,
  personFirstName: person.firstName,
  personLastName: person.lastName,
  personLanguage: person.preferredLanguage,
  personEmails: person.emails,
  personPhones: person.phones,
  personDoNotContact: person.doNotContact,
  partnerFirstName: partner.firstName,
  partnerLastName: partner.lastName,
  partnerCompany: partner.company,
  partnerLanguage: partner.preferredLanguage,
  partnerEmails: partner.emails,
  partnerPhones: partner.phones,
  partnerDoNotContact: partner.doNotContact,
};

type CounterpartyRow = {
  [K in keyof typeof COUNTERPARTY_COLUMNS]: K extends "personId" | "partnerId"
    ? string | null
    : unknown;
};

function counterpartyOf(row: CounterpartyRow): Counterparty {
  if (row.personId && row.personFirstName) {
    return {
      kind: "person",
      id: row.personId,
      name: `${row.personFirstName as string} ${row.personLastName as string}`,
      company: null,
      language: (row.personLanguage as string) ?? "en",
      emails: (row.personEmails as EmailEntry[]) ?? [],
      phones: (row.personPhones as PhoneEntry[]) ?? [],
      doNotContact: Boolean(row.personDoNotContact),
      href: `/people/${row.personId}`,
    };
  }

  if (row.partnerId && row.partnerFirstName) {
    return {
      kind: "partner",
      id: row.partnerId,
      name: `${row.partnerFirstName as string} ${row.partnerLastName as string}`,
      company: (row.partnerCompany as string) ?? null,
      language: (row.partnerLanguage as string) ?? "en",
      emails: (row.partnerEmails as EmailEntry[]) ?? [],
      phones: (row.partnerPhones as PhoneEntry[]) ?? [],
      doNotContact: Boolean(row.partnerDoNotContact),
      href: `/partners/${row.partnerId}`,
    };
  }

  // A thread with no contact attached: show it, name it honestly, don't guess.
  return {
    kind: "unknown",
    id: null,
    name: "No contact on this thread",
    company: null,
    language: "en",
    emails: [],
    phones: [],
    doNotContact: false,
    href: null,
  };
}

/** Every thread the user can see, newest first. */
export async function listThreads(
  db: Db,
  user: CurrentUser,
  filter: ThreadFilter = "all",
): Promise<ThreadListRow[]> {
  const conditions = [bookScope(user)];

  if (filter === "waiting") {
    conditions.push(eq(conversation.awaitingReply, true));
  } else if (filter !== "all") {
    conditions.push(eq(conversation.channel, filter));
  }

  const rows = await db
    .select({
      id: conversation.id,
      subject: conversation.subject,
      channel: conversation.channel,
      awaitingReply: conversation.awaitingReply,
      lastMessageAt: conversation.lastMessageAt,
      previewBody: newestMessage<string | null>("body"),
      previewDirection: newestMessage<Direction | null>("direction"),
      previewStatus: newestMessage<MessageStatus | null>("status"),
      ...COUNTERPARTY_COLUMNS,
    })
    .from(conversation)
    .leftJoin(person, eq(person.id, conversation.personId))
    .leftJoin(partner, eq(partner.id, conversation.partnerId))
    .where(and(...conditions))
    .orderBy(desc(conversation.lastMessageAt))
    .limit(200);

  return rows.map((row) => ({
    id: row.id,
    subject: row.subject,
    channel: row.channel,
    awaitingReply: row.awaitingReply,
    lastMessageAt: row.lastMessageAt,
    with: counterpartyOf(row),
    previewBody: row.previewBody,
    previewDirection: row.previewDirection,
    previewStatus: row.previewStatus,
  }));
}

export type ThreadCounts = {
  all: number;
  waiting: number;
  email: number;
  sms: number;
  call: number;
};

/** The numbers on the filter tabs. Counted in SQL, not in the page. */
export async function countThreads(db: Db, user: CurrentUser): Promise<ThreadCounts> {
  const [row] = await db
    .select({
      all: sql<number>`count(*)::int`,
      waiting: sql<number>`count(*) FILTER (WHERE ${conversation.awaitingReply})::int`,
      email: sql<number>`count(*) FILTER (WHERE ${conversation.channel} = 'email')::int`,
      sms: sql<number>`count(*) FILTER (WHERE ${conversation.channel} = 'sms')::int`,
      call: sql<number>`count(*) FILTER (WHERE ${conversation.channel} = 'call')::int`,
    })
    .from(conversation)
    .where(bookScope(user));

  return row ?? { all: 0, waiting: 0, email: 0, sms: 0, call: 0 };
}

export type ThreadMessage = {
  id: string;
  channel: Channel;
  direction: Direction;
  status: MessageStatus;
  body: string;
  preparedByAlly: boolean;
  templateRef: string | null;
  authorName: string | null;
  sentAt: Date | null;
  occurredAt: Date;
  /** Call metadata: outcome and duration, when channel = call. */
  meta: Record<string, unknown> | null;
};

export type Thread = {
  id: string;
  subject: string | null;
  channel: Channel;
  awaitingReply: boolean;
  lastMessageAt: Date;
  loanId: string | null;
  with: Counterparty;
  messages: ThreadMessage[];
};

/** One thread and everything said in it, oldest first. */
export async function getThread(
  db: Db,
  user: CurrentUser,
  threadId: string,
): Promise<Thread | null> {
  const [row] = await db
    .select({
      id: conversation.id,
      subject: conversation.subject,
      channel: conversation.channel,
      awaitingReply: conversation.awaitingReply,
      lastMessageAt: conversation.lastMessageAt,
      loanId: conversation.loanId,
      ...COUNTERPARTY_COLUMNS,
    })
    .from(conversation)
    .leftJoin(person, eq(person.id, conversation.personId))
    .leftJoin(partner, eq(partner.id, conversation.partnerId))
    .where(and(eq(conversation.id, threadId), bookScope(user)))
    .limit(1);

  if (!row) return null;

  const messages = await db
    .select({
      id: message.id,
      channel: message.channel,
      direction: message.direction,
      status: message.status,
      body: message.body,
      preparedByAlly: message.preparedByAlly,
      templateRef: message.templateRef,
      authorName: userTable.fullName,
      sentAt: message.sentAt,
      occurredAt: message.occurredAt,
      meta: message.meta,
    })
    .from(message)
    .leftJoin(userTable, eq(userTable.id, message.authorUserId))
    .where(eq(message.conversationId, threadId))
    .orderBy(asc(message.occurredAt))
    .limit(200);

  return {
    id: row.id,
    subject: row.subject,
    channel: row.channel,
    awaitingReply: row.awaitingReply,
    lastMessageAt: row.lastMessageAt,
    loanId: row.loanId,
    with: counterpartyOf(row),
    messages,
  };
}
