"use client";

/**
 * Bio & Online Presence — the Partner record's version of the People panel.
 *
 * Same behavior, same generator (src/lib/bio/mock.ts), same validator
 * (src/lib/bio/validate.ts), same honesty copy as people/[id]/bio-panel.tsx —
 * only the server actions and the id field name (`partnerId`) differ, because
 * a partner's bio lives on a different table with its own scoped actions.
 */
import { useActionState, useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Pencil,
  RotateCcw,
  Check,
  X,
  Plus,
  Trash2,
  Info,
  Globe,
  Link2,
  ExternalLink,
} from "lucide-react";
import {
  savePartnerBio,
  draftPartnerBioWithAi,
  acceptPartnerBioDraft,
  savePartnerSocialLinks,
  type TouchState,
  type DraftPartnerBioState,
  type AcceptPartnerBioState,
} from "./actions";
import type { BioDraft } from "@/lib/bio/mock";
import type { SocialLinks, BioSource } from "@/db/schema";
import { Card, SectionLabel } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { absoluteTime } from "@/lib/format";
import { cn } from "@/lib/cn";

type PlatformKey = "facebook" | "instagram" | "tiktok" | "linkedin" | "youtube" | "website";

const PLATFORMS: { key: PlatformKey; label: string; mark: string; placeholder: string }[] = [
  { key: "facebook", label: "Facebook", mark: "f", placeholder: "https://facebook.com/…" },
  { key: "instagram", label: "Instagram", mark: "IG", placeholder: "https://instagram.com/…" },
  { key: "tiktok", label: "TikTok", mark: "TT", placeholder: "https://tiktok.com/@…" },
  { key: "linkedin", label: "LinkedIn", mark: "in", placeholder: "https://linkedin.com/in/…" },
  { key: "youtube", label: "YouTube", mark: "YT", placeholder: "https://youtube.com/@…" },
  { key: "website", label: "Website", mark: "", placeholder: "https://…" },
];

function buildLinkDrafts(links: SocialLinks): Record<PlatformKey, string> {
  return {
    facebook: links.facebook ?? "",
    instagram: links.instagram ?? "",
    tiktok: links.tiktok ?? "",
    linkedin: links.linkedin ?? "",
    youtube: links.youtube ?? "",
    website: links.website ?? "",
  };
}

/** "facebook.com/jane.doe" instead of the full https://… — easier to scan. */
function displayHost(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    const path = u.pathname !== "/" ? u.pathname : "";
    return `${host}${path}`;
  } catch {
    return url;
  }
}

/** A small monochrome mark — lucide-react ships no brand icons for these
 * platforms, so each chip pairs a plain letterform with a visible text label
 * next to it, never standing alone. */
function PlatformMark({ platform, active }: { platform: PlatformKey; active: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-md border text-micro font-bold uppercase tracking-wide",
        active
          ? "border-action-tint-border bg-action-tint text-action"
          : "border-subtle bg-sunken text-muted",
      )}
    >
      {platform === "website" ? <Globe className="size-4" aria-hidden /> : PLATFORMS.find((p) => p.key === platform)?.mark}
    </span>
  );
}

export function BioPanel({
  partnerId,
  bio,
  socialLinks,
  bioResearchedAt,
  bioSources,
}: {
  partnerId: string;
  bio: string | null;
  socialLinks: SocialLinks;
  /** ISO string — formatted client-side so no Date crosses the RSC boundary. */
  bioResearchedAt: string | null;
  bioSources: BioSource[];
}) {
  // --- Manual bio -------------------------------------------------------------
  const [bioState, bioFormAction, savingBio] = useActionState<TouchState, FormData>(
    savePartnerBio,
    {},
  );

  // --- Draft-with-AI preview ---------------------------------------------------
  const [draftState, draftFormAction, drafting] = useActionState<DraftPartnerBioState, FormData>(
    draftPartnerBioWithAi,
    { seed: 0 },
  );
  const [acceptState, acceptFormAction, accepting] = useActionState<
    AcceptPartnerBioState,
    FormData
  >(acceptPartnerBioDraft, {});

  const [draft, setDraft] = useState<BioDraft | null>(null);
  const [editingDraft, setEditingDraft] = useState(false);
  const [showLinkPrompt, setShowLinkPrompt] = useState(false);

  // Sync a freshly-generated draft into local (editable, rejectable) state.
  // Guarded by a ref of the last draft object we've already applied, so this
  // only fires once per new draft — the same settle-on-change shape as the
  // submitted-transition effects below.
  const lastAppliedDraft = useRef<BioDraft | undefined>(undefined);
  useEffect(() => {
    if (draftState.draft && draftState.draft !== lastAppliedDraft.current) {
      lastAppliedDraft.current = draftState.draft;
      setDraft(draftState.draft);
      setEditingDraft(false);
      setShowLinkPrompt(false);
    }
  }, [draftState.draft]);

  const acceptSubmitted = useRef(false);
  useEffect(() => {
    if (accepting) {
      acceptSubmitted.current = true;
      return;
    }
    if (acceptSubmitted.current && !acceptState.error) {
      acceptSubmitted.current = false;
      setShowLinkPrompt(true);
    }
  }, [accepting, acceptState.error]);

  function rejectDraft() {
    setDraft(null);
    setEditingDraft(false);
    setShowLinkPrompt(false);
  }

  function dismissLinkPrompt() {
    setDraft(null);
    setShowLinkPrompt(false);
  }

  // --- Social / website links ---------------------------------------------------
  const [linksState, linksFormAction, savingLinks] = useActionState<TouchState, FormData>(
    savePartnerSocialLinks,
    {},
  );
  const [editingLinks, setEditingLinks] = useState(false);
  const [linkDrafts, setLinkDrafts] = useState<Record<PlatformKey, string>>(() =>
    buildLinkDrafts(socialLinks),
  );
  const [otherLinks, setOtherLinks] = useState<{ label: string; url: string }[]>(
    socialLinks.other ?? [],
  );

  function openLinkEditor() {
    setLinkDrafts(buildLinkDrafts(socialLinks));
    setOtherLinks(socialLinks.other ?? []);
    setEditingLinks(true);
  }

  function applySuggestedLink(key: PlatformKey, value: string) {
    const base = editingLinks ? linkDrafts : buildLinkDrafts(socialLinks);
    setLinkDrafts({ ...base, [key]: value });
    if (!editingLinks) setOtherLinks(socialLinks.other ?? []);
    setEditingLinks(true);
  }

  function applyAllSuggestedLinks() {
    if (!draft) return;
    const base = editingLinks ? linkDrafts : buildLinkDrafts(socialLinks);
    const merged = { ...base };
    for (const p of PLATFORMS) {
      const suggested = draft.suggestedLinks[p.key];
      if (suggested && !merged[p.key]) merged[p.key] = suggested;
    }
    setLinkDrafts(merged);
    if (!editingLinks) setOtherLinks(socialLinks.other ?? []);
    setEditingLinks(true);
  }

  const linksSubmitted = useRef(false);
  useEffect(() => {
    if (savingLinks) {
      linksSubmitted.current = true;
      return;
    }
    if (linksSubmitted.current && !linksState.error) {
      linksSubmitted.current = false;
      setEditingLinks(false);
    }
  }, [savingLinks, linksState.error]);

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-subtle px-4 py-3">
        <h2 className="text-h3 font-semibold text-primary">Bio &amp; Online Presence</h2>
        <span className="text-small text-muted tnum">
          {bioResearchedAt
            ? `Last researched ${absoluteTime(bioResearchedAt)}`
            : "Never researched"}
        </span>
      </div>

      {/* --- Bio text ------------------------------------------------------- */}
      <div className="space-y-3 border-b border-subtle p-4">
        <SectionLabel>Bio</SectionLabel>

        <form action={bioFormAction} className="space-y-2">
          <input type="hidden" name="partnerId" value={partnerId} />
          <label htmlFor="partner-bio-text" className="sr-only">
            Bio
          </label>
          <Textarea
            key={bio ?? "__empty__"}
            id="partner-bio-text"
            name="bio"
            rows={3}
            defaultValue={bio ?? ""}
            placeholder="No bio yet — write one, or draft one with AI below."
          />
          {bioState.error ? (
            <p role="alert" className="text-small text-critical">
              {bioState.error}
            </p>
          ) : null}
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={savingBio}>
              {savingBio ? "Saving…" : "Save bio"}
            </Button>
          </div>
        </form>

        {!draft ? (
          <div className="rounded-card border border-subtle bg-sunken p-3">
            <form action={draftFormAction}>
              <input type="hidden" name="partnerId" value={partnerId} />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-small text-secondary">
                  Runs a local demo generator — nothing is searched online, and nothing
                  saves until you approve it.
                </p>
                <Button type="submit" size="sm" variant="secondary" disabled={drafting}>
                  <Sparkles className="size-4" aria-hidden />
                  {drafting ? "Drafting…" : "Draft bio with AI"}
                </Button>
              </div>
            </form>
            {draftState.error ? (
              <p role="alert" className="mt-2 text-small text-critical">
                {draftState.error}
              </p>
            ) : null}
          </div>
        ) : showLinkPrompt ? (
          <div className="space-y-3 rounded-card border border-healthy-border bg-healthy-bg p-3">
            <p className="text-small font-semibold text-healthy">
              Bio saved. Want to add any of the links this demo draft suggested?
            </p>
            <ul className="space-y-1.5">
              {PLATFORMS.filter((p) => draft.suggestedLinks[p.key]).map((p) => (
                <li key={p.key} className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-small text-secondary">
                    {p.label}: {draft.suggestedLinks[p.key]}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => applySuggestedLink(p.key, draft.suggestedLinks[p.key] ?? "")}
                  >
                    Use this
                  </Button>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" variant="secondary" onClick={applyAllSuggestedLinks}>
                Add all to link editor
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={dismissLinkPrompt}>
                No thanks
              </Button>
            </div>
            <p className="text-micro text-muted">
              These are demo handles, not verified profiles — nothing saves here until
              you review them in the link editor below and click Save links.
            </p>
          </div>
        ) : (
          <form action={acceptFormAction} className="space-y-3 rounded-card border border-ai-border bg-ai-bg p-3">
            <input type="hidden" name="partnerId" value={partnerId} />
            <input type="hidden" name="sourcesJson" value={JSON.stringify(draft.sources)} readOnly />

            <div className="flex gap-2">
              <Info className="mt-0.5 size-4 shrink-0 text-ai" aria-hidden />
              <p className="text-small text-ai">
                Demo draft — no web search is connected. When a search provider is added,
                it will look only at public sources (name, company, email domain, role,
                city) and you&rsquo;ll still review and approve every line before it&rsquo;s
                saved.
              </p>
            </div>

            {editingDraft ? (
              <Textarea
                name="bio"
                rows={4}
                defaultValue={draft.bio}
                autoFocus
                className="bg-surface"
              />
            ) : (
              <>
                <p className="whitespace-pre-wrap text-body text-primary">{draft.bio}</p>
                <input type="hidden" name="bio" value={draft.bio} readOnly />
              </>
            )}

            {draft.sources.length ? (
              <p className="text-micro text-muted">
                Cites: {draft.sources.map((s) => s.label).join(" · ")} — demo sources, not
                fetched.
              </p>
            ) : null}

            {acceptState.error ? (
              <p role="alert" className="text-small text-critical">
                {acceptState.error}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" formAction={acceptFormAction} size="sm" variant="primary" disabled={accepting}>
                <Check className="size-4" aria-hidden />
                {accepting ? "Saving…" : "Accept"}
              </Button>
              {!editingDraft ? (
                <Button type="button" size="sm" variant="secondary" onClick={() => setEditingDraft(true)}>
                  <Pencil className="size-4" aria-hidden />
                  Edit
                </Button>
              ) : null}
              <Button type="submit" formAction={draftFormAction} size="sm" variant="secondary" disabled={drafting}>
                <RotateCcw className="size-4" aria-hidden />
                {drafting ? "Drafting…" : "Regenerate"}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={rejectDraft}>
                <X className="size-4" aria-hidden />
                Reject
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* --- Social & website links ------------------------------------------ */}
      <div className="space-y-3 border-b border-subtle p-4">
        <div className="flex items-center justify-between">
          <SectionLabel>Online presence</SectionLabel>
          {!editingLinks ? (
            <button
              type="button"
              onClick={openLinkEditor}
              className="text-small font-semibold text-action hover:underline"
            >
              Edit links
            </button>
          ) : null}
        </div>

        {!editingLinks ? (
          <ul className="space-y-2">
            {PLATFORMS.map((p) => {
              const url = socialLinks[p.key];
              return (
                <li key={p.key} className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <PlatformMark platform={p.key} active={Boolean(url)} />
                    <span className="text-body font-medium text-primary">{p.label}</span>
                  </span>
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-w-0 max-w-[60%] items-center gap-1 text-small font-medium text-action hover:underline"
                    >
                      <span className="truncate">{displayHost(url)}</span>
                      <ExternalLink className="size-3.5 shrink-0" aria-hidden />
                    </a>
                  ) : (
                    <span className="text-small text-muted">Not added</span>
                  )}
                </li>
              );
            })}
            {(socialLinks.other ?? []).map((entry, i) => (
              <li key={`other-${i}`} className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2.5">
                  <span
                    aria-hidden
                    className="grid size-7 shrink-0 place-items-center rounded-md border border-action-tint-border bg-action-tint text-action"
                  >
                    <Link2 className="size-4" aria-hidden />
                  </span>
                  <span className="truncate text-body font-medium text-primary">
                    {entry.label}
                  </span>
                </span>
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-w-0 max-w-[60%] items-center gap-1 text-small font-medium text-action hover:underline"
                >
                  <span className="truncate">{displayHost(entry.url)}</span>
                  <ExternalLink className="size-3.5 shrink-0" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <form action={linksFormAction} className="space-y-3">
            <input type="hidden" name="partnerId" value={partnerId} />
            <input type="hidden" name="otherJson" value={JSON.stringify(otherLinks)} readOnly />

            <div className="grid gap-3 sm:grid-cols-2">
              {PLATFORMS.map((p) => (
                <Field key={p.key} label={p.label} htmlFor={`partner-link-${p.key}`}>
                  <Input
                    id={`partner-link-${p.key}`}
                    name={p.key}
                    value={linkDrafts[p.key]}
                    onChange={(e) => setLinkDrafts({ ...linkDrafts, [p.key]: e.target.value })}
                    placeholder={p.placeholder}
                    autoComplete="off"
                  />
                </Field>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-label font-semibold uppercase tracking-wide text-muted">
                Additional links
              </p>
              {otherLinks.map((row, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Input
                    value={row.label}
                    onChange={(e) => {
                      const next = [...otherLinks];
                      next[i] = { ...next[i], label: e.target.value };
                      setOtherLinks(next);
                    }}
                    placeholder="Label (e.g. Yelp)"
                    autoComplete="off"
                    className="w-32 shrink-0"
                  />
                  <Input
                    value={row.url}
                    onChange={(e) => {
                      const next = [...otherLinks];
                      next[i] = { ...next[i], url: e.target.value };
                      setOtherLinks(next);
                    }}
                    placeholder="https://…"
                    autoComplete="off"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    aria-label="Remove link"
                    onClick={() => setOtherLinks(otherLinks.filter((_, idx) => idx !== i))}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setOtherLinks([...otherLinks, { label: "", url: "" }])}
              >
                <Plus className="size-4" aria-hidden />
                Add another link
              </Button>
            </div>

            {linksState.error ? (
              <p role="alert" className="text-small text-critical">
                {linksState.error}
              </p>
            ) : null}

            <div className="flex items-center gap-2">
              <Button type="submit" size="sm" variant="primary" disabled={savingLinks}>
                {savingLinks ? "Saving…" : "Save links"}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setEditingLinks(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* --- Sources ---------------------------------------------------------- */}
      <div className="p-4">
        <SectionLabel>Sources</SectionLabel>
        {bioSources.length ? (
          <>
            <ul className="mt-2 space-y-1.5">
              {bioSources.map((s, i) => (
                <li key={i} className="text-small text-secondary">
                  {s.url ? (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-action hover:underline"
                    >
                      {s.label}
                    </a>
                  ) : (
                    <span className="font-medium text-primary">{s.label}</span>
                  )}
                  {s.note ? <span className="text-muted"> — {s.note}</span> : null}
                </li>
              ))}
            </ul>
            <p className="mt-1.5 text-micro text-muted">
              Cited by the last accepted demo draft — not independently verified.
            </p>
          </>
        ) : (
          <p className="mt-1 text-small text-muted">
            No sources yet — draft a bio with AI to see what a demo draft would cite.
          </p>
        )}
      </div>
    </Card>
  );
}
