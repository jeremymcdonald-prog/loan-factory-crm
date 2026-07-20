/**
 * Automations queries — the Automations module's read layer.
 *
 * Automations are tenant-wide rules rather than a personal book: every loan
 * officer on the tenant works the same rulebook, so there is no owner scope
 * here. RLS already limits every row to the caller's tenant.
 */
import "server-only";
import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { Db } from "@/db";
import { automation, automationRun, campaign, loan, person, template, user } from "@/db/schema";

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
  /** Extra plain-language conditions that must hold for a lead to enroll. */
  conditions: automation.conditions,
  /** How the incoming lead's owner is chosen — "Round-robin" or a name. */
  ownerAssignment: automation.ownerAssignment,
  /** Plain-language delay before the campaign's first step fires. */
  startDelayText: automation.startDelayText,
  /** What halts an in-flight enrollment before the campaign finishes. */
  stopConditions: automation.stopConditions,
  /** Whether, and when, the same person can enroll again. */
  reentryRule: automation.reentryRule,
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

/** A second alias of `person`, reached through `loan.personId` rather than
 * `automationRun.personId` — a run that only names a loan (no person on the
 * run row itself) still needs someone to link to. */
const loanBorrower = alias(person, "automation_run_loan_borrower");

/**
 * What one automation has actually done, newest first.
 *
 * Every run carries its own plain-language account of the outcome, so the
 * timeline reports what happened rather than reconstructing it from an enum.
 * A run may name a person, a loan, both, or neither (a test run names
 * nobody) — the loan's own borrower is resolved as a fallback so a
 * loan-only run still links somewhere.
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
      loanId: automationRun.loanId,
      loanNumber: loan.loanNumber,
      loanPersonId: loan.personId,
      loanFirstName: loanBorrower.firstName,
      loanLastName: loanBorrower.lastName,
    })
    .from(automationRun)
    .leftJoin(person, eq(person.id, automationRun.personId))
    .leftJoin(loan, eq(loan.id, automationRun.loanId))
    .leftJoin(loanBorrower, eq(loanBorrower.id, loan.personId))
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

/**
 * Every active teammate, for the "who gets assigned as the owner" picker on
 * the edit form. `ownerAssignment` stores plain text rather than a foreign
 * key — "Round-robin" reads the same as a person's name — so this list only
 * populates the picker's options; it isn't enforced at save time.
 */
export async function listTeammateChoices(db: Db) {
  return db
    .select({ id: user.id, fullName: user.fullName })
    .from(user)
    .where(and(isNull(user.deletedAt), eq(user.status, "active")))
    .orderBy(asc(user.fullName));
}

export type TeammateChoice = Awaited<ReturnType<typeof listTeammateChoices>>[number];
