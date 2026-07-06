import type { StaticImageData } from "next/image";
import type { DesignEntry } from "@/lib/design-gallery";
import assetIzaLabs from "@/assets/project/asset-1.png";
import assetBusinessCommand from "@/assets/project/asset-2.png";
import assetHidro from "@/assets/project/asset-3.png";

/**
 * Iza-authored gallery entries — real shipped projects, screenshot-sourced
 * (same assets as src/lib/showcase.ts's case studies). To add another one,
 * just push a new object onto `projects` below — nothing else in this file
 * needs to change.
 *
 * `description`/`prompt` below are draft copy (same "needs owner review"
 * status as showcase.ts's case studies) — replace with the real project
 * story/design-spec whenever it's written.
 */
type IzaProject = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  image: StaticImageData;
  prompt: string;
};

const projects: IzaProject[] = [
  {
    slug: "iza-creation-labs",
    title: "IZA Creation Labs",
    description: "A dark-themed developer portfolio with a dual-column project showcase.",
    tags: ["portfolio", "dark mode", "developer"],
    image: assetIzaLabs,
    prompt:
      "Draft — visible in the shot: dual-column project grid (50% width per project, 16:9 cinematic aspect), full responsive down to mobile stacking, live Jakarta clock in the header, GitHub link + theme toggle.",
  },
  {
    slug: "business-command",
    title: "Iza Management Information System",
    description: "An owner-facing analytics dashboard with AI-generated business advice.",
    tags: ["saas", "dashboard", "analytics"],
    image: assetBusinessCommand,
    prompt:
      "Draft — visible in the shot: Sales/Customer/Inventory/Staff/Operation tabs, a business health gauge, date-range filtering with export, and a \"Generate Owner Advice\" AI insight panel.",
  },
  {
    slug: "hidro-water-treatment",
    title: "HIDRO Water Treatment System",
    description: "A B2B marketing site for a water-depot machine and treatment-plant business.",
    tags: ["marketing", "b2b", "landing page"],
    image: assetHidro,
    prompt:
      "Draft — visible in the shot: hero carousel with 24/7-support messaging, trust stats (units installed, years of experience, warranty coverage, delivery reach), and a market-potential section explaining why the business category is durable.",
  },
];

export const izaDesignEntries: DesignEntry[] = projects.map((p) => ({
  id: `iza-${p.slug}`,
  source: "iza",
  title: p.title,
  slug: p.slug,
  description: p.description,
  tags: p.tags,
  thumbnailUrl: p.image.src,
  prompt: p.prompt,
}));
