/**
 * Spreadsheet import parsing — the People import flow's read layer.
 *
 * Server-only on purpose: the `xlsx` package parses the raw upload here, never
 * in the browser. Nothing in this module touches the database — it turns an
 * uploaded .csv/.xlsx into typed rows the import action can validate, dedupe,
 * and insert inside the caller's tenant context.
 */
import "server-only";
import * as XLSX from "xlsx";

/**
 * Server Actions carry the whole multipart body, and Next's default body limit
 * is 1 MB. Capping the file below that turns "request rejected by the server"
 * into an error message that says what to do instead.
 */
export const IMPORT_MAX_BYTES = 900 * 1024;
export const IMPORT_MAX_ROWS = 2000;
export const PREVIEW_ROWS = 8;

export const IMPORT_EXTENSIONS = [".csv", ".xlsx"] as const;

/** The person fields a spreadsheet column can map onto. */
export const PERSON_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "type",
  "preferredLanguage",
  "source",
] as const;

export type PersonField = (typeof PERSON_FIELDS)[number];

export const PERSON_FIELD_LABELS: Record<PersonField, string> = {
  firstName: "First name",
  lastName: "Last name",
  email: "Email",
  phone: "Phone",
  type: "Type",
  preferredLanguage: "Preferred language",
  source: "Source",
};

/** field → column index in the sheet. Absent = not mapped. */
export type ColumnMapping = Partial<Record<PersonField, number>>;

export type ParsedSheet = {
  headers: string[];
  /** Data rows (headers excluded), as trimmed strings. */
  rows: string[][];
  totalRows: number;
  /** True when the sheet held more than IMPORT_MAX_ROWS and was cut. */
  truncated: boolean;
};

export function hasImportExtension(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return IMPORT_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/**
 * Parse an uploaded .csv or .xlsx into headers + string rows.
 * Throws `unreadable` when the bytes aren't a spreadsheet, `empty` when there
 * is nothing usable in it.
 */
export function parseSpreadsheet(buffer: Buffer): ParsedSheet {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "buffer" });
  } catch {
    throw new Error("unreadable");
  }

  const sheetName = workbook.SheetNames[0];
  const sheet = sheetName ? workbook.Sheets[sheetName] : undefined;
  if (!sheet) throw new Error("empty");

  const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: false,
    defval: "",
  });

  const grid = raw
    .map((row) => (Array.isArray(row) ? row.map((cell) => String(cell ?? "").trim()) : []))
    .filter((row) => row.some((cell) => cell !== ""));

  if (grid.length < 2) throw new Error("empty");

  const headers = grid[0];
  const body = grid.slice(1);
  const truncated = body.length > IMPORT_MAX_ROWS;

  return {
    headers,
    rows: truncated ? body.slice(0, IMPORT_MAX_ROWS) : body,
    totalRows: body.length,
    truncated,
  };
}

// --- Mapping suggestions -----------------------------------------------------

const HEADER_HINTS: Record<PersonField, RegExp[]> = {
  firstName: [/^first[ _-]?name$/i, /^first$/i, /^fname$/i, /given/i],
  lastName: [/^last[ _-]?name$/i, /^last$/i, /^lname$/i, /surname/i, /family/i],
  email: [/e-?mail/i],
  phone: [/phone/i, /mobile/i, /cell/i],
  type: [/^type$/i, /^segment$/i, /^category$/i, /^contact[ _-]?type$/i],
  preferredLanguage: [/lang/i],
  source: [/source/i, /referr/i, /channel/i, /origin/i, /campaign/i],
};

/** Best-guess column mapping from the header names. The user confirms it. */
export function suggestMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  for (const field of PERSON_FIELDS) {
    const index = headers.findIndex(
      (h) => h !== "" && HEADER_HINTS[field].some((hint) => hint.test(h)),
    );
    if (index >= 0 && !Object.values(mapping).includes(index)) {
      mapping[field] = index;
    }
  }
  return mapping;
}

// --- Value normalization -----------------------------------------------------

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

export type PersonTypeValue = "lead" | "borrower" | "past_client" | "other";

/** Loose text → person type. Null when the cell doesn't say (import defaults to lead). */
export function normalizeType(value: string): PersonTypeValue | null {
  const v = value.trim().toLowerCase();
  if (!v) return null;
  if (v.includes("past")) return "past_client";
  if (v.includes("borrower")) return "borrower";
  if (v === "lead" || v === "prospect" || v.includes("lead")) return "lead";
  if (v === "other" || v.includes("contact") || v.includes("misc") || v.includes("sphere")) {
    return "other";
  }
  return null;
}

export type LanguageCode = "en" | "vi" | "zh" | "es" | "ru";

export function normalizeLanguage(value: string): LanguageCode {
  const v = value.trim().toLowerCase();
  if (v === "vi" || v.startsWith("viet")) return "vi";
  if (v === "zh" || v.startsWith("chin") || v.startsWith("mand") || v.startsWith("cant")) {
    return "zh";
  }
  if (v === "es" || v.startsWith("span")) return "es";
  if (v === "ru" || v.startsWith("russ")) return "ru";
  return "en";
}

// --- Row → person ------------------------------------------------------------

export type ImportPerson = {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  type: PersonTypeValue;
  preferredLanguage: LanguageCode;
  source: string | null;
};

export type BuildResult = {
  people: ImportPerson[];
  /** Rows with no name and no email — nothing to file them under. */
  skippedInvalid: number;
  /** Cells that looked like emails but weren't; the row imports without one. */
  invalidEmails: number;
};

function cell(row: string[], index: number | undefined): string {
  if (index === undefined) return "";
  return (row[index] ?? "").trim();
}

/**
 * Apply a confirmed mapping to the parsed rows. Rows that carry neither a name
 * nor an email are skipped and counted — importing a person nobody can
 * identify or reach would just be a blank row in the book.
 */
export function buildPeople(rows: string[][], mapping: ColumnMapping): BuildResult {
  const people: ImportPerson[] = [];
  let skippedInvalid = 0;
  let invalidEmails = 0;

  for (const row of rows) {
    const firstName = cell(row, mapping.firstName);
    const lastName = cell(row, mapping.lastName);
    const rawEmail = cell(row, mapping.email).toLowerCase();
    const phone = cell(row, mapping.phone);

    const email = rawEmail && isValidEmail(rawEmail) ? rawEmail : null;
    if (rawEmail && !email) invalidEmails += 1;

    if (!firstName && !lastName && !email) {
      skippedInvalid += 1;
      continue;
    }

    people.push({
      // A person row needs a first name; fall back to what the row does have.
      // When the fallback consumed the last name (or email), don't repeat it.
      firstName: firstName || lastName || email || "Unknown",
      lastName: firstName ? lastName : "",
      email,
      phone: phone || null,
      type: normalizeType(cell(row, mapping.type)) ?? "lead",
      preferredLanguage: normalizeLanguage(cell(row, mapping.preferredLanguage)),
      source: cell(row, mapping.source) || null,
    });
  }

  return { people, skippedInvalid, invalidEmails };
}

/** Read a mapping back out of the confirm form. Values are column indexes. */
export function mappingFromForm(
  get: (name: string) => FormDataEntryValue | null,
  headerCount: number,
): ColumnMapping {
  const mapping: ColumnMapping = {};
  for (const field of PERSON_FIELDS) {
    const raw = get(`col_${field}`);
    if (typeof raw !== "string" || raw === "") continue;
    const index = Number(raw);
    if (Number.isInteger(index) && index >= 0 && index < headerCount) {
      mapping[field] = index;
    }
  }
  return mapping;
}
