/**
 * Automations queries, against the real database and the real seed.
 *
 * Same class of defect the team/partners suites guard against: a join or a
 * select-field typo that returns `undefined`/`null` for a whole column
 * doesn't throw — it just quietly tells a loan officer that a field never
 * existed. These assert the actual values the M5 columns and the loan-run
 * fallback resolve to, not just that the query runs.
 */
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";
import {
  getAutomation,
  listAutomationRuns,
  listTeammateChoices,
} from "./automations";
import type { Db } from "@/db";

const TENANT_ID = "0a9c8f42-1d3e-4b7a-9c21-8f6d5e4b3a20";
/** The seeded loan whose fallback we assert against, resolved by its stable
 *  business key (loan number) — never a hard-coded UUID, which the seed
 *  regenerates on every run. */
const LOAN_NUMBER = "LF-24118";

let pool: Pool;
let db: Db;

// Resolved from stable keys in beforeAll so a reseed (new gen_random_uuid ids)
// never breaks these — the ids are looked up, not pinned.
let AUTOMATION_ID: string;
let LOAN_ID: string;
let LOAN_BORROWER_ID: string;
let LOAN_FIRST_NAME: string;
let LOAN_LAST_NAME: string;

beforeAll(async () => {
  pool = new Pool({
    connectionString: process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL,
    max: 1,
  });
  db = drizzle(pool, { schema }) as unknown as Db;

  // A canonical automation the seed leaves the five M5 columns null on (the
  // new-trigger automations set them; the ten canonical ones don't).
  const { rows: autos } = await pool.query(
    `SELECT id FROM automation
      WHERE tenant_id = $1 AND deleted_at IS NULL
        AND conditions IS NULL AND owner_assignment IS NULL AND start_delay_text IS NULL
        AND stop_conditions IS NULL AND reentry_rule IS NULL
      ORDER BY created_at LIMIT 1`,
    [TENANT_ID],
  );
  AUTOMATION_ID = autos[0].id;

  // The loan (and its borrower) behind the loan-only run fallback, by loan number.
  const { rows: loans } = await pool.query(
    `SELECT l.id, l.person_id, p.first_name, p.last_name
       FROM loan l JOIN person p ON p.id = l.person_id
      WHERE l.tenant_id = $1 AND l.loan_number = $2 LIMIT 1`,
    [TENANT_ID, LOAN_NUMBER],
  );
  LOAN_ID = loans[0].id;
  LOAN_BORROWER_ID = loans[0].person_id;
  LOAN_FIRST_NAME = loans[0].first_name;
  LOAN_LAST_NAME = loans[0].last_name;
});

afterAll(async () => {
  await pool.end();
});

describe("the five M5 columns on automation", () => {
  afterEach(async () => {
    // Leave the canonical automation exactly as the seed left it.
    await pool.query(
      `UPDATE automation
          SET conditions = NULL, owner_assignment = NULL, start_delay_text = NULL,
              stop_conditions = NULL, reentry_rule = NULL
        WHERE id = $1`,
      [AUTOMATION_ID],
    );
  });

  it("reads null for a canonical automation the seed hasn't set them on", async () => {
    const record = await getAutomation(db, AUTOMATION_ID);
    expect(record).not.toBeNull();
    expect(record?.conditions).toBeNull();
    expect(record?.ownerAssignment).toBeNull();
    expect(record?.startDelayText).toBeNull();
    expect(record?.stopConditions).toBeNull();
    expect(record?.reentryRule).toBeNull();
  });

  it("round-trips real values rather than dropping them from the select", async () => {
    await pool.query(
      `UPDATE automation
          SET conditions = $2, owner_assignment = $3, start_delay_text = $4,
              stop_conditions = $5, reentry_rule = $6
        WHERE id = $1`,
      [
        AUTOMATION_ID,
        "Only if they have an email on file",
        "Round-robin",
        "Wait 2 days",
        "They reply",
        "After 90 days",
      ],
    );

    const record = await getAutomation(db, AUTOMATION_ID);
    expect(record?.conditions).toBe("Only if they have an email on file");
    expect(record?.ownerAssignment).toBe("Round-robin");
    expect(record?.startDelayText).toBe("Wait 2 days");
    expect(record?.stopConditions).toBe("They reply");
    expect(record?.reentryRule).toBe("After 90 days");
  });
});

describe("listTeammateChoices", () => {
  it("matches the active, non-deleted roster exactly", async () => {
    const choices = await listTeammateChoices(db);

    const { rows: truth } = await pool.query(
      `SELECT full_name FROM "user"
        WHERE tenant_id = $1 AND status = 'active' AND deleted_at IS NULL
        ORDER BY full_name`,
      [TENANT_ID],
    );

    expect(choices.map((c) => c.fullName)).toEqual(truth.map((r) => r.full_name));
  });

  it("never offers a disabled or deleted teammate", async () => {
    const choices = await listTeammateChoices(db);

    const { rows: excluded } = await pool.query(
      `SELECT full_name FROM "user"
        WHERE tenant_id = $1 AND (status != 'active' OR deleted_at IS NOT NULL)`,
      [TENANT_ID],
    );

    for (const row of excluded) {
      expect(choices.map((c) => c.fullName)).not.toContain(row.full_name);
    }
  });
});

describe("listAutomationRuns loan fallback", () => {
  const RUN_ID = "aaaaaaaa-0000-4000-8000-00000000f001";

  afterEach(async () => {
    await pool.query(`DELETE FROM automation_run WHERE id = $1`, [RUN_ID]);
  });

  it("resolves a loan-only run (no personId) to that loan's own borrower", async () => {
    await pool.query(
      `INSERT INTO automation_run (id, tenant_id, automation_id, loan_id, status, outcome)
       VALUES ($1, $2, $3, $4, 'failed', 'Test fixture — a run that only names a loan.')`,
      [RUN_ID, TENANT_ID, AUTOMATION_ID, LOAN_ID],
    );

    const runs = await listAutomationRuns(db, AUTOMATION_ID);
    const run = runs.find((r) => r.id === RUN_ID);

    expect(run).toBeDefined();
    expect(run?.personId).toBeNull();
    expect(run?.loanId).toBe(LOAN_ID);
    expect(run?.loanNumber).toBe(LOAN_NUMBER);
    expect(run?.loanPersonId).toBe(LOAN_BORROWER_ID);
    expect(run?.loanFirstName).toBe(LOAN_FIRST_NAME);
    expect(run?.loanLastName).toBe(LOAN_LAST_NAME);
  });
});
