"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
import { PlasmaLogoMark } from "@/components/marketing/PlasmaLogoMark";
import { PhoneMockup } from "@/components/marketing/PhoneMockup";
import { GlowButton } from "@/components/marketing/GlowButton";
import { GradientHeading } from "@/components/ui/GradientHeading";
import { glassCard } from "@/lib/tokens";

const DOCK_BOOST_FALLOFF = 0.55;

function BellIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9 6 9-6" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 14.5l5-5M8 15.5l-1.5 1.5a3 3 0 004 4l3-3M16 8.5l1.5-1.5a3 3 0 00-4-4l-3 3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

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

function GlowButtonPreview() {
  const router = useRouter();
  return <GlowButton onClick={() => router.push("/work")}>Start a Project</GlowButton>;
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
    case "plasma-logo-mark":
      return <PlasmaLogoMark className="h-24 w-48" />;
    case "phone-mockup":
      return (
        <div className="flex justify-center py-6" style={{ transform: "scale(0.7)" }}>
          <PhoneMockup
            eyebrow="Live Preview"
            title="Your Workspace"
            chatPlaceholder="Ask anything…"
            chatPrompt="Design a portfolio site for a photographer."
            notifications={[
              { icon: <BellIcon />, title: "New message", time: "2m" },
              { icon: <MailIcon />, title: "Invite sent", time: "5m" },
              { icon: <LinkIcon />, title: "Generating…" },
              { icon: <CheckIcon />, title: "Deploy complete", time: "1h" },
            ]}
          />
        </div>
      );
    case "glow-button":
      return <GlowButtonPreview />;
    case "gradient-heading":
      return (
        <ReplayableMotionPreview>
          {(key) => (
            <div key={key} className="text-center">
              <GradientHeading as="h1" className="text-3xl font-bold tracking-tight sm:text-4xl">
                Tell me about the project,
              </GradientHeading>
              <GradientHeading as="h1" variant="silver" delay={0.6} className="text-3xl font-extrabold tracking-tighter sm:text-4xl">
                we&apos;ll design it.
              </GradientHeading>
            </div>
          )}
        </ReplayableMotionPreview>
      );
    default:
      return null;
  }
}
