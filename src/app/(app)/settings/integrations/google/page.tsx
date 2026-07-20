import type { Metadata } from "next";
import { KeyRound, Lock, ShieldCheck } from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import { canManageUsers } from "@/lib/roles";
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
import { Button } from "@/components/ui/button";
import { setGoogleConnectionStatus } from "./actions";

export const metadata: Metadata = { title: "Google" };
export const dynamic = "force-dynamic";

export default async function GoogleIntegrationsPage() {
  const user = await requireUser();
  const isAdmin = canManageUsers(user.role);

  const connections = await queryAs(user, listConnections);
  const statusFor = (provider: string): ConnectionStatus =>
    (connections.find((c) => c.provider === provider && c.userId === null)
      ?.status as ConnectionStatus) ?? "not_connected";

  return (
    <>
      <PageHeader
        title="Google"
        subtitle="Workspace sign-in, Gmail, Drive, and Calendar — architecture and least-privilege scopes only."
      />

      <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
        <Card>
          <div className="flex items-start gap-2.5 p-4">
            <Lock className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
            <div>
              <SectionLabel>Tokens are handled server-side only</SectionLabel>
              <p className="mt-1 text-small text-secondary">
                Once a real Google OAuth app is configured, its client ID and secret live in
                server environment variables, and any access or refresh token stays in the
                backend — a server component or server action, never browser JavaScript. Nothing
                here renders a token, and the <code className="text-micro">config</code> column
                that backs this screen only ever holds non-secret metadata: an account email, a
                tool name, a scope description. There is nothing secret to leak, because nothing
                secret is stored.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-2.5 p-4">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
            <div>
              <SectionLabel>Who may connect</SectionLabel>
              <p className="mt-1 text-small text-secondary">
                Only an administrator can preview, pause, reconnect, or disconnect a Google
                connection for the whole team.
                {!isAdmin ? " Ask an administrator to change any of these." : ""}
              </p>
            </div>
          </div>
        </Card>

        {GOOGLE_PROVIDERS.map((provider) => {
          const status = statusFor(provider.key);
          return (
            <Card key={provider.key}>
              <div className="border-b border-subtle px-4 py-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-h3 font-semibold text-primary">{provider.name}</h2>
                  <Badge tone={CONNECTION_STATUS_TONE[status]}>
                    {CONNECTION_STATUS_LABELS[status]}
                  </Badge>
                </div>
                <p className="mt-0.5 text-small text-secondary">{provider.summary}</p>
              </div>

              {provider.key === "google_workspace" ? (
                <div className="flex items-start gap-2.5 border-b border-subtle bg-sunken/40 px-4 py-3">
                  <KeyRound className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
                  <p className="text-small text-secondary">
                    Signing in with Google would be configured here: a Google OAuth client
                    registered to this domain, a redirect URI back to the CRM&rsquo;s own server, and
                    (optionally) a Workspace-domain restriction so only your company&rsquo;s Google
                    accounts can use it. A first-time sign-in would match by work email to an
                    existing teammate record — it would never create a borrower-facing login,
                    because borrowers have none. None of that exists yet; the button below only
                    previews the design.
                  </p>
                </div>
              ) : null}

              <div className="px-4 py-3">
                <SectionLabel>Requested scopes (least privilege)</SectionLabel>
                <ul className="mt-2 space-y-2">
                  {provider.scopes.map((s) => (
                    <li key={s.scope} className="text-small">
                      <code className="rounded bg-sunken px-1 py-0.5 text-micro text-secondary">
                        {s.scope}
                      </code>
                      <span className="ml-2 text-secondary">{s.purpose}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-subtle px-4 py-3">
                {isAdmin ? (
                  <>
                    {status === "not_connected" ? (
                      <ConnectionForm provider={provider.key} action="preview" label="Preview" variant="primary" />
                    ) : null}
                    {status === "paused" ? (
                      <ConnectionForm provider={provider.key} action="reconnect" label="Reconnect" variant="primary" />
                    ) : null}
                    {status === "preview" ? (
                      <ConnectionForm provider={provider.key} action="pause" label="Pause" variant="secondary" />
                    ) : null}
                    {status === "preview" || status === "paused" ? (
                      <ConnectionForm provider={provider.key} action="disconnect" label="Disconnect" variant="danger" />
                    ) : null}
                  </>
                ) : (
                  <p className="text-small text-muted">
                    Only an administrator can manage this connection.
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

function ConnectionForm({
  provider,
  action,
  label,
  variant,
}: {
  provider: string;
  action: string;
  label: string;
  variant: "primary" | "secondary" | "danger";
}) {
  return (
    <form action={setGoogleConnectionStatus}>
      <input type="hidden" name="provider" value={provider} />
      <input type="hidden" name="action" value={action} />
      <Button type="submit" variant={variant} size="sm">
        {label}
      </Button>
    </form>
  );
}
