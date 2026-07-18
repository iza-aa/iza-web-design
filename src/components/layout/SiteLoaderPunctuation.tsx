"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Same cycling-punctuation concept as BrandMark.tsx (the fixed top-left
// logo+text) — same 3 marks, same fade/slide transition — just reused here
// for the full-screen loading state instead of the small corner bar.
const PUNCTUATION = [".", "?", "!"];

export function SiteLoaderPunctuation() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % PUNCTUATION.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
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
  );
}
