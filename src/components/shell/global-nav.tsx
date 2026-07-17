"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import { LogoMark } from "@/components/brand/logo";
import { cn } from "@/lib/cn";

/**
 * GlobalNav — the charcoal sidebar, a brand constant in both themes.
 * Action-based, not feature-based (D-03). The active item carries the Loan
 * Factory orange rail; orange is used here as a non-text accent, so it meets
 * the 3:1 bar while the label stays warm white.
 */
export function GlobalNav({ approvalCount = 0 }: { approvalCount?: number }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="flex h-full w-[212px] shrink-0 flex-col bg-sidebar text-sidebar-fg-muted"
    >
      <div className="flex h-14 items-center gap-2 px-4 text-sidebar-fg">
        <LogoMark className="text-brand" />
        <span className="text-body font-semibold tracking-tight">
          Loan Factory
          <span className="ml-1 font-medium text-sidebar-fg-muted">CRM</span>
        </span>
      </div>

      <ul className="flex-1 space-y-0.5 px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-body transition-colors",
                  active
                    ? "bg-sidebar-active font-semibold text-sidebar-fg"
                    : "hover:bg-sidebar-hover hover:text-sidebar-fg",
                )}
              >
                {active ? (
                  <span
                    aria-hidden
                    className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-brand"
                  />
                ) : null}
                <Icon className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                <span className="flex-1 truncate">{item.label}</span>
                {item.href === "/today" && approvalCount > 0 ? (
                  <span className="tnum rounded bg-ally-bg px-1.5 py-0.5 text-micro font-semibold text-ally">
                    {approvalCount}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="border-t border-sidebar-border px-4 py-3 text-micro leading-4 text-sidebar-fg-dim">
        Loan Factory · NMLS #320841
        <br />
        Equal Housing Opportunity
      </p>
    </nav>
  );
}
