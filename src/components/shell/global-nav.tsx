"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import { LogoMark } from "@/components/brand/logo";
import { cn } from "@/lib/cn";

/**
 * GlobalNav — the graphite sidebar, a brand constant in both themes
 * (Design_System §3). Action-based, not feature-based (D-03).
 */
export function GlobalNav({ approvalCount = 0 }: { approvalCount?: number }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="flex h-full w-[212px] shrink-0 flex-col bg-sidebar text-[#A8B3C2]"
    >
      <div className="flex h-14 items-center gap-2 px-4 text-[#E8EDF4]">
        <LogoMark className="text-[#4D8DFF]" />
        <span className="text-body font-semibold tracking-tight">
          Loan Factory<span className="ml-1 font-medium text-[#8593A6]">CRM</span>
        </span>
      </div>

      <ul className="flex-1 space-y-0.5 px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const live = item.phase === 1;
          const Icon = item.icon;

          const inner = (
            <>
              <Icon className="size-4 shrink-0" strokeWidth={2} aria-hidden />
              <span className="flex-1 truncate">{item.label}</span>
              {item.href === "/today" && approvalCount > 0 ? (
                <span className="tnum rounded bg-[#221A33] px-1.5 py-0.5 text-micro font-semibold text-[#A78BFA]">
                  {approvalCount}
                </span>
              ) : null}
              {!live ? (
                <span className="text-micro font-medium text-[#5A6675]">Phase {item.phase}</span>
              ) : null}
            </>
          );

          const base =
            "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-body transition-colors";

          return (
            <li key={item.href}>
              {live ? (
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    base,
                    active
                      ? "bg-[#152238] font-semibold text-[#E8EDF4]"
                      : "hover:bg-[#12161F] hover:text-[#E8EDF4]",
                  )}
                >
                  {inner}
                </Link>
              ) : (
                <span
                  aria-disabled
                  title={`${item.label} ships in Phase ${item.phase}`}
                  className={cn(base, "cursor-default text-[#5A6675]")}
                >
                  {inner}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <p className="border-t border-[#1A2029] px-4 py-3 text-micro leading-4 text-[#5A6675]">
        Loan Factory · NMLS #320841
        <br />
        Equal Housing Opportunity
      </p>
    </nav>
  );
}
