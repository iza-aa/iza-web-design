"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PodiumIntroHero } from "@/components/portfolio/PodiumIntroHero";
import { ArchiveStageSection, ARCHIVE_ITEMS } from "@/components/portfolio/ArchiveStageSection";
import { RealAssetPreloader } from "@/components/portfolio/RealAssetPreloader";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const PUNCTUATION = [".", "?", "!"];

export default function HomePage() {
  const lenisRef = useRef<Lenis | null>(null);
  const masterContainerRef = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const isSection2ActiveRef = useRef(false);
  const isSuctionTriggeredRef = useRef(false);
  const suctionTweenRef = useRef<gsap.core.Tween | null>(null);

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loadingCount, setLoadingCount] = useState(100);
  const [puncIndex, setPuncIndex] = useState(0);

  const [scroll1Progress, setScroll1Progress] = useState(0);
  const [scroll1Pct, setScroll1Pct] = useState(0);
  const [cursorSuction, setCursorSuction] = useState(0);

  const [scroll2Progress, setScroll2Progress] = useState(0);
  const [scroll2Pct, setScroll2Pct] = useState(0);
  const [isSection2Active, setIsSection2Active] = useState(false);

  const [scroll3Progress, setScroll3Progress] = useState(0);
  const [scroll3Pct, setScroll3Pct] = useState(0);

  const scroll1ProgressRef = useRef(0);
  const scroll2ProgressRef = useRef(0);

  // Cycle punctuation: "IZA design." -> "IZA design?" -> "IZA design!"
  useEffect(() => {
    const id = setInterval(() => setPuncIndex((i) => (i + 1) % PUNCTUATION.length), 2200);
    return () => clearInterval(id);
  }, []);

  // Eagerly preload all Scroll 2 card images from superdesign.dev on page mount
  useEffect(() => {
    ARCHIVE_ITEMS.forEach((item) => {
      const img = new window.Image();
      img.src = item.imageUrl;
    });
  }, []);

  // Initialize Lenis Smooth Scrolling
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
    }

    const lenis = new Lenis({
      duration: 1.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.2,
      touchMultiplier: 2.0,
    });
    lenisRef.current = lenis;

    lenis.start();

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  // Strict initial lock: manage document overflow during loading
  useEffect(() => {
    if (!isUnlocked) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isUnlocked]);

  // Initial setup: Position Section 2 off-screen below (yPercent: 100)
  useEffect(() => {
    if (section2Ref.current) {
      gsap.set(section2Ref.current, { yPercent: 100 });
    }
  }, []);

  // Called when IZA logo finishes rotating to diagonal -45 deg
  const handleIntroReady = useCallback(() => {
    setIsUnlocked(true);
    if (lenisRef.current) {
      lenisRef.current.start();
    }
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
  }, []);

  const isSuctionLockedRef = useRef(false);

  // Strict scroll lock during 90% -> 100% vacuum suction animation
  useEffect(() => {
    const preventScrollWhileLocked = (e: WheelEvent | TouchEvent) => {
      if (isSuctionLockedRef.current) {
        e.preventDefault();
      }
    };
    window.addEventListener("wheel", preventScrollWhileLocked, { passive: false });
    window.addEventListener("touchmove", preventScrollWhileLocked, { passive: false });
    return () => {
      window.removeEventListener("wheel", preventScrollWhileLocked);
      window.removeEventListener("touchmove", preventScrollWhileLocked);
    };
  }, []);

  // Master Pinned ScrollTrigger across SCROLL 1, SCROLL 2 & SCROLL 3
  useEffect(() => {
    if (!isUnlocked || !masterContainerRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: masterContainerRef.current,
        start: "top top",
        end: "+=10500",
        pin: true,
        scrub: 1.0,
        onUpdate: (self) => {
          const totalP = self.progress;

          if (totalP < 0.33) {
            // ── PHASE 1: SCROLL 1 (0% -> 100%) ──
            const p1 = totalP / 0.33;

            if (p1 < 0.90) {
              if (isSuctionTriggeredRef.current) {
                isSuctionTriggeredRef.current = false;
                isSuctionLockedRef.current = false;
                suctionTweenRef.current?.kill();
                setCursorSuction(0.0);
              }
              const pct1 = Math.round(p1 * 100);
              setScroll1Progress(p1);
              setScroll1Pct(pct1);
              setCursorSuction(0.0);

              if (isSection2ActiveRef.current) {
                isSection2ActiveRef.current = false;
                setIsSection2Active(false);
                if (section2Ref.current) {
                  gsap.to(section2Ref.current, {
                    yPercent: 100,
                    duration: 0.6,
                    ease: "power2.inOut",
                    overwrite: "auto",
                  });
                }
              }
              setScroll2Progress(0);
              setScroll2Pct(0);
              setScroll3Progress(0);
              setScroll3Pct(0);
            } else {
              // Reached 90%: AUTO-TRIGGER DELIBERATE VACUUM SUCTION TWEEN (90% -> 100%)
              if (!isSuctionTriggeredRef.current) {
                isSuctionTriggeredRef.current = true;
                isSuctionLockedRef.current = true;
                lenisRef.current?.stop();

                const suctionObj = { val: 0.0 };
                suctionTweenRef.current = gsap.to(suctionObj, {
                  val: 1.0,
                  duration: 2.2,
                  ease: "power2.inOut",
                  onUpdate: () => {
                    setCursorSuction(suctionObj.val);
                    const animatedPct = Math.min(100, Math.round(90 + suctionObj.val * 10));
                    setScroll1Pct(animatedPct);
                    setScroll1Progress(0.90 + suctionObj.val * 0.10);
                  },
                  onComplete: () => {
                    isSection2ActiveRef.current = true;
                    setIsSection2Active(true);
                    setScroll1Progress(1.0);
                    setScroll1Pct(100);
                    setCursorSuction(1.0);

                    if (section2Ref.current) {
                      gsap.to(section2Ref.current, {
                        yPercent: 0,
                        duration: 0.75,
                        ease: "power3.out",
                        overwrite: "auto",
                        onComplete: () => {
                          isSuctionLockedRef.current = false;
                          lenisRef.current?.scrollTo(2600, { immediate: true });
                          lenisRef.current?.start();
                          ScrollTrigger.refresh();
                        },
                      });
                    } else {
                      isSuctionLockedRef.current = false;
                      lenisRef.current?.scrollTo(2600, { immediate: true });
                      lenisRef.current?.start();
                      ScrollTrigger.refresh();
                    }
                  },
                });
              }
            }
          } else if (totalP < 0.66) {
            // ── PHASE 2: SCROLL 2 ACTIVE (0% -> 100%) ──
            const p2 = Math.max(0, Math.min(1.0, (totalP - 0.33) / 0.33));
            const pct2 = Math.round(p2 * 100);

            setScroll1Progress(1.0);
            setScroll1Pct(100);
            setCursorSuction(1.0);

            if (!isSection2ActiveRef.current) {
              isSection2ActiveRef.current = true;
              setIsSection2Active(true);
              if (section2Ref.current) {
                gsap.to(section2Ref.current, {
                  yPercent: 0,
                  duration: 0.8,
                  ease: "power3.out",
                  overwrite: "auto",
                });
              }
            }

            setScroll2Progress(p2);
            setScroll2Pct(pct2);
            setScroll3Progress(0);
            setScroll3Pct(0);
          } else {
            // ── PHASE 3: SCROLL 3 (Studio Wall -> 3D Flip to 100% Footer) ──
            const p3 = Math.max(0, Math.min(1.0, (totalP - 0.66) / 0.34));
            const pct3 = Math.round(p3 * 100);

            if (scroll1ProgressRef.current !== 1.0) {
              scroll1ProgressRef.current = 1.0;
              setScroll1Progress(1.0);
              setScroll1Pct(100);
            }
            if (scroll2ProgressRef.current !== 1.0) {
              scroll2ProgressRef.current = 1.0;
              setScroll2Progress(1.0);
              setScroll2Pct(100);
            }

            setScroll3Progress(p3);
            setScroll3Pct(pct3);
          }
        },
      });
    }, masterContainerRef);

    return () => ctx.revert();
  }, [isUnlocked]);

  const handleLoadComplete = useCallback(() => {
    setIsUnlocked(true);
    if (lenisRef.current) {
      lenisRef.current.start();
    }
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
  }, []);

  // If background flooded white (Scroll 3 >= 70%), use dark logo for high contrast
  const isWhiteBgTheme = !isSection2Active || scroll3Pct >= 70;

  return (
    <div className="relative w-full bg-black text-white selection:bg-white selection:text-black">
      {/* ── REAL ASSET PRELOADER (Top-Right: 1% -> 100% Bold Instrument Serif) ── */}
      <RealAssetPreloader
        onLoadComplete={handleLoadComplete}
        isWhiteTheme={isWhiteBgTheme}
      />

      {/* ── MASTER PINNED STAGE (GSAP Pin Container) ── */}
      <div
        ref={masterContainerRef}
        className="relative h-screen w-full overflow-hidden bg-black select-none"
      >
        {/* Layer 1: PodiumIntroHero (WebGL Canvas + Bottom Tagline) */}
        <div
          className="absolute inset-0 z-10 transition-opacity duration-300"
          style={{
            opacity: isSection2Active && scroll2Pct > 10 ? 0 : 1,
            pointerEvents: isSection2Active && scroll2Pct > 10 ? "none" : "auto",
          }}
        >
          <PodiumIntroHero
            hideTopBar={true}
            onIntroReady={handleIntroReady}
            onLoadingCount={setLoadingCount}
            scrollProgress={scroll1Progress}
            cursorSuction={cursorSuction}
            onScrollProgress={(p) => {
              setScroll1Pct(Math.round(p * 100));
            }}
          />
        </div>

        {/* Layer 2: Section 2 & 3 */}
        <div
          ref={section2Ref}
          className="absolute inset-0 z-30 flex flex-col bg-black overflow-hidden pointer-events-auto"
        >
          <ArchiveStageSection
            progress={scroll2Progress}
            scroll3Progress={scroll3Progress}
            onBackToTop={() => {
              lenisRef.current?.scrollTo(0, { immediate: false, duration: 2.2 });
            }}
          />
        </div>
      </div>
    </div>
  );
}
