import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import { canManageUsers } from "@/lib/roles";
import { listLeadSourceMappings } from "@/lib/queries/integrations";
import { LEAD_SOURCE_CATALOG, leadSourceLabel } from "@/lib/integrations";
import { PageHeader } from "@/components/shell/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { languageName } from "@/components/crm/language-badge";
import { toggleMappingActive } from "./actions";

export const metadata: Metadata = { title: "Lead-source mapping" };
export const dynamic = "force-dynamic";

export default async function LeadSourceMappingPage() {
  const user = await requireUser();
  const isAdmin = canManageUsers(user.role);

  const mappings = await queryAs(user, listLeadSourceMappings);
  const mappedSourceKeys = new Set(mappings.map((m) => m.sourceKey));
  const unmapped = LEAD_SOURCE_CATALOG.filter((s) => !mappedSourceKeys.has(s.key));

  return (
    <>
      <PageHeader
        title="Lead-source mapping"
        subtitle="How an incoming lead from each source is routed: owner, campaign, automation, and tags."
        action={
          isAdmin ? (
            <Link href="/settings/integrations/zapier/mapping/new">
              <Button variant="primary">
                <Plus className="size-4" aria-hidden />
                New mapping
              </Button>
            </Link>
          ) : null
        }
      />

      <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6">
        {mappings.length === 0 ? (
          <div className="rounded-card border border-subtle bg-surface px-6 py-14 text-center">
            <p className="text-h3 font-semibold text-primary">No sources mapped yet</p>
            <p className="mx-auto mt-1 max-w-sm text-body text-secondary">
              Map a source to route its leads to an owner, campaign, and automation automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-card border border-subtle bg-surface">
            <table className="w-full min-w-[820px] text-body">
              <caption className="sr-only">Lead-source mappings</caption>
              <thead>
                <tr className="border-b border-subtle bg-sunken text-label uppercase tracking-wide text-muted">
                  <th scope="col" className="px-4 py-2 text-left font-semibold">Source</th>
                  <th scope="col" className="px-4 py-2 text-left font-semibold">Name</th>
                  <th scope="col" className="px-4 py-2 text-left font-semibold">Owner</th>
                  <th scope="col" className="px-4 py-2 text-left font-semibold">Campaign</th>
                  <th scope="col" className="px-4 py-2 text-left font-semibold">Automation</th>
                  <th scope="col" className="px-4 py-2 text-left font-semibold">Language</th>
                  <th scope="col" className="px-4 py-2 text-left font-semibold">Status</th>
                  <th scope="col" className="px-4 py-2 text-right font-semibold">Manage</th>
                </tr>
              </thead>
              <tbody>
                {mappings.map((m) => (
                  <tr key={m.id} className="border-b border-subtle last:border-0 hover:bg-sunken">
                    <td className="px-4 py-2.5">
                      <p className="font-semibold text-primary">{leadSourceLabel(m.sourceKey)}</p>
                      {m.tags && m.tags.length > 0 ? (
                        <p className="text-small text-muted">{m.tags.join(", ")}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-2.5 text-secondary">{m.name}</td>
                    <td className="px-4 py-2.5 text-secondary">{m.ownerName ?? "— Unassigned —"}</td>
                    <td className="px-4 py-2.5 text-secondary">{m.campaignName ?? "—"}</td>
                    <td className="px-4 py-2.5 text-secondary">{m.automationName ?? "—"}</td>
                    <td className="px-4 py-2.5 text-secondary">
                      {languageName(m.preferredLanguage ?? "en")}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone={m.active ? "healthy" : "neutral"}>
                        {m.active ? "Active" : "Paused"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-2">
                        {isAdmin ? (
                          <>
                            <Link href={`/settings/integrations/zapier/mapping/${m.id}`}>
                              <Button variant="ghost" size="sm">
                                <Pencil className="size-3.5" aria-hidden />
                                Edit
                              </Button>
                            </Link>
                            <form action={toggleMappingActive}>
                              <input type="hidden" name="id" value={m.id} />
                              <input type="hidden" name="active" value={m.active ? "false" : "true"} />
                              <Button type="submit" variant="ghost" size="sm">
                                {m.active ? "Pause" : "Activate"}
                              </Button>
                            </form>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {unmapped.length > 0 ? (
          <Card>
            <div className="border-b border-subtle px-4 py-3">
              <h2 className="text-h3 font-semibold text-primary">Not yet mapped</h2>
              <p className="mt-0.5 text-small text-muted">
                Leads from these sources have nowhere to route until you add a mapping.
              </p>
            </div>
            <ul className="divide-y divide-subtle">
              {unmapped.map((s) => (
                <li key={s.key} className="flex items-center justify-between gap-2 px-4 py-2.5">
                  <span className="text-secondary">{s.label}</span>
                  {isAdmin ? (
                    <Link href={`/settings/integrations/zapier/mapping/new?source=${s.key}`}>
                      <Button variant="ghost" size="sm">
                        <Plus className="size-3.5" aria-hidden />
                        Map it
                      </Button>
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
      </div>
    </>
  );
}
