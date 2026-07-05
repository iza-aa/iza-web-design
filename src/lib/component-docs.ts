export type PropRow = { name: string; type: string; default?: string; description: string };

export type ComponentDoc = {
  slug: string;
  name: string;
  group: "Primitives" | "Form" | "Layout" | "Motion" | "Canvas";
  description: string;
  sourcePath: string; // relative to project root, read at request time for the Code tab
  install: string;
  props: PropRow[];
  a11y: string;
};

export const componentDocs: ComponentDoc[] = [
  {
    slug: "button",
    name: "Button",
    group: "Primitives",
    description:
      "Three variants — primary (the one saturated color on screen), secondary (outlined), tertiary (text-only). Only primary gets hover/tap micro-motion.",
    sourcePath: "src/components/ui/Button.tsx",
    install: `import { Button } from "@/components/ui/Button";

<Button variant="primary">Start a Project</Button>`,
    props: [
      { name: "variant", type: '"primary" | "secondary" | "tertiary"', default: '"primary"', description: "Visual style. Never use more than one primary button on the same screen." },
      { name: "className", type: "string", default: '""', description: "Extra classes merged onto the button." },
      { name: "...props", type: "HTMLMotionProps<'button'>", description: "Any native button prop (onClick, disabled, type, etc.) plus framer-motion props." },
    ],
    a11y: "Renders a native <button>; disabled state uses the native disabled attribute (not just a visual style), so it's excluded from the tab order automatically.",
  },
  {
    slug: "input",
    name: "Input",
    group: "Form",
    description: "Single-line text field. Border transitions to primary on focus.",
    sourcePath: "src/components/ui/Input.tsx",
    install: `import { Input } from "@/components/ui/Input";

<Input placeholder="Enter your email address…" />`,
    props: [
      { name: "className", type: "string", default: '""', description: "Extra classes merged onto the input." },
      { name: "...props", type: "InputHTMLAttributes<HTMLInputElement>", description: "Any native input prop (value, onChange, type, etc.)." },
    ],
    a11y: "Pair with a visible <label> (via htmlFor/id) in real usage — this component intentionally doesn't render one, since label copy and placement are context-specific.",
  },
  {
    slug: "textarea",
    name: "Textarea",
    group: "Form",
    description: "Multi-line text field. Shares Input's visual language — same fill, border, and radius, with a taller minimum height and a vertical resize handle.",
    sourcePath: "src/components/ui/Textarea.tsx",
    install: `import { Textarea } from "@/components/ui/Textarea";

<Textarea placeholder="Describe what you're trying to build…" />`,
    props: [
      { name: "className", type: "string", default: '""', description: "Extra classes merged onto the textarea." },
      { name: "...props", type: "TextareaHTMLAttributes<HTMLTextAreaElement>", description: "Any native textarea prop (value, onChange, rows, etc.)." },
    ],
    a11y: "Same labeling note as Input — pair with a visible label in real usage.",
  },
  {
    slug: "window-card",
    name: "Window Card",
    group: "Layout",
    description:
      "The frosted-glass 'OS window' — a chrome bar (with a single functional mac-style red close dot when onClose is passed) above a content slot. This is the shell behind the homepage's AI intake card.",
    sourcePath: "src/components/ui/WindowCard.tsx",
    install: `import { WindowCard } from "@/components/ui/WindowCard";

<WindowCard onClose={() => setOpen(false)}>
  <div className="p-8">Your content</div>
</WindowCard>`,
    props: [
      { name: "children", type: "ReactNode", description: "Content rendered below the chrome bar." },
      { name: "onClose", type: "() => void", description: "If provided, renders a functional red close dot. Omit to render the chrome bar without a close control." },
      { name: "closeLabel", type: "string", default: '"Close"', description: "aria-label for the close button." },
      { name: "className", type: "string", default: '""', description: "Extra classes merged onto the outer window." },
    ],
    a11y: "The close control is a real <button> with an aria-label — always pass closeLabel with a translated string in localized contexts.",
  },
  {
    slug: "logo-mark",
    name: "Logo Mark",
    group: "Primitives",
    description: "The squircle app-icon — near-black background, rounded-xl, one of only two elements allowed the emphasized (overshoot) easing on entrance.",
    sourcePath: "src/components/ui/LogoMark.tsx",
    install: `import { LogoMark } from "@/components/ui/LogoMark";

<LogoMark size={64} />`,
    props: [{ name: "size", type: "number", default: "72", description: "Width/height in pixels; font size scales with it." }],
    a11y: "Purely decorative brand mark — no alt text needed since it's not conveying information beyond the wordmark shown alongside it.",
  },
  {
    slug: "dock-item",
    name: "Dock Item",
    group: "Layout",
    description: "A single floating-dock tile — hover tooltip, active-state dot indicator. Renders as a Link when href is passed, or a button otherwise (used for the AI-chat reopen action).",
    sourcePath: "src/components/ui/DockItem.tsx",
    install: `import { DockItem } from "@/components/ui/DockItem";

<DockItem href="/" label="Work" icon={<YourIcon />} active />`,
    props: [
      { name: "href", type: "string", description: "If passed, renders as a next/link Link." },
      { name: "label", type: "string", description: "Tooltip text and aria-label." },
      { name: "icon", type: "ReactNode", description: "Icon content, sized to fill the 48×48 tile." },
      { name: "active", type: "boolean", description: "Shows the small dot indicator underneath." },
      { name: "onClick", type: "() => void", description: "Used instead of href for action tiles (e.g. reopen)." },
    ],
    a11y: "Tooltip text doubles as the aria-label since the tile has no visible text label of its own.",
  },
  {
    slug: "fade-up",
    name: "FadeUp",
    group: "Motion",
    description:
      "Opacity + 16px rise on entrance, `easing.standard`. The default entrance for most blocks — headline text, blurbs, cards. Auto-swaps to an opacity-only variant under prefers-reduced-motion.",
    sourcePath: "src/components/motion/FadeUp.tsx",
    install: `import { motion } from "framer-motion";
import { FadeUp } from "@/components/motion/FadeUp";
import { group } from "@/lib/motion";

<motion.div variants={group()} initial="hidden" animate="show">
  <FadeUp>Content</FadeUp>
</motion.div>`,
    props: [
      { name: "...props", type: "HTMLMotionProps<'div'>", description: "Any framer-motion div prop — initial/animate/whileInView when used standalone, or nothing when nested under a parent driving variant propagation (see group() in src/lib/motion.ts)." },
    ],
    a11y: "Reads prefers-reduced-motion via useReducedMotion() internally and falls back to a fast opacity-only fade — no transform, no stagger — so callers never re-implement that branch.",
  },
  {
    slug: "pop-in",
    name: "PopIn",
    group: "Motion",
    description:
      "Opacity + scale 0.85→1 on entrance, `easing.emphasized` (overshoot). Reserved for the small set of elements the motion system allows overshoot on — the primary button and logo mark — not a general-purpose entrance.",
    sourcePath: "src/components/motion/PopIn.tsx",
    install: `import { PopIn } from "@/components/motion/PopIn";

<PopIn initial="hidden" animate="show">
  <LogoMark size={64} />
</PopIn>`,
    props: [
      { name: "...props", type: "HTMLMotionProps<'div'>", description: "Any framer-motion div prop." },
    ],
    a11y: "Same reduced-motion fallback as FadeUp — opacity-only, no overshoot, when the user has requested less motion.",
  },
  {
    slug: "scale-in",
    name: "ScaleIn",
    group: "Motion",
    description:
      "Opacity + scale 0.96→1 on entrance, `easing.standard`. The subtle, non-overshoot alternative to PopIn — for cards and panels entering the layout.",
    sourcePath: "src/components/motion/ScaleIn.tsx",
    install: `import { ScaleIn } from "@/components/motion/ScaleIn";

<ScaleIn initial="hidden" animate="show">
  <WindowCard>...</WindowCard>
</ScaleIn>`,
    props: [
      { name: "...props", type: "HTMLMotionProps<'div'>", description: "Any framer-motion div prop." },
    ],
    a11y: "Same reduced-motion fallback as FadeUp.",
  },
  {
    slug: "ambient-canvas",
    name: "Ambient Canvas",
    group: "Canvas",
    description:
      "A full-viewport fragment shader — a halftone dot grid colorized by a domain-warped FBM noise field (churning, water-like blobs rather than straight bands), alpha-blended at low opacity for a retro-CRT/static look. Replaced the earlier pointer-field particle grid (2026-07-05, owner's call) with a single fullscreen quad + ShaderMaterial — cheaper too, since it drops the old O(n^2) per-frame line-connect pass. Theme-independent by design: always the same rainbow palette, low opacity so it stays ambient instead of fighting page content. Pointer interactivity came back the same day as a brush trail: the existing dot grid morphs — same cells, same pitch — into black ASCII glyphs (ring/cross/plus/square) only where the pointer actually moves, painted via a ping-pong feedback buffer with an organic, noise-jittered width. The stamp itself is snapped to the same dot grid with a hard edge (no anti-aliasing) — still a round silhouette, but stepped/blocky at the edges since it's built from grid cells rather than smooth math, matching the retro grid's pixel language. The trail's continuous decay is quantized into 3 discrete steps before driving color/shape, so a stroke fades out in 3 visible layers instead of one smooth continuous fade. A stationary pointer paints nothing new — the existing stroke just steps through its fade-out.",
    sourcePath: "src/components/canvas/AmbientCanvas.tsx",
    install: `import { AmbientCanvas } from "@/components/canvas/AmbientCanvas";

// full-viewport backdrop (the marketing layout's actual usage)
<AmbientCanvas />

// embedded in a bounded container — pass className to override the default fixed/inset-0
<div className="relative h-64 overflow-hidden rounded-lg">
  <AmbientCanvas className="absolute inset-0" />
</div>`,
    props: [
      { name: "className", type: "string", default: '"pointer-events-none fixed inset-0 -z-10"', description: "Overrides the wrapper div's classes — pass an `absolute inset-0` variant to embed it inside a bounded container instead of the full viewport." },
    ],
    a11y: "Renders an `aria-hidden` div — purely decorative. Respects prefers-reduced-motion (renders exactly one static frame, no animation loop) and pauses via the Page Visibility API when the tab is hidden. Doesn't mount at all on low-power devices (`navigator.hardwareConcurrency <= 2`) or without WebGL — the static gradient backdrop shows through instead.",
  },
];

export function getComponentDoc(slug: string) {
  return componentDocs.find((c) => c.slug === slug);
}

export const componentDocGroups = ["Primitives", "Form", "Layout", "Motion", "Canvas"] as const;
