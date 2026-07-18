/**
 * Marketing vocabulary — the plain language this module speaks.
 *
 * Pure and client-safe (no `server-only` here, deliberately): the New campaign
 * dialog runs in the browser and has to explain a template's policy the moment
 * it is picked, while the library and the template record render the same words
 * on the server. One source, so a policy never reads two ways on two screens.
 *
 * A raw enum value (`never_automate`) must never reach a screen.
 */
import type { Urgency } from "@/components/ui/badge";

export const TEMPLATE_POLICIES = [
  "fully_automated",
  "semi_automated",
  "manual_only",
  "never_automate",
] as const;

export type TemplatePolicy = (typeof TEMPLATE_POLICIES)[number];

export type PolicyRead = {
  /** The badge face. Plain language, never the enum. */
  label: string;
  /**
   * Hue answers the one question colour is allowed to answer here, the same one
   * it answers everywhere else: how much of a human does this need? Green none,
   * violet AI drafts and a human approves, amber a human writes it, red never
   * a machine at all.
   */
  tone: Urgency;
  /** The policy as a sentence, for the template record. */
  sentence: string;
  /** Why a campaign may not use this template. Null when a campaign may. */
  campaignBlock: string | null;
};

export const POLICY: Record<TemplatePolicy, PolicyRead> = {
  fully_automated: {
    label: "Can run automatically",
    tone: "healthy",
    sentence:
      "This one can go out on its own. It carries routine news with nothing to weigh up, so an automation can send it without waiting for anybody.",
    campaignBlock: null,
  },
  semi_automated: {
    label: "AI can prepare",
    tone: "ai",
    sentence:
      "AI can write the first draft of this one. Nothing reaches the borrower until you have read it and approved it yourself.",
    campaignBlock: null,
  },
  manual_only: {
    label: "Write it yourself",
    tone: "warning",
    sentence:
      "This one is yours to write. It turns on the details of one borrower's situation, so neither AI nor a campaign will draft it for you.",
    campaignBlock:
      "This template is one you write yourself, one borrower at a time. It turns on the details of their situation, so it cannot go out to a list.",
  },
  never_automate: {
    label: "Never automated",
    tone: "critical",
    sentence:
      "This one is never automated. It carries news that lands hard, and it needs your voice, so nothing here is ever drafted or queued for you.",
    campaignBlock:
      "Rate lock and delay messages are never sent as a campaign — they need a personal call. Open this template on the person's record and say it in your own words.",
  },
};

export function policyRead(policy: string): PolicyRead {
  return POLICY[policy as TemplatePolicy] ?? POLICY.semi_automated;
}

/** True when a campaign may not send this template at all. */
export function blocksCampaign(policy: string): boolean {
  return policyRead(policy).campaignBlock !== null;
}

// --- Audiences ---------------------------------------------------------------

/**
 * The audiences a campaign can go to. Each label is a promise about who the
 * query in @/lib/queries/marketing actually counts — change one, change both.
 */
export const AUDIENCE_TYPES = [
  "past_clients",
  "partners",
  "preapproval_expiring",
  "anniversary",
] as const;

export type AudienceType = (typeof AUDIENCE_TYPES)[number];

export type AudienceOption = {
  type: AudienceType;
  /** Stored on the campaign as `audience.label` and shown on its card. */
  label: string;
  /** The rule behind the label, so nobody has to guess who is on the list. */
  hint: string;
};

export const AUDIENCES: AudienceOption[] = [
  {
    type: "past_clients",
    label: "Past clients",
    hint: "Everyone whose loan has already funded and who still takes your mail.",
  },
  {
    type: "partners",
    label: "All referral partners",
    hint: "Every agent, builder, and advisor who sends you business.",
  },
  {
    type: "preapproval_expiring",
    label: "Borrowers whose preapproval expires within 30 days",
    hint: "Open files with a preapproval letter running out inside the next 30 days.",
  },
  {
    type: "anniversary",
    label: "Past clients with a closing anniversary this month",
    hint: "Past clients who closed in this calendar month, in any year.",
  },
];

export function audienceOption(type: string): AudienceOption | undefined {
  return AUDIENCES.find((a) => a.type === type);
}

// --- Campaign languages ------------------------------------------------------

/**
 * The languages a campaign can be written in. English is the default — the
 * unmarked case everywhere in this app. The database enum also holds `zh`, but
 * Chinese is not offered here yet: the template library carries no reviewed
 * Chinese copy, and a language nobody has translation review for must not be
 * one click away.
 */
export const CAMPAIGN_LANGUAGE_CODES = ["en", "es", "vi", "ru"] as const;

export type CampaignLanguage = (typeof CAMPAIGN_LANGUAGE_CODES)[number];

export const CAMPAIGN_LANGUAGES: { code: CampaignLanguage; name: string }[] = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "vi", name: "Vietnamese" },
  { code: "ru", name: "Russian" },
];

export function campaignLanguageName(code: string): string {
  return CAMPAIGN_LANGUAGES.find((l) => l.code === code)?.name ?? code.toUpperCase();
}

export function isCampaignLanguage(value: string): value is CampaignLanguage {
  return (CAMPAIGN_LANGUAGE_CODES as readonly string[]).includes(value);
}

// --- Who may manage campaigns ------------------------------------------------

/**
 * Everyone who runs marketing may manage campaigns: LOs and their assistants
 * own their book's campaigns, leaders and admins see the whole book, the agent
 * relationship manager runs partner campaigns, and the marketing coordinator's
 * whole job is this module. Processors work files, not marketing — they are
 * the one role left out. Which campaigns a manager can actually touch is still
 * decided by book scope in @/lib/queries/marketing, not by this list.
 */
export const CAMPAIGN_MANAGER_ROLES = [
  "lo",
  "lo_assistant",
  "team_leader",
  "branch_leader",
  "agent_rel_manager",
  "marketing_coordinator",
  "admin",
] as const;

export function canManageCampaigns(role: string): boolean {
  return (CAMPAIGN_MANAGER_ROLES as readonly string[]).includes(role);
}

// --- Drip sequences ----------------------------------------------------------

/** The channels a drip step can go out on. Calls are never dripped. */
export const DRIP_CHANNELS = ["email", "sms"] as const;

export type DripChannel = (typeof DRIP_CHANNELS)[number];

export const DRIP_CHANNEL_LABELS: Record<DripChannel, string> = {
  email: "Email",
  sms: "Text message",
};

export type DripStep = { day: number; channel: string; subject: string };

/** More steps than this is not a drip, it is a nuisance. */
export const MAX_DRIP_STEPS = 12;

export function dripChannelLabel(channel: string): string {
  return DRIP_CHANNEL_LABELS[channel as DripChannel] ?? channel;
}

// --- Campaign status ---------------------------------------------------------

/**
 * Status order is the order the work matters in: what is out there now, what is
 * coming, what you are still writing, what you stopped, then the archive.
 */
export const CAMPAIGN_STATUS_ORDER = [
  "running",
  "scheduled",
  "draft",
  "paused",
  "finished",
] as const;

export type CampaignStatus = (typeof CAMPAIGN_STATUS_ORDER)[number];

export const CAMPAIGN_STATUS: Record<CampaignStatus, { label: string; blurb: string }> = {
  running: { label: "Running", blurb: "Going out now." },
  scheduled: { label: "Scheduled", blurb: "Queued to go out on a date you set." },
  draft: { label: "Draft", blurb: "Not going anywhere until you schedule it." },
  paused: { label: "Paused", blurb: "Stopped part way. Nothing else will go out." },
  finished: { label: "Finished", blurb: "Everyone on the list has been reached." },
};

export function campaignStatusLabel(status: string): string {
  return CAMPAIGN_STATUS[status as CampaignStatus]?.label ?? status;
}

/** Pause only stops something that is going: running is the one pausable state. */
export function canPause(status: string): boolean {
  return status === "running";
}

/** Draft, scheduled, and paused can all be set running. Finished stays finished. */
export function canActivate(status: string): boolean {
  return status === "draft" || status === "scheduled" || status === "paused";
}

/**
 * What "Activate" honestly does in this demo. Shown wherever the button is, so
 * nobody believes a click sends mail.
 */
export const ACTIVATE_HONESTY =
  "Activate marks the campaign running in the CRM. Nothing sends yet — sends start when sending providers are connected, and drafts queue for approval first.";

/**
 * Open rate, the only derived number on the dashboard. Null below one send —
 * a rate over zero sends is not a zero, it is not a number yet.
 */
export function openRate(sentCount: number, openCount: number): number | null {
  if (sentCount <= 0) return null;
  return Math.round((openCount / sentCount) * 100);
}
