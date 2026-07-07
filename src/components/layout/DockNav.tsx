"use client";

import { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { glassCard } from "@/lib/tokens";
import { useIntakeVisibility } from "@/lib/intake-visibility";
import { useLanguage } from "@/lib/language";
import { useTheme } from "@/lib/theme";
import { DockItem } from "@/components/ui/DockItem";
import { ContactModal } from "@/components/layout/ContactModal";
import logoIza from "@/assets/logo/logoiza.png";
import logoAiDark from "@/assets/logo/logoaidark.png";
import logoAiLight from "@/assets/logo/logoailight.png";
import logoComponent from "@/assets/logo/logocomponent.png";
import darkContactIcon from "@/assets/logo/darkcontacticon.png";
import lightContactIcon from "@/assets/logo/lightcontacticon.png";

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
// index step away from the hovered item. DockItem scales icons up to 1.4x
// (48px box, +0.4 * boost) and lifts the hovered one up by 14px * boost — the
// pill itself stays a fixed size, so the magnified icon visually pokes past
// its top/side edges rather than growing the card to contain it. Item-to-item
// spacing is handled per-item in DockItem (margin driven by each item's own
// boost), not a shared container `gap`.
const BOOST_FALLOFF = 0.55;

export function DockNav() {
  const pathname = usePathname();
  const { closed, reopen } = useIntakeVisibility();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
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
    {
      key: "contact",
      onClick: () => setContactOpen(true),
      label: t("nav.contact"),
      icon: (
        <div className="relative h-full w-full overflow-hidden rounded-sm">
          <Image
            src={theme === "dark" ? darkContactIcon : lightContactIcon}
            alt=""
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
      ),
      active: undefined as boolean | undefined,
      href: undefined as string | undefined,
    },
  ];

  return (
    <>
      <nav
        aria-label="Primary"
        className={`fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-end gap-3 rounded-md px-2 pt-2 pb-2 ${glassCard}`}
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
      </nav>
      <AnimatePresence>{contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}</AnimatePresence>
    </>
  );
}
