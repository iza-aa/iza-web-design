---
version: alpha
name: Hyliox Dark Glass
description: A dark, frosted-glass waitlist system framed as a floating OS window, with a friendly rounded wordmark, pixel-motif brand accents, and a single blue call-to-action.
colors:
  primary: "#3B82F6"
  secondary: "#9CA3AF"
  tertiary: "#3F3F46"
  neutral: "#DCE0E8"
  surface: "#1C1C21"
  on-surface: "#F5F5F7"
  error: "#EF4444"
  primary-contrast: "#FFFFFF"
  border-subtle: "#33333A"
typography:
  headline-display:
    fontFamily: Baloo 2
    fontSize: 40px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: 0em
  headline-xs:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: 400
    lineHeight: 26px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: 400
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 400
    lineHeight: 18px
    letterSpacing: 0em
  label-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: 600
    lineHeight: 20px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 18px
    letterSpacing: 0em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0.04em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  none: 0px
  sm: 8px
  md: 12px
  lg: 20px
  xl: 28px
  full: 9999px
# NOTE: in the Tailwind v4 CSS-first config (src/app/globals.css), these named
# keys are registered as --spacing-{xs..xxl}. Tailwind's own built-in named
# scale for max-w-*/w-*/h-*/p-* (xs/sm/md/lg/xl/2xl...) shares the same key
# names, so e.g. `max-w-xl` silently resolves to this 48px value instead of
# the built-in 36rem — no build error, just a visibly broken layout. Never use
# `{property}-{xs|sm|md|lg|xl}` sizing utilities in implementation code; use
# the numeric spacing scale (`max-w-144`) or an arbitrary value instead.
spacing:
  xs: 4px
  sm: 12px
  md: 20px
  lg: 32px
  xl: 48px
  xxl: 96px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-contrast}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: "13px 22px"
    height: "44px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    border: "1px solid {colors.border-subtle}"
    padding: "13px 22px"
    height: "44px"
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.secondary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: "0px"
  card:
    backgroundColor: "{colors.surface}"
    backdropFilter: "blur(24px) saturate(140%)"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    border: "1px solid rgba(255,255,255,0.06)"
    padding: "48px 40px"
    shadow: "0 30px 60px rgba(0,0,0,0.35)"
  input:
    backgroundColor: "#151519"
    textColor: "{colors.on-surface}"
    placeholderColor: "{colors.secondary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    border: "1px solid {colors.border-subtle}"
    padding: "14px 16px"
    height: "48px"
  textarea:
    backgroundColor: "#151519"
    textColor: "{colors.on-surface}"
    placeholderColor: "{colors.secondary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    border: "1px solid {colors.border-subtle}"
    padding: "14px 16px"
    minHeight: "104px"
    resize: "vertical"
  logo-mark:
    backgroundColor: "#0A0A0B"
    textColor: "{colors.primary-contrast}"
    rounded: "{rounded.xl}"
    size: "72px"
    typography: "{typography.headline-display}"
  dock-item:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.full}"
    itemSize: "48px"
    gap: "{spacing.xs}"
    padding: "{spacing.xs}"
---

# Hyliox Dark Glass

## Overview
This system stages the product inside a floating, borderless OS window — a device-agnostic "frame" that instantly reads as a real app rather than a marketing page. Inside that frame, the palette drops to near-black glass, broken only by a single confident blue accent on the call-to-action. The wordmark uses a soft, rounded display face to keep the brand approachable, while every functional element (inputs, labels, footer) reverts to a plain, neutral grotesque for clarity. A sparse pixel/dot motif sits just outside the window in the two top corners — a small nod to the "code/AI" positioning without cluttering the hero.

> Note: colors, font names and exact pixel sizes below are estimated by eye from the reference screenshot (blur and compression make exact hex sampling unreliable). Treat this as a faithful working baseline — swap in exact values from your Figma file or brand kit if pixel-perfect accuracy is required.

## Colors
- **Primary (#3B82F6):** The only saturated color in the system. Reserved exclusively for the "Join Waitlist" button and any focus/active states. Its rarity is what gives it weight.
- **Secondary (#9CA3AF):** Muted gray for de-emphasized copy — the "Get" in the headline, the subheading, placeholder text, and the footer line.
- **Tertiary (#3F3F46):** Reserved for structural dividers when a border needs to read slightly stronger than `border-subtle`.
- **Neutral (#DCE0E8):** The soft gray-blue backdrop *outside* the window — usually a blurred photo or gradient, not a flat fill. This is the "desktop wallpaper" layer, not the card.
- **Surface (#1C1C21):** The near-black glass background of the window itself and of all inputs/dock chips.
- **On-surface (#F5F5F7):** Primary readable text color against the dark surface — used for the wordmark, headline, and input values.
- **Error (#EF4444):** Reserved for validation states only; not present in the reference shot but included for system completeness.
- **Primary-contrast (#FFFFFF):** Text color on the blue button.
- **Border-subtle (#33333A):** The faint 1px stroke around inputs, textarea, and the card edge.

## Typography
Two typeface roles do all the work. A rounded display face (placeholder: **Baloo 2** — Fredoka or Comfortaa are close alternatives) carries the wordmark and gives the brand its friendly, slightly playful edge. Everything else — headline, body, labels, footer — sits on a neutral grotesque (placeholder: **Inter**) so the UI never competes with the logo for personality.

The hero headline uses a **mixed-weight, mixed-color technique**: the leading word ("Get") renders in `secondary` at a lighter visual weight, while the rest ("early access") snaps to full `on-surface` white at heavier weight — a cheap, high-impact way to create emphasis without a second typeface. Reuse this pattern anywhere a two-part headline needs a "soft lead-in, hard payoff" rhythm.

Use `headline-display` only for the wordmark. `headline-lg` covers the hero statement. `body-lg` is for the supporting one-to-two line pitch under the headline. `body-md` is the default for input values, `body-sm`/`label-md` for placeholders, and `caption` for the small "Beta release" tag and the footer copyright line (both use the same tracked, uppercase-adjacent treatment).

## Layout
The composition is a single centered column inside a fixed-width window (roughly 460–520px), vertically stacked with generous rhythm: logo → wordmark → caption → (optional badge/proof row) → headline → subheading → (optional secondary proof row) → form stack → footer. Internal card padding is large (`spacing.xl`, ~48px) relative to the window's overall size, reinforcing the "spacious, unhurried" feel even in dark mode. Form fields stack full-width except for the final row, where the email input and the primary button share one row — input flexes, button stays fixed-width.

The window itself floats on a much larger, blurred backdrop canvas. That backdrop should never compete for attention: keep it soft, low-contrast, and slow-moving if animated (see the companion `webgl-canvas-background.md` for how this backdrop can become interactive).

## Elevation & Depth
This is the one place the system allows real depth: the window is genuinely elevated via `backdrop-filter: blur()` plus a soft, wide drop shadow (`0 30px 60px rgba(0,0,0,0.35)`), simulating true glass over the blurred wallpaper behind it. Inside the card, depth stays flat — inputs and buttons are distinguished by fill and border only, never by additional shadow. The dock preview at the very bottom repeats the same glass treatment at a much smaller scale, confirming it belongs to the same OS metaphor as the main window.

## Shapes
The outer window uses a generous `rounded.lg` (20px) on all four corners — enough to read as a native window, not a sharp browser chrome. Inputs, textarea, and the primary button share a slightly tighter `rounded.md` (12px), keeping form elements visually related but subordinate to the window's radius. The logo mark is the one square-ish exception, using `rounded.xl` (28px) for a squircle app-icon feel. Dock items and any small badges/chips use `rounded.full` for a pill/circle finish.

## Components
`button-primary` is the only filled, colored control in the system — solid blue, white label, `rounded.md`, 44px tall. It should never be duplicated elsewhere on the same screen; if a second action is needed, use `button-secondary` (outlined, transparent) or `button-tertiary` (text-only, for something like "already have an invite?").

`card` is the window itself: dark glass, blurred backdrop-filter, a hairline border at ~6% white opacity (not a solid gray) to catch light at the edges, and a wide soft shadow to sell elevation.

`input` and `textarea` share one visual language: a fill one step lighter than the card surface (`#151519`), a 1px `border-subtle` stroke, and identical padding/radius — the only difference is `textarea`'s taller minimum height and visible resize handle. Keep placeholder copy in `secondary` gray at `body-md`/`label-md` so it never gets mistaken for entered content.

`logo-mark` and `dock-item` exist to sell the "this is a real desktop app" framing — keep the logo mark perfectly square-cornered-square (squircle), and keep dock items small, tight, and low-contrast so they read as chrome, not content.

## Do's and Don'ts
- Do keep exactly one saturated color (`primary` blue) on screen at a time.
- Do use the rounded display face only for the wordmark — never for body copy or buttons.
- Do let the backdrop stay soft and out of focus; it's atmosphere, not content.
- Do reuse the mixed-weight headline technique for future hero copy.
- Don't add a second accent color; contrast should come from value (light/dark), not hue.
- Don't give inputs or buttons a heavier shadow than the outer window — the window is the only "elevated" layer.
- Don't tighten the window's corner radius to match the inputs; the window should always read as one radius step larger.
- Don't overcrowd the corners with the pixel/dot motif — it's a whisper of texture, not a pattern fill.
