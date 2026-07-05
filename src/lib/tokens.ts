/**
 * Design tokens — single source of truth for both the marketing site and the
 * component docs site.
 *
 * These values mirror the frontmatter in:
 *   - docs-source/hyliox-waitlist-card.md   (colors, typography, rounded, spacing)
 *   - docs-source/hyliox-motion-system.md   (duration, easing)
 *
 * If you change a value here, update the matching .md spec too (and vice versa) —
 * the two are meant to never drift.
 */

export const colors = {
  primary: "#3B82F6",
  secondary: "#9CA3AF",
  tertiary: "#3F3F46",
  neutral: "#DCE0E8",
  surface: "#1C1C21",
  "on-surface": "#F5F5F7",
  error: "#EF4444",
  "primary-contrast": "#FFFFFF",
  "border-subtle": "#33333A",
} as const;

// Light-theme overrides — mirrors the `.light` block in globals.css exactly.
// Keep both in sync; this is what docs/theming renders side-by-side with colors.
export const lightColors = {
  primary: "#2563EB",
  secondary: "#4B5563",
  tertiary: "#E5E7EB",
  neutral: "#1F2937",
  surface: "#F9FAFB",
  "on-surface": "#111827",
  error: "#DC2626",
  "primary-contrast": "#FFFFFF",
  "border-subtle": "#E5E7EB",
} as const;

export const radius = {
  none: "0px",
  sm: "8px",
  md: "12px",
  lg: "20px",
  xl: "28px",
  full: "9999px",
} as const;

export const spacing = {
  xs: "4px",
  sm: "12px",
  md: "20px",
  lg: "32px",
  xl: "48px",
  xxl: "96px",
} as const;

// Motion tokens — not yet wired into Tailwind config, ready for Phase 3
// (framer-motion) when the ambient canvas + motion system land.
export const duration = {
  fast: "0.2s",
  base: "0.4s",
  slow: "0.7s",
  ambient: "1.2s",
} as const;

export const easing = {
  standard: [0.16, 1, 0.3, 1],
  emphasized: [0.34, 1.56, 0.64, 1],
} as const;

// Shared glass-card recipe — every card/window/dock surface on the marketing
// site reuses this exact Tailwind class string so the frosted-glass look
// never drifts between components. Deliberately excludes `rounded-*` (each
// consumer picks its own radius) so combined classes never fight over shape.
// Uses the --glass-* CSS custom properties (globals.css) instead of hardcoded
// white-opacity values so it re-tints correctly under the `.light` theme.
export const glassCard =
  "border border-(--glass-border) bg-(--glass-bg) shadow-[0_20px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl";
