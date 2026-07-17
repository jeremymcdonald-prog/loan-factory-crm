/**
 * Database access — Technical_Architecture.md §4.
 *
 * Tenant safety lives in the database, not in developer discipline. Every
 * query runs inside a transaction that has set `app.tenant_id`; the RLS
 * policies in the migrations compare that setting to each row's `tenant_id`.
 * A query without a valid tenant context returns zero rows by database policy,
 * even if application code has a bug.
 *
 * The app connects as `lfcrm_app`, which is NOSUPERUSER / NOBYPASSRLS — the
 * local stand-in for Supabase's authenticated role. Nothing here can reach
 * another tenant's rows.
 */
import "server-only";
import { Pool, type PoolClient } from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export type Db = NodePgDatabase<typeof schema>;

export type TenantContext = {
  tenantId: string;
  userId: string;
  role: string;
};

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env.local and set it.",
  );
}

declare global {
  var __lfcrmPool: Pool | undefined;
}

// Reuse the pool across hot reloads in development.
const pool =
  global.__lfcrmPool ??
  new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
  });

if (process.env.NODE_ENV !== "production") {
  global.__lfcrmPool = pool;
}

/**
 * Run `fn` inside a transaction scoped to one tenant and user.
 *
 * `set_config(..., true)` makes the setting transaction-local, so a pooled
 * connection can never leak one request's tenant context into the next.
 *
 * Queries inside `fn` must be SEQUENTIAL. They all share this one client and
 * one transaction, so `Promise.all` would issue overlapping statements on a
 * single connection — node-postgres deprecates that and the results can
 * interleave. Await each query in turn; if a page genuinely needs concurrency,
 * use separate withTenant() calls, which take separate clients.
 */
export async function withTenant<T>(
  ctx: TenantContext,
  fn: (db: Db) => Promise<T>,
): Promise<T> {
  const client: PoolClient = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT set_config('app.tenant_id', $1, true)", [ctx.tenantId]);
    await client.query("SELECT set_config('app.user_id', $1, true)", [ctx.userId]);
    await client.query("SELECT set_config('app.user_role', $1, true)", [ctx.role]);

    const db = drizzle(client, { schema });
    const result = await fn(db);

    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * The one query allowed to run before a tenant is known: resolving a login.
 *
 * It calls a SECURITY DEFINER function rather than reading `user` directly, so
 * the app role still holds no cross-tenant read privilege of its own. The
 * function returns only the fields the login flow needs.
 */
export async function findUserForLogin(email: string): Promise<{
  id: string;
  tenantId: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: string;
  status: string;
} | null> {
  const { rows } = await pool.query(
    `SELECT id, tenant_id, email, password_hash, full_name, role, status
       FROM auth_find_user($1)`,
    [email.toLowerCase().trim()],
  );
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    tenantId: r.tenant_id,
    email: r.email,
    passwordHash: r.password_hash,
    fullName: r.full_name,
    role: r.role,
    status: r.status,
  };
}

/** Record a successful login without needing a tenant context first. */
export async function markLogin(userId: string): Promise<void> {
  await pool.query("SELECT auth_mark_login($1)", [userId]);
}

export { pool, schema };
