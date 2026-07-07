"use client";

import type { ComponentDoc } from "@/lib/component-docs";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { ComponentPreview } from "@/components/docs/ComponentPreview";
import { useLanguage } from "@/lib/language";

export function ComponentDocView({ doc, source }: { doc: ComponentDoc; source: string }) {
  const { t } = useLanguage();
  const groupLabel = doc.group === "Layout" ? t("docs.groups.layout") : t("docs.groups.canvas");

  return (
    <article className="flex flex-col gap-8 text-left">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">{groupLabel}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">{t(doc.nameKey)}</h1>
        <p className="mt-3 text-secondary">{t(doc.descriptionKey)}</p>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">{t("docs.componentDetail.preview")}</p>
        <div className="flex min-h-40 items-center justify-center rounded-lg border border-border-subtle p-6 sm:p-10">
          <ComponentPreview slug={doc.slug} />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">{t("docs.componentDetail.code")}</p>
        <CodeBlock code={source} />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">{t("docs.componentDetail.installation")}</p>
        <CodeBlock code={doc.install} label={t("docs.componentDetail.usageLabel")} />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">{t("docs.componentDetail.props")}</p>
        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-xs uppercase tracking-wide text-secondary">
                <th className="px-4 py-2 font-medium">{t("docs.componentDetail.propName")}</th>
                <th className="px-4 py-2 font-medium">{t("docs.componentDetail.propType")}</th>
                <th className="px-4 py-2 font-medium">{t("docs.componentDetail.propDefault")}</th>
                <th className="px-4 py-2 font-medium">{t("docs.componentDetail.propDescription")}</th>
              </tr>
            </thead>
            <tbody>
              {doc.props.map((p) => (
                <tr key={p.name} className="border-b border-border-subtle last:border-0">
                  <td className="px-4 py-2 font-mono text-xs text-on-surface">{p.name}</td>
                  <td className="px-4 py-2 font-mono text-xs text-secondary">{p.type}</td>
                  <td className="px-4 py-2 font-mono text-xs text-secondary">{p.default ?? "—"}</td>
                  <td className="px-4 py-2 text-secondary">{t(p.descriptionKey)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">{t("docs.componentDetail.accessibility")}</p>
        <p className="text-secondary">{t(doc.a11yKey)}</p>
      </div>
    </article>
  );
}
