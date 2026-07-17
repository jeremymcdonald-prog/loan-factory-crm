/**
 * The 10-item action-based navigation — Decisions D-03, Information_Architecture §3.1.
 *
 * The order is locked. Sections whose systems ship in a later phase are marked
 * `phase`, and the UI renders them as visibly not-yet-available rather than
 * pretending they work: "Never render an integration, sync, or send state that
 * isn't real" (Design_System §1).
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
  Settings2,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** 1 = live now; 2+ = the section ships in that phase. */
  phase: 1 | 2 | 3;
  /** Roles that never see this item at all. */
  hiddenFor?: string[];
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/today", label: "Today", icon: Sun, phase: 1 },
  { href: "/pipeline", label: "Pipeline", icon: Columns3, phase: 1 },
  { href: "/people", label: "People", icon: Users, phase: 1 },
  { href: "/partners", label: "Partners", icon: Handshake, phase: 2 },
  { href: "/conversations", label: "Conversations", icon: MessagesSquare, phase: 2 },
  { href: "/marketing", label: "Marketing", icon: Megaphone, phase: 2 },
  { href: "/automations", label: "Automations", icon: Workflow, phase: 2 },
  { href: "/intelligence", label: "Intelligence", icon: ChartNoAxesCombined, phase: 2 },
  { href: "/team", label: "Team", icon: UsersRound, phase: 2 },
  { href: "/settings", label: "Settings", icon: Settings2, phase: 1 },
];

export function visibleNav(role: string): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.hiddenFor?.includes(role));
}
