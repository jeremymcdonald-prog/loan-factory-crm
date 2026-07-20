"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { Mail, MessageSquareText, Video, Megaphone, CalendarPlus, X } from "lucide-react";
import {
  createDraftMessage,
  enrollInCampaign,
  addTask,
  type NoteState,
  type EnrollState,
} from "./actions";
import type { CampaignChoice } from "@/lib/queries/people";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, Select } from "@/components/ui/field";
import { getMySignatureProfile } from "@/app/(app)/settings/profile/actions";
import { renderSignatureText, type SignatureProfile } from "@/lib/signature";

type DialogKind = "email" | "sms" | "video" | "campaign" | "task" | null;

const DRAFT_COPY: Record<
  "email" | "sms" | "video",
  { title: string; bodyLabel: string; hint: string }
> = {
  email: {
    title: "Draft an email",
    bodyLabel: "Message",
    hint: "Saves a draft on their conversation thread. Nothing sends — no email account is connected yet.",
  },
  sms: {
    title: "Draft a text",
    bodyLabel: "Message",
    hint: "Saves a draft on their conversation thread. Nothing sends — no texting provider is connected yet.",
  },
  video: {
    title: "Draft a video message",
    bodyLabel: "What the video should say",
    hint: "Saves a script draft on their conversation thread. Nothing records or sends — no video provider is connected yet.",
  },
};

/** Shared modal shell — the same pattern as Log a touch. */
function Dialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="record-action-title"
    >
      <div className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-xl border border-subtle bg-surface shadow-e3 sm:rounded-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-subtle bg-surface px-4 py-3">
          <h2 id="record-action-title" className="text-h3 font-semibold text-primary">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-muted hover:bg-sunken hover:text-primary"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/**
 * The record's secondary actions: reach out (as drafts), enroll in a drip
 * campaign, or set a follow-up task. Log a touch stays the one primary.
 */
export function RecordActions({
  personId,
  personName,
  loanId,
  doNotContact,
  campaigns,
}: {
  personId: string;
  personName: string;
  loanId: string | null;
  doNotContact: boolean;
  campaigns: CampaignChoice[];
}) {
  const [open, setOpen] = useState<DialogKind>(null);

  const [draftState, draftAction, draftPending] = useActionState<NoteState, FormData>(
    createDraftMessage,
    {},
  );
  const [enrollState, enrollAction, enrollPending] = useActionState<EnrollState, FormData>(
    enrollInCampaign,
    {},
  );
  const [taskState, taskAction, taskPending] = useActionState<NoteState, FormData>(addTask, {});

  // The signed-in user's own signature, fetched from the shared profile
  // action so the email draft below can append/preview the *real* rendered
  // signature (src/lib/signature.ts) rather than nothing at all.
  const [signatureProfile, setSignatureProfile] = useState<SignatureProfile | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    let alive = true;
    getMySignatureProfile()
      .then((p) => {
        if (alive) setSignatureProfile(p);
      })
      .catch(() => {
        /* the dialog simply won't offer a signature to append */
      });
    return () => {
      alive = false;
    };
  }, []);
  const signatureText = signatureProfile ? renderSignatureText(signatureProfile) : null;

  function appendSignature() {
    const el = bodyRef.current;
    if (!el || !signatureText) return;
    const separator = el.value.trim() ? "\n\n" : "";
    el.value = `${el.value}${separator}${signatureText}`;
    el.focus();
  }

  // Close the task dialog on the pending -> settled transition of a real
  // submission (drafts navigate away; enrollment shows its honest label).
  const taskSubmitted = useRef(false);
  useEffect(() => {
    if (taskPending) {
      taskSubmitted.current = true;
      return;
    }
    if (taskSubmitted.current && !taskState.error) {
      taskSubmitted.current = false;
      setOpen(null);
    }
  }, [taskPending, taskState.error]);

  const contactBlocked = doNotContact;
  const blockedTitle = contactBlocked
    ? `${personName} asked not to be contacted`
    : undefined;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          onClick={() => setOpen("email")}
          disabled={contactBlocked}
          title={blockedTitle}
        >
          <Mail className="size-4" aria-hidden />
          Email
        </Button>
        <Button
          size="sm"
          onClick={() => setOpen("sms")}
          disabled={contactBlocked}
          title={blockedTitle}
        >
          <MessageSquareText className="size-4" aria-hidden />
          Text
        </Button>
        <Button
          size="sm"
          onClick={() => setOpen("video")}
          disabled={contactBlocked}
          title={blockedTitle}
        >
          <Video className="size-4" aria-hidden />
          Video message
        </Button>
        <Button
          size="sm"
          onClick={() => setOpen("campaign")}
          disabled={contactBlocked}
          title={blockedTitle}
        >
          <Megaphone className="size-4" aria-hidden />
          Add to campaign
        </Button>
        <Button size="sm" onClick={() => setOpen("task")}>
          <CalendarPlus className="size-4" aria-hidden />
          Add task
        </Button>
      </div>

      {open === "email" || open === "sms" || open === "video" ? (
        <Dialog title={DRAFT_COPY[open].title} onClose={() => setOpen(null)}>
          <form action={draftAction} className="space-y-4 p-4">
            <input type="hidden" name="personId" value={personId} />
            {loanId ? <input type="hidden" name="loanId" value={loanId} /> : null}
            <input type="hidden" name="channel" value={open} />

            {open === "email" ? (
              <Field label="Subject" htmlFor="draft-subject">
                <Input id="draft-subject" name="subject" autoComplete="off" />
              </Field>
            ) : null}

            <Field
              label={DRAFT_COPY[open].bodyLabel}
              htmlFor="draft-body"
              hint={DRAFT_COPY[open].hint}
            >
              <Textarea id="draft-body" name="body" rows={5} required autoFocus ref={bodyRef} />
            </Field>

            {open === "email" && signatureText ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-label font-semibold text-secondary">Your signature</span>
                  <Button type="button" variant="ghost" size="sm" onClick={appendSignature}>
                    Append my signature
                  </Button>
                </div>
                <div className="rounded-card border border-subtle bg-sunken p-3">
                  <p className="whitespace-pre-line text-small text-secondary">{signatureText}</p>
                  {signatureProfile?.logoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={signatureProfile.logoDataUrl}
                      alt=""
                      className="mt-1.5 max-h-10 max-w-full object-contain"
                    />
                  ) : null}
                </div>
                <p className="text-small text-muted">
                  Preview only — use “Append my signature” to add it to the message above.
                </p>
              </div>
            ) : null}

            {draftState.error ? (
              <p role="alert" className="text-small text-critical">
                {draftState.error}
              </p>
            ) : null}

            <div className="flex items-center gap-2">
              <Button type="submit" variant="primary" disabled={draftPending}>
                {draftPending ? "Saving…" : "Save draft"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setOpen(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </Dialog>
      ) : null}

      {open === "campaign" ? (
        <Dialog title={`Add ${personName} to a drip campaign`} onClose={() => setOpen(null)}>
          <form action={enrollAction} className="space-y-4 p-4">
            <input type="hidden" name="personId" value={personId} />

            {campaigns.length === 0 ? (
              <p className="text-body text-secondary">
                No open campaigns in your book. Create one in Marketing first.
              </p>
            ) : (
              <Field
                label="Campaign"
                htmlFor="enroll-campaign"
                hint="Enrolling records it here — messages queue for sending when a provider is connected."
              >
                <Select id="enroll-campaign" name="campaignId" defaultValue="" required>
                  <option value="" disabled>
                    Pick a campaign…
                  </option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {c.status} · {c.audienceSize}{" "}
                      {c.audienceSize === 1 ? "person" : "people"}
                    </option>
                  ))}
                </Select>
              </Field>
            )}

            {enrollState.error ? (
              <p role="alert" className="text-small text-critical">
                {enrollState.error}
              </p>
            ) : null}
            {enrollState.enrolled ? (
              <p className="rounded-md border border-healthy-border bg-healthy-bg px-3 py-2 text-small text-healthy">
                {enrollState.enrolled}
              </p>
            ) : null}

            <div className="flex items-center gap-2">
              {enrollState.enrolled ? (
                <Button type="button" variant="primary" onClick={() => setOpen(null)}>
                  Done
                </Button>
              ) : (
                <>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={enrollPending || campaigns.length === 0}
                  >
                    {enrollPending ? "Enrolling…" : "Enroll"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setOpen(null)}>
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </form>
        </Dialog>
      ) : null}

      {open === "task" ? (
        <Dialog title={`Add a task for ${personName}`} onClose={() => setOpen(null)}>
          <form action={taskAction} className="space-y-4 p-4">
            <input type="hidden" name="personId" value={personId} />
            {loanId ? <input type="hidden" name="loanId" value={loanId} /> : null}

            <Field label="What needs doing?" htmlFor="task-title" required>
              <Input
                id="task-title"
                name="title"
                required
                autoFocus
                autoComplete="off"
                placeholder="Call about their preapproval"
              />
            </Field>

            <Field label="Due" htmlFor="task-due" hint="Optional.">
              <Input id="task-due" name="dueAt" type="datetime-local" />
            </Field>

            {taskState.error ? (
              <p role="alert" className="text-small text-critical">
                {taskState.error}
              </p>
            ) : null}

            <div className="flex items-center gap-2">
              <Button type="submit" variant="primary" disabled={taskPending}>
                {taskPending ? "Adding…" : "Add task"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setOpen(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </Dialog>
      ) : null}
    </>
  );
}
