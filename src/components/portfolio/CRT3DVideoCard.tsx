"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export interface CRT3DVideoCardProps {
  scrollProgress?: number;
}

export function CRT3DVideoCard({ scrollProgress = 0 }: CRT3DVideoCardProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const videoElRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isCracked, setIsCracked] = useState<boolean>(false);
  const [isEnded, setIsEnded] = useState<boolean>(false);

  // Trigger video playback automatically when user scrolls to 43% (0.43)
  useEffect(() => {
    const video = videoElRef.current;
    if (!video || isEnded) return;

    if (scrollProgress >= 0.43 && video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  }, [scrollProgress, isEnded]);

  useEffect(() => {
    const container = mountRef.current;
    const video = videoElRef.current;
    if (!container || !video) return;

    // Video does NOT loop (single run)
    video.loop = false;

    // If already past 43% when mounted, begin play
    if (scrollProgress >= 0.43) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }

    // 1. Create Video Texture from the real DOM video element
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.generateMipmaps = false;

    // 2. Preload Broken Glass Texture
    const textureLoader = new THREE.TextureLoader();
    const brokenGlassTexture = textureLoader.load(
      "/broken_glass_png_20_by_agusrockforlife_ddyqyd9.webp"
    );
    brokenGlassTexture.colorSpace = THREE.SRGBColorSpace;
    brokenGlassTexture.generateMipmaps = false;

    // 3. Three.js Scene, Camera, Renderer Setup
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 1.25);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 4. Studio Lighting (Enhances metallic buttons, plastic casing & specular highlights)
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(2, 3, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdde5f5, 1.6);
    fillLight.position.set(-3, 1, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 2.2);
    rimLight.position.set(0, -2, -2);
    scene.add(rimLight);

    // 5. Load CRT TV 3D Model (Preserves 100% original authored textures, normal maps & PBR shaders)
    const tvGroup = new THREE.Group();
    scene.add(tvGroup);

    let tvModel: THREE.Object3D | null = null;
    let glassMat: THREE.MeshBasicMaterial | null = null;
    const loader = new GLTFLoader();

    loader.load(
      "/crt_tv.glb",
      (gltf) => {
        tvModel = gltf.scene;

        const tvWrapper = new THREE.Group();
        tvModel.rotation.y = -Math.PI / 2;
        tvWrapper.add(tvModel);

        // Auto-center and normalize size in forward-facing orientation
        const box = new THREE.Box3().setFromObject(tvWrapper);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // 6. Fitted Curved CRT Screen Mesh (Precision flush-mounted over TV glass aperture)
        const screenWidth = size.x * 0.672;
        const screenHeight = size.y * 0.602;
        const screenGeo = new THREE.PlaneGeometry(screenWidth, screenHeight, 48, 48);

        // Natural CRT spherical & edge curvature matching original glass dome
        const posAttr = screenGeo.attributes.position;
        const halfW = screenWidth / 2;
        const halfH = screenHeight / 2;
        for (let i = 0; i < posAttr.count; i++) {
          const vx = posAttr.getX(i);
          const vy = posAttr.getY(i);
          const normX = vx / halfW;
          const normY = vy / halfH;

          // Subtle organic barrel curve to track bezel
          const barrelX = vx * (1.0 + 0.020 * (1.0 - normY * normY));
          const barrelY = vy * (1.0 + 0.016 * (1.0 - normX * normX));
          posAttr.setX(i, barrelX);
          posAttr.setY(i, barrelY);

          // Natural 3D dome curvature matching physical CRT glass
          const r2 = normX * normX + normY * normY;
          const curvatureZ = (1.0 - r2 * 0.35) * 0.012;
          posAttr.setZ(i, curvatureZ);
        }
        screenGeo.computeVertexNormals();

        // High-resolution subtle rounded corner mask (12px clean radius)
        const alphaCanvas = document.createElement("canvas");
        alphaCanvas.width = 512;
        alphaCanvas.height = 512;
        const actx = alphaCanvas.getContext("2d")!;
        actx.fillStyle = "#ffffff";
        actx.beginPath();
        if (actx.roundRect) {
          actx.roundRect(0, 0, 512, 512, 12);
        } else {
          actx.rect(0, 0, 512, 512);
        }
        actx.fill();
        const alphaMap = new THREE.CanvasTexture(alphaCanvas);
        alphaMap.generateMipmaps = false;
        alphaMap.minFilter = THREE.LinearFilter;

        // Screen Video Material with Subtle Rounded Corners
        const screenMat = new THREE.MeshBasicMaterial({
          map: videoTexture,
          alphaMap: alphaMap,
          transparent: true,
          toneMapped: false,
          side: THREE.DoubleSide,
        });

        const screenMesh = new THREE.Mesh(screenGeo, screenMat);
        // Mounted directly on the front glass surface
        screenMesh.position.set(center.x, center.y + size.y * 0.052, box.max.z + 0.001);
        screenMesh.renderOrder = 999;
        tvWrapper.add(screenMesh);

        // 7. Broken Glass Shatter Overlay Mesh with matching subtle rounded corners
        glassMat = new THREE.MeshBasicMaterial({
          map: brokenGlassTexture,
          alphaMap: alphaMap,
          transparent: true,
          opacity: 0, // starts invisible until video has finished
          depthWrite: false,
          side: THREE.DoubleSide,
          toneMapped: false,
        });

        const glassMesh = new THREE.Mesh(screenGeo.clone(), glassMat);
        glassMesh.position.set(center.x, center.y + size.y * 0.052, box.max.z + 0.003);
        glassMesh.renderOrder = 1000;
        tvWrapper.add(glassMesh);

        // Scale and center the entire wrapper at (0, 0, 0)
        const maxDim = Math.max(size.x, size.y, size.z);
        const scaleFactor = 0.68 / maxDim;
        tvWrapper.scale.setScalar(scaleFactor);
        tvWrapper.position.sub(center.clone().multiplyScalar(scaleFactor));

        tvGroup.add(tvWrapper);

        setIsLoaded(true);
      },
      undefined,
      (err) => {
        console.error("Error loading CRT TV model:", err);
      }
    );

    // 8. Resize Observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 9. 60/120 FPS Render Loop (Smooth Vertical Floating Levitation & Shatter Detection)
    let animId: number;
    const startTime = performance.now();
    let hasTriggeredShatter = false;

    const animate = () => {
      const elapsed = (performance.now() - startTime) * 0.001;

      if (video) {
        // Update video texture frame ONLY when video is actively playing and has new data
        if (!video.paused && !video.ended && video.readyState >= video.HAVE_CURRENT_DATA) {
          videoTexture.needsUpdate = true;
        }

        // TRIGGER BROKEN GLASS SHATTER ONLY WHEN VIDEO HAS FINISHED PLAYING
        if (video.duration && video.duration > 0) {
          const remaining = video.duration - video.currentTime;
          if (video.ended || remaining <= 0.06) {
            if (glassMat) {
              glassMat.opacity = 1.0;
            }
            if (!hasTriggeredShatter) {
              hasTriggeredShatter = true;
              setIsCracked(true);
            }
            video.pause();
            setIsPlaying(false);
            setIsEnded(true);
          }
        }
      }

      // Lock rotation straight forward (no tilt) & add smooth vertical floating bobbing
      tvGroup.rotation.y = 0;
      tvGroup.rotation.x = 0;
      tvGroup.position.y = Math.sin(elapsed * 1.6) * 0.028; // Smooth floating levitation up/down

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();

      videoTexture.dispose();
      brokenGlassTexture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  const togglePlayback = () => {
    if (isEnded) return; // Cannot play again once video has ended!

    if (videoElRef.current) {
      if (videoElRef.current.paused) {
        videoElRef.current.play();
        setIsPlaying(true);
      } else {
        videoElRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <div
      onClick={() => {
        if (!isEnded && videoElRef.current && videoElRef.current.paused) {
          videoElRef.current.play();
          setIsPlaying(true);
        }
      }}
      className={`relative w-full h-full min-h-[380px] sm:min-h-[420px] md:min-h-[460px] flex flex-col justify-between overflow-hidden select-none ${
        isEnded ? "cursor-default" : "cursor-pointer"
      }`}
    >
      {/* ── REAL DOM VIDEO ELEMENT (SINGLE PLAYTHROUGH, NO LOOP) ── */}
      <video
        ref={videoElRef}
        src="/videoscrol3.mov"
        autoPlay
        muted
        playsInline
        preload="auto"
        className="hidden pointer-events-none"
      />

      {/* ── CARD HEADER: TV ON // TV BROKEN ── */}
      <div className="flex items-center justify-between w-full mb-2 z-10">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isEnded
                ? "bg-red-500 shadow-[0_0_8px_#ef4444]"
                : "bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"
            }`}
          />
          <p className="font-mono text-xs sm:text-sm font-bold uppercase text-zinc-700 tracking-wider">
            {isEnded ? "TV BROKEN" : "TV ON"}
          </p>
        </div>
      </div>

      {/* ── 3D CRT TV WEBGL CONTAINER ── */}
      <div
        ref={mountRef}
        className="relative w-full flex-1 min-h-[320px] sm:min-h-[360px] flex items-center justify-center"
      >
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-zinc-400 uppercase tracking-widest animate-pulse">
            INITIALIZING 3D CRT MONITOR...
          </div>
        )}
      </div>
    </div>
  );
}
