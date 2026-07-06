"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { caseStudies } from "@/lib/showcase";
import { glassCard } from "@/lib/tokens";
import { useLanguage } from "@/lib/language";
import { fadeUp, group, stagger, reducedGroup, reducedFade } from "@/lib/motion";

export default function ShowcasePage() {
  const { t } = useLanguage();
  const reduced = useReducedMotion();
  const headingGroup = reduced ? reducedGroup : group(stagger.childDelay);
  const gridGroup = reduced ? reducedGroup : group(stagger.groupOffset);
  const fade = reduced ? reducedFade : fadeUp;

  const types = useMemo(() => Array.from(new Set(caseStudies.map((c) => c.type))), []);
  const [activeType, setActiveType] = useState<string | null>(null);
  const filtered = activeType ? caseStudies.filter((c) => c.type === activeType) : caseStudies;

  return (
    <section className="flex flex-col gap-8 text-left">
      <motion.div variants={headingGroup} initial="hidden" animate="show">
        <motion.h1 variants={fade} className="font-display text-3xl font-semibold">
          {t("showcase.heading")}
        </motion.h1>
        <motion.p variants={fade} className="mt-3 max-w-144 text-secondary">
          {t("showcase.intro")}
        </motion.p>

        {types.length > 1 && (
          <motion.div variants={fade} className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveType(null)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                activeType === null
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border-subtle text-secondary hover:text-on-surface"
              }`}
            >
              {t("showcase.all")}
            </button>
            {types.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setActiveType(type)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  activeType === type
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border-subtle text-secondary hover:text-on-surface"
                }`}
              >
                {type}
              </button>
            ))}
          </motion.div>
        )}
      </motion.div>

      <motion.div
        variants={gridGroup}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((c) => (
            <motion.div
              key={c.slug}
              layout
              variants={fade}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={`/showcase/${c.slug}`}
                className={`block overflow-hidden rounded-lg transition-colors hover:border-primary ${glassCard}`}
              >
                <div className="relative aspect-video w-full overflow-hidden border-b border-(--glass-border)">
                  <Image
                    src={c.image}
                    alt={c.title}
                    fill
                    sizes="(max-width: 639px) 100vw, 50vw"
                    className="object-cover object-top"
                  />
                </div>
                <div className="p-6">
                  <p className="text-xs uppercase tracking-wide text-secondary">{c.type}</p>
                  <p className="mt-2 font-display text-lg font-semibold">{c.title}</p>
                  <p className="mt-2 text-sm text-secondary">{c.summary}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
