"use client";

import Image from "next/image";
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
        <Image src={logoIza} alt="" fill className="object-cover" />
      </div>
    ),
  },
  {
    href: "/docs",
    labelKey: "nav.components",
    match: (p: string) => p.startsWith("/docs"),
    icon: (
      <div className="relative h-full w-full overflow-hidden rounded-sm">
        <Image src={logoComponent} alt="" fill className="object-cover" />
      </div>
    ),
  },
];

export function DockNav() {
  const pathname = usePathname();
  const { closed, reopen } = useIntakeVisibility();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const showReopen = pathname === "/" && closed;

  return (
    <nav
      aria-label="Primary"
      className={`fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-md p-2 ${glassCard}`}
    >
      {showReopen && (
        <DockItem
          onClick={reopen}
          label={t("nav.reopenChat")}
          icon={
            <div className="relative h-full w-full overflow-hidden rounded-sm">
              <Image src={theme === "dark" ? logoAiDark : logoAiLight} alt="" fill className="object-cover" />
            </div>
          }
        />
      )}

      {items.map((item) => (
        <DockItem
          key={item.href}
          href={item.href}
          label={t(item.labelKey)}
          icon={item.icon}
          active={item.match(pathname)}
        />
      ))}
    </nav>
  );
}
