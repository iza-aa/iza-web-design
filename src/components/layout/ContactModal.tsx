"use client";

import Image, { type StaticImageData } from "next/image";
import { motion } from "framer-motion";
import { easing } from "@/lib/motion";
import { useLanguage } from "@/lib/language";
import emailIcon from "@/assets/logo/email.png";
import whatsappIcon from "@/assets/logo/whatsapp.png";
import instagramIcon from "@/assets/logo/instagram.png";

const WHATSAPP_NUMBER = "0881082854818";
const CONTACT_ROWS = [
  {
    key: "email",
    icon: emailIcon,
    value: "rezkyhaikal3@gmail.com",
    href: "mailto:rezkyhaikal3@gmail.com",
    external: false,
  },
  {
    key: "whatsapp",
    icon: whatsappIcon,
    value: WHATSAPP_NUMBER,
    href: `https://wa.me/62${WHATSAPP_NUMBER.slice(1)}`,
    external: true,
  },
  {
    key: "instagram",
    icon: instagramIcon,
    value: "@rzkyhkal",
    href: "https://instagram.com/rzkyhkal",
    external: true,
  },
] as const satisfies readonly { key: string; icon: StaticImageData; value: string; href: string; external: boolean }[];

const LOCATION_URL = "https://share.google/sS9eTwrwTcFrEoO5w";

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
      <path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12Z" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

export function ContactModal({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-(--glass-strong-bg)"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{
          opacity: 0,
          scale: 0.05,
          y: 420,
          transition: { duration: 0.55, ease: [0.68, 0, 0.85, 0] },
        }}
        transition={{ duration: 0.35, ease: easing.standard }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-112 overflow-hidden rounded-t-3xl border border-border-subtle bg-surface shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t("contact.closeAria")}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-(--glass-input-bg) text-on-surface transition-colors hover:bg-(--glass-bg)"
        >
          &times;
        </button>

        <div className="flex flex-col items-center pt-3">
          <span className="h-1.5 w-10 rounded-full bg-border-subtle" aria-hidden />
        </div>

        <div className="p-6 pt-4">
          <h2 className="font-display text-lg font-semibold text-on-surface">{t("contact.title")}</h2>

          <div className="mt-4 flex flex-col divide-y divide-border-subtle">
            {CONTACT_ROWS.map((row) => (
              <a
                key={row.key}
                href={row.href}
                target={row.external ? "_blank" : undefined}
                rel={row.external ? "noopener noreferrer" : undefined}
                className="flex items-center gap-3 py-3.5 transition-opacity hover:opacity-70"
              >
                <span className="relative h-5 w-5 shrink-0">
                  <Image src={row.icon} alt="" fill sizes="20px" className="object-contain" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wide text-secondary">{t(`aiIntake.contactMethods.${row.key}`)}</p>
                  <p className="truncate text-sm font-medium text-on-surface">{row.value}</p>
                </div>
              </a>
            ))}

            <a
              href={LOCATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 py-3.5 transition-opacity hover:opacity-70"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center text-on-surface">
                <PinIcon />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wide text-secondary">{t("contact.locationLabel")}</p>
                <p className="truncate text-sm font-medium text-on-surface">{t("contact.locationValue")}</p>
              </div>
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
