"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Monitor,
  Play,
  RefreshCcw,
  Smartphone,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { initialsOf } from "@/lib/format";
import { cn } from "@/lib/cn";
import { renderSignatureText, type SignatureProfile } from "@/lib/signature";
import { getMySignatureProfile } from "@/app/(app)/settings/profile/actions";
import { saveVideoDraft, type DraftFormState } from "./actions";
import { VideoRecorderModal, type RecorderResult } from "./video-recorder";
import { validateVideoFile, formatDuration } from "./video-validation";
import { captureFrame } from "./video-frame";

// ---------------------------------------------------------------------------
// Types shared with the server page
// ---------------------------------------------------------------------------

export type ComposerProfile = {
  fullName: string;
  senderName: string | null;
  replyTo: string | null;
  photoData: string | null;
  signature: string | null;
  language: string;
};

export type ExampleDraft = {
  id: string;
  subject: string;
  language: string;
  ownerName: string | null;
  intro: string;
  closing: string;
  video: { title: string; caption: string; durationSeconds: number };
};

type ComposeLanguage = "en" | "es" | "vi" | "ru";

/**
 * Starter drafts per language — these only seed the intro PLACEHOLDER. We
 * never machine-translate what the user typed; switching languages leaves
 * their words exactly as they wrote them.
 */
const LANGUAGES: {
  code: ComposeLanguage;
  name: string;
  starter: string;
}[] = [
  {
    code: "en",
    name: "English",
    starter:
      "Hi there,\n\nI recorded a quick video with the update I promised — it's under three minutes. Watch it when you have a moment, and just reply here if anything is unclear.",
  },
  {
    code: "es",
    name: "Spanish",
    starter:
      "Hola,\n\nLe grabé un video corto con la información que le prometí — dura menos de tres minutos. Véalo cuando tenga un momento y respóndame aquí si algo no queda claro.",
  },
  {
    code: "vi",
    name: "Vietnamese",
    starter:
      "Chào anh/chị,\n\nEm vừa ghi một video ngắn với thông tin em đã hứa — chưa đến ba phút. Anh/chị xem lúc nào tiện, và cứ trả lời tại đây nếu có điều gì chưa rõ.",
  },
  {
    code: "ru",
    name: "Russian",
    starter:
      "Здравствуйте!\n\nЯ записала для вас короткое видео с обещанной информацией — меньше трёх минут. Посмотрите, когда будет минутка, и напишите мне здесь, если что-то останется непонятным.",
  },
];

const LANGUAGE_NAMES: Record<string, string> = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l.name]),
);

/** The plain-text stand-in for a hosted-video link — mirrored in actions.ts. */
const FALLBACK_LINE = "If the video doesn't load, use this link instead.";

const STORAGE_KEY = "lfcrm-video-composer";

type VideoAttachment = {
  /** Null for example drafts — their bytes were never stored anywhere. */
  objectUrl: string | null;
  durationSeconds: number;
  thumbnailDataUrl: string | null;
  source: "recording" | "upload" | "example";
};

type PersistedText = {
  audience: string;
  subject: string;
  intro: string;
  closing: string;
  language: ComposeLanguage;
  videoTitle: string;
  videoCaption: string;
};

function isComposeLanguage(value: string): value is ComposeLanguage {
  return LANGUAGES.some((l) => l.code === value);
}

// ---------------------------------------------------------------------------
// The composer
// ---------------------------------------------------------------------------

export function Composer({
  profile,
  examples,
}: {
  profile: ComposerProfile;
  examples: ExampleDraft[];
}) {
  const [audience, setAudience] = useState("");
  const [subject, setSubject] = useState("");
  const [intro, setIntro] = useState("");
  const [closing, setClosing] = useState("");
  const [language, setLanguage] = useState<ComposeLanguage>(
    isComposeLanguage(profile.language) ? profile.language : "en",
  );
  const [videoTitle, setVideoTitle] = useState("");
  const [videoCaption, setVideoCaption] = useState("");
  const [video, setVideo] = useState<VideoAttachment | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [recorderOpen, setRecorderOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoUrlRef = useRef<string | null>(null);

  const [state, formAction, pending] = useActionState<DraftFormState, FormData>(
    saveVideoDraft,
    {},
  );

  // The richer signature fields (title, phone, NMLS, logo) aren't in
  // ComposerProfile — fetched once so the sender preview below renders the
  // real signature via the shared helper, not just the raw saved text.
  const [signatureProfile, setSignatureProfile] = useState<SignatureProfile | null>(null);
  useEffect(() => {
    let alive = true;
    getMySignatureProfile()
      .then((p) => {
        if (alive) setSignatureProfile(p);
      })
      .catch(() => {
        /* the sender block falls back to the profile prop below */
      });
    return () => {
      alive = false;
    };
  }, []);

  // Text state survives a reload within the session — the recording can't
  // (object URLs die with the page), so only words are persisted. Restoring
  // after mount is the one legitimate setState-in-effect, as in the assistant
  // panel.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const t = JSON.parse(saved) as Partial<PersistedText>;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAudience(t.audience ?? "");
      setSubject(t.subject ?? "");
      setIntro(t.intro ?? "");
      setClosing(t.closing ?? "");
      if (t.language && isComposeLanguage(t.language)) setLanguage(t.language);
      setVideoTitle(t.videoTitle ?? "");
      setVideoCaption(t.videoCaption ?? "");
    } catch {
      /* a corrupt draft is not worth an error state */
    }
  }, []);

  useEffect(() => {
    const text: PersistedText = {
      audience,
      subject,
      intro,
      closing,
      language,
      videoTitle,
      videoCaption,
    };
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(text));
    } catch {
      /* storage full — the draft simply won't persist */
    }
  }, [audience, subject, intro, closing, language, videoTitle, videoCaption]);

  // The current object URL, revoked whenever the attachment changes or the
  // composer unmounts.
  useEffect(() => {
    videoUrlRef.current = video?.objectUrl ?? null;
  }, [video]);
  useEffect(
    () => () => {
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
    },
    [],
  );

  function replaceAttachment(next: VideoAttachment | null) {
    setVideo((prev) => {
      if (prev?.objectUrl && prev.objectUrl !== next?.objectUrl) {
        URL.revokeObjectURL(prev.objectUrl);
      }
      return next;
    });
    setPlaying(false);
  }

  async function attachFile(file: File) {
    setVideoError(null);
    const verdict = validateVideoFile(file.name, file.type, file.size);
    if (!verdict.ok) {
      setVideoError(verdict.reason);
      return;
    }

    const url = URL.createObjectURL(file);
    const probe = document.createElement("video");
    probe.preload = "auto";
    probe.muted = true;
    probe.playsInline = true;
    probe.src = url;

    let durationSeconds = 0;
    let thumbnailDataUrl: string | null = null;
    try {
      await new Promise<void>((resolve, reject) => {
        probe.onloadeddata = () => resolve();
        probe.onerror = () => reject(new Error("unreadable"));
        window.setTimeout(() => reject(new Error("timeout")), 4000);
      });
      durationSeconds = Number.isFinite(probe.duration) ? Math.round(probe.duration) : 0;
      // Nudge past the first (often black) frame before capturing.
      await new Promise<void>((resolve) => {
        probe.onseeked = () => resolve();
        window.setTimeout(resolve, 1500);
        try {
          probe.currentTime = Math.min(0.5, (probe.duration || 1) / 10);
        } catch {
          resolve();
        }
      });
      thumbnailDataUrl = captureFrame(probe);
    } catch {
      // The file may still play in the card; we just have no frame or length.
    }
    probe.removeAttribute("src");

    replaceAttachment({ objectUrl: url, durationSeconds, thumbnailDataUrl, source: "upload" });
    if (!videoTitle) setVideoTitle(file.name.replace(/\.[^.]+$/, ""));
  }

  function onRecorded(result: RecorderResult) {
    setVideoError(null);
    replaceAttachment({
      objectUrl: result.objectUrl,
      durationSeconds: result.durationSeconds,
      thumbnailDataUrl: result.thumbnailDataUrl,
      source: "recording",
    });
    setRecorderOpen(false);
  }

  function loadExample(ex: ExampleDraft) {
    setSubject(ex.subject);
    setIntro(ex.intro);
    setClosing(ex.closing);
    if (isComposeLanguage(ex.language)) setLanguage(ex.language);
    setVideoTitle(ex.video.title);
    setVideoCaption(ex.video.caption);
    setVideoError(null);
    // The example's bytes were never uploaded anywhere — only its metadata
    // exists, so the card shows a placeholder rather than pretending.
    replaceAttachment({
      objectUrl: null,
      durationSeconds: ex.video.durationSeconds,
      thumbnailDataUrl: null,
      source: "example",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const starter = LANGUAGES.find((l) => l.code === language)?.starter ?? "";
  const senderName = profile.senderName?.trim() || profile.fullName;
  const canSave = Boolean(video) && videoTitle.trim().length > 0;

  // The real rendered signature via the shared helper (src/lib/signature.ts)
  // — falls back to the fetched full profile once it loads, or to the fields
  // ComposerProfile already carries in the meantime, so this is never blank.
  const signatureSource: SignatureProfile = signatureProfile ?? {
    fullName: profile.fullName,
    signature: profile.signature,
  };
  const signatureText = renderSignatureText(signatureSource);
  const signatureLogo = signatureProfile?.logoDataUrl ?? null;

  const senderBlock = (
    <div className="flex items-start gap-3">
      {profile.photoData ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.photoData}
          alt=""
          className="size-12 shrink-0 rounded-full border border-subtle object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="grid size-12 shrink-0 place-items-center rounded-full bg-action-tint text-body font-semibold text-action"
        >
          {initialsOf(profile.fullName)}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-body font-semibold text-primary">{senderName}</p>
        {profile.replyTo ? (
          <p className="text-small text-muted">Replies go to {profile.replyTo}</p>
        ) : null}
        <pre className="mt-1.5 whitespace-pre-wrap font-sans text-small leading-5 text-secondary">
          {signatureText}
        </pre>
        {signatureLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={signatureLogo} alt="" className="mt-1.5 max-h-10 max-w-full object-contain" />
        ) : null}
      </div>
    </div>
  );

  const thumbnailCard = (
    <div className="relative aspect-video w-full overflow-hidden rounded-md border border-subtle bg-sunken">
      {video?.thumbnailDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={video.thumbnailDataUrl}
          alt={videoTitle ? `Thumbnail for ${videoTitle}` : "Video thumbnail"}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="grid h-full w-full place-items-center">
          <div className="text-center">
            <Video className="mx-auto size-6 text-disabled" aria-hidden />
            <p className="mt-1 px-4 text-small text-muted">
              {video?.source === "example"
                ? "Demo video attachment — recording not stored"
                : videoTitle || "Video"}
            </p>
          </div>
        </div>
      )}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 grid place-items-center"
      >
        <span className="grid size-12 place-items-center rounded-full bg-black/60">
          <Play className="ml-0.5 size-5 text-white" />
        </span>
      </span>
    </div>
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      {/* ------------------------------------------------------------------ */}
      {/* The editor                                                          */}
      {/* ------------------------------------------------------------------ */}
      <form action={formAction} className="min-w-0 space-y-5">
        <section className="space-y-4 rounded-card border border-subtle bg-surface p-4 shadow-e1 sm:p-5">
          <Field
            label="To"
            htmlFor="audience"
            hint="Demo — pick recipients when sending is connected."
          >
            <Input
              id="audience"
              name="audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              autoComplete="off"
              placeholder="Past clients from 2024, the Nguyen family, …"
            />
          </Field>

          <Field label="Subject" htmlFor="subject" required>
            <Input
              id="subject"
              name="subject"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              autoComplete="off"
              placeholder="A quick video update for you"
            />
          </Field>

          <Field
            label="Language"
            htmlFor="language"
            hint="Swaps the starter suggestion below. Your own words are never machine-translated."
          >
            <Select
              id="language"
              name="language"
              value={language}
              onChange={(e) => {
                if (isComposeLanguage(e.target.value)) setLanguage(e.target.value);
              }}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </Select>
          </Field>

          {language !== "en" ? (
            <p className="rounded-md border border-warning-border bg-warning-bg px-3 py-1.5 text-small font-semibold text-warning">
              Written in {LANGUAGE_NAMES[language]} — a human translation review is required
              before this sends.
            </p>
          ) : null}

          <Field label="Personal intro" htmlFor="intro" required>
            <Textarea
              id="intro"
              name="intro"
              required
              rows={4}
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              placeholder={starter}
            />
          </Field>

          {/* ---------------- The video block ---------------- */}
          <div className="space-y-1.5">
            <p className="text-label font-semibold text-secondary">Video</p>

            {video ? (
              <div className="space-y-3 rounded-card border border-subtle bg-sunken/50 p-3">
                {playing && video.objectUrl ? (
                  <div className="space-y-2">
                    <video
                      controls
                      playsInline
                      src={video.objectUrl}
                      className="aspect-video w-full rounded-md bg-ink object-contain"
                    />
                    <Button size="sm" variant="ghost" onClick={() => setPlaying(false)}>
                      <X className="size-3.5" aria-hidden />
                      Close player
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    {thumbnailCard}
                    {video.objectUrl ? (
                      <button
                        type="button"
                        onClick={() => setPlaying(true)}
                        aria-label="Play the video"
                        className="absolute inset-0 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                      />
                    ) : null}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="neutral">Demo video attachment</Badge>
                  <span className="text-small text-muted tnum">
                    {formatDuration(video.durationSeconds)}
                  </span>
                  {video.source === "example" ? (
                    <span className="text-small text-muted">
                      Recording not stored — examples keep only their details.
                    </span>
                  ) : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Video title" htmlFor="videoTitle" required>
                    <Input
                      id="videoTitle"
                      name="videoTitle"
                      required
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      autoComplete="off"
                      placeholder="July market update"
                    />
                  </Field>
                  <Field label="Caption" htmlFor="videoCaption">
                    <Input
                      id="videoCaption"
                      name="videoCaption"
                      value={videoCaption}
                      onChange={(e) => setVideoCaption(e.target.value)}
                      autoComplete="off"
                      placeholder="3-minute update"
                    />
                  </Field>
                </div>

                <p className="text-small text-muted">{FALLBACK_LINE}</p>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => replaceAttachment(null)}>
                    <RefreshCcw className="size-3.5" aria-hidden />
                    Replace
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      replaceAttachment(null);
                      setVideoTitle("");
                      setVideoCaption("");
                    }}
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2 rounded-card border border-dashed border-strong bg-sunken/50 p-4">
                <Button onClick={() => setRecorderOpen(true)}>
                  <Video className="size-4" aria-hidden />
                  Add video
                </Button>
                <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-control px-3.5 text-body font-medium text-secondary transition-colors hover:bg-sunken hover:text-primary">
                  <Upload className="size-4" aria-hidden />
                  Upload a video file
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void attachFile(file);
                      e.target.value = "";
                    }}
                  />
                </label>
                <p className="w-full text-small text-muted">
                  .mp4, .webm, or .mov up to 100MB. It stays on this device — nothing uploads
                  in the demo.
                </p>
              </div>
            )}

            {videoError ? (
              <p role="alert" className="text-small text-critical">
                {videoError}
              </p>
            ) : null}
          </div>

          <Field label="Closing" htmlFor="closing">
            <Textarea
              id="closing"
              name="closing"
              rows={3}
              value={closing}
              onChange={(e) => setClosing(e.target.value)}
              placeholder="Talk soon — reply here or call me any time."
            />
          </Field>

          {/* Sender identity — read-only, exactly as saved on the profile. */}
          <div className="space-y-2 border-t border-subtle pt-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-label font-semibold uppercase tracking-wide text-muted">
                From
              </p>
              <Link
                href="/settings/profile"
                className="text-small font-semibold text-action hover:underline"
              >
                Edit in My profile
              </Link>
            </div>
            {senderBlock}
          </div>
        </section>

        {/* Save */}
        <input type="hidden" name="durationSeconds" value={video?.durationSeconds ?? 0} />

        {state.ok ? (
          <p
            role="status"
            className="flex items-start gap-2 rounded-md border border-healthy/25 bg-healthy-bg px-3 py-2.5 text-small text-secondary"
          >
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-healthy" aria-hidden />
            <span>
              <span className="font-semibold text-primary">
                {state.savedSubject ?? "Your draft"}
              </span>{" "}
              is saved as a draft. Nothing sends until sending is connected.
            </span>
          </p>
        ) : null}

        {state.error ? (
          <p
            role="alert"
            className="rounded-md border border-critical/25 bg-critical-bg px-3 py-2 text-small text-critical"
          >
            {state.error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="primary" disabled={pending || !canSave}>
            {pending ? "Saving…" : "Save draft"}
          </Button>
          <p className="text-small text-muted">
            The recording stays on this device in the demo — only the email text and the
            video&rsquo;s details are saved.
          </p>
        </div>
        {!canSave ? (
          <p className="text-small text-muted">
            Add a video and give it a title to save the draft.
          </p>
        ) : null}
      </form>

      {/* ------------------------------------------------------------------ */}
      {/* Preview + examples rail                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="min-w-0 space-y-6">
        <section>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-label font-semibold uppercase tracking-wide text-primary">
              Recipient preview
            </h2>
            <div className="flex rounded-control border border-strong bg-surface p-0.5">
              {(
                [
                  { mode: "desktop" as const, icon: Monitor, label: "Desktop" },
                  { mode: "mobile" as const, icon: Smartphone, label: "Mobile" },
                ] as const
              ).map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPreviewMode(mode)}
                  aria-pressed={previewMode === mode}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-[5px] px-2.5 py-1 text-small font-semibold transition-colors",
                    previewMode === mode
                      ? "bg-action text-action-fg"
                      : "text-secondary hover:text-primary",
                  )}
                >
                  <Icon className="size-3.5" aria-hidden />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <p className="mb-2 text-small text-muted">
            Preview only — sending connects later. Email clients vary; production delivery
            would use a hosted video page behind this thumbnail.
          </p>

          <div
            className={cn(
              "overflow-hidden rounded-card border border-strong bg-surface shadow-e1",
              previewMode === "mobile" && "mx-auto w-[375px] max-w-full",
            )}
          >
            <div className="border-b border-subtle bg-sunken px-4 py-2.5">
              <p className="text-small text-muted">Subject</p>
              <p className="truncate text-body font-semibold text-primary">
                {subject || "A quick video update for you"}
              </p>
            </div>
            <div className="space-y-4 p-4">
              <p className="whitespace-pre-wrap text-small leading-5 text-secondary">
                {intro || starter}
              </p>

              <div>
                {thumbnailCard}
                <p className="mt-1.5 text-small font-semibold text-primary">
                  {videoTitle || "Your video"}
                  {video ? (
                    <span className="font-normal text-muted tnum">
                      {" · "}
                      {formatDuration(video.durationSeconds)}
                    </span>
                  ) : null}
                </p>
                {videoCaption ? (
                  <p className="text-small text-muted">{videoCaption}</p>
                ) : null}
                <p className="mt-1 text-small text-muted">{FALLBACK_LINE}</p>
              </div>

              {closing ? (
                <p className="whitespace-pre-wrap text-small leading-5 text-secondary">
                  {closing}
                </p>
              ) : null}

              <div className="border-t border-subtle pt-3">{senderBlock}</div>
            </div>
          </div>
        </section>

        {/* Examples */}
        {examples.length > 0 ? (
          <section>
            <h2 className="mb-1 text-label font-semibold uppercase tracking-wide text-primary">
              Example drafts
            </h2>
            <p className="mb-2 text-small text-muted">
              Seeded examples from the team. Loading one fills in the words — the recording
              itself was never stored, so the video shows as a placeholder.
            </p>
            <ul className="space-y-2">
              {examples.map((ex) => (
                <li key={ex.id}>
                  <button
                    type="button"
                    onClick={() => loadExample(ex)}
                    className="w-full rounded-card border border-subtle bg-surface px-3 py-2.5 text-left transition-colors hover:border-brand hover:bg-action-tint"
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="min-w-0 text-small font-semibold text-primary">
                        {ex.subject}
                      </span>
                      <span className="shrink-0 rounded border border-strong bg-sunken px-1 py-px text-micro font-semibold text-secondary">
                        {ex.language.toUpperCase()}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-small text-muted">
                      {ex.ownerName ?? "Team"}
                      {" · "}
                      {ex.video.title}
                      <span className="tnum">
                        {" · "}
                        {formatDuration(ex.video.durationSeconds)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      {recorderOpen ? (
        <VideoRecorderModal
          onUse={onRecorded}
          onClose={() => setRecorderOpen(false)}
          onFilePicked={(file) => {
            setRecorderOpen(false);
            void attachFile(file);
          }}
        />
      ) : null}
    </div>
  );
}
