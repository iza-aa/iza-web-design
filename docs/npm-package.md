---
version: alpha
name: iza-ui npm Package
description: Extracting the genuinely non-trivial, reusable UI primitives out of this app into a standalone, publishable npm package — a small shadcn-adjacent component reference, not a full design system. Owner's explicit rule (2026-07-07) — only extract components that are actually hard to rebuild from scratch; skip anything a competent dev writes in minutes.
repo: https://github.com/iza-aa/iza-ui (public, empty, default branch `main`) — separate repo, not a monorepo package inside this one. Cloned locally to `d:\iza-ui`.
packageName: "iza-ui" (unscoped — confirmed available on the npm registry 2026-07-07, `registry.npmjs.org/iza-ui` returns 404)
distribution: traditional npm package (`npm install iza-ui`), not a shadcn-style copy-paste CLI — see Distribution Model Decision.
---

# iza-ui npm Package

## Overview
This app (`iza-web-design`) already documents its reusable components on `/docs`. The owner wants the genuinely valuable ones — the ones with real engineering behind them, not boilerplate — published as an actual npm package so other projects can depend on them directly, using shadcn's docs/preview UX as a visual/UX reference (not its distribution model — see below).

**Explicit exclusion rule:** don't add components a user could trivially rebuild themselves (Button, Input, Textarea, Logo Mark, the FadeUp/PopIn/ScaleIn motion wrappers were removed from this app's own `/docs` for exactly this reason — see `docs/roadmap.md` Phase 4/6, 2026-07-07). Future additions to the package will come from extracting components out of *other* sites later, not from re-mining this one.

## Distribution Model Decision
shadcn's CLI (`npx shadcn add button`) copies raw source into the consumer's repo instead of being an installable package. That's not an aesthetic choice — it's a workaround for a real technical problem: Tailwind-styled components reference utility classes and (in shadcn's case) CSS variables that a consumer's own Tailwind JIT scanner won't see if they're compiled inside `node_modules`, so a naively-compiled Tailwind component library can silently render unstyled.

Building a full CLI + registry for 2–3 components is disproportionate. Instead: ship a traditional npm package that bundles **precompiled, static CSS** (built from our own Tailwind pipeline at publish time) rather than relying on the consumer's Tailwind config at all. Consumer experience:

```
npm install iza-ui
```
```tsx
import "iza-ui/styles.css"; // once, anywhere in the app
import { Dock, WindowCard, AmbientCanvas } from "iza-ui";
```

No Tailwind setup, no preset extension, no CLI, no copy-paste. Trade-off: styling is fixed at publish time (no Tailwind-utility override ergonomics) — acceptable for a 3-component reference set. This app's own `/docs` site (which already shows full source + a copy button per component, via `CodeBlock`) remains the escape hatch for anyone who wants to fork/customize instead of installing.

## Components In Scope (v1)
Decided by grepping every component in `src/components/**` for app-specific dependencies (translation keys, `useIntakeVisibility`, hardcoded asset imports, business copy). Three survive as genuinely portable:

1. **`WindowCard`** (`src/components/ui/WindowCard.tsx`) — already fully generic, zero app-specific imports beyond the `glassCard` token string. Copy near-verbatim.
2. **`Dock` + `DockItem`** — the macOS-style magnification dock. `DockItem` (`src/components/ui/DockItem.tsx`) is already generic. The *container* logic (hover-distance boost falloff, collision-avoiding per-item margin — the thing this session spent an entire multi-turn debugging pass getting right) currently lives inline inside `DockNav.tsx`, which is NOT portable (imports this app's logo assets, `useIntakeVisibility`, `useLanguage`, `usePathname` route-matching). **New work:** extract a generic `Dock` component — takes an `items: DockEntry[]` prop (`{ key, label, icon, href?, onClick?, active? }`), owns the `hoveredIndex` state and `BOOST_FALLOFF` math itself, renders the `glassCard` pill + maps `DockItem`s. `DockNav.tsx` in this app is refactored to become a thin wrapper that builds its `items` array (logos, i18n labels, route matching) and renders the new generic `Dock` — no behavior change for this site, just a extraction.
3. **`AmbientCanvas`** (`src/components/canvas/AmbientCanvas.tsx`) — already fully self-contained (no design-token dependency, no app imports, dynamic `import("three")` so consumers who never mount it don't pay for the dependency). Copy verbatim. Package `dependencies` (not peerDependencies, since it's not something a typical consumer already has installed) must include `three`.

**Explicitly excluded from v1** (per the owner's no-trivial-components rule): Button, Input, Textarea, Logo Mark, FadeUp/PopIn/ScaleIn — already dropped from this app's own docs for the same reason. `PreferencesBar`'s icon-crossfade theme toggle was considered and deferred — moderate complexity, but not clearly above the "trivial" bar; revisit only if a future consumer asks for it, not proactively.

## Package Structure (`d:\iza-ui`)
```
iza-ui/
  package.json
  tsconfig.json
  tsup.config.ts
  src/
    index.ts              # barrel export: Dock, DockItem, WindowCard, AmbientCanvas + their prop types
    tokens.css             # source for the precompiled styles.css — only the CSS variables these 3 components actually read (--glass-bg, --glass-border, --color-primary, --color-primary-contrast, --color-on-surface, --color-surface), both dark (:root) default and .light override, ported from src/app/globals.css
    components/
      WindowCard.tsx
      Dock.tsx             # new — extracted container logic
      DockItem.tsx
      AmbientCanvas.tsx
  dist/                    # build output — tsup-generated ESM+CJS+d.ts, plus compiled styles.css
  README.md                # install snippet, per-component usage, link back to this app's live /docs for interactive previews
```

## Build Tooling
- **`tsup`** — bundles `src/index.ts` to `dist/` as ESM + CJS + `.d.ts`, preserving the `"use client"` directive banner (required since all 4 components are client components — `Dock`/`DockItem`/`WindowCard` use hooks/Framer Motion, `AmbientCanvas` touches `window`/`navigator`).
- **Tailwind CLI** (`@tailwindcss/cli`) — a second build step compiles `src/tokens.css` (a plain `@import "tailwindcss"` + the ported `@theme`/`:root`/`.light` blocks) against the actual component source (so only classes really used get generated) into `dist/styles.css`, minified.
- `package.json` `"exports"` map: `"."` → compiled JS, `"./styles.css"` → the compiled CSS, so `import "iza-ui/styles.css"` resolves correctly under both ESM and CJS consumers.
- **`peerDependencies`**: `react`, `react-dom`, `framer-motion`, `next` (only `DockItem`'s `next/link` usage needs this — v1 explicitly targets Next.js consumers; a router-agnostic `Dock`/`DockItem` is a v2 concern, not blocking this release).
- **`dependencies`**: `three` (only `AmbientCanvas` needs it, but it's not something a typical consumer has, unlike the peer deps above which any Next+Framer Motion app already does).

## Implementation Checklist
- [x] Confirm distribution model (traditional npm package + precompiled CSS, not a copy-paste CLI) — see Distribution Model Decision
- [x] Confirm package name availability — `iza-ui` unscoped, free on the npm registry
- [x] Repo created (`iza-aa/iza-ui`, empty, public) and cloned locally to `d:\iza-ui`
- [x] Scaffold `package.json`, `tsconfig.json`, `tsup.config.ts` in `d:\iza-ui`
- [x] Port `WindowCard.tsx` and `AmbientCanvas.tsx` near-verbatim
- [x] Extract generic `Dock.tsx` (hover/boost/margin logic) into the new package (`d:\iza-ui\src\components\Dock.tsx`)
- [x] Port `tokens.css` — only the CSS variables `WindowCard`/`Dock`/`DockItem` actually reference, both dark default and `.light` override
- [x] Write `src/index.ts` barrel export
- [x] Wire up the Tailwind CLI CSS build step alongside `tsup` — verified working: `npm run build` produces `dist/index.{js,cjs,d.ts,d.cts}` and `dist/styles.css` with no errors (hit and fixed one `ignoreDeprecations` TS 6.0 issue along the way)
- [x] Write `README.md` (install snippet, per-component usage snippet)
- [x] Initial commit pushed to `github.com/iza-aa/iza-ui` (`main`)
- [ ] **Not yet done**: `DockNav.tsx` in *this* app (`iza-web-design`) still has its own inline copy of the hover/boost/margin logic — it was NOT refactored to import the new package yet, since `iza-ui` isn't published to npm yet (nothing to install). No behavior change here in the meantime; this app's dock still works exactly as before. Revisit once the package is published: swap `DockNav.tsx` to build its `items` array and render the published `Dock` instead of the inline logic.
- [ ] Manual, owner-run steps (not run by the agent — external, credential-gated, and irreversible-ish): `npm login`, `npm publish --access public`

## Explicitly Out of Scope (v1)
- A shadcn-style CLI/registry (see Distribution Model Decision)
- Router-agnostic `DockItem` (works with plain `<a>`/`onClick` when no Next.js router is present)
- Any component not already proven non-trivial in this app (see exclusion rule above) — no proactive extraction of more candidates from this codebase; the next additions come from other sites, per the owner
