/**
 * One person row's urgency, combining the two clocks that can apply.
 *
 * A brand-new lead nobody has called is the most urgent thing in the book, and
 * its clock (speed-to-lead) is different from an opportunity's deadline clock.
 * Resolving both here keeps every surface consistent.
 */
import { loanUrgency, leadUrgency, type UrgencyRead } from "./urgency";
import { LEAD_STAGES, type Stage } from "./stages";

export type PersonUrgencyInput = {
  stage: Stage | null;
  loanStatus: string | null;
  rateLockExpiresAt: string | null;
  closingDate: string | null;
  docsNeeded: boolean | null;
  docsNeededSince: Date | null;
  lastActivityAt: Date | null;
  preapprovalExpiresAt: string | null;
  capturedAt: Date | null;
  firstResponseAt: Date | null;
};

export function personUrgency(
  row: PersonUrgencyInput,
  now = new Date(),
): UrgencyRead | null {
  if (!row.stage) return null;

  // Speed-to-lead wins while the lead is still uncontacted: no other clock
  // matters until someone has actually reached out.
  const uncontactedLead =
    row.capturedAt &&
    !row.firstResponseAt &&
    LEAD_STAGES.includes(row.stage) &&
    row.loanStatus === "active";

  if (uncontactedLead) {
    return leadUrgency(row.capturedAt!, row.firstResponseAt, now);
  }

  return loanUrgency(
    {
      stage: row.stage,
      status: row.loanStatus ?? "active",
      rateLockExpiresAt: row.rateLockExpiresAt,
      closingDate: row.closingDate,
      docsNeeded: row.docsNeeded ?? false,
      docsNeededSince: row.docsNeededSince,
      lastActivityAt: row.lastActivityAt ?? now,
      preapprovalExpiresAt: row.preapprovalExpiresAt,
    },
    now,
  );
}
