/**
 * Button — Design_System.md §7.
 *
 * One `primary` per screen: it is the screen's single obvious action. Approve
 * actions use primary blue, never green — approving is acting, not celebrating
 * (§4.4). Minimum touch target 36px; 44px on mobile via `size="lg"`.
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
    "bg-surface text-primary border border-strong hover:bg-raised active:bg-raised font-semibold",
  ghost: "text-secondary hover:bg-raised hover:text-primary font-medium",
  danger:
    "bg-critical-bg text-critical border border-critical/30 hover:bg-critical/15 font-semibold",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-2.5 text-small gap-1.5",
  md: "h-9 px-3.5 text-body gap-2",
  lg: "h-11 px-4 text-body gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-md whitespace-nowrap",
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
