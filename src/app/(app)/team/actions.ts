"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { user as userTable, task as taskTable, team as teamTable } from "@/db/schema";
import type { Db } from "@/db";
import { requireUser, queryAs } from "@/lib/auth";
import { seesWholeBook, canManageUsers } from "@/lib/roles";
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

// ---------------------------------------------------------------------------
// Team membership — add, remove, join
// ---------------------------------------------------------------------------

const TeamMemberSchema = z.object({ userId: z.string().uuid() });
const JoinTeamSchema = z.object({ teamId: z.string().uuid() });

export type TeamActionState = { error?: string; ok?: string };

/** Leaders and admins shape teams; everyone else uses "Join a team". */
function canShapeTeam(role: string): boolean {
  return seesWholeBook(role) || canManageUsers(role);
}

/** The name of a team, or null when there is no such visible team. */
async function teamName(db: Db, teamId: string): Promise<string | null> {
  const [row] = await db
    .select({ name: teamTable.name })
    .from(teamTable)
    .where(eq(teamTable.id, teamId))
    .limit(1);
  return row?.name ?? null;
}

/**
 * A leader pulls a loan officer onto their own team.
 *
 * Gated server-side like everything on this page: hiding the control is not
 * access control. The membership change and its audit row commit in the same
 * transaction, so a member never appears without the record of who added them.
 */
export async function addTeamMember(
  _prev: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const actor = await requireUser();
  if (!canShapeTeam(actor.role)) {
    return { error: "Only a team leader can add members." };
  }

  const parsed = TeamMemberSchema.safeParse({ userId: formData.get("userId") });
  if (!parsed.success) return { error: "Pick a loan officer first." };
  const { userId } = parsed.data;

  try {
    return await queryAs(actor, async (db) => {
      const [me] = await db
        .select({ teamId: userTable.teamId })
        .from(userTable)
        .where(eq(userTable.id, actor.userId))
        .limit(1);
      if (!me?.teamId) {
        return { error: "You're not on a team yet, so there's nowhere to add them." };
      }

      const myTeamName = await teamName(db, me.teamId);
      if (!myTeamName) return { error: "Your team no longer exists." };

      const [target] = await db
        .select({
          id: userTable.id,
          fullName: userTable.fullName,
          status: userTable.status,
          teamId: userTable.teamId,
        })
        .from(userTable)
        .where(and(eq(userTable.id, userId), isNull(userTable.deletedAt)))
        .limit(1);

      if (!target) return { error: "That person no longer exists." };
      if (target.status !== "active") {
        return { error: "They can't join a team until their access is active." };
      }
      if (target.teamId === me.teamId) {
        return { error: "They're already on your team." };
      }

      const fromTeam = target.teamId ? await teamName(db, target.teamId) : null;

      await db
        .update(userTable)
        .set({ teamId: me.teamId, updatedAt: new Date() })
        .where(eq(userTable.id, target.id));

      await recordAudit(db, actor, {
        action: "team.member_added",
        entity: "user",
        entityId: target.id,
        changes: { team: { from: fromTeam, to: myTeamName } },
      });

      return { ok: `${target.fullName} is now on ${myTeamName}.` };
    });
  } catch {
    return { error: "We couldn't add them. Nothing was changed." };
  } finally {
    revalidatePath("/team");
  }
}

/**
 * A leader takes someone off a team (teamId → null). Leaders may only clear
 * their own team; an admin may clear anyone's. Audited, like being added.
 */
export async function removeTeamMember(
  _prev: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const actor = await requireUser();
  if (!canShapeTeam(actor.role)) {
    return { error: "Only a team leader can remove members." };
  }

  const parsed = TeamMemberSchema.safeParse({ userId: formData.get("userId") });
  if (!parsed.success) return { error: "Something went wrong — nobody was removed." };
  const { userId } = parsed.data;

  if (userId === actor.userId) {
    return { error: "To leave your own team, use “Join a team” to move instead." };
  }

  try {
    return await queryAs(actor, async (db) => {
      const [target] = await db
        .select({
          id: userTable.id,
          fullName: userTable.fullName,
          teamId: userTable.teamId,
        })
        .from(userTable)
        .where(and(eq(userTable.id, userId), isNull(userTable.deletedAt)))
        .limit(1);

      if (!target) return { error: "That person no longer exists." };
      if (!target.teamId) return { error: "They're not on a team." };

      // A leader manages their own team; only an admin reaches across teams.
      if (!canManageUsers(actor.role)) {
        const [me] = await db
          .select({ teamId: userTable.teamId })
          .from(userTable)
          .where(eq(userTable.id, actor.userId))
          .limit(1);
        if (me?.teamId !== target.teamId) {
          return { error: "They're on a different team — only an admin can change that." };
        }
      }

      const fromTeam = await teamName(db, target.teamId);

      await db
        .update(userTable)
        .set({ teamId: null, updatedAt: new Date() })
        .where(eq(userTable.id, target.id));

      await recordAudit(db, actor, {
        action: "team.member_removed",
        entity: "user",
        entityId: target.id,
        changes: { team: { from: fromTeam, to: null } },
      });

      return { ok: `${target.fullName} is off the team.` };
    });
  } catch {
    return { error: "We couldn't remove them. Nothing was changed." };
  } finally {
    revalidatePath("/team");
  }
}

/**
 * Self-service: a loan officer picks their own team. No role gate — choosing
 * where you sit is not a privileged act — but it is still validated, scoped by
 * RLS to the tenant's teams, and audited as `team.joined`.
 */
export async function joinTeam(
  _prev: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const actor = await requireUser();

  const parsed = JoinTeamSchema.safeParse({ teamId: formData.get("teamId") });
  if (!parsed.success) return { error: "Pick a team first." };
  const { teamId } = parsed.data;

  try {
    return await queryAs(actor, async (db) => {
      const toTeam = await teamName(db, teamId);
      if (!toTeam) return { error: "That team no longer exists." };

      const [me] = await db
        .select({ teamId: userTable.teamId })
        .from(userTable)
        .where(eq(userTable.id, actor.userId))
        .limit(1);

      if (me?.teamId === teamId) {
        return { error: `You're already on ${toTeam}.` };
      }

      const fromTeam = me?.teamId ? await teamName(db, me.teamId) : null;

      await db
        .update(userTable)
        .set({ teamId, updatedAt: new Date() })
        .where(eq(userTable.id, actor.userId));

      await recordAudit(db, actor, {
        action: "team.joined",
        entity: "user",
        entityId: actor.userId,
        changes: { team: { from: fromTeam, to: toTeam } },
      });

      return { ok: `Welcome to ${toTeam}.` };
    });
  } catch {
    return { error: "We couldn't move you. Nothing was changed." };
  } finally {
    revalidatePath("/team");
  }
}
