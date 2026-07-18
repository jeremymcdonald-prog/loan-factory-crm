"use client";

import { useActionState, useMemo, useState } from "react";
import { Search, ShieldAlert, X } from "lucide-react";
import { createMessage, type ComposeState } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { ChannelIcon, CHANNEL_LABELS } from "../channel";
import { cn } from "@/lib/cn";
import type { ComposeChannel, ComposeRecipient } from "@/lib/queries/conversations";

/** The four channels a message can be written on, in the order they're offered. */
const CHANNELS: ComposeChannel[] = ["email", "sms", "video", "app"];

/**
 * Where each channel's draft would eventually land — shown before the officer
 * types, because a missing address is better discovered now than at send time
 * (which, to be clear, does not exist yet: everything here lands as a draft).
 */
function destinationOf(person: ComposeRecipient, channel: ComposeChannel): string | null {
  if (channel === "email" || channel === "video") return person.email;
  if (channel === "sms") return person.phone;
  return null; // app: no address — the borrower app isn't connected.
}

function missingCopyOf(channel: ComposeChannel): string {
  if (channel === "sms") return "No phone number on file";
  if (channel === "app") return "";
  return "No email address on file";
}

export function ComposeForm({
  recipients,
  fromEmail,
}: {
  recipients: ComposeRecipient[];
  fromEmail: string;
}) {
  const [state, formAction, pending] = useActionState<ComposeState, FormData>(
    createMessage,
    {},
  );

  const [query, setQuery] = useState("");
  const [chosen, setChosen] = useState<ComposeRecipient | null>(null);
  const [channel, setChannel] = useState<ComposeChannel>("email");

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return recipients.filter((r) => r.name.toLowerCase().includes(needle)).slice(0, 8);
  }, [query, recipients]);

  const destination = chosen ? destinationOf(chosen, channel) : null;
  const needsSubject = channel === "email" || channel === "video";

  return (
    <form action={formAction} className="space-y-5">
      {/* ----------------------------------------------------------------- */}
      {/* Who                                                                */}
      {/* ----------------------------------------------------------------- */}
      {chosen ? (
        <div className="space-y-1.5">
          <p className="text-label font-semibold text-secondary">
            To<span className="ml-0.5 text-critical">*</span>
          </p>
          <input type="hidden" name="personId" value={chosen.id} />
          <div className="flex flex-wrap items-center gap-2 rounded-control border border-strong bg-sunken px-3 py-2">
            <span className="font-semibold text-primary">{chosen.name}</span>
            {destination ? (
              <span className="text-small text-muted">{destination}</span>
            ) : channel === "app" ? (
              <span className="text-small text-muted">their borrower app (not connected yet)</span>
            ) : (
              <span className="text-small text-warning">{missingCopyOf(channel)}</span>
            )}
            <button
              type="button"
              onClick={() => {
                setChosen(null);
                setQuery("");
              }}
              className="ml-auto inline-flex items-center gap-1 text-small font-semibold text-action hover:underline"
            >
              <X className="size-3.5" aria-hidden />
              Change
            </button>
          </div>
          <p className="text-small text-muted">
            From <span className="text-secondary">{fromEmail}</span>
          </p>
        </div>
      ) : (
        <Field
          label="To"
          htmlFor="compose-person"
          required
          hint="Search the people in your book by name."
        >
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
              aria-hidden
            />
            <Input
              id="compose-person"
              type="search"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Start typing a name…"
              className="pl-9"
              aria-expanded={matches.length > 0}
              aria-controls="compose-person-results"
            />
          </div>
          {matches.length > 0 ? (
            <ul
              id="compose-person-results"
              className="overflow-hidden rounded-control border border-subtle bg-surface"
            >
              {matches.map((person) => (
                <li key={person.id} className="border-b border-subtle last:border-0">
                  <button
                    type="button"
                    disabled={person.doNotContact}
                    onClick={() => setChosen(person)}
                    className={cn(
                      "flex w-full flex-wrap items-center gap-2 px-3 py-2 text-left",
                      person.doNotContact
                        ? "cursor-not-allowed opacity-60"
                        : "hover:bg-sunken",
                    )}
                  >
                    <span className="font-semibold text-primary">{person.name}</span>
                    {person.email ? (
                      <span className="text-small text-muted">{person.email}</span>
                    ) : null}
                    {person.doNotContact ? (
                      <Badge
                        tone="critical"
                        icon={<ShieldAlert className="size-3" aria-hidden />}
                      >
                        Do not contact
                      </Badge>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : query.trim() ? (
            <p className="text-small text-muted">
              Nobody in your book matches &ldquo;{query.trim()}&rdquo;.
            </p>
          ) : null}
        </Field>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Channel                                                            */}
      {/* ----------------------------------------------------------------- */}
      <div className="space-y-1.5">
        <p className="text-label font-semibold text-secondary">Channel</p>
        <input type="hidden" name="channel" value={channel} />
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Pick a channel">
          {CHANNELS.map((key) => {
            const active = channel === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setChannel(key)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-small font-semibold transition-colors",
                  active
                    ? "border-transparent bg-action text-action-fg"
                    : "border-strong text-secondary hover:bg-sunken hover:text-primary",
                )}
              >
                <ChannelIcon channel={key} className="size-3.5" />
                {CHANNEL_LABELS[key]}
              </button>
            );
          })}
        </div>
        {channel === "app" ? (
          <p className="text-small text-muted">
            App messages queue for the borrower app, which isn&rsquo;t connected yet — the
            draft simply waits on their thread.
          </p>
        ) : null}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* What                                                               */}
      {/* ----------------------------------------------------------------- */}
      {needsSubject ? (
        <Field label="Subject" htmlFor="compose-subject" required>
          <Input
            id="compose-subject"
            name="subject"
            required
            placeholder="What this is about"
          />
        </Field>
      ) : null}

      {channel === "video" ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Video title"
              htmlFor="compose-video-title"
              required
              hint="Stands in for the thumbnail's link text."
            >
              <Input
                id="compose-video-title"
                name="videoTitle"
                required
                placeholder="e.g. Your rate options this week"
              />
            </Field>
            <Field label="Caption" htmlFor="compose-video-caption" hint="Optional, one line.">
              <Input
                id="compose-video-caption"
                name="videoCaption"
                placeholder="What the video covers"
              />
            </Field>
          </div>
          <p className="text-small text-muted">
            Demo video attachment — record or attach the video when sending is connected. Only
            the title and caption are saved; nothing uploads from here.
          </p>
        </div>
      ) : (
        <Field
          label="Message"
          htmlFor="compose-body"
          required
          hint={
            channel === "sms"
              ? "Texts read best short — a couple of sentences."
              : undefined
          }
        >
          <Textarea
            id="compose-body"
            name="body"
            rows={channel === "sms" ? 3 : 6}
            required
            placeholder="Write the message…"
          />
        </Field>
      )}

      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-critical/25 bg-critical-bg px-3 py-2 text-small text-critical"
        >
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-small text-muted">
          Saves as a draft on {chosen ? `${chosen.name.split(" ")[0]}'s` : "their"} thread.
          Nothing sends from here.
        </p>
        <Button type="submit" variant="primary" disabled={pending || !chosen}>
          {pending ? "Saving…" : "Save draft"}
        </Button>
      </div>
      {!chosen ? (
        <p className="text-small text-muted">Pick who it&rsquo;s for to save the draft.</p>
      ) : null}
    </form>
  );
}
