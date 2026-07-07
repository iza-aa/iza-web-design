"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language";

export default function DocsIntroPage() {
  const { t } = useLanguage();

  return (
    <article className="flex flex-col gap-6 text-left">
      <div>
        <h1 className="font-display text-3xl font-semibold">{t("docs.intro.title")}</h1>
        <p className="mt-4 text-secondary">
          {t("docs.intro.bodyPrefix")}
          <code className="rounded bg-(--glass-bg) px-1.5 py-0.5 text-sm">iza-ui</code>
          {t("docs.intro.bodyMid")}
          <strong>{t("docs.componentDetail.code")}</strong>
          {t("docs.intro.bodySuffix")}
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold">{t("docs.intro.howItWorksTitle")}</h2>
        <p className="mt-2 text-secondary">
          {t("docs.intro.howItWorksPrefix")}
          <strong>{t("docs.componentDetail.code")}</strong>
          {t("docs.intro.howItWorksMid")}
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold">{t("docs.intro.startHereTitle")}</h2>
        <ul className="mt-2 flex flex-col gap-1 text-secondary">
          <li>
            <Link href="/docs/installation" className="text-primary hover:underline">
              {t("docs.nav.installation")}
            </Link>{" "}
            — {t("docs.intro.installationDesc")}
          </li>
          <li>
            <Link href="/docs/theming" className="text-primary hover:underline">
              {t("docs.nav.theming")}
            </Link>{" "}
            — {t("docs.intro.themingDesc")}
          </li>
          <li>
            <Link href="/docs/components" className="text-primary hover:underline">
              {t("docs.nav.components")}
            </Link>{" "}
            — {t("docs.components.windowCard.name")}, {t("docs.components.dockItem.name")}, {t("docs.components.ambientCanvas.name")}.
          </li>
        </ul>
      </div>
    </article>
  );
}
