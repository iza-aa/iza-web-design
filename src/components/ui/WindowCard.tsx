"use client";

import type { ReactNode } from "react";
import { glassCard } from "@/lib/tokens";

/**
 * WindowCard — the `card` token from hyliox-waitlist-card.md staged as a
 * floating OS window: a chrome bar (single functional red mac-style dot when
 * `onClose` is passed) above the content slot.
 */
export function WindowCard({
  children,
  onClose,
  closeLabel = "Close",
  className = "",
}: {
  children: ReactNode;
  onClose?: () => void;
  closeLabel?: string;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-lg ${glassCard} ${className}`}>
      <div className="flex items-center border-b border-(--glass-border) px-5 py-3">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="group flex h-3 w-3 items-center justify-center rounded-full bg-[#FF5F57] transition-transform hover:scale-110"
          >
            <span className="text-[8px] font-bold leading-none text-[#4d0000] opacity-0 group-hover:opacity-100">
              &times;
            </span>
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
