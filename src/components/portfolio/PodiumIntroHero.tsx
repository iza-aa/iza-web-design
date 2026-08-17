"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import lefttoplogolight from "@/assets/logo/lefttoplogolight.png";
import { BlueprintGridOverlay } from "./BlueprintGridOverlay";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const PUNCTUATION = [".", "?", "!"];

// ==========================================================================
// 🎯 PUSAT TITIK FOKUS, ROTASI & EFEK HISAP (SUCTION CONFIGURATION)
// - LOGO_ROTATION_DEG: Derajat kemiringan diagonal (default: -45.0)
// - RESTING_FOCAL_X: Posisi visual tengah saat logo miring diam di 0% scroll (default: 0.46)
// - LOGO_FOCAL_X: Titik fokus horizontal pusat huruf Z saat zoom (default: 0.38)
// - LOGO_FOCAL_Y: Titik fokus vertikal huruf Z (default: 0.50)
// - SUCTION_STRENGTH: Kekuatan sedotan/hisapan gravitasi ke pusat huruf Z (default: 0.85)
// ==========================================================================
export const LOGO_ROTATION_DEG = -45.0; // Sudut kemiringan diagonal (derajat)
export const RESTING_FOCAL_X = 0.45;   // Posisi optis tengah simetris saat miring 0% scroll
export const RESTING_FOCAL_Y = 0.70;   // Posisi optis vertikal saat miring 0% scroll
export const LOGO_FOCAL_X = 0.38;      // Pusat huruf Z saat di-zoom in (38% dari kiri SVG)
export const LOGO_FOCAL_Y = 0.50;      // Pusat vertikal huruf Z (50% dari atas SVG)
export const SUCTION_STRENGTH = 1.2;  // Kekuatan efek hisap (0.0 = lurus, 1.0 = hisap kuat)

// Exact Path Data from checkthis.svg (viewBox 0 0 656 330)
const CHECKTHIS_PATH_1 = "M7.03392 25.5392C14.854 10.1802 31.388 1.29045 48.5128 3.23737C67.1038 5.35097 81.9528 19.6964 84.7062 38.2035L86.1466 47.8851C87.3659 56.0805 86.6848 64.4466 84.156 72.3369L73.5373 105.469L63.7589 136.255C62.6137 139.86 61.8121 143.565 61.3647 147.322L59.7425 160.941C58.3062 172.999 60.5626 185.209 66.2135 195.958L73.5373 209.888L83.8281 236.023C86.5847 243.025 88 250.482 88 258.006V280.726V285C88 309.301 68.3005 329 44 329H37.7799C16.9146 329 0 312.085 0 291.22L2.53033 259.316C3.19424 250.944 5.60799 242.806 9.61543 235.426L24.43 208.145C28.133 201.326 30.4782 193.854 31.3355 186.142L32.1413 178.894C33.0619 170.613 32.2477 162.231 29.7507 154.283L5.27335 76.3637C4.11866 72.688 3.32071 68.9096 2.89053 65.0809L1.48834 52.6009C0.517483 43.9599 2.10292 35.2238 6.04827 27.475L7.03392 25.5392Z";
const CHECKTHIS_PATH_2 = "M126.597 25.7869C135.791 13.9178 150.784 8.09092 165.581 10.6365L180.498 13.2029C185.507 14.0647 190.4 15.5041 195.078 17.4922L215.07 25.989C223.67 29.644 232.751 32.0419 242.034 33.1089C261.266 35.3194 280.719 31.747 297.91 22.8481L308.612 17.3082C312.219 15.4414 316.014 13.964 319.933 12.9011L327.399 10.8763C337.706 8.08123 348.708 9.62408 357.848 15.1464C364.178 18.9703 369.292 24.5107 372.599 31.1246L372.886 31.697C377.785 41.4954 378.591 52.8386 375.127 63.2312L372.074 72.3898C369.086 81.3541 364.168 89.5539 357.667 96.4112L331.037 124.5L268.48 174.977C261.918 180.272 256.478 186.824 252.48 194.249L246.114 206.072C240.712 216.104 240.323 228.089 245.065 238.45C248.902 246.835 255.782 253.45 264.312 256.955L269.73 259.182C281.209 263.899 294.011 264.288 305.755 260.275L336.396 249.806C343.798 247.278 350.877 243.889 357.489 239.71L401.916 211.632C407.318 208.219 413.034 205.33 418.987 203.007L435.547 196.545C445.784 192.55 456.676 190.5 467.665 190.5H469.718C475.245 190.5 480.753 189.853 486.13 188.573L498.462 185.637C505.644 183.927 512.061 179.894 516.717 174.164C524.331 164.792 526.318 152.05 521.917 140.805L518.527 132.14C516.589 127.189 513.054 123.026 508.482 120.311L507.983 120.015C502.597 116.817 496.123 116.004 490.114 117.771C485.209 119.214 480.94 122.282 478.008 126.47L457.209 156.182C453.278 161.799 447.161 165.498 440.361 166.371C421.339 168.814 407.088 149.33 415.181 131.942L431.997 95.8094C433.022 93.6066 433.872 91.3264 434.54 88.9901L446.537 47L447.921 39.0062C449.923 27.4342 456.238 17.0513 465.591 9.94963L468.696 7.59269C474.756 2.99108 482.157 0.5 489.766 0.5C496.157 0.5 502.424 2.25754 507.883 5.58035L511.448 7.74999C518.719 12.1758 524.732 18.3941 528.912 25.8094L532.48 32.1409C536.165 38.679 538.882 45.7174 540.545 53.0359L545.187 73.4599C547.079 81.7857 550.03 89.8349 553.967 97.411L577.398 142.497C579.82 147.158 581.872 152.004 583.533 156.987L595.608 193.212C599.527 204.968 605.596 215.894 613.508 225.432L643.997 262.19C651.034 270.674 654.203 281.714 652.738 292.639L652.556 293.996C650.702 307.815 641.282 319.44 628.148 324.118C618.503 327.553 607.868 326.865 598.747 322.215L597.166 321.409C590.853 318.19 585.473 313.403 581.542 307.507L566.537 285L559.632 274.943C549.173 259.708 534.148 248.186 516.722 242.036C511.941 240.349 507.022 239.081 502.021 238.247L484.965 235.405C475.5 233.827 465.79 234.668 456.737 237.849C441.932 243.051 429.931 254.134 423.57 268.48L415.404 286.897C411.872 294.861 406.576 301.918 399.915 307.534C389.959 315.928 377.448 320.692 364.43 321.043L357.095 321.242C350.747 321.413 344.401 320.813 338.197 319.454L295.037 310L272.502 306.913C263.238 305.644 253.841 305.681 244.587 307.022L232.234 308.812C226.779 309.603 221.398 310.843 216.147 312.52L188.037 321.5L169.777 326.065C160.788 328.312 151.356 328.06 142.501 325.335L140.636 324.761C133.683 322.622 127.382 318.762 122.317 313.539C116.898 307.95 113.088 301.002 111.291 293.427L111.044 292.386C108.458 281.487 109.84 270.022 114.942 260.05L116.066 257.853C117.378 255.289 118.894 252.833 120.599 250.511L133.903 232.395C138.971 225.494 144.905 219.272 151.559 213.882L222.992 156.017C228.34 151.685 233.206 146.789 237.505 141.415L244.696 132.427C248.871 127.208 251.828 121.123 253.354 114.617L255.871 103.876C257.547 96.7232 255.722 89.1998 250.955 83.6106C246.565 78.4642 240.141 75.5 233.377 75.5H228.249C225.452 75.5 222.665 75.8431 219.951 76.5216L172.734 88.3257C161.979 91.0146 150.61 89.6613 140.786 84.5227L137.729 82.9236C128.669 78.1845 121.957 69.9279 119.167 60.0912C115.941 48.7148 118.311 36.4823 125.553 27.1341L126.597 25.7869Z";

// Synchronously rasterize checkthis.svg with exact Figma Inner Shadow at 4K resolution
function renderCheckthisLogoCanvas(width = 2624, height = 1320): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const scale = width / 656; // 4x scale for crisp 4K Retina
  ctx.save();
  ctx.scale(scale, scale);

  const p1 = new Path2D(CHECKTHIS_PATH_1);
  const p2 = new Path2D(CHECKTHIS_PATH_2);

  const logoPath = new Path2D();
  logoPath.addPath(p1);
  logoPath.addPath(p2);

  // 1. Draw Solid Black Logo Base
  ctx.fillStyle = "#000000";
  ctx.fill(logoPath);

  // 2. Exact Figma Inner Shadow Filter (dx: 1, dy: -1, blur: 8.85, color: white)
  ctx.save();
  ctx.clip(logoPath);

  const invertedFrame = new Path2D();
  invertedFrame.rect(-500, -500, 656 + 1000, 330 + 1000);
  invertedFrame.addPath(logoPath);

  ctx.shadowColor = "rgba(255, 255, 255, 0.95)";
  ctx.shadowBlur = 9; // Matches Figma stdDeviation="8.85"
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = -1;
  ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
  ctx.fill(invertedFrame, "evenodd");

  // Secondary ambient pass for velvety edge transition
  ctx.shadowBlur = 18;
  ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
  ctx.fill(invertedFrame, "evenodd");

  ctx.restore();
  ctx.restore();

  return canvas;
}

// --------------------------------------------------------------------------
// 5 HD Multiplane Assets (3 Videos + 2 Images) for Z-Depth Layering
// --------------------------------------------------------------------------
interface WebGlVideoTexture {
  texture: WebGLTexture;
  video: HTMLVideoElement;
  update: () => void;
  dispose: () => void;
}

interface WebGlImageTexture {
  texture: WebGLTexture;
  image: HTMLImageElement;
  dispose: () => void;
}

function createWebGlVideoTexture(
  gl: WebGLRenderingContext,
  src: string,
  textureUnit: number,
  onAspectReady?: (aspect: number) => void
): WebGlVideoTexture {
  const texture = gl.createTexture()!;
  gl.activeTexture(textureUnit);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // 1x1 black placeholder pixel while video buffers
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  const video = document.createElement("video");
  video.src = src;
  video.crossOrigin = "anonymous";
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.autoplay = true;
  video.setAttribute("playsinline", "true");
  video.setAttribute("webkit-playsinline", "true");
  video.preload = "auto";

  const onLoadedMetadata = () => {
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      onAspectReady?.(video.videoWidth / video.videoHeight);
    }
  };
  video.addEventListener("loadedmetadata", onLoadedMetadata);

  video.play().catch(() => {
    // Autoplay policy fallback: resume on first user interaction
    const resume = () => {
      video.play().catch(() => {});
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("touchstart", resume);
    };
    window.addEventListener("pointerdown", resume);
    window.addEventListener("touchstart", resume);
  });

  const update = () => {
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      gl.activeTexture(textureUnit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    }
  };

  const dispose = () => {
    video.removeEventListener("loadedmetadata", onLoadedMetadata);
    video.pause();
    video.src = "";
    video.load();
    gl.deleteTexture(texture);
  };

  return { texture, video, update, dispose };
}

function createWebGlImageTexture(
  gl: WebGLRenderingContext,
  src: string,
  textureUnit: number,
  onAspectReady?: (aspect: number) => void
): WebGlImageTexture {
  const texture = gl.createTexture()!;
  gl.activeTexture(textureUnit);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // 1x1 black placeholder pixel while image loads
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  const img = new window.Image();
  img.crossOrigin = "anonymous";
  img.src = src;
  img.onload = () => {
    gl.activeTexture(textureUnit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      onAspectReady?.(img.naturalWidth / img.naturalHeight);
    }
  };

  const dispose = () => {
    img.onload = null;
    gl.deleteTexture(texture);
  };

  return { texture, image: img, dispose };
}

// --------------------------------------------------------------------------
// Random Character Reveal & Disappear Component
// Renders text where letters appear / disappear in random position order
// --------------------------------------------------------------------------
interface RandomLetterTextProps {
  line1: string;
  line2: string;
  isRevealing: boolean;
  isExiting: boolean;
  onRevealComplete?: () => void;
}

function RandomLetterText({
  line1,
  line2,
  isRevealing,
  isExiting,
  onRevealComplete,
}: RandomLetterTextProps) {
  const fullText = `${line1}\n${line2}`;
  const [visibleMap, setVisibleMap] = useState<{ [index: number]: boolean }>({});
  const statusRef = useRef<"idle" | "revealing" | "revealed" | "exiting" | "hidden">("idle");
  const onRevealCompleteRef = useRef(onRevealComplete);
  onRevealCompleteRef.current = onRevealComplete;

  const shuffledIndicesRef = useRef<number[]>([]);

  // Compute non-space indices once
  useEffect(() => {
    const nonSpaceIndices = fullText
      .split("")
      .map((c, i) => (c !== " " && c !== "\n" ? i : -1))
      .filter((i) => i !== -1);

    // Fisher-Yates shuffle
    for (let i = nonSpaceIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nonSpaceIndices[i], nonSpaceIndices[j]] = [nonSpaceIndices[j], nonSpaceIndices[i]];
    }
    shuffledIndicesRef.current = nonSpaceIndices;
  }, [fullText]);

  // Handle Entrance Reveal (Runs EXACTLY ONCE)
  useEffect(() => {
    if (!isRevealing || isExiting) return;
    if (statusRef.current === "revealed" || statusRef.current === "revealing") return;

    statusRef.current = "revealing";
    const indices = shuffledIndicesRef.current;
    let step = 0;

    const interval = setInterval(() => {
      step += Math.floor(Math.random() * 2) + 2;
      if (step >= indices.length) {
        const map: { [index: number]: boolean } = {};
        indices.forEach((idx) => {
          map[idx] = true;
        });
        setVisibleMap(map);
        statusRef.current = "revealed";
        clearInterval(interval);
        onRevealCompleteRef.current?.();
      } else {
        const map: { [index: number]: boolean } = {};
        indices.slice(0, step).forEach((idx) => {
          map[idx] = true;
        });
        setVisibleMap(map);
      }
    }, 24);

    return () => clearInterval(interval);
  }, [isRevealing, isExiting]);

  // Handle Scroll Exit & Return
  useEffect(() => {
    if (!isRevealing) return;

    const indices = shuffledIndicesRef.current;

    if (isExiting) {
      if (statusRef.current === "hidden" || statusRef.current === "exiting") return;
      statusRef.current = "exiting";

      let step = indices.length;
      const interval = setInterval(() => {
        step -= Math.floor(Math.random() * 2) + 2;
        if (step <= 0) {
          setVisibleMap({});
          statusRef.current = "hidden";
          clearInterval(interval);
        } else {
          const map: { [index: number]: boolean } = {};
          indices.slice(0, step).forEach((idx) => {
            map[idx] = true;
          });
          setVisibleMap(map);
        }
      }, 16);

      return () => clearInterval(interval);
    } else if (statusRef.current === "hidden" || statusRef.current === "exiting") {
      // Scrolled back up to top -> re-reveal
      statusRef.current = "revealing";
      let step = 0;
      const interval = setInterval(() => {
        step += Math.floor(Math.random() * 2) + 2;
        if (step >= indices.length) {
          const map: { [index: number]: boolean } = {};
          indices.forEach((idx) => {
            map[idx] = true;
          });
          setVisibleMap(map);
          statusRef.current = "revealed";
          clearInterval(interval);
        } else {
          const map: { [index: number]: boolean } = {};
          indices.slice(0, step).forEach((idx) => {
            map[idx] = true;
          });
          setVisibleMap(map);
        }
      }, 20);

      return () => clearInterval(interval);
    }
  }, [isRevealing, isExiting]);

  const line1Chars = line1.split("");
  const line2Chars = line2.split("");
  const line2Offset = line1.length + 1;

  return (
    <h1 className="font-sans text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl font-black uppercase tracking-[-0.02em] text-black leading-[1.12]">
      <span className="block whitespace-nowrap">
        {line1Chars.map((char, i) => (
          <span
            key={i}
            className={`inline-block transition-opacity duration-100 ${visibleMap[i] ? "opacity-100" : "opacity-0"
              }`}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>
      <span className="block whitespace-nowrap">
        {line2Chars.map((char, i) => {
          const globalIdx = line2Offset + i;
          return (
            <span
              key={i}
              className={`inline-block transition-opacity duration-100 ${visibleMap[globalIdx] ? "opacity-100" : "opacity-0"
                }`}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          );
        })}
      </span>
    </h1>
  );
}

// --------------------------------------------------------------------------
// TouchTexture Engine (Extracted directly from podium.global source code)
// --------------------------------------------------------------------------
interface TouchPoint {
  x: number;
  y: number;
  age: number;
  force: number;
}

class TouchTexture {
  size: number;
  maxAge: number;
  radius: number;
  intensity: number;
  minForce: number;
  trail: TouchPoint[];
  force: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  constructor({
    size = 256,
    maxAge = 750,
    radius = 0.10,
    intensity = 0.85,
    minForce = 0.35,
  } = {}) {
    this.size = size;
    this.maxAge = maxAge;
    this.radius = radius;
    this.intensity = intensity;
    this.minForce = minForce;
    this.trail = [];
    this.force = 0;

    this.canvas = document.createElement("canvas");
    this.canvas.width = this.size;
    this.canvas.height = this.size;
    this.ctx = this.canvas.getContext("2d")!;
    this.clear();
  }

  clear() {
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  addTouch(point: { x: number; y: number }) {
    const prev = this.trail[this.trail.length - 1];
    if (prev) {
      const dx = prev.x - point.x;
      const dy = prev.y - point.y;
      const distSq = dx * dx + dy * dy;
      const force = Math.max(this.minForce, Math.min(10000 * distSq, 1));
      this.force = this.force * 0.88 + force * 0.12;

      const count = Math.ceil(distSq / Math.pow(0.4 * this.radius, 2));
      if (count > 1) {
        for (let i = 1; i < count; i++) {
          this.trail.push({
            x: prev.x - (dx / count) * i,
            y: prev.y - (dy / count) * i,
            age: 0,
            force: this.force,
          });
        }
      }
    }

    this.trail.push({
      x: point.x,
      y: point.y,
      age: 0,
      force: this.force || this.minForce,
    });
  }

  update(deltaMs: number) {
    this.clear();
    for (let i = this.trail.length - 1; i >= 0; i--) {
      const t = this.trail[i];
      t.age += deltaMs;
      if (t.age > this.maxAge) {
        this.trail.splice(i, 1);
      } else {
        this.drawTouch(t);
      }
    }
  }

  drawTouch(t: TouchPoint) {
    const x = t.x * this.size;
    const y = (1.0 - t.y) * this.size; // WebGL UV coordinate alignment
    const normAge = t.age / this.maxAge;

    // Fast ease-in first 25%, smooth decay remaining 75%
    const alpha =
      normAge < 0.25
        ? Math.sqrt(1 - Math.pow(normAge / 0.25 - 1, 2))
        : Math.sqrt(1 - Math.pow((normAge - 0.25) / 0.75, 2));

    const r = this.size * this.radius * alpha * t.force;
    if (r <= 0) return;

    this.ctx.globalCompositeOperation = "screen";
    const grad = this.ctx.createRadialGradient(x, y, Math.max(0, 0.1 * r), x, y, Math.max(0, r));
    grad.addColorStop(0, `rgba(255, 255, 255, ${this.intensity * alpha})`);
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");

    this.ctx.beginPath();
    this.ctx.fillStyle = grad;
    this.ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
    this.ctx.fill();
  }
}

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

const VERTEX_SHADER = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = (position + 1.0) * 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
#extension GL_OES_standard_derivatives : enable
precision highp float;
uniform vec2 uResolution;
uniform vec2 uFocalPoint;
uniform float uRotation;
uniform float uZoom;
uniform float uShapeReveal; // 0.0 = solid center black circle, 1.0 = fully expanded SVG
uniform float uSuctionStrength; // Pure gravitational suction pull towards focal center
uniform float uCollageZoom; // Forward parallax zoom for collage inside SVG
uniform float uTilt; // 3D perspective pitch tilt based on scroll velocity
uniform sampler2D uLogoTexture;
uniform sampler2D uMouseTexture;
uniform sampler2D uTex1; // Video 1 (/video1.mov, Z = 0.80)
uniform sampler2D uTex2; // Video 2 (/video2.mov, Z = 1.35)
uniform sampler2D uTex3; // Gambar 1 (/gambar1.jpeg, Z = 0.55)
uniform sampler2D uTex4; // Video 3 (/video3.mov, Z = 2.40)
uniform sampler2D uTex5; // Gambar 2 (/gambar2.png, Z = 1.05)
uniform float uTexAspect1;
uniform float uTexAspect2;
uniform float uTexAspect3;
uniform float uTexAspect4;
uniform float uTexAspect5;
uniform float uFluidIntensity;
uniform float uNoiseIntensity;
uniform float uCardOpacity; // Fade cards smoothly from 1.0 -> 0.0 between 90% and 100% scroll
uniform vec2 uMouseNdc; // Real-time cursor position in NDC [-1.0, 1.0]
uniform float uCursorSuction; // 0.0 -> 1.0 between 90% and 100% scroll for black hole vacuum suction
varying vec2 vUv;

// --------------------------------------------------------------------------
// High-entropy noise function extracted from podium.global
// --------------------------------------------------------------------------
float hash(vec2 p) {
  return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x))));
}

float noise(vec2 x) {
  vec2 i = floor(x);
  vec2 f = fract(x);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// --------------------------------------------------------------------------
// Multiplane Layer Sampler with Aspect-Ratio-Preserved Object-Fit Cover
// --------------------------------------------------------------------------
vec4 sampleLayer(sampler2D tex, vec2 rawNdc, float screenAspect, vec2 center, vec2 cardHalfSize, float imgAspect, float zDepth, float baseZoom, float tilt, float innerCrop) {
  // 1. Z-dependent forward zoom:
  float zZoom = baseZoom + (baseZoom - 1.0) * (zDepth - 1.0) * 1.5;
  // Compact scaling factor so cards are smaller & elegant
  float distanceScale = 0.50 * max(0.01, zZoom);
  
  // 2. Z-dependent 3D C-curve tilt:
  float yNorm = clamp(rawNdc.y, -1.2, 1.2);
  float cCurveArc = yNorm * yNorm * tilt * zDepth;
  vec2 zTiltedNdc = vec2(
    rawNdc.x * (1.0 + cCurveArc * 0.32),
    rawNdc.y * (1.0 + cCurveArc * 0.16)
  );

  // 3. Aspect-corrected spatial coordinates
  vec2 worldPos = vec2(zTiltedNdc.x * screenAspect, zTiltedNdc.y) * (0.5 / distanceScale);
  
  // 4. Test bounds in pristine multiplane world space (Exact, Upright, Unrotated)
  vec2 localPos = worldPos - center;
  if (abs(localPos.x) <= cardHalfSize.x && abs(localPos.y) <= cardHalfSize.y) {
    // Card normalized coordinate [0.0, 1.0]
    vec2 cardUv = (localPos / cardHalfSize) * 0.5 + 0.5;

    // 5. OBJECT-FIT: COVER (100% Zero Stretching, Crisp True Proportions)
    float cardAspect = cardHalfSize.x / cardHalfSize.y;
    vec2 imgUv = cardUv;
    if (cardAspect > imgAspect) {
      // Card is wider than image: fit width (x in [0,1]), crop top/bottom
      float scale = imgAspect / cardAspect;
      imgUv.y = (cardUv.y - 0.5) * scale + 0.5;
    } else {
      // Card is taller than image: fit height (y in [0,1]), crop left/right
      float scale = cardAspect / imgAspect;
      imgUv.x = (cardUv.x - 0.5) * scale + 0.5;
    }
    
    // Zoom in slightly if innerCrop is active to clip out recording padding/borders:
    if (innerCrop > 0.0) {
      imgUv = (imgUv - 0.5) * (1.0 - innerCrop * 2.0) + 0.5;
    }
    imgUv = clamp(imgUv, 0.0, 1.0);

    #ifdef GL_OES_standard_derivatives
      vec2 fw = fwidth(cardUv);
      vec2 edgeDist = min(cardUv, 1.0 - cardUv) / max(fw, vec2(0.001));
      float edgeAlpha = clamp(min(edgeDist.x, edgeDist.y), 0.0, 1.0);
    #else
      float edgeAlpha = 1.0;
    #endif

    // Clean HD photo texture: pristine, crisp, and undistorted
    vec3 col = texture2D(tex, imgUv).rgb;
    return vec4(col, edgeAlpha);
  }
  return vec4(0.0);
}

// --------------------------------------------------------------------------
// Vacuum Cleaner Dust Inhalation Field Calculator
// --------------------------------------------------------------------------
vec2 getSuctionNdc(vec2 cleanNdc, vec2 mouseNdc, float layerSuction) {
  if (layerSuction <= 0.0001) return cleanNdc;
  vec2 toCursor = mouseNdc - cleanNdc;
  float distToCursor = length(toCursor);
  float pullPower = pow(clamp(layerSuction, 0.0, 1.0), 1.25);
  
  vec2 pullDir = (distToCursor > 0.0001) ? (toCursor / distToCursor) : vec2(0.0, 1.0);
  vec2 perpDir = vec2(-pullDir.y, pullDir.x);
  
  // 1. Strong aerodynamic vacuum pull along the airflow line to cursor nozzle:
  float axialPull = (pullPower * 2.8) / (pow(distToCursor, 0.55) + 0.12);
  
  // 2. Transverse funnel pinch: Squeezes card edges tightly inwards as they stream into the nozzle:
  float lateralPinch = (pullPower * 1.6) / (distToCursor + 0.18);
  
  vec2 vacuumDisplacement = pullDir * axialPull + perpDir * dot(toCursor, perpDir) * lateralPinch;
  return cleanNdc - vacuumDisplacement;
}

void main() {
  vec2 screenPixel = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
  vec2 centerPixel = uResolution * 0.5;

  float targetLogoWidth = min(uResolution.x * 0.72, 920.0);
  float targetLogoHeight = targetLogoWidth * (330.0 / 656.0);

  // 1. Mouse Trail sampled directly at fragment UV (active on SVG mask at 0% scroll)
  vec3 mouseTrail = texture2D(uMouseTexture, vUv).rgb;
  float trailStrength = mouseTrail.r;

  // Ultra-fine high-frequency micro-grain noise (much smaller, denser dust dots)
  float n1 = noise(vUv * 2400.0);
  float n2 = noise(vUv * 4800.0) * 0.5;
  float fnoise = ((n1 + n2) / 1.5) * uNoiseIntensity;

  // Localized micro-displacement for interior fluid photos
  float hoverFade = clamp(1.0 - (uZoom - 1.0) / 4.0, 0.0, 1.0);
  vec2 localDisplacement = vec2(fnoise - 0.5) * trailStrength * 0.024 * uFluidIntensity * hoverFade;

  // 1. Clean, pure geometric vector offset (SILKY SMOOTH, RAZOR-SHARP VECTOR EDGES)
  vec2 rawOffset = screenPixel - centerPixel;
  vec2 ndc = rawOffset / (uResolution * 0.5);
  float edgeDist = length(ndc);
  
  float suctionProgress = clamp((uZoom - 1.0) / 36.0, 0.0, 1.0);
  float edgeSuctionWarp = 1.0 - (uSuctionStrength * 0.50) * pow(clamp(edgeDist, 0.0, 1.5), 1.8) * (0.3 + 0.7 * suctionProgress);

  vec2 displacedOffset = (rawOffset * edgeSuctionWarp) / uZoom;
  vec2 rotatedOffset = mat2(cos(uRotation), -sin(uRotation), sin(uRotation), cos(uRotation)) * displacedOffset;
  vec2 logoCoord = rotatedOffset / vec2(targetLogoWidth, targetLogoHeight) + uFocalPoint;

  // 2. Multiplane Layered 3D Composition with Direct Vacuum Cleaner Dust Suction
  float screenAspect = uResolution.x / uResolution.y;
  vec2 cleanNdc = (screenPixel - centerPixel) / (uResolution * 0.5);
  vec2 fluidNdc = cleanNdc + localDisplacement;

  // ── 2-STAGE VACUUM SUCTION FIELD (90% -> 95% for first 4 cards, 95% -> 100% for last card) ──
  float suction1 = clamp(uCursorSuction / 0.50, 0.0, 1.0);
  float suction2 = clamp((uCursorSuction - 0.50) / 0.50, 0.0, 1.0);

  vec2 suctionNdc1 = getSuctionNdc(fluidNdc, uMouseNdc, suction1);
  vec2 suctionNdc2 = getSuctionNdc(fluidNdc, uMouseNdc, suction2);

  float cardOpacity1 = uCardOpacity * max(0.0, 1.0 - pow(suction1, 1.6));
  float cardOpacity2 = uCardOpacity * max(0.0, 1.0 - pow(suction2, 1.6));

  vec3 collageColor = vec3(0.0);
  
  // Layer 0: Gambar 1 (/gambar1.png, Z = 0.55 - Deep Background, ~3:4 portrait)
  vec4 l0 = sampleLayer(uTex3, suctionNdc1, screenAspect, vec2(0.18, 0.16), vec2(0.18, 0.235), uTexAspect3, 0.55, uCollageZoom, uTilt, 0.0);
  collageColor = mix(collageColor, l0.rgb, l0.a * cardOpacity1);

  // Layer 1: Video 3 (/video3.mov, Z = 0.80 - Mid-Back, 16:9 widescreen)
  vec4 l1 = sampleLayer(uTex1, suctionNdc1, screenAspect, vec2(-0.72, 0.12), vec2(0.24, 0.135), uTexAspect1, 0.80, uCollageZoom, uTilt, 0.0);
  collageColor = mix(collageColor, l1.rgb, l1.a * cardOpacity1);

  // Layer 2: Gambar 2 (/gambar2.png, Z = 1.05 - Mid-Front, ~1.54:1 aspect)
  vec4 l2 = sampleLayer(uTex5, suctionNdc1, screenAspect, vec2(0.62, 0.12), vec2(0.24, 0.155), uTexAspect5, 1.05, uCollageZoom, uTilt, 0.0);
  collageColor = mix(collageColor, l2.rgb, l2.a * cardOpacity1);

  // Layer 3: Video 2 (/video2.mov, Z = 1.35 - Foreground, ~1.43:1 aspect - 8% inner crop to remove Safari window border)
  vec4 l3 = sampleLayer(uTex2, suctionNdc1, screenAspect, vec2(-0.40, -0.04), vec2(0.22, 0.154), uTexAspect2, 1.35, uCollageZoom, uTilt, 0.08);
  collageColor = mix(collageColor, l3.rgb, l3.a * cardOpacity1);

  // Layer 4: Video 1 (/video1.mov, Z = 2.40 - ULTRA FOREGROUND / Main Focal Card, ~1.54:1 Retina)
  vec4 l4 = sampleLayer(uTex4, suctionNdc2, screenAspect, vec2(0.00, -0.22), vec2(0.32, 0.208), uTexAspect4, 2.40, uCollageZoom, uTilt, 0.0);
  collageColor = mix(collageColor, l4.rgb, l4.a * cardOpacity2);

  vec3 whiteBg = vec3(1.0, 1.0, 1.0);
  vec3 finalColor = whiteBg;

  // ── REVEAL APERTURE MASK (Starts as a bold circle on the SVG, blooms to full SVG) ──
  float distFromCenter = length(screenPixel - centerPixel);
  float initialDotRadius = 26.0; // Bold enlarged circular aperture (radius 26px, diameter ~52px)
  
  float maxReach = length(uResolution);
  float expandRadius = initialDotRadius + pow(clamp(uShapeReveal, 0.0, 1.0), 1.45) * maxReach;
  float waveExpansion = (uShapeReveal >= 0.999) ? 1.0 : smoothstep(expandRadius + 1.2, expandRadius - 1.2, distFromCenter);

  if (logoCoord.x >= 0.0 && logoCoord.x <= 1.0 && logoCoord.y >= 0.0 && logoCoord.y <= 1.0) {
    vec4 logoTex = texture2D(uLogoTexture, logoCoord);

    // Silky-smooth anti-aliased subpixel alpha
    float sharpAlpha = clamp(logoTex.a, 0.0, 1.0);

    // Multiplane 3D collage content inside the SVG shape
    vec3 interiorContent = collageColor;
    vec3 fluidInterior = interiorContent;

    // The shape alpha is the SVG clipped by the expanding circular aperture!
    float finalShapeAlpha = sharpAlpha * waveExpansion;

    finalColor = mix(whiteBg, fluidInterior, finalShapeAlpha);
  }

  // 4. Breakthrough to Fullscreen Multiplane Collage during deep zoom
  if (uZoom > 24.0) {
    float zoomBreakthrough = smoothstep(24.0, 38.0, uZoom);
    finalColor = mix(finalColor, collageColor, zoomBreakthrough);
  }

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

interface PodiumIntroHeroProps {
  onIntroReady?: () => void;
  onIntroComplete?: () => void;
  onLoadingCount?: (count: number) => void;
  onScrollProgress?: (progress: number) => void;
  scrollProgress?: number;
  cursorSuction?: number;
  hideTopBar?: boolean;
}

export function PodiumIntroHero({
  onIntroReady,
  onIntroComplete,
  onLoadingCount,
  onScrollProgress,
  scrollProgress,
  cursorSuction,
  hideTopBar = true,
}: PodiumIntroHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [count, setCount] = useState(100);
  const [internalScrollPct, setInternalScrollPct] = useState(0);
  const [introStep, setIntroStep] = useState<"loading" | "blooming" | "top" | "tagline" | "ready">("ready");
  const [isScrollUnlocked, setIsScrollUnlocked] = useState(true);
  const [puncIndex, setPuncIndex] = useState(0);
  const [isScrollExiting, setIsScrollExiting] = useState(false);

  const uniformsRef = useRef({
    zoom: 1.0,
    shapeReveal: 1.0, // Fully revealed immediately without loading wait
    rotation: 0.0, // Starts straight at 0 deg
    focalX: 0.50,  // Starts centered at (0.50, 0.50) while straight
    focalY: 0.50,
    collageZoom: 1.0,
    tiltVal: 0.0,
    cardOpacity: 1.0,
    cursorSuction: 0.0,
    mouseX: 0.0,
    mouseY: 0.0,
    targetMouseX: 0.0,
    targetMouseY: 0.0,
    texAspect1: 3840.0 / 2160.0, // Video 3 (/video3.mov)
    texAspect2: 2806.0 / 1962.0, // Video 2 (/video2.mov)
    texAspect3: 492.0 / 644.0,   // Gambar 1 (/gambar1.png - portrait)
    texAspect4: 3024.0 / 1964.0, // Video 1 (/video1.mov)
    texAspect5: 3024.0 / 1964.0, // Gambar 2 (/gambar2.png)
  });

  const isRenderingActiveRef = useRef(true);

  // Sync external scrollProgress when controlled by parent page
  useEffect(() => {
    if (scrollProgress === undefined || !isScrollUnlocked) return;
    isRenderingActiveRef.current = scrollProgress < 1.0;
    uniformsRef.current.zoom = 1.0 + Math.pow(scrollProgress, 2.2) * 44.0;
    uniformsRef.current.collageZoom = 1.0 + scrollProgress * 0.35;

    // ── SCROLL 1 DYNAMIC FRAME-BY-FRAME ROTATION & FOCAL GLIDE ──
    const targetTiltRad = (LOGO_ROTATION_DEG * Math.PI) / 180.0; // -45 deg (-0.7854 rad)

    if (scrollProgress <= 0.28) {
      // 0% -> 28%: Smoothly tilt from straight (0 deg) to diagonal (-45 deg)
      const pTilt = Math.max(0.0, Math.min(1.0, scrollProgress / 0.28));
      const easedTilt = pTilt * pTilt * (3.0 - 2.0 * pTilt); // Smooth cubic ease
      uniformsRef.current.rotation = easedTilt * targetTiltRad;

      // Focal point smoothly glides from center (0.50, 0.50) to diagonal resting position (RESTING_FOCAL_X, RESTING_FOCAL_Y)
      uniformsRef.current.focalX = 0.50 + (RESTING_FOCAL_X - 0.50) * easedTilt;
      uniformsRef.current.focalY = 0.50 + (RESTING_FOCAL_Y - 0.50) * easedTilt;
    } else if (scrollProgress > 0.28 && scrollProgress <= 0.86) {
      // 28% -> 86%: Continuous full swing from -45 deg to -225 deg
      const rotNorm = (scrollProgress - 0.28) / (0.86 - 0.28);
      uniformsRef.current.rotation = targetTiltRad - rotNorm * Math.PI;

      // Deep zoom focal glide towards letter Z (LOGO_FOCAL_X, LOGO_FOCAL_Y)
      const zoomGlideP = Math.max(0.0, Math.min(1.0, (scrollProgress - 0.28) / (0.60 - 0.28)));
      const easedZoomGlide = zoomGlideP * zoomGlideP * (3.0 - 2.0 * zoomGlideP);
      uniformsRef.current.focalX = RESTING_FOCAL_X + (LOGO_FOCAL_X - RESTING_FOCAL_X) * easedZoomGlide;
      uniformsRef.current.focalY = RESTING_FOCAL_Y + (LOGO_FOCAL_Y - RESTING_FOCAL_Y) * easedZoomGlide;
    } else {
      uniformsRef.current.rotation = targetTiltRad - Math.PI;
      uniformsRef.current.focalX = LOGO_FOCAL_X;
      uniformsRef.current.focalY = LOGO_FOCAL_Y;
    }

    // Direct magnetic vacuum suction if not externally overridden
    if (cursorSuction === undefined) {
      if (scrollProgress >= 0.90) {
        const suctionNorm = Math.min(1.0, (scrollProgress - 0.90) / 0.10);
        uniformsRef.current.cursorSuction = suctionNorm;
        uniformsRef.current.cardOpacity = Math.max(0.0, 1.0 - Math.pow(suctionNorm, 1.8));
      } else {
        uniformsRef.current.cursorSuction = 0.0;
        uniformsRef.current.cardOpacity = 1.0;
      }
    }

    if (scrollProgress > 0.09) {
      setIsScrollExiting(true);
    } else {
      setIsScrollExiting(false);
    }
  }, [scrollProgress, cursorSuction, isScrollUnlocked]);

  // Sync external cursorSuction when controlled by triggered animation
  useEffect(() => {
    if (cursorSuction === undefined) return;
    uniformsRef.current.cursorSuction = cursorSuction;
    uniformsRef.current.cardOpacity = Math.max(0.0, 1.0 - Math.pow(cursorSuction, 1.6));
  }, [cursorSuction]);

  // Cycle punctuation for "IZA design." -> "IZA design?" -> "IZA design!"
  useEffect(() => {
    const id = setInterval(() => setPuncIndex((i) => (i + 1) % PUNCTUATION.length), 2200);
    return () => clearInterval(id);
  }, []);

  // 1. Instantly ready on mount (Zero Loading Screen Delay)
  useEffect(() => {
    setCount(100);
    onLoadingCount?.(100);
    setIsScrollUnlocked(true);
    onIntroReady?.();
  }, [onLoadingCount, onIntroReady]);

  // 2. WebGL Engine with Authentic podium.global TouchTexture & Shader
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: false, antialias: true });
    if (!gl) return;

    gl.getExtension("OES_standard_derivatives");

    const program = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
    if (!program) return;

    gl.useProgram(program);

    // Full-screen quad
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
        1, -1,
        -1, 1,
        -1, 1,
        1, -1,
        1, 1,
      ]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Uniform Locations
    const uResolutionLoc = gl.getUniformLocation(program, "uResolution");
    const uFocalPointLoc = gl.getUniformLocation(program, "uFocalPoint");
    const uRotationLoc = gl.getUniformLocation(program, "uRotation");
    const uZoomLoc = gl.getUniformLocation(program, "uZoom");
    const uShapeRevealLoc = gl.getUniformLocation(program, "uShapeReveal");
    const uSuctionStrengthLoc = gl.getUniformLocation(program, "uSuctionStrength");
    const uCollageZoomLoc = gl.getUniformLocation(program, "uCollageZoom");
    const uTiltLoc = gl.getUniformLocation(program, "uTilt");
    const uLogoTextureLoc = gl.getUniformLocation(program, "uLogoTexture");
    const uMouseTextureLoc = gl.getUniformLocation(program, "uMouseTexture");
    const uTex1Loc = gl.getUniformLocation(program, "uTex1");
    const uTex2Loc = gl.getUniformLocation(program, "uTex2");
    const uTex3Loc = gl.getUniformLocation(program, "uTex3");
    const uTex4Loc = gl.getUniformLocation(program, "uTex4");
    const uTex5Loc = gl.getUniformLocation(program, "uTex5");
    const uTexAspect1Loc = gl.getUniformLocation(program, "uTexAspect1");
    const uTexAspect2Loc = gl.getUniformLocation(program, "uTexAspect2");
    const uTexAspect3Loc = gl.getUniformLocation(program, "uTexAspect3");
    const uTexAspect4Loc = gl.getUniformLocation(program, "uTexAspect4");
    const uTexAspect5Loc = gl.getUniformLocation(program, "uTexAspect5");
    const uFluidIntensityLoc = gl.getUniformLocation(program, "uFluidIntensity");
    const uNoiseIntensityLoc = gl.getUniformLocation(program, "uNoiseIntensity");
    const uCardOpacityLoc = gl.getUniformLocation(program, "uCardOpacity");
    const uMouseNdcLoc = gl.getUniformLocation(program, "uMouseNdc");
    const uCursorSuctionLoc = gl.getUniformLocation(program, "uCursorSuction");

    // Texture 0: Synchronous Instant Render of checkthis.svg with exact Figma Inner Shadow
    const logoTexture = gl.createTexture();
    const checkthisCanvas = renderCheckthisLogoCanvas(2624, 1320);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, logoTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, checkthisCanvas);

    // Texture 1: Dynamic TouchTexture Trail Canvas (podium.global)
    const touchTexture = new TouchTexture({
      size: 256,
      maxAge: 750,
      radius: 0.10,
      intensity: 0.85,
    });

    const mouseTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, mouseTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, touchTexture.canvas);

    // Textures 2..6: 3 Videos + 2 Images with Dynamic Aspect Ratios and Real-time Frame Upload
    const tex1Obj = createWebGlVideoTexture(gl, "/video3.mov", gl.TEXTURE2, (aspect) => {
      uniformsRef.current.texAspect1 = aspect;
    });
    const tex2Obj = createWebGlVideoTexture(gl, "/video2.mov", gl.TEXTURE3, (aspect) => {
      uniformsRef.current.texAspect2 = aspect;
    });
    const tex3Obj = createWebGlImageTexture(gl, "/gambar1.png", gl.TEXTURE4, (aspect) => {
      uniformsRef.current.texAspect3 = aspect;
    });
    const tex4Obj = createWebGlVideoTexture(gl, "/video1.mov", gl.TEXTURE5, (aspect) => {
      uniformsRef.current.texAspect4 = aspect;
    });
    const tex5Obj = createWebGlImageTexture(gl, "/gambar2.png", gl.TEXTURE6, (aspect) => {
      uniformsRef.current.texAspect5 = aspect;
    });

    // Resize Handler
    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // Pointer Listeners
    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / rect.width;
      const normY = (e.clientY - rect.top) / rect.height;
      touchTexture.addTouch({ x: normX, y: normY });

      // Realtime cursor position in exact screen NDC [-1.0, 1.0] (parities match cleanNdc)
      uniformsRef.current.targetMouseX = (normX - 0.5) * 2.0;
      uniformsRef.current.targetMouseY = (normY - 0.5) * 2.0;
    };

    window.addEventListener("pointermove", handlePointerMove);

    // Render Loop
    let rafId: number;
    let lastTime = performance.now();
    let lastZoom = 1.0;

    const render = (time: number) => {
      if (!isRenderingActiveRef.current) {
        rafId = requestAnimationFrame(render);
        return;
      }

      const deltaMs = Math.min(time - lastTime, 50);
      lastTime = time;

      // Update TouchTexture trail
      touchTexture.update(deltaMs);

      // Smooth velocity-driven 3D tilt calculated continuously from zoom change rate
      const currentZoom = uniformsRef.current.zoom;
      const zoomRate = (currentZoom - lastZoom) / Math.max(0.001, deltaMs / 1000);
      lastZoom = currentZoom;

      const targetTilt = gsap.utils.clamp(-0.45, 0.45, (zoomRate / 35.0) * 0.45);

      // Continuous exponential spring damping (zero jitter, pure silky smoothness)
      const lerpFactor = 1.0 - Math.exp(-6.5 * (deltaMs / 1000));
      uniformsRef.current.tiltVal += (targetTilt - uniformsRef.current.tiltVal) * lerpFactor;

      // Smooth mouse position damping for vacuum vortex
      const mouseLerp = 1.0 - Math.exp(-12.0 * (deltaMs / 1000));
      uniformsRef.current.mouseX += (uniformsRef.current.targetMouseX - uniformsRef.current.mouseX) * mouseLerp;
      uniformsRef.current.mouseY += (uniformsRef.current.targetMouseY - uniformsRef.current.mouseY) * mouseLerp;

      // Upload updated mouse trail to GPU
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, mouseTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, touchTexture.canvas);

      // Update Live Video Frames to WebGL Textures
      tex1Obj.update();
      tex2Obj.update();
      tex4Obj.update();

      // Uniforms
      gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
      gl.uniform2f(uFocalPointLoc, uniformsRef.current.focalX, uniformsRef.current.focalY);
      gl.uniform1f(uRotationLoc, uniformsRef.current.rotation);
      gl.uniform1f(uZoomLoc, uniformsRef.current.zoom);
      gl.uniform1f(uShapeRevealLoc, uniformsRef.current.shapeReveal);
      gl.uniform1f(uSuctionStrengthLoc, SUCTION_STRENGTH);
      gl.uniform1f(uCollageZoomLoc, uniformsRef.current.collageZoom);
      gl.uniform1f(uTiltLoc, uniformsRef.current.tiltVal);
      gl.uniform1f(uFluidIntensityLoc, 0.65);
      gl.uniform1f(uNoiseIntensityLoc, 0.75);
      gl.uniform1f(uCardOpacityLoc, uniformsRef.current.cardOpacity);
      gl.uniform2f(uMouseNdcLoc, uniformsRef.current.mouseX, uniformsRef.current.mouseY);
      gl.uniform1f(uCursorSuctionLoc, uniformsRef.current.cursorSuction);

      gl.uniform1f(uTexAspect1Loc, uniformsRef.current.texAspect1);
      gl.uniform1f(uTexAspect2Loc, uniformsRef.current.texAspect2);
      gl.uniform1f(uTexAspect3Loc, uniformsRef.current.texAspect3);
      gl.uniform1f(uTexAspect4Loc, uniformsRef.current.texAspect4);
      gl.uniform1f(uTexAspect5Loc, uniformsRef.current.texAspect5);

      gl.uniform1i(uLogoTextureLoc, 0);
      gl.uniform1i(uMouseTextureLoc, 1);
      gl.uniform1i(uTex1Loc, 2);
      gl.uniform1i(uTex2Loc, 3);
      gl.uniform1i(uTex3Loc, 4);
      gl.uniform1i(uTex4Loc, 5);
      gl.uniform1i(uTex5Loc, 6);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      gl.deleteProgram(program);
      gl.deleteBuffer(positionBuffer);
      gl.deleteTexture(logoTexture);
      gl.deleteTexture(mouseTexture);
      tex1Obj.dispose();
      tex2Obj.dispose();
      tex3Obj.dispose();
      tex4Obj.dispose();
      tex5Obj.dispose();
    };
  }, []);

  // 3. GSAP ScrollTrigger Pinned Zoom for Stand-Alone Hero Section (when not controlled by parent)
  useEffect(() => {
    if (scrollProgress !== undefined || !isScrollUnlocked) return;

    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=2600",
          pin: true,
          scrub: 0.6,
          onUpdate: (self) => {
            const p = self.progress;
            setInternalScrollPct(Math.round(p * 100));
            uniformsRef.current.zoom = 1.0 + Math.pow(p, 2.2) * 44.0;
            uniformsRef.current.collageZoom = 1.0 + p * 0.35;

            // ── SCROLL 1 DYNAMIC FRAME-BY-FRAME ROTATION & FOCAL GLIDE ──
            const targetTiltRad = (LOGO_ROTATION_DEG * Math.PI) / 180.0;
            if (p <= 0.28) {
              const pTilt = Math.max(0.0, Math.min(1.0, p / 0.28));
              const easedTilt = pTilt * pTilt * (3.0 - 2.0 * pTilt);
              uniformsRef.current.rotation = easedTilt * targetTiltRad;
              uniformsRef.current.focalX = 0.50 + (RESTING_FOCAL_X - 0.50) * easedTilt;
              uniformsRef.current.focalY = 0.50 + (RESTING_FOCAL_Y - 0.50) * easedTilt;
            } else if (p > 0.28 && p <= 0.86) {
              const rotNorm = (p - 0.28) / (0.86 - 0.28);
              uniformsRef.current.rotation = targetTiltRad - rotNorm * Math.PI;
              const zoomGlideP = Math.max(0.0, Math.min(1.0, (p - 0.28) / (0.60 - 0.28)));
              const easedZoomGlide = zoomGlideP * zoomGlideP * (3.0 - 2.0 * zoomGlideP);
              uniformsRef.current.focalX = RESTING_FOCAL_X + (LOGO_FOCAL_X - RESTING_FOCAL_X) * easedZoomGlide;
              uniformsRef.current.focalY = RESTING_FOCAL_Y + (LOGO_FOCAL_Y - RESTING_FOCAL_Y) * easedZoomGlide;
            } else {
              uniformsRef.current.rotation = targetTiltRad - Math.PI;
              uniformsRef.current.focalX = LOGO_FOCAL_X;
              uniformsRef.current.focalY = LOGO_FOCAL_Y;
            }

            // Smooth Black Hole suction & fade out from 90% to 100%
            if (p >= 0.90) {
              const suctionNorm = Math.min(1.0, (p - 0.90) / 0.10);
              uniformsRef.current.cursorSuction = suctionNorm;
              uniformsRef.current.cardOpacity = Math.max(0.0, 1.0 - Math.pow(suctionNorm, 1.8));
            } else {
              uniformsRef.current.cursorSuction = 0.0;
              uniformsRef.current.cardOpacity = 1.0;
            }

            onScrollProgress?.(p);

            if (p > 0.09) {
              setIsScrollExiting(true);
            } else {
              setIsScrollExiting(false);
            }

            if (p >= 0.96) {
              onIntroComplete?.();
            }
          },
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [scrollProgress, isScrollUnlocked, onIntroComplete, onScrollProgress]);

  const isTopReady = (introStep === "top" || introStep === "tagline" || introStep === "ready") && !isScrollExiting;
  const isTaglineReady = (introStep === "tagline" || introStep === "ready");
  const isBottomRightReady = isScrollUnlocked && !isScrollExiting;

  return (
    <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-white select-none">
      {/* ── 4K VECTOR & WEBGL SHADER CANVAS ── */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* ── STATIC 3x3 ARCHITECTURAL BLUEPRINT GRID OVERLAY (DI AWAL TANPA HOVER) ── */}
      <BlueprintGridOverlay />

      {/* ── MINIMALIST UI OVERLAY ── */}
      <div className="hero-overlay-ui fixed inset-0 z-30 flex flex-col justify-between p-5 sm:p-7 md:p-8 pointer-events-none">
        {/* TOP BAR (Rendered only if hideTopBar is false) */}
        {!hideTopBar && (
          <div className="flex items-center justify-between">
            {/* Top-Left: IZA design (from /work with rotating punctuation) */}
            <div
              className={`transition-all duration-700 pointer-events-auto ${isTopReady ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-16 pointer-events-none"
                }`}
            >
              <div className="flex items-center gap-2">
                <Image
                  src={lefttoplogolight}
                  alt="IZA"
                  width={47}
                  height={24}
                  className="h-3.5 w-auto sm:h-4.5"
                  priority
                />
                <span className="font-display text-sm font-bold text-black sm:text-base inline-flex items-center">
                  design
                  <span className="inline-block font-bold ml-[1px] w-2 text-left">{PUNCTUATION[puncIndex]}</span>
                </span>
              </div>
            </div>

            {/* Top-Right: Loading Counter [01% -> 100%] & Live Scroll Progress [SCROLL: 0% -> 100%] */}
            <div className="font-mono text-sm font-bold tracking-wider">
              {introStep === "loading" ? (
                <span className="text-black">[{count.toString().padStart(2, "0")}%]</span>
              ) : (
                <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-md border border-red-200 font-black shadow-sm">
                  [SCROLL: {internalScrollPct}%]
                </span>
              )}
            </div>
          </div>
        )}
        {hideTopBar && <div />}

        {/* BOTTOM BAR: TAGLINE (LEFT) & SCROLL DOWN (RIGHT) */}
        <div className="flex items-end justify-between gap-6">
          {/* Bottom-Left: Random letter reveal on enter, random letter disappear on 10% scroll */}
          <div className="transition-all duration-500">
            <RandomLetterText
              line1="CREATIVE DEVELOPMENT &"
              line2="INTERACTIVE WEB EXPERIENCES."
              isRevealing={isTaglineReady}
              isExiting={isScrollExiting}
              onRevealComplete={() => {
                setIntroStep("ready");
              }}
            />
          </div>

          {/* Bottom-Right: Scroll Down Indicator - slides up on enter, slides down on scroll */}
          <div
            className={`flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-black transition-all duration-700 shrink-0 ${isBottomRightReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16 pointer-events-none"
              }`}
          >
            <span>SCROLL DOWN</span>
            <span className="animate-bounce">↓</span>
          </div>
        </div>
      </div>
    </div>
  );
}
