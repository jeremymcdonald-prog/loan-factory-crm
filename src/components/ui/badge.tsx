/**
 * Badge / status chip — Design_System.md §4.4, §9.
 *
 * Status is never colour-only: every chip carries a label, and callers pass an
 * icon where the status drives urgency. Hue answers exactly one question —
 * how urgently does this need a human?
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Urgency = "critical" | "warning" | "healthy" | "info" | "neutral" | "ally";

const TONES: Record<Urgency, string> = {
  critical: "bg-critical-bg text-critical border-critical/25",
  warning: "bg-warning-bg text-warning border-warning/25",
  healthy: "bg-healthy-bg text-healthy border-healthy/25",
  info: "bg-info-bg text-info border-info/25",
  neutral: "bg-neutral-bg text-neutral border-strong/60",
  ally: "bg-ally-bg text-ally border-ally-border",
};

export function Badge({
  tone = "neutral",
  icon,
  children,
  className,
}: {
  tone?: Urgency;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5",
        "text-label font-semibold whitespace-nowrap tnum",
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/** A dot for dense rows. Always paired with adjacent text — never alone. */
export function UrgencyDot({ tone, className }: { tone: Urgency; className?: string }) {
  const fill: Record<Urgency, string> = {
    critical: "bg-critical",
    warning: "bg-warning",
    healthy: "bg-healthy",
    info: "bg-info",
    neutral: "bg-neutral",
    ally: "bg-ally",
  };
  return (
    <span
      aria-hidden
      className={cn("inline-block size-1.5 shrink-0 rounded-full", fill[tone], className)}
    />
  );
}
