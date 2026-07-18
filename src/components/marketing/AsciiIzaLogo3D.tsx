"use client";

import { useEffect, useRef, useState } from "react";
import lefttoplogo from "@/assets/logo/lefttoplogo.png";
import { createIzaLogoGeometry } from "./iza-logo-geometry";
import { useTheme } from "@/lib/theme";

// -0.38 is the mesh's own "reads correctly, front-on" resting angle (it was
// the initial pose before this ever animated). Landing back on that exact
// value — not just "close" — is what spinProgress below is built around.
const LOGO_REST_ROTATION_Y = -0.38;

// Solid color, no gradient, no glow — plain white on dark backgrounds,
// plain black on light ones. Removes the background-clip:text trick
// entirely rather than swapping in a single-stop "gradient": that trick
// existed only to paint a multi-stop gradient onto the glyphs, which a flat
// color doesn't need.
function applyThemeColor(el: HTMLElement, theme: "dark" | "light") {
  const color = theme === "light" ? "#000000" : "#ffffff";
  el.style.backgroundImage = "none";
  el.style.backgroundClip = "unset";
  el.style.webkitBackgroundClip = "unset";
  el.style.webkitTextFillColor = "unset";
  el.style.color = color;
  el.style.textShadow = "none";
  el.style.filter = "none";
  const table = el.querySelector("table") as HTMLTableElement | null;
  if (table) {
    table.style.backgroundImage = "none";
    table.style.backgroundClip = "unset";
    table.style.webkitBackgroundClip = "unset";
    table.style.webkitTextFillColor = "unset";
    table.style.color = color;
  }
}

/**
 * A direct adaptation of the STL-to-ASCII technique: light a real 3D mesh,
 * then let Three's AsciiEffect convert the rendered luminance into glyphs.
 * This deliberately avoids putting a repeating pattern *on* the material.
 *
 * `spinProgressRef`, if given, drives the logo's rotation directly from that
 * ref's value (expected 0-1, updated imperatively by the caller — typically
 * from a ScrollTrigger onUpdate — no React re-render needed for either
 * side). At 0 it sits at the resting angle; at 1 it's completed exactly one
 * full turn and is back on that same resting angle, readable. Without a
 * ref, it just sits still at the resting angle — this never free-spins on
 * its own on a timer.
 */
export function AsciiIzaLogo3D({
  className = "",
  alt = "IZA",
  spinProgressRef,
}: {
  className?: string;
  alt?: string;
  spinProgressRef?: { current: number };
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [isWebGLReady, setIsWebGLReady] = useState(false);
  const [fallbackAscii, setFallbackAscii] = useState("");
  const { theme } = useTheme();
  const effectElRef = useRef<HTMLElement | null>(null);
  // Read at WebGL-setup time (effect deps are [alt], not [theme] — a theme
  // toggle shouldn't tear down and rebuild the whole scene) and kept fresh
  // for the live-toggle effect below to re-apply without needing that.
  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
    if (effectElRef.current) applyThemeColor(effectElRef.current, theme);
  }, [theme]);

  useEffect(() => {
    const image = new window.Image();
    image.src = lefttoplogo.src;
    image.onload = () => {
      const columns = 58;
      const rows = 25;
      const source = document.createElement("canvas");
      source.width = columns;
      source.height = rows;
      const context = source.getContext("2d", { willReadFrequently: true });
      if (!context) return;
      context.clearRect(0, 0, columns, rows);
      context.drawImage(image, 0, 0, columns, rows);
      const pixels = context.getImageData(0, 0, columns, rows).data;
      const lines: string[] = [];
      for (let y = 0; y < rows; y += 1) {
        let line = "";
        for (let x = 0; x < columns; x += 1) {
          const alpha = pixels[(y * columns + x) * 4 + 3];
          line += alpha > 70 ? "┼" : " ";
        }
        lines.push(line);
      }
      setFallbackAscii(lines.join("\n"));
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const host = stage;

    let disposed = false;
    let frame = 0;

    Promise.all([import("three"), import("three/examples/jsm/effects/AsciiEffect.js")]).then(([THREE, { AsciiEffect }]) => {
      if (disposed) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });
      } catch {
        return;
      }

      // `┼` is the visible mark: a long vertical stem with a centred bar.
      // space. The ASCII effect selects between them from mesh luminance.
      const effect = new AsciiEffect(renderer, " ┼┼┼┼┼┼┼", { invert: true, resolution: 0.19 });
      effect.domElement.setAttribute("aria-label", alt);
      effect.domElement.style.backgroundColor = "transparent";
      effect.domElement.style.width = "100%";
      effect.domElement.style.height = "100%";
      stage.replaceChildren(effect.domElement);
      effectElRef.current = effect.domElement;
      applyThemeColor(effect.domElement, themeRef.current);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x030514);
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      camera.position.set(0, 0, 15);

      const geometry = createIzaLogoGeometry(THREE);
      geometry.computeBoundingBox();
      const size = new THREE.Vector3();
      geometry.boundingBox!.getSize(size);
      const scale = 11 / Math.max(size.x, size.y);
      const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.62,
        flatShading: true,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geometry, material);
      const group = new THREE.Group();
      group.add(mesh);
      group.scale.setScalar(scale);
      group.rotation.set(-0.08, LOGO_REST_ROTATION_Y, 0.02);
      scene.add(group);

      scene.add(new THREE.AmbientLight(0xff6a00, 0.35));
      const keyLight = new THREE.PointLight(0xffffff, 2.2, 40);
      keyLight.position.set(5, 7, 10);
      scene.add(keyLight);
      const warmFill = new THREE.PointLight(0xff4a00, 1.4, 35);
      warmFill.position.set(-6, -2, 6);
      scene.add(warmFill);

      function resize() {
        if (disposed) return;
        const width = Math.max(1, host.clientWidth);
        const height = Math.max(1, host.clientHeight);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        effect.setSize(width, height);
      }

      const startedAt = performance.now();
      function render(now: number) {
        if (disposed) return;
        // 0 at rest, 1 after exactly one full turn — never driven by
        // elapsed time, so it can't land the mesh at some arbitrary
        // in-between angle. Without a ref (spinProgress fixed at 1) it just
        // sits at the resting, readable pose permanently.
        const spin = Math.max(0, Math.min(1, spinProgressRef?.current ?? 1));
        group.rotation.y = LOGO_REST_ROTATION_Y + spin * Math.PI * 2;
        // The idle wobble fades out as it approaches the resting angle, so
        // it's genuinely still (not just close) once settled.
        const t = (now - startedAt) / 1000;
        mesh.rotation.x = Math.sin(t * 0.7) * 0.08 * (1 - spin);
        effect.render(scene, camera);
        frame = requestAnimationFrame(render);
      }

      resize();
      window.addEventListener("resize", resize);
      frame = requestAnimationFrame(render);
      setIsWebGLReady(true);

      (stage as HTMLDivElement & { __cleanup?: () => void }).__cleanup = () => {
        window.removeEventListener("resize", resize);
        cancelAnimationFrame(frame);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        stage.replaceChildren();
      };
    }).catch(() => {
      // Keep the surrounding layout empty rather than reviving the old PNG.
    });

    return () => {
      disposed = true;
      (stage as HTMLDivElement & { __cleanup?: () => void }).__cleanup?.();
    };
  }, [alt]);

  return (
    <div aria-label={alt} className={`relative overflow-hidden ${className}`} style={{ aspectRatio: "94 / 48" }}>
      <div ref={stageRef} aria-hidden className={`absolute inset-0 transition-opacity duration-300 ${isWebGLReady ? "opacity-100" : "opacity-0"}`} />
      {!isWebGLReady && fallbackAscii && (
        <pre
          aria-hidden
          className={`absolute inset-0 m-0 flex items-center justify-center overflow-hidden whitespace-pre text-center font-mono text-[clamp(4px,0.72vw,10px)] leading-[0.7] tracking-[-0.08em] ${theme === "light" ? "text-black" : "text-white"}`}
        >
          {fallbackAscii}
        </pre>
      )}
    </div>
  );
}
