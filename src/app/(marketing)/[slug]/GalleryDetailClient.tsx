"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { DesignEntry } from "@/lib/design-gallery";
import { izaDesignEntries } from "@/data/iza-design-entries";
import { colorReferenceEntries } from "@/data/color-reference-entries";
import { LivePreviewPanel } from "@/components/gallery/LivePreviewPanel";
import { useLanguage } from "@/lib/language";
import { fadeUp, group, stagger, reducedGroup, reducedFade } from "@/lib/motion";
import { glassCard } from "@/lib/tokens";

function sourceLabel(source: DesignEntry["source"], t: (path: string) => string) {
  if (source === "iza") return t("gallery.filterIza");
  if (source === "color-reference") return t("gallery.filterColorReference");
  return t("gallery.filterSuperdesign");
}

export function GalleryDetailClient({ slug }: { slug: string }) {
  const { t } = useLanguage();
  const reduced = useReducedMotion();
  // Iza + Color Reference entries are local — check them first so their
  // detail pages never hit the Superdesign API at all. Only fetch (and only
  // then) when the slug isn't one of ours.
  const localMatch = [...izaDesignEntries, ...colorReferenceEntries].find((e) => e.slug === slug);
  const [superdesignEntries, setSuperdesignEntries] = useState<DesignEntry[] | null>(null);

  const sectionGroup = reduced ? reducedGroup : group(stagger.groupOffset);
  const fade = reduced ? reducedFade : fadeUp;

  useEffect(() => {
    if (localMatch) return;
    fetch("/api/design-gallery")
      .then((res) => res.json())
      .then((data: { items: DesignEntry[] }) => setSuperdesignEntries(data.items))
      .catch(() => setSuperdesignEntries([]));
  }, [localMatch]);

  if (!localMatch && !superdesignEntries) {
    return (
      <section className="mx-auto max-w-2xl text-left">
        <p className="text-secondary">{t("gallery.loading")}</p>
      </section>
    );
  }

  const entry = localMatch ?? superdesignEntries?.find((e) => e.slug === slug);

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
        <div>
          <p className="text-xs uppercase tracking-wide text-secondary">{sourceLabel(entry.source, t)}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold">{entry.title}</h1>
          <p className="mt-3 max-w-144 text-secondary">{entry.description}</p>
        </div>

        {entry.creator && (
          <div className="mt-4 flex items-center gap-3">
            {entry.creator.avatarUrl && (
              <div className="relative h-8 w-8 overflow-hidden rounded-full">
                <Image src={entry.creator.avatarUrl} alt="" fill sizes="32px" className="object-cover" />
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

      {entry.source === "color-reference" && entry.colors ? (
        <motion.div variants={fade} className={`overflow-hidden rounded-lg ${glassCard}`}>
          <div className="flex h-40 w-full sm:h-56">
            {entry.colors.map((hex, i) => (
              <span key={i} className="h-full flex-1" style={{ backgroundColor: hex }} />
            ))}
          </div>
          <div className="flex flex-wrap gap-4 p-5">
            {entry.colors.map((hex, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="h-4 w-4 shrink-0 rounded-full border border-(--glass-border)" style={{ backgroundColor: hex }} />
                <span className="font-mono text-xs text-secondary uppercase">{hex}</span>
              </div>
            ))}
          </div>
          <p className="border-t border-(--glass-border) px-5 py-3 text-xs text-secondary">
            {t("gallery.colorReferenceCreditPrefix")}{" "}
            <a
              href="https://www.designmd.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition-colors hover:text-on-surface"
            >
              designmd.co
            </a>
            {t("gallery.colorReferenceCreditSuffix")}
          </p>
        </motion.div>
      ) : (
        <motion.div variants={fade}>
          <LivePreviewPanel entry={entry} staticPreviewLabel={t("gallery.staticPreview")} />
        </motion.div>
      )}
    </motion.section>
  );
}
