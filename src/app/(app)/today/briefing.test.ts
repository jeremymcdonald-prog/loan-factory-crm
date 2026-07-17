import { describe, it, expect } from "vitest";
import { buildBriefing } from "./briefing";
import type { QueueItem } from "@/lib/queue-types";

const NOW = new Date("2026-07-17T09:00:00Z");
const STATS = { activeCount: 16, fundedMtdVolume: 640_000, closingNext7: 2 };

function item(over: Partial<QueueItem> & Pick<QueueItem, "id" | "cls">): QueueItem {
  return {
    urgency: "warning",
    headline: "Something",
    detail: null,
    personId: "p1",
    personName: "Thanh Nguyễn",
    loanId: "l1",
    href: "/x",
    actionLabel: "Open",
    hours: 1,
    amount: 0,
    ...over,
  } as QueueItem;
}

describe("the morning briefing", () => {
  it("leads with the date and a read of the day", () => {
    const b = buildBriefing("Minh", [], STATS, NOW);
    expect(b.greeting).toBe("Good morning, Minh.");
    expect(b.sentences[0]).toMatch(/Friday, July 17/);
  });

  it("says so plainly when there is nothing to do — and never invents work", () => {
    const b = buildBriefing("Minh", [], STATS, NOW);
    expect(b.sentences.join(" ")).toMatch(/caught up/i);
    expect(b.focus).toBeNull();
  });

  it("puts deadline risk before everything else", () => {
    const b = buildBriefing(
      "Minh",
      [
        item({ id: "lock-1", cls: "deadline", headline: "Thanh Nguyễn — rate lock expires in 2d" }),
        item({ id: "lead-1", cls: "new_lead", headline: "New lead: Maria Torres" }),
      ],
      STATS,
      NOW,
    );
    const lockIndex = b.sentences.findIndex((s) => s.includes("rate lock"));
    const leadIndex = b.sentences.findIndex((s) => s.includes("waiting on a first call"));
    expect(lockIndex).toBeGreaterThan(-1);
    expect(lockIndex).toBeLessThan(leadIndex);
  });

  it("states the approval contract whenever Ally has drafts waiting", () => {
    const b = buildBriefing(
      "Minh",
      [item({ id: "insight-1", cls: "ally_approval", urgency: "ally" })],
      STATS,
      NOW,
    );
    const text = b.sentences.join(" ");
    expect(text).toMatch(/ready for your approval/);
    expect(text).toMatch(/Nothing goes out until you say so/);
  });

  it("counts leads correctly and names the oldest", () => {
    const b = buildBriefing(
      "Minh",
      [
        item({ id: "lead-1", cls: "new_lead", personName: "Chidi Okonkwo", hours: -26 }),
        item({ id: "lead-2", cls: "new_lead", personName: "Ravi Patel", hours: -4 }),
      ],
      STATS,
      NOW,
    );
    const text = b.sentences.join(" ");
    expect(text).toMatch(/2 new leads/);
    expect(text).toMatch(/oldest is Chidi Okonkwo/);
  });

  it("uses singular wording for a single lead", () => {
    const b = buildBriefing(
      "Minh",
      [item({ id: "lead-1", cls: "new_lead", personName: "Ravi Patel" })],
      STATS,
      NOW,
    );
    expect(b.sentences.join(" ")).toMatch(/One new lead is waiting/);
  });

  it("offers a focus naming the top three items by rank", () => {
    const b = buildBriefing(
      "Minh",
      [
        item({ id: "lock-1", cls: "deadline", personName: "Thanh Nguyễn" }),
        item({ id: "closing-1", cls: "deadline", personName: "Carmen Rodriguez" }),
        item({ id: "lead-1", cls: "new_lead", personName: "Chidi Okonkwo" }),
      ],
      STATS,
      NOW,
    );
    expect(b.focus).toMatch(/If you only do three things today/);
    expect(b.focus).toMatch(/Thanh/);
    expect(b.focus).toMatch(/Chidi/);
  });

  it("never runs longer than six sentences, however busy the day", () => {
    const many: QueueItem[] = [
      item({ id: "lock-1", cls: "deadline" }),
      item({ id: "lock-2", cls: "deadline" }),
      item({ id: "closing-1", cls: "deadline" }),
      item({ id: "lead-1", cls: "new_lead" }),
      item({ id: "lead-2", cls: "new_lead" }),
      item({ id: "insight-1", cls: "ally_approval" }),
      item({ id: "task-1", cls: "overdue_task" }),
      item({ id: "appt-1", cls: "appointment" }),
      item({ id: "stall-1", cls: "stalled" }),
    ];
    expect(buildBriefing("Minh", many, STATS, NOW).sentences.length).toBeLessThanOrEqual(6);
  });

  it("never states a rate or promises an outcome", () => {
    const b = buildBriefing(
      "Minh",
      [
        item({ id: "lock-1", cls: "deadline", headline: "Thanh — rate lock expires in 2d" }),
        item({ id: "insight-1", cls: "ally_approval" }),
      ],
      STATS,
      NOW,
    );
    const text = `${b.sentences.join(" ")} ${b.focus ?? ""}`;
    expect(text).not.toMatch(/\d+(\.\d+)?%/); // no rate
    expect(text).not.toMatch(/guarantee|approved|pre-approved you|will close/i);
  });
});
