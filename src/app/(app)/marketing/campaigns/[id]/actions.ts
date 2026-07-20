"use server";

/**
 * `duplicateCampaignWithSteps` — M6's replacement for the campaign detail
 * page's Duplicate button.
 *
 * The original `duplicateCampaign` (../../actions.ts) is out of scope for
 * this task ("shared — leave it") and, being a void Server Action that
 * redirects internally, has no way to hand back the new campaign's id for a
 * second step here to then copy `campaign_step` rows onto. So this is a
 * sibling action, not a wrapper: it repeats the same "Copy of …" campaign-row
 * insert `duplicateCampaign` does (name, status reset to draft, content and
 * `drip` carried over untouched, history left behind, ownership to whoever
 * clicked), and then additionally copies every step via
 * `copyCampaignSteps` (src/lib/queries/campaign-steps.ts) — satisfying M6
 * requirement 4 without editing the shared file.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { campaign } from "@/db/schema";
import { requireUser, queryAs } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { getCampaign } from "@/lib/queries/marketing";
import { copyCampaignSteps } from "@/lib/queries/campaign-steps";
import { canManageCampaigns } from "../../vocabulary";

export async function duplicateCampaignWithSteps(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) return;

  const newId = await queryAs(user, async (db) => {
    if (!canManageCampaigns(user.role)) return null;
    const existing = await getCampaign(db, user, id.data);
    if (!existing) return null;

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

    const stepCount = await copyCampaignSteps(db, {
      tenantId: user.tenantId,
      fromCampaignId: existing.id,
      toCampaignId: created.id,
    });

    await recordAudit(db, user, {
      action: "campaign.duplicated",
      entity: "campaign",
      entityId: created.id,
      changes: {
        copiedFrom: { from: null, to: existing.id },
        name: { from: existing.name, to: `Copy of ${existing.name}` },
        status: { from: null, to: "draft" },
        steps: { from: null, to: `${stepCount} step(s) copied` },
      },
    });

    return created.id;
  });

  if (!newId) return;

  revalidatePath("/marketing");
  redirect(`/marketing/campaigns/${newId}`);
}
