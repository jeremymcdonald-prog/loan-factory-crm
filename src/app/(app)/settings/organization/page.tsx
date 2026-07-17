import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { requireUser, queryAs } from "@/lib/auth";
import { canManageUsers } from "@/lib/roles";
import { tenant as tenantTable, team as teamTable, user as userTable } from "@/db/schema";
import { PageHeader } from "@/components/shell/page-header";
import { Card, SectionLabel } from "@/components/ui/card";
import { STAGES, STAGE_LABELS, MACRO_PHASES, stagesIn, stageNumber } from "@/lib/stages";
import { OrganizationForm } from "./organization-form";

export const metadata: Metadata = { title: "Organization" };
export const dynamic = "force-dynamic";

export default async function OrganizationPage() {
  const user = await requireUser();
  const isAdmin = canManageUsers(user.role);

  const { org, teams } = await queryAs(user, async (db) => {
    const [row] = await db
      .select()
      .from(tenantTable)
      .where(eq(tenantTable.id, user.tenantId))
      .limit(1);

    const teamRows = await db
      .select({
        id: teamTable.id,
        name: teamTable.name,
        branch: teamTable.branch,
        leaderName: userTable.fullName,
      })
      .from(teamTable)
      .leftJoin(userTable, eq(userTable.id, teamTable.leaderUserId));

    return { org: row, teams: teamRows };
  });

  const settings = (org?.settings ?? {}) as {
    defaultLanguages?: string[];
    compensation?: string;
    equalHousing?: boolean;
  };

  return (
    <>
      <PageHeader
        title="Organization"
        subtitle="Your company details, and the rules that apply to everything the CRM sends."
      />

      <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
        <Card>
          <div className="border-b border-subtle px-4 py-3">
            <h2 className="text-h3 font-semibold text-primary">Company</h2>
          </div>
          <div className="p-4">
            {isAdmin ? (
              <OrganizationForm
                name={org?.name ?? ""}
                companyNmls={org?.companyNmls ?? ""}
              />
            ) : (
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                    Name
                  </dt>
                  <dd className="mt-0.5 text-body text-primary">{org?.name}</dd>
                </div>
                <div>
                  <dt className="text-label font-semibold uppercase tracking-wide text-muted">
                    Company NMLS
                  </dt>
                  <dd className="mt-0.5 text-body text-primary tnum">{org?.companyNmls}</dd>
                </div>
              </dl>
            )}
            {!isAdmin ? (
              <p className="mt-3 text-small text-muted">
                Only an administrator can change these.
              </p>
            ) : null}
          </div>
        </Card>

        <Card>
          <div className="border-b border-subtle px-4 py-3">
            <h2 className="text-h3 font-semibold text-primary">Teams</h2>
          </div>
          <ul className="divide-y divide-subtle">
            {teams.map((t) => (
              <li key={t.id} className="flex items-baseline justify-between gap-3 px-4 py-2.5">
                <span>
                  <span className="block font-semibold text-primary">{t.name}</span>
                  <span className="block text-small text-muted">{t.branch}</span>
                </span>
                <span className="text-small text-secondary">
                  {t.leaderName ? `Led by ${t.leaderName}` : "No leader set"}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="border-b border-subtle px-4 py-3">
            <h2 className="text-h3 font-semibold text-primary">Compliance defaults</h2>
            <p className="mt-0.5 text-small text-muted">
              These apply to every message the CRM prepares or sends. They are not optional.
            </p>
          </div>
          <ul className="divide-y divide-subtle">
            {[
              {
                label: "Every message carries your licensing",
                value: `Loan Factory · NMLS #${org?.companyNmls ?? "320841"}, plus the loan officer's own NMLS.`,
              },
              {
                label: "Equal Housing Opportunity",
                value: settings.equalHousing
                  ? "Included on outbound communication."
                  : "Not set — this should be on.",
              },
              {
                label: "Compensation",
                value:
                  settings.compensation === "lender_paid_only"
                    ? "Lender-paid only. The CRM will not prepare borrower-paid comparisons."
                    : "Not set.",
              },
              {
                label: "Languages",
                value: `${(settings.defaultLanguages ?? ["en"]).map((l) => LANG[l] ?? l).join(" and ")}. Anything Ally writes in a language other than English is held for a human translation review.`,
              },
              {
                label: "Never automated",
                value:
                  "Rate locks, cash-to-close changes, payment changes, closing delays, and problem files. Ally drafts nothing for these — it only makes sure someone knows.",
              },
            ].map((row) => (
              <li key={row.label} className="px-4 py-2.5">
                <SectionLabel>{row.label}</SectionLabel>
                <p className="mt-0.5 text-body text-secondary">{row.value}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="border-b border-subtle px-4 py-3">
            <h2 className="text-h3 font-semibold text-primary">Your stages</h2>
            <p className="mt-0.5 text-small text-muted">
              The 20 stages every opportunity moves through, grouped into the five phases you
              see on the pipeline board. These are fixed in this version so that reporting
              means the same thing for everyone.
            </p>
          </div>
          <div className="grid gap-4 p-4 sm:grid-cols-5">
            {MACRO_PHASES.map((phase) => (
              <div key={phase}>
                <SectionLabel>{phase}</SectionLabel>
                <ol className="mt-1.5 space-y-1">
                  {stagesIn(phase).map((s) => (
                    <li key={s} className="flex gap-1.5 text-small text-secondary">
                      <span className="w-4 shrink-0 text-muted tnum">{stageNumber(s)}</span>
                      {STAGE_LABELS[s]}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
          <p className="border-t border-subtle px-4 py-2.5 text-small text-muted">
            {STAGES.length} stages. Stage and milestone dates are recorded by your team — the
            CRM shows where a relationship stands, it never runs the loan itself.
          </p>
        </Card>
      </div>
    </>
  );
}

const LANG: Record<string, string> = {
  en: "English",
  vi: "Vietnamese",
  zh: "Chinese",
  es: "Spanish",
  ru: "Russian",
};
