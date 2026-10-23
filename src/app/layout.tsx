import type { Metadata } from "next";
import { Wix_Madefor_Display, Wix_Madefor_Text } from "next/font/google";
import { FontKickoff } from "@/components/font-kickoff";
import { Plausible } from "@/components/plausible";
import "./globals.css";

// One family, two cuts, two weights (Oleg's type rules, MS repo
// projects/accounts/oleg_melnikov/style/TYPOGRAPHY.md, since 2026-10-23):
// Wix Madefor Display for titles (font-display), Wix Madefor Text for
// everything else (font-body, and font-sans for text that names no family),
// each at 400 and 600 only. Both are variable fonts, so each family is one
// file whatever the weights: two font files in all, as
// tests/e2e/perf-budget.spec.ts (83) expects. DM Sans and Space Grotesk, the
// faces before this, are gone; Inter went earlier (it rendered almost nothing).
//
// `preload: false` on both, deliberately: Next's head preloads hold Chrome's
// first paint until the files arrive. FontKickoff, the first thing in <body>,
// starts the same two downloads without that wait (see font-kickoff.tsx).

const wixDisplay = Wix_Madefor_Display({
  subsets: ["latin"],
  variable: "--font-wix-display",
  weight: ["400", "600"],
  display: "swap",
  preload: false,
});

const wixText = Wix_Madefor_Text({
  subsets: ["latin"],
  variable: "--font-wix-text",
  weight: ["400", "600"],
  display: "swap",
  preload: false,
});

// Eyebrow labels fall back to a face sized for capitals rather than to the
// Text cut's own fallback (see "Wix Madefor Caps Fallback" in globals.css).
// Built from next/font's family name, the first entry of its stack, so it
// keeps pointing at the real face whatever name next/font gives it.
const eyebrowFont = `${wixText.style.fontFamily.split(",")[0]}, "Wix Madefor Caps Fallback", system-ui, sans-serif`;

export const metadata: Metadata = {
  metadataBase: new URL("https://www.oleg.ae"),
  title: {
    default: "Oleg Melnikov: AI Systems for Marketing & Claude Code Tutorials",
    template: "%s | Oleg Melnikov",
  },
  description:
    "AI software entrepreneur. Free, complete guides to running marketing with Claude Code and Claude Cowork, from someone who runs every system on this site.",
  keywords: [
    "AI systems for marketing",
    "Claude Code",
    "Claude Code for marketing",
    "Personal branding for founders",
    "AI for B2B founders",
    "Boldane",
    "Oleg Melnikov",
  ],
  openGraph: {
    title: "Oleg Melnikov: AI Systems for Marketing & Claude Code Tutorials",
    description:
      "Building the best AI for marketing: media superintelligence. Ex-hedge fund AI engineer, math olympiad medalist, founder of Boldane, teaching Claude Code and AI for marketing to 20K+ on YouTube.",
    type: "website",
    url: "https://www.oleg.ae",
    siteName: "Oleg Melnikov",
  },
  twitter: {
    card: "summary_large_image",
    title: "Oleg Melnikov: AI Systems for Marketing & Claude Code Tutorials",
    description:
      "Building the best AI for marketing: media superintelligence. Ex-hedge fund AI engineer, math olympiad medalist, founder of Boldane, teaching Claude Code and AI for marketing to 20K+ on YouTube.",
  },
  alternates: {
    canonical: "https://www.oleg.ae",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${wixDisplay.variable} ${wixText.variable}`}
      style={{ "--font-eyebrow": eyebrowFont } as React.CSSProperties}
    >
      <body className="font-body antialiased">
        <FontKickoff
          fonts={[
            `400 1em ${wixDisplay.style.fontFamily}`,
            `600 1em ${wixDisplay.style.fontFamily}`,
            `400 1em ${wixText.style.fontFamily}`,
            `600 1em ${wixText.style.fontFamily}`,
          ]}
        />
        <Plausible />
        {children}
      </body>
    </html>
  );
}
