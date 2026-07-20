import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import { getCampaign, companyNmls, listTemplateChoices } from "@/lib/queries/marketing";
import { listCampaignSteps } from "@/lib/queries/campaign-steps";
import { getMySignatureProfile } from "@/app/(app)/settings/profile/actions";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { campaignStatusLabel, canManageCampaigns } from "../../../vocabulary";
import { ComplianceStrip } from "../../compliance-strip";
import { StepEditor } from "./step-editor";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const user = await requireUser();
  const record = await queryAs(user, (db) => getCampaign(db, user, id));
  return { title: record ? `Steps · ${record.name}` : "Not found" };
}

export default async function CampaignStepsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  // A role that doesn't manage campaigns has nothing to do here — same guard
  // as the edit page, and every action re-checks regardless.
  if (!canManageCampaigns(user.role)) redirect(`/marketing/campaigns/${id}`);

  const data = await queryAs(user, async (db) => {
    const record = await getCampaign(db, user, id);
    if (!record) return null;
    const steps = await listCampaignSteps(db, id);
    const templates = await listTemplateChoices(db);
    const nmls = await companyNmls(db, user);
    return { record, steps, templates, nmls };
  });

  if (!data) notFound();
  const { record: c, steps, templates, nmls } = data;

  // A Server Action can be called directly from a Server Component — no
  // network round trip — so the signature is fetched once here rather than
  // once per step card client-side.
  const signatureProfile = await getMySignatureProfile();
  const senderName = c.ownerName ?? signatureProfile.fullName;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={`Steps · ${c.name}`}
        subtitle="Build the sequence — each step is its own send, reminder, or task, in the order it fires."
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{campaignStatusLabel(c.status)}</Badge>
            <Link
              href={`/marketing/campaigns/${c.id}`}
              className="inline-flex items-center gap-1.5 text-small font-semibold text-action hover:underline"
            >
              <ArrowLeft className="size-3.5" aria-hidden />
              Back to the campaign
            </Link>
          </div>
        }
      />

      <div className="space-y-4 p-4 sm:p-6">
        <ComplianceStrip nmls={nmls} language={c.language} />

        <p className="text-small text-muted">
          Nothing sends from any step until sending providers are connected, and every step
          marked &ldquo;requires approval&rdquo; queues for your review first.
        </p>

        <StepEditor
          campaignId={c.id}
          steps={steps}
          templates={templates}
          nmls={nmls}
          senderName={senderName}
          signatureProfile={signatureProfile}
        />
      </div>
    </div>
  );
}
