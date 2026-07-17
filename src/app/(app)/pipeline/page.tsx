import type { Metadata } from "next";
import Link from "next/link";
import { Columns3, Rows3 } from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import { listPipeline, pipelineTotals } from "@/lib/queries/pipeline";
import { MACRO_PHASES, stagesIn, stageLabel, phaseOf, type Stage } from "@/lib/stages";
import { moneyCompact } from "@/lib/format";
import { PageHeader } from "@/components/shell/page-header";
import { LoanCard } from "@/components/crm/loan-card";
import { PipelineTable } from "./pipeline-table";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Pipeline" };
export const dynamic = "force-dynamic";

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view = "board" } = await searchParams;
  const user = await requireUser();

  const { cards, totals } = await queryAs(user, async (db) => ({
    cards: await listPipeline(db, user),
    totals: await pipelineTotals(db, user),
  }));

  const now = new Date();

  // Board and table are two projections of one dataset.
  const byPhase = MACRO_PHASES.map((phase) => {
    const stages = stagesIn(phase);
    const phaseCards = cards.filter((c) => phaseOf(c.stage) === phase);
    const volume = phaseCards.reduce((sum, c) => sum + Number(c.amount ?? 0), 0);
    return { phase, stages, cards: phaseCards, volume };
  });

  return (
    <>
      <PageHeader
        title="Pipeline"
        subtitle="Every opportunity, and where each one stands."
        action={
          <div className="flex rounded-md border border-subtle p-0.5">
            <Link
              href="/pipeline?view=board"
              aria-current={view === "board" ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-small font-semibold transition-colors",
                view === "board" ? "bg-action text-action-fg" : "text-secondary hover:text-primary",
              )}
            >
              <Columns3 className="size-3.5" aria-hidden />
              Board
            </Link>
            <Link
              href="/pipeline?view=table"
              aria-current={view === "table" ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-small font-semibold transition-colors",
                view === "table" ? "bg-action text-action-fg" : "text-secondary hover:text-primary",
              )}
            >
              <Rows3 className="size-3.5" aria-hidden />
              Table
            </Link>
          </div>
        }
      />

      {/* The four numbers that matter, computed from the same rows below. */}
      <div className="grid grid-cols-2 gap-px border-b border-subtle bg-subtle sm:grid-cols-4">
        {[
          { label: "Active files", value: String(totals.activeCount) },
          { label: "Active volume", value: moneyCompact(totals.activeVolume) },
          {
            label: "Funded this month",
            value: `${moneyCompact(totals.fundedMtdVolume)}`,
            meta: `${totals.fundedMtdCount} file${totals.fundedMtdCount === 1 ? "" : "s"}`,
          },
          { label: "Closing in 7 days", value: String(totals.closingNext7) },
        ].map((stat) => (
          <div key={stat.label} className="bg-canvas px-4 py-3">
            <p className="text-label font-semibold uppercase tracking-wide text-muted">
              {stat.label}
            </p>
            <p className="mt-1 text-metric-md font-semibold text-primary tnum">{stat.value}</p>
            {stat.meta ? <p className="text-small text-muted tnum">{stat.meta}</p> : null}
          </div>
        ))}
      </div>

      {cards.length === 0 ? (
        <div className="p-6">
          <div className="rounded-lg border border-subtle bg-surface px-6 py-14 text-center">
            <Columns3 className="mx-auto size-6 text-disabled" aria-hidden />
            <p className="mt-3 text-h3 font-semibold text-primary">Your pipeline is empty</p>
            <p className="mx-auto mt-1 max-w-sm text-body text-secondary">
              Add someone in People with an intent and they&rsquo;ll appear here at stage 1.
            </p>
            <Link
              href="/people"
              className="mt-4 inline-flex h-9 items-center rounded-md bg-action px-3.5 text-body font-semibold text-action-fg hover:bg-action-hover"
            >
              Go to People
            </Link>
          </div>
        </div>
      ) : view === "table" ? (
        <PipelineTable cards={cards} />
      ) : (
        /* Five macro-phase columns with drill-in, never a 20-column wall. */
        <div className="flex gap-3 overflow-x-auto p-4 sm:p-6">
          {byPhase.map(({ phase, stages, cards: phaseCards, volume }) => (
            <section key={phase} className="flex w-[280px] shrink-0 flex-col">
              <header className="mb-2 flex items-baseline justify-between gap-2 px-0.5">
                <h2 className="text-label font-semibold uppercase tracking-wide text-primary">
                  {phase}
                  <span className="ml-1.5 font-normal text-muted tnum">
                    {phaseCards.length}
                  </span>
                </h2>
                {volume > 0 ? (
                  <span className="text-small text-muted tnum">{moneyCompact(volume)}</span>
                ) : null}
              </header>

              <div className="flex-1 space-y-3 rounded-lg bg-sunken/60 p-2">
                {stages.map((stage) => {
                  const stageCards = phaseCards.filter((c) => c.stage === stage);
                  if (stageCards.length === 0) return null;
                  return (
                    <div key={stage}>
                      <p className="mb-1.5 flex items-baseline justify-between px-0.5">
                        <span className="text-small font-semibold text-secondary">
                          {stageLabel(stage as Stage)}
                        </span>
                        <span className="text-micro text-muted tnum">{stageCards.length}</span>
                      </p>
                      <div className="space-y-1.5">
                        {stageCards.map((card) => (
                          <LoanCard key={card.loanId} card={card} now={now} />
                        ))}
                      </div>
                    </div>
                  );
                })}

                {phaseCards.length === 0 ? (
                  <p className="px-1 py-6 text-center text-small text-disabled">
                    Nothing in {phase.toLowerCase()}
                  </p>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
