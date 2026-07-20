import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser, queryAs } from "@/lib/auth";
import { canManageUsers } from "@/lib/roles";
import {
  getMapping,
  listOwnerOptions,
  listCampaignOptions,
  listAutomationOptions,
} from "@/lib/queries/integrations";
import { leadSourceLabel } from "@/lib/integrations";
import { PageHeader } from "@/components/shell/page-header";
import { MappingForm } from "../mapping-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `Edit mapping — ${id}` };
}

export default async function EditMappingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (!canManageUsers(user.role)) notFound();

  const { id } = await params;

  const { mapping, owners, campaigns, automations } = await queryAs(user, async (db) => ({
    mapping: await getMapping(db, id),
    owners: await listOwnerOptions(db),
    campaigns: await listCampaignOptions(db),
    automations: await listAutomationOptions(db),
  }));

  if (!mapping) notFound();

  return (
    <>
      <PageHeader
        title={mapping.name}
        subtitle={`${leadSourceLabel(mapping.sourceKey)} — edit how these leads route.`}
      />

      <div className="mx-auto max-w-2xl p-4 sm:p-6">
        <MappingForm
          initial={{
            id: mapping.id,
            sourceKey: mapping.sourceKey,
            name: mapping.name,
            ownerUserId: mapping.ownerUserId,
            leadSource: mapping.leadSource,
            campaignId: mapping.campaignId,
            automationId: mapping.automationId,
            tags: mapping.tags,
            preferredLanguage: mapping.preferredLanguage,
            fieldMap: mapping.fieldMap,
            notifyRule: mapping.notifyRule,
            active: mapping.active,
          }}
          owners={owners}
          campaigns={campaigns}
          automations={automations}
        />
      </div>
    </>
  );
}
