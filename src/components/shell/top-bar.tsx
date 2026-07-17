"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, LogOut } from "lucide-react";
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
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-subtle bg-surface px-4">
      {/* CommandBar lands in Phase 2; the affordance is not faked here. */}
      <div className="flex-1">
        <div className="relative hidden max-w-md sm:block">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-disabled"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search people and opportunities"
            aria-label="Search people and opportunities"
            className="h-8 w-full rounded-md border border-subtle bg-sunken pl-8 pr-3 text-small text-primary placeholder:text-disabled focus:border-action focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const q = (e.target as HTMLInputElement).value.trim();
                if (q) window.location.href = `/people?q=${encodeURIComponent(q)}`;
              }
            }}
          />
        </div>
      </div>

      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          className={cn(
            "flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-raised",
            open && "bg-raised",
          )}
        >
          <span className="grid size-7 place-items-center rounded-full bg-action text-label font-semibold text-action-fg">
            {initials(fullName)}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-small font-semibold leading-4 text-primary">
              {fullName}
            </span>
            <span className="block text-micro leading-3 text-muted">
              {ROLE_LABELS[role] ?? role}
            </span>
          </span>
          <ChevronDown className="size-4 text-muted" aria-hidden />
        </button>

        {open ? (
          <div
            role="menu"
            className="absolute right-0 top-full z-40 mt-1 w-60 rounded-lg border border-subtle bg-raised p-1 shadow-e3"
          >
            <div className="border-b border-subtle px-3 py-2">
              <p className="truncate text-small font-semibold text-primary">{fullName}</p>
              <p className="truncate text-small text-muted">{email}</p>
              <p className="mt-1 text-micro text-muted">
                {tenantName} · {ROLE_LABELS[role] ?? role}
              </p>
            </div>
            <form action={logout}>
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-small text-secondary hover:bg-surface hover:text-primary"
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
