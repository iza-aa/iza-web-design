export type PropRow = { name: string; type: string; default?: string; descriptionKey: string };

export type ComponentDoc = {
  slug: string;
  nameKey: string;
  group: "Layout" | "Canvas";
  descriptionKey: string;
  sourcePath: string; // relative to project root, read at request time for the Code tab
  install: string;
  props: PropRow[];
  a11yKey: string;
};

export const componentDocs: ComponentDoc[] = [
  {
    slug: "window-card",
    nameKey: "docs.components.windowCard.name",
    group: "Layout",
    descriptionKey: "docs.components.windowCard.description",
    sourcePath: "src/components/ui/WindowCard.tsx",
    install: `import { WindowCard } from "@/components/ui/WindowCard";

<WindowCard onClose={() => setOpen(false)}>
  <div className="p-8">Your content</div>
</WindowCard>`,
    props: [
      { name: "children", type: "ReactNode", descriptionKey: "docs.components.windowCard.props.children" },
      { name: "onClose", type: "() => void", descriptionKey: "docs.components.windowCard.props.onClose" },
      { name: "closeLabel", type: "string", default: '"Close"', descriptionKey: "docs.components.windowCard.props.closeLabel" },
      { name: "className", type: "string", default: '""', descriptionKey: "docs.components.windowCard.props.className" },
    ],
    a11yKey: "docs.components.windowCard.a11y",
  },
  {
    slug: "dock-item",
    nameKey: "docs.components.dockItem.name",
    group: "Layout",
    descriptionKey: "docs.components.dockItem.description",
    sourcePath: "src/components/ui/DockItem.tsx",
    install: `import { DockItem } from "@/components/ui/DockItem";

<DockItem href="/" label="Work" icon={<YourIcon />} active />`,
    props: [
      { name: "href", type: "string", descriptionKey: "docs.components.dockItem.props.href" },
      { name: "label", type: "string", descriptionKey: "docs.components.dockItem.props.label" },
      { name: "icon", type: "ReactNode", descriptionKey: "docs.components.dockItem.props.icon" },
      { name: "active", type: "boolean", descriptionKey: "docs.components.dockItem.props.active" },
      { name: "onClick", type: "() => void", descriptionKey: "docs.components.dockItem.props.onClick" },
      { name: "boost", type: "number", default: "0", descriptionKey: "docs.components.dockItem.props.boost" },
      { name: "onHoverStart", type: "() => void", descriptionKey: "docs.components.dockItem.props.onHoverStart" },
      { name: "onHoverEnd", type: "() => void", descriptionKey: "docs.components.dockItem.props.onHoverEnd" },
    ],
    a11yKey: "docs.components.dockItem.a11y",
  },
  {
    slug: "ambient-canvas",
    nameKey: "docs.components.ambientCanvas.name",
    group: "Canvas",
    descriptionKey: "docs.components.ambientCanvas.description",
    sourcePath: "src/components/canvas/AmbientCanvas.tsx",
    install: `import { AmbientCanvas } from "@/components/canvas/AmbientCanvas";

// full-viewport backdrop (the marketing layout's actual usage)
<AmbientCanvas />

// embedded in a bounded container — pass className to override the default fixed/inset-0
<div className="relative h-64 overflow-hidden rounded-lg">
  <AmbientCanvas className="absolute inset-0" />
</div>`,
    props: [
      { name: "className", type: "string", default: '"pointer-events-none fixed inset-0 -z-10"', descriptionKey: "docs.components.ambientCanvas.props.className" },
    ],
    a11yKey: "docs.components.ambientCanvas.a11y",
  },
  {
    slug: "plasma-logo-mark",
    nameKey: "docs.components.plasmaLogoMark.name",
    group: "Canvas",
    descriptionKey: "docs.components.plasmaLogoMark.description",
    sourcePath: "src/components/marketing/PlasmaLogoMark.tsx",
    install: `import { PlasmaLogoMark } from "@/components/marketing/PlasmaLogoMark";

<PlasmaLogoMark className="h-12 w-24" />`,
    props: [
      { name: "className", type: "string", default: '""', descriptionKey: "docs.components.plasmaLogoMark.props.className" },
      { name: "alt", type: "string", default: '"IZA UI"', descriptionKey: "docs.components.plasmaLogoMark.props.alt" },
    ],
    a11yKey: "docs.components.plasmaLogoMark.a11y",
  },
  {
    slug: "phone-mockup",
    nameKey: "docs.components.phoneMockup.name",
    group: "Layout",
    descriptionKey: "docs.components.phoneMockup.description",
    sourcePath: "src/components/marketing/PhoneMockup.tsx",
    install: `import { PhoneMockup } from "@/components/marketing/PhoneMockup";

<PhoneMockup
  eyebrow="Live Preview"
  title="Your Workspace"
  chatPlaceholder="Ask anything…"
  chatPrompt="Design a portfolio site for a photographer."
  notifications={[
    { icon: <BellIcon />, title: "New message", time: "2m" },
    { icon: <MailIcon />, title: "Invite sent", time: "5m" },
    { icon: <LinkIcon />, title: "Generating…" },
    { icon: <CheckIcon />, title: "Deploy complete", time: "1h" },
  ]}
/>`,
    props: [
      { name: "eyebrow", type: "string", descriptionKey: "docs.components.phoneMockup.props.eyebrow" },
      { name: "title", type: "string", descriptionKey: "docs.components.phoneMockup.props.title" },
      { name: "chatPlaceholder", type: "string", descriptionKey: "docs.components.phoneMockup.props.chatPlaceholder" },
      { name: "chatPrompt", type: "string", descriptionKey: "docs.components.phoneMockup.props.chatPrompt" },
      { name: "notifications", type: "PhoneMockupNotification[]", descriptionKey: "docs.components.phoneMockup.props.notifications" },
      { name: "badge1", type: "PhoneMockupBadge", descriptionKey: "docs.components.phoneMockup.props.badge1" },
      { name: "badge2", type: "PhoneMockupBadge", descriptionKey: "docs.components.phoneMockup.props.badge2" },
      { name: "className", type: "string", default: '""', descriptionKey: "docs.components.phoneMockup.props.className" },
    ],
    a11yKey: "docs.components.phoneMockup.a11y",
  },
  {
    slug: "glow-button",
    nameKey: "docs.components.glowButton.name",
    group: "Layout",
    descriptionKey: "docs.components.glowButton.description",
    sourcePath: "src/components/marketing/GlowButton.tsx",
    install: `import { GlowButton } from "@/components/marketing/GlowButton";

<GlowButton onClick={() => router.push("/work")}>Start a Project</GlowButton>`,
    props: [
      { name: "children", type: "ReactNode", descriptionKey: "docs.components.glowButton.props.children" },
      { name: "onClick", type: "() => void", descriptionKey: "docs.components.glowButton.props.onClick" },
      { name: "href", type: "string", descriptionKey: "docs.components.glowButton.props.href" },
      { name: "icon", type: "ReactNode | null", default: "arrow icon", descriptionKey: "docs.components.glowButton.props.icon" },
      { name: "className", type: "string", default: '""', descriptionKey: "docs.components.glowButton.props.className" },
    ],
    a11yKey: "docs.components.glowButton.a11y",
  },
  {
    slug: "gradient-heading",
    nameKey: "docs.components.gradientHeading.name",
    group: "Layout",
    descriptionKey: "docs.components.gradientHeading.description",
    sourcePath: "src/components/ui/GradientHeading.tsx",
    install: `import { GradientHeading } from "@/components/ui/GradientHeading";

<GradientHeading as="h1">Tell me about the project,</GradientHeading>
<GradientHeading as="h1" variant="silver" delay={0.6}>we'll design it.</GradientHeading>`,
    props: [
      { name: "children", type: "ReactNode", descriptionKey: "docs.components.gradientHeading.props.children" },
      { name: "as", type: '"h1" | "h2" | "h3"', default: '"h1"', descriptionKey: "docs.components.gradientHeading.props.as" },
      { name: "variant", type: '"matte" | "silver"', default: '"matte"', descriptionKey: "docs.components.gradientHeading.props.variant" },
      { name: "animate", type: "boolean", default: "true", descriptionKey: "docs.components.gradientHeading.props.animate" },
      { name: "delay", type: "number", default: "0", descriptionKey: "docs.components.gradientHeading.props.delay" },
      { name: "className", type: "string", default: '""', descriptionKey: "docs.components.gradientHeading.props.className" },
    ],
    a11yKey: "docs.components.gradientHeading.a11y",
  },
];

export function getComponentDoc(slug: string) {
  return componentDocs.find((c) => c.slug === slug);
}

export const componentDocGroups = ["Layout", "Canvas"] as const;
