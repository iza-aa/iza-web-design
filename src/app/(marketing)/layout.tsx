import { MarketingBackground } from "@/app/(marketing)/MarketingBackground";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/*
        Static fallback lives inside MarketingBackground now — it differs
        per page (flat black/white behind the /work dome, the original blue
        gradient everywhere else), so a single shared div here can't cover
        both anymore. See MarketingBackground.tsx.
      */}
      <MarketingBackground />
      <main className="mx-auto max-w-7xl px-6 py-16">{children}</main>
    </>
  );
}
