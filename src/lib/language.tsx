"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import en from "@/dictionaries/en.json";
import id from "@/dictionaries/id.json";

export type Locale = "en" | "id";

const dictionaries = { en, id } as const;
type Dictionary = typeof en;

export const LANG_STORAGE_KEY = "hyliox-lang";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string, vars?: Record<string, string>) => string;
  tList: (path: string) => string[];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getPath(dict: Dictionary, path: string): string {
  const value = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) return (acc as Record<string, unknown>)[key];
    return undefined;
  }, dict);
  return typeof value === "string" ? value : path;
}

function getListPath(dict: Dictionary, path: string): string[] {
  const value = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) return (acc as Record<string, unknown>)[key];
    return undefined;
  }, dict);
  return Array.isArray(value) ? (value as string[]) : [path];
}

function interpolate(str: string, vars?: Record<string, string>): string {
  if (!vars) return str;
  return Object.entries(vars).reduce((acc, [key, val]) => acc.replaceAll(`{${key}}`, val), str);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === "en" || saved === "id") {
      setLocaleState(saved);
      return;
    }
    setLocaleState(navigator.language.toLowerCase().startsWith("id") ? "id" : "en");
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    localStorage.setItem(LANG_STORAGE_KEY, next);
  }

  function t(path: string, vars?: Record<string, string>) {
    return interpolate(getPath(dictionaries[locale], path), vars);
  }

  function tList(path: string) {
    return getListPath(dictionaries[locale], path);
  }

  return <LanguageContext.Provider value={{ locale, setLocale, t, tList }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
