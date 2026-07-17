"use client";

import { useRef } from "react";
import { Search } from "lucide-react";

/**
 * Search and category, as one GET form.
 *
 * It is a plain form on purpose: typing and pressing Enter, or clicking Search,
 * works with no JavaScript at all. The one enhancement is that changing the
 * category submits straight away, because a filter that needs a second click to
 * take effect reads as broken.
 *
 * `key` on the select ties it to the URL: after navigating, the prop changes,
 * the select remounts, and the control can never drift from what's on screen.
 */
export function TemplateFilters({
  q,
  category,
  policy,
  categories,
}: {
  q: string;
  category: string;
  policy: string;
  categories: { category: string; count: number }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action="/marketing/templates"
      className="flex flex-1 flex-wrap items-center justify-end gap-2"
    >
      {/* Carries the policy tab through, so filters compose instead of fighting. */}
      <input type="hidden" name="policy" value={policy} />

      <label htmlFor="category" className="sr-only">
        Filter by category
      </label>
      <select
        key={category}
        id="category"
        name="category"
        defaultValue={category}
        onChange={() => formRef.current?.requestSubmit()}
        className="h-8 rounded-md border border-subtle bg-sunken px-2 pr-7 text-small text-primary focus:border-action focus:outline-none"
      >
        <option value="all">Every category</option>
        {categories.map((c) => (
          <option key={c.category} value={c.category}>
            {c.category} ({c.count})
          </option>
        ))}
      </select>

      <label htmlFor="template-search" className="sr-only">
        Search templates
      </label>
      <input
        key={q}
        id="template-search"
        type="search"
        name="q"
        defaultValue={q}
        placeholder="Search by name, ref, or category"
        className="h-8 w-56 rounded-md border border-subtle bg-sunken px-3 text-small text-primary placeholder:text-disabled focus:border-action focus:outline-none"
      />

      <button
        type="submit"
        className="inline-flex h-8 items-center gap-1.5 rounded-control border border-strong bg-surface px-2.5 text-small font-semibold text-primary hover:bg-sunken"
      >
        <Search className="size-3.5" aria-hidden />
        Search
      </button>
    </form>
  );
}
