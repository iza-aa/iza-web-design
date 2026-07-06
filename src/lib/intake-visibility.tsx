"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type IntakeVisibilityValue = {
  closed: boolean;
  reopenTick: number;
  closeTick: number;
  sessionCloseTick: number;
  close: () => void;
  reopen: () => void;
  closeSession: () => void;
  // Scroll-driven show/hide (no scrollIntoView, unlike reopen()) — used by
  // the auto-close-on-scroll-down / auto-reopen-on-scroll-up behavior, which
  // must not fight the user's own scroll with a competing smooth-scroll.
  setAutoVisible: (visible: boolean) => void;
};

const IntakeVisibilityContext = createContext<IntakeVisibilityValue | null>(null);

export function IntakeVisibilityProvider({ children }: { children: ReactNode }) {
  const [closed, setClosed] = useState(false);
  const [reopenTick, setReopenTick] = useState(0);
  // Only bumped by the explicit close() (the card's own X button) — not by
  // setAutoVisible(false), so the home page's scroll-to-gallery effect can't
  // fire off the scroll-driven auto-hide too (that would fight the user's
  // own in-progress scroll with a competing smooth-scroll).
  const [closeTick, setCloseTick] = useState(0);
  const [sessionCloseTick, setSessionCloseTick] = useState(0);

  const value: IntakeVisibilityValue = {
    closed,
    reopenTick,
    closeTick,
    sessionCloseTick,
    close: () => {
      setClosed(true);
      setCloseTick((t) => t + 1);
    },
    reopen: () => {
      setClosed(false);
      setReopenTick((t) => t + 1);
    },
    closeSession: () => setSessionCloseTick((t) => t + 1),
    setAutoVisible: (visible: boolean) => setClosed(!visible),
  };

  return <IntakeVisibilityContext.Provider value={value}>{children}</IntakeVisibilityContext.Provider>;
}

export function useIntakeVisibility() {
  const ctx = useContext(IntakeVisibilityContext);
  if (!ctx) throw new Error("useIntakeVisibility must be used within IntakeVisibilityProvider");
  return ctx;
}
