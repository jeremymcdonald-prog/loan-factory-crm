import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Class merging that understands our design tokens.
 *
 * tailwind-merge only knows stock Tailwind class names. Our theme defines
 * custom colour tokens (`text-action-fg`) and custom font-size tokens
 * (`text-body`) that both look like `text-*`, so out of the box it treats them
 * as conflicting and silently drops one — which is how a primary button loses
 * its label colour. Registering the token names in the right class groups
 * teaches it the difference.
 *
 * Keep these lists in sync with the `@theme` blocks in app/globals.css.
 */

const FONT_SIZES = [
  "metric-lg",
  "metric-md",
  "h1",
  "h2",
  "h3",
  "body",
  "small",
  "label",
  "micro",
];

const COLORS = [
  "canvas",
  "surface",
  "raised",
  "sunken",
  "sidebar",
  "subtle",
  "strong",
  "primary",
  "secondary",
  "muted",
  "disabled",
  "action",
  "action-hover",
  "action-fg",
  "brand",
  "ally",
  "ally-bg",
  "ally-border",
  "critical",
  "critical-bg",
  "warning",
  "warning-bg",
  "healthy",
  "healthy-bg",
  "info",
  "info-bg",
  "neutral",
  "neutral-bg",
  "sidebar-fg",
  "sidebar-fg-muted",
  "sidebar-fg-dim",
  "sidebar-hover",
  "sidebar-active",
  "sidebar-border",
];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: FONT_SIZES }],
      "text-color": [{ text: COLORS }],
      "bg-color": [{ bg: COLORS }],
      "border-color": [{ border: COLORS }],
      "shadow": [{ shadow: ["e1", "e2", "e3"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
