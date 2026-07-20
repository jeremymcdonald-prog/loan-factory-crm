"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser, queryAs } from "@/lib/auth";
import { canManageUsers } from "@/lib/roles";
import { GOOGLE_PROVIDERS, type IntegrationProvider } from "@/lib/integrations";
import { applyConnectionAction, CONNECTION_ACTIONS, type ConnectionAction } from "../shared";

const PROVIDER_KEYS = GOOGLE_PROVIDERS.map((p) => p.key) as [IntegrationProvider, ...IntegrationProvider[]];

const Schema = z.object({
  provider: z.enum(PROVIDER_KEYS),
  action: z.enum(CONNECTION_ACTIONS),
});

/**
 * Preview / reconnect / pause / disconnect one Google connection.
 *
 * Gated to admins (canManageUsers) — Google's admin-policy note on the page
 * says who may connect, and this is what enforces it. Re-checked here rather
 * than trusted from the UI, because a Server Action posts to its own route
 * and can bypass a proxy matcher.
 */
export async function setGoogleConnectionStatus(formData: FormData): Promise<void> {
  const actor = await requireUser();
  if (!canManageUsers(actor.role)) return;

  const parsed = Schema.safeParse({
    provider: formData.get("provider"),
    action: formData.get("action"),
  });
  if (!parsed.success) return;

  const meta = GOOGLE_PROVIDERS.find((p) => p.key === parsed.data.provider);
  if (!meta) return;

  await queryAs(actor, (db) =>
    applyConnectionAction(
      db,
      actor,
      parsed.data.provider,
      meta.name,
      parsed.data.action as ConnectionAction,
    ),
  );

  revalidatePath("/settings/integrations/google");
  revalidatePath("/settings/integrations");
}
