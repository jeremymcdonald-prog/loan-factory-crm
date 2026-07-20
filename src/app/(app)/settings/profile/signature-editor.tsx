"use client";

import { useActionState, useRef, useState, startTransition } from "react";
import { PenLine, RotateCcw, ImagePlus, Trash2 } from "lucide-react";
import {
  updateSignature,
  updateSignatureLogo,
  removeSignatureLogo,
  type ProfileState,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { buildDefaultSignature, renderSignatureText } from "@/lib/signature";
import { validatePhotoDataUrl, PHOTO_MAX_BYTES, PHOTO_MIME_TYPES } from "@/lib/profile-validation";

export function SignatureEditor({
  signature,
  defaultSenderName,
  replyToEmail,
  fullName,
  title,
  nmlsId,
  phone,
  logoDataUrl,
}: {
  signature: string;
  defaultSenderName: string;
  replyToEmail: string;
  fullName: string;
  title: string;
  nmlsId: string;
  phone: string;
  /** The signature logo, stored in `links.signatureLogo` — see src/lib/signature.ts. */
  logoDataUrl: string | null;
}) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    updateSignature,
    {},
  );
  const [value, setValue] = useState(signature);
  // Bumped on Reset to remount the form: the sender-name/reply-to inputs are
  // uncontrolled (defaultValue), and remounting is how React re-applies it.
  const [resetKey, setResetKey] = useState(0);

  const [logoState, logoAction, logoUploading] = useActionState<ProfileState, FormData>(
    updateSignatureLogo,
    {},
  );
  const [removeLogoState, removeLogoAction, logoRemoving] = useActionState<
    ProfileState,
    FormData
  >(removeSignatureLogo, {});
  const [logoClientError, setLogoClientError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const logoPending = logoUploading || logoRemoving;
  const logoError = logoClientError ?? logoState.error ?? removeLogoState.error;
  const logoOk = logoState.ok ?? removeLogoState.ok;

  function onLogoChosen(file: File | undefined) {
    setLogoClientError(null);
    if (!file) return;

    if (!(PHOTO_MIME_TYPES as readonly string[]).includes(file.type)) {
      setLogoClientError("The logo must be a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > PHOTO_MAX_BYTES) {
      setLogoClientError("The logo is larger than 512KB — choose a smaller image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      const valid = validatePhotoDataUrl(dataUrl);
      if (!valid.ok) {
        setLogoClientError(valid.reason);
        return;
      }
      const fd = new FormData();
      fd.set("logoData", dataUrl);
      startTransition(() => logoAction(fd));
    };
    reader.onerror = () => setLogoClientError("We couldn't read that file — try another image.");
    reader.readAsDataURL(file);
  }

  // The exact same renderer every other surface uses (composer, 1:1 email
  // draft, template preview) — this preview is honestly "live": it shows the
  // default fallback the moment the box is empty, not a placeholder message.
  const previewText = renderSignatureText({ fullName, title, nmlsId, phone, signature: value });
  const isCustomized = value.trim().length > 0;

  return (
    <form action={formAction} className="space-y-4" key={resetKey}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Field
          label="Signature"
          htmlFor="signature"
          hint="Plain text; line breaks are kept. Leave blank to use the default shown in the preview."
        >
          <Textarea
            id="signature"
            name="signature"
            rows={7}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Your name, title, NMLS, and phone…"
          />
        </Field>

        <div className="space-y-1.5">
          <p className="text-label font-semibold text-secondary">Live preview</p>
          <div className="rounded-card border border-subtle bg-sunken p-4">
            <p className="text-small text-muted">— sent from Loan Factory CRM —</p>
            <p className="mt-2 whitespace-pre-line border-t border-subtle pt-2 text-body text-secondary">
              {previewText}
            </p>
            {logoDataUrl ? (
              // The source is a validated in-row data URL; next/image cannot optimize it.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoDataUrl}
                alt="Signature logo"
                className="mt-2 max-h-12 max-w-full object-contain"
              />
            ) : null}
            {!isCustomized ? (
              <p className="mt-2 text-small text-disabled">
                Nothing saved yet — this is the default, built from your name, title, NMLS, and
                phone.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setValue(buildDefaultSignature({ fullName, title, nmlsId, phone }))}
        >
          <PenLine className="size-4" aria-hidden />
          Restore default
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setValue(signature);
            setResetKey((k) => k + 1);
          }}
        >
          <RotateCcw className="size-4" aria-hidden />
          Reset
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Default sender name"
          htmlFor="defaultSenderName"
          hint="The name recipients see in their inbox."
        >
          <Input
            id="defaultSenderName"
            name="defaultSenderName"
            defaultValue={defaultSenderName}
            placeholder={fullName}
          />
        </Field>
        <Field
          label="Reply-to address"
          htmlFor="replyToEmail"
          hint="Replies go here instead of the sending address."
        >
          <Input
            id="replyToEmail"
            name="replyToEmail"
            type="email"
            defaultValue={replyToEmail}
            placeholder="you@example.com"
          />
        </Field>
      </div>

      <div className="space-y-2 border-t border-subtle pt-4">
        <span className="block text-label font-semibold text-secondary">Signature logo</span>
        <p className="text-small text-muted">
          A small image (JPEG, PNG, or WebP, up to 512KB) shown under your signature text.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={logoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            aria-label="Choose a signature logo"
            onChange={(e) => {
              onLogoChosen(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={logoPending}
            onClick={() => logoInputRef.current?.click()}
          >
            <ImagePlus className="size-4" aria-hidden />
            {logoUploading ? "Uploading…" : logoDataUrl ? "Replace logo" : "Upload logo"}
          </Button>
          {logoDataUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={logoPending}
              onClick={() => startTransition(() => removeLogoAction(new FormData()))}
            >
              <Trash2 className="size-4" aria-hidden />
              {logoRemoving ? "Removing…" : "Remove"}
            </Button>
          ) : null}
        </div>
        {logoError ? (
          <p role="alert" className="text-small text-critical">
            {logoError}
          </p>
        ) : null}
        {logoOk && !logoError ? (
          <p role="status" className="text-small text-healthy">
            {logoOk}
          </p>
        ) : null}
      </div>

      <p className="text-small text-muted">
        Your signature is added to campaigns, newsletters, and approved one-to-one messages.
      </p>

      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-critical/25 bg-critical-bg px-3 py-2 text-small text-critical"
        >
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p
          role="status"
          className="rounded-md border border-healthy/25 bg-healthy-bg px-3 py-2 text-small text-healthy"
        >
          {state.ok}
        </p>
      ) : null}

      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Saving…" : "Save signature"}
      </Button>
    </form>
  );
}
