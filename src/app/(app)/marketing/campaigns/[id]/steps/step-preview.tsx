"use client";

/**
 * Per-step preview — the same conventions as the campaign-level recipient
 * preview (../preview.tsx): desktop/mobile toggle, merge-field chips, and the
 * compliance footer, for the two recipient channels that carry a real
 * message (email, video). SMS gets its own bubble, same as the campaign
 * preview. Task and call steps are internal — nothing goes to the recipient,
 * so they get an honest "internal" card instead of a fake recipient view.
 *
 * Reuses `renderSignatureHtml` (src/lib/signature.ts) for the email/video
 * signature block, per M6 — the first real consumer of the HTML renderer;
 * every other surface so far has only used the plain-text one. The HTML is
 * built by that helper's own `escapeHtml`, not from raw user input, so
 * rendering it directly is safe.
 */
import { useState } from "react";
import { Bell, Mail, MessageSquare, Monitor, Smartphone, Video } from "lucide-react";
import { cn } from "@/lib/cn";
import { renderSignatureHtml, type SignatureProfile } from "@/lib/signature";
import { renderMergeFields } from "../../merge-fields";
import { campaignLanguageName } from "../../../vocabulary";
import { STEP_CHANNEL_INFO, type StepChannel } from "../../step-vocabulary";

export function StepPreview({
  channel,
  subject,
  body,
  language,
  senderName,
  nmls,
  signatureProfile,
}: {
  channel: StepChannel;
  subject: string;
  body: string;
  language: string;
  senderName: string;
  nmls: string | null;
  signatureProfile: SignatureProfile;
}) {
  const [mode, setMode] = useState<"desktop" | "mobile">("desktop");
  const info = STEP_CHANNEL_INFO[channel];

  if (!info.recipientFacing) {
    return (
      <div className="rounded-md border border-subtle bg-sunken px-3 py-2.5 text-small text-secondary">
        <p className="font-semibold text-primary">Internal — nothing is sent to the recipient</p>
        <p className="mt-1">{info.hint}</p>
        {subject ? <p className="mt-2 font-semibold text-primary">{renderMergeFields(subject)}</p> : null}
        {body ? (
          <p className="mt-1 whitespace-pre-wrap">{renderMergeFields(body)}</p>
        ) : (
          <p className="mt-1 text-muted">Nothing written yet.</p>
        )}
      </div>
    );
  }

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
    <div className={cn(mode === "mobile" && "mx-auto w-[375px] max-w-full")}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-small text-muted">
          Preview only — sending connects later. Merge fields are swapped for each
          recipient&rsquo;s real details at send time.
        </p>
        <div className="flex shrink-0 rounded-control border border-strong bg-surface p-0.5">
          {(
            [
              { m: "desktop" as const, icon: Monitor },
              { m: "mobile" as const, icon: Smartphone },
            ] as const
          ).map(({ m, icon: Icon }) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              aria-label={m === "desktop" ? "Desktop preview" : "Mobile preview"}
              className={cn(
                "inline-flex items-center gap-1 rounded-[5px] px-2 py-1 transition-colors",
                mode === m ? "bg-action text-action-fg" : "text-secondary hover:text-primary",
              )}
            >
              <Icon className="size-3.5" aria-hidden />
            </button>
          ))}
        </div>
      </div>

      {language !== "en" ? (
        <p className="mb-2 rounded-md border border-warning-border bg-warning-bg px-3 py-1.5 text-small font-semibold text-warning">
          Written in {campaignLanguageName(language)} — a human translation review is required
          before this sends.
        </p>
      ) : null}

      {channel === "email" || channel === "video" ? (
        <div className="overflow-hidden rounded-card border border-strong bg-surface shadow-e1">
          <div className="flex items-center gap-2 border-b border-subtle bg-sunken px-4 py-2.5">
            {channel === "video" ? (
              <Video className="size-3.5 shrink-0 text-muted" aria-hidden />
            ) : (
              <Mail className="size-3.5 shrink-0 text-muted" aria-hidden />
            )}
            <div className="min-w-0">
              <p className="text-small text-muted">{channel === "video" ? "Video title" : "Subject"}</p>
              <p className="truncate text-body font-semibold text-primary">
                {subject ? renderMergeFields(subject) : <span className="text-muted">(none yet)</span>}
              </p>
            </div>
          </div>
          <div className="space-y-4 p-4">
            {channel === "video" ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-md border border-subtle bg-sunken">
                <div className="grid h-full w-full place-items-center">
                  <div className="text-center">
                    <Video className="mx-auto size-6 text-disabled" aria-hidden />
                    <p className="mt-1 px-4 text-small text-muted">
                      Demo video attachment — no recording is stored, only the script below
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
            <p className="whitespace-pre-wrap text-small leading-5 text-secondary">
              {body ? (
                renderMergeFields(body)
              ) : (
                <span className="text-muted">Nothing written yet.</span>
              )}
            </p>
            <div
              className="text-small leading-5 text-secondary"
              // Built by renderSignatureHtml's own escapeHtml — not raw input.
              dangerouslySetInnerHTML={{ __html: renderSignatureHtml(signatureProfile) }}
            />
            {complianceFooter}
          </div>
        </div>
      ) : channel === "sms" ? (
        <div className="rounded-card border border-strong bg-surface p-4 shadow-e1">
          <p className="mb-2 flex items-center gap-1.5 text-small text-muted">
            <MessageSquare className="size-3.5" aria-hidden />
            Text message
          </p>
          <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-subtle bg-sunken px-3.5 py-2.5">
            <p className="whitespace-pre-wrap text-small leading-5 text-secondary">
              {body ? (
                renderMergeFields(body)
              ) : (
                <span className="text-muted">Nothing written yet.</span>
              )}
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
      ) : (
        <div className="rounded-card border border-strong bg-surface p-4 shadow-e1">
          <p className="mb-2 flex items-center gap-1.5 text-small text-muted">
            <Bell className="size-3.5" aria-hidden />
            {info.label}
          </p>
          <p className="whitespace-pre-wrap text-small leading-5 text-secondary">
            {body ? renderMergeFields(body) : <span className="text-muted">Nothing written yet.</span>}
          </p>
        </div>
      )}
    </div>
  );
}
