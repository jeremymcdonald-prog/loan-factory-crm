"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { conversation, message } from "@/db/schema";
import { requireUser, queryAs } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";

export type DraftFormState = {
  ok?: boolean;
  error?: string;
  /** Echoed back so the confirmation can name what was saved. */
  savedSubject?: string;
};

/** The plain-text line that stands in for a hosted-video link in the demo. */
const FALLBACK_LINE = "If the video doesn't load, use this link instead.";

const SaveDraftSchema = z.object({
  audience: z.string().trim().max(300).optional().default(""),
  subject: z.string().trim().min(1, "Give the email a subject line."),
  intro: z.string().trim().min(1, "Write at least a sentence before the video."),
  closing: z.string().trim().max(5000).optional().default(""),
  language: z.enum(["en", "es", "vi", "ru"]),
  videoTitle: z
    .string()
    .trim()
    .min(1, "Give the video a title — it stands in for the thumbnail's link text."),
  videoCaption: z.string().trim().max(300).optional().default(""),
  /** Whatever the browser measured; uploads can run longer than recordings. */
  durationSeconds: z.coerce.number().int().min(0).max(60 * 60 * 4),
});

/**
 * Save a video email as a draft — a conversation + one draft message, shaped
 * exactly like the seeded examples.
 *
 * Honesty is structural here: the video BYTES never reach this action. Only
 * the metadata (title, caption, duration) is persisted, in `meta.video` with
 * `demo: true`, and the recording itself stays in the sender's browser.
 * Nothing sends — the message lands at status 'draft', same as every other
 * draft in the approval flow.
 */
export async function saveVideoDraft(
  _prev: DraftFormState,
  formData: FormData,
): Promise<DraftFormState> {
  const user = await requireUser();

  const parsed = SaveDraftSchema.safeParse({
    audience: formData.get("audience") ?? "",
    subject: formData.get("subject"),
    intro: formData.get("intro"),
    closing: formData.get("closing") ?? "",
    language: formData.get("language"),
    videoTitle: formData.get("videoTitle"),
    videoCaption: formData.get("videoCaption") ?? "",
    durationSeconds: formData.get("durationSeconds") ?? 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the details and try again." };
  }

  const input = parsed.data;
  const body = [input.intro, `[Video: ${input.videoTitle}]`, FALLBACK_LINE, input.closing]
    .filter(Boolean)
    .join("\n\n");

  try {
    await queryAs(user, async (db) => {
      const [conv] = await db
        .insert(conversation)
        .values({
          tenantId: user.tenantId,
          subject: input.subject,
          channel: "email",
          ownerUserId: user.userId,
          awaitingReply: false,
        })
        .returning({ id: conversation.id });

      const [saved] = await db
        .insert(message)
        .values({
          tenantId: user.tenantId,
          conversationId: conv.id,
          channel: "email",
          direction: "outbound",
          status: "draft",
          subject: input.subject,
          body,
          preparedByAi: false,
          languageCode: input.language,
          authorUserId: user.userId,
          meta: {
            video: {
              title: input.videoTitle,
              caption: input.videoCaption,
              durationSeconds: input.durationSeconds,
              demo: true,
            },
            ...(input.audience ? { audienceNote: input.audience } : {}),
          },
        })
        .returning({ id: message.id });

      await recordAudit(db, user, {
        action: "message.draft_saved",
        entity: "message",
        entityId: saved.id,
        changes: {
          subject: { from: null, to: input.subject },
          language: { from: null, to: input.language },
          videoTitle: { from: null, to: input.videoTitle },
          videoDurationSeconds: { from: null, to: input.durationSeconds },
          audience: { from: null, to: input.audience || null },
        },
      });
    });
  } catch {
    return { error: "We couldn't save that draft. Nothing was stored." };
  }

  revalidatePath("/marketing");
  revalidatePath("/marketing/compose");
  return { ok: true, savedSubject: input.subject };
}
