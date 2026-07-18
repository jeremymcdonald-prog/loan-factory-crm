/**
 * StageRail — where this relationship stands across the pipeline groups.
 *
 * Progress shows verified milestones, never optimism (Design_System §2.5).
 * Groups carry no hue: position and name identify them.
 */
import {
  STAGES,
  MACRO_PHASES,
  PHASE_LABELS,
  stagesIn,
  stageLabel,
  phaseOf,
  type Stage,
} from "@/lib/stages";
import { cn } from "@/lib/cn";

export function StageRail({ current }: { current: Stage }) {
  const currentIndex = STAGES.indexOf(current);
  const currentPhase = phaseOf(current);

  return (
    <div
      className="flex gap-1"
      role="img"
      aria-label={`Stage ${currentIndex + 1} of ${STAGES.length}: ${stageLabel(current)}`}
    >
      {MACRO_PHASES.map((phase) => {
        const stages = stagesIn(phase);
        const isCurrentPhase = phase === currentPhase;

        return (
          <div key={phase} className="min-w-0 flex-1">
            <div className="flex gap-0.5">
              {stages.map((stage) => {
                const index = STAGES.indexOf(stage);
                const done = index < currentIndex;
                const active = index === currentIndex;
                return (
                  <span
                    key={stage}
                    title={`${index + 1}. ${stageLabel(stage)}`}
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-colors",
                      active && "bg-action",
                      done && "bg-action/40",
                      !done && !active && "bg-sunken",
                    )}
                  />
                );
              })}
            </div>
            <p
              className={cn(
                "mt-1.5 truncate text-micro font-semibold uppercase tracking-wide",
                isCurrentPhase ? "text-primary" : "text-muted",
              )}
            >
              {PHASE_LABELS[phase]}
            </p>
          </div>
        );
      })}
    </div>
  );
}
