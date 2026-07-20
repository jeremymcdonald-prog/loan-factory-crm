"use server";

/**
 * The rich AI persona manager's own actions — everything beyond the document
 * upload/replace/delete/enable-disable, which already lives in
 * src/app/(app)/settings/profile/actions.ts (M2) and is reused as-is (see
 * src/app/(app)/settings/ai/persona/persona-manager.tsx).
 *
 * Every mutation here follows the same shape as M2: requireUser + queryAs
 * (RLS pins ai_persona to tenant AND owner) + zod + recordAudit. Instructions,
 * tone, and word lists are free text the user wrote about themselves — like
 * the extracted document text and the sample-writing text, they are never
 * written into the audit log; only *that* something changed is recorded, the
 * same pattern src/app/(app)/settings/profile/actions.ts already uses for the
 * profile photo and signature logo.
 *
 * `getMyPersonaGuidance` and `rewriteMyDraft` are reads, not mutations — like
 * `getMySignatureProfile` in profile/actions.ts, they carry no audit entry and
 * are meant to be imported directly by any drafting surface (marketing
 * compose, people/partner record actions, and — per M6 — the campaign step
 * editor and template library) so every one of them offers the same
 * "Rewrite in my voice" behavior from one honest, deterministic helper.
 */

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { aiPersona } from "@/db/schema";
import type { Db } from "@/db";
import { requireUser, queryAs } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { validatePersonaFile } from "@/lib/profile-validation";
import { extractPersonaText } from "@/app/(app)/settings/profile/actions";
import {
  rewriteWithPersona,
  personaGuidance,
  emptyPersonaGuidance,
  type PersonaGuidance,
} from "@/lib/persona/rewrite";

export type ProfileState = { error?: string; ok?: string };

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** Splits on commas or newlines, trims, drops blanks, and caps the list length. */
function parseWordList(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((w) => w.trim())
    .filter(Boolean)
    .slice(0, MAX_WORDS);
}

const MAX_INSTRUCTIONS = 4_000;
const MAX_TONE = 300;
const MAX_WORDS = 30;
const MAX_WORD_LEN = 60;
const MAX_COMPLIANCE = 2_000;
const MAX_SAMPLE_CHARS = 8_000;

// ---------------------------------------------------------------------------
// Instructions, tone, prefer/avoid words, compliance boundaries
// ---------------------------------------------------------------------------

const PersonaProfileSchema = z.object({
  instructions: z
    .string()
    .trim()
    .max(MAX_INSTRUCTIONS, `Keep instructions under ${MAX_INSTRUCTIONS.toLocaleString()} characters.`),
  tone: z.string().trim().max(MAX_TONE, `Keep the tone description under ${MAX_TONE} characters.`),
  preferWords: z
    .array(z.string().trim().max(MAX_WORD_LEN, "Keep each word or phrase short."))
    .max(MAX_WORDS, `List at most ${MAX_WORDS} words or phrases.`),
  avoidWords: z
    .array(z.string().trim().max(MAX_WORD_LEN, "Keep each word or phrase short."))
    .max(MAX_WORDS, `List at most ${MAX_WORDS} words or phrases.`),
  complianceNotes: z
    .string()
    .trim()
    .max(MAX_COMPLIANCE, `Keep compliance notes under ${MAX_COMPLIANCE.toLocaleString()} characters.`),
});

export async function savePersonaProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser();

  const parsed = PersonaProfileSchema.safeParse({
    instructions: str(formData, "instructions"),
    tone: str(formData, "tone"),
    preferWords: parseWordList(str(formData, "preferWords")),
    avoidWords: parseWordList(str(formData, "avoidWords")),
    complianceNotes: str(formData, "complianceNotes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the details and try again." };
  }

  const d = parsed.data;
  const next = {
    instructions: d.instructions || null,
    tone: d.tone || null,
    preferWords: d.preferWords,
    avoidWords: d.avoidWords,
    complianceNotes: d.complianceNotes || null,
  };

  try {
    await queryAs(user, async (db) => {
      const [before] = await db
        .select({
          instructions: aiPersona.instructions,
          tone: aiPersona.tone,
          preferWords: aiPersona.preferWords,
          avoidWords: aiPersona.avoidWords,
          complianceNotes: aiPersona.complianceNotes,
        })
        .from(aiPersona)
        .where(eq(aiPersona.userId, user.userId))
        .limit(1);

      await db
        .insert(aiPersona)
        .values({ tenantId: user.tenantId, userId: user.userId, enabled: true, ...next })
        .onConflictDoUpdate({
          target: aiPersona.userId,
          set: { ...next, updatedAt: new Date() },
        });

      // Free text the user wrote about themselves never enters the audit log
      // — only that each field changed, same as the profile photo/signature
      // logo pattern in settings/profile/actions.ts.
      await recordAudit(db, user, {
        action: "persona.profile_updated",
        entity: "ai_persona",
        changes: {
          instructions: {
            from: before?.instructions ? "set" : "not set",
            to: next.instructions ? "set" : "not set",
          },
          tone: {
            from: before?.tone ? "set" : "not set",
            to: next.tone ? "set" : "not set",
          },
          preferWords: {
            from: `${before?.preferWords?.length ?? 0} word(s)`,
            to: `${next.preferWords.length} word(s)`,
          },
          avoidWords: {
            from: `${before?.avoidWords?.length ?? 0} word(s)`,
            to: `${next.avoidWords.length} word(s)`,
          },
          complianceNotes: {
            from: before?.complianceNotes ? "set" : "not set",
            to: next.complianceNotes ? "set" : "not set",
          },
        },
      });
    });
  } catch {
    return { error: "We couldn't save your persona settings. Nothing was changed." };
  }

  revalidatePath("/settings/ai/persona");
  revalidatePath("/settings/profile");
  return { ok: "Persona settings saved." };
}

// ---------------------------------------------------------------------------
// Sample writing — a pasted textarea OR an uploaded file, both landing in the
// same `sampleText` column. Reuses the exact extraction logic M2 built for
// the persona document (extractPersonaText), rather than a second copy of it.
// ---------------------------------------------------------------------------

const SampleTextSchema = z.object({
  sampleText: z
    .string()
    .trim()
    .max(MAX_SAMPLE_CHARS, `Keep the sample under ${MAX_SAMPLE_CHARS.toLocaleString()} characters.`),
});

export async function saveSampleText(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser();

  const file = formData.get("file");
  let sampleText: string;

  if (file instanceof File && file.size > 0) {
    const valid = validatePersonaFile(file.name, file.type, file.size);
    if (!valid.ok) return { error: valid.reason };

    try {
      const text = (await extractPersonaText(file, valid.kind)).trim();
      if (!text) {
        return {
          error:
            "We opened the file but found no readable text. If it's scanned, paste the text instead.",
        };
      }
      sampleText = text.slice(0, MAX_SAMPLE_CHARS);
    } catch {
      return {
        error: "We couldn't read that file. It may be corrupted or password-protected.",
      };
    }
  } else {
    const parsed = SampleTextSchema.safeParse({ sampleText: str(formData, "sampleText") });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Check the sample and try again." };
    }
    sampleText = parsed.data.sampleText;
  }

  try {
    await queryAs(user, async (db) => {
      const [before] = await db
        .select({ sampleText: aiPersona.sampleText })
        .from(aiPersona)
        .where(eq(aiPersona.userId, user.userId))
        .limit(1);

      await db
        .insert(aiPersona)
        .values({
          tenantId: user.tenantId,
          userId: user.userId,
          enabled: true,
          sampleText: sampleText || null,
        })
        .onConflictDoUpdate({
          target: aiPersona.userId,
          set: { sampleText: sampleText || null, updatedAt: new Date() },
        });

      // The sample text is the user's own private writing — never logged,
      // only that it changed and by roughly how much.
      await recordAudit(db, user, {
        action: "persona.sample_updated",
        entity: "ai_persona",
        changes: {
          sampleText: {
            from: before?.sampleText ? "sample on file" : "none",
            to: sampleText ? `new sample (${sampleText.length} chars)` : "none",
          },
        },
      });
    });
  } catch {
    return { error: "We couldn't save the sample. Nothing was changed." };
  }

  revalidatePath("/settings/ai/persona");
  return { ok: "Sample writing saved." };
}

// ---------------------------------------------------------------------------
// Test persona — runs one fixed, non-sensitive sentence through the exact
// same rewrite helper every other surface calls, so "Test persona" shows the
// truth, not a special-cased demo.
// ---------------------------------------------------------------------------

const PERSONA_TEST_SENTENCE =
  "I wanted to follow up and let you know we can guarantee your approval moves fast.";

export type PersonaTestState = {
  error?: string;
  result?: { before: string; after: string; note: string; applied: string[] };
};

async function loadPersonaGuidance(
  db: Db,
  userId: string,
): Promise<{ guidance: PersonaGuidance; enabled: boolean; id: string | null }> {
  const [row] = await db
    .select({
      id: aiPersona.id,
      instructions: aiPersona.instructions,
      tone: aiPersona.tone,
      preferWords: aiPersona.preferWords,
      avoidWords: aiPersona.avoidWords,
      complianceNotes: aiPersona.complianceNotes,
      sampleText: aiPersona.sampleText,
      enabled: aiPersona.enabled,
    })
    .from(aiPersona)
    .where(eq(aiPersona.userId, userId))
    .limit(1);

  if (!row) return { guidance: emptyPersonaGuidance(), enabled: false, id: null };

  return {
    guidance: {
      instructions: row.instructions,
      tone: row.tone,
      preferWords: row.preferWords ?? [],
      avoidWords: row.avoidWords ?? [],
      complianceNotes: row.complianceNotes,
      sampleText: row.sampleText,
    },
    enabled: row.enabled,
    id: row.id,
  };
}

/**
 * Not bound to a form — the "Test persona" button calls this directly (same
 * calling convention as `getMySignatureProfile`), since there's no form
 * input: it always runs the one fixed sample sentence.
 */
export async function testPersona(): Promise<PersonaTestState> {
  const user = await requireUser();

  try {
    const outcome = await queryAs(user, async (db) => {
      const { guidance, id } = await loadPersonaGuidance(db, user.userId);
      const rewrite = rewriteWithPersona(PERSONA_TEST_SENTENCE, guidance);

      // No drafted text is logged — just that a test ran.
      await recordAudit(db, user, {
        action: "persona.tested",
        entity: "ai_persona",
        entityId: id ?? undefined,
      });

      return rewrite;
    });

    return {
      result: {
        before: PERSONA_TEST_SENTENCE,
        after: outcome.output,
        note: outcome.note,
        applied: outcome.applied,
      },
    };
  } catch {
    return { error: "We couldn't run the test. Try again." };
  }
}

// ---------------------------------------------------------------------------
// Shared reads for other drafting surfaces — no audit entry, same rationale
// as getMySignatureProfile in settings/profile/actions.ts: this reads private
// data (RLS-pinned to the owner) but mutates nothing, so there's nothing to
// log. Every "Rewrite in my voice" control (marketing compose, people/partner
// record actions, and per M6 the campaign step editor + template library)
// calls `rewriteMyDraft`.
// ---------------------------------------------------------------------------

export async function getMyPersonaGuidance(): Promise<{
  guidance: PersonaGuidance;
  enabled: boolean;
  hasPersona: boolean;
}> {
  const user = await requireUser();
  return queryAs(user, async (db) => {
    const { guidance, enabled, id } = await loadPersonaGuidance(db, user.userId);
    return { guidance, enabled, hasPersona: id !== null };
  });
}

export type RewriteOutcome = {
  output: string;
  note: string;
  applied: string[];
  hasPersona: boolean;
  personaEnabled: boolean;
};

const RewriteInputSchema = z.object({
  text: z.string().max(20_000),
  channel: z.string().trim().max(40).optional(),
});

/**
 * The one function every "Rewrite in my voice" control calls. Never applies
 * anything automatically — callers show the result and require an explicit
 * accept before it replaces the caller's draft, and nothing here ever sends
 * or saves the rewritten text itself.
 */
export async function rewriteMyDraft(text: string, channel?: string): Promise<RewriteOutcome> {
  const parsed = RewriteInputSchema.safeParse({ text, channel });
  const safeText = parsed.success ? parsed.data.text : text.slice(0, 20_000);
  const safeChannel = parsed.success ? parsed.data.channel : undefined;

  const { guidance, enabled, hasPersona } = await getMyPersonaGuidance();

  if (!hasPersona || !enabled) {
    return {
      output: safeText,
      note: !hasPersona
        ? "No persona is set up yet — this is your original text, unchanged."
        : "Your persona is turned off — this is your original text, unchanged.",
      applied: [],
      hasPersona,
      personaEnabled: enabled,
    };
  }

  const result = rewriteWithPersona(safeText, guidance, { channel: safeChannel });
  return { ...result, hasPersona, personaEnabled: enabled };
}

/** Exposed for a future model integration (M6) to inspect the assembled guidance text directly. */
export async function getMyPersonaGuidanceText(): Promise<string> {
  const { guidance } = await getMyPersonaGuidance();
  return personaGuidance(guidance);
}
