"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { scaleIn, reducedFade } from "@/lib/motion";

/**
 * ScaleIn — opacity + scale 0.96→1, `easing.standard`. The subtle,
 * non-overshoot alternative to PopIn for cards/panels entering the layout.
 */
export function ScaleIn(props: HTMLMotionProps<"div">) {
  const reduced = useReducedMotion();
  return <motion.div variants={reduced ? reducedFade : scaleIn} {...props} />;
}
