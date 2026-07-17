/**
 * Badge / status chip — the pill vocabulary of Loan Factory IQ: a soft tint,
 * a matching border, and a legible label.
 *
 * Status is never colour-only: every chip carries a word. Hue answers exactly
 * one question — how urgently does this need a human? Green, amber and red
 * mean status; orange means action; violet means Ally.
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Urgency =
  | "critical"
  | "warning"
  | "healthy"
  | "info"
  | "neutral"
  | "ally"
  | "brand";

const TONES: Record<Urgency, string> = {
  critical: "bg-critical-bg text-critical border-critical-border",
  warning: "bg-warning-bg text-warning border-warning-border",
  healthy: "bg-healthy-bg text-healthy border-healthy-border",
  info: "bg-info-bg text-info border-info-border",
  neutral: "bg-neutral-bg text-neutral border-neutral-border",
  ally: "bg-ally-bg text-ally border-ally-border",
  brand: "bg-action-tint text-action border-action-tint-border",
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
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
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
    brand: "bg-brand",
  };
  return (
    <span
      aria-hidden
      className={cn("inline-block size-1.5 shrink-0 rounded-full", fill[tone], className)}
    />
  );
}
