"use server";

import { revalidatePath } from "next/cache";
import { person } from "@/db/schema";
import { requireUser, queryAs, requireRole, type CurrentUser } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { ROLES } from "@/lib/roles";
import { existingEmailSet } from "@/lib/queries/people";
import {
  IMPORT_MAX_BYTES,
  IMPORT_MAX_ROWS,
  PREVIEW_ROWS,
  hasImportExtension,
  parseSpreadsheet,
  suggestMapping,
  buildPeople,
  mappingFromForm,
  type ColumnMapping,
} from "@/lib/import/parse";

/**
 * Every staff role may import into their own book — the rows land owned by
 * the importer, so the scope is inherent. The check still runs so a session
 * carrying an unknown role never reaches a write.
 */
function requireStaff(user: CurrentUser) {
  requireRole(user, [...ROLES]);
}

const FILE_ERRORS: Record<string, string> = {
  missing: "Choose a .csv or .xlsx file first.",
  extension: "That file isn't a .csv or .xlsx. Export your list in one of those formats.",
  size: `That file is too big. Imports are limited to ${Math.round(IMPORT_MAX_BYTES / 1024)} KB — split the list and import it in parts.`,
  unreadable: "We couldn't read that file as a spreadsheet. Re-export it and try again.",
  empty: "That file has no data rows — just a header or nothing at all.",
};

/** Validate the upload and hand back its bytes, or the key of what's wrong. */
async function readUpload(
  formData: FormData,
): Promise<{ buffer: Buffer; fileName: string } | { fileError: string }> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { fileError: "missing" };
  if (!hasImportExtension(file.name)) return { fileError: "extension" };
  if (file.size > IMPORT_MAX_BYTES) return { fileError: "size" };
  return { buffer: Buffer.from(await file.arrayBuffer()), fileName: file.name };
}

export type ImportPreview = {
  fileName: string;
  headers: string[];
  /** The first PREVIEW_ROWS data rows, for the mapping screen. */
  sample: string[][];
  totalRows: number;
  truncated: boolean;
  suggested: ColumnMapping;
};

export type PreviewState = { error?: string; preview?: ImportPreview };

/**
 * Step 1: parse the upload and show what's in it. Reads only — nothing is
 * written until the user confirms the mapping in runImport.
 */
export async function previewImport(
  _prev: PreviewState,
  formData: FormData,
): Promise<PreviewState> {
  const user = await requireUser();

  try {
    requireStaff(user);
  } catch {
    return { error: "You do not have permission to import people." };
  }

  const upload = await readUpload(formData);
  if ("fileError" in upload) return { error: FILE_ERRORS[upload.fileError] };

  try {
    const sheet = parseSpreadsheet(upload.buffer);
    return {
      preview: {
        fileName: upload.fileName,
        headers: sheet.headers,
        sample: sheet.rows.slice(0, PREVIEW_ROWS),
        totalRows: sheet.totalRows,
        truncated: sheet.truncated,
        suggested: suggestMapping(sheet.headers),
      },
    };
  } catch (error) {
    const key = error instanceof Error ? error.message : "unreadable";
    return { error: FILE_ERRORS[key] ?? FILE_ERRORS.unreadable };
  }
}

export type ImportResult = {
  imported: number;
  skippedDuplicates: number;
  skippedInvalid: number;
  invalidEmails: number;
  truncatedAt: number | null;
};

export type RunImportState = { error?: string; result?: ImportResult };

const INSERT_CHUNK = 250;

/**
 * Step 2: the confirmed import. The file is re-parsed server-side (the browser
 * only ever held the File object, never the parsed data), the mapping is read
 * from the form, rows are deduped by email against the existing book, and the
 * survivors are inserted in one transaction with an audit entry.
 */
export async function runImport(
  _prev: RunImportState,
  formData: FormData,
): Promise<RunImportState> {
  const user = await requireUser();

  try {
    requireStaff(user);
  } catch {
    return { error: "You do not have permission to import people." };
  }

  const upload = await readUpload(formData);
  if ("fileError" in upload) return { error: FILE_ERRORS[upload.fileError] };

  let result: ImportResult;

  try {
    const sheet = parseSpreadsheet(upload.buffer);
    const mapping = mappingFromForm((name) => formData.get(name), sheet.headers.length);

    if (mapping.firstName === undefined && mapping.email === undefined) {
      return {
        error: "Map at least a first name or an email column so each row has an identity.",
      };
    }

    const built = buildPeople(sheet.rows, mapping);
    if (built.people.length === 0) {
      return { error: "No rows survived the mapping — every row was missing a name and email." };
    }

    result = await queryAs(user, async (db) => {
      const existing = await existingEmailSet(db);
      const seenInFile = new Set<string>();
      let skippedDuplicates = 0;

      const toInsert = built.people.filter((p) => {
        if (!p.email) return true;
        if (existing.has(p.email) || seenInFile.has(p.email)) {
          skippedDuplicates += 1;
          return false;
        }
        seenInFile.add(p.email);
        return true;
      });

      for (let i = 0; i < toInsert.length; i += INSERT_CHUNK) {
        const chunk = toInsert.slice(i, i + INSERT_CHUNK);
        await db.insert(person).values(
          chunk.map((p) => ({
            tenantId: user.tenantId,
            firstName: p.firstName,
            lastName: p.lastName,
            emails: p.email ? [{ address: p.email, label: "personal" }] : [],
            phones: p.phone ? [{ number: p.phone, label: "mobile", smsCapable: true }] : [],
            preferredLanguage: p.preferredLanguage,
            type: p.type,
            ownerUserId: user.userId,
            source: {
              channel: "csv_import",
              detail: p.source ?? upload.fileName,
            },
          })),
        );
      }

      await recordAudit(db, user, {
        action: "person.imported",
        entity: "person",
        changes: {
          count: { from: null, to: toInsert.length },
          file: { from: null, to: upload.fileName },
          skippedDuplicates: { from: null, to: skippedDuplicates },
          skippedInvalid: { from: null, to: built.skippedInvalid },
        },
      });

      return {
        imported: toInsert.length,
        skippedDuplicates,
        skippedInvalid: built.skippedInvalid,
        invalidEmails: built.invalidEmails,
        truncatedAt: sheet.truncated ? IMPORT_MAX_ROWS : null,
      };
    });
  } catch (error) {
    const key = error instanceof Error ? error.message : "";
    if (FILE_ERRORS[key]) return { error: FILE_ERRORS[key] };
    return { error: "The import failed and nothing was saved. Try again." };
  }

  revalidatePath("/people");
  revalidatePath("/today");
  return { result };
}
