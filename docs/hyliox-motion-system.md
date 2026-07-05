---
version: alpha
name: Hyliox Motion System
description: Every meaningful element — headline, tagline, each form field, the button, footer copy — is its own independent motion.div with a complete initial/animate pair. Nothing relies on a parent card wrapper to "carry" its animation, so any element can be lifted out of the card (e.g. onto the ambient canvas as standalone hero text) and it still enters correctly on its own.
library: framer-motion (motion/react)
duration:
  fast: 0.2s
  base: 0.4s
  slow: 0.7s
  ambient: 1.2s
easing:
  standard: [0.16, 1, 0.3, 1]      # smooth ease-out, default for all entrances
  emphasized: [0.34, 1.56, 0.64, 1] # slight overshoot, reserved for the primary button + logo
  linear: linear                    # idle/looping motion only, never for entrances
stagger:
  childDelay: 0.06s     # gap between siblings inside the same group
  groupOffset: 0.12s    # gap between logical groups (brand block -> headline block -> form block -> footer)
variants:
  fadeUp:
    hidden: { opacity: 0, y: 16 }
    show: { opacity: 1, y: 0 }
  fadeIn:
    hidden: { opacity: 0 }
    show: { opacity: 1 }
  popIn:
    hidden: { opacity: 0, scale: 0.85 }
    show: { opacity: 1, scale: 1 }
  scaleIn:
    hidden: { opacity: 0, scale: 0.96 }
    show: { opacity: 1, scale: 1 }
  genieExit:              # closing a window/card — shrink + fly toward the fixed bottom-center dock
    exit: { opacity: 0, scale: 0.05, x: "toward dock center", y: "toward dock, positive", transition: { duration: 0.55, ease: [0.68, 0, 0.85, 0] } }
  idleFloat:               # continuous idle motion for decorative at-rest text (never entrance)
    animate: { y: -8 }
    transition: { type: tween, duration: 2.2, repeat: Infinity, repeatType: mirror, ease: easeInOut }
interaction:
  button-primary:
    whileHover: { scale: 1.02 }
    whileTap: { scale: 0.97 }
    transition: "{duration.fast} {easing.emphasized}"
  input-focus:
    animate: { borderColor: "{colors.primary}" }
    transition: "{duration.fast} {easing.standard}"
trigger:
  default: on-mount        # initial + animate, fires once when the element renders
  belowFold: whileInView    # only for content that can start outside the viewport
  viewportSettings: { once: true, amount: 0.4 }
reducedMotion:
  strategy: opacity-only
  duration: "{duration.fast}"
  disableStagger: true
  disableScaleAndSpring: true
---

# Hyliox Motion System

## Overview
The instinct to wrap one big container in `motion.div` and call it done produces a card that "arrives" as a single flat block — everything appears at once, and nothing inside it can ever be reused outside that container. This system does the opposite: every text node, input, and button is its own `motion.div` with a full `variants` pair, so a component's motion is a property of *that component*, not of whatever happens to be wrapping it. A headline still animates correctly whether it's sitting inside the waitlist card or floating alone directly on the ambient canvas background — it never needs a card to "hand it" opacity and position.

Parents are still allowed to exist, but only as **stagger orchestrators** — a thin `motion.div` with `variants={group}` whose only job is to delay and sequence its children via `staggerChildren`/`delayChildren`. The parent itself carries no visible transform of its own; strip it away and every child still knows how to enter on its own.

## Core Tokens
Three durations cover everything: `fast` (0.2s) for hover/tap/focus feedback, `base` (0.4s) for standard entrances, `slow` (0.7s) reserved for the single most important element on screen (the wordmark or a hero object). `ambient` (1.2s) is only for continuous/looping motion (e.g. a subtle idle float), never for a one-time entrance. Two easings: `standard` is a smooth ease-out used everywhere by default; `emphasized` adds a small spring-like overshoot and is reserved for exactly two things — the primary button and the logo mark — so that overshoot stays a signature, not a habit.

## Variant Library
- **fadeUp** — the default for text: opacity 0→1 with a 16px rise. Use for the wordmark, tagline, headline words, subheading, footer.
- **fadeIn** — opacity only, no movement. Use for low-emphasis elements (footer copyright, placeholder hints) where a rise would feel like too much ceremony.
- **popIn** — opacity + scale from 0.85, paired with `emphasized` easing. Reserved for the logo mark.
- **scaleIn** — opacity + a smaller scale step from 0.96. Use for inputs, textarea, and the button, so form elements feel like they "settle" into place rather than sliding.

## Stagger & Sequencing
Content reveals in four logical groups, each offset from the last by `groupOffset` (120ms), with children inside a group offset by `childDelay` (60ms):

1. **Brand block** — logo mark (`popIn`) → wordmark (`fadeUp`) → caption "Beta release…" (`fadeUp`).
2. **Headline block** — the headline is split at the word level, not treated as one string: "Get" (`fadeUp`) enters first, "early access" (`fadeUp`) follows one `childDelay` later, then the subheading (`fadeUp`) closes the group. This mirrors the two-tone emphasis already defined in the card's typography system — the motion reinforces the same "soft lead-in, hard payoff" read.
3. **Form block** — textarea, name input, email input, and button each get their own `scaleIn`, staggered by `childDelay`. The button is last and is the only field allowed `emphasized` easing, giving it a tiny extra "pop" that invites the click.
4. **Footer** — copyright line, `fadeIn`, no delay games, just the quietest possible arrival.

## Standalone Elements (No Card Parent)
Any element pulled out of the card — most likely large hero text placed directly over the `webgl-canvas-background.md` layer — keeps its own `variants` and its own `initial`/`animate` pair exactly as written above. It does **not** inherit timing from a card-level orchestrator it's no longer inside. If it needs to join a stagger sequence with other standalone elements, wrap only those elements in a lightweight orchestrator `motion.div` — never assume a card exists to provide one.

## Interaction & Micro-motion
Beyond entrance, two interaction states are defined system-wide: `button-primary` scales to 1.02 on hover and 0.97 on tap, both at `fast` duration with `emphasized` easing — deliberately the same easing family as its entrance, so hover doesn't feel like a different design system. `input-focus` transitions its border color to `primary` at `fast` + `standard` easing, giving clear feedback without any transform (transforms on a field the user is actively typing into are distracting, not delightful).

## Reduced Motion
Under `prefers-reduced-motion: reduce`, every variant collapses to its `fadeIn` behavior at `fast` duration — opacity only, no `y`/`scale` offset, no stagger delay between siblings (all children of a group appear together). `emphasized` easing is disabled entirely in this mode; everything uses `standard`. This is a blanket override applied once at the animation-provider level, not something each component needs to remember individually.

## Implementation Pattern
```jsx
// Orchestrator — carries timing only, no visible transform of its own
const group = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } }
};

// A single reusable child variant (fadeUp)
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  }
};

// Inside the card
<motion.div variants={group} initial="hidden" animate="show">
  <motion.h1 variants={fadeUp}>hyliox</motion.h1>
  <motion.p variants={fadeUp}>Beta release July 2026</motion.p>
</motion.div>

// Standalone, no card in sight — identical child, no orchestrator required
<motion.h1
  variants={fadeUp}
  initial="hidden"
  animate="show"
  style={{ position: "absolute", top: "20%" }}
>
  early access
</motion.h1>
```

## Close / Genie Exit
Closing a window-style card (the AI intake window, the "Your Session" panel) is never an instant unmount — it plays a "genie" exit: scale down to near-zero (`0.05`) while translating toward the fixed bottom-center dock, opacity fading out over `0.55s`, using a strong ease-in curve (`[0.68, 0, 0.85, 0]`) so it reads as being "sucked" toward the dock rather than politely fading. The exact `x`/`y` offset depends on the closing element's own position relative to the dock (a centered card only needs `y`; a left-pinned panel needs both `x` and `y`). This only works if the element is still mounted long enough to animate — clear underlying state (e.g. `setMessages([])`) rather than forcing a remount via a changed `key`, or `AnimatePresence` never gets to play the exit at all.

## Idle Float (Continuous Motion)
Decorative text that's fully at rest (not entering, not exiting — e.g. the homepage's feature callouts once the entrance stagger finishes) should never look fully static; give it a slow, continuous idle float. Animate a single target value (`y: -8`) with `repeatType: "mirror"` rather than a `[0, -8, 0]` keyframe array — a keyframe array applies its easing per segment and audibly/visibly "pauses" at each keyframe, which reads as a mechanical tick rather than a smooth bob. Mirror-repeating a single value plays the easing curve forward then backward, producing genuinely continuous motion. Stagger multiple simultaneous instances with a small per-item `delay` so they don't move in lockstep. Explicitly set `type: "tween"` and only animate compositor-friendly transform properties (`x`/`y`/`scale`/`opacity`, never `top`/`left`/`width`/`height`), and add `will-change: transform` so the browser promotes the element to its own layer instead of repainting it every frame.

## Do's and Don'ts
- Do give every element its own complete `variants` object — treat "depends on a parent for its opacity" as a bug.
- Do reserve `emphasized` easing for the logo and the primary button only; everywhere else uses `standard`.
- Do split multi-tone headlines at the word level so the motion sequence matches the existing color/weight emphasis.
- Do collapse everything to opacity-only, no-stagger under reduced motion — as one global override, not per component.
- Do give closeable window/card elements a genie exit (shrink + fly toward the dock) instead of an instant unmount, and reset their underlying state in place so `AnimatePresence` has time to play it.
- Do give any content that sits fully at rest a slow idle float (mirror-repeat a single value, never a multi-keyframe array) so nothing on screen ever looks dead.
- Don't wrap the whole card in a single `motion.div` and call the reveal "done" — that produces a block-arrival, not a sequence.
- Don't apply `whileInView` inside this card; it's fully visible on load, so `on-mount` triggers are correct here (reserve `whileInView` for longer, scrolling pages).
- Don't let hover/tap transforms exceed the `fast` duration — anything slower reads as lag, not feedback.
- Don't reuse `emphasized`'s overshoot on more than two elements at once; it stops feeling special the moment it's everywhere.
