"use server";

import { revalidatePath } from "next/cache";
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { video, videoWatch } from "@/db/schema";
import { requireUser, queryAs } from "@/lib/auth";
import { canManageUsers } from "@/lib/roles";
import { recordAudit, diff } from "@/lib/audit";
import { VIDEO_CATEGORIES } from "@/lib/queries/videos";

export type VideoFormState = { error?: string; ok?: string };
export type ActionResult = { error?: string };

const NOT_ADMIN = "Only an administrator can manage the video library.";

const VideoSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(3, "Give the video a title — at least 3 characters."),
  description: z.string().trim().optional(),
  category: z.enum(VIDEO_CATEGORIES),
  durationMinutes: z.coerce
    .number()
    .int("Duration is whole minutes.")
    .positive("Duration is whole minutes, 1 or more.")
    .max(600, "That duration looks wrong — check the minutes.")
    .optional(),
  url: z
    .string()
    .trim()
    .url("Enter a full link, starting with https://")
    .startsWith("https://", "The link must start with https://")
    .optional(),
  featured: z.boolean(),
});

/** Create or update a video. Used by the Add / Edit dialog. */
export async function saveVideo(
  _prev: VideoFormState,
  formData: FormData,
): Promise<VideoFormState> {
  const actor = await requireUser();
  // Re-checked here, not just in the UI: Server Actions POST to the page's
  // own route and can bypass a proxy matcher.
  if (!canManageUsers(actor.role)) {
    return { error: NOT_ADMIN };
  }

  const parsed = VideoSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    category: formData.get("category"),
    durationMinutes: formData.get("durationMinutes") || undefined,
    url: formData.get("url") || undefined,
    featured: formData.get("featured") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the details and try again." };
  }

  const input = parsed.data;
  const values = {
    title: input.title,
    description: input.description ?? null,
    category: input.category,
    durationSeconds: input.durationMinutes ? input.durationMinutes * 60 : null,
    url: input.url ?? null,
    featured: input.featured,
  };

  try {
    await queryAs(actor, async (db) => {
      if (input.id) {
        const [before] = await db
          .select({
            title: video.title,
            description: video.description,
            category: video.category,
            durationSeconds: video.durationSeconds,
            url: video.url,
            featured: video.featured,
          })
          .from(video)
          .where(and(eq(video.id, input.id), isNull(video.deletedAt)))
          .limit(1);
        if (!before) throw new Error("That video no longer exists.");

        await db
          .update(video)
          .set({ ...values, updatedAt: new Date() })
          .where(eq(video.id, input.id));

        await recordAudit(db, actor, {
          action: "video.updated",
          entity: "video",
          entityId: input.id,
          changes: diff(before, values),
        });
      } else {
        // New videos land at the end of their category.
        const [last] = await db
          .select({ max: sql<number>`coalesce(max(${video.sortOrder}), 0)::int` })
          .from(video)
          .where(and(eq(video.category, input.category), isNull(video.deletedAt)));

        const [created] = await db
          .insert(video)
          .values({
            tenantId: actor.tenantId,
            ...values,
            sortOrder: (last?.max ?? 0) + 1,
            createdByUserId: actor.userId,
          })
          .returning({ id: video.id });

        await recordAudit(db, actor, {
          action: "video.created",
          entity: "video",
          entityId: created.id,
          changes: {
            title: { from: null, to: values.title },
            category: { from: null, to: values.category },
            url: { from: null, to: values.url },
          },
        });
      }
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "We couldn't save that. Nothing was changed.",
    };
  }

  revalidatePath("/videos");
  return {
    ok: input.url
      ? "Saved."
      : "Saved. Until a recording is added, the library will say the video is coming soon.",
  };
}

const PublishSchema = z.object({
  id: z.string().uuid(),
  published: z.boolean(),
});

/** Publish or unpublish one video. */
export async function setVideoPublished(input: {
  id: string;
  published: boolean;
}): Promise<ActionResult> {
  const actor = await requireUser();
  if (!canManageUsers(actor.role)) return { error: NOT_ADMIN };

  const parsed = PublishSchema.safeParse(input);
  if (!parsed.success) return { error: "Check the details and try again." };

  try {
    await queryAs(actor, async (db) => {
      const [before] = await db
        .select({ published: video.published })
        .from(video)
        .where(and(eq(video.id, parsed.data.id), isNull(video.deletedAt)))
        .limit(1);
      if (!before) throw new Error("That video no longer exists.");
      if (before.published === parsed.data.published) return;

      await db
        .update(video)
        .set({ published: parsed.data.published, updatedAt: new Date() })
        .where(eq(video.id, parsed.data.id));

      await recordAudit(db, actor, {
        action: parsed.data.published ? "video.published" : "video.unpublished",
        entity: "video",
        entityId: parsed.data.id,
        changes: diff({ published: before.published }, { published: parsed.data.published }),
      });
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "We couldn't change that." };
  }

  revalidatePath("/videos");
  return {};
}

const MoveSchema = z.object({
  id: z.string().uuid(),
  direction: z.enum(["up", "down"]),
});

/** Swap sort order with the neighbouring video in the same category. */
export async function moveVideo(input: {
  id: string;
  direction: "up" | "down";
}): Promise<ActionResult> {
  const actor = await requireUser();
  if (!canManageUsers(actor.role)) return { error: NOT_ADMIN };

  const parsed = MoveSchema.safeParse(input);
  if (!parsed.success) return { error: "Check the details and try again." };

  try {
    await queryAs(actor, async (db) => {
      const [row] = await db
        .select({ id: video.id, category: video.category, sortOrder: video.sortOrder })
        .from(video)
        .where(and(eq(video.id, parsed.data.id), isNull(video.deletedAt)))
        .limit(1);
      if (!row) throw new Error("That video no longer exists.");

      const siblings = await db
        .select({ id: video.id, sortOrder: video.sortOrder })
        .from(video)
        .where(and(eq(video.category, row.category), isNull(video.deletedAt)))
        .orderBy(asc(video.sortOrder), asc(video.createdAt));

      const index = siblings.findIndex((s) => s.id === row.id);
      const neighbour =
        parsed.data.direction === "up" ? siblings[index - 1] : siblings[index + 1];
      if (index === -1 || !neighbour) return; // Already at the edge — nothing to do.

      // Swap sort orders; when the two values tie, nudge past the neighbour so
      // the move still takes effect.
      let newOrder = neighbour.sortOrder;
      if (newOrder === row.sortOrder) {
        newOrder = parsed.data.direction === "up" ? newOrder - 1 : newOrder + 1;
      }

      await db
        .update(video)
        .set({ sortOrder: newOrder, updatedAt: new Date() })
        .where(eq(video.id, row.id));
      await db
        .update(video)
        .set({ sortOrder: row.sortOrder, updatedAt: new Date() })
        .where(eq(video.id, neighbour.id));

      await recordAudit(db, actor, {
        action: "video.reordered",
        entity: "video",
        entityId: row.id,
        changes: diff({ sortOrder: row.sortOrder }, { sortOrder: newOrder }),
      });
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "We couldn't reorder that." };
  }

  revalidatePath("/videos");
  return {};
}

const DeleteSchema = z.object({ id: z.string().uuid() });

/** Soft delete — the row stays for the audit trail. */
export async function deleteVideo(input: { id: string }): Promise<ActionResult> {
  const actor = await requireUser();
  if (!canManageUsers(actor.role)) return { error: NOT_ADMIN };

  const parsed = DeleteSchema.safeParse(input);
  if (!parsed.success) return { error: "Check the details and try again." };

  try {
    await queryAs(actor, async (db) => {
      const [before] = await db
        .select({ title: video.title })
        .from(video)
        .where(and(eq(video.id, parsed.data.id), isNull(video.deletedAt)))
        .limit(1);
      if (!before) throw new Error("That video no longer exists.");

      await db
        .update(video)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(video.id, parsed.data.id));

      await recordAudit(db, actor, {
        action: "video.deleted",
        entity: "video",
        entityId: parsed.data.id,
        changes: { title: { from: before.title, to: null } },
      });
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "We couldn't remove that." };
  }

  revalidatePath("/videos");
  return {};
}

const WatchSchema = z.object({ videoId: z.string().uuid() });

/**
 * Record that the signed-in user opened a video. Only called when a real
 * recording exists — a "coming soon" placeholder is never marked watched.
 */
export async function markVideoWatched(input: { videoId: string }): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = WatchSchema.safeParse(input);
  if (!parsed.success) return { error: "Check the details and try again." };

  try {
    await queryAs(user, async (db) => {
      const [row] = await db
        .select({ id: video.id, url: video.url, published: video.published })
        .from(video)
        .where(and(eq(video.id, parsed.data.videoId), isNull(video.deletedAt)))
        .limit(1);
      // No recording yet, or not visible — nothing honest to record.
      if (!row || !row.url) throw new Error("That video isn't available to watch yet.");
      if (!row.published && !canManageUsers(user.role)) {
        throw new Error("That video isn't available to watch yet.");
      }

      const [existing] = await db
        .select({ id: videoWatch.id })
        .from(videoWatch)
        .where(
          and(eq(videoWatch.videoId, parsed.data.videoId), eq(videoWatch.userId, user.userId)),
        )
        .limit(1);

      if (existing) {
        await db
          .update(videoWatch)
          .set({ watchedAt: new Date() })
          .where(eq(videoWatch.id, existing.id));
      } else {
        await db.insert(videoWatch).values({
          tenantId: user.tenantId,
          videoId: parsed.data.videoId,
          userId: user.userId,
          watchedAt: new Date(),
        });
      }
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "We couldn't record that." };
  }

  revalidatePath("/videos");
  return {};
}
