import { izaDesignEntries } from "@/data/iza-design-entries";
import { colorReferenceEntries } from "@/data/color-reference-entries";
import { GalleryDetailClient } from "./GalleryDetailClient";

// Only the local Iza + Color Reference entries are known at build time —
// Superdesign entries live behind a runtime fetch (see GalleryDetailClient),
// so their slugs stay dynamically rendered on first request exactly as before.
export function generateStaticParams() {
  return [...izaDesignEntries, ...colorReferenceEntries].map((e) => ({ slug: e.slug }));
}

export default async function GalleryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <GalleryDetailClient slug={slug} />;
}
