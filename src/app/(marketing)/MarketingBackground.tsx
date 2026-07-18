"use client";

import { usePathname } from "next/navigation";
import { AmbientCanvas } from "@/components/canvas/AmbientCanvas";
import { DomeGridCanvas } from "@/components/canvas/DomeGridCanvas";

// /work gets the dome-grid background (3d.ts) over a flat black/white
// fallback; every other marketing page keeps the retro-CRT halftone canvas
// over the original blue-tinted gradient. Branching here — the layout's
// single mount point — rather than stacking both canvases avoids z-index
// collisions and two live WebGL contexts at once.
export function MarketingBackground() {
  const pathname = usePathname();

  if (pathname?.startsWith("/work")) {
    return (
      <>
        <div aria-hidden className="stage-fallback-bg fixed inset-x-0 top-0 -z-10 h-dvh w-full" />
        <DomeGridCanvas />
      </>
    );
  }

  return (
    <>
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 -z-10 h-dvh w-full bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(59,130,246,0.16),transparent),radial-gradient(ellipse_60%_50%_at_100%_100%,rgba(156,163,175,0.08),transparent)]"
      />
      <AmbientCanvas />
    </>
  );
}
