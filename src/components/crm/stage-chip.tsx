/**
 * StageChip — the opportunity's stage, rendered as CRM visibility.
 *
 * Macro-phases carry no hue of their own: phases are identified by name and
 * position, and urgency is the only colour on the board (Design_System §4.4).
 */
import { stageLabel, phaseOf, stageNumber, STAGES, PHASE_LABELS, type Stage } from "@/lib/stages";
import { cn } from "@/lib/cn";

export function StageChip({
  stage,
  showPhase = false,
  className,
}: {
  stage: Stage;
  showPhase?: boolean;
  className?: string;
}) {
  return (
    <span
      title={`Stage ${stageNumber(stage)} of ${STAGES.length} · ${PHASE_LABELS[phaseOf(stage)]}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded border border-subtle bg-sunken px-1.5 py-0.5",
        "text-label font-semibold text-secondary whitespace-nowrap",
        className,
      )}
    >
      {showPhase ? (
        <span className="text-micro font-semibold text-muted">{PHASE_LABELS[phaseOf(stage)]}</span>
      ) : null}
      {stageLabel(stage)}
    </span>
  );
}
