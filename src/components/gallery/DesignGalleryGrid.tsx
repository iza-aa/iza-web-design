"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import type { DesignEntry } from "@/lib/design-gallery";
import { useDesignEntries } from "@/lib/use-design-entries";
import { glassCardOpaque, glassPillOpaque } from "@/lib/tokens";
import { useLanguage } from "@/lib/language";
import { fadeUp, group, stagger, reducedGroup, reducedFade } from "@/lib/motion";

type SourceFilter = "all" | DesignEntry["source"];

function sourceLabel(source: DesignEntry["source"], t: (path: string) => string) {
  if (source === "iza") return t("gallery.filterIza");
  if (source === "color-reference") return t("gallery.filterColorReference");
  return t("gallery.filterSuperdesign");
}

// Cards only actually appear once their own <video> mounts (browsers fetch a
// video's metadata the instant it's in the DOM — unlike <img>/next/image,
// there's no native lazy-loading for <video>). With dozens of cards in the
// grid, mounting them all up front fired dozens of simultaneous requests.
// `useInView` defers the real <video>/<Image> until the card is actually
// within `margin` of the viewport, and — `once: false` — unmounts it again
// once the card scrolls back out, freeing the decoded video/image instead of
// holding every visited card's media in memory for the rest of the session.
// Trade-off: scrolling back to an earlier card re-fetches its media instead
// of reusing a cached mount; worth it since this grid can hold 60+ entries.
function GalleryCard({
  entry,
  index,
  fade,
  t,
}: {
  entry: DesignEntry;
  index: number;
  fade: Variants;
  t: (path: string) => string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "200px" });

  return (
    <motion.div
      ref={ref}
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
        className={`block overflow-hidden rounded-lg transition-colors hover:border-primary ${glassCardOpaque}`}
      >
        {entry.source === "color-reference" && entry.colors ? (
          <div className="relative flex aspect-video w-full overflow-hidden border-b border-(--glass-border)">
            {entry.colors.map((hex, i) => (
              <span key={i} className="h-full flex-1" style={{ backgroundColor: hex }} />
            ))}
          </div>
        ) : (
          <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden border-b border-(--glass-border) bg-(--glass-input-bg)">
            {!inView ? null : entry.thumbnailIsVideo ? (
              <video
                src={entry.thumbnailUrl}
                muted
                playsInline
                preload="metadata"
                className="h-full w-full object-cover object-top"
              />
            ) : entry.thumbnailUrl ? (
              <Image
                src={entry.thumbnailUrl}
                alt={entry.title}
                fill
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                priority={index < 3}
                className="object-cover object-top"
              />
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-secondary">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" className="shrink-0">
                  <path d="M8 5v14l11-7z" />
                </svg>
                {t("gallery.videoPreview")}
              </span>
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
  );
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
                  : `text-secondary hover:text-on-surface ${glassPillOpaque}`
              }`}
            >
              {source === "all" ? t("showcase.all") : sourceLabel(source, t)}
            </button>
          ))}
        </div>

        <div className={`flex items-center gap-2 rounded-full px-3.5 py-2 ${glassCardOpaque}`}>
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
            <GalleryCard key={entry.id} entry={entry} index={index} fade={fade} t={t} />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
