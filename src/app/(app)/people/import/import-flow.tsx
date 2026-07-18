"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { FileUp, CheckCircle2 } from "lucide-react";
import {
  previewImport,
  runImport,
  type PreviewState,
  type RunImportState,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Select } from "@/components/ui/field";

// Mirrors src/lib/import/parse.ts (that module is server-only, so the client
// carries its own copy of the vocabulary).
const PERSON_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "type",
  "preferredLanguage",
  "source",
] as const;

const PERSON_FIELD_LABELS: Record<(typeof PERSON_FIELDS)[number], string> = {
  firstName: "First name",
  lastName: "Last name",
  email: "Email",
  phone: "Phone",
  type: "Type",
  preferredLanguage: "Preferred language",
  source: "Source",
};

const MAX_KB = 900;

export function ImportFlow() {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [previewState, previewAction, previewPending] = useActionState<PreviewState, FormData>(
    previewImport,
    {},
  );
  const [importState, importAction, importPending] = useActionState<RunImportState, FormData>(
    runImport,
    {},
  );
  const [, startTransition] = useTransition();
  const mappingFormRef = useRef<HTMLFormElement>(null);

  const preview = previewState.preview;
  const result = importState.result;

  // Step 3 — done.
  if (result) {
    return (
      <Card className="mx-auto max-w-2xl">
        <div className="px-6 py-10 text-center">
          <CheckCircle2 className="mx-auto size-8 text-healthy" aria-hidden />
          <h2 className="mt-3 text-h2 font-semibold text-primary">
            {result.imported} {result.imported === 1 ? "person" : "people"} imported
          </h2>
          <div className="mx-auto mt-3 max-w-md space-y-1 text-body text-secondary">
            {result.skippedDuplicates > 0 ? (
              <p>
                {result.skippedDuplicates} skipped — their email already belongs to someone in
                your book.
              </p>
            ) : null}
            {result.skippedInvalid > 0 ? (
              <p>{result.skippedInvalid} skipped — no name and no email to file them under.</p>
            ) : null}
            {result.invalidEmails > 0 ? (
              <p>
                {result.invalidEmails} {result.invalidEmails === 1 ? "row" : "rows"} imported
                without an email because the address didn&rsquo;t read as one.
              </p>
            ) : null}
            {result.truncatedAt ? (
              <p>
                The file held more than {result.truncatedAt} rows; only the first{" "}
                {result.truncatedAt} were read. Import the rest in a second file.
              </p>
            ) : null}
          </div>
          <div className="mt-6 flex justify-center gap-2">
            <Link
              href="/people"
              className="inline-flex h-9 items-center gap-2 rounded-control bg-action px-3.5 text-body font-semibold text-action-fg shadow-e1 hover:bg-action-hover"
            >
              Back to People
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  // Step 2 — map columns and confirm.
  if (preview && file) {
    const confirm = (formEl: HTMLFormElement) => {
      const fd = new FormData(formEl);
      // The browser held the File; the server re-parses it on confirm.
      fd.set("file", file);
      startTransition(() => importAction(fd));
    };

    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Card>
          <div className="border-b border-subtle px-4 py-3">
            <h2 className="text-h3 font-semibold text-primary">Match columns to fields</h2>
            <p className="mt-0.5 text-small text-muted">
              {preview.fileName} · {preview.totalRows} data{" "}
              {preview.totalRows === 1 ? "row" : "rows"}
              {preview.truncated ? " (only the first 2,000 will import)" : ""}
            </p>
          </div>

          <form
            ref={mappingFormRef}
            onSubmit={(e) => {
              e.preventDefault();
              confirm(e.currentTarget);
            }}
            className="space-y-4 p-4"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PERSON_FIELDS.map((field) => (
                <Field key={field} label={PERSON_FIELD_LABELS[field]} htmlFor={`col_${field}`}>
                  <Select
                    id={`col_${field}`}
                    name={`col_${field}`}
                    defaultValue={
                      preview.suggested[field] !== undefined ? String(preview.suggested[field]) : ""
                    }
                  >
                    <option value="">Don&rsquo;t import</option>
                    {preview.headers.map((header, index) => (
                      <option key={index} value={String(index)}>
                        {header || `Column ${index + 1}`}
                      </option>
                    ))}
                  </Select>
                </Field>
              ))}
            </div>

            <div className="rounded-md border border-subtle bg-sunken px-3 py-2 text-small text-secondary">
              <p>
                Rows without a mapped type import as <strong>leads</strong>. Rows whose email
                already belongs to someone in your book are skipped, never duplicated. Imported
                people land in your book — nothing is emailed, texted, or sent to anyone.
              </p>
            </div>

            {importState.error ? (
              <p
                role="alert"
                className="rounded-md border border-critical/25 bg-critical-bg px-3 py-2 text-small text-critical"
              >
                {importState.error}
              </p>
            ) : null}

            <div className="flex items-center gap-2">
              <Button type="submit" variant="primary" disabled={importPending}>
                {importPending
                  ? "Importing…"
                  : `Import ${preview.totalRows} ${preview.totalRows === 1 ? "row" : "rows"}`}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => window.location.reload()}
                disabled={importPending}
              >
                Start over
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <div className="border-b border-subtle px-4 py-3">
            <h2 className="text-h3 font-semibold text-primary">First rows of the file</h2>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full text-small">
              <caption className="sr-only">Preview of the uploaded file</caption>
              <thead>
                <tr className="border-b border-subtle text-label uppercase tracking-wide text-muted">
                  {preview.headers.map((header, index) => (
                    <th key={index} scope="col" className="px-2 py-1.5 text-left font-semibold">
                      {header || `Column ${index + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.sample.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-subtle last:border-0">
                    {preview.headers.map((_, colIndex) => (
                      <td key={colIndex} className="px-2 py-1.5 text-secondary">
                        {row[colIndex] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  // Step 1 — choose the file.
  return (
    <Card className="mx-auto max-w-2xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!file) {
            setFileError("Choose a .csv or .xlsx file first.");
            return;
          }
          const fd = new FormData();
          fd.set("file", file);
          startTransition(() => previewAction(fd));
        }}
        className="space-y-4 p-6"
      >
        <div className="text-center">
          <FileUp className="mx-auto size-7 text-disabled" aria-hidden />
          <h2 className="mt-2 text-h3 font-semibold text-primary">Upload a spreadsheet</h2>
          <p className="mx-auto mt-1 max-w-md text-body text-secondary">
            A .csv or .xlsx up to {MAX_KB} KB. You&rsquo;ll match its columns to person fields
            and see a preview before anything is saved.
          </p>
        </div>

        <Field label="File" htmlFor="import-file">
          <input
            id="import-file"
            type="file"
            accept=".csv,.xlsx"
            onChange={(e) => {
              const next = e.target.files?.[0] ?? null;
              setFile(next);
              setFileError(
                next && next.size > MAX_KB * 1024
                  ? `That file is ${Math.round(next.size / 1024)} KB — imports are limited to ${MAX_KB} KB. Split the list and import it in parts.`
                  : null,
              );
            }}
            className="block w-full text-body text-primary file:mr-3 file:rounded-control file:border file:border-strong file:bg-surface file:px-3 file:py-1.5 file:text-small file:font-semibold file:text-primary hover:file:bg-sunken"
          />
        </Field>

        {fileError || previewState.error ? (
          <p
            role="alert"
            className="rounded-md border border-critical/25 bg-critical-bg px-3 py-2 text-small text-critical"
          >
            {fileError ?? previewState.error}
          </p>
        ) : null}

        <div className="flex items-center gap-2">
          <Button
            type="submit"
            variant="primary"
            disabled={previewPending || !file || Boolean(fileError)}
          >
            {previewPending ? "Reading…" : "Continue"}
          </Button>
          <Link href="/people" className="text-body font-medium text-secondary hover:text-primary">
            Cancel
          </Link>
        </div>
      </form>
    </Card>
  );
}
