"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "@/db";
import { conversation, message, person, partner } from "@/db/schema";
import { requireUser, queryAs, type CurrentUser } from "@/lib/auth";
import { seesWholeBook } from "@/lib/roles";
import { recordAudit } from "@/lib/audit";
import { COMPOSE_CHANNELS } from "@/lib/queries/conversations";

export type ReplyState = {
  error?: string;
  /** Set when a draft was saved, so the UI can say exactly what happened. */
  savedAt?: number;
};

/**
 * The plain-text line that stands in for a hosted-video link in the demo —
 * the same convention as the marketing composer (marketing/compose/actions.ts).
 */
const VIDEO_FALLBACK_LINE = "If the video doesn't load, use this link instead.";

const ReplySchema = z.object({
  conversationId: z.string().uuid(),
  body: z.string().trim().max(10000).optional().default(""),
  videoTitle: z.string().trim().max(200).optional().default(""),
  videoCaption: z.string().trim().max(300).optional().default(""),
});

/** "Re: Your closing is Thursday" — and never "Re: Re: …". */
function replySubject(subject: string | null): string | null {
  if (!subject) return null;
  return /^re:\s/i.test(subject) ? subject : `Re: ${subject}`;
}

/**
 * A message that only ever carried metadata: the recording stays in the
 * sender's browser, so the draft's body says what the video is, not what it
 * contains. Identical shape to the marketing composer's video drafts.
 */
function videoBody(title: string, caption: string): string {
  return [`[Video: ${title}]`, VIDEO_FALLBACK_LINE, caption].filter(Boolean).join("\n\n");
}

/**
 * Do-not-contact is absolute, and it is checked here rather than only in the
 * form, because the form is not the last line of defence.
 */
async function assertMayContact(
  db: Db,
  thread: { personId: string | null; partnerId: string | null },
): Promise<void> {
  if (thread.personId) {
    const [contact] = await db
      .select({ doNotContact: person.doNotContact })
      .from(person)
      .where(eq(person.id, thread.personId))
      .limit(1);
    if (contact?.doNotContact) throw new Error("do-not-contact");
  }

  if (thread.partnerId) {
    const [contact] = await db
      .select({ doNotContact: partner.doNotContact })
      .from(partner)
      .where(eq(partner.id, thread.partnerId))
      .limit(1);
    if (contact?.doNotContact) throw new Error("do-not-contact");
  }
}

/**
 * Save a reply on a thread — email, text, app message, or the details of a
 * video email.
 *
 * This writes an outbound message with status `draft` and `sent_at` null. It
 * does not send anything and it never will on its own: no email, texting, or
 * app-messaging provider is connected to this CRM, so there is nothing to hand
 * the message to. The draft sits on the thread until a human sends it once an
 * account is linked. Claiming otherwise in the name, the copy, or the row
 * would be a lie the loan officer only discovers when the borrower never
 * answers.
 *
 * `awaiting_reply` is deliberately left alone. Until the message actually
 * goes out, the borrower is still waiting, and the inbox must keep saying so.
 */
export async function sendReply(_prev: ReplyState, formData: FormData): Promise<ReplyState> {
  const user = await requireUser();

  const parsed = ReplySchema.safeParse({
    conversationId: formData.get("conversationId"),
    body: formData.get("body") ?? "",
    videoTitle: formData.get("videoTitle") ?? "",
    videoCaption: formData.get("videoCaption") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "We couldn't save that draft." };
  }

  const { conversationId, body, videoTitle, videoCaption } = parsed.data;
  const now = new Date();

  try {
    await queryAs(user, async (db) => {
      // RLS scopes this, but check the thread is visible before writing a
      // child row — a clear failure beats a foreign-key error.
      const [thread] = await db
        .select({
          channel: conversation.channel,
          subject: conversation.subject,
          personId: conversation.personId,
          partnerId: conversation.partnerId,
        })
        .from(conversation)
        .where(eq(conversation.id, conversationId))
        .limit(1);

      if (!thread) throw new Error("not-visible");

      // A typed reply lives on a writable channel. It is not a phone call, and
      // it is not an internal note — writing one into those threads would
      // misfile it.
      if (thread.channel === "call") throw new Error("wrong-channel-call");
      if (thread.channel === "note") throw new Error("wrong-channel-note");

      await assertMayContact(db, thread);

      // Channel-appropriate content: a video reply is a title and a caption
      // (the recording never reaches the server); everything else is a body.
      const isVideo = thread.channel === "video";
      if (isVideo && !videoTitle) throw new Error("video-title-missing");
      if (!isVideo && !body) throw new Error("body-missing");

      await db.insert(message).values({
        tenantId: user.tenantId,
        conversationId,
        channel: thread.channel,
        direction: "outbound",
        status: "draft",
        subject:
          thread.channel === "email" || thread.channel === "video"
            ? replySubject(thread.subject)
            : null,
        body: isVideo ? videoBody(videoTitle, videoCaption) : body,
        // A person typed this. AI had nothing to do with it.
        preparedByAi: false,
        authorUserId: user.userId,
        sentAt: null,
        occurredAt: now,
        meta: isVideo
          ? { video: { title: videoTitle, caption: videoCaption, demo: true } }
          : {},
      });

      // The thread has new content, so it rises in the inbox. What it does not
      // get is a cleared `awaitingReply` flag — nothing has been answered yet.
      await db
        .update(conversation)
        .set({ lastMessageAt: now, updatedAt: now })
        .where(eq(conversation.id, conversationId));

      await recordAudit(db, user, {
        action: "message.draft_saved",
        entity: "conversation",
        entityId: conversationId,
      });
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "";

    if (reason === "do-not-contact") {
      return {
        error:
          "This contact asked not to be contacted, so the draft wasn't saved. Talk to your manager before reaching out.",
      };
    }
    if (reason === "wrong-channel-call") {
      return {
        error: "This thread is a record of a call. Log what happened on their record instead.",
      };
    }
    if (reason === "wrong-channel-note") {
      return {
        error: "This thread is an internal note — it never goes to anyone outside the team.",
      };
    }
    if (reason === "video-title-missing") {
      return { error: "Give the video a title first." };
    }
    if (reason === "body-missing") {
      return { error: "Write your reply first." };
    }
    return { error: "We couldn't save that draft. Nothing was lost — try again." };
  }

  revalidatePath(`/conversations/${conversationId}`);
  revalidatePath("/conversations");
  return { savedAt: Date.now() };
}

// ---------------------------------------------------------------------------
// The approval state machine: draft → awaiting_approval → approved.
//
// `sent` is not a state these actions can reach. Approving a message marks it
// ready and leaves `sent_at` NULL — it queues for sending when an email/SMS
// provider is connected, and not a moment sooner.
// ---------------------------------------------------------------------------

export type ApprovalState = {
  error?: string;
  doneAt?: number;
};

const MessageIdSchema = z.object({ messageId: z.string().uuid() });

/** Only leadership approves outbound messages — the same set that sees the whole book. */
function canApproveMessages(user: CurrentUser): boolean {
  return seesWholeBook(user.role);
}

async function loadOutboundMessage(db: Db, messageId: string) {
  const [row] = await db
    .select({
      id: message.id,
      conversationId: message.conversationId,
      direction: message.direction,
      status: message.status,
    })
    .from(message)
    .where(eq(message.id, messageId))
    .limit(1);

  if (!row || row.direction !== "outbound") throw new Error("not-visible");
  return row;
}

/** draft → awaiting_approval. The author asking a leader to look at it. */
export async function submitForApproval(
  _prev: ApprovalState,
  formData: FormData,
): Promise<ApprovalState> {
  const user = await requireUser();

  const parsed = MessageIdSchema.safeParse({ messageId: formData.get("messageId") });
  if (!parsed.success) return { error: "We couldn't find that message." };

  let conversationId = "";

  try {
    await queryAs(user, async (db) => {
      const msg = await loadOutboundMessage(db, parsed.data.messageId);
      conversationId = msg.conversationId;

      if (msg.status !== "draft") throw new Error("wrong-status");

      await db
        .update(message)
        .set({ status: "awaiting_approval" })
        .where(eq(message.id, msg.id));

      await recordAudit(db, user, {
        action: "message.submitted",
        entity: "message",
        entityId: msg.id,
        changes: { status: { from: "draft", to: "awaiting_approval" } },
      });
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "";
    if (reason === "wrong-status") {
      return { error: "Only a draft can be submitted for approval." };
    }
    return { error: "We couldn't submit that draft. Try again." };
  }

  revalidatePath(`/conversations/${conversationId}`);
  revalidatePath("/conversations");
  return { doneAt: Date.now() };
}

/**
 * awaiting_approval → approved. Leadership only. `sent_at` stays NULL —
 * approval means "may go out", not "went out".
 */
export async function approveMessage(
  _prev: ApprovalState,
  formData: FormData,
): Promise<ApprovalState> {
  const user = await requireUser();

  if (!canApproveMessages(user)) {
    return { error: "Only team leaders, branch leaders, and admins can approve messages." };
  }

  const parsed = MessageIdSchema.safeParse({ messageId: formData.get("messageId") });
  if (!parsed.success) return { error: "We couldn't find that message." };

  let conversationId = "";
  const now = new Date();

  try {
    await queryAs(user, async (db) => {
      const msg = await loadOutboundMessage(db, parsed.data.messageId);
      conversationId = msg.conversationId;

      if (msg.status !== "awaiting_approval") {
        throw new Error("wrong-status");
      }

      await db
        .update(message)
        .set({
          status: "approved",
          approvedByUserId: user.userId,
          approvedAt: now,
          // Deliberately NOT setting sentAt: nothing sends from this CRM.
        })
        .where(eq(message.id, msg.id));

      await recordAudit(db, user, {
        action: "message.approved",
        entity: "message",
        entityId: msg.id,
        changes: { status: { from: "awaiting_approval", to: "approved" } },
      });
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "";
    if (reason === "wrong-status") {
      return { error: "Only a message waiting for approval can be approved." };
    }
    return { error: "We couldn't approve that message. Try again." };
  }

  revalidatePath(`/conversations/${conversationId}`);
  revalidatePath("/conversations");
  return { doneAt: Date.now() };
}

// ---------------------------------------------------------------------------
// New message — the composer on /conversations/new.
// ---------------------------------------------------------------------------

export type ComposeState = {
  error?: string;
};

const ComposeSchema = z
  .object({
    personId: z.string().uuid("Pick who this message is for."),
    channel: z.enum(COMPOSE_CHANNELS),
    subject: z.string().trim().max(300).optional().default(""),
    body: z.string().trim().max(10000).optional().default(""),
    videoTitle: z.string().trim().max(200).optional().default(""),
    videoCaption: z.string().trim().max(300).optional().default(""),
  })
  .superRefine((input, ctx) => {
    if ((input.channel === "email" || input.channel === "video") && !input.subject) {
      ctx.addIssue({ code: "custom", message: "Give it a subject line." });
    }
    if (input.channel === "video") {
      if (!input.videoTitle) {
        ctx.addIssue({
          code: "custom",
          message: "Give the video a title — it stands in for the thumbnail's link text.",
        });
      }
    } else if (!input.body) {
      ctx.addIssue({ code: "custom", message: "Write the message first." });
    }
  });

/**
 * Save a new outbound message as a draft — into the person's existing thread
 * on that channel when one is visible, or a fresh thread otherwise.
 *
 * Same honesty contract as every draft here: status `draft`, `sent_at` NULL,
 * nothing sends. For a video, only the title and caption are stored
 * (`meta.video`, `demo: true`) — the recording stays on the sender's device,
 * exactly as in the marketing composer.
 */
export async function createMessage(
  _prev: ComposeState,
  formData: FormData,
): Promise<ComposeState> {
  const user = await requireUser();

  const parsed = ComposeSchema.safeParse({
    personId: formData.get("personId"),
    channel: formData.get("channel"),
    subject: formData.get("subject") ?? "",
    body: formData.get("body") ?? "",
    videoTitle: formData.get("videoTitle") ?? "",
    videoCaption: formData.get("videoCaption") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the details and try again." };
  }

  const input = parsed.data;
  const isVideo = input.channel === "video";
  const now = new Date();
  let threadId = "";

  try {
    await queryAs(user, async (db) => {
      const [contact] = await db
        .select({ id: person.id, doNotContact: person.doNotContact })
        .from(person)
        .where(and(eq(person.id, input.personId), isNull(person.deletedAt)))
        .limit(1);

      if (!contact) throw new Error("not-visible");
      if (contact.doNotContact) throw new Error("do-not-contact");

      // Reuse their thread on this channel when the user can see one — a
      // second parallel thread would split the record. Own book only, unless
      // the role sees the whole book.
      const threadScope = seesWholeBook(user.role)
        ? undefined
        : eq(conversation.ownerUserId, user.userId);

      const [existing] = await db
        .select({ id: conversation.id })
        .from(conversation)
        .where(
          and(
            eq(conversation.personId, input.personId),
            eq(conversation.channel, input.channel),
            threadScope,
          ),
        )
        .orderBy(desc(conversation.lastMessageAt))
        .limit(1);

      if (existing) {
        threadId = existing.id;
        await db
          .update(conversation)
          .set({ lastMessageAt: now, updatedAt: now })
          .where(eq(conversation.id, existing.id));
      } else {
        const [created] = await db
          .insert(conversation)
          .values({
            tenantId: user.tenantId,
            subject: input.subject || null,
            channel: input.channel,
            personId: input.personId,
            ownerUserId: user.userId,
            awaitingReply: false,
            lastMessageAt: now,
          })
          .returning({ id: conversation.id });
        threadId = created.id;
      }

      const [saved] = await db
        .insert(message)
        .values({
          tenantId: user.tenantId,
          conversationId: threadId,
          channel: input.channel,
          direction: "outbound",
          status: "draft",
          subject:
            input.channel === "email" || input.channel === "video"
              ? input.subject || null
              : null,
          body: isVideo ? videoBody(input.videoTitle, input.videoCaption) : input.body,
          preparedByAi: false,
          authorUserId: user.userId,
          sentAt: null,
          occurredAt: now,
          meta: isVideo
            ? { video: { title: input.videoTitle, caption: input.videoCaption, demo: true } }
            : {},
        })
        .returning({ id: message.id });

      await recordAudit(db, user, {
        action: "message.draft_saved",
        entity: "message",
        entityId: saved.id,
        changes: {
          channel: { from: null, to: input.channel },
          subject: { from: null, to: input.subject || null },
          ...(isVideo ? { videoTitle: { from: null, to: input.videoTitle } } : {}),
        },
      });
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "";
    if (reason === "do-not-contact") {
      return {
        error:
          "This contact asked not to be contacted, so nothing was saved. Talk to your manager before reaching out.",
      };
    }
    if (reason === "not-visible") {
      return { error: "We couldn't find that contact. Pick them from the list again." };
    }
    return { error: "We couldn't save that draft. Nothing was stored — try again." };
  }

  revalidatePath("/conversations");
  // Outside the try/catch: redirect() throws by design, and catching it here
  // would report a successful save as a failure.
  redirect(`/conversations/${threadId}`);
}
