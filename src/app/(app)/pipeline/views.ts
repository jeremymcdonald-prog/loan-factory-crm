/**
 * Pipeline views — the four tabs a loan officer actually works:
 * Leads, Applications, Loans, Past clients.
 *
 * The grouping is the canonical one defined in src/lib/stages.ts (a person
 * becomes an applicant at prequalification); this module just re-labels the
 * four groups for the Pipeline URL and board.
 */
import { STAGES, phaseOf, type Stage, type MacroPhase } from "@/lib/stages";
import type { PipelineCard, LeadOnlyContact } from "@/lib/queries/pipeline";

export const PIPELINE_VIEWS = ["leads", "applications", "loans", "past"] as const;
export type PipelineView = (typeof PIPELINE_VIEWS)[number];

export const VIEW_LABELS: Record<PipelineView, string> = {
  leads: "Leads",
  applications: "Applications",
  loans: "Loans",
  past: "Past clients",
};

/** The pipeline group each stage belongs to, mapped to this module's view key. */
const VIEW_OF_PHASE: Record<MacroPhase, PipelineView> = {
  LEADS: "leads",
  APPLICATIONS: "applications",
  LOANS: "loans",
  PAST: "past",
};

/** A funded file is a past client whatever its stage says. */
export function viewOf(stage: Stage, loanStatus: string): PipelineView {
  if (loanStatus === "funded") return "past";
  return VIEW_OF_PHASE[phaseOf(stage)];
}

/** The board columns for a view, in canonical stage order. */
export function stagesInView(view: PipelineView): Stage[] {
  return STAGES.filter((s) => VIEW_OF_PHASE[phaseOf(s)] === view);
}

export function isPipelineView(value: string): value is PipelineView {
  return (PIPELINE_VIEWS as readonly string[]).includes(value);
}

// ---------------------------------------------------------------------------
// Records: one union for the board and the table — a loan-backed opportunity
// or a lead-type person with no file yet (Leads view only).
// ---------------------------------------------------------------------------

export type PipelineRecord =
  | { kind: "loan"; card: PipelineCard }
  | { kind: "contact"; card: LeadOnlyContact };

export function recordHref(record: PipelineRecord): string {
  return record.kind === "loan"
    ? `/opportunities/${record.card.loanId}`
    : `/people/${record.card.personId}`;
}

export function recordAmount(record: PipelineRecord): number | null {
  if (record.kind !== "loan") return null;
  const raw = record.card.amount ?? record.card.preapprovalAmount;
  return raw == null ? null : Number(raw);
}

export function recordLastActivity(record: PipelineRecord): Date {
  return record.kind === "loan" ? record.card.lastActivityAt : record.card.updatedAt;
}

// ---------------------------------------------------------------------------
// Filters — searchParams-driven, so the server component re-renders the whole
// dataset with the filter applied. All options come from the rows on screen.
// ---------------------------------------------------------------------------

export type PipelineFilterState = {
  owner: string;
  source: string;
  status: string;
  amt: string;
  act: string;
  attn: boolean;
};

export const AMOUNT_BUCKETS = [
  { value: "lt300", label: "Under $300K", min: 0, max: 300_000 },
  { value: "300-500", label: "$300K – $500K", min: 300_000, max: 500_000 },
  { value: "500-750", label: "$500K – $750K", min: 500_000, max: 750_000 },
  { value: "gt750", label: "Over $750K", min: 750_000, max: Infinity },
] as const;

export const ACTIVITY_WINDOWS = [
  { value: "24h", label: "Active today", maxDays: 1 },
  { value: "7d", label: "Active this week", maxDays: 7 },
  { value: "30d", label: "Active this month", maxDays: 30 },
  { value: "older", label: "Quiet 30+ days", maxDays: Infinity },
] as const;

export const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  on_hold: "On hold",
  funded: "Funded",
};

/** Known acquisition channels get real names; anything else is humanized. */
const CHANNEL_LABELS: Record<string, string> = {
  lf_website: "LF website",
  qm_pricer: "QM pricer",
  facebook_ads: "Facebook ads",
  partner_referral: "Partner referral",
  email: "Email",
  manual: "Manual entry",
};

export function channelLabel(channel: string): string {
  if (CHANNEL_LABELS[channel]) return CHANNEL_LABELS[channel];
  const words = channel.replaceAll("_", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}
