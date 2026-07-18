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

/**
 * Jeremy's relationship tiers, in the order a relationship actually moves:
 * you target someone, they start sending, the relationship grows, it becomes
 * core — or it goes quiet and you win it back.
 */
export const PARTNER_TIERS = ["target", "new", "growing", "core", "quiet"] as const;

export const PARTNER_TIER_LABELS: Record<string, string> = {
  target: "Target",
  new: "New",
  growing: "Growing",
  core: "Core",
  quiet: "Quiet",
};

/** Said the way a loan officer would say it, for the tier picker. */
export const PARTNER_TIER_HINTS: Record<string, string> = {
  target: "on your hot list — no business yet, but you want to win them",
  new: "recently started sending business",
  growing: "at least one closing — the relationship is being developed",
  core: "four or more closings a year",
  quiet: "no business in more than six months",
};

/**
 * The tier system explained in plain language — the strip at the top of the
 * Partners page. Every tier answers one question: where does this relationship
 * stand, and what do you do next?
 */
export const PARTNER_TIER_EXPLAINERS: {
  key: (typeof PARTNER_TIERS)[number];
  label: string;
  description: string;
}[] = [
  {
    key: "target",
    label: "Targets / Hot List",
    description: "Partners you want to win. They haven't sent business yet — go get the first deal.",
  },
  {
    key: "new",
    label: "New",
    description: "Recently started sending business. Say thanks and set expectations early.",
  },
  {
    key: "growing",
    label: "Growing",
    description: "At least one closing together. The relationship is being developed.",
  },
  {
    key: "core",
    label: "Core",
    description: "Four or more closings a year. Protect these relationships above all.",
  },
  {
    key: "quiet",
    label: "Quiet",
    description: "No business in more than six months. Worth a call to win them back.",
  },
];

/**
 * The next move for each tier — computed plainly from the tier, nothing else.
 * Shown on the list and on the record so nobody has to invent a plan.
 */
export const PARTNER_NEXT_ACTIONS: Record<string, string> = {
  target: "Win the first deal — set a coffee",
  new: "Say thanks + set expectations",
  growing: "Ask for the next intro",
  core: "Protect the relationship — monthly touch",
  quiet: "Re-engage — check in this week",
};

export const PARTNER_TIER_TABS = [
  { key: "all", label: "Everyone" },
  { key: "target", label: "Targets" },
  { key: "new", label: "New" },
  { key: "growing", label: "Growing" },
  { key: "core", label: "Core" },
  { key: "quiet", label: "Quiet" },
];

/** How a logged touch or saved draft reads in the contact history. */
export const CHANNEL_LABELS: Record<string, string> = {
  email: "Email",
  sms: "Text",
  video: "Video message",
  call: "Call",
  note: "Note",
};
