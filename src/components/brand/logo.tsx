/**
 * Brand marks — the official Loan Factory logo, used as supplied.
 *
 * These render the real asset files in public/brand/. Nothing here redraws or
 * approximates the logo:
 *   loan-factory-wordmark.png        the supplied logo, cropped to its own
 *                                    bounding box, white background removed
 *   loan-factory-wordmark-light.png  the same file with only the dark
 *                                    letterforms lightened for the navy
 *                                    sidebar; the orange marks are untouched
 *   loan-factory-mark.png            the "O" glyph lifted from the logo, for
 *                                    square placements
 */
import Image from "next/image";
import { cn } from "@/lib/cn";

import wordmark from "../../../public/brand/loan-factory-wordmark.png";
import wordmarkLight from "../../../public/brand/loan-factory-wordmark-light.png";
import mark from "../../../public/brand/loan-factory-mark.png";

/** The square "O" mark. Use where a wordmark won't fit. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src={mark}
      alt=""
      aria-hidden
      priority
      className={cn("size-6 shrink-0 object-contain", className)}
    />
  );
}

/**
 * The full wordmark.
 *
 * `onDark` selects the light-letter variant for the navy sidebar and the
 * sign-in panel. The product name is set beside it rather than baked into the
 * image, so "CRM" never distorts the logo itself.
 */
export function Wordmark({
  className,
  onDark = false,
  showProduct = true,
  size = "md",
}: {
  className?: string;
  onDark?: boolean;
  showProduct?: boolean;
  size?: "md" | "lg";
}) {
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <Image
        src={onDark ? wordmarkLight : wordmark}
        alt="Loan Factory"
        priority
        className={cn(
          // max-w-full lets the mark scale down inside a tight rail instead of
          // clipping against the navigation boundary.
          "h-auto w-auto max-w-full shrink-0 object-contain object-left",
          size === "lg" ? "max-h-[22px]" : "max-h-[18px]",
        )}
      />
      {showProduct ? (
        <span
          className={cn(
            "font-semibold tracking-tight",
            size === "lg" ? "text-h3" : "text-body",
            onDark ? "text-sidebar-fg-muted" : "text-muted",
          )}
        >
          CRM
        </span>
      ) : null}
    </span>
  );
}
