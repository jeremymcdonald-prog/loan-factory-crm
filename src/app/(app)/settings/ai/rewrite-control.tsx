"use client";

/**
 * "Rewrite in my voice" — the one reusable control every drafting surface
 * wires in to call the persona rewrite helper (src/lib/persona/rewrite.ts via
 * rewriteMyDraft in ./actions). Used today by the video-message composer and
 * the people/partner follow-up drafting dialog; per M6, the campaign step
 * editor and the template library call the same `rewriteMyDraft` action.
 *
 * Nothing here applies automatically: the caller only gets the rewritten
 * text if the person clicks "Use this version", and the disclaimer
 * (`rewriteMyDraft`'s honest note — "no AI model is connected") is always
 * shown alongside the preview.
 */

import { useState } from "react";
import { Check, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { rewriteMyDraft } from "./actions";

export function RewriteInMyVoice({
  getText,
  onAccept,
  channel,
  className,
}: {
  /** Reads the current draft text at click time — works with controlled state or a ref. */
  getText: () => string;
  /** Called only when the person explicitly accepts the preview. */
  onAccept: (text: string) => void;
  channel?: string;
  className?: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    output: string;
    note: string;
    applied: string[];
    hasPersona: boolean;
    personaEnabled: boolean;
  } | null>(null);

  async function run() {
    const input = getText();
    setError(null);
    setPreview(null);
    if (!input.trim()) {
      setError("Write something first.");
      return;
    }
    setPending(true);
    try {
      const result = await rewriteMyDraft(input, channel);
      setPreview(result);
    } catch {
      setError("We couldn't rewrite that. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={className}>
      <Button type="button" variant="ghost" size="sm" onClick={run} disabled={pending}>
        <Sparkles className="size-3.5" aria-hidden />
        {pending ? "Rewriting…" : "Rewrite in my voice"}
      </Button>

      {error ? (
        <p role="alert" className="mt-1.5 text-small text-critical">
          {error}
        </p>
      ) : null}

      {preview ? (
        <div className="mt-2 space-y-2 rounded-card border border-ai-border bg-ai-bg/40 p-3">
          {!preview.hasPersona ? (
            <p className="text-small text-secondary">
              You haven&apos;t set up a persona yet — this is your original text, unchanged.{" "}
              <a href="/settings/ai/persona" className="font-semibold text-ai hover:underline">
                Set one up
              </a>
              .
            </p>
          ) : !preview.personaEnabled ? (
            <p className="text-small text-secondary">
              Your persona is turned off, so this is your original text, unchanged.
            </p>
          ) : null}

          <pre className="whitespace-pre-wrap rounded-control border border-subtle bg-surface p-2.5 font-sans text-small text-secondary">
            {preview.output}
          </pre>

          {preview.applied.length > 0 ? (
            <ul className="space-y-0.5 text-small text-muted">
              {preview.applied.map((a) => (
                <li key={a}>• {a}</li>
              ))}
            </ul>
          ) : null}

          <p className="text-small font-semibold text-ai">{preview.note}</p>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                onAccept(preview.output);
                setPreview(null);
              }}
            >
              <Check className="size-3.5" aria-hidden />
              Use this version
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setPreview(null)}>
              <X className="size-3.5" aria-hidden />
              Discard
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
