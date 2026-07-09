"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/lib/language";
import { fadeUp, group, stagger, reducedGroup, reducedFade } from "@/lib/motion";

export default function AboutPage() {
  const { t } = useLanguage();
  const reduced = useReducedMotion();
  const sectionGroup = reduced ? reducedGroup : group(stagger.groupOffset);
  const fade = reduced ? reducedFade : fadeUp;

  return (
    <motion.section
      variants={sectionGroup}
      initial="hidden"
      animate="show"
      className="mx-auto flex max-w-2xl flex-col gap-8 text-left"
    >
      <motion.div variants={fade}>
        <h1 className="font-display text-3xl font-semibold">{t("about.heading")}</h1>
        <p className="mt-4 text-secondary">
          {/* DRAFT — replace with real positioning copy before launch. */}
          {t("about.intro")}
        </p>
      </motion.div>

      <motion.div variants={fade}>
        <h2 className="font-display text-xl font-semibold">{t("about.howIWorkHeading")}</h2>
        <p className="mt-3 text-secondary">{t("about.howIWorkBody")}</p>
      </motion.div>

      <motion.div variants={fade}>
        <h2 className="font-display text-xl font-semibold">{t("about.whatIBuildHeading")}</h2>
        <p className="mt-3 text-secondary">
          {t("about.whatIBuildBodyPrefix")}{" "}
          <a href="/work#gallery" className="text-primary hover:underline">
            {t("about.recentWorkLink")}
          </a>{" "}
          {t("about.whatIBuildBodySuffix")}
        </p>
      </motion.div>
    </motion.section>
  );
}
