"use client";

import { useEffect, useState, type ReactNode } from "react";
import { glassCard, glassCardOpaque } from "@/lib/tokens";

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
  blur = true,
}: {
  children: ReactNode;
  onClose?: () => void;
  closeLabel?: string;
  className?: string;
  // Set false for any usage that gets scaled dramatically during its own
  // entrance/exit (see glassCardOpaque) — skips backdrop-filter entirely
  // instead of fighting the browser over compositing it mid-transform.
  blur?: boolean;
}) {
  // Fresh mounts (e.g. navigating between route groups, which unmounts and
  // remounts AmbientCanvas behind this card) can paint a frame or two before
  // the browser actually promotes this element to its own backdrop-filter
  // compositing layer — the WebGL canvas shows through completely unblurred
  // for that instant, then the glass look "pops in" once the layer catches
  // up. Staying invisible (not painted at all, not a fade) for two animation
  // frames hides exactly that window instead of showing it: by the time
  // `ready` flips, the layer's already composited, so the first frame the
  // visitor actually sees is already the correct frosted look.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={`overflow-hidden rounded-lg ${blur ? glassCard : glassCardOpaque} ${ready ? "visible" : "invisible"} ${className}`}>
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
