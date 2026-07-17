"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { loan, loanStageHistory, event } from "@/db/schema";
import { requireUser, queryAs } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { STAGES } from "@/lib/stages";

export type StageState = { error?: string };

const AdvanceSchema = z.object({
  loanId: z.string().uuid(),
  toStage: z.enum(STAGES),
  note: z.string().trim().optional(),
});

/**
 * Move an opportunity to a stage.
 *
 * The stage is CRM visibility of where the relationship stands — the team
 * records it; the CRM never gates or performs the underlying loan work (D-22).
 * Every change writes `loan_stage_history` in the same transaction
 * (Data_Model §3.6), which is append-only at the privilege level.
 */
export async function setStage(_prev: StageState, formData: FormData): Promise<StageState> {
  const user = await requireUser();

  const parsed = AdvanceSchema.safeParse({
    loanId: formData.get("loanId"),
    toStage: formData.get("toStage"),
    note: formData.get("note") ?? undefined,
  });

  if (!parsed.success) return { error: "That stage isn't valid." };

  const { loanId, toStage, note } = parsed.data;
  const now = new Date();

  try {
    await queryAs(user, async (db) => {
      const [current] = await db
        .select({
          stage: loan.stage,
          personId: loan.personId,
          updatedAt: loan.updatedAt,
        })
        .from(loan)
        .where(eq(loan.id, loanId))
        .limit(1);

      if (!current) throw new Error("not-visible");
      if (current.stage === toStage) return;

      const daysInPrevious = Math.max(
        0,
        Math.round((now.getTime() - current.updatedAt.getTime()) / 86_400_000),
      );

      await db
        .update(loan)
        .set({
          stage: toStage,
          lastActivityAt: now,
          stalledSince: null,
          updatedAt: now,
          // Reaching Funded settles the file's disposition.
          ...(toStage === "funded"
            ? { status: "funded" as const, fundedAt: now.toISOString().slice(0, 10) }
            : {}),
        })
        .where(eq(loan.id, loanId));

      await db.insert(loanStageHistory).values({
        tenantId: user.tenantId,
        loanId,
        fromStage: current.stage,
        toStage,
        changedByUserId: user.userId,
        note: note || null,
        daysInPreviousStage: daysInPrevious,
      });

      await db.insert(event).values({
        tenantId: user.tenantId,
        kind: "loan.stage_advanced",
        personId: current.personId,
        loanId,
        actorUserId: user.userId,
        payload: { from: current.stage, to: toStage },
      });

      await recordAudit(db, user, {
        action: "loan.stage_changed",
        entity: "loan",
        entityId: loanId,
        changes: { stage: { from: current.stage, to: toStage } },
      });
    });
  } catch {
    return { error: "We couldn't move that stage. Nothing was changed." };
  }

  revalidatePath(`/opportunities/${loanId}`);
  revalidatePath("/pipeline");
  revalidatePath("/today");
  return {};
}

const DocsSchema = z.object({
  loanId: z.string().uuid(),
  docsNeeded: z.enum(["true", "false"]),
  summary: z.string().trim().optional(),
});

/**
 * Raise or clear the docs-needed follow-up flag.
 *
 * This is a communication trigger, not a document tracker: the needs list and
 * the documents themselves live in the loan system, permanently outside the
 * CRM boundary (Data_Model §3.6, D-22).
 */
export async function setDocsNeeded(formData: FormData): Promise<void> {
  const user = await requireUser();

  const parsed = DocsSchema.safeParse({
    loanId: formData.get("loanId"),
    docsNeeded: formData.get("docsNeeded"),
    summary: formData.get("summary") ?? undefined,
  });
  if (!parsed.success) return;

  const { loanId, summary } = parsed.data;
  const raising = parsed.data.docsNeeded === "true";
  const now = new Date();

  await queryAs(user, async (db) => {
    const [before] = await db
      .select({ docsNeeded: loan.docsNeeded })
      .from(loan)
      .where(eq(loan.id, loanId))
      .limit(1);
    if (!before) return;

    await db
      .update(loan)
      .set({
        docsNeeded: raising,
        docsNeededSummary: raising ? (summary ?? null) : null,
        docsNeededSince: raising ? (before.docsNeeded ? undefined : now) : null,
        lastActivityAt: now,
        updatedAt: now,
      })
      .where(eq(loan.id, loanId));

    await recordAudit(db, user, {
      action: raising ? "loan.docs_needed_raised" : "loan.docs_needed_cleared",
      entity: "loan",
      entityId: loanId,
      changes: { docsNeeded: { from: before.docsNeeded, to: raising } },
    });
  });

  revalidatePath(`/opportunities/${loanId}`);
  revalidatePath("/today");
}
