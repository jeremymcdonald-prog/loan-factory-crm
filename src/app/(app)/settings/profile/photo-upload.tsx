"use client";

import { useActionState, useRef, useState, startTransition } from "react";
import { Camera, Trash2 } from "lucide-react";
import { updatePhoto, removePhoto, type ProfileState } from "./actions";
import { Button } from "@/components/ui/button";
import {
  validatePhotoDataUrl,
  PHOTO_MAX_BYTES,
  PHOTO_MIME_TYPES,
} from "@/lib/profile-validation";
import { initialsOf } from "@/lib/format";

export function PhotoUpload({
  photoData,
  fullName,
}: {
  photoData: string | null;
  fullName: string;
}) {
  const [uploadState, uploadAction, uploading] = useActionState<ProfileState, FormData>(
    updatePhoto,
    {},
  );
  const [removeState, removeAction, removing] = useActionState<ProfileState, FormData>(
    removePhoto,
    {},
  );
  const [clientError, setClientError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pending = uploading || removing;
  const error = clientError ?? uploadState.error ?? removeState.error;

  function onFileChosen(file: File | undefined) {
    setClientError(null);
    if (!file) return;

    if (!(PHOTO_MIME_TYPES as readonly string[]).includes(file.type)) {
      setClientError("The photo must be a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > PHOTO_MAX_BYTES) {
      setClientError("The photo is larger than 512KB — choose a smaller image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      const valid = validatePhotoDataUrl(dataUrl);
      if (!valid.ok) {
        setClientError(valid.reason);
        return;
      }
      const fd = new FormData();
      fd.set("photoData", dataUrl);
      startTransition(() => uploadAction(fd));
    };
    reader.onerror = () => setClientError("We couldn't read that file — try another photo.");
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      {photoData ? (
        // The source is a validated in-row data URL; next/image cannot optimize it.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoData}
          alt={`Profile photo of ${fullName}`}
          className="size-16 shrink-0 rounded-full border border-subtle object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="grid size-16 shrink-0 place-items-center rounded-full bg-action text-h2 font-semibold text-action-fg"
        >
          {initialsOf(fullName)}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            aria-label="Choose a profile photo"
            onChange={(e) => {
              onFileChosen(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="size-4" aria-hidden />
            {uploading ? "Uploading…" : photoData ? "Replace photo" : "Upload photo"}
          </Button>
          {photoData ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => startTransition(() => removeAction(new FormData()))}
            >
              <Trash2 className="size-4" aria-hidden />
              {removing ? "Removing…" : "Remove"}
            </Button>
          ) : null}
        </div>
        <p className="mt-1.5 text-small text-muted">
          JPEG, PNG, or WebP, up to 512KB. Shown to your team and on outbound messages that
          include a photo.
        </p>
        {error ? (
          <p role="alert" className="mt-1.5 text-small text-critical">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
