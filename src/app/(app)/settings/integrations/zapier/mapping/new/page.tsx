import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser, queryAs } from "@/lib/auth";
import { canManageUsers } from "@/lib/roles";
import { listOwnerOptions, listCampaignOptions, listAutomationOptions } from "@/lib/queries/integrations";
import { LEAD_SOURCE_CATALOG, leadSourceLabel } from "@/lib/integrations";
import { PageHeader } from "@/components/shell/page-header";
import { MappingForm } from "../mapping-form";

export const metadata: Metadata = { title: "New lead-source mapping" };
export const dynamic = "force-dynamic";

export default async function NewMappingPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const user = await requireUser();
  if (!canManageUsers(user.role)) notFound();

  const { source } = await searchParams;
  const sourceKey = source && LEAD_SOURCE_CATALOG.some((s) => s.key === source) ? source : undefined;

  const { owners, campaigns, automations } = await queryAs(user, async (db) => ({
    owners: await listOwnerOptions(db),
    campaigns: await listCampaignOptions(db),
    automations: await listAutomationOptions(db),
  }));

  return (
    <>
      <PageHeader
        title="New lead-source mapping"
        subtitle={sourceKey ? `Routing for ${leadSourceLabel(sourceKey)}.` : "Pick a source and how its leads should route."}
      />

      <div className="mx-auto max-w-2xl p-4 sm:p-6">
        <MappingForm
          initial={{ sourceKey, name: sourceKey ? leadSourceLabel(sourceKey) : undefined }}
          owners={owners}
          campaigns={campaigns}
          automations={automations}
        />
      </div>
    </>
  );
}
