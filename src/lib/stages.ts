/**
 * The opportunity lifecycle — Leads → Applications → Loans → Past clients.
 *
 * These stages are CRM opportunity/relationship visibility only. The team
 * enters stage and milestone facts; a future integration may sync them
 * read-only. The CRM never originates, underwrites, prices, discloses,
 * processes, or services anything (D-22).
 *
 * A person becomes an *applicant* when they reach `prequalification` — that is
 * the boundary between the Leads group and the Applications group.
 *
 * Enum values never localize. Display labels are the CANON English names.
 */

export const STAGES = [
  // LEADS
  "new_lead",
  "contact_attempt",
  "consultation_scheduled",
  "consultation_completed",
  "working_on_credit",
  "thirty_to_ninety_out",
  "ninety_plus_out",
  // APPLICATIONS
  "prequalification",
  "preapproval",
  "contract_received",
  "ready_to_refinance",
  // LOANS
  "submitted_to_processing",
  "submitted_to_underwriting",
  "conditional_approval",
  "appraisal_ordered",
  "appraisal_received",
  "submitted_for_clear_to_close",
  "clear_to_close",
  // PAST CLIENTS
  "funded",
  "first_year_followup",
  "annual_review",
  "refinance_opportunity",
  "referral_and_retention",
] as const;

export type Stage = (typeof STAGES)[number];

/**
 * The four groups a loan officer actually works. This is the canonical
 * grouping — the Pipeline views, the stall thresholds, and the stage rail all
 * derive from it. (`MacroPhase` is kept as the type name so existing callers
 * compile; the values are the four groups.)
 */
export type MacroPhase = "LEADS" | "APPLICATIONS" | "LOANS" | "PAST";

const PHASE_OF: Record<Stage, MacroPhase> = {
  new_lead: "LEADS",
  contact_attempt: "LEADS",
  consultation_scheduled: "LEADS",
  consultation_completed: "LEADS",
  working_on_credit: "LEADS",
  thirty_to_ninety_out: "LEADS",
  ninety_plus_out: "LEADS",
  prequalification: "APPLICATIONS",
  preapproval: "APPLICATIONS",
  contract_received: "APPLICATIONS",
  ready_to_refinance: "APPLICATIONS",
  submitted_to_processing: "LOANS",
  submitted_to_underwriting: "LOANS",
  conditional_approval: "LOANS",
  appraisal_ordered: "LOANS",
  appraisal_received: "LOANS",
  submitted_for_clear_to_close: "LOANS",
  clear_to_close: "LOANS",
  funded: "PAST",
  first_year_followup: "PAST",
  annual_review: "PAST",
  refinance_opportunity: "PAST",
  referral_and_retention: "PAST",
};

export const STAGE_LABELS: Record<Stage, string> = {
  new_lead: "New lead",
  contact_attempt: "Contact attempt",
  consultation_scheduled: "Consultation scheduled",
  consultation_completed: "Consultation completed",
  working_on_credit: "Working on credit",
  thirty_to_ninety_out: "30–90 days out",
  ninety_plus_out: "90+ days out",
  prequalification: "Prequalification",
  preapproval: "Preapproval",
  contract_received: "Contract received",
  ready_to_refinance: "Ready to refinance",
  submitted_to_processing: "Submitted to processing",
  submitted_to_underwriting: "Submitted to underwriting",
  conditional_approval: "Conditional approval",
  appraisal_ordered: "Appraisal ordered",
  appraisal_received: "Appraisal received",
  submitted_for_clear_to_close: "Submitted for clear to close",
  clear_to_close: "Clear to close / Closing scheduled",
  funded: "Funded",
  first_year_followup: "First-year follow-up",
  annual_review: "Annual review",
  refinance_opportunity: "Refinance opportunity",
  referral_and_retention: "Referral and retention",
};

export const MACRO_PHASES: MacroPhase[] = ["LEADS", "APPLICATIONS", "LOANS", "PAST"];

/** Group labels — the four lists a loan officer works. */
export const PHASE_LABELS: Record<MacroPhase, string> = {
  LEADS: "Leads",
  APPLICATIONS: "Applications",
  LOANS: "Loans",
  PAST: "Past clients",
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

/**
 * Stalled thresholds — an active loan in the LOANS group needs a touch every
 * 3 days; earlier relationships get a week before they read as quiet.
 */
export function stallDays(phase: MacroPhase): number {
  return phase === "LOANS" ? 3 : 7;
}
