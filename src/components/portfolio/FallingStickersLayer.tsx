"use client";

import React, { useEffect, useRef } from "react";

const STICKER_SRC_LIST = [
  "/sticker/Group 177.webp",
  "/sticker/Group 178.webp",
  "/sticker/Group 179.webp",
  "/sticker/Group 180.webp",
  "/sticker/Group 181.webp",
];

interface StickerParticle {
  id: number;
  imageIndex: number;
  x: number; // in pixels
  y: number; // in pixels
  speed: number; // px per frame
  rotation: number; // radians
  vRot: number; // radians per frame
  scale: number;
  depth: number; // parallax depth factor (0.6 to 1.3)
  wobblePhase: number;
  wobbleSpeed: number;
}

interface FallingStickersLayerProps {
  scrollProgress?: number;
  direction?: "up" | "down";
  isActive?: boolean;
}

export function FallingStickersLayer({
  scrollProgress = 0,
  direction = "down",
  isActive = true,
}: FallingStickersLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isActiveRef = useRef<boolean>(isActive);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  const mouseRef = useRef<{
    targetX: number;
    targetY: number;
    currentX: number;
    currentY: number;
  }>({
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

    let width = (canvas.width = window.innerWidth * dpr);
    let height = (canvas.height = window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const sw = window.innerWidth;
    const sh = window.innerHeight;

    // 1. Preload Sticker Image Objects
    const loadedImages: HTMLImageElement[] = [];
    STICKER_SRC_LIST.forEach((src) => {
      const img = new Image();
      img.src = src;
      loadedImages.push(img);
    });

    // 2. Initialize 5 - 6 Clean & Curated Particles naturally distributed across viewport
    const isMobile = sw < 768;
    const count = isMobile ? 4 : 6;
    const particles: StickerParticle[] = [];

    const resetParticles = () => {
      particles.length = 0;
      const ySpacing = (sh + 380) / count;
      for (let i = 0; i < count; i++) {
        const initialY = direction === "up"
          ? sh + 150 - i * ySpacing + (Math.random() - 0.5) * 60
          : -200 + i * ySpacing + (Math.random() - 0.5) * 60;
        const initialX = sw * 0.12 + Math.random() * (sw * 0.76);

        particles.push({
          id: i,
          imageIndex: i % STICKER_SRC_LIST.length,
          x: initialX,
          y: initialY,
          speed: 0.75 + Math.random() * 0.55, // Smooth floating velocity
          rotation: (Math.random() - 0.5) * 1.0, // Radians
          vRot: (Math.random() - 0.5) * 0.006, // Slow, gentle spin
          scale: isMobile ? 0.85 + Math.random() * 0.20 : 0.90 + Math.random() * 0.20,
          depth: 0.6 + Math.random() * 0.7,
          wobblePhase: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.010 + Math.random() * 0.012,
        });
      }
    };

    resetParticles();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const currentW = window.innerWidth;
      const currentH = window.innerHeight;

      const normX = e.clientX / currentW - 0.5;
      const normY = e.clientY / currentH - 0.5;

      const maxShift = 38;
      mouseRef.current.targetX = -normX * maxShift;
      mouseRef.current.targetY = -normY * maxShift;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const currentW = window.innerWidth;
        const currentH = window.innerHeight;
        const normX = e.touches[0].clientX / currentW - 0.5;
        const normY = e.touches[0].clientY / currentH - 0.5;

        const maxShift = 38;
        mouseRef.current.targetX = -normX * maxShift;
        mouseRef.current.targetY = -normY * maxShift;
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    // 3. 60/120 FPS High-Performance Canvas Render Loop with True Natural Aspect Ratio
    const render = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // Sleep when inactive
      if (!isActiveRef.current) {
        ctx.clearRect(0, 0, width, height);
        animId = requestAnimationFrame(render);
        return;
      }

      // Smooth inertia lerp for inverse mouse offset
      mouseRef.current.currentX += (mouseRef.current.targetX - mouseRef.current.currentX) * 0.08;
      mouseRef.current.currentY += (mouseRef.current.targetY - mouseRef.current.currentY) * 0.08;

      const currentMouseX = mouseRef.current.currentX;
      const currentMouseY = mouseRef.current.currentY;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, screenWidth, screenHeight);

      // Render each sticker with 100% natural aspect ratio and balanced scale
      particles.forEach((p) => {
        // Continuous movement based on direction
        if (direction === "up") {
          p.y -= p.speed;
        } else {
          p.y += p.speed;
        }

        // Slow rotation
        p.rotation += p.vRot;

        // Subtle side-to-side wobble
        p.wobblePhase += p.wobbleSpeed;

        // Boundary recycling
        if (direction === "up") {
          // Recycle when completely off-screen above top viewport
          if (p.y < -220) {
            p.y = screenHeight + 190 + Math.random() * 80;
            p.x = screenWidth * 0.12 + Math.random() * (screenWidth * 0.76);

            const keepSame = Math.random() < 0.30;
            if (!keepSame) {
              const currentIdx = p.imageIndex;
              const availableIndices = [0, 1, 2, 3, 4].filter((idx) => idx !== currentIdx);
              p.imageIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
            }

            p.speed = 0.75 + Math.random() * 0.65;
            p.vRot = (Math.random() - 0.5) * 0.006;
            p.rotation = (Math.random() - 0.5) * 1.0;
            p.scale = screenWidth < 768 ? 0.85 + Math.random() * 0.20 : 0.90 + Math.random() * 0.20;
            p.depth = 0.6 + Math.random() * 0.7;
          }
        } else {
          // Recycle when completely off-screen below bottom viewport
          if (p.y > screenHeight + 200) {
            p.y = -190 - Math.random() * 80;
            p.x = screenWidth * 0.12 + Math.random() * (screenWidth * 0.76);

            const keepSame = Math.random() < 0.30;
            if (!keepSame) {
              const currentIdx = p.imageIndex;
              const availableIndices = [0, 1, 2, 3, 4].filter((idx) => idx !== currentIdx);
              p.imageIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
            }

            p.speed = 0.65 + Math.random() * 0.65;
            p.vRot = (Math.random() - 0.5) * 0.006;
            p.rotation = (Math.random() - 0.5) * 1.0;
            p.scale = screenWidth < 768 ? 0.85 + Math.random() * 0.20 : 0.90 + Math.random() * 0.20;
            p.depth = 0.6 + Math.random() * 0.7;
          }
        }

        const img = loadedImages[p.imageIndex];
        if (!img || !img.complete || img.naturalWidth === 0) return;

        // ── CALCULATE TRUE 100% NATURAL UNCONSTRAINED ASPECT RATIO ──
        const naturalW = img.naturalWidth;
        const naturalH = img.naturalHeight;
        const aspect = naturalW / naturalH;

        // Balanced natural base size (~175px)
        const targetBaseSize = screenWidth < 768 ? 130 : 175;
        let renderW: number;
        let renderH: number;

        if (aspect >= 1) {
          renderW = targetBaseSize * p.scale;
          renderH = (targetBaseSize / aspect) * p.scale;
        } else {
          renderH = targetBaseSize * p.scale;
          renderW = targetBaseSize * aspect * p.scale;
        }

        const wobbleX = Math.sin(p.wobblePhase) * 12;
        const drawX = p.x + currentMouseX * p.depth + wobbleX;
        const drawY = p.y + currentMouseY * p.depth;

        ctx.save();
        ctx.translate(drawX, drawY);
        ctx.rotate(p.rotation);

        // Soft drop shadow
        ctx.shadowColor = direction === "up" ? "rgba(0, 0, 0, 0.40)" : "rgba(0, 0, 0, 0.10)";
        ctx.shadowBlur = direction === "up" ? 8 : 6;
        ctx.shadowOffsetY = 6;

        // Draw image preserving 100% natural proportions
        ctx.drawImage(img, -renderW / 2, -renderH / 2, renderW, renderH);
        ctx.restore();
      });

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none select-none z-20 overflow-hidden"
    />
  );
}
