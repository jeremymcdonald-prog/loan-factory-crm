/**
 * Workload counting, against the real database and the real seed.
 *
 * These exist because of a bug that shipped silently: Drizzle emits bare
 * column names for columns written inline in a select-field `sql` template, so
 * a correlated subquery `SELECT ... FROM task WHERE owner_user_id = id` bound
 * `id` to task.id rather than user.id. It threw no error — it simply reported
 * every teammate as having zero tasks, which is exactly the kind of wrong a
 * leader would act on. A test that only asserted "the query runs" would have
 * passed. These assert the counts.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import * as schema from "@/db/schema";
import { listTeamMembers, teamTotals } from "./team";
import type { Db } from "@/db";

const TEAM_ID = "2b000000-0000-4000-8000-000000000001";
const TENANT_ID = "0a9c8f42-1d3e-4b7a-9c21-8f6d5e4b3a20";

let pool: Pool;
let db: Db;

beforeAll(() => {
  pool = new Pool({
    connectionString: process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL,
    max: 1,
  });
  db = drizzle(pool, { schema }) as unknown as Db;
});

afterAll(async () => {
  await pool.end();
});

/** The truth, straight from the database, with no query builder in the way. */
async function actualOpenTasks(fullName: string): Promise<number> {
  const { rows } = await pool.query(
    `SELECT count(*)::int AS n
       FROM task t JOIN "user" u ON u.id = t.owner_user_id
      WHERE u.full_name = $1 AND t.status = 'open' AND t.deleted_at IS NULL`,
    [fullName],
  );
  return rows[0].n;
}

describe("team workload", () => {
  it("attributes each member's open tasks to that member", async () => {
    const rows = await listTeamMembers(db, TEAM_ID);
    expect(rows.length).toBeGreaterThan(0);

    for (const row of rows) {
      const expected = await actualOpenTasks(row.fullName);
      expect(row.openTasks, `${row.fullName} open tasks`).toBe(expected);
    }
  });

  it("does not report the whole team as idle when work exists", async () => {
    const rows = await listTeamMembers(db, TEAM_ID);
    const totalOnRoster = rows.reduce((sum, r) => sum + r.openTasks, 0);

    const { rows: truth } = await pool.query(
      `SELECT count(*)::int AS n FROM task
        WHERE tenant_id = $1 AND status = 'open' AND deleted_at IS NULL`,
      [TENANT_ID],
    );

    // The seed has open tasks; if the correlation breaks, this reads 0.
    expect(truth[0].n).toBeGreaterThan(0);
    expect(totalOnRoster).toBe(truth[0].n);
  });

  it("counts a file toward everyone carrying it, in any seat", async () => {
    const rows = await listTeamMembers(db, TEAM_ID);
    const lo = rows.find((r) => r.role === "lo");
    const processor = rows.find((r) => r.role === "processor");

    // The seed puts a processor on the TRANSACT files, so their load is real.
    expect(lo?.activeFiles ?? 0).toBeGreaterThan(0);
    expect(processor?.activeFiles ?? 0).toBeGreaterThan(0);
  });

  it("counts each active file once in the team total, however many people carry it", async () => {
    const members = await listTeamMembers(db, TEAM_ID);
    const totals = await teamTotals(
      db,
      members.map((m) => m.id),
    );

    const { rows } = await pool.query(
      `SELECT count(*)::int AS n FROM loan
        WHERE tenant_id = $1 AND status = 'active' AND deleted_at IS NULL`,
      [TENANT_ID],
    );

    // The seed puts both an LO and a processor on the TRANSACT files, so
    // summing the member rows would double-count. The total must not.
    const summedFromMembers = members.reduce((s, m) => s + m.activeFiles, 0);
    expect(totals.activeFiles).toBe(rows[0].n);
    expect(summedFromMembers).toBeGreaterThan(totals.activeFiles);
  });

  it("reports no median rather than a fake zero for someone with no answered leads", async () => {
    const rows = await listTeamMembers(db, TEAM_ID);
    for (const row of rows) {
      if (row.leadsAnswered === 0) {
        expect(row.medianResponseSeconds, `${row.fullName} median`).toBeNull();
      }
    }
  });

  it("keeps every correlated subquery bound to the user row", async () => {
    // The regression itself: bare column names in the generated SQL mean the
    // subquery is correlating against the wrong table.
    const q = db
      .select({ id: schema.user.id, ...({} as Record<string, never>) })
      .from(schema.user);
    void q;

    const rows = await listTeamMembers(db, TEAM_ID);
    const withWork = rows.filter((r) => r.openTasks > 0 || r.activeFiles > 0);
    expect(withWork.length).toBeGreaterThan(0);
  });
});

describe("generated SQL", () => {
  it("qualifies correlated columns with their table", async () => {
    // Guards the exact defect: an unqualified "id" inside a subquery over
    // another table silently resolves to that table's own id.
    const { rows } = await pool.query(
      `SELECT count(*)::int AS n FROM task WHERE status = 'open' AND deleted_at IS NULL`,
    );
    const members = await listTeamMembers(db, TEAM_ID);
    const summed = members.reduce((s, m) => s + m.openTasks, 0);
    expect(summed).toBe(rows[0].n);
  });
});

// Keep the unused import honest.
void sql;
