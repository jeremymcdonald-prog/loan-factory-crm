/**
 * Assistant intent routing — the pure half of the mock assistant.
 *
 * No model is connected yet, and the product never pretends otherwise. Until
 * one is, the assistant is a deterministic router: it reads the question,
 * picks an intent, and the engine answers from the CRM's own records. This
 * module has no server dependencies so the routing is unit-testable, and the
 * same intents become the tool-selection layer when a real model arrives.
 */

export type AssistantIntent =
  | "focus_today"
  | "draft_overdue_followups"
  | "quiet_opportunities"
  | "summarize_pipeline"
  | "closing_messages"
  | "capabilities";

export const SUGGESTED_PROMPTS: { label: string; intent: AssistantIntent }[] = [
  { label: "What should I focus on today?", intent: "focus_today" },
  { label: "Draft a follow-up for my overdue leads", intent: "draft_overdue_followups" },
  { label: "Which opportunities have gone quiet?", intent: "quiet_opportunities" },
  { label: "Summarize my pipeline", intent: "summarize_pipeline" },
  { label: "Prepare messages for today's closings", intent: "closing_messages" },
];

type Rule = { intent: AssistantIntent; patterns: RegExp[] };

const RULES: Rule[] = [
  {
    intent: "draft_overdue_followups",
    patterns: [
      /draft/i,
      /follow[\s-]?up/i,
      /overdue.*(lead|task|follow)/i,
      /write.*(message|email|text)/i,
      /prepare.*follow/i,
    ],
  },
  {
    intent: "closing_messages",
    patterns: [/closing/i, /close this week/i, /funded/i, /congratulat/i],
  },
  {
    intent: "quiet_opportunities",
    patterns: [
      /quiet/i,
      /stale|stalled/i,
      /no (movement|activity)/i,
      /gone (cold|dark|quiet)/i,
      /haven'?t (heard|touched)/i,
    ],
  },
  {
    intent: "summarize_pipeline",
    patterns: [/pipeline/i, /summar/i, /how.*(book|volume|files)/i, /where do .* stand/i],
  },
  {
    intent: "focus_today",
    patterns: [/focus/i, /today/i, /priorit/i, /first/i, /start with/i, /what should i do/i],
  },
];

/**
 * Route a question to an intent. Order matters: drafting beats summarising
 * ("draft a note about my pipeline" should draft), and the fallback is an
 * honest statement of what the assistant can do — never a guess.
 */
export function routeQuestion(question: string): AssistantIntent {
  const q = question.trim();
  if (!q) return "capabilities";

  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(q))) return rule.intent;
  }
  return "capabilities";
}

/** The honesty footer every reply carries while no model is connected. */
export const PREVIEW_NOTE =
  "Preview mode: no AI model is connected yet. This answer was assembled from your CRM records only.";
