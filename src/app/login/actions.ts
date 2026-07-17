"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { findUserForLogin, markLogin, withTenant } from "@/db";
import { auditLog } from "@/db/schema";
import { verifyPassword } from "@/lib/password";
import { createSession, destroySession, readSession } from "@/lib/session";

export type LoginState = { error?: string };

const LoginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  next: z.string().optional(),
});

/**
 * Sign in. Failures are deliberately indistinguishable (no "unknown email"
 * vs "wrong password") so the form cannot be used to enumerate staff accounts.
 */
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details and try again." };
  }

  const { email, password, next } = parsed.data;
  const record = await findUserForLogin(email);
  const genericFailure = { error: "That email and password don't match. Try again." };

  if (!record) {
    // Constant-ish work even for unknown accounts, so timing doesn't leak.
    await verifyPassword(password, "scrypt$65536$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAA");
    return genericFailure;
  }

  const ok = await verifyPassword(password, record.passwordHash);
  if (!ok) return genericFailure;

  if (record.status !== "active") {
    return { error: "This account is not active. Ask your administrator to enable it." };
  }

  await markLogin(record.id);

  await withTenant(
    { tenantId: record.tenantId, userId: record.id, role: record.role },
    async (db) => {
      await db.insert(auditLog).values({
        tenantId: record.tenantId,
        actorUserId: record.id,
        action: "user.login",
        entity: "user",
        entityId: record.id,
      });
    },
  );

  await createSession({
    userId: record.id,
    tenantId: record.tenantId,
    role: record.role,
    fullName: record.fullName,
    email: record.email,
  });

  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/today";
  redirect(target);
}

export async function logout(): Promise<void> {
  const session = await readSession();
  if (session) {
    await withTenant(
      { tenantId: session.tenantId, userId: session.userId, role: session.role },
      async (db) => {
        await db.insert(auditLog).values({
          tenantId: session.tenantId,
          actorUserId: session.userId,
          action: "user.logout",
          entity: "user",
          entityId: session.userId,
        });
      },
    );
  }
  await destroySession();
  redirect("/login");
}
