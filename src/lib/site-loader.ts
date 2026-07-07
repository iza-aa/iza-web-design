/**
 * Blocking init script (same pattern as themeInitScript) — waits for the
 * browser's `load` event (all images/fonts/scripts settled, not just the
 * initial HTML) before revealing the page, so nothing pops in unstyled or
 * half-loaded. `readyState === "complete"` covers the case where `load`
 * already fired before this script ran (e.g. slow hydration); the timeout
 * is a safety net in case some resource never settles.
 *
 * Also waits on `window.__ambientState`, set by AmbientCanvas.tsx. That
 * component's WebGL setup (`import("three")`, renderer/shader init) runs
 * async inside a client-only `useEffect` — invisible to the browser's
 * native `load` event, which only tracks the initial HTML/CSS/JS/image/font
 * fetch. Without this, `load` could fire (and reveal the page) well before
 * the canvas's first frame actually paints, so the loader would finish and
 * then the ambient background would visibly pop in a beat later. Pages that
 * never mount AmbientCanvas leave `__ambientState` at `'unknown'`, so they
 * still reveal on `load` alone, unaffected.
 */
export const siteLoaderInitScript = `(function(){window.__ambientState='unknown';var loaded=false;function r(){if(!loaded)return;if(window.__ambientState==='pending')return;document.documentElement.classList.add('site-loaded');}function onLoad(){loaded=true;r();}if(document.readyState==='complete'){onLoad();}else{window.addEventListener('load',onLoad);}window.addEventListener('ambient-canvas-ready',r);setTimeout(function(){document.documentElement.classList.add('site-loaded');},6000);})();`;
