"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { popIn, reducedFade } from "@/lib/motion";

/**
 * PopIn — opacity + scale 0.85→1, `easing.emphasized` (overshoot). Reserve
 * for the same small set of elements the motion system allows emphasized
 * easing on (per hyliox-motion-system.md), not general-purpose entrances.
 */
export function PopIn(props: HTMLMotionProps<"div">) {
  const reduced = useReducedMotion();
  return <motion.div variants={reduced ? reducedFade : popIn} {...props} />;
}
