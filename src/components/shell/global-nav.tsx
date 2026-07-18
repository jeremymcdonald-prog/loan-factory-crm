"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import { Wordmark } from "@/components/brand/logo";
import { cn } from "@/lib/cn";

/**
 * GlobalNav — the dark navy rail of Loan Factory IQ.
 *
 * Action-based, not feature-based (D-03). The active item reads as a clean
 * orange accent, not a brown wash: a cool navy lift for the fill, a bright
 * full-strength orange rail, an orange icon, and a near-white label. Orange
 * carries no small text here, so it sits well above the 3:1 non-text bar
 * (6.04:1 on navy) while the label reads at 15:1.
 *
 * A hairline divides the daily book of business (Today…Conversations) from the
 * amplifiers (Marketing…Team) so the ten items read as two clear groups.
 */
export function GlobalNav({ approvalCount = 0 }: { approvalCount?: number }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="flex h-full w-[236px] shrink-0 flex-col bg-sidebar text-sidebar-fg-muted"
    >
      <div className="flex h-16 items-center overflow-hidden pl-5 pr-7">
        {/* The logo is the brand anchor; the "CRM" tag would only crowd it here
            (it stays in the tab title and on the sign-in screen). */}
        <Wordmark onDark size="lg" showProduct={false} />
      </div>

      <ul className="flex-1 space-y-px px-3 pb-3 pt-1">
        {NAV_ITEMS.map((item, i) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              {/* The book of business, then the amplifiers. */}
              {i === 5 ? (
                <hr className="mx-2 my-2 border-0 border-t border-sidebar-border" />
              ) : null}
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-3 rounded-control py-2.5 pl-3.5 pr-3 transition-colors",
                  active
                    ? "bg-sidebar-active text-sidebar-fg"
                    : "hover:bg-sidebar-hover hover:text-sidebar-fg",
                )}
              >
                {active ? (
                  <span
                    aria-hidden
                    className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-brand"
                  />
                ) : null}
                <Icon
                  className={cn(
                    "size-[18px] shrink-0",
                    active ? "text-brand" : "text-sidebar-fg-muted",
                  )}
                  strokeWidth={active ? 2.25 : 1.75}
                  aria-hidden
                />
                <span className="flex-1 truncate text-label font-semibold uppercase tracking-[0.06em]">
                  {item.label}
                </span>
                {item.href === "/today" && approvalCount > 0 ? (
                  <span className="tnum rounded-full bg-brand px-1.5 py-0.5 text-micro font-semibold text-white">
                    {approvalCount}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="border-t border-sidebar-border px-6 py-4 text-micro leading-4 text-sidebar-fg-dim">
        Loan Factory · NMLS #320841
        <br />
        Equal Housing Opportunity
      </p>
    </nav>
  );
}
