import { describe, it, expect } from "vitest";
import { loanUrgency, taskUrgency, leadUrgency, type LoanUrgencyInput } from "./urgency";

const NOW = new Date("2026-07-17T09:00:00Z");

function iso(daysFromNow: number): string {
  return new Date(NOW.getTime() + daysFromNow * 86_400_000).toISOString().slice(0, 10);
}

function loan(overrides: Partial<LoanUrgencyInput> = {}): LoanUrgencyInput {
  return {
    stage: "processing",
    status: "active",
    rateLockExpiresAt: null,
    closingDate: null,
    docsNeeded: false,
    docsNeededSince: null,
    lastActivityAt: NOW,
    preapprovalExpiresAt: null,
    ...overrides,
  };
}

describe("loan urgency", () => {
  it("is critical when a rate lock expires within 3 days", () => {
    const read = loanUrgency(loan({ rateLockExpiresAt: iso(2) }), NOW);
    expect(read.level).toBe("critical");
    expect(read.label).toMatch(/Lock expires/);
  });

  it("is critical when the lock has already expired", () => {
    const read = loanUrgency(loan({ rateLockExpiresAt: iso(-1) }), NOW);
    expect(read.level).toBe("critical");
    expect(read.label).toBe("Lock expired");
  });

  it("is warning when a lock expires later in the week", () => {
    expect(loanUrgency(loan({ rateLockExpiresAt: iso(6) }), NOW).level).toBe("warning");
  });

  it("is critical when closing is within 5 days", () => {
    const read = loanUrgency(loan({ closingDate: iso(3) }), NOW);
    expect(read.level).toBe("critical");
    expect(read.label).toMatch(/Closing in/);
  });

  it("puts the lock ahead of the closing date when both are pressing", () => {
    // A lock expiring today must outrank a closing in 4 days.
    const read = loanUrgency(loan({ rateLockExpiresAt: iso(1), closingDate: iso(4) }), NOW);
    expect(read.label).toMatch(/Lock expires/);
  });

  it("flags a docs-needed follow-up aging past 2 days", () => {
    const read = loanUrgency(
      loan({
        docsNeeded: true,
        docsNeededSince: new Date(NOW.getTime() - 5 * 86_400_000),
      }),
      NOW,
    );
    expect(read.level).toBe("warning");
    expect(read.label).toMatch(/Waiting on documents/);
  });

  it("does not flag a docs-needed follow-up raised today", () => {
    const read = loanUrgency(
      loan({ docsNeeded: true, docsNeededSince: new Date(NOW.getTime() - 3_600_000) }),
      NOW,
    );
    expect(read.level).toBe("healthy");
  });

  it("stalls a TRANSACT file after 3 days but a QUALIFY file only after 7", () => {
    const idle4 = new Date(NOW.getTime() - 4 * 86_400_000);
    expect(loanUrgency(loan({ stage: "processing", lastActivityAt: idle4 }), NOW).level).toBe(
      "warning",
    );
    expect(
      loanUrgency(loan({ stage: "searching_for_home", lastActivityAt: idle4 }), NOW).level,
    ).toBe("healthy");
  });

  it("treats funded and lost as terminal, ignoring stale dates", () => {
    const old = new Date(NOW.getTime() - 400 * 86_400_000);
    expect(loanUrgency(loan({ status: "funded", lastActivityAt: old }), NOW)).toEqual({
      level: "healthy",
      label: "Funded",
    });
    expect(loanUrgency(loan({ status: "lost", lastActivityAt: old }), NOW)).toEqual({
      level: "neutral",
      label: "Lost",
    });
  });

  it("is healthy with no pressure at all — no colour means no problem", () => {
    expect(loanUrgency(loan(), NOW)).toEqual({ level: "healthy", label: null });
  });
});

describe("task urgency", () => {
  it("marks an overdue task amber with the number of days", () => {
    const read = taskUrgency(new Date(NOW.getTime() - 2 * 86_400_000), NOW);
    expect(read.level).toBe("warning");
    expect(read.label).toBe("Overdue 2d");
  });

  it("marks a task due today as informational", () => {
    expect(taskUrgency(new Date(NOW.getTime() + 3_600_000), NOW).label).toBe("Due today");
  });

  it("has no urgency without a due date", () => {
    expect(taskUrgency(null, NOW).level).toBe("neutral");
  });
});

describe("speed-to-lead", () => {
  it("is informational in the first 5 minutes", () => {
    expect(leadUrgency(new Date(NOW.getTime() - 60_000), null, NOW).level).toBe("info");
  });

  it("turns amber at 5 minutes", () => {
    expect(leadUrgency(new Date(NOW.getTime() - 6 * 60_000), null, NOW).level).toBe("warning");
  });

  it("turns red at 1 hour", () => {
    const read = leadUrgency(new Date(NOW.getTime() - 90 * 60_000), null, NOW);
    expect(read.level).toBe("critical");
    expect(read.label).toMatch(/Waiting/);
  });

  it("stops the clock once someone has responded", () => {
    const read = leadUrgency(
      new Date(NOW.getTime() - 5 * 86_400_000),
      new Date(NOW.getTime() - 4 * 86_400_000),
      NOW,
    );
    expect(read.level).toBe("neutral");
    expect(read.label).toBe("Contacted");
  });
});
