/**
 * Form primitives — Design_System.md §13.
 * Labels are always visible (never placeholder-as-label). Errors are specific
 * and state what to do, in plain language.
 */
import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const CONTROL =
  "h-9 w-full rounded-md border border-strong bg-sunken px-3 text-body text-primary " +
  "placeholder:text-disabled transition-colors " +
  "focus:border-action focus:outline-none focus-visible:outline-none " +
  "disabled:opacity-50";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-label font-semibold text-secondary">
        {label}
        {required ? <span className="ml-0.5 text-critical">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="text-small text-critical" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-small text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(CONTROL, className)} {...props} />
  ),
);
Input.displayName = "Input";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(CONTROL, "pr-8", className)} {...props}>
      {children}
    </select>
  ),
);
Select.displayName = "Select";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  InputHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(CONTROL, "h-auto min-h-20 py-2 leading-[1.375rem]", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";
