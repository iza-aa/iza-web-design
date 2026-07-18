import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Image from "next/image";
import lefttoplogo from "@/assets/logo/lefttoplogo.png";
import lefttoplogolight from "@/assets/logo/lefttoplogolight.png";
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
import { siteLoaderInitScript } from "@/lib/site-loader";
import { SiteLoaderPunctuation } from "@/components/layout/SiteLoaderPunctuation";

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
    <html lang="en" suppressHydrationWarning className={geist.variable}>
      {/*
        Blocking anti-FOUC script: reads the saved theme (or system
        preference) and applies the `.light` class before first paint, so
        the page never flashes dark-then-light or vice versa.
      */}
      {/*
        suppressHydrationWarning on both inline scripts below: same
        extension interference as <body>'s (e.g. Bitdefender-style tools
        inject a `bis_use`/`bis_register` attribute and blank the script's
        text after the initial paint) — the script itself already ran
        synchronously as the browser parsed this HTML, before React ever
        hydrates, so the later DOM mutation doesn't affect behavior.
      */}
      <head>
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/*
          Blocking resource-gate script: adds .site-loaded to <html> once
          window "load" fires (all images/fonts/scripts settled), which is
          what fades out #site-loader below — see globals.css.
        */}
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: siteLoaderInitScript }} />
      </head>
      {/*
        suppressHydrationWarning: some browser extensions (ad blockers,
        password managers) inject attributes like `bis_register` into
        <body> before React hydrates. That's a client-only mismatch we
        don't control — this only silences that specific noisy warning,
        it does not hide real hydration bugs in children.
      */}
      <body suppressHydrationWarning className="">
        <div id="site-loader" aria-hidden="true">
          <div className="site-loader-brand">
            <Image
              src={lefttoplogo}
              alt=""
              width={94}
              height={48}
              priority
              className="site-loader-logo site-loader-logo-dark"
            />
            <Image
              src={lefttoplogolight}
              alt=""
              width={94}
              height={48}
              priority
              className="site-loader-logo site-loader-logo-light"
            />
            <span className="site-loader-brandtext">
              design
              <SiteLoaderPunctuation />
            </span>
          </div>
        </div>
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
