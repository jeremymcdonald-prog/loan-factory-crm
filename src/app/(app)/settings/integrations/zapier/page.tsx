import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Lock, RotateCw, Route } from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import { canManageUsers } from "@/lib/roles";
import {
  getTenantConnection,
  eventCounts,
  listIntegrationEvents,
  listLeadSourceMappings,
} from "@/lib/queries/integrations";
import {
  CONNECTION_STATUS_LABELS,
  CONNECTION_STATUS_TONE,
  ZAPIER_TOOLS,
  type ConnectionStatus,
} from "@/lib/integrations";
import { PageHeader } from "@/components/shell/page-header";
import { Card, SectionLabel } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { relativeTime } from "@/lib/format";
import { setZapierConnectionStatus, testZapierConnection, testZapierEvent, retryIntegrationEvent } from "./actions";

export const metadata: Metadata = { title: "Zapier MCP" };
export const dynamic = "force-dynamic";

const EVENT_STATUS_TONE: Record<string, "healthy" | "critical" | "warning" | "info" | "neutral"> = {
  imported: "healthy",
  failed: "critical",
  retried: "warning",
  received: "info",
  skipped: "neutral",
};

export default async function ZapierIntegrationsPage() {
  const user = await requireUser();
  const isAdmin = canManageUsers(user.role);

  const { connection, counts, events, mappingCount } = await queryAs(user, async (db) => {
    const connection = await getTenantConnection(db, "zapier_mcp");
    const counts = connection ? await eventCounts(db, connection.id) : { imported: 0, failed: 0, total: 0 };
    const events = connection
      ? await listIntegrationEvents(db, { connectionId: connection.id, limit: 50 })
      : [];
    const mappingCount = (await listLeadSourceMappings(db)).length;
    return { connection, counts, events, mappingCount };
  });

  const status: ConnectionStatus = (connection?.status as ConnectionStatus) ?? "not_connected";
  const canTest = status !== "not_connected";

  return (
    <>
      <PageHeader
        title="Zapier MCP"
        subtitle="Bring leads in from Facebook, Instagram, Jotform, Google Forms, Follow Up Boss, and more — routed by the mapping below."
      />

      <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
        <Card>
          <div className="flex items-start gap-2.5 p-4">
            <Lock className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
            <div>
              <SectionLabel>How the handoff works</SectionLabel>
              <p className="mt-1 text-small text-secondary">
                A Zapier MCP connection is a secure OAuth or credential handoff — configured and
                held entirely by the backend (a server action or server component), never by
                browser JavaScript calling Zapier directly. Once wired up, the CRM would expose a
                small set of tools Zapier can call (below); it would never hand Zapier a broad
                key to the whole database. No credential exists yet, and none is rendered here.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="border-b border-subtle px-4 py-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-h3 font-semibold text-primary">Connection</h2>
              <Badge tone={CONNECTION_STATUS_TONE[status]}>{CONNECTION_STATUS_LABELS[status]}</Badge>
            </div>
            <p className="mt-0.5 text-small text-secondary">
              {status === "not_connected"
                ? "Nothing is connected. Preview the architecture to review scopes and tools before anything real is wired up."
                : `Import history: ${counts.imported} imported, ${counts.failed} failed, ${counts.total} total events.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-b border-subtle px-4 py-3">
            {isAdmin ? (
              <>
                {status === "not_connected" ? (
                  <StatusForm action="preview" label="Preview" variant="primary" />
                ) : null}
                {status === "paused" ? (
                  <StatusForm action="reconnect" label="Reconnect" variant="primary" />
                ) : null}
                {status === "preview" ? (
                  <StatusForm action="pause" label="Pause" variant="secondary" />
                ) : null}
                {status === "preview" || status === "paused" ? (
                  <StatusForm action="disconnect" label="Disconnect" variant="danger" />
                ) : null}
              </>
            ) : (
              <p className="text-small text-muted">
                Only an administrator can manage this connection.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 px-4 py-3">
            {isAdmin ? (
              <>
                <form action={testZapierConnection}>
                  <Button type="submit" variant="secondary" size="sm" disabled={!canTest}>
                    <RotateCw className="size-3.5" aria-hidden />
                    Test connection
                  </Button>
                </form>
                <form action={testZapierEvent}>
                  <Button type="submit" variant="secondary" size="sm" disabled={!canTest}>
                    Test event
                  </Button>
                </form>
              </>
            ) : null}
            {!canTest ? (
              <p className="text-small text-muted">Preview the connection first to enable testing.</p>
            ) : null}
          </div>
        </Card>

        <Card>
          <div className="border-b border-subtle px-4 py-3">
            <h2 className="text-h3 font-semibold text-primary">Tools Zapier could call</h2>
            <p className="mt-0.5 text-small text-muted">
              The least-privilege catalog this MCP server would expose — nothing broader.
            </p>
          </div>
          <ul className="divide-y divide-subtle">
            {ZAPIER_TOOLS.map((tool) => (
              <li key={tool.key} className="px-4 py-2.5">
                <p className="font-semibold text-primary">{tool.name}</p>
                <p className="text-small text-muted">{tool.description}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="transition-colors hover:bg-sunken">
          <Link
            href="/settings/integrations/zapier/mapping"
            className="flex items-center gap-3 px-4 py-3.5"
          >
            <Route className="size-5 shrink-0 text-muted" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-primary">Lead-source mapping</p>
              <p className="text-small text-muted">
                {mappingCount === 0
                  ? "No sources mapped yet — set up owner, campaign, and automation routing."
                  : `${mappingCount} source${mappingCount === 1 ? "" : "s"} mapped.`}
              </p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
          </Link>
        </Card>

        <Card>
          <div className="border-b border-subtle px-4 py-3">
            <h2 className="text-h3 font-semibold text-primary">Import history &amp; failure log</h2>
            <p className="mt-0.5 text-small text-muted">Newest first. This record cannot be edited — a retry appends a new row.</p>
          </div>
          {events.length === 0 ? (
            <p className="px-4 py-6 text-center text-small text-muted">
              Nothing has happened yet.
            </p>
          ) : (
            <ul className="divide-y divide-subtle">
              {events.map((e) => (
                <li key={e.id} className="flex flex-wrap items-start justify-between gap-2 px-4 py-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={EVENT_STATUS_TONE[e.status] ?? "neutral"}>{e.status}</Badge>
                      {e.mappingName ? (
                        <span className="text-small text-muted">{e.mappingName}</span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-small text-secondary">{e.summary}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-small text-muted tnum">{relativeTime(e.createdAt)}</span>
                    {isAdmin && e.status === "failed" ? (
                      <form action={retryIntegrationEvent}>
                        <input type="hidden" name="eventId" value={e.id} />
                        <Button type="submit" variant="ghost" size="sm">
                          Retry
                        </Button>
                      </form>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

function StatusForm({
  action,
  label,
  variant,
}: {
  action: string;
  label: string;
  variant: "primary" | "secondary" | "danger";
}) {
  return (
    <form action={setZapierConnectionStatus}>
      <input type="hidden" name="action" value={action} />
      <Button type="submit" variant={variant} size="sm">
        {label}
      </Button>
    </form>
  );
}
