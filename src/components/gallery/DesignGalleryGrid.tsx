"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { DesignEntry } from "@/lib/design-gallery";
import { useDesignEntries } from "@/lib/use-design-entries";
import { glassCard, glassPill } from "@/lib/tokens";
import { useLanguage } from "@/lib/language";
import { fadeUp, group, stagger, reducedGroup, reducedFade } from "@/lib/motion";

type SourceFilter = "all" | DesignEntry["source"];

function sourceLabel(source: DesignEntry["source"], t: (path: string) => string) {
  if (source === "iza") return t("gallery.filterIza");
  if (source === "color-reference") return t("gallery.filterColorReference");
  return t("gallery.filterSuperdesign");
}

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
    // "All" means all *design* entries — Color Reference is a different kind
    // of content (a palette, not a design), so it only shows under its own tab.
    if (activeSource === "all" && e.source === "color-reference") return false;
    if (activeSource !== "all" && e.source !== activeSource) return false;
    if (!normalizedQuery) return true;
    return e.title.toLowerCase().includes(normalizedQuery) || e.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto">
          {(["all", "iza", "superdesign", "color-reference"] as SourceFilter[]).map((source) => (
            <button
              key={source}
              type="button"
              onClick={() => setActiveSource(source)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                activeSource === source
                  ? "bg-primary text-primary-contrast"
                  : `text-secondary hover:text-on-surface ${glassPill}`
              }`}
            >
              {source === "all" ? t("showcase.all") : sourceLabel(source, t)}
            </button>
          ))}
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
          {visible.map((entry, index) => (
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
                {entry.source === "color-reference" && entry.colors ? (
                  <div className="relative flex aspect-video w-full overflow-hidden border-b border-(--glass-border)">
                    {entry.colors.map((hex, i) => (
                      <span key={i} className="h-full flex-1" style={{ backgroundColor: hex }} />
                    ))}
                  </div>
                ) : (
                  <div className="relative aspect-video w-full overflow-hidden border-b border-(--glass-border) bg-(--glass-input-bg)">
                    {entry.thumbnailUrl && (
                      <Image
                        src={entry.thumbnailUrl}
                        alt={entry.title}
                        fill
                        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                        priority={index < 3}
                        className="object-cover object-top"
                      />
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 p-5">
                  <p className="min-w-0 truncate font-display text-lg font-semibold">{entry.title}</p>
                  {entry.source === "color-reference" && entry.accentColor ? (
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-xs uppercase tracking-wide text-secondary">designmd.co</span>
                      <span
                        className="h-3.5 w-3.5 shrink-0 rounded-full"
                        style={{ backgroundColor: entry.accentColor }}
                        aria-hidden
                      />
                    </span>
                  ) : (
                    <p className="shrink-0 text-xs uppercase tracking-wide text-secondary">{sourceLabel(entry.source, t)}</p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
