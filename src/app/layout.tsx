import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-geist",
  display: "swap",
});
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

import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={geist.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      {/*
        suppressHydrationWarning: some browser extensions (ad blockers,
        password managers) inject attributes like `bis_register` into
        <body> before React hydrates. That's a client-only mismatch we
        don't control — this only silences that specific noisy warning,
        it does not hide real hydration bugs in children.
      */}
      <body suppressHydrationWarning className="">
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
