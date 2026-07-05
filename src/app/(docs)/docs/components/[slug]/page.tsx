import fs from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import { getComponentDoc, componentDocs } from "@/lib/component-docs";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { ComponentPreview } from "@/components/docs/ComponentPreview";

export function generateStaticParams() {
  return componentDocs.map((c) => ({ slug: c.slug }));
}

export default async function ComponentDocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getComponentDoc(slug);
  if (!doc) notFound();

  const source = fs.readFileSync(path.join(process.cwd(), doc.sourcePath), "utf-8");

  return (
    <article className="flex flex-col gap-8 text-left">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">{doc.group}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">{doc.name}</h1>
        <p className="mt-3 text-secondary">{doc.description}</p>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Preview</p>
        <div className="flex min-h-40 items-center justify-center rounded-lg border border-border-subtle p-10">
          <ComponentPreview slug={doc.slug} />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Code</p>
        <CodeBlock code={source} label={doc.sourcePath} />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Installation</p>
        <CodeBlock code={doc.install} label="Usage" />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Props</p>
        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-xs uppercase tracking-wide text-secondary">
                <th className="px-4 py-2 font-medium">Prop</th>
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Default</th>
                <th className="px-4 py-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {doc.props.map((p) => (
                <tr key={p.name} className="border-b border-border-subtle last:border-0">
                  <td className="px-4 py-2 font-mono text-xs text-on-surface">{p.name}</td>
                  <td className="px-4 py-2 font-mono text-xs text-secondary">{p.type}</td>
                  <td className="px-4 py-2 font-mono text-xs text-secondary">{p.default ?? "—"}</td>
                  <td className="px-4 py-2 text-secondary">{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Accessibility</p>
        <p className="text-secondary">{doc.a11y}</p>
      </div>
    </article>
  );
}
