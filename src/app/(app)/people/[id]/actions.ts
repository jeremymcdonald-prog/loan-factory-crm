"use server";

import { revalidatePath } from "next/cache";
import { eq, and, isNull } from "drizzle-orm";
import { z } from "zod";
import { note, loan, event, lead, person } from "@/db/schema";
import { requireUser, queryAs } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";

export type NoteState = { error?: string };

const NoteSchema = z.object({
  personId: z.string().uuid(),
  loanId: z.string().uuid().nullable(),
  body: z.string().trim().min(1, "Write something first."),
});

export async function addNote(_prev: NoteState, formData: FormData): Promise<NoteState> {
  const user = await requireUser();

  const parsed = NoteSchema.safeParse({
    personId: formData.get("personId"),
    loanId: formData.get("loanId") || null,
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "We couldn't save that note." };
  }

  const { personId, loanId, body } = parsed.data;

  try {
    await queryAs(user, async (db) => {
      // RLS scopes this, but check the person is visible before writing a
      // child row — a clear failure beats a foreign-key error.
      const [target] = await db
        .select({ id: person.id })
        .from(person)
        .where(eq(person.id, personId))
        .limit(1);
      if (!target) throw new Error("not-visible");

      await db.insert(note).values({
        tenantId: user.tenantId,
        body,
        authorUserId: user.userId,
        personId,
        loanId,
      });

      if (loanId) {
        await db
          .update(loan)
          .set({ lastActivityAt: new Date(), stalledSince: null })
          .where(eq(loan.id, loanId));
      }

      await recordAudit(db, user, {
        action: "note.created",
        entity: "person",
        entityId: personId,
      });
    });
  } catch {
    return { error: "We couldn't save that note. Nothing was lost — try again." };
  }

  revalidatePath(`/people/${personId}`);
  return {};
}

const OUTCOMES = ["connected", "voicemail", "no_answer", "emailed", "texted", "met"] as const;

const TouchSchema = z.object({
  personId: z.string().uuid(),
  loanId: z.string().uuid().nullable(),
  outcome: z.enum(OUTCOMES),
  body: z.string().trim().optional(),
});

const OUTCOME_TEXT: Record<(typeof OUTCOMES)[number], string> = {
  connected: "Spoke with them",
  voicemail: "Left a voicemail",
  no_answer: "Called — no answer",
  emailed: "Sent an email",
  texted: "Sent a text",
  met: "Met in person",
};

/**
 * Log a touch — the record's primary action (Information_Architecture §3.4).
 *
 * Writes a note, refreshes the opportunity's activity clock (which clears any
 * stall flag), stamps speed-to-lead on first contact, and advances a brand-new
 * lead to Contact attempt. All in one transaction.
 */
export async function logTouch(_prev: NoteState, formData: FormData): Promise<NoteState> {
  const user = await requireUser();

  const parsed = TouchSchema.safeParse({
    personId: formData.get("personId"),
    loanId: formData.get("loanId") || null,
    outcome: formData.get("outcome"),
    body: formData.get("body") ?? undefined,
  });

  if (!parsed.success) {
    return { error: "Pick what happened, then save." };
  }

  const { personId, loanId, outcome, body } = parsed.data;
  const now = new Date();

  try {
    await queryAs(user, async (db) => {
      const text = body?.trim()
        ? `${OUTCOME_TEXT[outcome]} — ${body.trim()}`
        : OUTCOME_TEXT[outcome];

      await db.insert(note).values({
        tenantId: user.tenantId,
        body: text,
        authorUserId: user.userId,
        personId,
        loanId,
      });

      await db.insert(event).values({
        tenantId: user.tenantId,
        kind: "touch.logged",
        personId,
        loanId,
        actorUserId: user.userId,
        payload: { outcome },
      });

      if (loanId) {
        const [current] = await db
          .select({ stage: loan.stage })
          .from(loan)
          .where(eq(loan.id, loanId))
          .limit(1);

        await db
          .update(loan)
          .set({
            lastActivityAt: now,
            stalledSince: null,
            // A first touch moves a brand-new lead off the speed-to-lead clock.
            stage: current?.stage === "new_lead" ? "contact_attempt" : current?.stage,
            updatedAt: now,
          })
          .where(eq(loan.id, loanId));

        // Speed-to-lead is measured from capture to the first response, so
        // only the first touch stamps it.
        await db
          .update(lead)
          .set({ firstResponseAt: now })
          .where(and(eq(lead.loanId, loanId), isNull(lead.firstResponseAt)));
      }

      await recordAudit(db, user, {
        action: "touch.logged",
        entity: "person",
        entityId: personId,
        changes: { outcome: { from: null, to: outcome } },
      });
    });
  } catch {
    return { error: "We couldn't log that. Try again." };
  }

  revalidatePath(`/people/${personId}`);
  revalidatePath("/today");
  revalidatePath("/pipeline");
  return {};
}
