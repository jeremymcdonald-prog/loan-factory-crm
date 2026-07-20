/**
 * The Automations module's plain-language vocabulary is the one place a
 * regression would be invisible in a type check: `SOURCES` and `SOURCE_LABEL`
 * are plain string unions, so a typo or a dropped key compiles fine and just
 * quietly breaks a picker or mislabels a card.
 *
 * These pin two things that must never regress:
 *   - every source value the ten canonical automations were seeded with
 *     (Automation_Catalog.md) stays a valid, labeled option, so editing one of
 *     them never silently changes what it's set to;
 *   - the full M5 trigger set the product plan calls for is actually offered.
 */
import { describe, it, expect } from "vitest";
import { SOURCES, SOURCE_LABEL, TEST_RUN_OUTCOME, RETRY_RUN_OUTCOME, TIER_LADDER } from "./labels";

describe("automation source vocabulary", () => {
  it("keeps every source value the ten canonical automations were seeded with", () => {
    const seeded = [
      "agent referral",
      "past client referral",
      "facebook",
      "instagram",
      "website",
      "open house",
      "crm event",
    ];
    for (const source of seeded) {
      expect(SOURCES).toContain(source);
    }
  });

  it("offers the full M5 trigger set", () => {
    const required = [
      "facebook",
      "instagram",
      "jotform",
      "google form",
      "follow up boss referral",
      "website",
      "open house",
      "agent referral",
      "past client referral",
      "new application",
      "preapproval",
      "contract received",
      "loan funded",
      "anniversary",
      "no activity",
    ];
    for (const source of required) {
      expect(SOURCES).toContain(source);
    }
  });

  it("has no duplicate source keys", () => {
    expect(new Set(SOURCES).size).toBe(SOURCES.length);
  });

  it("labels every source it offers, with nothing left blank", () => {
    for (const source of SOURCES) {
      expect(SOURCE_LABEL[source]).toBeTruthy();
    }
  });
});

describe("run outcome honesty", () => {
  it("tells the truth about nothing being sent, at every tier, for a test run", () => {
    for (const tier of TIER_LADDER) {
      expect(TEST_RUN_OUTCOME[tier]).toMatch(/nothing (was|has been) (sent|drafted)/i);
    }
  });

  it("tells the truth about nothing being sent, at every tier, for a retry", () => {
    for (const tier of TIER_LADDER) {
      expect(RETRY_RUN_OUTCOME[tier]).toMatch(/nothing (was|has been) sent/i);
    }
  });

  it("never claims a retry replays or re-sends the failed attempt", () => {
    for (const tier of TIER_LADDER) {
      expect(RETRY_RUN_OUTCOME[tier]).not.toMatch(/resend|re-send|replay/i);
    }
  });
});
