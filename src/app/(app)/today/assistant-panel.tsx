"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Maximize2, Minimize2, SquarePen, SendHorizonal } from "lucide-react";
import type { Briefing } from "./briefing";
import { askAssistant } from "./assistant-actions";
import { SUGGESTED_PROMPTS } from "@/lib/assistant/router";
import { AIMark } from "@/components/ai/ai-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

type ChatMessage = { role: "user" | "assistant"; text: string };

const STORAGE_KEY = "lfcrm-assistant-thread";

/**
 * The Today assistant panel — the briefing area, made conversational.
 *
 * The morning briefing is the assistant's opening message; from there the user
 * can ask questions against their own records. Honesty is structural: the
 * header carries a Preview badge, and every reply states that no model is
 * connected. Drafts stay in the chat — sending still requires the approval
 * queue.
 */
export function AssistantPanel({ briefing }: { briefing: Briefing }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [pending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Recent conversation context survives a reload, but not a sign-out
  // (sessionStorage dies with the tab). The restore must happen after mount:
  // the server render can't see sessionStorage, so first paint is empty on
  // both sides and the saved thread hydrates in — the one legitimate
  // setState-in-effect, hence the targeted disable.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setMessages(JSON.parse(saved));
    } catch {
      /* a corrupt thread is not worth an error state */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* storage full — the thread simply won't persist */
    }
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, pending, expanded]);

  useEffect(() => {
    if (!expanded) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setExpanded(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [expanded]);

  function ask(question: string) {
    const q = question.trim();
    if (!q || pending) return;
    setError(null);
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);

    startTransition(async () => {
      const fd = new FormData();
      fd.set("question", q);
      const result = await askAssistant(fd);
      if (result.ok) {
        setMessages((m) => [...m, { role: "assistant", text: result.reply }]);
      } else {
        setError(result.error);
      }
    });
  }

  function newChat() {
    setMessages([]);
    setError(null);
    setInput("");
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing to clear */
    }
  }

  const body = (
    <>
      {/* Thread */}
      <div
        ref={scrollRef}
        className={cn(
          "overflow-y-auto px-4 py-3",
          expanded ? "flex-1" : "max-h-[420px]",
        )}
      >
        {/* The briefing is the assistant's opening message. */}
        <div className="flex items-start gap-2.5">
          <AIMark className="mt-1" />
          <div className="min-w-0 flex-1">
            {briefing.lead ? (
              <p className="text-body text-secondary">{briefing.lead}</p>
            ) : null}
            {briefing.bullets.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {briefing.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-body text-secondary">
                    <span
                      aria-hidden
                      className="mt-[7px] size-1.5 shrink-0 rounded-full bg-ai/60"
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {briefing.topActions.length > 0 ? (
              <div className="mt-3">
                <p className="text-label font-semibold uppercase tracking-wide text-ai">
                  If you only do three things today
                </p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {briefing.topActions.map((a, i) => (
                    <Link
                      key={a.href + i}
                      href={a.href}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-control px-3 py-1.5 text-small font-semibold transition-colors",
                        i === 0
                          ? "bg-action text-action-fg shadow-e1 hover:bg-action-hover"
                          : "border border-strong bg-surface text-primary hover:border-brand hover:bg-action-tint",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "grid size-4 shrink-0 place-items-center rounded-full text-[10px] font-bold tnum",
                          i === 0 ? "bg-white/25 text-white" : "bg-brand text-white",
                        )}
                      >
                        {i + 1}
                      </span>
                      {a.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* The conversation */}
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "mt-3 flex",
              m.role === "user" ? "justify-end" : "items-start gap-2.5",
            )}
          >
            {m.role === "assistant" ? <AIMark className="mt-1" /> : null}
            <div
              className={cn(
                "max-w-[92%] whitespace-pre-wrap rounded-card border px-3 py-2 text-small leading-5 sm:max-w-[80%]",
                m.role === "user"
                  ? "border-subtle bg-sunken text-primary"
                  : "border-ai-border bg-surface text-secondary",
              )}
            >
              {m.text}
            </div>
          </div>
        ))}

        {pending ? (
          <div className="mt-3 flex items-start gap-2.5" role="status" aria-label="The assistant is working">
            <AIMark className="mt-1" />
            <div className="rounded-card border border-ai-border bg-surface px-3 py-2">
              <span className="animate-shimmer inline-block h-4 w-40 rounded" />
              <p className="mt-1 text-micro text-muted">Reading your records…</p>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="mt-3 flex items-start gap-2.5">
            <AIMark className="mt-1" />
            <div className="rounded-card border border-critical-border bg-critical-bg px-3 py-2">
              <p className="text-small text-critical">{error}</p>
              <button
                type="button"
                onClick={() => {
                  const lastUser = [...messages].reverse().find((m) => m.role === "user");
                  if (lastUser) {
                    setMessages((m) => m.slice(0, -1));
                    ask(lastUser.text);
                  } else {
                    setError(null);
                  }
                }}
                className="mt-1 text-small font-semibold text-critical underline"
              >
                Try again
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Suggested prompts — until the user has found their feet. */}
      {messages.length < 2 ? (
        <div className="flex flex-wrap gap-1.5 border-t border-ai-border/60 px-4 py-2.5">
          {SUGGESTED_PROMPTS.map((p) => (
            <button
              key={p.intent}
              type="button"
              disabled={pending}
              onClick={() => ask(p.label)}
              className="rounded-full border border-ai-border bg-surface px-2.5 py-1 text-small text-secondary transition-colors hover:border-ai hover:text-ai disabled:opacity-50"
            >
              {p.label}
            </button>
          ))}
        </div>
      ) : null}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="flex items-center gap-2 border-t border-ai-border/60 px-4 py-3"
      >
        <label htmlFor="assistant-question" className="sr-only">
          Ask the assistant
        </label>
        <input
          id="assistant-question"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            // Belt and braces alongside the form's onSubmit: automation tools
            // and some IMEs dispatch Enter without triggering implicit submit.
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              ask(input);
            }
          }}
          placeholder="Ask about your day, your pipeline, or a follow-up…"
          autoComplete="off"
          className="h-10 flex-1 rounded-control border border-strong bg-surface px-3 text-body text-primary placeholder:text-muted focus:border-ai focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          className="inline-flex h-10 items-center gap-1.5 rounded-control bg-action px-3.5 text-body font-semibold text-action-fg shadow-e1 transition-colors hover:bg-action-hover disabled:pointer-events-none disabled:opacity-45"
        >
          <SendHorizonal className="size-4" aria-hidden />
          Send
        </button>
      </form>
    </>
  );

  const header = (
    <div className="flex items-center gap-2.5 border-b border-ai-border/60 px-4 py-3">
      <AIMark />
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-h2 font-semibold tracking-tight text-primary">
          {briefing.greeting}
        </h1>
      </div>
      <Badge tone="ai">AI Assistant · Preview</Badge>
      <button
        type="button"
        onClick={newChat}
        title="Start a new chat"
        aria-label="Start a new chat"
        className="rounded-control p-1.5 text-muted transition-colors hover:bg-sunken hover:text-primary"
      >
        <SquarePen className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        title={expanded ? "Close the workspace" : "Open a larger workspace"}
        aria-label={expanded ? "Close the assistant workspace" : "Expand the assistant"}
        className="rounded-control p-1.5 text-muted transition-colors hover:bg-sunken hover:text-primary"
      >
        {expanded ? (
          <Minimize2 className="size-4" aria-hidden />
        ) : (
          <Maximize2 className="size-4" aria-hidden />
        )}
      </button>
    </div>
  );

  if (expanded) {
    return (
      <>
        {/* Keep the page height stable behind the overlay. */}
        <section className="rounded-card border border-ai-border bg-ai-bg/40 p-5">
          <p className="text-small text-muted">The assistant is open in the larger workspace.</p>
        </section>
        <div
          role="dialog"
          aria-modal="true"
          aria-label="AI assistant workspace"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-8"
        >
          <div className="flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-card border border-ai-border bg-ai-bg/40 shadow-e3 backdrop-blur-sm">
            <div className="flex h-full flex-col bg-canvas/95">
              {header}
              {body}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <section className="overflow-hidden rounded-card border border-ai-border bg-ai-bg/40">
      {header}
      {body}
    </section>
  );
}
