/**
 * ComplianceStrip — the mortgage-advertising reminder that sits on every
 * campaign edit and preview surface. Pure and client-safe: the edit form is a
 * client component and the detail page is a server one, and the reminder has
 * to read identically on both.
 *
 * Non-English campaigns additionally carry the human-translation-review
 * warning, in the same words the video composer uses — one promise, one
 * phrasing, everywhere.
 */
import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import { campaignLanguageName } from "../vocabulary";

export function ComplianceStrip({
  nmls,
  language,
  className,
}: {
  nmls: string | null;
  language: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2.5 rounded-lg border border-warning/25 bg-warning-bg px-4 py-3">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
        <div>
          <p className="text-small font-semibold text-warning">
            Mortgage advertising rules apply to this campaign
          </p>
          <p className="mt-0.5 text-body text-secondary">
            Every send carries the Equal Housing Opportunity notice and{" "}
            {nmls ? (
              <>
                Loan Factory, Inc. NMLS #<span className="tnum">{nmls}</span>
              </>
            ) : (
              "your company NMLS"
            )}{" "}
            in the footer — they&rsquo;re added for you. Don&rsquo;t promise a specific
            rate, payment, or approval: stating terms of credit triggers further
            disclosures under Reg Z. Translations require human review before sending.
          </p>
        </div>
      </div>

      {language !== "en" ? (
        <p className="rounded-md border border-warning-border bg-warning-bg px-3 py-1.5 text-small font-semibold text-warning">
          Written in {campaignLanguageName(language)} — a human translation review is
          required before this sends.
        </p>
      ) : null}
    </div>
  );
}
