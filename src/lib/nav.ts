/**
 * The 10-item action-based navigation — Decisions D-03, Information_Architecture §3.1.
 * The order is locked. Every item opens a working, database-backed screen.
 */
import type { LucideIcon } from "lucide-react";
import {
  Sun,
  Columns3,
  Users,
  Handshake,
  MessagesSquare,
  Megaphone,
  Workflow,
  ChartNoAxesCombined,
  UsersRound,
  MonitorPlay,
  Settings2,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Roles that never see this item at all. */
  hiddenFor?: string[];
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/today", label: "Today", icon: Sun },
  { href: "/pipeline", label: "Pipeline", icon: Columns3 },
  { href: "/people", label: "People", icon: Users },
  { href: "/partners", label: "Partners", icon: Handshake },
  { href: "/conversations", label: "Conversations", icon: MessagesSquare },
  { href: "/marketing", label: "Marketing", icon: Megaphone },
  { href: "/automations", label: "Automations", icon: Workflow },
  { href: "/intelligence", label: "Intelligence", icon: ChartNoAxesCombined },
  { href: "/team", label: "Team", icon: UsersRound },
  { href: "/videos", label: "How To Videos", icon: MonitorPlay },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

export function visibleNav(role: string): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.hiddenFor?.includes(role));
}
