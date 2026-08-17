"use client";

import React from "react";

interface BlueprintGridOverlayProps {
  strokeColor?: string;
  crosshairColor?: string;
  className?: string;
}

// ── COMPONENT: PRECISION SVG CROSSHAIR (+) - 100% PURE VECTOR WITH ZERO BACKGROUND ──
function CrosshairSVG({
  style,
  color = "rgba(24, 24, 27, 0.38)",
}: {
  style?: React.CSSProperties;
  color?: string;
}) {
  return (
    <svg
      className="absolute -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none z-30"
      style={{
        width: "12px",
        height: "12px",
        color,
        ...style,
      }}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="6" y1="0" x2="6" y2="12" stroke="currentColor" strokeWidth="1.5" />
      <line x1="0" y1="6" x2="12" y2="6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

// ── COMPONENT: RESPONSIVE PURE TRANSPARENT ARCHITECTURAL 3x3 BLUEPRINT GRID ──
export function BlueprintGridOverlay({
  strokeColor = "rgba(0, 0, 0, 0.08)",
  crosshairColor = "rgba(24, 24, 27, 0.38)",
  className = "",
}: BlueprintGridOverlayProps) {
  // Exact symmetrical 3x3 grid coordinates: 6% padding on all sides, 3 equal 29.333% columns/rows
  const X_COORDS_SVG = [60, 353.333, 646.666, 940];
  const Y_COORDS_SVG = [60, 353.333, 646.666, 940];
  const X_PCT = ["6%", "35.333%", "64.666%", "94%"];
  const Y_PCT = ["6%", "35.333%", "64.666%", "94%"];
  const GAP = 10; // Gap around intersections in 1000x1000 space

  return (
    <div
      className={`absolute inset-0 w-full h-full pointer-events-none select-none z-20 overflow-hidden ${className}`}
    >
      {/* ── 1. SEGMENTED PURE TRANSPARENT VECTOR GRID LINES (0% TO 100% SCREEN EXTENSIONS) ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Horizontal Lines (Extending 0 to 1000) */}
        <g stroke={strokeColor} strokeWidth="1">
          {Y_COORDS_SVG.map((y, rIdx) => (
            <React.Fragment key={`h-seg-${rIdx}`}>
              {/* Left extension line */}
              <line x1="0" y1={y} x2={X_COORDS_SVG[0] - GAP} y2={y} vectorEffect="non-scaling-stroke" />
              {/* Segment Col 1 */}
              <line x1={X_COORDS_SVG[0] + GAP} y1={y} x2={X_COORDS_SVG[1] - GAP} y2={y} vectorEffect="non-scaling-stroke" />
              {/* Segment Col 2 */}
              <line x1={X_COORDS_SVG[1] + GAP} y1={y} x2={X_COORDS_SVG[2] - GAP} y2={y} vectorEffect="non-scaling-stroke" />
              {/* Segment Col 3 */}
              <line x1={X_COORDS_SVG[2] + GAP} y1={y} x2={X_COORDS_SVG[3] - GAP} y2={y} vectorEffect="non-scaling-stroke" />
              {/* Right extension line */}
              <line x1={X_COORDS_SVG[3] + GAP} y1={y} x2="1000" y2={y} vectorEffect="non-scaling-stroke" />
            </React.Fragment>
          ))}

          {/* Vertical Lines (Extending 0 to 1000) */}
          {X_COORDS_SVG.map((x, cIdx) => (
            <React.Fragment key={`v-seg-${cIdx}`}>
              {/* Top extension line */}
              <line x1={x} y1="0" x2={x} y2={Y_COORDS_SVG[0] - GAP} vectorEffect="non-scaling-stroke" />
              {/* Segment Row 1 */}
              <line x1={x} y1={Y_COORDS_SVG[0] + GAP} x2={x} y2={Y_COORDS_SVG[1] - GAP} vectorEffect="non-scaling-stroke" />
              {/* Segment Row 2 */}
              <line x1={x} y1={Y_COORDS_SVG[1] + GAP} x2={x} y2={Y_COORDS_SVG[2] - GAP} vectorEffect="non-scaling-stroke" />
              {/* Segment Row 3 */}
              <line x1={x} y1={Y_COORDS_SVG[2] + GAP} x2={x} y2={Y_COORDS_SVG[3] - GAP} vectorEffect="non-scaling-stroke" />
              {/* Bottom extension line */}
              <line x1={x} y1={Y_COORDS_SVG[3] + GAP} x2={x} y2="1000" vectorEffect="non-scaling-stroke" />
            </React.Fragment>
          ))}
        </g>
      </svg>

      {/* ── 2. PRECISION VECTOR CROSSHAIRS (+) AT ALL 16 INTERSECTIONS (ZERO BACKGROUND) ── */}
      {Y_PCT.map((topPct, rIdx) =>
        X_PCT.map((leftPct, cIdx) => (
          <CrosshairSVG
            key={`cross-${rIdx}-${cIdx}`}
            color={crosshairColor}
            style={{
              top: topPct,
              left: leftPct,
            }}
          />
        ))
      )}
    </div>
  );
}
