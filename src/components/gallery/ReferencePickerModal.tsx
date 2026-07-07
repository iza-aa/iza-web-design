"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useInView } from "framer-motion";
import type { DesignEntry } from "@/lib/design-gallery";
import { useDesignEntries } from "@/lib/use-design-entries";
import { LivePreviewPanel } from "@/components/gallery/LivePreviewPanel";
import { glassCard, glassPill } from "@/lib/tokens";
import { easing } from "@/lib/motion";
import { useLanguage } from "@/lib/language";

type SourceFilter = "all" | DesignEntry["source"];

function sourceLabel(source: DesignEntry["source"], t: (path: string) => string) {
  if (source === "iza") return t("gallery.filterIza");
  if (source === "color-reference") return t("gallery.filterColorReference");
  return t("gallery.filterSuperdesign");
}

// Same reasoning as DesignGalleryGrid's GalleryCard: <video> has no native
// lazy-loading, so mounting all of them up front (this modal can list all 60+
// entries at once) fires that many simultaneous metadata requests. Defer the
// real <video>/<Image> until the card scrolls into the modal's viewport, and
// — `once: false` — unmount it again once scrolled back out to free memory.
function ReferenceCard({
  entry,
  index,
  t,
  onSelect,
}: {
  entry: DesignEntry;
  index: number;
  t: (path: string) => string;
  onSelect: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const inView = useInView(ref, { once: false, margin: "200px" });

  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      className={`block min-w-0 overflow-hidden rounded-lg text-left transition-colors hover:border-primary ${glassCard}`}
    >
      {entry.source === "color-reference" && entry.colors ? (
        <div className="relative flex aspect-video w-full overflow-hidden border-b border-(--glass-border)">
          {entry.colors.map((hex, i) => (
            <span key={i} className="h-full flex-1" style={{ backgroundColor: hex }} />
          ))}
        </div>
      ) : (
        <div className="relative aspect-video w-full overflow-hidden border-b border-(--glass-border) bg-(--glass-input-bg)">
          {!inView ? null : entry.thumbnailIsVideo ? (
            <video
              src={entry.thumbnailUrl}
              muted
              playsInline
              preload="metadata"
              className="h-full w-full object-cover object-top"
            />
          ) : (
            entry.thumbnailUrl && (
              <Image
                src={entry.thumbnailUrl}
                alt={entry.title}
                fill
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 300px"
                priority={index < 3}
                className="object-cover object-top"
              />
            )
          )}
        </div>
      )}
      <div className="flex items-center justify-between gap-3 p-4">
        <p className="min-w-0 truncate font-display text-sm font-semibold">{entry.title}</p>
        {entry.source === "color-reference" && entry.accentColor ? (
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: entry.accentColor }}
            aria-hidden
          />
        ) : (
          <p className="shrink-0 text-[10px] uppercase tracking-wide text-secondary">{sourceLabel(entry.source, t)}</p>
        )}
      </div>
    </button>
  );
}

/**
 * The AI intake chat's references question can open this instead of the
 * client typing/pasting a link. Browse view (grid + filter + search) and
 * Detail view (header/preview/prompt + "Select this as reference") share one
 * modal — picking "back" from Detail returns to Browse without losing its
 * filter/search state. See docs/intake-reference-picker.md.
 */
export function ReferencePickerModal({
  onSelect,
  onClose,
}: {
  onSelect: (entry: DesignEntry) => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const all = useDesignEntries(true);
  const [activeSource, setActiveSource] = useState<SourceFilter>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<DesignEntry | null>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const visible = all.filter((e) => {
    // "All" means design references — Color Reference (a palette, not a
    // design) only shows under its own tab, same rule as the main gallery.
    if (activeSource === "all" && e.source === "color-reference") return false;
    if (activeSource !== "all" && e.source !== activeSource) return false;
    if (!normalizedQuery) return true;
    return e.title.toLowerCase().includes(normalizedQuery) || e.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));
  });

  function copyPrompt(entry: DesignEntry) {
    navigator.clipboard.writeText(entry.prompt).catch(() => {});
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: easing.standard }}
        onClick={(e) => e.stopPropagation()}
        className={`relative flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl ${glassCard}`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t("common.close")}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-(--glass-input-bg) text-on-surface transition-colors hover:bg-(--glass-bg)"
        >
          &times;
        </button>

        <div className="scrollbar-hide overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {!selected ? (
              <motion.div
                key="browse"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-5"
              >
                <h2 className="pr-10 font-display text-xl font-semibold">{t("gallery.heading")}</h2>

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

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {visible.map((entry, index) => (
                    <ReferenceCard key={entry.id} entry={entry} index={index} t={t} onSelect={() => setSelected(entry)} />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="detail"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-5"
              >
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="w-fit text-sm text-secondary transition-colors hover:text-on-surface"
                >
                  &larr; {t("gallery.backToBrowse")}
                </button>

                <div className={`rounded-lg p-5 ${glassCard}`}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-secondary">{sourceLabel(selected.source, t)}</p>
                      <h3 className="mt-2 font-display text-2xl font-semibold">{selected.title}</h3>
                      <p className="mt-2 max-w-144 text-sm text-on-surface">{selected.description}</p>
                    </div>
                    {selected.source !== "color-reference" && (
                      <button
                        type="button"
                        onClick={() => copyPrompt(selected)}
                        className="inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-border-subtle px-4 text-xs font-medium text-on-surface transition-colors hover:border-primary"
                      >
                        {t("gallery.copyPrompt")}
                      </button>
                    )}
                  </div>

                  {selected.creator && (
                    <div className="mt-4 flex items-center gap-3">
                      {selected.creator.avatarUrl && (
                        <div className="relative h-7 w-7 overflow-hidden rounded-full">
                          <Image src={selected.creator.avatarUrl} alt="" fill sizes="28px" className="object-cover" />
                        </div>
                      )}
                      <span className="text-xs text-secondary">{selected.creator.name}</span>
                    </div>
                  )}

                  {selected.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selected.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-border-subtle px-2.5 py-1 text-[10px] text-secondary">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {selected.source === "color-reference" && selected.colors ? (
                  <div className={`overflow-hidden rounded-lg ${glassCard}`}>
                    <div className="flex h-32 w-full">
                      {selected.colors.map((hex, i) => (
                        <span key={i} className="h-full flex-1" style={{ backgroundColor: hex }} />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-4 p-5">
                      {selected.colors.map((hex, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span
                            className="h-4 w-4 shrink-0 rounded-full border border-(--glass-border)"
                            style={{ backgroundColor: hex }}
                          />
                          <span className="font-mono text-xs uppercase text-secondary">{hex}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <LivePreviewPanel entry={selected} staticPreviewLabel={t("gallery.staticPreview")} />
                )}

                <motion.button
                  type="button"
                  onClick={() => onSelect(selected)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                  className="flex h-11 w-full items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-contrast"
                >
                  {t("gallery.selectAsReference")}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
