/**
 * Campaign step queries — the read/write layer for `campaign_step` (M6), the
 * real multi-step drip model that replaces the flat `campaign.drip` jsonb in
 * the product surface. `drip` itself is untouched — it stays on the campaign
 * row as a legacy/offline-export artifact; nothing here reads or writes it.
 *
 * `campaign_step` carries tenant-only RLS (see
 * src/db/migrations/0010_settings_integrations_persona_steps.sql) — a step has
 * no owner of its own, unlike a campaign. Book scope (who may see/manage a
 * given campaign's steps) is therefore the caller's job: every export here
 * takes an already-resolved campaign id, and callers must resolve that id via
 * `getCampaign` (src/lib/queries/marketing.ts, which book-scopes) before ever
 * touching a step. The Server Actions in
 * src/app/(app)/marketing/campaigns/[id]/steps/actions.ts do exactly that.
 */
import "server-only";
import { and, asc, eq, gt, sql } from "drizzle-orm";
import type { Db } from "@/db";
import { campaignStep, template } from "@/db/schema";

type StepInsert = typeof campaignStep.$inferInsert;

/** The 7 channels a step can go out on — matches the `step_channel` enum. */
export type StepChannelValue = NonNullable<StepInsert["channel"]>;
/** The `language` enum as campaign_step declares it (the module UI offers a subset). */
export type StepLanguageValue = NonNullable<StepInsert["language"]>;

export type CampaignStepRow = {
  id: string;
  campaignId: string;
  position: number;
  channel: StepChannelValue;
  delayDays: number;
  sendTime: string | null;
  templateId: string | null;
  /** Joined from `template` — null when no template is attached. */
  templateRef: string | null;
  templateName: string | null;
  subject: string | null;
  body: string | null;
  approvalRequired: boolean;
  skipCondition: string | null;
  stopCondition: string | null;
  language: StepLanguageValue;
  createdAt: Date;
  updatedAt: Date;
};

const STEP_COLUMNS = {
  id: campaignStep.id,
  campaignId: campaignStep.campaignId,
  position: campaignStep.position,
  channel: campaignStep.channel,
  delayDays: campaignStep.delayDays,
  sendTime: campaignStep.sendTime,
  templateId: campaignStep.templateId,
  templateRef: template.ref,
  templateName: template.name,
  subject: campaignStep.subject,
  body: campaignStep.body,
  approvalRequired: campaignStep.approvalRequired,
  skipCondition: campaignStep.skipCondition,
  stopCondition: campaignStep.stopCondition,
  language: campaignStep.language,
  createdAt: campaignStep.createdAt,
  updatedAt: campaignStep.updatedAt,
};

/** Every step in a campaign, in send order — for the detail page and the step editor. */
export async function listCampaignSteps(db: Db, campaignId: string): Promise<CampaignStepRow[]> {
  const rows = await db
    .select(STEP_COLUMNS)
    .from(campaignStep)
    .leftJoin(template, eq(template.id, campaignStep.templateId))
    .where(eq(campaignStep.campaignId, campaignId))
    .orderBy(asc(campaignStep.position), asc(campaignStep.createdAt));
  return rows as CampaignStepRow[];
}

/** One step, whole — every mutation resolves its target through this first. */
export async function getCampaignStep(db: Db, id: string): Promise<CampaignStepRow | null> {
  const [row] = await db
    .select(STEP_COLUMNS)
    .from(campaignStep)
    .leftJoin(template, eq(template.id, campaignStep.templateId))
    .where(eq(campaignStep.id, id))
    .limit(1);
  return (row as CampaignStepRow | undefined) ?? null;
}

export async function countCampaignSteps(db: Db, campaignId: string): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(campaignStep)
    .where(eq(campaignStep.campaignId, campaignId));
  return Number(row?.n ?? 0);
}

async function nextPosition(db: Db, campaignId: string): Promise<number> {
  const [row] = await db
    .select({ max: sql<number>`COALESCE(MAX(${campaignStep.position}), -1)::int` })
    .from(campaignStep)
    .where(eq(campaignStep.campaignId, campaignId));
  return (row?.max ?? -1) + 1;
}

export type NewStepInput = {
  tenantId: string;
  campaignId: string;
  channel: StepChannelValue;
  delayDays: number;
  sendTime: string | null;
  templateId: string | null;
  subject: string | null;
  body: string | null;
  approvalRequired: boolean;
  skipCondition: string | null;
  stopCondition: string | null;
  language: StepLanguageValue;
};

/** Appends a step at the end of the sequence. */
export async function appendCampaignStep(db: Db, input: NewStepInput): Promise<CampaignStepRow> {
  const position = await nextPosition(db, input.campaignId);
  const [created] = await db
    .insert(campaignStep)
    .values({ ...input, position })
    .returning({ id: campaignStep.id });
  const row = await getCampaignStep(db, created.id);
  if (!row) throw new Error("The step disappeared immediately after being created.");
  return row;
}

/**
 * Inserts a step immediately after `afterId`, shifting every later step in
 * the same campaign down by one position. Used by both "Duplicate step" and
 * "Add a language version" — a language version is simply another step row
 * (see the doc comment on the step editor for why that's the chosen model).
 */
export async function insertCampaignStepAfter(
  db: Db,
  afterId: string,
  input: NewStepInput,
): Promise<CampaignStepRow> {
  const after = await getCampaignStep(db, afterId);
  if (!after) throw new Error("The step to insert after no longer exists.");
  const position = after.position + 1;

  await db
    .update(campaignStep)
    .set({ position: sql`${campaignStep.position} + 1` })
    .where(
      and(eq(campaignStep.campaignId, after.campaignId), gt(campaignStep.position, after.position)),
    );

  const [created] = await db
    .insert(campaignStep)
    .values({ ...input, position })
    .returning({ id: campaignStep.id });
  const row = await getCampaignStep(db, created.id);
  if (!row) throw new Error("The step disappeared immediately after being created.");
  return row;
}

export type StepPatch = Partial<{
  channel: StepChannelValue;
  delayDays: number;
  sendTime: string | null;
  templateId: string | null;
  subject: string | null;
  body: string | null;
  approvalRequired: boolean;
  skipCondition: string | null;
  stopCondition: string | null;
  language: StepLanguageValue;
}>;

export async function updateCampaignStep(
  db: Db,
  id: string,
  patch: StepPatch,
): Promise<CampaignStepRow | null> {
  await db
    .update(campaignStep)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(campaignStep.id, id));
  return getCampaignStep(db, id);
}

/** Deletes one step and compacts the positions of every step after it. */
export async function deleteCampaignStep(db: Db, id: string): Promise<CampaignStepRow | null> {
  const existing = await getCampaignStep(db, id);
  if (!existing) return null;

  await db.delete(campaignStep).where(eq(campaignStep.id, id));
  await db
    .update(campaignStep)
    .set({ position: sql`${campaignStep.position} - 1` })
    .where(
      and(
        eq(campaignStep.campaignId, existing.campaignId),
        gt(campaignStep.position, existing.position),
      ),
    );
  return existing;
}

/**
 * Swaps a step with its immediate neighbor. Returns false (no-op) when the
 * step is already at that end of the sequence. A sentinel position (-1)
 * avoids ever holding two rows at the same position mid-swap — there's no
 * unique constraint on (campaignId, position) today, but this keeps the swap
 * correct even if one is added later.
 */
export async function moveCampaignStep(
  db: Db,
  id: string,
  direction: "up" | "down",
): Promise<boolean> {
  const current = await getCampaignStep(db, id);
  if (!current) return false;

  const neighborPosition = direction === "up" ? current.position - 1 : current.position + 1;
  if (neighborPosition < 0) return false;

  const [neighbor] = await db
    .select({ id: campaignStep.id, position: campaignStep.position })
    .from(campaignStep)
    .where(
      and(
        eq(campaignStep.campaignId, current.campaignId),
        eq(campaignStep.position, neighborPosition),
      ),
    )
    .limit(1);
  if (!neighbor) return false;

  await db.update(campaignStep).set({ position: -1 }).where(eq(campaignStep.id, current.id));
  await db
    .update(campaignStep)
    .set({ position: current.position })
    .where(eq(campaignStep.id, neighbor.id));
  await db
    .update(campaignStep)
    .set({ position: neighborPosition })
    .where(eq(campaignStep.id, current.id));
  return true;
}

/** Clones a step immediately after itself — same content, a fresh row. */
export async function duplicateCampaignStep(
  db: Db,
  id: string,
  tenantId: string,
): Promise<CampaignStepRow | null> {
  const source = await getCampaignStep(db, id);
  if (!source) return null;

  return insertCampaignStepAfter(db, id, {
    tenantId,
    campaignId: source.campaignId,
    channel: source.channel,
    delayDays: source.delayDays,
    sendTime: source.sendTime,
    templateId: source.templateId,
    subject: source.subject,
    body: source.body,
    approvalRequired: source.approvalRequired,
    skipCondition: source.skipCondition,
    stopCondition: source.stopCondition,
    language: source.language,
  });
}

/**
 * Adds a translated sibling of a step immediately after it: same channel,
 * delay, template, and approval rule, but blank content and the requested
 * language — a human writes and reviews that language's copy fresh, rather
 * than the CRM machine-translating what's already there.
 */
export async function addCampaignStepLanguageVersion(
  db: Db,
  sourceId: string,
  tenantId: string,
  language: StepLanguageValue,
): Promise<CampaignStepRow | null> {
  const source = await getCampaignStep(db, sourceId);
  if (!source) return null;

  return insertCampaignStepAfter(db, sourceId, {
    tenantId,
    campaignId: source.campaignId,
    channel: source.channel,
    delayDays: source.delayDays,
    sendTime: source.sendTime,
    templateId: source.templateId,
    subject: null,
    body: null,
    approvalRequired: source.approvalRequired,
    skipCondition: null,
    stopCondition: null,
    language,
  });
}

/**
 * Copies every step from one campaign to another, preserving position order
 * — used when a whole campaign is duplicated (M6 requirement 4). Returns how
 * many steps were copied, purely so the caller can note it in an audit entry.
 */
export async function copyCampaignSteps(
  db: Db,
  opts: { tenantId: string; fromCampaignId: string; toCampaignId: string },
): Promise<number> {
  const steps = await listCampaignSteps(db, opts.fromCampaignId);
  if (steps.length === 0) return 0;

  await db.insert(campaignStep).values(
    steps.map((s) => ({
      tenantId: opts.tenantId,
      campaignId: opts.toCampaignId,
      position: s.position,
      channel: s.channel,
      delayDays: s.delayDays,
      sendTime: s.sendTime,
      templateId: s.templateId,
      subject: s.subject,
      body: s.body,
      approvalRequired: s.approvalRequired,
      skipCondition: s.skipCondition,
      stopCondition: s.stopCondition,
      language: s.language,
    })),
  );
  return steps.length;
}
