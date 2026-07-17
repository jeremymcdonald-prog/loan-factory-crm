"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { person, loan, lead, event, note, loanStageHistory } from "@/db/schema";
import { requireUser, queryAs } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";

export type PersonFormState = { error?: string };

const LANGUAGES = ["en", "vi", "zh", "es", "ru"] as const;
const INTENTS = ["purchase", "refinance", "heloc", "quote", "rate_alert", "qualify"] as const;

const NewPersonSchema = z.object({
  firstName: z.string().trim().min(1, "Enter a first name."),
  lastName: z.string().trim().min(1, "Enter a last name."),
  email: z.union([z.string().trim().email("Enter a valid email address."), z.literal("")]),
  phone: z.string().trim().optional(),
  preferredLanguage: z.enum(LANGUAGES),
  /** "none" = a plain contact; anything else opens an opportunity at stage 1. */
  intent: z.union([z.enum(INTENTS), z.literal("none")]),
  source: z.string().trim().optional(),
  note: z.string().trim().optional(),
});

/**
 * Add a person — and, when they have an intent, open their opportunity.
 *
 * Locked rule (Data_Model §3.5): capturing a lead creates the `loan` row in
 * the same transaction, at stage 1. There is exactly one lifecycle state
 * machine (loan.stage); `lead` records only how the episode began. Everything
 * below commits together or not at all.
 */
export async function createPerson(
  _prev: PersonFormState,
  formData: FormData,
): Promise<PersonFormState> {
  const user = await requireUser();

  const parsed = NewPersonSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? undefined,
    preferredLanguage: formData.get("preferredLanguage") ?? "en",
    intent: formData.get("intent") ?? "none",
    source: formData.get("source") ?? undefined,
    note: formData.get("note") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the details and try again." };
  }

  const input = parsed.data;
  if (!input.email && !input.phone) {
    return { error: "Add an email or a phone number so you can reach them." };
  }

  let personId: string;

  try {
    personId = await queryAs(user, async (db) => {
      // Narrowing here (rather than at the insert) keeps `intent` typed as the
      // lead enum below, with "none" excluded.
      const leadIntent = input.intent === "none" ? null : input.intent;

      const [created] = await db
        .insert(person)
        .values({
          tenantId: user.tenantId,
          firstName: input.firstName,
          lastName: input.lastName,
          emails: input.email ? [{ address: input.email, label: "personal" }] : [],
          phones: input.phone ? [{ number: input.phone, label: "mobile", smsCapable: true }] : [],
          preferredLanguage: input.preferredLanguage,
          type: leadIntent ? "lead" : "other",
          ownerUserId: user.userId,
          source: input.source ? { channel: "manual", detail: input.source } : { channel: "manual" },
        })
        .returning({ id: person.id });

      await recordAudit(db, user, {
        action: "person.created",
        entity: "person",
        entityId: created.id,
        changes: {
          name: { from: null, to: `${input.firstName} ${input.lastName}` },
        },
      });

      if (leadIntent) {
        const [openedLoan] = await db
          .insert(loan)
          .values({
            tenantId: user.tenantId,
            personId: created.id,
            loUserId: user.userId,
            stage: "new_lead",
            status: "active",
            purpose:
              leadIntent === "refinance"
                ? "refinance"
                : leadIntent === "heloc"
                  ? "heloc"
                  : "purchase",
            lastActivityAt: new Date(),
          })
          .returning({ id: loan.id });

        await db.insert(loanStageHistory).values({
          tenantId: user.tenantId,
          loanId: openedLoan.id,
          fromStage: null,
          toStage: "new_lead",
          changedByUserId: user.userId,
        });

        await db.insert(lead).values({
          tenantId: user.tenantId,
          personId: created.id,
          loanId: openedLoan.id,
          source: { channel: "manual", detail: input.source ?? undefined },
          intent: leadIntent,
          assignedUserId: user.userId,
          capturedAt: new Date(),
        });

        await db.insert(event).values({
          tenantId: user.tenantId,
          kind: "lead.captured",
          personId: created.id,
          loanId: openedLoan.id,
          actorUserId: user.userId,
          payload: { channel: "manual", intent: leadIntent },
        });

        await recordAudit(db, user, {
          action: "loan.created",
          entity: "loan",
          entityId: openedLoan.id,
          changes: { stage: { from: null, to: "new_lead" } },
        });
      }

      if (input.note) {
        await db.insert(note).values({
          tenantId: user.tenantId,
          body: input.note,
          authorUserId: user.userId,
          personId: created.id,
        });
      }

      return created.id;
    });
  } catch (error) {
    return {
      error:
        error instanceof Error && error.message.includes("duplicate")
          ? "Someone with those details already exists."
          : "We couldn't save that. Nothing was changed.",
    };
  }

  revalidatePath("/people");
  revalidatePath("/today");
  redirect(`/people/${personId}`);
}
