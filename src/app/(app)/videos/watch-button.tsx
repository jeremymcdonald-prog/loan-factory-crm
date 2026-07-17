"use client";

import { useTransition } from "react";
import { Play } from "lucide-react";
import { markVideoWatched } from "./actions";
import { Button } from "@/components/ui/button";

/**
 * "Watch" opens the real recording in a new tab and records the watch for the
 * signed-in user. When no recording exists yet, the button says so honestly
 * and does nothing.
 */
export function WatchButton({ videoId, url, title }: { videoId: string; url: string | null; title: string }) {
  const [pending, startTransition] = useTransition();

  if (!url) {
    return (
      // The wrapper carries the tooltip: a disabled button swallows pointer
      // events, so the title lives on the span too.
      <span title="This walkthrough hasn't been recorded yet" className="inline-block">
        <Button size="sm" disabled title="This walkthrough hasn't been recorded yet">
          <Play className="size-3.5" aria-hidden />
          Watch
        </Button>
      </span>
    );
  }

  return (
    <Button
      size="sm"
      disabled={pending}
      aria-label={`Watch ${title}`}
      onClick={() => {
        window.open(url, "_blank", "noopener,noreferrer");
        startTransition(async () => {
          await markVideoWatched({ videoId });
        });
      }}
    >
      <Play className="size-3.5" aria-hidden />
      {pending ? "Opening…" : "Watch"}
    </Button>
  );
}
