import { describe, it, expect } from "vitest";
import {
  validatePhotoDataUrl,
  validatePersonaFile,
  PHOTO_MAX_BYTES,
  PERSONA_MAX_BYTES,
} from "./profile-validation";

function dataUrl(mime: string, bytes: number): string {
  const base64 = Buffer.alloc(bytes, 7).toString("base64");
  return `data:${mime};base64,${base64}`;
}

describe("profile photo validation", () => {
  it("accepts a small jpeg, png, and webp", () => {
    for (const mime of ["image/jpeg", "image/png", "image/webp"]) {
      expect(validatePhotoDataUrl(dataUrl(mime, 10_000)).ok, mime).toBe(true);
    }
  });

  it("rejects disallowed image types and non-images", () => {
    expect(validatePhotoDataUrl(dataUrl("image/gif", 1_000)).ok).toBe(false);
    expect(validatePhotoDataUrl(dataUrl("image/svg+xml", 1_000)).ok).toBe(false);
    expect(validatePhotoDataUrl(dataUrl("application/pdf", 1_000)).ok).toBe(false);
    expect(validatePhotoDataUrl("https://example.com/photo.jpg").ok).toBe(false);
    expect(validatePhotoDataUrl("").ok).toBe(false);
  });

  it("rejects a photo over the 512KB limit but accepts one just under", () => {
    expect(validatePhotoDataUrl(dataUrl("image/png", PHOTO_MAX_BYTES + 1024)).ok).toBe(false);
    expect(validatePhotoDataUrl(dataUrl("image/png", PHOTO_MAX_BYTES - 1024)).ok).toBe(true);
  });

  it("rejects a data URL whose payload is not clean base64 (smuggling)", () => {
    expect(validatePhotoDataUrl("data:image/png;base64,<script>x</script>").ok).toBe(false);
    expect(validatePhotoDataUrl("data:image/png;base64,").ok).toBe(false);
  });
});

describe("persona file validation", () => {
  it("accepts the four allowed formats with honest MIME types", () => {
    expect(validatePersonaFile("bio.pdf", "application/pdf", 10_000)).toEqual({
      ok: true,
      kind: "pdf",
    });
    expect(
      validatePersonaFile(
        "bio.docx",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        10_000,
      ),
    ).toEqual({ ok: true, kind: "docx" });
    expect(validatePersonaFile("bio.md", "text/markdown", 500)).toEqual({
      ok: true,
      kind: "md",
    });
    expect(validatePersonaFile("bio.txt", "text/plain", 500)).toEqual({
      ok: true,
      kind: "txt",
    });
  });

  it("tolerates the browser reporting no MIME for text files", () => {
    expect(validatePersonaFile("notes.md", "", 500).ok).toBe(true);
    expect(validatePersonaFile("notes.txt", "", 500).ok).toBe(true);
  });

  it("rejects executables, images, and unknown extensions outright", () => {
    expect(validatePersonaFile("run.exe", "application/octet-stream", 100).ok).toBe(false);
    expect(validatePersonaFile("photo.png", "image/png", 100).ok).toBe(false);
    expect(validatePersonaFile("macro.docm", "application/vnd.ms-word", 100).ok).toBe(false);
    expect(validatePersonaFile("noextension", "text/plain", 100).ok).toBe(false);
  });

  it("rejects a PDF whose MIME does not match its extension (disguised file)", () => {
    expect(validatePersonaFile("bio.pdf", "application/octet-stream", 100).ok).toBe(false);
    expect(validatePersonaFile("bio.docx", "application/zip", 100).ok).toBe(false);
  });

  it("enforces the 5MB ceiling and rejects empty files", () => {
    expect(validatePersonaFile("big.pdf", "application/pdf", PERSONA_MAX_BYTES + 1).ok).toBe(
      false,
    );
    expect(validatePersonaFile("bio.pdf", "application/pdf", 0).ok).toBe(false);
  });
});
