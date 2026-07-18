"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { campaign, template, event } from "@/db/schema";
import type { Db } from "@/db";
import { requireUser, queryAs, type CurrentUser } from "@/lib/auth";
import { recordAudit, diff } from "@/lib/audit";
import { audienceSize, getCampaign, type CampaignDetail } from "@/lib/queries/marketing";
import {
  AUDIENCE_TYPES,
  CAMPAIGN_LANGUAGE_CODES,
  DRIP_CHANNELS,
  MAX_DRIP_STEPS,
  audienceOption,
  canActivate,
  canManageCampaigns,
  canPause,
  policyRead,
  type DripStep,
} from "./vocabulary";

export type CampaignFormState = { error?: string };

const NewCampaignSchema = z
  .object({
    name: z.string().trim().min(1, "Give the campaign a name you'll recognise later."),
    templateId: z.string().uuid("Choose a template."),
    audienceType: z.enum(AUDIENCE_TYPES),
    /** English unless deliberately chosen otherwise — en is the product default. */
    language: z.enum(CAMPAIGN_LANGUAGE_CODES).default("en"),
    /** "draft" saves it where it is; "scheduled" needs a date. */
    timing: z.enum(["draft", "scheduled"]),
    scheduledFor: z.string().trim().optional(),
  })
  .superRefine((input, ctx) => {
    if (input.timing !== "scheduled") return;

    if (!input.scheduledFor) {
      ctx.addIssue({
        code: "custom",
        path: ["scheduledFor"],
        message: "Pick the date and time this should go out.",
      });
      return;
    }
    const when = new Date(input.scheduledFor);
    if (Number.isNaN(when.getTime())) {
      ctx.addIssue({
        code: "custom",
        path: ["scheduledFor"],
        message: "That date didn't read as a real date and time.",
      });
      return;
    }
    if (when.getTime() <= Date.now()) {
      ctx.addIssue({
        code: "custom",
        path: ["scheduledFor"],
        message: "That time has already passed. Pick a time still to come.",
      });
    }
  });

/**
 * Create a campaign — as a draft, or scheduled for a date.
 *
 * The compliance gate is enforced here, not in the dialog. The dialog explains
 * a blocked template the moment it is picked, but the dialog is a courtesy: a
 * Server Action is a public endpoint, so the policy that says a template never
 * goes to a list is re-read from the database and re-checked below. A campaign
 * on a `manual_only` or `never_automate` template cannot be created by any
 * route into this function.
 *
 * Audience size is counted live rather than accepted from the form — the number
 * on the card has to be the number the rule actually reaches.
 */
export async function createCampaign(
  _prev: CampaignFormState,
  formData: FormData,
): Promise<CampaignFormState> {
  const user = await requireUser();

  const parsed = NewCampaignSchema.safeParse({
    name: formData.get("name"),
    templateId: formData.get("templateId"),
    audienceType: formData.get("audienceType"),
    language: formData.get("language") ?? "en",
    timing: formData.get("timing") ?? "draft",
    scheduledFor: formData.get("scheduledFor") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the details and try again." };
  }

  const input = parsed.data;
  const audience = audienceOption(input.audienceType);
  if (!audience) {
    return { error: "Choose who this should go to." };
  }

  let campaignId: string;

  try {
    const result = await queryAs(user, async (db) => {
      const [chosen] = await db
        .select({ id: template.id, ref: template.ref, name: template.name, policy: template.policy })
        .from(template)
        .where(eq(template.id, input.templateId))
        .limit(1);

      if (!chosen) return { blocked: "That template isn't in your library any more." as string };

      // The gate. Never trust the dialog to have held it.
      const policy = policyRead(chosen.policy);
      if (policy.campaignBlock) return { blocked: policy.campaignBlock };

      const size = await audienceSize(db, user, input.audienceType);
      if (size === 0) {
        return {
          blocked: `Nobody matches "${audience.label}" right now, so there is no one to send to.`,
        };
      }

      const scheduledFor =
        input.timing === "scheduled" && input.scheduledFor ? new Date(input.scheduledFor) : null;

      const [created] = await db
        .insert(campaign)
        .values({
          tenantId: user.tenantId,
          name: input.name,
          status: input.timing === "scheduled" ? "scheduled" : "draft",
          templateId: chosen.id,
          language: input.language,
          audience: { type: audience.type, label: audience.label },
          audienceSize: size,
          scheduledFor,
          ownerUserId: user.userId,
        })
        .returning({ id: campaign.id });

      await db.insert(event).values({
        tenantId: user.tenantId,
        kind: "campaign.created",
        actorUserId: user.userId,
        payload: {
          campaignId: created.id,
          templateRef: chosen.ref,
          audience: audience.type,
          audienceSize: size,
          status: input.timing === "scheduled" ? "scheduled" : "draft",
        },
      });

      await recordAudit(db, user, {
        action: "campaign.created",
        entity: "campaign",
        entityId: created.id,
        changes: {
          name: { from: null, to: input.name },
          status: { from: null, to: input.timing === "scheduled" ? "scheduled" : "draft" },
          template: { from: null, to: chosen.ref },
          language: { from: null, to: input.language },
          audience: { from: null, to: audience.label },
          audienceSize: { from: null, to: size },
          scheduledFor: { from: null, to: scheduledFor?.toISOString() ?? null },
        },
      });

      return { id: created.id };
    });

    if ("blocked" in result) return { error: result.blocked };
    campaignId = result.id;
  } catch {
    return { error: "We couldn't save that campaign. Nothing was created." };
  }

  revalidatePath("/marketing");
  redirect(`/marketing?created=${campaignId}`);
}

// ---------------------------------------------------------------------------
// Managing an existing campaign — edit, duplicate, pause, activate
// ---------------------------------------------------------------------------

/**
 * Every management action funnels through here: the role gate, then the fetch.
 * getCampaign carries the same book scope as the list, so a campaign outside
 * the caller's book resolves to null exactly as if it did not exist — a
 * processor is refused by role, a stranger's campaign by scope.
 */
async function resolveManaged(
  db: Db,
  user: CurrentUser,
  id: string,
): Promise<CampaignDetail | { blocked: string }> {
  if (!canManageCampaigns(user.role)) {
    return { blocked: "Your role doesn't manage campaigns." };
  }
  const existing = await getCampaign(db, user, id);
  if (!existing) return { blocked: "That campaign isn't in your book any more." };
  return existing;
}

function refreshCampaign(id: string) {
  revalidatePath("/marketing");
  revalidatePath(`/marketing/campaigns/${id}`);
}

const DripStepSchema = z.object({
  day: z.number().int().min(0, "Day offsets start at 0.").max(365, "Keep drip steps within a year."),
  channel: z.enum(DRIP_CHANNELS),
  subject: z.string().trim().min(1, "Every drip step needs a subject.").max(200),
});

const UpdateCampaignSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().trim().min(1, "Give the campaign a name you'll recognise later."),
    language: z.enum(CAMPAIGN_LANGUAGE_CODES),
    audienceType: z.enum(AUDIENCE_TYPES),
    /** Plain-language description of the rule; falls back to the type's label. */
    audienceDescription: z.string().trim().max(200).optional(),
    emailBody: z.string().trim().max(10000, "That email is longer than any inbox wants.").optional(),
    smsBody: z.string().trim().max(640, "Keep the text under four segments (640 characters).").optional(),
    videoTitle: z.string().trim().max(120).optional(),
    videoCaption: z.string().trim().max(200).optional(),
    timing: z.enum(["none", "scheduled"]),
    scheduledFor: z.string().trim().optional(),
    /** The drip editor serialises its steps to JSON in a hidden field. */
    drip: z.string().default("[]"),
  })
  .superRefine((input, ctx) => {
    if (input.timing !== "scheduled") return;
    if (!input.scheduledFor) {
      ctx.addIssue({
        code: "custom",
        path: ["scheduledFor"],
        message: "Pick the date and time this should go out.",
      });
      return;
    }
    if (Number.isNaN(new Date(input.scheduledFor).getTime())) {
      ctx.addIssue({
        code: "custom",
        path: ["scheduledFor"],
        message: "That date didn't read as a real date and time.",
      });
    }
  });

function parseDrip(raw: string): DripStep[] | { error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "The drip steps didn't come through. Reload and try again." };
  }
  const verdict = z.array(DripStepSchema).max(MAX_DRIP_STEPS, `Keep it to ${MAX_DRIP_STEPS} steps or fewer.`).safeParse(parsed);
  if (!verdict.success) {
    return { error: verdict.error.issues[0]?.message ?? "Check the drip steps and try again." };
  }
  // Stored in send order regardless of the order they were typed in.
  return [...verdict.data].sort((a, b) => a.day - b.day);
}

/**
 * Edit a campaign — name, language, audience rule, channel content, video
 * details, send timing, and the drip sequence.
 *
 * Audience size is recounted live on every save, same as create: the number on
 * the card is the number the rule reaches today. Timing moves status only
 * along the honest edges — a draft given a date becomes scheduled, a scheduled
 * campaign whose date is cleared becomes a draft. Running, paused, and
 * finished are never changed by the edit form; the pause/activate actions own
 * those transitions.
 */
export async function updateCampaign(
  _prev: CampaignFormState,
  formData: FormData,
): Promise<CampaignFormState> {
  const user = await requireUser();

  const parsed = UpdateCampaignSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    language: formData.get("language") ?? "en",
    audienceType: formData.get("audienceType"),
    audienceDescription: formData.get("audienceDescription") ?? undefined,
    emailBody: formData.get("emailBody") ?? undefined,
    smsBody: formData.get("smsBody") ?? undefined,
    videoTitle: formData.get("videoTitle") ?? undefined,
    videoCaption: formData.get("videoCaption") ?? undefined,
    timing: formData.get("timing") ?? "none",
    scheduledFor: formData.get("scheduledFor") ?? undefined,
    drip: formData.get("drip") ?? "[]",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the details and try again." };
  }

  const input = parsed.data;
  const audience = audienceOption(input.audienceType);
  if (!audience) return { error: "Choose who this should go to." };

  const drip = parseDrip(input.drip);
  if (!Array.isArray(drip)) return drip;
  const dripSteps = drip;

  try {
    const result = await queryAs(user, async (db) => {
      const existing = await resolveManaged(db, user, input.id);
      if ("blocked" in existing) return { blocked: existing.blocked };

      const audienceLabel = input.audienceDescription || audience.label;
      const size = await audienceSize(db, user, input.audienceType);

      // Timing only ever moves the two statuses that are about timing.
      const scheduledFor =
        input.timing === "scheduled" && input.scheduledFor
          ? new Date(input.scheduledFor)
          : null;
      let status = existing.status as
        | "draft"
        | "scheduled"
        | "running"
        | "paused"
        | "finished";
      if (existing.status === "draft" && scheduledFor) status = "scheduled";
      if (existing.status === "scheduled" && !scheduledFor) status = "draft";

      // Video: the campaign stores details only — the recording itself is a
      // demo-convention artifact that never leaves the composer's device.
      const priorVideo = existing.videoMeta ?? {};
      const videoMeta =
        input.videoTitle || input.videoCaption
          ? {
              ...priorVideo,
              title: input.videoTitle || null,
              caption: input.videoCaption || null,
              demo: true,
            }
          : null;

      await db
        .update(campaign)
        .set({
          name: input.name,
          language: input.language,
          audience: { type: audience.type, label: audienceLabel },
          audienceSize: size,
          emailBody: input.emailBody || null,
          smsBody: input.smsBody || null,
          videoMeta,
          drip: dripSteps,
          scheduledFor,
          status,
          updatedAt: new Date(),
        })
        .where(eq(campaign.id, existing.id));

      const changes = diff(
        {
          name: existing.name,
          language: existing.language,
          status: existing.status,
          audience: existing.audience?.label ?? null,
          audienceSize: existing.audienceSize,
          scheduledFor: existing.scheduledFor?.toISOString() ?? null,
          emailBody: existing.emailBody,
          smsBody: existing.smsBody,
          videoTitle: (existing.videoMeta?.title as string | undefined) ?? null,
          videoCaption: (existing.videoMeta?.caption as string | undefined) ?? null,
          drip: existing.drip ?? [],
        },
        {
          name: input.name,
          language: input.language,
          status,
          audience: audienceLabel,
          audienceSize: size,
          scheduledFor: scheduledFor?.toISOString() ?? null,
          emailBody: input.emailBody || null,
          smsBody: input.smsBody || null,
          videoTitle: input.videoTitle || null,
          videoCaption: input.videoCaption || null,
          drip: dripSteps,
        },
      );

      await recordAudit(db, user, {
        action: "campaign.updated",
        entity: "campaign",
        entityId: existing.id,
        changes,
      });

      return { id: existing.id };
    });

    if ("blocked" in result) return { error: result.blocked };
  } catch {
    return { error: "We couldn't save those changes. Nothing was changed." };
  }

  refreshCampaign(input.id);
  redirect(`/marketing/campaigns/${input.id}?saved=1`);
}

/**
 * Duplicate a campaign as a fresh draft — "Copy of …" with every piece of
 * content carried over and every number that recorded history left behind.
 * The copy belongs to whoever clicked, is never scheduled, and has sent
 * nothing, because it hasn't.
 */
export async function duplicateCampaign(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) return;

  let newId: string | null = null;

  const result = await queryAs(user, async (db) => {
    const existing = await resolveManaged(db, user, id.data);
    if ("blocked" in existing) return null;

    const [created] = await db
      .insert(campaign)
      .values({
        tenantId: user.tenantId,
        name: `Copy of ${existing.name}`.slice(0, 200),
        status: "draft",
        templateId: existing.templateId,
        language: existing.language as "en" | "vi" | "zh" | "es" | "ru",
        emailBody: existing.emailBody,
        smsBody: existing.smsBody,
        videoMeta: existing.videoMeta,
        drip: existing.drip ?? [],
        audience: existing.audience ?? {},
        audienceSize: existing.audienceSize,
        scheduledFor: null,
        ownerUserId: user.userId,
        sentCount: 0,
        openCount: 0,
        replyCount: 0,
      })
      .returning({ id: campaign.id });

    await recordAudit(db, user, {
      action: "campaign.duplicated",
      entity: "campaign",
      entityId: created.id,
      changes: {
        copiedFrom: { from: null, to: existing.id },
        name: { from: existing.name, to: `Copy of ${existing.name}` },
        status: { from: null, to: "draft" },
      },
    });

    return created.id;
  });

  newId = result;
  if (!newId) return;

  revalidatePath("/marketing");
  redirect(`/marketing/campaigns/${newId}`);
}

/** Pause a running campaign. The only edge this action knows is running → paused. */
export async function pauseCampaign(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) return;

  await queryAs(user, async (db) => {
    const existing = await resolveManaged(db, user, id.data);
    if ("blocked" in existing) return;
    if (!canPause(existing.status)) return;

    await db
      .update(campaign)
      .set({ status: "paused", updatedAt: new Date() })
      .where(eq(campaign.id, existing.id));

    await recordAudit(db, user, {
      action: "campaign.paused",
      entity: "campaign",
      entityId: existing.id,
      changes: { status: { from: existing.status, to: "paused" } },
    });
  });

  refreshCampaign(id.data);
}

/**
 * Set a draft, scheduled, or paused campaign running. "Running" is a CRM
 * status, not a send: nothing goes out until sending providers are connected,
 * and drafts queue for approval first — the button says so wherever it appears.
 */
export async function activateCampaign(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) return;

  await queryAs(user, async (db) => {
    const existing = await resolveManaged(db, user, id.data);
    if ("blocked" in existing) return;
    if (!canActivate(existing.status)) return;

    await db
      .update(campaign)
      .set({ status: "running", updatedAt: new Date() })
      .where(eq(campaign.id, existing.id));

    await recordAudit(db, user, {
      action: "campaign.activated",
      entity: "campaign",
      entityId: existing.id,
      changes: { status: { from: existing.status, to: "running" } },
    });
  });

  refreshCampaign(id.data);
}
