"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { user as userTable, task as taskTable } from "@/db/schema";
import { requireUser, queryAs } from "@/lib/auth";
import { seesWholeBook } from "@/lib/roles";
import { recordAudit } from "@/lib/audit";

const ViewAsSchema = z.object({ userId: z.string().uuid() });

/**
 * Record that someone opened a teammate's queue, then send them there.
 *
 * Looking at another person's book is a privileged act, so it leaves a mark:
 * the audit row is written first and the redirect happens after, outside the
 * transaction. That ordering is the whole point — `redirect()` throws, so a
 * redirect inside `queryAs` would roll the audit row back and still navigate,
 * which is exactly the silent, unlogged look-up this is meant to prevent.
 *
 * Re-checked here rather than trusting the caller: a Server Action POSTs to the
 * page's own route, so hiding the button is not access control.
 */
export async function recordViewAs(formData: FormData): Promise<void> {
  const actor = await requireUser();
  if (!seesWholeBook(actor.role)) return;

  const parsed = ViewAsSchema.safeParse({ userId: formData.get("userId") });
  if (!parsed.success) return;

  const { userId } = parsed.data;

  await queryAs(actor, async (db) => {
    // RLS keeps this inside the tenant; confirm the person is real and visible
    // before logging that we looked at them.
    const [target] = await db
      .select({ id: userTable.id, fullName: userTable.fullName })
      .from(userTable)
      .where(and(eq(userTable.id, userId), isNull(userTable.deletedAt)))
      .limit(1);

    if (!target) throw new Error("not-visible");

    await recordAudit(db, actor, {
      action: "user.viewed_as",
      entity: "user",
      entityId: userId,
      changes: { queueOpened: { from: null, to: target.fullName } },
    });
  });

  revalidatePath("/today");
  redirect(`/today?as=${userId}`);
}

const ReassignSchema = z.object({
  taskId: z.string().uuid(),
  toUserId: z.string().uuid(),
});

export type ReassignState = { error?: string; ok?: string };

/**
 * Move a task to another teammate.
 *
 * A leader's tool for balancing load, so it is gated the same way view-as is:
 * only roles that see the whole book may reassign, the target must be a real,
 * active teammate, and the move is audited with both names — work should never
 * change hands silently.
 */
export async function reassignTask(
  _prev: ReassignState,
  formData: FormData,
): Promise<ReassignState> {
  const actor = await requireUser();
  if (!seesWholeBook(actor.role)) {
    return { error: "Only a team leader can reassign someone else's task." };
  }

  const parsed = ReassignSchema.safeParse({
    taskId: formData.get("taskId"),
    toUserId: formData.get("toUserId"),
  });
  if (!parsed.success) return { error: "Pick a teammate first." };

  const { taskId, toUserId } = parsed.data;

  try {
    return await queryAs(actor, async (db) => {
      const [taskRow] = await db
        .select({
          id: taskTable.id,
          title: taskTable.title,
          ownerUserId: taskTable.ownerUserId,
          status: taskTable.status,
        })
        .from(taskTable)
        .where(and(eq(taskTable.id, taskId), isNull(taskTable.deletedAt)))
        .limit(1);

      if (!taskRow) return { error: "That task no longer exists." };
      if (taskRow.status !== "open") {
        return { error: "That task is already closed — nothing to reassign." };
      }
      if (taskRow.ownerUserId === toUserId) {
        return { error: "They already own that task." };
      }

      const [fromUser] = await db
        .select({ fullName: userTable.fullName })
        .from(userTable)
        .where(eq(userTable.id, taskRow.ownerUserId))
        .limit(1);

      const [target] = await db
        .select({ id: userTable.id, fullName: userTable.fullName, status: userTable.status })
        .from(userTable)
        .where(and(eq(userTable.id, toUserId), isNull(userTable.deletedAt)))
        .limit(1);

      if (!target || target.status !== "active") {
        return { error: "Pick an active teammate." };
      }

      await db
        .update(taskTable)
        .set({ ownerUserId: toUserId, updatedAt: new Date() })
        .where(eq(taskTable.id, taskId));

      await recordAudit(db, actor, {
        action: "task.reassigned",
        entity: "task",
        entityId: taskId,
        changes: {
          owner: { from: fromUser?.fullName ?? "Unknown", to: target.fullName },
        },
      });

      return { ok: `Moved to ${target.fullName}.` };
    });
  } catch {
    return { error: "We couldn't reassign that. Nothing was changed." };
  } finally {
    revalidatePath("/team");
    revalidatePath("/today");
  }
}
