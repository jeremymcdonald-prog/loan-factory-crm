"use client";

/**
 * The partner import wizard: choose a file, see exactly what will happen to
 * every row, then import. No row is written that wasn't shown first, and
 * duplicates (matched by email against partners you already have) are skipped
 * and say so on screen.
 */
import { useActionState, useMemo } from "react";
import Link from "next/link";
import { FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import {
  previewPartnerImport,
  commitPartnerImport,
  type PreviewState,
  type CommitState,
  type ImportRow,
} from "./actions";
import { PARTNER_KIND_LABELS, PARTNER_TIER_LABELS } from "../vocabulary";

function rowStatus(row: ImportRow): { tone: "healthy" | "warning" | "critical"; label: string } {
  if (row.problem) return { tone: "critical", label: row.problem };
  if (row.duplicate) return { tone: "warning", label: "Already a partner — skipped" };
  return { tone: "healthy", label: "Ready" };
}

export function ImportWizard() {
  const [preview, previewAction, previewPending] = useActionState<PreviewState, FormData>(
    previewPartnerImport,
    {},
  );
  const [commit, commitAction, commitPending] = useActionState<CommitState, FormData>(
    commitPartnerImport,
    {},
  );

  const rows = useMemo(() => preview.rows ?? [], [preview.rows]);
  const ready = useMemo(() => rows.filter((r) => !r.problem && !r.duplicate), [rows]);
  const skipped = rows.length - ready.length;

  // Only what the user saw marked "Ready" is handed to the commit action —
  // and the server re-checks duplicates against the database anyway.
  const payload = useMemo(
    () =>
      JSON.stringify(
        ready.map((row) => ({
          firstName: row.firstName,
          lastName: row.lastName,
          company: row.company,
          kind: row.kind,
          tier: row.tier,
          email: row.email,
          phone: row.phone,
          preferredLanguage: row.preferredLanguage,
          notesSummary: row.notesSummary,
        })),
      ),
    [ready],
  );

  if (commit.imported !== undefined) {
    return (
      <div className="rounded-card border border-subtle bg-surface px-6 py-12 text-center">
        <CheckCircle2 className="mx-auto size-6 text-healthy" aria-hidden />
        <p className="mt-3 text-h3 font-semibold text-primary">
          Imported {commit.imported} partner{commit.imported === 1 ? "" : "s"}
        </p>
        <p className="mx-auto mt-1 max-w-sm text-body text-secondary">
          {commit.skipped
            ? `${commit.skipped} row${commit.skipped === 1 ? " was" : "s were"} skipped as duplicates of partners you already have.`
            : "Every row in the file was imported."}
        </p>
        <Link
          href="/partners"
          className="mt-4 inline-flex h-9 items-center rounded-control bg-action px-3.5 text-body font-semibold text-action-fg shadow-e1 hover:bg-action-hover"
        >
          Back to Partners
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form action={previewAction} className="rounded-card border border-subtle bg-surface p-4">
        <Field
          label="Choose a file"
          htmlFor="import-file"
          hint="CSV or Excel, up to 500 rows. Columns we understand: first name, last name, company, email, phone, kind, tier, language, notes."
        >
          <Input
            id="import-file"
            name="file"
            type="file"
            accept=".csv,.xlsx,.xls"
            required
            className="h-auto py-2"
          />
        </Field>
        {preview.error ? (
          <p role="alert" className="mt-3 text-small text-critical">
            {preview.error}
          </p>
        ) : null}
        <div className="mt-4">
          <Button type="submit" variant="primary" disabled={previewPending}>
            <FileSpreadsheet className="size-4" aria-hidden />
            {previewPending ? "Reading…" : rows.length > 0 ? "Preview a different file" : "Preview"}
          </Button>
        </div>
      </form>

      {rows.length > 0 ? (
        <div className="rounded-card border border-subtle bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-subtle px-4 py-3">
            <div>
              <h2 className="text-h3 font-semibold text-primary">
                {preview.fileName ?? "Preview"}
              </h2>
              <p className="mt-0.5 text-small text-muted tnum">
                {ready.length} ready to import
                {skipped > 0 ? ` · ${skipped} will be skipped` : ""}
              </p>
            </div>
            <form action={commitAction}>
              <input type="hidden" name="payload" value={payload} />
              <Button
                type="submit"
                variant="primary"
                disabled={commitPending || ready.length === 0}
              >
                {commitPending
                  ? "Importing…"
                  : `Import ${ready.length} partner${ready.length === 1 ? "" : "s"}`}
              </Button>
            </form>
          </div>

          {commit.error ? (
            <p role="alert" className="border-b border-subtle px-4 py-2 text-small text-critical">
              {commit.error}
            </p>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full text-body">
              <caption className="sr-only">Rows found in the file</caption>
              <thead>
                <tr className="border-b border-subtle bg-sunken text-label uppercase tracking-wide text-muted">
                  <th scope="col" className="px-4 py-2 text-left font-semibold">
                    Name
                  </th>
                  <th scope="col" className="hidden px-4 py-2 text-left font-semibold sm:table-cell">
                    Email
                  </th>
                  <th scope="col" className="hidden px-4 py-2 text-left font-semibold md:table-cell">
                    What they do
                  </th>
                  <th scope="col" className="hidden px-4 py-2 text-left font-semibold md:table-cell">
                    Tier
                  </th>
                  <th scope="col" className="px-4 py-2 text-left font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const status = rowStatus(row);
                  return (
                    <tr key={i} className="border-b border-subtle last:border-0">
                      <td className="px-4 py-2.5">
                        <span className="block font-semibold text-primary">
                          {row.firstName || "—"} {row.lastName}
                        </span>
                        {row.company ? (
                          <span className="block text-small text-muted">{row.company}</span>
                        ) : null}
                      </td>
                      <td className="hidden px-4 py-2.5 text-secondary sm:table-cell">
                        {row.email ?? row.phone ?? "—"}
                      </td>
                      <td className="hidden px-4 py-2.5 text-secondary md:table-cell">
                        {PARTNER_KIND_LABELS[row.kind]}
                      </td>
                      <td className="hidden px-4 py-2.5 text-secondary md:table-cell">
                        {PARTNER_TIER_LABELS[row.tier]}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
