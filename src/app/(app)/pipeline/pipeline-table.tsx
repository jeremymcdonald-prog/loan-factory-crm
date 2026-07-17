import Link from "next/link";
import type { PipelineCard } from "@/lib/queries/pipeline";
import { personUrgency } from "@/lib/person-urgency";
import { money, shortDate, relativeTime } from "@/lib/format";
import { stageLabel, stageNumber, phaseOf, type Stage } from "@/lib/stages";
import { LanguageBadge } from "@/components/crm/language-badge";
import { UrgencyDot, type Urgency } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

/**
 * The power view for the moments the board can't serve: "every file with a
 * lock expiring", "oldest first". Same dataset as the board — never a second
 * source of truth (Screen 7).
 */
export function PipelineTable({ cards }: { cards: PipelineCard[] }) {
  const now = new Date();

  // Most urgent first: the table's default sort is the LO's real question.
  // Typed against Urgency so a new tone can't be added without ranking it.
  const ranked = [...cards].sort((a, b) => {
    const rank: Record<Urgency, number> = {
      critical: 0,
      warning: 1,
      info: 2,
      ally: 3,
      brand: 4,
      healthy: 5,
      neutral: 6,
    };
    const ua = personUrgency(a, now);
    const ub = personUrgency(b, now);
    const ra = rank[ua?.level ?? "neutral"];
    const rb = rank[ub?.level ?? "neutral"];
    if (ra !== rb) return ra - rb;
    return Number(b.amount ?? 0) - Number(a.amount ?? 0);
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="overflow-x-auto rounded-card border border-subtle bg-surface">
        <table className="w-full min-w-[860px] text-body">
          <caption className="sr-only">Every opportunity, most urgent first</caption>
          <thead>
            <tr className="border-b border-subtle bg-sunken text-label uppercase tracking-wide text-muted">
              <th scope="col" className="px-4 py-2 text-left font-semibold">
                Borrower
              </th>
              <th scope="col" className="px-4 py-2 text-left font-semibold">
                Stage
              </th>
              <th scope="col" className="px-4 py-2 text-left font-semibold">
                Needs attention
              </th>
              <th scope="col" className="px-4 py-2 text-right font-semibold">
                Amount
              </th>
              <th scope="col" className="px-4 py-2 text-right font-semibold">
                Lock
              </th>
              <th scope="col" className="px-4 py-2 text-right font-semibold">
                Closing
              </th>
              <th scope="col" className="px-4 py-2 text-right font-semibold">
                Last activity
              </th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((card) => {
              const urgency = personUrgency(card, now);
              const show =
                urgency?.label && urgency.level !== "healthy" && urgency.level !== "neutral";
              return (
                <tr key={card.loanId} className="border-b border-subtle last:border-0 hover:bg-sunken">
                  <td className="px-4 py-2.5">
                    <Link href={`/opportunities/${card.loanId}`} className="flex items-center gap-1.5">
                      <span className="font-semibold text-primary">
                        {card.firstName} {card.lastName}
                      </span>
                      <LanguageBadge language={card.preferredLanguage} />
                    </Link>
                    <span className="block text-small text-muted">
                      {card.program ?? "—"}
                      {card.loanNumber ? ` · ${card.loanNumber}` : ""}
                    </span>
                  </td>

                  <td className="px-4 py-2.5">
                    <span className="text-secondary">{stageLabel(card.stage as Stage)}</span>
                    <span className="block text-small text-muted tnum">
                      {stageNumber(card.stage as Stage)}/20 · {phaseOf(card.stage as Stage)}
                    </span>
                  </td>

                  <td className="px-4 py-2.5">
                    {show ? (
                      <span className="inline-flex items-center gap-1.5">
                        <UrgencyDot tone={urgency.level} />
                        <span
                          className={cn(
                            "text-small",
                            urgency.level === "critical" && "font-semibold text-critical",
                            urgency.level === "warning" && "text-warning",
                            urgency.level === "info" && "text-info",
                          )}
                        >
                          {urgency.label}
                        </span>
                      </span>
                    ) : (
                      <span className="text-small text-disabled">—</span>
                    )}
                  </td>

                  <td className="px-4 py-2.5 text-right text-secondary tnum">
                    {money(card.amount ?? card.preapprovalAmount)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-secondary tnum">
                    {shortDate(card.rateLockExpiresAt)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-secondary tnum">
                    {shortDate(card.closingDate)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-small text-muted tnum">
                    {relativeTime(card.lastActivityAt, now)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
