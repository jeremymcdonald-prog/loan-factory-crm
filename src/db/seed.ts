/**
 * Seed — demonstration data (Phase 1 walking-skeleton item 13).
 *
 * Fake but mortgage-real: names, programs, stages, and dates that behave like a
 * working broker shop so Today, Pipeline, and the approval queue have something
 * true to say. Data-safety rule from QA_Plan: fixtures only, no real borrowers.
 * Idempotent — safe to re-run; it clears the tenant's data first.
 */
import { config } from "dotenv";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import * as schema from "./schema";
import { hashPassword } from "../lib/password";
import { PEOPLE, TASKS, APPOINTMENTS, NOTES } from "./seed-data";
import {
  PARTNERS,
  THREADS,
  INSIGHTS,
  CAMPAIGNS,
  AUTOMATIONS,
} from "./seed-modules";
import { parseTemplates } from "./import-templates";
import { STAGES, phaseOf } from "../lib/stages";

config({ path: ".env.local" });

const TENANT_ID = "0a9c8f42-1d3e-4b7a-9c21-8f6d5e4b3a20";

/** Fixed ids keep re-runs stable and make screenshots reproducible. */
const U = {
  minh: "1a000000-0000-4000-8000-000000000001",
  sarah: "1a000000-0000-4000-8000-000000000002",
  david: "1a000000-0000-4000-8000-000000000003",
  linh: "1a000000-0000-4000-8000-000000000004",
  james: "1a000000-0000-4000-8000-000000000005",
};

const TEAM_ID = "2b000000-0000-4000-8000-000000000001";

function daysFromNow(n: number): Date {
  return new Date(Date.now() + n * 86_400_000);
}

function hoursFromNow(n: number): Date {
  return new Date(Date.now() + n * 3_600_000);
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function atHourToday(hour: number, minutes = 0): Date {
  const d = new Date();
  d.setHours(hour, minutes, 0, 0);
  return d;
}

async function main() {
  const url = process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error("MIGRATION_DATABASE_URL or DATABASE_URL must be set");

  const pool = new Pool({ connectionString: url, max: 1 });
  const db = drizzle(pool, { schema });

  console.log("Seeding demonstration data…");

  // Clean slate for this tenant (children first). One statement per call:
  // node-postgres prepares each query, and a prepared statement cannot carry
  // multiple commands.
  for (const table of [
    "video_watch",
    "video",
    "ai_persona",
    "automation_run",
    "automation",
    "campaign",
    "message",
    "conversation",
    "partner_relationship",
    "partner",
    "template",
    "ai_action_log",
    "ai_insight",
    "audit_log",
    "event",
    "note",
    "task",
    "appointment",
    "loan_stage_history",
    "lead",
    "loan",
    "person",
  ]) {
    await db.execute(sql`DELETE FROM ${sql.identifier(table)} WHERE tenant_id = ${TENANT_ID}`);
  }
  await db.execute(sql`UPDATE team SET leader_user_id = NULL WHERE tenant_id = ${TENANT_ID}`);
  await db.execute(sql`DELETE FROM "user" WHERE tenant_id = ${TENANT_ID}`);
  await db.execute(sql`DELETE FROM team WHERE tenant_id = ${TENANT_ID}`);
  await db.execute(sql`DELETE FROM tenant WHERE id = ${TENANT_ID}`);

  await db.insert(schema.tenant).values({
    id: TENANT_ID,
    name: "Loan Factory",
    status: "active",
    companyNmls: "320841",
    settings: {
      defaultLanguages: ["en", "vi"],
      compensation: "lender_paid_only",
      equalHousing: true,
    },
  });

  await db.insert(schema.team).values({
    id: TEAM_ID,
    tenantId: TENANT_ID,
    name: "Bellevue Team",
    branch: "Bellevue, WA",
  });

  // Demo password. Local fixtures only — never a production credential.
  const demoHash = await hashPassword("Demo1234!");

  await db.insert(schema.user).values([
    {
      id: U.minh,
      tenantId: TENANT_ID,
      authUserId: U.minh,
      email: "minh@loanfactory.com",
      passwordHash: demoHash,
      fullName: "Minh Nguyen",
      phone: "(425) 555-0142",
      nmlsId: "1856432",
      role: "lo",
      teamId: TEAM_ID,
      language: "en",
      websiteUrl: "https://loanfactory.com/minh",
      status: "active",
    },
    {
      id: U.sarah,
      tenantId: TENANT_ID,
      authUserId: U.sarah,
      email: "sarah@loanfactory.com",
      passwordHash: demoHash,
      fullName: "Sarah Whitfield",
      phone: "(425) 555-0188",
      role: "lo_assistant",
      teamId: TEAM_ID,
      status: "active",
    },
    {
      id: U.david,
      tenantId: TENANT_ID,
      authUserId: U.david,
      email: "david@loanfactory.com",
      passwordHash: demoHash,
      fullName: "David Ortega",
      phone: "(425) 555-0193",
      role: "processor",
      teamId: TEAM_ID,
      status: "active",
    },
    {
      id: U.linh,
      tenantId: TENANT_ID,
      authUserId: U.linh,
      email: "linh@loanfactory.com",
      passwordHash: demoHash,
      fullName: "Linh Trần",
      phone: "(425) 555-0117",
      nmlsId: "1902244",
      role: "team_leader",
      teamId: TEAM_ID,
      language: "vi",
      status: "active",
    },
    {
      id: U.james,
      tenantId: TENANT_ID,
      authUserId: U.james,
      email: "admin@loanfactory.com",
      passwordHash: demoHash,
      fullName: "James Okafor",
      role: "admin",
      teamId: TEAM_ID,
      status: "active",
    },
  ]);

  await db.update(schema.team).set({ leaderUserId: U.linh }).where(sql`id = ${TEAM_ID}`);

  // --- People, opportunities, leads ----------------------------------------
  // Locked rule (Data_Model §3.5): capturing a lead creates the person, the
  // stage-1 loan, and the lead row together. There is one lifecycle state
  // machine — loan.stage — and `lead` records only how the episode began.

  const personIds = new Map<string, string>();
  const loanIds = new Map<string, string>();

  for (const p of PEOPLE) {
    const hasLoan = p.loan !== null;
    const type = !hasLoan
      ? "other"
      : p.loan!.status === "funded"
        ? "past_client"
        : STAGES.indexOf(p.loan!.stage) <= 1
          ? "lead"
          : "borrower";

    const [person] = await db
      .insert(schema.person)
      .values({
        tenantId: TENANT_ID,
        firstName: p.firstName,
        lastName: p.lastName,
        emails: [{ address: p.email, label: "personal", verified: true }],
        phones: [{ number: p.phone, label: "mobile", smsCapable: true }],
        mailingAddress: { city: p.city, state: p.state },
        preferredLanguage: p.language,
        type: type as "lead" | "borrower" | "past_client" | "other",
        ownerUserId: U.minh,
        tags: p.tags ?? null,
        source: p.loan?.lead ? { channel: p.loan.lead.channel } : undefined,
      })
      .returning({ id: schema.person.id });

    personIds.set(p.key, person.id);
    if (!p.loan) continue;

    const l = p.loan;
    const lastActivity = daysFromNow(-(l.daysSinceActivity ?? 0));
    const phase = phaseOf(l.stage);
    const stalled =
      (l.daysSinceActivity ?? 0) > (phase === "TRANSACT" ? 3 : 7) && l.status !== "funded";

    const [loanRow] = await db
      .insert(schema.loan)
      .values({
        tenantId: TENANT_ID,
        personId: person.id,
        loUserId: U.minh,
        processorUserId: phase === "TRANSACT" ? U.david : null,
        stage: l.stage,
        status: l.status ?? "active",
        purpose: l.purpose,
        program: l.program,
        amount: l.amount ? String(l.amount) : null,
        loanNumber: l.loanNumber ?? null,
        lenderName: l.lender ?? null,
        propertyAddress: l.propertyCity ? { city: l.propertyCity, state: "WA" } : undefined,
        rateLockExpiresAt:
          l.lockExpiresInDays !== undefined ? isoDate(daysFromNow(l.lockExpiresInDays)) : null,
        rateLockDate: l.lockExpiresInDays !== undefined ? isoDate(daysFromNow(-30)) : null,
        closingDate: l.closingInDays !== undefined ? isoDate(daysFromNow(l.closingInDays)) : null,
        fundedAt: l.fundedDaysAgo !== undefined ? isoDate(daysFromNow(-l.fundedDaysAgo)) : null,
        preapprovalAmount: l.preapprovalAmount ? String(l.preapprovalAmount) : null,
        preapprovalIssuedAt: l.preapprovalAmount ? isoDate(daysFromNow(-20)) : null,
        preapprovalExpiresAt:
          l.preapprovalExpiresInDays !== undefined
            ? isoDate(daysFromNow(l.preapprovalExpiresInDays))
            : null,
        disclosuresSentAt: l.stage === "disclosures" ? daysFromNow(-2) : null,
        ctcIssuedAt: l.stage === "clear_to_close" ? daysFromNow(-1) : null,
        docsNeeded: Boolean(l.docsNeeded),
        docsNeededSummary: l.docsNeeded ?? null,
        docsNeededSince:
          l.docsNeededDaysAgo !== undefined ? daysFromNow(-l.docsNeededDaysAgo) : null,
        stalledSince: stalled ? lastActivity : null,
        lostReason: l.status === "lost" ? "Chose another lender — rate shopped" : null,
        applicationLink: "https://loanfactory.com/minh/apply",
        lastActivityAt: lastActivity,
      })
      .returning({ id: schema.loan.id });

    loanIds.set(p.key, loanRow.id);

    // Stage history: the path this file walked to reach its current stage.
    const currentIndex = STAGES.indexOf(l.stage);
    const totalDays = Math.max(currentIndex * 4, 1);
    for (let i = 0; i <= currentIndex; i++) {
      await db.insert(schema.loanStageHistory).values({
        tenantId: TENANT_ID,
        loanId: loanRow.id,
        fromStage: i === 0 ? null : STAGES[i - 1],
        toStage: STAGES[i],
        changedByUserId: U.minh,
        createdAt: daysFromNow(-(totalDays - i * 4)),
      });
    }

    if (l.lead) {
      await db.insert(schema.lead).values({
        tenantId: TENANT_ID,
        personId: person.id,
        loanId: loanRow.id,
        source: { channel: l.lead.channel, campaign: l.lead.campaign },
        intent: l.lead.intent,
        assignedUserId: U.minh,
        capturedAt: hoursFromNow(-l.lead.capturedHoursAgo),
        firstResponseAt:
          l.lead.firstResponseHoursAgo !== null
            ? hoursFromNow(-l.lead.firstResponseHoursAgo)
            : null,
        statedPriceRange: l.lead.priceRange ?? null,
        statedLocation: `${p.city}, ${p.state}`,
        statedFicoRange: l.lead.ficoRange ?? null,
      });
    }
  }

  // --- Tasks ---------------------------------------------------------------
  for (const t of TASKS) {
    const personId = personIds.get(t.personKey);
    await db.insert(schema.task).values({
      tenantId: TENANT_ID,
      title: t.title,
      detail: t.detail ?? null,
      ownerUserId: U.minh,
      dueAt: daysFromNow(t.dueInDays),
      status: t.done ? "done" : "open",
      priority: t.priority ?? "normal",
      personId: personId ?? null,
      loanId: loanIds.get(t.personKey) ?? null,
      completedAt: t.done ? daysFromNow(-1) : null,
      completedByUserId: t.done ? U.minh : null,
    });
  }

  // --- Appointments --------------------------------------------------------
  for (const a of APPOINTMENTS) {
    await db.insert(schema.appointment).values({
      tenantId: TENANT_ID,
      title: a.title,
      kind: a.kind,
      startsAt: atHourToday(a.atHour, a.minutes ?? 0),
      endsAt: atHourToday(a.atHour + 1, a.minutes ?? 0),
      location: a.location ?? null,
      ownerUserId: U.minh,
      personId: personIds.get(a.personKey) ?? null,
      loanId: loanIds.get(a.personKey) ?? null,
    });
  }

  // --- Notes ---------------------------------------------------------------
  for (const n of NOTES) {
    await db.insert(schema.note).values({
      tenantId: TENANT_ID,
      body: n.body,
      authorUserId: U.minh,
      personId: personIds.get(n.personKey) ?? null,
      loanId: loanIds.get(n.personKey) ?? null,
      createdAt: daysFromNow(-n.daysAgo),
    });
  }

  // --- Template library (imported from the committed source assets) --------
  const parsed = parseTemplates(process.cwd());
  const templateIds = new Map<string, string>();

  for (const t of parsed) {
    const [row] = await db
      .insert(schema.template)
      .values({
        tenantId: TENANT_ID,
        ref: t.ref,
        name: t.name,
        category: t.category,
        channel: "email",
        subject: t.subject,
        body: t.body,
        policy: t.policy,
        stage: t.stage,
        languageCode: "en",
        mergeFields: t.mergeFields.length ? t.mergeFields : null,
        complianceNotes: t.complianceNotes,
      })
      .returning({ id: schema.template.id });
    templateIds.set(t.ref, row.id);
  }

  // --- Partners ------------------------------------------------------------
  const partnerIds = new Map<string, string>();

  for (const p of PARTNERS) {
    const [row] = await db
      .insert(schema.partner)
      .values({
        tenantId: TENANT_ID,
        firstName: p.firstName,
        lastName: p.lastName,
        company: p.company,
        kind: p.kind,
        tier: p.tier,
        emails: [{ address: p.email, label: "work" }],
        phones: [{ number: p.phone, label: "mobile", smsCapable: true }],
        ownerUserId: U.minh,
        lastTouchAt: daysFromNow(-p.lastTouchDaysAgo),
        notesSummary: p.notesSummary,
      })
      .returning({ id: schema.partner.id });

    partnerIds.set(p.key, row.id);

    for (const personKey of p.referred) {
      const personId = personIds.get(personKey);
      if (!personId) continue;
      await db.insert(schema.partnerRelationship).values({
        tenantId: TENANT_ID,
        partnerId: row.id,
        personId,
        loanId: loanIds.get(personKey) ?? null,
        role: "referred",
      });
    }
  }

  // --- Conversations -------------------------------------------------------
  for (const thread of THREADS) {
    const newest = Math.min(...thread.messages.map((m) => m.hoursAgo));
    const lastMessage = thread.messages.reduce((a, b) => (a.hoursAgo < b.hoursAgo ? a : b));

    const [conv] = await db
      .insert(schema.conversation)
      .values({
        tenantId: TENANT_ID,
        subject: thread.subject,
        channel: thread.channel,
        personId: thread.personKey ? (personIds.get(thread.personKey) ?? null) : null,
        partnerId: thread.partnerKey ? (partnerIds.get(thread.partnerKey) ?? null) : null,
        loanId: thread.personKey ? (loanIds.get(thread.personKey) ?? null) : null,
        ownerUserId: U.minh,
        lastMessageAt: hoursFromNow(-newest),
        awaitingReply: lastMessage.direction === "inbound",
      })
      .returning({ id: schema.conversation.id });

    for (const m of thread.messages) {
      await db.insert(schema.message).values({
        tenantId: TENANT_ID,
        conversationId: conv.id,
        channel: thread.channel,
        direction: m.direction,
        status: m.status ?? (m.direction === "inbound" ? "received" : "sent"),
        subject: thread.channel === "email" ? thread.subject : null,
        body: m.body,
        preparedByAi: m.preparedByAi ?? false,
        templateRef: m.templateRef ?? null,
        authorUserId: m.direction === "outbound" ? U.minh : null,
        sentAt: m.direction === "outbound" ? hoursFromNow(-m.hoursAgo) : null,
        occurredAt: hoursFromNow(-m.hoursAgo),
        meta: m.meta ?? {},
      });
    }
  }

  // --- AI's pending drafts ----------------------------------------------
  for (const insight of INSIGHTS) {
    const personId = personIds.get(insight.personKey);
    if (!personId) continue;

    const [row] = await db
      .insert(schema.aiInsight)
      .values({
        tenantId: TENANT_ID,
        kind: insight.kind,
        status: "pending",
        // Borrower-facing drafts cap at T2: prepared, never sent, until a human approves.
        tier: insight.kind === "next_best_action" ? "t1" : "t2",
        forUserId: U.minh,
        personId,
        loanId: loanIds.get(insight.personKey) ?? null,
        title: insight.title,
        body: insight.body,
        rationale: insight.rationale,
        factors: insight.factors,
        templateRef: insight.templateRef ?? null,
        languageCode: insight.language ?? "en",
      })
      .returning({ id: schema.aiInsight.id });

    // Every model call is logged, including the one that produced this draft.
    await db.insert(schema.aiActionLog).values({
      tenantId: TENANT_ID,
      insightId: row.id,
      action: "insight.generated",
      model: "mock-ai-v1",
      promptVersion: "seed",
      detail: { kind: insight.kind, mode: "seeded fixture" },
    });
  }

  // --- Campaigns -----------------------------------------------------------
  for (const c of CAMPAIGNS) {
    await db.insert(schema.campaign).values({
      tenantId: TENANT_ID,
      name: c.name,
      status: c.status,
      templateId: templateIds.get(c.templateRef) ?? null,
      audience: c.audience,
      audienceSize: c.audienceSize,
      scheduledFor: c.scheduledInDays !== undefined ? daysFromNow(c.scheduledInDays) : null,
      ownerUserId: U.minh,
      sentCount: c.sentCount ?? 0,
      openCount: c.openCount ?? 0,
      replyCount: c.replyCount ?? 0,
    });
  }

  // --- Automations ---------------------------------------------------------
  for (const a of AUTOMATIONS) {
    const [row] = await db
      .insert(schema.automation)
      .values({
        tenantId: TENANT_ID,
        ref: a.ref,
        name: a.name,
        description: a.description,
        triggerText: a.triggerText,
        audienceText: a.audienceText,
        actionText: a.actionText,
        tier: a.tier,
        status: a.status,
        templateId: a.templateRef ? (templateIds.get(a.templateRef) ?? null) : null,
        runCount: a.runCount,
        lastRunAt: a.lastRunDaysAgo !== undefined ? daysFromNow(-a.lastRunDaysAgo) : null,
      })
      .returning({ id: schema.automation.id });

    for (const run of a.runs) {
      await db.insert(schema.automationRun).values({
        tenantId: TENANT_ID,
        automationId: row.id,
        personId: personIds.get(run.personKey) ?? null,
        loanId: loanIds.get(run.personKey) ?? null,
        status: run.status,
        outcome: run.outcome,
        stoppedReason: run.stoppedReason ?? null,
        createdAt: daysFromNow(-run.daysAgo),
      });
    }
  }

  // --- How-to video library ------------------------------------------------
  // Seeded placeholders: none has a real recording yet, so url stays null and
  // the UI labels every one "Video coming soon" — never a fake player.
  const VIDEO_SEED: {
    title: string;
    category: string;
    description: string;
    minutes: number;
    featured?: boolean;
    published?: boolean;
  }[] = [
    { title: "Your first day in Loan Factory CRM", category: "Getting Started", description: "Sign in, find your way around the ten sections, and run your day from Today.", minutes: 6, featured: true },
    { title: "Reading the Today queue", category: "Today", description: "How the queue ranks deadlines, new leads, approvals, and overdue work — and what to do first.", minutes: 4, featured: true },
    { title: "Working the pipeline board", category: "Pipeline", description: "The five phases, moving a file to its next stage, and what the urgency colors mean.", minutes: 5 },
    { title: "Adding people and opening opportunities", category: "People", description: "Contacts versus leads, and how capturing a lead opens a stage-1 opportunity.", minutes: 4 },
    { title: "Logging a touch", category: "People", description: "Why the log-a-touch button is the most important habit in the CRM.", minutes: 3 },
    { title: "Keeping referral partners warm", category: "Partners", description: "Tiers, quiet-partner flags, and logging partner check-ins.", minutes: 4 },
    { title: "The unified inbox", category: "Conversations", description: "Email, text, and call history in one place — and what 'Waiting on you' means.", minutes: 4 },
    { title: "Running a compliant campaign", category: "Marketing", description: "Pick a template, choose an audience, and understand the compliance warnings.", minutes: 6 },
    { title: "The template library", category: "Marketing", description: "135 mortgage templates, what the policy badges mean, and when AI may prepare one.", minutes: 5 },
    { title: "Automations in plain language", category: "Automations", description: "WHEN, WHO, THEN — and why rate locks are never automated.", minutes: 5, featured: true },
    { title: "Reading your numbers", category: "Intelligence", description: "Speed-to-lead, follow-up completion, and files that have gone quiet.", minutes: 5 },
    { title: "Team workload at a glance", category: "Team", description: "Who is carrying what, and how view-as works for leaders.", minutes: 3 },
    { title: "Setting up your profile and signature", category: "Settings", description: "Photo, signature, sender details, and notification preferences.", minutes: 4 },
    { title: "Meet your AI assistant", category: "AI Assistant", description: "What the assistant can read, what it prepares, and why a human always approves.", minutes: 5, featured: true },
    { title: "Set up your custom AI persona", category: "Custom AI Persona", description: "Upload a document that teaches the assistant your voice — and what it will never override.", minutes: 6 },
    { title: "Approving AI drafts", category: "AI Assistant", description: "The approval queue: read the draft, check the evidence, approve or skip.", minutes: 4 },
  ];

  let sort = 0;
  for (const v of VIDEO_SEED) {
    await db.insert(schema.video).values({
      tenantId: TENANT_ID,
      title: v.title,
      description: v.description,
      category: v.category,
      durationSeconds: v.minutes * 60,
      url: null,
      featured: v.featured ?? false,
      published: v.published ?? true,
      sortOrder: sort++,
      createdByUserId: U.james,
    });
  }

  const policyCounts = parsed.reduce<Record<string, number>>((acc, t) => {
    acc[t.policy] = (acc[t.policy] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`  tenant:        Loan Factory (NMLS 320841)`);
  console.log(`  users:         5 across 5 roles`);
  console.log(`  people:        ${personIds.size}`);
  console.log(`  opportunities: ${loanIds.size} across the 20 stages`);
  console.log(
    `  tasks:         ${TASKS.length}   appointments: ${APPOINTMENTS.length}   notes: ${NOTES.length}`,
  );
  console.log(`  partners:      ${partnerIds.size}`);
  console.log(`  conversations: ${THREADS.length}`);
  console.log(`  AI drafts:   ${INSIGHTS.length} pending approval`);
  console.log(`  campaigns:     ${CAMPAIGNS.length}   automations: ${AUTOMATIONS.length}`);
  console.log(
    `  templates:     ${parsed.length} imported from source_assets ` +
      `(${policyCounts.fully_automated ?? 0} fully automated, ` +
      `${policyCounts.semi_automated ?? 0} semi, ` +
      `${policyCounts.manual_only ?? 0} manual only, ` +
      `${policyCounts.never_automate ?? 0} never automate)`,
  );
  console.log("");
  console.log("Sign in with:  minh@loanfactory.com  /  Demo1234!");

  await pool.end();
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
