import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireUser, queryAs } from "@/lib/auth";
import { canManageUsers } from "@/lib/roles";
import { auditLog, user as userTable } from "@/db/schema";
import { PageHeader } from "@/components/shell/page-header";
import { absoluteTime } from "@/lib/format";

export const metadata: Metadata = { title: "Audit log" };
export const dynamic = "force-dynamic";

/** Plain language for every action we record. Never show a raw action key. */
const ACTION_LABELS: Record<string, string> = {
  "user.login": "Signed in",
  "user.logout": "Signed out",
  "user.created": "Added a teammate",
  "user.role_changed": "Changed a role",
  "user.enabled": "Enabled an account",
  "user.disabled": "Disabled an account",
  "user.viewed_as": "Viewed someone's queue",
  "person.created": "Added a person",
  "note.created": "Wrote a note",
  "touch.logged": "Logged a touch",
  "loan.created": "Opened an opportunity",
  "loan.stage_changed": "Moved a file to a new stage",
  "loan.docs_needed_raised": "Flagged waiting on documents",
  "loan.docs_needed_cleared": "Cleared the documents flag",
  "task.completed": "Completed a task",
  "ai.approve": "Approved what AI prepared",
  "ai.edit_approve": "Edited and approved an AI draft",
  "ai.skip": "Skipped an AI suggestion",
  "partner.created": "Added a partner",
  "campaign.created": "Created a campaign",
  "automation.paused": "Paused an automation",
  "automation.activated": "Turned on an automation",
};

export default async function AuditPage() {
  const user = await requireUser();
  // The audit trail is an admin surface: it names who did what.
  if (!canManageUsers(user.role)) notFound();

  const rows = await queryAs(user, async (db) =>
    db
      .select({
        id: auditLog.id,
        action: auditLog.action,
        entity: auditLog.entity,
        entityId: auditLog.entityId,
        changes: auditLog.changes,
        createdAt: auditLog.createdAt,
        actorName: userTable.fullName,
      })
      .from(auditLog)
      .leftJoin(userTable, eq(userTable.id, auditLog.actorUserId))
      .orderBy(desc(auditLog.createdAt))
      .limit(200),
  );

  return (
    <>
      <PageHeader
        title="Audit log"
        subtitle="Every change, who made it, and when. This record cannot be edited or deleted — by anyone, including us."
      />

      <div className="p-4 sm:p-6">
        {rows.length === 0 ? (
          <div className="rounded-card border border-subtle bg-surface px-6 py-14 text-center">
            <p className="text-h3 font-semibold text-primary">Nothing recorded yet</p>
            <p className="mx-auto mt-1 max-w-sm text-body text-secondary">
              As your team works, every change lands here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-card border border-subtle bg-surface">
            <table className="w-full min-w-[720px] text-body">
              <caption className="sr-only">Audit log, newest first</caption>
              <thead>
                <tr className="border-b border-subtle bg-sunken text-label uppercase tracking-wide text-muted">
                  <th scope="col" className="px-4 py-2 text-left font-semibold">
                    What happened
                  </th>
                  <th scope="col" className="px-4 py-2 text-left font-semibold">
                    Who
                  </th>
                  <th scope="col" className="px-4 py-2 text-left font-semibold">
                    Details
                  </th>
                  <th scope="col" className="px-4 py-2 text-right font-semibold">
                    When
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const changes = row.changes
                    ? Object.entries(row.changes).map(
                        ([field, c]) =>
                          `${field}: ${format(c.from)} → ${format(c.to)}`,
                      )
                    : [];
                  return (
                    <tr key={row.id} className="border-b border-subtle last:border-0">
                      <td className="px-4 py-2.5 font-semibold text-primary">
                        {ACTION_LABELS[row.action] ?? row.action}
                      </td>
                      <td className="px-4 py-2.5 text-secondary">{row.actorName ?? "System"}</td>
                      <td className="px-4 py-2.5 text-small text-muted">
                        {changes.length ? changes.join(" · ") : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right text-small text-muted tnum">
                        {absoluteTime(row.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-3 text-small text-muted">
          Showing the most recent {Math.min(rows.length, 200)}. Financial details are never
          written to this log.
        </p>
      </div>
    </>
  );
}

function format(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string") return v.replace(/_/g, " ");
  return String(v);
}
