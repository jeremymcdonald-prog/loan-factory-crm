"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Megaphone, CalendarPlus, Download, X } from "lucide-react";
import {
  bulkEnrollInCampaign,
  bulkAddTask,
  exportPeopleCsv,
  type BulkState,
} from "./actions";
import type { PersonListRow, CampaignChoice } from "@/lib/queries/people";
import { personUrgency } from "@/lib/person-urgency";
import { moneyCompact, relativeTime, initialsOf } from "@/lib/format";
import { StageChip } from "@/components/crm/stage-chip";
import { LanguageBadge } from "@/components/crm/language-badge";
import { Badge, UrgencyDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { cn } from "@/lib/cn";

type DialogKind = "campaign" | "task" | null;

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
      aria-labelledby="bulk-action-title"
    >
      <div className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-xl border border-subtle bg-surface shadow-e3 sm:rounded-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-subtle bg-surface px-4 py-3">
          <h2 id="bulk-action-title" className="text-h3 font-semibold text-primary">
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
 * The People table with row selection and bulk actions: enroll a selection in
 * a campaign, give everyone the same follow-up task, or export them as CSV.
 * The rows themselves are exactly the server-rendered table this replaced.
 */
export function PeopleTable({
  rows,
  campaigns,
}: {
  rows: PersonListRow[];
  campaigns: CampaignChoice[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const [enrollState, enrollAction, enrollPending] = useActionState<BulkState, FormData>(
    bulkEnrollInCampaign,
    {},
  );
  const [taskState, taskAction, taskPending] = useActionState<BulkState, FormData>(
    bulkAddTask,
    {},
  );

  // Close the dialog and clear the selection when a bulk action lands.
  const lastDone = useRef<string | undefined>(undefined);
  const activeState = dialog === "campaign" ? enrollState : dialog === "task" ? taskState : null;
  useEffect(() => {
    const done = enrollState.done ?? taskState.done;
    if (done && done !== lastDone.current) {
      lastDone.current = done;
      setNotice(done);
      setSelected(new Set());
      setDialog(null);
    }
  }, [enrollState.done, taskState.done]);

  const now = new Date();
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
  };

  const runExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const result = await exportPeopleCsv([...selected]);
      if (result.error || !result.csv) {
        setExportError(result.error ?? "The export failed. Try again.");
        return;
      }
      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.fileName ?? "people-export.csv";
      a.click();
      URL.revokeObjectURL(url);
      setNotice(`Exported ${selected.size} ${selected.size === 1 ? "person" : "people"} to CSV.`);
      setSelected(new Set());
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      {notice ? (
        <div className="mt-3 flex items-start justify-between gap-3 rounded-md border border-healthy-border bg-healthy-bg px-3 py-2">
          <p className="text-small text-healthy">{notice}</p>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss"
            className="rounded p-0.5 text-healthy hover:bg-black/5"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        </div>
      ) : null}

      {selected.size > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-subtle bg-sunken px-3 py-2">
          <span className="text-small font-semibold text-primary tnum">
            {selected.size} selected
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            <Button size="sm" onClick={() => setDialog("campaign")}>
              <Megaphone className="size-3.5" aria-hidden />
              Add to campaign
            </Button>
            <Button size="sm" onClick={() => setDialog("task")}>
              <CalendarPlus className="size-3.5" aria-hidden />
              Add task
            </Button>
            <Button size="sm" onClick={runExport} disabled={exporting}>
              <Download className="size-3.5" aria-hidden />
              {exporting ? "Exporting…" : "Export CSV"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
          </div>
          {exportError ? (
            <p role="alert" className="w-full text-small text-critical">
              {exportError}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 overflow-hidden rounded-card border border-subtle bg-surface">
        <table className="w-full text-body">
          <caption className="sr-only">People</caption>
          <thead>
            <tr className="border-b border-subtle bg-sunken text-label uppercase tracking-wide text-muted">
              <th scope="col" className="w-9 px-3 py-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label={allSelected ? "Deselect everyone" : "Select everyone shown"}
                  className="size-3.5 accent-[var(--action-primary,#c2531a)]"
                />
              </th>
              <th scope="col" className="px-4 py-2 text-left font-semibold">
                Name
              </th>
              <th scope="col" className="hidden px-4 py-2 text-left font-semibold md:table-cell">
                Stage
              </th>
              <th scope="col" className="hidden px-4 py-2 text-left font-semibold lg:table-cell">
                Needs attention
              </th>
              <th scope="col" className="hidden px-4 py-2 text-right font-semibold sm:table-cell">
                Amount
              </th>
              <th scope="col" className="px-4 py-2 text-right font-semibold">
                Last activity
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const urgency = personUrgency(row, now);

              return (
                <tr key={row.id} className="border-b border-subtle last:border-0 hover:bg-sunken">
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggle(row.id)}
                      aria-label={`Select ${row.firstName} ${row.lastName}`}
                      className="size-3.5 accent-[var(--action-primary,#c2531a)]"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <Link href={`/people/${row.id}`} className="flex items-center gap-2.5">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-sunken text-label font-semibold text-secondary">
                        {initialsOf(`${row.firstName} ${row.lastName}`)}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate font-semibold text-primary">
                            {row.firstName} {row.lastName}
                          </span>
                          <LanguageBadge language={row.preferredLanguage} />
                          {row.doNotContact ? (
                            <Badge tone="critical">Do not contact</Badge>
                          ) : null}
                        </span>
                        <span className="block truncate text-small text-muted">
                          {row.emails?.[0]?.address ?? "—"}
                        </span>
                      </span>
                    </Link>
                  </td>

                  <td className="hidden px-4 py-2.5 md:table-cell">
                    {row.stage ? (
                      <StageChip stage={row.stage} />
                    ) : (
                      <span className="text-small text-muted">No opportunity</span>
                    )}
                  </td>

                  <td className="hidden px-4 py-2.5 lg:table-cell">
                    {urgency?.label &&
                    urgency.level !== "healthy" &&
                    urgency.level !== "neutral" ? (
                      <span className="inline-flex items-center gap-1.5">
                        <UrgencyDot tone={urgency.level} />
                        <span
                          className={cn(
                            "text-small",
                            urgency.level === "critical" && "font-semibold text-critical",
                            urgency.level === "warning" && "text-warning",
                            urgency.level === "info" && "text-info",
                          )}
                        >
                          {urgency.label}
                        </span>
                      </span>
                    ) : (
                      <span className="text-small text-disabled">—</span>
                    )}
                  </td>

                  <td className="hidden px-4 py-2.5 text-right text-secondary tnum sm:table-cell">
                    {moneyCompact(row.amount)}
                  </td>

                  <td className="px-4 py-2.5 text-right text-small text-muted tnum">
                    {relativeTime(row.lastActivityAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {dialog === "campaign" ? (
        <Dialog
          title={`Add ${selected.size} ${selected.size === 1 ? "person" : "people"} to a campaign`}
          onClose={() => setDialog(null)}
        >
          <form action={enrollAction} className="space-y-4 p-4">
            {[...selected].map((id) => (
              <input key={id} type="hidden" name="ids" value={id} />
            ))}

            {campaigns.length === 0 ? (
              <p className="text-body text-secondary">
                No open campaigns in your book. Create one in Marketing first.
              </p>
            ) : (
              <Field
                label="Campaign"
                htmlFor="bulk-campaign"
                hint="Enrolling records it here — messages queue for sending when a provider is connected. People marked do-not-contact are skipped."
              >
                <Select id="bulk-campaign" name="campaignId" defaultValue="" required>
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

            {activeState?.error ? (
              <p role="alert" className="text-small text-critical">
                {activeState.error}
              </p>
            ) : null}

            <div className="flex items-center gap-2">
              <Button
                type="submit"
                variant="primary"
                disabled={enrollPending || campaigns.length === 0}
              >
                {enrollPending ? "Enrolling…" : "Enroll"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setDialog(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </Dialog>
      ) : null}

      {dialog === "task" ? (
        <Dialog
          title={`Add a task for ${selected.size} ${selected.size === 1 ? "person" : "people"}`}
          onClose={() => setDialog(null)}
        >
          <form action={taskAction} className="space-y-4 p-4">
            {[...selected].map((id) => (
              <input key={id} type="hidden" name="ids" value={id} />
            ))}

            <Field
              label="What needs doing?"
              htmlFor="bulk-task-title"
              hint="The same task is created for each selected person, owned by you."
              required
            >
              <Input
                id="bulk-task-title"
                name="title"
                required
                autoFocus
                autoComplete="off"
                placeholder="Check in about rates"
              />
            </Field>

            <Field label="Due" htmlFor="bulk-task-due" hint="Optional.">
              <Input id="bulk-task-due" name="dueAt" type="datetime-local" />
            </Field>

            {activeState?.error ? (
              <p role="alert" className="text-small text-critical">
                {activeState.error}
              </p>
            ) : null}

            <div className="flex items-center gap-2">
              <Button type="submit" variant="primary" disabled={taskPending}>
                {taskPending ? "Adding…" : "Add task"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setDialog(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </Dialog>
      ) : null}
    </>
  );
}
