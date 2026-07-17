/**
 * Import the mortgage communication framework into the template library.
 *
 * Source of truth is source_assets/communication-framework — the committed
 * EMT-001..135 master templates. This parses them rather than restating them,
 * so the library in the product is the library the compliance team wrote.
 *
 * The `automation_ready` field becomes the policy that governs whether AI may
 * draft the template at all. "Manual Only" and anything touching a
 * Never-Automate topic never becomes an approvable AI card.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { Stage } from "@/lib/stages";

const TEMPLATE_DIR = "source_assets/communication-framework/email-templates";

export type ParsedTemplate = {
  ref: string;
  name: string;
  category: string;
  subject: string | null;
  body: string;
  policy: "fully_automated" | "semi_automated" | "manual_only" | "never_automate";
  stage: Stage | null;
  mergeFields: string[];
  complianceNotes: string | null;
};

/**
 * The framework's own stage vocabulary → our locked 20-stage enum.
 * Several framework stages are coarser than ours (its "Processing" spans four
 * of our stages), so this maps to the earliest stage where the template
 * legitimately applies. Unmapped values stay null rather than guessing.
 */
const STAGE_MAP: Record<string, Stage> = {
  Lead: "new_lead",
  Application: "application",
  Disclosures: "disclosures",
  Processing: "processing",
  Underwriting: "submitted_to_underwriting",
  Conditions: "conditional_approval",
  Closing: "closing_scheduled",
  Funding: "funded",
  "Past Client": "post_close",
  Referral: "referral_retention",
};

const POLICY_MAP: Record<string, ParsedTemplate["policy"]> = {
  "Fully Automated": "fully_automated",
  "Semi Automated": "semi_automated",
  "Manual Only": "manual_only",
};

/**
 * Topics the communication framework marks Never Automate. AI must not draft
 * or queue these at all — it only creates a human-review task
 * (Automation_Catalog §1, tier T0).
 */
const NEVER_AUTOMATE_CATEGORIES = ["Problem File and Delay Templates"];

function field(block: string, key: string): string | null {
  const match = block.match(new RegExp(`^${key}:\\s*"?([^"\\n]*)"?\\s*$`, "m"));
  return match ? match[1].trim() : null;
}

function listField(block: string, key: string): string[] {
  const start = block.indexOf(`${key}:`);
  if (start === -1) return [];
  const after = block.slice(start + key.length + 1);
  const lines = after.split("\n");
  const out: string[] = [];
  for (const line of lines) {
    const m = line.match(/^\s*-\s*"?([^"\n]+)"?\s*$/);
    if (m) out.push(m[1].trim());
    else if (line.trim() && !line.startsWith(" ")) break;
  }
  return out;
}

export function parseTemplates(root: string): ParsedTemplate[] {
  const dir = join(root, TEMPLATE_DIR);
  const files = readdirSync(dir).filter((f) => f.endsWith(".md"));
  const templates: ParsedTemplate[] = [];
  const seen = new Set<string>();

  for (const file of files) {
    const text = readFileSync(join(dir, file), "utf8");

    // Each template starts at a frontmatter block beginning with `id: EMT-###`.
    const blocks = text.split(/\n---\n/);

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const ref = field(block, "id");
      if (!ref || !/^EMT-\d+$/.test(ref)) continue;
      if (seen.has(ref)) continue;

      const title = field(block, "title");
      const category = field(block, "category") ?? "Uncategorised";
      const automationReady = field(block, "automation_ready") ?? "Semi Automated";
      const loanStage = field(block, "loan_stage");
      const subject = field(block, "recommended_subject");
      const merge = [
        ...listField(block, "required_merge_fields"),
        ...listField(block, "optional_merge_fields"),
      ];

      // The prose that follows the frontmatter carries the body.
      const prose = blocks[i + 1] ?? "";
      const bodyStart = prose.indexOf("Email body:");
      let body = bodyStart >= 0 ? prose.slice(bodyStart + "Email body:".length).trim() : "";
      // Trim the trailing table-of-contents/heading noise of the next section.
      body = body.split(/\n## /)[0].trim();

      const complianceLine = prose.match(/^-\s*Compliance notes:\s*(.+)$/m);

      const policy: ParsedTemplate["policy"] = NEVER_AUTOMATE_CATEGORIES.includes(category)
        ? "never_automate"
        : (POLICY_MAP[automationReady] ?? "semi_automated");

      if (!title || !body) continue;

      seen.add(ref);
      templates.push({
        ref,
        name: title,
        category,
        subject,
        body,
        policy,
        stage: loanStage ? (STAGE_MAP[loanStage] ?? null) : null,
        mergeFields: merge,
        complianceNotes: complianceLine ? complianceLine[1].trim() : null,
      });
    }
  }

  return templates.sort((a, b) => a.ref.localeCompare(b.ref));
}
