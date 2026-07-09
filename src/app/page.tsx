"use client";

import { CinematicHero } from "@/components/marketing/CinematicHero";
import { useLanguage } from "@/lib/language";

// Top-level (outside the (marketing) route group) on purpose: that group's
// layout wraps children in a `max-w-7xl px-6 py-16 <main>` plus a fixed
// AmbientCanvas backdrop, which would fight this page's own full-viewport
// pinned-scroll hero and self-contained background treatment (film grain +
// grid). Root layout's DockNav/BrandMark still apply as normal.
export default function HomePage() {
  const { t } = useLanguage();

  return (
    <CinematicHero
      tagline1={t("cinematicHero.tagline1")}
      tagline2={t("cinematicHero.tagline2")}
      tagline3={t("cinematicHero.tagline3")}
      cardHeading={t("cinematicHero.cardHeading")}
      cardDescription={t("cinematicHero.cardDescription")}
      ctaHeading={t("cinematicHero.ctaHeading")}
      ctaDescription={t("cinematicHero.ctaDescription")}
      badge1Title={t("cinematicHero.badge1Title")}
      badge1Sub={t("cinematicHero.badge1Sub")}
      badge2Title={t("cinematicHero.badge2Title")}
      badge2Sub={t("cinematicHero.badge2Sub")}
      ctaPrimaryLabel={t("common.startProject")}
      ctaSecondaryLabel={t("common.viewAllWork")}
      phoneEyebrow={t("cinematicHero.phoneEyebrow")}
      phoneTitle={t("cinematicHero.phoneTitle")}
      chatPlaceholder={t("cinematicHero.chatPlaceholder")}
      chatPrompt={t("cinematicHero.chatPrompt")}
      notif1Title={t("cinematicHero.notif1Title")}
      notif1Time={t("cinematicHero.notif1Time")}
      notif2Title={t("cinematicHero.notif2Title")}
      notif2Time={t("cinematicHero.notif2Time")}
      notif3Title={t("cinematicHero.notif3Title")}
      notif4Title={t("cinematicHero.notif4Title")}
      notif4Time={t("cinematicHero.notif4Time")}
    />
  );
}
