/**
 * The mock assistant engine — the data half of the router.
 *
 * Every answer is computed inside queryAs(), so the assistant can only ever
 * read what the signed-in user is authorized to see: RLS pins the tenant, and
 * the same book-scoping the queue uses pins the role. There is no separate
 * assistant privilege.
 *
 * Drafts produced here are text in the chat, clearly labelled: nothing sends
 * from a conversation, and customer-facing messages still go through the
 * approval queue like everything else.
 */
import "server-only";
import { and, eq, isNull, lte, gte, asc, sql } from "drizzle-orm";
import type { Db } from "@/db";
import { loan, person, lead, task, user as userTable } from "@/db/schema";
import type { CurrentUser } from "@/lib/auth";
import { seesWholeBook } from "@/lib/roles";
import { buildQueue } from "@/lib/queries/today";
import { pipelineTotals, listPipeline } from "@/lib/queries/pipeline";
import { moneyCompact, shortDate, countdown } from "@/lib/format";
import { phaseOf, stageLabel, stallDays, type Stage } from "@/lib/stages";
import { PREVIEW_NOTE, type AssistantIntent } from "./router";

export type AssistantReply = {
  intent: AssistantIntent;
  /** Plain text, rendered pre-wrapped in the chat. */
  text: string;
};

export async function answerIntent(
  db: Db,
  user: CurrentUser,
  intent: AssistantIntent,
  now = new Date(),
): Promise<AssistantReply> {
  switch (intent) {
    case "focus_today":
      return { intent, text: await focusToday(db, user, now) };
    case "draft_overdue_followups":
      return { intent, text: await draftOverdueFollowups(db, user, now) };
    case "quiet_opportunities":
      return { intent, text: await quietOpportunities(db, user, now) };
    case "summarize_pipeline":
      return { intent, text: await summarizePipeline(db, user) };
    case "closing_messages":
      return { intent, text: await closingMessages(db, user) };
    case "capabilities":
      return { intent, text: capabilities() };
  }
}

function bookScope(u: CurrentUser) {
  return seesWholeBook(u.role) ? undefined : eq(loan.loUserId, u.userId);
}

/** How a lead's source reads inside a "Call X — new … lead" sentence. */
const LEAD_SOURCE_PHRASES: Record<string, string> = {
  facebook_ads: "Facebook",
  lf_website: "website",
  qm_pricer: "QM Pricer rate-alert",
  partner_referral: "partner-referral",
  csv_import: "imported",
};

async function focusToday(db: Db, user: CurrentUser, now: Date): Promise<string> {
  const items = await buildQueue(db, user, now);
  if (items.length === 0) {
    return `You're caught up — nothing needs you right now. A good use of the gap: pick one past client and check in.\n\n${PREVIEW_NOTE}`;
  }

  // New leads lead the answer, so they get a richer line than the queue
  // headline: source and wait time make the recommended action concrete.
  const waitingLeads = await db
    .select({
      firstName: person.firstName,
      lastName: person.lastName,
      capturedAt: lead.capturedAt,
      channel: sql<string | null>`${lead.source}->>'channel'`,
    })
    .from(lead)
    .innerJoin(loan, eq(loan.id, lead.loanId))
    .innerJoin(person, eq(person.id, lead.personId))
    .where(
      and(
        isNull(lead.firstResponseAt),
        eq(loan.status, "active"),
        isNull(loan.deletedAt),
        bookScope(user),
      ),
    )
    .orderBy(asc(lead.capturedAt))
    .limit(5);

  const followUps = items.filter((i) => i.cls === "overdue_task");
  const stalled = items.filter((i) => i.cls === "stalled");
  const locks = items.filter((i) => i.cls === "deadline" && i.id.startsWith("lock-"));
  const expiredLocks = locks.filter((i) => i.headline.includes("expired"));
  const upcomingLocks = locks.filter((i) => !i.headline.includes("expired"));
  const closings = items.filter((i) => i.cls === "deadline" && i.id.startsWith("closing-"));
  const approvals = items.filter((i) => i.cls === "ai_approval");

  const sections: { title: string; lines: string[] }[] = [];

  // 1. New leads needing contact — always first, always by name.
  const leadCount = items.filter((i) => i.cls === "new_lead").length;
  if (waitingLeads.length > 0) {
    sections.push({
      title: `New leads needing contact (${leadCount})`,
      lines: waitingLeads.map((w) => {
        const c = countdown(w.capturedAt, now);
        const source = LEAD_SOURCE_PHRASES[w.channel ?? ""];
        return `• Call ${w.firstName} ${w.lastName} — new ${source ? `${source} ` : ""}lead, no contact yet${c ? ` (waiting ${c.label})` : ""}`;
      }),
    });
  }

  // 2. Applications needing follow-up — the overdue work on files.
  if (followUps.length > 0) {
    sections.push({
      title: `Applications needing follow-up (${followUps.length})`,
      lines: followUps
        .slice(0, 5)
        .map(
          (t) =>
            `• ${t.personName ? `${t.personName} — ` : ""}${t.headline} (overdue)`,
        ),
    });
  }

  // 3. Loans needing attention — quiet files and locks already in trouble.
  if (stalled.length > 0 || expiredLocks.length > 0) {
    sections.push({
      title: `Loans needing attention (${stalled.length + expiredLocks.length})`,
      lines: [
        ...expiredLocks.map((l) => `• ${l.headline} — this needs you personally`),
        ...stalled.slice(0, 5).map((s) => `• ${s.headline} — a call restarts the file`),
      ],
    });
  }

  // 4. Approvals waiting — drafts never send themselves.
  if (approvals.length > 0) {
    sections.push({
      title: `Approvals waiting (${approvals.length})`,
      lines: [
        ...approvals
          .slice(0, 3)
          .map((a) => `• ${a.headline}${a.personName ? ` — ${a.personName}` : ""}`),
        `Nothing goes out until you approve it.`,
      ],
    });
  }

  // 5. Closings and expiring locks in the next 7 days.
  if (closings.length > 0 || upcomingLocks.length > 0) {
    sections.push({
      title: `Closings and expiring locks in the next 7 days (${closings.length + upcomingLocks.length})`,
      lines: [...closings, ...upcomingLocks].slice(0, 5).map((d) => `• ${d.headline}`),
    });
  }

  const out: string[] = [
    waitingLeads.length > 0
      ? `Here's your day, in priority order — new leads first:`
      : `Here's your day, in priority order:`,
  ];
  sections.forEach((s, i) => out.push("", `${i + 1}. ${s.title}`, ...s.lines));
  out.push("", PREVIEW_NOTE);
  return out.join("\n");
}

async function draftOverdueFollowups(db: Db, user: CurrentUser, now: Date): Promise<string> {
  // The user's own identity signs the drafts.
  const [me] = await db
    .select({ fullName: userTable.fullName, nmlsId: userTable.nmlsId, phone: userTable.phone })
    .from(userTable)
    .where(eq(userTable.id, user.userId))
    .limit(1);

  // Uncontacted leads first — they are the costliest thing going stale.
  const waiting = await db
    .select({
      firstName: person.firstName,
      lastName: person.lastName,
      capturedAt: lead.capturedAt,
      channel: sql<string | null>`${lead.source}->>'channel'`,
    })
    .from(lead)
    .innerJoin(loan, eq(loan.id, lead.loanId))
    .innerJoin(person, eq(person.id, lead.personId))
    .where(
      and(
        isNull(lead.firstResponseAt),
        eq(loan.status, "active"),
        isNull(loan.deletedAt),
        bookScope(user),
      ),
    )
    .orderBy(asc(lead.capturedAt))
    .limit(3);

  const overdueTasks = await db
    .select({ title: task.title, firstName: person.firstName, lastName: person.lastName })
    .from(task)
    .leftJoin(person, eq(person.id, task.personId))
    .where(
      and(
        eq(task.status, "open"),
        isNull(task.deletedAt),
        lte(task.dueAt, now),
        seesWholeBook(user.role) ? undefined : eq(task.ownerUserId, user.userId),
      ),
    )
    .orderBy(asc(task.dueAt))
    .limit(5);

  if (waiting.length === 0 && overdueTasks.length === 0) {
    return `Nothing is overdue — every lead has been contacted and no task is past due.\n\n${PREVIEW_NOTE}`;
  }

  const signature = [
    me?.fullName ?? user.fullName,
    me?.nmlsId ? `NMLS ${me.nmlsId}` : null,
    me?.phone ?? null,
    "Company NMLS 320841 · Equal Housing Opportunity",
  ]
    .filter(Boolean)
    .join("\n");

  const parts: string[] = [];

  if (waiting.length > 0) {
    parts.push(
      `${waiting.length} lead${waiting.length === 1 ? " is" : "s are"} still waiting on a first touch. Here ${waiting.length === 1 ? "is a draft" : "are drafts"} you could send:`,
    );
    for (const w of waiting) {
      parts.push(
        "",
        `--- Draft for ${w.firstName} ${w.lastName} ---`,
        `Hi ${w.firstName},`,
        "",
        `Thanks for reaching out${w.channel === "facebook_ads" ? " through our ad" : ""} — I wanted to connect personally. I help people compare mortgage options and figure out the right next step, with no pressure.`,
        "",
        `Is there a good time today or tomorrow for a quick call?`,
        "",
        signature,
      );
    }
  }

  if (overdueTasks.length > 0) {
    parts.push(
      "",
      `You also have ${overdueTasks.length} overdue task${overdueTasks.length === 1 ? "" : "s"}:`,
      ...overdueTasks.map(
        (t) => `• ${t.title}${t.firstName ? ` (${t.firstName} ${t.lastName})` : ""}`,
      ),
    );
  }

  parts.push(
    "",
    "These are drafts only — nothing has been sent, and sending always needs your approval. Copy one into the person's record, or handle it from the Today queue.",
    "",
    PREVIEW_NOTE,
  );

  return parts.join("\n");
}

async function quietOpportunities(db: Db, user: CurrentUser, now: Date): Promise<string> {
  const cards = await listPipeline(db, user);
  const quiet = cards
    .map((c) => ({
      name: `${c.firstName} ${c.lastName}`,
      stage: c.stage,
      idleDays: Math.floor((now.getTime() - c.lastActivityAt.getTime()) / 86_400_000),
    }))
    .filter(
      (c) =>
        c.idleDays >= stallDays(phaseOf(c.stage as Stage)) &&
        cards.find((x) => `${x.firstName} ${x.lastName}` === c.name)?.loanStatus === "active",
    )
    .sort((a, b) => b.idleDays - a.idleDays);

  if (quiet.length === 0) {
    return `No active file has gone quiet — everything has moved inside its stage's limit (3 days in Transact, 7 elsewhere).\n\n${PREVIEW_NOTE}`;
  }

  return [
    `${quiet.length} active file${quiet.length === 1 ? " has" : "s have"} gone quiet past the limit for their stage:`,
    "",
    ...quiet.map(
      (q) => `• ${q.name} — ${stageLabel(q.stage as Stage)}, no activity for ${q.idleDays} days`,
    ),
    "",
    `The longest-quiet file is usually the best first call. Each one is flagged in your Today queue too.`,
    "",
    PREVIEW_NOTE,
  ].join("\n");
}

async function summarizePipeline(db: Db, user: CurrentUser): Promise<string> {
  const totals = await pipelineTotals(db, user);
  const cards = await listPipeline(db, user);

  const byPhase = new Map<string, number>();
  for (const c of cards) {
    if (c.loanStatus !== "active") continue;
    const phase = phaseOf(c.stage as Stage);
    byPhase.set(phase, (byPhase.get(phase) ?? 0) + 1);
  }

  const phaseLine = ["ENGAGE", "QUALIFY", "TRANSACT", "RETAIN", "GROW"]
    .map((p) => `${p.charAt(0) + p.slice(1).toLowerCase()} ${byPhase.get(p) ?? 0}`)
    .join(" · ");

  return [
    `Your pipeline right now:`,
    "",
    `• ${totals.activeCount} active files, ${moneyCompact(totals.activeVolume)} in volume`,
    `• ${phaseLine}`,
    `• ${moneyCompact(totals.fundedMtdVolume)} funded this month (${totals.fundedMtdCount} file${totals.fundedMtdCount === 1 ? "" : "s"})`,
    `• ${totals.closingNext7} closing${totals.closingNext7 === 1 ? "" : "s"} in the next 7 days`,
    "",
    PREVIEW_NOTE,
  ].join("\n");
}

async function closingMessages(db: Db, user: CurrentUser): Promise<string> {
  const [me] = await db
    .select({ fullName: userTable.fullName, nmlsId: userTable.nmlsId, phone: userTable.phone })
    .from(userTable)
    .where(eq(userTable.id, user.userId))
    .limit(1);

  const soon = await db
    .select({
      firstName: person.firstName,
      lastName: person.lastName,
      closingDate: loan.closingDate,
    })
    .from(loan)
    .innerJoin(person, eq(person.id, loan.personId))
    .where(
      and(
        eq(loan.status, "active"),
        isNull(loan.deletedAt),
        gte(loan.closingDate, sql`current_date`),
        lte(loan.closingDate, sql`current_date + 7`),
        bookScope(user),
      ),
    )
    .orderBy(asc(loan.closingDate))
    .limit(3);

  if (soon.length === 0) {
    return `No closings are scheduled in the next 7 days.\n\n${PREVIEW_NOTE}`;
  }

  const signature = [
    me?.fullName ?? user.fullName,
    me?.nmlsId ? `NMLS ${me.nmlsId}` : null,
    me?.phone ?? null,
    "Company NMLS 320841 · Equal Housing Opportunity",
  ]
    .filter(Boolean)
    .join("\n");

  const parts: string[] = [
    `${soon.length} closing${soon.length === 1 ? "" : "s"} in the next 7 days. Draft confirmations:`,
  ];

  for (const c of soon) {
    parts.push(
      "",
      `--- Draft for ${c.firstName} ${c.lastName} (closing ${shortDate(c.closingDate)}) ---`,
      `Hi ${c.firstName},`,
      "",
      `Your closing is coming up on ${shortDate(c.closingDate)}. Bring a government photo ID, and plan a few extra minutes for signing.`,
      "",
      `If anything changes I'll call you right away. Congratulations — you're almost there.`,
      "",
      signature,
    );
  }

  parts.push(
    "",
    "Drafts only — nothing has been sent. Every customer-facing message still needs your approval.",
    "",
    PREVIEW_NOTE,
  );

  return parts.join("\n");
}

function capabilities(): string {
  return [
    "I can answer from your CRM records — the ones your role is allowed to see. Try:",
    "",
    "• What should I focus on today?",
    "• Draft a follow-up for my overdue leads",
    "• Which opportunities have gone quiet?",
    "• Summarize my pipeline",
    "• Prepare messages for today's closings",
    "",
    PREVIEW_NOTE,
  ].join("\n");
}
