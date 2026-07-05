"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type IntakeVisibilityValue = {
  closed: boolean;
  reopenTick: number;
  sessionCloseTick: number;
  close: () => void;
  reopen: () => void;
  closeSession: () => void;
};

const IntakeVisibilityContext = createContext<IntakeVisibilityValue | null>(null);

export function IntakeVisibilityProvider({ children }: { children: ReactNode }) {
  const [closed, setClosed] = useState(false);
  const [reopenTick, setReopenTick] = useState(0);
  const [sessionCloseTick, setSessionCloseTick] = useState(0);

  const value: IntakeVisibilityValue = {
    closed,
    reopenTick,
    sessionCloseTick,
    close: () => setClosed(true),
    reopen: () => {
      setClosed(false);
      setReopenTick((t) => t + 1);
    },
    closeSession: () => setSessionCloseTick((t) => t + 1),
  };

  return <IntakeVisibilityContext.Provider value={value}>{children}</IntakeVisibilityContext.Provider>;
}

export function useIntakeVisibility() {
  const ctx = useContext(IntakeVisibilityContext);
  if (!ctx) throw new Error("useIntakeVisibility must be used within IntakeVisibilityProvider");
  return ctx;
}
