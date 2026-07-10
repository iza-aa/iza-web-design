"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useReducedMotion } from "framer-motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(TextPlugin, MotionPathPlugin);
}

const PHONE_MOCKUP_STYLES = `
  .pm-bezel {
      background-color: #111;
      box-shadow:
          inset 0 0 0 2px #52525B,
          inset 0 0 0 7px #000,
          0 40px 80px -15px rgba(0,0,0,0.9),
          0 15px 25px -5px rgba(0,0,0,0.7);
      transform-style: preserve-3d;
  }
  .pm-hardware-btn {
      background: linear-gradient(90deg, #404040 0%, #171717 100%);
      box-shadow:
          -2px 0 5px rgba(0,0,0,0.8),
          inset -1px 0 1px rgba(255,255,255,0.15),
          inset 1px 0 2px rgba(0,0,0,0.8);
      border-left: 1px solid rgba(255,255,255,0.05);
  }
  .pm-screen-glare {
      background: linear-gradient(110deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 45%);
  }
  .pm-widget-depth {
      background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
      box-shadow:
          0 10px 20px rgba(0,0,0,0.3),
          inset 0 1px 1px rgba(255,255,255,0.05),
          inset 0 -1px 1px rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.03);
  }
  .pm-send-btn {
      position: relative;
      background-color: rgba(255,255,255,0.08);
  }
  .pm-floating-badge {
      background: linear-gradient(135deg, rgba(30, 32, 40, 0.92) 0%, rgba(15, 16, 22, 0.88) 100%);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      box-shadow:
          0 0 0 1px rgba(255, 255, 255, 0.08),
          0 25px 50px -12px rgba(0, 0, 0, 0.6),
          inset 0 1px 1px rgba(255,255,255,0.15),
          inset 0 -1px 1px rgba(0,0,0,0.5);
  }
`;

const ACCENT_CLASSES = {
  blue: "from-blue-500/20 to-blue-600/5 border-blue-400/20 text-blue-400",
  sky: "from-sky-500/20 to-sky-600/5 border-sky-400/20 text-sky-400",
  indigo: "from-indigo-500/20 to-indigo-600/5 border-indigo-400/20 text-indigo-400",
  emerald: "from-emerald-500/20 to-emerald-600/5 border-emerald-400/20 text-emerald-400",
} as const;

const ACCENT_ORDER: (keyof typeof ACCENT_CLASSES)[] = ["blue", "sky", "indigo", "emerald"];

export type PhoneMockupNotification = {
  icon: ReactNode;
  title: string;
  time?: string;
  accent?: keyof typeof ACCENT_CLASSES;
};

export type PhoneMockupBadge = {
  icon: ReactNode;
  title: string;
  subtitle: string;
};

export function PhoneMockup({
  eyebrow,
  title,
  chatPlaceholder,
  chatPrompt,
  notifications,
  badge1,
  badge2,
  className = "",
}: {
  eyebrow: string;
  title: string;
  chatPlaceholder: string;
  chatPrompt: string;
  notifications: PhoneMockupNotification[];
  badge1?: PhoneMockupBadge;
  badge2?: PhoneMockupBadge;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = mockupRef.current;
    if (!el) return;

    function handleMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(el, { rotationY: x * 24, rotationX: -y * 24, ease: "power3.out", duration: 0.8 });
    }
    function handleLeave() {
      gsap.to(el, { rotationY: 0, rotationX: 0, ease: "power3.out", duration: 0.8 });
    }

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [reduced]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.2 });

      tl.set(".pm-chat-mock", { height: 40, borderRadius: 20 })
        .set([".pm-chat-typed-row", ".pm-chat-toolbar-row"], { autoAlpha: 0 })
        .set(".pm-chat-action-glow", { autoAlpha: 0, scale: 0.6 })
        .set(".pm-send-fill", { backgroundColor: "rgba(255,255,255,0.08)" })
        .set(".pm-chat-typed-text", { text: "" })
        .set(".pm-chat-placeholder", { autoAlpha: 1 })
        .set(".pm-flow-marker", { autoAlpha: 0 })
        .set(".pm-notif", { autoAlpha: 0, y: -30, scale: 0.95 })
        .to({}, { duration: 0.6 })
        .to(".pm-chat-placeholder", { autoAlpha: 0, duration: 0.3 })
        .to(".pm-chat-mock", { height: 64, borderRadius: 24, duration: 0.5, ease: "power2.inOut" }, "<")
        .to([".pm-chat-typed-row", ".pm-chat-toolbar-row"], { autoAlpha: 1, duration: 0.4 }, "-=0.2")
        .to(".pm-chat-typed-text", { duration: 1.8, text: chatPrompt, ease: "none" })
        .to(".pm-send-fill", { backgroundColor: "#3B82F6", duration: 0.4 })
        .to(".pm-chat-action-glow", { autoAlpha: 1, scale: 1, duration: 0.4 }, "<")
        .to(".pm-send-fill", { scale: 0.85, duration: 0.15, yoyo: true, repeat: 1, ease: "power1.inOut" })
        .to(".pm-flow-marker", { autoAlpha: 1, duration: 0.2 })
        .to(".pm-flow-marker", {
          motionPath: { path: "#pm-flow-path", align: "#pm-flow-path", alignOrigin: [0.5, 0.5] },
          duration: 1.4,
          ease: "power2.inOut",
        })
        .set(".pm-flow-marker", { autoAlpha: 0 })
        .fromTo(".pm-notif", { y: -30, autoAlpha: 0, scale: 0.95 }, { y: 0, autoAlpha: 1, scale: 1, stagger: 0.35, ease: "back.out(1.4)", duration: 0.9 }, "-=0.2")
        .to({}, { duration: 2.5 })
        .to(".pm-notif", { autoAlpha: 0, y: -20, duration: 0.5, stagger: 0.08, ease: "power2.in" });
    }, rootRef);

    return () => ctx.revert();
  }, [chatPrompt, reduced]);

  return (
    <div ref={rootRef} aria-hidden="true" className={`relative ${className}`} style={{ perspective: "1000px" }}>
      <style dangerouslySetInnerHTML={{ __html: PHONE_MOCKUP_STYLES }} />

      <div
        ref={reduced ? undefined : mockupRef}
        className="relative w-70 h-145 rounded-[3rem] pm-bezel flex flex-col will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="absolute top-30 -left-0.75 w-0.75 h-6.25 pm-hardware-btn rounded-l-md z-0" />
        <div className="absolute top-40 -left-0.75 w-0.75 h-11.25 pm-hardware-btn rounded-l-md z-0" />
        <div className="absolute top-55 -left-0.75 w-0.75 h-11.25 pm-hardware-btn rounded-l-md z-0" />
        <div className="absolute top-42.5 -right-0.75 w-0.75 h-17.5 pm-hardware-btn rounded-r-md z-0 scale-x-[-1]" />

        <div className="absolute inset-1.75 bg-[#050914] rounded-[2.5rem] overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,1)] text-white z-10">
          <div className="absolute inset-0 pm-screen-glare z-40 pointer-events-none" />

          <div className="absolute top-1.25 left-1/2 -translate-x-1/2 w-25 h-7 bg-black rounded-full z-50 flex items-center justify-end px-3 shadow-[inset_0_-1px_2px_rgba(255,255,255,0.1)]">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
          </div>

          <div className="relative w-full h-full pt-12 px-5 pb-8 flex flex-col">
            <div className="flex flex-col mb-3">
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1">{eyebrow}</span>
              <span className="text-xl font-bold tracking-tight text-white drop-shadow-md">{title}</span>
            </div>

            <div className="relative mb-2">
              <div
                className="pm-chat-mock relative bg-white/5 border border-white/10 shadow-inner overflow-hidden"
                style={{ height: reduced ? 64 : 40, borderRadius: reduced ? 24 : 20 }}
              >
                {!reduced && (
                  <span className="pm-chat-placeholder absolute left-4 top-1/2 -translate-y-1/2 text-[11px] text-neutral-500 font-medium truncate">
                    {chatPlaceholder}
                  </span>
                )}

                <div
                  className="pm-chat-typed-row absolute inset-x-0 top-0 px-3 pt-2 flex items-center gap-2"
                  style={reduced ? { opacity: 1, visibility: "visible" } : undefined}
                >
                  <span className="flex-1 min-w-0 flex items-center">
                    <span className="pm-chat-typed-text text-[11px] text-neutral-200 truncate">{reduced ? chatPrompt : ""}</span>
                    <span className="inline-block w-0.5 h-3 bg-blue-400 ml-0.5 shrink-0" />
                  </span>

                  <div className="pm-send-btn relative w-7 h-7 rounded-full shrink-0">
                    <div
                      className="pm-chat-action-glow absolute -inset-1 rounded-full pointer-events-none"
                      style={{
                        background: "radial-gradient(circle, rgba(59,130,246,0.65) 0%, transparent 70%)",
                        filter: "blur(9px)",
                        opacity: reduced ? 1 : undefined,
                      }}
                    />
                    <div
                      className="pm-send-fill absolute inset-0 rounded-full flex items-center justify-center"
                      style={reduced ? { backgroundColor: "#3B82F6", boxShadow: "0 8px 16px -4px rgba(59,130,246,0.5)" } : undefined}
                    >
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 12V2M7 2L2.5 6.5M7 2L11.5 6.5" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div
                  className="pm-chat-toolbar-row absolute inset-x-0 bottom-0 px-2.5 pb-1.5 flex items-center gap-1"
                  style={reduced ? { opacity: 1, visibility: "visible" } : undefined}
                >
                  <div className="flex items-center gap-1 rounded-full px-1.5 py-0.5 bg-white/5 text-neutral-300">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="5" y="8" width="14" height="10" rx="2" />
                      <circle cx="9.5" cy="13" r="1" fill="currentColor" stroke="none" />
                      <circle cx="14.5" cy="13" r="1" fill="currentColor" stroke="none" />
                      <path strokeLinecap="round" d="M12 8V5M9.5 5h5" />
                    </svg>
                    <span className="text-[8px] font-semibold">Auto</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative h-9">
              <svg viewBox="0 0 220 36" className="absolute inset-0 w-full h-full overflow-visible">
                <path id="pm-flow-path" d="M200 4 C150 4, 70 30, 14 30" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="2" strokeDasharray="4 5" strokeLinecap="round" />
              </svg>
              {!reduced && (
                <div className="pm-flow-marker absolute w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.9)]" style={{ left: 0, top: 0 }} />
              )}
            </div>

            <div className="space-y-2">
              {notifications.map((notif, i) => {
                const accent = ACCENT_CLASSES[notif.accent ?? ACCENT_ORDER[i % ACCENT_ORDER.length]];
                return (
                  <div key={i} className="pm-notif pm-widget-depth rounded-xl p-2.5 flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg bg-linear-to-br flex items-center justify-center border shrink-0 ${accent}`}>
                      {notif.icon}
                    </div>
                    <p className="flex-1 min-w-0 text-white text-[11px] font-bold truncate">{notif.title}</p>
                    {notif.time ? (
                      <span className="text-[9px] text-neutral-500 shrink-0">{notif.time}</span>
                    ) : (
                      <div className="flex gap-0.5 shrink-0">
                        <span className="w-1 h-1 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1 h-1 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1 h-1 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-30 h-[4px] bg-white/20 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
          </div>
        </div>
      </div>

      {badge1 && (
        <div className="absolute flex top-6 lg:top-12 -left-3.75 lg:-left-20 pm-floating-badge rounded-xl lg:rounded-2xl p-3 lg:p-4 items-center gap-3 lg:gap-4 z-30">
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-linear-to-b from-blue-500/20 to-blue-900/10 flex items-center justify-center border border-blue-400/30 shadow-inner">
            {badge1.icon}
          </div>
          <div>
            <p className="text-white text-xs lg:text-sm font-bold tracking-tight">{badge1.title}</p>
            <p className="text-blue-200/50 text-[10px] lg:text-xs font-medium">{badge1.subtitle}</p>
          </div>
        </div>
      )}

      {badge2 && (
        <div className="absolute flex bottom-12 lg:bottom-20 -right-3.75 lg:-right-20 pm-floating-badge rounded-xl lg:rounded-2xl p-3 lg:p-4 items-center gap-3 lg:gap-4 z-30">
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-linear-to-b from-indigo-500/20 to-indigo-900/10 flex items-center justify-center border border-indigo-400/30 shadow-inner">
            {badge2.icon}
          </div>
          <div>
            <p className="text-white text-xs lg:text-sm font-bold tracking-tight">{badge2.title}</p>
            <p className="text-blue-200/50 text-[10px] lg:text-xs font-medium">{badge2.subtitle}</p>
          </div>
        </div>
      )}
    </div>
  );
}
