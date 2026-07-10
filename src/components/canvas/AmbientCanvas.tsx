"use client";

import { useEffect, useRef } from "react";

function markAmbientReady() {
  (window as Window & { __ambientState?: string }).__ambientState = "ready";
  window.dispatchEvent(new Event("ambient-canvas-ready"));
}

const DOT_PX = 5.5;
const OPACITY = 0.42;
const BRUSH_RADIUS = 0.01;
const TRAIL_DECAY = 0.97;
const DPR_MIN = 1;
const DPR_MAX = 1.75;
const RESIZE_DEBOUNCE_MS = 150;

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// Offscreen pass: fades the previous trail, paints a new segment stamp when
// the pointer has moved this frame. Output lives in the red channel.
const TRAIL_FRAGMENT_SHADER = `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D uPrevTrail;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform vec2 uPrevPointer;
  uniform float uBrushRadius;
  uniform float uDecay;
  uniform float uStampStrength;
  uniform float uTime;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    float decayed = texture2D(uPrevTrail, vUv).r * uDecay;

    // Snap the sample position to the same DOT_PX grid the main shader
    // draws on, so the stamp is blocky/per-cell (retro pixel grid) instead
    // of a smooth anti-aliased shape floating independently of it.
    vec2 gridRes = uResolution / DOT_PX_PLACEHOLDER;
    vec2 snappedUv = (floor(vUv * gridRes) + 0.5) / gridRes;

    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 a = (snappedUv - uPrevPointer) * aspect;
    vec2 ba = (uPointer - uPrevPointer) * aspect;
    float h = clamp(dot(a, ba) / max(dot(ba, ba), 1e-5), 0.0, 1.0);
    // Euclidean distance — the silhouette still reads as round, just
    // stepped/blocky at the edges because it's sampled on the snapped grid.
    vec2 diff = a - ba * h;
    float d = length(diff);

    // Organic brush: jitter the effective radius along the stroke instead of
    // a constant-width tube — blocky steps in time (floor on uTime) so it
    // reads as clustered dense/sparse sections, like a real brush's
    // pressure varying, not a uniform bar.
    float widthNoise = noise(vec2(h * 6.0, floor(uTime * 8.0)));
    float radius = uBrushRadius * mix(0.5, 1.6, widthNoise);
    float stamp = step(d, radius) * uStampStrength;

    gl_FragColor = vec4(max(decayed, stamp), 0.0, 0.0, 1.0);
  }
`.replace("DOT_PX_PLACEHOLDER", DOT_PX.toFixed(1));

const MAIN_FRAGMENT_SHADER = `
  precision mediump float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uOpacity;
  uniform sampler2D uTrail;

  vec3 hsv2rgb(vec3 c) {
    vec3 p = abs(fract(c.xxx + vec3(0.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0);
    vec3 rgb = clamp(p - 1.0, 0.0, 1.0);
    return c.z * mix(vec3(1.0), rgb, c.y);
  }

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amp * noise(p);
      p *= 2.0;
      amp *= 0.5;
    }
    return value;
  }

  // One of four glyphs (ring "o", cross "x", plus "+", square) per grid
  // cell, picked by a hash of the cell index — the ASCII-mask hover reference.
  float glyphMask(vec2 cellIndex, vec2 local) {
    float pick = hash(cellIndex);
    float r = length(local);

    float ring = smoothstep(0.09, 0.03, abs(r - 0.30));

    float dx = abs(local.x - local.y);
    float dy = abs(local.x + local.y);
    float cross = smoothstep(0.09, 0.03, min(dx, dy)) * step(r, 0.36);

    float pd = min(abs(local.x), abs(local.y));
    float bound = max(abs(local.x), abs(local.y));
    float plus = smoothstep(0.09, 0.03, pd) * step(bound, 0.34);

    float square = smoothstep(0.34, 0.30, bound) * (1.0 - smoothstep(0.18, 0.22, bound));

    if (pick < 0.25) return ring;
    if (pick < 0.5) return cross;
    if (pick < 0.75) return plus;
    return square;
  }

  void main() {
    vec2 gridRes = uResolution / DOT_PX_PLACEHOLDER;
    vec2 cellIndex = floor(vUv * gridRes);
    vec2 cellUv = cellIndex / gridRes;
    vec2 cellLocal = fract(vUv * gridRes) - 0.5;

    // domain-warped FBM — a noise field distorting another noise field's
    // sample coordinates, so the result reads as irregular churning water
    // instead of straight/regular bands.
    vec2 flow = cellUv * 2.6 + vec2(uTime * 0.05, -uTime * 0.07);
    vec2 warp = vec2(fbm(flow + 1.7), fbm(flow + 8.3));
    float n = fbm(flow + warp * 1.6);

    float gray = mix(0.15, 0.9, n);
    vec3 color = vec3(gray);

    // Base state: every cell is a plain dot (the retro halftone look).
    float baseDot = smoothstep(0.42, 0.28, length(cellLocal));

    // Brush trail fades out in 3 discrete layers (quantized), not one smooth
    // continuous fade — a stroke visibly drops through 3 stages as it decays.
    float trail = texture2D(uTrail, vUv).r;
    float steppedTrail = floor(trail * 3.0) / 3.0;

    float glyphShape = glyphMask(cellIndex, cellLocal);
    float shape = mix(baseDot, glyphShape, steppedTrail);
    vec3 finalColor = mix(color, vec3(0.0), steppedTrail);

    gl_FragColor = vec4(finalColor, shape * mix(uOpacity, 1.0, steppedTrail * 0.6));
  }
`.replace("DOT_PX_PLACEHOLDER", DOT_PX.toFixed(1));

export function AmbientCanvas({
  className = "pointer-events-none fixed inset-x-0 top-0 -z-10 h-dvh w-full",
}: { className?: string } = {}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isLowPower = (navigator.hardwareConcurrency || 4) <= 2;
    if (isLowPower || typeof window.WebGLRenderingContext === "undefined") {
      markAmbientReady(); // no canvas coming — don't leave the site-loader waiting on it
      return; // low-power fallback: no canvas mounted, static gradient backdrop shows through
    }
    (window as Window & { __ambientState?: string }).__ambientState = "pending";

    let disposed = false;
    let raf = 0;
    let paused = false;
    const startedAt = performance.now();
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;

    import("three")
      .then((THREE) => {
        if (disposed || !container) return;

        let width = container.clientWidth;
        let height = container.clientHeight;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
        renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio, DPR_MIN), DPR_MAX));
        renderer.setSize(width, height);
        container.appendChild(renderer.domElement);

        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        const mainMaterial = new THREE.ShaderMaterial({
          vertexShader: VERTEX_SHADER,
          fragmentShader: MAIN_FRAGMENT_SHADER,
          transparent: true,
          uniforms: {
            uTime: { value: 0 },
            uResolution: { value: new THREE.Vector2(width, height) },
            uOpacity: { value: OPACITY },
            uTrail: { value: null },
          },
        });
        const scene = new THREE.Scene();
        const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mainMaterial);
        scene.add(quad);

        const trailMaterial = new THREE.ShaderMaterial({
          vertexShader: VERTEX_SHADER,
          fragmentShader: TRAIL_FRAGMENT_SHADER,
          uniforms: {
            uPrevTrail: { value: null },
            uResolution: { value: new THREE.Vector2(width, height) },
            uPointer: { value: new THREE.Vector2(-10, -10) },
            uPrevPointer: { value: new THREE.Vector2(-10, -10) },
            uBrushRadius: { value: BRUSH_RADIUS },
            uDecay: { value: TRAIL_DECAY },
            uStampStrength: { value: 0 },
            uTime: { value: 0 },
          },
        });
        const trailScene = new THREE.Scene();
        const trailQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), trailMaterial);
        trailScene.add(trailQuad);

        function makeTrailTarget(w: number, h: number) {
          return new THREE.WebGLRenderTarget(Math.max(1, w), Math.max(1, h), {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
          });
        }
        let trailTargets = [makeTrailTarget(width, height), makeTrailTarget(width, height)];
        let writeIndex = 0;
        for (const target of trailTargets) {
          renderer.setRenderTarget(target);
          renderer.clear();
        }
        renderer.setRenderTarget(null);

        let hasPointer = false;
        let movedThisFrame = false;
        const pointerCurrent = new THREE.Vector2(-10, -10);

        function renderFrame(now: number) {
          const t = (now - startedAt) / 1000;
          mainMaterial.uniforms.uTime.value = t;
          trailMaterial.uniforms.uTime.value = t;

          const readTarget = trailTargets[1 - writeIndex];
          const writeTarget = trailTargets[writeIndex];

          trailMaterial.uniforms.uPrevTrail.value = readTarget.texture;
          trailMaterial.uniforms.uStampStrength.value = movedThisFrame ? 1 : 0;

          renderer.setRenderTarget(writeTarget);
          renderer.render(trailScene, camera);
          renderer.setRenderTarget(null);

          mainMaterial.uniforms.uTrail.value = writeTarget.texture;
          renderer.render(scene, camera);

          trailMaterial.uniforms.uPrevPointer.value.copy(pointerCurrent);
          movedThisFrame = false;
          writeIndex = 1 - writeIndex;
        }

        function loop(now: number) {
          if (disposed || paused) return;
          raf = requestAnimationFrame(loop);
          renderFrame(now);
        }

        if (prefersReducedMotion) {
          renderFrame(performance.now()); // static base dot grid — no brush interactivity
        } else {
          raf = requestAnimationFrame(loop);
        }
        markAmbientReady();

        function handleVisibility() {
          if (document.hidden) {
            paused = true;
            cancelAnimationFrame(raf);
          } else if (!prefersReducedMotion) {
            paused = false;
            raf = requestAnimationFrame(loop);
          }
        }
        document.addEventListener("visibilitychange", handleVisibility);

        function onPointerMove(e: PointerEvent) {
          const rect = container!.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = 1.0 - (e.clientY - rect.top) / rect.height;
          if (!hasPointer) {
            // first move after entering — snap prevPointer here too, so the
            // first stamp is a point, not a streak from the old off-screen sentinel.
            trailMaterial.uniforms.uPrevPointer.value.set(x, y);
            hasPointer = true;
          }
          pointerCurrent.set(x, y);
          trailMaterial.uniforms.uPointer.value.set(x, y);
          movedThisFrame = true;
        }
        function onPointerLeave() {
          hasPointer = false;
          movedThisFrame = false;
        }
        window.addEventListener("pointermove", onPointerMove, { passive: true });
        window.addEventListener("pointerleave", onPointerLeave, { passive: true });

        function handleResize() {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => {
            if (disposed || !container) return;
            width = container.clientWidth;
            height = container.clientHeight;
            renderer.setSize(width, height);
            mainMaterial.uniforms.uResolution.value.set(width, height);
            trailMaterial.uniforms.uResolution.value.set(width, height);
            for (const target of trailTargets) target.dispose();
            trailTargets = [makeTrailTarget(width, height), makeTrailTarget(width, height)];
            for (const target of trailTargets) {
              renderer.setRenderTarget(target);
              renderer.clear();
            }
            renderer.setRenderTarget(null);
            writeIndex = 0;
            if (prefersReducedMotion) renderFrame(performance.now());
          }, RESIZE_DEBOUNCE_MS);
        }
        window.addEventListener("resize", handleResize);
        // iOS Safari: window "resize" doesn't reliably fire when the bottom
        // toolbar shows/hides on scroll (the CSS box already tracks it via
        // h-dvh, but the <canvas> element's pixel size needs an explicit
        // resize call) — visualViewport does fire for that transition.
        window.visualViewport?.addEventListener("resize", handleResize);

        (container as HTMLDivElement & { __cleanup?: () => void }).__cleanup = () => {
          window.removeEventListener("resize", handleResize);
          window.visualViewport?.removeEventListener("resize", handleResize);
          window.removeEventListener("pointermove", onPointerMove);
          window.removeEventListener("pointerleave", onPointerLeave);
          document.removeEventListener("visibilitychange", handleVisibility);
          clearTimeout(resizeTimer);
          cancelAnimationFrame(raf);
          quad.geometry.dispose();
          mainMaterial.dispose();
          trailQuad.geometry.dispose();
          trailMaterial.dispose();
          for (const target of trailTargets) target.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
      })
      .catch(() => {
        // WebGL/three failed to initialize — leave the static gradient as the only backdrop
        markAmbientReady();
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      const el = container as HTMLDivElement & { __cleanup?: () => void };
      el.__cleanup?.();
    };
  }, []);

  return <div ref={containerRef} aria-hidden className={className} />;
}
