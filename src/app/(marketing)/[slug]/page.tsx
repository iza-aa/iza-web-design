"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { DesignEntry } from "@/lib/design-gallery";
import { izaDesignEntries } from "@/data/iza-design-entries";
import { LivePreviewPanel } from "@/components/gallery/LivePreviewPanel";
import { useLanguage } from "@/lib/language";
import { fadeUp, group, stagger, reducedGroup, reducedFade } from "@/lib/motion";
import { glassCard } from "@/lib/tokens";

export default function GalleryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLanguage();
  const reduced = useReducedMotion();
  // Iza entries are local — check them first so an Iza detail page never
  // hits the Superdesign API at all. Only fetch (and only then) when the
  // slug isn't one of ours.
  const izaMatch = izaDesignEntries.find((e) => e.slug === slug);
  const [superdesignEntries, setSuperdesignEntries] = useState<DesignEntry[] | null>(null);
  const [copied, setCopied] = useState(false);

  const sectionGroup = reduced ? reducedGroup : group(stagger.groupOffset);
  const fade = reduced ? reducedFade : fadeUp;

  useEffect(() => {
    if (izaMatch) return;
    fetch("/api/design-gallery")
      .then((res) => res.json())
      .then((data: { items: DesignEntry[] }) => setSuperdesignEntries(data.items))
      .catch(() => setSuperdesignEntries([]));
  }, [izaMatch]);

  if (!izaMatch && !superdesignEntries) {
    return (
      <section className="mx-auto max-w-2xl text-left">
        <p className="text-secondary">{t("gallery.loading")}</p>
      </section>
    );
  }

  const entry = izaMatch ?? superdesignEntries?.find((e) => e.slug === slug);

  if (!entry) {
    return (
      <section className="mx-auto max-w-2xl text-left">
        <Link href="/" className="text-sm text-secondary transition-colors hover:text-on-surface">
          &larr; {t("gallery.back")}
        </Link>
        <p className="mt-4 text-secondary">{t("gallery.notFound")}</p>
      </section>
    );
  }

  function copyPrompt() {
    if (!entry) return;
    navigator.clipboard.writeText(entry.prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <motion.section
      variants={sectionGroup}
      initial="hidden"
      animate="show"
      className="mx-auto flex max-w-6xl flex-col gap-6 text-left"
    >
      <motion.div variants={fade}>
        <Link href="/" className="text-sm text-secondary transition-colors hover:text-on-surface">
          &larr; {t("gallery.back")}
        </Link>
      </motion.div>

      <motion.div variants={fade} className={`rounded-lg p-6 ${glassCard}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-secondary">
              {entry.source === "iza" ? t("gallery.filterIza") : t("gallery.filterSuperdesign")}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold">{entry.title}</h1>
            <p className="mt-3 max-w-144 text-secondary">{entry.description}</p>
          </div>
          <motion.button
            type="button"
            onClick={copyPrompt}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-md border border-border-subtle px-5.5 text-sm font-medium text-on-surface transition-colors hover:border-primary"
          >
            {copied ? t("gallery.copied") : t("gallery.copyPrompt")}
          </motion.button>
        </div>

        {entry.creator && (
          <div className="mt-4 flex items-center gap-3">
            {entry.creator.avatarUrl && (
              <div className="relative h-8 w-8 overflow-hidden rounded-full">
                <Image src={entry.creator.avatarUrl} alt="" fill className="object-cover" />
              </div>
            )}
            <span className="text-sm text-secondary">{entry.creator.name}</span>
            {entry.sourceUrl && (
              <a
                href={entry.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-secondary underline transition-colors hover:text-on-surface"
              >
                {t("gallery.viewSource")}
              </a>
            )}
          </div>
        )}

        {entry.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-border-subtle px-3 py-1 text-xs text-secondary">
                {tag}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div variants={fade}>
        <LivePreviewPanel entry={entry} staticPreviewLabel={t("gallery.staticPreview")} />
      </motion.div>

      <motion.div variants={fade} className={`rounded-lg p-6 ${glassCard}`}>
        <h2 className="font-display text-lg font-semibold">{t("gallery.promptHeading")}</h2>
        <pre className="mt-2 max-h-96 overflow-auto rounded-lg bg-(--glass-input-bg) p-4 text-xs text-secondary whitespace-pre-wrap">
          {entry.prompt}
        </pre>
      </motion.div>
    </motion.section>
  );
}
