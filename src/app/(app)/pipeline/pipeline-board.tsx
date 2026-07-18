"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * PipelineBoard — the scroll container for the stage columns.
 *
 * Bounded to the space left under the header/filters/tiles (via `flex-1
 * min-h-0` from the caller) so it can scroll both ways: sideways through
 * stages, and — inside itself — down through a stage with more cards than
 * fit. That's also what makes `sticky top-0` on a column header (see
 * page.tsx) actually stick: sticky pins to the nearest ancestor that
 * scrolls, and thanks to the overflow-x/y coupling below this board *is*
 * that ancestor, not the page.
 *
 * Mouse wheels only ever emit a vertical delta, so without help a board
 * wider than the viewport is reachable only by dragging the scrollbar. A
 * plain vertical wheel gesture (no horizontal component) pans the board
 * sideways instead; a gesture that already carries horizontal intent
 * (a trackpad swipe, shift+wheel) passes through untouched.
 *
 * The listener is attached manually with `{ passive: false }` rather than
 * via a JSX `onWheel` prop — React attaches wheel handlers passively, which
 * silently no-ops `preventDefault()` and lets the browser's native vertical
 * scroll fire at the same time as our horizontal one.
 */
export function PipelineBoard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleWheel = (event: WheelEvent) => {
      const overflowsX = el.scrollWidth > el.clientWidth;
      const isVerticalOnlyGesture =
        Math.abs(event.deltaX) < 1 && Math.abs(event.deltaY) > 0;

      if (overflowsX && isVerticalOnlyGesture) {
        event.preventDefault();
        el.scrollLeft += event.deltaY;
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div
      ref={ref}
      tabIndex={0}
      role="group"
      aria-label="Pipeline stages, scroll horizontally for more"
      className={cn(
        // No pt- here on purpose: sticky's `top: 0` locks to the *padding
        // edge* of this scrollport, so top padding on the scroller itself
        // would leave a gap above the stuck header that scrolled-past cards
        // peek through. Each column carries its own top spacing instead
        // (see the pt-4/sm:pt-6 on the <section>s in page.tsx) so that
        // space scrolls away with the column's own content, not the board's.
        "flex gap-3 overflow-x-auto overflow-y-auto px-4 pb-4 outline-none sm:px-6 sm:pb-6",
        "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action",
        // Force a classic, always-reserved scrollbar (not an OS overlay
        // hairline) so overflow reads as an obvious "more this way" cue.
        "[scrollbar-width:auto] [scrollbar-color:var(--color-strong)_transparent]",
        "[&::-webkit-scrollbar]:h-3 [&::-webkit-scrollbar]:w-3",
        "[&::-webkit-scrollbar-track]:bg-transparent",
        "[&::-webkit-scrollbar-thumb]:rounded-full",
        "[&::-webkit-scrollbar-thumb]:bg-[var(--color-strong)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
