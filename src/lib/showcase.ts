import type { StaticImageData } from "next/image";
import assetIzaLabs from "@/assets/project/asset-1.png";
import assetBusinessCommand from "@/assets/project/asset-2.png";
import assetHidro from "@/assets/project/asset-3.png";

/**
 * Real projects, screenshot-sourced. Copy below is drafted only from what's
 * visible in the screenshot itself (no invented client names or metrics) —
 * same "draft, needs owner review" status as /about's copy. Replace
 * problem/approach/outcome with the real story once written.
 */
export type CaseStudy = {
  slug: string;
  title: string;
  type: string;
  summary: string;
  problem: string;
  approach: string;
  outcome: string;
  image: StaticImageData;
  url: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "iza-creation-labs",
    title: "IZA Creation Labs",
    type: "Portfolio Site",
    summary: "A dark-themed developer portfolio with a dual-column project showcase.",
    problem: "Draft — describe the real brief/context here.",
    approach:
      "Draft — visible in the shot: dual-column project grid (50% width per project, 16:9 cinematic aspect), full responsive down to mobile stacking, live Jakarta clock in the header, GitHub link + theme toggle.",
    outcome: "Draft — describe the outcome or current status.",
    image: assetIzaLabs,
    url: "https://iza-porto.vercel.app",
  },
  {
    slug: "business-command",
    title: "Business Command",
    type: "SaaS Dashboard",
    summary: "An owner-facing analytics dashboard with AI-generated business advice.",
    problem: "Draft — describe the real brief/context here.",
    approach:
      "Draft — visible in the shot: Sales/Customer/Inventory/Staff/Operation tabs, a business health gauge, date-range filtering with export, and a \"Generate Owner Advice\" AI insight panel.",
    outcome: "Draft — describe the outcome or current status.",
    image: assetBusinessCommand,
    url: "https://iza-pos-v2.vercel.app",
  },
  {
    slug: "hidro-water-treatment",
    title: "HIDRO Water Treatment System",
    type: "Marketing Site",
    summary: "A B2B marketing site for a water-depot machine and treatment-plant business.",
    problem: "Draft — describe the real brief/context here.",
    approach:
      "Draft — visible in the shot: hero carousel with 24/7-support messaging, trust stats (units installed, years of experience, warranty coverage, delivery reach), and a market-potential section explaining why the business category is durable.",
    outcome: "Draft — describe the outcome or current status.",
    image: assetHidro,
    url: "https://hidro.co.id",
  },
];

export function getCaseStudy(slug: string) {
  return caseStudies.find((c) => c.slug === slug);
}
