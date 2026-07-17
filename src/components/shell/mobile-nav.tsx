"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Columns3, Users, Settings2 } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Mobile bottom bar — the responsive web layout's primary nav
 * (Information_Architecture §3.5). There is no native app; this IS the mobile
 * surface. Only the P1-live destinations appear.
 */
const MOBILE_ITEMS = [
  { href: "/today", label: "Today", icon: Sun },
  { href: "/pipeline", label: "Pipeline", icon: Columns3 },
  { href: "/people", label: "People", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-subtle bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid grid-cols-4">
        {MOBILE_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-1",
                  active ? "text-action" : "text-muted",
                )}
              >
                <Icon className="size-5" strokeWidth={2} aria-hidden />
                <span className="text-micro font-semibold">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
