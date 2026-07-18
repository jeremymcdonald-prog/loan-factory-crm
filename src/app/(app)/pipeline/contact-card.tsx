/**
 * ContactCard — a lead-type person with no file yet, on the Leads board.
 *
 * Same visual grammar as LoanCard (components/crm/loan-card.tsx): the person,
 * what we know, and when they last moved. It links to the person record —
 * there is no opportunity to open yet.
 */
import Link from "next/link";
import { relativeTime } from "@/lib/format";
import type { LeadOnlyContact } from "@/lib/queries/pipeline";
import { LanguageBadge } from "@/components/crm/language-badge";
import { channelLabel } from "./views";

export function ContactCard({ contact, now }: { contact: LeadOnlyContact; now: Date }) {
  return (
    <Link
      href={`/people/${contact.personId}`}
      className="block rounded-md border border-subtle bg-surface p-2.5 transition-colors hover:border-strong"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-body font-semibold text-primary">
            {contact.firstName} {contact.lastName}
          </span>
          <LanguageBadge language={contact.preferredLanguage} />
        </span>
      </div>

      <p className="mt-0.5 truncate text-small text-muted">
        {contact.leadChannel ? channelLabel(contact.leadChannel) : "No file yet"}
      </p>

      <p className="mt-1.5 text-small text-muted tnum">
        {relativeTime(contact.updatedAt, now)}
      </p>
    </Link>
  );
}
