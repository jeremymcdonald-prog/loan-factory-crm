import type { Metadata } from "next";
import { Plug, TriangleAlert } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { INTEGRATIONS, STATE_LABELS, connectedCount } from "@/lib/integrations";
import { PageHeader } from "@/components/shell/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Integrations" };
export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  await requireUser();
  const connected = connectedCount();

  return (
    <>
      <PageHeader
        title="Integrations"
        subtitle="What Loan Factory CRM is connected to, and what it isn't."
      />

      <div className="mx-auto max-w-3xl p-4 sm:p-6">
        {/* The honest headline. Never a fake connected state. */}
        <div className="flex items-start gap-2.5 rounded-lg border border-warning/25 bg-warning-bg px-4 py-3">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
          <div>
            <p className="text-body font-semibold text-primary">
              {connected === 0
                ? "Nothing is connected yet."
                : `${connected} of ${INTEGRATIONS.length} connected.`}
            </p>
            <p className="mt-0.5 text-small text-secondary">
              Everything in the CRM runs on what your team enters. When a connection is
              switched on, it will say so here — and only here. The CRM will never show a
              green light for something that isn&rsquo;t really working.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {INTEGRATIONS.map((integration) => (
            <Card key={integration.key}>
              <div className="flex items-start gap-3 p-4">
                <Plug className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-primary">{integration.name}</p>
                    <Badge
                      tone={
                        integration.state === "connected"
                          ? "healthy"
                          : integration.state === "disconnected"
                            ? "neutral"
                            : "neutral"
                      }
                    >
                      {STATE_LABELS[integration.state]}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-small text-secondary">{integration.purpose}</p>
                  <p className="mt-1.5 text-small text-muted">{integration.detail}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <p className="mt-4 text-small text-muted">
          Connecting any of these needs a decision outside the CRM — a vendor, a contract, or
          in the case of texting, carrier registration and a consent flow. Nothing here can be
          switched on from this screen yet.
        </p>
      </div>
    </>
  );
}
