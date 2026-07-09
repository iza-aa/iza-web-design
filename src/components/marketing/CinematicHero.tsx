"use client";

import React, { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PlasmaLogoMark } from "@/components/marketing/PlasmaLogoMark";
import callMeHandEmoji from "@/assets/emoji/call-me-hand_1f919.png";
import beamingFaceEmoji from "@/assets/emoji/beaming-face-with-smiling-eyes_1f601.png";

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

  /* Glow + diagonal sheen only appear on hover; leaving reverses the same
     CSS transition, so the sheen sweeps back the way it came instead of
     just snapping off. */
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
  .cinematic-glow-pill:hover {
      transform: translateY(-2px);
      box-shadow:
          0 2px 4px rgba(0,0,0,0.4),
          0 12px 28px -4px rgba(59,130,246,0.45),
          0 0 44px 8px rgba(59,130,246,0.35),
          0 22px 44px -10px rgba(0,0,0,0.55);
  }
  .cinematic-glow-pill:hover::before {
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
  const gsapCtxRef = useRef<gsap.Context | null>(null);
  const reduced = useReducedMotion();
  const router = useRouter();

  // Navigate away by killing ScrollTrigger's pin-spacer *before* Next.js
  // unmounts this page — don't rely on the effect cleanup's timing (see the
  // useLayoutEffect comment below for why relying on unmount ordering alone
  // wasn't reliable enough in practice).
  const navigate = (href: string) => {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    gsapCtxRef.current?.revert();
    router.push(href);
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

    const ctx = gsap.context(() => {
      gsap.set(".text-track", { autoAlpha: 0, y: 60, scale: 0.85, filter: "blur(20px)", rotationX: -20 });
      gsap.set(".text-days", { autoAlpha: 1, clipPath: "inset(0 100% 0 0)" });
      gsap.set(".content-group", { autoAlpha: 0, scale: 0.92 });
      gsap.set([".card-left-text", ".card-right-text", ".mockup-scroll-wrapper", ".floating-badge", ".flow-marker", ".live-notif"], { autoAlpha: 0 });
      gsap.set(".tagline3", { autoAlpha: 0, y: 30 });
      gsap.set(".chat-mock", { height: 40, borderRadius: 20 });
      gsap.set([".chat-typed-row", ".chat-toolbar-row"], { autoAlpha: 0 });
      gsap.set(".chat-action-glow", { autoAlpha: 0, scale: 0.6 });
      gsap.set(".chat-typed-text", { text: "" });
      gsap.set(".cta-wrapper", { autoAlpha: 0, scale: 0.8, filter: "blur(30px)" });
      gsap.set(".cta-heading, .cta-description, .cta-buttons", { autoAlpha: 0, y: 24 });

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
        // 4. Content layer exits fully before the CTA section's own text
        // fades in — arriving at this section is what reveals its copy,
        // not a simultaneous cross-fade with the layer above.
        .to([".mockup-scroll-wrapper", ".floating-badge", ".card-left-text", ".card-right-text"], {
          scale: 0.9, y: -40, z: -200, autoAlpha: 0, ease: "power3.in", duration: 1.2, stagger: 0.05,
        })
        .set(".content-group", { autoAlpha: 0 })
        .set(".cta-wrapper", { autoAlpha: 1, scale: 1, filter: "blur(0px)" })
        .to(".cinematic-bg-grid", { scale: 1, filter: "blur(0px)", opacity: 0.5, ease: "power2.out", duration: 1.2 }, "<")
        .fromTo(".cta-heading", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, ease: "power3.out", duration: 1 }, "+=0.2")
        .fromTo(".cta-description", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, ease: "power3.out", duration: 1 }, "-=0.6")
        .fromTo(".cta-buttons", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, ease: "power3.out", duration: 1 }, "-=0.6")
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
      ctx.revert();
    };
  }, [chatPrompt, reduced]);

  const phoneMockup = (
    <div className="relative w-[280px] h-[580px] rounded-[3rem] cinematic-iphone-bezel flex flex-col will-change-transform" style={{ transformStyle: "preserve-3d" }} ref={reduced ? undefined : mockupRef}>
      <div className="absolute top-[120px] -left-[3px] w-[3px] h-[25px] cinematic-hardware-btn rounded-l-md z-0" aria-hidden="true" />
      <div className="absolute top-[160px] -left-[3px] w-[3px] h-[45px] cinematic-hardware-btn rounded-l-md z-0" aria-hidden="true" />
      <div className="absolute top-[220px] -left-[3px] w-[3px] h-[45px] cinematic-hardware-btn rounded-l-md z-0" aria-hidden="true" />
      <div className="absolute top-[170px] -right-[3px] w-[3px] h-[70px] cinematic-hardware-btn rounded-r-md z-0 scale-x-[-1]" aria-hidden="true" />

      <div className="absolute inset-[7px] bg-[#050914] rounded-[2.5rem] overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,1)] text-white z-10">
        <div className="absolute inset-0 cinematic-screen-glare z-40 pointer-events-none" aria-hidden="true" />

        <div className="absolute top-[5px] left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-50 flex items-center justify-end px-3 shadow-[inset_0_-1px_2px_rgba(255,255,255,0.1)]">
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
                  <span className="inline-block w-[2px] h-3 bg-blue-400 ml-0.5 shrink-0" aria-hidden="true" />
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

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[120px] h-[4px] bg-white/20 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
        </div>
      </div>
    </div>
  );

  const badges = (
    <>
      <div className="floating-badge absolute flex top-6 lg:top-12 left-[-15px] lg:left-[-80px] cinematic-floating-badge rounded-xl lg:rounded-2xl p-3 lg:p-4 items-center gap-3 lg:gap-4 z-30">
        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-b from-blue-500/20 to-blue-900/10 flex items-center justify-center border border-blue-400/30 shadow-inner">
          <Image src={callMeHandEmoji} alt="" width={20} height={20} className="h-4 w-4 lg:h-5 lg:w-5 drop-shadow-lg" />
        </div>
        <div>
          <p className="text-white text-xs lg:text-sm font-bold tracking-tight">{badge1Title}</p>
          <p className="text-blue-200/50 text-[10px] lg:text-xs font-medium">{badge1Sub}</p>
        </div>
      </div>

      <div className="floating-badge absolute flex bottom-12 lg:bottom-20 right-[-15px] lg:right-[-80px] cinematic-floating-badge rounded-xl lg:rounded-2xl p-3 lg:p-4 items-center gap-3 lg:gap-4 z-30">
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
        onClick={() => navigate("/work")}
        className="cinematic-glow-pill inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
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

          <div className="relative w-full h-[420px] flex items-center justify-center" style={{ perspective: "1000px" }}>
            <div className="relative w-full h-full flex items-center justify-center transform scale-[0.7]">
              {phoneMockup}
              {badges}
            </div>
          </div>

          <div className="flex justify-center lg:justify-end w-full">
            <PlasmaLogoMark className="w-48 md:w-64" alt={brandName} />
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

      {/* CTA layer */}
      <div className="cta-wrapper absolute z-10 flex flex-col items-center justify-center text-center w-screen px-4 gsap-reveal pointer-events-auto will-change-transform">
        <h2 className="cta-heading text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight cinematic-text-silver">
          {ctaHeading}
        </h2>
        <p className="cta-description text-secondary text-lg md:text-xl mb-12 max-w-[36rem] mx-auto font-light leading-relaxed">
          {ctaDescription}
        </p>
        <div className="cta-buttons">{ctaButtons}</div>
      </div>

      {/* Content layer — brand / phone mockup / heading+description, no card behind them */}
      <div className="content-group absolute inset-0 z-20 flex items-center justify-center pointer-events-none gsap-reveal" style={{ perspective: "1500px" }}>
        <div className="relative w-full h-full max-w-[90rem] mx-auto px-4 lg:px-12 flex flex-col justify-evenly lg:grid lg:grid-cols-3 items-center lg:gap-8 py-6 lg:py-0 pointer-events-auto">

          <div className="card-right-text gsap-reveal order-1 lg:order-3 flex justify-center lg:justify-end z-20 w-full">
            <PlasmaLogoMark className="w-56 md:w-80 lg:w-96" alt={brandName} />
          </div>

          <div className="mockup-scroll-wrapper order-2 lg:order-2 relative w-full h-[380px] lg:h-[600px] flex items-center justify-center z-10" style={{ perspective: "1000px" }}>
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
