"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { campaign, template, event } from "@/db/schema";
import { requireUser, queryAs } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { audienceSize } from "@/lib/queries/marketing";
import { AUDIENCE_TYPES, audienceOption, policyRead } from "./vocabulary";

export type CampaignFormState = { error?: string };

const NewCampaignSchema = z
  .object({
    name: z.string().trim().min(1, "Give the campaign a name you'll recognise later."),
    templateId: z.string().uuid("Choose a template."),
    audienceType: z.enum(AUDIENCE_TYPES),
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
