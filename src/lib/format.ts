/**
 * Formatting — Design_System.md §5.4 "Numerals are first-class citizens".
 *
 * The rules are exact and enforced here so no screen invents its own:
 *   currency  $420,000 in records/tables · $420K in cards/tiles
 *   countdown 41h under 48h · 3d under 14 days · "Apr 22" beyond
 *   dates     relative in timelines, absolute in audit views
 */

const CURRENCY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Records and tables: $420,000. */
export function money(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "—";
  return CURRENCY.format(n);
}

/** Cards and board tiles: $420K. One decimal only under $10K ($9.5K). */
export function moneyCompact(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1_000_000) {
    const m = n / 1_000_000;
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (Math.abs(n) >= 10_000) return `$${Math.round(n / 1000)}K`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1000).toFixed(1)}K`;
  return CURRENCY.format(n);
}

export type Countdown = {
  label: string;
  /** Hours remaining; negative when the date has passed. */
  hours: number;
  overdue: boolean;
};

/**
 * A deadline rendered the way the design system requires. The unit switch is
 * what moves urgency colour, so callers read `hours` rather than parsing text.
 */
export function countdown(target: Date | string | null | undefined, now = new Date()): Countdown | null {
  if (!target) return null;
  const date = typeof target === "string" ? new Date(target) : target;
  if (Number.isNaN(date.getTime())) return null;

  const hours = (date.getTime() - now.getTime()) / 3_600_000;
  const abs = Math.abs(hours);

  let label: string;
  if (abs < 48) {
    label = `${Math.round(abs)}h`;
  } else if (abs < 24 * 14) {
    label = `${Math.round(abs / 24)}d`;
  } else {
    label = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
  }

  return { label, hours, overdue: hours < 0 };
}

/** Timelines: "2h ago", "3d ago", "just now". */
export function relativeTime(value: Date | string | null | undefined, now = new Date()): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";

  const diffMs = now.getTime() - date.getTime();
  const future = diffMs < 0;
  const mins = Math.abs(diffMs) / 60_000;

  let text: string;
  if (mins < 1) return "just now";
  if (mins < 60) text = `${Math.round(mins)}m`;
  else if (mins < 60 * 24) text = `${Math.round(mins / 60)}h`;
  else if (mins < 60 * 24 * 14) text = `${Math.round(mins / (60 * 24))}d`;
  else {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
    }).format(date);
  }

  return future ? `in ${text}` : `${text} ago`;
}

/** Audit views: always absolute, always with the date. */
export function absoluteTime(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/** Calendar dates without a time component (closing date, lock expiry). */
export function shortDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(`${value}T12:00:00`) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

export function fullName(first: string, last: string): string {
  return `${first} ${last}`.trim();
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

/** US phone display; leaves anything unexpected untouched. */
export function phoneNumber(value: string | null | undefined): string {
  if (!value) return "—";
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return value;
}
