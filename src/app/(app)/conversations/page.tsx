import type { Metadata } from "next";
import Link from "next/link";
import { MessagesSquare, Clock } from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import {
  listThreads,
  countThreads,
  isThreadFilter,
  type ThreadListRow,
  type ThreadFilter,
} from "@/lib/queries/conversations";
import { relativeTime, absoluteTime } from "@/lib/format";
import { PageHeader } from "@/components/shell/page-header";
import { LanguageBadge } from "@/components/crm/language-badge";
import { Badge } from "@/components/ui/badge";
import { ChannelIcon, CHANNEL_LABELS } from "./channel";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Conversations" };
export const dynamic = "force-dynamic";

const TABS: { key: ThreadFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "waiting", label: "Waiting on you" },
  { key: "email", label: "Email" },
  { key: "sms", label: "Text" },
  { key: "call", label: "Calls" },
];

/** What the newest message says, on one line, honest about what it is. */
function previewOf(thread: ThreadListRow): { prefix: string | null; text: string } | null {
  if (!thread.previewBody) return null;

  const text = thread.previewBody.replace(/\s+/g, " ").trim();
  if (!text) return null;

  if (thread.previewDirection === "outbound") {
    // A draft is not a reply. Say so here, or the inbox reads as answered.
    if (thread.previewStatus === "draft") return { prefix: "Your draft:", text };
    if (thread.previewStatus === "awaiting_approval") {
      return { prefix: "Waiting for approval:", text };
    }
    if (thread.previewStatus === "sent") return { prefix: "You:", text };
    return { prefix: null, text };
  }

  return { prefix: null, text };
}

const EMPTY_COPY: Record<ThreadFilter, { title: string; body: string }> = {
  all: {
    title: "No conversations yet",
    body: "Threads show up here as you trade emails, texts, and calls with the people and partners you work with.",
  },
  waiting: {
    title: "Nobody is waiting on you",
    body: "Every thread has had your reply. This is the list to keep at zero.",
  },
  email: { title: "No email threads", body: "Email conversations will collect here." },
  sms: { title: "No text threads", body: "Text conversations will collect here." },
  call: {
    title: "No calls logged",
    body: "Calls you record against a contact show up here with the outcome and how long you talked.",
  },
};

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter: rawFilter } = await searchParams;
  const filter: ThreadFilter =
    rawFilter && isThreadFilter(rawFilter) ? rawFilter : "all";

  const user = await requireUser();

  const { threads, counts } = await queryAs(user, async (db) => ({
    threads: await listThreads(db, user, filter),
    counts: await countThreads(db, user),
  }));

  const now = new Date();
  const empty = EMPTY_COPY[filter];

  return (
    <>
      <PageHeader
        title="Conversations"
        subtitle="Every email, text, and call in one place — yours and your team's."
        action={
          counts.waiting === 0 ? (
            <span className="text-small text-healthy">You&rsquo;re caught up.</span>
          ) : filter === "waiting" ? (
            // Already looking at them — a button back to this page would do nothing.
            <span className="inline-flex items-center gap-1.5 text-small font-semibold text-warning">
              <Clock className="size-3.5" aria-hidden />
              {counts.waiting} {counts.waiting === 1 ? "person is" : "people are"} waiting on a
              reply
            </span>
          ) : (
            <Link
              href="/conversations?filter=waiting"
              className="inline-flex h-9 items-center gap-2 rounded-control bg-action px-3.5 text-body font-semibold text-action-fg shadow-e1 hover:bg-action-hover"
            >
              <Clock className="size-3.5" aria-hidden />
              Answer {counts.waiting} waiting
            </Link>
          )
        }
      />

      <div className="px-4 py-4 sm:px-6">
        <nav className="flex flex-wrap gap-1" aria-label="Filter conversations">
          {TABS.map((tab) => {
            const active = filter === tab.key;
            const count = counts[tab.key];
            return (
              <Link
                key={tab.key}
                href={`/conversations?filter=${tab.key}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-small font-semibold transition-colors",
                  active
                    ? "bg-action text-action-fg"
                    : "text-secondary hover:bg-sunken hover:text-primary",
                )}
              >
                {tab.label}
                <span className={cn("tnum text-micro", active ? "opacity-80" : "text-muted")}>
                  {count}
                </span>
              </Link>
            );
          })}
        </nav>

        {threads.length === 0 ? (
          <div className="mt-4 rounded-card border border-subtle bg-surface px-6 py-14 text-center">
            <MessagesSquare className="mx-auto size-6 text-disabled" aria-hidden />
            <p className="mt-3 text-h3 font-semibold text-primary">{empty.title}</p>
            <p className="mx-auto mt-1 max-w-sm text-body text-secondary">{empty.body}</p>
          </div>
        ) : (
          <ul className="mt-4 overflow-hidden rounded-card border border-subtle bg-surface">
            {threads.map((thread) => {
              const preview = previewOf(thread);

              return (
                <li key={thread.id} className="border-b border-subtle last:border-0">
                  <Link
                    href={`/conversations/${thread.id}`}
                    className={cn(
                      "flex gap-3 border-l-2 px-3 py-3 transition-colors hover:bg-sunken sm:px-4",
                      // The conversion lever: a thread waiting on a human reply
                      // is the one thing on this screen that carries colour.
                      thread.awaitingReply
                        ? "border-l-warning bg-warning-bg/50"
                        : "border-l-transparent",
                    )}
                  >
                    <ChannelIcon
                      channel={thread.channel}
                      className={cn(
                        "mt-0.5 size-4 shrink-0",
                        thread.awaitingReply ? "text-warning" : "text-muted",
                      )}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1.5">
                          <span className="truncate font-semibold text-primary">
                            {thread.with.name}
                          </span>
                          <LanguageBadge language={thread.with.language} />
                          {thread.with.company ? (
                            <span className="hidden truncate text-small text-muted sm:inline">
                              {thread.with.company}
                            </span>
                          ) : null}
                        </span>
                        <time
                          dateTime={thread.lastMessageAt.toISOString()}
                          title={absoluteTime(thread.lastMessageAt)}
                          className="shrink-0 text-small text-muted tnum"
                        >
                          {relativeTime(thread.lastMessageAt, now)}
                        </time>
                      </div>

                      <p className="truncate text-body text-secondary">
                        {thread.subject ?? CHANNEL_LABELS[thread.channel]}
                      </p>

                      {preview ? (
                        <p className="truncate text-small text-muted">
                          {preview.prefix ? (
                            <span className="font-semibold text-secondary">
                              {preview.prefix}{" "}
                            </span>
                          ) : null}
                          {preview.text}
                        </p>
                      ) : null}

                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {thread.awaitingReply ? (
                          <Badge tone="warning" icon={<Clock className="size-3" aria-hidden />}>
                            Waiting on you
                          </Badge>
                        ) : null}
                        <span className="text-micro text-muted sm:hidden">
                          {CHANNEL_LABELS[thread.channel]}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {threads.length >= 200 ? (
          <p className="mt-3 text-small text-muted">
            Showing the 200 most recent. Use the filters to narrow it down.
          </p>
        ) : null}
      </div>
    </>
  );
}
