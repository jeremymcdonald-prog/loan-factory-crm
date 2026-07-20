/**
 * A summary of the user's AI persona, on the My Profile page. The rich
 * manager — instructions, tone, prefer/avoid words, compliance boundaries,
 * a sample of your writing, and "Test persona" — now lives at
 * /settings/ai/persona; this card stays here as a quick-glance summary and a
 * link, so profile/page.tsx doesn't need to change.
 *
 * `PersonaView` intentionally stays the exact shape profile/page.tsx already
 * builds (filename/sizeBytes/status/extractedText/error/enabled/updatedAt) —
 * this file is not the owner of the richer fields (instructions, tone,
 * preferWords, avoidWords, complianceNotes, sampleText); see
 * src/app/(app)/settings/ai/persona/persona-manager.tsx for those.
 */
import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { relativeTime } from "@/lib/format";

export type PersonaView = {
  filename: string | null;
  sizeBytes: number | null;
  status: "ready" | "failed";
  extractedText: string | null;
  error: string | null;
  enabled: boolean;
  updatedAt: string;
};

export function PersonaSection({ persona }: { persona: PersonaView | null }) {
  return (
    <Link
      href="/settings/ai/persona"
      className="flex items-center gap-3 rounded-card border border-subtle bg-surface px-4 py-3.5 transition-colors hover:bg-sunken"
    >
      <FileText className="size-5 shrink-0 text-muted" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-primary">
          {persona?.filename ?? (persona ? "Instructions only" : "Not set up yet")}
        </p>
        <p className="text-small text-muted">
          {persona ? (
            <>
              {persona.status === "failed" ? (
                <>Couldn&apos;t read the document · </>
              ) : null}
              Updated {relativeTime(persona.updatedAt)}
            </>
          ) : (
            "Teach the assistant to write like you — tone, words to prefer or avoid, and more."
          )}
        </p>
      </div>
      {persona ? (
        persona.status === "failed" ? (
          <Badge tone="critical">Couldn&apos;t read</Badge>
        ) : persona.enabled ? (
          <Badge tone="ai">In use</Badge>
        ) : (
          <Badge tone="neutral">Disabled</Badge>
        )
      ) : null}
      <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
    </Link>
  );
}
