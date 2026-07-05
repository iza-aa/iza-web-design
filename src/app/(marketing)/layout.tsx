import { AmbientCanvas } from "@/components/canvas/AmbientCanvas";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/*
        Static gradient/blur fallback — stays mounted underneath the ambient
        WebGL canvas (pointer-field mode, docs/webgl-canvas-background.md).
        If AmbientCanvas declines to mount (low-power device, no WebGL), this
        is what shows through instead — the spec's lowPowerFallback.
      */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(59,130,246,0.16),transparent),radial-gradient(ellipse_60%_50%_at_100%_100%,rgba(156,163,175,0.08),transparent)]"
      />
      <AmbientCanvas />
      <main className="mx-auto max-w-7xl px-6 py-16">{children}</main>
    </>
  );
}
