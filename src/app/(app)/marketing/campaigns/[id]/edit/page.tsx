import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import { getCampaign, companyNmls } from "@/lib/queries/marketing";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { campaignStatusLabel, canManageCampaigns } from "../../../vocabulary";
import { EditCampaignForm } from "./edit-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const user = await requireUser();
  const record = await queryAs(user, (db) => getCampaign(db, user, id));
  return { title: record ? `Edit · ${record.name}` : "Not found" };
}

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  // A role that doesn't manage campaigns has nothing to do here; the server
  // action re-checks, but there is no reason to render a form it will refuse.
  if (!canManageCampaigns(user.role)) redirect(`/marketing/campaigns/${id}`);

  const data = await queryAs(user, async (db) => {
    const record = await getCampaign(db, user, id);
    if (!record) return null;
    return { record, nmls: await companyNmls(db, user) };
  });

  if (!data) notFound();
  const { record: c, nmls } = data;
  const video = c.videoMeta ?? {};

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={`Edit ${c.name}`}
        subtitle="Change what it says, who gets it, and when — nothing sends until sending providers are connected."
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

      <div className="p-4 sm:p-6">
        <EditCampaignForm
          nmls={nmls}
          campaign={{
            id: c.id,
            name: c.name,
            status: c.status,
            language: c.language,
            emailBody: c.emailBody,
            smsBody: c.smsBody,
            videoTitle: typeof video.title === "string" ? video.title : "",
            videoCaption: typeof video.caption === "string" ? video.caption : "",
            audienceType: c.audience?.type ?? "",
            audienceLabel: c.audience?.label ?? "",
            scheduledForIso: c.scheduledFor?.toISOString() ?? null,
            drip: c.drip ?? [],
          }}
        />
      </div>
    </div>
  );
}
