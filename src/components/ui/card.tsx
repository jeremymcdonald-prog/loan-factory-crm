/**
 * Card / panel primitives — the rounded white cards of Loan Factory IQ.
 * Depth comes from a soft cool shadow and a subtle border, never a gradient.
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({
  children,
  className,
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
}) {
  return (
    <Tag
      className={cn(
        "rounded-card border border-subtle bg-surface shadow-e1",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  title,
  meta,
  action,
  className,
}: {
  title: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex items-center justify-between gap-3 border-b border-subtle px-5 py-4",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="truncate text-h3 font-semibold text-primary">{title}</h2>
        {meta ? <p className="mt-0.5 text-small text-muted">{meta}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

/** Section label — the small uppercase key used throughout Loan Factory IQ. */
export function SectionLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        "text-label font-semibold uppercase tracking-wide text-muted",
        className,
      )}
    >
      {children}
    </h3>
  );
}
