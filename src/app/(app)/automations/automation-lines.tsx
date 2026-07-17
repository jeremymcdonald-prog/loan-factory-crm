import { Fragment } from "react";
import { cn } from "@/lib/cn";

/**
 * The three lines every automation reads as.
 *
 * No diagram and no nodes: an automation is a sentence a loan officer would say
 * out loud — what sets it off, who it touches, what happens. The card and the
 * record share this block, so an automation can never describe itself two
 * different ways on two different screens.
 */
export function AutomationLines({
  triggerText,
  audienceText,
  actionText,
  className,
}: {
  triggerText: string;
  audienceText: string;
  actionText: string;
  className?: string;
}) {
  const lines = [
    { label: "When", text: triggerText },
    { label: "Who", text: audienceText },
    { label: "Then", text: actionText },
  ];

  return (
    <dl className={cn("grid grid-cols-[3.25rem_1fr] gap-x-3 gap-y-1.5", className)}>
      {lines.map((line) => (
        <Fragment key={line.label}>
          <dt className="pt-px text-label font-semibold uppercase tracking-wide text-muted">
            {line.label}
          </dt>
          <dd className="text-body text-primary">{line.text}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
