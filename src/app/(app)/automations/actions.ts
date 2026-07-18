"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { automation, automationRun, campaign } from "@/db/schema";
import { requireUser, queryAs } from "@/lib/auth";
import { recordAudit, diff } from "@/lib/audit";
import { seesWholeBook } from "@/lib/roles";
import { SOURCES, TEST_RUN_OUTCOME } from "./labels";

export type AutomationActionState = { error?: string; tested?: boolean };
export type AutomationFormState = { error?: string };

/**
 * The words on an automation. Everything a human may edit here is text: what
 * sets it off, who it touches, what it does. The approval level is not a field
 * on either form — see createAutomation.
 */
const WordsSchema = z.object({
  name: z.string().trim().min(3, "Give it a name you'll recognise later."),
  description: z.string().trim().optional(),
  triggerText: z.string().trim().min(4, "Say what sets this off, in your own words."),
  audienceText: z
    .string()
    .trim()
    .min(2, "Say who it touches. “Nobody — this one is just for me” is a fine answer."),
  actionText: z.string().trim().min(4, "Say what should happen when it fires."),
});

function wordsFrom(formData: FormData) {
  return {
    name: formData.get("name"),
    description: formData.get("description") ?? undefined,
    triggerText: formData.get("triggerText"),
    audienceText: formData.get("audienceText"),
    actionText: formData.get("actionText"),
  };
}

/**
 * Build a new automation.
 *
 * It is born switched off, and at t2 — AI prepares, a human approves. A rule
 * somebody just typed has not earned the right to act on its own, and nothing
 * on the form can grant it: the tier is deliberately not a field.
 */
export async function createAutomation(
  _prev: AutomationFormState,
  formData: FormData,
): Promise<AutomationFormState> {
  const user = await requireUser();

  const parsed = WordsSchema.safeParse(wordsFrom(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the details and try again." };
  }

  const input = parsed.data;
  let automationId: string;

  try {
    automationId = await queryAs(user, async (db) => {
      const [created] = await db
        .insert(automation)
        .values({
          tenantId: user.tenantId,
          name: input.name,
          description: input.description || null,
          triggerText: input.triggerText,
          audienceText: input.audienceText,
          actionText: input.actionText,
          tier: "t2",
          status: "draft",
        })
        .returning({ id: automation.id });

      await recordAudit(db, user, {
        action: "automation.created",
        entity: "automation",
        entityId: created.id,
        changes: {
          name: { from: null, to: input.name },
          tier: { from: null, to: "t2" },
          status: { from: null, to: "draft" },
        },
      });

      return created.id;
    });
  } catch {
    return { error: "We couldn't save that. Nothing was changed." };
  }

  revalidatePath("/automations");
  redirect(`/automations/${automationId}`);
}

const EditSchema = WordsSchema.extend({
  automationId: z.string().uuid(),
  /** "" means "no source" — an empty <select> option, not a typo. */
  source: z.enum(SOURCES).or(z.literal("")).optional(),
  /** "" means "no campaign linked". */
  campaignId: z.string().uuid().or(z.literal("")).optional(),
  timingText: z.string().trim().optional(),
  tier: z.enum(["t0", "t1", "t2", "t3"]),
  status: z.enum(["active", "paused", "draft"]),
});

/**
 * Rewrite an automation: its words, its source, the campaign it enrolls people
 * into, its timing, its status — and, only for roles that see the whole book,
 * its approval level. Changing what an automation says and changing what it is
 * allowed to do are two different acts, and only the second one is dangerous,
 * so the tier is re-checked against the caller's role here rather than trusted
 * from the form.
 */
export async function updateAutomation(formData: FormData): Promise<AutomationFormState> {
  const user = await requireUser();

  const parsed = EditSchema.safeParse({
    ...wordsFrom(formData),
    automationId: formData.get("automationId"),
    source: formData.get("source") ?? undefined,
    campaignId: formData.get("campaignId") ?? undefined,
    timingText: formData.get("timingText") ?? undefined,
    tier: formData.get("tier"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the details and try again." };
  }

  const { automationId, tier, status, ...words } = parsed.data;
  const after = {
    name: words.name,
    description: words.description || null,
    triggerText: words.triggerText,
    audienceText: words.audienceText,
    actionText: words.actionText,
    source: words.source || null,
    campaignId: words.campaignId || null,
    timingText: words.timingText || null,
    tier,
    status,
  };

  try {
    await queryAs(user, async (db) => {
      const [before] = await db
        .select({
          name: automation.name,
          description: automation.description,
          triggerText: automation.triggerText,
          audienceText: automation.audienceText,
          actionText: automation.actionText,
          source: automation.source,
          campaignId: automation.campaignId,
          timingText: automation.timingText,
          tier: automation.tier,
          status: automation.status,
        })
        .from(automation)
        .where(and(eq(automation.id, automationId), isNull(automation.deletedAt)))
        .limit(1);

      if (!before) throw new Error("not-visible");

      // Moving the approval level is the one edit reserved for leadership.
      if (after.tier !== before.tier && !seesWholeBook(user.role)) {
        throw new Error("tier-forbidden");
      }

      // The campaign must be one this tenant can actually see. RLS scopes the
      // lookup, so a foreign or deleted campaign simply fails to appear.
      if (after.campaignId && after.campaignId !== before.campaignId) {
        const [linked] = await db
          .select({ id: campaign.id })
          .from(campaign)
          .where(and(eq(campaign.id, after.campaignId), isNull(campaign.deletedAt)))
          .limit(1);
        if (!linked) throw new Error("campaign-not-visible");
      }

      // Only what actually moved reaches the audit log, so the history reads as
      // a list of edits rather than a list of saves.
      const changes = diff({ ...before }, after);
      if (Object.keys(changes).length === 0) return;

      await db
        .update(automation)
        .set({ ...after, updatedAt: new Date() })
        .where(eq(automation.id, automationId));

      await recordAudit(db, user, {
        action: "automation.updated",
        entity: "automation",
        entityId: automationId,
        changes,
      });
    });
  } catch (err) {
    if (err instanceof Error && err.message === "tier-forbidden") {
      return {
        error:
          "Only a team leader, branch leader, or admin can change how much an automation is allowed to do. Nothing was changed.",
      };
    }
    if (err instanceof Error && err.message === "campaign-not-visible") {
      return { error: "We couldn't find that campaign. Nothing was changed." };
    }
    return { error: "We couldn't save that. Nothing was changed." };
  }

  revalidatePath("/automations");
  revalidatePath(`/automations/${automationId}`);
  return {};
}

const StatusSchema = z.object({
  automationId: z.string().uuid(),
  status: z.enum(["active", "paused"]),
});

/** Turn one on or off. A draft goes live through this same door. */
export async function setAutomationStatus(
  _prev: AutomationActionState,
  formData: FormData,
): Promise<AutomationActionState> {
  const user = await requireUser();

  const parsed = StatusSchema.safeParse({
    automationId: formData.get("automationId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: "That isn't a change we can make." };

  const { automationId, status } = parsed.data;

  try {
    await queryAs(user, async (db) => {
      const [before] = await db
        .select({ status: automation.status })
        .from(automation)
        .where(and(eq(automation.id, automationId), isNull(automation.deletedAt)))
        .limit(1);

      if (!before) throw new Error("not-visible");
      if (before.status === status) return;

      await db
        .update(automation)
        .set({ status, updatedAt: new Date() })
        .where(eq(automation.id, automationId));

      await recordAudit(db, user, {
        action: status === "active" ? "automation.activated" : "automation.paused",
        entity: "automation",
        entityId: automationId,
        changes: { status: { from: before.status, to: status } },
      });
    });
  } catch {
    return { error: "We couldn't change that. Nothing was changed." };
  }

  revalidatePath("/automations");
  revalidatePath(`/automations/${automationId}`);
  return {};
}

const TestSchema = z.object({ automationId: z.string().uuid() });

/**
 * Test one — which means: send nothing.
 *
 * The test writes the run the automation would have written and stops there, so
 * what you read afterwards is exactly what it prepares and nothing else. The
 * outcome text is chosen by tier, because a t0 automation drafts nothing and
 * saying otherwise would be a lie told by the safety feature itself.
 *
 * A test counts as a run: it appears in the run history immediately, so
 * `runCount` and `lastRunAt` move with it — the row itself says plainly that it
 * was a test and that nothing was sent.
 */
export async function testAutomation(
  _prev: AutomationActionState,
  formData: FormData,
): Promise<AutomationActionState> {
  const user = await requireUser();

  const parsed = TestSchema.safeParse({ automationId: formData.get("automationId") });
  if (!parsed.success) return { error: "We couldn't find that automation." };

  const { automationId } = parsed.data;

  try {
    await queryAs(user, async (db) => {
      const [row] = await db
        .select({ tier: automation.tier })
        .from(automation)
        .where(and(eq(automation.id, automationId), isNull(automation.deletedAt)))
        .limit(1);

      if (!row) throw new Error("not-visible");

      await db.insert(automationRun).values({
        tenantId: user.tenantId,
        automationId,
        status: "queued_for_approval",
        outcome: TEST_RUN_OUTCOME[row.tier],
      });

      await db
        .update(automation)
        .set({
          runCount: sql`${automation.runCount} + 1`,
          lastRunAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(automation.id, automationId));

      await recordAudit(db, user, {
        action: "automation.tested",
        entity: "automation",
        entityId: automationId,
      });
    });
  } catch {
    return { error: "We couldn't record that test. Nothing was sent." };
  }

  revalidatePath("/automations");
  revalidatePath(`/automations/${automationId}`);
  return { tested: true };
}
