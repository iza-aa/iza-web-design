import { colors, lightColors, radius, spacing } from "@/lib/tokens";

export default function ThemingPage() {
  return (
    <article className="flex flex-col gap-8 text-left">
      <div>
        <h1 className="font-display text-3xl font-semibold">Theming</h1>
        <p className="mt-4 text-secondary">
          Rendered directly from <code className="rounded bg-(--glass-bg) px-1.5 py-0.5 text-sm">src/lib/tokens.ts</code> —
          this table is the single source of truth both products (marketing + docs) read from, so a color here can
          never drift from what&apos;s actually shipping.
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold">Colors</h2>
        <p className="mt-1 text-sm text-secondary">Dark is the default theme; light overrides via the `.light` class.</p>
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
        <h2 className="font-display text-xl font-semibold">Radius</h2>
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
        <h2 className="font-display text-xl font-semibold">Spacing</h2>
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
