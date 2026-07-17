"use client";

import { useActionState, useRef, useState, startTransition } from "react";
import { FileText, ShieldCheck, Trash2, UploadCloud, Video } from "lucide-react";
import {
  uploadPersona,
  deletePersona,
  togglePersona,
  type ProfileState,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { validatePersonaFile } from "@/lib/profile-validation";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/cn";

export type PersonaView = {
  filename: string;
  sizeBytes: number;
  status: "ready" | "failed";
  extractedText: string | null;
  error: string | null;
  enabled: boolean;
  updatedAt: string;
};

const ACCEPT =
  ".pdf,.docx,.md,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/markdown,text/plain";

function fileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

export function PersonaSection({ persona }: { persona: PersonaView | null }) {
  const [uploadState, uploadAction, uploading] = useActionState<ProfileState, FormData>(
    uploadPersona,
    {},
  );
  const [deleteState, deleteAction, deleting] = useActionState<ProfileState, FormData>(
    deletePersona,
    {},
  );
  const [toggleState, toggleAction, toggling] = useActionState<ProfileState, FormData>(
    togglePersona,
    {},
  );

  const [clientError, setClientError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pending = uploading || deleting || toggling;
  const error =
    clientError ?? uploadState.error ?? deleteState.error ?? toggleState.error;
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
        dragging
          ? "border-brand bg-action-tint"
          : "border-strong bg-sunken hover:border-brand",
        pending && "pointer-events-none opacity-60",
      )}
    >
      <UploadCloud className="size-6 text-muted" aria-hidden />
      {uploading ? (
        <p className="font-semibold text-primary">Reading your document…</p>
      ) : (
        <>
          <p className="font-semibold text-primary">
            {persona ? "Drop a replacement document here" : "Drop your document here"}
          </p>
          <p className="text-small text-muted">
            or click to browse. PDF, Word (.docx), Markdown, or plain text, up to 5MB.
          </p>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-body text-secondary">
        Upload a document that describes you — your bio, your tone, how you like to write.
        When the assistant drafts a message for you, it uses this to sound like you. It
        never overrides compliance rules, approval requirements, or what you&apos;re
        allowed to see.
      </p>

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
                <p className="truncate font-semibold text-primary">{persona.filename}</p>
                <p className="text-small text-muted tnum">
                  {fileSize(persona.sizeBytes)} · updated {relativeTime(persona.updatedAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {persona.status === "failed" ? (
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
              {persona.error ??
                "We couldn't read that file. Replace it with another document."}
            </p>
          ) : persona.extractedText ? (
            <div className="border-b border-subtle px-4 py-3">
              <p className="text-label font-semibold uppercase tracking-wide text-muted">
                Preview of what the assistant reads
              </p>
              <pre className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-control border border-subtle bg-sunken p-3 font-sans text-small text-secondary">
                {persona.extractedText.slice(0, 600)}
                {persona.extractedText.length > 600 ? "…" : ""}
              </pre>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2 px-4 py-3">
            {persona.status === "ready" ? (
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
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={pending}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? "Uploading…" : "Replace"}
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={pending}
              onClick={() => {
                if (window.confirm("Delete your persona document? The assistant goes back to the standard Loan Factory voice.")) {
                  startTransition(() => deleteAction(new FormData()));
                }
              }}
            >
              <Trash2 className="size-4" aria-hidden />
              {deleting ? "Deleting…" : "Delete"}
            </Button>
            <p className="basis-full text-small text-muted sm:basis-auto sm:pl-1">
              When disabled, the assistant writes in the standard Loan Factory voice.
            </p>
          </div>
        </div>
      ) : (
        dropZone
      )}

      {persona && uploading ? dropZone : null}

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-critical/25 bg-critical-bg px-3 py-2 text-small text-critical"
        >
          {error}
        </p>
      ) : null}
      {ok && !error ? (
        <p
          role="status"
          className="rounded-md border border-healthy/25 bg-healthy-bg px-3 py-2 text-small text-healthy"
        >
          {ok}
        </p>
      ) : null}

      <div className="flex gap-3 rounded-card border border-info-border bg-info-bg p-4">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-info" aria-hidden />
        <p className="text-small text-secondary">
          Your persona is private to you — teammates and administrators cannot read it. It
          is treated as background information only: nothing in an uploaded file can change
          permissions, compliance rules, or what requires approval.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-subtle bg-sunken p-4">
        <div className="flex min-w-0 items-center gap-3">
          <Video className="size-5 shrink-0 text-muted" aria-hidden />
          <p className="text-body text-secondary">
            Watch this video to learn how to set up your custom AI persona.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled
          title="The walkthrough video hasn't been recorded yet"
        >
          Video coming soon
        </Button>
      </div>
    </div>
  );
}
