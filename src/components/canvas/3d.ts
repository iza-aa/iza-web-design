import * as THREE from 'three';
import bgImage from '@/assets/pexels-steve-29586676.jpg';

export interface DomeThemeColors {
  /** Base color at the periphery (dim). */
  baseColorDim: THREE.ColorRepresentation;
  /** Base color facing the camera (glow). */
  baseColorGlow: THREE.ColorRepresentation;
  /** Grid line / wireframe facet / hover-cell fill color. */
  lineColor: THREE.ColorRepresentation;
  /** Opacity of the low-poly facet wireframe overlay. */
  facetOpacity: number;
}

export interface DomeGridBackgroundOptions extends Partial<DomeThemeColors> {
  /** Radius of the dome the camera sits inside of. Default: 60 */
  domeRadius?: number;
  /** Grid density (cells around the sphere). Default: 48 */
  gridScale?: number;
  /** Idle auto-rotation speed in radians/second. Default: 0.015 */
  autoRotateSpeed?: number;
  /**
   * Skip the continuous rAF loop and render a single static frame instead
   * (prefers-reduced-motion). Auto-rotate and the pointer hover-cell
   * highlight are both effectively frozen at whatever they were on that
   * one frame.
   */
  reducedMotion?: boolean;
}

const VERTEX_SHADER = `
varying vec2 vUv;
varying vec3 vViewPos;
void main() {
  vUv = uv;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPos = mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const FRAGMENT_SHADER = `
uniform sampler2D uTexture;
uniform float uHasTexture;
uniform float uGridScale;
uniform vec3 uBaseDim;
uniform vec3 uBaseGlow;
uniform vec3 uLineColor;
uniform vec2 uHoverUV;
varying vec2 vUv;
varying vec3 vViewPos;

float gridFactor(vec2 uv, float scale) {
  vec2 coord = uv * scale;
  vec2 g = abs(fract(coord - 0.5) - 0.5) / max(fwidth(coord), 0.0001);
  float line = min(g.x, g.y);
  return 1.0 - clamp(line, 0.0, 1.0);
}

void main() {
  vec3 viewDir = normalize(vViewPos);
  float facing = clamp(dot(viewDir, vec3(0.0, 0.0, -1.0)), 0.0, 1.0);
  float glow = smoothstep(0.1, 1.0, facing);

  // Sample background texture
  vec4 texSample = texture2D(uTexture, vUv);
  vec3 photo = texSample.rgb;

  vec3 defaultBase = mix(uBaseDim, uBaseGlow, glow);
  vec3 base = (uHasTexture > 0.5) ? photo : defaultBase;

  // Grid cell detection
  vec2 cell = floor(vUv * uGridScale);
  vec2 hoverCell = floor(uHoverUV * uGridScale);
  float isHoverCell = step(abs(cell.x - hoverCell.x), 0.001) * step(abs(cell.y - hoverCell.y), 0.001);

  // Alternate color of the photo when hovered (inverted negative / vibrant color-shift)
  vec3 hoverPhoto = (uHasTexture > 0.5)
    ? vec3(1.0 - photo.r, 1.0 - photo.g, 1.0 - photo.b)
    : uLineColor;

  vec3 surface = mix(base, hoverPhoto, isHoverCell);

  float grid = gridFactor(vUv, uGridScale);
  float lineOpacity = mix(0.2, 0.65, glow);
  vec3 color = mix(surface, uLineColor, grid * lineOpacity);

  gl_FragColor = vec4(color, 1.0);
}
`;

interface DomeUniforms {
  [uniform: string]: THREE.IUniform;
  uTexture: { value: THREE.Texture | null };
  uHasTexture: { value: number };
  uGridScale: { value: number };
  uBaseDim: { value: THREE.Color };
  uBaseGlow: { value: THREE.Color };
  uLineColor: { value: THREE.Color };
  uHoverUV: { value: THREE.Vector2 };
}

const NO_HOVER = new THREE.Vector2(-10, -10);

export class DomeGridBackground {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  private domeMesh: THREE.Mesh;
  private domeMaterial: THREE.ShaderMaterial;
  private domeUniforms: DomeUniforms;

  private facetMesh: THREE.Mesh;
  private facetMaterial: THREE.MeshBasicMaterial;

  private lastTime = performance.now();
  private resizeObserver: ResizeObserver;
  private rafId: number | null = null;
  private paused = false;
  private readonly reducedMotion: boolean;

  private autoYaw = 0;
  private readonly autoRotateSpeed: number;

  // Raycast target, not a rotation target — the pointer no longer tilts the
  // camera, it only picks which grid cell to light up (see uHoverUV above).
  private readonly raycaster = new THREE.Raycaster();
  private readonly mouseNdc = NO_HOVER.clone();

  // Bound to `window`, not `container` — this background sits behind the
  // page as a `pointer-events-none` layer so real page content stays
  // clickable, which means the container element itself never receives
  // pointer events. Reading clientX/Y against the container's own rect
  // still works since it fills the viewport.
  private readonly onPointerMove = (e: PointerEvent): void => {
    const rect = this.container.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    // Standard raycaster NDC: x right-positive, y UP-positive (screen Y
    // grows downward, so it's negated here).
    this.mouseNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouseNdc.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };

  private readonly onPointerLeave = (): void => {
    this.mouseNdc.copy(NO_HOVER);
    this.domeUniforms.uHoverUV.value.copy(NO_HOVER);
  };

  private readonly onVisibilityChange = (): void => {
    if (document.hidden) {
      this.paused = true;
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    } else if (this.paused && !this.reducedMotion) {
      this.paused = false;
      this.lastTime = performance.now();
      this.tick();
    }
  };

  // Re-raycast every frame (not just on pointermove) so the hovered cell
  // stays correct against the sphere's own continuous auto-rotation.
  private updateHoverCell(): void {
    if (this.mouseNdc.x < -1 || this.mouseNdc.x > 1 || this.mouseNdc.y < -1 || this.mouseNdc.y > 1) {
      this.domeUniforms.uHoverUV.value.copy(NO_HOVER);
      return;
    }
    this.raycaster.setFromCamera(this.mouseNdc, this.camera);
    const hit = this.raycaster.intersectObject(this.domeMesh, false)[0];
    if (hit?.uv) {
      this.domeUniforms.uHoverUV.value.copy(hit.uv);
    } else {
      this.domeUniforms.uHoverUV.value.copy(NO_HOVER);
    }
  }

  private readonly tick = (): void => {
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    this.autoYaw += dt * this.autoRotateSpeed;
    this.camera.rotation.y = this.autoYaw;

    this.updateHoverCell();

    this.renderer.render(this.scene, this.camera);
    this.rafId = requestAnimationFrame(this.tick);
  };

  constructor(container: HTMLElement, options: DomeGridBackgroundOptions = {}) {
    this.container = container;
    this.autoRotateSpeed = options.autoRotateSpeed ?? 0.015;
    this.reducedMotion = options.reducedMotion ?? false;

    const domeRadius = options.domeRadius ?? 60;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(62, this.width / this.height, 0.1, 300);
    this.camera.position.set(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(this.width, this.height);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    // Fully transparent — the dome sits over the page's own themed
    // gradient backdrop instead of painting a fixed dark background,
    // which is what let this look right in light mode too.
    this.renderer.setClearColor(0x000000, 0);
    container.appendChild(this.renderer.domElement);

    this.domeUniforms = {
      uTexture: { value: null },
      uHasTexture: { value: 0.0 },
      uGridScale: { value: options.gridScale ?? 48 },
      uBaseDim: { value: new THREE.Color(options.baseColorDim ?? 0x090b17) },
      uBaseGlow: { value: new THREE.Color(options.baseColorGlow ?? 0x1a1e38) },
      uLineColor: { value: new THREE.Color(options.lineColor ?? 0x76a0dc) },
      uHoverUV: { value: NO_HOVER.clone() }
    };

    const textureUrl = typeof bgImage === 'string' ? bgImage : ((bgImage as { src?: string })?.src || '/assets/pexels-steve-29586676.jpg');
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      textureUrl,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        this.domeUniforms.uTexture.value = texture;
        this.domeUniforms.uHasTexture.value = 1.0;
        this.domeMaterial.needsUpdate = true;
        if (this.reducedMotion) this.renderer.render(this.scene, this.camera);
      },
      undefined,
      (err) => {
        console.error('Failed to load dome texture:', err);
      }
    );

    const domeGeometry = new THREE.SphereGeometry(domeRadius, 64, 48);
    this.domeMaterial = new THREE.ShaderMaterial({
      uniforms: this.domeUniforms,
      side: THREE.BackSide,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER
    });
    this.domeMesh = new THREE.Mesh(domeGeometry, this.domeMaterial);
    this.scene.add(this.domeMesh);

    const facetGeometry = new THREE.IcosahedronGeometry(domeRadius * 0.995, 1);
    this.facetMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(options.lineColor ?? 0x5a6aa8),
      wireframe: true,
      transparent: true,
      opacity: options.facetOpacity ?? 0.14,
      side: THREE.BackSide
    });
    this.facetMesh = new THREE.Mesh(facetGeometry, this.facetMaterial);
    this.scene.add(this.facetMesh);

    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    window.addEventListener('pointerleave', this.onPointerLeave, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibilityChange);

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(container);

    if (this.reducedMotion) {
      this.renderer.render(this.scene, this.camera); // one static frame, no rAF loop
    } else {
      this.tick();
    }
  }

  private get width(): number {
    return this.container.clientWidth || 1;
  }

  private get height(): number {
    return this.container.clientHeight || 1;
  }

  private handleResize(): void {
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
    if (this.reducedMotion) this.renderer.render(this.scene, this.camera);
  }

  /** Update grid density at runtime (e.g. from a debug panel / slider). */
  setGridScale(value: number): void {
    this.domeUniforms.uGridScale.value = value;
  }

  /**
   * Live-recolor the dome for a theme change — pushes straight into the
   * existing uniforms/material instead of recreating the WebGL context, so
   * toggling light/dark doesn't flash or drop a frame.
   */
  updateTheme(colors: DomeThemeColors): void {
    this.domeUniforms.uBaseDim.value.set(colors.baseColorDim);
    this.domeUniforms.uBaseGlow.value.set(colors.baseColorGlow);
    this.domeUniforms.uLineColor.value.set(colors.lineColor);
    this.facetMaterial.color.set(colors.lineColor);
    this.facetMaterial.opacity = colors.facetOpacity;
    if (this.reducedMotion) this.renderer.render(this.scene, this.camera);
  }

  /** Stop the render loop, detach listeners, and free GPU resources. */
  dispose(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.resizeObserver.disconnect();
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerleave', this.onPointerLeave);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);

    if (this.domeUniforms.uTexture.value) {
      this.domeUniforms.uTexture.value.dispose();
      this.domeUniforms.uTexture.value = null;
    }
    this.domeMesh.geometry.dispose();
    this.domeMaterial.dispose();
    this.facetMesh.geometry.dispose();
    this.facetMaterial.dispose();
    this.renderer.dispose();

    if (this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
