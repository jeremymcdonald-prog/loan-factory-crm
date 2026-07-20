/**
 * Shared connection-status logic for the Google and Zapier MCP server
 * actions. Not itself a server action module (no "use server") — the two
 * actions.ts files each import applyConnectionAction.
 *
 * HONESTY: the only transitions this build allows move a connection between
 * `not_connected`, `preview`, and `paused`. Nothing here can reach `connected`
 * or `error` — no credentialed server exists yet to earn either state, and
 * this build never fakes one (see src/lib/integrations.ts).
 */
import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { integrationConnection, integrationEvent } from "@/db/schema";
import type { Db } from "@/db";
import type { CurrentUser } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import type { ConnectionStatus, IntegrationProvider } from "@/lib/integrations";

export type ConnectionAction = "preview" | "reconnect" | "pause" | "disconnect";

export const CONNECTION_ACTIONS = ["preview", "reconnect", "pause", "disconnect"] as const;

/** The one place the allowed status graph is written down. */
export function nextStatus(
  action: ConnectionAction,
  current: ConnectionStatus,
): ConnectionStatus | null {
  switch (action) {
    case "preview":
      return current === "not_connected" ? "preview" : null;
    case "reconnect":
      return current === "paused" ? "preview" : null;
    case "pause":
      return current === "preview" ? "paused" : null;
    case "disconnect":
      return current === "preview" || current === "paused" ? "not_connected" : null;
    default:
      return null;
  }
}

const ACTION_SUMMARY: Record<ConnectionAction, (name: string) => string> = {
  preview: (name) =>
    `Previewed the ${name} connection — architecture and scopes only, no credentials were requested or stored.`,
  reconnect: (name) => `Re-opened the ${name} connection for preview. Still no credentials.`,
  pause: (name) => `Paused the ${name} connection. Nothing moves while paused.`,
  disconnect: (name) => `Disconnected ${name}. Nothing was connected, so there was nothing to revoke.`,
};

/**
 * Find (or create) the tenant-wide connection row for a provider and move it
 * to the next honest status. Returns null when the action doesn't apply from
 * the connection's current status — callers should treat that as a no-op.
 */
export async function applyConnectionAction(
  db: Db,
  actor: CurrentUser,
  provider: IntegrationProvider,
  displayName: string,
  action: ConnectionAction,
): Promise<{ id: string; status: ConnectionStatus } | null> {
  const [existing] = await db
    .select({ id: integrationConnection.id, status: integrationConnection.status })
    .from(integrationConnection)
    .where(
      and(
        eq(integrationConnection.provider, provider),
        isNull(integrationConnection.userId),
        isNull(integrationConnection.deletedAt),
      ),
    )
    .limit(1);

  const current = (existing?.status as ConnectionStatus | undefined) ?? "not_connected";
  const next = nextStatus(action, current);
  if (!next) return null;

  let id = existing?.id;
  if (!id) {
    const [created] = await db
      .insert(integrationConnection)
      .values({ tenantId: actor.tenantId, provider, status: next, displayName })
      .returning({ id: integrationConnection.id });
    id = created.id;
  } else {
    await db
      .update(integrationConnection)
      .set({ status: next, updatedAt: new Date() })
      .where(eq(integrationConnection.id, id));
  }

  await recordAudit(db, actor, {
    action: `integration.${action}`,
    entity: "integration_connection",
    entityId: id,
    changes: { status: { from: current, to: next } },
  });

  await db.insert(integrationEvent).values({
    tenantId: actor.tenantId,
    connectionId: id,
    kind: "status_change",
    status: "received",
    summary: ACTION_SUMMARY[action](displayName),
    detail: { action, from: current, to: next },
  });

  return { id, status: next };
}
