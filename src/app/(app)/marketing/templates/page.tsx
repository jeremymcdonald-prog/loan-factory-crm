import type { Metadata } from "next";
import Link from "next/link";
import { LibraryBig, ArrowLeft } from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import {
  listTemplates,
  templateCategories,
  templatePolicyCounts,
  listTemplateChoices,
  audienceSizes,
  companyNmls,
} from "@/lib/queries/marketing";
import { stageLabel, type Stage } from "@/lib/stages";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { NewCampaignButton } from "../new-campaign-button";
import { AUDIENCES, AUDIENCE_TYPES, POLICY, TEMPLATE_POLICIES, policyRead } from "../vocabulary";
import { TemplateFilters } from "./template-filters";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Template library" };
export const dynamic = "force-dynamic";

/** "All" first, then the ladder from no human needed to never a machine. */
const POLICY_TABS = [
  { key: "all", label: "Every template" },
  ...TEMPLATE_POLICIES.map((p) => ({ key: p as string, label: POLICY[p].label })),
];

export default async function TemplateLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; policy?: string }>;
}) {
  const { q, category = "all", policy = "all" } = await searchParams;
  const user = await requireUser();

  const { rows, categories, policyCounts, templates, sizes, nmls } = await queryAs(
    user,
    async (db) => ({
      rows: await listTemplates(db, { q, category, policy }),
      categories: await templateCategories(db),
      policyCounts: await templatePolicyCounts(db),
      templates: await listTemplateChoices(db),
      sizes: await audienceSizes(db, user, AUDIENCE_TYPES),
      nmls: await companyNmls(db, user),
    }),
  );

  const audiences = AUDIENCES.map((a) => ({ ...a, size: sizes[a.type] ?? 0 }));
  const filtered = Boolean(q) || category !== "all" || policy !== "all";

  const hrefFor = (nextPolicy: string) => {
    const params = new URLSearchParams();
    if (nextPolicy !== "all") params.set("policy", nextPolicy);
    if (category !== "all") params.set("category", category);
    if (q) params.set("q", q);
    const query = params.toString();
    return `/marketing/templates${query ? `?${query}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Template library"
        subtitle="Every message your team has written and had reviewed. Read one before you send it."
        meta={
          <Link
            href="/marketing"
            className="inline-flex items-center gap-1.5 text-small font-semibold text-action hover:underline"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Back to campaigns
          </Link>
        }
        action={
          <NewCampaignButton templates={templates} audiences={audiences} companyNmls={nmls} />
        }
      />

      <div className="px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          {/* Policy first: it's the filter that decides what you're allowed to do. */}
          <nav className="flex flex-wrap gap-1" aria-label="Filter by how it can be sent">
            {POLICY_TABS.map((tab) => {
              const active = policy === tab.key;
              const count = policyCounts[tab.key] ?? 0;
              return (
                <Link
                  key={tab.key}
                  href={hrefFor(tab.key)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-small font-semibold transition-colors",
                    active
                      ? "bg-action text-action-fg"
                      : "text-secondary hover:bg-sunken hover:text-primary",
                  )}
                >
                  {tab.label}
                  <span className={cn("tnum text-micro", active ? "opacity-80" : "text-muted")}>
                    {count}
                  </span>
                </Link>
              );
            })}
          </nav>

          <TemplateFilters
            q={q ?? ""}
            category={category}
            policy={policy}
            categories={categories}
          />
        </div>

        {rows.length === 0 ? (
          <div className="mt-4 rounded-card border border-subtle bg-surface px-6 py-14 text-center">
            <LibraryBig className="mx-auto size-6 text-disabled" aria-hidden />
            <p className="mt-3 text-h3 font-semibold text-primary">
              {q ? `No template matches "${q}"` : "No template matches those filters"}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-body text-secondary">
              Try a different word, or widen the category and how it can be sent.
            </p>
            <Link
              href="/marketing/templates"
              className="mt-4 inline-flex h-9 items-center rounded-control bg-action px-3.5 text-body font-semibold text-action-fg hover:bg-action-hover"
            >
              Show every template
            </Link>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-card border border-subtle bg-surface">
            <table className="w-full text-body">
              <caption className="sr-only">Template library</caption>
              <thead>
                <tr className="border-b border-subtle bg-sunken text-label uppercase tracking-wide text-muted">
                  <th scope="col" className="px-4 py-2 text-left font-semibold">
                    Ref
                  </th>
                  <th scope="col" className="px-4 py-2 text-left font-semibold">
                    Name
                  </th>
                  <th scope="col" className="hidden px-4 py-2 text-left font-semibold md:table-cell">
                    What it&rsquo;s for
                  </th>
                  <th scope="col" className="hidden px-4 py-2 text-left font-semibold lg:table-cell">
                    Stage
                  </th>
                  <th scope="col" className="px-4 py-2 text-left font-semibold">
                    How it can be sent
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const read = policyRead(row.policy);
                  return (
                    <tr key={row.id} className="border-b border-subtle last:border-0 hover:bg-sunken">
                      <td className="px-4 py-2.5 align-top">
                        <Link
                          href={`/marketing/templates/${row.id}`}
                          className="font-mono text-small text-secondary hover:text-action"
                        >
                          {row.ref}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 align-top">
                        <Link
                          href={`/marketing/templates/${row.id}`}
                          className="font-semibold text-primary hover:text-action"
                        >
                          {row.name}
                        </Link>
                        {/* The category still has to be readable where the column is gone. */}
                        <span className="block text-small text-muted md:hidden">
                          {row.category}
                        </span>
                      </td>
                      <td className="hidden px-4 py-2.5 align-top text-secondary md:table-cell">
                        {row.category}
                      </td>
                      <td className="hidden px-4 py-2.5 align-top lg:table-cell">
                        {row.stage ? (
                          <span className="text-small text-secondary">
                            {stageLabel(row.stage as Stage)}
                          </span>
                        ) : (
                          <span className="text-small text-muted">Any stage</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 align-top">
                        <Badge tone={read.tone}>{read.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-3 text-small text-muted">
          {filtered ? (
            <>
              Showing <span className="tnum">{rows.length}</span> of{" "}
              <span className="tnum">{policyCounts.all ?? 0}</span> templates.{" "}
              <Link href="/marketing/templates" className="font-semibold text-action hover:underline">
                Clear the filters
              </Link>
            </>
          ) : (
            <>
              All <span className="tnum">{rows.length}</span> templates. Every one has been
              through compliance review.
            </>
          )}
        </p>
      </div>
    </>
  );
}
