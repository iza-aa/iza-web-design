"use client";

import { useEffect, useRef, useState } from "react";
import lefttoplogo from "@/assets/logo/lefttoplogo.png";
import { createIzaLogoGeometry } from "./iza-logo-geometry";

/**
 * A direct adaptation of the STL-to-ASCII technique: light a real 3D mesh,
 * then let Three's AsciiEffect convert the rendered luminance into glyphs.
 * This deliberately avoids putting a repeating pattern *on* the material.
 */
export function AsciiIzaLogo3D({ className = "", alt = "IZA" }: { className?: string; alt?: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [isWebGLReady, setIsWebGLReady] = useState(false);
  const [fallbackAscii, setFallbackAscii] = useState("");

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
      const asciiGradient = "radial-gradient(circle at 22% 15%, #ffffff 0 10%, #fff7a6 20%, #ffe600 38%, #ff8a00 57%, #ff2a00 76%, #7d1000 100%)";
      effect.domElement.style.color = "#fff8e5";
      effect.domElement.style.backgroundColor = "transparent";
      effect.domElement.style.backgroundImage = asciiGradient;
      effect.domElement.style.backgroundClip = "text";
      effect.domElement.style.webkitBackgroundClip = "text";
      effect.domElement.style.webkitTextFillColor = "transparent";
      effect.domElement.style.textShadow = "0 0 2px rgba(255,255,255,0.95), 0 0 8px rgba(255,132,0,0.95), 0 0 18px rgba(255,42,0,0.5)";
      effect.domElement.style.filter = "drop-shadow(0 0 14px rgba(255,117,0,0.7))";
      effect.domElement.style.width = "100%";
      effect.domElement.style.height = "100%";
      const table = effect.domElement.querySelector("table") as HTMLTableElement | null;
      if (table) {
        table.style.backgroundImage = asciiGradient;
        table.style.backgroundClip = "text";
        table.style.webkitBackgroundClip = "text";
        table.style.webkitTextFillColor = "transparent";
      }
      stage.replaceChildren(effect.domElement);

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
      group.rotation.set(-0.08, -0.38, 0.02);
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
        const t = (now - startedAt) / 1000;
        group.rotation.y = -0.38 + t * 0.28;
        mesh.rotation.x = Math.sin(t * 0.7) * 0.08;
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
          className="absolute inset-0 m-0 flex items-center justify-center overflow-hidden whitespace-pre text-center font-mono text-[clamp(4px,0.72vw,10px)] leading-[0.7] tracking-[-0.08em] text-white [text-shadow:0_0_2px_#fff,0_0_8px_#ff8a00,0_0_18px_rgba(255,42,0,0.55)]"
        >
          {fallbackAscii}
        </pre>
      )}
    </div>
  );
}
