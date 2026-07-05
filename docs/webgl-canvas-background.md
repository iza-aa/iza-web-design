---
version: alpha
name: Hyliox Ambient Canvas
description: A single configurable WebGL layer that sits behind the foreground UI and renders in one of two interchangeable modes — a pointer-reactive particle field, or a lightweight 3D object stage — without changing how the rest of the page is built.
engine: three.js (r15x, WebGL2 with WebGL1 fallback); OGL acceptable as a lighter-weight swap
mode: pointer-field | object-stage   # default: pointer-field
canvas:
  placement: fixed, full-bleed, behind all foreground content
  zIndex: -1
  background: transparent   # lets {colors.neutral} / page wallpaper show through
  dpr:
    min: 1
    max: 1.75            # never render at full device pixel ratio on high-DPI screens
  fpsCap: 60
  fpsCapOnBattery: 30
colors:
  primary: "{colors.primary}"        # accent particles / rim light / hover glow
  secondary: "{colors.secondary}"    # base particle / edge color, low opacity
  neutral: "{colors.neutral}"        # ambient fog / backdrop tint
  surface: "{colors.surface}"        # used as fog/shadow color under 3D objects
pointerField:
  sourceMotif: pixel-dot     # reuse the card's corner pixel/dot/x/o motif as particle sprites
  particleCount:
    desktop: 220
    mobile: 90
  particleSize: [1.5, 4]      # px, randomized per-particle
  gridJitter: 0.4             # 0 = rigid grid, 1 = fully scattered
  influenceRadius: 160        # px around pointer that particles react to
  pushStrength: 26            # px max displacement at radius center
  returnEase: 0.08            # lerp factor back to rest position per frame
  connectLines:
    enabled: true
    maxDistance: 90
    opacity: 0.12
  colorMode: secondary-with-primary-highlight   # near-pointer particles tint toward primary
  idleDrift:
    enabled: true
    afterMs: 4000
    speed: 0.05
objectStage:
  source: model.glb            # swappable per deployment; also accepts a procedural primitive
  autoRotate:
    enabled: true
    speed: 0.15               # rad/s
  pointerParallax:
    maxTiltDeg: 6
    smoothing: 0.06
  material: glass-matte         # glass-matte | soft-metal | flat-toon
  lighting:
    key: { color: "#FFFFFF", intensity: 1.0 }
    rim: { color: "{colors.primary}", intensity: 0.6 }
    ambient: { color: "{colors.neutral}", intensity: 0.35 }
  cameraFov: 35
  shadow: false                # keep off by default; card sits on top, shadow is invisible anyway
interaction:
  devices: [mouse, touch]
  smoothing: 0.08              # global pointer lerp, applies to both modes
  touchBehavior: idleDrift     # touch has no hover, so treat as always-idle unless dragging
performance:
  reducedMotion: freeze-on-static-frame   # render one frame, stop the loop entirely
  lowPowerFallback: static-gradient-image
  resizeDebounceMs: 150
  pauseWhenTabHidden: true
accessibility:
  ariaHidden: true
  decorativeOnly: true
  respectsPrefersReducedMotion: true
---

# Hyliox Ambient Canvas

## Overview
This is the layer that lives *behind* the `hyliox-waitlist-card.md` window — the soft, blurred backdrop that currently reads as a static image can instead be a single live WebGL canvas with two interchangeable personalities: a **pointer field** (ambient, reactive, texture-like) for the waitlist/landing context, or an **object stage** (a real 3D mesh — the app icon, a product shape, an abstract form) for pages that want a hero centerpiece. Both modes share one mounting point, one resize/performance pipeline, and one color contract with the design system, so switching modes is a config change, not a rebuild.

## Why one component, two modes
Keeping both under one spec means the expensive parts — canvas mounting, resize handling, DPR clamping, reduced-motion handling, pause-on-hidden-tab — are solved once. `mode` simply decides what gets drawn each frame. This also means a page can crossfade between modes later (e.g. pointer-field on the waitlist, object-stage once the product ships) without touching layout code.

## Mode: Pointer Field
A sparse field of small dots/squares — literally sourced from the same pixel/dot motif already used in the two top corners of the card — drifts slowly across the canvas. Within `influenceRadius` of the cursor, particles are pushed outward by `pushStrength` and ease back to rest via `returnEase`. Particles near the pointer tint from `secondary` toward `primary`, so the cursor leaves a faint blue "warmth" trail without ever introducing a second hue. `connectLines` optionally draws thin, low-opacity lines between nearby particles (constellation effect) — keep `opacity` low (≤0.12) so it reads as texture, not as a distinct graphic. On touch devices, or after `idleDrift.afterMs` of no input, particles fall back to a slow autonomous drift so the canvas never looks frozen.

This mode is intentionally the "quiet" one — it should never pull focus away from the card's headline or form. Treat it as ambient texture, the visual equivalent of film grain.

## Mode: Object Stage
A single 3D mesh (the `source` glTF/GLB, or a procedural primitive as a placeholder before real assets exist) sits centered or off-axis behind/beside the card. `autoRotate` gives it a slow idle spin; `pointerParallax` layers a subtle tilt on top, capped at `maxTiltDeg` so it never feels like a full orbit-control demo — this is a hero prop, not a product configurator. Lighting is deliberately minimal: one key light, one rim light tinted with `primary` (so the object visually "belongs" to the same palette as the CTA button), and a soft ambient fill from `neutral`. Shadows stay off by default since the object typically sits behind translucent UI where a cast shadow wouldn't be visible anyway.

Swap `material` between `glass-matte` (frosted, matches the card's own glass language), `soft-metal` (higher contrast, more premium/hardware feel), or `flat-toon` (cheaper to render, better for low-power fallback) depending on how much render budget is available.

## Rendering Architecture
- One `<canvas>`, `position: fixed`, full viewport, `z-index: -1`, transparent clear color so `{colors.neutral}` (or a page-level gradient) shows through underneath.
- Foreground UI (the waitlist card) renders in normal DOM flow above it — no special stacking context needed beyond the canvas's negative z-index.
- A single `ResizeObserver` on the viewport drives canvas/camera resize, debounced by `resizeDebounceMs` to avoid thrashing during drag-resize.
- Device pixel ratio is clamped to `dpr.max` (1.75) regardless of the actual screen DPR — this is the single biggest performance lever on high-DPI laptops and phones.
- Both modes share one render loop (`requestAnimationFrame`), gated by `fpsCap`; the loop is fully paused (not just throttled) when `document.hidden` is true.

## Interaction & Motion
Pointer position is smoothed once at the top level (`interaction.smoothing`) before being handed to either mode, so both particle displacement and 3D parallax feel consistent even if you swap modes later. Touch input has no hover state, so treat any touch as either a direct drag interaction (if the user is actively touching) or fall through to `idleDrift`/`autoRotate` — never leave a touch device staring at a canvas that only reacts to a cursor it doesn't have.

## Performance & Fallbacks
- **`prefers-reduced-motion: reduce`** → render exactly one frame (particles at rest / object at its default rotation), then stop the animation loop entirely. Do not just slow it down — stop it.
- **Low-power / low-end device** (heuristic: `navigator.hardwareConcurrency` low, or a simple FPS probe in the first second) → drop to `lowPowerFallback: static-gradient-image`, i.e. don't mount WebGL at all, show a pre-baked gradient/blur image instead.
- **Mobile particle count** is deliberately less than half of desktop (`90` vs `220`) — mobile GPUs and battery budgets don't forgive dense particle fields.
- **Tab hidden** → pause the render loop completely; resume on visibility change rather than trying to "catch up" animation state.

## Customization Tokens
Every color in this component resolves back to `hyliox-waitlist-card.md`'s palette (`primary`, `secondary`, `neutral`, `surface`) rather than defining its own — this is what keeps the backdrop and the card feeling like one system instead of a decorative canvas bolted onto an unrelated card. If the card's theme changes (e.g. a light-mode variant), the canvas should re-tint automatically rather than needing its own override.

## Accessibility
The canvas is purely decorative: mark its container `aria-hidden="true"`, ensure it's never a tab-stop, and make sure no information conveyed by the pointer field or 3D object is required to understand or complete the waitlist form. Everything the canvas does should be able to disappear (reduced-motion fallback) without the page losing meaning.

## Do's and Don'ts
- Do reuse the card's own pixel/dot motif as the particle sprite — it turns a generic effect into a branded one.
- Do keep the object stage's rim light tinted with `primary` so it reads as "the same product," not a separate demo.
- Do clamp DPR and pause on hidden tabs unconditionally — these are the two cheapest wins for battery/GPU load.
- Do stop (not slow) all motion under `prefers-reduced-motion`.
- Don't let `connectLines` opacity climb high enough to look like a network diagram — it should stay texture-level.
- Don't give the 3D object full orbit-drag controls; this is ambient staging, not a configurator.
- Don't mount WebGL at all on detected low-power devices — a static image beats a stuttering canvas every time.
- Don't introduce a color into this layer that doesn't already exist in the card's palette.
