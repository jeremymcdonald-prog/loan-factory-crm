import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import { and, asc, eq, sql } from "drizzle-orm";
import { requireUser, queryAs } from "@/lib/auth";
import { conversation, message, user as userTable } from "@/db/schema";
import { PageHeader } from "@/components/shell/page-header";
import { Composer, type ComposerProfile, type ExampleDraft } from "./composer";

export const metadata: Metadata = { title: "New video message" };
export const dynamic = "force-dynamic";

/** Mirrors the body format the composer and the seed both write. */
const FALLBACK_LINE = "If the video doesn't load, use this link instead.";

type VideoMeta = { title: string; caption: string; durationSeconds: number };

function readVideoMeta(meta: unknown): VideoMeta | null {
  if (!meta || typeof meta !== "object") return null;
  const video = (meta as Record<string, unknown>).video;
  if (!video || typeof video !== "object") return null;
  const v = video as Record<string, unknown>;
  if (typeof v.title !== "string") return null;
  return {
    title: v.title,
    caption: typeof v.caption === "string" ? v.caption : "",
    durationSeconds: typeof v.durationSeconds === "number" ? v.durationSeconds : 0,
  };
}

/** body = intro + "[Video: …]" + fallback line + closing — split it back apart. */
function splitBody(body: string): { intro: string; closing: string } {
  const marker = body.indexOf("\n\n[Video:");
  if (marker < 0) return { intro: body.trim(), closing: "" };
  const intro = body.slice(0, marker).trim();
  const rest = body.slice(marker);
  const fallbackAt = rest.indexOf(FALLBACK_LINE);
  const closing =
    fallbackAt >= 0 ? rest.slice(fallbackAt + FALLBACK_LINE.length).trim() : "";
  return { intro, closing };
}

export default async function ComposePage() {
  const user = await requireUser();

  const { profile, exampleRows } = await queryAs(user, async (db) => {
    const [profileRow] = await db
      .select({
        fullName: userTable.fullName,
        photoData: userTable.photoData,
        signature: userTable.signature,
        defaultSenderName: userTable.defaultSenderName,
        replyToEmail: userTable.replyToEmail,
        language: userTable.language,
      })
      .from(userTable)
      .where(eq(userTable.id, user.userId))
      .limit(1);

    const rows = await db
      .select({
        id: message.id,
        subject: message.subject,
        body: message.body,
        languageCode: message.languageCode,
        meta: message.meta,
        ownerName: userTable.fullName,
      })
      .from(message)
      .innerJoin(conversation, eq(message.conversationId, conversation.id))
      .leftJoin(userTable, eq(message.authorUserId, userTable.id))
      .where(
        and(
          eq(message.status, "draft"),
          eq(message.channel, "email"),
          sql`(${message.meta} -> 'video') is not null`,
        ),
      )
      .orderBy(asc(message.createdAt));

    return { profile: profileRow, exampleRows: rows };
  });

  const composerProfile: ComposerProfile = {
    fullName: profile?.fullName ?? "You",
    senderName: profile?.defaultSenderName ?? null,
    replyTo: profile?.replyToEmail ?? null,
    photoData: profile?.photoData ?? null,
    signature: profile?.signature ?? null,
    language: profile?.language ?? "en",
  };

  const examples: ExampleDraft[] = exampleRows.flatMap((row) => {
    const video = readVideoMeta(row.meta);
    if (!video) return [];
    const { intro, closing } = splitBody(row.body);
    return [
      {
        id: row.id,
        subject: row.subject ?? video.title,
        language: row.languageCode,
        ownerName: row.ownerName,
        intro,
        closing,
        video,
      },
    ];
  });

  return (
    <>
      <PageHeader
        title="New video message"
        subtitle="Record or upload a short video, wrap it in a personal email, and save it as a draft."
        meta={
          <Link
            href="/marketing"
            className="inline-flex items-center gap-1.5 text-small font-semibold text-action hover:underline"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Back to Marketing
          </Link>
        }
      />

      <div className="space-y-5 px-4 py-4 sm:px-6">
        <div className="flex gap-2.5 rounded-md border border-info-border bg-info-bg px-3 py-2.5">
          <Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden />
          <p className="text-small text-secondary">
            In production, video messaging needs secure hosting, transcoding, storage and
            retention rules, consent controls, and view analytics. None of that exists yet —
            this demo records locally so the Committee can feel the workflow.
          </p>
        </div>

        <Composer profile={composerProfile} examples={examples} />
      </div>
    </>
  );
}
