import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/shell/page-header";
import { ImportWizard } from "./import-wizard";

export const metadata: Metadata = { title: "Import partners" };
export const dynamic = "force-dynamic";

export default async function PartnerImportPage() {
  await requireUser();

  return (
    <>
      <PageHeader
        title="Import partners"
        subtitle="Bring in a spreadsheet of agents, builders, and advisors. You'll see every row before anything is created, and partners you already have (matched by email) are skipped."
        action={
          <Link
            href="/partners"
            className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-control border border-strong bg-surface px-3.5 text-body font-semibold text-primary shadow-e1 transition-colors hover:bg-sunken"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to Partners
          </Link>
        }
      />
      <div className="px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <ImportWizard />
        </div>
      </div>
    </>
  );
}
