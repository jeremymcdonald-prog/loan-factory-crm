import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import {
  ChevronRight,
  Users,
  Building2,
  ShieldCheck,
  Plug,
  ScrollText,
} from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import { canManageUsers, ROLE_LABELS } from "@/lib/roles";
import { tenant as tenantTable } from "@/db/schema";
import { connectedCount, INTEGRATIONS } from "@/lib/integrations";
import { PageHeader } from "@/components/shell/page-header";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();
  const isAdmin = canManageUsers(user.role);

  const org = await queryAs(user, async (db) => {
    const [row] = await db
      .select({ name: tenantTable.name, nmls: tenantTable.companyNmls })
      .from(tenantTable)
      .where(eq(tenantTable.id, user.tenantId))
      .limit(1);
    return row;
  });

  const connected = connectedCount();

  const sections = [
    {
      href: "/settings/users",
      label: "Team members",
      description: "Who can sign in, their role, and what they can see.",
      icon: Users,
      adminOnly: false,
    },
    {
      href: "/settings/organization",
      label: "Organization",
      description: "Company details, teams, stages, and the compliance rules on every send.",
      icon: Building2,
      adminOnly: false,
    },
    {
      href: "/settings/ally",
      label: "Ally",
      description: "What Ally may prepare, and what always needs a person.",
      icon: ShieldCheck,
      adminOnly: false,
    },
    {
      href: "/settings/integrations",
      label: "Integrations",
      description:
        connected === 0
          ? `Nothing connected yet — ${INTEGRATIONS.length} available to set up.`
          : `${connected} of ${INTEGRATIONS.length} connected.`,
      icon: Plug,
      adminOnly: false,
    },
    {
      href: "/settings/audit",
      label: "Audit log",
      description: "Every change, who made it, and when.",
      icon: ScrollText,
      adminOnly: true,
    },
  ].filter((s) => !s.adminOnly || isAdmin);

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle={`${org?.name ?? "Loan Factory"} · NMLS #${org?.nmls ?? "320841"}`}
      />

      <div className="mx-auto max-w-3xl p-4 sm:p-6">
        <div className="space-y-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.href} className="transition-colors hover:bg-raised">
                <Link href={section.href} className="flex items-center gap-3 px-4 py-3.5">
                  <Icon className="size-5 shrink-0 text-muted" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-primary">{section.label}</p>
                    <p className="text-small text-muted">{section.description}</p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
                </Link>
              </Card>
            );
          })}
        </div>

        <Card className="mt-6">
          <div className="px-4 py-3.5">
            <p className="text-label font-semibold uppercase tracking-wide text-muted">
              Your account
            </p>
            <dl className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <dt className="text-small text-muted">Name</dt>
                <dd className="font-semibold text-primary">{user.fullName}</dd>
              </div>
              <div>
                <dt className="text-small text-muted">Email</dt>
                <dd className="truncate text-primary">{user.email}</dd>
              </div>
              <div>
                <dt className="text-small text-muted">Role</dt>
                <dd className="text-primary">{ROLE_LABELS[user.role] ?? user.role}</dd>
              </div>
            </dl>
            {!isAdmin ? (
              <p className="mt-3 text-small text-muted">
                Ask an administrator to change your role or details.
              </p>
            ) : null}
          </div>
        </Card>
      </div>
    </>
  );
}
