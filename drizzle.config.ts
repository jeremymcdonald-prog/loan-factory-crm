import type { Config } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local" });

export default {
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    // Migrations run as the owner role, not the restricted app role.
    url: process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
