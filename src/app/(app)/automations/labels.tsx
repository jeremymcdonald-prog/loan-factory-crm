/**
 * The Automations module's plain language, in one place.
 *
 * The database stores `t0`, `queued_for_approval`, `paused`. A loan officer
 * never sees any of that. Every enum this module renders is translated exactly
 * once here, so no screen invents its own words for the same fact.
 *
 * Pure and shared by server and client code — no `server-only` here. The unions
 * mirror the pgEnums in db/schema.ts (`autonomy_tier`, `automation_status`,
 * `automation_run_status`) rather than importing them, which would drag the
 * database layer into the browser bundle.
 */
import { Badge, type Urgency } from "@/components/ui/badge";

export type Tier = "t0" | "t1" | "t2" | "t3";
export type AutomationState = "active" | "paused" | "draft";
export type RunState =
  | "queued_for_approval"
  | "approved"
  | "completed"
  | "skipped"
  | "failed";

/** The approval ladder, least autonomy first. This order is the whole point. */
export const TIER_LADDER: Tier[] = ["t0", "t1", "t2", "t3"];

/**
 * Where the triggering lead or event comes from. Stored as plain text on
 * `automation.source`; these are the values the picker offers.
 *
 * The keys below are stable storage values — never renamed, only added to —
 * because the ten canonical automations (Automation_Catalog.md) already have
 * rows on `facebook`, `instagram`, `website`, `open house`, `agent referral`,
 * `past client referral`, and `crm event`. Everything else is a more specific
 * trigger a multi-step campaign can enroll people from: form submissions,
 * a partner CRM's referral hook, and the CRM lifecycle moments that used to
 * hide inside the catch-all `crm event`. "crm event" itself stays as the
 * generic bucket for a CRM-originated trigger that isn't one of those named
 * moments.
 */
export const SOURCES = [
  "facebook",
  "instagram",
  "jotform",
  "google form",
  "follow up boss referral",
  "website",
  "open house",
  "agent referral",
  "past client referral",
  "new application",
  "preapproval",
  "contract received",
  "loan funded",
  "anniversary",
  "no activity",
  "crm event",
] as const;

export type Source = (typeof SOURCES)[number];

export const SOURCE_LABEL: Record<Source, string> = {
  facebook: "Facebook lead",
  instagram: "Instagram lead",
  jotform: "Jotform submission",
  "google form": "Google Form submission",
  "follow up boss referral": "Follow Up Boss referral",
  website: "Website lead",
  "open house": "Open-house lead",
  "agent referral": "Agent referral",
  "past client referral": "Past-client referral",
  "new application": "New application",
  preapproval: "Preapproval",
  "contract received": "Contract received",
  "loan funded": "Loan funded",
  anniversary: "Anniversary",
  "no activity": "No activity for a defined period",
  "crm event": "CRM event (other)",
};

/** The column stores free text, so tolerate a value the picker never offered. */
export function sourceLabel(source: string | null): string | null {
  if (!source) return null;
  return SOURCE_LABEL[source as Source] ?? source;
}

export const TIER_LABEL: Record<Tier, string> = {
  t0: "Never automated — you handle it",
  t1: "Runs on its own",
  t2: "AI prepares, you approve",
  t3: "Runs automatically",
};

/** Hue answers one question: how much does this still need a human? */
export const TIER_TONE: Record<Tier, Urgency> = {
  t0: "critical",
  t1: "healthy",
  t2: "ai",
  t3: "healthy",
};

/** One sentence per rung, so the ladder is legible wherever a level is shown. */
export const TIER_MEANING: Record<Tier, string> = {
  t0: "Too important to hand off. AI drafts nothing and nothing goes out on its own — you get told, and you handle it yourself.",
  t1: "Only ever touches your own workspace: a task, a reminder, a flag on Today. Nobody outside the team sees anything, so it doesn't stop to ask.",
  t2: "AI writes it and holds it. Nothing reaches a borrower or a partner until you have read it and approved it.",
  t3: "Runs start to finish without stopping for you. Anything a borrower or a partner would read never sits at this level.",
};

export const AUTOMATION_STATE_LABEL: Record<AutomationState, string> = {
  active: "Active",
  paused: "Paused",
  draft: "Draft",
};

export const AUTOMATION_STATE_TONE: Record<AutomationState, Urgency> = {
  active: "healthy",
  paused: "neutral",
  draft: "neutral",
};

export const RUN_STATE_LABEL: Record<RunState, string> = {
  queued_for_approval: "Waiting for you",
  approved: "You approved it",
  completed: "Done",
  skipped: "Skipped",
  failed: "Didn't run",
};

export const RUN_STATE_TONE: Record<RunState, Urgency> = {
  queued_for_approval: "ai",
  approved: "neutral",
  completed: "neutral",
  skipped: "neutral",
  failed: "critical",
};

/**
 * What a test truthfully leaves behind.
 *
 * A test never sends and never contacts anyone. What it prepares depends on how
 * much the automation is allowed to do, so the sentence changes with the tier
 * rather than promising a draft that a t0 automation would never write.
 */
export const TEST_RUN_OUTCOME: Record<Tier, string> = {
  t0: "Test run — nothing was drafted and nothing was sent. This one never drafts; when it fires for real it creates the task and tells you.",
  t1: "Test run — nothing was drafted and nothing was sent. When this fires for real it only creates work in your own workspace.",
  t2: "Test run — a draft was prepared for your approval. Nothing was sent.",
  t3: "Test run — nothing was sent. This was a test only.",
};

/**
 * What a retry truthfully leaves behind.
 *
 * A retry never re-sends whatever the failed attempt tried to send — it queues
 * a fresh run in its place, and that new run is exactly as honest about
 * "nothing was sent" as a first attempt at the same tier would be.
 */
export const RETRY_RUN_OUTCOME: Record<Tier, string> = {
  t0: "Retry queued after a previous failure — nothing was sent. This one never drafts; when it runs it creates the task and tells you.",
  t1: "Retry queued after a previous failure — nothing was sent. When it runs it only creates work in your own workspace.",
  t2: "Retry queued after a previous failure — a new draft will be prepared for your approval. Nothing has been sent.",
  t3: "Retry queued after a previous failure. Nothing has been sent yet.",
};

export function TierBadge({ tier }: { tier: Tier }) {
  return <Badge tone={TIER_TONE[tier]}>{TIER_LABEL[tier]}</Badge>;
}

export function AutomationStateBadge({ state }: { state: AutomationState }) {
  return <Badge tone={AUTOMATION_STATE_TONE[state]}>{AUTOMATION_STATE_LABEL[state]}</Badge>;
}

export function RunStateBadge({ state }: { state: RunState }) {
  return <Badge tone={RUN_STATE_TONE[state]}>{RUN_STATE_LABEL[state]}</Badge>;
}
