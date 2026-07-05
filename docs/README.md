# Docs Source Index

This folder is the living source of truth for Hyliox — design tokens, product
architecture, and build sequence. The rule is simple: **every file here must
either be referenced by another file in this set, or be this index itself.**
If a file can't be reached by following references from here, it's stale —
delete it, or fold its content into a canonical file.

## Canonical specs (in dependency order)

1. **`hyliox-waitlist-card.md`** — design tokens (colors, typography, radius,
   spacing) and base component definitions. Every other spec inherits its
   color/typography values from here — nothing downstream should ever
   introduce a color, font, or spacing value that isn't declared in this
   file. Implemented in code at `src/lib/tokens.ts` (TypeScript mirror) and
   `src/app/globals.css` (Tailwind `@theme` mirror).
2. **`webgl-canvas-background.md`** — the ambient WebGL canvas (pointer-field
   / object-stage modes). Colors reference `#1`.
3. **`hyliox-motion-system.md`** — entrance and interaction motion rules
   (Framer Motion). Colors and spacing reference `#1`.
4. **`hyliox-website-system-design.md`** — the master architecture doc: the
   two-product split (marketing / docs), information architecture, the AI
   intake system, the component docs model. References `#1`, `#2`, `#3`,
   and `#5`.
5. **`ai-intake-chat.md`** — guardrails, UI pattern, and Gemini free-tier
   handling for the AI intake chat that `#4` points to. Reuses colors from
   `#1` and the visual pattern established alongside it.
6. **`roadmap.md`** — build sequence across all of the above. Its `inputs`
   frontmatter should always list every file numbered `1`–`5` above; if you
   add a new canonical spec, add it to `roadmap.md`'s `inputs` and to this
   index in the same pass.
7. **`hyliox-localization-theming.md`** — global Light/Dark mode and bilingual
   (English/Indonesian) systems. Extends token values from `#1` and translates
   UI prose across all layouts.
8. **`design-gallery.md`** — the Design Prompt Gallery: a browsable grid of
   design-system "prompts" sourced from Iza's own hand-authored entries plus
   the public Superdesign.dev prompt-library API. Reuses colors/cards from
   `#1`, motion from `#3`.
9. **`intake-reference-picker.md`** — bridges the AI intake chat's references
   question to the Design Gallery via a browse/detail modal flow. Extends
   `#5` (the `question` block's `kind` flag) and `#8` (`DesignEntry`,
   `DesignGalleryGrid`, `LivePreviewPanel`).

## Not canonical — do not treat as a source of truth

- **"Vercel Minimal"** (you may have this saved locally as
  `vercel.app-design.md`, `Vercel Minimal.md`, or similar) — this was the
  **original formatting template** used to establish the
  YAML-frontmatter-plus-prose schema that every file above follows. It was
  never implemented: none of its token values exist anywhere in this
  codebase, which uses the Hyliox Dark Glass palette from `#1` exclusively
  (compare its `#171717` primary against `src/lib/tokens.ts`'s `#3B82F6` —
  they don't match, and that's expected). **Delete this file, or move it
  outside `docs-source/`** (e.g. into a top-level `/reference` or
  `/inspiration` folder) so it stops surfacing in audits of the live spec
  set. It has no functional relationship to anything in this project beyond
  having lent its document shape.

## Keeping this index honest

Before adding a new `.md` file to `docs-source/`:
1. Add one line to the "Canonical specs" list above describing its purpose.
2. Say which existing file(s) it should be referenced from, and go add that
   reference (don't just add the file and assume it'll get linked later).
3. Add it to `roadmap.md`'s `inputs` frontmatter.

If a file can't earn a line here, it doesn't belong in `docs-source/`.
