"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { DesignEntry } from "@/lib/design-gallery";
import { useDesignEntries } from "@/lib/use-design-entries";
import { LivePreviewPanel } from "@/components/gallery/LivePreviewPanel";
import { glassCard } from "@/lib/tokens";
import { easing } from "@/lib/motion";
import { useLanguage } from "@/lib/language";

type SourceFilter = "all" | DesignEntry["source"];

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

        <div className="overflow-y-auto p-6">
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
                  <div className="overflow-x-auto">
                    <div className={`inline-flex w-fit shrink-0 items-center gap-1 rounded-full p-1 ${glassCard}`}>
                      {(["all", "iza", "superdesign"] as SourceFilter[]).map((source) => (
                        <button
                          key={source}
                          type="button"
                          onClick={() => setActiveSource(source)}
                          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                            activeSource === source
                              ? "bg-primary text-primary-contrast"
                              : "text-secondary hover:text-on-surface"
                          }`}
                        >
                          {source === "all"
                            ? t("showcase.all")
                            : source === "iza"
                              ? t("gallery.filterIza")
                              : t("gallery.filterSuperdesign")}
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
                      className="w-full bg-transparent text-xs text-on-surface placeholder:text-secondary focus:outline-none sm:w-44"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {visible.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => setSelected(entry)}
                      className={`block min-w-0 overflow-hidden rounded-lg text-left transition-colors hover:border-primary ${glassCard}`}
                    >
                      <div className="relative aspect-video w-full overflow-hidden border-b border-(--glass-border) bg-(--glass-input-bg)">
                        {entry.thumbnailUrl && (
                          <Image src={entry.thumbnailUrl} alt={entry.title} fill className="object-cover object-top" />
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-3 p-4">
                        <p className="min-w-0 truncate font-display text-sm font-semibold">{entry.title}</p>
                        <p className="shrink-0 text-[10px] uppercase tracking-wide text-secondary">
                          {entry.source === "iza" ? t("gallery.filterIza") : t("gallery.filterSuperdesign")}
                        </p>
                      </div>
                    </button>
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
                      <p className="text-xs uppercase tracking-wide text-secondary">
                        {selected.source === "iza" ? t("gallery.filterIza") : t("gallery.filterSuperdesign")}
                      </p>
                      <h3 className="mt-2 font-display text-2xl font-semibold">{selected.title}</h3>
                      <p className="mt-2 max-w-144 text-sm text-secondary">{selected.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyPrompt(selected)}
                      className="inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-border-subtle px-4 text-xs font-medium text-on-surface transition-colors hover:border-primary"
                    >
                      {t("gallery.copyPrompt")}
                    </button>
                  </div>

                  {selected.creator && (
                    <div className="mt-4 flex items-center gap-3">
                      {selected.creator.avatarUrl && (
                        <div className="relative h-7 w-7 overflow-hidden rounded-full">
                          <Image src={selected.creator.avatarUrl} alt="" fill className="object-cover" />
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

                <LivePreviewPanel entry={selected} staticPreviewLabel={t("gallery.staticPreview")} />

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
