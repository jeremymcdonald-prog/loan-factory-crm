import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, desc, isNull } from "drizzle-orm";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import {
  loan as loanTable,
  person as personTable,
  user as userTable,
  loanStageHistory,
  note as noteTable,
  lead as leadTable,
} from "@/db/schema";
import { personUrgency } from "@/lib/person-urgency";
import { money, shortDate, relativeTime, initialsOf } from "@/lib/format";
import { stageLabel, stageNumber, phaseOf, type Stage } from "@/lib/stages";
import { StageRail } from "@/components/crm/stage-rail";
import { LanguageBadge } from "@/components/crm/language-badge";
import { Badge, UrgencyDot } from "@/components/ui/badge";
import { Card, SectionLabel } from "@/components/ui/card";
import { StageControl } from "./stage-control";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const user = await requireUser();
  const row = await queryAs(user, async (db) => {
    const [r] = await db
      .select({ first: personTable.firstName, last: personTable.lastName })
      .from(loanTable)
      .innerJoin(personTable, eq(personTable.id, loanTable.personId))
      .where(eq(loanTable.id, id))
      .limit(1);
    return r;
  });
  return { title: row ? `${row.first} ${row.last} — opportunity` : "Not found" };
}

const PURPOSE_LABELS: Record<string, string> = {
  purchase: "Purchase",
  refinance: "Refinance",
  cash_out_refi: "Cash-out refinance",
  heloc: "HELOC",
  construction: "Construction",
  other: "Other",
};

export default async function OpportunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const data = await queryAs(user, async (db) => {
    const [row] = await db
      .select({
        loan: loanTable,
        person: personTable,
        lo: { fullName: userTable.fullName, nmls: userTable.nmlsId },
      })
      .from(loanTable)
      .innerJoin(personTable, eq(personTable.id, loanTable.personId))
      .leftJoin(userTable, eq(userTable.id, loanTable.loUserId))
      .where(and(eq(loanTable.id, id), isNull(loanTable.deletedAt)))
      .limit(1);

    if (!row) return null;

    const history = await db
      .select({
        id: loanStageHistory.id,
        fromStage: loanStageHistory.fromStage,
        toStage: loanStageHistory.toStage,
        createdAt: loanStageHistory.createdAt,
        note: loanStageHistory.note,
        byName: userTable.fullName,
      })
      .from(loanStageHistory)
      .leftJoin(userTable, eq(userTable.id, loanStageHistory.changedByUserId))
      .where(eq(loanStageHistory.loanId, id))
      .orderBy(desc(loanStageHistory.createdAt))
      .limit(30);

    const notes = await db
      .select({
        id: noteTable.id,
        body: noteTable.body,
        createdAt: noteTable.createdAt,
        authorName: userTable.fullName,
      })
      .from(noteTable)
      .leftJoin(userTable, eq(userTable.id, noteTable.authorUserId))
      .where(and(eq(noteTable.loanId, id), isNull(noteTable.deletedAt)))
      .orderBy(desc(noteTable.createdAt))
      .limit(10);

    const [leadRow] = await db
      .select()
      .from(leadTable)
      .where(eq(leadTable.loanId, id))
      .limit(1);

    return { ...row, history, notes, lead: leadRow };
  });

  if (!data) notFound();

  const { loan, person, lo, history, notes, lead } = data;
  const stage = loan.stage as Stage;
  const now = new Date();
  const fullName = `${person.firstName} ${person.lastName}`;

  const urgency = personUrgency(
    {
      stage,
      loanStatus: loan.status,
      rateLockExpiresAt: loan.rateLockExpiresAt,
      closingDate: loan.closingDate,
      docsNeeded: loan.docsNeeded,
      docsNeededSince: loan.docsNeededSince,
      lastActivityAt: loan.lastActivityAt,
      preapprovalExpiresAt: loan.preapprovalExpiresAt,
      capturedAt: lead?.capturedAt ?? null,
      firstResponseAt: lead?.firstResponseAt ?? null,
    },
    now,
  );

  const facts = [
    { label: "Loan amount", value: money(loan.amount) },
    { label: "Preapproved for", value: money(loan.preapprovalAmount) },
    { label: "Rate lock expires", value: shortDate(loan.rateLockExpiresAt) },
    { label: "Closing date", value: shortDate(loan.closingDate) },
    { label: "Program", value: loan.program ?? "—" },
    { label: "Lender", value: loan.lenderName ?? "—" },
    {
      label: "Property",
      value: loan.propertyAddress?.city
        ? `${loan.propertyAddress.city}, ${loan.propertyAddress.state ?? ""}`
        : "—",
    },
    { label: "File number", value: loan.loanNumber ?? "—" },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <header className="border-b border-subtle px-4 py-4 sm:px-6">
        <Link
          href={`/people/${person.id}`}
          className="inline-flex items-center gap-1 text-small text-muted hover:text-action"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back to {person.firstName}
        </Link>

        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-sunken text-h3 font-semibold text-secondary">
              {initialsOf(fullName)}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-h1 font-semibold tracking-tight text-primary">
                  {fullName}
                </h1>
                <LanguageBadge language={person.preferredLanguage} />
                {loan.status !== "active" ? (
                  <Badge tone={loan.status === "funded" ? "healthy" : "neutral"}>
                    {loan.status === "funded" ? "Funded" : "Lost"}
                  </Badge>
                ) : null}
              </div>
              <p className="mt-1 text-body text-secondary">
                {PURPOSE_LABELS[loan.purpose ?? "other"]}
                {loan.program ? ` · ${loan.program}` : ""}
                {loan.amount ? ` · ${money(loan.amount)}` : ""}
                {loan.loanNumber ? ` · ${loan.loanNumber}` : ""}
              </p>
            </div>
          </div>

          {loan.status === "active" ? (
            <StageControl loanId={loan.id} current={stage} />
          ) : null}
        </div>

        {/* Where this relationship stands, across the 20 stages */}
        <div className="mt-5">
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <p className="text-small font-semibold text-primary">
              Stage {stageNumber(stage)} of 20 · {stageLabel(stage)}
              <span className="ml-1.5 font-normal text-muted">{phaseOf(stage)}</span>
            </p>
            {urgency?.label && urgency.level !== "healthy" ? (
              <span className="inline-flex items-center gap-1.5">
                <UrgencyDot tone={urgency.level} />
                <span
                  className={cn(
                    "text-small font-semibold",
                    urgency.level === "critical" && "text-critical",
                    urgency.level === "warning" && "text-warning",
                    urgency.level === "info" && "text-info",
                    urgency.level === "neutral" && "text-muted",
                  )}
                >
                  {urgency.label}
                </span>
              </span>
            ) : null}
          </div>
          <StageRail current={stage} />
        </div>
      </header>

      <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Card>
            <div className="border-b border-subtle px-4 py-3">
              <h2 className="text-h3 font-semibold text-primary">The file</h2>
              <p className="mt-0.5 text-small text-muted">
                What your team recorded. The loan itself lives in your loan system — this is
                what the CRM needs to time the right follow-up.
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 p-4 sm:grid-cols-4">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                    {f.label}
                  </dt>
                  <dd className="mt-1 text-body font-semibold text-primary tnum">{f.value}</dd>
                </div>
              ))}
            </dl>

            {loan.docsNeeded ? (
              <div className="border-t border-subtle bg-warning-bg/40 px-4 py-3">
                <SectionLabel className="text-warning">Waiting on the borrower</SectionLabel>
                <p className="mt-1 text-body text-primary">
                  {loan.docsNeededSummary ?? "Documents outstanding"}
                </p>
                <p className="mt-0.5 text-small text-muted">
                  Flagged {relativeTime(loan.docsNeededSince)} · collected in your loan system,
                  chased from here.
                </p>
              </div>
            ) : null}

            {loan.applicationLink ? (
              <div className="border-t border-subtle px-4 py-3">
                <a
                  href={loan.applicationLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-small font-semibold text-action hover:underline"
                >
                  Application link
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
                <p className="mt-0.5 text-small text-muted">
                  Opens your application site. The CRM never hosts an application.
                </p>
              </div>
            ) : null}
          </Card>

          <Card>
            <div className="border-b border-subtle px-4 py-3">
              <h2 className="text-h3 font-semibold text-primary">Stage history</h2>
            </div>
            <ol className="p-4">
              {history.map((h, i) => (
                <li
                  key={h.id}
                  className={cn(
                    "flex items-start gap-3 border-l-2 pl-3",
                    i === 0 ? "border-action" : "border-subtle",
                    i < history.length - 1 && "pb-3",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-body text-primary">
                      {h.fromStage ? (
                        <>
                          <span className="text-muted">
                            {stageLabel(h.fromStage as Stage)}
                          </span>
                          <span className="mx-1.5 text-muted" aria-label="to">
                            →
                          </span>
                        </>
                      ) : (
                        <span className="text-muted">Opened at </span>
                      )}
                      <span className="font-semibold">{stageLabel(h.toStage as Stage)}</span>
                    </p>
                    {h.note ? (
                      <p className="mt-0.5 text-small text-secondary">{h.note}</p>
                    ) : null}
                    <p className="mt-0.5 text-small text-muted">
                      {h.byName ?? "Someone"} ·{" "}
                      <time dateTime={h.createdAt.toISOString()} title={h.createdAt.toLocaleString()}>
                        {relativeTime(h.createdAt)}
                      </time>
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="border-b border-subtle px-4 py-3">
              <h2 className="text-h3 font-semibold text-primary">Who&rsquo;s on it</h2>
            </div>
            <dl className="space-y-3 p-4">
              <div>
                <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                  Loan officer
                </dt>
                <dd className="mt-0.5 text-body text-primary">
                  {lo?.fullName ?? "Unassigned"}
                  {lo?.nmls ? (
                    <span className="ml-1.5 text-small text-muted tnum">NMLS #{lo.nmls}</span>
                  ) : null}
                </dd>
              </div>
              {lead ? (
                <>
                  <div>
                    <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                      How it started
                    </dt>
                    <dd className="mt-0.5 text-body text-primary">
                      {SOURCE_LABELS[lead.source?.channel ?? ""] ?? lead.source?.channel ?? "—"}
                      {lead.source?.campaign ? (
                        <span className="block text-small text-muted">
                          {lead.source.campaign}
                        </span>
                      ) : null}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                      Captured
                    </dt>
                    <dd className="mt-0.5 text-body text-primary tnum">
                      {relativeTime(lead.capturedAt)}
                    </dd>
                  </div>
                  {lead.statedPriceRange ? (
                    <div>
                      <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                        They said they&rsquo;re looking at
                      </dt>
                      <dd className="mt-0.5 text-body text-primary tnum">
                        {lead.statedPriceRange}
                      </dd>
                    </div>
                  ) : null}
                </>
              ) : null}
            </dl>
          </Card>

          <Card>
            <div className="border-b border-subtle px-4 py-3">
              <h2 className="text-h3 font-semibold text-primary">Recent notes</h2>
            </div>
            <div className="p-4">
              {notes.length ? (
                <ol className="space-y-3">
                  {notes.map((n) => (
                    <li key={n.id}>
                      <p className="line-clamp-3 text-small text-secondary">{n.body}</p>
                      <p className="mt-0.5 text-small text-muted">
                        {n.authorName ?? "Someone"} · {relativeTime(n.createdAt)}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-small text-muted">No notes on this file yet.</p>
              )}
              <Link
                href={`/people/${person.id}`}
                className="mt-3 inline-block text-small font-semibold text-action hover:underline"
              >
                Add a note on {person.firstName}
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const SOURCE_LABELS: Record<string, string> = {
  facebook_ads: "Facebook ad",
  lf_website: "Loan Factory website",
  qm_pricer: "QM Pricer rate alert",
  partner_referral: "Partner referral",
  manual: "Added by hand",
  csv_import: "Imported",
};
