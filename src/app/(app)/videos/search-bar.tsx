"use client";

/**
 * Search box for the video library. A plain GET form, so it works without
 * JavaScript; the current category filter travels along as a hidden field.
 */
export function SearchBar({ q, category }: { q?: string; category: string }) {
  return (
    <form action="/videos" className="ml-auto" role="search">
      {category !== "all" ? <input type="hidden" name="category" value={category} /> : null}
      <input
        type="search"
        name="q"
        defaultValue={q ?? ""}
        placeholder="Search video titles and descriptions"
        aria-label="Search videos"
        className="h-8 w-64 max-w-full rounded-md border border-subtle bg-sunken px-3 text-small text-primary placeholder:text-disabled focus:border-action focus:outline-none"
      />
    </form>
  );
}
