"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { leadSourceMapping } from "@/db/schema";
import { requireUser, queryAs } from "@/lib/auth";
import { canManageUsers } from "@/lib/roles";
import { recordAudit, diff } from "@/lib/audit";
import { LEAD_SOURCE_CATALOG, FOLLOW_UP_TASK_FIELD_KEY } from "@/lib/integrations";

export type MappingFormState = { error?: string };

const LANGUAGES = ["en", "vi", "zh", "es", "ru"] as const;
const SOURCE_KEYS = LEAD_SOURCE_CATALOG.map((s) => s.key) as [string, ...string[]];

const MappingSchema = z.object({
  id: z.string().uuid().optional(),
  sourceKey: z.enum(SOURCE_KEYS),
  name: z.string().trim().min(2, "Name this mapping so your team recognizes it."),
  ownerUserId: z.string().uuid().optional(),
  leadSource: z.string().trim().optional(),
  campaignId: z.string().uuid().optional(),
  automationId: z.string().uuid().optional(),
  tags: z.string().trim().optional(),
  preferredLanguage: z.enum(LANGUAGES).optional(),
  fieldMapJson: z.string().optional(),
  followUpNote: z.string().trim().optional(),
  notifyRule: z.string().trim().optional(),
  active: z.enum(["true", "false"]).optional(),
});

/** Parses the field-map editor's hidden JSON blob into a clean string map. */
function parseFieldMap(raw: string | undefined): Record<string, string> | { error: string } {
  const map: Record<string, string> = {};
  if (!raw) return map;
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return { error: "The field map couldn't be read. Check each row and try again." };
  }
  if (!parsedJson || typeof parsedJson !== "object" || Array.isArray(parsedJson)) {
    return { error: "The field map couldn't be read. Check each row and try again." };
  }
  for (const [key, value] of Object.entries(parsedJson as Record<string, unknown>)) {
    if (typeof key === "string" && typeof value === "string" && key.trim()) {
      map[key.trim()] = value.trim();
    }
  }
  return map;
}

/** Create or update a lead-source mapping — `id` present means update. */
export async function saveMapping(
  _prev: MappingFormState,
  formData: FormData,
): Promise<MappingFormState> {
  const actor = await requireUser();
  if (!canManageUsers(actor.role)) {
    return { error: "Only an administrator can change lead-source routing." };
  }

  const parsed = MappingSchema.safeParse({
    id: formData.get("id") || undefined,
    sourceKey: formData.get("sourceKey"),
    name: formData.get("name"),
    ownerUserId: formData.get("ownerUserId") || undefined,
    leadSource: formData.get("leadSource") || undefined,
    campaignId: formData.get("campaignId") || undefined,
    automationId: formData.get("automationId") || undefined,
    tags: formData.get("tags") || undefined,
    preferredLanguage: formData.get("preferredLanguage") || undefined,
    fieldMapJson: formData.get("fieldMapJson") || undefined,
    followUpNote: formData.get("followUpNote") || undefined,
    notifyRule: formData.get("notifyRule") || undefined,
    active: formData.get("active") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the details and try again." };
  }

  const input = parsed.data;
  const fieldMap = parseFieldMap(input.fieldMapJson);
  if ("error" in fieldMap) return { error: fieldMap.error };
  if (input.followUpNote) fieldMap[FOLLOW_UP_TASK_FIELD_KEY] = input.followUpNote;

  const tags = input.tags
    ? input.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const values = {
    sourceKey: input.sourceKey,
    name: input.name,
    ownerUserId: input.ownerUserId ?? null,
    leadSource: input.leadSource ?? null,
    campaignId: input.campaignId ?? null,
    automationId: input.automationId ?? null,
    tags,
    preferredLanguage: input.preferredLanguage ?? "en",
    fieldMap,
    notifyRule: input.notifyRule ?? null,
    active: input.active !== "false",
  };

  let id = input.id;

  try {
    await queryAs(actor, async (db) => {
      if (id) {
        const [before] = await db
          .select()
          .from(leadSourceMapping)
          .where(eq(leadSourceMapping.id, id))
          .limit(1);
        if (!before) throw new Error("not-found");

        await db
          .update(leadSourceMapping)
          .set({ ...values, updatedAt: new Date() })
          .where(eq(leadSourceMapping.id, id));

        await recordAudit(db, actor, {
          action: "integration.mapping_updated",
          entity: "lead_source_mapping",
          entityId: id,
          changes: diff(before, values),
        });
      } else {
        const [created] = await db
          .insert(leadSourceMapping)
          .values({ tenantId: actor.tenantId, ...values })
          .returning({ id: leadSourceMapping.id });
        id = created.id;

        await recordAudit(db, actor, {
          action: "integration.mapping_created",
          entity: "lead_source_mapping",
          entityId: id,
          changes: {
            sourceKey: { from: null, to: input.sourceKey },
            name: { from: null, to: input.name },
          },
        });
      }
    });
  } catch {
    return { error: "We couldn't save that mapping. Nothing was changed." };
  }

  revalidatePath("/settings/integrations/zapier/mapping");
  revalidatePath("/settings/integrations/zapier");
  redirect("/settings/integrations/zapier/mapping");
}

/** Quick active/paused toggle from the mapping list — same shape as setUserStatus. */
export async function toggleMappingActive(formData: FormData): Promise<void> {
  const actor = await requireUser();
  if (!canManageUsers(actor.role)) return;

  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  if (!id) return;

  await queryAs(actor, async (db) => {
    await db
      .update(leadSourceMapping)
      .set({ active, updatedAt: new Date() })
      .where(eq(leadSourceMapping.id, id));

    await recordAudit(db, actor, {
      action: active ? "integration.mapping_activated" : "integration.mapping_paused",
      entity: "lead_source_mapping",
      entityId: id,
      changes: { active: { from: !active, to: active } },
    });
  });

  revalidatePath("/settings/integrations/zapier/mapping");
}
