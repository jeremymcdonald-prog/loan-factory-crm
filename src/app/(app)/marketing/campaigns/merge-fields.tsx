/**
 * Merge-field rendering for campaign content — the same convention as the
 * template record: `{{field}}` placeholders are picked out as chips, backticks
 * around them are file syntax and come off, and the field itself is shown
 * exactly as stored, because it is exactly what gets swapped at send time.
 *
 * Pure and client-safe: the recipient preview runs in the browser and the
 * detail page renders on the server.
 */
import type { ReactNode } from "react";

/** Splitting keeps the capture; testing must not be /g — a global regex carries
 *  `lastIndex` between calls and would misread every other placeholder. */
const MERGE_FIELD_SPLIT = /(\{\{[^}]+\}\})/g;
const IS_MERGE_FIELD = /^\{\{[^}]+\}\}$/;

export function renderMergeFields(body: string): ReactNode[] {
  const cleaned = body.replace(/`(\{\{[^}]+\}\})`/g, "$1");
  return cleaned.split(MERGE_FIELD_SPLIT).map((part, i) =>
    IS_MERGE_FIELD.test(part) ? (
      <span
        key={i}
        className="rounded bg-sunken px-1 font-mono text-micro font-semibold text-secondary"
      >
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}
