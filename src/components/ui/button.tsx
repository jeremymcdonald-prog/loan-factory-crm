/**
 * Button.
 *
 * One `primary` per screen: it is the screen's single obvious action, and it
 * is Loan Factory orange, matching the primary actions in Loan Factory IQ.
 * Approve actions use it too — approving is acting, not celebrating, so it is
 * never green.
 *
 * The fill is `--action-primary` (the brand orange, deepened at the same hue
 * until a white label clears 4.5:1 — see globals.css). Full-strength
 * #F36F28 lives on the nav rail, icon chips, and focus rings, where it carries
 * no small text.
 */
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-action text-action-fg hover:bg-action-hover active:bg-action-hover shadow-e1 font-semibold",
  secondary:
    "bg-surface text-primary border border-strong hover:bg-sunken hover:border-strong active:bg-sunken font-semibold shadow-e1",
  ghost: "text-secondary hover:bg-sunken hover:text-primary font-medium",
  danger:
    "bg-critical-bg text-critical border border-critical-border hover:bg-critical/10 font-semibold",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-small gap-1.5",
  md: "h-9 px-3.5 text-body gap-2",
  lg: "h-11 px-5 text-body gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-control whitespace-nowrap",
        "transition-colors duration-100",
        "disabled:pointer-events-none disabled:opacity-45",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
