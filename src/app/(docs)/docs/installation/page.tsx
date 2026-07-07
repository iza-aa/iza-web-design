"use client";

import { CodeBlock } from "@/components/docs/CodeBlock";
import { useLanguage } from "@/lib/language";

const npmInstallSnippet = `npm install iza-ui`;
const npmUsageSnippet = `import "iza-ui/styles.css"; // once, anywhere in your app
import { Dock, WindowCard, AmbientCanvas } from "iza-ui";`;

const themeSnippet = `@theme {
  --color-primary: #3B82F6;
  --color-secondary: #9CA3AF;
  --color-tertiary: #3F3F46;
  --color-neutral: #DCE0E8;
  --color-surface: #1C1C21;
  --color-on-surface: #F5F5F7;
  --color-error: #EF4444;
  --color-primary-contrast: #FFFFFF;
  --color-border-subtle: #33333A;
}`;

export default function InstallationPage() {
  const { t } = useLanguage();

  return (
    <article className="flex flex-col gap-6 text-left">
      <div>
        <h1 className="font-display text-3xl font-semibold">{t("docs.installation.title")}</h1>
        <p className="mt-4 text-secondary">{t("docs.installation.subtitle")}</p>
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold">{t("docs.installation.option1Title")}</h2>
        <p className="mt-2 text-secondary">{t("docs.installation.option1Body")}</p>
        <div className="mt-3 flex flex-col gap-3">
          <CodeBlock code={npmInstallSnippet} label={t("docs.installation.installLabel")} language="bash" />
          <CodeBlock code={npmUsageSnippet} label={t("docs.installation.usageLabel")} />
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold">{t("docs.installation.option2Title")}</h2>
        <p className="mt-2 text-secondary">
          {t("docs.installation.option2Prefix")}
          <code className="rounded bg-(--glass-bg) px-1.5 py-0.5 text-sm">src/components/</code>
          {t("docs.installation.option2Mid")}
          <strong>{t("docs.componentDetail.code")}</strong>
          {t("docs.installation.option2Mid2")}
        </p>
      </div>

      <div>
        <h3 className="font-display text-lg font-semibold">{t("docs.installation.step1Title")}</h3>
        <p className="mt-2 text-secondary">
          {t("docs.installation.step1Prefix")}
          <code className="rounded bg-(--glass-bg) px-1.5 py-0.5 text-sm">@import &quot;tailwindcss&quot;</code>
          {t("docs.installation.step1Suffix")}
        </p>
      </div>

      <div>
        <h3 className="font-display text-lg font-semibold">{t("docs.installation.step2Title")}</h3>
        <p className="mt-2 text-secondary">
          {t("docs.installation.step2Prefix")}
          <code className="rounded bg-(--glass-bg) px-1.5 py-0.5 text-sm">bg-primary</code>
          {t("docs.installation.step2Mid")}
          <code className="rounded bg-(--glass-bg) px-1.5 py-0.5 text-sm">text-on-surface</code>
          {t("docs.installation.step2Mid2")}
          <code className="rounded bg-(--glass-bg) px-1.5 py-0.5 text-sm">@theme</code>
          {t("docs.installation.step2Mid3")}
          <a href="/docs/theming" className="text-primary hover:underline">
            {t("docs.nav.theming")}
          </a>
          {t("docs.installation.step2Mid4")}
          <code className="rounded bg-(--glass-bg) px-1.5 py-0.5 text-sm">--glass-*</code>
          {t("docs.installation.step2Mid5")}
          <code className="rounded bg-(--glass-bg) px-1.5 py-0.5 text-sm">glassCard</code>
          {t("docs.installation.step2Suffix")}
          <code className="rounded bg-(--glass-bg) px-1.5 py-0.5 text-sm">src/lib/tokens.ts</code>
          {t("docs.installation.step2End")}
        </p>
        <div className="mt-3">
          <CodeBlock code={themeSnippet} label={t("docs.installation.themeSnippetLabel")} language="css" />
        </div>
      </div>
    </article>
  );
}
