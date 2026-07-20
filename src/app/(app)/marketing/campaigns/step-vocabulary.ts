/**
 * Campaign step vocabulary — channels, per-channel field labels, and limits
 * for the multi-step drip model backed by `campaign_step`
 * (src/db/schema.ts, src/lib/queries/campaign-steps.ts).
 *
 * Pure and client-safe (no `server-only`): read by both the server-rendered
 * step list on the campaign detail page and the client step editor.
 *
 * Language model (documented once, here, since both the detail page and the
 * editor rely on it): `language` is a plain per-step field, same as the
 * schema already provides. There is no cross-row linking between a step and
 * its translations — a "Spanish version of step 3" is just another step row,
 * inserted immediately after the original with the same channel/delay/
 * template but blank content, so a human writes and reviews that language's
 * copy fresh rather than the CRM machine-translating it. This keeps every
 * other operation (reorder, duplicate, delete, re-persisting positions)
 * uniform — one code path for every step in the sequence, English or not —
 * at the cost of a language sibling's delay/channel being able to drift from
 * its original if one is edited later. That trade-off is acceptable: each
 * row already needs independent human translation review regardless.
 */
import {
  Bell,
  Mail,
  MessageSquare,
  Phone,
  Smartphone,
  Video,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import type { StepChannelValue, StepLanguageValue } from "@/lib/queries/campaign-steps";

export const STEP_CHANNELS = [
  "email",
  "sms",
  "task",
  "call",
  "video",
  "app",
  "notification",
] as const satisfies readonly StepChannelValue[];

export type StepChannel = (typeof STEP_CHANNELS)[number];

export function isStepChannel(value: string): value is StepChannel {
  return (STEP_CHANNELS as readonly string[]).includes(value);
}

export type StepChannelInfo = {
  label: string;
  icon: LucideIcon;
  /** True when a recipient receives this step; false for internal reminders. */
  recipientFacing: boolean;
  hint: string;
};

export const STEP_CHANNEL_INFO: Record<StepChannel, StepChannelInfo> = {
  email: {
    label: "Email",
    icon: Mail,
    recipientFacing: true,
    hint: "Goes to the recipient's inbox.",
  },
  sms: {
    label: "Text message",
    icon: MessageSquare,
    recipientFacing: true,
    hint: "Goes to the recipient's phone as a text.",
  },
  task: {
    label: "Task",
    icon: ListChecks,
    recipientFacing: false,
    hint: "Creates a to-do for you — nothing goes to the recipient.",
  },
  call: {
    label: "Call",
    icon: Phone,
    recipientFacing: false,
    hint: "Creates a call reminder for you — nothing goes to the recipient automatically.",
  },
  video: {
    label: "Video",
    icon: Video,
    recipientFacing: true,
    hint: "A recorded video message. Demo convention: the recording itself is never stored — only its title and script.",
  },
  app: {
    label: "In-app message",
    icon: Smartphone,
    recipientFacing: true,
    hint: "Shows to the recipient inside their client portal, once one exists.",
  },
  notification: {
    label: "Notification",
    icon: Bell,
    recipientFacing: true,
    hint: "A push notification to the recipient's device, once sending is connected.",
  },
};

export function stepChannelLabel(channel: string): string {
  return STEP_CHANNEL_INFO[channel as StepChannel]?.label ?? channel;
}

/** Which content fields make sense for a channel, and what to call them. */
export type StepFieldSet = {
  showSubject: boolean;
  subjectLabel: string;
  showBody: boolean;
  bodyLabel: string;
  bodyHint?: string;
};

const STEP_FIELD_SETS: Record<StepChannel, StepFieldSet> = {
  email: { showSubject: true, subjectLabel: "Subject", showBody: true, bodyLabel: "Email body" },
  video: {
    showSubject: true,
    subjectLabel: "Video title",
    showBody: true,
    bodyLabel: "Script",
    bodyHint: "No recording is stored here — only the title and this script.",
  },
  sms: { showSubject: false, subjectLabel: "", showBody: true, bodyLabel: "Text message" },
  app: { showSubject: false, subjectLabel: "", showBody: true, bodyLabel: "In-app message" },
  notification: {
    showSubject: false,
    subjectLabel: "",
    showBody: true,
    bodyLabel: "Notification text",
  },
  task: {
    showSubject: true,
    subjectLabel: "Task title",
    showBody: true,
    bodyLabel: "Task description",
  },
  call: {
    showSubject: true,
    subjectLabel: "Call reason",
    showBody: true,
    bodyLabel: "Talking points",
  },
};

export function stepFieldSet(channel: StepChannel): StepFieldSet {
  return STEP_FIELD_SETS[channel];
}

/** "Immediately" for day 0, "Day N" otherwise — the legacy drip list's convention, kept. */
export function delayLabel(delayDays: number): string {
  return delayDays <= 0 ? "Immediately" : `Day ${delayDays}`;
}

/** More steps than this is not a sequence, it's a maze. */
export const MAX_CAMPAIGN_STEPS = 30;

/**
 * Languages a step's content can be translated into, beyond English — the
 * same three the rest of the marketing module offers (see
 * CAMPAIGN_LANGUAGE_CODES in ../vocabulary.ts) for the same reason: no
 * reviewed Chinese copy exists yet.
 */
export const STEP_TRANSLATION_LANGUAGES = ["es", "vi", "ru"] as const satisfies readonly StepLanguageValue[];

export type StepTranslationLanguage = (typeof STEP_TRANSLATION_LANGUAGES)[number];
