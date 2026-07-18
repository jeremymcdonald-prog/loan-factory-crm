/**
 * Automations queries — the Automations module's read layer.
 *
 * Automations are tenant-wide rules rather than a personal book: every loan
 * officer on the tenant works the same rulebook, so there is no owner scope
 * here. RLS already limits every row to the caller's tenant.
 */
import "server-only";
import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import type { Db } from "@/db";
import { automation, automationRun, campaign, person, template } from "@/db/schema";

/**
 * How many runs this automation has parked for a human.
 *
 * It is the one number on these screens that represents work still owed, so it
 * is counted from the runs themselves rather than from a stored column that
 * could drift away from them.
 */
const waitingCount = sql<number>`(
  SELECT count(*) FROM ${automationRun}
   WHERE ${automationRun.automationId} = ${automation.id}
     AND ${automationRun.status} = 'queued_for_approval'
)::int`;

/** The card and the record show the same automation, so they read it the same way. */
const AUTOMATION_FIELDS = {
  id: automation.id,
  ref: automation.ref,
  name: automation.name,
  description: automation.description,
  triggerText: automation.triggerText,
  audienceText: automation.audienceText,
  actionText: automation.actionText,
  source: automation.source,
  timingText: automation.timingText,
  tier: automation.tier,
  status: automation.status,
  runCount: automation.runCount,
  lastRunAt: automation.lastRunAt,
  createdAt: automation.createdAt,
  templateRef: template.ref,
  templateName: template.name,
  campaignId: automation.campaignId,
  campaignName: campaign.name,
  waitingCount,
};

/**
 * Every automation, in the order a loan officer reads them: what is live, then
 * what is switched off, then what is still being written.
 */
export async function listAutomations(db: Db) {
  return db
    .select(AUTOMATION_FIELDS)
    .from(automation)
    .leftJoin(template, eq(template.id, automation.templateId))
    .leftJoin(campaign, eq(campaign.id, automation.campaignId))
    .where(isNull(automation.deletedAt))
    .orderBy(
      sql`CASE ${automation.status} WHEN 'active' THEN 0 WHEN 'paused' THEN 1 ELSE 2 END`,
      // Catalog automations sort by their reference; ones built here have none
      // and fall to the bottom of their group rather than jumping the queue.
      sql`${automation.ref} ASC NULLS LAST`,
      asc(automation.name),
    );
}

export type AutomationRow = Awaited<ReturnType<typeof listAutomations>>[number];

export async function getAutomation(db: Db, automationId: string) {
  const [row] = await db
    .select(AUTOMATION_FIELDS)
    .from(automation)
    .leftJoin(template, eq(template.id, automation.templateId))
    .leftJoin(campaign, eq(campaign.id, automation.campaignId))
    .where(and(eq(automation.id, automationId), isNull(automation.deletedAt)))
    .limit(1);

  return row ?? null;
}

export type AutomationRecord = NonNullable<Awaited<ReturnType<typeof getAutomation>>>;

/**
 * What one automation has actually done, newest first.
 *
 * Every run carries its own plain-language account of the outcome, so the
 * timeline reports what happened rather than reconstructing it from an enum.
 */
export async function listAutomationRuns(db: Db, automationId: string, limit = 50) {
  return db
    .select({
      id: automationRun.id,
      status: automationRun.status,
      outcome: automationRun.outcome,
      stoppedReason: automationRun.stoppedReason,
      createdAt: automationRun.createdAt,
      personId: automationRun.personId,
      firstName: person.firstName,
      lastName: person.lastName,
    })
    .from(automationRun)
    .leftJoin(person, eq(person.id, automationRun.personId))
    .where(eq(automationRun.automationId, automationId))
    .orderBy(desc(automationRun.createdAt))
    .limit(limit);
}

export type AutomationRunRow = Awaited<ReturnType<typeof listAutomationRuns>>[number];

/**
 * Every campaign an automation could enroll people into, for the picker on the
 * edit form. RLS scopes the list to the caller's tenant; automations are
 * tenant-wide, so no owner scope applies here either.
 */
export async function listCampaignChoices(db: Db) {
  return db
    .select({ id: campaign.id, name: campaign.name, status: campaign.status })
    .from(campaign)
    .where(isNull(campaign.deletedAt))
    .orderBy(asc(campaign.name));
}

export type CampaignChoice = Awaited<ReturnType<typeof listCampaignChoices>>[number];
