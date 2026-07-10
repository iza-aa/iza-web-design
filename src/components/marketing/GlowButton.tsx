"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

const GLOW_BUTTON_STYLES = `
  .iza-glow-pill {
      position: relative;
      overflow: hidden;
      box-shadow: 0 1px 2px rgba(0,0,0,0.4), 0 10px 24px -10px rgba(0,0,0,0.5);
      transition: transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275), box-shadow 0.4s ease;
  }
  .iza-glow-pill::before {
      content: "";
      position: absolute; inset: 0;
      background: linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%);
      transform: translateX(-120%);
      transition: transform 0.6s ease;
      pointer-events: none;
  }
  .iza-glow-pill:hover,
  .iza-glow-pill.is-active {
      transform: translateY(-2px);
      box-shadow:
          0 2px 4px rgba(0,0,0,0.4),
          0 12px 28px -4px rgba(59,130,246,0.45),
          0 0 44px 8px rgba(59,130,246,0.35),
          0 22px 44px -10px rgba(0,0,0,0.55);
  }
  .iza-glow-pill:hover::before,
  .iza-glow-pill.is-active::before {
      transform: translateX(120%);
  }
`;

const ACTIVE_DELAY_MS = 450;

function DefaultArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 7h9M7.5 3l4 4-4 4" />
    </svg>
  );
}

export function GlowButton({
  children,
  onClick,
  href,
  icon = <DefaultArrowIcon />,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  icon?: ReactNode | null;
  className?: string;
}) {
  const [active, setActive] = useState(false);

  function handleTap() {
    if (active) return;
    setActive(true);
    setTimeout(() => onClick?.(), ACTIVE_DELAY_MS);
  }

  const classes = `iza-glow-pill inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white ${active ? "is-active" : ""} ${className}`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOW_BUTTON_STYLES }} />
      {href ? (
        <Link href={href} onClick={handleTap} className={classes}>
          {children}
          {icon}
        </Link>
      ) : (
        <button type="button" onClick={handleTap} className={classes}>
          {children}
          {icon}
        </button>
      )}
    </>
  );
}
