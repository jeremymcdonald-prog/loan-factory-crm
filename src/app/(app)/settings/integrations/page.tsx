import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Plug, TriangleAlert } from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import { listConnections } from "@/lib/queries/integrations";
import {
  GOOGLE_PROVIDERS,
  CONNECTION_STATUS_LABELS,
  CONNECTION_STATUS_TONE,
  type ConnectionStatus,
} from "@/lib/integrations";
import { PageHeader } from "@/components/shell/page-header";
import { Card, SectionLabel } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Integrations" };
export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const user = await requireUser();
  const connections = await queryAs(user, listConnections);

  const statusFor = (provider: string): ConnectionStatus =>
    (connections.find((c) => c.provider === provider && c.userId === null)
      ?.status as ConnectionStatus) ?? "not_connected";

  const googleRows = GOOGLE_PROVIDERS.map((p) => ({
    key: p.key,
    name: p.name,
    status: statusFor(p.key),
  }));
  const zapierStatus = statusFor("zapier_mcp");

  const activeCount =
    googleRows.filter((r) => r.status !== "not_connected").length +
    (zapierStatus === "not_connected" ? 0 : 1);
  const totalCount = googleRows.length + 1;

  return (
    <>
      <PageHeader
        title="Integrations"
        subtitle="Google connections and the Zapier MCP lead pipe — what's a preview, and what's really not connected."
      />

      <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
        <div className="flex items-start gap-2.5 rounded-lg border border-warning/25 bg-warning-bg px-4 py-3">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
          <div>
            <p className="text-body font-semibold text-primary">
              {activeCount === 0
                ? "Nothing is connected — nothing is even in preview yet."
                : `${activeCount} of ${totalCount} in preview or paused. None is a live, credentialed connection.`}
            </p>
            <p className="mt-0.5 text-small text-secondary">
              No real Google or Zapier account is linked. &ldquo;Preview&rdquo; means the
              architecture and scopes are configured and ready to review — no token is ever
              requested or stored until a real OAuth app is wired up on the backend. The CRM will
              never show &ldquo;Connected&rdquo; for something that isn&rsquo;t.
            </p>
          </div>
        </div>

        <div>
          <SectionLabel className="px-1">Google</SectionLabel>
          <div className="mt-2 space-y-2">
            {googleRows.map((row) => (
              <Card key={row.key} className="transition-colors hover:bg-sunken">
                <Link
                  href="/settings/integrations/google"
                  className="flex items-center gap-3 px-4 py-3.5"
                >
                  <Plug className="size-5 shrink-0 text-muted" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-primary">{row.name}</p>
                      <Badge tone={CONNECTION_STATUS_TONE[row.status]}>
                        {CONNECTION_STATUS_LABELS[row.status]}
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
                </Link>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel className="px-1">Zapier MCP (lead sources)</SectionLabel>
          <div className="mt-2">
            <Card className="transition-colors hover:bg-sunken">
              <Link
                href="/settings/integrations/zapier"
                className="flex items-center gap-3 px-4 py-3.5"
              >
                <Plug className="size-5 shrink-0 text-muted" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-primary">Zapier MCP</p>
                    <Badge tone={CONNECTION_STATUS_TONE[zapierStatus]}>
                      {CONNECTION_STATUS_LABELS[zapierStatus]}
                    </Badge>
                  </div>
                  <p className="text-small text-muted">
                    Facebook, Instagram, Jotform, Google Forms, Follow Up Boss, and more — routed
                    by lead-source mapping.
                  </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
              </Link>
            </Card>
          </div>
        </div>

        <p className="mt-2 text-small text-muted">
          Only an administrator can preview, pause, reconnect, or disconnect any of these.
        </p>
      </div>
    </>
  );
}
