"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import logoIza from "@/assets/logo/logoiza.png";
import logoComponent from "@/assets/logo/logocomponent.png";
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
import { glassCard } from "@/lib/tokens";

const DOCK_BOOST_FALLOFF = 0.55;

function DockItemPreview() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const entries = [
    {
      key: "work",
      label: "Work",
      active: true,
      icon: (
        <div className="relative h-full w-full overflow-hidden rounded-sm">
          <Image src={logoIza} alt="" fill sizes="48px" className="object-cover" />
        </div>
      ),
    },
    {
      key: "components",
      label: "Components",
      active: false,
      icon: (
        <div className="relative h-full w-full overflow-hidden rounded-sm">
          <Image src={logoComponent} alt="" fill sizes="48px" className="object-cover" />
        </div>
      ),
    },
  ];

  return (
    <div className={`flex items-end gap-3 rounded-md px-2 pt-2 pb-2 ${glassCard}`}>
      {entries.map((entry, i) => (
        <DockItem
          key={entry.key}
          label={entry.label}
          active={entry.active}
          icon={entry.icon}
          boost={hoveredIndex === null ? 0 : Math.max(0, 1 - Math.abs(i - hoveredIndex) * DOCK_BOOST_FALLOFF)}
          onHoverStart={() => setHoveredIndex(i)}
          onHoverEnd={() => setHoveredIndex((h) => (h === i ? null : h))}
        />
      ))}
    </div>
  );
}

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
      return <DockItemPreview />;
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
