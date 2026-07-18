"use client";

import { useEffect, useRef } from "react";
import type { DomeGridBackground, DomeThemeColors } from "@/components/canvas/3d";
import { canCreateWebGLContext, markAmbientReady } from "@/components/canvas/ambient-ready";
import { useTheme } from "@/lib/theme";

// Flat two-tone by design: white bg / black grid in light mode, black bg /
// white grid in dark mode — not derived from the brand tokens, per explicit
// request (2026-07-19).
function readThemeColors(): DomeThemeColors {
  const isLight = document.documentElement.classList.contains("light");
  const bg = isLight ? "#ffffff" : "#000000";
  const line = isLight ? "#000000" : "#ffffff";
  return {
    baseColorDim: bg,
    baseColorGlow: bg,
    lineColor: line,
    facetOpacity: isLight ? 0.12 : 0.14,
  };
}

export function DomeGridCanvas({
  className = "pointer-events-none fixed inset-x-0 top-0 -z-10 h-dvh w-full",
}: { className?: string } = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const domeRef = useRef<DomeGridBackground | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isLowPower = (navigator.hardwareConcurrency || 4) <= 2;
    if (isLowPower || typeof window.WebGLRenderingContext === "undefined" || !canCreateWebGLContext()) {
      markAmbientReady(); // no canvas coming — the layout's static gradient shows through instead
      return;
    }
    (window as Window & { __ambientState?: string }).__ambientState = "pending";

    let disposed = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    import("@/components/canvas/3d")
      .then(({ DomeGridBackground: DomeGridBackgroundCtor }) => {
        if (disposed || !container) return;
        const dome = new DomeGridBackgroundCtor(container, { reducedMotion, ...readThemeColors() });
        domeRef.current = dome;
        markAmbientReady();
      })
      .catch(() => {
        markAmbientReady();
      });

    return () => {
      disposed = true;
      domeRef.current?.dispose();
      domeRef.current = null;
    };
  }, []);

  // Live recolor on theme toggle — no remount, no flash.
  useEffect(() => {
    domeRef.current?.updateTheme(readThemeColors());
  }, [theme]);

  return <div ref={containerRef} aria-hidden className={className} />;
}
