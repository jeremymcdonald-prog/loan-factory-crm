import { describe, it, expect } from "vitest";
import { cn } from "./cn";

/**
 * Regression cover for a real defect: stock tailwind-merge treated our custom
 * colour token `text-action-fg` and our custom size token `text-body` as the
 * same class group and dropped one, so the primary button rendered with no
 * label colour. These tests fail if the token lists in cn.ts drift out of sync
 * with the @theme blocks in globals.css.
 */
describe("cn", () => {
  it("keeps a custom text colour and a custom text size together", () => {
    const result = cn("bg-action text-action-fg", "text-body");
    expect(result).toContain("text-action-fg");
    expect(result).toContain("text-body");
  });

  it("keeps a semantic text colour alongside a size", () => {
    const result = cn("text-body text-primary");
    expect(result).toContain("text-body");
    expect(result).toContain("text-primary");
  });

  it("still resolves genuine conflicts within a group", () => {
    expect(cn("text-body text-h1")).toBe("text-h1");
    expect(cn("text-primary text-muted")).toBe("text-muted");
    expect(cn("bg-surface bg-canvas")).toBe("bg-canvas");
  });

  it("lets a caller override a component's default colour", () => {
    // How every component's `className` prop is expected to behave.
    expect(cn("bg-surface text-primary", "text-critical")).toBe(
      "bg-surface text-critical",
    );
  });

  it("keeps custom shadows distinct from stock ones", () => {
    expect(cn("shadow-e1 shadow-e2")).toBe("shadow-e2");
  });

  it("handles conditional and falsy inputs", () => {
    expect(cn("text-body", false && "text-h1", undefined, null)).toBe("text-body");
  });
});
