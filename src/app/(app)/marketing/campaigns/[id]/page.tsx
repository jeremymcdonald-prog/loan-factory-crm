import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Pause,
  Pencil,
  Play,
  Video,
} from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import { getCampaign, companyNmls } from "@/lib/queries/marketing";
import { absoluteTime, relativeTime, shortDate } from "@/lib/format";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { activateCampaign, duplicateCampaign, pauseCampaign } from "../../actions";
import {
  ACTIVATE_HONESTY,
  audienceOption,
  campaignLanguageName,
  campaignStatusLabel,
  canActivate,
  canManageCampaigns,
  canPause,
  dripChannelLabel,
  openRate,
  policyRead,
} from "../../vocabulary";
import { ComplianceStrip } from "../compliance-strip";
import { CampaignPreview, type PreviewVideo } from "./preview";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const user = await requireUser();
  const record = await queryAs(user, (db) => getCampaign(db, user, id));
  return { title: record ? record.name : "Not found" };
}

/** The demo-video conventions: only details are stored, never a recording. */
function readVideo(meta: Record<string, unknown> | null): PreviewVideo | null {
  if (!meta || typeof meta.title !== "string" || !meta.title) return null;
  return {
    title: meta.title,
    caption: typeof meta.caption === "string" && meta.caption ? meta.caption : null,
    durationSeconds:
      typeof meta.durationSeconds === "number" ? meta.durationSeconds : null,
  };
}

export default async function CampaignPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const user = await requireUser();

  const data = await queryAs(user, async (db) => {
    const record = await getCampaign(db, user, id);
    if (!record) return null;
    return { record, nmls: await companyNmls(db, user) };
  });

  if (!data) notFound();

  const { record: c, nmls } = data;
  const manages = canManageCampaigns(user.role);
  const policy = c.templatePolicy ? policyRead(c.templatePolicy) : null;
  const video = readVideo(c.videoMeta);
  const drip = c.drip ?? [];
  const rate = openRate(c.sentCount, c.openCount);
  const audienceType = c.audience?.type ? audienceOption(c.audience.type) : undefined;

  // What the recipient's email actually holds: the campaign's own copy first,
  // else the attached template — which is what a send would fall back to.
  const emailBody = c.emailBody ?? c.templateBody;
  const emailFromTemplate = !c.emailBody && Boolean(c.templateBody);
  const emailSubject =
    c.templateSubject ??
    drip.find((s) => s.channel === "email")?.subject ??
    c.name;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={c.name}
        subtitle={c.audience?.label ?? "No audience set"}
        meta={
          <div className="flex flex-wrap items-center gap-2">
            {/* Status carries no urgency, so it carries no hue — as on the list. */}
            <Badge tone="neutral">{campaignStatusLabel(c.status)}</Badge>
            <Badge tone="neutral">{campaignLanguageName(c.language)}</Badge>
            {policy ? <Badge tone={policy.tone}>{policy.label}</Badge> : null}
            <Link
              href="/marketing"
              className="inline-flex items-center gap-1.5 text-small font-semibold text-action hover:underline"
            >
              <ArrowLeft className="size-3.5" aria-hidden />
              Back to Marketing
            </Link>
          </div>
        }
        action={
          manages ? (
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/marketing/campaigns/${c.id}/edit`}
                className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-control border border-strong bg-surface px-3.5 text-body font-semibold text-primary shadow-e1 transition-colors hover:bg-sunken"
              >
                <Pencil className="size-4" aria-hidden />
                Edit
              </Link>
              <form action={duplicateCampaign}>
                <input type="hidden" name="id" value={c.id} />
                <Button type="submit">
                  <Copy className="size-4" aria-hidden />
                  Duplicate
                </Button>
              </form>
              {canPause(c.status) ? (
                <form action={pauseCampaign}>
                  <input type="hidden" name="id" value={c.id} />
                  <Button type="submit">
                    <Pause className="size-4" aria-hidden />
                    Pause
                  </Button>
                </form>
              ) : null}
              {canActivate(c.status) ? (
                <form action={activateCampaign}>
                  <input type="hidden" name="id" value={c.id} />
                  <Button type="submit" variant="primary">
                    <Play className="size-4" aria-hidden />
                    {c.status === "paused" ? "Resume" : "Activate"}
                  </Button>
                </form>
              ) : null}
            </div>
          ) : null
        }
      />

      <div className="space-y-4 p-4 sm:p-6">
        {saved ? (
          <p
            role="status"
            className="flex items-start gap-2 rounded-md border border-healthy/25 bg-healthy-bg px-3 py-2.5 text-small text-secondary"
          >
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-healthy" aria-hidden />
            <span>
              Changes saved. Nothing sends until sending providers are connected.
            </span>
          </p>
        ) : null}

        {manages && canActivate(c.status) ? (
          <p className="text-small text-muted">{ACTIVATE_HONESTY}</p>
        ) : null}

        <ComplianceStrip nmls={nmls} language={c.language} />

        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          {/* Left: content as the recipient sees it, then the sequence */}
          <div className="min-w-0 space-y-4">
            <CampaignPreview
              emailSubject={emailSubject}
              emailBody={emailBody}
              emailFromTemplate={emailFromTemplate}
              smsBody={c.smsBody}
              video={video}
              senderName={c.ownerName ?? "Your loan officer"}
              nmls={nmls}
            />

            <Card>
              <div className="border-b border-subtle px-4 py-3">
                <h2 className="text-h3 font-semibold text-primary">
                  Drip sequence
                  {drip.length > 0 ? (
                    <span className="ml-1.5 text-small font-normal text-muted tnum">
                      {drip.length} {drip.length === 1 ? "step" : "steps"}
                    </span>
                  ) : null}
                </h2>
              </div>
              <div className="p-4">
                {drip.length > 0 ? (
                  <ol className="space-y-2">
                    {drip.map((step, i) => (
                      <li
                        key={`${step.day}-${i}`}
                        className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-md border border-subtle bg-sunken px-3 py-2"
                      >
                        <span className="w-14 shrink-0 text-small font-semibold text-primary tnum">
                          Day {step.day}
                        </span>
                        <Badge tone="neutral">{dripChannelLabel(step.channel)}</Badge>
                        <span className="min-w-0 text-small text-secondary">
                          {step.subject}
                        </span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-small text-muted">
                    No drip steps — this campaign goes out once. Add follow-up steps in
                    Edit if it should keep working after the first send.
                  </p>
                )}
                {drip.length > 0 ? (
                  <p className="mt-2 text-small text-muted">
                    Day 0 is the first send; each later step follows that many days
                    after enrollment.
                  </p>
                ) : null}
              </div>
            </Card>

            <Card>
              <div className="border-b border-subtle px-4 py-3">
                <h2 className="text-h3 font-semibold text-primary">Video</h2>
              </div>
              <div className="p-4">
                {video ? (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Video className="size-4 shrink-0 text-muted" aria-hidden />
                    <span className="text-body font-semibold text-primary">
                      {video.title}
                    </span>
                    {video.caption ? (
                      <span className="text-small text-muted">{video.caption}</span>
                    ) : null}
                    <Badge tone="neutral">Demo video attachment</Badge>
                  </div>
                ) : (
                  <p className="text-small text-muted">No video attached.</p>
                )}
                <p className="mt-2 text-small text-muted">
                  Recordings stay on the device that made them — the campaign stores
                  only the title and caption.{" "}
                  <Link
                    href="/marketing/compose"
                    className="font-semibold text-action hover:underline"
                  >
                    Record one in the video composer
                  </Link>
                  , then put its details here in Edit.
                </p>
              </div>
            </Card>
          </div>

          {/* Right rail: who, when, what happened, and the record's facts */}
          <div className="space-y-4">
            <Card>
              <div className="border-b border-subtle px-4 py-3">
                <h2 className="text-h3 font-semibold text-primary">Audience</h2>
              </div>
              <div className="p-4">
                <p className="text-body font-semibold text-primary">
                  {c.audience?.label ?? "No audience set"}
                </p>
                {audienceType ? (
                  <p className="mt-1 text-small text-secondary">{audienceType.hint}</p>
                ) : null}
                <p className="mt-2 border-t border-subtle pt-2 text-small text-muted">
                  <span className="font-semibold text-primary tnum">{c.audienceSize}</span>{" "}
                  {c.audienceSize === 1 ? "person" : "people"} when last saved. Anyone who
                  asked not to be contacted is left out.
                </p>
              </div>
            </Card>

            <Card>
              <div className="border-b border-subtle px-4 py-3">
                <h2 className="text-h3 font-semibold text-primary">Timing</h2>
              </div>
              <div className="p-4">
                {c.scheduledFor ? (
                  <p className="text-body text-primary">
                    <span className="font-semibold tnum">{absoluteTime(c.scheduledFor)}</span>
                    <span className="block text-small text-muted tnum">
                      {relativeTime(c.scheduledFor)}
                    </span>
                  </p>
                ) : (
                  <p className="text-small text-muted">
                    No send date set{c.status === "draft" ? " — it's a draft" : ""}.
                  </p>
                )}
              </div>
            </Card>

            <Card>
              <div className="border-b border-subtle px-4 py-3">
                <h2 className="text-h3 font-semibold text-primary">Results</h2>
              </div>
              <div className="p-4">
                {c.sentCount > 0 ? (
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                      { label: "Sent", value: String(c.sentCount) },
                      { label: "Opened", value: String(c.openCount) },
                      { label: "Replied", value: String(c.replyCount) },
                      { label: "Open rate", value: rate === null ? "—" : `${rate}%` },
                    ].map((m) => (
                      <div key={m.label}>
                        <dt className="text-micro font-semibold uppercase tracking-wide text-muted">
                          {m.label}
                        </dt>
                        <dd className="text-body font-semibold text-primary tnum">
                          {m.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-small text-muted">Nothing has gone out yet.</p>
                )}
                <p className="mt-2 border-t border-subtle pt-2 text-small text-muted">
                  {c.sentCount > 0
                    ? "Historical demo data seeded into this workspace — nothing sends from the CRM yet."
                    : "Sends start when sending providers are connected."}
                </p>
              </div>
            </Card>

            <Card>
              <div className="border-b border-subtle px-4 py-3">
                <h2 className="text-h3 font-semibold text-primary">Details</h2>
              </div>
              <dl className="space-y-3 p-4">
                <div>
                  <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                    Language
                  </dt>
                  <dd className="mt-0.5 text-body text-primary">
                    {campaignLanguageName(c.language)}
                  </dd>
                </div>
                <div>
                  <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                    Template
                  </dt>
                  <dd className="mt-0.5 text-body text-primary">
                    {c.templateId && c.templateRef ? (
                      <Link
                        href={`/marketing/templates/${c.templateId}`}
                        className="inline-flex items-center gap-1.5 hover:text-action"
                      >
                        <span className="font-mono text-micro text-secondary">
                          {c.templateRef}
                        </span>
                        <span>{c.templateName}</span>
                      </Link>
                    ) : (
                      <span className="text-secondary">None attached</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                    Owner
                  </dt>
                  <dd className="mt-0.5 text-body text-primary">{c.ownerName ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                    Created
                  </dt>
                  <dd className="mt-0.5 text-body text-primary tnum">
                    {shortDate(c.createdAt)}
                  </dd>
                </div>
              </dl>
            </Card>
          </div>
        </div>

        <p className="border-t border-subtle pt-3 text-small text-muted">
          Every message that goes out carries
          {nmls ? (
            <>
              {" "}
              Loan Factory, Inc. NMLS #<span className="tnum">{nmls}</span>
            </>
          ) : (
            " your company NMLS"
          )}{" "}
          and the Equal Housing Opportunity notice.
        </p>
      </div>
    </div>
  );
}
