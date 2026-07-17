import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import {
  getTemplate,
  listTemplateChoices,
  audienceSizes,
  companyNmls,
} from "@/lib/queries/marketing";
import { stageLabel, type Stage } from "@/lib/stages";
import { languageName } from "@/components/crm/language-badge";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, SectionLabel } from "@/components/ui/card";
import { NewCampaignButton } from "../../new-campaign-button";
import { AUDIENCES, AUDIENCE_TYPES, policyRead } from "../../vocabulary";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const user = await requireUser();
  const record = await queryAs(user, (db) => getTemplate(db, id));
  if (!record) return { title: "Not found" };
  return { title: `${record.ref} · ${record.name}` };
}

const CHANNEL_LABELS: Record<string, string> = {
  email: "Email",
  sms: "Text message",
  call: "Call",
  note: "Note",
};

/** Splitting keeps the capture; testing must not be /g — a global regex carries
 *  `lastIndex` between calls and would misread every other placeholder. */
const MERGE_FIELD_SPLIT = /(\{\{[^}]+\}\})/g;
const IS_MERGE_FIELD = /^\{\{[^}]+\}\}$/;

/**
 * The message as it will read, with the placeholders picked out.
 *
 * The library's source wraps merge fields in markdown backticks; those are file
 * syntax, not part of what the borrower receives, so they come off. The field
 * itself is never touched — what you see between the braces is exactly what is
 * stored, and exactly what gets swapped at send time.
 */
function renderBody(body: string): ReactNode[] {
  const cleaned = body.replace(/`(\{\{[^}]+\}\})`/g, "$1");
  return cleaned.split(MERGE_FIELD_SPLIT).map((part, i) =>
    IS_MERGE_FIELD.test(part) ? (
      <span
        key={i}
        className="rounded bg-sunken px-1 font-mono text-micro font-semibold text-secondary"
      >
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export default async function TemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const data = await queryAs(user, async (db) => {
    const record = await getTemplate(db, id);
    if (!record) return null;
    return {
      record,
      templates: await listTemplateChoices(db),
      sizes: await audienceSizes(db, user, AUDIENCE_TYPES),
      nmls: await companyNmls(db, user),
    };
  });

  if (!data) notFound();

  const { record, templates, sizes, nmls } = data;
  const policy = policyRead(record.policy);
  const audiences = AUDIENCES.map((a) => ({ ...a, size: sizes[a.type] ?? 0 }));
  const mergeFields = record.mergeFields ?? [];

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={record.name}
        subtitle={record.category}
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-small text-secondary">{record.ref}</span>
            <Badge tone={policy.tone}>{policy.label}</Badge>
            <Link
              href="/marketing/templates"
              className="inline-flex items-center gap-1.5 text-small font-semibold text-action hover:underline"
            >
              <ArrowLeft className="size-3.5" aria-hidden />
              Back to the library
            </Link>
          </div>
        }
        action={
          /* A template that never goes to a list gets no button that implies it can. */
          policy.campaignBlock ? null : (
            <NewCampaignButton
              templates={templates}
              audiences={audiences}
              companyNmls={nmls}
              defaultTemplateId={record.id}
              label="Use in a campaign"
            />
          )
        }
      />

      <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_280px]">
        {/* Left: the message itself */}
        <div className="space-y-4">
          <Card>
            <div className="border-b border-subtle px-4 py-3">
              <SectionLabel>Subject line</SectionLabel>
              <p className="mt-1 text-body font-semibold text-primary">
                {record.subject ? renderBody(record.subject) : "This one has no subject line."}
              </p>
            </div>

            <div className="p-4">
              <SectionLabel>The message</SectionLabel>
              <div className="mt-2 whitespace-pre-wrap rounded-md border border-subtle bg-sunken px-4 py-3 text-body leading-relaxed text-secondary">
                {renderBody(record.body)}
              </div>
            </div>
          </Card>

          {record.complianceNotes ? (
            <div className="flex gap-2.5 rounded-lg border border-warning/25 bg-warning-bg px-4 py-3">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
              <div>
                <p className="text-small font-semibold text-warning">Before you send this</p>
                <p className="mt-0.5 text-body text-secondary">{record.complianceNotes}</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Right rail: how it may be sent, and what it needs to know */}
        <div className="space-y-4">
          <Card>
            <div className="border-b border-subtle px-4 py-3">
              <h2 className="text-h3 font-semibold text-primary">How it can be sent</h2>
            </div>
            <div className="p-4">
              <Badge tone={policy.tone}>{policy.label}</Badge>
              <p className="mt-2 text-body text-secondary">{policy.sentence}</p>
              {policy.campaignBlock ? (
                <p className="mt-2 border-t border-subtle pt-2 text-small text-critical">
                  {policy.campaignBlock}
                </p>
              ) : null}
            </div>
          </Card>

          <Card>
            <div className="border-b border-subtle px-4 py-3">
              <h2 className="text-h3 font-semibold text-primary">
                What gets filled in
                {mergeFields.length > 0 ? (
                  <span className="ml-1.5 text-small font-normal text-muted tnum">
                    {mergeFields.length}
                  </span>
                ) : null}
              </h2>
            </div>
            <div className="p-4">
              {mergeFields.length > 0 ? (
                <>
                  <ul className="flex flex-wrap gap-1">
                    {mergeFields.map((field) => (
                      <li
                        key={field}
                        className="rounded border border-subtle bg-sunken px-1.5 py-0.5 font-mono text-micro font-semibold text-secondary"
                      >
                        {field}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-small text-muted">
                    Each one is swapped for the real detail when the message goes out.
                  </p>
                </>
              ) : (
                <p className="text-small text-muted">
                  Nothing gets swapped in — this one reads the same for everybody.
                </p>
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
                  Reference
                </dt>
                <dd className="mt-0.5 font-mono text-body text-primary">{record.ref}</dd>
              </div>
              <div>
                <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                  What it&rsquo;s for
                </dt>
                <dd className="mt-0.5 text-body text-primary">{record.category}</dd>
              </div>
              <div>
                <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                  Stage
                </dt>
                <dd className="mt-0.5 text-body text-primary">
                  {record.stage ? (
                    stageLabel(record.stage as Stage)
                  ) : (
                    <span className="text-secondary">
                      Any stage — it isn&rsquo;t tied to one.
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                  Goes out as
                </dt>
                <dd className="mt-0.5 text-body text-primary">
                  {CHANNEL_LABELS[record.channel] ?? record.channel}
                </dd>
              </div>
              <div>
                <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                  Written in
                </dt>
                <dd className="mt-0.5 text-body text-primary">
                  {languageName(record.languageCode)}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>

      <div className="px-4 pb-6 sm:px-6">
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
