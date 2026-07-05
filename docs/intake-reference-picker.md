---
version: alpha
name: Intake Reference Picker
description: Bridges the AI intake chat's "references" question to the Design Gallery — instead of only typing a description or pasting an external link, the client can browse/search Iza's and Superdesign.dev's gallery entries in a modal and pick one as their reference, without leaving the chat.
extends:
  - ai-intake-chat.md — the references field, the `question` block protocol, the `kind` flag pattern (already used for `"contact"`)
  - design-gallery.md — `DesignEntry` shape, `DesignGalleryGrid`, `LivePreviewPanel`, the Superdesign.dev fetch/cache/lazy-load rules
trigger: the references question's `question` block carries `"kind": "references"` (a second `kind` value, alongside the existing `"contact"`) — the interface renders the model's normal options plus one interface-added action, "Browse design gallery," that opens the picker.
flow:
  1. Browse modal — `DesignGalleryGrid`'s data/filtering logic reused (Iza entries instant, Superdesign entries fetched immediately on open — no scroll-gate here, opening the modal already *is* the deliberate action), plus a search input (title/tags substring match) not present in the homepage grid. Cards are clickable but don't navigate.
  2. Detail modal — same content as the `/[slug]` page (header, tags, creator credit, live preview, prompt), stacked on top of the browse modal, with a "Select this as reference" button below the content.
  3. Selecting an entry closes both modals and sends a chat message referencing the entry (title + description + a link to `/[slug]`) as the client's answer to the references question — same as if they'd typed or pasted it themselves.
placement: modal components live in `src/components/gallery/` alongside the existing gallery pieces; rendered from `IntakeHero.tsx`, gated on the active question's `kind === "references"`.
---

# Intake Reference Picker

## Overview
Today, when the AI intake chat asks about references, the client either types a description, pastes a link (which the model can't fetch or browse — see `ai-intake-chat.md`'s Quick Actions), or says they don't have one. All three are worse than just letting them point at something concrete. This site already has a gallery of real design-system examples sitting one component away (`design-gallery.md`) — this feature wires the two together: the references question gets a "browse the gallery instead" option, and picking an entry there becomes the client's answer, with a real link the model (and later, Iza) can actually open.

## Why This, Not Just a Link
A client who says "I don't really have a reference" often just means they haven't found the right word for what they want — shown a grid of actual styles, they can usually point at one. And a client who says "like this link" today hands the model a URL it explicitly can't visit (scope-locked, no browsing tool) — the model has to ask them to describe it anyway. Routing through the gallery sidesteps both problems: what gets selected is always something Iza's own site already has full detail on (title, description, tags, and for Superdesign entries, the original creator), so the eventual brief links to something real and inspectable, not a dead reference to an unfetched URL.

## The `references` Kind
Extends `ai-intake-chat.md`'s existing `question` block `kind` field (previously only `"contact"`, for the name/email form):

```question
{"prompt": "Ada referensi desain yang Anda suka?", "options": ["Belum ada", "Ada, tapi biar saya jelaskan"], "kind": "references"}
```

Rendering rule: when `kind === "references"`, the QuestionCard shows the model's own options exactly as it does today, plus one interface-added action row — **"Browse design gallery"** — that opens the Browse Modal. This mirrors how the contact `kind` gets a dedicated form instead of chips; here the addition is a launcher for a modal, not a replacement for the whole card. The model doesn't know or care that this option exists — same as it doesn't author the "type my own answer" row.

## Browse Modal
Reuses the exact data and filtering logic `DesignGalleryGrid` already has (Iza entries via direct import, Superdesign entries via `/api/design-gallery`, source filter pills) — factor the data-fetching/filtering into a shared hook (e.g. `useDesignEntries()`) so the homepage grid and this modal don't duplicate the fetch-and-merge logic, only their rendering shells differ (one links to `/[slug]`, the other calls a `onSelect(entry)` callback instead of a `<Link>`).

Two differences from the homepage grid:
- **A search input**, filtering the already-loaded entries by `title`/`tags` substring match, client-side only (no new endpoint) — the homepage grid deferred this per `design-gallery.md`; a modal with an explicit picking task is exactly the context where it earns its keep.
- **No scroll-gate on the Superdesign fetch.** The homepage defers that fetch until the visitor actually scrolls, because most visitors never asked to see it. Opening this modal is an explicit request to browse — fetch immediately (still through the same cached `/api/design-gallery` route, so it's cheap and instant if another part of the page already warmed the cache).

## Detail Modal
Stacks on top of the Browse Modal (browse stays mounted underneath, closing detail returns to it) rather than replacing it — a client comparing a few candidates shouldn't lose their filtered/searched grid state to go back and forth. Same content as the `/[slug]` page's three glass-card panels (header/description, live preview, prompt) reused as-is, plus a "Select this as reference" button beneath them.

**Open question for the owner:** the real detail page's live preview panel is a full `srcDoc` iframe (Iza entries) or a full-resolution scrollable screenshot (Superdesign entries) — reused verbatim here, that's real weight to load inside a modal that's meant for a quick pick mid-conversation. Recommend keeping it as specified (consistency, and the client is already committed to evaluating this one candidate closely) but worth a deliberate call rather than an assumption; a lighter alternative would show just the thumbnail + description here and link out to the full `/[slug]` page (new tab) for anyone who wants the live preview before deciding.

## Selecting a Reference
"Select this as reference" closes both modals and calls the same `submit()` the rest of the chat uses (as if the client had typed an answer or tapped a `question` option), with a message shaped like:

```
Referensi: {entry.title} — {entry.description} ({origin url to /[slug]})
```

This becomes the client's chat message and the model's next turn treats it exactly like any other references answer — no special-casing needed downstream, the model just sees text.

## Do's and Don'ts
- Do gate the "Browse design gallery" action strictly on `kind === "references"` — it has no reason to appear on any other question.
- Do share the data/filtering logic between the homepage grid and this modal (one hook, two render shells) — don't fork `DesignGalleryGrid` into a second copy.
- Do fetch Superdesign entries immediately on modal open, not scroll-gated — opening the modal is itself the deliberate action the homepage's scroll-gate exists to wait for.
- Do add the search input here even though the homepage grid deliberately skipped it — a picking task is a different context than passive browsing.
- Do keep the Detail Modal stacked above the Browse Modal (not a replacement for it) so filtered/searched state survives a client comparing multiple candidates.
- Don't let the model author or know about the gallery-browse option — it's purely an interface affordance, same as the auto-appended "type my own answer" row.
- Don't invent a new data shape for the selected reference — send it as plain chat text (title + description + link), the same way every other answer reaches the model.
