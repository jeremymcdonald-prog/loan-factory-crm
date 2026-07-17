/**
 * How To Videos queries — the training library's read layer.
 *
 * Every query runs inside the caller's tenant context via queryAs(), so RLS
 * scopes the rows. Unpublished videos are visible only to administrators, and
 * watch state is always scoped to the signed-in user.
 */
import "server-only";
import { and, asc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import type { Db } from "@/db";
import { video, videoWatch } from "@/db/schema";
import { canManageUsers } from "@/lib/roles";
import type { CurrentUser } from "@/lib/auth";

/**
 * The fixed category list, in display order. It mirrors the product's own
 * navigation so the library reads like a tour of the CRM.
 */
export const VIDEO_CATEGORIES = [
  "Getting Started",
  "Today",
  "Pipeline",
  "People",
  "Partners",
  "Conversations",
  "Marketing",
  "Automations",
  "Intelligence",
  "Team",
  "Settings",
  "AI Assistant",
  "Custom AI Persona",
] as const;

export type VideoCategory = (typeof VIDEO_CATEGORIES)[number];

export type VideoListRow = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  durationSeconds: number | null;
  /** Null means the walkthrough has not been recorded yet — say so honestly. */
  url: string | null;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  createdAt: Date;
  /** The signed-in user's watch state; null when they have never watched it. */
  watchedAt: Date | null;
  progressPct: number;
};

export type VideoFilter = {
  q?: string;
  category?: string;
};

/** Unpublished videos exist only for admins; everyone else sees published. */
function publishedScope(user: CurrentUser) {
  return canManageUsers(user.role) ? undefined : eq(video.published, true);
}

export async function listVideos(
  db: Db,
  user: CurrentUser,
  filter: VideoFilter = {},
): Promise<VideoListRow[]> {
  const conditions = [isNull(video.deletedAt), publishedScope(user)].filter(Boolean);

  if (filter.q) {
    const term = `%${filter.q}%`;
    conditions.push(or(ilike(video.title, term), ilike(video.description, term)));
  }

  if (filter.category && filter.category !== "all") {
    conditions.push(eq(video.category, filter.category));
  }

  const rows = await db
    .select({
      id: video.id,
      title: video.title,
      description: video.description,
      category: video.category,
      durationSeconds: video.durationSeconds,
      url: video.url,
      featured: video.featured,
      published: video.published,
      sortOrder: video.sortOrder,
      createdAt: video.createdAt,
      watchedAt: videoWatch.watchedAt,
      progressPct: videoWatch.progressPct,
    })
    .from(video)
    // Watch state belongs to the signed-in user only — never anyone else's.
    .leftJoin(
      videoWatch,
      and(eq(videoWatch.videoId, video.id), eq(videoWatch.userId, user.userId)),
    )
    .where(and(...conditions))
    .orderBy(asc(video.sortOrder), asc(video.createdAt));

  return rows.map((r) => ({ ...r, progressPct: r.progressPct ?? 0 }));
}

/** Per-category counts for the filter chips, plus an `all` total. */
export async function countVideosByCategory(
  db: Db,
  user: CurrentUser,
): Promise<Record<string, number>> {
  const conditions = [isNull(video.deletedAt), publishedScope(user)].filter(Boolean);

  const rows = await db
    .select({ category: video.category, value: sql<number>`count(*)::int` })
    .from(video)
    .where(and(...conditions))
    .groupBy(video.category);

  const counts: Record<string, number> = { all: 0 };
  for (const r of rows) {
    counts[r.category] = r.value;
    counts.all += r.value;
  }
  return counts;
}
