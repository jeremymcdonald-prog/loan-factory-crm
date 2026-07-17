/**
 * LoanCard — one opportunity on the Pipeline board.
 *
 * Dense but calm: the person, the money, and the one thing that needs a human.
 * Urgency is the only colour (Design_System §4.4).
 */
import Link from "next/link";
import { moneyCompact, relativeTime } from "@/lib/format";
import { personUrgency } from "@/lib/person-urgency";
import type { PipelineCard } from "@/lib/queries/pipeline";
import { LanguageBadge } from "@/components/crm/language-badge";
import { UrgencyDot } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

export function LoanCard({ card, now }: { card: PipelineCard; now: Date }) {
  const urgency = personUrgency(card, now);
  const showUrgency =
    urgency?.label && urgency.level !== "healthy" && urgency.level !== "neutral";

  return (
    <Link
      href={`/opportunities/${card.loanId}`}
      className={cn(
        "block rounded-md border bg-surface p-2.5 transition-colors hover:border-strong",
        showUrgency && urgency.level === "critical"
          ? "border-critical/40"
          : "border-subtle",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-body font-semibold text-primary">
            {card.firstName} {card.lastName}
          </span>
          <LanguageBadge language={card.preferredLanguage} />
        </span>
        <span className="shrink-0 text-small font-semibold text-secondary tnum">
          {moneyCompact(card.amount ?? card.preapprovalAmount)}
        </span>
      </div>

      <p className="mt-0.5 truncate text-small text-muted">
        {card.program ?? "—"}
        {card.loanNumber ? ` · ${card.loanNumber}` : ""}
      </p>

      {showUrgency ? (
        <p className="mt-1.5 flex items-center gap-1.5">
          <UrgencyDot tone={urgency.level} />
          <span
            className={cn(
              "truncate text-small",
              urgency.level === "critical" && "font-semibold text-critical",
              urgency.level === "warning" && "text-warning",
              urgency.level === "info" && "text-info",
            )}
          >
            {urgency.label}
          </span>
        </p>
      ) : (
        <p className="mt-1.5 text-small text-muted tnum">
          {relativeTime(card.lastActivityAt, now)}
        </p>
      )}
    </Link>
  );
}
