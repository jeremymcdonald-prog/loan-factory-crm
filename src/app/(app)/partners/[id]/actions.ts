"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { partner, conversation, message, event, task } from "@/db/schema";
import { requireUser, queryAs } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { CHECKIN_APPROVED, CHECKIN_SKIPPED } from "@/lib/queries/partners";

export type TouchState = { error?: string };

const OUTCOMES = ["connected", "voicemail", "no_answer", "emailed", "texted", "met"] as const;

const OUTCOME_TEXT: Record<(typeof OUTCOMES)[number], string> = {
  connected: "Spoke with them",
  voicemail: "Left a voicemail",
  no_answer: "Called — no answer",
  emailed: "Sent an email",
  texted: "Sent a text",
  met: "Met in person",
};

/**
 * The channel each outcome is recorded on.
 *
 * A call you placed is a call — that is what the seeded history already does.
 * An email you sent from your own inbox is recorded as a note ABOUT that email:
 * the CRM did not send it, has no mail integration, and the history must never
 * imply otherwise.
 */
const OUTCOME_CHANNEL: Record<(typeof OUTCOMES)[number], "call" | "note"> = {
  connected: "call",
  voicemail: "call",
  no_answer: "call",
  emailed: "note",
  texted: "note",
  met: "note",
};

const TouchSchema = z.object({
  partnerId: z.string().uuid(),
  outcome: z.enum(OUTCOMES),
  body: z.string().trim().optional(),
});

/**
 * Log a touch — the partner record's primary action.
 *
 * This is the only thing that moves `lastTouchAt`, which is the only fact the
 * quiet read is computed from. It also writes the touch into the partner's
 * contact history, so what you said is still there in six months.
 */
export async function logPartnerTouch(
  _prev: TouchState,
  formData: FormData,
): Promise<TouchState> {
  const user = await requireUser();

  const parsed = TouchSchema.safeParse({
    partnerId: formData.get("partnerId"),
    outcome: formData.get("outcome"),
    body: formData.get("body") ?? undefined,
  });

  if (!parsed.success) {
    return { error: "Pick what happened, then save." };
  }

  const { partnerId, outcome, body } = parsed.data;
  const now = new Date();

  try {
    await queryAs(user, async (db) => {
      // RLS scopes this, but check the partner is visible before writing child
      // rows — a clear failure beats a foreign-key error.
      const [target] = await db
        .select({ id: partner.id, lastTouchAt: partner.lastTouchAt })
        .from(partner)
        .where(eq(partner.id, partnerId))
        .limit(1);
      if (!target) throw new Error("not-visible");

      const text = body?.trim()
        ? `${OUTCOME_TEXT[outcome]} — ${body.trim()}`
        : OUTCOME_TEXT[outcome];
      const channel = OUTCOME_CHANNEL[outcome];

      const [thread] = await db
        .insert(conversation)
        .values({
          tenantId: user.tenantId,
          subject: OUTCOME_TEXT[outcome],
          channel,
          partnerId,
          ownerUserId: user.userId,
          lastMessageAt: now,
          awaitingReply: false,
        })
        .returning({ id: conversation.id });

      await db.insert(message).values({
        tenantId: user.tenantId,
        conversationId: thread.id,
        channel,
        direction: "outbound",
        status: "sent",
        body: text,
        authorUserId: user.userId,
        sentAt: now,
        occurredAt: now,
        meta: { outcome },
      });

      await db
        .update(partner)
        .set({ lastTouchAt: now, updatedAt: now })
        .where(eq(partner.id, partnerId));

      await db.insert(event).values({
        tenantId: user.tenantId,
        kind: "partner.touch_logged",
        actorUserId: user.userId,
        payload: { partnerId, outcome },
      });

      await recordAudit(db, user, {
        action: "partner.touch_logged",
        entity: "partner",
        entityId: partnerId,
        changes: {
          lastTouchAt: {
            from: target.lastTouchAt?.toISOString() ?? null,
            to: now.toISOString(),
          },
          outcome: { from: null, to: outcome },
        },
      });
    });
  } catch {
    return { error: "We couldn't log that. Try again." };
  }

  revalidatePath(`/partners/${partnerId}`);
  revalidatePath("/partners");
  return {};
}

const NotesSchema = z.object({
  partnerId: z.string().uuid(),
  notesSummary: z.string().trim().max(2000, "That's longer than this box holds."),
});

/**
 * What to remember about a partner. `note` has no partner column, so a
 * partner's standing notes live on the record itself — one field the team keeps
 * current, not a log.
 */
export async function savePartnerNotes(
  _prev: TouchState,
  formData: FormData,
): Promise<TouchState> {
  const user = await requireUser();

  const parsed = NotesSchema.safeParse({
    partnerId: formData.get("partnerId"),
    notesSummary: formData.get("notesSummary") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "We couldn't save that." };
  }

  const { partnerId, notesSummary } = parsed.data;

  try {
    await queryAs(user, async (db) => {
      const [target] = await db
        .select({ id: partner.id, notesSummary: partner.notesSummary })
        .from(partner)
        .where(eq(partner.id, partnerId))
        .limit(1);
      if (!target) throw new Error("not-visible");

      await db
        .update(partner)
        .set({ notesSummary: notesSummary || null, updatedAt: new Date() })
        .where(eq(partner.id, partnerId));

      await recordAudit(db, user, {
        action: "partner.notes_updated",
        entity: "partner",
        entityId: partnerId,
        changes: { notesSummary: { from: target.notesSummary, to: notesSummary || null } },
      });
    });
  } catch {
    return { error: "We couldn't save that. Try again." };
  }

  revalidatePath(`/partners/${partnerId}`);
  return {};
}

const CheckinSchema = z.object({
  partnerId: z.string().uuid(),
  verdict: z.enum(["approve", "skip"]),
  quietDays: z.coerce.number().int().min(0),
});

/**
 * The human's verdict on Ally's check-in suggestion.
 *
 * Approving is not a send, and this action never pretends otherwise: it puts
 * the reach-out on the user's task list so they can make it in their own words.
 * Either verdict is recorded as an event, which is what lets the card settle
 * instead of asking the same question on every page load.
 */
export async function decidePartnerCheckin(
  _prev: TouchState,
  formData: FormData,
): Promise<TouchState> {
  const user = await requireUser();

  const parsed = CheckinSchema.safeParse({
    partnerId: formData.get("partnerId"),
    verdict: formData.get("verdict"),
    quietDays: formData.get("quietDays"),
  });

  if (!parsed.success) {
    return { error: "We couldn't record that. Try again." };
  }

  const { partnerId, verdict, quietDays } = parsed.data;
  const approved = verdict === "approve";

  try {
    await queryAs(user, async (db) => {
      const [target] = await db
        .select({
          id: partner.id,
          firstName: partner.firstName,
          lastName: partner.lastName,
          company: partner.company,
        })
        .from(partner)
        .where(eq(partner.id, partnerId))
        .limit(1);
      if (!target) throw new Error("not-visible");

      if (approved) {
        const who = `${target.firstName} ${target.lastName}`;
        await db.insert(task).values({
          tenantId: user.tenantId,
          title: target.company ? `Reach out to ${who} at ${target.company}` : `Reach out to ${who}`,
          detail: `Ally flagged this referral partner: no contact logged in ${quietDays} days.`,
          ownerUserId: user.userId,
          dueAt: new Date(),
          priority: "normal",
        });
      }

      await db.insert(event).values({
        tenantId: user.tenantId,
        kind: approved ? CHECKIN_APPROVED : CHECKIN_SKIPPED,
        actorUserId: user.userId,
        payload: { partnerId, quietDays },
      });

      await recordAudit(db, user, {
        action: approved ? CHECKIN_APPROVED : CHECKIN_SKIPPED,
        entity: "partner",
        entityId: partnerId,
        changes: { quietDays: { from: null, to: quietDays } },
      });
    });
  } catch {
    return { error: "We couldn't record that. Try again." };
  }

  revalidatePath(`/partners/${partnerId}`);
  revalidatePath("/today");
  return {};
}
