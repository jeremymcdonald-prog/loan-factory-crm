/**
 * Referral counting, against the real database and the real seed.
 *
 * Same class of defect as the team workload bug: a correlated subquery written
 * inline in a select field emits a bare column name, binds to the wrong table,
 * matches nothing, and reports zero. It raises no error — the Partners list
 * simply told a loan officer that their best agent had never referred anyone.
 * These assert the counts rather than that the query runs.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";
import { listPartners } from "./partners";
import type { Db } from "@/db";
import type { CurrentUser } from "@/lib/auth";

const TENANT_ID = "0a9c8f42-1d3e-4b7a-9c21-8f6d5e4b3a20";

/** A leader sees the whole book, so the roster isn't scoped away. */
const LEADER: CurrentUser = {
  userId: "1a000000-0000-4000-8000-000000000005",
  tenantId: TENANT_ID,
  role: "admin",
  fullName: "James Okafor",
  email: "admin@loanfactory.com",
};

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

async function actualReferrals(fullName: string): Promise<number> {
  const { rows } = await pool.query(
    `SELECT count(pr.id)::int AS n
       FROM partner p LEFT JOIN partner_relationship pr ON pr.partner_id = p.id
      WHERE p.first_name || ' ' || p.last_name = $1
      GROUP BY p.id`,
    [fullName],
  );
  return rows[0]?.n ?? 0;
}

describe("partner referral counts", () => {
  it("credits each partner with the referrals they actually sent", async () => {
    const rows = await listPartners(db, LEADER);
    expect(rows.length).toBeGreaterThan(0);

    for (const row of rows) {
      const expected = await actualReferrals(`${row.firstName} ${row.lastName}`);
      expect(row.referralCount, `${row.firstName} ${row.lastName} referrals`).toBe(expected);
    }
  });

  it("does not report every partner as having sent nothing", async () => {
    const rows = await listPartners(db, LEADER);
    const total = rows.reduce((sum, r) => sum + r.referralCount, 0);

    const { rows: truth } = await pool.query(
      `SELECT count(*)::int AS n FROM partner_relationship WHERE tenant_id = $1`,
      [TENANT_ID],
    );

    expect(truth[0].n).toBeGreaterThan(0);
    expect(total).toBe(truth[0].n);
  });

  it("puts the partner who has waited longest at the top", async () => {
    const rows = await listPartners(db, LEADER);
    const touched = rows.filter((r) => r.lastTouchAt !== null);
    for (let i = 1; i < touched.length; i++) {
      expect(touched[i - 1].lastTouchAt!.getTime()).toBeLessThanOrEqual(
        touched[i].lastTouchAt!.getTime(),
      );
    }
  });
});
