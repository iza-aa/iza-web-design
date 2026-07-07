---
version: alpha
name: Hyliox Roadmap
description: Build sequence across all four companion specs — tokens, ambient canvas, motion system, and site architecture — ordered so the revenue-generating side (marketing + AI intake) ships before the credibility-building side (open-source component docs).
inputs:
  - hyliox-waitlist-card.md      # design tokens + component definitions
  - webgl-canvas-background.md   # ambient canvas, pointer-field + object-stage modes
  - hyliox-motion-system.md      # entrance/interaction motion rules
  - hyliox-website-system-design.md  # full site architecture, AI intake, docs model
  - hyliox-localization-theming.md   # light/dark mode + EN/ID localization spec
  - design-gallery.md            # design prompt gallery — Iza-authored + Superdesign.dev entries
  - intake-reference-picker.md   # AI intake references question <-> Design Gallery bridge
  - npm-package.md               # iza-ui npm package extraction (WindowCard, Dock/DockItem, AmbientCanvas)
---

# Hyliox Roadmap

## How to read this
Phases are ordered by dependency and by what actually earns its place first — not by what's most fun to build. Each phase has a short checklist and a one-line "why now." Nothing here has calendar dates; slot phases into whatever time you actually have around your day job, gym, and everything else on your plate — the sequencing matters more than the pace.

## Phase 0 — Foundation
**Why now:** everything else reads its colors, spacing, and radii from here. Get this wrong and every later phase inherits the mistake.
- [ ] Next.js (App Router) project scaffold, Tailwind installed and configured
- [ ] Design tokens from `hyliox-waitlist-card.md` translated into Tailwind theme config / CSS variables (colors, typography, rounded, spacing)
- [ ] Base route groups set up: `(marketing)` and `(docs)`, sharing one root layout
- [ ] Primary navigation shell (routes can 404 for now) — **superseded in Phase 2**: this became a floating bottom dock (2 icon tiles) instead of a header switcher, see `hyliox-website-system-design.md`
- [ ] Deploy an empty shell to Vercel so the pipeline is proven early

## Phase 1 — Marketing Site MVP
**Why now:** this is the side that sells your services; it needs to exist, even minimally, before the AI intake chat has anywhere credible to live.
- [x] Home hero: logo mark, wordmark, headline, subheading — built as the `card`/`logo-mark` components from `hyliox-waitlist-card.md`
- [x] Static entrance motion applied per `hyliox-motion-system.md` (brand block + headline block sequences)
- [x] "Start a Project" primary CTA in place — **superseded**: Phase 2 landed early, so the hero is now the live intake chat itself rather than a CTA linking to a placeholder
- [x] `/about` page — **draft copy only**, needs real positioning content from the owner before launch
- [x] `/showcase` and 3 `/showcase/[slug]` pages — structural template built, **sample/placeholder entries only**, needs real past work before launch
- [x] No ambient WebGL canvas yet — shipped with a static gradient/blur backdrop first, swap it in Phase 3

## Phase 2 — AI Intake Chat
**Why now:** this is the actual differentiator and your lead-gen mechanism — it doesn't need a fully polished site around it to start proving value, but it does need Phase 1's site to exist so leads land somewhere credible.
- [x] Chat UI — built directly into the home hero as the prompt-box pattern from `ai-intake-chat.md` (not a modal, not a separate page)
- [x] Gemini API (`gemini-3-flash-preview`) integration with the guardrail system prompt (scope lock, honest framing, graceful boundaries) steering toward `extractedFields`
- [x] Structured-brief generation step at conversation end (model emits a fenced ` ```brief ` JSON block, parsed client-side into a confirmation card)
- [x] Email delivery via SMTP (nodemailer) — brief as the headline, full transcript inline. Wired 2026-07-04 via `/api/send-brief`; sends to `OWNER_EMAIL` on brief detection.
- [x] Customer-facing confirmation message once the brief renders
- [x] One real test run end-to-end — verified at the API level (`/api/intake`): a real inquiry got a correct, honest-framed reply, and a direct "write me the code" request was declined and redirected. **Still not tested through the actual browser UI**, and the new `/api/send-brief` email delivery hasn't been verified against a real inbox yet (playwright access was revoked mid-project, so this can't be automated — needs a manual run).

## Phase 2.5 — Localization & Theming (Light/Dark Mode & EN/ID)
**Why now:** adding multilingual support and light/dark theme toggles early in the UI construction phase prevents high refactoring costs later when components are already heavily hardcoded.
- [x] Add translation dictionary structure in `src/dictionaries/` for `en` and `id` translations. Covers nav, dock, aiIntake, stepGuide, homepage, start, about, showcase. Dynamic sample content (case-study titles/summaries, feature-blurb placeholder data) intentionally left untranslated — real copy will need real translation anyway.
- [x] Implement global `LanguageProvider` and `useLanguage` hook to load and manage translation strings — `src/lib/language.tsx`, persisted to `localStorage` (`hyliox-lang`), detects `id` from `navigator.language`, falls back to `en`. No server-side IP/geo detection (would need real geo infra this project doesn't have) — pure client-side per the spec's own "Client-Side... Dictionary pattern" wording.
- [x] Build language toggles (`EN | ID`) — `src/components/layout/PreferencesBar.tsx`, fixed top-right (this site has no header bar, so adapted placement from the spec).
- [x] Implement Tailwind-based `class` dark mode system with a blocking header script to avoid theme flashing — `.light` class override (dark is the unclassed default) + inline script in `src/app/layout.tsx`'s `<head>`, see `src/lib/theme.tsx`.
- [x] Add smooth theme toggle switcher component (Sun/Moon icon with rotation) — in `PreferencesBar.tsx`, AnimatePresence rotate-in per spec.
- [x] Apply semantic color mapping across existing components — `--glass-*` CSS vars added (`globals.css`) and wired through `glassCard` token + every hardcoded `bg-white/*`/`bg-[#151519]` glass surface, so light mode re-tints correctly. Known gap: `showcase/[slug]` had to become a client component for this (see Phase 3 note below) and its "not found" state no longer returns a real 404 status.

## Phase 3 — Motion & Ambient Canvas Polish
**Why now:** the marketing site works without this, but this is what makes it feel like Hyliox instead of a generic dark-mode template. Deliberately placed after the site is functional, not before.
- [x] Ambient canvas, pointer-field mode only, per `webgl-canvas-background.md` (skip object-stage for now) — `src/components/canvas/AmbientCanvas.tsx`, three.js loaded dynamically, mounted in `(marketing)/layout.tsx` over the old static gradient (which now only shows through as the low-power fallback). **Superseded 2026-07-05 (owner's call):** the pointer-field particle grid was replaced with a full-viewport shader — a halftone dot grid colorized by a shifting rainbow hue wave, retro-CRT/static look, alpha-blended at low opacity. Single fullscreen quad + `ShaderMaterial` instead of a per-frame particle loop, so no pointer coupling anymore (ambient/autonomous only) — actually cheaper than the old approach since it drops the O(n^2) line-connect pass.
- [x] DPR clamp, reduced-motion fallback, pause-on-hidden-tab wired up from day one — don't ship this without them. All three implemented: DPR clamped [1, 1.75], reduced-motion renders exactly one frame then stops the loop, `visibilitychange` pauses/resumes.
- [x] Full motion sequencing pass across the home page and showcase pages per `hyliox-motion-system.md` — `/showcase` and `/showcase/[slug]` had zero motion before this pass; both now use the same group/stagger/fadeUp pattern as the home page. `/about` and `/start` got the same treatment for consistency even though not explicitly named here. `showcase/[slug]` was converted from a Server Component (with proper `notFound()`) to a Client Component to allow motion + i18n — it no longer returns a real 404 HTTP status for unknown slugs, just a client-rendered "not found" message. Revisit if that page ever needs real SEO/crawler correctness.
- [x] Hover/tap micro-motion on buttons and inputs — send buttons use the spec's exact `button-primary` values (`whileHover: 1.02`, `whileTap: 0.97`, `emphasized` easing); text inputs/textareas get a `focus-within:border-primary` per `input-focus`; recent-work and showcase cards get a small hover lift.

## Phase 4 — Component Docs v1
**Why now:** this is the credibility/portfolio layer for engineers, and it only makes sense to open once you have components worth documenting — which Phases 0–3 will have produced as a side effect.
- [x] `/docs` introduction + `/docs/installation` + `/docs/theming` — theming page renders `colors`/`lightColors`/`radius`/`spacing` straight from `src/lib/tokens.ts` (dark+light swatches side by side), installation covers the Tailwind v4 `@theme` block + `--glass-*` vars.
- [x] First component batch documented: Button, Input, Textarea, Window Card, Logo Mark, Dock Item — each with a real live preview (`src/components/docs/ComponentPreview.tsx`), a Code tab reading the actual source file off disk (no copy drift possible), an install snippet, and a props table. All 6 were extracted as genuinely reusable components (`src/components/ui/`) and wired back into `IntakeHero`/`DockNav` — the docs aren't describing a separate demo copy. **Scope reduced 2026-07-07**: Button/Input/Textarea/Logo Mark dropped from the docs site (owner's call, ahead of the npm package extraction in a later phase) — they're the kind of component any competent dev builds from scratch in minutes, not worth an external dependency on. Source files themselves are untouched; only the doc entries and the `Primitives`/`Form` groups were removed. Window Card and Dock Item remain, now under a single `Layout` group.
- [x] Docs-specific layout: sidebar nav (`src/components/docs/DocsSidebar.tsx`, grouped Primitives/Form/Layout) — motion intentionally omitted entirely (spec allows "fadeIn at most"; zero satisfies the same goal of never making a developer wait). **2026-07-07**: also made mobile-responsive (was a fixed side-by-side row with no stacking breakpoint) — collapses into a dropdown toggle below `lg`, sidebar+content stack vertically instead of a rigid `flex` row.
- [x] **Full EN/ID localization of `/docs` (2026-07-07)** — the entire docs section had never been localized (no `docs` key existed in either dictionary; every page was hardcoded English). Added a `docs.*` block to both dictionaries covering nav labels, group names, every page's prose, the props table headers, and each component's name/description/a11y/prop descriptions. `ComponentDoc` (`component-docs.ts`) switched from literal `description`/`a11y`/prop `description` strings to `descriptionKey`/`a11yKey`/`descriptionKey` translation keys. `/docs/components/[slug]/page.tsx` (a server component — needs `fs.readFileSync` for the Code tab) delegates all rendering to a new client component, `ComponentDocView.tsx`, so it can call `useLanguage()`. New `/docs/components` index page added (previously 404'd — no page existed at that exact segment, only the `[slug]` dynamic route) with an npm install snippet and a card grid, also fully localized.
- [x] `RepoBadge` (`src/components/docs/RepoBadge.tsx`) — floating GitHub-link pill, fixed bottom-right, docs-only (rendered in `(docs)/layout.tsx`), linking to `github.com/iza-aa/iza-ui`. Bottom-right was the one unclaimed fixed-position corner (top-left: BrandMark, top-right: PreferencesBar, bottom-center: DockNav).
- [x] `CodeBlock` (2026-07-07) — real syntax highlighting via Shiki (`github-dark`/`github-light`, matching the site's own theme toggle), plus a collapsed preview for anything over 12 lines (fade-out gradient + a centered "View Code" button to expand) instead of always dumping the full file — matters most for the longer component sources like `AmbientCanvas.tsx`.
- [x] `DocsSidebar` mobile nav redesigned (2026-07-07) — was an inline accordion dropdown below a page-name button; now a 2-bar hamburger that morphs into an X (owner's reference) and opens a `w-2/3` panel sliding in from the left with a dimmed backdrop, instead of expanding the page content downward.
- [x] **Glassmorphism-during-transform fix (2026-07-07)** — the AI intake card and `IntakeStepGuide` both play a "genie" shrink-to-dock-icon exit (`scale: 1 -> 0.05`); browsers can't reliably keep `backdrop-filter`'s compositing layer in sync with a fast-changing transform mid-animation, so the live blur visibly dropped out for the animation's duration. New `glassCardOpaque`/`glassPillOpaque` tokens (`src/lib/tokens.ts`, swap in `--glass-strong-bg`, no `backdrop-filter` at all) — `WindowCard` gained a `blur` prop (default `true`) to opt into the card variant, used on the intake card and `IntakeStepGuide`. Owner's call to keep spreading the flat-opaque look for visual consistency rather than mixing it with blurred surfaces: the homepage's 4 floating feature-blurb cards (`(marketing)/page.tsx`) and the Design Gallery's cards/filter pills/search box (`DesignGalleryGrid.tsx`) all switched from `glassCard`/`glassPill` too. Scope stayed to what the owner explicitly pointed at each time — docs previews, `ReferencePickerModal`, `PreferencesBar`, and `DockNav` still use live blur.
- [x] Light mode toggle — **scope changed from spec 2026-07-04**: the spec originally wanted this docs-only with marketing staying forced dark. Phase 2.5 had already shipped it as a global toggle instead; confirmed with the owner as the intended direction rather than reverted. See `hyliox-website-system-design.md`'s "Shared Foundation" section for the superseded note.

## Phase 5 — Showcase & Content Expansion
**Why now:** ongoing content work, not core engineering — sequenced after the engineering-heavy phases so it doesn't compete for the same hours.
- [x] Add remaining real projects as case studies — 3 real projects wired in from `src/assets/project/asset-{1,2,3}.png`: IZA Creation Labs (portfolio site), Business Command (SaaS analytics dashboard), HIDRO Water Treatment System (marketing site). `CaseStudy` type gained an `image` field (`StaticImageData`), rendered via `next/image` on both the showcase grid card (16:9 thumbnail) and the detail page hero. **problem/approach/outcome copy is still draft** — written only from what's visible in each screenshot (no invented client names/metrics), same status as `/about`'s draft copy; needs the real project story from the owner before launch.
- [x] Refine the case-study template based on what actually reads well once you have 4–5 of them — **done early at 3 real projects, at the owner's call** (2026-07-05), not waiting for 4–5. Added: a "Back to showcase" link + prev/next case-study nav on the detail page (`src/app/(marketing)/showcase/[slug]/page.tsx`), and updated `showcase.intro` copy in both dictionaries to stop calling the entries samples.
- [x] Only now consider a showcase filter/category UI — **done early at 3 real projects** (one project per type currently, so it's not load-bearing yet, but the infra is real): type pills derived dynamically from `caseStudies` (`Array.from(new Set(...))`, no hardcoded list) on `/showcase`, filtering via `AnimatePresence`/`layout` for a smooth reflow instead of an instant cut.

## Phase 6 — Remaining Component Docs
**Why now:** documents the two more complex, ambient-canvas/motion primitives once the simpler form/layout components have proven the docs pattern works.
- [x] Document the Ambient Canvas component itself (config options, mode switch, accessibility notes) — new `Canvas` doc group, `/docs/components/ambient-canvas`. Added an optional `className` prop to `AmbientCanvas` (default preserves the existing fixed-fullscreen usage) so the doc preview can embed it in a bounded panel instead of only the real fullscreen backdrop. Honestly documents that there's no runtime mode switch yet — pointer-field only, object-stage still deferred.
- [x] Document the Motion wrapper primitives (FadeUp, PopIn, ScaleIn) as installable pieces — these didn't exist as components before (only as `lib/motion.ts` variant objects used inline); extracted real `src/components/motion/{FadeUp,PopIn,ScaleIn}.tsx` wrappers that pick the reduced-motion variant internally via `useReducedMotion()`, then documented them under a new `Motion` doc group with replay-button previews (entrance animations only play once per mount). **Scope reduced 2026-07-07**: dropped from the docs site alongside Button/Input/Textarea/Logo Mark — thin `motion.div` variant wrappers are trivial for a consuming dev to replicate, not worth documenting as an installable dependency. Source files (`src/components/motion/`) are untouched; only the doc entries and the `Motion` group were removed.
- [ ] Docs search (even a simple client-side fuzzy search) once the component count makes browsing slow

## Phase 7 — Design Prompt Gallery
**Why now:** owner-requested (2026-07-05), spec drafted in `design-gallery.md`, built and iterated same day.
- [x] `DesignGalleryGrid` (`src/components/gallery/DesignGalleryGrid.tsx`) embedded directly on the homepage, replacing the old "Recent work" case-study teaser entirely — **not** a separate listing page; owner's call was that visitors shouldn't have to click through to see it. Nav-dock wiring deliberately skipped — no icon asset for it yet.
- [x] Detail route survives on its own at root level: `/[slug]` (`src/app/(marketing)/[slug]/page.tsx`) — moved there from `/gallery/[slug]` once the `/gallery` listing page was removed; widened to `max-w-6xl`; shared marketing `<main>` also widened `max-w-5xl` → `max-w-7xl` (owner wanted it less centered/narrow); back link now reads "Back to home" → `/`
- [x] Detail page content split into three stacked `glassCard`-token panels (header/description/copy-prompt/creator/tags, live preview, raw prompt) instead of plain text directly on the page background; `LivePreviewPanel`'s own container also switched from a plain border to the `glassCard` token
- [x] Gallery card title truncates to one line (`truncate`) instead of wrapping, title/source pinned left/right (`justify-between`) instead of stacked
- [x] Server-side fetch + cache layer — `/api/design-gallery` calls `fetchSuperdesignEntries()` (`src/lib/design-gallery.ts`, `next: { revalidate: 3600 }`) for the Superdesign.dev side only
- [x] **Lazy loading** (added after the first pass fetched unconditionally on mount): Iza entries render immediately via direct import (`izaDesignEntries`, zero network); Superdesign entries only fetch on the visitor's first `scroll` event (`{ once: true }`) — confirmed via Playwright: 0 requests to `/api/design-gallery` before any scroll, exactly 1 after. Detail page checks `izaDesignEntries` for the slug first, only fetches if not found there
- [x] Unified `DesignEntry` type + `mapSuperdesignItem()` mapper — `src/lib/design-gallery.ts`. Filters out `.mp4` thumbnails (animation-tagged entries, `thumbnail.type !== "image"`) since `next/image` can't optimize video
- [x] Iza-authored entries replaced (2026-07-05) with the 3 real shipped projects — same screenshots `src/lib/showcase.ts` already uses (`asset-1/2/3.png`): IZA Creation Labs, Business Command, HIDRO Water Treatment. `src/data/iza-design-entries.ts` restructured around a small `IzaProject[]` array so adding another is a one-object push, no other file changes needed. `description`/`prompt` are draft copy (same status as `showcase.ts`'s case studies) pending the real project story from the owner. `staticPreview` dictionary string genericized (was Superdesign-specific wording) since Iza entries now hit that same screenshot-fallback path in `LivePreviewPanel`.
- [x] Source filter pills (All / Iza / Superdesign.dev) restyled as a `glassCard`-token segmented pill group (same recipe as `PreferencesBar`'s EN/ID toggle), not plain outlined buttons
- [x] Detail page — description, tags, creator credit (Superdesign entries only, conditionally rendered), Copy Prompt button (clipboard + "Copied!" state), full raw prompt in a code block
- [x] Live preview panel (`src/components/gallery/LivePreviewPanel.tsx`) — same-origin `srcDoc` iframe for Iza entries; scrollable static-screenshot fallback (with a visible "static preview" label) for Superdesign entries, confirmed necessary since their `previewUrl` sets `Content-Security-Policy: frame-ancestors` excluding any domain but their own + localhost
- [x] `next.config.mjs` — `images.remotePatterns` for Superdesign's Supabase thumbnail bucket and Google-hosted creator avatars
- [x] Verified end-to-end in-browser (Playwright) after every iteration: full 62-entry grid renders on the homepage, filter pills work, lazy-load fires on scroll (not before), Iza detail page's live iframe renders, Superdesign detail page's screenshot fallback + creator credit + Copy Prompt all work
- [x] **Per-card media lazy mount (2026-07-07)** — video-thumbnail cards (`<video preload="metadata">`, added when the video-thumbnail fix above landed) have no native lazy-loading like `next/image` does, so all of them fired simultaneous `.mp4` requests on render. `GalleryCard`/`ReferenceCard` now gate the real `<video>`/`<Image>` behind Framer Motion's `useInView` (`once: false`, `margin: "200px"`) — media unmounts again once a card scrolls back out of view, not just deferred once — see `design-gallery.md`'s Lazy Loading section

## Phase 8 — Intake Reference Picker
**Why now:** owner-requested (2026-07-05), spec drafted in `intake-reference-picker.md`, built and verified same day.
- [x] Added `"references"` as a second `kind` value on the `question` block (system prompt, `intake-prompt.ts`), alongside the existing `"contact"` — model given a worked example, told the interface adds its own gallery action automatically
- [x] Interface-added "Browse design gallery" action row on `QuestionCard` (new `extraAction` prop) when `kind === "references"` — rendered between the numbered options and the "type my own answer" row
- [x] Factored `DesignGalleryGrid`'s data-fetching into `useDesignEntries()` (`src/lib/use-design-entries.ts`) — `immediate` param controls scroll-gated (homepage) vs fetch-on-mount (picker modal) loading; both the homepage grid and the picker modal consume it, no duplicated fetch logic
- [x] `ReferencePickerModal` (`src/components/gallery/ReferencePickerModal.tsx`) — Browse view (filter pills + search, `useDesignEntries(true)` for immediate fetch) and Detail view (header/tags/copy-prompt, `LivePreviewPanel` reused as-is, "Select this as reference" button) in one component, switching via local state so filter/search survives going back from Detail
- [x] Owner decision: kept the spec's recommended default — full live preview panel in the Detail view, not a lighter thumbnail-only variant
- [x] Selecting an entry calls `IntakeHero`'s `selectReference()`, which submits `"Referensi: {title} — {description} ({origin}/{slug})"` as a normal chat message and closes the modal
- [x] Verified end-to-end in-browser (Playwright): model emitted the `references` question with the `kind` flag and its own options; the interface-added "Jelajahi galeri desain" row appeared correctly; opening the modal showed both Iza and Superdesign entries immediately (no scroll needed); picking IZA Creation Labs → "Pilih ini sebagai referensi" closed the modal and the model moved straight to the next question, treating the reference as a normal answer

## Phase 9 — Chat Polish: Auto-Scroll Clearance & Abuse Lockout
**Why now:** owner-reported bugs/request (2026-07-05), fixed same day.
- [x] Fixed auto-scroll not clearing the fixed composer/QuestionCard bar — root cause was `padding-bottom` on the message list's parent, which `scrollIntoView` ignores; replaced with dynamic `scroll-margin-bottom` on the sentinel itself, sized from the composer's real height via `ResizeObserver`. See `ai-intake-chat.md`'s Auto-Scroll section for the full before/after.
- [x] Abuse lockout — `src/lib/abuse-filter.ts` (narrow profanity/slur regex, client-side, no API call) + `IntakeHero.tsx`'s `triggerBan()`/`BannedCard`: a match immediately locks the whole intake widget, doubling duration per repeat offense (1min → 2 → 4 → 8...), persisted to `localStorage` so a refresh isn't a bypass. See `ai-intake-chat.md`'s Abuse Lockout section.
- [x] Verified in-browser: "woi anjeng" locked out instantly (zero `/api/intake` calls), ban survived a page reload, a second offense (simulated post-expiry) doubled the lockout from 1 to ~2 minutes

## Phase 10 — `iza-ui` npm Package
**Why now:** owner-requested (2026-07-07), spec drafted in `npm-package.md`. Only the components proven genuinely non-trivial in this app's own docs site get extracted — Button/Input/Textarea/Logo Mark/the Motion wrappers were dropped from `/docs` in the same pass (Phase 4/6 notes) specifically because they don't clear that bar.
- [x] Distribution model decided: traditional npm package with precompiled static CSS (`npm install iza-ui` + one `import "iza-ui/styles.css"`), not a shadcn-style copy-paste CLI — see `npm-package.md`'s Distribution Model Decision. Supersedes the "CLI installer / registry.json" idea previously listed under Later/Not Yet Committed below.
- [x] Package name `iza-ui` confirmed available on the npm registry; repo `iza-aa/iza-ui` created (empty, public) and cloned to `d:\iza-ui`
- [x] Scaffolded package (`package.json`, `tsup`, Tailwind CSS build step) — `npm run build` verified working end-to-end (ESM+CJS+d.ts+styles.css, no errors)
- [x] Ported `WindowCard` and `AmbientCanvas` (both already app-agnostic) and extracted a new generic `Dock` container (hover-boost/collision-avoidance math) into the package — pushed to `main`
- [x] Published `iza-ui@0.1.0` to the public npm registry (owner-run 2FA approval via granular access token, since npm's security-key 2FA can't be approved headlessly)
- [ ] This app's own `DockNav.tsx` still has its own inline copy of that logic — now that the package is actually published, this can be revisited: swap it to `npm install iza-ui` and consume the published `Dock` instead

## Later / Not Yet Committed
These are real ideas from the specs, deliberately deferred — build them once the above is live and you have actual usage data, not before:
- Object-stage 3D mode for the ambient canvas
- Interactive props playground on component doc pages
- Multi-channel intake delivery (Telegram in addition to email)

## Definition of Done for v1 Launch
Treat the site as launchable once all of these are true — everything else on this roadmap can keep shipping after launch:
- [ ] Marketing site (Phase 1) is live with real showcase content, not placeholders
- [ ] AI intake chat (Phase 2) has been tested end-to-end and reliably delivers a readable brief to your inbox
- [ ] Ambient canvas and motion (Phase 3) respect `prefers-reduced-motion` and don't tank performance on a mid-range phone
- [ ] Docs site (Phase 4) has at minimum Introduction, Installation, Theming, and the first component batch — it doesn't need to be complete, just not embarrassingly empty
- [ ] Both products share the same token file with zero visible drift between them
