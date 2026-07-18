export function markAmbientReady() {
  (window as Window & { __ambientState?: string }).__ambientState = "ready";
  window.dispatchEvent(new Event("ambient-canvas-ready"));
}

export function canCreateWebGLContext() {
  try {
    const probe = document.createElement("canvas");
    return Boolean(probe.getContext("webgl2") || probe.getContext("webgl"));
  } catch {
    return false;
  }
}
