"use client";

/**
 * The partner record's working toolbar — task, note, message drafts, and
 * campaign enrollment. The same working set a person's record has.
 *
 * Every dialog is honest about what saving does. A draft is a draft: it lands
 * in the contact history marked "not sent", because this CRM has no mail, SMS,
 * or video integration. Enrolling in a campaign records the decision — it does
 * not send anything.
 */
import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { ListChecks, StickyNote, Mail, MessageSquareText, Video, Megaphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import {
  addPartnerTask,
  addPartnerNote,
  createPartnerDraft,
  enrollPartnerInCampaign,
  type TouchState,
} from "./actions";

type Tool = "task" | "note" | "email" | "sms" | "video" | "campaign" | null;

export type CampaignOption = { id: string; name: string; status: string };

const DRAFT_COPY: Record<
  "email" | "sms" | "video",
  { title: string; icon: ReactNode; bodyLabel: string; honest: string }
> = {
  email: {
    title: "Draft an email",
    icon: <Mail className="size-4" aria-hidden />,
    bodyLabel: "Message",
    honest:
      "This saves a draft in the contact history. Nothing is sent — copy it into your own inbox when you're ready.",
  },
  sms: {
    title: "Draft a text",
    icon: <MessageSquareText className="size-4" aria-hidden />,
    bodyLabel: "Message",
    honest:
      "This saves a draft in the contact history. Nothing is sent — text them from your own phone when you're ready.",
  },
  video: {
    title: "Draft a video message",
    icon: <Video className="size-4" aria-hidden />,
    bodyLabel: "What you'll say",
    honest:
      "This saves a script in the contact history. No video is recorded or sent — it's your talking points for when you record one.",
  },
};

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
      aria-labelledby="partner-tool-title"
    >
      <div className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-xl border border-subtle bg-surface shadow-e3 sm:rounded-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-subtle bg-surface px-4 py-3">
          <h2 id="partner-tool-title" className="text-h3 font-semibold text-primary">
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

export function RecordTools({
  partnerId,
  partnerName,
  nextAction,
  campaigns,
}: {
  partnerId: string;
  partnerName: string;
  /** The tier's suggested move — prefills the task title. */
  nextAction: string;
  campaigns: CampaignOption[];
}) {
  const [open, setOpen] = useState<Tool>(null);

  const [taskState, taskAction, taskPending] = useActionState<TouchState, FormData>(
    addPartnerTask,
    {},
  );
  const [noteState, noteAction, notePending] = useActionState<TouchState, FormData>(
    addPartnerNote,
    {},
  );
  const [draftState, draftAction, draftPending] = useActionState<TouchState, FormData>(
    createPartnerDraft,
    {},
  );
  const [enrollState, enrollAction, enrollPending] = useActionState<TouchState, FormData>(
    enrollPartnerInCampaign,
    {},
  );

  // Close only on the pending -> settled transition of a real submission.
  const pending = taskPending || notePending || draftPending || enrollPending;
  const error =
    open === "task"
      ? taskState.error
      : open === "note"
        ? noteState.error
        : open === "campaign"
          ? enrollState.error
          : draftState.error;
  const submitted = useRef(false);
  useEffect(() => {
    if (pending) {
      submitted.current = true;
      return;
    }
    if (submitted.current && !error) {
      submitted.current = false;
      setOpen(null);
    }
  }, [pending, error]);

  const errorLine = error ? (
    <p role="alert" className="text-small text-critical">
      {error}
    </p>
  ) : null;

  const draftKind = open === "email" || open === "sms" || open === "video" ? open : null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        <Button size="sm" variant="secondary" onClick={() => setOpen("task")}>
          <ListChecks className="size-3.5" aria-hidden />
          Add task
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setOpen("note")}>
          <StickyNote className="size-3.5" aria-hidden />
          Add note
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setOpen("email")}>
          <Mail className="size-3.5" aria-hidden />
          Email
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setOpen("sms")}>
          <MessageSquareText className="size-3.5" aria-hidden />
          Text
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setOpen("video")}>
          <Video className="size-3.5" aria-hidden />
          Video message
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setOpen("campaign")}>
          <Megaphone className="size-3.5" aria-hidden />
          Add to drip campaign
        </Button>
      </div>

      {open === "task" ? (
        <Dialog title={`Add a task about ${partnerName}`} onClose={() => setOpen(null)}>
          <form action={taskAction} className="space-y-4 p-4">
            <input type="hidden" name="partnerId" value={partnerId} />
            <Field label="What needs doing?" htmlFor="partner-task-title" required>
              <Input
                id="partner-task-title"
                name="title"
                required
                defaultValue={nextAction}
                autoComplete="off"
              />
            </Field>
            <Field label="When?" htmlFor="partner-task-due">
              <Select id="partner-task-due" name="dueIn" defaultValue="today">
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="next_week">Next week</option>
              </Select>
            </Field>
            <p className="text-small text-muted">
              Goes on your task list with {partnerName}&rsquo;s name on it.
            </p>
            {errorLine}
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

      {open === "note" ? (
        <Dialog title={`Add a note about ${partnerName}`} onClose={() => setOpen(null)}>
          <form action={noteAction} className="space-y-4 p-4">
            <input type="hidden" name="partnerId" value={partnerId} />
            <Field
              label="What happened?"
              htmlFor="partner-note-body"
              required
              hint="Lands in the contact history with today's date. It doesn't count as a touch — log one for that."
            >
              <Textarea id="partner-note-body" name="body" rows={4} required />
            </Field>
            {errorLine}
            <div className="flex items-center gap-2">
              <Button type="submit" variant="primary" disabled={notePending}>
                {notePending ? "Saving…" : "Save note"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setOpen(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </Dialog>
      ) : null}

      {draftKind ? (
        <Dialog title={DRAFT_COPY[draftKind].title} onClose={() => setOpen(null)}>
          <form action={draftAction} className="space-y-4 p-4">
            <input type="hidden" name="partnerId" value={partnerId} />
            <input type="hidden" name="channel" value={draftKind} />
            {draftKind === "email" ? (
              <Field label="Subject" htmlFor="partner-draft-subject">
                <Input id="partner-draft-subject" name="subject" autoComplete="off" />
              </Field>
            ) : null}
            <Field label={DRAFT_COPY[draftKind].bodyLabel} htmlFor="partner-draft-body" required>
              <Textarea id="partner-draft-body" name="body" rows={6} required />
            </Field>
            <p className="rounded-md bg-sunken px-3 py-2 text-small text-secondary">
              {DRAFT_COPY[draftKind].honest}
            </p>
            {errorLine}
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
        <Dialog title={`Add ${partnerName} to a drip campaign`} onClose={() => setOpen(null)}>
          {campaigns.length === 0 ? (
            <div className="space-y-4 p-4">
              <p className="text-body text-secondary">
                There are no campaigns to enroll them in yet. Build one under Marketing first.
              </p>
              <Button type="button" variant="ghost" onClick={() => setOpen(null)}>
                Close
              </Button>
            </div>
          ) : (
            <form action={enrollAction} className="space-y-4 p-4">
              <input type="hidden" name="partnerId" value={partnerId} />
              <Field label="Which campaign?" htmlFor="partner-enroll-campaign" required>
                <Select id="partner-enroll-campaign" name="campaignId" required>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <p className="rounded-md bg-sunken px-3 py-2 text-small text-secondary">
                This records the enrollment on {partnerName}&rsquo;s record so your team can see
                it. This CRM does not send campaign messages.
              </p>
              {errorLine}
              <div className="flex items-center gap-2">
                <Button type="submit" variant="primary" disabled={enrollPending}>
                  {enrollPending ? "Recording…" : "Record enrollment"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setOpen(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </Dialog>
      ) : null}
    </>
  );
}
