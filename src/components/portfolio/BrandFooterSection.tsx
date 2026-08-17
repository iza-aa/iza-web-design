"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { PerspectiveWireframeGrid } from "./PerspectiveWireframeGrid";
import { FallingStickersLayer } from "./FallingStickersLayer";

interface BrandFooterSectionProps {
  progress?: number; // 0.0 to 1.0 (Scroll 3: 80% -> 100%)
  onBackToTop?: () => void;
}

const LINE1_TEXT = "LET'S BUILD";
const LINE2_TEXT = "SOMETHING";

// Deterministic Pseudo-Random Generator for consistent, organic chaotic reveal
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

interface PhysicsBody {
  el: HTMLSpanElement;
  initialX: number;
  initialY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  rotation: number;
  vRot: number;
  isFalling: boolean;
  isSettled: boolean;
}

export function BrandFooterSection({ progress = 1.0, onBackToTop }: BrandFooterSectionProps) {
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  const footerRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const hasTriggeredRef = useRef<boolean>(false);

  // ── TRIGGER REAL 2D RIGID BODY COLLISION & PILE SIMULATION ──
  const handleStartProjectClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (hasTriggeredRef.current || !footerRef.current) return;
    hasTriggeredRef.current = true;

    const letterEls = footerRef.current.querySelectorAll<HTMLSpanElement>("[data-letter='true']");
    if (!letterEls.length) {
      window.location.href = "/work";
      return;
    }

    setIsDropping(true);

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    // 1. Initialize Solid Physical Bodies for every character
    const bodies: PhysicsBody[] = [];
    const elementsArray = Array.from(letterEls);

    // Positioned behind button (z-20) so falling letters drop behind the z-50 button
    gsap.set(elementsArray, {
      position: "relative",
      zIndex: 20,
      clearProps: "transform",
    });

    elementsArray.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const initialX = rect.left + rect.width / 2;
      const initialY = rect.top + rect.height / 2;

      bodies.push({
        el,
        initialX,
        initialY,
        x: initialX,
        y: initialY,
        vx: 0,
        vy: 0,
        // Solid physical collision box (with padding so letters never touch or overlap)
        width: Math.max(16, rect.width + 4),
        height: Math.max(18, rect.height + 4),
        rotation: 0,
        vRot: (Math.random() - 0.5) * 0.05,
        isFalling: false,
        isSettled: false,
      });
    });

    // Sort by vertical position with slight random jitter so top rows fall first
    bodies.sort((a, b) => a.initialY - b.initialY + (Math.random() - 0.5) * 50);

    const totalBodies = bodies.length;
    let releasedCount = 0;
    let frame = 0;
    const totalFrames = 60 * 3.8; // ~3.8 seconds simulation
    let animId: number;

    // 2. High-Precision 60 FPS Physical Collision Resolution Loop
    const runPhysics = () => {
      frame++;

      // Release 2 letters per frame for a continuous 1-by-1 physical cascade
      const toRelease = Math.min(2, totalBodies - releasedCount);
      for (let i = 0; i < toRelease; i++) {
        const b = bodies[releasedCount];
        if (b) {
          b.isFalling = true;
          b.vx = (Math.random() - 0.5) * 1.5;
          b.vy = 0.5;
          b.vRot = (Math.random() - 0.5) * 0.08;
        }
        releasedCount++;
      }

      // Step gravity and velocity
      for (let i = 0; i < totalBodies; i++) {
        const b = bodies[i];
        if (!b.isFalling) continue;

        // Gravitational acceleration
        b.vy += 0.95;
        b.x += b.vx;
        b.y += b.vy;
        b.rotation += b.vRot * (180 / Math.PI);

        // Floor collision (Clamped firmly at bottom of screen)
        const floorY = screenH - 18 - b.height / 2;
        if (b.y >= floorY) {
          b.y = floorY;
          if (Math.abs(b.vy) > 1.8) {
            b.vy = -b.vy * 0.25; // Physical bounce
            b.vx *= 0.75;
            b.vRot *= 0.6;
          } else {
            b.vy = 0;
            b.vx *= 0.7;
            b.vRot *= 0.7;
          }
        }

        // Left and right viewport walls
        const minX = b.width / 2 + 12;
        const maxX = screenW - b.width / 2 - 12;
        if (b.x < minX) {
          b.x = minX;
          b.vx = Math.abs(b.vx) * 0.5;
        } else if (b.x > maxX) {
          b.x = maxX;
          b.vx = -Math.abs(b.vx) * 0.5;
        }
      }

      // ── MULTI-PASS RIGID BODY COLLISION RESOLUTION (ZERO OVERLAPPING) ──
      // Run 4 relaxation iterations per frame to guarantee solid physical boundaries
      for (let iter = 0; iter < 4; iter++) {
        for (let i = 0; i < totalBodies; i++) {
          const a = bodies[i];
          if (!a.isFalling) continue;

          for (let j = i + 1; j < totalBodies; j++) {
            const b = bodies[j];
            if (!b.isFalling) continue;

            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const minDistX = (a.width + b.width) / 2;
            const minDistY = (a.height + b.height) / 2;

            const overlapX = minDistX - Math.abs(dx);
            const overlapY = minDistY - Math.abs(dy);

            // If collision detected between two letters:
            if (overlapX > 0 && overlapY > 0) {
              // Resolve along shallowest axis
              if (overlapX < overlapY) {
                // Horizontal push apart
                const pushX = overlapX * 0.55;
                if (dx > 0) {
                  a.x += pushX;
                  b.x -= pushX;
                } else {
                  a.x -= pushX;
                  b.x += pushX;
                }
                const avgVx = (a.vx + b.vx) / 2;
                a.vx = avgVx + (dx > 0 ? 0.5 : -0.5);
                b.vx = avgVx + (dx > 0 ? -0.5 : 0.5);
              } else {
                // Vertical stacking collision (Letter sits on top of letter below)
                const pushY = overlapY * 0.6;
                if (dy < 0) {
                  // A is on top of B
                  a.y -= pushY;
                  a.vy = -Math.abs(a.vy) * 0.2;
                  // Natural deflection off shoulder
                  if (Math.abs(dx) > 3) {
                    a.vx += (dx > 0 ? 0.8 : -0.8);
                  }
                } else {
                  // B is on top of A
                  b.y -= pushY;
                  b.vy = -Math.abs(b.vy) * 0.2;
                  if (Math.abs(dx) > 3) {
                    b.vx += (dx < 0 ? 0.8 : -0.8);
                  }
                }
              }
            }
          }
        }
      }

      // Render physical transform directly to GPU via GSAP
      for (let i = 0; i < totalBodies; i++) {
        const b = bodies[i];
        if (!b.isFalling) continue;

        gsap.set(b.el, {
          x: b.x - b.initialX,
          y: b.y - b.initialY,
          rotation: b.rotation,
        });
      }

      if (frame < totalFrames) {
        animId = requestAnimationFrame(runPhysics);
      } else {
        // Physical pile settled: fade out and navigate cleanly to /work
        setIsFadingOut(true);
        setTimeout(() => {
          window.location.href = "/work";
        }, 350);
      }
    };

    animId = requestAnimationFrame(runPhysics);
  };

  const normP = Math.max(0, Math.min(1.0, progress));

  // Horizontal slide calculations:
  // Line 1: LET'S BUILD comes sliding in from the left (-65vw -> 0)
  const line1Progress = Math.max(0, Math.min(1.0, normP / 0.85));
  const easeLine1 = 1 - Math.pow(1 - line1Progress, 2.5);
  const line1TranslateX = (1 - easeLine1) * -65;
  const line1Opacity = Math.max(0, Math.min(1.0, normP * 2.0));

  // Line 2: SOMETHING comes sliding in from the right (+65vw -> 0)
  const line2Progress = Math.max(0, Math.min(1.0, normP / 0.85));
  const easeLine2 = 1 - Math.pow(1 - line2Progress, 2.5);
  const line2TranslateX = (1 - easeLine2) * 65;
  const line2Opacity = Math.max(0, Math.min(1.0, normP * 2.0));

  // Helper to render letter spans with physics data-attributes
  const renderPhysicalLetters = (text: string, customClass: string = "") => {
    return text.split("").map((char, idx) => {
      if (char === " ") {
        return <span key={idx} className="inline-block w-[0.28em]">&nbsp;</span>;
      }

      return (
        <span key={idx} className="inline-block overflow-visible py-0.5 pointer-events-none select-none">
          <span
            data-letter="true"
            className={`inline-block will-change-transform ${customClass}`}
          >
            {char}
          </span>
        </span>
      );
    });
  };

  return (
    <footer
      ref={footerRef}
      className={`relative w-full h-full min-h-screen max-h-screen bg-black text-white selection:bg-white selection:text-black font-sans overflow-hidden p-0 flex flex-col items-center justify-center select-none transition-opacity duration-300 ${
        isFadingOut ? "opacity-0" : "opacity-100"
      }`}
      style={{
        perspective: "1400px",
        perspectiveOrigin: "50% 25%",
      }}
    >
      {/* ── 3D PERSPECTIVE STAGE CONTAINER (Matches exact dramatic angle from screenshot) ── */}
      <div
        className="relative w-full h-full flex flex-col items-center justify-center overflow-visible will-change-transform pointer-events-auto"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(18deg) rotateY(-25deg) rotateZ(-3.5deg) scale(1.08) translateZ(50px)",
        }}
      >
        {/* ── INTERACTIVE PERSPECTIVE WIREFRAME GRID BACKGROUND (Tilted together with text & button) ── */}
        <PerspectiveWireframeGrid progress={progress} />

        {/* ── CONTINUOUS FLOATING STICKERS (RISING BOTTOM TO TOP) ── */}
        <FallingStickersLayer direction="up" isActive={progress > 0.05} />

        <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col items-center justify-center text-center gap-6 sm:gap-8 flex-1 h-full overflow-visible">
          {/* ── GIANT TYPOGRAPHY: "LET'S BUILD SOMETHING" (SLIDING IN FROM OPPOSITE SIDES) ── */}
          <div className="w-full flex flex-col items-center justify-center select-none text-center overflow-visible">
            {/* Line 1: LET'S BUILD (Slides in from Left) */}
            <div
              className="w-full flex justify-center items-center overflow-visible will-change-transform"
              style={
                isDropping
                  ? undefined
                  : {
                      transform: `translate3d(${line1TranslateX.toFixed(2)}vw, 0, 0)`,
                      opacity: line1Opacity,
                    }
              }
            >
              <h1 className="font-sans font-black uppercase text-white tracking-[-0.04em] text-[13vw] sm:text-[15vw] lg:text-[150px] xl:text-[180px] 2xl:text-[210px] leading-[0.80] flex flex-wrap justify-center items-center overflow-visible">
                {renderPhysicalLetters(LINE1_TEXT)}
              </h1>
            </div>

            {/* Line 2: SOMETHING (Slides in from Right) */}
            <div
              className="w-full flex justify-center items-center overflow-visible will-change-transform mt-[-2vw] sm:mt-[-1.5vw] lg:mt-[-12px]"
              style={
                isDropping
                  ? undefined
                  : {
                      transform: `translate3d(${line2TranslateX.toFixed(2)}vw, 0, 0)`,
                      opacity: line2Opacity,
                    }
              }
            >
              <h2 className="font-serif italic font-normal uppercase text-white tracking-[-0.01em] text-[13vw] sm:text-[15vw] lg:text-[150px] xl:text-[180px] 2xl:text-[210px] leading-[0.80] flex flex-wrap justify-center items-center overflow-visible">
                {renderPhysicalLetters(LINE2_TEXT)}
              </h2>
            </div>
          </div>

          {/* ── CENTERPIECE ACTION BUTTON (START A PROJECT - Directly Visible Forefront Layer z-50) ── */}
          <div
            className="flex justify-center items-center pt-2 sm:pt-4 will-change-transform relative z-50 pointer-events-auto opacity-100"
          >
            <a
              ref={buttonRef}
              href="/work"
              onClick={handleStartProjectClick}
              className="group relative z-50 inline-flex items-center justify-center gap-5 sm:gap-6 px-10 sm:px-12 py-5 sm:py-6 rounded-full bg-white text-black font-black text-sm sm:text-base tracking-widest uppercase hover:bg-zinc-100 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.18)] hover:shadow-[0_0_70px_rgba(255,255,255,0.35)] hover:scale-105 active:scale-95 cursor-pointer pointer-events-auto border border-white/20"
            >
              <span className="relative z-10 font-mono tracking-wider">START A PROJECT</span>
              <span className="relative z-10 w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold text-base group-hover:translate-x-1 group-hover:-rotate-45 transition-transform duration-300">
                ↗
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
