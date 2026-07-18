"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, and, isNull, desc, sql } from "drizzle-orm";
import { z } from "zod";
import {
  note,
  loan,
  event,
  lead,
  person,
  task,
  conversation,
  message,
  campaign,
  type BioSource,
} from "@/db/schema";
import { requireUser, queryAs, requireRole, seesWholeBook, type CurrentUser } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { recordAudit } from "@/lib/audit";
import type { Db } from "@/db";
import { draftBio, type BioDraft } from "@/lib/bio/mock";
import { validateSocialLinks } from "@/lib/bio/validate";

/**
 * Every staff role may act on people they can see (RLS + book scope do the
 * narrowing). The check still runs so a session carrying an unknown role
 * never reaches a write.
 */
function requireStaff(user: CurrentUser) {
  requireRole(user, [...ROLES]);
}

/**
 * Load a person and re-check book scope server-side (owner or a role that
 * sees the whole book) — the client's word on who they can act on is never
 * trusted, even though RLS already keeps the row inside the tenant.
 */
async function getScopedPerson(db: Db, user: CurrentUser, personId: string) {
  const [target] = await db
    .select()
    .from(person)
    .where(and(eq(person.id, personId), isNull(person.deletedAt)))
    .limit(1);
  if (!target) throw new Error("not-visible");
  if (!seesWholeBook(user.role) && target.ownerUserId !== user.userId) {
    throw new Error("not-visible");
  }
  return target;
}

export type NoteState = { error?: string };

const NoteSchema = z.object({
  personId: z.string().uuid(),
  loanId: z.string().uuid().nullable(),
  body: z.string().trim().min(1, "Write something first."),
});

export async function addNote(_prev: NoteState, formData: FormData): Promise<NoteState> {
  const user = await requireUser();

  const parsed = NoteSchema.safeParse({
    personId: formData.get("personId"),
    loanId: formData.get("loanId") || null,
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "We couldn't save that note." };
  }

  const { personId, loanId, body } = parsed.data;

  try {
    await queryAs(user, async (db) => {
      // RLS scopes this, but check the person is visible before writing a
      // child row — a clear failure beats a foreign-key error.
      const [target] = await db
        .select({ id: person.id })
        .from(person)
        .where(eq(person.id, personId))
        .limit(1);
      if (!target) throw new Error("not-visible");

      await db.insert(note).values({
        tenantId: user.tenantId,
        body,
        authorUserId: user.userId,
        personId,
        loanId,
      });

      if (loanId) {
        await db
          .update(loan)
          .set({ lastActivityAt: new Date(), stalledSince: null })
          .where(eq(loan.id, loanId));
      }

      await recordAudit(db, user, {
        action: "note.created",
        entity: "person",
        entityId: personId,
      });
    });
  } catch {
    return { error: "We couldn't save that note. Nothing was lost — try again." };
  }

  revalidatePath(`/people/${personId}`);
  return {};
}

const OUTCOMES = ["connected", "voicemail", "no_answer", "emailed", "texted", "met"] as const;

const TouchSchema = z.object({
  personId: z.string().uuid(),
  loanId: z.string().uuid().nullable(),
  outcome: z.enum(OUTCOMES),
  body: z.string().trim().optional(),
});

const OUTCOME_TEXT: Record<(typeof OUTCOMES)[number], string> = {
  connected: "Spoke with them",
  voicemail: "Left a voicemail",
  no_answer: "Called — no answer",
  emailed: "Sent an email",
  texted: "Sent a text",
  met: "Met in person",
};

/**
 * Log a touch — the record's primary action (Information_Architecture §3.4).
 *
 * Writes a note, refreshes the opportunity's activity clock (which clears any
 * stall flag), stamps speed-to-lead on first contact, and advances a brand-new
 * lead to Contact attempt. All in one transaction.
 */
export async function logTouch(_prev: NoteState, formData: FormData): Promise<NoteState> {
  const user = await requireUser();

  const parsed = TouchSchema.safeParse({
    personId: formData.get("personId"),
    loanId: formData.get("loanId") || null,
    outcome: formData.get("outcome"),
    body: formData.get("body") ?? undefined,
  });

  if (!parsed.success) {
    return { error: "Pick what happened, then save." };
  }

  const { personId, loanId, outcome, body } = parsed.data;
  const now = new Date();

  try {
    await queryAs(user, async (db) => {
      const text = body?.trim()
        ? `${OUTCOME_TEXT[outcome]} — ${body.trim()}`
        : OUTCOME_TEXT[outcome];

      await db.insert(note).values({
        tenantId: user.tenantId,
        body: text,
        authorUserId: user.userId,
        personId,
        loanId,
      });

      await db.insert(event).values({
        tenantId: user.tenantId,
        kind: "touch.logged",
        personId,
        loanId,
        actorUserId: user.userId,
        payload: { outcome },
      });

      if (loanId) {
        const [current] = await db
          .select({ stage: loan.stage })
          .from(loan)
          .where(eq(loan.id, loanId))
          .limit(1);

        await db
          .update(loan)
          .set({
            lastActivityAt: now,
            stalledSince: null,
            // A first touch moves a brand-new lead off the speed-to-lead clock.
            stage: current?.stage === "new_lead" ? "contact_attempt" : current?.stage,
            updatedAt: now,
          })
          .where(eq(loan.id, loanId));

        // Speed-to-lead is measured from capture to the first response, so
        // only the first touch stamps it.
        await db
          .update(lead)
          .set({ firstResponseAt: now })
          .where(and(eq(lead.loanId, loanId), isNull(lead.firstResponseAt)));
      }

      await recordAudit(db, user, {
        action: "touch.logged",
        entity: "person",
        entityId: personId,
        changes: { outcome: { from: null, to: outcome } },
      });
    });
  } catch {
    return { error: "We couldn't log that. Try again." };
  }

  revalidatePath(`/people/${personId}`);
  revalidatePath("/today");
  revalidatePath("/pipeline");
  return {};
}

// --- Record actions ----------------------------------------------------------

const DRAFT_CHANNELS = ["email", "sms", "video"] as const;

const DraftSchema = z.object({
  personId: z.string().uuid(),
  loanId: z.string().uuid().nullable(),
  channel: z.enum(DRAFT_CHANNELS),
  subject: z.string().trim().optional(),
  body: z.string().trim().min(1, "Write the message first."),
});

const CHANNEL_NOUN: Record<(typeof DRAFT_CHANNELS)[number], string> = {
  email: "email",
  sms: "text",
  video: "video message",
};

/**
 * Start (or continue) a conversation with a draft message.
 *
 * This writes an outbound message with status `draft` and `sent_at` null. It
 * does not send anything and it never will on its own: no email, texting, or
 * video provider is connected to this CRM, so there is nothing to hand the
 * message to. The draft sits on the thread until a human sends it once an
 * account is linked — the same honesty rule as the conversations reply box.
 */
export async function createDraftMessage(
  _prev: NoteState,
  formData: FormData,
): Promise<NoteState> {
  const user = await requireUser();

  try {
    requireStaff(user);
  } catch {
    return { error: "You do not have permission to do that." };
  }

  const parsed = DraftSchema.safeParse({
    personId: formData.get("personId"),
    loanId: formData.get("loanId") || null,
    channel: formData.get("channel"),
    subject: formData.get("subject") ?? undefined,
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the message and try again." };
  }

  const { personId, loanId, channel, subject, body } = parsed.data;
  const now = new Date();
  let conversationId: string;

  try {
    conversationId = await queryAs(user, async (db) => {
      // RLS scopes this, but check the person is visible before writing a
      // child row — a clear failure beats a foreign-key error.
      const [target] = await db
        .select({ id: person.id, doNotContact: person.doNotContact })
        .from(person)
        .where(and(eq(person.id, personId), isNull(person.deletedAt)))
        .limit(1);
      if (!target) throw new Error("not-visible");

      // Do-not-contact is absolute, and it is checked here rather than only
      // in the dialog, because the dialog is not the last line of defence.
      if (target.doNotContact) throw new Error("do-not-contact");

      // Continue the person's newest thread on this channel, or open one.
      const [existing] = await db
        .select({ id: conversation.id })
        .from(conversation)
        .where(and(eq(conversation.personId, personId), eq(conversation.channel, channel)))
        .orderBy(desc(conversation.lastMessageAt))
        .limit(1);

      let threadId = existing?.id;
      if (!threadId) {
        const [created] = await db
          .insert(conversation)
          .values({
            tenantId: user.tenantId,
            channel,
            subject: channel === "email" ? subject || null : null,
            personId,
            loanId,
            ownerUserId: user.userId,
            lastMessageAt: now,
          })
          .returning({ id: conversation.id });
        threadId = created.id;
      }

      await db.insert(message).values({
        tenantId: user.tenantId,
        conversationId: threadId,
        channel,
        direction: "outbound",
        status: "draft",
        subject: channel === "email" ? subject || null : null,
        body,
        // A person typed this. AI had nothing to do with it.
        preparedByAi: false,
        authorUserId: user.userId,
        sentAt: null,
        occurredAt: now,
      });

      await db
        .update(conversation)
        .set({ lastMessageAt: now, updatedAt: now })
        .where(eq(conversation.id, threadId));

      await recordAudit(db, user, {
        action: "message.draft_saved",
        entity: "conversation",
        entityId: threadId,
        changes: { channel: { from: null, to: channel } },
      });

      return threadId;
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "";
    if (reason === "do-not-contact") {
      return {
        error:
          "This contact asked not to be contacted, so the draft wasn't saved. Talk to your manager before reaching out.",
      };
    }
    return { error: `We couldn't save that ${CHANNEL_NOUN[channel]} draft. Try again.` };
  }

  revalidatePath(`/people/${personId}`);
  revalidatePath("/conversations");
  redirect(`/conversations/${conversationId}`);
}

const EnrollSchema = z.object({
  personId: z.string().uuid(),
  campaignId: z.string().uuid("Pick a campaign."),
});

export type EnrollState = { error?: string; enrolled?: string };

/**
 * Enroll a person in a drip campaign.
 *
 * This records the enrollment (an event row) and grows the campaign's
 * audience count. It does not send anything: no provider is connected, so the
 * campaign's messages queue for sending once one is. The UI says exactly that.
 */
export async function enrollInCampaign(
  _prev: EnrollState,
  formData: FormData,
): Promise<EnrollState> {
  const user = await requireUser();

  try {
    requireStaff(user);
  } catch {
    return { error: "You do not have permission to do that." };
  }

  const parsed = EnrollSchema.safeParse({
    personId: formData.get("personId"),
    campaignId: formData.get("campaignId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Pick a campaign." };
  }

  const { personId, campaignId } = parsed.data;
  let campaignName: string;

  try {
    campaignName = await queryAs(user, async (db) => {
      const [target] = await db
        .select({ id: person.id, doNotContact: person.doNotContact })
        .from(person)
        .where(and(eq(person.id, personId), isNull(person.deletedAt)))
        .limit(1);
      if (!target) throw new Error("not-visible");
      if (target.doNotContact) throw new Error("do-not-contact");

      const [chosen] = await db
        .select({ id: campaign.id, name: campaign.name, status: campaign.status })
        .from(campaign)
        .where(and(eq(campaign.id, campaignId), isNull(campaign.deletedAt)))
        .limit(1);
      if (!chosen) throw new Error("no-campaign");
      if (chosen.status === "finished") throw new Error("finished");

      // One enrollment per person per campaign — check the event trail.
      const [already] = await db
        .select({ id: event.id })
        .from(event)
        .where(
          and(
            eq(event.kind, "campaign.enrolled"),
            eq(event.personId, personId),
            sql`${event.payload}->>'campaignId' = ${campaignId}`,
          ),
        )
        .limit(1);
      if (already) throw new Error("already-enrolled");

      await db.insert(event).values({
        tenantId: user.tenantId,
        kind: "campaign.enrolled",
        personId,
        actorUserId: user.userId,
        payload: { campaignId, campaignName: chosen.name },
      });

      await db
        .update(campaign)
        .set({
          audienceSize: sql`${campaign.audienceSize} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(campaign.id, campaignId));

      await recordAudit(db, user, {
        action: "campaign.enrolled",
        entity: "campaign",
        entityId: campaignId,
        changes: { personId: { from: null, to: personId } },
      });

      return chosen.name;
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "";
    if (reason === "do-not-contact") {
      return { error: "This contact asked not to be contacted, so they can't be enrolled." };
    }
    if (reason === "already-enrolled") {
      return { error: "They're already enrolled in that campaign." };
    }
    if (reason === "finished") {
      return { error: "That campaign has finished. Pick one that's still open." };
    }
    if (reason === "no-campaign") {
      return { error: "That campaign isn't in your book any more." };
    }
    return { error: "We couldn't enroll them. Nothing was changed — try again." };
  }

  revalidatePath(`/people/${personId}`);
  revalidatePath("/marketing");
  return {
    enrolled: `Enrolled in "${campaignName}" — messages queue for sending when a provider is connected.`,
  };
}

const TaskSchema = z.object({
  personId: z.string().uuid(),
  loanId: z.string().uuid().nullable(),
  title: z.string().trim().min(1, "Say what needs doing."),
  dueAt: z.string().trim().optional(),
});

/** Add a follow-up task tied to this person, owned by whoever added it. */
export async function addTask(_prev: NoteState, formData: FormData): Promise<NoteState> {
  const user = await requireUser();

  try {
    requireStaff(user);
  } catch {
    return { error: "You do not have permission to do that." };
  }

  const parsed = TaskSchema.safeParse({
    personId: formData.get("personId"),
    loanId: formData.get("loanId") || null,
    title: formData.get("title"),
    dueAt: formData.get("dueAt") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the task and try again." };
  }

  const { personId, loanId, title } = parsed.data;
  const dueAt = parsed.data.dueAt ? new Date(parsed.data.dueAt) : null;
  if (dueAt && Number.isNaN(dueAt.getTime())) {
    return { error: "That due date didn't read as a real date." };
  }

  try {
    await queryAs(user, async (db) => {
      const [target] = await db
        .select({ id: person.id })
        .from(person)
        .where(and(eq(person.id, personId), isNull(person.deletedAt)))
        .limit(1);
      if (!target) throw new Error("not-visible");

      await db.insert(task).values({
        tenantId: user.tenantId,
        title,
        ownerUserId: user.userId,
        dueAt,
        personId,
        loanId,
      });

      await recordAudit(db, user, {
        action: "task.created",
        entity: "person",
        entityId: personId,
        changes: { title: { from: null, to: title } },
      });
    });
  } catch {
    return { error: "We couldn't add that task. Try again." };
  }

  revalidatePath(`/people/${personId}`);
  revalidatePath("/today");
  return {};
}

// --- Bio & Online Presence ----------------------------------------------------
//
// Honesty rule (Jeremy, 2026-07-16): no web-search provider is connected here.
// "Draft bio with AI" runs a local, pure mock generator (src/lib/bio/mock.ts)
// and returns a preview — it never touches the network and never writes to
// the database on its own. Only a human clicking Accept persists anything,
// and only what's in the (possibly hand-edited) preview at that moment.

const SaveBioSchema = z.object({
  personId: z.string().uuid(),
  bio: z.string().optional(),
});

/** Manual bio edit — the always-available path, independent of any AI draft. */
export async function saveBio(_prev: NoteState, formData: FormData): Promise<NoteState> {
  const user = await requireUser();

  const parsed = SaveBioSchema.safeParse({
    personId: formData.get("personId"),
    bio: formData.get("bio") ?? undefined,
  });
  if (!parsed.success) {
    return { error: "Check the bio and try again." };
  }

  const { personId } = parsed.data;
  // An empty save clears the bio — "No bio yet" is an honest state, not a
  // placeholder to fight around.
  const bio = parsed.data.bio?.trim() || null;

  try {
    await queryAs(user, async (db) => {
      const target = await getScopedPerson(db, user, personId);

      await db
        .update(person)
        .set({ bio, updatedAt: new Date() })
        .where(eq(person.id, personId));

      await recordAudit(db, user, {
        action: "person.bio_updated",
        entity: "person",
        entityId: personId,
        changes: { bio: { from: target.bio, to: bio } },
      });
    });
  } catch {
    return { error: "We couldn't save that bio. Try again." };
  }

  revalidatePath(`/people/${personId}`);
  return {};
}

export type DraftBioState = {
  draft?: BioDraft;
  error?: string;
  /** The seed used for the last draft — "Regenerate" bumps this by one. */
  seed: number;
};

const DraftBioSchema = z.object({ personId: z.string().uuid() });

/**
 * Draft a bio with the mock generator. This is a preview only: it records an
 * audit entry (so there's a trail that a demo draft was generated) but writes
 * nothing to `person` — Accept is the only path that persists anything.
 */
export async function draftBioWithAi(
  prev: DraftBioState,
  formData: FormData,
): Promise<DraftBioState> {
  const user = await requireUser();

  const parsed = DraftBioSchema.safeParse({ personId: formData.get("personId") });
  if (!parsed.success) {
    return { ...prev, error: "We couldn't draft a bio for this record." };
  }

  const { personId } = parsed.data;
  const nextSeed = prev.seed + 1;

  try {
    const info = await queryAs(user, async (db) => {
      const target = await getScopedPerson(db, user, personId);

      await recordAudit(db, user, {
        action: "person.bio_drafted",
        entity: "person",
        entityId: personId,
        changes: { seed: { from: prev.seed, to: nextSeed } },
      });

      return target;
    });

    const draft = draftBio({
      firstName: info.firstName,
      lastName: info.lastName,
      // `person` has no company/employer field today — partners (which do)
      // reuse this same generator with their own company value.
      company: null,
      city: info.mailingAddress?.city ?? null,
      role: info.type,
      language: info.preferredLanguage,
      seed: nextSeed,
    });

    return { draft, seed: nextSeed };
  } catch {
    return { ...prev, error: "We couldn't draft a bio right now. Try again." };
  }
}

export type AcceptBioState = { error?: string; accepted?: boolean };

const AcceptBioSchema = z.object({
  personId: z.string().uuid(),
  bio: z.string().trim().min(1, "There's no draft text to save."),
  sourcesJson: z.string(),
});

/**
 * Accept a draft — the only step that writes to `person`. Persists exactly
 * the text on screen (edited or not), stamps `bioResearchedAt`, and saves the
 * sources the draft cited, so the panel can keep showing where the last
 * accepted draft said it looked. It does not touch `socialLinks` — suggested
 * links are offered separately and only saved if the team explicitly adds
 * them via the link editor.
 */
export async function acceptBioDraft(
  _prev: AcceptBioState,
  formData: FormData,
): Promise<AcceptBioState> {
  const user = await requireUser();

  const parsed = AcceptBioSchema.safeParse({
    personId: formData.get("personId"),
    bio: formData.get("bio"),
    sourcesJson: formData.get("sourcesJson"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "We couldn't save that draft." };
  }

  const { personId, bio } = parsed.data;

  let sources: BioSource[] = [];
  try {
    const rawSources: unknown = JSON.parse(parsed.data.sourcesJson);
    if (Array.isArray(rawSources)) {
      sources = rawSources.filter(
        (s): s is BioSource => Boolean(s) && typeof s === "object" && typeof (s as BioSource).label === "string",
      );
    }
  } catch {
    sources = [];
  }

  const now = new Date();

  try {
    await queryAs(user, async (db) => {
      const target = await getScopedPerson(db, user, personId);

      await db
        .update(person)
        .set({ bio, bioResearchedAt: now, bioSources: sources, updatedAt: now })
        .where(eq(person.id, personId));

      await recordAudit(db, user, {
        action: "person.bio_updated",
        entity: "person",
        entityId: personId,
        changes: {
          bio: { from: target.bio, to: bio },
          bioResearchedAt: { from: target.bioResearchedAt, to: now },
        },
      });
    });
  } catch {
    return { error: "We couldn't save that bio. Try again." };
  }

  revalidatePath(`/people/${personId}`);
  return { accepted: true };
}

const SaveSocialLinksSchema = z.object({
  personId: z.string().uuid(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  linkedin: z.string().optional(),
  youtube: z.string().optional(),
  website: z.string().optional(),
  otherJson: z.string().optional(),
});

/** Manual social-link editor — validated and normalized, never auto-saved. */
export async function saveSocialLinks(_prev: NoteState, formData: FormData): Promise<NoteState> {
  const user = await requireUser();

  const parsed = SaveSocialLinksSchema.safeParse({
    personId: formData.get("personId"),
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

  const { personId } = parsed.data;

  try {
    await queryAs(user, async (db) => {
      const target = await getScopedPerson(db, user, personId);

      await db
        .update(person)
        .set({ socialLinks: links, updatedAt: new Date() })
        .where(eq(person.id, personId));

      await recordAudit(db, user, {
        action: "person.links_updated",
        entity: "person",
        entityId: personId,
        changes: { socialLinks: { from: target.socialLinks, to: links } },
      });
    });
  } catch {
    return { error: "We couldn't save those links. Try again." };
  }

  revalidatePath(`/people/${personId}`);
  return {};
}
