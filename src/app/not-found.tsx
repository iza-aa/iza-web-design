"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { scaleIn } from "@/lib/motion";
import { WindowCard } from "@/components/ui/WindowCard";
import { useLanguage } from "@/lib/language";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto flex min-h-140 w-full max-w-3xl items-center justify-center px-6 text-center">
      <motion.div variants={scaleIn} initial="hidden" animate="show" className="w-full">
        <WindowCard>
          <div className="p-8 sm:p-10">
            <p className="font-display text-6xl font-bold text-primary">404</p>
            <h1 className="mt-3 font-display text-2xl font-bold sm:text-3xl">{t("notFound.title")}</h1>
            <p className="mt-3 text-secondary">{t("notFound.body")}</p>
            <Link
              href="/"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-contrast transition-transform hover:scale-[1.02] active:scale-[0.97]"
            >
              {t("common.backHome")}
            </Link>
          </div>
        </WindowCard>
      </motion.div>
    </div>
  );
}
