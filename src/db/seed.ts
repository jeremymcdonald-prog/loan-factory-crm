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
import type { SocialLinks, BioSource } from "./schema";
import { hashPassword } from "../lib/password";
import { draftBio } from "../lib/bio/mock";
import { PEOPLE, TASKS, APPOINTMENTS, NOTES } from "./seed-data";
import {
  PARTNERS,
  THREADS,
  INSIGHTS,
  CAMPAIGNS,
  MULTISTEP_CAMPAIGNS,
  AUTOMATIONS,
  PERSONAS,
  INTEGRATION_CONNECTIONS,
  LEAD_SOURCE_MAPPINGS,
  INTEGRATION_EVENTS,
} from "./seed-modules";
import { parseTemplates } from "./import-templates";
import {
  DEMO_LOS,
  generateDemoBooks,
  generateDemoPartners,
  mulberry32,
  MULTILINGUAL_THREADS,
  MULTILINGUAL_INSIGHTS,
} from "./demo-data";
import { STAGES, phaseOf } from "../lib/stages";

config({ path: ".env.local" });

// Deterministic RNG for the seeder's own draws (stage-trail cadence, referral
// ages). Fixed seed — re-running the seed reproduces the same branch.
const seedRand = mulberry32(0x5eed1234);

/** Deterministic integer in [min, max]. */
function sInt(min: number, max: number): number {
  return Math.floor(min + seedRand() * (max - min + 1));
}

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

/**
 * Bio & online-presence demo fields for a person or partner. Draws on the
 * same mock generator the People/Partner detail screens use (src/lib/bio/mock.ts)
 * — a plausible, clearly-a-demo paragraph plus made-up-but-plausible social
 * handles, never presented as actually researched. A seeded coin flip per
 * network keeps a random subset of the suggested links (so some people
 * honestly show "Not added" for a channel, the way a real roster would).
 */
function bioFields(input: {
  firstName: string;
  lastName: string;
  company?: string | null;
  city?: string | null;
  role: string;
  language?: string;
}): { bio: string; socialLinks: SocialLinks; bioSources: BioSource[]; bioResearchedAt: Date } {
  const draft = draftBio(input);
  const keys = (Object.keys(draft.suggestedLinks) as (keyof SocialLinks)[]).filter(
    (k) => k !== "other",
  );
  const kept: SocialLinks = {};
  for (const k of keys) {
    if (seedRand() < 0.65) kept[k] = draft.suggestedLinks[k];
  }
  if (Object.keys(kept).length === 0 && keys.length > 0) {
    kept[keys[0]] = draft.suggestedLinks[keys[0]];
  }
  return {
    bio: draft.bio,
    socialLinks: kept,
    bioSources: draft.sources,
    bioResearchedAt: daysFromNow(-sInt(1, 24)),
  };
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
    "integration_event",
    "lead_source_mapping",
    "integration_connection",
    "campaign_step",
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
      defaultLanguages: ["en", "vi", "es", "ru"],
      compensation: "lender_paid_only",
      equalHousing: true,
      // Committee build: every surface labels itself as sample data.
      demoMode: true,
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

  // --- The rest of the team (Minh already exists) --------------------------
  // Built early (not down in the demo-scale section) so campaign owners,
  // automations, AI personas, and lead-source mappings can all resolve a real
  // loan officer id. Nothing here draws from seedRand(), so moving it earlier
  // doesn't shift any of the deterministic draws below.
  const loIds = new Map<string, string>([["minh", U.minh]]);
  let loSeq = 10;
  for (const lo of DEMO_LOS) {
    if (lo.key === "minh") continue;
    loSeq += 1;
    const id = `3c000000-0000-4000-8000-0000000000${loSeq}`;
    loIds.set(lo.key, id);
    await db.insert(schema.user).values({
      id,
      tenantId: TENANT_ID,
      authUserId: id,
      email: lo.email,
      passwordHash: demoHash,
      fullName: lo.fullName,
      phone: `(425) 555-0${loSeq}0`,
      nmlsId: lo.nmlsId,
      role: "lo",
      teamId: TEAM_ID,
      language: lo.language,
      status: "active",
      // Staggered recent sign-ins so the roster looks alive.
      lastLoginAt: hoursFromNow(-(loSeq * 5 - 40)),
    });
  }

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

    // Bio & online presence: every curated person who has a loan gets a
    // demo research draft (People with no opportunity, like the sphere
    // contacts, stay at "Not added" — an honest empty state too).
    const bio = hasLoan
      ? bioFields({
          firstName: p.firstName,
          lastName: p.lastName,
          city: p.city,
          role: type,
          language: p.language,
        })
      : null;

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
        ...(bio ?? {}),
      })
      .returning({ id: schema.person.id });

    personIds.set(p.key, person.id);
    if (!p.loan) continue;

    const l = p.loan;
    const lastActivity = daysFromNow(-(l.daysSinceActivity ?? 0));
    const phase = phaseOf(l.stage);
    const stalled =
      (l.daysSinceActivity ?? 0) > (phase === "LOANS" ? 3 : 7) && l.status !== "funded";

    // Full stage trail: when the file entered each stage it has walked, so
    // period-bound metrics (applications taken, preapprovals issued) see real
    // history. Funded files anchor to the funding date; active files to their
    // last activity.
    const currentIndex = STAGES.indexOf(l.stage);
    const fundedIdx = STAGES.indexOf("funded");
    const trailStep = 4;
    const entryDaysAgo: number[] = [];
    if (l.status === "funded" && l.fundedDaysAgo !== undefined) {
      // Days after funding when the post-funding stages begin.
      const postFunding = [45, 365, 500, 560];
      for (let i = 0; i <= currentIndex; i++) {
        entryDaysAgo[i] =
          i <= fundedIdx
            ? l.fundedDaysAgo + (fundedIdx - i) * trailStep
            : Math.max(1, l.fundedDaysAgo - postFunding[i - fundedIdx - 1]);
      }
    } else {
      const anchor = l.daysSinceActivity ?? 0;
      for (let i = 0; i <= currentIndex; i++) {
        entryDaysAgo[i] = anchor + (currentIndex - i) * trailStep;
      }
    }
    const openedDaysAgo = entryDaysAgo[0] + 1;

    const [loanRow] = await db
      .insert(schema.loan)
      .values({
        tenantId: TENANT_ID,
        personId: person.id,
        loUserId: U.minh,
        processorUserId: phase === "LOANS" ? U.david : null,
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
        disclosuresSentAt: l.stage === "submitted_to_processing" ? daysFromNow(-2) : null,
        ctcIssuedAt: l.stage === "clear_to_close" ? daysFromNow(-1) : null,
        docsNeeded: Boolean(l.docsNeeded),
        docsNeededSummary: l.docsNeeded ?? null,
        docsNeededSince:
          l.docsNeededDaysAgo !== undefined ? daysFromNow(-l.docsNeededDaysAgo) : null,
        stalledSince: stalled ? lastActivity : null,
        lostReason: l.status === "lost" ? "Chose another lender — rate shopped" : null,
        applicationLink: "https://loanfactory.com/minh/apply",
        lastActivityAt: lastActivity,
        // Backdated to match the file's stage age, not the seed run.
        createdAt: daysFromNow(-openedDaysAgo),
      })
      .returning({ id: schema.loan.id });

    loanIds.set(p.key, loanRow.id);

    // Stage history: the path this file walked to reach its current stage.
    for (let i = 0; i <= currentIndex; i++) {
      await db.insert(schema.loanStageHistory).values({
        tenantId: TENANT_ID,
        loanId: loanRow.id,
        fromStage: i === 0 ? null : STAGES[i - 1],
        toStage: STAGES[i],
        changedByUserId: U.minh,
        createdAt: daysFromNow(-entryDaysAgo[i]),
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
    // Every partner gets a bio draft (Requirement: "ALL partners").
    const partnerBio = bioFields({
      firstName: p.firstName,
      lastName: p.lastName,
      company: p.company,
      role: p.kind,
    });

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
        // Targets have never been touched — that's what puts them on the list.
        lastTouchAt: p.lastTouchDaysAgo === null ? null : daysFromNow(-p.lastTouchDaysAgo),
        notesSummary: p.notesSummary,
        ...partnerBio,
      })
      .returning({ id: schema.partner.id });

    partnerIds.set(p.key, row.id);

    for (const ref of p.referred) {
      const personId = personIds.get(ref.personKey);
      if (!personId) continue;
      await db.insert(schema.partnerRelationship).values({
        tenantId: TENANT_ID,
        partnerId: row.id,
        personId,
        loanId: loanIds.get(ref.personKey) ?? null,
        role: "referred",
        // When the referral actually arrived, not when the seed ran.
        createdAt: daysFromNow(-ref.daysAgo),
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
      const status = m.status ?? (m.direction === "inbound" ? "received" : "sent");
      await db.insert(schema.message).values({
        tenantId: TENANT_ID,
        conversationId: conv.id,
        channel: thread.channel,
        direction: m.direction,
        status,
        subject: thread.channel === "email" ? thread.subject : null,
        body: m.body,
        preparedByAi: m.preparedByAi ?? false,
        templateRef: m.templateRef ?? null,
        authorUserId: m.direction === "outbound" ? U.minh : null,
        // Honesty rule: only messages that actually went out carry sentAt.
        // Approved drafts carry approvedAt and a NULL sentAt.
        approvedByUserId: status === "approved" ? U.minh : null,
        approvedAt: status === "approved" ? hoursFromNow(-m.hoursAgo) : null,
        sentAt: status === "sent" ? hoursFromNow(-m.hoursAgo) : null,
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
  // Name → id map so automations can point at the campaign they enroll into.
  const campaignIdByName = new Map<string, string>();
  for (const c of CAMPAIGNS) {
    const [row] = await db
      .insert(schema.campaign)
      .values({
        tenantId: TENANT_ID,
        name: c.name,
        status: c.status,
        templateId: c.templateRef ? (templateIds.get(c.templateRef) ?? null) : null,
        language: c.language ?? "en",
        emailBody: c.emailBody ?? null,
        smsBody: c.smsBody ?? null,
        videoMeta: c.videoMeta ?? null,
        drip: c.drip ?? [],
        audience: c.audience,
        audienceSize: c.audienceSize,
        scheduledFor: c.scheduledInDays !== undefined ? daysFromNow(c.scheduledInDays) : null,
        ownerUserId: U.minh,
        sentCount: c.sentCount ?? 0,
        openCount: c.openCount ?? 0,
        replyCount: c.replyCount ?? 0,
        // Staggered so the Team leaderboard's marketing column has real
        // differences across its time windows.
        createdAt: daysFromNow(-(c.createdDaysAgo ?? 0)),
      })
      .returning({ id: schema.campaign.id });
    campaignIdByName.set(c.name, row.id);
  }

  // --- The 21 named, multi-step campaigns (M7) ------------------------------
  // Owners vary across the ten loan officers; each carries a real
  // `campaign_step` sequence — the model the product now reads instead of the
  // flat `drip` jsonb (campaign_step's own doc comment covers why `drip`
  // stays untouched on the campaigns above).
  for (const c of MULTISTEP_CAMPAIGNS) {
    const ownerUserId = loIds.get(c.ownerKey ?? "minh") ?? U.minh;
    const [row] = await db
      .insert(schema.campaign)
      .values({
        tenantId: TENANT_ID,
        name: c.name,
        status: c.status,
        templateId: c.templateRef ? (templateIds.get(c.templateRef) ?? null) : null,
        language: c.language ?? "en",
        emailBody: c.emailBody ?? null,
        smsBody: c.smsBody ?? null,
        videoMeta: c.videoMeta ?? null,
        drip: c.drip ?? [],
        audience: c.audience,
        audienceSize: c.audienceSize,
        scheduledFor: c.scheduledInDays !== undefined ? daysFromNow(c.scheduledInDays) : null,
        ownerUserId,
        sentCount: c.sentCount ?? 0,
        openCount: c.openCount ?? 0,
        replyCount: c.replyCount ?? 0,
        createdAt: daysFromNow(-(c.createdDaysAgo ?? 0)),
      })
      .returning({ id: schema.campaign.id });
    campaignIdByName.set(c.name, row.id);

    let position = 0;
    for (const s of c.steps ?? []) {
      await db.insert(schema.campaignStep).values({
        tenantId: TENANT_ID,
        campaignId: row.id,
        position: position++,
        channel: s.channel,
        delayDays: s.delayDays,
        sendTime: s.sendTime ?? null,
        templateId: s.templateRef ? (templateIds.get(s.templateRef) ?? null) : null,
        subject: s.subject ?? null,
        body: s.body ?? null,
        approvalRequired: s.approvalRequired ?? true,
        skipCondition: s.skipCondition ?? null,
        stopCondition: s.stopCondition ?? null,
        language: s.language ?? "en",
      });
    }
  }

  // --- Automations ---------------------------------------------------------
  // Ref → id, so lead-source mappings (Integrations, below) can point at the
  // automation their source's leads run through.
  const automationIdByRef = new Map<string, string>();
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
        source: a.source ?? null,
        timingText: a.timingText ?? null,
        campaignId: a.campaignName ? (campaignIdByName.get(a.campaignName) ?? null) : null,
        conditions: a.conditions ?? null,
        ownerAssignment: a.ownerAssignment ?? null,
        startDelayText: a.startDelayText ?? null,
        stopConditions: a.stopConditions ?? null,
        reentryRule: a.reentryRule ?? null,
        runCount: a.runCount,
        lastRunAt: a.lastRunDaysAgo !== undefined ? daysFromNow(-a.lastRunDaysAgo) : null,
      })
      .returning({ id: schema.automation.id });
    if (a.ref) automationIdByRef.set(a.ref, row.id);

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

  // --- Campaign-enrollment events ------------------------------------------
  // Convention: kind 'campaign.enrolled' with { campaignId, campaignName } in
  // the payload; partner enrollments use 'partner.campaign_enrolled' with the
  // partnerId alongside.
  const welcomeCampaign = campaignIdByName.get("New lead welcome — first 10 days")!;
  const checkinCampaign = campaignIdByName.get("Past client check-in — summer")!;
  const partnerMonthly = campaignIdByName.get("Agent partner monthly update")!;
  await db.insert(schema.event).values([
    {
      tenantId: TENANT_ID,
      kind: "campaign.enrolled",
      personId: personIds.get("torres")!,
      loanId: loanIds.get("torres") ?? null,
      actorUserId: U.minh,
      payload: { campaignId: welcomeCampaign, campaignName: "New lead welcome — first 10 days" },
      createdAt: hoursFromNow(-5),
    },
    {
      tenantId: TENANT_ID,
      kind: "campaign.enrolled",
      personId: personIds.get("whitmore")!,
      loanId: loanIds.get("whitmore") ?? null,
      actorUserId: U.minh,
      payload: { campaignId: checkinCampaign, campaignName: "Past client check-in — summer" },
      createdAt: daysFromNow(-2),
    },
    {
      tenantId: TENANT_ID,
      kind: "partner.campaign_enrolled",
      actorUserId: U.minh,
      payload: {
        partnerId: partnerIds.get("alvarez_agent"),
        campaignId: partnerMonthly,
        campaignName: "Agent partner monthly update",
      },
      createdAt: daysFromNow(-1),
    },
  ]);

  // --- AI personas -----------------------------------------------------------
  // Private per owner (ai_persona.user_id is unique; RLS additionally pins
  // each row to its owner). The seeder connects as the table owner role, so
  // it can insert here even though the table is RLS-forced for everyone else.
  for (const p of PERSONAS) {
    const userId = p.userKey === "linh" ? U.linh : (loIds.get(p.userKey) ?? U.minh);
    await db.insert(schema.aiPersona).values({
      tenantId: TENANT_ID,
      userId,
      filename: p.file?.filename ?? null,
      mime: p.file?.mime ?? null,
      sizeBytes: p.file?.sizeBytes ?? null,
      status: "ready",
      extractedText: p.file?.extractedText ?? null,
      enabled: p.enabled,
      instructions: p.instructions,
      tone: p.tone,
      preferWords: p.preferWords,
      avoidWords: p.avoidWords,
      complianceNotes: p.complianceNotes,
      sampleText: p.sampleText,
    });
  }

  // --- Integrations: connections, lead-source mapping, import/failure log ---
  // HONEST BY CONSTRUCTION: every connection is 'preview' or 'paused' — never
  // 'connected' — and config only ever holds non-secret metadata. No OAuth
  // token exists anywhere in this build.
  const connectionIdByProvider = new Map<string, string>();
  for (const c of INTEGRATION_CONNECTIONS) {
    const [row] = await db
      .insert(schema.integrationConnection)
      .values({
        tenantId: TENANT_ID,
        provider: c.provider,
        userId: null,
        status: c.status,
        displayName: c.displayName,
        config: c.config ?? {},
        lastSyncedAt: null,
      })
      .returning({ id: schema.integrationConnection.id });
    connectionIdByProvider.set(c.provider, row.id);
  }
  const zapierConnectionId = connectionIdByProvider.get("zapier_mcp")!;

  const mappingIdBySourceKey = new Map<string, string>();
  for (const m of LEAD_SOURCE_MAPPINGS) {
    const [row] = await db
      .insert(schema.leadSourceMapping)
      .values({
        tenantId: TENANT_ID,
        connectionId: zapierConnectionId,
        sourceKey: m.sourceKey,
        name: m.name,
        ownerUserId: loIds.get(m.ownerKey) ?? U.minh,
        leadSource: m.leadSource,
        campaignId: m.campaignName ? (campaignIdByName.get(m.campaignName) ?? null) : null,
        automationId: m.automationRef ? (automationIdByRef.get(m.automationRef) ?? null) : null,
        tags: m.tags,
        preferredLanguage: m.preferredLanguage,
        fieldMap: m.fieldMap,
        notifyRule: m.notifyRule,
        active: m.active,
      })
      .returning({ id: schema.leadSourceMapping.id });
    mappingIdBySourceKey.set(m.sourceKey, row.id);
  }

  for (const e of INTEGRATION_EVENTS) {
    await db.insert(schema.integrationEvent).values({
      tenantId: TENANT_ID,
      connectionId: zapierConnectionId,
      mappingId: e.mappingSourceKey ? (mappingIdBySourceKey.get(e.mappingSourceKey) ?? null) : null,
      kind: e.kind,
      status: e.status,
      summary: e.summary,
      detail: e.detail,
      createdAt: hoursFromNow(-e.hoursAgo),
    });
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

  // ==========================================================================
  // DEMO-SCALE DATA — the Loan Officer Committee build. Everything below is
  // deterministic generated sample data; the branch should feel like it has
  // been operating for months across a 10-LO team.
  // ==========================================================================

  let partnerEmailSeq = 0;
  function makePartnerEmail(first: string, last: string): string {
    partnerEmailSeq += 1;
    const clean = (s: string) =>
      s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
    return `${clean(first)}.${clean(last)}${partnerEmailSeq}@example.com`;
  }

  // --- Generated books: people, opportunities, leads, notes, tasks ---------
  const books = generateDemoBooks();
  const generatedPeople = new Map<string, { personId: string; loanId: string | null; language: string; firstName: string; lastName: string; loKey: string; active: boolean }[]>();

  for (const gp of books) {
    const loUserId = loIds.get(gp.loKey)!;

    const type = !gp.loan
      ? "other"
      : gp.loan.status === "funded"
        ? "past_client"
        : STAGES.indexOf(gp.loan.stage) <= 1
          ? "lead"
          : "borrower";

    // Bio & online presence for ~30% of the generated book — a representative
    // subset, not everyone (the rest honestly show "Not added").
    const genBio = seedRand() < 0.3
      ? bioFields({
          firstName: gp.firstName,
          lastName: gp.lastName,
          city: gp.city,
          role: type,
          language: gp.language,
        })
      : null;

    const [personRow] = await db
      .insert(schema.person)
      .values({
        tenantId: TENANT_ID,
        firstName: gp.firstName,
        lastName: gp.lastName,
        emails: [{ address: gp.email, label: "personal" }],
        phones: [{ number: gp.phone, label: "mobile", smsCapable: true }],
        mailingAddress: { city: gp.city, state: gp.state },
        preferredLanguage: gp.language,
        type: type as "lead" | "borrower" | "past_client" | "other",
        ownerUserId: loUserId,
        tags: gp.tags,
        source: gp.loan?.lead ? { channel: gp.loan.lead.channel } : { channel: "manual" },
        ...(genBio ?? {}),
      })
      .returning({ id: schema.person.id });

    let loanId: string | null = null;

    if (gp.loan) {
      const l = gp.loan;
      const lastActivity = daysFromNow(-l.daysSinceActivity);
      const phase = phaseOf(l.stage);
      const stalled =
        l.status === "active" && l.daysSinceActivity > (phase === "LOANS" ? 3 : 7);

      // Full stage trail with a per-loan cadence, so entries into
      // `application` and `preapproval` scatter across every leaderboard
      // window at a different density per LO. Funded files anchor to the
      // funding date; everything else to recent activity.
      const stageIdx = STAGES.indexOf(l.stage);
      const fundedIdx = STAGES.indexOf("funded");
      const trailStep = sInt(2, 8);
      const entryDaysAgo: number[] = [];
      if (l.status === "funded" && l.fundedDaysAgo !== undefined) {
        const postFunding = [45, 365, 500, 560];
        for (let i = 0; i <= stageIdx; i++) {
          entryDaysAgo[i] =
            i <= fundedIdx
              ? l.fundedDaysAgo + (fundedIdx - i) * trailStep
              : Math.max(1, l.fundedDaysAgo - postFunding[i - fundedIdx - 1]);
        }
      } else {
        const anchor = l.daysSinceActivity + sInt(0, 6);
        for (let i = 0; i <= stageIdx; i++) {
          entryDaysAgo[i] = anchor + (stageIdx - i) * trailStep;
        }
      }
      const openedDaysAgo = entryDaysAgo[0] + sInt(1, 3);

      const [loanRow] = await db
        .insert(schema.loan)
        .values({
          tenantId: TENANT_ID,
          personId: personRow.id,
          loUserId,
          processorUserId: phase === "LOANS" ? U.david : null,
          stage: l.stage,
          status: l.status,
          purpose: l.purpose,
          program: l.program,
          amount: l.amount ? String(l.amount) : null,
          propertyAddress: { city: gp.city, state: gp.state },
          rateLockExpiresAt:
            l.lockExpiresInDays !== undefined ? isoDate(daysFromNow(l.lockExpiresInDays)) : null,
          closingDate:
            l.closingInDays !== undefined ? isoDate(daysFromNow(l.closingInDays)) : null,
          fundedAt:
            l.fundedDaysAgo !== undefined ? isoDate(daysFromNow(-l.fundedDaysAgo)) : null,
          docsNeeded: Boolean(l.docsNeeded),
          docsNeededSummary: l.docsNeeded ?? null,
          docsNeededSince: l.docsNeeded ? daysFromNow(-2) : null,
          stalledSince: stalled ? lastActivity : null,
          lostReason: l.status === "lost" ? "Went with another lender" : null,
          lastActivityAt: lastActivity,
          createdAt: daysFromNow(-openedDaysAgo),
        })
        .returning({ id: schema.loan.id });
      loanId = loanRow.id;

      // The full stage trail, from new_lead to today.
      for (let s = 0; s <= stageIdx; s++) {
        await db.insert(schema.loanStageHistory).values({
          tenantId: TENANT_ID,
          loanId,
          fromStage: s === 0 ? null : STAGES[s - 1],
          toStage: STAGES[s],
          changedByUserId: loUserId,
          createdAt: daysFromNow(-entryDaysAgo[s]),
        });
      }

      if (l.lead) {
        // Genuinely new leads keep their recent capture times (that's the
        // speed-to-lead queue); every deeper file's capture anchors to when
        // the file opened, spreading capturedAt across the past ~6 months.
        const capturedHoursAgo =
          stageIdx <= 1 ? l.lead.capturedHoursAgo : openedDaysAgo * 24 - sInt(0, 12);
        await db.insert(schema.lead).values({
          tenantId: TENANT_ID,
          personId: personRow.id,
          loanId,
          source: { channel: l.lead.channel },
          intent: l.purpose === "refinance" ? "refinance" : "purchase",
          assignedUserId: loUserId,
          capturedAt: hoursFromNow(-capturedHoursAgo),
          firstResponseAt:
            l.lead.firstResponseMinutes !== null
              ? hoursFromNow(-capturedHoursAgo + l.lead.firstResponseMinutes / 60)
              : null,
        });
      }

      // Follow-up tasks: overdue in proportion to the LO's habits.
      if (l.status === "active" && (l.docsNeeded || l.daysSinceActivity > 2)) {
        const overdue = l.daysSinceActivity > 3;
        await db.insert(schema.task).values({
          tenantId: TENANT_ID,
          title: l.docsNeeded
            ? `Chase ${l.docsNeeded} — ${gp.firstName} ${gp.lastName}`
            : `Follow up with ${gp.firstName} ${gp.lastName}`,
          ownerUserId: loUserId,
          dueAt: overdue ? daysFromNow(-Math.min(l.daysSinceActivity - 1, 6)) : daysFromNow(1),
          status: "open",
          priority: overdue ? "high" : "normal",
          personId: personRow.id,
          loanId,
        });
      }

      // Activity events power the team feed and audit history.
      await db.insert(schema.event).values({
        tenantId: TENANT_ID,
        kind: l.status === "funded" ? "loan.stage_advanced" : "touch.logged",
        personId: personRow.id,
        loanId,
        actorUserId: loUserId,
        payload: {},
        createdAt: daysFromNow(-Math.min(l.daysSinceActivity, 28)),
      });
    }

    for (const noteText of gp.notes) {
      await db.insert(schema.note).values({
        tenantId: TENANT_ID,
        body: noteText,
        authorUserId: loUserId,
        personId: personRow.id,
        loanId,
        createdAt: daysFromNow(-(gp.loan?.daysSinceActivity ?? 10) - 1),
      });
    }

    const list = generatedPeople.get(gp.loKey) ?? [];
    list.push({
      personId: personRow.id,
      loanId,
      language: gp.language,
      firstName: gp.firstName,
      lastName: gp.lastName,
      loKey: gp.loKey,
      active: gp.loan?.status === "active",
    });
    generatedPeople.set(gp.loKey, list);
  }

  // --- Lead-only people: captured manually, no opportunity opened yet -------
  // A person can exist as a lead before anyone opens a file — the People
  // screen shows them; the Pipeline doesn't.
  const LEAD_ONLY_PEOPLE = [
    {
      firstName: "Tessa",
      lastName: "Bright",
      email: "tessa.bright@example.com",
      phone: "(206) 555-0411",
      language: "en" as const,
      city: "Seattle",
      loKey: "priya",
    },
    {
      firstName: "Rogelio",
      lastName: "Cisneros",
      email: "rogelio.cisneros@example.com",
      phone: "(253) 555-0412",
      language: "es" as const,
      city: "Tacoma",
      loKey: "carlos",
    },
    {
      firstName: "Owen",
      lastName: "Mercer",
      email: "owen.mercer@example.com",
      phone: "(425) 555-0413",
      language: "en" as const,
      city: "Kirkland",
      loKey: "grace",
    },
  ];
  for (const lp of LEAD_ONLY_PEOPLE) {
    await db.insert(schema.person).values({
      tenantId: TENANT_ID,
      firstName: lp.firstName,
      lastName: lp.lastName,
      emails: [{ address: lp.email, label: "personal" }],
      phones: [{ number: lp.phone, label: "mobile", smsCapable: true }],
      mailingAddress: { city: lp.city, state: "WA" },
      preferredLanguage: lp.language,
      type: "lead",
      ownerUserId: loIds.get(lp.loKey)!,
      source: { channel: "manual" },
    });
  }

  // Appointments this week across the team.
  for (const lo of DEMO_LOS) {
    const book = generatedPeople.get(lo.key) ?? [];
    const actives = book.filter((p) => p.active).slice(0, 2);
    let hour = 9 + (loIds.size % 3);
    for (const p of actives) {
      await db.insert(schema.appointment).values({
        tenantId: TENANT_ID,
        title: `Consultation — ${p.firstName} ${p.lastName}`,
        kind: "consultation",
        startsAt: atHourToday(hour, 0),
        endsAt: atHourToday(hour + 1, 0),
        ownerUserId: loIds.get(lo.key)!,
        personId: p.personId,
        loanId: p.loanId,
      });
      hour += 2;
    }
  }

  // Audit history: sign-ins over the past week so the log looks lived-in.
  for (const [, userId] of loIds) {
    for (let d = 1; d <= 5; d++) {
      await db.insert(schema.auditLog).values({
        tenantId: TENANT_ID,
        actorUserId: userId,
        action: "user.login",
        entity: "user",
        entityId: userId,
        createdAt: daysFromNow(-d),
      });
    }
  }

  // --- Generated partners, linked to each LO's real people ------------------
  const genPartners = generateDemoPartners();
  for (const gp of genPartners) {
    // Every partner gets a bio draft (Requirement: "ALL partners").
    const genPartnerBio = bioFields({
      firstName: gp.firstName,
      lastName: gp.lastName,
      company: gp.company,
      role: gp.kind,
      language: gp.language,
    });

    const [partnerRow] = await db
      .insert(schema.partner)
      .values({
        tenantId: TENANT_ID,
        firstName: gp.firstName,
        lastName: gp.lastName,
        company: gp.company,
        kind: gp.kind,
        tier: gp.tier,
        emails: [{ address: makePartnerEmail(gp.firstName, gp.lastName), label: "work" }],
        phones: [{ number: "(425) 555-0300", label: "mobile", smsCapable: true }],
        preferredLanguage: gp.language,
        ownerUserId: loIds.get(gp.loKey)!,
        lastTouchAt: daysFromNow(-gp.lastTouchDaysAgo),
        notesSummary: gp.notesSummary,
        ...genPartnerBio,
      })
      .returning({ id: schema.partner.id });

    const book = (generatedPeople.get(gp.loKey) ?? []).filter((p) => p.loanId);
    for (const referred of book.slice(0, Math.min(2, book.length))) {
      // Staggered referral history: some arrived this week, some months back.
      const roll = seedRand();
      const relDaysAgo = roll < 0.3 ? sInt(1, 7) : roll < 0.65 ? sInt(30, 90) : sInt(190, 320);
      await db.insert(schema.partnerRelationship).values({
        tenantId: TENANT_ID,
        partnerId: partnerRow.id,
        personId: referred.personId,
        loanId: referred.loanId,
        role: "referred",
        createdAt: daysFromNow(-relDaysAgo),
      });
    }
  }

  // --- Multilingual conversations with English translations -----------------
  for (const thread of MULTILINGUAL_THREADS) {
    const book = generatedPeople.get(thread.loKey) ?? [];
    const match = book.find((p) => p.language === thread.personLanguage) ?? book[0];
    if (!match) continue;

    const newest = Math.min(...thread.messages.map((m) => m.hoursAgo));
    const last = thread.messages.reduce((a, b) => (a.hoursAgo < b.hoursAgo ? a : b));

    const [conv] = await db
      .insert(schema.conversation)
      .values({
        tenantId: TENANT_ID,
        subject: thread.subject,
        channel: thread.channel,
        personId: match.personId,
        loanId: match.loanId,
        ownerUserId: loIds.get(thread.loKey)!,
        lastMessageAt: hoursFromNow(-newest),
        awaitingReply: last.direction === "inbound",
      })
      .returning({ id: schema.conversation.id });

    for (const m of thread.messages) {
      await db.insert(schema.message).values({
        tenantId: TENANT_ID,
        conversationId: conv.id,
        channel: thread.channel,
        direction: m.direction,
        status: m.direction === "inbound" ? "received" : "sent",
        subject: thread.subject,
        body: m.body,
        preparedByAi: m.preparedByAi ?? false,
        languageCode: thread.personLanguage,
        authorUserId: m.direction === "outbound" ? loIds.get(thread.loKey)! : null,
        sentAt: m.direction === "outbound" ? hoursFromNow(-m.hoursAgo) : null,
        occurredAt: hoursFromNow(-m.hoursAgo),
        // Demo translation for the loan officer — generated, not reviewed.
        meta: m.translationEn ? { translationEn: m.translationEn } : {},
      });
    }
  }

  // --- Multilingual AI drafts pending approval ------------------------------
  for (const ins of MULTILINGUAL_INSIGHTS) {
    const book = generatedPeople.get(ins.loKey) ?? [];
    const match = book.find((p) => p.language === ins.language) ?? book[0];
    if (!match) continue;

    const [row] = await db
      .insert(schema.aiInsight)
      .values({
        tenantId: TENANT_ID,
        kind: "draft_email",
        status: "pending",
        tier: "t2",
        forUserId: loIds.get(ins.loKey)!,
        personId: match.personId,
        loanId: match.loanId,
        title: ins.title,
        body: ins.body,
        rationale: ins.rationale,
        factors: ins.factors,
        languageCode: ins.language,
      })
      .returning({ id: schema.aiInsight.id });

    await db.insert(schema.aiActionLog).values({
      tenantId: TENANT_ID,
      insightId: row.id,
      action: "insight.generated",
      model: "mock-router-v1",
      promptVersion: "demo-seed",
      detail: { language: ins.language },
    });
  }

  // --- Additional campaigns, including multilingual ones --------------------
  const extraCampaigns = [
    {
      name: "Boletín mensual — clientes hispanohablantes",
      status: "running" as const,
      ownerKey: "carlos",
      language: "es" as const,
      audience: "Spanish-speaking past clients and leads",
      size: 31,
      sent: 31,
      open: 19,
      reply: 5,
      createdDaysAgo: 4,
      emailBody:
        "Hola {{BorrowerName}},\n\nAquí está el boletín de este mes: qué están haciendo las tasas, cuánto inventario hay en nuestras ciudades, y una respuesta clara a la pregunta que más me hacen: \"¿es buen momento para comprar?\"\n\nSi algo de esto le toca de cerca, respóndame — con gusto lo revisamos juntos, sin compromiso.\n\nCarlos Mendoza\nNMLS 1764201 — Company NMLS 320841\nEsto no es un compromiso de préstamo. Todos los préstamos están sujetos a aprobación de crédito.\nIgualdad de Oportunidades en la Vivienda.",
      smsBody:
        "Hola {{BorrowerName}} — Carlos de Loan Factory. Salió el boletín de este mes; revise su correo. ¿Preguntas? Responda aquí. Responda STOP para cancelar.",
    },
    {
      name: "Bản tin quý — khách hàng người Việt",
      status: "finished" as const,
      ownerKey: "thuy",
      language: "vi" as const,
      audience: "Vietnamese-speaking clients",
      size: 24,
      sent: 24,
      open: 17,
      reply: 6,
      createdDaysAgo: 16,
      emailBody:
        "Chào anh chị,\n\nBản tin quý này: lãi suất đang đi về đâu, thị trường nhà quanh Seattle thế nào, và ba điều nên chuẩn bị nếu anh chị định mua hoặc tái tài trợ trong năm nay.\n\nCó câu hỏi nào, anh chị cứ trả lời email này — em luôn sẵn sàng.\n\nThúy Phạm\nNMLS 1901288 — Company NMLS 320841\nĐây không phải là cam kết cho vay. Mọi khoản vay đều phải được duyệt tín dụng.\nCơ hội Nhà ở Bình đẳng.",
      smsBody:
        "Chào anh chị — Thúy ở Loan Factory. Bản tin quý đã gửi qua email, anh chị xem nhé. Có câu hỏi cứ nhắn lại. Nhắn STOP để ngưng nhận tin.",
    },
    {
      name: "Ежеквартальная рассылка — русскоязычные клиенты",
      status: "scheduled" as const,
      ownerKey: "elena",
      language: "ru" as const,
      audience: "Russian-speaking clients",
      size: 18,
      sent: 0,
      open: 0,
      reply: 0,
      createdDaysAgo: 28,
      emailBody:
        "Здравствуйте, {{BorrowerName}}!\n\nКвартальный обзор: куда движутся ставки, что происходит с ценами на жильё в нашем регионе, и когда рефинансирование действительно имеет смысл — а когда нет.\n\nЕсли что-то из этого касается вас, просто ответьте на это письмо.\n\nElena Petrova\nNMLS 1922845 — Company NMLS 320841\nЭто не обязательство по кредитованию. Все кредиты подлежат одобрению.\nРавные жилищные возможности.",
    },
    {
      name: "Spring open-house partner push",
      status: "finished" as const,
      ownerKey: "priya",
      language: "en" as const,
      audience: "All referral partners",
      size: 22,
      sent: 22,
      open: 15,
      reply: 4,
      createdDaysAgo: 45,
      emailBody:
        "Hi {{PartnerName}},\n\nOpen-house season is here. I'm offering same-weekend preapproval turnarounds for your sign-in-sheet buyers, plus a co-branded financing flyer for your listings.\n\nSend me your open-house schedule and I'll have materials to you by Friday.\n\nPriya Sharma\nNMLS 1899310 — Company NMLS 320841\nEqual Housing Opportunity.",
      smsBody:
        "Hi {{PartnerName}} — Priya at Loan Factory. Open-house flyers are ready; want a set for this weekend? Reply STOP to opt out.",
    },
  ];
  for (const c of extraCampaigns) {
    const [row] = await db
      .insert(schema.campaign)
      .values({
        tenantId: TENANT_ID,
        name: c.name,
        status: c.status,
        language: c.language,
        emailBody: c.emailBody,
        smsBody: c.smsBody ?? null,
        audience: { label: c.audience, type: "custom_demo" },
        audienceSize: c.size,
        scheduledFor: c.status === "scheduled" ? daysFromNow(3) : null,
        ownerUserId: loIds.get(c.ownerKey)!,
        sentCount: c.sent,
        openCount: c.open,
        replyCount: c.reply,
        createdAt: daysFromNow(-c.createdDaysAgo),
      })
      .returning({ id: schema.campaign.id });
    campaignIdByName.set(c.name, row.id);
  }

  // --- Video-message demo drafts (composer examples) ------------------------
  // Authored by different LOs across recent weeks so the Team leaderboard's
  // marketing column differs by window. One is approved-but-unsent: it carries
  // approvedAt and a NULL sentAt (nothing goes out without a send).
  const videoDrafts: {
    ownerKey: string;
    subject: string;
    language: "en" | "es" | "vi" | "ru";
    intro: string;
    video: { title: string; caption: string; durationSeconds: number };
    channel?: "email" | "video";
    createdDaysAgo?: number;
    approved?: boolean;
  }[] = [
    {
      ownerKey: "linh",
      subject: "July market update — video newsletter",
      language: "en" as const,
      approved: true,
      intro:
        "Hi everyone,\n\nI recorded a short update on what we're seeing this month — inventory, buyer activity, and what it means if you're waiting to make a move.",
      video: { title: "July market update", caption: "3-minute update from Linh", durationSeconds: 184 },
    },
    {
      ownerKey: "carlos",
      subject: "Un mensaje rápido sobre sus documentos",
      language: "es" as const,
      intro:
        "Hola María,\n\nLe grabé un video corto explicando exactamente qué documentos faltan y cómo enviarlos desde su teléfono — a veces es más fácil verlo que leerlo.",
      video: { title: "Cómo enviar sus documentos", caption: "Video de 2 minutos", durationSeconds: 127 },
    },
    {
      ownerKey: "thuy",
      subject: "Cảm ơn anh đã giới thiệu khách hàng",
      language: "vi" as const,
      intro:
        "Chào anh,\n\nEm gửi một video ngắn cảm ơn anh đã tin tưởng giới thiệu khách. Em cũng chia sẻ nhanh tình hình hồ sơ để anh tiện theo dõi.",
      video: { title: "Cảm ơn đối tác", caption: "Video 90 giây", durationSeconds: 92 },
    },
    {
      ownerKey: "elena",
      subject: "Год после покупки — короткое видео для вас",
      language: "ru" as const,
      createdDaysAgo: 2,
      intro:
        "Здравствуйте, Виктор!\n\nЗаписала для вас короткое видео: год после покупки — хороший момент посмотреть, всё ли работает на вас. Три минуты, без обязательств.",
      video: { title: "Годовой обзор", caption: "Видео 3 минуты", durationSeconds: 178 },
    },
    {
      ownerKey: "priya",
      subject: "A 90-second answer to your escrow question",
      language: "en" as const,
      channel: "video",
      createdDaysAgo: 1,
      intro:
        "Hi,\n\nYou asked how your escrow account actually works — here's the 90-second version, with your numbers on screen.",
      video: { title: "Your escrow, explained", caption: "90 seconds, your numbers", durationSeconds: 94 },
    },
    {
      ownerKey: "marcus",
      subject: "Walkthrough: your loan estimate, page by page",
      language: "en" as const,
      channel: "video",
      createdDaysAgo: 9,
      intro:
        "Hi,\n\nBefore we talk tomorrow, here's a short walkthrough of your loan estimate so the numbers aren't new when we go through them together.",
      video: { title: "Your loan estimate, page by page", caption: "4-minute walkthrough", durationSeconds: 246 },
    },
    {
      ownerKey: "grace",
      subject: "Welcome — here's how I work",
      language: "en" as const,
      createdDaysAgo: 20,
      intro:
        "Hi,\n\nA short hello before our first call: who I am, how I communicate, and what you can expect week to week while we get you home.",
      video: { title: "Hello from Grace", caption: "2-minute introduction", durationSeconds: 121 },
    },
  ];

  const leaderId = U.linh;
  for (const d of videoDrafts) {
    const ownerId = d.ownerKey === "linh" ? leaderId : loIds.get(d.ownerKey)!;
    const book = generatedPeople.get(d.ownerKey === "linh" ? "minh" : d.ownerKey) ?? [];
    const match = book.find((p) => p.language === d.language) ?? book[0];
    const channel = d.channel ?? "email";
    const when = daysFromNow(-(d.createdDaysAgo ?? 0));

    const [conv] = await db
      .insert(schema.conversation)
      .values({
        tenantId: TENANT_ID,
        subject: d.subject,
        channel,
        personId: match?.personId ?? null,
        ownerUserId: ownerId,
        lastMessageAt: when,
        awaitingReply: false,
      })
      .returning({ id: schema.conversation.id });

    await db.insert(schema.message).values({
      tenantId: TENANT_ID,
      conversationId: conv.id,
      channel,
      direction: "outbound",
      status: d.approved ? "approved" : "draft",
      subject: d.subject,
      body: `${d.intro}\n\n[Video: ${d.video.title}]\n\nIf the video doesn't load, use this link instead.`,
      preparedByAi: false,
      languageCode: d.language,
      authorUserId: ownerId,
      // Approved means a human signed off — it still has not been sent.
      approvedByUserId: d.approved ? ownerId : null,
      approvedAt: d.approved ? hoursFromNow(-2) : null,
      occurredAt: when,
      createdAt: when,
      meta: { video: { ...d.video, demo: true } },
    });
  }

  const policyCounts = parsed.reduce<Record<string, number>>((acc, t) => {
    acc[t.policy] = (acc[t.policy] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`  tenant:        Loan Factory (NMLS 320841)`);
  console.log(`  users:         5 across 5 roles`);
  console.log(`  people:        ${personIds.size}`);
  console.log(`  opportunities: ${loanIds.size} across the pipeline stages`);
  console.log(
    `  tasks:         ${TASKS.length}   appointments: ${APPOINTMENTS.length}   notes: ${NOTES.length}`,
  );
  console.log(`  partners:      ${partnerIds.size}`);
  console.log(`  conversations: ${THREADS.length}`);
  console.log(`  AI drafts:   ${INSIGHTS.length} pending approval`);
  console.log(
    `  campaigns:     ${CAMPAIGNS.length + MULTISTEP_CAMPAIGNS.length} ` +
      `(${MULTISTEP_CAMPAIGNS.length} multi-step)   automations: ${AUTOMATIONS.length}`,
  );
  console.log(
    `  AI personas:   ${PERSONAS.length}   integration connections: ${INTEGRATION_CONNECTIONS.length}   ` +
      `lead-source mappings: ${LEAD_SOURCE_MAPPINGS.length}`,
  );
  console.log(
    `  templates:     ${parsed.length} imported from source_assets ` +
      `(${policyCounts.fully_automated ?? 0} fully automated, ` +
      `${policyCounts.semi_automated ?? 0} semi, ` +
      `${policyCounts.manual_only ?? 0} manual only, ` +
      `${policyCounts.never_automate ?? 0} never automate)`,
  );
  const totalPeople = await db.execute(
    sql`SELECT count(*)::int AS n FROM person WHERE tenant_id = ${TENANT_ID}`,
  );
  const totalLoans = await db.execute(
    sql`SELECT count(*)::int AS total,
               count(*) FILTER (WHERE status = 'active')::int AS active,
               count(*) FILTER (WHERE status = 'funded')::int AS funded
          FROM loan WHERE tenant_id = ${TENANT_ID}`,
  );
  const langMix = await db.execute(
    sql`SELECT preferred_language, count(*)::int AS n FROM person
         WHERE tenant_id = ${TENANT_ID} GROUP BY 1 ORDER BY 2 DESC`,
  );

  console.log("");
  console.log("DEMO BUILD (Loan Officer Committee — sample data only)");
  console.log(`  people total:  ${(totalPeople.rows[0] as { n: number }).n}`);
  const lt = totalLoans.rows[0] as { total: number; active: number; funded: number };
  console.log(`  opportunities: ${lt.total} (${lt.active} active, ${lt.funded} funded)`);
  console.log(
    `  languages:     ${langMix.rows.map((r) => `${(r as { preferred_language: string }).preferred_language}:${(r as { n: number }).n}`).join("  ")}`,
  );
  console.log("");
  console.log("Sign in as the TEAM LEADER:  linh@loanfactory.com  /  Demo1234!");
  console.log("(Individual LOs: minh@, carlos@, priya@, tom@, elena@, marcus@, thuy@, rebecca@, diego@, grace.k@ — same password)");

  await pool.end();
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
