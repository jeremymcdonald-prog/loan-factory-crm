import { describe, it, expect } from "vitest";
import { normalizeUrl, validateSocialLinks } from "./validate";

describe("normalizeUrl", () => {
  it("adds https:// when no scheme is present", () => {
    expect(normalizeUrl("example.com")).toBe("https://example.com/");
    expect(normalizeUrl("facebook.com/jane.doe")).toBe("https://facebook.com/jane.doe");
  });

  it("keeps an existing http or https scheme as-is", () => {
    expect(normalizeUrl("http://example.com")).toBe("http://example.com/");
    expect(normalizeUrl("https://example.com/path")).toBe("https://example.com/path");
  });

  it("trims whitespace before normalizing", () => {
    expect(normalizeUrl("  example.com  ")).toBe("https://example.com/");
  });

  it("is case-insensitive about the scheme and normalizes casing", () => {
    expect(normalizeUrl("HTTPS://Example.com")).toBe("https://example.com/");
  });

  it("rejects blank input", () => {
    expect(normalizeUrl("")).toBeNull();
    expect(normalizeUrl("   ")).toBeNull();
  });

  it("rejects non-http(s) schemes", () => {
    expect(normalizeUrl("javascript:alert(1)")).toBeNull();
    expect(normalizeUrl("mailto:test@example.com")).toBeNull();
    expect(normalizeUrl("ftp://example.com")).toBeNull();
    expect(normalizeUrl("data:text/html,<script>x</script>")).toBeNull();
  });

  it("rejects hosts with no dot (not a real, shareable address)", () => {
    expect(normalizeUrl("localhost")).toBeNull();
    expect(normalizeUrl("https://localhost")).toBeNull();
    expect(normalizeUrl("asdf")).toBeNull();
  });

  it("rejects unparseable garbage", () => {
    expect(normalizeUrl("https://")).toBeNull();
    expect(normalizeUrl("://nope")).toBeNull();
  });
});

describe("validateSocialLinks", () => {
  it("accepts valid links for every known platform", () => {
    const { links, errors } = validateSocialLinks({
      facebook: "facebook.com/jane",
      instagram: "instagram.com/jane",
      tiktok: "tiktok.com/@jane",
      linkedin: "linkedin.com/in/jane",
      youtube: "youtube.com/@jane",
      website: "janedoe.com",
    });
    expect(errors).toEqual([]);
    expect(links.facebook).toBe("https://facebook.com/jane");
    expect(links.instagram).toBe("https://instagram.com/jane");
    expect(links.tiktok).toBe("https://tiktok.com/@jane");
    expect(links.linkedin).toBe("https://linkedin.com/in/jane");
    expect(links.youtube).toBe("https://youtube.com/@jane");
    expect(links.website).toBe("https://janedoe.com/");
  });

  it("treats blank fields as not provided, not an error", () => {
    const { links, errors } = validateSocialLinks({ facebook: "", instagram: undefined });
    expect(errors).toEqual([]);
    expect(links).toEqual({});
  });

  it("reports an error for an invalid URL and omits it from links", () => {
    const { links, errors } = validateSocialLinks({
      facebook: "facebook.com/jane",
      instagram: "not a url",
    });
    expect(links.facebook).toBe("https://facebook.com/jane");
    expect(links.instagram).toBeUndefined();
    expect(errors).toEqual(["Instagram link doesn't look like a real web address."]);
  });

  it("collects one error per bad field and keeps the good ones", () => {
    const { links, errors } = validateSocialLinks({
      facebook: "javascript:alert(1)",
      linkedin: "linkedin.com/in/jane",
      youtube: "javascript:alert(2)",
    });
    expect(links).toEqual({ linkedin: "https://linkedin.com/in/jane" });
    expect(errors).toHaveLength(2);
    expect(errors[0]).toContain("Facebook");
    expect(errors[1]).toContain("YouTube");
  });

  it("validates and normalizes 'other' links, dropping fully empty rows", () => {
    const { links, errors } = validateSocialLinks({
      other: [
        { label: "Company blog", url: "blog.example.com" },
        { label: "", url: "" },
      ],
    });
    expect(errors).toEqual([]);
    expect(links.other).toEqual([{ label: "Company blog", url: "https://blog.example.com/" }]);
  });

  it("errors on an 'other' row with a label but no valid URL", () => {
    const { links, errors } = validateSocialLinks({
      other: [{ label: "Portfolio", url: "not a url" }],
    });
    expect(links.other).toBeUndefined();
    expect(errors).toEqual([`"Portfolio" doesn't look like a real web address.`]);
  });

  it("errors on an 'other' row with a URL but no label", () => {
    const { links, errors } = validateSocialLinks({
      other: [{ label: "", url: "blog.example.com" }],
    });
    expect(links.other).toBeUndefined();
    expect(errors).toEqual(["Each additional link needs a label."]);
  });

  it("ignores a malformed 'other' payload gracefully", () => {
    const { links, errors } = validateSocialLinks({ other: "not-an-array" });
    expect(links.other).toBeUndefined();
    expect(errors).toEqual(["The additional links list wasn't formatted correctly."]);
  });

  it("rejects a non-string value for a known platform", () => {
    const { links, errors } = validateSocialLinks({ facebook: 12345 });
    expect(links.facebook).toBeUndefined();
    expect(errors).toEqual(["Facebook link isn't valid."]);
  });
});
