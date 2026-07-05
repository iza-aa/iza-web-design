"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import lefttoplogo from "@/assets/logo/lefttoplogo.png";

const PUNCTUATION = [".", "?", "!"];

export function BrandMark() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % PUNCTUATION.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <Link
      href="/"
      className="fixed left-4 top-4 z-40 flex items-center gap-2 sm:left-6 sm:top-6"
      aria-label="IZA UI — home"
    >
      <Image src={lefttoplogo} alt="" width={47} height={24} className="h-6 w-auto sm:h-7" priority />
      <span className="font-display text-sm font-semibold text-on-surface sm:text-base">
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
