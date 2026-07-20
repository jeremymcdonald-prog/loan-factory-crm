/**
 * Integrations queries — the read layer for Google connections and the
 * Zapier MCP lead pipe (M4).
 *
 * Every query runs inside the caller's tenant context via queryAs(), so RLS
 * scopes every row to the tenant. Mutations (status changes, mapping edits,
 * test/retry events) live in the server actions under
 * settings/integrations/**, not here — this file only reads.
 */
import "server-only";
import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import type { Db } from "@/db";
import {
  integrationConnection,
  leadSourceMapping,
  integrationEvent,
  user as userTable,
  campaign as campaignTable,
  automation as automationTable,
} from "@/db/schema";
import type { OAuthScope } from "@/db/schema";
import type { IntegrationProvider } from "@/lib/integrations";

// --- Connections --------------------------------------------------------------

export type ConnectionRow = {
  id: string;
  provider: string;
  userId: string | null;
  status: string;
  displayName: string | null;
  scopes: OAuthScope[];
  config: Record<string, unknown>;
  lastSyncedAt: Date | null;
  updatedAt: Date;
};

const CONNECTION_FIELDS = {
  id: integrationConnection.id,
  provider: integrationConnection.provider,
  userId: integrationConnection.userId,
  status: integrationConnection.status,
  displayName: integrationConnection.displayName,
  scopes: integrationConnection.scopes,
  config: integrationConnection.config,
  lastSyncedAt: integrationConnection.lastSyncedAt,
  updatedAt: integrationConnection.updatedAt,
};

/** Every connection row the tenant has created so far. */
export async function listConnections(db: Db): Promise<ConnectionRow[]> {
  return db
    .select(CONNECTION_FIELDS)
    .from(integrationConnection)
    .where(isNull(integrationConnection.deletedAt))
    .orderBy(asc(integrationConnection.provider));
}

/**
 * The tenant-wide row for a provider (userId IS NULL) — every connection this
 * build manages is tenant-wide, not per-user, since these are admin settings
 * screens. Returns null when nothing has been previewed yet; callers should
 * treat that as `not_connected`.
 */
export async function getTenantConnection(
  db: Db,
  provider: IntegrationProvider,
): Promise<ConnectionRow | null> {
  const [row] = await db
    .select(CONNECTION_FIELDS)
    .from(integrationConnection)
    .where(
      and(
        eq(integrationConnection.provider, provider),
        isNull(integrationConnection.userId),
        isNull(integrationConnection.deletedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}

/** Imported vs. failed counts for one connection's event history. */
export async function eventCounts(
  db: Db,
  connectionId: string,
): Promise<{ imported: number; failed: number; total: number }> {
  const rows = await db
    .select({ status: integrationEvent.status, value: sql<number>`count(*)::int` })
    .from(integrationEvent)
    .where(eq(integrationEvent.connectionId, connectionId))
    .groupBy(integrationEvent.status);

  const count = (s: string) => rows.find((r) => r.status === s)?.value ?? 0;
  const total = rows.reduce((sum, r) => sum + r.value, 0);
  return { imported: count("imported"), failed: count("failed"), total };
}

// --- Lead-source mappings ------------------------------------------------------

export type MappingRow = {
  id: string;
  connectionId: string | null;
  sourceKey: string;
  name: string;
  ownerUserId: string | null;
  ownerName: string | null;
  leadSource: string | null;
  campaignId: string | null;
  campaignName: string | null;
  automationId: string | null;
  automationName: string | null;
  tags: string[] | null;
  preferredLanguage: string | null;
  fieldMap: Record<string, string>;
  notifyRule: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const MAPPING_FIELDS = {
  id: leadSourceMapping.id,
  connectionId: leadSourceMapping.connectionId,
  sourceKey: leadSourceMapping.sourceKey,
  name: leadSourceMapping.name,
  ownerUserId: leadSourceMapping.ownerUserId,
  ownerName: userTable.fullName,
  leadSource: leadSourceMapping.leadSource,
  campaignId: leadSourceMapping.campaignId,
  campaignName: campaignTable.name,
  automationId: leadSourceMapping.automationId,
  automationName: automationTable.name,
  tags: leadSourceMapping.tags,
  preferredLanguage: leadSourceMapping.preferredLanguage,
  fieldMap: leadSourceMapping.fieldMap,
  notifyRule: leadSourceMapping.notifyRule,
  active: leadSourceMapping.active,
  createdAt: leadSourceMapping.createdAt,
  updatedAt: leadSourceMapping.updatedAt,
};

function mappingQuery(db: Db) {
  return db
    .select(MAPPING_FIELDS)
    .from(leadSourceMapping)
    .leftJoin(userTable, eq(userTable.id, leadSourceMapping.ownerUserId))
    .leftJoin(campaignTable, eq(campaignTable.id, leadSourceMapping.campaignId))
    .leftJoin(automationTable, eq(automationTable.id, leadSourceMapping.automationId));
}

/** Every lead-source mapping, grouped for reading by source then name. */
export async function listLeadSourceMappings(db: Db): Promise<MappingRow[]> {
  return mappingQuery(db).orderBy(asc(leadSourceMapping.sourceKey), asc(leadSourceMapping.name));
}

export async function getMapping(db: Db, id: string): Promise<MappingRow | null> {
  const [row] = await mappingQuery(db).where(eq(leadSourceMapping.id, id)).limit(1);
  return row ?? null;
}

// --- Integration events (import history / failure log) -------------------------

export type EventRow = {
  id: string;
  connectionId: string | null;
  mappingId: string | null;
  mappingName: string | null;
  kind: string;
  status: string;
  summary: string;
  detail: Record<string, unknown>;
  createdAt: Date;
};

const EVENT_FIELDS = {
  id: integrationEvent.id,
  connectionId: integrationEvent.connectionId,
  mappingId: integrationEvent.mappingId,
  mappingName: leadSourceMapping.name,
  kind: integrationEvent.kind,
  status: integrationEvent.status,
  summary: integrationEvent.summary,
  detail: integrationEvent.detail,
  createdAt: integrationEvent.createdAt,
};

/** Newest first. Pass `connectionId` to scope to one connection's history. */
export async function listIntegrationEvents(
  db: Db,
  opts: { connectionId?: string; limit?: number } = {},
): Promise<EventRow[]> {
  const conditions = opts.connectionId
    ? [eq(integrationEvent.connectionId, opts.connectionId)]
    : [];

  return db
    .select(EVENT_FIELDS)
    .from(integrationEvent)
    .leftJoin(leadSourceMapping, eq(leadSourceMapping.id, integrationEvent.mappingId))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(integrationEvent.createdAt))
    .limit(opts.limit ?? 50);
}

export async function getIntegrationEvent(db: Db, id: string): Promise<EventRow | null> {
  const [row] = await db
    .select(EVENT_FIELDS)
    .from(integrationEvent)
    .leftJoin(leadSourceMapping, eq(leadSourceMapping.id, integrationEvent.mappingId))
    .where(eq(integrationEvent.id, id))
    .limit(1);
  return row ?? null;
}

// --- Select options for the mapping editor --------------------------------------

export type OwnerOption = { id: string; fullName: string };

/** Active teammates, for the mapping editor's "Owner" select. */
export async function listOwnerOptions(db: Db): Promise<OwnerOption[]> {
  return db
    .select({ id: userTable.id, fullName: userTable.fullName })
    .from(userTable)
    .where(and(isNull(userTable.deletedAt), eq(userTable.status, "active")))
    .orderBy(asc(userTable.fullName));
}

export type CampaignOption = { id: string; name: string };

export async function listCampaignOptions(db: Db): Promise<CampaignOption[]> {
  return db
    .select({ id: campaignTable.id, name: campaignTable.name })
    .from(campaignTable)
    .where(isNull(campaignTable.deletedAt))
    .orderBy(asc(campaignTable.name));
}

export type AutomationOption = { id: string; name: string };

export async function listAutomationOptions(db: Db): Promise<AutomationOption[]> {
  return db
    .select({ id: automationTable.id, name: automationTable.name })
    .from(automationTable)
    .where(isNull(automationTable.deletedAt))
    .orderBy(asc(automationTable.name));
}
