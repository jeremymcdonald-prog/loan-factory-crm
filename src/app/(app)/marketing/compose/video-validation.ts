/**
 * Pure validation for the video composer — no DOM, no React, unit-testable.
 *
 * Two gates: is this file a video we accept, and is this recording a length
 * that works as a message. Reasons are plain language, ready to render.
 */

/** 100MB — a demo ceiling; production limits belong to the (future) video host. */
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

/** Recordings cap at 3:00 — long enough for a message, short enough to watch. */
export const MAX_RECORDING_SECONDS = 180;

/** Under 2 seconds is a misclick, not a message. */
export const MIN_RECORDING_SECONDS = 2;

export type ValidationResult = { ok: true } | { ok: false; reason: string };

/** Extension → the one MIME type we accept for it. */
const ACCEPTED: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  if (dot < 0 || dot === name.length - 1) return "";
  return name.slice(dot + 1).toLowerCase();
}

/**
 * Accepts .mp4, .webm, and .mov files with a matching MIME type, up to 100MB.
 * macOS often reports no MIME type for .mov files, so an empty MIME is
 * tolerated for .mov only.
 */
export function validateVideoFile(
  name: string,
  mime: string,
  sizeBytes: number,
): ValidationResult {
  const ext = extensionOf(name);
  const expectedMime = ACCEPTED[ext];

  if (!expectedMime) {
    return {
      ok: false,
      reason: "That file isn't a video format we accept. Use an .mp4, .webm, or .mov file.",
    };
  }

  const normalizedMime = mime.trim().toLowerCase();
  const mimeOk =
    normalizedMime === expectedMime || (normalizedMime === "" && ext === "mov");
  if (!mimeOk) {
    return {
      ok: false,
      reason: `That file says it's "${mime}", which doesn't match a .${ext} video. Re-export it and try again.`,
    };
  }

  if (sizeBytes <= 0) {
    return { ok: false, reason: "That file is empty — there's no video in it." };
  }

  if (sizeBytes > MAX_VIDEO_BYTES) {
    return {
      ok: false,
      reason: "That file is over 100MB. Trim or compress the video and try again.",
    };
  }

  return { ok: true };
}

/** A recording must be at least 2 seconds and at most 3 minutes. */
export function validateRecordingDuration(seconds: number): ValidationResult {
  if (!Number.isFinite(seconds) || seconds < MIN_RECORDING_SECONDS) {
    return {
      ok: false,
      reason: "That recording is too short to be a message. Record at least a couple of seconds.",
    };
  }
  if (seconds > MAX_RECORDING_SECONDS) {
    return {
      ok: false,
      reason: "Recordings cap at 3 minutes — long enough to say it, short enough to watch.",
    };
  }
  return { ok: true };
}

/** 184 → "3:04". Display-only; keeps every duration in one format. */
export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
