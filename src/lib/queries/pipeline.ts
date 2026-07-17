/**
 * Pipeline queries.
 *
 * The board and the table are two projections of one dataset — never two
 * sources of truth (Screen_Specifications, Screen 7).
 */
import "server-only";
import { and, eq, isNull, desc, sql, ne } from "drizzle-orm";
import type { Db } from "@/db";
import { loan, person, lead, user } from "@/db/schema";
import { seesWholeBook } from "@/lib/roles";
import type { CurrentUser } from "@/lib/auth";
import type { Stage } from "@/lib/stages";

export type PipelineCard = {
  loanId: string;
  personId: string;
  firstName: string;
  lastName: string;
  preferredLanguage: string;
  stage: Stage;
  loanStatus: string;
  purpose: string | null;
  program: string | null;
  amount: string | null;
  preapprovalAmount: string | null;
  loanNumber: string | null;
  rateLockExpiresAt: string | null;
  closingDate: string | null;
  docsNeeded: boolean;
  docsNeededSince: Date | null;
  preapprovalExpiresAt: string | null;
  lastActivityAt: Date;
  capturedAt: Date | null;
  firstResponseAt: Date | null;
  ownerName: string | null;
};

function bookScope(u: CurrentUser) {
  return seesWholeBook(u.role) ? undefined : eq(loan.loUserId, u.userId);
}

/**
 * Every active opportunity, one row per loan. Lost files are excluded by
 * default: the board is the work in front of you, not the archive.
 */
export async function listPipeline(
  db: Db,
  currentUser: CurrentUser,
  options: { includeClosed?: boolean } = {},
): Promise<PipelineCard[]> {
  const conditions = [isNull(loan.deletedAt), bookScope(currentUser)].filter(Boolean);

  if (!options.includeClosed) {
    conditions.push(ne(loan.status, "lost"));
    conditions.push(ne(loan.status, "withdrawn"));
    conditions.push(ne(loan.status, "denied"));
  }

  const rows = await db
    .select({
      loanId: loan.id,
      personId: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      preferredLanguage: person.preferredLanguage,
      stage: loan.stage,
      loanStatus: loan.status,
      purpose: loan.purpose,
      program: loan.program,
      amount: loan.amount,
      preapprovalAmount: loan.preapprovalAmount,
      loanNumber: loan.loanNumber,
      rateLockExpiresAt: loan.rateLockExpiresAt,
      closingDate: loan.closingDate,
      docsNeeded: loan.docsNeeded,
      docsNeededSince: loan.docsNeededSince,
      preapprovalExpiresAt: loan.preapprovalExpiresAt,
      lastActivityAt: loan.lastActivityAt,
      capturedAt: lead.capturedAt,
      firstResponseAt: lead.firstResponseAt,
      ownerName: user.fullName,
    })
    .from(loan)
    .innerJoin(person, eq(person.id, loan.personId))
    .leftJoin(lead, eq(lead.loanId, loan.id))
    .leftJoin(user, eq(user.id, loan.loUserId))
    .where(and(...conditions))
    .orderBy(desc(loan.lastActivityAt))
    .limit(500);

  return rows as PipelineCard[];
}

export type PipelineTotals = {
  activeCount: number;
  activeVolume: number;
  fundedMtdCount: number;
  fundedMtdVolume: number;
  closingNext7: number;
};

/** The numbers on the board header. Computed in SQL, not in the page. */
export async function pipelineTotals(
  db: Db,
  currentUser: CurrentUser,
): Promise<PipelineTotals> {
  const scope = bookScope(currentUser);

  const [row] = await db
    .select({
      activeCount: sql<number>`count(*) FILTER (WHERE ${loan.status} = 'active')::int`,
      activeVolume: sql<number>`COALESCE(sum(${loan.amount}) FILTER (WHERE ${loan.status} = 'active'), 0)::float`,
      fundedMtdCount: sql<number>`count(*) FILTER (
        WHERE ${loan.status} = 'funded'
          AND ${loan.fundedAt} >= date_trunc('month', current_date)
      )::int`,
      fundedMtdVolume: sql<number>`COALESCE(sum(${loan.amount}) FILTER (
        WHERE ${loan.status} = 'funded'
          AND ${loan.fundedAt} >= date_trunc('month', current_date)
      ), 0)::float`,
      closingNext7: sql<number>`count(*) FILTER (
        WHERE ${loan.status} = 'active'
          AND ${loan.closingDate} BETWEEN current_date AND current_date + 7
      )::int`,
    })
    .from(loan)
    .where(and(isNull(loan.deletedAt), scope));

  return (
    row ?? {
      activeCount: 0,
      activeVolume: 0,
      fundedMtdCount: 0,
      fundedMtdVolume: 0,
      closingNext7: 0,
    }
  );
}
