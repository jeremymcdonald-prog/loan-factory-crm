"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { partner } from "@/db/schema";
import { requireUser, queryAs } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";

export type PartnerFormState = { error?: string };

const KINDS = [
  "real_estate_agent",
  "builder",
  "financial_advisor",
  "attorney",
  "past_client",
  "other",
] as const;
const TIERS = ["core", "growing", "new", "quiet"] as const;
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
