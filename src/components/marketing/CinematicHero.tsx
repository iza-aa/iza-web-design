"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AsciiIzaLogo3D } from "@/components/marketing/AsciiIzaLogo3D";
import callMeHandEmoji from "@/assets/emoji/call-me-hand_1f919.png";
import beamingFaceEmoji from "@/assets/emoji/beaming-face-with-smiling-eyes_1f601.png";
import rectangle52 from "@/assets/logo/Rectangle 52.png";
import rectangle53 from "@/assets/logo/Rectangle 53.png";
import rectangle54 from "@/assets/logo/Rectangle 54.png";
import type { DesignEntry } from "@/lib/design-gallery";
// Type-only — the runtime module is dynamically imported inside the effect
// below, since it's only needed for a decorative one-shot sequence and
// shouldn't sit in the initial bundle.
import type Matter from "matter-js";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, TextPlugin, MotionPathPlugin);
}

// Plain `useEffect` cleanups are passive — on unmount they run *after* React
// has already removed the DOM nodes. ScrollTrigger's pin-spacer restructures
// the tree while pinned, so by the time a passive cleanup calls ctx.revert()
// it's too late: React's own removeChild already ran against the changed
// tree and threw. `useLayoutEffect` cleanups run synchronously before that
// removal, so the pin unwraps first. (No-op identical to useEffect during
// SSR, where neither one executes anyway.)
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Environment overlays and skeuomorphic text/phone treatments — all
// scoped under `cinematic-` so nothing here leaks into the rest of the
// site's global classes. Colors reference this
// project's actual theme tokens (--color-on-surface / --color-surface,
// see globals.css), not the --color-foreground/--color-background names
// from the original reference doc this was adapted from.
const INJECTED_STYLES = `
  .gsap-reveal { visibility: hidden; }

  .cinematic-film-grain {
      position: absolute; inset: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 50; opacity: 0.05; mix-blend-mode: overlay;
      background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noiseFilter)"/></svg>');
  }

  .cinematic-bg-grid {
      background-size: 60px 60px;
      background-image:
          linear-gradient(to right, color-mix(in srgb, var(--color-on-surface) 5%, transparent) 1px, transparent 1px),
          linear-gradient(to bottom, color-mix(in srgb, var(--color-on-surface) 5%, transparent) 1px, transparent 1px);
      mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
      -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
  }

  .cinematic-text-matte {
      color: var(--color-on-surface);
      text-shadow:
          0 10px 30px color-mix(in srgb, var(--color-on-surface) 20%, transparent),
          0 2px 4px color-mix(in srgb, var(--color-on-surface) 10%, transparent);
  }

  .cinematic-text-silver {
      background: linear-gradient(180deg, var(--color-on-surface) 0%, color-mix(in srgb, var(--color-on-surface) 40%, transparent) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      transform: translateZ(0);
      filter:
          drop-shadow(0px 10px 20px color-mix(in srgb, var(--color-on-surface) 15%, transparent))
          drop-shadow(0px 2px 4px color-mix(in srgb, var(--color-on-surface) 10%, transparent));
  }

  .cinematic-iphone-bezel {
      background-color: #111;
      box-shadow:
          inset 0 0 0 2px #52525B,
          inset 0 0 0 7px #000,
          0 40px 80px -15px rgba(0,0,0,0.9),
          0 15px 25px -5px rgba(0,0,0,0.7);
      transform-style: preserve-3d;
  }

  .cinematic-hardware-btn {
      background: linear-gradient(90deg, #404040 0%, #171717 100%);
      box-shadow:
          -2px 0 5px rgba(0,0,0,0.8),
          inset -1px 0 1px rgba(255,255,255,0.15),
          inset 1px 0 2px rgba(0,0,0,0.8);
      border-left: 1px solid rgba(255,255,255,0.05);
  }

  .cinematic-screen-glare {
      background: linear-gradient(110deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 45%);
  }

  .cinematic-widget-depth {
      background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
      box-shadow:
          0 10px 20px rgba(0,0,0,0.3),
          inset 0 1px 1px rgba(255,255,255,0.05),
          inset 0 -1px 1px rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.03);
  }

  /* Glow + diagonal sheen appear on hover; leaving reverses the same CSS
     transition, so the sheen sweeps back the way it came instead of just
     snapping off. .is-active mirrors :hover for touch devices, which have
     no real hover state — the button's onClick adds it and delays
     navigation just long enough for this to actually be seen first. */
  .cinematic-glow-pill {
      position: relative;
      overflow: hidden;
      box-shadow: 0 1px 2px rgba(0,0,0,0.4), 0 10px 24px -10px rgba(0,0,0,0.5);
      transition: transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275), box-shadow 0.4s ease;
  }
  .cinematic-glow-pill::before {
      content: "";
      position: absolute; inset: 0;
      background: linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%);
      transform: translateX(-120%);
      transition: transform 0.6s ease;
      pointer-events: none;
  }
  .cinematic-glow-pill:hover,
  .cinematic-glow-pill.is-active {
      transform: translateY(-2px);
      box-shadow:
          0 2px 4px rgba(0,0,0,0.4),
          0 12px 28px -4px rgba(59,130,246,0.45),
          0 0 44px 8px rgba(59,130,246,0.35),
          0 22px 44px -10px rgba(0,0,0,0.55);
  }
  .cinematic-glow-pill:hover::before,
  .cinematic-glow-pill.is-active::before {
      transform: translateX(120%);
  }

  /* Phone mockup's send button: dim by default, lit blue + glowing once the
     scripted tap fires partway through the pinned scroll — auto-animated
     by the timeline, not a hover effect (the button is a decorative mockup,
     not a real hoverable control). See .chat-action-glow for the halo. */
  .cinematic-send-btn {
      position: relative;
      background-color: rgba(255,255,255,0.08);
  }

  /* Always a dark glass chip, regardless of the page's own light/dark theme
     — its text is hardcoded white/blue-200, so on the light theme's pale
     background a theme-following glass tint would wash out unreadable. */
  .cinematic-floating-badge {
      background: linear-gradient(135deg, rgba(30, 32, 40, 0.92) 0%, rgba(15, 16, 22, 0.88) 100%);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      box-shadow:
          0 0 0 1px rgba(255, 255, 255, 0.08),
          0 25px 50px -12px rgba(0, 0, 0, 0.6),
          inset 0 1px 1px rgba(255,255,255,0.15),
          inset 0 -1px 1px rgba(0,0,0,0.5);
  }
`;

// Fixed per-slot framing (position/size/corner radius/shadow) for the nine
// cards in the CTA's project stream. The GSAP timeline in the effect below
// animates all nine identically via the shared `.cta-stream-card` class —
// only the resting frame and which real project fills it differ per slot.
const STREAM_CARD_SLOTS = [
  { position: "right-8 top-12", size: "h-44 w-72", rounded: "rounded-[1.7rem]", shadow: "shadow-[0_24px_60px_rgba(0,0,0,0.16)]" },
  { position: "right-2 top-24", size: "h-52 w-80", rounded: "rounded-[1.9rem]", shadow: "shadow-[0_24px_60px_rgba(0,0,0,0.17)]" },
  { position: "right-12 top-5", size: "h-40 w-64", rounded: "rounded-[1.5rem]", shadow: "shadow-[0_24px_60px_rgba(0,0,0,0.15)]" },
  { position: "right-0 top-20", size: "h-48 w-72", rounded: "rounded-[1.8rem]", shadow: "shadow-[0_24px_60px_rgba(0,0,0,0.18)]" },
  { position: "right-6 top-32", size: "h-42 w-68", rounded: "rounded-[1.6rem]", shadow: "shadow-[0_24px_60px_rgba(0,0,0,0.16)]" },
  { position: "right-16 top-16", size: "h-46 w-76", rounded: "rounded-[1.7rem]", shadow: "shadow-[0_24px_60px_rgba(0,0,0,0.17)]" },
  { position: "right-4 top-2", size: "h-40 w-68", rounded: "rounded-[1.5rem]", shadow: "shadow-[0_24px_60px_rgba(0,0,0,0.15)]" },
  { position: "right-10 top-28", size: "h-50 w-78", rounded: "rounded-[1.8rem]", shadow: "shadow-[0_24px_60px_rgba(0,0,0,0.18)]" },
  { position: "right-1 top-8", size: "h-44 w-72", rounded: "rounded-[1.7rem]", shadow: "shadow-[0_24px_60px_rgba(0,0,0,0.16)]" },
] as const;

export interface CinematicHeroProps {
  brandName?: string;
  tagline1: string;
  tagline2: string;
  tagline3: string;
  cardHeading: string;
  cardDescription: React.ReactNode;
  ctaHeading: string;
  ctaDescription: string;
  badge1Title: string;
  badge1Sub: string;
  badge2Title: string;
  badge2Sub: string;
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
  phoneEyebrow: string;
  phoneTitle: string;
  chatPlaceholder: string;
  chatPrompt: string;
  notif1Title: string;
  notif1Time: string;
  notif2Title: string;
  notif2Time: string;
  notif3Title: string;
  notif4Title: string;
  notif4Time: string;
  className?: string;
}

export function CinematicHero({
  brandName = "IZA UI",
  tagline1,
  tagline2,
  tagline3,
  cardHeading,
  cardDescription,
  ctaHeading,
  ctaDescription,
  badge1Title,
  badge1Sub,
  badge2Title,
  badge2Sub,
  ctaPrimaryLabel,
  ctaSecondaryLabel,
  phoneEyebrow,
  phoneTitle,
  chatPlaceholder,
  chatPrompt,
  notif1Title,
  notif1Time,
  notif2Title,
  notif2Time,
  notif3Title,
  notif4Title,
  notif4Time,
  className = "",
}: CinematicHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const ctaAutoPlayedRef = useRef(false);
  const gsapCtxRef = useRef<gsap.Context | null>(null);
  const reduced = useReducedMotion();
  const router = useRouter();
  const [primaryPressed, setPrimaryPressed] = useState(false);
  const [streamCards, setStreamCards] = useState<DesignEntry[]>([]);
  useEffect(() => {
    let cancelled = false;
    // Straight to the route handler, not `useDesignEntries` — that hook
    // concatenates local iza/color-reference entries on top of the fetched
    // superdesign ones, and this stream is meant to be superdesign.dev
    // work specifically, not the whole gallery's mixed sources.
    fetch("/api/design-gallery")
      .then((res) => res.json())
      .then((data: { items: DesignEntry[] }) => {
        if (cancelled) return;
        const withImages = data.items.filter((entry) => entry.thumbnailUrl && !entry.thumbnailIsVideo);
        const pool = [...withImages];
        const picked: DesignEntry[] = [];
        for (let i = 0; i < STREAM_CARD_SLOTS.length && pool.length > 0; i++) {
          picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
        }
        setStreamCards(picked);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  const normalizedCtaHeading = ctaHeading.toLowerCase();
  const yourStart = normalizedCtaHeading.indexOf("your");
  const projectStart = normalizedCtaHeading.indexOf("project");
  const yourOIndex = yourStart >= 0 ? yourStart + 1 : -1;
  const projectTIndex = projectStart >= 0 ? projectStart + 6 : -1;

  // Navigate away by killing ScrollTrigger's pin-spacer *before* Next.js
  // unmounts this page — don't rely on the effect cleanup's timing (see the
  // useLayoutEffect comment below for why relying on unmount ordering alone
  // wasn't reliable enough in practice).
  const navigate = (href: string) => {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    gsapCtxRef.current?.revert();
    router.push(href);
  };

  // Primary CTA's glow/sheen is a :hover effect, which touch devices never
  // trigger on tap — show it via a manual `.is-active` class first, then
  // navigate after it's actually had time to play.
  const handlePrimaryTap = () => {
    if (primaryPressed) return;
    setPrimaryPressed(true);
    setTimeout(() => navigate("/work"), 450);
  };

  // Mouse-driven 3D tilt on the phone mockup. No card underneath it
  // anymore, so this no longer also tracks a sheen-light position.
  useEffect(() => {
    if (reduced) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (window.scrollY > window.innerHeight * 2) return;

      cancelAnimationFrame(requestRef.current);

      requestRef.current = requestAnimationFrame(() => {
        if (!mockupRef.current) return;

        const xVal = (e.clientX / window.innerWidth - 0.5) * 2;
        const yVal = (e.clientY / window.innerHeight - 0.5) * 2;

        gsap.to(mockupRef.current, {
          rotationY: xVal * 12,
          rotationX: -yVal * 12,
          ease: "power3.out",
          duration: 1.2,
        });
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(requestRef.current);
    };
  }, [reduced]);

  // Cinematic pinned-scroll timeline. Skipped entirely under
  // prefers-reduced-motion — everything just renders in its resting,
  // fully-visible state instead (see the `reduced` early return below).
  // useLayoutEffect (see useIsomorphicLayoutEffect above) so the cleanup
  // that kills ScrollTrigger runs before React removes these DOM nodes.
  useIsomorphicLayoutEffect(() => {
    if (reduced) return;

    const physicsRafs = new Set<number>();
    const physicsTimers = new Set<number>();
    let matterCleanup: (() => void) | null = null;
    const ctx = gsap.context(() => {
      gsap.set(".text-track", { autoAlpha: 0, y: 60, scale: 0.85, filter: "blur(20px)", rotationX: -20 });
      gsap.set(".text-days", { autoAlpha: 1, clipPath: "inset(0 100% 0 0)" });
      gsap.set(".content-group", { autoAlpha: 0, scale: 0.92 });
      // The wrapper stays on one vertical rail at the right. Scroll controls
      // only its travel; the WebGL mesh itself owns the continuous rotation.
      gsap.set(".ascii-logo-scroll-wrapper", { autoAlpha: 0, y: -window.innerHeight * 1.15, x: 0, rotationY: 0, rotationZ: 0, scale: 1 });
      gsap.set([".card-left-text", ".card-right-text", ".mockup-scroll-wrapper", ".floating-badge", ".flow-marker", ".live-notif"], { autoAlpha: 0 });
      // DOM panels keep the scroll-scrubbed transition responsive even on
      // devices where WebGL is unavailable or context creation is throttled.
      gsap.set(".curtain-blind", { scaleY: 0, transformOrigin: "top center", force3D: true });
      gsap.set(".tagline3", { autoAlpha: 0, y: 30 });
      gsap.set(".chat-mock", { height: 40, borderRadius: 20 });
      gsap.set([".chat-typed-row", ".chat-toolbar-row"], { autoAlpha: 0 });
      gsap.set(".chat-action-glow", { autoAlpha: 0, scale: 0.6 });
      gsap.set(".chat-typed-text", { text: "" });
      gsap.set(".cta-wrapper", { autoAlpha: 0, scale: 1, filter: "blur(30px)" });
      gsap.set(".cta-heading, .cta-description, .cta-buttons", { autoAlpha: 0, y: 24 });
      gsap.set(".cta-orbit", { autoAlpha: 0 });
      gsap.set(".cta-stream-card", { autoAlpha: 0, x: 150, y: -420, scale: 0.8, rotation: 0 });
      gsap.set(".cta-bouncer", { autoAlpha: 0, scale: 0.72 });

      // CTA is deliberately not part of the scroll-scrubbed timeline. The
      // scroll only uncovers it; this sequence then plays at normal time.
      //
      // `repeat` lives inside `stagger`, not on a wrapping timeline — with a
      // parent timeline repeating the whole staggered group, every card
      // snaps back to its start position in sync on each restart, reading
      // as a stutter/pause. Putting `repeat: -1` in the stagger config
      // instead makes each card's own tween loop independently the instant
      // it finishes, so the stream never has a moment where everything
      // resets at once. `ease: "none"` keeps velocity constant WITHIN each
      // leg — it doesn't make the legs match EACH OTHER. The waypoints below
      // were picked by eye, so each leg covers a different pixel distance;
      // handing them equal-ish durations regardless meant the first visible
      // leg (a long diagonal, ~4x the distance of the shortest leg) read as
      // a fast launch that then suddenly slowed down. Deriving each leg's
      // duration from its own measured distance at a fixed px/sec instead
      // makes speed constant across the *whole* path, not just inside one
      // segment of it.
      const streamSpeedPxPerSec = 90;
      // Each card's own resting CSS position (the `right-N`/`top-N` on
      // `.cta-stream-card`) already anchors it near .cta-orbit's right
      // edge, which itself hugs the viewport's right edge — so the visible
      // keyframes below (kf1-kf3, the "flowing through screen" ones) were
      // landing almost flush with the right edge even with a small x
      // offset. This pulls just those toward roughly the 3/4-of-viewport
      // mark instead.
      const streamXShift = -window.innerWidth * 0.09;
      const streamEntryX = 34 + streamXShift;
      const streamWaypoints = [
        // Spawns directly above kf1, not off to the right — same x as kf1,
        // just far off-screen above it — so the card visibly falls in from
        // the top into its resting column instead of sliding in from the
        // side.
        { autoAlpha: 0, x: streamEntryX, y: -720, scale: 0.72, rotation: 0 },
        { autoAlpha: 1, x: streamEntryX, y: -170, scale: 0.95, rotation: 0 },
        { autoAlpha: 1, x: -48 + streamXShift, y: 90, scale: 1, rotation: 0 },
        { autoAlpha: 1, x: 24 + streamXShift, y: 280, scale: 0.92, rotation: 0 },
        { autoAlpha: 0, x: window.innerWidth * 0.48, y: window.innerHeight * 0.72, scale: 0.76, rotation: 0 },
      ];
      const streamKeyframes = streamWaypoints.map((point, i) => {
        // Keyframe 0 is the hidden reset jump back to the start of the loop
        // (autoAlpha 0 the whole time) — kept near-instant on purpose, not
        // part of the constant-speed path itself.
        if (i === 0) return { ...point, duration: 0.01 };
        const prev = streamWaypoints[i - 1];
        return { ...point, duration: Math.hypot(point.x - prev.x, point.y - prev.y) / streamSpeedPxPerSec };
      });
      const streamCycleDuration = streamKeyframes.reduce((sum, kf) => sum + kf.duration, 0);

      const cardStreamLoop = gsap.to(".cta-stream-card", {
        keyframes: streamKeyframes,
        ease: "none",
        paused: true,
        // Spreads the 4 cards evenly across one full cycle rather than a
        // fixed guess, so it still reads as an even stream regardless of
        // how streamSpeedPxPerSec changes the cycle's total length.
        stagger: { each: streamCycleDuration / STREAM_CARD_SLOTS.length, repeat: -1 },
      });

      // Real glyph-ink collider, not the element's line-box top. Rasterizing
      // the same text at the same computed font onto an offscreen canvas and
      // scanning for the first non-transparent pixel row finds the true ink
      // top instead of trusting ascent metrics to agree with what's actually
      // rendered. Only runs once per glyph when a prop's physics starts, not
      // per frame.
      //
      // The one thing that rasterizing alone doesn't give you: WHERE within
      // `rect` to draw before scanning. `rect.height` is the full line box,
      // taller than the font's own em-square by its leading, and browsers
      // split that leading evenly above and below the em-square (the CSS
      // half-leading rule) — so the real glyph sits vertically centered in
      // `rect`, not flush with its top. Drawing at the canvas's own top
      // edge (`textBaseline: "top"` at y 0) ignored that and put every
      // surface too high, which is exactly why props were resting with a
      // visible gap above the letter instead of on it. Reproducing the
      // half-leading offset via fontBoundingBoxAscent/Descent before
      // rasterizing fixes that: it only has to get the coarse vertical
      // centering right, and the pixel scan still finds the exact ink row
      // within wherever that lands.
      const glyphRasterCanvas = document.createElement("canvas");
      const glyphRasterCtx = glyphRasterCanvas.getContext("2d", { willReadFrequently: true });

      // Returns just the distance from `el`'s own rect.top down to its real
      // ink top — not an absolute position — so it can be measured once on
      // a container and reused for every character on that same text row.
      // That reuse matters: measuring this per tiny single-character
      // inline-block span (each heading letter) rather than on the shared
      // line itself is what was still leaving a gap on the heading after
      // the kicker line (measured on its own single `<p>`, not per-glyph)
      // came out correct — an auto-height inline-block sized around one
      // glyph doesn't reliably reproduce the same line-box metrics as the
      // shared row it actually sits on.
      const verticalInkOffset = (el: Element) => {
        const rect = el.getBoundingClientRect();
        const text = el.textContent?.trim();
        const width = Math.ceil(rect.width);
        const height = Math.ceil(rect.height);
        if (!glyphRasterCtx || !text || width <= 0 || height <= 0) return 0;

        const style = getComputedStyle(el);
        const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        glyphRasterCanvas.width = width;
        glyphRasterCanvas.height = height;
        glyphRasterCtx.font = font;
        glyphRasterCtx.fillStyle = "#000";

        const metrics = glyphRasterCtx.measureText(text);
        const fontSize = parseFloat(style.fontSize) || height;
        const fontAscent = metrics.fontBoundingBoxAscent ?? fontSize * 0.92;
        const fontDescent = metrics.fontBoundingBoxDescent ?? fontSize * 0.22;
        const halfLeading = Math.max(0, (height - (fontAscent + fontDescent)) / 2);

        glyphRasterCtx.textBaseline = "alphabetic";
        glyphRasterCtx.fillText(text, 0, halfLeading + fontAscent);

        const { data } = glyphRasterCtx.getImageData(0, 0, width, height);
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            if (data[(y * width + x) * 4 + 3] > 32) return y;
          }
        }
        return 0;
      };
      const glyphInkTop = (el: Element, hostTop: number) => el.getBoundingClientRect().top - hostTop + verticalInkOffset(el);

      // A single ink-top per glyph is right for most letters, but "j" (and
      // "i") are two disconnected ink blobs — a dot floating well above the
      // stem — so one flat surface at either height leaves the other blob
      // with nothing under it. The stem gets covered by the uniform row
      // plate already; this finds the dot specifically (a real connected-
      // component scan on the rasterized glyph, not a guess) so it becomes
      // its own tiny bump instead of a hole the prop rolls straight through.
      const findDotBump = (el: Element, hostLeft: number, hostTop: number) => {
        const rect = el.getBoundingClientRect();
        const width = Math.ceil(rect.width);
        const height = Math.ceil(rect.height);
        const text = el.textContent?.trim();
        if (!glyphRasterCtx || !text || width <= 0 || height <= 0) return null;

        const style = getComputedStyle(el);
        glyphRasterCanvas.width = width;
        glyphRasterCanvas.height = height;
        glyphRasterCtx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        glyphRasterCtx.fillStyle = "#000";
        glyphRasterCtx.clearRect(0, 0, width, height);

        const metrics = glyphRasterCtx.measureText(text);
        const fontSize = parseFloat(style.fontSize) || height;
        const fontAscent = metrics.fontBoundingBoxAscent ?? fontSize * 0.92;
        const fontDescent = metrics.fontBoundingBoxDescent ?? fontSize * 0.22;
        const halfLeading = Math.max(0, (height - (fontAscent + fontDescent)) / 2);
        glyphRasterCtx.textBaseline = "alphabetic";
        glyphRasterCtx.fillText(text, 0, halfLeading + fontAscent);

        const { data } = glyphRasterCtx.getImageData(0, 0, width, height);
        const isInk = (x: number, y: number) => x >= 0 && x < width && y >= 0 && y < height && data[(y * width + x) * 4 + 3] > 32;

        // Flood-fill (4-directional) every ink pixel into connected blobs.
        const visited = new Uint8Array(width * height);
        const blobs: { minX: number; maxX: number; minY: number; maxY: number; size: number }[] = [];
        for (let sy = 0; sy < height; sy++) {
          for (let sx = 0; sx < width; sx++) {
            if (!isInk(sx, sy) || visited[sy * width + sx]) continue;
            const stack: [number, number][] = [[sx, sy]];
            visited[sy * width + sx] = 1;
            let minX = sx, maxX = sx, minY = sy, maxY = sy, size = 0;
            while (stack.length) {
              const [cx, cy] = stack.pop()!;
              size += 1;
              if (cx < minX) minX = cx;
              if (cx > maxX) maxX = cx;
              if (cy < minY) minY = cy;
              if (cy > maxY) maxY = cy;
              for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
                const nx = cx + dx;
                const ny = cy + dy;
                if (isInk(nx, ny) && !visited[ny * width + nx]) {
                  visited[ny * width + nx] = 1;
                  stack.push([nx, ny]);
                }
              }
            }
            blobs.push({ minX, maxX, minY, maxY, size });
          }
        }
        if (blobs.length < 2) return null;

        const stem = blobs.reduce((a, b) => (b.size > a.size ? b : a));
        const dot = blobs.find((b) => b !== stem && b.maxY < stem.minY + (stem.maxY - stem.minY) * 0.4);
        if (!dot) return null;

        return {
          left: rect.left - hostLeft + dot.minX,
          right: rect.left - hostLeft + dot.maxX + 1,
          top: rect.top - hostTop + dot.minY,
        };
      };

      const ctaAutoTl = gsap.timeline({ paused: true });
      ctaAutoTl
        .fromTo(".cta-heading", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, ease: "power3.out", duration: 0.8 })
        .fromTo(".cta-description", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, ease: "power3.out", duration: 0.8 }, "-=0.48")
        .fromTo(".cta-buttons", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, ease: "power3.out", duration: 0.8 }, "-=0.48")
        .to(".cta-orbit", { autoAlpha: 1, duration: 0.01 }, "<")
        .call(() => cardStreamLoop.restart(), [], "<");

      // Real rigid-body sim (Matter.js), not a scripted approximation: every
      // glyph the props cross is its own static collider, positioned at its
      // measured ink-top surface. Rotation is never assigned directly — it's
      // whatever torque the engine's friction contact produces, so a prop
      // only spins while it's actually rolling on a surface and stops dead
      // the instant it's airborne, which is what a scripted "angle +=
      // f(velocity)" formula could never guarantee (it kept spinning through
      // empty air). Loaded lazily: this is a one-shot decorative sequence,
      // not something that should sit in the initial bundle.
      const startBouncerPhysics = async () => {
        const host = containerRef.current?.getBoundingClientRect();
        const iEl = containerRef.current?.querySelector<HTMLElement>(".cta-brand-i");
        const sixEl = containerRef.current?.querySelector<HTMLElement>(".cta-year-six");
        const oEl = containerRef.current?.querySelector<HTMLElement>(".cta-letter-your-o");
        const tEl = containerRef.current?.querySelector<HTMLElement>(".cta-letter-project-t");
        const kicker = containerRef.current?.querySelector<HTMLElement>(".cta-kicker");
        const headingEl = containerRef.current?.querySelector<HTMLElement>(".cta-heading");
        const headingChars = Array.from(containerRef.current?.querySelectorAll<HTMLElement>(".cta-heading-char") ?? [])
          .filter((glyph) => glyph.textContent?.trim());
        if (!host || !iEl || !sixEl || !oEl || !tEl || !kicker || !headingEl || !headingChars.length) return;

        const Matter = await import("matter-js");
        // The route may have changed (component torn down) while that
        // import was in flight.
        if (!containerRef.current) return;

        const hostLeft = host.left;
        const engine = Matter.Engine.create({ gravity: { x: 0, y: 1.65 } });
        const world = engine.world;

        // A thin static plate per contact surface. Its top edge is pinned
        // to the glyph's real ink-top, so a prop's underside meets the
        // actual visible stroke instead of a font-size-dependent line box.
        const plateThickness = 16;
        const makePlate = (left: number, right: number, top: number) =>
          Matter.Bodies.rectangle(
            (left + right) / 2,
            top + plateThickness / 2,
            Math.max(1, right - left),
            plateThickness,
            { isStatic: true, friction: 0.9 },
          );

        const kickerRect = kicker.getBoundingClientRect();
        const sixRect = sixEl.getBoundingClientRect();

        // The kicker line only supports the prop up to the measured "6" —
        // beyond that it's a separate plate per glyph, so a fall through the
        // "2026" -> "your" gap is an actual gap in the collider, not a
        // scripted phase switch. Its left edge is padded out past "I" itself
        // — the prop spawns centered on "I"'s glyph, which sits right at the
        // very start of the line, so without this margin half the prop's
        // own width lands hanging off the plate's left edge with nothing
        // under it, and gravity tips/slides it off to the left on contact.
        const kickerPlate = makePlate(kickerRect.left - hostLeft - 30, sixRect.right - hostLeft, glyphInkTop(kicker, host.top));
        // One offset for the whole heading row (see verticalInkOffset),
        // applied to each character's own measured rect.top — correct even
        // if the heading wraps, since every row shares the same font metrics
        // and each char's own rect.top already reflects which row it's on.
        //
        // Measured on a throwaway plain-text clone, not `headingEl` itself:
        // every character in the real heading is its own inline-block span
        // (needed so each glyph has its own rect for horizontal placement),
        // and that per-character splitting was itself skewing the parent
        // H2's own line-box metrics enough to move the offset the wrong
        // way — sank into the letters instead of floating above them. A
        // clone with the same classes (same font/size/weight/line-height)
        // but plain, unsplit text behaves like the kicker's own `<p>` — which
        // already measures correctly — because it's laid out the same way.
        const headingProbe = document.createElement(headingEl.tagName);
        headingProbe.className = headingEl.className;
        headingProbe.textContent = ctaHeading;
        headingProbe.style.position = "absolute";
        headingProbe.style.visibility = "hidden";
        headingProbe.style.left = "-9999px";
        headingProbe.style.top = "0";
        headingProbe.style.margin = "0";
        document.body.appendChild(headingProbe);
        const headingInkOffset = verticalInkOffset(headingProbe);
        headingProbe.remove();

        const headingPlates = headingChars.map((glyph) => {
          const rect = glyph.getBoundingClientRect();
          return makePlate(rect.left - hostLeft, rect.right - hostLeft, rect.top - host.top + headingInkOffset);
        });
        // "j"/"i"'s dot sits well above the uniform row surface the stem
        // already shares with its neighbors — without its own small plate
        // there, a prop rolls straight through where the dot visually is.
        const dotPlates = headingChars
          .filter((glyph) => glyph.textContent === "j" || glyph.textContent === "i")
          .map((glyph) => findDotBump(glyph, hostLeft, host.top))
          .filter((bump): bump is NonNullable<typeof bump> => bump !== null)
          .map((bump) => makePlate(bump.left, bump.right, bump.top));
        Matter.Composite.add(world, [kickerPlate, ...headingPlates, ...dotPlates]);

        const tRightEdge = tEl.getBoundingClientRect().right - hostLeft;
        const iRect = iEl.getBoundingClientRect();
        const spawnX = iRect.left - hostLeft + iRect.width / 2 + 18;

        type ActiveProp = { body: Matter.Body; prop: HTMLElement; size: number; grounded: boolean };
        const active: ActiveProp[] = [];

        const markGrounded = (event: Matter.IEventCollision<Matter.Engine>, value: boolean) => {
          for (const pair of event.pairs) {
            for (const entry of active) {
              if (pair.bodyA === entry.body || pair.bodyB === entry.body) entry.grounded = value;
            }
          }
        };
        Matter.Events.on(engine, "collisionStart", (event) => markGrounded(event, true));
        Matter.Events.on(engine, "collisionEnd", (event) => markGrounded(event, false));

        const bouncerSelectors = [".cta-bouncer-one", ".cta-bouncer-two", ".cta-bouncer-three"];
        // Counts spawns within the current cycle, not the lifetime total —
        // `active` briefly empties between the staggered spawns themselves
        // (prop one can land and still be mid-roll while two hasn't dropped
        // yet), so "all gone" alone isn't "cycle finished"; it only means
        // that once every one of the three has actually been spawned.
        let spawnedInCycle = 0;

        const spawn = (selector: string, delayMs: number) => {
          const prop = containerRef.current?.querySelector<HTMLElement>(selector);
          if (!prop) return;
          const timer = window.setTimeout(() => {
            physicsTimers.delete(timer);
            if (!containerRef.current) return;
            // offsetWidth, not getBoundingClientRect().width — the prop
            // still carries its resting `scale: 0.72` here, which would
            // otherwise bake a shrunk number into the body's own size.
            const size = prop.offsetWidth || 40;
            const body = Matter.Bodies.rectangle(spawnX, -size - 30, size, size, {
              restitution: 0.12,
              friction: 0.9,
              frictionAir: 0.0018,
              density: 0.0025,
              // Matches the art's own rounded-[28%] corners. A sharp-corner
              // box "catches" on each pivot as it rolls — chamfering the
              // collision hull itself is what actually makes the rotation
              // read as smooth rolling instead of clunky tumbling.
              chamfer: { radius: size * 0.28 },
            });
            Matter.Composite.add(world, body);
            gsap.set(prop, { autoAlpha: 1, scale: 1, x: spawnX - size / 2, y: -size - 30, rotation: 0 });
            active.push({ body, prop, size, grounded: false });
            spawnedInCycle += 1;
          }, delayMs);
          physicsTimers.add(timer);
        };

        // Re-releases all three, staggered the same way, once every prop
        // from the previous run has actually fallen off the bottom edge.
        const runCycle = () => {
          spawnedInCycle = 0;
          bouncerSelectors.forEach((selector, i) => spawn(selector, i * 1900));
        };
        runCycle();

        let previousTime = performance.now();
        const step = (now: number) => {
          const dt = Math.min(now - previousTime, 32);
          previousTime = now;

          // The one scripted input left: a small constant torque, like an
          // engine driving the wheel — not a push on the body itself. A
          // force applied at the body's own centroid has to first overcome
          // static friction before anything moves, which is why the earlier
          // version just sat there stuck: friction (0.9, deliberately high
          // so it grips instead of skidding) happily cancelled a push that
          // small. Spinning it instead means friction with the ground is
          // what converts that spin into forward motion — exactly how a
          // real tire moves a car — so it starts rolling immediately rather
          // than needing to break static friction's grip first. It's applied
          // for the prop's whole time on screen, not gated on `grounded`:
          // gating it caused stalls of its own, since restitution makes
          // contact flicker true/false for a frame or two on every landing,
          // and torque spent spinning it in mid-air is harmless — it just
          // keeps the wheel already turning when it touches back down.
          for (const entry of active) {
            if (entry.body.position.x < tRightEdge) {
              entry.body.torque += 0.012 * entry.body.mass;
            }
          }

          Matter.Engine.update(engine, dt);

          for (let i = active.length - 1; i >= 0; i--) {
            const entry = active[i];
            gsap.set(entry.prop, {
              x: entry.body.position.x - entry.size / 2,
              y: entry.body.position.y - entry.size / 2,
              rotation: (entry.body.angle * 180) / Math.PI,
            });
            if (entry.body.position.y - entry.size / 2 > window.innerHeight + entry.size) {
              gsap.set(entry.prop, { autoAlpha: 0 });
              Matter.Composite.remove(world, entry.body);
              active.splice(i, 1);
              if (active.length === 0 && spawnedInCycle === bouncerSelectors.length) {
                const restartTimer = window.setTimeout(() => {
                  physicsTimers.delete(restartTimer);
                  runCycle();
                }, 700);
                physicsTimers.add(restartTimer);
              }
            }
          }

          const id = requestAnimationFrame(step);
          physicsRafs.add(id);
        };
        const id = requestAnimationFrame(step);
        physicsRafs.add(id);

        matterCleanup = () => {
          Matter.Composite.clear(world, false);
          Matter.Engine.clear(engine);
        };
      };

      ctaAutoTl.call(() => {
        void startBouncerPhysics();
      });

      const introTl = gsap.timeline({ delay: 0.3 });
      introTl
        .to(".text-track", { duration: 1.8, autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", rotationX: 0, ease: "expo.out" })
        .to(".text-days", { duration: 1.4, clipPath: "inset(0 0% 0 0)", ease: "power4.inOut" }, "-=1.0");

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=8200",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      scrollTl
        // 1. The intro tagline fully disappears (not just dimmed) — the grid
        // stays put behind it; it's every section except the mockup one.
        .to(".hero-text-wrapper", { scale: 1.1, filter: "blur(16px)", autoAlpha: 0, ease: "power2.inOut", duration: 1.4 }, 0)
        // 2. ...then a second line appears on its own, holds, and fully
        // disappears again before anything else shows up.
        .fromTo(".tagline3", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 1 }, "+=0.2")
        .to({}, { duration: 0.8 })
        .to(".tagline3", { autoAlpha: 0, y: -30, ease: "power2.in", duration: 1 })
        // 3. Only now does the phone mockup / brand / copy layer appear —
        // the grid fades out for the duration of this section only.
        .to(".cinematic-bg-grid", { scale: 1.15, filter: "blur(20px)", opacity: 0, ease: "power2.inOut", duration: 1.2 }, "-=0.2")
        .to(".content-group", { autoAlpha: 1, scale: 1, ease: "power3.out", duration: 2 }, "<")
        .to(".ascii-logo-scroll-wrapper", {
          autoAlpha: 1, y: 0, x: 0, scale: 1,
          ease: "none", duration: 2.4,
        }, "<")
        .fromTo(".mockup-scroll-wrapper",
          { y: 300, z: -500, rotationX: 50, rotationY: -30, autoAlpha: 0, scale: 0.6 },
          { y: 0, z: 0, rotationX: 0, rotationY: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 2.5 }, "-=1.2"
        )
        // Chat mock: collapsed pill -> expanded card, type the prompt, light
        // up the send button, tap it, then a marker flies down the SVG path
        // into the notification stack below.
        .to(".chat-placeholder", { autoAlpha: 0, duration: 0.3 }, "-=0.6")
        .to(".chat-mock", { height: 64, borderRadius: 24, duration: 0.5, ease: "power2.inOut" }, "<")
        .to([".chat-typed-row", ".chat-toolbar-row"], { autoAlpha: 1, duration: 0.4 }, "-=0.2")
        .to(".chat-typed-text", { duration: 1.8, text: chatPrompt, ease: "none" })
        .to(".cinematic-send-fill", { backgroundColor: "#3B82F6", duration: 0.4 })
        .to(".chat-action-glow", { autoAlpha: 1, scale: 1, duration: 0.4 }, "<")
        // Bounce the inner fill, not `.chat-generate-btn` itself — GSAP writes
        // a plain `transform` inline style, which would otherwise clobber the
        // Tailwind `-translate-y-1/2` centering transform on the outer button.
        .to(".cinematic-send-fill", { scale: 0.85, duration: 0.15, yoyo: true, repeat: 1, ease: "power1.inOut" })
        .to(".flow-marker", { autoAlpha: 1, duration: 0.2 })
        .to(".flow-marker", {
          motionPath: { path: "#flow-path", align: "#flow-path", alignOrigin: [0.5, 0.5] },
          duration: 1.4,
          ease: "power2.inOut",
        })
        .set(".flow-marker", { autoAlpha: 0 })
        .fromTo(".live-notif", { y: -30, autoAlpha: 0, scale: 0.95 }, { y: 0, autoAlpha: 1, scale: 1, stagger: 0.35, ease: "back.out(1.4)", duration: 0.9 }, "-=0.2")
        .fromTo(".floating-badge", { y: 100, autoAlpha: 0, scale: 0.7, rotationZ: -10 }, { y: 0, autoAlpha: 1, scale: 1, rotationZ: 0, ease: "back.out(1.5)", duration: 1.5, stagger: 0.2 }, "-=0.8")
        .fromTo(".card-left-text", { x: -50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: "power4.out", duration: 1.5 }, "-=1.5")
        .fromTo(".card-right-text", { x: 50, autoAlpha: 0, scale: 0.8 }, { x: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 1.5 }, "<")
        .to({}, { duration: 2.5 })
        // 4. A staggered curtain closes over the mockup. Swap the scene while
        // it is covered, then open it from the opposite edge onto the CTA.
        .to(".curtain-blind", {
          scaleY: 1,
          transformOrigin: "top center",
          ease: "power4.inOut",
          duration: 0.76,
          stagger: { each: 0.09, from: "start" },
        })
        .to([".mockup-scroll-wrapper", ".floating-badge", ".card-left-text", ".card-right-text"], {
          scale: 0.9, y: -40, z: -200, autoAlpha: 0, ease: "power3.in", duration: 0.5, stagger: 0.03,
        }, "<")
        .to(".ascii-logo-scroll-wrapper", {
          y: -window.innerHeight * 1.15, x: 0, scale: 1, autoAlpha: 0,
          ease: "none", duration: 0.5,
        }, "<")
        .set(".content-group", { autoAlpha: 0 })
        .set(".cta-wrapper", { autoAlpha: 1, scale: 1, filter: "blur(0px)" })
        .to(".cinematic-bg-grid", { scale: 1, filter: "blur(0px)", opacity: 0.5, ease: "power2.out", duration: 0.65 }, "<")
        .to(".curtain-blind", {
          scaleY: 0,
          transformOrigin: "bottom center",
          ease: "power4.inOut",
          duration: 0.82,
          stagger: { each: 0.1, from: "end" },
        }, "<")
        .call(() => {
          // ScrollTrigger can cross this point more than once while scrub
          // catches up. The CTA must mount and play once, not restart as the
          // visitor continues scrolling below the blinds transition.
          if (ctaAutoPlayedRef.current) return;
          ctaAutoPlayedRef.current = true;
          ctaAutoTl.play(0);
        }, [], "+=0.16")
        .to({}, { duration: 1.5 });
    }, containerRef);

    gsapCtxRef.current = ctx;

    return () => {
      // `ctx.revert()` un-pins/un-wraps everything this context created, but
      // on a client-side route change (Next.js App Router unmounts this page
      // without a full document reload) that revert can race React's own
      // unmount of the same DOM nodes — ScrollTrigger's pin-spacer wrapper
      // briefly leaves the pinned element with a different parent than the
      // one React recorded, and React's removeChild then throws "not a child
      // of this node". Killing every ScrollTrigger first forces the
      // pin-spacers to unwrap synchronously before ctx.revert()/React's own
      // cleanup touches the tree.
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      physicsRafs.forEach((id) => cancelAnimationFrame(id));
      physicsTimers.forEach((id) => window.clearTimeout(id));
      matterCleanup?.();
      ctx.revert();
    };
  }, [chatPrompt, reduced]);

  const phoneMockup = (
    <div className="relative w-70 h-145 rounded-[3rem] cinematic-iphone-bezel flex flex-col will-change-transform" style={{ transformStyle: "preserve-3d" }} ref={reduced ? undefined : mockupRef}>
      <div className="absolute top-30 -left-0.75 w-0.75 h-6.25 cinematic-hardware-btn rounded-l-md z-0" aria-hidden="true" />
      <div className="absolute top-40 -left-0.75 w-0.75 h-11.25 cinematic-hardware-btn rounded-l-md z-0" aria-hidden="true" />
      <div className="absolute top-55 -left-0.75 w-0.75 h-11.25 cinematic-hardware-btn rounded-l-md z-0" aria-hidden="true" />
      <div className="absolute top-42.5 -right-0.75 w-0.75 h-17.5 cinematic-hardware-btn rounded-r-md z-0 scale-x-[-1]" aria-hidden="true" />

      <div className="absolute inset-1.75 bg-[#050914] rounded-[2.5rem] overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,1)] text-white z-10">
        <div className="absolute inset-0 cinematic-screen-glare z-40 pointer-events-none" aria-hidden="true" />

        <div className="absolute top-1.25 left-1/2 -translate-x-1/2 w-25 h-7 bg-black rounded-full z-50 flex items-center justify-end px-3 shadow-[inset_0_-1px_2px_rgba(255,255,255,0.1)]">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
        </div>

        <div className="relative w-full h-full pt-12 px-5 pb-8 flex flex-col">
          <div className="flex flex-col mb-3">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1">{phoneEyebrow}</span>
            <span className="text-xl font-bold tracking-tight text-white drop-shadow-md">{phoneTitle}</span>
          </div>

          {/* Mock AI chat input (docs/ai-chat-input.md, condensed) — starts
              as a collapsed "Ask anything…" pill, expands into a card with
              a model toolbar, types itself out, then its send button lights
              up (dim -> blue + glow) as a normal flex sibling of the text. */}
          <div className="relative mb-2">
            <div
              className="chat-mock relative bg-white/5 border border-white/10 shadow-inner overflow-hidden"
              style={{ height: reduced ? 64 : 40, borderRadius: reduced ? 24 : 20 }}
            >
              {!reduced && (
                <span className="chat-placeholder absolute left-4 top-1/2 -translate-y-1/2 text-[11px] text-neutral-500 font-medium truncate">
                  {chatPlaceholder}
                </span>
              )}

              {/* Typed text + send button as ordinary flex siblings — the
                  button is a normal flex item (not %/translate-positioned),
                  so it can't end up anywhere but the end of this row. */}
              <div className="chat-typed-row absolute inset-x-0 top-0 px-3 pt-2 flex items-center gap-2">
                <span className="flex-1 min-w-0 flex items-center">
                  <span className="chat-typed-text text-[11px] text-neutral-200 truncate">{reduced ? chatPrompt : ""}</span>
                  <span className="inline-block w-0.5 h-3 bg-blue-400 ml-0.5 shrink-0" aria-hidden="true" />
                </span>

                <div className="chat-generate-btn cinematic-send-btn relative w-7 h-7 rounded-full shrink-0">
                  <div
                    className="chat-action-glow absolute -inset-1 rounded-full pointer-events-none"
                    style={{
                      background: "radial-gradient(circle, rgba(59,130,246,0.65) 0%, transparent 70%)",
                      filter: "blur(9px)",
                      opacity: reduced ? 1 : undefined,
                    }}
                    aria-hidden="true"
                  />
                  <div
                    className="cinematic-send-fill absolute inset-0 rounded-full flex items-center justify-center"
                    style={reduced ? { backgroundColor: "#3B82F6", boxShadow: "0 8px 16px -4px rgba(59,130,246,0.5)" } : undefined}
                  >
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M7 12V2M7 2L2.5 6.5M7 2L11.5 6.5" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="chat-toolbar-row absolute inset-x-0 bottom-0 px-2.5 pb-1.5 flex items-center gap-1">
                <div className="flex items-center gap-1 rounded-full px-1.5 py-0.5 bg-white/5 text-neutral-300">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="5" y="8" width="14" height="10" rx="2" />
                    <circle cx="9.5" cy="13" r="1" fill="currentColor" stroke="none" />
                    <circle cx="14.5" cy="13" r="1" fill="currentColor" stroke="none" />
                    <path strokeLinecap="round" d="M12 8V5M9.5 5h5" />
                  </svg>
                  <span className="text-[8px] font-semibold">Auto</span>
                </div>
              </div>
            </div>
          </div>

          {/* Connector: a marker travels this path (GSAP MotionPath) from the
              generate button down into the notification stack below. */}
          <div className="relative h-9" aria-hidden="true">
            <svg viewBox="0 0 220 36" className="absolute inset-0 w-full h-full overflow-visible">
              <path id="flow-path" d="M200 4 C150 4, 70 30, 14 30" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="2" strokeDasharray="4 5" strokeLinecap="round" />
            </svg>
            {!reduced && (
              <div className="flow-marker absolute w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.9)]" style={{ left: 0, top: 0 }} />
            )}
          </div>

          <div className="space-y-2">
            <div className="live-notif cinematic-widget-depth rounded-xl p-2.5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/5 flex items-center justify-center border border-blue-400/20 shrink-0">
                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                </svg>
              </div>
              <p className="flex-1 min-w-0 text-white text-[11px] font-bold truncate">{notif1Title}</p>
              <span className="text-[9px] text-neutral-500 shrink-0">{notif1Time}</span>
            </div>

            <div className="live-notif cinematic-widget-depth rounded-xl p-2.5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500/20 to-sky-600/5 flex items-center justify-center border border-sky-400/20 shrink-0">
                <svg className="w-3.5 h-3.5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 6l-10 7L2 6" />
                </svg>
              </div>
              <p className="flex-1 min-w-0 text-white text-[11px] font-bold truncate">{notif2Title}</p>
              <span className="text-[9px] text-neutral-500 shrink-0">{notif2Time}</span>
            </div>

            <div className="live-notif cinematic-widget-depth rounded-xl p-2.5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-indigo-600/5 flex items-center justify-center border border-indigo-400/20 shrink-0">
                <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94z" />
                </svg>
              </div>
              <p className="flex-1 min-w-0 text-white text-[11px] font-bold truncate">{notif3Title}</p>
              <div className="flex gap-0.5 shrink-0">
                <span className="w-1 h-1 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1 h-1 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1 h-1 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>

            <div className="live-notif cinematic-widget-depth rounded-xl p-2.5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 flex items-center justify-center border border-emerald-400/20 shrink-0">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="flex-1 min-w-0 text-white text-[11px] font-bold truncate">{notif4Title}</p>
              <span className="text-[9px] text-neutral-500 shrink-0">{notif4Time}</span>
            </div>
          </div>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-30 h-[4px] bg-white/20 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
        </div>
      </div>
    </div>
  );

  const badges = (
    <>
      <div className="floating-badge absolute flex top-6 lg:top-12 -left-3.75 lg:-left-20 cinematic-floating-badge rounded-xl lg:rounded-2xl p-3 lg:p-4 items-center gap-3 lg:gap-4 z-30">
        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-b from-blue-500/20 to-blue-900/10 flex items-center justify-center border border-blue-400/30 shadow-inner">
          <Image src={callMeHandEmoji} alt="" width={20} height={20} className="h-4 w-4 lg:h-5 lg:w-5 drop-shadow-lg" />
        </div>
        <div>
          <p className="text-white text-xs lg:text-sm font-bold tracking-tight">{badge1Title}</p>
          <p className="text-blue-200/50 text-[10px] lg:text-xs font-medium">{badge1Sub}</p>
        </div>
      </div>

      <div className="floating-badge absolute flex bottom-12 lg:bottom-20 -right-3.75 lg:-right-20 cinematic-floating-badge rounded-xl lg:rounded-2xl p-3 lg:p-4 items-center gap-3 lg:gap-4 z-30">
        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-b from-indigo-500/20 to-indigo-900/10 flex items-center justify-center border border-indigo-400/30 shadow-inner">
          <Image src={beamingFaceEmoji} alt="" width={20} height={20} className="h-4 w-4 lg:h-5 lg:w-5 drop-shadow-lg" />
        </div>
        <div>
          <p className="text-white text-xs lg:text-sm font-bold tracking-tight">{badge2Title}</p>
          <p className="text-blue-200/50 text-[10px] lg:text-xs font-medium">{badge2Sub}</p>
        </div>
      </div>
    </>
  );

  const ctaButtons = (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <button
        type="button"
        onClick={handlePrimaryTap}
        className={`cinematic-glow-pill inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white ${primaryPressed ? "is-active" : ""}`}
      >
        {ctaPrimaryLabel}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2.5 7h9M7.5 3l4 4-4 4" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => navigate("/work#gallery")}
        className="text-sm font-medium text-secondary transition-colors hover:text-on-surface"
      >
        {ctaSecondaryLabel}
      </button>
    </div>
  );

  // Static fallback for prefers-reduced-motion: no pin, no scroll-jacking,
  // everything in normal document flow, fully visible immediately.
  if (reduced) {
    return (
      <div className={`relative w-full flex flex-col items-center gap-16 text-center px-4 py-16 bg-surface text-on-surface font-sans antialiased ${className}`}>
        <div className="cinematic-film-grain" aria-hidden="true" />
        <div className="cinematic-bg-grid absolute inset-0 z-0 pointer-events-none opacity-50" aria-hidden="true" />

        <div className="relative z-10 flex flex-col items-center">
          <h1 className="cinematic-text-matte text-4xl md:text-6xl font-bold tracking-tight mb-2">{tagline1}</h1>
          <h1 className="cinematic-text-silver text-4xl md:text-6xl font-extrabold tracking-tighter">{tagline2}</h1>
        </div>

        <div className="relative z-10 w-full max-w-[80rem] mx-auto flex flex-col-reverse lg:grid lg:grid-cols-3 items-center gap-10 lg:gap-8">
          <div className="flex flex-col justify-center text-center lg:text-left">
            <h3 className="text-on-surface text-2xl md:text-3xl font-bold mb-3 lg:mb-5 tracking-tight">{cardHeading}</h3>
            <p className="text-secondary text-sm md:text-base leading-relaxed mx-auto lg:mx-0 max-w-[24rem]">{cardDescription}</p>
          </div>

          <div className="relative w-full h-105 flex items-center justify-center" style={{ perspective: "1000px" }}>
            <div className="relative w-full h-full flex items-center justify-center transform scale-[0.7]">
              {phoneMockup}
              {badges}
            </div>
          </div>

          <div className="flex justify-center lg:justify-end w-full">
            <AsciiIzaLogo3D className="w-48 md:w-64" alt={brandName} />
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight cinematic-text-silver">{ctaHeading}</h2>
          <p className="text-secondary text-base md:text-lg mb-8 max-w-[36rem] mx-auto font-light leading-relaxed">{ctaDescription}</p>
          {ctaButtons}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-screen h-screen overflow-hidden flex items-center justify-center bg-surface text-on-surface font-sans antialiased ${className}`}
      style={{ perspective: "1500px" }}
    >
      <style dangerouslySetInnerHTML={{ __html: INJECTED_STYLES }} />
      <div className="cinematic-film-grain" aria-hidden="true" />
      <div className="cinematic-bg-grid absolute inset-0 z-0 pointer-events-none opacity-50" aria-hidden="true" />

      {/* Solid black blinds: close one-by-one, then reveal the CTA. */}
      <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden" aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => (
          <span
            key={index}
            className="curtain-blind absolute inset-y-0 block bg-black will-change-transform"
            style={{
              left: `${(index / 12) * 100}%`,
              width: `${100 / 12 + 0.12}%`,
            }}
          />
        ))}
      </div>

      {/* The logo is behind the phone layer, so it can remain centered during
          the mockup beat without blocking the interactive content. */}
      <div className="ascii-logo-scroll-wrapper absolute inset-0 z-15 flex items-center justify-end pr-6 md:pr-12 lg:pr-24 pointer-events-none will-change-transform" style={{ perspective: "1400px", transformStyle: "preserve-3d" }}>
        <AsciiIzaLogo3D className="w-56 md:w-80 lg:w-112" alt={brandName} />
      </div>

      {/* Hero tagline layer */}
      <div className="hero-text-wrapper absolute z-10 flex flex-col items-center justify-center text-center w-screen px-4 will-change-transform" style={{ transformStyle: "preserve-3d" }}>
        <h1 className="text-track gsap-reveal cinematic-text-matte text-5xl md:text-7xl lg:text-[6rem] font-bold tracking-tight mb-2">
          {tagline1}
        </h1>
        <h1 className="text-days gsap-reveal cinematic-text-silver text-5xl md:text-7xl lg:text-[6rem] font-extrabold tracking-tighter">
          {tagline2}
        </h1>
      </div>

      {/* Second beat: appears once the hero tagline above has fully faded
          out, then fades fully out itself before the phone mockup appears. */}
      <div className="tagline3-wrapper absolute z-10 flex items-center justify-center text-center w-screen px-4 pointer-events-none">
        <h2 className="tagline3 gsap-reveal cinematic-text-silver text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
          {tagline3}
        </h2>
      </div>

      {/* CTA layer: project brief on the left, nine-part IZA scene on right. */}
      <div className="cta-wrapper absolute inset-0 z-10 w-screen px-19 md:px-24 lg:px-30 gsap-reveal pointer-events-auto will-change-transform">
        {/* Not a 2-column grid anymore — the right side (cards) is absolute
            and doesn't reserve any width, so the left column is free to
            take a bigger left margin without the two sides fighting over a
            fixed 50/50 split and cramping the text. */}
        <div className="relative mx-auto flex h-full w-full items-center">
          <div className="relative z-10 flex w-full flex-col items-center text-center lg:ml-16 lg:max-w-176 lg:items-start lg:text-left">
            <p className="cta-kicker mb-5 text-xs font-semibold tracking-[0.24em] text-secondary uppercase"><span className="cta-brand-prop"><span className="cta-brand-i">I</span>za</span> creation labs / 202<span className="cta-year-six">6</span></p>
            <h2 className="cta-heading text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight cinematic-text-silver">
              {Array.from(ctaHeading).map((character, index) => (
                <span
                  key={`${character}-${index}`}
                  className={`cta-heading-char inline-block${index === yourOIndex ? " cta-letter-your-o" : ""}${index === projectTIndex ? " cta-letter-project-t" : ""}`}
                  // A lone space character as the sole content of its own
                  // inline-block gets silently collapsed to zero width by
                  // normal whitespace rules — this is why "Start your
                  // project." was rendering as "Startyourproject.". `pre`
                  // stops that collapse; the explicit width on top of it (a
                  // fraction of this font's own, too-wide space glyph) is
                  // what actually makes the gap read as a tight word space
                  // instead of a full one.
                  style={character === " " ? { whiteSpace: "pre", width: "0.24em" } : undefined}
                >
                  {character}
                </span>
              ))}
            </h2>
            <p className="cta-description text-secondary text-lg md:text-xl mb-12 max-w-[36rem] font-light leading-relaxed">
              {ctaDescription}
            </p>
            <div className="cta-buttons">{ctaButtons}</div>

          </div>

          <div className="cta-orbit absolute right-0 top-1/2 hidden h-128 w-144 -translate-y-1/2 overflow-visible lg:block" aria-label="Project card stream">
            {STREAM_CARD_SLOTS.map((slot, index) => {
              const entry = streamCards[index];
              return (
                <div
                  key={index}
                  className={`cta-stream-card absolute ${slot.position} ${slot.size} ${slot.rounded} ${slot.shadow} overflow-hidden bg-white`}
                >
                  {entry && (
                    <Image
                      src={entry.thumbnailUrl}
                      alt={entry.title}
                      fill
                      sizes="320px"
                      className="object-cover"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="cta-bouncer cta-bouncer-one absolute left-0 top-0 z-30 h-8 w-8 md:h-10 md:w-10 drop-shadow-[0_12px_14px_rgba(0,0,0,0.28)]" aria-hidden="true">
          <Image src={rectangle52} alt="" fill sizes="40px" className="rounded-[28%] object-contain" />
        </div>
        <div className="cta-bouncer cta-bouncer-two absolute left-0 top-0 z-30 h-8 w-8 md:h-10 md:w-10 drop-shadow-[0_12px_14px_rgba(0,0,0,0.28)]" aria-hidden="true">
          <Image src={rectangle53} alt="" fill sizes="40px" className="rounded-[28%] object-contain" />
        </div>
        <div className="cta-bouncer cta-bouncer-three absolute left-0 top-0 z-30 h-8 w-8 md:h-10 md:w-10 drop-shadow-[0_12px_14px_rgba(0,0,0,0.28)]" aria-hidden="true">
          <Image src={rectangle54} alt="" fill sizes="40px" className="rounded-[28%] object-contain" />
        </div>
      </div>

      {/* Content layer — brand / phone mockup / heading+description, no card behind them */}
      <div className="content-group absolute inset-0 z-20 flex items-center justify-center pointer-events-none gsap-reveal" style={{ perspective: "1500px" }}>
        <div className="relative w-full h-full max-w-[90rem] mx-auto px-4 lg:px-12 flex flex-col justify-evenly lg:grid lg:grid-cols-3 items-center lg:gap-8 py-6 lg:py-0 pointer-events-auto">

          <div className="card-right-text gsap-reveal order-1 lg:order-3 flex justify-center lg:justify-end z-20 w-full" />

          <div className="mockup-scroll-wrapper order-2 lg:order-2 relative w-full h-95 lg:h-150 flex items-center justify-center z-10" style={{ perspective: "1000px" }}>
            <div className="relative w-full h-full flex items-center justify-center transform scale-[0.65] md:scale-85 lg:scale-100">
              {phoneMockup}
              {badges}
            </div>
          </div>

          <div className="card-left-text gsap-reveal order-3 lg:order-1 flex flex-col justify-center text-center lg:text-left z-20 w-full lg:max-w-none px-4 lg:px-0">
            <h3 className="text-on-surface text-2xl md:text-3xl lg:text-4xl font-bold mb-0 lg:mb-5 tracking-tight">
              {cardHeading}
            </h3>
            <p className="hidden md:block text-secondary text-sm md:text-base lg:text-lg font-normal leading-relaxed mx-auto lg:mx-0 max-w-[24rem] lg:max-w-none">
              {cardDescription}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
