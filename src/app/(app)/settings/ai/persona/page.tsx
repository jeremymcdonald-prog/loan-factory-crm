import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { requireUser, queryAs } from "@/lib/auth";
import { aiPersona } from "@/db/schema";
import { PageHeader } from "@/components/shell/page-header";
import { PersonaManager, type PersonaManagerView } from "./persona-manager";

export const metadata: Metadata = { title: "AI persona" };
export const dynamic = "force-dynamic";

export default async function PersonaSettingsPage() {
  const user = await requireUser();

  // RLS additionally pins this row to tenant AND owner (ai_persona's
  // owner_only policy) — the WHERE is belt and braces, same as profile/page.tsx.
  const persona = await queryAs(user, async (db) => {
    const [row] = await db
      .select()
      .from(aiPersona)
      .where(eq(aiPersona.userId, user.userId))
      .limit(1);
    return row ?? null;
  });

  const view: PersonaManagerView | null = persona
    ? {
        filename: persona.filename,
        sizeBytes: persona.sizeBytes,
        status: persona.status,
        extractedText: persona.extractedText,
        error: persona.error,
        enabled: persona.enabled,
        instructions: persona.instructions,
        tone: persona.tone,
        preferWords: persona.preferWords ?? [],
        avoidWords: persona.avoidWords ?? [],
        complianceNotes: persona.complianceNotes,
        sampleText: persona.sampleText,
        updatedAt: persona.updatedAt.toISOString(),
      }
    : null;

  return (
    <>
      <PageHeader
        title="AI persona"
        subtitle="Teach the assistant to write like you. Private to you — and it never overrides compliance, approvals, or what you're allowed to see."
      />
      <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
        <PersonaManager persona={view} />
      </div>
    </>
  );
}
