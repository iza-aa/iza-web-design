import fs from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import { getComponentDoc, componentDocs } from "@/lib/component-docs";
import { ComponentDocView } from "@/components/docs/ComponentDocView";

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

  return <ComponentDocView doc={doc} source={source} />;
}
