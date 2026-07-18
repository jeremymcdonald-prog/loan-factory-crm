"use client";

import { useRef } from "react";

/**
 * The Pipeline filter bar, as one GET form (same pattern as
 * marketing/templates/template-filters.tsx): every control names a
 * searchParam, changing any control submits straight away, and the server
 * component re-renders the same dataset filtered. Works without JavaScript
 * via the keyboard (Enter submits the form).
 *
 * `key` on each control ties it to the URL so it can never drift from what
 * is actually applied.
 */

export type FilterOption = { value: string; label: string };

const SELECT_CLASS =
  "h-8 rounded-md border border-subtle bg-sunken px-2 pr-7 text-small text-primary focus:border-action focus:outline-none";

export function PipelineFilters({
  tab,
  mode,
  owner,
  source,
  status,
  amt,
  act,
  attn,
  owners,
  sources,
  statuses,
  amounts,
  activity,
}: {
  tab: string;
  mode: string;
  owner: string;
  source: string;
  status: string;
  amt: string;
  act: string;
  attn: boolean;
  owners: FilterOption[];
  sources: FilterOption[];
  statuses: FilterOption[];
  amounts: FilterOption[];
  activity: FilterOption[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const submit = () => formRef.current?.requestSubmit();

  return (
    <form
      ref={formRef}
      action="/pipeline"
      className="flex flex-wrap items-center gap-2"
    >
      {/* Carry the tab and view mode through, so filters compose with them. */}
      <input type="hidden" name="tab" value={tab} />
      <input type="hidden" name="mode" value={mode} />

      <label htmlFor="pipeline-owner" className="sr-only">
        Filter by owner
      </label>
      <select
        key={`owner-${owner}`}
        id="pipeline-owner"
        name="owner"
        defaultValue={owner}
        onChange={submit}
        className={SELECT_CLASS}
      >
        <option value="all">Every owner</option>
        {owners.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <label htmlFor="pipeline-source" className="sr-only">
        Filter by lead source
      </label>
      <select
        key={`source-${source}`}
        id="pipeline-source"
        name="source"
        defaultValue={source}
        onChange={submit}
        className={SELECT_CLASS}
      >
        <option value="all">Every source</option>
        {sources.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      {statuses.length > 1 ? (
        <>
          <label htmlFor="pipeline-status" className="sr-only">
            Filter by status
          </label>
          <select
            key={`status-${status}`}
            id="pipeline-status"
            name="status"
            defaultValue={status}
            onChange={submit}
            className={SELECT_CLASS}
          >
            <option value="all">Every status</option>
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </>
      ) : null}

      <label htmlFor="pipeline-amt" className="sr-only">
        Filter by loan amount
      </label>
      <select
        key={`amt-${amt}`}
        id="pipeline-amt"
        name="amt"
        defaultValue={amt}
        onChange={submit}
        className={SELECT_CLASS}
      >
        <option value="all">Any amount</option>
        {amounts.map((a) => (
          <option key={a.value} value={a.value}>
            {a.label}
          </option>
        ))}
      </select>

      <label htmlFor="pipeline-act" className="sr-only">
        Filter by last activity
      </label>
      <select
        key={`act-${act}`}
        id="pipeline-act"
        name="act"
        defaultValue={act}
        onChange={submit}
        className={SELECT_CLASS}
      >
        <option value="all">Any activity</option>
        {activity.map((a) => (
          <option key={a.value} value={a.value}>
            {a.label}
          </option>
        ))}
      </select>

      {/* Needs attention: stalled files, overdue clocks, expiring locks. */}
      <label
        key={`attn-${attn}`}
        className="inline-flex h-8 cursor-pointer select-none items-center gap-1.5 rounded-md border border-subtle bg-sunken px-2.5 text-small font-semibold text-secondary transition-colors has-[:checked]:border-warning-border has-[:checked]:bg-warning-bg has-[:checked]:text-warning"
      >
        <input
          type="checkbox"
          name="attn"
          value="1"
          defaultChecked={attn}
          onChange={submit}
          className="sr-only"
        />
        Needs attention
      </label>
    </form>
  );
}
