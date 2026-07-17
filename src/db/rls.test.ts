/**
 * Tenant isolation — the single most important architectural property of this
 * product (Technical_Architecture.md §4.2). These tests run against the real
 * database as the real restricted app role. Nothing is mocked: the point is to
 * prove the database itself refuses cross-tenant access.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Pool, type QueryResultRow } from "pg";

const APP_URL = process.env.DATABASE_URL!;
const OWNER_URL = process.env.MIGRATION_DATABASE_URL ?? APP_URL;

const TENANT_A = "aaaa1111-0000-4000-8000-00000000000a";
const TENANT_B = "bbbb2222-0000-4000-8000-00000000000b";
const PERSON_A = "aaaa1111-0000-4000-8000-0000000000a1";
const PERSON_B = "bbbb2222-0000-4000-8000-0000000000b1";

const ownerPool = new Pool({ connectionString: OWNER_URL, max: 2 });
const appPool = new Pool({ connectionString: APP_URL, max: 2 });

type Query = <R extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: unknown[],
) => Promise<{ rows: R[] }>;

/** Run a query with a tenant context, the way withTenant() does in the app. */
async function asTenant(
  tenantId: string | null,
  fn: (q: Query) => Promise<void>,
): Promise<void> {
  const client = await appPool.connect();
  try {
    await client.query("BEGIN");
    if (tenantId) {
      await client.query("SELECT set_config('app.tenant_id', $1, true)", [tenantId]);
    }
    const query: Query = (sql, params) => client.query(sql, params);
    await fn(query);
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
}

beforeAll(async () => {
  await ownerPool.query(
    `INSERT INTO tenant (id, name) VALUES ($1, 'Test Tenant A'), ($2, 'Test Tenant B')
     ON CONFLICT (id) DO NOTHING`,
    [TENANT_A, TENANT_B],
  );
  await ownerPool.query(
    `INSERT INTO person (id, tenant_id, first_name, last_name) VALUES
       ($1, $3, 'Anna', 'Pham'), ($2, $4, 'Bob', 'Other')
     ON CONFLICT (id) DO NOTHING`,
    [PERSON_A, PERSON_B, TENANT_A, TENANT_B],
  );
});

afterAll(async () => {
  await ownerPool.query("DELETE FROM person WHERE tenant_id = ANY($1)", [
    [TENANT_A, TENANT_B],
  ]);
  await ownerPool.query("DELETE FROM tenant WHERE id = ANY($1)", [[TENANT_A, TENANT_B]]);
  await ownerPool.end();
  await appPool.end();
});

describe("the app role itself", () => {
  it("is not a superuser and cannot bypass RLS", async () => {
    const { rows } = await appPool.query(
      "SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user",
    );
    expect(rows[0].rolsuper).toBe(false);
    expect(rows[0].rolbypassrls).toBe(false);
  });
});

describe("tenant isolation", () => {
  it("returns zero rows when no tenant context is set — fails closed", async () => {
    await asTenant(null, async (q) => {
      const { rows } = await q("SELECT count(*)::text AS count FROM person");
      expect(rows[0].count).toBe("0");
    });
  });

  it("shows a tenant only its own people", async () => {
    await asTenant(TENANT_A, async (q) => {
      const { rows } = await q("SELECT first_name FROM person");
      expect(rows.map((r) => r.first_name)).toEqual(["Anna"]);
    });

    await asTenant(TENANT_B, async (q) => {
      const { rows } = await q("SELECT first_name FROM person");
      expect(rows.map((r) => r.first_name)).toEqual(["Bob"]);
    });
  });

  it("hides another tenant's row even when asked for it by primary key", async () => {
    await asTenant(TENANT_A, async (q) => {
      const { rows } = await q("SELECT id FROM person WHERE id = $1", [PERSON_B]);
      expect(rows).toHaveLength(0);
    });
  });

  it("refuses to write a row into another tenant", async () => {
    await asTenant(TENANT_A, async (q) => {
      await expect(
        q("INSERT INTO person (tenant_id, first_name, last_name) VALUES ($1,'Evil','Insert')", [
          TENANT_B,
        ]),
      ).rejects.toThrow(/row-level security/i);
    });
  });

  it("refuses to update another tenant's row", async () => {
    await asTenant(TENANT_A, async (q) => {
      const { rows } = await q(
        "UPDATE person SET last_name = 'Hacked' WHERE id = $1 RETURNING id",
        [PERSON_B],
      );
      // Not an error — the row is simply invisible, so nothing updates.
      expect(rows).toHaveLength(0);
    });

    const check = await ownerPool.query("SELECT last_name FROM person WHERE id = $1", [
      PERSON_B,
    ]);
    expect(check.rows[0].last_name).toBe("Other");
  });

  it("refuses to delete another tenant's row", async () => {
    await asTenant(TENANT_A, async (q) => {
      const { rows } = await q("DELETE FROM person WHERE id = $1 RETURNING id", [PERSON_B]);
      expect(rows).toHaveLength(0);
    });

    const check = await ownerPool.query("SELECT count(*)::text AS c FROM person WHERE id = $1", [
      PERSON_B,
    ]);
    expect(check.rows[0].c).toBe("1");
  });

  it("cannot see another tenant's row by re-pointing tenant_id mid-transaction", async () => {
    await asTenant(TENANT_A, async (q) => {
      await expect(
        q("UPDATE person SET tenant_id = $1 WHERE id = $2", [TENANT_B, PERSON_A]),
      ).rejects.toThrow(/row-level security/i);
    });
  });
});

describe("append-only logs", () => {
  it("denies UPDATE on audit_log at the privilege level", async () => {
    await asTenant(TENANT_A, async (q) => {
      await expect(q("UPDATE audit_log SET action = 'tampered'")).rejects.toThrow(
        /permission denied/i,
      );
    });
  });

  it("denies DELETE on audit_log", async () => {
    await asTenant(TENANT_A, async (q) => {
      await expect(q("DELETE FROM audit_log")).rejects.toThrow(/permission denied/i);
    });
  });

  // One failing statement per transaction: Postgres aborts the whole
  // transaction after an error, so a second assertion would see
  // "current transaction is aborted" rather than the real refusal.
  it("denies UPDATE on ai_action_log", async () => {
    await asTenant(TENANT_A, async (q) => {
      await expect(q("UPDATE ai_action_log SET action = 'x'")).rejects.toThrow(
        /permission denied/i,
      );
    });
  });

  it("denies DELETE on loan_stage_history", async () => {
    await asTenant(TENANT_A, async (q) => {
      await expect(q("DELETE FROM loan_stage_history")).rejects.toThrow(
        /permission denied/i,
      );
    });
  });
});
