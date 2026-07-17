"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import {
  aiInsight,
  aiActionLog,
  task,
  note,
  conversation,
  message,
  event,
} from "@/db/schema";
import { requireUser, queryAs } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";

export type ApprovalState = { error?: string; ok?: string };

const VerdictSchema = z.object({
  insightId: z.string().uuid(),
  /** The canonical verdict set (D-19). No screen invents its own. */
  verdict: z.enum(["approve", "edit_approve", "skip"]),
  editedBody: z.string().trim().optional(),
  reason: z
    .enum([
      "wrong_timing",
      "wrong_tone",
      "wrong_recipient",
      "factually_wrong",
      "compliance_concern",
      "not_needed",
      "other",
    ])
    .optional(),
});

/**
 * Record a human verdict on something Ally prepared.
 *
 * This is the enforcement point of the Ally contract (D-05): an insight only
 * ever leaves `pending` because a person decided. Ally cannot call this.
 *
 * Honest about sending: no email/SMS provider is connected (Integration_Map —
 * nothing is confirmed), so approving a draft records the approval and files
 * the message as approved-and-ready. It does not claim to have sent it. The
 * moment a provider is contracted, the send step slots in behind this same
 * approval record — the audit trail is already correct.
 */
export async function decideInsight(
  _prev: ApprovalState,
  formData: FormData,
): Promise<ApprovalState> {
  const user = await requireUser();

  const parsed = VerdictSchema.safeParse({
    insightId: formData.get("insightId"),
    verdict: formData.get("verdict"),
    editedBody: formData.get("editedBody") ?? undefined,
    reason: formData.get("reason") ?? undefined,
  });

  if (!parsed.success) return { error: "We couldn't record that. Try again." };

  const { insightId, verdict, editedBody, reason } = parsed.data;
  const now = new Date();

  try {
    return await queryAs(user, async (db) => {
      const [insight] = await db
        .select()
        .from(aiInsight)
        .where(and(eq(aiInsight.id, insightId), eq(aiInsight.status, "pending")))
        .limit(1);

      if (!insight) return { error: "That item has already been handled." };

      // A T0 topic must never have become an approvable card in the first
      // place. If one ever reaches here, refuse rather than send.
      if (insight.tier === "t0") {
        return {
          error:
            "This topic is never automated — it needs a personal call, not an approval.",
        };
      }

      const status =
        verdict === "approve"
          ? "approved"
          : verdict === "edit_approve"
            ? "edited_approved"
            : "rejected";

      await db
        .update(aiInsight)
        .set({
          status,
          decidedByUserId: user.userId,
          decidedAt: now,
          decisionReason: reason ?? null,
          editedBody: verdict === "edit_approve" ? (editedBody ?? null) : null,
          updatedAt: now,
        })
        .where(eq(aiInsight.id, insightId));

      // Every verdict is logged with the actor, the timestamp, and the diff.
      await db.insert(aiActionLog).values({
        tenantId: user.tenantId,
        insightId,
        action: `insight.${verdict}`,
        model: "mock-ally-v1",
        actorUserId: user.userId,
        detail: {
          verdict,
          reason: reason ?? null,
          edited: verdict === "edit_approve",
          originalLength: insight.body?.length ?? 0,
          finalLength: (verdict === "edit_approve" ? editedBody : insight.body)?.length ?? 0,
        },
      });

      await recordAudit(db, user, {
        action: `ally.${verdict}`,
        entity: "ai_insight",
        entityId: insightId,
        changes: { status: { from: "pending", to: status } },
      });

      if (verdict === "skip") {
        return { ok: "Skipped. Ally will learn from that." };
      }

      const finalBody = verdict === "edit_approve" ? (editedBody ?? insight.body) : insight.body;

      // A drafted message becomes an approved message on the record.
      if ((insight.kind === "draft_email" || insight.kind === "draft_sms") && finalBody) {
        const channel = insight.kind === "draft_sms" ? "sms" : "email";

        const [conv] = await db
          .insert(conversation)
          .values({
            tenantId: user.tenantId,
            subject: insight.title,
            channel,
            personId: insight.personId,
            loanId: insight.loanId,
            ownerUserId: user.userId,
            lastMessageAt: now,
            awaitingReply: false,
          })
          .returning({ id: conversation.id });

        await db.insert(message).values({
          tenantId: user.tenantId,
          conversationId: conv.id,
          channel,
          direction: "outbound",
          // Approved, not sent: no provider is connected yet.
          status: "approved",
          subject: insight.title,
          body: finalBody,
          preparedByAlly: true,
          templateRef: insight.templateRef,
          languageCode: insight.languageCode,
          authorUserId: user.userId,
          approvedByUserId: user.userId,
          approvedAt: now,
          occurredAt: now,
        });

        await db.insert(event).values({
          tenantId: user.tenantId,
          kind: "message.approved",
          personId: insight.personId,
          loanId: insight.loanId,
          actorUserId: user.userId,
          payload: { channel, templateRef: insight.templateRef },
        });

        return {
          ok: "Approved and saved to the conversation. It will send once your email account is connected in Settings.",
        };
      }

      // A next-best-action becomes a task the user owns.
      if (insight.kind === "next_best_action") {
        await db.insert(task).values({
          tenantId: user.tenantId,
          title: insight.title,
          detail: insight.rationale,
          ownerUserId: user.userId,
          dueAt: now,
          status: "open",
          priority: "high",
          personId: insight.personId,
          loanId: insight.loanId,
        });
        return { ok: "Added to your tasks." };
      }

      if (finalBody) {
        await db.insert(note).values({
          tenantId: user.tenantId,
          body: finalBody,
          authorUserId: user.userId,
          personId: insight.personId,
          loanId: insight.loanId,
          preparedByAlly: true,
        });
      }

      return { ok: "Saved." };
    });
  } catch {
    return { error: "We couldn't record that. Nothing was changed." };
  } finally {
    revalidatePath("/today");
    revalidatePath("/conversations");
  }
}

const CompleteTaskSchema = z.object({ taskId: z.string().uuid() });

export async function completeTask(formData: FormData): Promise<void> {
  const user = await requireUser();
  const parsed = CompleteTaskSchema.safeParse({ taskId: formData.get("taskId") });
  if (!parsed.success) return;

  const now = new Date();

  await queryAs(user, async (db) => {
    const [row] = await db
      .select({ id: task.id, status: task.status })
      .from(task)
      .where(eq(task.id, parsed.data.taskId))
      .limit(1);
    if (!row || row.status !== "open") return;

    await db
      .update(task)
      .set({ status: "done", completedAt: now, completedByUserId: user.userId, updatedAt: now })
      .where(eq(task.id, parsed.data.taskId));

    await recordAudit(db, user, {
      action: "task.completed",
      entity: "task",
      entityId: parsed.data.taskId,
      changes: { status: { from: "open", to: "done" } },
    });
  });

  revalidatePath("/today");
}
