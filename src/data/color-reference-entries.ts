import type { DesignEntry } from "@/lib/design-gallery";

/**
 * Color Reference — curated brand color systems, one hex palette + a short
 * editorial blurb per entry. The *card format* takes inspiration from
 * designmd.co (credited in the detail page), but none of this data comes
 * from that site — it has no public API, just its own Next.js RSC internals.
 * Every hex value below is researched from each brand's own public design
 * material (brand guidelines / well-documented site chrome), written fresh.
 * Same "add another object to push a new one" pattern as
 * src/data/iza-design-entries.ts.
 */
type ColorReference = {
  slug: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  colors: string[];
  accentColor: string;
};

const references: ColorReference[] = [
  {
    slug: "spotify",
    title: "Spotify",
    category: "Media",
    description:
      "Near-black canvas (#121212) with Spotify Green (#1DB954) as the brand pulse — play controls, progress bars, and active states all key off that one accent against black, white, and gray neutrals.",
    tags: ["dark mode", "single-accent", "media"],
    colors: ["#121212", "#000000", "#1DB954", "#FFFFFF", "#A7A7A7"],
    accentColor: "#1DB954",
  },
  {
    slug: "netflix",
    title: "Netflix",
    category: "Media",
    description:
      "Same near-black-plus-one-accent formula as Spotify, tuned for drama instead of energy: a near-black canvas (#141414) with Netflix Red (#E50914) reserved for the logo and a handful of calls to action — everything else stays grayscale.",
    tags: ["dark mode", "single-accent", "media"],
    colors: ["#141414", "#000000", "#E50914", "#FFFFFF", "#808080"],
    accentColor: "#E50914",
  },
  {
    slug: "airbnb",
    title: "Airbnb",
    category: "Travel",
    description:
      "Inverted from the streaming pair above: a white canvas carrying one warm accent, Airbnb's own-named \"Rausch\" (#FF5A5F) — used for primary actions and the logo, kept legible against charcoal text and light-gray dividers.",
    tags: ["light mode", "single-accent", "travel"],
    colors: ["#FFFFFF", "#FF5A5F", "#484848", "#767676", "#EBEBEB"],
    accentColor: "#FF5A5F",
  },
  {
    slug: "slack",
    title: "Slack",
    category: "Productivity",
    description:
      "The outlier here — no single accent. Slack's Aubergine (#4A154B) anchors the product chrome, but the logo's four-color set (blue #36C5F0, green #2EB67D, yellow #ECB22E, red-pink #E01E5A) all appear as equals across icons and highlights, not one dominant hue.",
    tags: ["multi-accent", "productivity", "tech"],
    colors: ["#4A154B", "#36C5F0", "#2EB67D", "#ECB22E", "#E01E5A"],
    accentColor: "#36C5F0",
  },
  {
    slug: "adobe",
    title: "Adobe",
    category: "Creative Tools",
    description:
      "Pure Adobe Red (#FF0000) — no gradient, no secondary shade — against a strict black-and-white neutral base. The whole system leans on that single saturated red doing all the work of standing out.",
    tags: ["light mode", "single-accent", "creative"],
    colors: ["#FFFFFF", "#000000", "#FF0000"],
    accentColor: "#FF0000",
  },
  {
    slug: "apple",
    title: "Apple",
    category: "Tech",
    description:
      "Black-and-white contrast carries almost the entire brand; the one recurring accent is apple.com's interface blue (#0071E3), reserved for buttons and links so it reads as functional, not decorative.",
    tags: ["light mode", "single-accent", "tech"],
    colors: ["#FFFFFF", "#000000", "#0071E3", "#F5F5F7"],
    accentColor: "#0071E3",
  },
  {
    slug: "github",
    title: "GitHub",
    category: "Developer Tools",
    description:
      "Primer (GitHub's own design system) defines a near-black dark canvas (#0D1117) alongside white, with an accent blue (#0969DA) for links/focus states and a merge-button green (#2DA44E) as the one other recurring signal color.",
    tags: ["dark mode", "multi-accent", "developer"],
    colors: ["#0D1117", "#FFFFFF", "#0969DA", "#2DA44E"],
    accentColor: "#0969DA",
  },
  {
    slug: "gitlab",
    title: "GitLab",
    category: "Developer Tools",
    description:
      "The Tanuki logo's three-color set — Orange (#FC6D26), a deeper Orange-Red (#E24329), and Purple (#6E49CB) — layered on white. Unlike GitHub's single accent, GitLab leans into that full warm-to-cool spread across the mark itself.",
    tags: ["light mode", "multi-accent", "developer"],
    colors: ["#FFFFFF", "#FC6D26", "#E24329", "#6E49CB"],
    accentColor: "#FC6D26",
  },
  {
    slug: "discord",
    title: "Discord",
    category: "Social",
    description:
      "Dark canvas (#313338) built for long chat sessions, with Blurple (#5865F2) — the 2021 rebrand's signature color — carrying every primary button, mention, and active state against white text and gray secondary surfaces.",
    tags: ["dark mode", "single-accent", "social"],
    colors: ["#313338", "#2B2D31", "#5865F2", "#FFFFFF"],
    accentColor: "#5865F2",
  },
  {
    slug: "dropbox",
    title: "Dropbox",
    category: "Productivity",
    description:
      "White canvas, near-black text, and Dropbox Blue (#0061FF) as the sole accent — the 2017 rebrand's whole point was collapsing a busier old palette down to just this one confident blue.",
    tags: ["light mode", "single-accent", "productivity"],
    colors: ["#FFFFFF", "#0061FF", "#1E1919"],
    accentColor: "#0061FF",
  },
  {
    slug: "figma",
    title: "Figma",
    category: "Design Tools",
    description:
      "The most multi-accent system here — Figma's logo is built from five equal-weight shapes (red #F24E1E, orange #FF7262, purple #A259FF, blue #1ABCFE, green #0ACF83), all appearing together rather than one color leading.",
    tags: ["light mode", "multi-accent", "design"],
    colors: ["#F24E1E", "#FF7262", "#A259FF", "#1ABCFE", "#0ACF83"],
    accentColor: "#A259FF",
  },
  {
    slug: "cloudflare",
    title: "Cloudflare",
    category: "Infrastructure",
    description:
      "White canvas with Cloudflare Orange (#F38020) as the one recurring accent against dark navy/near-black text — an infrastructure brand that still reaches for a warm color instead of the usual cool-blue tech default.",
    tags: ["light mode", "single-accent", "infrastructure"],
    colors: ["#FFFFFF", "#F38020", "#0F1A24"],
    accentColor: "#F38020",
  },
  {
    slug: "coinbase",
    title: "Coinbase",
    category: "Crypto",
    description:
      "White canvas, near-black text, Coinbase Blue (#0052FF) as the single accent — a deliberately calm, un-crypto-like palette that reads more like a traditional fintech app than an exchange.",
    tags: ["light mode", "single-accent", "crypto"],
    colors: ["#FFFFFF", "#0052FF", "#0A0B0D"],
    accentColor: "#0052FF",
  },
  {
    slug: "duolingo",
    title: "Duolingo",
    category: "Education",
    description:
      "Duolingo Green (#58CC02) is the constant, but unlike the single-accent brands above it, sits alongside a blue (#1CB0F6) and a yellow (#FFC800) with near-equal presence — an intentionally playful, kid-friendly multi-color system.",
    tags: ["light mode", "multi-accent", "education"],
    colors: ["#FFFFFF", "#58CC02", "#1CB0F6", "#FFC800"],
    accentColor: "#58CC02",
  },
  {
    slug: "ferrari",
    title: "Ferrari",
    category: "Automotive",
    description:
      "Ferrari Red (#D40000) against black — the racing heritage palette — with the prancing-horse shield's yellow (#FFF200) as a small, deliberate second accent that only ever appears in the badge, never the broader UI.",
    tags: ["dark mode", "multi-accent", "automotive"],
    colors: ["#000000", "#D40000", "#FFF200"],
    accentColor: "#D40000",
  },
  {
    slug: "aws",
    title: "Amazon Web Services",
    category: "Infrastructure",
    description:
      "\"Squid Ink\" navy (#232F3E) for the console chrome, paired with Smile Orange (#FF9900) — the same orange as the Amazon logo's swoosh, reused here as AWS's one warm accent against an otherwise cool, technical palette.",
    tags: ["dark mode", "single-accent", "infrastructure"],
    colors: ["#232F3E", "#FF9900", "#FFFFFF"],
    accentColor: "#FF9900",
  },
  {
    slug: "american-express",
    title: "American Express",
    category: "Finance",
    description:
      "The classic blue box: Amex Blue (#016FD0) on white, with a near-black for body text. A finance brand that skips green/gold entirely and lets one confident blue carry all the trust-signaling.",
    tags: ["light mode", "single-accent", "finance"],
    colors: ["#FFFFFF", "#016FD0", "#26292C"],
    accentColor: "#016FD0",
  },
  {
    slug: "atlassian",
    title: "Atlassian",
    category: "Productivity",
    description:
      "Atlassian Blue (#0052CC) is the throughline across Jira, Confluence, and the corporate site alike — white canvas, dark neutral text, one blue doing double duty as both brand mark and primary-button color.",
    tags: ["light mode", "single-accent", "productivity"],
    colors: ["#FFFFFF", "#0052CC", "#172B4D"],
    accentColor: "#0052CC",
  },
  {
    slug: "binance",
    title: "Binance",
    category: "Crypto",
    description:
      "Binance Yellow (#F0B90B) against a near-black dark-mode-first canvas (#0B0E11) — the inverse of Coinbase's calm-fintech approach, leaning into a saturated, high-energy accent that reads unmistakably as crypto.",
    tags: ["dark mode", "single-accent", "crypto"],
    colors: ["#0B0E11", "#F0B90B", "#FFFFFF"],
    accentColor: "#F0B90B",
  },
  {
    slug: "bmw",
    title: "BMW",
    category: "Automotive",
    description:
      "BMW Blue (#0066B1) framed by the roundel's black and white — a restrained corporate palette that leaves the vivid M-division stripes (blue/purple/red) as a separate, deliberately rarer sub-brand accent.",
    tags: ["light mode", "single-accent", "automotive"],
    colors: ["#FFFFFF", "#0066B1", "#000000"],
    accentColor: "#0066B1",
  },
  {
    slug: "booking-com",
    title: "Booking.com",
    category: "Travel",
    description:
      "Booking Blue (#003580) — a deep, saturated navy rather than a bright accent — carries the logo, header, and primary buttons against white, with a secondary sky-blue (#009FE3) reserved for links and highlights.",
    tags: ["light mode", "multi-accent", "travel"],
    colors: ["#FFFFFF", "#003580", "#009FE3"],
    accentColor: "#003580",
  },
  {
    slug: "canva",
    title: "Canva",
    category: "Design Tools",
    description:
      "A cooler-toned pair rather than one accent: Canva Blue (#00C4CC) and Canva Purple (#7D2AE8) trade off across the interface and marketing site, both landing on white with dark neutral text.",
    tags: ["light mode", "multi-accent", "design"],
    colors: ["#FFFFFF", "#00C4CC", "#7D2AE8"],
    accentColor: "#00C4CC",
  },
  {
    slug: "cash-app",
    title: "Cash App",
    category: "Fintech",
    description:
      "Cash App Green (#00D632) on pure black — about as high-contrast as a single-accent system gets, with white text as the only other tone in the mix.",
    tags: ["dark mode", "single-accent", "fintech"],
    colors: ["#000000", "#00D632", "#FFFFFF"],
    accentColor: "#00D632",
  },
  {
    slug: "cisco",
    title: "Cisco",
    category: "Infrastructure",
    description:
      "Cisco Blue (#049FD9) on white — a networking-hardware brand that, like Atlassian and Coinbase, keeps its whole system down to one accent blue plus dark neutral text, no secondary color competing for attention.",
    tags: ["light mode", "single-accent", "infrastructure"],
    colors: ["#FFFFFF", "#049FD9", "#1B1B1B"],
    accentColor: "#049FD9",
  },
  {
    slug: "coursera",
    title: "Coursera",
    category: "Education",
    description:
      "Coursera Blue (#0056D2) on white — closer in spirit to Atlassian's restraint than Duolingo's playfulness, matching its brand's more institutional, higher-ed-adjacent positioning.",
    tags: ["light mode", "single-accent", "education"],
    colors: ["#FFFFFF", "#0056D2", "#2A2A2A"],
    accentColor: "#0056D2",
  },
  {
    slug: "datadog",
    title: "Datadog",
    category: "Infrastructure",
    description:
      "Datadog Purple (#632CA6) on white — an observability tool standing out from the sea of blue dev-tool brands (GitHub, Atlassian, Cisco) by picking the one hue none of its direct competitors use.",
    tags: ["light mode", "single-accent", "infrastructure"],
    colors: ["#FFFFFF", "#632CA6", "#241F35"],
    accentColor: "#632CA6",
  },
  {
    slug: "digitalocean",
    title: "DigitalOcean",
    category: "Infrastructure",
    description:
      "DO Blue (#0080FF) on white — a cloud-hosting brand named after the ocean that, fittingly, picked a clean sky/ocean blue as its one accent, with near-black text and no secondary hue.",
    tags: ["light mode", "single-accent", "infrastructure"],
    colors: ["#FFFFFF", "#0080FF", "#0C1E30"],
    accentColor: "#0080FF",
  },
  {
    slug: "doordash",
    title: "DoorDash",
    category: "Delivery",
    description:
      "DoorDash Red (#FF3008) on white — a warm, appetite-associated accent (versus the competing food-delivery reds/oranges) paired with plain black text and no secondary color.",
    tags: ["light mode", "single-accent", "delivery"],
    colors: ["#FFFFFF", "#FF3008", "#191919"],
    accentColor: "#FF3008",
  },
  {
    slug: "google-material-3",
    title: "Google Material 3",
    category: "Design System",
    description:
      "Not a brand but a system: Material 3's default \"baseline\" seed color (#6750A4, a muted purple) is what every M3 demo and default Android theme starts from before a product picks its own — the reference point the whole design system is built around.",
    tags: ["light mode", "single-accent", "design system"],
    colors: ["#FFFFFF", "#6750A4", "#1D1B20"],
    accentColor: "#6750A4",
  },
  {
    slug: "grafana",
    title: "Grafana",
    category: "Infrastructure",
    description:
      "Grafana Orange (#F46800) against a dark canvas (#111217) — the observability dashboard's signature \"flame\" color, one of the few warm accents in a category otherwise dominated by blue and purple.",
    tags: ["dark mode", "single-accent", "infrastructure"],
    colors: ["#111217", "#F46800", "#FFFFFF"],
    accentColor: "#F46800",
  },
  {
    slug: "hp",
    title: "HP",
    category: "Tech",
    description:
      "HP Blue (#0096D6) on white — a decades-old corporate blue that's stayed essentially unchanged through multiple logo redesigns, still the one fixed point across HP's hardware and print branding.",
    tags: ["light mode", "single-accent", "tech"],
    colors: ["#FFFFFF", "#0096D6", "#000000"],
    accentColor: "#0096D6",
  },
  {
    slug: "hubspot",
    title: "HubSpot",
    category: "Marketing",
    description:
      "HubSpot Orange (#FF7A59) on white — a CRM/marketing platform picking a warm, friendly accent to stand apart from the blue-heavy B2B SaaS crowd, with dark neutral text and no competing secondary hue.",
    tags: ["light mode", "single-accent", "marketing"],
    colors: ["#FFFFFF", "#FF7A59", "#33475B"],
    accentColor: "#FF7A59",
  },
];

export const colorReferenceEntries: DesignEntry[] = references.map((r) => ({
  id: `color-reference-${r.slug}`,
  source: "color-reference",
  title: r.title,
  slug: r.slug,
  description: r.description,
  tags: r.tags,
  thumbnailUrl: "",
  prompt: "",
  category: r.category,
  colors: r.colors,
  accentColor: r.accentColor,
}));
