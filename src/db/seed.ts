/**
 * Seed — demonstration data (Phase 1 walking-skeleton item 13).
 *
 * Fake but mortgage-real: names, programs, stages, and dates that behave like a
 * working broker shop so Today, Pipeline, and the approval queue have something
 * true to say. Data-safety rule from QA_Plan: fixtures only, no real borrowers.
 * Idempotent — safe to re-run; it truncates the tenant's data first.
 */
import { config } from "dotenv";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import * as schema from "./schema";
import { hashPassword } from "../lib/password";

config({ path: ".env.local" });

const TENANT_ID = "0a9c8f42-1d3e-4b7a-9c21-8f6d5e4b3a20";

/** Fixed ids keep re-runs stable and make screenshots reproducible. */
const U = {
  minh: "1a000000-0000-4000-8000-000000000001",
  sarah: "1a000000-0000-4000-8000-000000000002",
  david: "1a000000-0000-4000-8000-000000000003",
  linh: "1a000000-0000-4000-8000-000000000004",
  james: "1a000000-0000-4000-8000-000000000005",
};

const TEAM_ID = "2b000000-0000-4000-8000-000000000001";

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function hoursFromNow(n: number): Date {
  return new Date(Date.now() + n * 3_600_000);
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function main() {
  const url = process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error("MIGRATION_DATABASE_URL or DATABASE_URL must be set");

  const pool = new Pool({ connectionString: url, max: 1 });
  const db = drizzle(pool, { schema });

  console.log("Seeding demonstration data…");

  // Clean slate for this tenant (children first). One statement per call:
  // node-postgres prepares each query, and a prepared statement cannot carry
  // multiple commands.
  await db.execute(sql`DELETE FROM ai_action_log WHERE tenant_id = ${TENANT_ID}`);
  await db.execute(sql`DELETE FROM ai_insight WHERE tenant_id = ${TENANT_ID}`);
  await db.execute(sql`DELETE FROM audit_log WHERE tenant_id = ${TENANT_ID}`);
  await db.execute(sql`DELETE FROM event WHERE tenant_id = ${TENANT_ID}`);
  await db.execute(sql`DELETE FROM note WHERE tenant_id = ${TENANT_ID}`);
  await db.execute(sql`DELETE FROM task WHERE tenant_id = ${TENANT_ID}`);
  await db.execute(sql`DELETE FROM appointment WHERE tenant_id = ${TENANT_ID}`);
  await db.execute(sql`DELETE FROM loan_stage_history WHERE tenant_id = ${TENANT_ID}`);
  await db.execute(sql`DELETE FROM lead WHERE tenant_id = ${TENANT_ID}`);
  await db.execute(sql`DELETE FROM loan WHERE tenant_id = ${TENANT_ID}`);
  await db.execute(sql`DELETE FROM person WHERE tenant_id = ${TENANT_ID}`);
  await db.execute(sql`UPDATE team SET leader_user_id = NULL WHERE tenant_id = ${TENANT_ID}`);
  await db.execute(sql`DELETE FROM "user" WHERE tenant_id = ${TENANT_ID}`);
  await db.execute(sql`DELETE FROM team WHERE tenant_id = ${TENANT_ID}`);
  await db.execute(sql`DELETE FROM tenant WHERE id = ${TENANT_ID}`);

  await db.insert(schema.tenant).values({
    id: TENANT_ID,
    name: "Loan Factory",
    status: "active",
    companyNmls: "320841",
    settings: {
      defaultLanguages: ["en", "vi"],
      compensation: "lender_paid_only",
      equalHousing: true,
    },
  });

  await db.insert(schema.team).values({
    id: TEAM_ID,
    tenantId: TENANT_ID,
    name: "Bellevue Team",
    branch: "Bellevue, WA",
  });

  // Demo password. Local fixtures only — never a production credential.
  const demoHash = await hashPassword("Demo1234!");

  await db.insert(schema.user).values([
    {
      id: U.minh,
      tenantId: TENANT_ID,
      authUserId: U.minh,
      email: "minh@loanfactory.com",
      passwordHash: demoHash,
      fullName: "Minh Nguyen",
      phone: "(425) 555-0142",
      nmlsId: "1856432",
      role: "lo",
      teamId: TEAM_ID,
      language: "en",
      websiteUrl: "https://loanfactory.com/minh",
      status: "active",
    },
    {
      id: U.sarah,
      tenantId: TENANT_ID,
      authUserId: U.sarah,
      email: "sarah@loanfactory.com",
      passwordHash: demoHash,
      fullName: "Sarah Whitfield",
      phone: "(425) 555-0188",
      role: "lo_assistant",
      teamId: TEAM_ID,
      status: "active",
    },
    {
      id: U.david,
      tenantId: TENANT_ID,
      authUserId: U.david,
      email: "david@loanfactory.com",
      passwordHash: demoHash,
      fullName: "David Ortega",
      phone: "(425) 555-0193",
      role: "processor",
      teamId: TEAM_ID,
      status: "active",
    },
    {
      id: U.linh,
      tenantId: TENANT_ID,
      authUserId: U.linh,
      email: "linh@loanfactory.com",
      passwordHash: demoHash,
      fullName: "Linh Trần",
      phone: "(425) 555-0117",
      nmlsId: "1902244",
      role: "team_leader",
      teamId: TEAM_ID,
      language: "vi",
      status: "active",
    },
    {
      id: U.james,
      tenantId: TENANT_ID,
      authUserId: U.james,
      email: "admin@loanfactory.com",
      passwordHash: demoHash,
      fullName: "James Okafor",
      role: "admin",
      teamId: TEAM_ID,
      status: "active",
    },
  ]);

  await db
    .update(schema.team)
    .set({ leaderUserId: U.linh })
    .where(sql`id = ${TEAM_ID}`);

  console.log(`  tenant: Loan Factory (NMLS 320841)`);
  console.log(`  users:  5 (lo, lo_assistant, processor, team_leader, admin)`);
  console.log("");
  console.log("Sign in with:  minh@loanfactory.com  /  Demo1234!");

  await pool.end();
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});

export { TENANT_ID, U as SEED_USERS, TEAM_ID, daysFromNow, hoursFromNow, isoDate };
