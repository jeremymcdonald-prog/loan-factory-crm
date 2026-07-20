import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { sourceLabel } from "./labels";

/**
 * The lines every automation reads as.
 *
 * No diagram and no nodes: an automation is a sentence a loan officer would say
 * out loud — what sets it off, where the lead comes from, any extra condition
 * on top of that, who it touches, who gets assigned as the owner, what
 * happens, which campaign it enrolls them in, how long before the first step
 * fires, when it goes out, what stops it partway through, and whether the
 * same person can come back through it later. The card and the record share
 * this block, so an automation can never describe itself two different ways
 * on two different screens.
 *
 * When, Who, and Then are always present; every other line only renders when
 * the automation actually has it, so a rule with no stop conditions or
 * re-entry rule never shows an empty row.
 */
export function AutomationLines({
  triggerText,
  audienceText,
  actionText,
  source,
  conditions,
  ownerAssignment,
  campaignId,
  campaignName,
  startDelayText,
  timingText,
  stopConditions,
  reentryRule,
  className,
}: {
  triggerText: string;
  audienceText: string;
  actionText: string;
  source?: string | null;
  /** Extra plain-language conditions that must hold for a lead to enroll. */
  conditions?: string | null;
  /** How the incoming lead's owner is chosen — "Round-robin" or a name. */
  ownerAssignment?: string | null;
  campaignId?: string | null;
  campaignName?: string | null;
  /** Plain-language delay before the campaign's first step fires. */
  startDelayText?: string | null;
  timingText?: string | null;
  /** What halts an in-flight enrollment before the campaign finishes. */
  stopConditions?: string | null;
  /** Whether, and when, the same person can enroll again. */
  reentryRule?: string | null;
  className?: string;
}) {
  const lines: { label: string; content: ReactNode }[] = [
    { label: "When", content: triggerText },
  ];

  const from = sourceLabel(source ?? null);
  if (from) lines.push({ label: "From", content: from });

  if (conditions) lines.push({ label: "If", content: conditions });

  lines.push({ label: "Who", content: audienceText });

  if (ownerAssignment) lines.push({ label: "Owner", content: ownerAssignment });

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

  if (startDelayText) lines.push({ label: "Start delay", content: startDelayText });
  if (timingText) lines.push({ label: "Timing", content: timingText });
  if (stopConditions) lines.push({ label: "Stops when", content: stopConditions });
  if (reentryRule) lines.push({ label: "Re-entry", content: reentryRule });

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
