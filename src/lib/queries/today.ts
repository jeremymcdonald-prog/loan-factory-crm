/**
 * Today's work queue — Screen 1.
 *
 * A single ranked list, not tabs and not widgets. Every item belongs to exactly
 * one of the ten priority classes; class rank breaks ties, and within a class
 * items sort by deadline proximity then loan amount.
 *
 * Phase 1 feeds classes 1, 2, 4, 5 and 6 (deadline blockers from team-entered
 * lock/closing dates, speed-to-lead, AI approvals, overdue tasks, and today's
 * appointments), plus 8 (stalled files) which the stall sweep already supports.
 * The queue architecture ships complete; later phases only add signal sources.
 */
import "server-only";
import { and, eq, isNull, lte, gte, desc, asc, sql } from "drizzle-orm";
import type { Db } from "@/db";
import {
  loan,
  person,
  lead,
  task,
  appointment,
  aiInsight,
  event,
  user as userTable,
} from "@/db/schema";
import { seesWholeBook } from "@/lib/roles";
import type { CurrentUser } from "@/lib/auth";
import { phaseOf, stallDays, type Stage } from "@/lib/stages";
import { countdown } from "@/lib/format";
import { CLASS_RANK, type QueueItem, type PriorityClass } from "@/lib/queue-types";

function bookScope(u: CurrentUser) {
  return seesWholeBook(u.role) ? undefined : eq(loan.loUserId, u.userId);
}

export type { QueueItem, PriorityClass };

export async function buildQueue(
  db: Db,
  currentUser: CurrentUser,
  now = new Date(),
): Promise<QueueItem[]> {
  const items: QueueItem[] = [];
  const mine = !seesWholeBook(currentUser.role);

  // --- Class 1: deadline blockers (locks and closings) ---------------------
  const deadlineRows = await db
    .select({
      loanId: loan.id,
      personId: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      amount: loan.amount,
      lockExpires: loan.rateLockExpiresAt,
      closingDate: loan.closingDate,
      stage: loan.stage,
    })
    .from(loan)
    .innerJoin(person, eq(person.id, loan.personId))
    .where(and(eq(loan.status, "active"), isNull(loan.deletedAt), bookScope(currentUser)));

  for (const row of deadlineRows) {
    const name = `${row.firstName} ${row.lastName}`;
    const lock = countdown(row.lockExpires ? `${row.lockExpires}T17:00:00` : null, now);
    const closing = countdown(row.closingDate ? `${row.closingDate}T12:00:00` : null, now);

    if (lock && lock.hours <= 24 * 7) {
      items.push({
        id: `lock-${row.loanId}`,
        cls: "deadline",
        urgency: lock.hours <= 72 ? "critical" : "warning",
        headline: lock.overdue
          ? `${name} — the rate lock has expired`
          : `${name} — rate lock expires in ${lock.label}`,
        detail: "Rate locks are never automated. This one needs you personally.",
        personId: row.personId,
        personName: name,
        loanId: row.loanId,
        href: `/opportunities/${row.loanId}`,
        actionLabel: "Open the file",
        hours: lock.hours,
        amount: Number(row.amount ?? 0),
      });
    } else if (closing && !closing.overdue && closing.hours <= 24 * 5) {
      items.push({
        id: `closing-${row.loanId}`,
        cls: "deadline",
        urgency: "critical",
        headline: `${name} — closing in ${closing.label}`,
        detail: "Confirm they know the time, the place, and what to bring.",
        personId: row.personId,
        personName: name,
        loanId: row.loanId,
        href: `/opportunities/${row.loanId}`,
        actionLabel: "Open the file",
        hours: closing.hours,
        amount: Number(row.amount ?? 0),
      });
    }
  }

  // --- Class 2: new leads (speed-to-lead) ---------------------------------
  const leadRows = await db
    .select({
      loanId: loan.id,
      personId: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      capturedAt: lead.capturedAt,
      channel: sql<string | null>`${lead.source}->>'channel'`,
      campaign: sql<string | null>`${lead.source}->>'campaign'`,
    })
    .from(lead)
    .innerJoin(loan, eq(loan.id, lead.loanId))
    .innerJoin(person, eq(person.id, lead.personId))
    .where(
      and(
        isNull(lead.firstResponseAt),
        eq(loan.status, "active"),
        isNull(loan.deletedAt),
        bookScope(currentUser),
      ),
    );

  for (const row of leadRows) {
    const name = `${row.firstName} ${row.lastName}`;
    const mins = (now.getTime() - row.capturedAt.getTime()) / 60_000;
    const c = countdown(row.capturedAt, now);
    items.push({
      id: `lead-${row.loanId}`,
      cls: "new_lead",
      urgency: mins >= 60 ? "critical" : mins >= 5 ? "warning" : "info",
      headline: `New lead: ${name} — waiting ${c?.label ?? `${Math.round(mins)}m`}`,
      detail: [SOURCE_LABELS[row.channel ?? ""] ?? row.channel, row.campaign]
        .filter(Boolean)
        .join(" · ") || null,
      personId: row.personId,
      personName: name,
      loanId: row.loanId,
      href: `/people/${row.personId}`,
      actionLabel: "Call now",
      hours: -mins / 60,
      amount: 0,
    });
  }

  // --- Class 4: AI approvals --------------------------------------------
  const insightRows = await db
    .select({
      id: aiInsight.id,
      kind: aiInsight.kind,
      title: aiInsight.title,
      body: aiInsight.body,
      rationale: aiInsight.rationale,
      factors: aiInsight.factors,
      templateRef: aiInsight.templateRef,
      language: aiInsight.languageCode,
      personId: aiInsight.personId,
      loanId: aiInsight.loanId,
      firstName: person.firstName,
      lastName: person.lastName,
      createdAt: aiInsight.createdAt,
    })
    .from(aiInsight)
    .leftJoin(person, eq(person.id, aiInsight.personId))
    .where(
      and(
        eq(aiInsight.status, "pending"),
        mine ? eq(aiInsight.forUserId, currentUser.userId) : undefined,
      ),
    )
    .orderBy(desc(aiInsight.createdAt));

  for (const row of insightRows) {
    const name = row.firstName ? `${row.firstName} ${row.lastName}` : null;
    const isDraft = row.kind === "draft_email" || row.kind === "draft_sms";
    items.push({
      id: `insight-${row.id}`,
      cls: "ai_approval",
      urgency: "ai",
      headline: row.title,
      detail: null,
      personId: row.personId,
      personName: name,
      loanId: row.loanId,
      href: row.personId ? `/people/${row.personId}` : "/today",
      actionLabel: isDraft ? "Approve & send" : "Do it",
      hours: (row.createdAt.getTime() - now.getTime()) / 3_600_000,
      amount: 0,
      insight: {
        id: row.id,
        body: row.body,
        rationale: row.rationale,
        factors: row.factors ?? [],
        templateRef: row.templateRef,
        language: row.language,
        kind: row.kind,
      },
    });
  }

  // --- Class 5: overdue tasks ---------------------------------------------
  const taskRows = await db
    .select({
      id: task.id,
      title: task.title,
      detail: task.detail,
      dueAt: task.dueAt,
      personId: task.personId,
      loanId: task.loanId,
      firstName: person.firstName,
      lastName: person.lastName,
    })
    .from(task)
    .leftJoin(person, eq(person.id, task.personId))
    .where(
      and(
        eq(task.status, "open"),
        isNull(task.deletedAt),
        lte(task.dueAt, now),
        mine ? eq(task.ownerUserId, currentUser.userId) : undefined,
      ),
    )
    .orderBy(asc(task.dueAt));

  for (const row of taskRows) {
    const c = countdown(row.dueAt, now);
    items.push({
      id: `task-${row.id}`,
      cls: "overdue_task",
      urgency: "warning",
      headline: row.title,
      detail: row.detail ?? (row.firstName ? `${row.firstName} ${row.lastName}` : null),
      personId: row.personId,
      personName: row.firstName ? `${row.firstName} ${row.lastName}` : null,
      loanId: row.loanId,
      href: row.personId ? `/people/${row.personId}` : "/today",
      actionLabel: "Mark done",
      hours: c?.hours ?? 0,
      amount: 0,
    });
  }

  // --- Class 6: today's appointments --------------------------------------
  const dayEnd = new Date(now);
  dayEnd.setHours(23, 59, 59, 999);

  const apptRows = await db
    .select({
      id: appointment.id,
      title: appointment.title,
      kind: appointment.kind,
      startsAt: appointment.startsAt,
      location: appointment.location,
      personId: appointment.personId,
      loanId: appointment.loanId,
      firstName: person.firstName,
      lastName: person.lastName,
    })
    .from(appointment)
    .leftJoin(person, eq(person.id, appointment.personId))
    .where(
      and(
        gte(appointment.startsAt, now),
        lte(appointment.startsAt, dayEnd),
        isNull(appointment.deletedAt),
        mine ? eq(appointment.ownerUserId, currentUser.userId) : undefined,
      ),
    )
    .orderBy(asc(appointment.startsAt));

  for (const row of apptRows) {
    const time = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(row.startsAt);
    items.push({
      id: `appt-${row.id}`,
      cls: "appointment",
      urgency: "info",
      headline: `${time} — ${row.title}`,
      detail: [row.firstName ? `${row.firstName} ${row.lastName}` : null, row.location]
        .filter(Boolean)
        .join(" · ") || null,
      personId: row.personId,
      personName: row.firstName ? `${row.firstName} ${row.lastName}` : null,
      loanId: row.loanId,
      href: row.personId ? `/people/${row.personId}` : "/today",
      actionLabel: "Open",
      hours: (row.startsAt.getTime() - now.getTime()) / 3_600_000,
      amount: 0,
    });
  }

  // --- Class 8: stalled files ---------------------------------------------
  const stalledRows = await db
    .select({
      loanId: loan.id,
      personId: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      stage: loan.stage,
      amount: loan.amount,
      lastActivityAt: loan.lastActivityAt,
    })
    .from(loan)
    .innerJoin(person, eq(person.id, loan.personId))
    .where(and(eq(loan.status, "active"), isNull(loan.deletedAt), bookScope(currentUser)));

  for (const row of stalledRows) {
    const idleDays = (now.getTime() - row.lastActivityAt.getTime()) / 86_400_000;
    const threshold = stallDays(phaseOf(row.stage as Stage));
    if (idleDays < threshold) continue;
    // Don't double-report a file that's already in the queue for a deadline.
    if (items.some((i) => i.loanId === row.loanId && i.cls === "deadline")) continue;

    const name = `${row.firstName} ${row.lastName}`;
    items.push({
      id: `stall-${row.loanId}`,
      cls: "stalled",
      urgency: "warning",
      headline: `${name} — no movement for ${Math.round(idleDays)} days`,
      detail: "Nothing has happened on this file since then.",
      personId: row.personId,
      personName: name,
      loanId: row.loanId,
      href: `/opportunities/${row.loanId}`,
      actionLabel: "Open the file",
      hours: -idleDays * 24,
      amount: Number(row.amount ?? 0),
    });
  }

  // Rank: class first, then deadline proximity, then loan size.
  items.sort((a, b) => {
    const rank = CLASS_RANK[a.cls] - CLASS_RANK[b.cls];
    if (rank !== 0) return rank;
    if (a.hours !== b.hours) return a.hours - b.hours;
    return b.amount - a.amount;
  });

  return items;
}

const SOURCE_LABELS: Record<string, string> = {
  facebook_ads: "Facebook ad",
  lf_website: "Loan Factory website",
  qm_pricer: "QM Pricer rate alert",
  partner_referral: "Partner referral",
  manual: "Added by hand",
  csv_import: "Imported",
};

/** The four numbers on Today (Screen 1 StatRow). */
export async function todayStats(db: Db, currentUser: CurrentUser) {
  const scope = bookScope(currentUser);
  const [row] = await db
    .select({
      activeCount: sql<number>`count(*) FILTER (WHERE ${loan.status} = 'active')::int`,
      fundedMtdVolume: sql<number>`COALESCE(sum(${loan.amount}) FILTER (
        WHERE ${loan.status} = 'funded' AND ${loan.fundedAt} >= date_trunc('month', current_date)
      ), 0)::float`,
      closingNext7: sql<number>`count(*) FILTER (
        WHERE ${loan.status} = 'active'
          AND ${loan.closingDate} BETWEEN current_date AND current_date + 7
      )::int`,
    })
    .from(loan)
    .where(and(isNull(loan.deletedAt), scope));

  const [leads] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(lead)
    .innerJoin(loan, eq(loan.id, lead.loanId))
    .where(
      and(
        gte(lead.capturedAt, sql`current_date - 7`),
        isNull(loan.deletedAt),
        bookScope(currentUser),
      ),
    );

  return {
    activeCount: row?.activeCount ?? 0,
    fundedMtdVolume: row?.fundedMtdVolume ?? 0,
    closingNext7: row?.closingNext7 ?? 0,
    leadsThisWeek: leads?.value ?? 0,
  };
}

/** Recent activity — what happened since the user last looked. */
export async function recentActivity(db: Db, currentUser: CurrentUser, limit = 8) {
  return db
    .select({
      id: event.id,
      kind: event.kind,
      createdAt: event.createdAt,
      personId: event.personId,
      firstName: person.firstName,
      lastName: person.lastName,
      actorName: userTable.fullName,
      payload: event.payload,
    })
    .from(event)
    .leftJoin(person, eq(person.id, event.personId))
    .leftJoin(userTable, eq(userTable.id, event.actorUserId))
    .orderBy(desc(event.createdAt))
    .limit(limit);
}
