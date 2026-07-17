/**
 * The plain-language vocabulary for Partners.
 *
 * Pure and client-safe on purpose: the list and the record render these labels
 * on the server, and the "Add a partner" dialog renders the same options in the
 * browser. One source of truth, so a partner is never a "real_estate_agent" on
 * one screen and an "Agent" on another.
 */

export const PARTNER_KINDS = [
  "real_estate_agent",
  "builder",
  "financial_advisor",
  "attorney",
  "past_client",
  "other",
] as const;

export const PARTNER_KIND_LABELS: Record<string, string> = {
  real_estate_agent: "Real estate agent",
  builder: "Builder",
  financial_advisor: "Financial advisor",
  attorney: "Attorney",
  past_client: "Past client",
  other: "Other",
};

export const PARTNER_TIERS = ["core", "growing", "new", "quiet"] as const;

export const PARTNER_TIER_LABELS: Record<string, string> = {
  core: "Core",
  growing: "Growing",
  new: "New",
  quiet: "Quiet",
};

/** Said the way a loan officer would say it, for the tier picker. */
export const PARTNER_TIER_HINTS: Record<string, string> = {
  core: "sends you business regularly",
  growing: "the relationship is building",
  new: "you've just started working together",
  quiet: "has gone quiet and is worth winning back",
};

export const PARTNER_TIER_TABS = [
  { key: "all", label: "Everyone" },
  { key: "core", label: "Core" },
  { key: "growing", label: "Growing" },
  { key: "new", label: "New" },
  { key: "quiet", label: "Quiet" },
];

/** How a logged touch reads in the contact history. */
export const CHANNEL_LABELS: Record<string, string> = {
  email: "Email",
  sms: "Text",
  call: "Call",
  note: "Note",
};
