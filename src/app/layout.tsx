import type { Metadata } from "next";
import "./globals.css";
import { BrandMark } from "@/components/layout/BrandMark";
import { DockNav } from "@/components/layout/DockNav";
import { PreferencesBar } from "@/components/layout/PreferencesBar";
import { IntakeVisibilityProvider } from "@/lib/intake-visibility";
import { ThemeProvider, themeInitScript } from "@/lib/theme";
import { LanguageProvider } from "@/lib/language";

export const metadata: Metadata = {
  title: "izadesign",
  description: "Design, code, and AI studio for custom websites.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/*
        Blocking anti-FOUC script: reads the saved theme (or system
        preference) and applies the `.light` class before first paint, so
        the page never flashes dark-then-light or vice versa.
      */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      {/*
        suppressHydrationWarning: some browser extensions (ad blockers,
        password managers) inject attributes like `bis_register` into
        <body> before React hydrates. That's a client-only mismatch we
        don't control — this only silences that specific noisy warning,
        it does not hide real hydration bugs in children.
      */}
      <body suppressHydrationWarning className="pb-24">
        <ThemeProvider>
          <LanguageProvider>
            <IntakeVisibilityProvider>
              {children}
              <BrandMark />
              <DockNav />
              <PreferencesBar />
            </IntakeVisibilityProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
