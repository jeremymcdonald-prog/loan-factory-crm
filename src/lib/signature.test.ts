import { describe, it, expect } from "vitest";
import { buildDefaultSignature, renderSignatureText, renderSignatureHtml } from "./signature";

const FULL = {
  fullName: "Minh Tran",
  title: "Loan Officer",
  phone: "(555) 123-4567",
  nmlsId: "12345",
};

describe("buildDefaultSignature", () => {
  it("builds every line from name, title, NMLS, and phone, plus the standard footer", () => {
    const sig = buildDefaultSignature(FULL);
    expect(sig).toBe(
      [
        "Minh Tran",
        "Loan Officer",
        "NMLS #12345",
        "(555) 123-4567",
        "Loan Factory · Company NMLS 320841",
        "Equal Housing Opportunity",
      ].join("\n"),
    );
  });

  it("drops blank fields rather than leaving empty lines", () => {
    const sig = buildDefaultSignature({ fullName: "Minh Tran", title: null, phone: null, nmlsId: null });
    expect(sig).toBe("Minh Tran\nLoan Factory · Company NMLS 320841\nEqual Housing Opportunity");
  });
});

describe("renderSignatureText", () => {
  it("returns the saved signature untouched when one is on file", () => {
    expect(renderSignatureText({ ...FULL, signature: "Just my name\nCell only" })).toBe(
      "Just my name\nCell only",
    );
  });

  it("falls back to the default when the saved signature is blank or unset", () => {
    expect(renderSignatureText({ ...FULL, signature: null })).toBe(buildDefaultSignature(FULL));
    expect(renderSignatureText({ ...FULL, signature: "   " })).toBe(buildDefaultSignature(FULL));
  });

  it("never returns an empty string, even with no fields at all", () => {
    expect(renderSignatureText({ fullName: "Minh Tran" }).length).toBeGreaterThan(0);
  });
});

describe("renderSignatureHtml", () => {
  it("escapes HTML-significant characters in the signature text", () => {
    const html = renderSignatureHtml({
      fullName: "Minh Tran",
      signature: "Minh Tran <script>alert(1)</script> & \"friends\"",
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&amp;");
    expect(html).toContain("&quot;friends&quot;");
  });

  it("joins lines with <br /> and omits the logo image when none is set", () => {
    const html = renderSignatureHtml({ fullName: "A", title: "B", signature: null, nmlsId: null, phone: null });
    expect(html).toContain("<br />");
    expect(html).not.toContain("<img");
  });

  it("appends the logo image when a logoDataUrl is set", () => {
    const html = renderSignatureHtml({
      fullName: "Minh Tran",
      signature: "Minh Tran",
      logoDataUrl: "data:image/png;base64,AAAA",
    });
    expect(html).toContain('<img src="data:image/png;base64,AAAA"');
  });
});
