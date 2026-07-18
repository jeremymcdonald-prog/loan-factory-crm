"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { inArray } from "drizzle-orm";
import { z } from "zod";
import { partner, task } from "@/db/schema";
import { requireUser, queryAs } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { PARTNER_NEXT_ACTIONS } from "./vocabulary";

export type PartnerFormState = { error?: string };

const KINDS = [
  "real_estate_agent",
  "builder",
  "financial_advisor",
  "attorney",
  "past_client",
  "other",
] as const;
const TIERS = ["target", "new", "growing", "core", "quiet"] as const;
const LANGUAGES = ["en", "vi", "zh", "es", "ru"] as const;

const NewPartnerSchema = z.object({
  firstName: z.string().trim().min(1, "Enter a first name."),
  lastName: z.string().trim().min(1, "Enter a last name."),
  company: z.string().trim().optional(),
  kind: z.enum(KINDS),
  tier: z.enum(TIERS),
  email: z.union([z.string().trim().email("Enter a valid email address."), z.literal("")]),
  phone: z.string().trim().optional(),
  preferredLanguage: z.enum(LANGUAGES),
  notesSummary: z.string().trim().optional(),
});

/**
 * Add a referral partner.
 *
 * `lastTouchAt` is deliberately left empty: the relationship clock starts when
 * a human logs a real touch, never at the moment a row was typed in. Until then
 * the record says "No touch logged", which is the truth.
 */
export async function createPartner(
  _prev: PartnerFormState,
  formData: FormData,
): Promise<PartnerFormState> {
  const user = await requireUser();

  const parsed = NewPartnerSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    company: formData.get("company") ?? undefined,
    kind: formData.get("kind") ?? "real_estate_agent",
    tier: formData.get("tier") ?? "new",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? undefined,
    preferredLanguage: formData.get("preferredLanguage") ?? "en",
    notesSummary: formData.get("notesSummary") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the details and try again." };
  }

  const input = parsed.data;
  if (!input.email && !input.phone) {
    return { error: "Add an email or a phone number so you can reach them." };
  }

  let partnerId: string;

  try {
    partnerId = await queryAs(user, async (db) => {
      const [created] = await db
        .insert(partner)
        .values({
          tenantId: user.tenantId,
          firstName: input.firstName,
          lastName: input.lastName,
          company: input.company || null,
          kind: input.kind,
          tier: input.tier,
          emails: input.email ? [{ address: input.email, label: "work" }] : [],
          phones: input.phone ? [{ number: input.phone, label: "mobile", smsCapable: true }] : [],
          preferredLanguage: input.preferredLanguage,
          ownerUserId: user.userId,
          notesSummary: input.notesSummary || null,
        })
        .returning({ id: partner.id });

      await recordAudit(db, user, {
        action: "partner.created",
        entity: "partner",
        entityId: created.id,
        changes: {
          name: { from: null, to: `${input.firstName} ${input.lastName}` },
          kind: { from: null, to: input.kind },
          tier: { from: null, to: input.tier },
        },
      });

      return created.id;
    });
  } catch {
    return { error: "We couldn't save that. Nothing was changed." };
  }

  revalidatePath("/partners");
  redirect(`/partners/${partnerId}`);
}

// ---------------------------------------------------------------------------
// Bulk actions — select partners on the list, act on all of them at once.
// Every one writes an audit row per partner, because "who changed this tier
// and when" has to survive a bulk edit exactly as it survives a single one.
// ---------------------------------------------------------------------------

export type BulkState = { error?: string; done?: string };

/** Parse the comma-joined id list a bulk form submits. */
function parseIds(raw: FormDataEntryValue | null): string[] | null {
  const parsed = z
    .array(z.string().uuid())
    .min(1)
    .max(100)
    .safeParse(String(raw ?? "").split(",").filter(Boolean));
  return parsed.success ? parsed.data : null;
}

const BulkTierSchema = z.object({ tier: z.enum(TIERS) });

/**
 * Move the selected partners to a tier. The tier is a human judgement — the
 * CRM never reassigns it on its own — so a bulk move is just that judgement
 * applied to several people at once.
 */
export async function bulkSetTier(_prev: BulkState, formData: FormData): Promise<BulkState> {
  const user = await requireUser();

  const ids = parseIds(formData.get("partnerIds"));
  const parsed = BulkTierSchema.safeParse({ tier: formData.get("tier") });
  if (!ids || !parsed.success) {
    return { error: "Pick at least one partner and a tier, then try again." };
  }
  const { tier } = parsed.data;

  let moved = 0;
  try {
    moved = await queryAs(user, async (db) => {
      // RLS already scopes this select; anything not visible simply isn't
      // updated, and the count tells the user the truth about what moved.
      const targets = await db
        .select({ id: partner.id, tier: partner.tier })
        .from(partner)
        .where(inArray(partner.id, ids));
      if (targets.length === 0) throw new Error("not-visible");

      const now = new Date();
      await db
        .update(partner)
        .set({ tier, updatedAt: now })
        .where(inArray(partner.id, targets.map((t) => t.id)));

      for (const t of targets) {
        await recordAudit(db, user, {
          action: "partner.tier_changed",
          entity: "partner",
          entityId: t.id,
          changes: { tier: { from: t.tier, to: tier } },
        });
      }
      return targets.length;
    });
  } catch {
    return { error: "We couldn't move those partners. Nothing was changed." };
  }

  revalidatePath("/partners");
  return { done: `Moved ${moved} partner${moved === 1 ? "" : "s"}.` };
}

/**
 * Put a follow-up on the user's task list for each selected partner.
 *
 * `task` has no partner column (schema is fixed), so the partner is named in
 * the task title — the task still reads correctly on Today without a join.
 */
export async function bulkAddTask(_prev: BulkState, formData: FormData): Promise<BulkState> {
  const user = await requireUser();

  const ids = parseIds(formData.get("partnerIds"));
  const title = String(formData.get("title") ?? "").trim();
  if (!ids) {
    return { error: "Pick at least one partner first." };
  }

  let created = 0;
  try {
    created = await queryAs(user, async (db) => {
      const targets = await db
        .select({
          id: partner.id,
          firstName: partner.firstName,
          lastName: partner.lastName,
          tier: partner.tier,
        })
        .from(partner)
        .where(inArray(partner.id, ids));
      if (targets.length === 0) throw new Error("not-visible");

      for (const t of targets) {
        const who = `${t.firstName} ${t.lastName}`;
        await db.insert(task).values({
          tenantId: user.tenantId,
          title: title ? `${title} — ${who}` : `${PARTNER_NEXT_ACTIONS[t.tier] ?? "Follow up"} — ${who}`,
          detail: "Added from the Partners list.",
          ownerUserId: user.userId,
          dueAt: new Date(),
          priority: "normal",
        });
        await recordAudit(db, user, {
          action: "partner.task_created",
          entity: "partner",
          entityId: t.id,
        });
      }
      return targets.length;
    });
  } catch {
    return { error: "We couldn't add those tasks. Nothing was changed." };
  }

  revalidatePath("/partners");
  revalidatePath("/today");
  return { done: `Added ${created} task${created === 1 ? "" : "s"} to your list.` };
}
