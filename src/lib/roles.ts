/**
 * Role vocabulary — Data_Model.md §3.3 `user.role` enum.
 *
 * Pure, shared by server and client code (no `server-only` here): the top bar
 * and settings screens render these labels in the browser.
 *
 * The 8 staff types are the only product users. Borrowers are CRM contacts —
 * there is no borrower role, login, or portal, in any phase (D-23).
 */

export const ROLES = [
  "lo",
  "lo_assistant",
  "processor",
  "team_leader",
  "branch_leader",
  "agent_rel_manager",
  "marketing_coordinator",
  "admin",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<string, string> = {
  lo: "Loan officer",
  lo_assistant: "LO assistant",
  processor: "Processing / ops",
  team_leader: "Team leader",
  branch_leader: "Branch leader",
  agent_rel_manager: "Agent relationship manager",
  marketing_coordinator: "Marketing coordinator",
  admin: "Administrator",
};

/** Plain-language description shown when choosing a role (Settings). */
export const ROLE_DESCRIPTIONS: Record<string, string> = {
  lo: "Owns their own book of leads, borrowers, and opportunities.",
  lo_assistant: "Works the queues of the loan officers they support.",
  processor: "Works files in the transaction stages and their own tasks.",
  team_leader: "Sees the whole team's book plus escalations.",
  branch_leader: "Sees a branch-level rollup of every team.",
  agent_rel_manager: "Owns referral partner and agent relationships.",
  marketing_coordinator: "Runs campaigns and content; no borrower financial detail.",
  admin: "Manages users, roles, and tenant settings.",
};

/** Roles that see the whole tenant's book rather than only their own. */
const BOOK_WIDE_ROLES = new Set<string>(["team_leader", "branch_leader", "admin"]);

export function seesWholeBook(role: string): boolean {
  return BOOK_WIDE_ROLES.has(role);
}

/** Only admins manage users (Screen 20 Settings). */
export function canManageUsers(role: string): boolean {
  return role === "admin";
}

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}
