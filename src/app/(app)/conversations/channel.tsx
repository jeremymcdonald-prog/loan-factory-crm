/**
 * Channel vocabulary for Conversations.
 *
 * Plain words a loan officer says out loud: Email, Text, Call, Note — never
 * the database's enum values. The icon and the label always travel together so
 * a channel is never communicated by shape alone.
 */
import { Mail, MessageSquare, Phone, StickyNote, type LucideIcon } from "lucide-react";
import type { Channel } from "@/lib/queries/conversations";

export const CHANNEL_LABELS: Record<Channel, string> = {
  email: "Email",
  sms: "Text",
  call: "Call",
  note: "Note",
};

const ICONS: Record<Channel, LucideIcon> = {
  email: Mail,
  sms: MessageSquare,
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

/** How a reply on this channel would reach them: an address, or a number. */
export function sendsTo(channel: Channel): "email" | "phone" {
  return channel === "email" ? "email" : "phone";
}
