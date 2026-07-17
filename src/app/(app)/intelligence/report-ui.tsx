/**
 * The report's own small vocabulary: a stat tile and a bar.
 *
 * Bars carry no status colour. Hue answers exactly one question in this product
 * — how urgently does this need a human? — and a distribution is not urgency
 * (Design_System §4.4). So a bar is brand orange or a neutral tint, and the
 * number beside it is always readable on its own.
 */
import { UrgencyDot } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

/** Minutes in the plainest true unit: 24 → "24 min", 240 → "4 hours". */
export function durationLabel(minutes: number): string {
  if (!Number.isFinite(minutes)) return "—";

  if (minutes < 90) {
    const m = Math.round(minutes);
    return `${m} min`;
  }

  const hours = minutes / 60;
  if (hours < 48) {
    const h = hours >= 10 ? Math.round(hours) : Math.round(hours * 10) / 10;
    return `${h} ${h === 1 ? "hour" : "hours"}`;
  }

  const d = Math.round(hours / 24);
  return `${d} ${d === 1 ? "day" : "days"}`;
}

export function percentLabel(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

/**
 * A headline number. `urgent` is reserved for a threshold a human has actually
 * breached, and it colours the note under the number, never the number alone.
 */
export function StatTile({
  label,
  value,
  meta,
  urgent = false,
}: {
  label: string;
  value: string;
  meta?: string;
  urgent?: boolean;
}) {
  return (
    <div className="bg-canvas px-4 py-3">
      <p className="text-label font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-metric-lg font-semibold text-primary tnum">{value}</p>
      {meta ? (
        urgent ? (
          <p className="mt-0.5 flex items-center gap-1.5 text-small text-warning tnum">
            <UrgencyDot tone="warning" />
            {meta}
          </p>
        ) : (
          <p className="mt-0.5 text-small text-muted tnum">{meta}</p>
        )
      ) : null}
    </div>
  );
}

/** A single number inside a panel. Belongs in a `<dl>`. */
export function Figure({
  label,
  value,
  urgent = false,
}: {
  label: string;
  value: string;
  urgent?: boolean;
}) {
  return (
    <div>
      <dt className="text-label font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd
        className={cn(
          "mt-1 text-metric-md font-semibold tnum",
          urgent ? "text-warning" : "text-primary",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

/**
 * One row of a distribution. The bar is decoration — the count sits next to it
 * as text, so the row still reads with no colour at all.
 */
export function Bar({
  label,
  value,
  max,
  valueLabel,
  meta,
  tone = "brand",
}: {
  label: string;
  value: number;
  max: number;
  valueLabel?: string;
  meta?: string;
  tone?: "brand" | "neutral";
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate text-body text-secondary">{label}</span>
        <span className="shrink-0 text-body font-semibold text-primary tnum">
          {valueLabel ?? value}
        </span>
      </div>
      <div aria-hidden className="mt-1 h-1.5 overflow-hidden rounded-full bg-sunken">
        <div
          className={cn("h-full rounded-full", tone === "brand" ? "bg-brand" : "bg-strong")}
          style={{ width: `${pct}%` }}
        />
      </div>
      {meta ? <p className="mt-1 text-small text-muted tnum">{meta}</p> : null}
    </div>
  );
}

/** What a panel says when the rows behind it do not exist yet. */
export function NoData({ children }: { children: string }) {
  return <p className="text-small text-muted">{children}</p>;
}
