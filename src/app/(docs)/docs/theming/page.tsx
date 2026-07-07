"use client";

import { colors, lightColors, radius, spacing } from "@/lib/tokens";
import { useLanguage } from "@/lib/language";

export default function ThemingPage() {
  const { t } = useLanguage();

  return (
    <article className="flex flex-col gap-8 text-left">
      <div>
        <h1 className="font-display text-3xl font-semibold">{t("docs.theming.title")}</h1>
        <p className="mt-4 text-secondary">
          {t("docs.theming.prefix")}
          <code className="rounded bg-(--glass-bg) px-1.5 py-0.5 text-sm">src/lib/tokens.ts</code>
          {t("docs.theming.suffix")}
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold">{t("docs.theming.colorsTitle")}</h2>
        <p className="mt-1 text-sm text-secondary">{t("docs.theming.colorsNote")}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {Object.entries(colors).map(([name, value]) => (
            <div key={name} className="flex items-center gap-3 rounded-md border border-border-subtle p-2">
              <span className="flex gap-1">
                <span className="h-6 w-6 rounded border border-border-subtle" style={{ backgroundColor: value }} />
                <span
                  className="h-6 w-6 rounded border border-border-subtle"
                  style={{ backgroundColor: lightColors[name as keyof typeof lightColors] }}
                />
              </span>
              <div className="text-sm">
                <p className="font-medium text-on-surface">{name}</p>
                <p className="text-xs text-secondary">
                  {value} / {lightColors[name as keyof typeof lightColors]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold">{t("docs.theming.radiusTitle")}</h2>
        <div className="mt-3 flex flex-wrap gap-4">
          {Object.entries(radius).map(([name, value]) => (
            <div key={name} className="flex flex-col items-center gap-2 text-sm text-secondary">
              <span className="h-12 w-12 border border-border-subtle bg-(--glass-bg)" style={{ borderRadius: value }} />
              {name}: {value}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold">{t("docs.theming.spacingTitle")}</h2>
        <div className="mt-3 flex flex-col gap-2">
          {Object.entries(spacing).map(([name, value]) => (
            <div key={name} className="flex items-center gap-3 text-sm text-secondary">
              <span className="w-16 shrink-0">
                {name} ({value})
              </span>
              <span className="h-3 rounded bg-primary/40" style={{ width: value }} />
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
