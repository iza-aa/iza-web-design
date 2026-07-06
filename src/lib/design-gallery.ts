/**
 * Design Prompt Gallery — shared types + the Superdesign.dev API mapper.
 * See docs/design-gallery.md for the full spec (unified shape, fetch
 * strategy, the previewUrl CSP constraint, etc.) — this file only implements
 * what that spec describes.
 */

export type DesignEntry = {
  id: string;
  source: "iza" | "superdesign" | "color-reference";
  title: string;
  slug: string;
  description: string;
  tags: string[];
  thumbnailUrl: string;
  prompt: string;
  previewHtml?: string;
  previewUrl?: string;
  creator?: { name: string; avatarUrl: string };
  sourceUrl?: string;
  // "color-reference" entries only — a brand's color system as a hex list
  // (first entry conventionally the base/canvas color), a designated accent
  // for the title-row dot, and a short category pill label (e.g. "Media").
  // See src/data/color-reference-entries.ts.
  colors?: string[];
  accentColor?: string;
  category?: string;
};

type SuperdesignApiItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  tags: string[];
  prompt: string;
  thumbnail?: { url?: string; type?: string };
  previewUrl?: string;
  creator?: { name?: string; avatar?: string };
};

type SuperdesignApiResponse = {
  items: SuperdesignApiItem[];
  total: number;
};

const SUPERDESIGN_TEAM_ID = "3893cf88-5782-4d87-9f92-baf1966238e4";
const SUPERDESIGN_ENDPOINT = "https://api.superdesign.dev/v1/prompt-library";

function mapSuperdesignItem(item: SuperdesignApiItem): DesignEntry {
  return {
    id: item.id,
    source: "superdesign",
    title: item.title,
    slug: item.slug,
    description: item.description,
    tags: item.tags ?? [],
    // Some entries' thumbnails are .mp4 clips (animation-tagged items) — next/image
    // can't optimize video, so only expose it as a thumbnail when it's actually an image.
    thumbnailUrl: item.thumbnail?.type === "image" ? (item.thumbnail?.url ?? "") : "",
    prompt: item.prompt,
    previewUrl: item.previewUrl,
    creator: item.creator?.name
      ? { name: item.creator.name, avatarUrl: item.creator.avatar ?? "" }
      : undefined,
    sourceUrl: `https://superdesign.dev/prompt-library/${item.slug}`,
  };
}

/**
 * Server-only — never call this from the client. Next's fetch cache
 * (`revalidate`) means the upstream (unofficial, undocumented) API only gets
 * hit once per hour total across all visitors, not once per page view.
 */
export async function fetchSuperdesignEntries(tag?: string): Promise<DesignEntry[]> {
  const params = new URLSearchParams({ teamId: SUPERDESIGN_TEAM_ID, isPublic: "true", limit: "60", offset: "0" });
  if (tag) params.set("tags", tag);

  try {
    const res = await fetch(`${SUPERDESIGN_ENDPOINT}?${params}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data: SuperdesignApiResponse = await res.json();
    return data.items.map(mapSuperdesignItem);
  } catch {
    // Third-party, undocumented API — a hiccup there shouldn't break the whole gallery.
    return [];
  }
}
