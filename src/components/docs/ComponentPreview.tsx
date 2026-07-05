"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { WindowCard } from "@/components/ui/WindowCard";
import { LogoMark } from "@/components/ui/LogoMark";
import { DockItem } from "@/components/ui/DockItem";
import { FadeUp } from "@/components/motion/FadeUp";
import { PopIn } from "@/components/motion/PopIn";
import { ScaleIn } from "@/components/motion/ScaleIn";
import { AmbientCanvas } from "@/components/canvas/AmbientCanvas";

function ReplayableMotionPreview({ children }: { children: (key: number) => ReactNode }) {
  const [key, setKey] = useState(0);
  return (
    <div className="flex flex-col items-center gap-4">
      {children(key)}
      <button
        type="button"
        onClick={() => setKey((k) => k + 1)}
        className="rounded-md px-3 py-1 text-xs font-medium text-secondary transition-colors hover:text-on-surface"
      >
        Replay
      </button>
    </div>
  );
}

export function ComponentPreview({ slug }: { slug: string }) {
  switch (slug) {
    case "button":
      return (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="primary">Start a Project</Button>
          <Button variant="secondary">Learn more</Button>
          <Button variant="tertiary">Already have an invite?</Button>
        </div>
      );
    case "input":
      return (
        <div className="w-full max-w-80">
          <Input placeholder="Enter your email address…" />
        </div>
      );
    case "textarea":
      return (
        <div className="w-full max-w-96">
          <Textarea placeholder="Describe what you're trying to build…" rows={3} />
        </div>
      );
    case "window-card":
      return (
        <div className="w-full max-w-96">
          <WindowCard onClose={() => {}}>
            <div className="p-6 text-center">
              <p className="font-display text-lg font-semibold">Window content</p>
              <p className="mt-1 text-sm text-secondary">Chrome bar + glass body.</p>
            </div>
          </WindowCard>
        </div>
      );
    case "logo-mark":
      return <LogoMark size={64} />;
    case "dock-item":
      return (
        <div className="flex items-center gap-3 rounded-full border border-border-subtle p-2">
          <DockItem
            label="Work"
            active
            icon={
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#0A0A0B] font-display text-sm font-bold text-primary-contrast">
                I
              </div>
            }
          />
          <DockItem
            label="Components"
            icon={
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-xs font-bold text-[#0A0A0B]">
                {"</>"}
              </div>
            }
          />
        </div>
      );
    case "fade-up":
      return (
        <ReplayableMotionPreview>
          {(key) => (
            <FadeUp key={key} initial="hidden" animate="show" className="rounded-lg border border-border-subtle px-6 py-4 text-sm text-on-surface">
              Fades up 16px on entrance
            </FadeUp>
          )}
        </ReplayableMotionPreview>
      );
    case "pop-in":
      return (
        <ReplayableMotionPreview>
          {(key) => (
            <PopIn key={key} initial="hidden" animate="show">
              <LogoMark size={64} />
            </PopIn>
          )}
        </ReplayableMotionPreview>
      );
    case "scale-in":
      return (
        <ReplayableMotionPreview>
          {(key) => (
            <ScaleIn key={key} initial="hidden" animate="show" className="w-full max-w-72">
              <WindowCard>
                <div className="p-5 text-center text-sm">Scales in from 0.96</div>
              </WindowCard>
            </ScaleIn>
          )}
        </ReplayableMotionPreview>
      );
    case "ambient-canvas":
      return (
        <div className="relative h-56 w-full overflow-hidden rounded-lg border border-border-subtle bg-(--glass-bg)">
          <AmbientCanvas className="absolute inset-0" />
        </div>
      );
    default:
      return null;
  }
}
