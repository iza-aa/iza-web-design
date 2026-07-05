/**
 * Logo mark — squircle app-icon token from hyliox-waitlist-card.md's
 * `logo-mark` component (bg #0A0A0B, rounded.xl, headline-display type).
 */
export function LogoMark({ size = 72 }: { size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-xl bg-[#0A0A0B] font-display font-bold text-primary-contrast"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      I
    </div>
  );
}
