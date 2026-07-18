/**
 * Social-URL validation & normalization — pure functions, no server or React
 * imports, so the manual link editor (client) and its server action share the
 * exact same rules (Design_System.md's "the client's word is never trusted"
 * pattern, same as profile-validation.ts). The server action re-runs this on
 * whatever the client submits.
 */
import type { SocialLinks } from "@/db/schema";

/**
 * Normalize a user-typed URL: add `https://` when no scheme is present,
 * reject anything that isn't a plausible http(s) address (wrong scheme, no
 * real host, garbage input). Returns the normalized absolute URL, or `null`.
 */
export function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // A URI scheme, if one was typed (e.g. "http:", "mailto:", "javascript:").
  const schemeMatch = /^([a-z][a-z0-9+.-]*):/i.exec(trimmed);
  if (schemeMatch) {
    const scheme = schemeMatch[1].toLowerCase();
    if (scheme !== "http" && scheme !== "https") return null;
  }

  const candidate = schemeMatch ? trimmed : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  // A bare word like "https://localhost" or "https://asdf" isn't a real,
  // shareable web address — require an actual host with a dot in it.
  if (!url.hostname || !url.hostname.includes(".")) return null;

  return url.toString();
}

const SOCIAL_KEYS = ["facebook", "instagram", "tiktok", "linkedin", "youtube", "website"] as const;
type SocialKey = (typeof SOCIAL_KEYS)[number];

const SOCIAL_LABELS: Record<SocialKey, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  website: "Website",
};

type OtherLinkInput = { label?: unknown; url?: unknown };

/**
 * Validate a submitted set of social/website links. Blank fields are simply
 * omitted (not an error — "not added" is a valid, honest state). Anything
 * that doesn't normalize to a real http(s) URL is reported in `errors` and
 * left out of `links`, so a bad field never silently overwrites a good one.
 */
export function validateSocialLinks(input: Record<string, unknown>): {
  links: SocialLinks;
  errors: string[];
} {
  const errors: string[] = [];
  const social: Partial<Record<SocialKey, string>> = {};

  for (const key of SOCIAL_KEYS) {
    const raw = input[key];
    if (raw === undefined || raw === null) continue;
    if (typeof raw !== "string") {
      errors.push(`${SOCIAL_LABELS[key]} link isn't valid.`);
      continue;
    }
    if (!raw.trim()) continue; // blank = not provided, not an error

    const normalized = normalizeUrl(raw);
    if (!normalized) {
      errors.push(`${SOCIAL_LABELS[key]} link doesn't look like a real web address.`);
      continue;
    }
    social[key] = normalized;
  }

  const links: SocialLinks = { ...social };

  const rawOther = input.other;
  if (Array.isArray(rawOther)) {
    const other: { label: string; url: string }[] = [];
    for (const entry of rawOther as OtherLinkInput[]) {
      if (!entry || typeof entry !== "object") continue;
      const label = typeof entry.label === "string" ? entry.label.trim() : "";
      const rawUrl = typeof entry.url === "string" ? entry.url : "";
      if (!label && !rawUrl.trim()) continue; // fully empty row — skip silently

      if (!label) {
        errors.push("Each additional link needs a label.");
        continue;
      }
      const normalized = normalizeUrl(rawUrl);
      if (!normalized) {
        errors.push(`"${label}" doesn't look like a real web address.`);
        continue;
      }
      other.push({ label, url: normalized });
    }
    if (other.length) links.other = other;
  } else if (rawOther !== undefined && rawOther !== null) {
    errors.push("The additional links list wasn't formatted correctly.");
  }

  return { links, errors };
}
