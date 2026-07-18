import Link from "next/link";
import { personUrgency } from "@/lib/person-urgency";
import { money, shortDate, relativeTime } from "@/lib/format";
import { stageLabel, stageNumber, type Stage } from "@/lib/stages";
import { LanguageBadge } from "@/components/crm/language-badge";
import { UrgencyDot, type Urgency } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import {
  channelLabel,
  recordHref,
  recordLastActivity,
  type PipelineRecord,
} from "./views";

/**
 * The power view for the moments the board can't serve: "every file with a
 * lock expiring", "oldest first". Same dataset as the board — never a second
 * source of truth (Screen 7).
 */
export function PipelineTable({ records }: { records: PipelineRecord[] }) {
  const now = new Date();

  // Most urgent first: the table's default sort is the LO's real question.
  // Typed against Urgency so a new tone can't be added without ranking it.
  const rank: Record<Urgency, number> = {
    critical: 0,
    warning: 1,
    info: 2,
    ai: 3,
    brand: 4,
    healthy: 5,
    neutral: 6,
  };
  const urgencyOf = (r: PipelineRecord) =>
    r.kind === "loan" ? personUrgency(r.card, now) : null;

  const ranked = [...records].sort((a, b) => {
    const ra = rank[urgencyOf(a)?.level ?? "neutral"];
    const rb = rank[urgencyOf(b)?.level ?? "neutral"];
    if (ra !== rb) return ra - rb;
    const amountOf = (r: PipelineRecord) =>
      r.kind === "loan" ? Number(r.card.amount ?? r.card.preapprovalAmount ?? 0) : 0;
    return amountOf(b) - amountOf(a);
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="overflow-x-auto rounded-card border border-subtle bg-surface">
        <table className="w-full min-w-[1080px] text-body">
          <caption className="sr-only">Every record in this view, most urgent first</caption>
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
              <th scope="col" className="px-4 py-2 text-left font-semibold">
                Owner
              </th>
              <th scope="col" className="px-4 py-2 text-left font-semibold">
                Source
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
            {ranked.map((record) => {
              const urgency = urgencyOf(record);
              const show =
                urgency?.label && urgency.level !== "healthy" && urgency.level !== "neutral";
              const key =
                record.kind === "loan" ? record.card.loanId : record.card.personId;
              const loan = record.kind === "loan" ? record.card : null;

              return (
                <tr key={key} className="border-b border-subtle last:border-0 hover:bg-sunken">
                  <td className="px-4 py-2.5">
                    <Link href={recordHref(record)} className="flex items-center gap-1.5">
                      <span className="font-semibold text-primary">
                        {record.card.firstName} {record.card.lastName}
                      </span>
                      <LanguageBadge language={record.card.preferredLanguage} />
                    </Link>
                    <span className="block text-small text-muted">
                      {loan
                        ? `${loan.program ?? "—"}${loan.loanNumber ? ` · ${loan.loanNumber}` : ""}`
                        : "No file yet"}
                    </span>
                  </td>

                  <td className="px-4 py-2.5">
                    {loan ? (
                      <>
                        <span className="text-secondary">{stageLabel(loan.stage as Stage)}</span>
                        <span className="block text-small text-muted tnum">
                          {stageNumber(loan.stage as Stage)}/20
                        </span>
                      </>
                    ) : (
                      <span className="text-small text-muted">No file yet</span>
                    )}
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

                  <td className="px-4 py-2.5 text-small text-secondary">
                    {record.card.ownerName ?? "—"}
                  </td>

                  <td className="px-4 py-2.5 text-small text-secondary">
                    {record.card.leadChannel ? channelLabel(record.card.leadChannel) : "—"}
                  </td>

                  <td className="px-4 py-2.5 text-right text-secondary tnum">
                    {loan ? money(loan.amount ?? loan.preapprovalAmount) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right text-secondary tnum">
                    {loan ? shortDate(loan.rateLockExpiresAt) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right text-secondary tnum">
                    {loan ? shortDate(loan.closingDate) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right text-small text-muted tnum">
                    {relativeTime(recordLastActivity(record), now)}
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
