---
version: alpha
name: Hyliox Website System Design
description: One domain, two independent products sharing one visual language — a services/marketing site with an AI-driven intake chat and project showcase, and a fully custom, open-source component documentation site (shadcn-style UX, zero shadcn/ui dependency).
stack:
  framework: Next.js (App Router)
  styling: Tailwind CSS, custom component library (no shadcn/ui, no external UI dependency)
  animation: Framer Motion, per hyliox-motion-system.md
  ambientBackground: Three.js / WebGL, per webgl-canvas-background.md
  designTokens: per hyliox-waitlist-card.md (shared source of truth for both products)
  ai: Google Gemini API (free tier, gemini-3-flash-preview) — intake conversation + structured brief extraction; see ai-intake-chat.md
  email: Resend (or Nodemailer/SMTP) — brief delivery to owner
  content: MDX for docs pages, static/CMS-optional for showcase case studies
  hosting: Vercel
productSplit:
  marketing:
    label: Jasa (Work with me)
    routes: [/, /showcase, /showcase/[slug], /about]
    entryPoint: prompt-box intake chat embedded directly in the home hero (no modal, no separate trigger click)
    visualTreatment: full Hyliox Dark Glass — ambient canvas, heavy motion, card-framed content
  docs:
    label: Components (Docs)
    routes: [/docs, /docs/introduction, /docs/installation, /docs/theming, /docs/components/[slug]]
    visualTreatment: sidebar-driven, low-motion, functional-first, same color tokens, light+dark toggle
navigation:
  topLevel: floating bottom dock (2 icon-only tiles — logo mark "Work", brackets glyph "Components") — replaces the earlier header segmented switcher; hover reveals a text tooltip, active product marked by a dot indicator
  docsSidebar: [Introduction, Installation, Theming, Components (grouped: Primitives, Form, Layout, Motion, Background)]
  openQuestion: hyliox-localization-theming.md still assumes a header-level theme/language switcher; since the dock has no header left to anchor those controls to, their placement needs to be decided before that spec is implemented
aiIntake:
  trigger: none needed — the prompt box is the hero itself, visible on page load
  flow: greeting -> guided questions -> free-form clarification -> confirmation -> structured brief generated -> emailed to owner -> confirmation shown to customer
  extractedFields: [name, email, projectType, budget-range, timeline, description, references/inspiration, urgency]
  provider: Google Gemini API (free tier, gemini-3-flash-preview) — see ai-intake-chat.md
  deliveryChannel: email (not yet wired — chat + guardrails are live, Resend delivery is still pending)
  transcriptHandling: full transcript included as collapsible/attached, brief is the primary readable summary
componentDocsModel:
  distribution: copy-paste source code (own components, MIT-licensed or similar), no npm install of a third-party kit
  perComponentPage: [live preview, code tab with copy button, installation snippet, props table, variant list, accessibility notes]
  registry: optional CLI/registry.json later (shadcn-style `npx add component`) — noted as a phase 2 option, not required for v1
---

# Hyliox Website System Design

## Overview
This is one domain hosting two products that intentionally look and behave differently, because they're read by two different people in two different mental modes. A prospective client lands on the marketing side to be sold on Hyliox and to describe a project — that side should feel alive: ambient canvas, staged entrances, glass cards, exactly the language already defined in the three companion specs. An engineer lands on `/docs` to scan, copy, and ship — that side should feel fast and quiet, closer to a reference manual than a landing page. Both sides pull from the same color/typography/spacing tokens so the brand never fractures, but motion and layout density are allowed to diverge sharply.

## Information Architecture
A floating bottom dock — two icon-only tiles, the logo mark for "Work" and a brackets glyph for "Components" — is the only permanent bridge between the two products. It replaces the earlier header segmented switcher entirely: no header remains. Each tile shows a text tooltip on hover/focus (since there's no persistent label) and a small dot indicator marks whichever product is currently active, so the lack of visible text doesn't cost legibility.

**Marketing (`/`, `/showcase`, `/showcase/[slug]`, `/about`)**
The home page carries the brand block (logo, wordmark, caption) followed directly by the AI intake prompt box as the hero's centerpiece — see **AI Intake System** below — and a preview strip of 3–4 showcase items underneath. `/showcase` is the full grid; each `/showcase/[slug]` is a case study page (problem, approach, outcome, visuals — no fixed word count, but keep it scannable). `/about` carries positioning and credibility, written in your own voice.

**Docs (`/docs/*`)**
`/docs` is the landing/introduction. `/docs/installation` covers how someone pulls a component into their own project (copy-paste instructions, required Tailwind config, token file). `/docs/theming` is effectively a rendered version of `hyliox-waitlist-card.md`'s token table — colors, typography, radius, spacing — so engineers can retheme without guessing. `/docs/components/[slug]` is one page per component (Button, Input, Textarea, Window Card, Logo Mark, Dock Item, Ambient Canvas, and the Motion primitives — FadeUp/PopIn/ScaleIn wrappers from `hyliox-motion-system.md`).

## AI Intake System
The prompt box *is* the hero — there's no separate CTA that "opens" a chat interface, and no static form. The AI's job is to (1) sound like a helpful intake coordinator, not a generic chatbot, (2) ask enough guided questions to cover `extractedFields` without feeling like an interrogation, and (3) know when the conversation has enough signal to wrap up. On completion, the model produces a **structured brief** (short, scannable — name, contact, project type, budget range, timeline, a 3–5 sentence description, any references), rendered inline as a confirmation card in the transcript. Emailing that brief to the owner is wired via SMTP (nodemailer, `/api/send-brief`) rather than Resend — see `ai-intake-chat.md` for the full guardrail/UI spec, which this section only summarizes.

Two things matter for trust here: tell the customer up front that a human (you) reviews every conversation and replies personally — this is a lead-qualification tool, not a support bot pretending to be a person. And give the customer a lightweight confirmation at the end ("Got it — I've sent this to Iza, expect a reply within X") so the interaction feels complete rather than dropped into a void.

## Showcase System
Each case study follows a light, repeatable template rather than free-form writing every time: a one-line project summary, the problem/context, what you built, and the outcome or current status — with room for screenshots, a live link, or embedded code where relevant. Keep the grid itself filterable by project type if the catalog grows past a handful of entries (e.g. "Automation/Bots," "Trading Systems," "Web Apps," "Design Systems") — but don't build the filter UI until there's enough content to actually need it.

## Component Docs System
This mirrors the *interaction pattern* engineers already know from shadcn/ui — live preview next to a copy-pasteable code block, an installation snippet, a props table, listed variants — without depending on shadcn/ui itself. Every component here is one you've built from the specs already in this system (the card, inputs, buttons, the ambient canvas, the motion wrappers), documented as standalone, installable source.

Each component page needs, at minimum: a rendered live preview (the actual component, not a screenshot), a "Code" tab showing the exact source with a copy button, a short "Installation" block (what to paste into a project and what Tailwind/token setup it assumes), a props/variants table, and a one-line accessibility note where relevant (e.g. the ambient canvas's `aria-hidden` requirement). Resist adding a live "playground" with prop toggles for v1 — a clean static preview plus copyable code covers most real use, and a full playground is a meaningful project on its own.

A `registry.json` + CLI installer (so someone can run one command to pull a component into their repo, shadcn-style) is worth planning for structurally, but treat it as a phase 2 addition — ship the copy-paste docs first and validate that people actually want the components before building install tooling around them.

## Shared Foundation, Divergent Expression
Both products import the same token file (`hyliox-waitlist-card.md`'s color/typography/radius/spacing values) so a button is recognizably the same button on both sides of the switcher. Where they diverge is motion and density: the marketing side runs the full staged-entrance sequence from `hyliox-motion-system.md` and keeps the ambient WebGL canvas active behind its hero; the docs side should default to near-zero entrance motion (fast, subtle `fadeIn` at most) and no ambient canvas at all — a developer scanning fifteen component pages in a row should never wait on an animation.

**Superseded 2026-07-04:** this section originally scoped the light-mode toggle to `/docs` only, keeping marketing forced dark-only. Phase 2.5 shipped the toggle as global instead (`PreferencesBar`, root layout) — confirmed as the intended direction rather than reverted. Marketing is no longer dark-only; both products share one global theme state.

## Data Flow
1. Customer lands on `/` and types directly into the hero prompt box — no click-to-open step. The client streams the conversation to `/api/intake`, backed by the Gemini API (`gemini-3-flash-preview`) with the guardrail system prompt from `ai-intake-chat.md`.
2. Conversation proceeds turn by turn; the model tracks which `extractedFields` are still missing and steers toward them without making it feel like a checklist.
3. On natural conversation end (or an explicit "wrap up" trigger), the model emits a structured brief as a fenced ` ```brief ` JSON block, which the client parses out of the stream and renders as a confirmation card.
4. **Pending:** a server-side handler that also sends the brief + full transcript to the owner's inbox via Resend. Today the brief only surfaces in the browser.
5. Customer sees a short confirmation message once the brief renders.

## Tech Stack Notes
Next.js App Router lets both `/` and `/docs` live in one deployable app while still code-splitting cleanly by route group. Tailwind stays the styling layer for both products — since you're not adopting shadcn/ui, the component source itself (JSX/TSX + Tailwind classes) *is* the documentation's "Code" tab content, so keep components readable and dependency-light on purpose; anything a copier would need to also install becomes friction. MDX is a natural fit for `/docs/introduction`, `/docs/installation`, and `/docs/theming` (prose-heavy, low interactivity), while component pages themselves are closer to plain React pages that import and render the live component next to a stored code string.

## Do's and Don'ts
- Do keep the dock's two tiles equally weighted (same size, same treatment) — don't let one read as primary and the other as an afterthought.
- Do send the structured brief as the headline of the email, with the full transcript as supporting detail, not the other way around.
- Do reuse one token source for both products; never let colors drift between the marketing site and the docs site.
- Do keep component pages copy-paste-first; hold off on a props playground or CLI installer until v1 ships and gets real usage.
- Don't run the ambient WebGL canvas or full motion sequence on the docs site — it competes with the thing developers actually came to read.
- Don't let the AI intake chat pretend to be human, and don't let it go silent without a visible confirmation once the brief is sent.
- Don't build the showcase filter UI before there's enough case studies to justify filtering.
- Don't couple the component docs to any external UI library — every dependency you add is one your copier has to explain to their own team.
