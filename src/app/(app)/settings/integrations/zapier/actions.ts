"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { integrationConnection, integrationEvent } from "@/db/schema";
import { requireUser, queryAs } from "@/lib/auth";
import { canManageUsers } from "@/lib/roles";
import { recordAudit } from "@/lib/audit";
import { applyConnectionAction, CONNECTION_ACTIONS, type ConnectionAction } from "../shared";

const ZAPIER_NAME = "Zapier MCP";

const StatusSchema = z.object({ action: z.enum(CONNECTION_ACTIONS) });

/** Preview / reconnect / pause / disconnect the tenant's Zapier MCP connection. */
export async function setZapierConnectionStatus(formData: FormData): Promise<void> {
  const actor = await requireUser();
  if (!canManageUsers(actor.role)) return;

  const parsed = StatusSchema.safeParse({ action: formData.get("action") });
  if (!parsed.success) return;

  await queryAs(actor, (db) =>
    applyConnectionAction(db, actor, "zapier_mcp", ZAPIER_NAME, parsed.data.action as ConnectionAction),
  );

  revalidatePath("/settings/integrations/zapier");
  revalidatePath("/settings/integrations");
}

/**
 * A dry-run "does the webhook respond" check. Only meaningful once the
 * connection has at least been previewed — there's nothing to test against
 * `not_connected`. Appends an honest event; never flips status to `connected`.
 */
export async function testZapierConnection(): Promise<void> {
  const actor = await requireUser();
  if (!canManageUsers(actor.role)) return;

  await queryAs(actor, async (db) => {
    const [conn] = await db
      .select({ id: integrationConnection.id, status: integrationConnection.status })
      .from(integrationConnection)
      .where(
        and(
          eq(integrationConnection.provider, "zapier_mcp"),
          isNull(integrationConnection.userId),
          isNull(integrationConnection.deletedAt),
        ),
      )
      .limit(1);

    if (!conn || conn.status === "not_connected") return;

    await db.insert(integrationEvent).values({
      tenantId: actor.tenantId,
      connectionId: conn.id,
      kind: "test_connection",
      status: "received",
      summary:
        "Test connection — verified the webhook endpoint responds. Nothing was imported to a live system.",
      detail: { simulated: true },
    });

    await recordAudit(db, actor, {
      action: "integration.zapier.test_connection",
      entity: "integration_connection",
      entityId: conn.id,
    });
  });

  revalidatePath("/settings/integrations/zapier");
}

/** A sample lead payload, run through as if it had really arrived — no CRM record is created. */
export async function testZapierEvent(formData: FormData): Promise<void> {
  const actor = await requireUser();
  if (!canManageUsers(actor.role)) return;

  const mappingId = String(formData.get("mappingId") ?? "").trim() || undefined;

  await queryAs(actor, async (db) => {
    const [conn] = await db
      .select({ id: integrationConnection.id, status: integrationConnection.status })
      .from(integrationConnection)
      .where(
        and(
          eq(integrationConnection.provider, "zapier_mcp"),
          isNull(integrationConnection.userId),
          isNull(integrationConnection.deletedAt),
        ),
      )
      .limit(1);

    if (!conn || conn.status === "not_connected") return;

    await db.insert(integrationEvent).values({
      tenantId: actor.tenantId,
      connectionId: conn.id,
      mappingId,
      kind: "test_event",
      status: "received",
      summary: "Test event — sample lead received; nothing was imported to a live system.",
      detail: {
        simulated: true,
        sample: {
          name: "Jordan Rivera",
          email: "jordan.rivera@example.com",
          phone: "(555) 010-0148",
          source: "facebook_lead_ads",
        },
      },
    });

    await recordAudit(db, actor, {
      action: "integration.zapier.test_event",
      entity: "integration_connection",
      entityId: conn.id,
    });
  });

  revalidatePath("/settings/integrations/zapier");
}

const RetrySchema = z.object({ eventId: z.string().uuid() });

/**
 * Retry a failed event. This never edits the original row — like the audit
 * log, integration_event is an append-only history — it appends a fresh
 * `retried` row that carries the same connection, mapping, and payload.
 */
export async function retryIntegrationEvent(formData: FormData): Promise<void> {
  const actor = await requireUser();
  if (!canManageUsers(actor.role)) return;

  const parsed = RetrySchema.safeParse({ eventId: formData.get("eventId") });
  if (!parsed.success) return;

  await queryAs(actor, async (db) => {
    const [original] = await db
      .select({
        id: integrationEvent.id,
        connectionId: integrationEvent.connectionId,
        mappingId: integrationEvent.mappingId,
        kind: integrationEvent.kind,
        status: integrationEvent.status,
        summary: integrationEvent.summary,
        detail: integrationEvent.detail,
      })
      .from(integrationEvent)
      .where(eq(integrationEvent.id, parsed.data.eventId))
      .limit(1);

    if (!original || original.status !== "failed") return;

    const [retried] = await db
      .insert(integrationEvent)
      .values({
        tenantId: actor.tenantId,
        connectionId: original.connectionId,
        mappingId: original.mappingId,
        kind: original.kind,
        status: "retried",
        summary: `Retried — ${original.summary}`,
        detail: original.detail,
      })
      .returning({ id: integrationEvent.id });

    await recordAudit(db, actor, {
      action: "integration.event_retried",
      entity: "integration_event",
      entityId: retried.id,
      changes: { originalEventId: { from: null, to: original.id } },
    });
  });

  revalidatePath("/settings/integrations/zapier");
}
