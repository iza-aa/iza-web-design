/**
 * Framer Motion variants — mirrors docs/hyliox-motion-system.md.
 * Every element gets its own complete variants pair; parents only
 * orchestrate stagger timing, never carry a visible transform.
 */

export const stagger = {
  childDelay: 0.06,
  groupOffset: 0.12,
} as const;

export const easing = {
  standard: [0.16, 1, 0.3, 1],
  emphasized: [0.34, 1.56, 0.64, 1],
} as const;

export const durations = {
  fast: 0.2,
  base: 0.4,
  slow: 0.7,
} as const;

export function group(delayChildren = 0) {
  return {
    hidden: {},
    show: {
      transition: { staggerChildren: stagger.childDelay, delayChildren },
    },
  };
}

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.base, ease: easing.standard },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: durations.base, ease: easing.standard },
  },
};

export const popIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: durations.base, ease: easing.emphasized },
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: durations.base, ease: easing.standard },
  },
};

// Reduced-motion override: opacity-only, fast, no stagger, no spring.
export const reducedGroup = {
  hidden: {},
  show: { transition: { staggerChildren: 0, delayChildren: 0 } },
};

export const reducedFade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: durations.fast, ease: easing.standard } },
};
