---
version: alpha
name: Design Prompt Gallery
description: A browsable gallery of design-system "prompts" (style descriptions + generated HTML/CSS specs) shown as a grid of cards with a detail view per entry — own template/visual language, not an embed of any third party's UI. Two sources feed the same gallery: Iza's own hand-authored entries, and public entries pulled from the Superdesign.dev prompt-library API.
placement: the full gallery grid (`DesignGalleryGrid`) is embedded directly on the homepage (2026-07-05, owner's call — replaced the old "Recent work" case-study teaser entirely, no separate listing page) — kept separate from `/showcase` (real past-client case studies, unchanged, just no longer linked from the homepage). The detail route lives at root level, `/[slug]` (`src/app/(marketing)/[slug]/page.tsx`) — not `/gallery/[slug]`; it moved there once the `/gallery` listing page was removed, so card links (`/${entry.slug}`) and the back link (`/`) had nothing left to nest under.
filters:
  - source: "Iza" | "Superdesign.dev" — the only filter, per the owner's spec. Not the original site's category tabs (Style/Animation/UI Component/Landing Page).
dataSources:
  iza:
    storage: local, hand-authored — `src/data/iza-design-entries.ts`, a plain `DesignEntry[]` array, imported directly by client components. No network request at all for this side, ever.
    shape: identical `DesignEntry` shape to the Superdesign-derived items (see Unified Item Shape) — authored directly in that shape, not adapted from something else
  superdesign:
    endpoint: "https://api.superdesign.dev/v1/prompt-library"
    auth: none — public, `isPublic=true`, CORS open (`access-control-allow-origin: *`)
    status: undocumented/unofficial third-party API, not a partner integration — see Fetching Strategy & Fragility
    loading: lazy — not fetched until the visitor's first scroll event, client-side, via `/api/design-gallery`. See Lazy Loading.
ui:
  gallery: grid of cards (thumbnail + title), source filter pills (All / Iza / Superdesign.dev) styled as one `glassCard` segmented pill group (same recipe as `PreferencesBar`'s EN/ID toggle) — see Gallery Grid
  detail: title, description, tags, "Copy prompt" action, scrollable live/screenshot preview panel — see Detail Page
---

# Design Prompt Gallery

## Overview
A gallery page that showcases design-system "recipes" — a short description plus a structured or free-text `prompt` that specifies colors, type, layout, and component treatment for a particular aesthetic (e.g. "Brutalist Style Ecommerce Page", "Glassmorphism Card"). Visually it takes cues from Superdesign.dev's own "Discover design prompts" screen (grid cards, a detail view with a scrollable preview panel) — but rebuilt in this site's own visual language (glass cards, `--glass-*` tokens, existing type scale), not an embed or a CSS clone of their page.

## Why Our Own Template, Not an Embed
Superdesign.dev's gallery is their product's UI, not an API we can visually inherit — we only get raw JSON back, no stylesheet. Rebuilding it as a first-party page means: it matches the rest of this site (dark glass, `font-display` headings, existing card/motion patterns), it doesn't break if their frontend changes, and it can mix in Iza's own entries in the exact same visual slot as the Superdesign-sourced ones — which an iframe/embed of their page could never do.

## Unified Item Shape
Both sources render through one internal shape so the gallery/detail components never branch on where an entry came from:

```ts
type DesignEntry = {
  id: string;
  source: "iza" | "superdesign";
  title: string;
  slug: string;
  description: string;
  tags: string[];
  thumbnailUrl: string;
  prompt: string;              // raw string — see "The prompt field is not one shape" below
  previewHtml?: string;        // Iza entries only — see Live Preview Panel
  previewUrl?: string;         // Superdesign entries only — their hosted draft page (can't be iframed off-domain, see below)
  creator?: { name: string; avatarUrl: string }; // Superdesign entries only — Iza entries have no creator block
  sourceUrl?: string;          // Superdesign entries only — outbound "View on Superdesign" link, built from `slug`
};
```

Iza entries are authored directly in this shape (minus the Superdesign-only fields). Superdesign API items map onto it: `thumbnail.url` → `thumbnailUrl`, `creator` → `creator`, `prompt` stays a raw string, `previewUrl` stays as given.

## Data Sources

### Iza-Authored Entries
Hand-written, stored locally in the repo (not fetched at runtime), in `src/data/iza-design-entries.ts`. `prompt` can be either a JSON-stringified design-token spec (mirroring the Superdesign `{summary, style, layout_and_structure, ...}` shape — see below) or a plain prose/HTML string — whichever actually fits that entry, matching the same inconsistency the Superdesign data itself has. The point of matching the shape isn't rigid JSON-schema conformance, it's that the same `DesignEntryCard`/`DesignEntryDetail` components render either source without special-casing.

As of 2026-07-05, the entries are the site's own real shipped projects (same screenshots `src/lib/showcase.ts` uses for `/showcase`: IZA Creation Labs, Business Command, HIDRO Water Treatment), not synthetic design-system mockups — `thumbnailUrl` points at the real screenshot (`asset.src`, a `next/image` static import), so they render through `LivePreviewPanel`'s screenshot-fallback path, not the `previewHtml` iframe path. The file is deliberately structured around one small `IzaProject[]` array (`slug`, `title`, `description`, `tags`, `image`, `prompt`) mapped once into `DesignEntry[]` at the bottom — adding a new entry is a single object pushed onto that array, nothing else in the file changes. `description`/`prompt` are draft copy (same status as `showcase.ts`'s own case studies) until the owner supplies the real project story.

### Superdesign.dev API (Contract)
```
GET https://api.superdesign.dev/v1/prompt-library
  ?teamId=3893cf88-5782-4d87-9f92-baf1966238e4
  &isPublic=true
  &tags=style          # optional — omit for all categories
  &limit=15&offset=0   # pagination
```
No API key, no auth header. Response:
```jsonc
{
  "items": [ /* DesignEntry-shaped items, see below */ ],
  "total": 60,
  "limit": 15,
  "offset": 0
}
```
Each item (trimmed to the fields we actually use):
```jsonc
{
  "id": "67d2aff0-...",
  "title": "Brutalist Style Ecommerce Page",
  "slug": "brutalist-style-ecommerce-page",
  "description": "A brutalist editorial design system for...",
  "tags": ["ecommerce", "landing page", "style", "orange accent"],
  "prompt": "{...json string...}",           // or plain text/HTML — see below
  "thumbnail": { "url": "https://.../screenshot.png" },
  "previewUrl": "https://p.superdesign.dev/draft/10ecb2c3-...",
  "creator": { "name": "Shirley Lou", "avatar": "https://..." },
  "stats": { "copyCount": 933, "remixCount": 2500, "tryCount": 1567 }
}
```

**The `prompt` field is not one shape.** Verified against real entries (fetched directly, 2026-07-05): most items' `prompt` is a JSON string with a `{summary, style: {description, prompt}, layout_and_structure: {description, prompts: [{part, prompt}]}, special_ui_components?}` shape. Some ("Deep Red Style", "Red Noir Style") are instead a plain prose string that itself contains a raw HTML reference implementation, no JSON at all. **Render `prompt` as an opaque string always** — try `JSON.parse` for a nicer structured view when it succeeds, fall back to a plain code block when it doesn't. Don't assume the JSON shape is guaranteed.

**`previewUrl` cannot be iframed on our domain.** Checked its response headers directly: `content-security-policy: frame-ancestors https://superdesign.dev https://app.superdesign.dev https://*.superdesign.dev http://localhost:*`. That explicitly excludes any production domain this site would run on — the browser will refuse to render it in an `<iframe>` outside `localhost` or their own domains. So the "scrollable live preview" from the reference screenshot works for **Iza's own entries** (we control and can iframe our own hosted HTML) but **not** for Superdesign-sourced entries in production — see Live Preview Panel for the fallback.

**Some thumbnails are video, not images.** A handful of entries (animation-tagged ones) have `thumbnail.type === "video"` with an `.mp4` URL — `next/image` can't optimize video and throws at request time if handed one. The mapper only exposes `thumbnailUrl` when `thumbnail.type === "image"`; video-thumbnail entries render with no thumbnail (same as any Iza entry) rather than breaking the grid.

**Remote image hosts need whitelisting.** `next.config.mjs`'s `images.remotePatterns` needs both `*.supabase.co` (thumbnail screenshots, Superdesign's storage bucket) and `lh3.googleusercontent.com` (creator avatars, Google account photos) — missing either throws a runtime "hostname not configured" error on that image.

### Fetching Strategy & Fragility
This is an unofficial, undocumented endpoint of someone else's product, not a public partner API — no published contract, no rate-limit docs, no stability guarantee, and the content itself belongs to Superdesign/their contributors, not us. Treat it accordingly:
- **Fetch server-side, cached.** `/api/design-gallery` (a Next.js route handler) calls the Superdesign endpoint and caches the result (`fetch(..., { next: { revalidate: 3600 } })`) — visitors' browsers only ever call our own route, never the upstream API directly. Protects against them changing/rate-limiting/blocking it, and means the gallery still renders (from cache) if their API is briefly down.
- **Fetch lazily, client-side, on top of that.** Even our own cached route isn't called until the visitor actually scrolls — see Lazy Loading. Both protections apply together: the route is cheap to call because it's cached, and it's rarely called at all because it's scroll-gated.
- **Don't over-fetch.** Pull a bounded set (currently the first 60, no per-tag pagination), not an attempt to mirror their entire library.
- **Attribute it.** Every Superdesign-sourced card/detail should credit the original creator (`creator.name`) and link back (`sourceUrl`, built from the slug) — we're surfacing their contributors' work, not claiming it.

## Lazy Loading
Added 2026-07-05 after the first pass fetched Superdesign's API unconditionally on every page load. Now: Iza's entries render immediately (`izaDesignEntries` is a plain array, imported directly — nothing to wait for), and a `window` `scroll` listener (`{ once: true }`) is the trigger for fetching Superdesign's entries — first scroll event of any size fires it, then the listener removes itself. Deliberately **not** an on-mount `IntersectionObserver` check: a short card list (the old homepage preview, back when it only showed 3 cards) can sit fully "in view" the instant the page loads, which would fire an intersection-based trigger immediately and defeat the point. A real scroll event is unambiguous — it only happens because the visitor scrolled. `GalleryDetailPage` follows the same spirit: it checks `izaDesignEntries` for the requested slug first (synchronous, no network) and only calls `/api/design-gallery` if the slug isn't one of ours — an Iza detail page never talks to Superdesign at all.

## Gallery Grid
`DesignGalleryGrid` (`src/components/gallery/DesignGalleryGrid.tsx`) — a grid of cards (thumbnail image, then a title/source row — title left, source label right, `justify-between` — with the title truncated to one line (`truncate`, not wrapped) so a long title never pushes the source label around or grows the card; this site's `glassCard` token for the card surface, hover lift consistent with the existing `/showcase` cards) plus the source filter pills, all in one component. **Embedded directly on the homepage** (replacing the old "Recent work" case-study teaser, 2026-07-05) rather than living behind its own listing route or a "browse gallery" link — the owner's call was that visitors shouldn't have to click through to see it. Filter pills (**All** / **Iza** / **Superdesign.dev**) render as one `glassCard`-token segmented pill group, same visual recipe as `PreferencesBar`'s EN/ID toggle (a single pill container, active option gets `bg-primary`) — not the plain outlined-button pills `/showcase`'s type filter uses, and not the reference screenshot's All/Style/Animation/UI Component/Landing Page category tabs, which are that product's own IA. A search input is optional/deferred — not in the current spec.

## Detail Page
`/[slug]` (root level — see placement note above) — the only route this feature still has of its own (the grid lives on the homepage, not behind a separate listing page). Back link reads "Back to home" and points at `/`, not a `/gallery` that no longer exists. Content area is `max-w-6xl` (widened 2026-07-05 from an initial `max-w-4xl` — the owner wanted the gallery pages noticeably wider than a narrow centered read); the shared marketing `<main>` wrapper itself was also widened, `max-w-5xl` → `max-w-7xl`.

Three stacked `glassCard`-token panels (2026-07-05 — previously plain text directly on the page background):
1. **Header panel** — source label, title, description, "Copy prompt" button, creator credit (Superdesign entries only), tags.
2. **Preview panel** — `LivePreviewPanel`, itself styled with the `glassCard` token internally (see below) rather than a plain border.
3. **Prompt panel** — heading + the raw `prompt` string in a `<pre>` block.

A "Copy prompt" button (copies the raw `prompt` string to the clipboard — genuinely useful output, unlike a "Remix on Superdesign" button which only makes sense on their own product and should not be replicated here).

## Live Preview Panel
Right-side (or below, on mobile) panel showing the design in an actual scrollable frame, matching the reference screenshot's behavior:
- **Iza entries:** render `previewHtml` in a same-origin `<iframe srcDoc={previewHtml} />` — no CSP issue since we own the content, scrolls naturally inside the iframe.
- **Superdesign entries:** `previewUrl` can't be iframed off their domain (see CSP note above). Fall back to the `thumbnailUrl` screenshot rendered at full resolution inside a scrollable container (`overflow-y-auto`, fixed viewport-sized frame) — not interactive, but scrollable and visually equivalent to the reference for a static design review. Note this limitation visibly in the UI (e.g. a small "static preview" label) rather than silently pretending it's live.

Both branches render inside the `glassCard` token (2026-07-05 — was a plain `border-border-subtle` box before) so the panel matches the rest of the detail page's glass-panel treatment instead of standing out as a bare bordered rectangle.

## Do's and Don'ts
- Do treat `prompt` as an opaque string first, structured JSON second — never assume every entry parses.
- Do fetch the Superdesign API server-side and cache it (`/api/design-gallery`, `revalidate: 3600`) — never call the upstream endpoint directly from the client.
- Do gate that fetch behind an actual scroll event — don't hit it unconditionally on page load, and don't use an on-mount visibility check that could fire before any real scrolling happened.
- Do check `izaDesignEntries` locally before fetching on the detail page — an Iza entry's detail view should never touch the network.
- Do attribute Superdesign-sourced entries (creator name + link back) — this is someone else's content.
- Do author Iza entries in the same `DesignEntry` shape so both sources share one render path.
- Don't iframe `previewUrl` and expect it to work in production — its CSP blocks any domain but Superdesign's own and `localhost`.
- Don't hand a `.mp4` thumbnail URL to `next/image` — check `thumbnail.type === "image"` first.
- Don't copy the reference screenshots' category tabs (Style/Animation/UI Component/Landing Page) — the spec's filter is source-based (Iza vs Superdesign.dev) only.
- Don't build a "Remix on Superdesign" button — that action only makes sense inside their product.
- Don't gate the gallery behind a click-through — it renders directly on the homepage, not behind a "browse gallery" link.
