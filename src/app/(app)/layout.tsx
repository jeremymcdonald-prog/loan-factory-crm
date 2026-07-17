import { eq, and, count } from "drizzle-orm";
import { requireUser, queryAs } from "@/lib/auth";
import { tenant, aiInsight } from "@/db/schema";
import { GlobalNav } from "@/components/shell/global-nav";
import { MobileNav } from "@/components/shell/mobile-nav";
import { TopBar } from "@/components/shell/top-bar";

/** User-scoped: never prerender at build time. */
export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  const { tenantName, approvalCount, demoMode } = await queryAs(user, async (db) => {
    const [org] = await db
      .select({ name: tenant.name, settings: tenant.settings })
      .from(tenant)
      .where(eq(tenant.id, user.tenantId))
      .limit(1);

    const [pending] = await db
      .select({ value: count() })
      .from(aiInsight)
      .where(and(eq(aiInsight.forUserId, user.userId), eq(aiInsight.status, "pending")));

    return {
      tenantName: org?.name ?? "Loan Factory",
      approvalCount: pending?.value ?? 0,
      // The committee build flags itself in data, so the indicator can never
      // ship to a real tenant by accident — it exists only where seeded.
      demoMode: Boolean((org?.settings as Record<string, unknown>)?.demoMode),
    };
  });

  return (
    <div className="flex h-dvh overflow-hidden bg-canvas">
      <div className="hidden lg:block">
        <GlobalNav approvalCount={approvalCount} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          fullName={user.fullName}
          email={user.email}
          role={user.role}
          tenantName={tenantName}
          demoMode={demoMode}
        />
        <main className="flex-1 overflow-y-auto pb-14 lg:pb-0">{children}</main>
      </div>

      <MobileNav />
    </div>
  );
}
