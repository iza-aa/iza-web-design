"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * DockItem — `dock-item` token from hyliox-waitlist-card.md: a single
 * floating-dock tile with a hover tooltip and an active-state dot indicator.
 */
export function DockItem({
  href,
  label,
  icon,
  active,
  onClick,
}: {
  href?: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <motion.div
        whileHover={{ scale: 1.15, y: -4 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="h-12 w-12"
      >
        {icon}
      </motion.div>

      <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-on-surface px-2 py-1 text-xs font-medium text-surface opacity-0 transition-opacity group-hover:opacity-100">
        {label}
      </span>

      <span
        className={`absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full transition-opacity ${
          active ? "bg-primary opacity-100" : "opacity-0"
        }`}
      />
    </>
  );

  if (href) {
    return (
      <Link href={href} aria-label={label} aria-current={active ? "page" : undefined} className="group relative">
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} aria-label={label} className="group relative">
      {content}
    </button>
  );
}
