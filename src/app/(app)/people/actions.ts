"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import {
  person,
  loan,
  lead,
  event,
  note,
  task,
  campaign,
  loanStageHistory,
} from "@/db/schema";
import type { Db } from "@/db";
import { requireUser, queryAs, requireRole, type CurrentUser } from "@/lib/auth";
import { ROLES, seesWholeBook } from "@/lib/roles";
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

// --- Bulk actions ------------------------------------------------------------

export type BulkState = { error?: string; done?: string };

const IdListSchema = z.array(z.string().uuid()).min(1).max(200);

/**
 * Every staff role may act on people they can see; the book scope below does
 * the narrowing. The check still runs so a session carrying an unknown role
 * never reaches a write.
 */
function requireStaff(user: CurrentUser) {
  requireRole(user, [...ROLES]);
}

/** The selected people this user is actually allowed to touch. */
async function visiblePeople(db: Db, user: CurrentUser, ids: string[]) {
  return db
    .select({
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      emails: person.emails,
      phones: person.phones,
      type: person.type,
      preferredLanguage: person.preferredLanguage,
      tags: person.tags,
      doNotContact: person.doNotContact,
      createdAt: person.createdAt,
    })
    .from(person)
    .where(
      and(
        inArray(person.id, ids),
        isNull(person.deletedAt),
        seesWholeBook(user.role) ? undefined : eq(person.ownerUserId, user.userId),
      ),
    );
}

function readIds(formData: FormData): string[] | null {
  const parsed = IdListSchema.safeParse(formData.getAll("ids"));
  return parsed.success ? parsed.data : null;
}

/**
 * Enroll the selected people in a drip campaign. Enrollment records an event
 * per person and grows the campaign's audience count — nothing sends, because
 * no provider is connected. Do-not-contact people are skipped, never enrolled.
 */
export async function bulkEnrollInCampaign(
  _prev: BulkState,
  formData: FormData,
): Promise<BulkState> {
  const user = await requireUser();

  try {
    requireStaff(user);
  } catch {
    return { error: "You do not have permission to do that." };
  }

  const ids = readIds(formData);
  if (!ids) return { error: "Select at least one person first." };

  const campaignId = formData.get("campaignId");
  if (typeof campaignId !== "string" || !z.string().uuid().safeParse(campaignId).success) {
    return { error: "Pick a campaign." };
  }

  let summary: string;

  try {
    summary = await queryAs(user, async (db) => {
      const [chosen] = await db
        .select({ id: campaign.id, name: campaign.name, status: campaign.status })
        .from(campaign)
        .where(and(eq(campaign.id, campaignId), isNull(campaign.deletedAt)))
        .limit(1);
      if (!chosen) throw new Error("no-campaign");
      if (chosen.status === "finished") throw new Error("finished");

      const people = await visiblePeople(db, user, ids);
      if (people.length === 0) throw new Error("none-visible");

      const contactable = people.filter((p) => !p.doNotContact);
      const skippedDnc = people.length - contactable.length;

      // One enrollment per person per campaign — check the event trail.
      const priorRows = contactable.length
        ? await db
            .select({ personId: event.personId })
            .from(event)
            .where(
              and(
                eq(event.kind, "campaign.enrolled"),
                inArray(
                  event.personId,
                  contactable.map((p) => p.id),
                ),
                sql`${event.payload}->>'campaignId' = ${campaignId}`,
              ),
            )
        : [];
      const prior = new Set(priorRows.map((r) => r.personId));

      const toEnroll = contactable.filter((p) => !prior.has(p.id));

      if (toEnroll.length > 0) {
        await db.insert(event).values(
          toEnroll.map((p) => ({
            tenantId: user.tenantId,
            kind: "campaign.enrolled",
            personId: p.id,
            actorUserId: user.userId,
            payload: { campaignId, campaignName: chosen.name },
          })),
        );

        await db
          .update(campaign)
          .set({
            audienceSize: sql`${campaign.audienceSize} + ${toEnroll.length}`,
            updatedAt: new Date(),
          })
          .where(eq(campaign.id, campaignId));
      }

      await recordAudit(db, user, {
        action: "campaign.enrolled",
        entity: "campaign",
        entityId: campaignId,
        changes: {
          people: { from: null, to: toEnroll.length },
          skippedDoNotContact: { from: null, to: skippedDnc },
          alreadyEnrolled: { from: null, to: prior.size },
        },
      });

      const parts = [
        `${toEnroll.length} enrolled in "${chosen.name}" — messages queue for sending when a provider is connected.`,
      ];
      if (prior.size > 0) parts.push(`${prior.size} already enrolled.`);
      if (skippedDnc > 0) parts.push(`${skippedDnc} skipped (do not contact).`);
      return parts.join(" ");
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "";
    if (reason === "no-campaign") return { error: "That campaign isn't in your book any more." };
    if (reason === "finished") {
      return { error: "That campaign has finished. Pick one that's still open." };
    }
    if (reason === "none-visible") {
      return { error: "None of the selected people are in your book." };
    }
    return { error: "We couldn't enroll them. Nothing was changed — try again." };
  }

  revalidatePath("/people");
  revalidatePath("/marketing");
  return { done: summary };
}

/** Add the same follow-up task for each selected person. */
export async function bulkAddTask(_prev: BulkState, formData: FormData): Promise<BulkState> {
  const user = await requireUser();

  try {
    requireStaff(user);
  } catch {
    return { error: "You do not have permission to do that." };
  }

  const ids = readIds(formData);
  if (!ids) return { error: "Select at least one person first." };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Say what needs doing." };

  const dueRaw = String(formData.get("dueAt") ?? "").trim();
  const dueAt = dueRaw ? new Date(dueRaw) : null;
  if (dueAt && Number.isNaN(dueAt.getTime())) {
    return { error: "That due date didn't read as a real date." };
  }

  let count: number;

  try {
    count = await queryAs(user, async (db) => {
      const people = await visiblePeople(db, user, ids);
      if (people.length === 0) throw new Error("none-visible");

      await db.insert(task).values(
        people.map((p) => ({
          tenantId: user.tenantId,
          title,
          ownerUserId: user.userId,
          dueAt,
          personId: p.id,
        })),
      );

      await recordAudit(db, user, {
        action: "task.bulk_created",
        entity: "task",
        changes: {
          title: { from: null, to: title },
          people: { from: null, to: people.length },
        },
      });

      return people.length;
    });
  } catch (error) {
    if (error instanceof Error && error.message === "none-visible") {
      return { error: "None of the selected people are in your book." };
    }
    return { error: "We couldn't add those tasks. Nothing was changed — try again." };
  }

  revalidatePath("/people");
  revalidatePath("/today");
  return { done: `Task added for ${count} ${count === 1 ? "person" : "people"}.` };
}

/**
 * A CSV cell that can't lie to a spreadsheet: quoted, quotes doubled, and
 * formula-leading characters neutralised so nothing executes on open.
 */
function csvCell(value: string): string {
  const guarded = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${guarded.replaceAll('"', '""')}"`;
}

export type ExportResult = { error?: string; csv?: string; fileName?: string };

/** Export the selected people as CSV. The download happens in the browser. */
export async function exportPeopleCsv(ids: string[]): Promise<ExportResult> {
  const user = await requireUser();

  try {
    requireStaff(user);
  } catch {
    return { error: "You do not have permission to do that." };
  }

  const parsed = IdListSchema.safeParse(ids);
  if (!parsed.success) return { error: "Select at least one person first." };

  try {
    return await queryAs(user, async (db) => {
      const people = await visiblePeople(db, user, parsed.data);
      if (people.length === 0) {
        return { error: "None of the selected people are in your book." };
      }

      const header = [
        "First name",
        "Last name",
        "Email",
        "Phone",
        "Type",
        "Preferred language",
        "Tags",
        "Do not contact",
        "Added",
      ];

      const lines = [header.map(csvCell).join(",")];
      for (const p of people) {
        lines.push(
          [
            p.firstName,
            p.lastName,
            p.emails?.[0]?.address ?? "",
            p.phones?.[0]?.number ?? "",
            p.type,
            p.preferredLanguage,
            (p.tags ?? []).join("; "),
            p.doNotContact ? "yes" : "no",
            p.createdAt.toISOString().slice(0, 10),
          ]
            .map(csvCell)
            .join(","),
        );
      }

      await recordAudit(db, user, {
        action: "people.exported",
        entity: "person",
        changes: { count: { from: null, to: people.length } },
      });

      return {
        csv: `${lines.join("\r\n")}\r\n`,
        fileName: `people-export-${new Date().toISOString().slice(0, 10)}.csv`,
      };
    });
  } catch {
    return { error: "The export failed. Nothing was changed — try again." };
  }
}
