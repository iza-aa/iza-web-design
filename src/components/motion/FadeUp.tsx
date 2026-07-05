"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { fadeUp, reducedFade } from "@/lib/motion";

/**
 * FadeUp — opacity + 16px rise, `easing.standard`. Auto-swaps to an
 * opacity-only reduced variant under prefers-reduced-motion so callers
 * never have to branch on useReducedMotion themselves.
 */
export function FadeUp(props: HTMLMotionProps<"div">) {
  const reduced = useReducedMotion();
  return <motion.div variants={reduced ? reducedFade : fadeUp} {...props} />;
}
