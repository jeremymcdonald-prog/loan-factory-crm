import type { Metadata } from "next";
import { sql } from "drizzle-orm";
import { ShieldCheck } from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import { aiInsight, template } from "@/db/schema";
import { PageHeader } from "@/components/shell/page-header";
import { Card, SectionLabel } from "@/components/ui/card";
import { AllyMark } from "@/components/ally/ally-card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Ally" };
export const dynamic = "force-dynamic";

/** The safe-automation ladder, in plain language (Automation_Catalog §1). */
const TIERS = [
  {
    tier: "t0",
    name: "Never automated",
    tone: "critical" as const,
    what: "Ally drafts nothing at all. It only makes sure you know.",
    topics:
      "Rate locks, cash-to-close changes, payment changes, closing delays, and problem files.",
  },
  {
    tier: "t1",
    name: "Runs on its own",
    tone: "healthy" as const,
    what: "Internal work only — a task, a flag, a note. Nothing a borrower ever sees.",
    topics: "Flagging a quiet file, creating a call reminder, scoring a lead.",
  },
  {
    tier: "t2",
    name: "Ally prepares, you approve",
    tone: "ally" as const,
    what: "Ally writes the draft. It waits for your tap. This is the ceiling for anything a borrower or partner will read.",
    topics: "Document reminders, milestone updates, anniversary notes, partner check-ins.",
  },
  {
    tier: "t3",
    name: "Fully automatic",
    tone: "neutral" as const,
    what: "Not switched on. Reserved for a later phase, and never for borrower-facing messages in this version.",
    topics: "Nothing today.",
  },
];

export default async function AllySettingsPage() {
  const user = await requireUser();

  const { verdicts, policies } = await queryAs(user, async (db) => {
    const verdictRows = await db
      .select({ status: aiInsight.status, value: sql<number>`count(*)::int` })
      .from(aiInsight)
      .groupBy(aiInsight.status);

    const policyRows = await db
      .select({ policy: template.policy, value: sql<number>`count(*)::int` })
      .from(template)
      .groupBy(template.policy);

    return { verdicts: verdictRows, policies: policyRows };
  });

  const count = (s: string) => verdicts.find((v) => v.status === s)?.value ?? 0;
  const approved = count("approved") + count("edited_approved");
  const rejected = count("rejected");
  const decided = approved + rejected;
  const approvalRate = decided > 0 ? Math.round((approved / decided) * 100) : null;

  const policyCount = (p: string) => policies.find((x) => x.policy === p)?.value ?? 0;

  return (
    <>
      <PageHeader
        title="Ally"
        subtitle="What Ally may prepare, and what always needs a person."
      />

      <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
        <div className="flex items-start gap-2.5 rounded-lg border border-ally-border bg-ally-bg/40 px-4 py-3">
          <AllyMark className="mt-0.5" />
          <div>
            <p className="text-body font-semibold text-primary">
              Ally prepares. You approve.
            </p>
            <p className="mt-0.5 text-small text-secondary">
              No message Ally writes reaches a borrower or a partner without a person tapping
              approve. That is not a setting — it is how the product is built, and it cannot be
              turned off in this version.
            </p>
          </div>
        </div>

        <Card>
          <div className="border-b border-subtle px-4 py-3">
            <h2 className="text-h3 font-semibold text-primary">How much Ally is trusted with</h2>
            <p className="mt-0.5 text-small text-muted">
              Every automation and every draft sits at one of these levels.
            </p>
          </div>
          <ul className="divide-y divide-subtle">
            {TIERS.map((t) => (
              <li key={t.tier} className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={t.tone}>{t.name}</Badge>
                </div>
                <p className="mt-1.5 text-body text-secondary">{t.what}</p>
                <p className="mt-0.5 text-small text-muted">{t.topics}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="border-b border-subtle px-4 py-3">
            <h2 className="text-h3 font-semibold text-primary">Is Ally any good?</h2>
            <p className="mt-0.5 text-small text-muted">
              The only honest measure is what you do with what it prepares.
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-px bg-subtle">
            <div className="bg-surface px-4 py-3">
              <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                Approved
              </dt>
              <dd className="mt-1 text-metric-md font-semibold text-primary tnum">{approved}</dd>
            </div>
            <div className="bg-surface px-4 py-3">
              <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                Skipped
              </dt>
              <dd className="mt-1 text-metric-md font-semibold text-primary tnum">{rejected}</dd>
            </div>
            <div className="bg-surface px-4 py-3">
              <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                Approval rate
              </dt>
              <dd className="mt-1 text-metric-md font-semibold text-primary tnum">
                {approvalRate === null ? "—" : `${approvalRate}%`}
              </dd>
            </div>
          </dl>
          {approvalRate === null ? (
            <p className="px-4 py-2.5 text-small text-muted">
              Nothing has been decided yet. Once you approve or skip a few of Ally&rsquo;s
              drafts, this will tell you whether it is earning its place.
            </p>
          ) : null}
        </Card>

        <Card>
          <div className="border-b border-subtle px-4 py-3">
            <h2 className="text-h3 font-semibold text-primary">The template library</h2>
            <p className="mt-0.5 text-small text-muted">
              Ally drafts from your mortgage templates, never from a blank page.
            </p>
          </div>
          <ul className="divide-y divide-subtle">
            {[
              {
                label: "Ally can prepare these",
                n: policyCount("semi_automated"),
                hint: "It writes the draft; you approve before it sends.",
              },
              {
                label: "Can run automatically",
                n: policyCount("fully_automated"),
                hint: "Still approval-queued in this version — trust is earned first.",
              },
              {
                label: "Write it yourself",
                n: policyCount("manual_only"),
                hint: "Ally offers the template as a reference and nothing more.",
              },
              {
                label: "Never automated",
                n: policyCount("never_automate"),
                hint: "Rate locks, delays, problem files. Ally drafts nothing here.",
              },
            ].map((row) => (
              <li key={row.label} className="flex items-baseline gap-3 px-4 py-2.5">
                <span className="w-8 shrink-0 text-body font-semibold text-primary tnum">
                  {row.n}
                </span>
                <span className="min-w-0">
                  <span className="block text-body text-primary">{row.label}</span>
                  <span className="block text-small text-muted">{row.hint}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex items-start gap-2.5 p-4">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
            <div>
              <SectionLabel>What Ally is never allowed to do</SectionLabel>
              <ul className="mt-1.5 space-y-1 text-small text-secondary">
                <li>Send anything to a borrower or partner on its own.</li>
                <li>Decide anything about a loan — it does not approve, price, or underwrite.</li>
                <li>
                  Use anything about who a person is when it scores or ranks. Only what they
                  did and where the file stands.
                </li>
                <li>Quote a rate, promise an approval, or state a saving it cannot show.</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
