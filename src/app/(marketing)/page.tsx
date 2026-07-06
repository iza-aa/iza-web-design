"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { IntakeHero } from "@/components/marketing/IntakeHero";
import { IntakeStepGuide } from "@/components/marketing/IntakeStepGuide";
import { DesignGalleryGrid } from "@/components/gallery/DesignGalleryGrid";
import { fadeUp, group, stagger, reducedGroup, reducedFade } from "@/lib/motion";
import { glassCard } from "@/lib/tokens";
import { useIntakeVisibility } from "@/lib/intake-visibility";
import { useLanguage } from "@/lib/language";

const featureBlurbs = [
  { titleKey: "homepage.feature1Title", bodyKey: "homepage.feature1Body", position: "left-[9%] top-[1%] text-left" },
  { titleKey: "homepage.feature2Title", bodyKey: "homepage.feature2Body", position: "left-[10%] bottom-[9%] text-left" },
  { titleKey: "homepage.feature3Title", bodyKey: "homepage.feature3Body", position: "right-[5%] top-[22%] text-left" },
  { titleKey: "homepage.feature4Title", bodyKey: "homepage.feature4Body", position: "right-[8%] bottom-[6%] text-left" },
];

export default function HomePage() {
  const reduced = useReducedMotion();
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const { reopenTick, closeTick, closed } = useIntakeVisibility();
  const { t } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  const headlineGroup = reduced ? reducedGroup : group(stagger.groupOffset);
  const fade = reduced ? reducedFade : fadeUp;
  const blurbGroup = reduced ? reducedGroup : group(0.25);

  useEffect(() => {
    if (reopenTick === 0) return;
    heroRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [reopenTick]);

  // Closing the intro card (its own X button, not the scroll-driven auto-hide
  // — see closeTick's definition) drops the visitor straight into the design
  // gallery instead of leaving them stranded on a now-empty hero. Delayed to
  // match the intro card's own 0.55s exit transition (IntakeHero.tsx's
  // key="intro" motion.div): the card stays in flow — full height, just
  // transformed off-screen — until that exit finishes and AnimatePresence
  // unmounts it, so starting the scroll any earlier targets a gallery
  // position that's about to shift once the now-empty hero collapses,
  // producing a late, jerky extra scroll right as the animation settles.
  useEffect(() => {
    if (closeTick === 0) return;
    const id = setTimeout(() => {
      galleryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 550);
    return () => clearTimeout(id);
  }, [closeTick]);

  return (
    <div className="flex flex-col items-center gap-16 text-center">
      <AnimatePresence>
        {started && (
          <motion.div
            key="session"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{
              opacity: 0,
              scale: 0.05,
              x: 360,
              y: 340,
              transition: { duration: 0.55, ease: [0.68, 0, 0.85, 0] },
            }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-6 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
          >
            <IntakeStepGuide current={step} />
          </motion.div>
        )}
      </AnimatePresence>

      {/*
        Two defenses against the scroll-driven auto-hide's "gallery suddenly
        scrolls" jump (root-caused via Playwright — see the investigation):
        `h-140` (fixed, not min-height) keeps this box's own size constant
        regardless of the intro card mounting/unmounting inside it —
        confirmed via direct measurement that its rect height and the
        gallery's document-absolute position never actually change through
        the whole hide/show cycle. Despite that, the browser's own CSS
        scroll anchoring still fires an unwanted scrollY correction the
        instant the intro card unmounts above the viewport (a known
        Chromium quirk around AnimatePresence/Framer Motion removing nodes
        near/above the fold) — `overflow-anchor: none` opts this subtree out
        of that heuristic entirely, which is what actually stops the jump.
      */}
      <div
        ref={heroRef}
        style={{ overflowAnchor: "none" }}
        className={started ? "relative w-full pt-4" : "relative flex h-140 w-full items-center justify-center"}
      >
        <AnimatePresence>
          {!started && !closed && (
            <motion.div
              key="blurbs"
              variants={blurbGroup}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-screen -translate-x-1/2 xl:block"
            >
              {featureBlurbs.map((f, i) => (
                <motion.div key={f.titleKey} variants={fade} className={`absolute max-w-55 ${f.position}`}>
                  <motion.div
                    className={`will-change-transform rounded-lg p-4 ${glassCard}`}
                    animate={reduced ? undefined : { y: -8 }}
                    transition={
                      reduced
                        ? undefined
                        : {
                            type: "tween",
                            duration: 2.2,
                            repeat: Infinity,
                            repeatType: "mirror",
                            ease: "easeInOut",
                            delay: i * 0.6,
                          }
                    }
                  >
                    <p className="font-display text-lg font-semibold text-primary">{t(f.titleKey)}</p>
                    <p className="text-secondary">{t(f.bodyKey)}</p>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={headlineGroup} initial="hidden" animate="show" className="w-full">
          <motion.div variants={fade}>
            <IntakeHero onStartedChange={setStarted} onStepChange={setStep} />
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {!started && (
          <motion.section
            key="design-gallery"
            ref={galleryRef}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <h3 className="mb-6 text-left font-display text-xl font-bold tracking-wide text-on-surface">
              {t("gallery.heading")}
            </h3>
            <DesignGalleryGrid />
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
