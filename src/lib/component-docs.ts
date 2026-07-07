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
];

export function getComponentDoc(slug: string) {
  return componentDocs.find((c) => c.slug === slug);
}

export const componentDocGroups = ["Layout", "Canvas"] as const;
