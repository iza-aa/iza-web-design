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
  const [isDone, setIsDone] = useState<boolean>(false);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [isUnmounted, setIsUnmounted] = useState<boolean>(false);

  const realProgressRef = useRef<number>(0);
  const targetPercentRef = useRef<number>(1);
  const allLoadedRef = useRef<boolean>(false);

  useEffect(() => {
    let loadedCount = 0;
    const totalCount = CRITICAL_IMAGE_ASSETS.length + CRITICAL_3D_ASSETS.length + 1; // +1 for document.fonts

    const updateItemLoaded = () => {
      loadedCount++;
      const rawRatio = loadedCount / totalCount;
      realProgressRef.current = rawRatio;

      if (loadedCount >= totalCount) {
        allLoadedRef.current = true;
        targetPercentRef.current = 100;
      } else {
        // Clamped at 99% until every single asset is 100% loaded
        targetPercentRef.current = Math.min(99, Math.max(1, Math.floor(rawRatio * 100)));
      }
    };

    // 1. Preload all Critical Images
    CRITICAL_IMAGE_ASSETS.forEach((src) => {
      const img = new Image();
      img.onload = () => updateItemLoaded();
      img.onerror = () => updateItemLoaded(); // don't block forever if offline/error
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

    // 4. Smooth 60/120 FPS RAF Number Incrementing towards Real Progress
    let animId: number;
    let currentVal = 1;

    const tick = () => {
      const target = targetPercentRef.current;

      if (currentVal < target) {
        // Increment smoothly towards target
        const diff = target - currentVal;
        const step = Math.max(1, Math.ceil(diff * 0.12));
        currentVal = Math.min(target, currentVal + step);
        setDisplayedPercent(currentVal);
      }

      if (currentVal >= 100 && allLoadedRef.current) {
        onLoadComplete?.();
        // Give 450ms to comfortably view 100%, then initiate slow cinematic fade out
        setTimeout(() => {
          setIsFadingOut(true);
          // Only unmount after the 1300ms smooth fade transition completes fully
          setTimeout(() => {
            setIsUnmounted(true);
          }, 1400);
        }, 450);
        return;
      }

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
