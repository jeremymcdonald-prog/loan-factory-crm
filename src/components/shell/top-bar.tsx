"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, ChevronDown, LogOut, UserCircle } from "lucide-react";
import { logout } from "@/app/login/actions";
import { ROLE_LABELS } from "@/lib/roles";
import { cn } from "@/lib/cn";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

export function TopBar({
  fullName,
  email,
  role,
  tenantName,
}: {
  fullName: string;
  email: string;
  role: string;
  tenantName: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-subtle bg-surface px-5 sm:px-6">
      {/* Search. The affordance is real — Enter runs a People search. Full-text
          command search lands later; nothing here is faked. */}
      <div className="flex-1">
        <div className="relative hidden max-w-md sm:block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search people and opportunities"
            aria-label="Search people and opportunities"
            className="h-10 w-full rounded-control border border-subtle bg-sunken pl-9 pr-3 text-body text-primary placeholder:text-muted transition-colors focus:border-brand focus:bg-surface focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const q = (e.target as HTMLInputElement).value.trim();
                if (q) window.location.href = `/people?q=${encodeURIComponent(q)}`;
              }
            }}
          />
        </div>
      </div>

      <div className="relative pl-1" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          className={cn(
            "flex items-center gap-2.5 rounded-control border border-transparent py-1 pl-1 pr-1.5 transition-colors hover:border-subtle hover:bg-sunken",
            open && "border-subtle bg-sunken",
          )}
        >
          <span className="grid size-9 place-items-center rounded-full bg-action text-small font-semibold text-action-fg">
            {initials(fullName)}
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-small font-semibold text-primary">{fullName}</span>
            <span className="block text-micro text-muted">{ROLE_LABELS[role] ?? role}</span>
          </span>
          <ChevronDown
            className={cn("size-4 text-muted transition-transform", open && "rotate-180")}
            aria-hidden
          />
        </button>

        {open ? (
          <div
            role="menu"
            className="absolute right-0 top-full z-40 mt-1.5 w-64 rounded-card border border-subtle bg-surface p-1 shadow-e3"
          >
            <div className="border-b border-subtle px-3 py-2.5">
              <p className="truncate text-small font-semibold text-primary">{fullName}</p>
              <p className="truncate text-small text-muted">{email}</p>
              <p className="mt-1 text-micro text-muted">
                {tenantName} · {ROLE_LABELS[role] ?? role}
              </p>
            </div>
            <Link
              href="/settings/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-control px-3 py-2 text-left text-small text-secondary hover:bg-sunken hover:text-primary"
            >
              <UserCircle className="size-4" aria-hidden />
              My profile
            </Link>
            <form action={logout}>
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center gap-2 rounded-control px-3 py-2 text-left text-small text-secondary hover:bg-sunken hover:text-primary"
              >
                <LogOut className="size-4" aria-hidden />
                Sign out
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </header>
  );
}
