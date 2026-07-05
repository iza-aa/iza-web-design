"use client";

import { useEffect, useState } from "react";
import type { DesignEntry } from "@/lib/design-gallery";
import { izaDesignEntries } from "@/data/iza-design-entries";

/**
 * Shared Iza + Superdesign.dev entry list. Iza entries are always instant
 * (static import, zero network). Superdesign entries fetch through the
 * cached `/api/design-gallery` route — `immediate` controls when:
 *   - false (default, homepage grid): deferred until the visitor's first
 *     scroll event, since most visitors never ask to see it.
 *   - true (reference picker modal): fetched right away — opening the modal
 *     is itself the deliberate "I want to browse" action.
 * See docs/design-gallery.md's Lazy Loading section and
 * docs/intake-reference-picker.md.
 */
export function useDesignEntries(immediate = false): DesignEntry[] {
  const [superdesignEntries, setSuperdesignEntries] = useState<DesignEntry[]>([]);
  const [loadTriggered, setLoadTriggered] = useState(false);

  useEffect(() => {
    if (loadTriggered) return;

    function load() {
      setLoadTriggered(true);
      fetch("/api/design-gallery")
        .then((res) => res.json())
        .then((data: { items: DesignEntry[] }) => setSuperdesignEntries(data.items))
        .catch(() => {});
    }

    if (immediate) {
      load();
      return;
    }

    function onScroll() {
      load();
    }
    window.addEventListener("scroll", onScroll, { passive: true, once: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [loadTriggered, immediate]);

  return [...izaDesignEntries, ...superdesignEntries];
}
