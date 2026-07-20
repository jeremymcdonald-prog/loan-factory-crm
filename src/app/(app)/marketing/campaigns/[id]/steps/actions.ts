"use server";

/**
 * Campaign step actions — every mutation on `campaign_step` (M6).
 *
 * Same shape as every other campaign action in this module: requireUser +
 * canManageCampaigns (../../../vocabulary) + queryAs + zod + recordAudit.
 * Book scope is resolved through `getCampaign` (src/lib/queries/marketing.ts)
 * before any step is touched, since a step has no owner of its own — only
 * its parent campaign does (see the doc comment in
 * src/lib/queries/campaign-steps.ts).
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Db } from "@/db";
import { requireUser, queryAs, type CurrentUser } from "@/lib/auth";
import { recordAudit, diff } from "@/lib/audit";
import { getCampaign, type CampaignDetail } from "@/lib/queries/marketing";
import {
  appendCampaignStep,
  addCampaignStepLanguageVersion,
  countCampaignSteps,
  deleteCampaignStep,
  duplicateCampaignStep,
  getCampaignStep,
  moveCampaignStep,
  updateCampaignStep,
} from "@/lib/queries/campaign-steps";
import { canManageCampaigns, CAMPAIGN_LANGUAGE_CODES } from "../../../vocabulary";
import { STEP_CHANNELS, STEP_TRANSLATION_LANGUAGES, MAX_CAMPAIGN_STEPS } from "../../step-vocabulary";

export type StepFormState = { error?: string; ok?: string };

/** Mirrors resolveManaged in ../../../actions.ts (not exported there, so re-declared here). */
async function resolveManagedCampaign(
  db: Db,
  user: CurrentUser,
  campaignId: string,
): Promise<{ blocked: string } | { campaign: CampaignDetail }> {
  if (!canManageCampaigns(user.role)) {
    return { blocked: "Your role doesn't manage campaigns." };
  }
  const campaign = await getCampaign(db, user, campaignId);
  if (!campaign) return { blocked: "That campaign isn't in your book any more." };
  return { campaign };
}

function refresh(campaignId: string) {
  revalidatePath(`/marketing/campaigns/${campaignId}`);
  revalidatePath(`/marketing/campaigns/${campaignId}/steps`);
}

const SEND_TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const StepInputSchema = z.object({
  campaignId: z.string().uuid(),
  channel: z.enum(STEP_CHANNELS),
  delayDays: z.coerce
    .number()
    .int()
    .min(0, "Delay can't be negative.")
    .max(365, "Keep delays within a year."),
  sendTime: z
    .string()
    .trim()
    .regex(SEND_TIME_RE, "Use a 24-hour time like 09:00.")
    .optional()
    .or(z.literal("")),
  templateId: z.string().uuid().optional().or(z.literal("")),
  subject: z.string().trim().max(200, "Keep it under 200 characters.").optional().or(z.literal("")),
  body: z.string().trim().max(10000, "That's longer than any step needs.").optional().or(z.literal("")),
  approvalRequired: z.string().optional(),
  skipCondition: z.string().trim().max(500).optional().or(z.literal("")),
  stopCondition: z.string().trim().max(500).optional().or(z.literal("")),
  language: z.enum(CAMPAIGN_LANGUAGE_CODES),
});

function readStepInput(formData: FormData) {
  return StepInputSchema.safeParse({
    campaignId: formData.get("campaignId"),
    channel: formData.get("channel"),
    delayDays: formData.get("delayDays"),
    sendTime: formData.get("sendTime") ?? "",
    templateId: formData.get("templateId") ?? "",
    subject: formData.get("subject") ?? "",
    body: formData.get("body") ?? "",
    approvalRequired: formData.get("approvalRequired") ?? undefined,
    skipCondition: formData.get("skipCondition") ?? "",
    stopCondition: formData.get("stopCondition") ?? "",
    language: formData.get("language") ?? "en",
  });
}

/** Add a step at the end of the sequence — defaults (email, day 0, English, approval on). */
export async function addCampaignStepAction(
  _prev: StepFormState,
  formData: FormData,
): Promise<StepFormState> {
  const user = await requireUser();
  const parsed = readStepInput(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the step and try again." };
  }
  const input = parsed.data;

  try {
    const result = await queryAs(user, async (db) => {
      const resolved = await resolveManagedCampaign(db, user, input.campaignId);
      if ("blocked" in resolved) return resolved;

      const existingCount = await countCampaignSteps(db, input.campaignId);
      if (existingCount >= MAX_CAMPAIGN_STEPS) {
        return { blocked: `Keep it to ${MAX_CAMPAIGN_STEPS} steps or fewer.` };
      }

      const created = await appendCampaignStep(db, {
        tenantId: user.tenantId,
        campaignId: input.campaignId,
        channel: input.channel,
        delayDays: input.delayDays,
        sendTime: input.sendTime || null,
        templateId: input.templateId || null,
        subject: input.subject || null,
        body: input.body || null,
        approvalRequired: input.approvalRequired === "on",
        skipCondition: input.skipCondition || null,
        stopCondition: input.stopCondition || null,
        language: input.language,
      });

      await recordAudit(db, user, {
        action: "campaign.step_added",
        entity: "campaign_step",
        entityId: created.id,
        changes: {
          campaignId: { from: null, to: input.campaignId },
          channel: { from: null, to: created.channel },
          position: { from: null, to: created.position },
          delayDays: { from: null, to: created.delayDays },
          language: { from: null, to: created.language },
        },
      });

      return { ok: true as const };
    });

    if ("blocked" in result) return { error: result.blocked };
  } catch {
    return { error: "We couldn't add that step. Nothing was changed." };
  }

  refresh(input.campaignId);
  return { ok: "Step added." };
}

/** Save every editable field on one step. */
export async function updateCampaignStepAction(
  _prev: StepFormState,
  formData: FormData,
): Promise<StepFormState> {
  const user = await requireUser();
  const idParsed = z.string().uuid().safeParse(formData.get("id"));
  if (!idParsed.success) return { error: "That step could not be found." };

  const parsed = readStepInput(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the step and try again." };
  }
  const input = parsed.data;

  try {
    const result = await queryAs(user, async (db) => {
      const resolved = await resolveManagedCampaign(db, user, input.campaignId);
      if ("blocked" in resolved) return resolved;

      const before = await getCampaignStep(db, idParsed.data);
      if (!before || before.campaignId !== input.campaignId) {
        return { blocked: "That step isn't part of this campaign any more." };
      }

      const after = await updateCampaignStep(db, idParsed.data, {
        channel: input.channel,
        delayDays: input.delayDays,
        sendTime: input.sendTime || null,
        templateId: input.templateId || null,
        subject: input.subject || null,
        body: input.body || null,
        approvalRequired: input.approvalRequired === "on",
        skipCondition: input.skipCondition || null,
        stopCondition: input.stopCondition || null,
        language: input.language,
      });
      if (!after) return { blocked: "That step no longer exists." };

      const changes = diff(
        {
          channel: before.channel,
          delayDays: before.delayDays,
          sendTime: before.sendTime,
          templateId: before.templateId,
          subject: before.subject,
          body: before.body,
          approvalRequired: before.approvalRequired,
          skipCondition: before.skipCondition,
          stopCondition: before.stopCondition,
          language: before.language,
        },
        {
          channel: after.channel,
          delayDays: after.delayDays,
          sendTime: after.sendTime,
          templateId: after.templateId,
          subject: after.subject,
          body: after.body,
          approvalRequired: after.approvalRequired,
          skipCondition: after.skipCondition,
          stopCondition: after.stopCondition,
          language: after.language,
        },
      );

      await recordAudit(db, user, {
        action: "campaign.step_updated",
        entity: "campaign_step",
        entityId: after.id,
        changes,
      });

      return { ok: true as const };
    });

    if ("blocked" in result) return { error: result.blocked };
  } catch {
    return { error: "We couldn't save that step. Nothing was changed." };
  }

  refresh(input.campaignId);
  return { ok: "Step saved." };
}

const IdInput = z.object({ id: z.string().uuid(), campaignId: z.string().uuid() });

function readIdInput(formData: FormData) {
  return IdInput.safeParse({ id: formData.get("id"), campaignId: formData.get("campaignId") });
}

/** Remove one step and close the gap it leaves in the sequence. */
export async function removeCampaignStepAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const parsed = readIdInput(formData);
  if (!parsed.success) return;

  await queryAs(user, async (db) => {
    const resolved = await resolveManagedCampaign(db, user, parsed.data.campaignId);
    if ("blocked" in resolved) return;

    const existing = await getCampaignStep(db, parsed.data.id);
    if (!existing || existing.campaignId !== parsed.data.campaignId) return;

    await deleteCampaignStep(db, parsed.data.id);

    await recordAudit(db, user, {
      action: "campaign.step_removed",
      entity: "campaign_step",
      entityId: existing.id,
      changes: {
        channel: { from: existing.channel, to: null },
        position: { from: existing.position, to: null },
      },
    });
  });

  refresh(parsed.data.campaignId);
}

async function moveStep(formData: FormData, direction: "up" | "down"): Promise<void> {
  const user = await requireUser();
  const parsed = readIdInput(formData);
  if (!parsed.success) return;

  await queryAs(user, async (db) => {
    const resolved = await resolveManagedCampaign(db, user, parsed.data.campaignId);
    if ("blocked" in resolved) return;

    const existing = await getCampaignStep(db, parsed.data.id);
    if (!existing || existing.campaignId !== parsed.data.campaignId) return;

    const moved = await moveCampaignStep(db, parsed.data.id, direction);
    if (!moved) return;

    const after = await getCampaignStep(db, parsed.data.id);
    await recordAudit(db, user, {
      action: "campaign.step_reordered",
      entity: "campaign_step",
      entityId: existing.id,
      changes: { position: { from: existing.position, to: after?.position ?? null } },
    });
  });

  refresh(parsed.data.campaignId);
}

/** Move a step one place earlier in the sequence. */
export async function moveCampaignStepUpAction(formData: FormData): Promise<void> {
  return moveStep(formData, "up");
}

/** Move a step one place later in the sequence. */
export async function moveCampaignStepDownAction(formData: FormData): Promise<void> {
  return moveStep(formData, "down");
}

/** Clone a step immediately after itself. */
export async function duplicateCampaignStepAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const parsed = readIdInput(formData);
  if (!parsed.success) return;

  await queryAs(user, async (db) => {
    const resolved = await resolveManagedCampaign(db, user, parsed.data.campaignId);
    if ("blocked" in resolved) return;

    const existing = await getCampaignStep(db, parsed.data.id);
    if (!existing || existing.campaignId !== parsed.data.campaignId) return;

    const existingCount = await countCampaignSteps(db, parsed.data.campaignId);
    if (existingCount >= MAX_CAMPAIGN_STEPS) return;

    const created = await duplicateCampaignStep(db, parsed.data.id, user.tenantId);
    if (!created) return;

    await recordAudit(db, user, {
      action: "campaign.step_duplicated",
      entity: "campaign_step",
      entityId: created.id,
      changes: {
        copiedFrom: { from: null, to: existing.id },
        position: { from: null, to: created.position },
      },
    });
  });

  refresh(parsed.data.campaignId);
}

const LanguageVersionInput = z.object({
  id: z.string().uuid(),
  campaignId: z.string().uuid(),
  language: z.enum(STEP_TRANSLATION_LANGUAGES),
});

/** Add a translated sibling of a step — see step-vocabulary.ts for the language model. */
export async function addLanguageVersionAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const parsed = LanguageVersionInput.safeParse({
    id: formData.get("id"),
    campaignId: formData.get("campaignId"),
    language: formData.get("language"),
  });
  if (!parsed.success) return;

  await queryAs(user, async (db) => {
    const resolved = await resolveManagedCampaign(db, user, parsed.data.campaignId);
    if ("blocked" in resolved) return;

    const existing = await getCampaignStep(db, parsed.data.id);
    if (!existing || existing.campaignId !== parsed.data.campaignId) return;

    const existingCount = await countCampaignSteps(db, parsed.data.campaignId);
    if (existingCount >= MAX_CAMPAIGN_STEPS) return;

    const created = await addCampaignStepLanguageVersion(
      db,
      parsed.data.id,
      user.tenantId,
      parsed.data.language,
    );
    if (!created) return;

    await recordAudit(db, user, {
      action: "campaign.step_duplicated",
      entity: "campaign_step",
      entityId: created.id,
      changes: {
        copiedFrom: { from: null, to: existing.id },
        language: { from: null, to: created.language },
      },
    });
  });

  refresh(parsed.data.campaignId);
}
