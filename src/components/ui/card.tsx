/**
 * Card / panel primitives — Design_System.md §9.
 * Depth comes from layered neutrals and borders. No decorative gradients.
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
    <Tag className={cn("rounded-lg border border-subtle bg-surface", className)}>
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
        "flex items-center justify-between gap-3 border-b border-subtle px-4 py-3",
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

/** Section label — Design_System §5.2 `type/label`. */
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
