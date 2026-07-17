"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CircleDot,
  ImageDown,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Square,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import {
  MAX_RECORDING_SECONDS,
  formatDuration,
  validateRecordingDuration,
} from "./video-validation";
import { captureFrame } from "./video-frame";

export type RecorderResult = {
  blob: Blob;
  objectUrl: string;
  durationSeconds: number;
  thumbnailDataUrl: string | null;
};

type Phase = "starting" | "ready" | "recording" | "paused" | "preview" | "error";

/**
 * The recording modal. Everything happens in the browser: getUserMedia for the
 * camera and mic, MediaRecorder into a webm blob, a canvas frame for the
 * thumbnail. Nothing uploads anywhere — the result is handed back to the
 * composer as an in-memory blob and an object URL.
 *
 * Every failure path is honest and offers the upload alternative instead of
 * pretending a recording happened.
 */
export function VideoRecorderModal({
  onUse,
  onClose,
  onFilePicked,
}: {
  onUse: (result: RecorderResult) => void;
  onClose: () => void;
  /** The upload alternative, offered on every error path. */
  onFilePicked: (file: File) => void;
}) {
  const [phase, setPhase] = useState<Phase>("starting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [cameraId, setCameraId] = useState("");
  const [micId, setMicId] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [capped, setCapped] = useState(false);
  const [thumb, setThumb] = useState<string | null>(null);
  const [clip, setClip] = useState<{ blob: Blob; url: string } | null>(null);
  const [useError, setUseError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const liveRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const tickRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const handedOffRef = useRef(false);
  const clipUrlRef = useRef<string | null>(null);

  function stopTick() {
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }

  function stopTracks() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function fail(err: unknown) {
    const name = err instanceof DOMException ? err.name : "";
    let msg: string;
    if (name === "NotAllowedError" || name === "SecurityError") {
      msg = "Your browser blocked the camera. You can upload a video file instead.";
    } else if (name === "NotFoundError" || name === "OverconstrainedError") {
      msg = "No camera was found on this device. You can upload a video file instead.";
    } else {
      msg =
        "Something went wrong starting the camera — nothing was recorded. You can upload a video file instead.";
    }
    setErrorMessage(msg);
    setPhase("error");
  }

  async function openStream(cam: string, mic: string) {
    stopTracks();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: cam ? { deviceId: { exact: cam } } : true,
        audio: mic ? { deviceId: { exact: mic } } : true,
      });
      streamRef.current = stream;
      if (liveRef.current) {
        liveRef.current.srcObject = stream;
        await liveRef.current.play().catch(() => {
          /* autoplay of a muted local preview rarely fails; the frame still shows */
        });
      }
      // Labels are only populated after permission is granted.
      const devices = await navigator.mediaDevices.enumerateDevices();
      setCameras(devices.filter((d) => d.kind === "videoinput"));
      setMics(devices.filter((d) => d.kind === "audioinput"));
      setPhase("ready");
    } catch (err) {
      fail(err);
    }
  }

  useEffect(() => {
    // Feature-detect before asking for anything. The await before any setState
    // keeps this effect's synchronous body free of state updates.
    async function start() {
      await Promise.resolve();
      if (!navigator.mediaDevices?.getUserMedia) {
        setErrorMessage(
          "This browser can't open a camera from the page. You can upload a video file instead.",
        );
        setPhase("error");
        return;
      }
      if (typeof MediaRecorder === "undefined") {
        setErrorMessage(
          "This browser can't record video in the page. You can upload a video file instead.",
        );
        setPhase("error");
        return;
      }
      await openStream("", "");
    }
    void start();

    return () => {
      stopTick();
      stopTracks();
      // A clip the composer never received dies with the modal.
      if (!handedOffRef.current && clipUrlRef.current) {
        URL.revokeObjectURL(clipUrlRef.current);
      }
    };
    // Mount-only: device changes re-open the stream via their own handlers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startTick() {
    stopTick();
    tickRef.current = window.setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
      if (elapsedRef.current >= MAX_RECORDING_SECONDS) {
        setCapped(true);
        stopRecording();
      }
    }, 1000);
  }

  function startRecording() {
    const stream = streamRef.current;
    if (!stream) return;
    try {
      const mime =
        typeof MediaRecorder.isTypeSupported === "function" &&
        MediaRecorder.isTypeSupported("video/webm")
          ? "video/webm"
          : undefined;
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "video/webm" });
        if (blob.size === 0) {
          setErrorMessage(
            "The recording came back empty — nothing was captured. You can try again or upload a video file instead.",
          );
          setPhase("error");
          return;
        }
        const url = URL.createObjectURL(blob);
        clipUrlRef.current = url;
        setClip({ blob, url });
        setPhase("preview");
      };
      rec.start(1000);
      recorderRef.current = rec;
      elapsedRef.current = 0;
      setElapsed(0);
      setCapped(false);
      setPhase("recording");
      startTick();
    } catch {
      setErrorMessage(
        "Recording couldn't start in this browser. You can upload a video file instead.",
      );
      setPhase("error");
    }
  }

  function pauseRecording() {
    const rec = recorderRef.current;
    if (!rec || rec.state !== "recording") return;
    rec.pause();
    stopTick();
    setPhase("paused");
  }

  function resumeRecording() {
    const rec = recorderRef.current;
    if (!rec || rec.state !== "paused") return;
    rec.resume();
    startTick();
    setPhase("recording");
  }

  function stopRecording() {
    const rec = recorderRef.current;
    if (!rec || rec.state === "inactive") return;
    stopTick();
    // Grab the thumbnail from the live preview before the stream goes quiet.
    setThumb(liveRef.current ? captureFrame(liveRef.current) : null);
    rec.stop();
  }

  function discardClip() {
    if (clipUrlRef.current) URL.revokeObjectURL(clipUrlRef.current);
    clipUrlRef.current = null;
    setClip(null);
    setThumb(null);
    setUseError(null);
    elapsedRef.current = 0;
    setElapsed(0);
    setCapped(false);
  }

  function retake() {
    discardClip();
    if (liveRef.current && streamRef.current) {
      liveRef.current.srcObject = streamRef.current;
      void liveRef.current.play().catch(() => {});
    }
    setPhase("ready");
  }

  function deleteAndClose() {
    discardClip();
    onClose();
  }

  function useClip() {
    if (!clip) return;
    const verdict = validateRecordingDuration(elapsedRef.current);
    if (!verdict.ok) {
      setUseError(verdict.reason);
      return;
    }
    handedOffRef.current = true;
    onUse({
      blob: clip.blob,
      objectUrl: clip.url,
      durationSeconds: elapsedRef.current,
      thumbnailDataUrl: thumb,
    });
  }

  function recaptureThumbnail() {
    if (playbackRef.current) setThumb(captureFrame(playbackRef.current));
  }

  const recordingLive = phase === "recording" || phase === "paused";
  const showLive = phase === "starting" || phase === "ready" || recordingLive;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-recorder-title"
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/60 sm:items-center sm:p-4"
    >
      <div className="flex h-full w-full flex-col overflow-y-auto bg-surface sm:h-auto sm:max-h-[92dvh] sm:max-w-2xl sm:rounded-xl sm:border sm:border-subtle sm:shadow-e3">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-subtle bg-surface px-4 py-3">
          <h2 id="video-recorder-title" className="text-h3 font-semibold text-primary">
            Record a video
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close the recorder"
            className="rounded p-1 text-muted hover:bg-sunken hover:text-primary"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="flex-1 space-y-4 p-4">
          {/* The stage: live preview or playback, 16:9, dark well. */}
          <div className="relative aspect-video w-full overflow-hidden rounded-card bg-ink">
            <video
              ref={liveRef}
              muted
              playsInline
              className={cn("h-full w-full object-cover", showLive ? "" : "hidden")}
            />
            {phase === "preview" && clip ? (
              <video
                ref={playbackRef}
                controls
                playsInline
                src={clip.url}
                className="h-full w-full object-contain"
              />
            ) : null}
            {phase === "starting" ? (
              <p className="absolute inset-0 grid place-items-center px-6 text-center text-small text-white/80">
                Asking your browser for the camera and microphone…
              </p>
            ) : null}
            {phase === "error" ? (
              <p className="absolute inset-0 grid place-items-center px-6 text-center text-small text-white/80">
                No camera preview.
              </p>
            ) : null}
            {recordingLive ? (
              <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-small font-semibold text-white tnum">
                <span
                  aria-hidden
                  className={cn(
                    "size-2 rounded-full bg-critical",
                    phase === "recording" && "animate-pulse",
                  )}
                />
                {phase === "paused" ? "Paused · " : ""}
                {formatDuration(elapsed)} / {formatDuration(MAX_RECORDING_SECONDS)}
              </span>
            ) : null}
          </div>

          {capped ? (
            <p
              role="status"
              className="rounded-md border border-warning-border bg-warning-bg px-3 py-2 text-small text-warning"
            >
              Recording stopped at 3:00 — that&rsquo;s the cap. Anything longer works better
              as two shorter messages.
            </p>
          ) : null}

          {phase === "error" ? (
            <div
              role="alert"
              className="space-y-3 rounded-md border border-critical-border bg-critical-bg px-3 py-3"
            >
              <p className="text-small font-semibold text-critical">{errorMessage}</p>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-control border border-strong bg-surface px-3.5 py-2 text-body font-semibold text-primary shadow-e1 transition-colors hover:bg-sunken">
                <Upload className="size-4" aria-hidden />
                Upload a video file instead
                <input
                  type="file"
                  accept=".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime"
                  capture="user"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onFilePicked(file);
                  }}
                />
              </label>
            </div>
          ) : null}

          {/* Device pickers — only once permission granted, never mid-recording. */}
          {phase === "ready" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Camera" htmlFor="recorder-camera">
                <Select
                  id="recorder-camera"
                  value={cameraId}
                  onChange={(e) => {
                    setCameraId(e.target.value);
                    void openStream(e.target.value, micId);
                  }}
                >
                  <option value="">Default camera</option>
                  {cameras.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      {d.label || `Camera ${i + 1}`}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Microphone" htmlFor="recorder-mic">
                <Select
                  id="recorder-mic"
                  value={micId}
                  onChange={(e) => {
                    setMicId(e.target.value);
                    void openStream(cameraId, e.target.value);
                  }}
                >
                  <option value="">Default microphone</option>
                  {mics.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      {d.label || `Microphone ${i + 1}`}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          ) : null}

          {/* Controls per phase. */}
          <div className="flex flex-wrap items-center gap-2">
            {phase === "ready" ? (
              <Button variant="primary" onClick={startRecording}>
                <CircleDot className="size-4" aria-hidden />
                Start recording
              </Button>
            ) : null}

            {phase === "recording" ? (
              <>
                <Button variant="primary" onClick={stopRecording}>
                  <Square className="size-4" aria-hidden />
                  Stop
                </Button>
                <Button onClick={pauseRecording}>
                  <Pause className="size-4" aria-hidden />
                  Pause
                </Button>
              </>
            ) : null}

            {phase === "paused" ? (
              <>
                <Button variant="primary" onClick={resumeRecording}>
                  <Play className="size-4" aria-hidden />
                  Resume
                </Button>
                <Button onClick={stopRecording}>
                  <Square className="size-4" aria-hidden />
                  Stop
                </Button>
              </>
            ) : null}

            {phase === "preview" ? (
              <>
                <Button variant="primary" onClick={useClip}>
                  Use this video
                </Button>
                <Button onClick={retake}>
                  <RotateCcw className="size-4" aria-hidden />
                  Retake
                </Button>
                <Button onClick={recaptureThumbnail} title="Pause the playback on the frame you want, then recapture">
                  <ImageDown className="size-4" aria-hidden />
                  Recapture thumbnail
                </Button>
                <Button variant="danger" onClick={deleteAndClose}>
                  <Trash2 className="size-4" aria-hidden />
                  Delete
                </Button>
              </>
            ) : null}
          </div>

          {useError ? (
            <p
              role="alert"
              className="rounded-md border border-critical-border bg-critical-bg px-3 py-2 text-small text-critical"
            >
              {useError}
            </p>
          ) : null}

          {phase === "preview" ? (
            <div className="flex items-start gap-3">
              <div className="w-32 shrink-0 overflow-hidden rounded-md border border-subtle bg-sunken">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt="Captured thumbnail" className="aspect-video w-full object-cover" />
                ) : (
                  <div className="grid aspect-video w-full place-items-center">
                    <Camera className="size-4 text-disabled" aria-hidden />
                  </div>
                )}
              </div>
              <p className="text-small text-muted">
                {thumb
                  ? "This frame becomes the email thumbnail. Pause the playback on a better moment and recapture if you'd like."
                  : "We couldn't capture a frame, so the email will show a neutral placeholder instead of a thumbnail."}
                {" "}Length: <span className="font-semibold text-primary tnum">{formatDuration(elapsed)}</span>
              </p>
            </div>
          ) : null}

          <p className="flex items-center gap-1.5 border-t border-subtle pt-3 text-small text-muted">
            <Mic className="size-3.5 shrink-0" aria-hidden />
            The recording stays in your browser. Nothing uploads, and nothing sends.
          </p>
        </div>
      </div>
    </div>
  );
}
