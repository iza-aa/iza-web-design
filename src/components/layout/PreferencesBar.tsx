"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useLanguage, type Locale } from "@/lib/language";
import { glassCard } from "@/lib/tokens";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PreferencesBar() {
  const { theme, toggle } = useTheme();
  const { locale, setLocale } = useLanguage();

  function selectLocale(next: Locale) {
    if (next !== locale) setLocale(next);
  }

  return (
    <div className={`fixed right-4 top-4 z-40 flex items-center gap-1 rounded-full p-1 text-secondary sm:right-6 sm:top-6 ${glassCard}`}>
      <div className="flex items-center rounded-full text-xs font-medium">
        <button
          type="button"
          onClick={() => selectLocale("en")}
          className={`rounded-full px-2 py-1 transition-colors ${locale === "en" ? "bg-primary text-primary-contrast" : "hover:text-on-surface"}`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => selectLocale("id")}
          className={`rounded-full px-2 py-1 transition-colors ${locale === "id" ? "bg-primary text-primary-contrast" : "hover:text-on-surface"}`}
        >
          ID
        </button>
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-label="Toggle theme"
        className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full transition-colors hover:text-on-surface"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center"
          >
            {theme === "dark" ? <MoonIcon /> : <SunIcon />}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}
