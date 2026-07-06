"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { DesignEntry } from "@/lib/design-gallery";
import { useDesignEntries } from "@/lib/use-design-entries";
import { glassCard } from "@/lib/tokens";
import { useLanguage } from "@/lib/language";
import { fadeUp, group, stagger, reducedGroup, reducedFade } from "@/lib/motion";

type SourceFilter = "all" | DesignEntry["source"];

export function DesignGalleryGrid() {
  const { t } = useLanguage();
  const reduced = useReducedMotion();
  const gridGroup = reduced ? reducedGroup : group(stagger.groupOffset);
  const fade = reduced ? reducedFade : fadeUp;

  const all = useDesignEntries();
  const [activeSource, setActiveSource] = useState<SourceFilter>("all");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const visible = all.filter((e) => {
    if (activeSource !== "all" && e.source !== activeSource) return false;
    if (!normalizedQuery) return true;
    return e.title.toLowerCase().includes(normalizedQuery) || e.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="overflow-x-auto">
          <div className={`inline-flex w-fit shrink-0 items-center gap-1 rounded-full p-1 ${glassCard}`}>
            {(["all", "iza", "superdesign"] as SourceFilter[]).map((source) => (
              <button
                key={source}
                type="button"
                onClick={() => setActiveSource(source)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeSource === source ? "bg-primary text-primary-contrast" : "text-secondary hover:text-on-surface"
                }`}
              >
                {source === "all" ? t("showcase.all") : source === "iza" ? t("gallery.filterIza") : t("gallery.filterSuperdesign")}
              </button>
            ))}
          </div>
        </div>

        <div className={`flex items-center gap-2 rounded-full px-3.5 py-2 ${glassCard}`}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-secondary">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("gallery.searchPlaceholder")}
            className="w-full bg-transparent text-base text-on-surface placeholder:text-secondary focus:outline-none sm:w-44 md:text-xs"
          />
        </div>
      </div>

      <motion.div variants={gridGroup} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((entry) => (
            <motion.div
              key={entry.id}
              layout
              variants={fade}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="min-w-0"
            >
              <Link
                href={`/${entry.slug}`}
                className={`block overflow-hidden rounded-lg transition-colors hover:border-primary ${glassCard}`}
              >
                <div className="relative aspect-video w-full overflow-hidden border-b border-(--glass-border) bg-(--glass-input-bg)">
                  {entry.thumbnailUrl && <Image src={entry.thumbnailUrl} alt={entry.title} fill className="object-cover object-top" />}
                </div>
                <div className="flex items-center justify-between gap-3 p-5">
                  <p className="min-w-0 truncate font-display text-lg font-semibold">{entry.title}</p>
                  <p className="shrink-0 text-xs uppercase tracking-wide text-secondary">
                    {entry.source === "iza" ? t("gallery.filterIza") : t("gallery.filterSuperdesign")}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
