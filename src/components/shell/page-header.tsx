import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * PageHeader — one h1 per page, one primary action per screen
 * (Design_System §5.2, Screen_Specifications shared conventions).
 */
export function PageHeader({
  title,
  subtitle,
  action,
  meta,
  className,
}: {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        // Left edge (px-4 / sm:px-6) matches every page body, so the title and
        // the content below share one gutter across all screens.
        "flex flex-wrap items-start justify-between gap-3 border-b border-subtle bg-surface px-4 py-5 sm:px-6 sm:py-6",
        className,
      )}
    >
      {/* flex-1 lets a long subtitle shrink rather than shove the primary
          action onto its own line — otherwise the action's position drifts
          from module to module depending on how long the sentence is. */}
      <div className="min-w-0 flex-1">
        <h1 className="text-h1 font-semibold tracking-tight text-primary">{title}</h1>
        {subtitle ? (
          <p className="mt-1 max-w-2xl text-body text-secondary">{subtitle}</p>
        ) : null}
        {meta ? <div className="mt-2">{meta}</div> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** "Updated 2 min ago" — a user must never wonder whether data is current. */
export function FreshnessStamp({ className }: { className?: string }) {
  return (
    <span className={cn("text-small text-muted tnum", className)} suppressHydrationWarning>
      Updated just now
    </span>
  );
}
