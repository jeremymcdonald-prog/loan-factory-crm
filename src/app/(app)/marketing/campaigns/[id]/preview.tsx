"use client";

/**
 * Recipient preview for a campaign — the email and the text as the recipient
 * sees them, with the same desktop/mobile toggle as the video composer's
 * preview. Preview only: sending connects later, and the footer shows the
 * compliance line every real send would carry.
 */
import { useState } from "react";
import { Mail, MessageSquare, Monitor, Play, Smartphone, Video } from "lucide-react";
import { cn } from "@/lib/cn";
import { renderMergeFields } from "../merge-fields";

export type PreviewVideo = {
  title: string;
  caption: string | null;
  durationSeconds: number | null;
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function CampaignPreview({
  emailSubject,
  emailBody,
  emailFromTemplate,
  smsBody,
  video,
  senderName,
  nmls,
}: {
  emailSubject: string;
  /** Null when the campaign has no email content at all. */
  emailBody: string | null;
  /** True when the body shown comes from the attached template, not the campaign. */
  emailFromTemplate: boolean;
  smsBody: string | null;
  video: PreviewVideo | null;
  senderName: string;
  nmls: string | null;
}) {
  const [mode, setMode] = useState<"desktop" | "mobile">("desktop");

  const complianceFooter = (
    <p className="border-t border-subtle pt-2 text-micro leading-4 text-muted">
      {senderName} · Loan Factory, Inc.
      {nmls ? (
        <>
          {" "}
          NMLS #<span className="tnum">{nmls}</span>
        </>
      ) : (
        " — company NMLS"
      )}{" "}
      · Equal Housing Opportunity
    </p>
  );

  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-label font-semibold uppercase tracking-wide text-primary">
          Recipient preview
        </h2>
        <div className="flex rounded-control border border-strong bg-surface p-0.5">
          {(
            [
              { m: "desktop" as const, icon: Monitor, label: "Desktop" },
              { m: "mobile" as const, icon: Smartphone, label: "Mobile" },
            ] as const
          ).map(({ m, icon: Icon, label }) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-[5px] px-2.5 py-1 text-small font-semibold transition-colors",
                mode === m ? "bg-action text-action-fg" : "text-secondary hover:text-primary",
              )}
            >
              <Icon className="size-3.5" aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-2 text-small text-muted">
        Preview only — sending connects later. Merge fields are swapped for each
        recipient&rsquo;s real details at send time.
      </p>

      <div className={cn("space-y-4", mode === "mobile" && "mx-auto w-[375px] max-w-full")}>
        {/* ---------------- Email ---------------- */}
        {emailBody ? (
          <div className="overflow-hidden rounded-card border border-strong bg-surface shadow-e1">
            <div className="flex items-center gap-2 border-b border-subtle bg-sunken px-4 py-2.5">
              <Mail className="size-3.5 shrink-0 text-muted" aria-hidden />
              <div className="min-w-0">
                <p className="text-small text-muted">Subject</p>
                <p className="truncate text-body font-semibold text-primary">
                  {renderMergeFields(emailSubject)}
                </p>
              </div>
            </div>
            <div className="space-y-4 p-4">
              {emailFromTemplate ? (
                <p className="rounded-md border border-subtle bg-sunken px-3 py-1.5 text-small text-muted">
                  No email written on the campaign — this is the attached template,
                  which is what would go out.
                </p>
              ) : null}
              <p className="whitespace-pre-wrap text-small leading-5 text-secondary">
                {renderMergeFields(emailBody)}
              </p>

              {video ? (
                <div>
                  <div className="relative aspect-video w-full overflow-hidden rounded-md border border-subtle bg-sunken">
                    <div className="grid h-full w-full place-items-center">
                      <div className="text-center">
                        <Video className="mx-auto size-6 text-disabled" aria-hidden />
                        <p className="mt-1 px-4 text-small text-muted">
                          Demo video attachment — recording not stored
                        </p>
                      </div>
                    </div>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 grid place-items-center"
                    >
                      <span className="grid size-12 place-items-center rounded-full bg-black/60">
                        <Play className="ml-0.5 size-5 text-white" />
                      </span>
                    </span>
                  </div>
                  <p className="mt-1.5 text-small font-semibold text-primary">
                    {video.title}
                    {video.durationSeconds ? (
                      <span className="font-normal text-muted tnum">
                        {" · "}
                        {formatDuration(video.durationSeconds)}
                      </span>
                    ) : null}
                  </p>
                  {video.caption ? (
                    <p className="text-small text-muted">{video.caption}</p>
                  ) : null}
                </div>
              ) : null}

              {complianceFooter}
            </div>
          </div>
        ) : null}

        {/* ---------------- Text message ---------------- */}
        {smsBody ? (
          <div className="rounded-card border border-strong bg-surface p-4 shadow-e1">
            <p className="mb-2 flex items-center gap-1.5 text-small text-muted">
              <MessageSquare className="size-3.5" aria-hidden />
              Text message
            </p>
            <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-subtle bg-sunken px-3.5 py-2.5">
              <p className="whitespace-pre-wrap text-small leading-5 text-secondary">
                {renderMergeFields(smsBody)}
              </p>
            </div>
            <p className="mt-2 text-micro leading-4 text-muted">
              The first text identifies {senderName} and Loan Factory
              {nmls ? (
                <>
                  {" "}
                  (NMLS #<span className="tnum">{nmls}</span>)
                </>
              ) : null}{" "}
              and honors opt-outs automatically.
            </p>
          </div>
        ) : null}

        {!emailBody && !smsBody ? (
          <div className="rounded-card border border-dashed border-strong bg-surface px-4 py-8 text-center">
            <p className="text-body font-semibold text-primary">Nothing to preview yet</p>
            <p className="mx-auto mt-1 max-w-sm text-small text-secondary">
              Write email or text content on the campaign — or attach a template — and
              the preview shows it here exactly as the recipient would see it.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
