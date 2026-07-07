"use client";

import Link from "next/link";
import { componentDocs } from "@/lib/component-docs";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { glassCard } from "@/lib/tokens";
import { useLanguage } from "@/lib/language";

const installSnippet = `npm install iza-ui`;
const usageSnippet = `import "iza-ui/styles.css"; // once, anywhere in your app
import { Dock, WindowCard, AmbientCanvas } from "iza-ui";`;

export default function ComponentsIndexPage() {
  const { t } = useLanguage();

  return (
    <article className="flex flex-col gap-8 text-left">
      <div>
        <h1 className="font-display text-3xl font-semibold">{t("docs.componentsIndex.title")}</h1>
        <p className="mt-4 text-secondary">
          {t("docs.componentsIndex.bodyPrefix")}
          <code className="rounded bg-(--glass-bg) px-1.5 py-0.5 text-sm">iza-ui</code>
          {t("docs.componentsIndex.bodyMid")}
          <strong>{t("docs.componentDetail.code")}</strong>
          {t("docs.componentsIndex.bodySuffix")}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <CodeBlock code={installSnippet} label={t("docs.installation.installLabel")} language="bash" />
        <CodeBlock code={usageSnippet} label={t("docs.installation.usageLabel")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {componentDocs.map((doc) => (
          <Link
            key={doc.slug}
            href={`/docs/components/${doc.slug}`}
            className={`block rounded-lg p-5 transition-colors hover:border-primary ${glassCard}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
              {doc.group === "Layout" ? t("docs.groups.layout") : t("docs.groups.canvas")}
            </p>
            <p className="mt-2 font-display text-lg font-semibold">{t(doc.nameKey)}</p>
            <p className="mt-2 line-clamp-2 text-sm text-secondary">{t(doc.descriptionKey)}</p>
          </Link>
        ))}
      </div>
    </article>
  );
}
