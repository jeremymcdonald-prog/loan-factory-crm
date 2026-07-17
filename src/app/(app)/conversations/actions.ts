"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { conversation, message, person, partner } from "@/db/schema";
import { requireUser, queryAs } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";

export type ReplyState = {
  error?: string;
  /** Set when a draft was saved, so the UI can say exactly what happened. */
  savedAt?: number;
};

const ReplySchema = z.object({
  conversationId: z.string().uuid(),
  body: z.string().trim().min(1, "Write your reply first."),
});

/** "Re: Your closing is Thursday" — and never "Re: Re: …". */
function replySubject(subject: string | null): string | null {
  if (!subject) return null;
  return /^re:\s/i.test(subject) ? subject : `Re: ${subject}`;
}

/**
 * Save a reply on a thread.
 *
 * This writes an outbound message with status `draft` and `sent_at` null. It
 * does not send anything and it never will on its own: no email or texting
 * provider is connected to this CRM, so there is nothing to hand the message
 * to. The draft sits on the thread until a human sends it once an account is
 * linked. Claiming otherwise in the name, the copy, or the row would be a lie
 * the loan officer only discovers when the borrower never answers.
 *
 * `awaiting_reply` is deliberately left alone. Until the message actually
 * goes out, the borrower is still waiting, and the inbox must keep saying so.
 */
export async function sendReply(_prev: ReplyState, formData: FormData): Promise<ReplyState> {
  const user = await requireUser();

  const parsed = ReplySchema.safeParse({
    conversationId: formData.get("conversationId"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "We couldn't save that draft." };
  }

  const { conversationId, body } = parsed.data;
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

      // A typed reply is an email or a text. It is not a phone call, and it is
      // not an internal note — writing one into that thread would misfile it.
      if (thread.channel !== "email" && thread.channel !== "sms") {
        throw new Error("wrong-channel");
      }

      // Do-not-contact is absolute, and it is checked here rather than only in
      // the form, because the form is not the last line of defence.
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

      await db.insert(message).values({
        tenantId: user.tenantId,
        conversationId,
        channel: thread.channel,
        direction: "outbound",
        status: "draft",
        subject: thread.channel === "email" ? replySubject(thread.subject) : null,
        body,
        // A person typed this. AI had nothing to do with it.
        preparedByAi: false,
        authorUserId: user.userId,
        sentAt: null,
        occurredAt: now,
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
    if (reason === "wrong-channel") {
      return {
        error: "This thread is a record of a call. Log what happened on their record instead.",
      };
    }
    return { error: "We couldn't save that draft. Nothing was lost — try again." };
  }

  revalidatePath(`/conversations/${conversationId}`);
  revalidatePath("/conversations");
  return { savedAt: Date.now() };
}
