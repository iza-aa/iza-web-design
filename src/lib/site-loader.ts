/**
 * Blocking init script (same pattern as themeInitScript) — waits for the
 * browser's `load` event (all images/fonts/scripts settled, not just the
 * initial HTML) before revealing the page, so nothing pops in unstyled or
 * half-loaded. `readyState === "complete"` covers the case where `load`
 * already fired before this script ran (e.g. slow hydration); the timeout
 * is a safety net in case some resource never settles.
 */
export const siteLoaderInitScript = `(function(){function r(){document.documentElement.classList.add('site-loaded');}if(document.readyState==='complete'){r();}else{window.addEventListener('load',r);setTimeout(r,6000);}})();`;
