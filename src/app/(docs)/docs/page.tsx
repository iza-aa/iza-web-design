import Link from "next/link";

export default function DocsIntroPage() {
  return (
    <article className="flex flex-col gap-6 text-left">
      <div>
        <h1 className="font-display text-3xl font-semibold">Introduction</h1>
        <p className="mt-4 text-secondary">
          IZA UI&apos;s component set is copy-paste source, not an npm package — every component documented here is
          the exact code running on this site&apos;s marketing pages, not a separate demo copy. There&apos;s no
          external UI dependency to install; just Tailwind CSS and the token file below.
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold">How the docs work</h2>
        <p className="mt-2 text-secondary">
          Each component page shows a live preview of the real component, a <strong>Code</strong> tab with the exact
          source (copy button included), an installation snippet, and a props table. There&apos;s no interactive
          prop playground by design — a clean static preview plus copyable code covers most real use.
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold">Start here</h2>
        <ul className="mt-2 flex flex-col gap-1 text-secondary">
          <li>
            <Link href="/docs/installation" className="text-primary hover:underline">
              Installation
            </Link>{" "}
            — what to paste into a project and what setup it assumes.
          </li>
          <li>
            <Link href="/docs/theming" className="text-primary hover:underline">
              Theming
            </Link>{" "}
            — the full color/radius/spacing token table.
          </li>
          <li>
            <Link href="/docs/components/button" className="text-primary hover:underline">
              Components
            </Link>{" "}
            — Button, Input, Textarea, Window Card, Logo Mark, Dock Item.
          </li>
        </ul>
      </div>
    </article>
  );
}
