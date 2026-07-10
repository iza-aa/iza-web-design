"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

const MARGIN_PER_BOOST = 9.6;

export function DockItem({
  href,
  label,
  icon,
  active,
  onClick,
  boost = 0,
  onHoverStart,
  onHoverEnd,
}: {
  href?: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick?: () => void;
  boost?: number;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}) {
  const margin = boost * MARGIN_PER_BOOST;
  const wrapperStyle = { marginLeft: margin, marginRight: margin };
  const content = (
    <>
      <motion.div
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
        animate={{ scale: 1 + boost * 0.4, y: -boost * 14 }}
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
      <Link
        href={href}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        className="group relative transition-[margin] duration-200 ease-out"
        style={wrapperStyle}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="group relative transition-[margin] duration-200 ease-out"
      style={wrapperStyle}
    >
      {content}
    </button>
  );
}
