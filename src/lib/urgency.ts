/**
 * Urgency — the one question status colour answers: how urgently does this
 * relationship need a human? (Design_System §4.4)
 *
 * System-defined and computed in exactly one place, so the same facts produce
 * the same colour on every screen. Users tune notification delivery, never
 * colour logic.
 *
 * Every input is a team-entered CRM visibility fact — never loan-of-record data.
 */
import type { Urgency } from "@/components/ui/badge";
import { countdown } from "./format";
import { phaseOf, stallDays, type Stage } from "./stages";

export type LoanUrgencyInput = {
  stage: Stage;
  status: string;
  rateLockExpiresAt: string | null;
  closingDate: string | null;
  docsNeeded: boolean;
  docsNeededSince: Date | null;
  lastActivityAt: Date;
  preapprovalExpiresAt: string | null;
};

export type UrgencyRead = {
  level: Urgency;
  /** Plain language, never a bare dot: "Lock expires in 41h". */
  label: string | null;
};

/**
 * Read one opportunity's urgency. Order matters: the first rule that fires
 * wins, so a lock expiring today outranks a stalled file.
 */
export function loanUrgency(loan: LoanUrgencyInput, now = new Date()): UrgencyRead {
  if (loan.status === "funded") return { level: "healthy", label: "Funded" };
  if (loan.status === "lost") return { level: "neutral", label: "Lost" };

  const lock = countdown(loan.rateLockExpiresAt ? `${loan.rateLockExpiresAt}T17:00:00` : null, now);
  const closing = countdown(loan.closingDate ? `${loan.closingDate}T12:00:00` : null, now);

  // 1. Deadline blockers — act today or the deal is at risk.
  if (lock && !lock.overdue && lock.hours <= 72) {
    return { level: "critical", label: `Lock expires in ${lock.label}` };
  }
  if (lock && lock.overdue) {
    return { level: "critical", label: "Lock expired" };
  }
  if (closing && !closing.overdue && closing.hours <= 24 * 5) {
    return { level: "critical", label: `Closing in ${closing.label}` };
  }

  // 2. Aging toward a deadline — needs attention this week.
  if (lock && lock.hours <= 24 * 7) {
    return { level: "warning", label: `Lock expires in ${lock.label}` };
  }

  const docsAge = loan.docsNeededSince
    ? (now.getTime() - loan.docsNeededSince.getTime()) / 86_400_000
    : 0;
  if (loan.docsNeeded && docsAge > 2) {
    return { level: "warning", label: `Waiting on documents ${Math.round(docsAge)}d` };
  }

  const idleDays = (now.getTime() - loan.lastActivityAt.getTime()) / 86_400_000;
  const threshold = stallDays(phaseOf(loan.stage));
  if (idleDays >= threshold) {
    return { level: "warning", label: `No movement ${Math.round(idleDays)}d` };
  }

  const preapproval = countdown(
    loan.preapprovalExpiresAt ? `${loan.preapprovalExpiresAt}T12:00:00` : null,
    now,
  );
  if (preapproval && !preapproval.overdue && preapproval.hours <= 24 * 14) {
    return { level: "info", label: `Preapproval expires in ${preapproval.label}` };
  }

  return { level: "healthy", label: null };
}

/** Task urgency: overdue is amber, due today is informational. */
export function taskUrgency(dueAt: Date | null, now = new Date()): UrgencyRead {
  if (!dueAt) return { level: "neutral", label: null };
  const c = countdown(dueAt, now);
  if (!c) return { level: "neutral", label: null };

  if (c.overdue) {
    const days = Math.max(1, Math.round(Math.abs(c.hours) / 24));
    return { level: "warning", label: `Overdue ${days}d` };
  }
  if (c.hours <= 24) return { level: "info", label: "Due today" };
  return { level: "neutral", label: `Due ${c.label}` };
}

/**
 * Speed-to-lead: the SLA timer starts at capture — amber at 5 minutes, red at
 * 1 hour (Screen 1, priority class 2).
 */
export function leadUrgency(
  capturedAt: Date,
  firstResponseAt: Date | null,
  now = new Date(),
): UrgencyRead {
  if (firstResponseAt) return { level: "neutral", label: "Contacted" };

  const mins = (now.getTime() - capturedAt.getTime()) / 60_000;
  if (mins >= 60) {
    const c = countdown(capturedAt, now);
    return { level: "critical", label: `Waiting ${c?.label ?? `${Math.round(mins)}m`}` };
  }
  if (mins >= 5) return { level: "warning", label: `Waiting ${Math.round(mins)}m` };
  return { level: "info", label: `New ${Math.round(mins)}m ago` };
}
