"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { componentDocs, componentDocGroups } from "@/lib/component-docs";

const topLinks = [
  { href: "/docs", label: "Introduction" },
  { href: "/docs/installation", label: "Installation" },
  { href: "/docs/theming", label: "Theming" },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`block rounded-md px-3 py-1.5 transition-colors ${
        active ? "bg-primary/10 font-medium text-primary" : "text-secondary hover:text-on-surface"
      }`}
    >
      {label}
    </Link>
  );
}

export function DocsSidebar() {
  return (
    <nav aria-label="Docs" className="flex flex-col gap-6 text-sm">
      <div className="flex flex-col gap-1">
        {topLinks.map((link) => (
          <NavLink key={link.href} {...link} />
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
                <NavLink key={c.slug} href={`/docs/components/${c.slug}`} label={c.name} />
              ))}
          </div>
        ))}
      </div>
    </nav>
  );
}
