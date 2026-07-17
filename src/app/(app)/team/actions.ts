"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { user as userTable } from "@/db/schema";
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
