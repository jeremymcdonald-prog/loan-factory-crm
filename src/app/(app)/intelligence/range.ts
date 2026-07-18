/**
 * Date-range vocabulary for the Intelligence report.
 *
 * Pure date maths — no server imports — driven entirely by searchParams, so a
 * range is a URL you can bookmark and share. `from` is inclusive, `to` is
 * exclusive: every query in @/lib/queries/intelligence uses `>= from AND < to`,
 * so a "to" date the user picks is widened to the end of that day here, once,
 * rather than in every query.
 */

export type RangeKey = "week" | "mtd" | "prior" | "90d" | "ytd" | "custom";

export type ResolvedRange = {
  key: RangeKey;
  /** Inclusive start. */
  from: Date;
  /** Exclusive end. */
  to: Date;
  label: string;
  /** Echoed back so the custom form can re-render what the user picked. */
  customFrom?: string;
  customTo?: string;
};

export const RANGE_CHOICES: { key: Exclude<RangeKey, "custom">; label: string }[] = [
  { key: "week", label: "This week" },
  { key: "mtd", label: "Month to date" },
  { key: "prior", label: "Prior month" },
  { key: "90d", label: "Last 90 days" },
  { key: "ytd", label: "Year to date" },
];

const DEFAULT_KEY: RangeKey = "mtd";

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Monday, because a production week starts when the phones start ringing. */
function startOfWeek(d: Date): Date {
  const day = startOfDay(d);
  const offset = (day.getDay() + 6) % 7; // Mon=0 … Sun=6
  day.setDate(day.getDate() - offset);
  return day;
}

function parseIsoDate(value: string | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  // new Date(2026, 1, 31) silently rolls into March — reject that.
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
    ? date
    : null;
}

function shortDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function resolveRange(
  params: { range?: string; from?: string; to?: string },
  now = new Date(),
): ResolvedRange {
  const key = (
    ["week", "mtd", "prior", "90d", "ytd", "custom"] as RangeKey[]
  ).includes(params.range as RangeKey)
    ? (params.range as RangeKey)
    : DEFAULT_KEY;

  if (key === "custom") {
    const from = parseIsoDate(params.from);
    const toDay = parseIsoDate(params.to);
    if (from && toDay && from.getTime() <= toDay.getTime()) {
      const to = new Date(toDay.getFullYear(), toDay.getMonth(), toDay.getDate() + 1);
      return {
        key,
        from,
        to,
        label: `${shortDate(from)} – ${shortDate(toDay)}`,
        customFrom: params.from,
        customTo: params.to,
      };
    }
    // A half-filled or backwards custom range falls back to the default rather
    // than erroring — the form stays open so the user can finish it.
    return resolveRange({ range: DEFAULT_KEY }, now);
  }

  const today = startOfDay(now);
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  switch (key) {
    case "week":
      return { key, from: startOfWeek(now), to: tomorrow, label: "This week" };
    case "prior": {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 1);
      return { key, from, to, label: "Prior month" };
    }
    case "90d": {
      const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 90);
      return { key, from, to: tomorrow, label: "Last 90 days" };
    }
    case "ytd":
      return { key, from: new Date(now.getFullYear(), 0, 1), to: tomorrow, label: "Year to date" };
    case "mtd":
    default:
      return {
        key: "mtd",
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: tomorrow,
        label: "Month to date",
      };
  }
}

/** The query string for a range pill, preserving the current view mode. */
export function rangeHref(key: RangeKey, view: string | undefined): string {
  const qs = new URLSearchParams();
  if (key !== DEFAULT_KEY) qs.set("range", key);
  if (view) qs.set("view", view);
  const s = qs.toString();
  return s ? `/intelligence?${s}` : "/intelligence";
}
