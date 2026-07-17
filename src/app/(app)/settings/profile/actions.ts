"use server";

/**
 * My profile actions. Every mutation writes ONLY the signed-in user's own row
 * (`WHERE id = user.userId` / `WHERE user_id = user.userId`) — no userId is
 * ever accepted from the form. RLS additionally pins ai_persona rows to their
 * owner at the database level.
 */

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { user as userTable, aiPersona } from "@/db/schema";
import { requireUser, queryAs } from "@/lib/auth";
import { recordAudit, diff } from "@/lib/audit";
import {
  validatePhotoDataUrl,
  validatePersonaFile,
  TIMEZONE_VALUES,
  type PersonaKind,
} from "@/lib/profile-validation";

export type ProfileState = { error?: string; ok?: string };

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

// ---------------------------------------------------------------------------
// Profile details
// ---------------------------------------------------------------------------

const optionalHttpsUrl = z.union(
  [z.literal(""), z.url({ protocol: /^https$/ })],
  "Links must be full https:// addresses.",
);

const ProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your name."),
  title: z.string().trim().max(120, "Keep the job title under 120 characters."),
  phone: z.string().trim().max(30, "That phone number looks too long."),
  nmlsId: z.union(
    [z.literal(""), z.string().trim().regex(/^\d{4,10}$/)],
    "An NMLS ID is digits only — check the number.",
  ),
  timezone: z.union(
    [z.literal(""), z.enum(TIMEZONE_VALUES as [string, ...string[]])],
    "Choose a timezone from the list.",
  ),
  language: z.enum(["en", "vi", "zh", "es", "ru"], "Choose a language from the list."),
  website: optionalHttpsUrl,
  linkedin: optionalHttpsUrl,
  facebook: optionalHttpsUrl,
  instagram: optionalHttpsUrl,
});

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser();

  const parsed = ProfileSchema.safeParse({
    fullName: str(formData, "fullName"),
    title: str(formData, "title"),
    phone: str(formData, "phone"),
    nmlsId: str(formData, "nmlsId"),
    timezone: str(formData, "timezone"),
    language: str(formData, "language"),
    website: str(formData, "website"),
    linkedin: str(formData, "linkedin"),
    facebook: str(formData, "facebook"),
    instagram: str(formData, "instagram"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the details and try again." };
  }

  const d = parsed.data;
  const links: Record<string, string> = {};
  if (d.website) links.website = d.website;
  if (d.linkedin) links.linkedin = d.linkedin;
  if (d.facebook) links.facebook = d.facebook;
  if (d.instagram) links.instagram = d.instagram;

  const next = {
    fullName: d.fullName,
    title: d.title || null,
    phone: d.phone || null,
    nmlsId: d.nmlsId || null,
    timezone: d.timezone || null,
    language: d.language,
    links,
  };

  try {
    await queryAs(user, async (db) => {
      const [before] = await db
        .select({
          fullName: userTable.fullName,
          title: userTable.title,
          phone: userTable.phone,
          nmlsId: userTable.nmlsId,
          timezone: userTable.timezone,
          language: userTable.language,
          links: userTable.links,
        })
        .from(userTable)
        .where(eq(userTable.id, user.userId))
        .limit(1);
      if (!before) throw new Error("not-found");

      await db
        .update(userTable)
        .set({ ...next, updatedAt: new Date() })
        .where(eq(userTable.id, user.userId));

      await recordAudit(db, user, {
        action: "profile.updated",
        entity: "user",
        entityId: user.userId,
        changes: diff({ ...before, links: before.links ?? {} }, next),
      });
    });
  } catch {
    return { error: "We couldn't save your profile. Nothing was changed." };
  }

  revalidatePath("/settings/profile");
  revalidatePath("/settings");
  return { ok: "Profile saved." };
}

// ---------------------------------------------------------------------------
// Photo
// ---------------------------------------------------------------------------

export async function updatePhoto(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser();

  const photoData = formData.get("photoData");
  if (typeof photoData !== "string" || !photoData) {
    return { error: "Choose a photo first." };
  }

  // Re-validate server-side: prefix and decoded byte length. The client check
  // is convenience only.
  const valid = validatePhotoDataUrl(photoData);
  if (!valid.ok) return { error: valid.reason };

  try {
    await queryAs(user, async (db) => {
      const [before] = await db
        .select({ photoData: userTable.photoData })
        .from(userTable)
        .where(eq(userTable.id, user.userId))
        .limit(1);
      if (!before) throw new Error("not-found");

      await db
        .update(userTable)
        .set({ photoData, updatedAt: new Date() })
        .where(eq(userTable.id, user.userId));

      // Never write the image itself into the audit log — just what happened.
      await recordAudit(db, user, {
        action: "profile.photo_updated",
        entity: "user",
        entityId: user.userId,
        changes: {
          photo: {
            from: before.photoData ? "photo on file" : "none",
            to: `new photo (${Math.round(photoData.length / 1024)}KB stored)`,
          },
        },
      });
    });
  } catch {
    return { error: "We couldn't save the photo. Nothing was changed." };
  }

  revalidatePath("/settings/profile");
  return { ok: "Photo updated." };
}

export async function removePhoto(): Promise<ProfileState> {
  const user = await requireUser();

  try {
    await queryAs(user, async (db) => {
      await db
        .update(userTable)
        .set({ photoData: null, updatedAt: new Date() })
        .where(eq(userTable.id, user.userId));

      await recordAudit(db, user, {
        action: "profile.photo_removed",
        entity: "user",
        entityId: user.userId,
        changes: { photo: { from: "photo on file", to: "none" } },
      });
    });
  } catch {
    return { error: "We couldn't remove the photo. Nothing was changed." };
  }

  revalidatePath("/settings/profile");
  return { ok: "Photo removed." };
}

// ---------------------------------------------------------------------------
// Email signature
// ---------------------------------------------------------------------------

const SignatureSchema = z.object({
  signature: z.string().max(2000, "Keep the signature under 2,000 characters."),
  defaultSenderName: z
    .string()
    .trim()
    .max(120, "Keep the sender name under 120 characters."),
  replyToEmail: z.union(
    [z.literal(""), z.email()],
    "Enter a valid reply-to email address.",
  ),
});

export async function updateSignature(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser();

  const raw = formData.get("signature");
  const parsed = SignatureSchema.safeParse({
    signature: typeof raw === "string" ? raw : "",
    defaultSenderName: str(formData, "defaultSenderName"),
    replyToEmail: str(formData, "replyToEmail"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the details and try again." };
  }

  const next = {
    signature: parsed.data.signature.trim() || null,
    defaultSenderName: parsed.data.defaultSenderName || null,
    replyToEmail: parsed.data.replyToEmail || null,
  };

  try {
    await queryAs(user, async (db) => {
      const [before] = await db
        .select({
          signature: userTable.signature,
          defaultSenderName: userTable.defaultSenderName,
          replyToEmail: userTable.replyToEmail,
        })
        .from(userTable)
        .where(eq(userTable.id, user.userId))
        .limit(1);
      if (!before) throw new Error("not-found");

      await db
        .update(userTable)
        .set({ ...next, updatedAt: new Date() })
        .where(eq(userTable.id, user.userId));

      await recordAudit(db, user, {
        action: "profile.updated",
        entity: "user",
        entityId: user.userId,
        changes: diff(before, next),
      });
    });
  } catch {
    return { error: "We couldn't save the signature. Nothing was changed." };
  }

  revalidatePath("/settings/profile");
  return { ok: "Signature saved." };
}

// ---------------------------------------------------------------------------
// Notification preferences
// ---------------------------------------------------------------------------

const PREF_KEYS = ["dailySummary", "taskReminders", "approvalAlerts", "teamActivity"] as const;

export async function updateNotificationPrefs(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser();

  const prefs: Record<string, boolean> = {};
  for (const key of PREF_KEYS) prefs[key] = formData.get(key) === "on";

  try {
    await queryAs(user, async (db) => {
      const [before] = await db
        .select({ notificationPrefs: userTable.notificationPrefs })
        .from(userTable)
        .where(eq(userTable.id, user.userId))
        .limit(1);
      if (!before) throw new Error("not-found");

      await db
        .update(userTable)
        .set({ notificationPrefs: prefs, updatedAt: new Date() })
        .where(eq(userTable.id, user.userId));

      await recordAudit(db, user, {
        action: "profile.updated",
        entity: "user",
        entityId: user.userId,
        changes: diff(
          { notificationPrefs: before.notificationPrefs ?? {} },
          { notificationPrefs: prefs },
        ),
      });
    });
  } catch {
    return { error: "We couldn't save your preferences. Nothing was changed." };
  }

  revalidatePath("/settings/profile");
  return { ok: "Preferences saved. Delivery starts once an email account is connected." };
}

// ---------------------------------------------------------------------------
// AI persona
// ---------------------------------------------------------------------------

const EXTRACT_MAX_CHARS = 20_000;

async function extractPersonaText(file: File, kind: PersonaKind): Promise<string> {
  const buf = await file.arrayBuffer();

  if (kind === "txt" || kind === "md") {
    return Buffer.from(buf).toString("utf8");
  }

  if (kind === "pdf") {
    const { extractText } = await import("unpdf");
    const result = await extractText(new Uint8Array(buf));
    return Array.isArray(result.text) ? result.text.join("\n\n") : String(result.text);
  }

  // docx
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer: Buffer.from(buf) });
  return result.value;
}

export async function uploadPersona(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "Choose a document first." };
  }

  // Re-validate server-side: extension, MIME type, and size.
  const valid = validatePersonaFile(file.name, file.type, file.size);
  if (!valid.ok) return { error: valid.reason };

  let extractedText: string | null = null;
  let extractionError: string | null = null;
  try {
    const text = (await extractPersonaText(file, valid.kind)).trim();
    if (!text) {
      extractionError =
        "We opened the file but found no readable text. If it's a scanned document, try a text version instead.";
    } else {
      extractedText = text.slice(0, EXTRACT_MAX_CHARS);
    }
  } catch {
    extractionError =
      "We couldn't read that file. It may be corrupted or password-protected — re-save it and upload again.";
  }

  const status: "ready" | "failed" = extractionError ? "failed" : "ready";

  try {
    await queryAs(user, async (db) => {
      await db
        .insert(aiPersona)
        .values({
          tenantId: user.tenantId,
          userId: user.userId,
          filename: file.name,
          mime: file.type || "application/octet-stream",
          sizeBytes: file.size,
          status,
          extractedText,
          error: extractionError,
          enabled: true,
        })
        .onConflictDoUpdate({
          target: aiPersona.userId,
          set: {
            filename: file.name,
            mime: file.type || "application/octet-stream",
            sizeBytes: file.size,
            status,
            extractedText,
            error: extractionError,
            enabled: true,
            updatedAt: new Date(),
          },
        });

      // The extracted text itself never enters the audit log — it is private
      // to the owner.
      await recordAudit(db, user, {
        action: "persona.uploaded",
        entity: "ai_persona",
        changes: {
          document: {
            from: "previous document or none",
            to: `${file.name} (${Math.round(file.size / 1024)}KB, ${status})`,
          },
        },
      });
    });
  } catch {
    return { error: "We couldn't save the document. Nothing was changed." };
  }

  revalidatePath("/settings/profile");
  if (extractionError) return { error: extractionError };
  return { ok: "Persona document saved. The assistant will use it when drafting as you." };
}

export async function deletePersona(): Promise<ProfileState> {
  const user = await requireUser();

  try {
    await queryAs(user, async (db) => {
      await db.delete(aiPersona).where(eq(aiPersona.userId, user.userId));

      await recordAudit(db, user, {
        action: "persona.deleted",
        entity: "ai_persona",
        changes: { document: { from: "document on file", to: "none" } },
      });
    });
  } catch {
    return { error: "We couldn't delete the document. Nothing was changed." };
  }

  revalidatePath("/settings/profile");
  return { ok: "Persona deleted. The assistant now writes in the standard Loan Factory voice." };
}

export async function togglePersona(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser();
  const enable = formData.get("enabled") === "true";

  try {
    await queryAs(user, async (db) => {
      const updated = await db
        .update(aiPersona)
        .set({ enabled: enable, updatedAt: new Date() })
        .where(and(eq(aiPersona.userId, user.userId), eq(aiPersona.enabled, !enable)))
        .returning({ id: aiPersona.id });
      if (updated.length === 0) return;

      await recordAudit(db, user, {
        action: "persona.toggled",
        entity: "ai_persona",
        entityId: updated[0].id,
        changes: { enabled: { from: !enable, to: enable } },
      });
    });
  } catch {
    return { error: "We couldn't change that setting. Nothing was changed." };
  }

  revalidatePath("/settings/profile");
  return {
    ok: enable
      ? "Persona enabled. The assistant will use it when drafting as you."
      : "Persona disabled. The assistant writes in the standard Loan Factory voice.",
  };
}
