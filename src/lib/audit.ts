/**
 * Audit logging — Technical_Architecture.md §5 (cross-cutting, platform-owned).
 *
 * Append-only: the database revokes UPDATE/DELETE on `audit_log` from the app
 * role, so a bug cannot rewrite history. NPI values never enter the log —
 * `redact()` strips them before write.
 */
import "server-only";
import { auditLog } from "@/db/schema";
import type { Db } from "@/db";
import type { CurrentUser } from "./auth";

/** Fields classified NPI/Restricted in Data_Model §3 — never written to the log. */
const NEVER_LOG = new Set([
  "passwordHash",
  "password_hash",
  "amount",
  "preapprovalAmount",
  "preapproval_amount",
  "statedFicoRange",
  "stated_fico_range",
  "dateOfBirth",
  "date_of_birth",
]);

export type Change = { from: unknown; to: unknown };

export function redact(changes: Record<string, Change>): Record<string, Change> {
  const safe: Record<string, Change> = {};
  for (const [key, value] of Object.entries(changes)) {
    safe[key] = NEVER_LOG.has(key) ? { from: "[redacted]", to: "[redacted]" } : value;
  }
  return safe;
}

/**
 * Write one audit row. Call inside the same transaction as the mutation it
 * describes, so the record and its evidence commit together.
 */
export async function recordAudit(
  db: Db,
  user: CurrentUser,
  entry: {
    action: string;
    entity: string;
    entityId?: string;
    changes?: Record<string, Change>;
  },
): Promise<void> {
  await db.insert(auditLog).values({
    tenantId: user.tenantId,
    actorUserId: user.userId,
    action: entry.action,
    entity: entry.entity,
    entityId: entry.entityId,
    changes: entry.changes ? redact(entry.changes) : undefined,
  });
}

/** Build a changes map from before/after objects, keeping only what moved. */
export function diff(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): Record<string, Change> {
  const changes: Record<string, Change> = {};
  for (const key of Object.keys(after)) {
    const from = before[key];
    const to = after[key];
    if (JSON.stringify(from) !== JSON.stringify(to)) {
      changes[key] = { from, to };
    }
  }
  return changes;
}
