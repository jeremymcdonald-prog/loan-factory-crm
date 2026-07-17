/**
 * Brand mark — Design_System.md §2 (calm authority).
 *
 * A geometric mark, not an emoji or a mascot: three ascending bars read as a
 * pipeline advancing through stages, boxed to suggest the "factory" floor.
 * Renders in currentColor so it inherits sidebar/canvas context.
 */
import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn("size-6", className)}
    >
      <rect
        x="1.25"
        y="1.25"
        width="21.5"
        height="21.5"
        rx="5"
        stroke="currentColor"
        strokeOpacity="0.32"
        strokeWidth="1.5"
      />
      <rect x="6" y="14" width="3" height="4.5" rx="1" fill="currentColor" fillOpacity="0.5" />
      <rect x="10.5" y="10" width="3" height="8.5" rx="1" fill="currentColor" fillOpacity="0.75" />
      <rect x="15" y="5.5" width="3" height="13" rx="1" fill="currentColor" />
    </svg>
  );
}

export function Wordmark({
  className,
  subdued = false,
}: {
  className?: string;
  subdued?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={subdued ? "text-action" : "text-action"} />
      <span className="text-h3 font-semibold tracking-tight">
        Loan Factory
        <span className="ml-1 font-medium text-muted">CRM</span>
      </span>
    </span>
  );
}
