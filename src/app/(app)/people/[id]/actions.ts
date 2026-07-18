"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, and, isNull, desc, sql } from "drizzle-orm";
import { z } from "zod";
import {
  note,
  loan,
  event,
  lead,
  person,
  task,
  conversation,
  message,
  campaign,
} from "@/db/schema";
import { requireUser, queryAs, requireRole, type CurrentUser } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { recordAudit } from "@/lib/audit";

/**
 * Every staff role may act on people they can see (RLS + book scope do the
 * narrowing). The check still runs so a session carrying an unknown role
 * never reaches a write.
 */
function requireStaff(user: CurrentUser) {
  requireRole(user, [...ROLES]);
}

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

// --- Record actions ----------------------------------------------------------

const DRAFT_CHANNELS = ["email", "sms", "video"] as const;

const DraftSchema = z.object({
  personId: z.string().uuid(),
  loanId: z.string().uuid().nullable(),
  channel: z.enum(DRAFT_CHANNELS),
  subject: z.string().trim().optional(),
  body: z.string().trim().min(1, "Write the message first."),
});

const CHANNEL_NOUN: Record<(typeof DRAFT_CHANNELS)[number], string> = {
  email: "email",
  sms: "text",
  video: "video message",
};

/**
 * Start (or continue) a conversation with a draft message.
 *
 * This writes an outbound message with status `draft` and `sent_at` null. It
 * does not send anything and it never will on its own: no email, texting, or
 * video provider is connected to this CRM, so there is nothing to hand the
 * message to. The draft sits on the thread until a human sends it once an
 * account is linked — the same honesty rule as the conversations reply box.
 */
export async function createDraftMessage(
  _prev: NoteState,
  formData: FormData,
): Promise<NoteState> {
  const user = await requireUser();

  try {
    requireStaff(user);
  } catch {
    return { error: "You do not have permission to do that." };
  }

  const parsed = DraftSchema.safeParse({
    personId: formData.get("personId"),
    loanId: formData.get("loanId") || null,
    channel: formData.get("channel"),
    subject: formData.get("subject") ?? undefined,
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the message and try again." };
  }

  const { personId, loanId, channel, subject, body } = parsed.data;
  const now = new Date();
  let conversationId: string;

  try {
    conversationId = await queryAs(user, async (db) => {
      // RLS scopes this, but check the person is visible before writing a
      // child row — a clear failure beats a foreign-key error.
      const [target] = await db
        .select({ id: person.id, doNotContact: person.doNotContact })
        .from(person)
        .where(and(eq(person.id, personId), isNull(person.deletedAt)))
        .limit(1);
      if (!target) throw new Error("not-visible");

      // Do-not-contact is absolute, and it is checked here rather than only
      // in the dialog, because the dialog is not the last line of defence.
      if (target.doNotContact) throw new Error("do-not-contact");

      // Continue the person's newest thread on this channel, or open one.
      const [existing] = await db
        .select({ id: conversation.id })
        .from(conversation)
        .where(and(eq(conversation.personId, personId), eq(conversation.channel, channel)))
        .orderBy(desc(conversation.lastMessageAt))
        .limit(1);

      let threadId = existing?.id;
      if (!threadId) {
        const [created] = await db
          .insert(conversation)
          .values({
            tenantId: user.tenantId,
            channel,
            subject: channel === "email" ? subject || null : null,
            personId,
            loanId,
            ownerUserId: user.userId,
            lastMessageAt: now,
          })
          .returning({ id: conversation.id });
        threadId = created.id;
      }

      await db.insert(message).values({
        tenantId: user.tenantId,
        conversationId: threadId,
        channel,
        direction: "outbound",
        status: "draft",
        subject: channel === "email" ? subject || null : null,
        body,
        // A person typed this. AI had nothing to do with it.
        preparedByAi: false,
        authorUserId: user.userId,
        sentAt: null,
        occurredAt: now,
      });

      await db
        .update(conversation)
        .set({ lastMessageAt: now, updatedAt: now })
        .where(eq(conversation.id, threadId));

      await recordAudit(db, user, {
        action: "message.draft_saved",
        entity: "conversation",
        entityId: threadId,
        changes: { channel: { from: null, to: channel } },
      });

      return threadId;
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "";
    if (reason === "do-not-contact") {
      return {
        error:
          "This contact asked not to be contacted, so the draft wasn't saved. Talk to your manager before reaching out.",
      };
    }
    return { error: `We couldn't save that ${CHANNEL_NOUN[channel]} draft. Try again.` };
  }

  revalidatePath(`/people/${personId}`);
  revalidatePath("/conversations");
  redirect(`/conversations/${conversationId}`);
}

const EnrollSchema = z.object({
  personId: z.string().uuid(),
  campaignId: z.string().uuid("Pick a campaign."),
});

export type EnrollState = { error?: string; enrolled?: string };

/**
 * Enroll a person in a drip campaign.
 *
 * This records the enrollment (an event row) and grows the campaign's
 * audience count. It does not send anything: no provider is connected, so the
 * campaign's messages queue for sending once one is. The UI says exactly that.
 */
export async function enrollInCampaign(
  _prev: EnrollState,
  formData: FormData,
): Promise<EnrollState> {
  const user = await requireUser();

  try {
    requireStaff(user);
  } catch {
    return { error: "You do not have permission to do that." };
  }

  const parsed = EnrollSchema.safeParse({
    personId: formData.get("personId"),
    campaignId: formData.get("campaignId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Pick a campaign." };
  }

  const { personId, campaignId } = parsed.data;
  let campaignName: string;

  try {
    campaignName = await queryAs(user, async (db) => {
      const [target] = await db
        .select({ id: person.id, doNotContact: person.doNotContact })
        .from(person)
        .where(and(eq(person.id, personId), isNull(person.deletedAt)))
        .limit(1);
      if (!target) throw new Error("not-visible");
      if (target.doNotContact) throw new Error("do-not-contact");

      const [chosen] = await db
        .select({ id: campaign.id, name: campaign.name, status: campaign.status })
        .from(campaign)
        .where(and(eq(campaign.id, campaignId), isNull(campaign.deletedAt)))
        .limit(1);
      if (!chosen) throw new Error("no-campaign");
      if (chosen.status === "finished") throw new Error("finished");

      // One enrollment per person per campaign — check the event trail.
      const [already] = await db
        .select({ id: event.id })
        .from(event)
        .where(
          and(
            eq(event.kind, "campaign.enrolled"),
            eq(event.personId, personId),
            sql`${event.payload}->>'campaignId' = ${campaignId}`,
          ),
        )
        .limit(1);
      if (already) throw new Error("already-enrolled");

      await db.insert(event).values({
        tenantId: user.tenantId,
        kind: "campaign.enrolled",
        personId,
        actorUserId: user.userId,
        payload: { campaignId, campaignName: chosen.name },
      });

      await db
        .update(campaign)
        .set({
          audienceSize: sql`${campaign.audienceSize} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(campaign.id, campaignId));

      await recordAudit(db, user, {
        action: "campaign.enrolled",
        entity: "campaign",
        entityId: campaignId,
        changes: { personId: { from: null, to: personId } },
      });

      return chosen.name;
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "";
    if (reason === "do-not-contact") {
      return { error: "This contact asked not to be contacted, so they can't be enrolled." };
    }
    if (reason === "already-enrolled") {
      return { error: "They're already enrolled in that campaign." };
    }
    if (reason === "finished") {
      return { error: "That campaign has finished. Pick one that's still open." };
    }
    if (reason === "no-campaign") {
      return { error: "That campaign isn't in your book any more." };
    }
    return { error: "We couldn't enroll them. Nothing was changed — try again." };
  }

  revalidatePath(`/people/${personId}`);
  revalidatePath("/marketing");
  return {
    enrolled: `Enrolled in "${campaignName}" — messages queue for sending when a provider is connected.`,
  };
}

const TaskSchema = z.object({
  personId: z.string().uuid(),
  loanId: z.string().uuid().nullable(),
  title: z.string().trim().min(1, "Say what needs doing."),
  dueAt: z.string().trim().optional(),
});

/** Add a follow-up task tied to this person, owned by whoever added it. */
export async function addTask(_prev: NoteState, formData: FormData): Promise<NoteState> {
  const user = await requireUser();

  try {
    requireStaff(user);
  } catch {
    return { error: "You do not have permission to do that." };
  }

  const parsed = TaskSchema.safeParse({
    personId: formData.get("personId"),
    loanId: formData.get("loanId") || null,
    title: formData.get("title"),
    dueAt: formData.get("dueAt") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the task and try again." };
  }

  const { personId, loanId, title } = parsed.data;
  const dueAt = parsed.data.dueAt ? new Date(parsed.data.dueAt) : null;
  if (dueAt && Number.isNaN(dueAt.getTime())) {
    return { error: "That due date didn't read as a real date." };
  }

  try {
    await queryAs(user, async (db) => {
      const [target] = await db
        .select({ id: person.id })
        .from(person)
        .where(and(eq(person.id, personId), isNull(person.deletedAt)))
        .limit(1);
      if (!target) throw new Error("not-visible");

      await db.insert(task).values({
        tenantId: user.tenantId,
        title,
        ownerUserId: user.userId,
        dueAt,
        personId,
        loanId,
      });

      await recordAudit(db, user, {
        action: "task.created",
        entity: "person",
        entityId: personId,
        changes: { title: { from: null, to: title } },
      });
    });
  } catch {
    return { error: "We couldn't add that task. Try again." };
  }

  revalidatePath(`/people/${personId}`);
  revalidatePath("/today");
  return {};
}
