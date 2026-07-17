/**
 * Profile upload validation — pure functions, no server or React imports, so
 * both the browser (fast feedback) and the server action (the real gate) run
 * the exact same rules, and unit tests can exercise them directly.
 */

/** Profile photos: 512KB keeps the data URL comfortably inside a row. */
export const PHOTO_MAX_BYTES = 512 * 1024;

export const PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type PhotoValidation = { ok: true } | { ok: false; reason: string };

const PHOTO_DATA_URL = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/;

/**
 * Validate a profile-photo data URL: correct prefix (jpeg/png/webp, base64)
 * and a decoded size of at most 512KB. The server action re-runs this on the
 * submitted string — the client's word is never trusted.
 */
export function validatePhotoDataUrl(dataUrl: string): PhotoValidation {
  const match = PHOTO_DATA_URL.exec(dataUrl);
  if (!match) {
    return {
      ok: false,
      reason: "The photo must be a JPEG, PNG, or WebP image.",
    };
  }

  const base64 = match[2];
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  const bytes = Math.floor((base64.length * 3) / 4) - padding;

  if (bytes <= 0) {
    return { ok: false, reason: "That image file is empty — choose another photo." };
  }
  if (bytes > PHOTO_MAX_BYTES) {
    return {
      ok: false,
      reason: "The photo is larger than 512KB — choose a smaller image.",
    };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// AI persona documents
// ---------------------------------------------------------------------------

/** Persona documents: 5MB is plenty for a bio and writing samples. */
export const PERSONA_MAX_BYTES = 5 * 1024 * 1024;

export type PersonaKind = "pdf" | "docx" | "md" | "txt";

export type PersonaValidation =
  | { ok: true; kind: PersonaKind }
  | { ok: false; reason: string };

/**
 * Allowed MIME types per extension. Browsers report `.md` and `.txt` files
 * inconsistently (often `text/plain` or an empty string), so those accept the
 * common variants; binary formats must match exactly.
 */
const PERSONA_TYPES: Record<PersonaKind, readonly string[]> = {
  pdf: ["application/pdf"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  md: ["text/markdown", "text/x-markdown", "text/plain", ""],
  txt: ["text/plain", ""],
};

/**
 * Validate a persona upload by extension AND reported MIME type; anything
 * else is rejected. Pure so the drop zone and the server action share it.
 */
export function validatePersonaFile(
  name: string,
  mime: string,
  sizeBytes: number,
): PersonaValidation {
  const dot = name.lastIndexOf(".");
  const ext = dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";

  if (!(ext in PERSONA_TYPES)) {
    return {
      ok: false,
      reason: "That file type isn't supported — upload a PDF, Word (.docx), Markdown, or plain-text file.",
    };
  }
  const kind = ext as PersonaKind;

  if (!PERSONA_TYPES[kind].includes(mime.toLowerCase())) {
    return {
      ok: false,
      reason: "That file doesn't look like a real " + ext.toUpperCase() + " document — re-save it and try again.",
    };
  }

  if (sizeBytes <= 0) {
    return { ok: false, reason: "That file is empty — there's nothing to read." };
  }
  if (sizeBytes > PERSONA_MAX_BYTES) {
    return {
      ok: false,
      reason: "That file is larger than 5MB — trim it down and upload again.",
    };
  }

  return { ok: true, kind };
}

// ---------------------------------------------------------------------------
// Shared profile option lists (pure data, used by the form and its action)
// ---------------------------------------------------------------------------

/** Common US IANA timezones for the profile timezone select. */
export const US_TIMEZONES = [
  { value: "America/New_York", label: "Eastern — New York" },
  { value: "America/Chicago", label: "Central — Chicago" },
  { value: "America/Denver", label: "Mountain — Denver" },
  { value: "America/Phoenix", label: "Arizona — Phoenix (no DST)" },
  { value: "America/Los_Angeles", label: "Pacific — Los Angeles" },
  { value: "America/Anchorage", label: "Alaska — Anchorage" },
  { value: "Pacific/Honolulu", label: "Hawaii — Honolulu" },
  { value: "America/Detroit", label: "Eastern — Detroit" },
  { value: "America/Boise", label: "Mountain — Boise" },
  { value: "America/Puerto_Rico", label: "Atlantic — Puerto Rico" },
] as const;

export const TIMEZONE_VALUES = US_TIMEZONES.map((t) => t.value);

/** Mirrors the `language` enum in the schema. */
export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "vi", label: "Vietnamese" },
  { value: "zh", label: "Chinese" },
  { value: "es", label: "Spanish" },
  { value: "ru", label: "Russian" },
] as const;
