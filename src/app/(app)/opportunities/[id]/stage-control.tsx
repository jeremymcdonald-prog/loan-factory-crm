"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { setStage, type StageState } from "./actions";
import { Button } from "@/components/ui/button";
import { STAGES, stageLabel, nextStage, stageNumber, type Stage } from "@/lib/stages";
import { cn } from "@/lib/cn";

/**
 * The opportunity workspace's primary action: record where the file now stands.
 * The obvious move (advance one stage) is the button; any other stage is one
 * click away — the CRM records reality, it does not enforce a rail.
 */
export function StageControl({ loanId, current }: { loanId: string; current: Stage }) {
  const [state, formAction, pending] = useActionState<StageState, FormData>(setStage, {});
  const [pickerOpen, setPickerOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const next = nextStage(current);

  useEffect(() => {
    if (!pickerOpen) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setPickerOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPickerOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [pickerOpen]);

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-1.5">
        {next ? (
          <form action={formAction}>
            <input type="hidden" name="loanId" value={loanId} />
            <input type="hidden" name="toStage" value={next} />
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? "Moving…" : `Move to ${stageLabel(next)}`}
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </form>
        ) : null}

        <div className="relative" ref={ref}>
          <Button
            variant="secondary"
            onClick={() => setPickerOpen((v) => !v)}
            aria-expanded={pickerOpen}
            aria-haspopup="menu"
            aria-label="Choose a different stage"
          >
            {next ? null : "Set stage"}
            <ChevronDown className="size-4" aria-hidden />
          </Button>

          {pickerOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-full z-40 mt-1 max-h-80 w-64 overflow-y-auto rounded-lg border border-subtle bg-raised p-1 shadow-e3"
            >
              {STAGES.map((stage) => (
                <form key={stage} action={formAction}>
                  <input type="hidden" name="loanId" value={loanId} />
                  <input type="hidden" name="toStage" value={stage} />
                  <button
                    type="submit"
                    role="menuitem"
                    disabled={stage === current}
                    onClick={() => setPickerOpen(false)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-small",
                      stage === current
                        ? "bg-action/10 font-semibold text-action"
                        : "text-secondary hover:bg-surface hover:text-primary",
                    )}
                  >
                    <span className="w-5 shrink-0 text-micro text-muted tnum">
                      {stageNumber(stage)}
                    </span>
                    {stageLabel(stage)}
                  </button>
                </form>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {state.error ? (
        <p role="alert" className="text-small text-critical">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
