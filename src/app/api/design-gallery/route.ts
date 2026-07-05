import { fetchSuperdesignEntries } from "@/lib/design-gallery";

// Iza entries are a static local module (src/data/iza-design-entries.ts) —
// components import them directly, no network round-trip needed. This route
// only ever serves the Superdesign.dev side, fetched lazily by the client
// once the visitor actually scrolls toward it (see DesignGalleryGrid).
export async function GET() {
  const items = await fetchSuperdesignEntries();
  return Response.json({ items });
}
