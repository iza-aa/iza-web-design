import type { TextareaHTMLAttributes } from "react";

/**
 * Textarea — `textarea` token from hyliox-waitlist-card.md. Shares the
 * `input` visual language (fill, border, radius); only the min-height and
 * resize handle differ.
 */
export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { className?: string }) {
  return (
    <textarea
      {...props}
      className={`min-h-26 w-full resize-y rounded-md border border-border-subtle bg-(--glass-input-bg) px-4 py-3.5 text-base text-on-surface placeholder:text-secondary transition-colors focus:border-primary focus:outline-none md:text-sm ${className}`}
    />
  );
}
