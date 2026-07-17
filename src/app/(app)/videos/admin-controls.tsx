"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import {
  deleteVideo,
  moveVideo,
  setVideoPublished,
  type ActionResult,
} from "./actions";
import { Button } from "@/components/ui/button";
import { VideoDialog, type VideoDialogInitial } from "./video-dialog";

/**
 * Per-card admin controls: edit, reorder within the category, publish toggle,
 * and soft delete with a confirm. Rendered only for admins; every server
 * action re-checks the role anyway.
 */
export function AdminControls({
  video,
  categories,
  isFirst,
  isLast,
  showReorder,
}: {
  video: VideoDialogInitial & { published: boolean };
  categories: string[];
  isFirst: boolean;
  isLast: boolean;
  showReorder: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<ActionResult>) => {
    startTransition(async () => {
      const result = await action();
      setError(result.error ?? null);
    });
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditing(true)}
          aria-label={`Edit ${video.title}`}
          title="Edit"
        >
          <Pencil className="size-3.5" aria-hidden />
        </Button>

        {showReorder ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              disabled={isFirst || pending}
              onClick={() => run(() => moveVideo({ id: video.id, direction: "up" }))}
              aria-label={`Move ${video.title} up`}
              title="Move up"
            >
              <ArrowUp className="size-3.5" aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={isLast || pending}
              onClick={() => run(() => moveVideo({ id: video.id, direction: "down" }))}
              aria-label={`Move ${video.title} down`}
              title="Move down"
            >
              <ArrowDown className="size-3.5" aria-hidden />
            </Button>
          </>
        ) : null}

        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() =>
            run(() => setVideoPublished({ id: video.id, published: !video.published }))
          }
        >
          {video.published ? "Unpublish" : "Publish"}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() => {
            if (
              window.confirm(
                `Remove "${video.title}" from the library? Watch history is kept for the audit trail.`,
              )
            ) {
              run(() => deleteVideo({ id: video.id }));
            }
          }}
          aria-label={`Delete ${video.title}`}
          title="Delete"
          className="text-critical hover:text-critical"
        >
          <Trash2 className="size-3.5" aria-hidden />
        </Button>
      </div>

      {error ? (
        <p role="alert" className="text-micro text-critical">
          {error}
        </p>
      ) : null}

      {editing ? (
        <VideoDialog
          categories={categories}
          initial={video}
          onClose={() => setEditing(false)}
        />
      ) : null}
    </div>
  );
}
