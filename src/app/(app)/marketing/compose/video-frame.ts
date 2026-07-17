/**
 * Capture a still frame from a <video> element as a JPEG data URL.
 *
 * Used for the demo thumbnail only — everything stays in the browser. Returns
 * null whenever the frame can't be read (no data yet, zero dimensions, tainted
 * canvas); callers must render a neutral placeholder instead of pretending.
 */
export function captureFrame(el: HTMLVideoElement, maxWidth = 640): string | null {
  try {
    const { videoWidth, videoHeight } = el;
    if (!videoWidth || !videoHeight || el.readyState < 2) return null;

    const scale = Math.min(1, maxWidth / videoWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(videoWidth * scale);
    canvas.height = Math.round(videoHeight * scale);

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(el, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8);
  } catch {
    return null;
  }
}
