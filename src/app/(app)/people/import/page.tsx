import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/shell/page-header";
import { ImportFlow } from "./import-flow";

export const metadata: Metadata = { title: "Import people" };
export const dynamic = "force-dynamic";

/**
 * CSV / Excel import — one self-contained flow: upload, map columns, confirm.
 * Parsing happens server-side (src/lib/import); nothing is written until the
 * mapping is confirmed, and duplicates by email are never inserted.
 */
export default async function ImportPeoplePage() {
  await requireUser();

  return (
    <>
      <PageHeader
        title="Import people"
        subtitle="Bring in a list from a spreadsheet. You confirm the column mapping before anything is saved."
      />
      <div className="px-4 py-4 sm:px-6">
        <ImportFlow />
      </div>
    </>
  );
}
