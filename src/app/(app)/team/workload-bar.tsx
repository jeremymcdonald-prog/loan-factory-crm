import { cn } from "@/lib/cn";

/**
 * One member's share of the team's active files.
 *
 * The denominator is the count of distinct active files the team carries, so
 * every reading is literally true even though a file with both an LO and a
 * processor lifts two bars: "on 12 of the team's 14 files" is a fact about that
 * person, not a slice of a pie. The bars are there to make an imbalance
 * obvious, and they do that without anyone having to add them up.
 *
 * `bg-brand` is the full-strength orange, used here as a non-text indicator
 * where the 3:1 contrast bar applies — never behind text.
 */
export function WorkloadBar({
  files,
  teamFiles,
  className,
}: {
  files: number;
  teamFiles: number;
  className?: string;
}) {
  const share = teamFiles > 0 ? Math.min(1, files / teamFiles) : 0;
  const percent = Math.round(share * 100);

  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span className="sr-only">
        {teamFiles > 0
          ? `On ${files} of the team's ${teamFiles} active files`
          : "No active files on the team"}
      </span>

      <span
        aria-hidden
        className="h-1.5 w-full max-w-28 overflow-hidden rounded-full bg-sunken"
      >
        {/* Width is genuinely dynamic — the one thing a utility class can't carry. */}
        <span
          className={cn("block h-full rounded-full", files > 0 && "bg-brand")}
          style={{ width: `${percent}%` }}
        />
      </span>

      <span aria-hidden className="w-8 shrink-0 text-right text-small text-muted tnum">
        {teamFiles > 0 ? `${percent}%` : "—"}
      </span>
    </span>
  );
}
