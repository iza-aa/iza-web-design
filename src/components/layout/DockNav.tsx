"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { glassCard } from "@/lib/tokens";
import { useIntakeVisibility } from "@/lib/intake-visibility";
import { useLanguage } from "@/lib/language";
import { useTheme } from "@/lib/theme";
import { DockItem } from "@/components/ui/DockItem";
import logoIza from "@/assets/logo/logoiza.png";
import logoAiDark from "@/assets/logo/logoaidark.png";
import logoAiLight from "@/assets/logo/logoailight.png";
import logoComponent from "@/assets/logo/logocomponent.png";

const items = [
  {
    href: "/",
    labelKey: "nav.work",
    match: (p: string) => p === "/" || p.startsWith("/about") || p.startsWith("/showcase") || p.startsWith("/start"),
    icon: (
      <div className="relative h-full w-full overflow-hidden rounded-sm">
        <Image src={logoIza} alt="" fill sizes="48px" priority className="object-cover" />
      </div>
    ),
  },
  {
    href: "/docs",
    labelKey: "nav.components",
    match: (p: string) => p.startsWith("/docs"),
    icon: (
      <div className="relative h-full w-full overflow-hidden rounded-sm">
        <Image src={logoComponent} alt="" fill sizes="48px" priority className="object-cover" />
      </div>
    ),
  },
];

// macOS-dock-style magnification: how much a neighbor's boost falls off per
// index step away from the hovered item, and the padding-top range that
// makes room for the tallest currently-boosted icon (base 8px, up to +22px
// at boost 1 — matches DockItem's own scale/lift curve so the enlarged icon
// never visually pokes past the pill's top edge).
const BOOST_FALLOFF = 0.55;
const BASE_PADDING_TOP = 8;
const MAX_EXTRA_PADDING_TOP = 22;
// gap-3 (12px) is fine at rest, but a boosted icon scales up to 1.4x (48px ->
// ~67px) — at 12px gap the enlarged icon's edge crowds right into its
// (also slightly boosted) neighbor. Widening the gap alongside the growth
// gives the magnified icon room without touching neighbors.
const BASE_GAP = 12;
const MAX_EXTRA_GAP = 10;

export function DockNav() {
  const pathname = usePathname();
  const { closed, reopen } = useIntakeVisibility();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const showReopen = pathname === "/" && closed;

  const entries = [
    ...(showReopen
      ? [
          {
            key: "reopen",
            onClick: reopen,
            label: t("nav.reopenChat"),
            icon: (
              <div className="relative h-full w-full overflow-hidden rounded-sm">
                <Image src={theme === "dark" ? logoAiDark : logoAiLight} alt="" fill sizes="48px" className="object-cover" />
              </div>
            ),
            active: undefined as boolean | undefined,
            href: undefined as string | undefined,
          },
        ]
      : []),
    ...items.map((item) => ({
      key: item.href,
      onClick: undefined,
      label: t(item.labelKey),
      icon: item.icon,
      active: item.match(pathname),
      href: item.href,
    })),
  ];

  const maxBoost = hoveredIndex === null ? 0 : 1;

  return (
    <motion.nav
      aria-label="Primary"
      // `gap`'s CSS default is the keyword "normal", not a number — Framer
      // Motion can't animate *from* that, hence `initial` seeding a real
      // starting value here (paddingTop defaults to 0, already animatable,
      // but set here too for symmetry).
      initial={{ paddingTop: BASE_PADDING_TOP, gap: BASE_GAP }}
      animate={{
        paddingTop: BASE_PADDING_TOP + MAX_EXTRA_PADDING_TOP * maxBoost,
        gap: BASE_GAP + MAX_EXTRA_GAP * maxBoost,
      }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-end rounded-md px-2 pb-2 ${glassCard}`}
    >
      {entries.map((entry, i) => (
        <DockItem
          key={entry.key}
          href={entry.href}
          onClick={entry.onClick}
          label={entry.label}
          icon={entry.icon}
          active={entry.active}
          boost={hoveredIndex === null ? 0 : Math.max(0, 1 - Math.abs(i - hoveredIndex) * BOOST_FALLOFF)}
          onHoverStart={() => setHoveredIndex(i)}
          onHoverEnd={() => setHoveredIndex((h) => (h === i ? null : h))}
        />
      ))}
    </motion.nav>
  );
}
