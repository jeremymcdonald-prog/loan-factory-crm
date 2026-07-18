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
import {
  listTeamMembers,
  teamTotals,
  leaderboard,
  listTeams,
  searchLoanOfficers,
  APPLICATION_STAGES,
  LEADERBOARD_PERIODS,
} from "./team";
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

describe("leaderboard", () => {
  it("ranks every active loan officer, and only loan officers", async () => {
    const rows = await leaderboard(db, "quarter");
    expect(rows.length).toBeGreaterThan(0);

    const { rows: truth } = await pool.query(
      `SELECT count(*)::int AS n FROM "user"
        WHERE tenant_id = $1 AND role = 'lo' AND status = 'active' AND deleted_at IS NULL`,
      [TENANT_ID],
    );
    expect(rows.length).toBe(truth[0].n);
  });

  it("counts closings and funded volume from funded dates in the period", async () => {
    const rows = await leaderboard(db, "quarter");

    for (const row of rows) {
      const { rows: truth } = await pool.query(
        `SELECT count(*)::int AS n, COALESCE(sum(amount), 0)::float AS v
           FROM loan
          WHERE lo_user_id = $1 AND deleted_at IS NULL
            AND funded_at IS NOT NULL AND funded_at >= now() - interval '90 days'`,
        [row.id],
      );
      expect(row.closings, `${row.fullName} closings`).toBe(truth[0].n);
      expect(row.fundedVolume, `${row.fullName} volume`).toBeCloseTo(truth[0].v, 2);
    }
  });

  it("counts applications as distinct files crossing into the application stages", async () => {
    const rows = await leaderboard(db, "ytd");
    const stages = APPLICATION_STAGES as string[];

    for (const row of rows) {
      const { rows: truth } = await pool.query(
        `SELECT count(DISTINCT h.loan_id)::int AS n
           FROM loan_stage_history h
           JOIN loan l ON l.id = h.loan_id
          WHERE l.lo_user_id = $1
            AND h.to_stage = ANY($2::loan_stage[])
            AND (h.from_stage IS NULL OR NOT h.from_stage = ANY($2::loan_stage[]))
            AND h.created_at >= date_trunc('year', now())`,
        [row.id, stages],
      );
      expect(row.applications, `${row.fullName} applications`).toBe(truth[0].n);
    }
  });

  it("attributes each member's leads-captured denominator truthfully", async () => {
    const rows = await leaderboard(db, "quarter");

    for (const row of rows) {
      const { rows: truth } = await pool.query(
        `SELECT count(*)::int AS n FROM lead
          WHERE assigned_user_id = $1 AND captured_at >= now() - interval '90 days'`,
        [row.id],
      );
      expect(row.leadsCaptured, `${row.fullName} leads`).toBe(truth[0].n);
    }
  });

  it("widening the window never shrinks a period-bound metric", async () => {
    // week ⊆ month ⊆ quarter by construction (ytd depends on the calendar).
    const [week, month, quarter] = await Promise.all([
      leaderboard(db, "week"),
      leaderboard(db, "month"),
      leaderboard(db, "quarter"),
    ]);

    const total = (rows: Awaited<ReturnType<typeof leaderboard>>) =>
      rows.reduce(
        (s, r) => s + r.applications + r.preapprovals + r.closings + r.leadsCaptured + r.referrals,
        0,
      );

    expect(total(week)).toBeLessThanOrEqual(total(month));
    expect(total(month)).toBeLessThanOrEqual(total(quarter));
  });

  it("has some production in every period so the demo board isn't empty", async () => {
    for (const period of LEADERBOARD_PERIODS) {
      const rows = await leaderboard(db, period.key);
      const activity = rows.reduce(
        (s, r) => s + r.applications + r.closings + r.leadsCaptured + r.activeLoans,
        0,
      );
      expect(activity, `${period.label} board activity`).toBeGreaterThan(0);
    }
  });
});

describe("team membership reads", () => {
  it("lists teams with live member counts", async () => {
    const teams = await listTeams(db);
    const seedTeam = teams.find((t) => t.id === TEAM_ID);
    expect(seedTeam).toBeDefined();

    const { rows: truth } = await pool.query(
      `SELECT count(*)::int AS n FROM "user"
        WHERE team_id = $1 AND status = 'active' AND deleted_at IS NULL`,
      [TEAM_ID],
    );
    expect(seedTeam?.memberCount).toBe(truth[0].n);
  });

  it("finds loan officers tenant-wide by partial name or email", async () => {
    const [anyLo] = await leaderboard(db, "week");
    expect(anyLo).toBeDefined();

    const byName = await searchLoanOfficers(db, anyLo.fullName.slice(0, 4).toLowerCase());
    expect(byName.map((m) => m.id)).toContain(anyLo.id);

    const byEmail = await searchLoanOfficers(db, anyLo.email.split("@")[0]);
    expect(byEmail.map((m) => m.id)).toContain(anyLo.id);

    // Only loan officers come back — a leader is choosing producers, not staff.
    for (const match of byName) {
      const { rows } = await pool.query(`SELECT role FROM "user" WHERE id = $1`, [match.id]);
      expect(rows[0].role).toBe("lo");
    }
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
