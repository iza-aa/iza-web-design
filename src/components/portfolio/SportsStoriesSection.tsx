"use client";

import React, { useState, useRef, useEffect } from "react";
import { FallingStickersLayer } from "./FallingStickersLayer";
import { CRT3DVideoCard } from "./CRT3DVideoCard";
import { BlueprintGridOverlay } from "./BlueprintGridOverlay";

export interface EditionItem {
  id: string;
  shelf: "top" | "bottom";
  title: string;
  editionLabel: string;
  tagline: string;
  category: string;
  year: string;
  imageSrc: string;
}

const EDITIONS_DATA: EditionItem[] = [
  // ── TOP SHELF (4 ITEMS) ──
  {
    id: "edition-1",
    shelf: "top",
    title: "EVERYWHERE",
    editionLabel: "Spatial Audio Edition",
    tagline: "Granular holographic synthesis and generative soundscapes.",
    category: "EXPERIMENTAL AUDIO",
    year: "2026",
    imageSrc: "/kaset/Rectangle.webp",
  },
  {
    id: "edition-2",
    shelf: "top",
    title: "THE RENAISSANCE",
    editionLabel: "Classical x Digital Art",
    tagline: "Bridging classical renaissance aesthetics with modern WebGL compute shaders.",
    category: "SHADERS / WEBGL",
    year: "2026",
    imageSrc: "/kaset/Rectangle copy.webp",
  },
  {
    id: "edition-3",
    shelf: "top",
    title: "HORIZONS",
    editionLabel: "Synthwave Shaders",
    tagline: "80s neon script typography floating over luminescent dusk ocean.",
    category: "NEON INTERACTION",
    year: "2026",
    imageSrc: "/kaset/Rectangle copy 2.webp",
  },
  {
    id: "edition-4",
    shelf: "top",
    title: "THE BORING EDITION",
    editionLabel: "150+ Interactive Updates",
    tagline: "Retro desktop window enclosing a glowing CRT TV with vibrant graffiti.",
    category: "DESIGN SYSTEM",
    year: "2026",
    imageSrc: "/kaset/Rectangle-1.webp",
  },

  // ── BOTTOM SHELF (5 ITEMS) ──
  {
    id: "edition-5",
    shelf: "bottom",
    title: "UNIFIED",
    editionLabel: "Shopify Editions / Systems",
    tagline: "Immersive, powerful, unified design system.",
    category: "DESIGN SYSTEMS",
    year: "2026",
    imageSrc: "/kaset/Rectangle-2.webp",
  },
  {
    id: "edition-6",
    shelf: "bottom",
    title: "FOUNDATIONS",
    editionLabel: "Core Frontend Architecture",
    tagline: "Modular 3D building blocks and robust component engineering.",
    category: "ARCHITECTURE",
    year: "2026",
    imageSrc: "/kaset/Group 182.webp",
  },
  {
    id: "edition-7",
    shelf: "bottom",
    title: "IMAGINE MY BUSINESS",
    editionLabel: "Spectrum Prism Engineering",
    tagline: "Visualizing enterprise growth through chromatic refraction and vertical prism arrays.",
    category: "DATA VISUALIZATION",
    year: "2026",
    imageSrc: "/kaset/Group 183.webp",
  },
  {
    id: "edition-8",
    shelf: "bottom",
    title: "BUILT TO LAST",
    editionLabel: "Editorial Architecture",
    tagline: "Long-lasting scalable digital ecosystems designed for sustained performance.",
    category: "EDITORIAL UI",
    year: "2026",
    imageSrc: "/kaset/Group 184.webp",
  },
  {
    id: "edition-9",
    shelf: "bottom",
    title: "CONNECT TO CONSUMER",
    editionLabel: "Direct Commerce Engine",
    tagline: "Seamless omnichannel interaction and soft 3D commerce primitives.",
    category: "COMMERCE UI",
    year: "2026",
    imageSrc: "/kaset/Group 185.webp",
  },
];

// ── GIANT TYPOGRAPHY WITH DISSOLUTION: "CREATIVE DEVELOPER" ──
const CREATIVE_LETTERS = [
  { char: "C", id: "cr-c-0" },
  { char: "R", id: "cr-r-1" },
  { char: "E", id: "cr-e-2" },
  { char: "A", id: "cr-a-3" },
  { char: "T", id: "cr-t-4" },
  { char: "I", id: "cr-i-5" },
  { char: "V", id: "cr-v-6" },
  { char: "E", id: "cr-e-7" },
];

const DEVELOPER_LETTERS = [
  { char: "D", id: "dev-d-0" },
  { char: "E", id: "dev-e-1" },
  { char: "V", id: "dev-v-2" },
  { char: "E", id: "dev-e-3" },
  { char: "L", id: "dev-l-4" },
  { char: "O", id: "dev-o-5" },
  { char: "P", id: "dev-p-6" },
  { char: "E", id: "dev-e-7" },
  { char: "R", id: "dev-r-8" },
];

// Deterministic random threshold for each letter dissolving 1 by 1 as user scrolls past shelves (0.46 to 0.65)
const CREATIVE_DEV_THRESHOLDS: Record<string, number> = {
  // CREATIVE (8 letters)
  "cr-c-0": 0.58,
  "cr-r-1": 0.50,
  "cr-e-2": 0.63,
  "cr-a-3": 0.53,
  "cr-t-4": 0.60,
  "cr-i-5": 0.47,
  "cr-v-6": 0.55,
  "cr-e-7": 0.64,
  // DEVELOPER (9 letters)
  "dev-d-0": 0.52,
  "dev-e-1": 0.62,
  "dev-v-2": 0.49,
  "dev-e-3": 0.57,
  "dev-l-4": 0.46,
  "dev-o-5": 0.63,
  "dev-p-6": 0.53,
  "dev-e-7": 0.59,
  "dev-r-8": 0.56,
};

function getCharStyle(progress: number, id: string): React.CSSProperties {
  const threshold = CREATIVE_DEV_THRESHOLDS[id] ?? 0.55;
  if (progress <= threshold - 0.04) {
    return {
      opacity: 1,
      transform: "translate3d(0, 0, 0)",
      willChange: "opacity, transform",
    };
  }
  if (progress >= threshold) {
    return {
      opacity: 0,
      transform: "translate3d(0, -10px, 0)",
      willChange: "opacity, transform",
      pointerEvents: "none",
    };
  }
  const factor = (threshold - progress) / 0.04; // 1.0 -> 0.0
  const y = (1.0 - factor) * -10;
  return {
    opacity: factor,
    transform: `translate3d(0, ${y.toFixed(2)}px, 0)`,
    willChange: "opacity, transform",
  };
}

interface SportsStoriesSectionProps {
  scrollProgress?: number; // 0.0 to 1.0 (Scroll 3 Phase 1)
  isActive?: boolean;
}

export function SportsStoriesSection({ scrollProgress = 0, isActive = true }: SportsStoriesSectionProps) {
  const [activeEdition, setActiveEdition] = useState<EditionItem | null>(null);

  // Smooth GPU translation down the studio wall during internal scroll (1380px full pan)
  const normScroll = Math.max(0, Math.min(1.0, scrollProgress));
  const easedInternal = normScroll * normScroll * (3.0 - 2.0 * normScroll);
  const internalTranslateY = easedInternal * 1380; // Full translation so all lower cards are 100% visible!

  const topShelfItems = EDITIONS_DATA.filter((item) => item.shelf === "top");
  const bottomShelfItems = EDITIONS_DATA.filter((item) => item.shelf === "bottom");

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveEdition(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[640px] text-black select-none font-sans overflow-hidden">
      {/* ── FIXED STATIC 3x3 ARCHITECTURAL BLUEPRINT GRID OVERLAY (IMMOBILE ON SCROLL, FOREGROUND) ── */}
      <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center select-none overflow-hidden">
        <BlueprintGridOverlay />
      </div>

      {/* ── BACK WALL & AMBIENT SPOTLIGHT (Z = 0, LIGHT FROM RIGHT) ── */}
      <div
        className="absolute inset-0 pointer-events-none z-0 min-h-[2200px]"
        style={{
          transform: "translateZ(0px)",
          background:
            "radial-gradient(ellipse 130% 65% at 70% 8%, #FFFFFF 0%, #F5F7FA 35%, #E2E6EF 70%, #CBD1DD 100%)",
        }}
      >
        {/* Studio Spotlight Halo on the Back Wall (Oriented from Right) */}
        <div
          className="absolute top-0 right-[15%] w-[1100px] h-[750px] rounded-full pointer-events-none opacity-70 blur-[130px]"
          style={{
            background: "radial-gradient(ellipse at center, rgba(255,255,255,1) 0%, rgba(240,243,248,0) 75%)",
          }}
        />
      </div>

      {/* ── CONTINUOUS FALLING STICKERS WITH SLOW SPIN & INVERSE CURSOR PARALLAX ── */}
      <FallingStickersLayer scrollProgress={scrollProgress} isActive={isActive} />

      {/* ── 3D PHYSICAL SCENE (ELEVATED CAMERA EYE LEVEL AT 50% 16%) ── */}
      <div
        className="relative z-30 w-full flex flex-col items-center px-4 sm:px-8 md:px-12 py-10 will-change-transform pointer-events-auto transform-gpu"
        style={{
          transform: `translate3d(0, ${-internalTranslateY}px, 0)`,
        }}
      >
        {/* ══════════════════ PART 1: DUAL 3D CASSETTE SHELVES SHOWCASE ══════════════════ */}
        <div
          className="relative z-10 w-full flex flex-col items-center gap-16 sm:gap-20 md:gap-26 pt-12 pb-36"
        >
          {/* TIER 1: TOP SHELF (3D PHYSICAL BOX - 4 ITEMS) */}
          <Shelf3DUnit
            tier="top"
            items={topShelfItems}
            shelfWidth="max-w-[880px] lg:max-w-[980px]"
            shelfDepth={26}
            shelfHeight={10}
            onSelect={(item) => setActiveEdition(item)}
          />

          {/* TIER 2: BOTTOM SHELF (3D PHYSICAL BOX - 5 ITEMS) */}
          <Shelf3DUnit
            tier="bottom"
            items={bottomShelfItems}
            shelfWidth="max-w-[1100px] lg:max-w-[1220px]"
            shelfDepth={46}
            shelfHeight={12}
            onSelect={(item) => setActiveEdition(item)}
          />
        </div>

        {/* ══════════════════ PART 2: CLIENTS & SERVICES SHOWCASE (Extended Down the Wall) ══════════════════ */}
        <div className="relative z-10 w-full max-w-[1360px] mx-auto flex flex-col items-center pt-28 pb-48 px-6 sm:px-10">
          {/* ── GIANT DISSOLUTION TYPOGRAPHY: "CREATIVE DEVELOPER" (LEFT-ALIGNED) ── */}
          <div className="w-full flex flex-col items-start justify-start select-none text-left mb-16 sm:mb-24">
            {/* Line 1: CREATIVE (Bold Sans) */}
            <div className="font-sans font-black uppercase text-black tracking-[-0.04em] text-[14vw] sm:text-[16vw] lg:text-[170px] xl:text-[210px] 2xl:text-[240px] leading-[0.80] flex justify-start items-center">
              {CREATIVE_LETTERS.map((item) => (
                <span
                  key={item.id}
                  style={getCharStyle(scrollProgress, item.id)}
                  className="inline-block will-change-transform"
                >
                  {item.char}
                </span>
              ))}
            </div>

            {/* Line 2: DEVELOPER (Instrument Serif Italic) */}
            <div className="font-serif italic font-normal uppercase text-black tracking-[-0.01em] text-[14vw] sm:text-[16vw] lg:text-[170px] xl:text-[210px] 2xl:text-[240px] leading-[0.80] mt-[-2vw] sm:mt-[-1.5vw] lg:mt-[-15px] flex justify-start items-center">
              {DEVELOPER_LETTERS.map((item) => (
                <span
                  key={item.id}
                  style={getCharStyle(scrollProgress, item.id)}
                  className="inline-block will-change-transform"
                >
                  {item.char}
                </span>
              ))}
            </div>
          </div>

          {/* Asymmetrical 2-Cards Layout matching the exact design */}
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10 items-start">
            {/* Card 1: PRODUCTION PROCESS (Lower Left, 5 cols, pushed down, stickers fall over it) */}
            <div className="relative z-10 md:col-span-5 md:col-start-1 md:mt-24 bg-[#F5F5F7] p-8 sm:p-10 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-[#E5E5E8] rounded-none">
              <p className="font-serif italic font-normal text-xl sm:text-2xl text-zinc-700 tracking-[-0.01em] uppercase mb-8">
                PRODUCTION PROCESS
              </p>
              <ul className="space-y-4 font-sans font-black text-xl sm:text-2xl md:text-[28px] text-black tracking-tight uppercase leading-tight">
                <li>CONCEPTUALIZE</li>
                <li>EXPLORE</li>
                <li>ANIMATE</li>
                <li>OPTIMIZE</li>
                <li>DEPLOY</li>
              </ul>
            </div>

            {/* Card 2: 3D CRT TV VIDEO PLAYER (Higher Right, compact width, elevated in front of falling stickers) */}
            <div className="relative z-30 md:col-span-6 md:col-start-7 max-w-[480px] md:ml-auto w-full bg-[#E2E4E8] p-5 sm:p-6 md:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-[#D5D7DC] rounded-none">
              <CRT3DVideoCard scrollProgress={scrollProgress} />
            </div>
          </div>
        </div>
      </div>

      {/* ── CENTER SPOTLIGHT MODAL WITH 3D MOUSE TILT (WHEN AN EDITION IS CLICKED) ── */}
      {activeEdition && (
        <CenterSpotlightModal edition={activeEdition} onClose={() => setActiveEdition(null)} />
      )}
    </div>
  );
}

// ── COMPONENT: TRUE 3D PHYSICAL SHELF UNIT (ATTACHED TO WALL) ──
interface Shelf3DUnitProps {
  tier: "top" | "bottom";
  items: EditionItem[];
  shelfWidth: string;
  shelfDepth: number; // in px
  shelfHeight: number; // in px
  onSelect: (item: EditionItem) => void;
}

function Shelf3DUnit({
  tier,
  items,
  shelfWidth,
  shelfDepth,
  shelfHeight,
  onSelect,
}: Shelf3DUnitProps) {
  const cardZOffset = tier === "bottom" ? 28 : 20;

  return (
    <div
      className={`relative w-full ${shelfWidth} flex flex-col items-center`}
      style={{
        perspective: "1400px",
        perspectiveOrigin: "50% 16%",
        transformStyle: "preserve-3d",
      }}
    >
      {/* ── A. CASSETTE CARDS ROW (Sitting on the 3D Shelf Surface, Leaning on Wall) ── */}
      <div
        className="relative w-full flex items-end justify-center gap-3.5 sm:gap-4 md:gap-5 px-6"
        style={{
          transformStyle: "preserve-3d",
          transform: `translateZ(${cardZOffset}px)`, // Offset forward from wall
        }}
      >
        {items.map((item) => (
          <CassetteCard
            key={item.id}
            item={item}
            shelfTier={tier}
            onClick={() => onSelect(item)}
          />
        ))}
      </div>

      {/* ── B. PHYSICAL 3D EXTRUDED SHELF SLAB (Protruding from Wall) ── */}
      <div
        className="relative w-full pointer-events-none"
        style={{
          transformStyle: "preserve-3d",
          height: `${shelfHeight}px`,
          transform: `translate3d(0, 0, ${shelfDepth / 2}px)`,
        }}
      >
        {/* 1. TOP HORIZONTAL PLANE (Pure Solid White Surface) */}
        <div
          className="absolute left-0 right-0 bg-[#FFFFFF] border-t border-white"
          style={{
            height: `${shelfDepth}px`,
            top: `calc(50% - ${shelfDepth / 2}px)`,
            transform: `rotateX(90deg) translateZ(${shelfHeight / 2}px)`,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,1)",
          }}
        />

        {/* 2. FRONT VERTICAL BEVEL LIP (Standing at Front Face) */}
        <div
          className="absolute inset-0 bg-[#FFFFFF] border-b border-[#CBD1D7] border-t border-white"
          style={{
            transform: `translateZ(${shelfDepth / 2}px)`,
          }}
        />

        {/* 3. LEFT 3D SIDE END CAP (Flush with Left Edge) */}
        <div
          className="absolute top-0 bottom-0 bg-[#E2E6EE] border-t border-white"
          style={{
            width: `${shelfDepth}px`,
            left: `calc(-${shelfDepth / 2}px)`,
            transform: "rotateY(90deg)",
          }}
        />

        {/* 4. RIGHT 3D SIDE END CAP (Flush with Right Edge) */}
        <div
          className="absolute top-0 bottom-0 bg-[#E2E6EE] border-t border-white"
          style={{
            width: `${shelfDepth}px`,
            right: `calc(-${shelfDepth / 2}px)`,
            transform: "rotateY(90deg)",
          }}
        />
      </div>

      {/* ── C. REAL VISIBLE SHELF WALL SHADOW (Directional Down-Left from Top-Right Spotlight) ── */}
      <div
        className="relative w-full h-14 pointer-events-none -mt-1"
        style={{
          transform: "translateZ(0px)",
        }}
      >
        {/* Core dark contact shadow under the shelf, skewed to the left */}
        <div
          className="absolute -top-1 left-[-24px] right-[10px] h-3 bg-black/45 blur-[3px]"
          style={{ transform: "skewX(-20deg)" }}
        />
        {/* Deep diffuse directional shadow falling down-left onto the wall */}
        <div
          className="absolute top-0 left-[-45px] right-[15px] h-12 bg-gradient-to-b from-black/30 via-black/12 to-transparent blur-[8px]"
          style={{ transform: "skewX(-25deg)" }}
        />
      </div>
    </div>
  );
}

// ── COMPONENT: CASSETTE CARD WITH 2-STAGE PHYSICAL DROP & LEAN PHYSICS ──
interface CassetteCardProps {
  item: EditionItem;
  shelfTier: "top" | "bottom";
  onClick: () => void;
}

const CassetteCard = React.memo(function CassetteCard({ item, shelfTier, onClick }: CassetteCardProps) {
  // Physics states strictly local to this card
  const [physicsState, setPhysicsState] = useState<"resting" | "hovered" | "falling" | "leaning">("resting");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Top shelf cards lean back 5.0deg, bottom shelf cards lean back 7.5deg clearly against the wall
  const restingAngle = shelfTier === "top" ? 5.0 : 7.5;

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhysicsState("hovered");
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    // ── STAGE 1: Falls straight down onto the shelf upright (150ms) ──
    setPhysicsState("falling");

    timerRef.current = setTimeout(() => {
      // ── STAGE 2: Top edge falls back and leans against wall (320ms) ──
      setPhysicsState("leaning");

      timerRef.current = setTimeout(() => {
        setPhysicsState("resting");
      }, 320);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Clean directional shadow: soft left-leaning ambient shadow
  let transform = `rotateX(${restingAngle}deg) translateY(0px) scale(1.0)`;
  let transition = "transform 340ms cubic-bezier(0.34, 1.25, 0.64, 1), box-shadow 340ms ease-out";
  let shadow = "-12px 0px 18px -4px rgba(0, 0, 0, 0.38)";

  if (physicsState === "hovered") {
    // Lifted straight up from shelf, brought forward, and straight 90-degree upright!
    transform = "rotateX(0deg) translateY(-26px) translateZ(20px) scale(1.035)";
    transition = "transform 220ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 220ms ease-out";
    shadow = "0 18px 32px -4px rgba(0, 0, 0, 0.45), 0 35px 60px -10px rgba(0, 0, 0, 0.25)";
  } else if (physicsState === "falling") {
    // Stage 1: Drops vertically down onto shelf flat upright!
    transform = "rotateX(0deg) translateY(0px) translateZ(0px) scale(1.0)";
    transition = "transform 140ms cubic-bezier(0.4, 0, 0.8, 1), box-shadow 140ms ease-in";
    shadow = "-10px 0px 14px -3px rgba(0, 0, 0, 0.35)";
  } else if (physicsState === "leaning") {
    // Stage 2: Top edge falls back to lean against wall with subtle damped spring!
    transform = `rotateX(${restingAngle}deg) translateY(0px) translateZ(0px) scale(1.0)`;
    transition = "transform 320ms cubic-bezier(0.34, 1.35, 0.64, 1), box-shadow 320ms ease-out";
    shadow = "-12px 0px 18px -4px rgba(0, 0, 0, 0.38)";
  }

  const dimensionClasses = "w-[110px] sm:w-[145px] md:w-[175px] lg:w-[195px] aspect-square";
  const cassetteDepth = 10; // 10px physical jewel box thickness

  return (
    // ── 1. STABLE STATIC HIT ZONE (Fixed position, never jitters or moves on hover) ──
    <div
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative cursor-pointer select-none ${dimensionClasses}`}
      style={{
        transformStyle: "preserve-3d",
        zIndex: physicsState === "hovered" ? 50 : 10,
      }}
    >
      {/* ── EXPANDED INVISIBLE HIT SURFACE (Covers entire resting + lifted zone) ── */}
      <div className="absolute -top-8 -bottom-2 -left-2 -right-2 z-40 cursor-pointer pointer-events-auto" />

      {/* ── 2. INNER ANIMATED 3D CASSETTE (Performs lift & lean physics smoothly) ── */}
      <div
        className="relative w-full h-full pointer-events-none will-change-transform rounded-none overflow-visible transform-gpu"
        style={{
          transformOrigin: "bottom center",
          transform,
          boxShadow: shadow,
          transition,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          contain: "paint layout",
        }}
      >
        {/* DYNAMIC FLOATING SHADOW ONTO SHELF FLOOR (Appears when lifted on hover) */}
        <div
          className="absolute -bottom-3 left-3 right-3 h-2.5 bg-black/45 blur-[4px] rounded-full pointer-events-none transition-all duration-200"
          style={{
            opacity: physicsState === "hovered" ? 0.9 : 0,
            transform: physicsState === "hovered" ? "scaleX(0.95) translateY(5px)" : "scaleX(0.5) translateY(0px)",
          }}
        />

        {/* Clean Full-Bleed Artwork Cover (Flat Isolated GPU Surface) */}
        <div
          className="w-full h-full overflow-hidden bg-neutral-900 rounded-none relative border-0"
          style={{
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <ArtworkCover item={item} />
        </div>
      </div>
    </div>
  );
});

// ── COMPONENT: CENTER SPOTLIGHT MODAL WITH 3D MOUSE TILT ──
function CenterSpotlightModal({ edition, onClose }: { edition: EditionItem; onClose: () => void }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Smooth interactive mouse tilt calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const normX = (e.clientX - centerX) / (rect.width / 2);
    const normY = (e.clientY - centerY) / (rect.height / 2);

    setTilt({
      x: Math.max(-1, Math.min(1, normX)),
      y: Math.max(-1, Math.min(1, normY)),
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/40 backdrop-blur-md transition-all duration-300 animate-in fade-in"
      style={{ perspective: "1400px" }}
    >
      {/* Modal Main Stage Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-8 md:gap-14"
      >
        {/* Left Side: Edition Title & Description */}
        <div className="flex flex-col items-start max-w-xs text-black animate-in slide-in-from-left-4 duration-500">
          <span className="font-mono text-[10px] sm:text-xs font-bold tracking-widest uppercase text-zinc-500 mb-1">
            {edition.category} / {edition.year}
          </span>
          <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-black leading-none mb-3">
            {edition.title}
          </h2>
          <p className="font-sans text-xs sm:text-sm text-zinc-700 leading-relaxed mb-4">{edition.tagline}</p>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-black text-white font-mono text-[9px] font-bold rounded uppercase">
              {edition.editionLabel}
            </span>
          </div>
        </div>

        {/* Center: Large 3D Tilted Card & Open Button */}
        <div className="flex flex-col items-center">
          <div
            ref={cardRef}
            className="w-[260px] sm:w-[360px] md:w-[440px] aspect-square rounded-none overflow-hidden will-change-transform transition-transform duration-100 ease-out"
            style={{
              transform: `perspective(1200px) rotateX(${tilt.y * -16}deg) rotateY(${tilt.x * 16}deg) scale(1.02)`,
              boxShadow:
                "0 45px 85px -15px rgba(0,0,0,0.65), 0 20px 35px -10px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            <ArtworkCover item={edition} />
          </div>

          {/* Black Pill "Open" Button under Card */}
          <button
            onClick={() => alert(`Opening ${edition.title} case study...`)}
            className="mt-6 px-8 py-2.5 bg-black text-white rounded-full font-sans text-xs sm:text-sm font-black tracking-wider uppercase shadow-2xl hover:scale-105 hover:bg-zinc-800 active:scale-95 transition-all cursor-pointer"
          >
            Open
          </button>
        </div>

        {/* Close Button (X) */}
        <button
          onClick={onClose}
          className="absolute -top-6 right-0 md:top-0 md:-right-6 w-9 h-9 rounded-full bg-black/10 hover:bg-black/20 text-black flex items-center justify-center font-mono text-sm transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ── COMPONENT: ARTWORK COVER GENERATOR FOR ALL 9 EDITIONS (LOADS DIRECTLY FROM /kaset) ──
const ArtworkCover = React.memo(function ArtworkCover({ item }: { item: EditionItem }) {
  return (
    <div
      className="relative w-full h-full bg-[#121214] text-white flex items-center justify-center overflow-hidden transform-gpu"
      style={{
        contain: "strict",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      <img
        src={item.imageSrc}
        alt={item.title}
        className="w-full h-full object-cover select-none pointer-events-none"
        loading="eager"
        decoding="async"
      />
    </div>
  );
});
