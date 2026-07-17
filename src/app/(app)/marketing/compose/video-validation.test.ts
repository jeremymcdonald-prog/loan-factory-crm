import { describe, it, expect } from "vitest";
import {
  validateVideoFile,
  validateRecordingDuration,
  MAX_VIDEO_BYTES,
  MAX_RECORDING_SECONDS,
} from "./video-validation";

describe("video file validation", () => {
  it("accepts mp4, webm, and mov with honest MIME types", () => {
    expect(validateVideoFile("update.mp4", "video/mp4", 5_000_000).ok).toBe(true);
    expect(validateVideoFile("update.webm", "video/webm", 5_000_000).ok).toBe(true);
    expect(validateVideoFile("update.mov", "video/quicktime", 5_000_000).ok).toBe(true);
  });

  it("tolerates a missing MIME for .mov (Safari exports do this)", () => {
    expect(validateVideoFile("clip.mov", "", 5_000_000).ok).toBe(true);
  });

  it("rejects other formats and disguised files", () => {
    expect(validateVideoFile("clip.avi", "video/x-msvideo", 1_000).ok).toBe(false);
    expect(validateVideoFile("run.exe", "application/octet-stream", 1_000).ok).toBe(false);
    expect(validateVideoFile("clip.mp4", "application/zip", 1_000).ok).toBe(false);
    expect(validateVideoFile("noextension", "video/mp4", 1_000).ok).toBe(false);
  });

  it("enforces the 100MB ceiling and rejects empty files", () => {
    expect(validateVideoFile("big.mp4", "video/mp4", MAX_VIDEO_BYTES + 1).ok).toBe(false);
    expect(validateVideoFile("empty.mp4", "video/mp4", 0).ok).toBe(false);
  });
});

describe("recording duration validation", () => {
  it("rejects clips too short to be a message", () => {
    expect(validateRecordingDuration(1).ok).toBe(false);
  });

  it("accepts a normal message length", () => {
    expect(validateRecordingDuration(45).ok).toBe(true);
    expect(validateRecordingDuration(MAX_RECORDING_SECONDS).ok).toBe(true);
  });

  it("rejects recordings past the 3-minute cap", () => {
    expect(validateRecordingDuration(MAX_RECORDING_SECONDS + 5).ok).toBe(false);
  });
});
