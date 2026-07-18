import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import { listComposeRecipients } from "@/lib/queries/conversations";
import { PageHeader } from "@/components/shell/page-header";
import { Card } from "@/components/ui/card";
import { ComposeForm } from "./compose-form";

export const metadata: Metadata = { title: "New message" };
export const dynamic = "force-dynamic";

export default async function NewMessagePage() {
  const user = await requireUser();
  const recipients = await queryAs(user, (db) => listComposeRecipients(db, user));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="px-4 pt-3 sm:px-6">
        <Link
          href="/conversations"
          className="inline-flex items-center gap-1 text-small text-muted hover:text-primary"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          All conversations
        </Link>
      </div>

      <PageHeader
        title="New message"
        subtitle="Drafts a message onto the person's thread. Nothing sends from here — sending connects when a provider is linked in Settings."
      />

      <div className="px-4 pb-6 sm:px-6">
        <Card>
          <div className="p-4">
            <ComposeForm recipients={recipients} fromEmail={user.email} />
          </div>
        </Card>
      </div>
    </div>
  );
}
