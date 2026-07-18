"use client";

/**
 * The Partners list table — a client component because rows are selectable.
 *
 * Selection powers three bulk actions: add a task for each partner, export
 * the selection as CSV (built in the browser from what's already on screen —
 * no extra server round-trip, nothing leaves the page), and move partners to
 * a tier. The tier move and the tasks are server actions, audited per partner.
 */
import { useMemo, useRef, useState, useActionState, useEffect } from "react";
import Link from "next/link";
import { ListChecks, Download, X } from "lucide-react";
import { Badge, type Urgency } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { bulkAddTask, bulkSetTier, type BulkState } from "./actions";
import { PARTNER_TIERS, PARTNER_TIER_LABELS } from "./vocabulary";

export type PartnerTableRow = {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  email: string | null;
  kindLabel: string;
  tier: string;
  healthLevel: Urgency;
  healthLabel: string;
  referralCount: number;
  closingCount: number;
  /** Preformatted on the server so both environments agree on "3 weeks ago". */
  lastReferral: string;
  lastTouch: string;
  ownerName: string | null;
  nextAction: string;
  initials: string;
};

function toCsv(rows: PartnerTableRow[]): string {
  const esc = (v: string | number | null) => {
    const s = v === null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = [
    "First name",
    "Last name",
    "Company",
    "Email",
    "What they do",
    "Tier",
    "Referrals",
    "Closings",
    "Last referral",
    "Last touch",
    "Owner",
    "Next action",
  ];
  const lines = rows.map((r) =>
    [
      r.firstName,
      r.lastName,
      r.company,
      r.email,
      r.kindLabel,
      PARTNER_TIER_LABELS[r.tier] ?? r.tier,
      r.referralCount,
      r.closingCount,
      r.lastReferral,
      r.lastTouch,
      r.ownerName,
      r.nextAction,
    ]
      .map(esc)
      .join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

export function PartnersTable({ rows }: { rows: PartnerTableRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [taskOpen, setTaskOpen] = useState(false);

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const selectedRows = useMemo(() => rows.filter((r) => selected.has(r.id)), [rows, selected]);
  const idsValue = useMemo(() => [...selected].join(","), [selected]);

  const [tierState, tierAction, tierPending] = useActionState<BulkState, FormData>(
    bulkSetTier,
    {},
  );
  const [taskState, taskAction, taskPending] = useActionState<BulkState, FormData>(
    bulkAddTask,
    {},
  );

  // Close the task dialog and clear the selection when a bulk action lands.
  const taskSubmitted = useRef(false);
  useEffect(() => {
    if (taskPending) {
      taskSubmitted.current = true;
      return;
    }
    if (taskSubmitted.current && taskState.done) {
      taskSubmitted.current = false;
      setTaskOpen(false);
      setSelected(new Set());
    }
  }, [taskPending, taskState.done]);

  const tierSubmitted = useRef(false);
  useEffect(() => {
    if (tierPending) {
      tierSubmitted.current = true;
      return;
    }
    if (tierSubmitted.current && tierState.done) {
      tierSubmitted.current = false;
      setSelected(new Set());
    }
  }, [tierPending, tierState.done]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
  }

  function exportCsv() {
    const source = selectedRows.length > 0 ? selectedRows : rows;
    const blob = new Blob([toCsv(source)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "partners.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const doneMessage = tierState.done ?? taskState.done;
  const errorMessage = tierState.error ?? taskState.error;

  return (
    <div>
      {/* Bulk action bar — appears only when something is selected. */}
      {selected.size > 0 ? (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-card border border-subtle bg-surface px-3 py-2 shadow-e1">
          <span className="text-small font-semibold text-primary tnum">
            {selected.size} selected
          </span>

          <Button size="sm" variant="secondary" onClick={() => setTaskOpen(true)}>
            <ListChecks className="size-3.5" aria-hidden />
            Add task
          </Button>

          <Button size="sm" variant="secondary" onClick={exportCsv}>
            <Download className="size-3.5" aria-hidden />
            Export CSV
          </Button>

          <form action={tierAction} className="flex items-center gap-1.5">
            <input type="hidden" name="partnerIds" value={idsValue} />
            <label htmlFor="bulk-tier" className="sr-only">
              Move to tier
            </label>
            <Select id="bulk-tier" name="tier" defaultValue="growing" className="h-8 w-auto text-small">
              {PARTNER_TIERS.map((t) => (
                <option key={t} value={t}>
                  {PARTNER_TIER_LABELS[t]}
                </option>
              ))}
            </Select>
            <Button size="sm" type="submit" variant="secondary" disabled={tierPending}>
              {tierPending ? "Moving…" : "Set tier"}
            </Button>
          </form>

          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
            Clear
          </Button>

          {errorMessage ? (
            <span role="alert" className="text-small text-critical">
              {errorMessage}
            </span>
          ) : null}
        </div>
      ) : doneMessage ? (
        <p className="mb-3 text-small text-secondary" role="status">
          {doneMessage}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-card border border-subtle bg-surface">
        <table className="w-full text-body">
          <caption className="sr-only">Referral partners</caption>
          <thead>
            <tr className="border-b border-subtle bg-sunken text-label uppercase tracking-wide text-muted">
              <th scope="col" className="w-8 px-3 py-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label={allSelected ? "Deselect all partners" : "Select all partners"}
                  className="size-3.5 accent-action"
                />
              </th>
              <th scope="col" className="px-3 py-2 text-left font-semibold">
                Name
              </th>
              <th scope="col" className="px-3 py-2 text-left font-semibold">
                Tier
              </th>
              <th scope="col" className="hidden px-3 py-2 text-right font-semibold sm:table-cell">
                Referrals
              </th>
              <th scope="col" className="hidden px-3 py-2 text-right font-semibold sm:table-cell">
                Closings
              </th>
              <th scope="col" className="hidden px-3 py-2 text-right font-semibold lg:table-cell">
                Last referral
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">
                Last touch
              </th>
              <th scope="col" className="hidden px-3 py-2 text-left font-semibold xl:table-cell">
                Owner
              </th>
              <th scope="col" className="hidden px-3 py-2 text-left font-semibold md:table-cell">
                Next action
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const name = `${row.firstName} ${row.lastName}`;
              const isSelected = selected.has(row.id);
              return (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-subtle last:border-0 hover:bg-sunken",
                    isSelected && "bg-sunken",
                  )}
                >
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(row.id)}
                      aria-label={`Select ${name}`}
                      className="size-3.5 accent-action"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <Link href={`/partners/${row.id}`} className="flex items-center gap-2.5">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-sunken text-label font-semibold text-secondary">
                        {row.initials}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-primary">{name}</span>
                        <span className="block truncate text-small text-muted">
                          {row.company ?? row.kindLabel}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge tone={row.healthLevel}>{row.healthLabel}</Badge>
                  </td>
                  <td className="hidden px-3 py-2.5 text-right text-secondary tnum sm:table-cell">
                    {row.referralCount > 0 ? row.referralCount : "—"}
                  </td>
                  <td className="hidden px-3 py-2.5 text-right text-secondary tnum sm:table-cell">
                    {row.closingCount > 0 ? row.closingCount : "—"}
                  </td>
                  <td className="hidden px-3 py-2.5 text-right text-small text-muted tnum lg:table-cell">
                    {row.lastReferral}
                  </td>
                  <td className="px-3 py-2.5 text-right text-small text-muted tnum">
                    {row.lastTouch}
                  </td>
                  <td className="hidden px-3 py-2.5 text-small text-secondary xl:table-cell">
                    {row.ownerName ?? "—"}
                  </td>
                  <td className="hidden px-3 py-2.5 text-small text-secondary md:table-cell">
                    {row.nextAction}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bulk "add task" dialog — one task per selected partner. */}
      {taskOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-task-title"
        >
          <div className="w-full max-w-md rounded-t-xl border border-subtle bg-surface shadow-e3 sm:rounded-xl">
            <div className="flex items-center justify-between border-b border-subtle px-4 py-3">
              <h2 id="bulk-task-title" className="text-h3 font-semibold text-primary">
                Add a task for {selected.size} partner{selected.size === 1 ? "" : "s"}
              </h2>
              <button
                type="button"
                onClick={() => setTaskOpen(false)}
                aria-label="Close"
                className="rounded p-1 text-muted hover:bg-sunken hover:text-primary"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <form action={taskAction} className="space-y-4 p-4">
              <input type="hidden" name="partnerIds" value={idsValue} />
              <Field
                label="What needs doing?"
                htmlFor="bulk-task-name"
                hint="Leave it empty and each task uses that partner's next action."
              >
                <Input
                  id="bulk-task-name"
                  name="title"
                  placeholder="e.g. Invite to the spring open house"
                  autoComplete="off"
                />
              </Field>
              {taskState.error ? (
                <p role="alert" className="text-small text-critical">
                  {taskState.error}
                </p>
              ) : null}
              <div className="flex items-center gap-2">
                <Button type="submit" variant="primary" disabled={taskPending}>
                  {taskPending ? "Adding…" : "Add tasks"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setTaskOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
