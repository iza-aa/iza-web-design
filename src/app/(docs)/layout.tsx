import { DocsSidebar } from "@/components/docs/DocsSidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-6xl gap-10 px-6 py-12">
      <aside className="w-56 shrink-0">
        <DocsSidebar />
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
