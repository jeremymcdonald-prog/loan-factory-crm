import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { sourceLabel } from "./labels";

/**
 * The lines every automation reads as.
 *
 * No diagram and no nodes: an automation is a sentence a loan officer would say
 * out loud — what sets it off, where the lead comes from, who it touches, what
 * happens, which campaign it enrolls them in, and when it goes out. The card
 * and the record share this block, so an automation can never describe itself
 * two different ways on two different screens.
 *
 * When, Who, and Then are always present; the other lines only render when the
 * automation actually has them, so a rule that touches no campaign never shows
 * an empty row.
 */
export function AutomationLines({
  triggerText,
  audienceText,
  actionText,
  source,
  campaignId,
  campaignName,
  timingText,
  className,
}: {
  triggerText: string;
  audienceText: string;
  actionText: string;
  source?: string | null;
  campaignId?: string | null;
  campaignName?: string | null;
  timingText?: string | null;
  className?: string;
}) {
  const lines: { label: string; content: ReactNode }[] = [
    { label: "When", content: triggerText },
  ];

  const from = sourceLabel(source ?? null);
  if (from) lines.push({ label: "From", content: from });

  lines.push({ label: "Who", content: audienceText });
  lines.push({ label: "Then", content: actionText });

  if (campaignId && campaignName) {
    lines.push({
      label: "Campaign",
      content: (
        <Link
          href={`/marketing/campaigns/${campaignId}`}
          className="font-semibold text-action hover:underline"
        >
          {campaignName}
        </Link>
      ),
    });
  }

  if (timingText) lines.push({ label: "Timing", content: timingText });

  return (
    <dl className={cn("grid grid-cols-[4.75rem_1fr] gap-x-3 gap-y-1.5", className)}>
      {lines.map((line) => (
        <Fragment key={line.label}>
          <dt className="pt-px text-label font-semibold uppercase tracking-wide text-muted">
            {line.label}
          </dt>
          <dd className="text-body text-primary">{line.content}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
