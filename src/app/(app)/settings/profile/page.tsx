import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { requireUser, queryAs } from "@/lib/auth";
import { user as userTable, team as teamTable, aiPersona } from "@/db/schema";
import { PageHeader } from "@/components/shell/page-header";
import { Card } from "@/components/ui/card";
import { ProfileForm } from "./profile-form";
import { PhotoUpload } from "./photo-upload";
import { SignatureEditor } from "./signature-editor";
import { NotificationPrefs } from "./notification-prefs";
import { PersonaSection, type PersonaView } from "./persona-section";

export const metadata: Metadata = { title: "My profile" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();

  const { me, persona } = await queryAs(user, async (db) => {
    // Sequential on purpose — one client, one transaction.
    const [meRow] = await db
      .select({
        fullName: userTable.fullName,
        title: userTable.title,
        phone: userTable.phone,
        email: userTable.email,
        nmlsId: userTable.nmlsId,
        timezone: userTable.timezone,
        language: userTable.language,
        photoData: userTable.photoData,
        signature: userTable.signature,
        defaultSenderName: userTable.defaultSenderName,
        replyToEmail: userTable.replyToEmail,
        links: userTable.links,
        notificationPrefs: userTable.notificationPrefs,
        teamName: teamTable.name,
      })
      .from(userTable)
      .leftJoin(teamTable, eq(teamTable.id, userTable.teamId))
      .where(eq(userTable.id, user.userId))
      .limit(1);

    // RLS pins ai_persona rows to their owner; the WHERE is belt and braces.
    const [personaRow] = await db
      .select()
      .from(aiPersona)
      .where(eq(aiPersona.userId, user.userId))
      .limit(1);

    return { me: meRow, persona: personaRow };
  });

  if (!me) {
    return (
      <>
        <PageHeader title="My profile" />
        <div className="mx-auto max-w-3xl p-4 sm:p-6">
          <Card>
            <p className="p-4 text-body text-secondary">
              We couldn&apos;t load your profile. Sign out and back in, or ask an
              administrator if this keeps happening.
            </p>
          </Card>
        </div>
      </>
    );
  }

  const personaView: PersonaView | null = persona
    ? {
        filename: persona.filename,
        sizeBytes: persona.sizeBytes,
        status: persona.status,
        extractedText: persona.extractedText,
        error: persona.error,
        enabled: persona.enabled,
        updatedAt: persona.updatedAt.toISOString(),
      }
    : null;

  return (
    <>
      <PageHeader
        title="My profile"
        subtitle="Your photo, signature, and how the AI assistant writes as you."
      />

      <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
        <Card>
          <div className="border-b border-subtle px-4 py-3">
            <h2 className="text-h3 font-semibold text-primary">Profile</h2>
            <p className="mt-0.5 text-small text-muted">
              How you appear to your team and on outbound messages.
            </p>
          </div>
          <div className="space-y-5 p-4">
            <PhotoUpload photoData={me.photoData} fullName={me.fullName} />
            <ProfileForm
              fullName={me.fullName}
              title={me.title ?? ""}
              phone={me.phone ?? ""}
              email={me.email}
              nmlsId={me.nmlsId ?? ""}
              teamName={me.teamName}
              timezone={me.timezone ?? ""}
              language={me.language}
              links={me.links ?? {}}
            />
          </div>
        </Card>

        <Card>
          <div className="border-b border-subtle px-4 py-3">
            <h2 className="text-h3 font-semibold text-primary">Email signature</h2>
            <p className="mt-0.5 text-small text-muted">
              Added to the bottom of what you and the CRM send.
            </p>
          </div>
          <div className="p-4">
            <SignatureEditor
              signature={me.signature ?? ""}
              defaultSenderName={me.defaultSenderName ?? ""}
              replyToEmail={me.replyToEmail ?? ""}
              fullName={me.fullName}
              title={me.title ?? ""}
              nmlsId={me.nmlsId ?? ""}
              phone={me.phone ?? ""}
            />
          </div>
        </Card>

        <Card>
          <div className="border-b border-subtle px-4 py-3">
            <h2 className="text-h3 font-semibold text-primary">Notification preferences</h2>
            <p className="mt-0.5 text-small text-muted">
              What lands in your inbox, and what stays in the app.
            </p>
          </div>
          <div className="p-4">
            <NotificationPrefs prefs={me.notificationPrefs ?? {}} />
          </div>
        </Card>

        <Card>
          <div className="border-b border-subtle px-4 py-3">
            <h2 className="text-h3 font-semibold text-primary">My AI persona</h2>
            <p className="mt-0.5 text-small text-muted">
              A private document that teaches the assistant to write like you.
            </p>
          </div>
          <div className="p-4">
            <PersonaSection persona={personaView} />
          </div>
        </Card>
      </div>
    </>
  );
}
