/**
 * Authorization helpers.
 *
 * The proxy (src/proxy.ts) does an optimistic cookie check only. Every Server
 * Action and every data read re-checks here, because Server Actions POST to the
 * page's own route and can slip past a proxy matcher
 * (Next.js docs, proxy.md: "Always verify authentication and authorization
 * inside each Server Function rather than relying on Proxy alone").
 */
import "server-only";
import { redirect } from "next/navigation";
import { readSession, type SessionClaims } from "./session";
import { withTenant, type Db, type TenantContext } from "@/db";

export type CurrentUser = SessionClaims;

/** Returns the session or sends the user to login. Use in every protected surface. */
export async function requireUser(): Promise<CurrentUser> {
  const session = await readSession();
  if (!session) redirect("/login");
  return session;
}

export async function getUser(): Promise<CurrentUser | null> {
  return readSession();
}

/** The tenant context every database transaction runs under. */
export function contextOf(user: CurrentUser): TenantContext {
  return { tenantId: user.tenantId, userId: user.userId, role: user.role };
}

/**
 * Run a query as the signed-in user, inside their tenant's RLS context.
 * This is the only way application code should reach the database.
 */
export async function queryAs<T>(
  user: CurrentUser,
  fn: (db: Db) => Promise<T>,
): Promise<T> {
  return withTenant(contextOf(user), fn);
}

/** requireUser + tenant-scoped query in one step. */
export async function withCurrentUser<T>(
  fn: (db: Db, user: CurrentUser) => Promise<T>,
): Promise<T> {
  const user = await requireUser();
  return queryAs(user, (db) => fn(db, user));
}

// --- Role helpers ------------------------------------------------------------
// The vocabulary itself lives in @/lib/roles so client components can use it.

export { ROLE_LABELS, ROLE_DESCRIPTIONS, seesWholeBook, canManageUsers } from "./roles";

export function requireRole(user: CurrentUser, allowed: string[]): void {
  if (!allowed.includes(user.role)) {
    throw new Error("You do not have permission to do that.");
  }
}
