/**
 * Forward-only migration runner (Technical_Architecture.md §7).
 * Runs as the owner role via MIGRATION_DATABASE_URL, not the restricted app role.
 */
import { config } from "dotenv";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

config({ path: ".env.local" });

async function main() {
  const url = process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error("MIGRATION_DATABASE_URL or DATABASE_URL must be set");

  const pool = new Pool({ connectionString: url, max: 1 });
  const db = drizzle(pool);

  console.log("Running migrations…");
  await migrate(db, { migrationsFolder: "./src/db/migrations" });
  console.log("Migrations complete.");

  await pool.end();
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
