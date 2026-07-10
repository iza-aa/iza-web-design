"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

const MATTE_STYLE: CSSProperties = {
  color: "var(--color-on-surface)",
  textShadow:
    "0 10px 30px color-mix(in srgb, var(--color-on-surface) 20%, transparent), 0 2px 4px color-mix(in srgb, var(--color-on-surface) 10%, transparent)",
};

const SILVER_STYLE: CSSProperties = {
  background: "linear-gradient(180deg, var(--color-on-surface) 0%, color-mix(in srgb, var(--color-on-surface) 40%, transparent) 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  filter:
    "drop-shadow(0px 10px 20px color-mix(in srgb, var(--color-on-surface) 15%, transparent)) drop-shadow(0px 2px 4px color-mix(in srgb, var(--color-on-surface) 10%, transparent))",
};

const MATTE_REVEAL = {
  initial: { opacity: 0, y: 24, filter: "blur(12px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] as const },
};

const SILVER_REVEAL = {
  initial: { clipPath: "inset(0 100% 0 0)" },
  animate: { clipPath: "inset(0 0% 0 0)" },
  transition: { duration: 1.1, ease: [0.77, 0, 0.18, 1] as const },
};

const TAGS = ["h1", "h2", "h3"] as const;

export function GradientHeading({
  as = "h1",
  variant = "matte",
  animate = true,
  delay = 0,
  children,
  className = "",
}: {
  as?: (typeof TAGS)[number];
  variant?: "matte" | "silver";
  animate?: boolean;
  delay?: number;
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as];
  const reveal = variant === "silver" ? SILVER_REVEAL : MATTE_REVEAL;
  const play = animate && !reduced;

  return (
    <MotionTag
      className={className}
      style={variant === "silver" ? SILVER_STYLE : MATTE_STYLE}
      initial={play ? reveal.initial : false}
      animate={play ? reveal.animate : undefined}
      transition={{ ...reveal.transition, delay }}
    >
      {children}
    </MotionTag>
  );
}
