/**
 * The work queue's vocabulary — Screen 1's ten priority classes.
 *
 * Pure and shared: the query layer builds these on the server, and the queue
 * item component renders them in the browser, so this file must not be
 * `server-only`.
 */

export type PriorityClass =
  | "deadline"
  | "new_lead"
  | "inbound"
  | "ally_approval"
  | "overdue_task"
  | "appointment"
  | "waiting_borrower"
  | "stalled"
  | "opportunity"
  | "relationship";

/** Rank order is the queue's spine: class first, then deadline, then size. */
export const CLASS_RANK: Record<PriorityClass, number> = {
  deadline: 1,
  new_lead: 2,
  inbound: 3,
  ally_approval: 4,
  overdue_task: 5,
  appointment: 6,
  waiting_borrower: 7,
  stalled: 8,
  opportunity: 9,
  relationship: 10,
};

/** Plain mortgage language — never the enum value. */
export const CLASS_LABELS: Record<PriorityClass, string> = {
  deadline: "Deadline",
  new_lead: "New lead",
  inbound: "Waiting on you",
  ally_approval: "Ally prepared this",
  overdue_task: "Overdue",
  appointment: "Today",
  waiting_borrower: "Waiting on them",
  stalled: "Gone quiet",
  opportunity: "Opportunity",
  relationship: "Relationship",
};

export type QueueUrgency = "critical" | "warning" | "info" | "neutral" | "ally";

export type QueueItem = {
  id: string;
  cls: PriorityClass;
  urgency: QueueUrgency;
  /** One line of plain language: what needs doing and why. */
  headline: string;
  detail: string | null;
  personId: string | null;
  personName: string | null;
  loanId: string | null;
  href: string;
  /** The label on the item's one primary action. */
  actionLabel: string;
  /** Sort key within a class — hours until (or since) the deadline. */
  hours: number;
  amount: number;
  /** Populated for Ally approval items. */
  insight?: {
    id: string;
    body: string | null;
    rationale: string;
    factors: string[];
    templateRef: string | null;
    language: string;
    kind: string;
  };
};
