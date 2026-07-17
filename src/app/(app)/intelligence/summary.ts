/**
 * AI's reading of the report.
 *
 * Every sentence is built from the counts on this page. AI is not asked to
 * guess here and nothing is hardcoded: if a finding does not fire, its sentence
 * never appears. If the book is genuinely quiet the summary says so plainly
 * rather than manufacturing something to worry about.
 *
 * This is AI reading numbers back to a human. It proposes nothing and it
 * contacts nobody, so there is no approval to give (Decisions D-11).
 */
import type { IntelligenceReport } from "@/lib/queries/intelligence";
import { durationLabel } from "./report-ui";

function count(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** The two or three things worth saying, worst first. */
export function aiSummary(report: IntelligenceReport): string[] {
  const { leads, followUp, stale, partners } = report;
  const lines: string[] = [];

  if (leads.uncontactedCount > 0) {
    const waiting = count(leads.uncontactedCount, "lead is", "leads are");
    lines.push(
      leads.oldestUncontactedHours !== null
        ? `${waiting} still waiting on a first call; the oldest has been waiting ${durationLabel(
            leads.oldestUncontactedHours * 60,
          )}.`
        : `${waiting} still waiting on a first call.`,
    );
  }

  if (followUp.overdueCount > 0) {
    lines.push(
      `${count(followUp.overdueCount, "follow-up is", "follow-ups are")} past due out of ${count(
        followUp.openCount,
        "open task",
        "open tasks",
      )}.`,
    );
  }

  if (stale.totalStale > 0) {
    const longest = stale.rows[0];
    lines.push(
      longest
        ? `${count(
            stale.totalStale,
            "active file has",
            "active files have",
          )} gone quiet past the limit for their stage — the longest is ${
            longest.personName
          } at ${Math.floor(longest.idleDays)} days.`
        : `${count(stale.totalStale, "active file has", "active files have")} gone quiet past the limit for their stage.`,
    );
  }

  if (partners.quietCount > 0) {
    lines.push(
      `${count(
        partners.quietCount,
        "referral partner has",
        "referral partners have",
      )} had no recorded touch in 60 days or more.`,
    );
  }

  if (lines.length === 0) {
    // Nothing fired, and there is real data behind that — say the good news.
    lines.push(
      "Nothing is waiting on a first call, no follow-up is past due, and no active file has gone quiet.",
    );
    if (leads.answeredCount > 0 && leads.medianMinutes !== null) {
      lines.push(
        `Leads are getting a first answer in ${durationLabel(leads.medianMinutes)} at the median.`,
      );
    }
  }

  return lines.slice(0, 3);
}
