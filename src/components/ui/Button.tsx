"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

/**
 * Button — button-primary/secondary/tertiary tokens from
 * hyliox-waitlist-card.md. Only `primary` gets hover/tap micro-motion
 * (hyliox-motion-system.md reserves `emphasized` easing for the primary
 * button and the logo mark, nothing else).
 */

type ButtonVariant = "primary" | "secondary" | "tertiary";

const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  primary: "h-11 px-[22px] bg-primary text-primary-contrast",
  secondary: "h-11 px-[22px] border border-border-subtle text-on-surface bg-transparent hover:border-primary",
  tertiary: "h-auto p-0 text-sm text-secondary hover:text-on-surface bg-transparent",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: {
  variant?: ButtonVariant;
  className?: string;
} & HTMLMotionProps<"button">) {
  const classes = `${base} ${variants[variant]} ${className}`;

  if (variant === "primary") {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
        className={classes}
        {...props}
      >
        {children}
      </motion.button>
    );
  }

  return (
    <motion.button className={classes} {...props}>
      {children}
    </motion.button>
  );
}
