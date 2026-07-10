"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { componentDocs, componentDocGroups } from "@/lib/component-docs";
import { useLanguage } from "@/lib/language";
import { glassCardStrong } from "@/lib/tokens";

const topLinks = [
  { href: "/docs", labelKey: "docs.nav.introduction" },
  { href: "/docs/installation", labelKey: "docs.nav.installation" },
  { href: "/docs/theming", labelKey: "docs.nav.theming" },
  { href: "/docs/components", labelKey: "docs.nav.components" },
];

function groupLabel(group: (typeof componentDocGroups)[number], t: (path: string) => string) {
  if (group === "Layout") return t("docs.groups.layout");
  return t("docs.groups.canvas");
}

function NavLink({ href, label, onNavigate }: { href: string; label: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`block rounded-md px-3 py-1.5 transition-colors ${
        active ? "bg-primary/10 font-medium text-primary" : "text-secondary hover:text-on-surface"
      }`}
    >
      {label}
    </Link>
  );
}

export function DocsSidebar() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const links = (
    <>
      <div className="flex flex-col gap-1">
        {topLinks.map((link) => (
          <NavLink key={link.href} href={link.href} label={t(link.labelKey)} onNavigate={() => setOpen(false)} />
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <p className="px-3 text-xs font-semibold uppercase tracking-wide text-secondary">{t("docs.nav.components")}</p>
        {componentDocGroups.map((group) => (
          <div key={group} className="flex flex-col gap-1">
            <p className="px-3 text-xs text-secondary">{groupLabel(group, t)}</p>
            {componentDocs
              .filter((c) => c.group === group)
              .map((c) => (
                <NavLink
                  key={c.slug}
                  href={`/docs/components/${c.slug}`}
                  label={t(c.nameKey)}
                  onNavigate={() => setOpen(false)}
                />
              ))}
          </div>
        ))}
      </div>
    </>
  );

  return (
    <nav aria-label="Docs" className="text-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? t("common.close") : t("docs.nav.menu")}
        className="fixed left-4 top-4 z-80 flex items-center gap-2.5 rounded-md px-3 py-2.5 font-medium text-on-surface sm:left-6 sm:top-6 lg:hidden"
      >
        <span className="relative flex h-3.5 w-4 shrink-0 items-center justify-center">
          <motion.span
            animate={{ rotate: open ? 45 : 0, y: open ? 0 : -4 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute h-0.5 w-4 rounded-full bg-current"
          />
          <motion.span
            animate={{ rotate: open ? -45 : 0, y: open ? 0 : 4 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute h-0.5 w-4 rounded-full bg-current"
          />
        </span>
        {t("docs.nav.menu")}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            aria-hidden
            className="fixed inset-0 z-65 bg-black/60 lg:hidden"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed inset-y-0 left-0 z-70 flex w-2/3 flex-col gap-6 overflow-y-auto p-6 pt-20 sm:pt-24 lg:hidden ${glassCardStrong}`}
          >
            {links}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden flex-col gap-6 lg:flex">{links}</div>
    </nav>
  );
}
