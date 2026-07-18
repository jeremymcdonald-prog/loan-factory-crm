import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, desc, isNull, or } from "drizzle-orm";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import {
  getPerson,
  personTimeline,
  listCampaignChoices,
  type TimelineItem,
} from "@/lib/queries/people";
import { task as taskTable } from "@/db/schema";
import { personUrgency } from "@/lib/person-urgency";
import {
  money,
  moneyCompact,
  relativeTime,
  shortDate,
  initialsOf,
  phoneNumber,
} from "@/lib/format";
import { stageLabel, phaseOf, stageNumber, type Stage } from "@/lib/stages";
import { languageName, LanguageBadge } from "@/components/crm/language-badge";
import { StageChip } from "@/components/crm/stage-chip";
import { Badge, UrgencyDot } from "@/components/ui/badge";
import { Card, SectionLabel } from "@/components/ui/card";
import { AddNoteForm } from "./add-note-form";
import { LogTouchButton } from "./log-touch-button";
import { RecordActions } from "./record-actions";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const user = await requireUser();
  const record = await queryAs(user, (db) => getPerson(db, user, id));
  if (!record) return { title: "Not found" };
  return { title: `${record.person.firstName} ${record.person.lastName}` };
}

const TYPE_LABELS: Record<string, string> = {
  lead: "Lead",
  borrower: "Borrower",
  past_client: "Past client",
  other: "Contact",
};

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const data = await queryAs(user, async (db) => {
    const record = await getPerson(db, user, id);
    if (!record) return null;

    // Sequential on purpose — one pooled client per transaction (see
    // marketing.ts, audienceSizes).
    const timeline = await personTimeline(db, user, id);
    const campaigns = await listCampaignChoices(db, user);

    const tasks = await db
      .select({
        id: taskTable.id,
        title: taskTable.title,
        dueAt: taskTable.dueAt,
        status: taskTable.status,
      })
      .from(taskTable)
      .where(
        and(
          eq(taskTable.personId, id),
          isNull(taskTable.deletedAt),
          or(eq(taskTable.status, "open"), eq(taskTable.status, "done")),
        ),
      )
      .orderBy(desc(taskTable.dueAt))
      .limit(10);

    return { ...record, timeline, campaigns, tasks };
  });

  if (!data) notFound();

  const { person, loans, leads, timeline, campaigns, tasks } = data;
  const primary = loans[0];
  const primaryLead = primary ? leads.find((l) => l.loanId === primary.id) : undefined;
  const now = new Date();
  const fullName = `${person.firstName} ${person.lastName}`;

  // Same reading as the People list — one urgency rule, every surface.
  const urgency = primary
    ? personUrgency(
        {
          stage: primary.stage as Stage,
          loanStatus: primary.status,
          rateLockExpiresAt: primary.rateLockExpiresAt,
          closingDate: primary.closingDate,
          docsNeeded: primary.docsNeeded,
          docsNeededSince: primary.docsNeededSince,
          lastActivityAt: primary.lastActivityAt,
          preapprovalExpiresAt: primary.preapprovalExpiresAt,
          capturedAt: primaryLead?.capturedAt ?? null,
          firstResponseAt: primaryLead?.firstResponseAt ?? null,
        },
        now,
      )
    : null;

  const openTasks = tasks.filter((t) => t.status === "open");

  return (
    <div className="mx-auto max-w-6xl">
      {/* Record header — the person, then what's urgent about them. */}
      <header className="border-b border-subtle px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
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
                <Badge tone="neutral">{TYPE_LABELS[person.type] ?? person.type}</Badge>
                {person.doNotContact ? <Badge tone="critical">Do not contact</Badge> : null}
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-small text-secondary">
                {person.emails?.[0]?.address ? (
                  <a
                    href={`mailto:${person.emails[0].address}`}
                    className="inline-flex items-center gap-1.5 hover:text-action"
                  >
                    <Mail className="size-3.5 text-muted" aria-hidden />
                    {person.emails[0].address}
                  </a>
                ) : null}
                {person.phones?.[0]?.number ? (
                  <a
                    href={`tel:${person.phones[0].number.replace(/\D/g, "")}`}
                    className="inline-flex items-center gap-1.5 hover:text-action"
                  >
                    <Phone className="size-3.5 text-muted" aria-hidden />
                    {phoneNumber(person.phones[0].number)}
                  </a>
                ) : null}
                {person.mailingAddress?.city ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-muted" aria-hidden />
                    {person.mailingAddress.city}, {person.mailingAddress.state}
                  </span>
                ) : null}
              </div>

              {person.tags?.length ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {person.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-sunken px-1.5 py-0.5 text-micro font-medium text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {/* One primary action on the record: log what just happened.
              Everything else — drafts, campaigns, tasks — sits beneath it. */}
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <LogTouchButton
              personId={person.id}
              personName={person.firstName}
              loanId={primary?.id ?? null}
            />
            <RecordActions
              personId={person.id}
              personName={person.firstName}
              loanId={primary?.id ?? null}
              doNotContact={person.doNotContact}
              campaigns={campaigns}
            />
          </div>
        </div>

        {urgency?.label && urgency.level !== "healthy" ? (
          <div
            className={cn(
              "mt-3 inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5",
              urgency.level === "critical" && "border-critical/25 bg-critical-bg",
              urgency.level === "warning" && "border-warning/25 bg-warning-bg",
              urgency.level === "info" && "border-info/25 bg-info-bg",
              urgency.level === "neutral" && "border-subtle bg-neutral-bg",
            )}
          >
            <UrgencyDot tone={urgency.level} />
            <span
              className={cn(
                "text-small font-semibold",
                urgency.level === "critical" && "text-critical",
                urgency.level === "warning" && "text-warning",
                urgency.level === "info" && "text-info",
                urgency.level === "neutral" && "text-neutral",
              )}
            >
              {urgency.label}
            </span>
          </div>
        ) : null}
      </header>

      <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_320px]">
        {/* Left: the story so far */}
        <div className="space-y-4">
          {primary ? (
            <Card>
              <div className="flex items-center justify-between border-b border-subtle px-4 py-3">
                <div>
                  <h2 className="text-h3 font-semibold text-primary">
                    {primary.purpose === "refinance" || primary.purpose === "cash_out_refi"
                      ? "Refinance"
                      : primary.purpose === "heloc"
                        ? "HELOC"
                        : "Purchase"}
                    {primary.program ? ` · ${primary.program}` : ""}
                  </h2>
                  <p className="mt-0.5 text-small text-muted">
                    {primary.loanNumber ? `${primary.loanNumber} · ` : ""}
                    Stage {stageNumber(primary.stage as Stage)} of 20 ·{" "}
                    {phaseOf(primary.stage as Stage)}
                  </p>
                </div>
                <Link
                  href={`/opportunities/${primary.id}`}
                  className="inline-flex items-center gap-1 text-small font-semibold text-action hover:underline"
                >
                  Open
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 p-4 sm:grid-cols-4">
                <div>
                  <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                    Stage
                  </dt>
                  <dd className="mt-1">
                    <StageChip stage={primary.stage as Stage} />
                  </dd>
                </div>
                <div>
                  <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                    Amount
                  </dt>
                  <dd className="mt-1 font-semibold text-primary tnum">
                    {money(primary.amount ?? primary.preapprovalAmount)}
                  </dd>
                </div>
                <div>
                  <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                    {primary.status === "funded" ? "Funded" : "Closing"}
                  </dt>
                  <dd className="mt-1 text-primary tnum">
                    {primary.status === "funded"
                      ? shortDate(primary.fundedAt)
                      : shortDate(primary.closingDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                    Rate lock
                  </dt>
                  <dd className="mt-1 text-primary tnum">
                    {shortDate(primary.rateLockExpiresAt)}
                  </dd>
                </div>
              </dl>

              {primary.docsNeeded && primary.docsNeededSummary ? (
                <div className="border-t border-subtle px-4 py-3">
                  <SectionLabel>Waiting on</SectionLabel>
                  <p className="mt-1 text-body text-secondary">{primary.docsNeededSummary}</p>
                  <p className="mt-1 text-small text-muted">
                    Flagged {relativeTime(primary.docsNeededSince)}. Documents are collected in
                    the loan system — this is the follow-up reminder.
                  </p>
                </div>
              ) : null}

              {primary.status === "lost" && primary.lostReason ? (
                <div className="border-t border-subtle px-4 py-3">
                  <SectionLabel>Why it ended</SectionLabel>
                  <p className="mt-1 text-body text-secondary">{primary.lostReason}</p>
                </div>
              ) : null}
            </Card>
          ) : (
            <Card>
              <div className="px-4 py-6 text-center">
                <p className="text-body font-semibold text-primary">No opportunity open</p>
                <p className="mx-auto mt-1 max-w-sm text-small text-secondary">
                  {person.firstName} is in your database as a contact. When they&rsquo;re ready
                  to buy or refinance, open an opportunity and they&rsquo;ll enter your pipeline.
                </p>
              </div>
            </Card>
          )}

          {/* Activity — the relationship's memory: notes, messages, events,
              tasks, and stage changes, one timeline, newest first. */}
          <Card>
            <div className="border-b border-subtle px-4 py-3">
              <h2 className="text-h3 font-semibold text-primary">Notes &amp; history</h2>
            </div>
            <div className="p-4">
              <AddNoteForm personId={person.id} loanId={primary?.id ?? null} />

              {timeline.length > 0 ? (
                <ol className="mt-4 space-y-3">
                  {timeline.map((item) => (
                    <TimelineEntry key={item.id} item={item} />
                  ))}
                </ol>
              ) : (
                <p className="mt-4 text-small text-muted">
                  Nothing yet. What you write here is what AI will remember.
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Right rail: what needs doing, and the facts that drive it */}
        <div className="space-y-4">
          <Card>
            <div className="border-b border-subtle px-4 py-3">
              <h2 className="text-h3 font-semibold text-primary">
                Open tasks
                {openTasks.length > 0 ? (
                  <span className="ml-1.5 text-small font-normal text-muted tnum">
                    {openTasks.length}
                  </span>
                ) : null}
              </h2>
            </div>
            <div className="p-4">
              {openTasks.length > 0 ? (
                <ul className="space-y-2.5">
                  {openTasks.map((t) => (
                    <li key={t.id} className="flex items-start gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted" aria-hidden />
                      <span className="min-w-0">
                        <span className="block text-body text-primary">{t.title}</span>
                        <span className="block text-small text-muted tnum">
                          {t.dueAt ? relativeTime(t.dueAt) : "No due date"}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-small text-muted">Nothing open for {person.firstName}.</p>
              )}
            </div>
          </Card>

          <Card>
            <div className="border-b border-subtle px-4 py-3">
              <h2 className="text-h3 font-semibold text-primary">Details</h2>
            </div>
            <dl className="space-y-3 p-4">
              <div>
                <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                  Preferred language
                </dt>
                <dd className="mt-0.5 text-body text-primary">
                  {languageName(person.preferredLanguage)}
                </dd>
              </div>
              <div>
                <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                  Where they came from
                </dt>
                <dd className="mt-0.5 text-body text-primary">
                  {(person.source as { channel?: string; detail?: string })?.detail ??
                    SOURCE_LABELS[(person.source as { channel?: string })?.channel ?? ""] ??
                    "—"}
                </dd>
              </div>
              <div>
                <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                  Added
                </dt>
                <dd className="mt-0.5 text-body text-primary tnum">
                  {relativeTime(person.createdAt)}
                </dd>
              </div>
              {loans.length > 1 ? (
                <div>
                  <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                    Earlier opportunities
                  </dt>
                  <dd className="mt-1 space-y-1">
                    {loans.slice(1).map((l) => (
                      <Link
                        key={l.id}
                        href={`/opportunities/${l.id}`}
                        className="block text-small text-action hover:underline"
                      >
                        {stageLabel(l.stage as Stage)} · {moneyCompact(l.amount)}
                      </Link>
                    ))}
                  </dd>
                </div>
              ) : null}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}

/** Tone for a timeline badge — status words map to the chip vocabulary. */
function badgeTone(badge: string): "info" | "healthy" | "critical" | "neutral" {
  if (badge === "Done") return "healthy";
  if (badge === "Failed") return "critical";
  if (badge.startsWith("Draft") || badge.startsWith("Awaiting") || badge.startsWith("Approved")) {
    return "info";
  }
  return "neutral";
}

function TimelineEntry({ item }: { item: TimelineItem }) {
  return (
    <li className="border-l-2 border-subtle pl-3">
      <p className="flex flex-wrap items-center gap-1.5">
        {item.kind !== "note" ? (
          <span className="text-small font-semibold text-primary">{item.title}</span>
        ) : null}
        {item.badge ? <Badge tone={badgeTone(item.badge)}>{item.badge}</Badge> : null}
        {item.preparedByAi ? <Badge tone="ai">AI drafted</Badge> : null}
      </p>
      {item.body ? (
        <p className="mt-0.5 line-clamp-3 whitespace-pre-wrap text-body text-secondary">
          {item.body}
        </p>
      ) : null}
      <p className="mt-1 flex flex-wrap items-center gap-1.5 text-small text-muted">
        <span>{item.actorName ?? "System"}</span>
        <span aria-hidden>·</span>
        <time dateTime={item.at.toISOString()} title={item.at.toLocaleString()}>
          {relativeTime(item.at)}
        </time>
        {item.href ? (
          <>
            <span aria-hidden>·</span>
            <Link href={item.href} className="font-medium text-action hover:underline">
              Open conversation
            </Link>
          </>
        ) : null}
      </p>
    </li>
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
