"use server";

/**
 * Partner import — CSV or Excel, parsed server-side with the `xlsx` package.
 *
 * Two steps, honestly separated: preview parses the file and shows exactly
 * what would be created (including what will be skipped and why) without
 * writing a single row; commit re-validates everything against the database
 * and writes, with an audit row per partner plus one summary row. Nothing is
 * imported that the user hasn't seen on screen first.
 */
import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as XLSX from "xlsx";
import { isNull } from "drizzle-orm";
import { partner } from "@/db/schema";
import type { Db } from "@/db";
import { requireUser, queryAs } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const MAX_ROWS = 500;

const KINDS = [
  "real_estate_agent",
  "builder",
  "financial_advisor",
  "attorney",
  "past_client",
  "other",
] as const;
const TIERS = ["target", "new", "growing", "core", "quiet"] as const;
const LANGUAGES = ["en", "vi", "zh", "es", "ru"] as const;

export type ImportRow = {
  firstName: string;
  lastName: string;
  company: string | null;
  kind: (typeof KINDS)[number];
  tier: (typeof TIERS)[number];
  email: string | null;
  phone: string | null;
  preferredLanguage: (typeof LANGUAGES)[number];
  notesSummary: string | null;
  /** Why this row can't import — null when it's ready. */
  problem: string | null;
  /** An existing partner already has this email — the row will be skipped. */
  duplicate: boolean;
};

export type PreviewState = {
  error?: string;
  fileName?: string;
  rows?: ImportRow[];
};

export type CommitState = {
  error?: string;
  imported?: number;
  skipped?: number;
};

/** Normalize a header cell: "First Name" / "first_name" / "FIRST" all match. */
function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const HEADER_MAP: Record<string, string> = {
  first: "firstName",
  firstname: "firstName",
  last: "lastName",
  lastname: "lastName",
  surname: "lastName",
  name: "fullName",
  fullname: "fullName",
  company: "company",
  brokerage: "company",
  firm: "company",
  email: "email",
  emailaddress: "email",
  phone: "phone",
  phonenumber: "phone",
  mobile: "phone",
  cell: "phone",
  kind: "kind",
  type: "kind",
  role: "kind",
  whattheydo: "kind",
  tier: "tier",
  relationship: "tier",
  language: "preferredLanguage",
  preferredlanguage: "preferredLanguage",
  notes: "notesSummary",
  note: "notesSummary",
};

/** Accept enum values and the labels a spreadsheet is more likely to hold. */
const KIND_ALIASES: Record<string, (typeof KINDS)[number]> = {
  realestateagent: "real_estate_agent",
  agent: "real_estate_agent",
  realtor: "real_estate_agent",
  builder: "builder",
  financialadvisor: "financial_advisor",
  advisor: "financial_advisor",
  attorney: "attorney",
  lawyer: "attorney",
  pastclient: "past_client",
  other: "other",
};

const TIER_ALIASES: Record<string, (typeof TIERS)[number]> = {
  target: "target",
  targets: "target",
  hotlist: "target",
  hot: "target",
  new: "new",
  growing: "growing",
  core: "core",
  quiet: "quiet",
};

const LANGUAGE_ALIASES: Record<string, (typeof LANGUAGES)[number]> = {
  en: "en",
  english: "en",
  vi: "vi",
  vietnamese: "vi",
  zh: "zh",
  chinese: "zh",
  es: "es",
  spanish: "es",
  ru: "ru",
  russian: "ru",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(value: unknown): string {
  return String(value ?? "").trim();
}

/** One raw spreadsheet row → a validated ImportRow with its problems named. */
function toImportRow(raw: Record<string, unknown>): ImportRow {
  const mapped: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    const field = HEADER_MAP[normalizeKey(key)];
    if (field && !mapped[field]) mapped[field] = str(value);
  }

  let firstName = mapped.firstName ?? "";
  let lastName = mapped.lastName ?? "";
  if (!firstName && mapped.fullName) {
    const parts = mapped.fullName.split(/\s+/);
    firstName = parts[0] ?? "";
    lastName = parts.slice(1).join(" ");
  }

  const email = (mapped.email ?? "").toLowerCase() || null;
  const phone = mapped.phone || null;

  const row: ImportRow = {
    firstName,
    lastName,
    company: mapped.company || null,
    kind: KIND_ALIASES[normalizeKey(mapped.kind ?? "")] ?? "real_estate_agent",
    tier: TIER_ALIASES[normalizeKey(mapped.tier ?? "")] ?? "new",
    email,
    phone,
    preferredLanguage: LANGUAGE_ALIASES[normalizeKey(mapped.preferredLanguage ?? "")] ?? "en",
    notesSummary: mapped.notesSummary || null,
    problem: null,
    duplicate: false,
  };

  if (!row.firstName || !row.lastName) {
    row.problem = "Needs a first and last name.";
  } else if (!row.email && !row.phone) {
    row.problem = "Needs an email or a phone number.";
  } else if (row.email && !EMAIL_RE.test(row.email)) {
    row.problem = "The email doesn't look like an email.";
  }

  return row;
}

/** Every email already on a partner in this tenant, lowercased. */
async function existingEmails(db: Db): Promise<Set<string>> {
  const rows = await db
    .select({ emails: partner.emails })
    .from(partner)
    .where(isNull(partner.deletedAt));

  const set = new Set<string>();
  for (const r of rows) {
    for (const e of r.emails ?? []) {
      if (e?.address) set.add(e.address.toLowerCase());
    }
  }
  return set;
}

export async function previewPartnerImport(
  _prev: PreviewState,
  formData: FormData,
): Promise<PreviewState> {
  const user = await requireUser();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a CSV or Excel file first." };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { error: "That file is bigger than 2 MB. Split it and try again." };
  }

  let raw: Record<string, unknown>[];
  try {
    const workbook = XLSX.read(Buffer.from(await file.arrayBuffer()), { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) return { error: "We couldn't find a sheet in that file." };
    raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  } catch {
    return { error: "We couldn't read that file. Save it as CSV or XLSX and try again." };
  }

  if (raw.length === 0) {
    return { error: "That file has headers but no rows." };
  }
  if (raw.length > MAX_ROWS) {
    return { error: `That's ${raw.length} rows — the limit is ${MAX_ROWS} per import.` };
  }

  const known = await queryAs(user, (db) => existingEmails(db));

  const seenInFile = new Set<string>();
  const rows = raw.map((r) => {
    const row = toImportRow(r);
    if (row.email && !row.problem) {
      if (known.has(row.email)) {
        row.duplicate = true;
      } else if (seenInFile.has(row.email)) {
        row.duplicate = true;
        row.problem = "Appears twice in this file.";
      } else {
        seenInFile.add(row.email);
      }
    }
    return row;
  });

  return { fileName: file.name, rows };
}

const CommitRowSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  company: z.string().trim().max(200).nullable(),
  kind: z.enum(KINDS),
  tier: z.enum(TIERS),
  email: z.string().trim().toLowerCase().regex(EMAIL_RE).nullable(),
  phone: z.string().trim().max(40).nullable(),
  preferredLanguage: z.enum(LANGUAGES),
  notesSummary: z.string().trim().max(2000).nullable(),
});

export async function commitPartnerImport(
  _prev: CommitState,
  formData: FormData,
): Promise<CommitState> {
  const user = await requireUser();

  let payload: unknown;
  try {
    payload = JSON.parse(String(formData.get("payload") ?? ""));
  } catch {
    return { error: "We couldn't read the rows to import. Start over." };
  }

  const parsed = z.array(CommitRowSchema).min(1).max(MAX_ROWS).safeParse(payload);
  if (!parsed.success) {
    return { error: "Some rows changed since the preview. Start over." };
  }
  const rows = parsed.data.filter((r) => r.email || r.phone);
  if (rows.length === 0) {
    return { error: "There's nothing ready to import." };
  }

  let imported = 0;
  let skipped = 0;

  try {
    await queryAs(user, async (db) => {
      // Re-check duplicates at commit time — the database is the authority,
      // not a preview that may be minutes old.
      const known = await existingEmails(db);
      const seen = new Set<string>();

      for (const row of rows) {
        if (row.email && (known.has(row.email) || seen.has(row.email))) {
          skipped++;
          continue;
        }
        if (row.email) seen.add(row.email);

        const [created] = await db
          .insert(partner)
          .values({
            tenantId: user.tenantId,
            firstName: row.firstName,
            lastName: row.lastName,
            company: row.company,
            kind: row.kind,
            tier: row.tier,
            emails: row.email ? [{ address: row.email, label: "work" }] : [],
            phones: row.phone ? [{ number: row.phone, label: "mobile", smsCapable: true }] : [],
            preferredLanguage: row.preferredLanguage,
            ownerUserId: user.userId,
            notesSummary: row.notesSummary,
          })
          .returning({ id: partner.id });

        await recordAudit(db, user, {
          action: "partner.imported",
          entity: "partner",
          entityId: created.id,
          changes: {
            name: { from: null, to: `${row.firstName} ${row.lastName}` },
            tier: { from: null, to: row.tier },
          },
        });
        imported++;
      }

      await recordAudit(db, user, {
        action: "partner.import_completed",
        entity: "partner",
        changes: {
          imported: { from: null, to: imported },
          skippedAsDuplicates: { from: null, to: skipped },
        },
      });
    });
  } catch {
    // queryAs runs one transaction, so a failure rolls the whole batch back.
    return { error: "The import failed. Nothing was imported — try again." };
  }

  revalidatePath("/partners");
  return { imported, skipped };
}
