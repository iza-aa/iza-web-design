import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { RepoBadge } from "@/components/docs/RepoBadge";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-8 pt-20 sm:px-6 sm:pb-12 sm:pt-24 lg:flex-row lg:gap-10">
      <aside className="lg:w-56 lg:shrink-0">
        <DocsSidebar />
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
      <RepoBadge />
    </div>
  );
}
