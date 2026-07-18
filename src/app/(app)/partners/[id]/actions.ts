"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { partner, conversation, message, event, task, campaign, type BioSource } from "@/db/schema";
import type { Db } from "@/db";
import { requireUser, queryAs, seesWholeBook, type CurrentUser } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import {
  CHECKIN_APPROVED,
  CHECKIN_SKIPPED,
  PARTNER_ENROLLED,
} from "@/lib/queries/partners";
import { draftBio, type BioDraft } from "@/lib/bio/mock";
import { validateSocialLinks, normalizeUrl } from "@/lib/bio/validate";

export type TouchState = { error?: string };

const OUTCOMES = ["connected", "voicemail", "no_answer", "emailed", "texted", "met"] as const;

const OUTCOME_TEXT: Record<(typeof OUTCOMES)[number], string> = {
  connected: "Spoke with them",
  voicemail: "Left a voicemail",
  no_answer: "Called — no answer",
  emailed: "Sent an email",
  texted: "Sent a text",
  met: "Met in person",
};

/**
 * The channel each outcome is recorded on.
 *
 * A call you placed is a call — that is what the seeded history already does.
 * An email you sent from your own inbox is recorded as a note ABOUT that email:
 * the CRM did not send it, has no mail integration, and the history must never
 * imply otherwise.
 */
const OUTCOME_CHANNEL: Record<(typeof OUTCOMES)[number], "call" | "note"> = {
  connected: "call",
  voicemail: "call",
  no_answer: "call",
  emailed: "note",
  texted: "note",
  met: "note",
};

const TouchSchema = z.object({
  partnerId: z.string().uuid(),
  outcome: z.enum(OUTCOMES),
  body: z.string().trim().optional(),
});

/**
 * Log a touch — the partner record's primary action.
 *
 * This is the only thing that moves `lastTouchAt`, which is the only fact the
 * quiet read is computed from. It also writes the touch into the partner's
 * contact history, so what you said is still there in six months.
 */
export async function logPartnerTouch(
  _prev: TouchState,
  formData: FormData,
): Promise<TouchState> {
  const user = await requireUser();

  const parsed = TouchSchema.safeParse({
    partnerId: formData.get("partnerId"),
    outcome: formData.get("outcome"),
    body: formData.get("body") ?? undefined,
  });

  if (!parsed.success) {
    return { error: "Pick what happened, then save." };
  }

  const { partnerId, outcome, body } = parsed.data;
  const now = new Date();

  try {
    await queryAs(user, async (db) => {
      // RLS scopes this, but check the partner is visible before writing child
      // rows — a clear failure beats a foreign-key error.
      const [target] = await db
        .select({ id: partner.id, lastTouchAt: partner.lastTouchAt })
        .from(partner)
        .where(eq(partner.id, partnerId))
        .limit(1);
      if (!target) throw new Error("not-visible");

      const text = body?.trim()
        ? `${OUTCOME_TEXT[outcome]} — ${body.trim()}`
        : OUTCOME_TEXT[outcome];
      const channel = OUTCOME_CHANNEL[outcome];

      const [thread] = await db
        .insert(conversation)
        .values({
          tenantId: user.tenantId,
          subject: OUTCOME_TEXT[outcome],
          channel,
          partnerId,
          ownerUserId: user.userId,
          lastMessageAt: now,
          awaitingReply: false,
        })
        .returning({ id: conversation.id });

      await db.insert(message).values({
        tenantId: user.tenantId,
        conversationId: thread.id,
        channel,
        direction: "outbound",
        status: "sent",
        body: text,
        authorUserId: user.userId,
        sentAt: now,
        occurredAt: now,
        meta: { outcome },
      });

      await db
        .update(partner)
        .set({ lastTouchAt: now, updatedAt: now })
        .where(eq(partner.id, partnerId));

      await db.insert(event).values({
        tenantId: user.tenantId,
        kind: "partner.touch_logged",
        actorUserId: user.userId,
        payload: { partnerId, outcome },
      });

      await recordAudit(db, user, {
        action: "partner.touch_logged",
        entity: "partner",
        entityId: partnerId,
        changes: {
          lastTouchAt: {
            from: target.lastTouchAt?.toISOString() ?? null,
            to: now.toISOString(),
          },
          outcome: { from: null, to: outcome },
        },
      });
    });
  } catch {
    return { error: "We couldn't log that. Try again." };
  }

  revalidatePath(`/partners/${partnerId}`);
  revalidatePath("/partners");
  return {};
}

const NotesSchema = z.object({
  partnerId: z.string().uuid(),
  notesSummary: z.string().trim().max(2000, "That's longer than this box holds."),
});

/**
 * What to remember about a partner. `note` has no partner column, so a
 * partner's standing notes live on the record itself — one field the team keeps
 * current, not a log.
 */
export async function savePartnerNotes(
  _prev: TouchState,
  formData: FormData,
): Promise<TouchState> {
  const user = await requireUser();

  const parsed = NotesSchema.safeParse({
    partnerId: formData.get("partnerId"),
    notesSummary: formData.get("notesSummary") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "We couldn't save that." };
  }

  const { partnerId, notesSummary } = parsed.data;

  try {
    await queryAs(user, async (db) => {
      const [target] = await db
        .select({ id: partner.id, notesSummary: partner.notesSummary })
        .from(partner)
        .where(eq(partner.id, partnerId))
        .limit(1);
      if (!target) throw new Error("not-visible");

      await db
        .update(partner)
        .set({ notesSummary: notesSummary || null, updatedAt: new Date() })
        .where(eq(partner.id, partnerId));

      await recordAudit(db, user, {
        action: "partner.notes_updated",
        entity: "partner",
        entityId: partnerId,
        changes: { notesSummary: { from: target.notesSummary, to: notesSummary || null } },
      });
    });
  } catch {
    return { error: "We couldn't save that. Try again." };
  }

  revalidatePath(`/partners/${partnerId}`);
  return {};
}

const CheckinSchema = z.object({
  partnerId: z.string().uuid(),
  verdict: z.enum(["approve", "skip"]),
  quietDays: z.coerce.number().int().min(0),
});

/**
 * The human's verdict on AI's check-in suggestion.
 *
 * Approving is not a send, and this action never pretends otherwise: it puts
 * the reach-out on the user's task list so they can make it in their own words.
 * Either verdict is recorded as an event, which is what lets the card settle
 * instead of asking the same question on every page load.
 */
export async function decidePartnerCheckin(
  _prev: TouchState,
  formData: FormData,
): Promise<TouchState> {
  const user = await requireUser();

  const parsed = CheckinSchema.safeParse({
    partnerId: formData.get("partnerId"),
    verdict: formData.get("verdict"),
    quietDays: formData.get("quietDays"),
  });

  if (!parsed.success) {
    return { error: "We couldn't record that. Try again." };
  }

  const { partnerId, verdict, quietDays } = parsed.data;
  const approved = verdict === "approve";

  try {
    await queryAs(user, async (db) => {
      const [target] = await db
        .select({
          id: partner.id,
          firstName: partner.firstName,
          lastName: partner.lastName,
          company: partner.company,
        })
        .from(partner)
        .where(eq(partner.id, partnerId))
        .limit(1);
      if (!target) throw new Error("not-visible");

      if (approved) {
        const who = `${target.firstName} ${target.lastName}`;
        await db.insert(task).values({
          tenantId: user.tenantId,
          title: target.company ? `Reach out to ${who} at ${target.company}` : `Reach out to ${who}`,
          detail: `AI flagged this referral partner: no contact logged in ${quietDays} days.`,
          ownerUserId: user.userId,
          dueAt: new Date(),
          priority: "normal",
        });
      }

      await db.insert(event).values({
        tenantId: user.tenantId,
        kind: approved ? CHECKIN_APPROVED : CHECKIN_SKIPPED,
        actorUserId: user.userId,
        payload: { partnerId, quietDays },
      });

      await recordAudit(db, user, {
        action: approved ? CHECKIN_APPROVED : CHECKIN_SKIPPED,
        entity: "partner",
        entityId: partnerId,
        changes: { quietDays: { from: null, to: quietDays } },
      });
    });
  } catch {
    return { error: "We couldn't record that. Try again." };
  }

  revalidatePath(`/partners/${partnerId}`);
  revalidatePath("/today");
  return {};
}

// ---------------------------------------------------------------------------
// Record tooling — task, note, message drafts, campaign enrollment.
// The same working set People has, adapted to what the schema actually holds
// for a partner. Nothing here sends anything, and nothing here pretends to.
// ---------------------------------------------------------------------------

/** Fetch the partner or fail loudly — every tool below starts here. */
async function visiblePartner(db: Db, partnerId: string) {
  const [target] = await db
    .select({
      id: partner.id,
      firstName: partner.firstName,
      lastName: partner.lastName,
      company: partner.company,
    })
    .from(partner)
    .where(and(eq(partner.id, partnerId), isNull(partner.deletedAt)))
    .limit(1);
  if (!target) throw new Error("not-visible");
  return target;
}

const TaskSchema = z.object({
  partnerId: z.string().uuid(),
  title: z.string().trim().min(1, "Say what needs doing."),
  dueIn: z.enum(["today", "tomorrow", "next_week"]),
});

/**
 * Put a follow-up about this partner on the user's task list.
 *
 * `task` has no partner column (the schema is fixed), so the partner is named
 * in the title — the task reads correctly on Today without a join, and the
 * audit row is what ties it back to the partner record.
 */
export async function addPartnerTask(_prev: TouchState, formData: FormData): Promise<TouchState> {
  const user = await requireUser();

  const parsed = TaskSchema.safeParse({
    partnerId: formData.get("partnerId"),
    title: formData.get("title"),
    dueIn: formData.get("dueIn") ?? "today",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "We couldn't add that task." };
  }

  const { partnerId, title, dueIn } = parsed.data;
  const due = new Date();
  if (dueIn === "tomorrow") due.setDate(due.getDate() + 1);
  if (dueIn === "next_week") due.setDate(due.getDate() + 7);

  try {
    await queryAs(user, async (db) => {
      const target = await visiblePartner(db, partnerId);
      const who = `${target.firstName} ${target.lastName}`;

      await db.insert(task).values({
        tenantId: user.tenantId,
        title: `${title} — ${who}`,
        detail: target.company
          ? `Referral partner at ${target.company}.`
          : "Referral partner.",
        ownerUserId: user.userId,
        dueAt: due,
        priority: "normal",
      });

      await recordAudit(db, user, {
        action: "partner.task_created",
        entity: "partner",
        entityId: partnerId,
        changes: { title: { from: null, to: title } },
      });
    });
  } catch {
    return { error: "We couldn't add that task. Try again." };
  }

  revalidatePath(`/partners/${partnerId}`);
  revalidatePath("/today");
  return {};
}

const AddNoteSchema = z.object({
  partnerId: z.string().uuid(),
  body: z.string().trim().min(1, "Write something first.").max(4000),
});

/**
 * A dated note in the partner's contact history.
 *
 * `note` has no partner column, so — like a logged touch — this is recorded as
 * a channel-"note" entry in the partner's conversation history, which is where
 * the record already reads its story from. It does not move `lastTouchAt`:
 * writing about a relationship is not the same as touching it.
 */
export async function addPartnerNote(_prev: TouchState, formData: FormData): Promise<TouchState> {
  const user = await requireUser();

  const parsed = AddNoteSchema.safeParse({
    partnerId: formData.get("partnerId"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "We couldn't save that note." };
  }

  const { partnerId, body } = parsed.data;
  const now = new Date();

  try {
    await queryAs(user, async (db) => {
      await visiblePartner(db, partnerId);

      const [thread] = await db
        .insert(conversation)
        .values({
          tenantId: user.tenantId,
          subject: "Note",
          channel: "note",
          partnerId,
          ownerUserId: user.userId,
          lastMessageAt: now,
          awaitingReply: false,
        })
        .returning({ id: conversation.id });

      await db.insert(message).values({
        tenantId: user.tenantId,
        conversationId: thread.id,
        channel: "note",
        direction: "outbound",
        status: "sent",
        body,
        authorUserId: user.userId,
        sentAt: now,
        occurredAt: now,
      });

      await recordAudit(db, user, {
        action: "partner.note_created",
        entity: "partner",
        entityId: partnerId,
      });
    });
  } catch {
    return { error: "We couldn't save that note. Nothing was lost — try again." };
  }

  revalidatePath(`/partners/${partnerId}`);
  return {};
}

const DRAFT_CHANNELS = ["email", "sms", "video"] as const;

const DraftSchema = z.object({
  partnerId: z.string().uuid(),
  channel: z.enum(DRAFT_CHANNELS),
  subject: z.string().trim().max(200).optional(),
  body: z.string().trim().min(1, "Write the message first.").max(8000),
});

/**
 * Save a draft message for this partner — email, text, or video script.
 *
 * The draft lands in the partner's contact history with status "draft".
 * Nothing is sent: this CRM has no mail, SMS, or video integration, and the
 * UI says so wherever the draft appears. What the draft buys you is a written
 * message, in one place, ready to copy into the tool that actually sends.
 */
export async function createPartnerDraft(
  _prev: TouchState,
  formData: FormData,
): Promise<TouchState> {
  const user = await requireUser();

  const parsed = DraftSchema.safeParse({
    partnerId: formData.get("partnerId"),
    channel: formData.get("channel"),
    subject: formData.get("subject") || undefined,
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "We couldn't save that draft." };
  }

  const { partnerId, channel, subject, body } = parsed.data;
  const now = new Date();

  try {
    await queryAs(user, async (db) => {
      await visiblePartner(db, partnerId);

      const [thread] = await db
        .insert(conversation)
        .values({
          tenantId: user.tenantId,
          subject: subject ?? (channel === "video" ? "Video message draft" : "Draft"),
          channel,
          partnerId,
          ownerUserId: user.userId,
          lastMessageAt: now,
          awaitingReply: false,
        })
        .returning({ id: conversation.id });

      await db.insert(message).values({
        tenantId: user.tenantId,
        conversationId: thread.id,
        channel,
        direction: "outbound",
        status: "draft",
        subject: subject ?? null,
        body,
        authorUserId: user.userId,
        occurredAt: now,
      });

      await recordAudit(db, user, {
        action: "partner.draft_created",
        entity: "partner",
        entityId: partnerId,
        changes: { channel: { from: null, to: channel } },
      });
    });
  } catch {
    return { error: "We couldn't save that draft. Nothing was lost — try again." };
  }

  revalidatePath(`/partners/${partnerId}`);
  return {};
}

const EnrollSchema = z.object({
  partnerId: z.string().uuid(),
  campaignId: z.string().uuid(),
});

/**
 * Put this partner on a drip campaign — as a recorded decision, not a send.
 *
 * There is no campaign-membership table, so the enrollment is an event: who
 * put whom on what, and when. The campaign itself runs (or doesn't) exactly as
 * it did before; this CRM does not send campaign messages, and the record
 * screen says so next to every enrollment.
 */
export async function enrollPartnerInCampaign(
  _prev: TouchState,
  formData: FormData,
): Promise<TouchState> {
  const user = await requireUser();

  const parsed = EnrollSchema.safeParse({
    partnerId: formData.get("partnerId"),
    campaignId: formData.get("campaignId"),
  });
  if (!parsed.success) {
    return { error: "Pick a campaign first." };
  }

  const { partnerId, campaignId } = parsed.data;

  try {
    await queryAs(user, async (db) => {
      await visiblePartner(db, partnerId);

      const [target] = await db
        .select({ id: campaign.id, name: campaign.name })
        .from(campaign)
        .where(and(eq(campaign.id, campaignId), isNull(campaign.deletedAt)))
        .limit(1);
      if (!target) throw new Error("not-visible");

      // Enrolling twice would just double the history — say so instead.
      const [existing] = await db
        .select({ id: event.id })
        .from(event)
        .where(
          and(
            eq(event.kind, PARTNER_ENROLLED),
            sql`${event.payload}->>'partnerId' = ${partnerId}`,
            sql`${event.payload}->>'campaignId' = ${campaignId}`,
          ),
        )
        .limit(1);
      if (existing) throw new Error("already-enrolled");

      await db.insert(event).values({
        tenantId: user.tenantId,
        kind: PARTNER_ENROLLED,
        actorUserId: user.userId,
        payload: { partnerId, campaignId, campaignName: target.name },
      });

      await recordAudit(db, user, {
        action: PARTNER_ENROLLED,
        entity: "partner",
        entityId: partnerId,
        changes: { campaign: { from: null, to: target.name } },
      });
    });
  } catch (err) {
    if (err instanceof Error && err.message === "already-enrolled") {
      return { error: "They're already on that campaign." };
    }
    return { error: "We couldn't record that. Try again." };
  }

  revalidatePath(`/partners/${partnerId}`);
  return {};
}

// ---------------------------------------------------------------------------
// Bio & Online Presence
//
// Honesty rule (Jeremy, 2026-07-16): no web-search provider is connected here.
// "Draft bio with AI" runs a local, pure mock generator (src/lib/bio/mock.ts)
// and returns a preview — it never touches the network and never writes to
// the database on its own. Only a human clicking Accept persists anything,
// and only what's in the (possibly hand-edited) preview at that moment.
// Same contract, same generator, same validator as the People bio panel
// (people/[id]/actions.ts) — reused as-is, not reimplemented.
// ---------------------------------------------------------------------------

/**
 * Load a partner and re-check book scope server-side (owner or a role that
 * sees the whole book) — the client's word on who they can act on is never
 * trusted, even though RLS already keeps the row inside the tenant.
 */
async function getScopedPartner(db: Db, user: CurrentUser, partnerId: string) {
  const [target] = await db
    .select()
    .from(partner)
    .where(and(eq(partner.id, partnerId), isNull(partner.deletedAt)))
    .limit(1);
  if (!target) throw new Error("not-visible");
  if (!seesWholeBook(user.role) && target.ownerUserId !== user.userId) {
    throw new Error("not-visible");
  }
  return target;
}

const SavePartnerBioSchema = z.object({
  partnerId: z.string().uuid(),
  bio: z.string().optional(),
});

/** Manual bio edit — the always-available path, independent of any AI draft. */
export async function savePartnerBio(_prev: TouchState, formData: FormData): Promise<TouchState> {
  const user = await requireUser();

  const parsed = SavePartnerBioSchema.safeParse({
    partnerId: formData.get("partnerId"),
    bio: formData.get("bio") ?? undefined,
  });
  if (!parsed.success) {
    return { error: "Check the bio and try again." };
  }

  const { partnerId } = parsed.data;
  // An empty save clears the bio — "No bio yet" is an honest state, not a
  // placeholder to fight around.
  const bio = parsed.data.bio?.trim() || null;

  try {
    await queryAs(user, async (db) => {
      const target = await getScopedPartner(db, user, partnerId);

      await db
        .update(partner)
        .set({ bio, updatedAt: new Date() })
        .where(eq(partner.id, partnerId));

      await recordAudit(db, user, {
        action: "partner.bio_updated",
        entity: "partner",
        entityId: partnerId,
        changes: { bio: { from: target.bio, to: bio } },
      });
    });
  } catch {
    return { error: "We couldn't save that bio. Try again." };
  }

  revalidatePath(`/partners/${partnerId}`);
  return {};
}

export type DraftPartnerBioState = {
  draft?: BioDraft;
  error?: string;
  /** The seed used for the last draft — "Regenerate" bumps this by one. */
  seed: number;
};

const DraftPartnerBioSchema = z.object({ partnerId: z.string().uuid() });

/**
 * Draft a bio with the mock generator. This is a preview only: it records an
 * audit entry (so there's a trail that a demo draft was generated) but writes
 * nothing to `partner` — Accept is the only path that persists anything.
 */
export async function draftPartnerBioWithAi(
  prev: DraftPartnerBioState,
  formData: FormData,
): Promise<DraftPartnerBioState> {
  const user = await requireUser();

  const parsed = DraftPartnerBioSchema.safeParse({ partnerId: formData.get("partnerId") });
  if (!parsed.success) {
    return { ...prev, error: "We couldn't draft a bio for this record." };
  }

  const { partnerId } = parsed.data;
  const nextSeed = prev.seed + 1;

  try {
    const info = await queryAs(user, async (db) => {
      const target = await getScopedPartner(db, user, partnerId);

      await recordAudit(db, user, {
        action: "partner.bio_drafted",
        entity: "partner",
        entityId: partnerId,
        changes: { seed: { from: prev.seed, to: nextSeed } },
      });

      return target;
    });

    const draft = draftBio({
      firstName: info.firstName,
      lastName: info.lastName,
      company: info.company,
      // `partner` has no city/address field today — only company, kind, and
      // language feed the draft.
      city: null,
      role: info.kind,
      language: info.preferredLanguage,
      seed: nextSeed,
    });

    return { draft, seed: nextSeed };
  } catch {
    return { ...prev, error: "We couldn't draft a bio right now. Try again." };
  }
}

export type AcceptPartnerBioState = { error?: string; accepted?: boolean };

const AcceptPartnerBioSchema = z.object({
  partnerId: z.string().uuid(),
  bio: z.string().trim().min(1, "There's no draft text to save."),
  sourcesJson: z.string(),
});

/**
 * Accept a draft — the only step that writes to `partner`. Persists exactly
 * the text on screen (edited or not), stamps `bioResearchedAt`, and saves the
 * sources the draft cited, so the panel can keep showing where the last
 * accepted draft said it looked. It does not touch `socialLinks` — suggested
 * links are offered separately and only saved if the team explicitly adds
 * them via the link editor.
 */
export async function acceptPartnerBioDraft(
  _prev: AcceptPartnerBioState,
  formData: FormData,
): Promise<AcceptPartnerBioState> {
  const user = await requireUser();

  const parsed = AcceptPartnerBioSchema.safeParse({
    partnerId: formData.get("partnerId"),
    bio: formData.get("bio"),
    sourcesJson: formData.get("sourcesJson"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "We couldn't save that draft." };
  }

  const { partnerId, bio } = parsed.data;

  let sources: BioSource[] = [];
  try {
    const rawSources: unknown = JSON.parse(parsed.data.sourcesJson);
    if (Array.isArray(rawSources)) {
      sources = rawSources
        .filter(
          (s): s is BioSource =>
            Boolean(s) && typeof s === "object" && typeof (s as BioSource).label === "string",
        )
        // A source url is rendered as an href, so it goes through the same
        // normalizer as the social links — this drops javascript:/data:/hostless
        // values rather than trusting a hand-crafted POST. Label and note survive.
        .map((s) => {
          const url = typeof s.url === "string" ? normalizeUrl(s.url) : null;
          return {
            label: s.label,
            ...(url ? { url } : {}),
            ...(typeof s.note === "string" ? { note: s.note } : {}),
          };
        });
    }
  } catch {
    sources = [];
  }

  const now = new Date();

  try {
    await queryAs(user, async (db) => {
      const target = await getScopedPartner(db, user, partnerId);

      await db
        .update(partner)
        .set({ bio, bioResearchedAt: now, bioSources: sources, updatedAt: now })
        .where(eq(partner.id, partnerId));

      await recordAudit(db, user, {
        action: "partner.bio_updated",
        entity: "partner",
        entityId: partnerId,
        changes: {
          bio: { from: target.bio, to: bio },
          bioResearchedAt: { from: target.bioResearchedAt, to: now },
        },
      });
    });
  } catch {
    return { error: "We couldn't save that bio. Try again." };
  }

  revalidatePath(`/partners/${partnerId}`);
  return { accepted: true };
}

const SavePartnerSocialLinksSchema = z.object({
  partnerId: z.string().uuid(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  linkedin: z.string().optional(),
  youtube: z.string().optional(),
  website: z.string().optional(),
  otherJson: z.string().optional(),
});

/** Manual social-link editor — validated and normalized, never auto-saved. */
export async function savePartnerSocialLinks(
  _prev: TouchState,
  formData: FormData,
): Promise<TouchState> {
  const user = await requireUser();

  const parsed = SavePartnerSocialLinksSchema.safeParse({
    partnerId: formData.get("partnerId"),
    facebook: formData.get("facebook") ?? undefined,
    instagram: formData.get("instagram") ?? undefined,
    tiktok: formData.get("tiktok") ?? undefined,
    linkedin: formData.get("linkedin") ?? undefined,
    youtube: formData.get("youtube") ?? undefined,
    website: formData.get("website") ?? undefined,
    otherJson: formData.get("otherJson") ?? undefined,
  });
  if (!parsed.success) {
    return { error: "Check the links and try again." };
  }

  let other: unknown = [];
  if (parsed.data.otherJson) {
    try {
      other = JSON.parse(parsed.data.otherJson);
    } catch {
      return { error: "Something went wrong reading the extra links. Try again." };
    }
  }

  const { links, errors } = validateSocialLinks({
    facebook: parsed.data.facebook,
    instagram: parsed.data.instagram,
    tiktok: parsed.data.tiktok,
    linkedin: parsed.data.linkedin,
    youtube: parsed.data.youtube,
    website: parsed.data.website,
    other,
  });
  if (errors.length) {
    return { error: errors[0] };
  }

  const { partnerId } = parsed.data;

  try {
    await queryAs(user, async (db) => {
      const target = await getScopedPartner(db, user, partnerId);

      await db
        .update(partner)
        .set({ socialLinks: links, updatedAt: new Date() })
        .where(eq(partner.id, partnerId));

      await recordAudit(db, user, {
        action: "partner.links_updated",
        entity: "partner",
        entityId: partnerId,
        changes: { socialLinks: { from: target.socialLinks, to: links } },
      });
    });
  } catch {
    return { error: "We couldn't save those links. Try again." };
  }

  revalidatePath(`/partners/${partnerId}`);
  return {};
}
