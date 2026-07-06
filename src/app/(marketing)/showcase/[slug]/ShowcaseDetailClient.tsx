"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { caseStudies, getCaseStudy } from "@/lib/showcase";
import { useLanguage } from "@/lib/language";
import { fadeUp, group, stagger, reducedGroup, reducedFade } from "@/lib/motion";

export function ShowcaseDetailClient({ slug }: { slug: string }) {
  const { t } = useLanguage();
  const reduced = useReducedMotion();
  const study = getCaseStudy(slug);

  const sectionGroup = reduced ? reducedGroup : group(stagger.groupOffset);
  const fade = reduced ? reducedFade : fadeUp;

  if (!study) {
    return (
      <section className="mx-auto max-w-2xl text-left">
        <p className="text-secondary">Case study not found.</p>
      </section>
    );
  }

  const index = caseStudies.findIndex((c) => c.slug === study.slug);
  const prev = caseStudies[(index - 1 + caseStudies.length) % caseStudies.length];
  const next = caseStudies[(index + 1) % caseStudies.length];

  return (
    <motion.section
      variants={sectionGroup}
      initial="hidden"
      animate="show"
      className="mx-auto flex max-w-2xl flex-col gap-6 text-left"
    >
      <motion.div variants={fade}>
        <Link href="/showcase" className="text-sm text-secondary transition-colors hover:text-on-surface">
          &larr; {t("showcase.back")}
        </Link>
      </motion.div>

      <motion.div variants={fade} className="relative aspect-video w-full overflow-hidden rounded-lg border border-border-subtle">
        <Image
          src={study.image}
          alt={study.title}
          fill
          sizes="(max-width: 767px) 100vw, 672px"
          className="object-cover object-top"
        />
      </motion.div>

      <motion.div variants={fade} className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-secondary">{study.type}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold">{study.title}</h1>
          <p className="mt-3 text-secondary">{study.summary}</p>
        </div>
        <a
          href={study.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-md border border-border-subtle px-5.5 xt-sm font-medium text-on-surface transition-colors hover:border-primary"
        >
          {t("showcase.visit")} &nearr;
        </a>
      </motion.div>

      <motion.div variants={fade}>
        <h2 className="font-display text-lg font-semibold">{t("showcase.problem")}</h2>
        <p className="mt-2 text-secondary">{study.problem}</p>
      </motion.div>

      <motion.div variants={fade}>
        <h2 className="font-display text-lg font-semibold">{t("showcase.approach")}</h2>
        <p className="mt-2 text-secondary">{study.approach}</p>
      </motion.div>

      <motion.div variants={fade}>
        <h2 className="font-display text-lg font-semibold">{t("showcase.outcome")}</h2>
        <p className="mt-2 text-secondary">{study.outcome}</p>
      </motion.div>

      {caseStudies.length > 1 && (
        <motion.div variants={fade} className="mt-4 flex items-center justify-between border-t border-border-subtle pt-6 text-sm">
          <Link href={`/showcase/${prev.slug}`} className="text-secondary transition-colors hover:text-on-surface">
            &larr; {t("showcase.prev")}: {prev.title}
          </Link>
          <Link href={`/showcase/${next.slug}`} className="text-right text-secondary transition-colors hover:text-on-surface">
            {t("showcase.next")}: {next.title} &rarr;
          </Link>
        </motion.div>
      )}
    </motion.section>
  );
}
