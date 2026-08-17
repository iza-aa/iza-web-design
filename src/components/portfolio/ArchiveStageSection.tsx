"use client";

import React, { useEffect } from "react";
import { SportsStoriesSection } from "./SportsStoriesSection";
import { BrandFooterSection } from "./BrandFooterSection";
import asset1 from "@/assets/project/asset-1.png";

export interface ArchiveCardItem {
  id: string;
  title: string;
  year: string;
  client: string;
  imageUrl: string;
}

export const ARCHIVE_ITEMS: ArchiveCardItem[] = [
  {
    id: "high-contrast-landing",
    title: "HIGH CONTRAST",
    year: "2026",
    client: "SUPERDESIGN DEV",
    imageUrl: "https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/preview-artifacts/prompt-library/36133045-75cc-4611-bdbb-0ec16bdc76fd/thumbnails/87ff6929-9218-400c-8e53-29de4297f821.png",
  },
  {
    id: "travelling-product",
    title: "TRAVELLING PRODUCT",
    year: "2026",
    client: "SUPERDESIGN DEV",
    imageUrl: "https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/preview-artifacts/prompt-library/7d97ebb3-363d-49d3-a029-fa9a23815e3f/thumbnails/aa1509da-deb0-4bef-bc77-8e2ef1c33207.gif",
  },
  {
    id: "tubes-interactive",
    title: "TUBES INTERACTIVE",
    year: "2025",
    client: "GLSL / CANVAS",
    imageUrl: "https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/screenshots/components/070b9477-5ebf-41b4-ab04-9b4d4975e984/79f658a0-893a-4705-8427-831d1091c385/1767688413116.png",
  },
  {
    id: "ascii-hero",
    title: "ASCII HERO",
    year: "2026",
    client: "SHADERS / EXPERIMENTAL",
    imageUrl: "https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/screenshots/drafts/d0848987-0c46-4d26-9e88-a652fee697e1/1785721008007.png",
  },
  {
    id: "aurora-developer",
    title: "AURORA DEV",
    year: "2026",
    client: "SYSTEMS / WEB",
    imageUrl: "https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/preview-artifacts/prompt-library/7d97ebb3-363d-49d3-a029-fa9a23815e3f/thumbnails/24a01df1-b0e3-4dc4-afd3-900830e2dd75.png",
  },
  {
    id: "softly-wellness",
    title: "SOFTLY APP",
    year: "2025",
    client: "PRODUCT / INTERACTION",
    imageUrl: "https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/preview-artifacts/prompt-library/efa2aaa5-0358-40b7-b524-ba300874c206/thumbnails/f8bde81c-e9f4-40df-8791-4f4ad81e977d.png",
  },
  {
    id: "brutalist-commerce",
    title: "BRUTALIST E-COM",
    year: "2026",
    client: "TYPOGRAPHIC STORE",
    imageUrl: "https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/screenshots/drafts/da34d4ac-cb7e-4391-af07-ec9085970f46/1770867822164.png",
  },
  {
    id: "iza-studio",
    title: "IZA STUDIO",
    year: "2026",
    client: "CREATIVE STUDIO",
    imageUrl: asset1.src,
  },
];

// ── FIXED BACKGROUND GIANT TYPOGRAPHY: "CHOOSE THE DESIGN" ──
// Sits behind the cards in Scroll 2 and dissolves letters randomly before progress 0.45
const CHOOSE_LETTERS = ["C", "H", "O", "O", "S", "E"];
const DESIGN_LETTERS = [
  { char: "T", id: "des-t-0" },
  { char: "H", id: "des-h-1" },
  { char: "E", id: "des-e-2" },
  { char: " ", id: "des-sp-3" },
  { char: "D", id: "des-d-4" },
  { char: "E", id: "des-e-5" },
  { char: "S", id: "des-s-6" },
  { char: "I", id: "des-i-7" },
  { char: "G", id: "des-g-8" },
  { char: "N", id: "des-n-9" },
];

// Deterministic random threshold for each letter between 0.12 and 0.44 scroll2 progress
const LETTER_THRESHOLDS: Record<string, number> = {
  // CHOOSE
  "c-0": 0.32,
  "h-1": 0.18,
  "o-2": 0.42,
  "o-3": 0.24,
  "s-4": 0.36,
  "e-5": 0.14,
  // THE DESIGN
  "des-t-0": 0.28,
  "des-h-1": 0.44,
  "des-e-2": 0.19,
  "des-d-4": 0.39,
  "des-e-5": 0.15,
  "des-s-6": 0.31,
  "des-i-7": 0.45,
  "des-g-8": 0.21,
  "des-n-9": 0.35,
};

function getCharStyle(progress: number, id: string): React.CSSProperties {
  const threshold = LETTER_THRESHOLDS[id] ?? 0.30;
  if (progress <= threshold - 0.05) {
    return {
      opacity: 1,
      transform: "translate3d(0, 0, 0)",
      willChange: "opacity, transform",
      WebkitBackfaceVisibility: "hidden",
      backfaceVisibility: "hidden",
    };
  }
  if (progress >= threshold) {
    return {
      opacity: 0,
      transform: "translate3d(0, -6px, 0)",
      willChange: "opacity, transform",
      WebkitBackfaceVisibility: "hidden",
      backfaceVisibility: "hidden",
      pointerEvents: "none",
    };
  }
  const factor = (threshold - progress) / 0.05; // 1.0 -> 0.0
  const y = (1.0 - factor) * -6;
  return {
    opacity: factor,
    transform: `translate3d(0, ${y.toFixed(2)}px, 0)`,
    willChange: "opacity, transform",
    WebkitBackfaceVisibility: "hidden",
    backfaceVisibility: "hidden",
  };
}

function BackgroundChooseTypography({ progress }: { progress: number }) {
  if (progress >= 0.45) return null;

  return (
    <div className="fixed inset-0 z-0 flex flex-col items-center justify-center pointer-events-none select-none px-4 sm:px-8">
      <div className="flex flex-col items-center justify-center w-full max-w-[1600px] mx-auto text-center">
        {/* Line 1: CHOOSE (Bold Sans) */}
        <div className="font-sans font-black uppercase text-white tracking-[-0.04em] text-[15vw] sm:text-[17vw] lg:text-[180px] xl:text-[220px] 2xl:text-[250px] leading-[0.80] flex justify-center items-center">
          {CHOOSE_LETTERS.map((char, index) => {
            const id = `${char.toLowerCase()}-${index}`;
            return (
              <span
                key={id}
                className="inline-block will-change-transform"
                style={getCharStyle(progress, id)}
              >
                {char}
              </span>
            );
          })}
        </div>

        {/* Line 2: THE DESIGN (Instrument Serif) */}
        <div className="font-serif italic font-normal uppercase text-white tracking-[-0.01em] text-[15vw] sm:text-[17vw] lg:text-[180px] xl:text-[220px] 2xl:text-[250px] leading-[0.80] mt-[-2vw] sm:mt-[-1.5vw] lg:mt-[-15px] flex justify-center items-center">
          {DESIGN_LETTERS.map((item) => {
            if (item.char === " ") {
              return <span key={item.id} className="inline-block w-[0.25em]">&nbsp;</span>;
            }
            return (
              <span
                key={item.id}
                className="inline-block will-change-transform"
                style={getCharStyle(progress, item.id)}
              >
                {item.char}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getCardFade(cardIndex: number, progress: number) {
  if (progress < 0.72) return undefined;
  if (cardIndex === 7) {
    const p = Math.max(0, Math.min(1.0, (progress - 0.72) / 0.05));
    return {
      opacity: Math.max(0, 1.0 - p),
      scale: 1.0,
      blur: 0,
    };
  }
  const staggerStart = 0.72 + (cardIndex % 7) * 0.018;
  const p = Math.max(0, Math.min(1.0, (progress - staggerStart) / 0.08));
  return {
    opacity: Math.max(0, 1.0 - p),
    scale: 1.0 - p * 0.12,
    blur: p * 8,
  };
}

export interface ArchiveStageSectionProps {
  progress: number; // SCROLL 2 progress (0.0 to 1.0)
  scroll3Progress?: number; // SCROLL 3 progress (0.0 to 1.0)
  onBackToTop?: () => void;
}

export function ArchiveStageSection({
  progress,
  scroll3Progress = 0,
  onBackToTop,
}: ArchiveStageSectionProps) {
  // Preload all superdesign card images immediately on mount
  useEffect(() => {
    ARCHIVE_ITEMS.forEach((item) => {
      const img = new Image();
      img.src = item.imageUrl;
    });
  }, []);

  const p2 = progress > 1.0 ? Math.max(0, Math.min(100, progress)) / 100 : Math.max(0, Math.min(1.0, progress));
  const p3 = scroll3Progress > 1.0 ? Math.max(0, Math.min(100, scroll3Progress)) / 100 : Math.max(0, Math.min(1.0, scroll3Progress));

  // 1. SCROLL 2: Parallax scroll between 0% and 75%
  const normScroll = Math.min(1.0, p2 / 0.75);
  const fastTranslateY = 28 - normScroll * 88; // +28vh -> -60vh
  const slowTranslateY = 45 - normScroll * 83; // +45vh -> -38vh

  // Cards 0-7 fade out sequentially between 72% and 88% (Scroll 2):
  const card0Fade = getCardFade(0, p2);
  const card1Fade = getCardFade(1, p2);
  const card2Fade = getCardFade(2, p2);
  const card3Fade = getCardFade(3, p2);
  const card4Fade = getCardFade(4, p2);
  const card5Fade = getCardFade(5, p2);
  const card6Fade = getCardFade(6, p2);
  const card7Fade = getCardFade(7, p2);

  // ── SCROLL 2: CINEMATIC KPRVERSE-STYLE SLANTED 3D FLIP & FULLSCREEN EXPANSION (72% -> 100%) ──
  const isFlipping = p2 >= 0.72;
  const flipProgress = isFlipping ? Math.max(0, Math.min(1.0, (p2 - 0.72) / 0.28)) : 0;
  const easedFlip = flipProgress * flipProgress * (3.0 - 2.0 * flipProgress);

  const currentTransX = (1.0 - easedFlip) * 37.0; // 37.0vw -> 0vw
  const currentTransY = (1.0 - easedFlip) * (slowTranslateY + 12.8); // Column 4 Card 7 -> 0vh center
  const baseScale = 0.235 + easedFlip * (1.0 - 0.235); // 0.235 -> 1.0 (Full HD!)

  // ── SCROLL 3 PHASE 1: INTERNAL SCROLL DOWN THE STUDIO WALL (0% -> 82%) ──
  const internalScrollProgress = Math.min(1.0, p3 / 0.82);

  // ── SCROLL 3 PHASE 2: 3D SLANTED GYROSCOPIC FLIP TO BRAND FOOTER (82% -> 100%) (FULL 360 DEG FLIP) ──
  const isSecondFlip = p3 >= 0.82;
  const secondFlipP = isSecondFlip ? Math.max(0, Math.min(1.0, (p3 - 0.82) / 0.18)) : 0;
  const easedSecondFlip = secondFlipP * secondFlipP * (3.0 - 2.0 * secondFlipP);

  // Scale stays 1.0 full screen in Scroll 3 (no miniature card shrink)
  const currentScale = baseScale;

  // Rotation Y: 0 -> 180 (Scroll 2) -> 360 (Scroll 3 to Footer 100%)
  const rotateYTotal = easedFlip * 180 + easedSecondFlip * 180;

  // Unified 3D Pitch (RotateX): Arcs up to 22deg forward tilt during flip, flat 0deg when settled
  let currentRotateX = 0;
  if (isFlipping && p3 === 0) {
    currentRotateX = Math.sin(easedFlip * Math.PI) * 22.0;
  } else if (isSecondFlip) {
    currentRotateX = Math.sin(easedSecondFlip * Math.PI) * 22.0;
  }

  // Unified 3D Depth (TranslateZ): Lifts towards viewer by +240px at 90deg, lands at 0px
  let currentTransZ = 0;
  if (isFlipping && p3 === 0) {
    currentTransZ = Math.sin(easedFlip * Math.PI) * 240.0;
  } else if (isSecondFlip) {
    currentTransZ = Math.sin(easedSecondFlip * Math.PI) * 240.0;
  }

  // Unified 3D Kinetic Roll (RotateZ)
  let currentRotateZ = 0;
  if (isFlipping && p3 === 0) {
    currentRotateZ = Math.sin(easedFlip * Math.PI) * -3.5;
  } else if (isSecondFlip) {
    currentRotateZ = Math.sin(easedSecondFlip * Math.PI) * -3.5;
  }

  // All cards are strictly sharp brutalist rectilinear (rounded-none, 0px border-radius)
  const currentBorderRadius = 0;

  return (
    <div className="relative w-full h-full min-h-screen bg-black overflow-hidden select-none px-4 sm:px-6 md:px-8 pt-20 pb-32">
      {/* ── FIXED BACKGROUND GIANT TYPOGRAPHY WITH RANDOM LETTER DISSOLUTION (SCROLL 2: 0% -> 45%) ── */}
      <BackgroundChooseTypography progress={p2} />

      {/* ── 4-COLUMN ASYMMETRICAL PARALLAX GRID (SCROLL 2) ── */}
      <div
        className={`relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 lg:gap-8 h-full max-w-[1720px] mx-auto items-start ${
          isFlipping ? "pointer-events-none" : "pointer-events-auto"
        }`}
      >
        {/* COLUMN 1 (FAST) */}
        <div
          className="flex flex-col gap-10 sm:gap-14 will-change-transform"
          style={{ transform: `translate3d(0, ${fastTranslateY}vh, 0)` }}
        >
          <ArchiveCard item={ARCHIVE_ITEMS[0]} fade={card0Fade} />
          <ArchiveCard item={ARCHIVE_ITEMS[1]} fade={card1Fade} />
        </div>

        {/* COLUMN 2 (SLOW - STAGGERED OFFSET) */}
        <div
          className="flex flex-col gap-10 sm:gap-14 will-change-transform pt-12 sm:pt-20"
          style={{ transform: `translate3d(0, ${slowTranslateY}vh, 0)` }}
        >
          <ArchiveCard item={ARCHIVE_ITEMS[2]} fade={card2Fade} />
          <ArchiveCard item={ARCHIVE_ITEMS[3]} fade={card3Fade} />
        </div>

        {/* COLUMN 3 (FAST) */}
        <div
          className="flex flex-col gap-10 sm:gap-14 will-change-transform"
          style={{ transform: `translate3d(0, ${fastTranslateY}vh, 0)` }}
        >
          <ArchiveCard item={ARCHIVE_ITEMS[4]} fade={card4Fade} />
          <ArchiveCard item={ARCHIVE_ITEMS[5]} fade={card5Fade} />
        </div>

        {/* COLUMN 4 (SLOW - STAGGERED OFFSET) */}
        <div
          className="flex flex-col gap-10 sm:gap-14 will-change-transform pt-8 sm:pt-14"
          style={{ transform: `translate3d(0, ${slowTranslateY}vh, 0)` }}
        >
          <ArchiveCard item={ARCHIVE_ITEMS[6]} fade={card6Fade} />
          {/* Card 7 Space Reserved for Unified 3D Card */}
          <div className="w-full aspect-[4/3] sm:aspect-[16/11] opacity-0 pointer-events-none" />
          <div className="mt-3.5 h-4 opacity-0 pointer-events-none" />
        </div>
      </div>

      {/* ── UNIFIED 3D STAGE CONTAINER (Always present: scrolls with Column 4 -> zooms & flips at 72% -> CRT TV in Scroll 3 -> flips to Footer) ── */}
      <div
        className={`fixed inset-0 z-40 flex items-center justify-center p-0 ${
          isFlipping ? "pointer-events-auto" : "pointer-events-none"
        }`}
        style={{
          perspective: "1400px",
          perspectiveOrigin: "50% 25%", // Elevated camera eye level (looking slightly down)
        }}
      >
        <div
          className="relative w-full h-full max-w-none will-change-transform pointer-events-auto"
          style={{
            transformStyle: "preserve-3d",
            transform: `translate3d(${currentTransX}vw, ${currentTransY}vh, ${currentTransZ}px) scale(${currentScale}) rotateX(${currentRotateX}deg) rotateY(${rotateYTotal}deg) rotateZ(${currentRotateZ}deg)`,
          }}
        >
          {/* ── SIDE A (0 deg / 360 deg / Front Face): Card 7 in Scroll 2 -> Brand Footer in Scroll 3 ── */}
          <div
            className="absolute inset-0 w-full h-full overflow-hidden bg-black text-white flex items-center justify-center rounded-none pointer-events-auto shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
            style={{
              transform: "rotateY(0deg) translateZ(1px)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              borderRadius: "0px",
            }}
          >
            {p3 < 0.70 ? (
              <img
                src={ARCHIVE_ITEMS[7].imageUrl}
                alt={ARCHIVE_ITEMS[7].title}
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover object-center"
              />
            ) : (
              // When flipping to Footer, Side A displays the full interactive BrandFooterSection!
              <div className="w-full h-full bg-black pointer-events-auto">
                <BrandFooterSection progress={secondFlipP} onBackToTop={onBackToTop} />
              </div>
            )}
          </div>

          {/* ── SIDE A DIRECT CAPTION (Attached directly to Front Face) ── */}
          {p3 < 0.65 && !isFlipping && (
            <div
              className="absolute -bottom-24 sm:-bottom-28 left-0 right-0 flex items-center justify-between gap-4 px-2 text-white select-none pointer-events-none transition-opacity duration-150"
              style={{
                transform: "rotateY(0deg) translateZ(2px)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                opacity: Math.max(0, 1.0 - (p2 >= 0.72 ? (p2 - 0.72) / 0.06 : 0)),
              }}
            >
              <h3 className="font-sans text-[48px] sm:text-[54px] font-black tracking-tight text-white uppercase truncate flex-shrink min-w-0">
                {ARCHIVE_ITEMS[7].title}
              </h3>
              <div className="flex items-center gap-3 font-mono text-[36px] sm:text-[40px] text-zinc-400 whitespace-nowrap flex-shrink-0">
                <span className="font-semibold text-zinc-300 uppercase tracking-wider">{ARCHIVE_ITEMS[7].client}</span>
                <span className="text-zinc-600">/</span>
                <span>{ARCHIVE_ITEMS[7].year}</span>
              </div>
            </div>
          )}

          {/* ── SIDE B (180 deg / Back Face): Scroll 3 White Studio Wall ── */}
          <div
            className="absolute inset-0 w-full h-full overflow-hidden bg-white text-black shadow-[0_30px_70px_-20px_rgba(255,255,255,0.12)] border-0 rounded-none pointer-events-auto"
            style={{
              transform: "rotateY(180deg) translateZ(1px)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              borderRadius: "0px",
            }}
          >
            {/* Native Ultra-HD Section 3 Component with GPU-Accelerated Smooth Internal Scrolling */}
            <div className="w-full h-full bg-white pointer-events-auto">
              <SportsStoriesSection scrollProgress={internalScrollProgress} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── COMPONENT: INDIVIDUAL ARCHIVE CARD ──
interface ArchiveCardProps {
  item: ArchiveCardItem;
  fade?: { opacity: number; blur: number; scale: number };
}

const ArchiveCard = React.memo(function ArchiveCard({ item, fade }: ArchiveCardProps) {
  const cardOpacity = fade ? fade.opacity : 1;
  const cardScale = fade ? fade.scale : 1;
  const captionOpacity = Math.max(0, (cardOpacity - 0.2) / 0.8);

  return (
    <div
      className="group flex flex-col w-full cursor-pointer will-change-transform"
      style={{
        opacity: cardOpacity,
        transform: `scale(${cardScale}) translateZ(0)`,
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] overflow-hidden bg-zinc-900 rounded-none border-0 shadow-lg">
        <img
          src={item.imageUrl}
          alt={item.title}
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover object-center group-hover:scale-105 group-hover:brightness-105 transition-all duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity duration-500" />
      </div>

      {/* Single Line Caption */}
      <div
        className="mt-3.5 flex items-center justify-between gap-2 px-0.5 min-w-0"
        style={{ opacity: captionOpacity }}
      >
        <h3 className="font-sans text-xs sm:text-sm md:text-[15px] font-black tracking-tight text-white uppercase group-hover:text-zinc-200 transition-colors truncate flex-shrink min-w-0">
          {item.title}
        </h3>
        <div className="flex items-center gap-1.5 font-mono text-[9px] sm:text-[10px] md:text-[11px] text-zinc-400 whitespace-nowrap flex-shrink-0">
          <span className="font-semibold text-zinc-300 uppercase tracking-wider">{item.client}</span>
          <span className="text-zinc-600">/</span>
          <span>{item.year}</span>
        </div>
      </div>
    </div>
  );
});
