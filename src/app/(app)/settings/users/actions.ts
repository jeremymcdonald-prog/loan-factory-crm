"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { user as userTable } from "@/db/schema";
import { requireUser, queryAs } from "@/lib/auth";
import { canManageUsers, ROLES } from "@/lib/roles";
import { recordAudit, diff } from "@/lib/audit";
import { hashPassword } from "@/lib/password";

export type UserFormState = { error?: string; ok?: string };

const InviteSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the person's full name."),
  email: z.string().trim().email("Enter a valid work email address."),
  role: z.enum(ROLES),
  nmlsId: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  tempPassword: z
    .string()
    .min(10, "Use at least 10 characters for the starter password."),
});

export async function inviteUser(
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const actor = await requireUser();
  // Re-checked here, not just in the proxy: Server Actions POST to the page's
  // own route and can bypass a proxy matcher.
  if (!canManageUsers(actor.role)) {
    return { error: "Only an administrator can add teammates." };
  }

  const parsed = InviteSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    role: formData.get("role"),
    nmlsId: formData.get("nmlsId") || undefined,
    phone: formData.get("phone") || undefined,
    tempPassword: formData.get("tempPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the details and try again." };
  }

  const input = parsed.data;

  if (input.role === "lo" && !input.nmlsId) {
    return { error: "A loan officer needs an NMLS ID — it appears in every signature." };
  }

  try {
    await queryAs(actor, async (db) => {
      const existing = await db
        .select({ id: userTable.id })
        .from(userTable)
        .where(eq(userTable.email, input.email.toLowerCase()))
        .limit(1);

      if (existing.length > 0) {
        throw new Error("Someone with that email is already on the team.");
      }

      const passwordHash = await hashPassword(input.tempPassword);
      const [created] = await db
        .insert(userTable)
        .values({
          tenantId: actor.tenantId,
          email: input.email.toLowerCase(),
          passwordHash,
          fullName: input.fullName,
          role: input.role,
          nmlsId: input.nmlsId,
          phone: input.phone,
          status: "active",
        })
        .returning({ id: userTable.id });

      await recordAudit(db, actor, {
        action: "user.created",
        entity: "user",
        entityId: created.id,
        changes: {
          email: { from: null, to: input.email.toLowerCase() },
          role: { from: null, to: input.role },
          fullName: { from: null, to: input.fullName },
        },
      });
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "We couldn't add that teammate.",
    };
  }

  revalidatePath("/settings/users");
  return { ok: `${input.fullName} can now sign in.` };
}

const RoleChangeSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(ROLES),
});

export async function changeRole(formData: FormData): Promise<void> {
  const actor = await requireUser();
  if (!canManageUsers(actor.role)) return;

  const parsed = RoleChangeSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });
  if (!parsed.success) return;

  await queryAs(actor, async (db) => {
    const [before] = await db
      .select({ id: userTable.id, role: userTable.role })
      .from(userTable)
      .where(eq(userTable.id, parsed.data.userId))
      .limit(1);

    if (!before || before.role === parsed.data.role) return;

    await db
      .update(userTable)
      .set({ role: parsed.data.role, updatedAt: new Date() })
      .where(eq(userTable.id, parsed.data.userId));

    await recordAudit(db, actor, {
      action: "user.role_changed",
      entity: "user",
      entityId: parsed.data.userId,
      changes: diff({ role: before.role }, { role: parsed.data.role }),
    });
  });

  revalidatePath("/settings/users");
}

export async function setUserStatus(formData: FormData): Promise<void> {
  const actor = await requireUser();
  if (!canManageUsers(actor.role)) return;

  const userId = String(formData.get("userId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!userId || !["active", "disabled"].includes(status)) return;

  // An admin cannot lock themselves out.
  if (userId === actor.userId) return;

  await queryAs(actor, async (db) => {
    const [before] = await db
      .select({ status: userTable.status })
      .from(userTable)
      .where(and(eq(userTable.id, userId)))
      .limit(1);
    if (!before) return;

    await db
      .update(userTable)
      .set({ status: status as "active" | "disabled", updatedAt: new Date() })
      .where(eq(userTable.id, userId));

    await recordAudit(db, actor, {
      action: status === "active" ? "user.enabled" : "user.disabled",
      entity: "user",
      entityId: userId,
      changes: diff({ status: before.status }, { status }),
    });
  });

  revalidatePath("/settings/users");
}
