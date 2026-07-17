import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone, Building2, ArrowRight, Handshake, MessagesSquare } from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import {
  getPartner,
  partnerHealth,
  QUIET_AFTER_DAYS,
  CHECKIN_APPROVED,
  type PartnerReferral,
} from "@/lib/queries/partners";
import { money, moneyCompact, relativeTime, initialsOf, phoneNumber } from "@/lib/format";
import { stageLabel, type Stage } from "@/lib/stages";
import { StageChip } from "@/components/crm/stage-chip";
import { LanguageBadge, languageName } from "@/components/crm/language-badge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AICard, AIAttribution } from "@/components/ai/ai-card";
import { LogTouchButton } from "./log-touch-button";
import { PartnerNotesForm } from "./partner-notes-form";
import { CheckinActions } from "./checkin-actions";
import { PARTNER_KIND_LABELS, PARTNER_TIER_LABELS, CHANNEL_LABELS } from "../vocabulary";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const user = await requireUser();
  const record = await queryAs(user, (db) => getPartner(db, user, id));
  if (!record) return { title: "Not found" };
  return { title: `${record.partner.firstName} ${record.partner.lastName}` };
}

export default async function PartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const data = await queryAs(user, (db) => getPartner(db, user, id));
  if (!data) notFound();

  const { partner, referrals, messages, verdict } = data;
  const now = new Date();
  const fullName = `${partner.firstName} ${partner.lastName}`;
  const health = partnerHealth(partner.tier, partner.lastTouchAt, now);

  const referredVolume = referrals.reduce((sum, r) => sum + Number(r.amount ?? 0), 0);
  const withoutAmount = referrals.filter((r) => r.loanId && !r.amount).length;

  // AI's suggestion is settled once you've given it a verdict on this stretch
  // of silence. Logging a touch moves the clock, and the question starts over.
  const settled =
    verdict !== null &&
    partner.lastTouchAt !== null &&
    verdict.createdAt.getTime() > partner.lastTouchAt.getTime();

  const quietDays = health.quietDays;
  const suggestion =
    quietDays !== null && !settled
      ? buildCheckin(partner.firstName, fullName, partner.tier, quietDays, referrals, referredVolume, now)
      : null;

  return (
    <div className="mx-auto max-w-6xl">
      {/* Record header — who they are, and how the relationship is doing. */}
      <header className="border-b border-subtle px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-sunken text-h3 font-semibold text-secondary">
              {initialsOf(fullName)}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-h1 font-semibold tracking-tight text-primary">{fullName}</h1>
                <LanguageBadge language={partner.preferredLanguage} />
                <Badge tone="neutral">{PARTNER_KIND_LABELS[partner.kind] ?? partner.kind}</Badge>
                <Badge tone={health.level}>{health.label}</Badge>
                {partner.doNotContact ? <Badge tone="critical">Do not contact</Badge> : null}
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-small text-secondary">
                {partner.company ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="size-3.5 text-muted" aria-hidden />
                    {partner.company}
                  </span>
                ) : null}
                {partner.emails?.[0]?.address ? (
                  <a
                    href={`mailto:${partner.emails[0].address}`}
                    className="inline-flex items-center gap-1.5 hover:text-action"
                  >
                    <Mail className="size-3.5 text-muted" aria-hidden />
                    {partner.emails[0].address}
                  </a>
                ) : null}
                {partner.phones?.[0]?.number ? (
                  <a
                    href={`tel:${partner.phones[0].number.replace(/\D/g, "")}`}
                    className="inline-flex items-center gap-1.5 hover:text-action"
                  >
                    <Phone className="size-3.5 text-muted" aria-hidden />
                    {phoneNumber(partner.phones[0].number)}
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          {/* One primary action on the record: say what just happened. */}
          <LogTouchButton partnerId={partner.id} partnerName={partner.firstName} />
        </div>
      </header>

      {/* The three numbers that describe a referral relationship. */}
      <div className="grid grid-cols-3 gap-px border-b border-subtle bg-subtle">
        {[
          {
            label: "Referrals",
            value: String(referrals.length),
          },
          {
            label: "Referred volume",
            value: moneyCompact(referredVolume),
            meta:
              withoutAmount > 0
                ? `${withoutAmount} file${withoutAmount === 1 ? "" : "s"} without an amount yet`
                : undefined,
          },
          {
            label: "Last touch",
            value: partner.lastTouchAt ? relativeTime(partner.lastTouchAt, now) : "None logged",
          },
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

      <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_320px]">
        {/* Left: what this relationship has actually produced */}
        <div className="space-y-4">
          <Card>
            <div className="border-b border-subtle px-4 py-3">
              <h2 className="text-h3 font-semibold text-primary">
                Referrals
                {referrals.length > 0 ? (
                  <span className="ml-1.5 text-small font-normal text-muted tnum">
                    {referrals.length}
                  </span>
                ) : null}
              </h2>
            </div>

            {referrals.length > 0 ? (
              <table className="w-full text-body">
                <caption className="sr-only">People {fullName} sent you</caption>
                <thead>
                  <tr className="border-b border-subtle bg-sunken text-label uppercase tracking-wide text-muted">
                    <th scope="col" className="px-4 py-2 text-left font-semibold">
                      Who
                    </th>
                    <th
                      scope="col"
                      className="hidden px-4 py-2 text-left font-semibold sm:table-cell"
                    >
                      Stage
                    </th>
                    <th scope="col" className="px-4 py-2 text-right font-semibold">
                      Amount
                    </th>
                    <th scope="col" className="px-4 py-2 text-right font-semibold">
                      <span className="sr-only">Open the file</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((r) => (
                    <tr key={r.id} className="border-b border-subtle last:border-0 hover:bg-sunken">
                      <td className="px-4 py-2.5">
                        {r.personId && r.firstName ? (
                          <Link
                            href={`/people/${r.personId}`}
                            className="font-semibold text-primary hover:text-action"
                          >
                            {r.firstName} {r.lastName}
                          </Link>
                        ) : (
                          <span className="text-secondary">Someone no longer in your book</span>
                        )}
                        <span className="block text-small text-muted tnum">
                          Referred {relativeTime(r.referredAt, now)}
                        </span>
                      </td>

                      <td className="hidden px-4 py-2.5 sm:table-cell">
                        {r.stage ? (
                          <StageChip stage={r.stage as Stage} />
                        ) : (
                          <span className="text-small text-muted">No opportunity</span>
                        )}
                      </td>

                      <td className="px-4 py-2.5 text-right text-secondary tnum">
                        {money(r.amount)}
                      </td>

                      <td className="px-4 py-2.5 text-right">
                        {r.loanId ? (
                          <Link
                            href={`/opportunities/${r.loanId}`}
                            className="inline-flex items-center gap-1 text-small font-semibold text-action hover:underline"
                          >
                            Open
                            <ArrowRight className="size-3.5" aria-hidden />
                          </Link>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-4 py-10 text-center">
                <Handshake className="mx-auto size-5 text-disabled" aria-hidden />
                <p className="mt-2 text-body font-semibold text-primary">No referrals yet</p>
                <p className="mx-auto mt-1 max-w-sm text-small text-secondary">
                  When {partner.firstName} sends you someone, their file shows up here with its
                  stage and its amount.
                </p>
              </div>
            )}
          </Card>

          {/* Contact history — what you've actually said to each other */}
          <Card>
            <div className="border-b border-subtle px-4 py-3">
              <h2 className="text-h3 font-semibold text-primary">Contact history</h2>
            </div>
            <div className="p-4">
              {messages.length > 0 ? (
                <ol className="space-y-3">
                  {messages.map((m) => (
                    <li key={m.id} className="border-l-2 border-subtle pl-3">
                      {m.subject ? (
                        <p className="text-small font-semibold text-primary">{m.subject}</p>
                      ) : null}
                      <p className="mt-0.5 whitespace-pre-wrap text-body text-secondary">
                        {m.body}
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-1.5 text-small text-muted">
                        <span>
                          {m.direction === "inbound"
                            ? partner.firstName
                            : (m.authorName ?? "You")}
                        </span>
                        <span aria-hidden>·</span>
                        <span>{CHANNEL_LABELS[m.channel] ?? m.channel}</span>
                        <span aria-hidden>·</span>
                        <time
                          dateTime={m.occurredAt.toISOString()}
                          title={m.occurredAt.toLocaleString()}
                          className="tnum"
                        >
                          {relativeTime(m.occurredAt, now)}
                        </time>
                        {m.preparedByAi ? <Badge tone="ai">AI drafted</Badge> : null}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="py-6 text-center">
                  <MessagesSquare className="mx-auto size-5 text-disabled" aria-hidden />
                  <p className="mt-2 text-body font-semibold text-primary">Nothing logged yet</p>
                  <p className="mx-auto mt-1 max-w-sm text-small text-secondary">
                    Log a touch after your next call or email with {partner.firstName} and it will
                    be here.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right rail: what AI noticed, and what you know about them */}
        <div className="space-y-4">
          {suggestion && quietDays !== null ? (
            <AICard
              title={suggestion.title}
              rationale={suggestion.rationale}
              factors={suggestion.factors}
              actions={<CheckinActions partnerId={partner.id} quietDays={quietDays} />}
            >
              <p className="text-small text-secondary">
                AI hasn&rsquo;t written anything to send. Approving puts the reach-out on your
                task list so you can make it in your own words.
              </p>
            </AICard>
          ) : null}

          {settled && verdict ? (
            <Card>
              <div className="px-4 py-3">
                <AIAttribution />
                <p className="mt-1.5 text-small text-secondary">
                  {verdict.kind === CHECKIN_APPROVED
                    ? `You approved AI's check-in suggestion ${relativeTime(verdict.createdAt, now)} and it went on your task list.`
                    : `You skipped AI's check-in suggestion ${relativeTime(verdict.createdAt, now)}.`}
                </p>
              </div>
            </Card>
          ) : null}

          <Card>
            <div className="border-b border-subtle px-4 py-3">
              <h2 className="text-h3 font-semibold text-primary">What to remember</h2>
            </div>
            <div className="p-4">
              <PartnerNotesForm
                partnerId={partner.id}
                notesSummary={partner.notesSummary}
                partnerName={partner.firstName}
              />
            </div>
          </Card>

          <Card>
            <div className="border-b border-subtle px-4 py-3">
              <h2 className="text-h3 font-semibold text-primary">Details</h2>
            </div>
            <dl className="space-y-3 p-4">
              <div>
                <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                  Relationship
                </dt>
                <dd className="mt-0.5 text-body text-primary">
                  {PARTNER_TIER_LABELS[partner.tier] ?? partner.tier}
                  {health.quietDays !== null ? (
                    <span className="block text-small text-warning">
                      No contact logged in {health.quietDays} days.
                    </span>
                  ) : null}
                </dd>
              </div>
              <div>
                <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                  Preferred language
                </dt>
                <dd className="mt-0.5 text-body text-primary">
                  {languageName(partner.preferredLanguage)}
                </dd>
              </div>
              <div>
                <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                  Added
                </dt>
                <dd className="mt-0.5 text-body text-primary tnum">
                  {relativeTime(partner.createdAt, now)}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}

function daysAgoText(days: number): string {
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

/** What became of a referral, said the way a loan officer would say it. */
function referralOutcome(r: PartnerReferral, now: Date): string | null {
  if (!r.loanId || !r.stage) return null;

  if (r.loanStatus === "funded") {
    if (!r.fundedAt) return "whose loan funded";
    const days = Math.round((now.getTime() - new Date(`${r.fundedAt}T12:00:00`).getTime()) / 86_400_000);
    return `whose loan funded ${daysAgoText(days)}`;
  }
  if (r.loanStatus === "lost" || r.loanStatus === "withdrawn" || r.loanStatus === "denied") {
    return "whose file didn't close";
  }
  return `whose file is at ${stageLabel(r.stage as Stage)}`;
}

/**
 * AI noticing a partner has gone quiet.
 *
 * Every sentence is assembled from what the database actually holds — the days
 * of silence, the last person they sent, and what became of that file. AI
 * does not speculate, and there is nothing here to send.
 */
function buildCheckin(
  firstName: string,
  fullName: string,
  tier: string,
  quietDays: number,
  referrals: PartnerReferral[],
  referredVolume: number,
  now: Date,
) {
  const latest = referrals.find((r) => r.firstName);
  const outcome = latest ? referralOutcome(latest, now) : null;

  const rationale = latest
    ? `${fullName} hasn't heard from you in ${quietDays} days. Their last referral was ${latest.firstName} ${latest.lastName}${outcome ? `, ${outcome}` : ""}.`
    : `${fullName} hasn't heard from you in ${quietDays} days, and hasn't sent you anyone yet.`;

  const factors = [
    `No contact logged in ${quietDays} days — a partner reads as quiet at ${QUIET_AFTER_DAYS}.`,
    referrals.length > 0
      ? `${referrals.length} referral${referrals.length === 1 ? "" : "s"} from ${firstName}${referredVolume > 0 ? `, ${moneyCompact(referredVolume)} in volume` : ""}`
      : `No referrals from ${firstName} yet`,
    `Relationship marked ${PARTNER_TIER_LABELS[tier] ?? tier}`,
  ];

  return { title: `Check in with ${fullName}`, rationale, factors };
}
