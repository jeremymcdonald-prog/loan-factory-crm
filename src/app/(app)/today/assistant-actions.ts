"use server";

import { z } from "zod";
import { requireUser, queryAs } from "@/lib/auth";
import { aiActionLog } from "@/db/schema";
import { routeQuestion } from "@/lib/assistant/router";
import { answerIntent } from "@/lib/assistant/engine";

export type AskResult =
  | { ok: true; reply: string; intent: string }
  | { ok: false; error: string };

const AskSchema = z.object({
  question: z.string().trim().min(1).max(2000),
});

/**
 * Answer an assistant question.
 *
 * The data boundary is structural: everything runs inside queryAs(), so RLS
 * pins the tenant and the engine's own book-scoping pins the role — the
 * assistant holds no privilege of its own. Every question is logged to
 * ai_action_log with the honest model name for the mock router.
 */
export async function askAssistant(formData: FormData): Promise<AskResult> {
  const user = await requireUser();

  const parsed = AskSchema.safeParse({ question: formData.get("question") });
  if (!parsed.success) {
    return { ok: false, error: "Type a question first." };
  }

  const intent = routeQuestion(parsed.data.question);

  try {
    return await queryAs(user, async (db) => {
      const reply = await answerIntent(db, user, intent);

      await db.insert(aiActionLog).values({
        tenantId: user.tenantId,
        action: "assistant.question",
        model: "mock-router-v1",
        promptVersion: "preview",
        actorUserId: user.userId,
        detail: { intent, questionLength: parsed.data.question.length },
      });

      return { ok: true as const, reply: reply.text, intent: reply.intent };
    });
  } catch {
    return {
      ok: false,
      error: "The assistant couldn't read your records just now. Try again.",
    };
  }
}
