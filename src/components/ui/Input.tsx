import type { InputHTMLAttributes } from "react";

/**
 * Input — `input` token from hyliox-waitlist-card.md. Border transitions to
 * `primary` on focus (hyliox-motion-system.md's `input-focus` interaction).
 */
export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement> & { className?: string }) {
  return (
    <input
      {...props}
      className={`h-12 w-full rounded-md border border-border-subtle bg-(--glass-input-bg) px-4 text-base text-on-surface placeholder:text-secondary transition-colors focus:border-primary focus:outline-none md:text-sm ${className}`}
    />
  );
}
