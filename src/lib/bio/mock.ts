/**
 * Bio & Online Presence — the mock "research" generator.
 *
 * There is no web-search provider connected in this CRM (Integration_Map).
 * `draftBio` never claims otherwise: it composes a plausible, PUBLIC-style
 * paragraph from the fields the team already entered (name, role, city) and
 * returns a set of made-up-but-plausible social handles and citations —
 * every one of them clearly a demo, never presented as verified. A human
 * reviews and approves every line before anything is saved (see
 * src/app/(app)/people/[id]/actions.ts — nothing here writes to the database).
 *
 * Pure and deterministic: no network, no clock, no randomness beyond a seeded
 * PRNG derived from the inputs. The same input + seed always produces the
 * same draft, so "Regenerate" (which bumps `seed`) is reproducible and
 * testable, and the caller — not this module — stamps `bioResearchedAt`.
 *
 * Reused as-is by the Partner detail screen (same shared contract), which is
 * why `role` is a plain string rather than the person-type enum: it carries
 * "lead" / "borrower" / "past_client" today and a partner kind later.
 */
import type { SocialLinks, BioSource } from "@/db/schema";

export type BioDraft = {
  bio: string;
  suggestedLinks: SocialLinks;
  sources: BioSource[];
};

export type BioDraftInput = {
  firstName: string;
  lastName: string;
  company?: string | null;
  city?: string | null;
  /** e.g. the person type ("lead" / "borrower" / "past_client") or a partner kind. */
  role: string;
  language?: string;
  /** Bump to get a different (but still deterministic) draft — see mulberry32 below. */
  seed?: number;
};

// --- Deterministic PRNG ------------------------------------------------------
// FNV-1a hash of the input fields seeds a mulberry32 generator. Both are pure
// integer math — no Date, no Math.random — so results are 100% reproducible.

function hashSeed(text: string, seed: number): number {
  let h = (0x811c9dc5 ^ seed) >>> 0;
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(h ^ text.charCodeAt(i), 0x01000193);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length) % items.length];
}

/** Fisher–Yates, driven by the same seeded rng — deterministic shuffling. */
function shuffle<T>(rng: () => number, items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function slugify(...parts: (string | null | undefined)[]): string {
  return parts
    .filter((p): p is string => Boolean(p && p.trim()))
    .join(" ")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "");
}

// --- Sentence bank ------------------------------------------------------------

const ROLE_PHRASES: Record<string, string> = {
  lead: "is exploring their mortgage options",
  borrower: "is actively working through a loan with your team",
  past_client: "closed a loan with your team and has stayed in your book since",
  other: "is a contact in your book",
};

function roleLabel(role: string): string {
  return role.replace(/_/g, " ").trim() || "contact";
}

function rolePhrase(role: string): string {
  return ROLE_PHRASES[role] ?? `works with your team as a ${roleLabel(role)}`;
}

function intros(name: string): string[] {
  return [
    `${name} keeps a modest, professional public footprint online.`,
    `A light public-source pass on ${name} turns up a consistent, on-brand presence.`,
    `${name} shows up online the way most working professionals do — a handful of public profiles, nothing flashy.`,
    `Public mentions of ${name} are sparse but consistent with someone building a reputation, not chasing one.`,
  ];
}

function roleLines(name: string, role: string, company: string | null): string[] {
  const phrase = rolePhrase(role);
  const withCompany = company ? ` at ${company}` : "";
  return [
    `${name} ${phrase}${withCompany}.`,
    `Right now, ${name} ${phrase}${withCompany}.`,
    `By public indication, ${name} ${phrase}${withCompany}.`,
  ];
}

function cityLines(name: string, city: string | null): string[] {
  if (!city) {
    return [`No public location could be pinned down for ${name} from the sources checked.`];
  }
  return [
    `${name} appears to be based in or around ${city}.`,
    `Public activity places ${name} in the ${city} area.`,
    `${name}'s public profiles list ${city} as their location.`,
  ];
}

function closers(name: string): string[] {
  return [
    `Nothing here is verified — it's a starting point for a real conversation, not a fact sheet.`,
    `Treat this as a conversation-starter, not a verified record.`,
    `This is a first pass, meant to be checked and personalized before it's used with ${name}.`,
    `As with any public-source draft, these details are worth confirming directly with ${name}.`,
  ];
}

function sourcePool(name: string): BioSource[] {
  return [
    { label: "LinkedIn (public profile)", note: "Demo source — not fetched" },
    { label: `"${name}" public web search`, note: "Demo source — not fetched" },
    { label: "Public company or team directory listing", note: "Demo source — not fetched" },
    { label: "Local news or press mention", note: "Demo source — not fetched" },
    { label: "Public social media activity", note: "Demo source — not fetched" },
  ];
}

// --- Public API ---------------------------------------------------------------

/**
 * Compose a demo bio draft. Never touches the network, never invents private
 * data (no SSN, DOB, income, or anything not derivable from the public-style
 * fields passed in) — only name, role, city, company, and language shape the
 * output.
 */
export function draftBio(input: BioDraftInput): BioDraft {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const name = `${firstName} ${lastName}`.trim() || "This contact";
  const company = input.company?.trim() || null;
  const city = input.city?.trim() || null;
  const role = input.role;
  const seed = input.seed ?? 0;

  const rng = mulberry32(
    hashSeed(`${name}|${role}|${city ?? ""}|${company ?? ""}|${input.language ?? ""}`, seed),
  );

  const bio = [
    pick(rng, intros(name)),
    pick(rng, roleLines(name, role, company)),
    pick(rng, cityLines(name, city)),
    pick(rng, closers(name)),
  ].join(" ");

  // Handles are derived from the name alone (stable across regenerations —
  // the sentences reshuffle, but a person's "discovered" handles wouldn't).
  const handle = slugify(firstName, lastName) || "contact";
  const suggestedLinks: SocialLinks = {
    facebook: `https://facebook.com/${handle}`,
    instagram: `https://instagram.com/${handle}`,
    tiktok: `https://tiktok.com/@${handle}`,
    linkedin: `https://linkedin.com/in/${handle}`,
  };
  const companySlug = company ? slugify(company) : "";
  if (companySlug) {
    suggestedLinks.website = `https://${companySlug}.com`;
  }

  const sourceCount = 2 + Math.floor(rng() * 2); // 2 or 3
  const sources = shuffle(rng, sourcePool(name)).slice(0, sourceCount);

  return { bio, suggestedLinks, sources };
}
