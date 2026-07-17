import type { Metadata } from "next";
import Link from "next/link";
import { MonitorPlay } from "lucide-react";
import { requireUser, queryAs } from "@/lib/auth";
import { canManageUsers } from "@/lib/roles";
import {
  VIDEO_CATEGORIES,
  listVideos,
  countVideosByCategory,
  type VideoListRow,
} from "@/lib/queries/videos";
import { PageHeader } from "@/components/shell/page-header";
import { Card, SectionLabel } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { SearchBar } from "./search-bar";
import { AddVideoButton } from "./add-video-button";
import { AdminControls } from "./admin-controls";
import { WatchButton } from "./watch-button";

export const metadata: Metadata = { title: "How To Videos" };
export const dynamic = "force-dynamic";

const CATEGORIES = [...VIDEO_CATEGORIES];

function minutesLabel(seconds: number | null): string | null {
  if (!seconds) return null;
  return `${Math.max(1, Math.round(seconds / 60))} min`;
}

function VideoCard({
  video,
  isAdmin,
  isFirst,
  isLast,
  showReorder,
}: {
  video: VideoListRow;
  isAdmin: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  showReorder?: boolean;
}) {
  const duration = minutesLabel(video.durationSeconds);
  const pct = Math.min(100, Math.max(0, video.progressPct));

  return (
    <Card as="article" className="flex flex-col overflow-hidden">
      {/* No recordings exist yet, so this placeholder IS the thumbnail —
          never an <img> pointing at a made-up URL. */}
      <div className="relative grid aspect-video place-items-center border-b border-subtle bg-sunken">
        <MonitorPlay className="size-8 text-muted" aria-hidden />
        {!video.published ? (
          <Badge tone="neutral" className="absolute left-2 top-2">
            Unpublished
          </Badge>
        ) : null}
        {!video.url ? (
          <Badge tone="neutral" className="absolute bottom-2 right-2">
            Video coming soon
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 text-body font-semibold text-primary">{video.title}</h3>
          {video.watchedAt ? (
            <Badge tone="healthy" className="shrink-0">
              Watched
            </Badge>
          ) : null}
        </div>

        {video.description ? (
          <p className="line-clamp-2 text-small text-secondary">{video.description}</p>
        ) : null}

        <div className="mt-auto space-y-2 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{video.category}</Badge>
            {duration ? <span className="text-small text-muted tnum">{duration}</span> : null}
          </div>

          {/* Progress placeholder — honest zeros until real playback exists. */}
          <div>
            <div className="h-1 overflow-hidden rounded bg-sunken">
              <div
                className="h-1 rounded bg-brand"
                style={{ width: `${pct}%` }}
                aria-hidden
              />
            </div>
            <p className="mt-1 text-micro text-muted tnum">
              {pct > 0 ? `${pct}% watched` : "Not started"}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <WatchButton videoId={video.id} url={video.url} title={video.title} />
            {isAdmin ? (
              <AdminControls
                video={{
                  id: video.id,
                  title: video.title,
                  description: video.description,
                  category: video.category,
                  durationSeconds: video.durationSeconds,
                  url: video.url,
                  featured: video.featured,
                  published: video.published,
                }}
                categories={CATEGORIES}
                isFirst={isFirst ?? true}
                isLast={isLast ?? true}
                showReorder={showReorder ?? false}
              />
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category = "all" } = await searchParams;
  const user = await requireUser();
  const isAdmin = canManageUsers(user.role);

  const { rows, counts } = await queryAs(user, async (db) => {
    // Sequential on purpose: one client, one transaction.
    const list = await listVideos(db, user, { q, category });
    const byCategory = await countVideosByCategory(db, user);
    return { rows: list, counts: byCategory };
  });

  const featured = rows.filter((v) => v.featured && v.published);
  const recent = [...rows]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 4);

  const chipHref = (key: string) =>
    key === "all"
      ? `/videos${q ? `?q=${encodeURIComponent(q)}` : ""}`
      : `/videos?category=${encodeURIComponent(key)}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  const chips = [
    { key: "all", label: "All", count: counts.all ?? 0 },
    ...CATEGORIES.filter((c) => (counts[c] ?? 0) > 0).map((c) => ({
      key: c,
      label: c,
      count: counts[c] ?? 0,
    })),
  ];

  return (
    <>
      <PageHeader
        title="How To Videos"
        subtitle="Short walkthroughs of every part of the CRM."
        action={isAdmin ? <AddVideoButton categories={CATEGORIES} /> : null}
      />

      <div className="px-4 py-4 sm:px-6">
        {/* Filters. Search is a GET form so it works without JavaScript. */}
        <div className="flex flex-wrap items-center gap-2">
          <nav className="flex flex-wrap gap-1" aria-label="Filter by category">
            {chips.map((chip) => {
              const active = category === chip.key;
              return (
                <Link
                  key={chip.key}
                  href={chipHref(chip.key)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-small font-semibold transition-colors",
                    active
                      ? "bg-action text-action-fg"
                      : "text-secondary hover:bg-sunken hover:text-primary",
                  )}
                >
                  {chip.label}
                  <span
                    className={cn("tnum text-micro", active ? "opacity-80" : "text-muted")}
                  >
                    {chip.count}
                  </span>
                </Link>
              );
            })}
          </nav>

          <SearchBar q={q} category={category} />
        </div>

        {rows.length === 0 ? (
          <div className="mt-4 rounded-card border border-subtle bg-surface px-6 py-14 text-center">
            <MonitorPlay className="mx-auto size-6 text-disabled" aria-hidden />
            <p className="mt-3 text-h3 font-semibold text-primary">
              {q || category !== "all"
                ? "Nothing matches — try another word or category"
                : "No videos yet"}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-body text-secondary">
              {q || category !== "all"
                ? "Clear the search or pick a different category."
                : isAdmin
                  ? "Add the first walkthrough with the button above."
                  : "Walkthroughs will appear here as they are added."}
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-8">
            {featured.length > 0 ? (
              <section aria-label="Featured videos">
                <SectionLabel>Featured</SectionLabel>
                <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {featured.map((v) => (
                    <VideoCard key={`featured-${v.id}`} video={v} isAdmin={isAdmin} />
                  ))}
                </div>
              </section>
            ) : null}

            {recent.length > 0 ? (
              <section aria-label="Recently added videos">
                <SectionLabel>Recently added</SectionLabel>
                <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {recent.map((v) => (
                    <VideoCard key={`recent-${v.id}`} video={v} isAdmin={isAdmin} />
                  ))}
                </div>
              </section>
            ) : null}

            {CATEGORIES.map((cat) => {
              const group = rows.filter((v) => v.category === cat);
              if (group.length === 0) return null; // Empty categories are simply omitted.
              return (
                <section key={cat} aria-label={`${cat} videos`}>
                  <SectionLabel>{cat}</SectionLabel>
                  <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {group.map((v, i) => (
                      <VideoCard
                        key={v.id}
                        video={v}
                        isAdmin={isAdmin}
                        isFirst={i === 0}
                        isLast={i === group.length - 1}
                        showReorder
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
