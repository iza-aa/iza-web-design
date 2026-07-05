# hyliox

Personal services website + open-source component docs, built as two products
under one domain. Full architecture, tokens, motion rules, and build sequence
live in `docs/` — this code should always match those specs; update
both together when something changes.

## Spec files (source of truth)
- `docs/hyliox-waitlist-card.md` — design tokens, typography, components
- `docs/webgl-canvas-background.md` — ambient canvas (pointer-field / object-stage)
- `docs/hyliox-motion-system.md` — entrance & interaction motion rules
- `docs/hyliox-website-system-design.md` — full site architecture, AI intake, docs model
- `docs/roadmap.md` — build sequence and current phase status

## Status: Phase 0 (Foundation) ✅
- [x] Next.js App Router scaffold
- [x] Tailwind configured, reading tokens from `src/lib/tokens.ts`
- [x] Route groups: `(marketing)` → `/`, `/about`, `/showcase`; `(docs)` → `/docs/*`
- [x] Header with the Work / Components switcher
- [ ] Deployed shell on Vercel — do this once you've pushed to a git repo

Next up: **Phase 1 — Marketing Site MVP** (see `docs/roadmap.md`).

## Getting started
```bash
npm install
npm run dev
```
Then open http://localhost:3000 (marketing) and http://localhost:3000/docs (docs).

## Structure
```
src/
  app/
    layout.tsx                 root layout, fonts, <Header/>
    globals.css
    (marketing)/                → /, /about, /showcase, /showcase/[slug]
    (docs)/docs/                → /docs, /docs/installation, /docs/theming, /docs/components/[slug]
  components/
    layout/Header.tsx           Work | Components switcher
    ui/                         component library goes here (Phase 4+)
  lib/
    tokens.ts                   single source of truth for colors/radius/spacing/motion
docs/                    the 5 markdown specs, copied into the repo
```
