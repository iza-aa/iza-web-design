export type PropRow = { name: string; type: string; default?: string; description: string };

export type ComponentDoc = {
  slug: string;
  name: string;
  group: "Layout" | "Canvas";
  description: string;
  sourcePath: string; // relative to project root, read at request time for the Code tab
  install: string;
  props: PropRow[];
  a11y: string;
};

export const componentDocs: ComponentDoc[] = [
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
    slug: "dock-item",
    name: "Dock Item",
    group: "Layout",
    description: "A single floating-dock tile — hover tooltip, active-state dot indicator, macOS-style magnification driven by `boost`. Renders as a Link when href is passed, or a button otherwise (used for the AI-chat reopen action).",
    sourcePath: "src/components/ui/DockItem.tsx",
    install: `import { DockItem } from "@/components/ui/DockItem";

<DockItem href="/" label="Work" icon={<YourIcon />} active />`,
    props: [
      { name: "href", type: "string", description: "If passed, renders as a next/link Link." },
      { name: "label", type: "string", description: "Tooltip text and aria-label." },
      { name: "icon", type: "ReactNode", description: "Icon content, sized to fill the 48×48 tile." },
      { name: "active", type: "boolean", description: "Shows the small dot indicator underneath." },
      { name: "onClick", type: "() => void", description: "Used instead of href for action tiles (e.g. reopen)." },
      { name: "boost", type: "number", default: "0", description: "0–1 magnification amount, computed by the parent dock based on hover distance — scales the icon up to 1.4x, lifts it, and adds matching side margin so it doesn't collide with neighbors." },
      { name: "onHoverStart", type: "() => void", description: "Reported up to the parent dock so it can compute boost values for all items." },
      { name: "onHoverEnd", type: "() => void", description: "Reported up to the parent dock to clear this item's hover state." },
    ],
    a11y: "Tooltip text doubles as the aria-label since the tile has no visible text label of its own.",
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

export const componentDocGroups = ["Layout", "Canvas"] as const;
