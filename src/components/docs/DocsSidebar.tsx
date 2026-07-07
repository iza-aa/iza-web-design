"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { componentDocs, componentDocGroups } from "@/lib/component-docs";

const topLinks = [
  { href: "/docs", label: "Introduction" },
  { href: "/docs/installation", label: "Installation" },
  { href: "/docs/theming", label: "Theming" },
];

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

function currentLabel(pathname: string) {
  const top = topLinks.find((l) => l.href === pathname);
  if (top) return top.label;
  const component = componentDocs.find((c) => `/docs/components/${c.slug}` === pathname);
  return component?.name ?? "Menu";
}

export function DocsSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = (
    <>
      <div className="flex flex-col gap-1">
        {topLinks.map((link) => (
          <NavLink key={link.href} {...link} onNavigate={() => setOpen(false)} />
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <p className="px-3 text-xs font-semibold uppercase tracking-wide text-secondary">Components</p>
        {componentDocGroups.map((group) => (
          <div key={group} className="flex flex-col gap-1">
            <p className="px-3 text-xs text-secondary">{group}</p>
            {componentDocs
              .filter((c) => c.group === group)
              .map((c) => (
                <NavLink
                  key={c.slug}
                  href={`/docs/components/${c.slug}`}
                  label={c.name}
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
        className="flex w-full items-center justify-between rounded-md border border-border-subtle px-3 py-2.5 text-left font-medium text-on-surface lg:hidden"
      >
        {currentLabel(pathname)}
        <motion.svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="shrink-0 text-secondary"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden lg:hidden"
          >
            <div className="flex flex-col gap-6 pt-3">{links}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden flex-col gap-6 lg:flex">{links}</div>
    </nav>
  );
}
