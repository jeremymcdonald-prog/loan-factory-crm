"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import { Wordmark } from "@/components/brand/logo";
import { cn } from "@/lib/cn";

/**
 * GlobalNav — the dark navy rail of Loan Factory IQ.
 *
 * Action-based, not feature-based (D-03). The active item is the brand orange
 * at full strength: a solid left rail plus a soft orange wash, with the label
 * in near-white. Orange carries no text here, so it sits comfortably above the
 * 3:1 bar for non-text UI (6.04:1 on navy) while the label itself reads at
 * 15:1.
 */
export function GlobalNav({ approvalCount = 0 }: { approvalCount?: number }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="flex h-full w-[224px] shrink-0 flex-col bg-sidebar text-sidebar-fg-muted"
    >
      <div className="flex h-16 items-center px-5">
        <Wordmark onDark />
      </div>

      <ul className="flex-1 space-y-0.5 px-3 py-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-3 rounded-control px-3 py-2.5 transition-colors",
                  active
                    ? "bg-sidebar-active text-sidebar-fg"
                    : "hover:bg-sidebar-hover hover:text-sidebar-fg",
                )}
              >
                {active ? (
                  <span
                    aria-hidden
                    className="absolute inset-y-1.5 -left-1 w-[3px] rounded-full bg-brand"
                  />
                ) : null}
                <Icon
                  className={cn("size-[18px] shrink-0", active && "text-brand")}
                  strokeWidth={active ? 2.25 : 1.75}
                  aria-hidden
                />
                {/* Uppercase with tracking — the Loan Factory IQ nav signature. */}
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

      <p className="border-t border-sidebar-border px-5 py-4 text-micro leading-4 text-sidebar-fg-dim">
        Loan Factory · NMLS #320841
        <br />
        Equal Housing Opportunity
      </p>
    </nav>
  );
}
