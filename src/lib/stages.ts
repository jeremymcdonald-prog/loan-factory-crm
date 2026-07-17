/**
 * The 20-stage opportunity lifecycle — Decisions D-06, Mortgage_Workflow_Map.md.
 *
 * These stages are CRM opportunity/relationship visibility only. The team
 * enters stage and milestone facts in v1; a future integration may sync them
 * read-only. The CRM never originates, underwrites, prices, discloses,
 * processes, or services anything (D-22).
 *
 * Enum values never localize. Display labels are the CANON English names; the
 * i18n layer supplies VI.
 */

export const STAGES = [
  "new_lead",
  "contact_attempt",
  "consultation_scheduled",
  "consultation_completed",
  "prequalification",
  "preapproval",
  "searching_for_home",
  "under_contract",
  "application",
  "disclosures",
  "processing",
  "submitted_to_underwriting",
  "conditional_approval",
  "clear_to_close",
  "closing_scheduled",
  "funded",
  "post_close",
  "annual_review",
  "refinance_opportunity",
  "referral_retention",
] as const;

export type Stage = (typeof STAGES)[number];

export type MacroPhase = "ENGAGE" | "QUALIFY" | "TRANSACT" | "RETAIN" | "GROW";

/** Macro-phase is derived — a lookup, not a column (Data_Model §3.6). */
const PHASE_OF: Record<Stage, MacroPhase> = {
  new_lead: "ENGAGE",
  contact_attempt: "ENGAGE",
  consultation_scheduled: "ENGAGE",
  consultation_completed: "ENGAGE",
  prequalification: "QUALIFY",
  preapproval: "QUALIFY",
  searching_for_home: "QUALIFY",
  under_contract: "TRANSACT",
  application: "TRANSACT",
  disclosures: "TRANSACT",
  processing: "TRANSACT",
  submitted_to_underwriting: "TRANSACT",
  conditional_approval: "TRANSACT",
  clear_to_close: "TRANSACT",
  closing_scheduled: "TRANSACT",
  funded: "TRANSACT",
  post_close: "RETAIN",
  annual_review: "RETAIN",
  refinance_opportunity: "GROW",
  referral_retention: "GROW",
};

export const STAGE_LABELS: Record<Stage, string> = {
  new_lead: "New lead",
  contact_attempt: "Contact attempt",
  consultation_scheduled: "Consultation scheduled",
  consultation_completed: "Consultation completed",
  prequalification: "Prequalification",
  preapproval: "Preapproval",
  searching_for_home: "Searching for home",
  under_contract: "Under contract",
  application: "Application",
  disclosures: "Disclosures",
  processing: "Processing",
  submitted_to_underwriting: "Submitted to underwriting",
  conditional_approval: "Conditional approval",
  clear_to_close: "Clear to close",
  closing_scheduled: "Closing scheduled",
  funded: "Funded",
  post_close: "Post close",
  annual_review: "Annual review",
  refinance_opportunity: "Refinance opportunity",
  referral_retention: "Referral & retention",
};

export const MACRO_PHASES: MacroPhase[] = [
  "ENGAGE",
  "QUALIFY",
  "TRANSACT",
  "RETAIN",
  "GROW",
];

/** Phases carry no hue of their own — name and position identify them (§4.4). */
export const PHASE_LABELS: Record<MacroPhase, string> = {
  ENGAGE: "Engage",
  QUALIFY: "Qualify",
  TRANSACT: "Transact",
  RETAIN: "Retain",
  GROW: "Grow",
};

export function phaseOf(stage: Stage): MacroPhase {
  return PHASE_OF[stage];
}

export function stageNumber(stage: Stage): number {
  return STAGES.indexOf(stage) + 1;
}

export function stagesIn(phase: MacroPhase): Stage[] {
  return STAGES.filter((s) => PHASE_OF[s] === phase);
}

export function stageLabel(stage: Stage): string {
  return STAGE_LABELS[stage];
}

/** The stages the Lead inbox covers (Data_Model §3.5). */
export const LEAD_STAGES: Stage[] = ["new_lead", "contact_attempt"];

export function isStage(value: string): value is Stage {
  return (STAGES as readonly string[]).includes(value);
}

/**
 * The stage a file would normally move to next. Stages are not a rail the CRM
 * enforces — a user can set any stage — but this drives the default action.
 */
export function nextStage(stage: Stage): Stage | null {
  const i = STAGES.indexOf(stage);
  if (i < 0 || i >= STAGES.length - 1) return null;
  return STAGES[i + 1];
}

/** Stalled thresholds by phase — Screen 1 priority class 8. */
export function stallDays(phase: MacroPhase): number {
  return phase === "TRANSACT" ? 3 : 7;
}
