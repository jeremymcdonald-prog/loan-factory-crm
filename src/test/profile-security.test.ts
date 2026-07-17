/**
 * Security properties of the profile era, proven against the real database as
 * the real restricted role — nothing mocked.
 *
 *   1. AI personas are OWNER-private: the database returns another user's
 *      persona to nobody — not a teammate, not an admin in the same tenant.
 *   2. Videos are tenant-isolated like everything else.
 *   3. Watch state can only be written as yourself.
 *   4. A signature persists and is tenant-scoped on read.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Pool, type QueryResultRow } from "pg";

const APP_URL = process.env.DATABASE_URL!;
const OWNER_URL = process.env.MIGRATION_DATABASE_URL ?? APP_URL;

const TENANT = "0a9c8f42-1d3e-4b7a-9c21-8f6d5e4b3a20"; // seeded Loan Factory
const OTHER_TENANT = "cccc3333-0000-4000-8000-00000000000c";
const MINH = "1a000000-0000-4000-8000-000000000001"; // lo
const JAMES = "1a000000-0000-4000-8000-000000000005"; // admin, same tenant

const ownerPool = new Pool({ connectionString: OWNER_URL, max: 2 });
const appPool = new Pool({ connectionString: APP_URL, max: 2 });

type Query = <R extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: unknown[],
) => Promise<{ rows: R[] }>;

/** Run with the exact context withTenant() sets in the app. */
async function asUser(
  tenantId: string,
  userId: string,
  fn: (q: Query) => Promise<void>,
): Promise<void> {
  const client = await appPool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT set_config('app.tenant_id', $1, true)", [tenantId]);
    await client.query("SELECT set_config('app.user_id', $1, true)", [userId]);
    const query: Query = (sql, params) => client.query(sql, params);
    await fn(query);
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
}

beforeAll(async () => {
  await ownerPool.query(
    `INSERT INTO tenant (id, name) VALUES ($1, 'Other Shop') ON CONFLICT (id) DO NOTHING`,
    [OTHER_TENANT],
  );
  // Minh has a persona on file.
  await ownerPool.query(
    `INSERT INTO ai_persona (tenant_id, user_id, filename, mime, size_bytes, extracted_text)
     VALUES ($1, $2, 'minh-bio.md', 'text/markdown', 512, 'Direct, warm, plain-spoken.')
     ON CONFLICT (user_id) DO UPDATE SET extracted_text = EXCLUDED.extracted_text`,
    [TENANT, MINH],
  );
});

afterAll(async () => {
  await ownerPool.query(`DELETE FROM ai_persona WHERE user_id = $1`, [MINH]);
  await ownerPool.query(`DELETE FROM tenant WHERE id = $1`, [OTHER_TENANT]);
  await ownerPool.end();
  await appPool.end();
});

describe("AI persona privacy", () => {
  it("returns the persona to its owner", async () => {
    await asUser(TENANT, MINH, async (q) => {
      const { rows } = await q(`SELECT filename FROM ai_persona`);
      expect(rows.map((r) => r.filename)).toEqual(["minh-bio.md"]);
    });
  });

  it("returns NOTHING to a teammate — even an admin in the same tenant", async () => {
    await asUser(TENANT, JAMES, async (q) => {
      const { rows } = await q(`SELECT filename FROM ai_persona`);
      expect(rows).toHaveLength(0);
    });
  });

  it("refuses to write a persona as someone else", async () => {
    await asUser(TENANT, JAMES, async (q) => {
      await expect(
        q(
          `INSERT INTO ai_persona (tenant_id, user_id, filename, mime, size_bytes)
           VALUES ($1, $2, 'forged.txt', 'text/plain', 10)`,
          [TENANT, MINH],
        ),
      ).rejects.toThrow(/row-level security/i);
    });
  });
});

describe("video tenant isolation", () => {
  it("shows seeded videos inside the tenant", async () => {
    await asUser(TENANT, MINH, async (q) => {
      const { rows } = await q(`SELECT count(*)::int AS n FROM video`);
      expect(Number(rows[0].n)).toBeGreaterThan(0);
    });
  });

  it("shows zero videos to another tenant", async () => {
    await asUser(OTHER_TENANT, MINH, async (q) => {
      const { rows } = await q(`SELECT count(*)::int AS n FROM video`);
      expect(Number(rows[0].n)).toBe(0);
    });
  });

  it("refuses watch state written as another user", async () => {
    const { rows: v } = await ownerPool.query(
      `SELECT id FROM video WHERE tenant_id = $1 LIMIT 1`,
      [TENANT],
    );
    await asUser(TENANT, JAMES, async (q) => {
      await expect(
        q(
          `INSERT INTO video_watch (tenant_id, video_id, user_id, watched_at)
           VALUES ($1, $2, $3, now())`,
          [TENANT, v[0].id, MINH],
        ),
      ).rejects.toThrow(/row-level security/i);
    });
  });
});

describe("signature persistence", () => {
  it("saves and reads back a signature under the tenant context", async () => {
    const signature = "Minh Nguyen\nNMLS 1856432\nCompany NMLS 320841";

    await ownerPool.query(`UPDATE "user" SET signature = $1 WHERE id = $2`, [
      signature,
      MINH,
    ]);

    await asUser(TENANT, MINH, async (q) => {
      const { rows } = await q(`SELECT signature FROM "user" WHERE id = $1`, [MINH]);
      expect(rows[0].signature).toBe(signature);
    });

    // Another tenant's context reads nothing at all.
    await asUser(OTHER_TENANT, MINH, async (q) => {
      const { rows } = await q(`SELECT signature FROM "user" WHERE id = $1`, [MINH]);
      expect(rows).toHaveLength(0);
    });
  });
});
