import type { DesignEntry } from "@/lib/design-gallery";
import { glassCard } from "@/lib/tokens";

/**
 * Iza entries: same-origin `srcDoc` iframe, fully live/scrollable — we own
 * the HTML. Superdesign entries: their `previewUrl` sets a CSP
 * (`frame-ancestors`) that blocks any domain but their own + localhost, so
 * this falls back to the static thumbnail screenshot in a scrollable frame.
 * See docs/design-gallery.md's "Live Preview Panel" section.
 */
export function LivePreviewPanel({ entry, staticPreviewLabel }: { entry: DesignEntry; staticPreviewLabel: string }) {
  if (entry.previewHtml) {
    return (
      <div className={`overflow-hidden rounded-lg p-2 ${glassCard}`}>
        <div className="h-130 overflow-hidden rounded-md">
          <iframe srcDoc={entry.previewHtml} title={entry.title} className="h-full w-full" style={{ border: 0 }} />
        </div>
      </div>
    );
  }

  if (entry.thumbnailUrl) {
    return (
      <div className={`overflow-hidden rounded-lg ${glassCard}`}>
        <p className="border-b border-(--glass-border) px-3 py-1.5 text-xs text-secondary">{staticPreviewLabel}</p>
        <div className="h-130 overflow-y-auto">
          {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary remote screenshot, no known intrinsic size */}
          <img src={entry.thumbnailUrl} alt={entry.title} className="h-auto w-full" />
        </div>
      </div>
    );
  }

  return null;
}
