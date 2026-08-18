"use client";

import React, { useEffect, useState, useRef } from "react";
import { ARCHIVE_ITEMS } from "./ArchiveStageSection";

// List of all critical assets required by the newhome portfolio page
const CRITICAL_IMAGE_ASSETS = [
  // 9 Shelf Cassettes (.webp)
  "/kaset/Group 182.webp",
  "/kaset/Group 183.webp",
  "/kaset/Group 184.webp",
  "/kaset/Group 185.webp",
  "/kaset/Rectangle copy 2.webp",
  "/kaset/Rectangle copy.webp",
  "/kaset/Rectangle-1.webp",
  "/kaset/Rectangle-2.webp",
  "/kaset/Rectangle.webp",

  // 5 Floating Stickers (.webp)
  "/sticker/Group 177.webp",
  "/sticker/Group 178.webp",
  "/sticker/Group 179.webp",
  "/sticker/Group 180.webp",
  "/sticker/Group 181.webp",

  // Hero & 3D TV Textures (.webp)
  "/broken_glass_png_20_by_agusrockforlife_ddyqyd9.webp",
  "/gambar1.webp",
  "/gambar2.webp",

  // Archive Card Artwork from Supabase CDN
  ...ARCHIVE_ITEMS.map((item) => item.imageUrl),
];

const CRITICAL_3D_ASSETS = ["/crt_tv.glb"];

interface RealAssetPreloaderProps {
  onLoadComplete?: () => void;
  isWhiteTheme?: boolean;
}

export function RealAssetPreloader({
  onLoadComplete,
  isWhiteTheme = false,
}: RealAssetPreloaderProps) {
  const [displayedPercent, setDisplayedPercent] = useState<number>(1);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [isUnmounted, setIsUnmounted] = useState<boolean>(false);

  const allAssetsLoadedRef = useRef<boolean>(false);
  const startTimeRef = useRef<number>(0);
  const hasFinishedRef = useRef<boolean>(false);

  useEffect(() => {
    let loadedCount = 0;
    const totalCount = CRITICAL_IMAGE_ASSETS.length + CRITICAL_3D_ASSETS.length + 1; // +1 for document.fonts

    const updateItemLoaded = () => {
      loadedCount++;
      if (loadedCount >= totalCount) {
        allAssetsLoadedRef.current = true;
      }
    };

    // 1. Preload all Critical Images
    CRITICAL_IMAGE_ASSETS.forEach((src) => {
      const img = new Image();
      img.onload = () => updateItemLoaded();
      img.onerror = () => updateItemLoaded();
      img.src = src;
    });

    // 2. Preload 3D GLB Model
    CRITICAL_3D_ASSETS.forEach((src) => {
      fetch(src, { method: "GET" })
        .then(() => updateItemLoaded())
        .catch(() => updateItemLoaded());
    });

    // 3. Wait for Web Fonts Ready
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready
        .then(() => updateItemLoaded())
        .catch(() => updateItemLoaded());
    } else {
      updateItemLoaded();
    }

    // 4. Constant Linear Metronome Progress (1% -> 100% in steady, uniform tempo over 2.4s)
    const TARGET_DURATION_MS = 2400; // 24ms per percent -> 100% constant uniform tempo
    startTimeRef.current = performance.now();
    let animId: number;

    const tick = (now: number) => {
      if (hasFinishedRef.current) return;

      const elapsed = now - startTimeRef.current;
      const linearRatio = Math.min(1, elapsed / TARGET_DURATION_MS);

      // Pure linear progression (1% -> 100% at exact uniform speed)
      const currentPercent = Math.max(1, Math.min(100, Math.floor(linearRatio * 99) + 1));

      if (linearRatio >= 1) {
        hasFinishedRef.current = true;
        setDisplayedPercent(100);
        onLoadComplete?.();

        // 350ms to appreciate 100%, then smooth 1.3s cinematic fade out
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            setIsUnmounted(true);
          }, 1400);
        }, 350);
        return;
      }

      setDisplayedPercent(currentPercent);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animId);
  }, [onLoadComplete]);

  if (isUnmounted) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-white flex flex-col justify-between pointer-events-none select-none ${
        isFadingOut ? "opacity-0" : "opacity-100"
      }`}
      style={{
        transition: "opacity 1300ms cubic-bezier(0.25, 1, 0.5, 1)",
      }}
    >
      {/* Top-Right Corner: 1% -> 100% Bold Instrument Serif Percentage */}
      <div className="absolute top-5 right-6 sm:top-8 sm:right-10 md:top-10 md:right-14">
        <span
          className="font-serif italic font-bold tracking-tight text-4xl sm:text-5xl md:text-6xl text-black leading-none select-none"
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
          }}
        >
          {displayedPercent}%
        </span>
      </div>
    </div>
  );
}
