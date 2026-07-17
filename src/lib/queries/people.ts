/**
 * People queries — the People module's read layer.
 *
 * Every query here runs inside the caller's tenant context via queryAs(), so
 * RLS scopes the rows. Role visibility (an LO sees their own book, a leader
 * sees the team's) is applied on top.
 */
import "server-only";
import { and, or, eq, ilike, isNull, desc, sql, inArray } from "drizzle-orm";
import type { Db } from "@/db";
import { person, loan, lead } from "@/db/schema";
import { seesWholeBook } from "@/lib/roles";
import type { CurrentUser } from "@/lib/auth";
import type { Stage } from "@/lib/stages";

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
