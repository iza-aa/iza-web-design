"use client";

import React, { useEffect, useRef } from "react";

interface PerspectiveWireframeGridProps {
  progress?: number; // Footer progress (0.0 to 1.0)
}

export function PerspectiveWireframeGrid({ progress = 1.0 }: PerspectiveWireframeGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mousePosRef = useRef<{
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    hasUserMoved: boolean;
  }>({
    x: -1,
    y: -1,
    targetX: -1,
    targetY: -1,
    hasUserMoved: false,
  });

  const progressRef = useRef<number>(progress);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

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

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    if (mousePosRef.current.x === -1) {
      mousePosRef.current.x = screenW / 2;
      mousePosRef.current.y = screenH / 2;
      mousePosRef.current.targetX = screenW / 2;
      mousePosRef.current.targetY = screenH / 2;
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      if (!mousePosRef.current.hasUserMoved) {
        mousePosRef.current.x = window.innerWidth / 2;
        mousePosRef.current.y = window.innerHeight / 2;
        mousePosRef.current.targetX = window.innerWidth / 2;
        mousePosRef.current.targetY = window.innerHeight / 2;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const sw = window.innerWidth;
      const sh = window.innerHeight;
      const boxW = sw * 0.29333;
      const boxH = sh * 0.29333;

      // Outer boundary limits (6% margin)
      const minX = sw * 0.06 + boxW / 2 + 10;
      const maxX = sw * 0.94 - boxW / 2 - 10;
      const minY = sh * 0.06 + boxH / 2 + 10;
      const maxY = sh * 0.94 - boxH / 2 - 10;

      mousePosRef.current.hasUserMoved = true;
      mousePosRef.current.targetX = Math.max(minX, Math.min(maxX, e.clientX));
      mousePosRef.current.targetY = Math.max(minY, Math.min(maxY, e.clientY));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const sw = window.innerWidth;
        const sh = window.innerHeight;
        const boxW = sw * 0.29333;
        const boxH = sh * 0.29333;

        const minX = sw * 0.06 + boxW / 2 + 10;
        const maxX = sw * 0.94 - boxW / 2 - 10;
        const minY = sh * 0.06 + boxH / 2 + 10;
        const maxY = sh * 0.94 - boxH / 2 - 10;

        mousePosRef.current.hasUserMoved = true;
        mousePosRef.current.targetX = Math.max(minX, Math.min(maxX, e.touches[0].clientX));
        mousePosRef.current.targetY = Math.max(minY, Math.min(maxY, e.touches[0].clientY));
      }
    };

    const handleMouseLeave = () => {
      // Return gently to center when cursor leaves
      mousePosRef.current.targetX = window.innerWidth / 2;
      mousePosRef.current.targetY = window.innerHeight / 2;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

    const GAP = 10; // 10px clean gap around crosshairs
    const CROSS_SIZE = 6; // 12px total crosshair (+-6px from intersection)

    const render = () => {
      // Sleep canvas loop when outside footer (progress <= 0)
      if (progressRef.current <= 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      const sw = window.innerWidth;
      const sh = window.innerHeight;

      // 1. Smoothly Lerp (Ease) Center Coordinates Toward Mouse Target
      const lerpSpeed = 0.10;
      mousePosRef.current.x += (mousePosRef.current.targetX - mousePosRef.current.x) * lerpSpeed;
      mousePosRef.current.y += (mousePosRef.current.targetY - mousePosRef.current.y) * lerpSpeed;

      const cx = mousePosRef.current.x;
      const cy = mousePosRef.current.y;

      // Fixed outer margins (6% and 94%)
      const x0 = sw * 0.06;
      const x3 = sw * 0.94;
      const y0 = sh * 0.06;
      const y3 = sh * 0.94;

      // Dynamic center box dimensions (29.333% of viewport)
      const boxW = sw * 0.29333;
      const boxH = sh * 0.29333;

      // Dynamic inner 2 vertical & horizontal grid lines (bounding the moving center box)
      const x1 = cx - boxW / 2;
      const x2 = cx + boxW / 2;
      const y1 = cy - boxH / 2;
      const y2 = cy + boxH / 2;

      const X_COORDS = [x0, x1, x2, x3];
      const Y_COORDS = [y0, y1, y2, y3];

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, sw, sh);

      // ── A. AMBIENT RADIAL SPOTLIGHT AURA BEHIND MOVING CENTER BOX ──
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(boxW, boxH) * 1.1);
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.06)");
      gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.015)");
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, sw, sh);

      // ── B. DRAW ALL 4 HORIZONTAL GRID LINES (EXTENDING 0 TO SCREEN WIDTH) ──
      Y_COORDS.forEach((y, rIdx) => {
        const isCenterTopBorder = rIdx === 1;
        const isCenterBottomBorder = rIdx === 2;

        // 1. Left Extension (0 -> X0)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(x0 - GAP, y);
        ctx.stroke();

        // 2. Col 1 Segment (X0 -> X1)
        ctx.beginPath();
        ctx.moveTo(x0 + GAP, y);
        ctx.lineTo(x1 - GAP, y);
        ctx.stroke();

        // 3. Col 2 Segment (X1 -> X2): CENTER BOX TOP OR BOTTOM BORDER (SOLID BRIGHT WHITE!)
        ctx.save();
        if (isCenterTopBorder || isCenterBottomBorder) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.88)";
          ctx.lineWidth = 1.5;
        } else {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
          ctx.lineWidth = 1;
        }
        ctx.beginPath();
        ctx.moveTo(x1 + GAP, y);
        ctx.lineTo(x2 - GAP, y);
        ctx.stroke();
        ctx.restore();

        // 4. Col 3 Segment (X2 -> X3)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x2 + GAP, y);
        ctx.lineTo(x3 - GAP, y);
        ctx.stroke();

        // 5. Right Extension (X3 -> SW)
        ctx.beginPath();
        ctx.moveTo(x3 + GAP, y);
        ctx.lineTo(sw, y);
        ctx.stroke();
      });

      // ── C. DRAW ALL 4 VERTICAL GRID LINES (EXTENDING 0 TO SCREEN HEIGHT) ──
      X_COORDS.forEach((x, cIdx) => {
        const isCenterLeftBorder = cIdx === 1;
        const isCenterRightBorder = cIdx === 2;

        // 1. Top Extension (0 -> Y0)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, y0 - GAP);
        ctx.stroke();

        // 2. Row 1 Segment (Y0 -> Y1)
        ctx.beginPath();
        ctx.moveTo(x, y0 + GAP);
        ctx.lineTo(x, y1 - GAP);
        ctx.stroke();

        // 3. Row 2 Segment (Y1 -> Y2): CENTER BOX LEFT OR RIGHT BORDER (SOLID BRIGHT WHITE!)
        ctx.save();
        if (isCenterLeftBorder || isCenterRightBorder) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.88)";
          ctx.lineWidth = 1.5;
        } else {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
          ctx.lineWidth = 1;
        }
        ctx.beginPath();
        ctx.moveTo(x, y1 + GAP);
        ctx.lineTo(x, y2 - GAP);
        ctx.stroke();
        ctx.restore();

        // 4. Row 3 Segment (Y2 -> Y3)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y2 + GAP);
        ctx.lineTo(x, y3 - GAP);
        ctx.stroke();

        // 5. Bottom Extension (Y3 -> SH)
        ctx.beginPath();
        ctx.moveTo(x, y3 + GAP);
        ctx.lineTo(x, sh);
        ctx.stroke();
      });

      // ── D. DRAW ALL 16 PRECISION CROSSHAIRS (+) AT INTERSECTIONS ──
      Y_COORDS.forEach((y, rIdx) => {
        X_COORDS.forEach((x, cIdx) => {
          const isCenterCorner = (rIdx === 1 || rIdx === 2) && (cIdx === 1 || cIdx === 2);

          ctx.save();
          if (isCenterCorner) {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.90)";
            ctx.lineWidth = 1.5;
          } else {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
            ctx.lineWidth = 1.5;
          }

          // Horizontal bar of (+)
          ctx.beginPath();
          ctx.moveTo(x - CROSS_SIZE, y);
          ctx.lineTo(x + CROSS_SIZE, y);
          ctx.stroke();

          // Vertical bar of (+)
          ctx.beginPath();
          ctx.moveTo(x, y - CROSS_SIZE);
          ctx.lineTo(x, y + CROSS_SIZE);
          ctx.stroke();

          ctx.restore();
        });
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
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden"
    />
  );
}
