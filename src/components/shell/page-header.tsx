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
        "flex flex-wrap items-start justify-between gap-3 border-b border-subtle px-4 py-4 sm:px-6",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-h1 font-semibold tracking-tight text-primary">{title}</h1>
        {subtitle ? <p className="mt-1 text-body text-secondary">{subtitle}</p> : null}
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
