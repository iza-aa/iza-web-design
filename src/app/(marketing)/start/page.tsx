"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/lib/language";
import { fadeUp, group, stagger, reducedGroup, reducedFade } from "@/lib/motion";

export default function StartPage() {
  const { t } = useLanguage();
  const reduced = useReducedMotion();
  const sectionGroup = reduced ? reducedGroup : group(stagger.childDelay);
  const fade = reduced ? reducedFade : fadeUp;

  return (
    <motion.section
      variants={sectionGroup}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center gap-4 text-center"
    >
      <motion.h1 variants={fade} className="font-display text-3xl font-semibold">
        {t("start.heading")}
      </motion.h1>
      <motion.p variants={fade} className="max-w-112 text-secondary">
        {t("start.body")}
      </motion.p>
      <motion.div variants={fade}>
        <Link href="/" className="text-sm font-medium text-secondary hover:text-on-surface">
          &larr; {t("common.backHome")}
        </Link>
      </motion.div>
    </motion.section>
  );
}
