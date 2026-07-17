import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import { getThread, type ThreadMessage, type Counterparty } from "@/lib/queries/conversations";
import { relativeTime, absoluteTime, phoneNumber } from "@/lib/format";
import { PageHeader } from "@/components/shell/page-header";
import { LanguageBadge } from "@/components/crm/language-badge";
import { Badge, type Urgency } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ChannelIcon, CHANNEL_LABELS } from "../channel";
import { ReplyBox } from "./reply-box";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const user = await requireUser();
  const thread = await queryAs(user, (db) => getThread(db, user, id));
  if (!thread) return { title: "Not found" };
  return { title: thread.subject ?? thread.with.name };
}

/**
 * What a message's status means in words. Anything that has not left the
 * building says so plainly — a draft that reads as sent is the one mistake
 * this screen can never make.
 */
const STATUS_NOTES: Partial<Record<string, { label: string; tone: Urgency }>> = {
  draft: { label: "Draft — not sent", tone: "warning" },
  awaiting_approval: { label: "Waiting for your approval — not sent", tone: "warning" },
  approved: { label: "Approved — not sent yet", tone: "warning" },
  failed: { label: "Didn't send", tone: "critical" },
};

const CALL_OUTCOMES: Record<string, string> = {
  connected: "Spoke with them",
  voicemail: "Left a voicemail",
  no_answer: "No answer",
  busy: "Line was busy",
  missed: "Missed call",
};

/** An unmapped outcome is shown as it was recorded, never dropped or guessed. */
function outcomeText(outcome: string): string {
  const known = CALL_OUTCOMES[outcome];
  if (known) return known;
  const words = outcome.replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function callLength(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest === 0 ? `${minutes}m` : `${minutes}m ${rest}s`;
}

/** `meta` is free-form jsonb, so read it defensively and show only what's there. */
function callMeta(meta: Record<string, unknown> | null) {
  const outcome = typeof meta?.outcome === "string" ? meta.outcome : null;
  const duration = meta?.durationSeconds;
  const seconds =
    typeof duration === "number" && Number.isFinite(duration) && duration >= 0
      ? Math.round(duration)
      : null;
  return { outcome, seconds };
}

/** Outbound mail carries the moment it went out; a draft carries the moment it was written. */
function timeOf(m: ThreadMessage): { prefix: string | null; at: Date } {
  if (m.direction === "outbound") {
    if (m.status === "sent" && m.sentAt) return { prefix: "Sent", at: m.sentAt };
    return { prefix: "Written", at: m.occurredAt };
  }
  return { prefix: null, at: m.occurredAt };
}

function MessageTime({ message: m, now }: { message: ThreadMessage; now: Date }) {
  const { prefix, at } = timeOf(m);
  return (
    <time dateTime={at.toISOString()} title={absoluteTime(at)} className="tnum">
      {prefix ? `${prefix} ` : ""}
      {relativeTime(at, now)}
    </time>
  );
}

/** A call is something that happened, not something that was said. */
function CallEvent({
  message: m,
  now,
  counterpartyName,
}: {
  message: ThreadMessage;
  now: Date;
  counterpartyName: string;
}) {
  const { outcome, seconds } = callMeta(m.meta);
  const who = m.direction === "outbound" ? (m.authorName ?? "Someone on the team") : counterpartyName;
  const what = m.direction === "outbound" ? `called ${counterpartyName}` : "called in";

  return (
    <li className="flex items-start gap-2.5 rounded-md bg-sunken px-3 py-2">
      <Phone className="mt-0.5 size-3.5 shrink-0 text-muted" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-1.5 text-small text-secondary">
          <span className="font-semibold text-primary">
            {who} {what}
          </span>
          {outcome ? (
            <>
              <span aria-hidden>·</span>
              <span>{outcomeText(outcome)}</span>
            </>
          ) : null}
          {seconds !== null ? (
            <>
              <span aria-hidden>·</span>
              <span className="tnum">{callLength(seconds)}</span>
            </>
          ) : null}
          <span aria-hidden>·</span>
          <span className="text-muted">
            <MessageTime message={m} now={now} />
          </span>
        </p>
        {m.body ? (
          <p className="mt-0.5 whitespace-pre-wrap text-small text-muted">{m.body}</p>
        ) : null}
      </div>
    </li>
  );
}

function MessageBubble({
  message: m,
  now,
  counterpartyName,
}: {
  message: ThreadMessage;
  now: Date;
  counterpartyName: string;
}) {
  const outbound = m.direction === "outbound";
  const sender = outbound ? (m.authorName ?? "Someone on the team") : counterpartyName;
  const note = STATUS_NOTES[m.status];
  // Dashed edges carry the same news as the badge: this one never went out.
  const unsent = outbound && m.status !== "sent";

  return (
    <li className={cn("flex", outbound && "justify-end")}>
      <div
        className={cn(
          "max-w-[90%] rounded-lg border px-3 py-2 sm:max-w-[78%]",
          outbound ? "border-brand/25 bg-brand/10" : "border-subtle bg-surface",
          unsent && "border-dashed",
        )}
      >
        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-micro text-muted">
          <span className="font-semibold text-secondary">{sender}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <ChannelIcon channel={m.channel} className="size-3" />
            {CHANNEL_LABELS[m.channel]}
          </span>
          <span aria-hidden>·</span>
          <MessageTime message={m} now={now} />
        </p>

        <p className="mt-1.5 whitespace-pre-wrap text-body text-primary">{m.body}</p>

        {m.preparedByAi || note || m.templateRef ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {m.preparedByAi ? (
              <Badge tone="ai" icon={<Sparkles className="size-3" aria-hidden />}>
                Prepared by AI
              </Badge>
            ) : null}
            {note ? <Badge tone={note.tone}>{note.label}</Badge> : null}
            {m.templateRef ? (
              <span className="text-micro text-muted">From a saved template</span>
            ) : null}
          </div>
        ) : null}
      </div>
    </li>
  );
}

/** Where a reply would come from, where it would land, and whether it may. */
function ConsentLine({
  contact,
  channel,
  fromEmail,
}: {
  contact: Counterparty;
  channel: "email" | "sms" | "call" | "note";
  fromEmail: string;
}) {
  const address =
    channel === "email" ? contact.emails[0]?.address : contact.phones[0]?.number;
  const missing = channel === "email" ? "No email address on file" : "No phone number on file";

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-small text-muted">
      <span className="inline-flex items-center gap-1.5">
        <ChannelIcon channel={channel} className="size-3.5" />
        {address ? (
          <>
            To{" "}
            <span className="text-secondary">
              {channel === "email" ? address : phoneNumber(address)}
            </span>
          </>
        ) : (
          <span className="text-warning">{missing}</span>
        )}
      </span>

      <span>
        From <span className="text-secondary">{fromEmail}</span>
      </span>

      {contact.doNotContact ? (
        <Badge tone="critical" icon={<ShieldAlert className="size-3" aria-hidden />}>
          Do not contact
        </Badge>
      ) : (
        <Badge tone="neutral" icon={<ShieldCheck className="size-3" aria-hidden />}>
          Not on the do-not-contact list
        </Badge>
      )}
    </div>
  );
}

const NOT_COMPOSABLE: Record<"call" | "note", string> = {
  call: "This thread is the record of a phone call. Calls aren't written — when you next speak with them, log what happened on their record and it lands here.",
  note: "This thread is an internal note. It was never sent to anyone outside the team.",
};

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const thread = await queryAs(user, (db) => getThread(db, user, id));
  if (!thread) notFound();

  const now = new Date();
  const contact = thread.with;
  const firstName = contact.name.split(" ")[0] ?? contact.name;
  // A local const so the composable check narrows the channel for the reply box.
  const channel = thread.channel;
  const canCompose = channel === "email" || channel === "sms";
  // A reply is only on the table for a channel you can write on, to someone
  // who hasn't asked you to stop.
  const canReply = canCompose && !contact.doNotContact;

  const panelTitle = !canCompose
    ? `About this ${CHANNEL_LABELS[channel].toLowerCase()}`
    : contact.doNotContact
      ? `No contact with ${firstName}`
      : `Reply to ${firstName}`;

  return (
    <div className="mx-auto max-w-4xl">
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
        title={contact.name}
        subtitle={thread.subject ?? `${CHANNEL_LABELS[channel]} thread`}
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral" icon={<ChannelIcon channel={channel} className="size-3" />}>
              {CHANNEL_LABELS[channel]}
            </Badge>
            <LanguageBadge language={contact.language} />
            {contact.company ? (
              <span className="text-small text-muted">{contact.company}</span>
            ) : null}
            {thread.awaitingReply ? (
              <Badge tone="warning" icon={<Clock className="size-3" aria-hidden />}>
                Waiting on you
              </Badge>
            ) : null}
          </div>
        }
        action={
          contact.href ? (
            <Link
              href={contact.href}
              className="inline-flex items-center gap-1 text-small font-semibold text-action hover:underline"
            >
              Open record
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          ) : null
        }
      />

      {thread.messages.length === 0 ? (
        <div className="px-4 py-4 sm:px-6">
          <div className="rounded-card border border-subtle bg-surface px-6 py-10 text-center">
            <p className="text-h3 font-semibold text-primary">Nothing on this thread yet</p>
            <p className="mx-auto mt-1 max-w-sm text-body text-secondary">
              Once there&rsquo;s a message here, it will show up with who said it and when.
            </p>
          </div>
        </div>
      ) : (
        <ol className="space-y-3 px-4 py-4 sm:px-6">
          {thread.messages.map((m) =>
            m.channel === "call" ? (
              <CallEvent key={m.id} message={m} now={now} counterpartyName={contact.name} />
            ) : (
              <MessageBubble key={m.id} message={m} now={now} counterpartyName={contact.name} />
            ),
          )}
        </ol>
      )}

      <div className="px-4 pb-6 sm:px-6">
        <Card>
          <div className="border-b border-subtle px-4 py-3">
            <h2 className="text-h3 font-semibold text-primary">{panelTitle}</h2>
            {/* Only where a send would actually originate. */}
            {canReply ? (
              <ConsentLine contact={contact} channel={channel} fromEmail={user.email} />
            ) : null}
          </div>

          <div className="p-4">
            {contact.doNotContact ? (
              <div className="rounded-md border border-critical/25 bg-critical-bg px-3 py-2.5">
                <p className="text-small font-semibold text-critical">
                  {firstName} asked not to be contacted.
                </p>
                <p className="mt-0.5 text-small text-secondary">
                  Nothing goes out to them from here. Talk to your manager if you believe this is
                  a mistake.
                </p>
              </div>
            ) : canCompose ? (
              <ReplyBox conversationId={thread.id} channel={channel} toName={firstName} />
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="max-w-xl text-small text-secondary">{NOT_COMPOSABLE[channel]}</p>
                {contact.href ? (
                  <Link
                    href={contact.href}
                    className="inline-flex h-9 shrink-0 items-center rounded-control bg-action px-3.5 text-body font-semibold text-action-fg shadow-e1 hover:bg-action-hover"
                  >
                    Open {firstName}&rsquo;s record
                  </Link>
                ) : null}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
