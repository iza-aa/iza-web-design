"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import lefttoplogo from "@/assets/logo/lefttoplogo.png";
import lefttoplogolight from "@/assets/logo/lefttoplogolight.png";
import { useTheme } from "@/lib/theme";

const PUNCTUATION = [".", "?", "!"];

export function BrandMark() {
  const [index, setIndex] = useState(0);
  const { theme } = useTheme();

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % PUNCTUATION.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <Link
      href="/"
      className="fixed left-1/2 top-6 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-transparent p-1 lg:left-6 lg:translate-x-0"
      aria-label="IZA UI — home"
    >
      <Image
        src={theme === "light" ? lefttoplogolight : lefttoplogo}
        alt=""
        width={47}
        height={24}
        className="h-3 w-auto sm:h-4"
        priority
      />
      <span className="hidden font-display text-sm font-bold text-on-surface sm:inline-block sm:text-base">
        web design
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="inline-block"
          >
            {PUNCTUATION[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </Link>
  );
}
