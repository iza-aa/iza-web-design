import { CodeBlock } from "@/components/docs/CodeBlock";

const themeSnippet = `@theme {
  --color-primary: #3B82F6;
  --color-secondary: #9CA3AF;
  --color-tertiary: #3F3F46;
  --color-neutral: #DCE0E8;
  --color-surface: #1C1C21;
  --color-on-surface: #F5F5F7;
  --color-error: #EF4444;
  --color-primary-contrast: #FFFFFF;
  --color-border-subtle: #33333A;
}`;

export default function InstallationPage() {
  return (
    <article className="flex flex-col gap-6 text-left">
      <div>
        <h1 className="font-display text-3xl font-semibold">Installation</h1>
        <p className="mt-4 text-secondary">
          There&apos;s no package to install. Copy the component file you want from{" "}
          <code className="rounded bg-(--glass-bg) px-1.5 py-0.5 text-sm">src/components/ui/</code> into your own
          project, and make sure the two things below already exist.
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold">1. Tailwind CSS v4</h2>
        <p className="mt-2 text-secondary">
          Every component is styled with Tailwind utility classes only — no CSS modules, no styled-components. You
          need Tailwind v4&apos;s CSS-first config (<code className="rounded bg-(--glass-bg) px-1.5 py-0.5 text-sm">@import &quot;tailwindcss&quot;</code>{" "}
          in your global stylesheet).
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold">2. Design tokens</h2>
        <p className="mt-2 text-secondary">
          Components reference color tokens like <code className="rounded bg-(--glass-bg) px-1.5 py-0.5 text-sm">bg-primary</code> and{" "}
          <code className="rounded bg-(--glass-bg) px-1.5 py-0.5 text-sm">text-on-surface</code>, not raw hex values. Add these to
          your own <code className="rounded bg-(--glass-bg) px-1.5 py-0.5 text-sm">@theme</code> block — see the full table on the{" "}
          <a href="/docs/theming" className="text-primary hover:underline">
            Theming
          </a>{" "}
          page.
        </p>
        <div className="mt-3">
          <CodeBlock code={themeSnippet} label="globals.css" />
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold">3. Glass surfaces (optional)</h2>
        <p className="mt-2 text-secondary">
          Window Card and Dock Item use a shared frosted-glass recipe that also swaps under light/dark — copy{" "}
          <code className="rounded bg-(--glass-bg) px-1.5 py-0.5 text-sm">glassCard</code> from{" "}
          <code className="rounded bg-(--glass-bg) px-1.5 py-0.5 text-sm">src/lib/tokens.ts</code> and the{" "}
          <code className="rounded bg-(--glass-bg) px-1.5 py-0.5 text-sm">--glass-*</code> variables from{" "}
          <code className="rounded bg-(--glass-bg) px-1.5 py-0.5 text-sm">globals.css</code> if you want that component.
          Button, Input, Textarea, and Logo Mark don&apos;t need it.
        </p>
      </div>
    </article>
  );
}
