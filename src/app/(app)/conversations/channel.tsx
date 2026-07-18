/**
 * Channel vocabulary for Conversations.
 *
 * Plain words a loan officer says out loud: Email, Text, Video email, App
 * message, Call, Note — never the database's enum values. The icon and the
 * label always travel together so a channel is never communicated by shape
 * alone.
 */
import {
  Mail,
  MessageSquare,
  Phone,
  Smartphone,
  StickyNote,
  Video,
  type LucideIcon,
} from "lucide-react";
import type { Channel } from "@/lib/queries/conversations";

export const CHANNEL_LABELS: Record<Channel, string> = {
  email: "Email",
  sms: "Text",
  video: "Video email",
  app: "App message",
  call: "Call",
  note: "Note",
};

const ICONS: Record<Channel, LucideIcon> = {
  email: Mail,
  sms: MessageSquare,
  video: Video,
  app: Smartphone,
  call: Phone,
  note: StickyNote,
};

export function ChannelIcon({ channel, className }: { channel: Channel; className?: string }) {
  const Icon = ICONS[channel];
  return <Icon className={className} aria-hidden />;
}

export function channelLabel(channel: Channel): string {
  return CHANNEL_LABELS[channel];
}

/**
 * How a message on this channel would reach them: an email address, a phone
 * number, or the borrower app (which has no address — it isn't connected).
 * A video email travels as an email, so it needs an address.
 */
export function sendsTo(channel: Channel): "email" | "phone" | "app" {
  if (channel === "email" || channel === "video") return "email";
  if (channel === "app") return "app";
  return "phone";
}
