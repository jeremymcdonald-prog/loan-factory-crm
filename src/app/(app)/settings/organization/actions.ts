"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { tenant } from "@/db/schema";
import { requireUser, queryAs } from "@/lib/auth";
import { canManageUsers } from "@/lib/roles";
import { recordAudit, diff } from "@/lib/audit";

export type OrgState = { error?: string; ok?: string };

const OrgSchema = z.object({
  name: z.string().trim().min(2, "Enter your company name."),
  companyNmls: z
    .string()
    .trim()
    .regex(/^\d{4,10}$/, "An NMLS ID is digits only — check the number."),
});

export async function updateOrganization(
  _prev: OrgState,
  formData: FormData,
): Promise<OrgState> {
  const user = await requireUser();
  if (!canManageUsers(user.role)) {
    return { error: "Only an administrator can change your company details." };
  }

  const parsed = OrgSchema.safeParse({
    name: formData.get("name"),
    companyNmls: formData.get("companyNmls"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the details and try again." };
  }

  try {
    await queryAs(user, async (db) => {
      const [before] = await db
        .select({ name: tenant.name, companyNmls: tenant.companyNmls })
        .from(tenant)
        .where(eq(tenant.id, user.tenantId))
        .limit(1);
      if (!before) throw new Error("not-found");

      await db
        .update(tenant)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(tenant.id, user.tenantId));

      await recordAudit(db, user, {
        action: "organization.updated",
        entity: "tenant",
        entityId: user.tenantId,
        changes: diff(before, parsed.data),
      });
    });
  } catch {
    return { error: "We couldn't save that. Nothing was changed." };
  }

  revalidatePath("/settings/organization");
  revalidatePath("/settings");
  return { ok: "Saved. Your NMLS appears on every message the CRM sends." };
}
