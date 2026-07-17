import { describe, it, expect } from "vitest";
import { routeQuestion, SUGGESTED_PROMPTS, PREVIEW_NOTE } from "./router";

describe("assistant intent routing", () => {
  it("routes every suggested prompt to its own intent", () => {
    for (const prompt of SUGGESTED_PROMPTS) {
      expect(routeQuestion(prompt.label), prompt.label).toBe(prompt.intent);
    }
  });

  it("routes drafting requests to drafting, even when they mention the pipeline", () => {
    expect(routeQuestion("Draft a note about my pipeline")).toBe("draft_overdue_followups");
    expect(routeQuestion("write an email to my overdue leads")).toBe(
      "draft_overdue_followups",
    );
  });

  it("routes quiet/stale phrasings to quiet_opportunities", () => {
    expect(routeQuestion("which files are stale?")).toBe("quiet_opportunities");
    expect(routeQuestion("who has gone cold on me")).toBe("quiet_opportunities");
    expect(routeQuestion("anything with no movement lately?")).toBe("quiet_opportunities");
  });

  it("routes closing questions to closing_messages", () => {
    expect(routeQuestion("who is closing this week")).toBe("closing_messages");
  });

  it("falls back to an honest capabilities answer, never a guess", () => {
    expect(routeQuestion("")).toBe("capabilities");
    expect(routeQuestion("what's the meaning of life")).toBe("capabilities");
    expect(routeQuestion("qwerty")).toBe("capabilities");
  });

  it("the preview note admits no model is connected", () => {
    expect(PREVIEW_NOTE).toMatch(/no AI model is connected/i);
    expect(PREVIEW_NOTE).toMatch(/CRM records/i);
  });
});
