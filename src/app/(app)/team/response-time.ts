/**
 * A lead-response duration in plain language, shared by the roster and the
 * member record so the same number never reads two ways.
 *
 * The unit switch matches `countdown()` in @/lib/format — minutes, then hours,
 * then days once past 48 — so a duration here looks like a duration anywhere
 * else in the CRM.
 */
export function responseTime(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return "—";

  const minutes = seconds / 60;
  if (minutes < 1) return "under 1m";
  if (minutes < 60) return `${Math.round(minutes)}m`;

  const hours = minutes / 60;
  if (hours < 48) return `${Math.round(hours)}h`;

  return `${Math.round(hours / 24)}d`;
}
