"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  AlarmClock,
  UserPlus,
  MessageSquare,
  ListChecks,
  CalendarClock,
  Hourglass,
  Moon,
  TrendingUp,
  Heart,
} from "lucide-react";
import type { QueueItem, PriorityClass } from "@/lib/queue-types";
import { decideInsight, completeTask, type ApprovalState } from "./actions";
import { AllyCard, AllyDraft, ComplianceFooterPreview } from "@/components/ally/ally-card";
import { Button } from "@/components/ui/button";
import { UrgencyDot } from "@/components/ui/badge";
import { CLASS_LABELS } from "@/lib/queue-types";
import { cn } from "@/lib/cn";

const CLASS_ICONS: Record<PriorityClass, typeof AlarmClock> = {
  deadline: AlarmClock,
  new_lead: UserPlus,
  inbound: MessageSquare,
  ally_approval: ListChecks,
  overdue_task: ListChecks,
  appointment: CalendarClock,
  waiting_borrower: Hourglass,
  stalled: Moon,
  opportunity: TrendingUp,
  relationship: Heart,
};

const REASONS = [
  { value: "wrong_timing", label: "Wrong timing" },
  { value: "wrong_tone", label: "Wrong tone" },
  { value: "wrong_recipient", label: "Wrong person" },
  { value: "factually_wrong", label: "Factually wrong" },
  { value: "compliance_concern", label: "Compliance concern" },
  { value: "not_needed", label: "Not needed" },
  { value: "other", label: "Something else" },
];

export function QueueItemRow({ item, loNmls }: { item: QueueItem; loNmls: string | null }) {
  if (item.insight) return <AllyQueueItem item={item} loNmls={loNmls} />;
  return <PlainQueueItem item={item} />;
}

/** Everything that isn't an Ally card: open the right surface, pre-loaded. */
function PlainQueueItem({ item }: { item: QueueItem }) {
  const Icon = CLASS_ICONS[item.cls];
  const isTask = item.cls === "overdue_task";
  const [, formAction, pending] = useActionState(
    async (_: null, fd: FormData) => {
      await completeTask(fd);
      return null;
    },
    null,
  );

  return (
    <li className="flex items-start gap-3 border-b border-subtle px-4 py-3 last:border-0 hover:bg-raised">
      <span
        className={cn(
          "mt-0.5 grid size-7 shrink-0 place-items-center rounded",
          item.urgency === "critical" && "bg-critical-bg text-critical",
          item.urgency === "warning" && "bg-warning-bg text-warning",
          item.urgency === "info" && "bg-info-bg text-info",
          item.urgency === "neutral" && "bg-neutral-bg text-neutral",
        )}
      >
        <Icon className="size-4" aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5">
          <UrgencyDot tone={item.urgency} />
          <span className="text-label font-semibold uppercase tracking-wide text-muted">
            {CLASS_LABELS[item.cls]}
          </span>
        </p>
        <Link href={item.href} className="mt-0.5 block">
          <span className="text-body font-semibold text-primary hover:text-action">
            {item.headline}
          </span>
        </Link>
        {item.detail ? (
          <p className="mt-0.5 line-clamp-2 text-small text-muted">{item.detail}</p>
        ) : null}
      </div>

      <div className="shrink-0">
        {isTask ? (
          <form action={formAction}>
            <input type="hidden" name="taskId" value={item.id.replace("task-", "")} />
            <Button type="submit" variant="secondary" size="sm" disabled={pending}>
              {pending ? "Saving…" : "Mark done"}
            </Button>
          </form>
        ) : (
          <Link
            href={item.href}
            className="inline-flex h-8 items-center rounded-md border border-strong bg-surface px-2.5 text-small font-semibold text-primary hover:bg-raised"
          >
            {item.actionLabel}
          </Link>
        )}
      </div>
    </li>
  );
}

/** An Ally card: what it prepared, why, and the three verdicts. */
function AllyQueueItem({ item, loNmls }: { item: QueueItem; loNmls: string | null }) {
  const [state, formAction, pending] = useActionState<ApprovalState, FormData>(
    decideInsight,
    {},
  );
  const [editing, setEditing] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const insight = item.insight!;
  const isDraft = insight.kind === "draft_email" || insight.kind === "draft_sms";

  if (state.ok) {
    return (
      <li className="border-b border-subtle px-4 py-3 last:border-0">
        <p className="text-small text-healthy">{state.ok}</p>
      </li>
    );
  }

  return (
    <li className="border-b border-subtle p-3 last:border-0">
      <AllyCard
        title={item.headline}
        rationale={insight.rationale}
        factors={insight.factors}
        meta={
          insight.templateRef ? (
            <span className="rounded bg-surface px-1.5 py-0.5 font-mono text-micro text-muted">
              {insight.templateRef}
            </span>
          ) : null
        }
        actions={
          <form action={formAction} className="w-full space-y-2">
            <input type="hidden" name="insightId" value={insight.id} />

            {editing && insight.body ? (
              <textarea
                name="editedBody"
                defaultValue={insight.body}
                rows={8}
                className="w-full rounded-md border border-strong bg-surface p-2.5 font-sans text-small leading-5 text-primary focus:border-action focus:outline-none"
              />
            ) : null}

            {skipping ? (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-small text-secondary">Why?</span>
                {REASONS.map((r) => (
                  <button
                    key={r.value}
                    type="submit"
                    name="reason"
                    value={r.value}
                    onClick={(e) => {
                      const form = e.currentTarget.form!;
                      (form.elements.namedItem("verdict") as HTMLInputElement).value = "skip";
                    }}
                    className="rounded border border-subtle px-2 py-1 text-small text-secondary hover:border-strong hover:text-primary"
                  >
                    {r.label}
                  </button>
                ))}
                <input type="hidden" name="verdict" value="skip" />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="submit"
                    name="verdict"
                    value={editing ? "edit_approve" : "approve"}
                    variant="primary"
                    size="sm"
                    disabled={pending}
                  >
                    {pending ? "Recording…" : editing ? "Save & approve" : item.actionLabel}
                  </Button>

                  {isDraft ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditing((v) => !v)}
                    >
                      {editing ? "Cancel edit" : "Edit"}
                    </Button>
                  ) : null}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSkipping(true)}
                  >
                    Skip
                  </Button>

                  {item.personId ? (
                    <Link
                      href={item.href}
                      className="text-small text-muted hover:text-action hover:underline"
                    >
                      Open {item.personName?.split(" ")[0]}
                    </Link>
                  ) : null}
                </div>

                {isDraft ? <ComplianceFooterPreview nmls={loNmls} /> : null}
              </>
            )}

            {state.error ? (
              <p role="alert" className="text-small text-critical">
                {state.error}
              </p>
            ) : null}
          </form>
        }
      >
        {insight.body && !editing ? (
          <AllyDraft body={insight.body} language={insight.language} />
        ) : null}
      </AllyCard>
    </li>
  );
}
