"use client";

import { useActionState, useEffect } from "react";
import { X } from "lucide-react";
import { saveVideo, type VideoFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

export type VideoDialogInitial = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  durationSeconds: number | null;
  url: string | null;
  featured: boolean;
};

/**
 * Add / Edit dialog for the video library. Admin-only — the parent only
 * renders it for admins, and the server action re-checks the role.
 */
export function VideoDialog({
  categories,
  initial,
  onClose,
}: {
  categories: string[];
  initial?: VideoDialogInitial;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState<VideoFormState, FormData>(
    saveVideo,
    {},
  );

  // Close once the save lands; revalidatePath refreshes the list behind us.
  useEffect(() => {
    if (state.ok) onClose();
  }, [state.ok, onClose]);

  const titleId = initial ? "edit-video-title" : "add-video-title";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-xl border border-subtle bg-surface shadow-e3 sm:rounded-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-subtle bg-surface px-4 py-3">
          <h2 id={titleId} className="text-h3 font-semibold text-primary">
            {initial ? "Edit video" : "Add a video"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-muted hover:bg-sunken hover:text-primary"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <form action={formAction} className="space-y-4 p-4">
          {initial ? <input type="hidden" name="id" value={initial.id} /> : null}

          <Field label="Title" htmlFor="video-title" required>
            <Input
              id="video-title"
              name="title"
              defaultValue={initial?.title ?? ""}
              required
              minLength={3}
              autoFocus
              autoComplete="off"
            />
          </Field>

          <Field
            label="Description"
            htmlFor="video-description"
            hint="One or two sentences on what the walkthrough covers."
          >
            <Textarea
              id="video-description"
              name="description"
              rows={3}
              defaultValue={initial?.description ?? ""}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" htmlFor="video-category" required>
              <Select
                id="video-category"
                name="category"
                defaultValue={initial?.category ?? categories[0]}
                required
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Duration (minutes)" htmlFor="video-duration" hint="Optional.">
              <Input
                id="video-duration"
                name="durationMinutes"
                type="number"
                min={1}
                max={600}
                step={1}
                inputMode="numeric"
                defaultValue={
                  initial?.durationSeconds
                    ? Math.max(1, Math.round(initial.durationSeconds / 60))
                    : ""
                }
              />
            </Field>
          </div>

          <Field
            label="Video link"
            htmlFor="video-url"
            hint="Leave empty until the recording exists; the library will say 'coming soon'."
          >
            <Input
              id="video-url"
              name="url"
              type="url"
              placeholder="https://…"
              defaultValue={initial?.url ?? ""}
              autoComplete="off"
            />
          </Field>

          <label className="flex cursor-pointer items-center gap-2 text-body text-primary">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={initial?.featured ?? false}
              className="size-4 shrink-0 cursor-pointer rounded-sm border-strong accent-action"
            />
            Featured — show in the row at the top of the library
          </label>

          {state.error ? (
            <p
              role="alert"
              className="rounded-md border border-critical/25 bg-critical-bg px-3 py-2 text-small text-critical"
            >
              {state.error}
            </p>
          ) : null}

          <div className="flex items-center gap-2 pt-1">
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? "Saving…" : initial ? "Save changes" : "Add video"}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
