import { config } from "dotenv";

// Tests run against the local database and real crypto — no mocks for the
// security layer, because the point is to prove the real thing holds.
config({ path: ".env.local" });

process.env.SESSION_SECRET ??= "test-secret-value-at-least-32-characters-long";
