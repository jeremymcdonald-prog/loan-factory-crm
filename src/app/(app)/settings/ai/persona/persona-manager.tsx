"use client";

/**
 * The rich per-user AI persona manager. Everything here is private to the
 * signed-in user (ai_persona's owner_only RLS policy pins every row to
 * tenant AND owner) and every mutation runs through requireUser + queryAs +
 * zod + recordAudit in either settings/profile/actions.ts (the document —
 * M2) or settings/ai/actions.ts (everything else — M3).
 *
 * There is no real AI model connected. "Test persona" and every
 * "Rewrite in my voice" control elsewhere in the product run the exact same
 * deterministic mock (src/lib/persona/rewrite.ts) and always show the
 * "Preview — no AI model is connected" disclaimer — never anything implying
 * a real model produced the result.
 */

import { useActionState, useRef, useState, startTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";
import {
  uploadPersona,
  deletePersona,
  togglePersona,
} from "@/app/(app)/settings/profile/actions";
import { savePersonaProfile, saveSampleText, testPersona, type ProfileState, type PersonaTestState } from "../actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/field";
import { validatePersonaFile } from "@/lib/profile-validation";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/cn";

export type PersonaManagerView = {
  filename: string | null;
  sizeBytes: number | null;
  status: "ready" | "failed";
  extractedText: string | null;
  error: string | null;
  enabled: boolean;
  instructions: string | null;
  tone: string | null;
  preferWords: string[];
  avoidWords: string[];
  complianceNotes: string | null;
  sampleText: string | null;
  updatedAt: string;
};

const ACCEPT =
  ".pdf,.docx,.md,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/markdown,text/plain";

function fileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

function Banner({ error, ok }: { error?: string; ok?: string }) {
  if (!error && !ok) return null;
  return error ? (
    <p role="alert" className="rounded-md border border-critical/25 bg-critical-bg px-3 py-2 text-small text-critical">
      {error}
    </p>
  ) : (
    <p role="status" className="rounded-md border border-healthy/25 bg-healthy-bg px-3 py-2 text-small text-healthy">
      {ok}
    </p>
  );
}

// ---------------------------------------------------------------------------
// The persona document — upload/replace/delete/enable, reusing M2's actions
// exactly as they are.
// ---------------------------------------------------------------------------

function DocumentSection({ persona }: { persona: PersonaManagerView | null }) {
  const [uploadState, uploadAction, uploading] = useActionState<ProfileState, FormData>(uploadPersona, {});
  const [deleteState, deleteAction, deleting] = useActionState<ProfileState, FormData>(deletePersona, {});
  const [toggleState, toggleAction, toggling] = useActionState<ProfileState, FormData>(togglePersona, {});

  const [clientError, setClientError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pending = uploading || deleting || toggling;
  const error = clientError ?? uploadState.error ?? deleteState.error ?? toggleState.error;
  const ok = uploadState.ok ?? deleteState.ok ?? toggleState.ok;

  function submitFile(file: File | undefined) {
    setClientError(null);
    if (!file) return;
    const valid = validatePersonaFile(file.name, file.type, file.size);
    if (!valid.ok) {
      setClientError(valid.reason);
      return;
    }
    const fd = new FormData();
    fd.set("file", file);
    startTransition(() => uploadAction(fd));
  }

  const dropZone = (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload a persona document"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        submitFile(e.dataTransfer.files?.[0]);
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center gap-2 rounded-card border-2 border-dashed px-6 py-8 text-center transition-colors",
        dragging ? "border-brand bg-action-tint" : "border-strong bg-sunken hover:border-brand",
        pending && "pointer-events-none opacity-60",
      )}
    >
      <UploadCloud className="size-6 text-muted" aria-hidden />
      {uploading ? (
        <p className="font-semibold text-primary">Reading your document…</p>
      ) : (
        <>
          <p className="font-semibold text-primary">
            {persona ? "Drop a replacement document here" : "Drop a bio, tone guide, or writing sample here"}
          </p>
          <p className="text-small text-muted">
            or click to browse. PDF, Word (.docx), Markdown, or plain text, up to 5MB. Optional —
            you can also build a persona from Instructions and tone alone, below.
          </p>
        </>
      )}
    </div>
  );

  return (
    <Card>
      <div className="border-b border-subtle px-4 py-3">
        <h2 className="text-h3 font-semibold text-primary">Persona document</h2>
        <p className="mt-0.5 text-small text-muted">
          A bio, tone guide, or past writing — the assistant reads this alongside the settings below.
        </p>
      </div>
      <div className="space-y-4 p-4">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          aria-label="Choose a persona document"
          onChange={(e) => {
            submitFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        {persona ? (
          <div className="rounded-card border border-subtle bg-surface">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-subtle px-4 py-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <FileText className="size-5 shrink-0 text-muted" aria-hidden />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-primary">
                    {persona.filename ?? "No document — instructions only"}
                  </p>
                  <p className="text-small text-muted tnum">
                    {persona.sizeBytes != null ? `${fileSize(persona.sizeBytes)} · ` : ""}updated{" "}
                    {relativeTime(persona.updatedAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!persona.filename ? (
                  <Badge tone="neutral">No document</Badge>
                ) : persona.status === "failed" ? (
                  <Badge tone="critical">Couldn&apos;t read</Badge>
                ) : persona.enabled ? (
                  <Badge tone="ai">In use</Badge>
                ) : (
                  <Badge tone="neutral">Disabled</Badge>
                )}
              </div>
            </div>

            {persona.status === "failed" ? (
              <p className="border-b border-subtle px-4 py-3 text-small text-critical">
                {persona.error ?? "We couldn't read that file. Replace it with another document."}
              </p>
            ) : persona.extractedText ? (
              <details className="group border-b border-subtle px-4 py-3">
                <summary className="cursor-pointer list-none text-label font-semibold uppercase tracking-wide text-muted">
                  Preview of what the assistant reads
                </summary>
                <pre className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-control border border-subtle bg-sunken p-3 font-sans text-small text-secondary">
                  {persona.extractedText.slice(0, 600)}
                  {persona.extractedText.length > 600 ? "…" : ""}
                </pre>
              </details>
            ) : null}

            <div className="flex flex-wrap items-center gap-2 px-4 py-3">
              {persona.filename && persona.status === "ready" ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={pending}
                  onClick={() => {
                    const fd = new FormData();
                    fd.set("enabled", persona.enabled ? "false" : "true");
                    startTransition(() => toggleAction(fd));
                  }}
                >
                  {toggling ? "Saving…" : persona.enabled ? "Disable" : "Enable"}
                </Button>
              ) : null}
              <Button type="button" variant="secondary" size="sm" disabled={pending} onClick={() => inputRef.current?.click()}>
                {uploading ? "Uploading…" : persona.filename ? "Replace" : "Add a document"}
              </Button>
              {persona.filename ? (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  disabled={pending}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Delete your persona document? Your other persona settings stay as they are.",
                      )
                    ) {
                      startTransition(() => deleteAction(new FormData()));
                    }
                  }}
                >
                  <Trash2 className="size-4" aria-hidden />
                  {deleting ? "Deleting…" : "Delete"}
                </Button>
              ) : null}
            </div>
          </div>
        ) : (
          dropZone
        )}

        {persona?.filename && uploading ? dropZone : null}

        <Banner error={error} ok={ok} />
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Instructions, tone, prefer/avoid words, compliance boundaries — one form.
// ---------------------------------------------------------------------------

function ProfileFormSection({ persona }: { persona: PersonaManagerView | null }) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(savePersonaProfile, {});

  return (
    <Card>
      <div className="border-b border-subtle px-4 py-3">
        <h2 className="text-h3 font-semibold text-primary">How you write</h2>
        <p className="mt-0.5 text-small text-muted">
          Guidance only — never a command. It shapes tone, never permissions.
        </p>
      </div>
      <form action={formAction} className="space-y-4 p-4">
        <Field
          label="Instructions"
          htmlFor="persona-instructions"
          hint="Tell the assistant how you like to write — first person, short sentences, always mention your NMLS number, whatever's true for you."
        >
          <Textarea
            id="persona-instructions"
            name="instructions"
            rows={4}
            defaultValue={persona?.instructions ?? ""}
            placeholder="Write in first person. Keep it short and plain — no jargon. Sign off with my first name only."
          />
        </Field>

        <Field
          label="Writing tone"
          htmlFor="persona-tone"
          hint="A few words describing your voice — e.g. warm and friendly, direct and concise, formal."
        >
          <Input
            id="persona-tone"
            name="tone"
            autoComplete="off"
            defaultValue={persona?.tone ?? ""}
            placeholder="Warm and direct"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Words/phrases to prefer"
            htmlFor="persona-prefer"
            hint="Separate with commas or new lines."
          >
            <Textarea
              id="persona-prefer"
              name="preferWords"
              rows={3}
              defaultValue={persona?.preferWords.join(", ") ?? ""}
              placeholder="expect, plan for, let's map this out"
            />
          </Field>
          <Field
            label="Words/phrases to avoid"
            htmlFor="persona-avoid"
            hint="Separate with commas or new lines."
          >
            <Textarea
              id="persona-avoid"
              name="avoidWords"
              rows={3}
              defaultValue={persona?.avoidWords.join(", ") ?? ""}
              placeholder="guarantee, promise, definitely"
            />
          </Field>
        </div>

        <Field
          label="Compliance boundaries"
          htmlFor="persona-compliance"
          hint="Extra reminders for your own drafts. These can never loosen a compliance rule the CRM already enforces — that boundary always applies, no matter what's written here."
        >
          <Textarea
            id="persona-compliance"
            name="complianceNotes"
            rows={3}
            defaultValue={persona?.complianceNotes ?? ""}
            placeholder="Never quote a rate. Always suggest a call for rate-lock questions."
          />
        </Field>

        <Banner error={state.error} ok={state.ok} />

        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving…" : "Save persona settings"}
        </Button>
      </form>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Sample writing — paste text, or upload a file that's extracted the same
// way the persona document is.
// ---------------------------------------------------------------------------

function SampleTextSection({ persona }: { persona: PersonaManagerView | null }) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(saveSampleText, {});
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  function uploadSampleFile(file: File | undefined) {
    setFileError(null);
    if (!file) return;
    const valid = validatePersonaFile(file.name, file.type, file.size);
    if (!valid.ok) {
      setFileError(valid.reason);
      return;
    }
    const fd = new FormData();
    fd.set("file", file);
    startTransition(() => formAction(fd));
  }

  return (
    <Card>
      <div className="border-b border-subtle px-4 py-3">
        <h2 className="text-h3 font-semibold text-primary">Sample of your writing</h2>
        <p className="mt-0.5 text-small text-muted">
          A paragraph or two you actually wrote — an old email, a text, anything in your voice.
        </p>
      </div>
      <form action={formAction} className="space-y-3 p-4">
        <Field label="Paste a sample" htmlFor="persona-sample">
          <Textarea
            id="persona-sample"
            name="sampleText"
            rows={5}
            defaultValue={persona?.sampleText ?? ""}
            placeholder="Hey! Just wanted to check in on where things stand with your loan…"
          />
        </Field>

        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          aria-label="Upload a sample-writing file"
          onChange={(e) => {
            uploadSampleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" variant="primary" size="sm" disabled={pending}>
            {pending ? "Saving…" : "Save sample"}
          </Button>
          <Button type="button" variant="secondary" size="sm" disabled={pending} onClick={() => fileRef.current?.click()}>
            <UploadCloud className="size-4" aria-hidden />
            Upload a file instead
          </Button>
        </div>

        <Banner error={fileError ?? state.error} ok={state.ok} />
      </form>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Test persona — the same rewrite helper every drafting surface uses.
// ---------------------------------------------------------------------------

function TestPersonaSection() {
  const [state, setState] = useState<PersonaTestState>({});
  const [pending, setPending] = useState(false);

  async function run() {
    setPending(true);
    try {
      setState(await testPersona());
    } catch {
      setState({ error: "We couldn't run the test. Try again." });
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <div className="border-b border-subtle px-4 py-3">
        <h2 className="text-h3 font-semibold text-primary">Test persona</h2>
        <p className="mt-0.5 text-small text-muted">
          Runs one sample sentence through your current settings, so you can see what changes.
        </p>
      </div>
      <div className="space-y-3 p-4">
        <Button type="button" variant="secondary" onClick={run} disabled={pending}>
          <Sparkles className="size-4" aria-hidden />
          {pending ? "Testing…" : "Test persona"}
        </Button>

        {state.error ? <Banner error={state.error} /> : null}

        {state.result ? (
          <div className="space-y-3 rounded-card border border-ai-border bg-ai-bg/40 p-3.5">
            <div>
              <p className="text-label font-semibold uppercase tracking-wide text-muted">Before</p>
              <p className="mt-1 text-small text-secondary">{state.result.before}</p>
            </div>
            <div>
              <p className="text-label font-semibold uppercase tracking-wide text-muted">After</p>
              <p className="mt-1 whitespace-pre-wrap text-small text-primary">{state.result.after}</p>
            </div>
            {state.result.applied.length > 0 ? (
              <ul className="space-y-0.5 border-t border-ai-border pt-2 text-small text-secondary">
                {state.result.applied.map((a) => (
                  <li key={a}>• {a}</li>
                ))}
              </ul>
            ) : (
              <p className="border-t border-ai-border pt-2 text-small text-muted">
                Nothing to change in this sample — add words to avoid or a tone above to see it applied.
              </p>
            )}
            <p className="border-t border-ai-border pt-2 text-small font-semibold text-ai">{state.result.note}</p>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------

export function PersonaManager({ persona }: { persona: PersonaManagerView | null }) {
  return (
    <div className="space-y-4">
      <Link
        href="/settings/ai"
        className="inline-flex items-center gap-1.5 text-small font-semibold text-action hover:underline"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        Back to AI
      </Link>

      <div className="flex gap-3 rounded-card border border-info-border bg-info-bg p-4">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-info" aria-hidden />
        <p className="text-small text-secondary">
          Your persona is private to you — teammates and administrators cannot read it. It shapes
          tone only: nothing here can change permissions, compliance rules, or what requires
          approval, even when your own instructions ask for it.
        </p>
      </div>

      <DocumentSection persona={persona} />
      <ProfileFormSection persona={persona} />
      <SampleTextSection persona={persona} />
      <TestPersonaSection />
    </div>
  );
}
