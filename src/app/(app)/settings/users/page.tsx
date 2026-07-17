import type { Metadata } from "next";
import { asc, isNull, eq } from "drizzle-orm";
import { requireUser, queryAs } from "@/lib/auth";
import { canManageUsers, ROLE_LABELS } from "@/lib/roles";
import { user as userTable, team as teamTable } from "@/db/schema";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InviteForm } from "./invite-form";
import { RoleSelect } from "./role-select";
import { setUserStatus } from "./actions";

export const metadata: Metadata = { title: "Team members" };
export const dynamic = "force-dynamic";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

function formatWhen(value: Date | null): string {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

export default async function UsersPage() {
  const actor = await requireUser();
  const isAdmin = canManageUsers(actor.role);

  const rows = await queryAs(actor, async (db) =>
    db
      .select({
        id: userTable.id,
        fullName: userTable.fullName,
        email: userTable.email,
        role: userTable.role,
        status: userTable.status,
        nmlsId: userTable.nmlsId,
        lastLoginAt: userTable.lastLoginAt,
        teamName: teamTable.name,
      })
      .from(userTable)
      .leftJoin(teamTable, eq(teamTable.id, userTable.teamId))
      .where(isNull(userTable.deletedAt))
      .orderBy(asc(userTable.fullName)),
  );

  return (
    <>
      <PageHeader
        title="Team members"
        subtitle={
          isAdmin
            ? "Everyone who can sign in, and what they can see."
            : "Everyone on your team. Only an administrator can make changes."
        }
        action={isAdmin ? <InviteForm /> : null}
      />

      <div className="p-4 sm:p-6">
        <div className="overflow-hidden rounded-lg border border-subtle bg-surface">
          <table className="w-full text-body">
            <caption className="sr-only">Team members and their roles</caption>
            <thead>
              <tr className="border-b border-subtle bg-sunken text-label uppercase tracking-wide text-muted">
                <th scope="col" className="px-4 py-2 text-left font-semibold">
                  Name
                </th>
                <th scope="col" className="hidden px-4 py-2 text-left font-semibold sm:table-cell">
                  Role
                </th>
                <th scope="col" className="hidden px-4 py-2 text-left font-semibold lg:table-cell">
                  NMLS
                </th>
                <th scope="col" className="hidden px-4 py-2 text-left font-semibold lg:table-cell">
                  Last signed in
                </th>
                <th scope="col" className="px-4 py-2 text-left font-semibold">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-subtle last:border-0 hover:bg-raised"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-sunken text-label font-semibold text-secondary">
                        {initials(row.fullName)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-primary">
                          {row.fullName}
                          {row.id === actor.userId ? (
                            <span className="ml-1.5 text-small font-normal text-muted">
                              (you)
                            </span>
                          ) : null}
                        </p>
                        <p className="truncate text-small text-muted">{row.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="hidden px-4 py-3 sm:table-cell">
                    {isAdmin && row.id !== actor.userId ? (
                      <RoleSelect
                        userId={row.id}
                        currentRole={row.role}
                        personName={row.fullName}
                      />
                    ) : (
                      <span className="text-secondary">{ROLE_LABELS[row.role]}</span>
                    )}
                  </td>

                  <td className="hidden px-4 py-3 text-secondary tnum lg:table-cell">
                    {row.nmlsId ?? <span className="text-disabled">—</span>}
                  </td>

                  <td className="hidden px-4 py-3 text-muted tnum lg:table-cell">
                    {formatWhen(row.lastLoginAt)}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Badge tone={row.status === "active" ? "healthy" : "neutral"}>
                        {row.status === "active" ? "Active" : "Disabled"}
                      </Badge>
                      {isAdmin && row.id !== actor.userId ? (
                        <form action={setUserStatus}>
                          <input type="hidden" name="userId" value={row.id} />
                          <input
                            type="hidden"
                            name="status"
                            value={row.status === "active" ? "disabled" : "active"}
                          />
                          <Button type="submit" variant="ghost" size="sm">
                            {row.status === "active" ? "Disable" : "Enable"}
                          </Button>
                        </form>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-small text-muted">
          Borrowers never appear here. They are contacts in People — there is no borrower
          login.
        </p>
      </div>
    </>
  );
}
