import { caseStudies } from "@/lib/showcase";
import { ShowcaseDetailClient } from "./ShowcaseDetailClient";

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export default async function ShowcaseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ShowcaseDetailClient slug={slug} />;
}
