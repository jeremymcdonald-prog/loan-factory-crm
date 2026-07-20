/**
 * Email signature rendering — the single source of truth for how a user's
 * signature looks everywhere the CRM shows (or, once a provider is
 * connected, sends) outbound mail: the profile editor's own live preview,
 * the 1:1 email draft on a person's record, the video-email composer, and
 * template previews.
 *
 * Campaigns and newsletters (owned by a separate task) should call
 * `renderSignatureHtml` from here too, rather than re-implementing this —
 * that is the contract this module exists to provide.
 *
 * Pure — no server or React imports — so client-side previews and any
 * future server send path render identically, and this can be unit tested
 * directly (mirrors the profile-validation.ts / bio/validate.ts pattern).
 */

export type SignatureProfile = {
  fullName: string;
  title?: string | null;
  phone?: string | null;
  nmlsId?: string | null;
  /** The user's saved signature (plain text; line breaks are kept). */
  signature?: string | null;
  /** Optional small logo/mark as a validated data: URL (≤512KB — see profile-validation.ts PHOTO_MAX_BYTES). */
  logoDataUrl?: string | null;
};

const COMPANY_LINE = "Loan Factory · Company NMLS 320841";
const EQUAL_HOUSING_LINE = "Equal Housing Opportunity";

/**
 * A sensible default signature built from what's actually on file — name,
 * title, NMLS, and phone — plus the standard company and Equal Housing
 * lines. Used both as the profile editor's "Restore default" action and as
 * the fallback every renderer below uses when no signature is saved, so a
 * message never goes out with a blank signature block.
 */
export function buildDefaultSignature(
  profile: Pick<SignatureProfile, "fullName" | "title" | "phone" | "nmlsId">,
): string {
  const lines = [
    profile.fullName,
    profile.title?.trim() || "",
    profile.nmlsId ? `NMLS #${profile.nmlsId}` : "",
    profile.phone?.trim() || "",
    COMPANY_LINE,
    EQUAL_HOUSING_LINE,
  ];
  return lines.filter((line) => line.trim().length > 0).join("\n");
}

/** The signature text actually in effect: what's saved, or the default when nothing is. */
function resolvedText(profile: SignatureProfile): string {
  const saved = profile.signature?.trim();
  return saved || buildDefaultSignature(profile);
}

/** Plain-text signature block — for text previews, drafts, and plain-text mail. */
export function renderSignatureText(profile: SignatureProfile): string {
  return resolvedText(profile);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * HTML signature block — for HTML email bodies (campaigns, newsletters,
 * templates, and any future rich-text send path). Escapes the saved text
 * before interpolating it, and appends the logo image when one is on file.
 */
export function renderSignatureHtml(profile: SignatureProfile): string {
  const text = resolvedText(profile);
  const linesHtml = text
    .split("\n")
    .map((line) => escapeHtml(line))
    .join("<br />");
  const logoHtml = profile.logoDataUrl
    ? `<img src="${escapeHtml(profile.logoDataUrl)}" alt="" style="max-height:48px;margin-top:8px;display:block;" />`
    : "";
  return (
    `<div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#333333;">` +
    `${linesHtml}${logoHtml}</div>`
  );
}
