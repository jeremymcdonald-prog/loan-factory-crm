/**
 * AICard — the one way AI appears anywhere in the product.
 *
 * The contract (D-05): AI prepares, the human approves. Nothing
 * borrower-facing sends without a human tap. So this card always shows:
 *   - what AI prepared,
 *   - WHY (the rationale + the factors it used — never a black box),
 *   - the full draft one tap away,
 *   - and exactly three verdicts.
 *
 * Verdict set is defined once (D-19) and used verbatim everywhere:
 * Approve · Edit then send · Skip. No screen invents its own.
 *
 * Violet belongs to AI alone. AI never uses red or green — its outputs are
 * proposals, not statuses.
 */
import type { ReactNode } from "react";
import { Sparkle } from "lucide-react";
import { cn } from "@/lib/cn";

export function AIMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-grid size-5 shrink-0 place-items-center rounded bg-ai-bg text-ai",
        className,
      )}
      aria-hidden
    >
      <Sparkle className="size-3" strokeWidth={2.5} />
    </span>
  );
}

export function AIAttribution({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-label font-semibold text-ai", className)}>
      <AIMark />
      Prepared by AI
    </span>
  );
}

/**
 * The card shell. Callers supply the verdict controls so the actions stay
 * server-action-driven and auditable.
 */
export function AICard({
  title,
  rationale,
  factors,
  children,
  actions,
  meta,
  className,
}: {
  title: string;
  /** Plain language: why is this here? */
  rationale: string;
  /** The signals behind it — fair-lending-safe factors only (D-11). */
  factors?: string[];
  /** The draft itself, when there is one. */
  children?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "rounded-card border border-ai-border bg-ai-bg/40 p-3.5",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          <AIMark className="mt-0.5" />
          <div className="min-w-0">
            <h3 className="text-body font-semibold text-primary">{title}</h3>
            <p className="mt-0.5 text-small text-secondary">{rationale}</p>
          </div>
        </div>
        {meta ? <div className="shrink-0">{meta}</div> : null}
      </header>

      {factors?.length ? (
        <details className="group mt-2.5">
          <summary className="cursor-pointer list-none text-label font-semibold text-ai hover:underline">
            Why is this here?
          </summary>
          <ul className="mt-1.5 space-y-1 border-l-2 border-ai-border pl-2.5">
            {factors.map((f) => (
              <li key={f} className="text-small text-secondary">
                {f}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {children ? <div className="mt-3">{children}</div> : null}

      {actions ? <div className="mt-3 flex flex-wrap items-center gap-2">{actions}</div> : null}
    </article>
  );
}

/**
 * The draft body, shown verbatim. A user must be able to read exactly what
 * would go out before they approve it.
 */
export function AIDraft({ body, language }: { body: string; language?: string }) {
  return (
    <div className="rounded-md border border-subtle bg-surface">
      {language && language !== "en" ? (
        <p className="border-b border-subtle bg-warning-bg px-3 py-1.5 text-small font-semibold text-warning">
          Written in {LANGUAGE_NAMES[language] ?? language} — a human translation review is
          required before this sends.
        </p>
      ) : null}
      <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap p-3 font-sans text-small leading-5 text-primary">
        {body}
      </pre>
    </div>
  );
}

const LANGUAGE_NAMES: Record<string, string> = {
  vi: "Vietnamese",
  zh: "Chinese",
  es: "Spanish",
  ru: "Russian",
};

/** Every approve shows the compliance footer before the tap. */
export function ComplianceFooterPreview({ nmls }: { nmls?: string | null }) {
  return (
    <p className="text-micro leading-4 text-muted">
      Sends with: Loan Factory · NMLS #320841{nmls ? ` · LO NMLS #${nmls}` : ""} · Equal
      Housing Opportunity
    </p>
  );
}
