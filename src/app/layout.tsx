import type { Metadata } from "next";
import { Inter, DM_Sans, Space_Grotesk } from "next/font/google";
import { Plausible } from "@/components/plausible";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "700"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://oleg.ae"),
  title: {
    default: "Oleg Melnikov: AI Systems for Marketing & Claude Code Tutorials",
    template: "%s | Oleg Melnikov",
  },
  description:
    "AI software entrepreneur bridging media and software. I run Boldane, helping founders with real expertise become the names their market trusts, and teach AI systems for marketing and Claude Code to 18K+ on YouTube. Former big tech and hedge fund.",
  keywords: [
    "AI systems for marketing",
    "Claude Code",
    "Claude Code for marketing",
    "personal branding for founders",
    "AI for B2B founders",
    "Boldane",
    "Oleg Melnikov",
  ],
  openGraph: {
    title: "Oleg Melnikov: AI Systems for Marketing & Claude Code Tutorials",
    description:
      "AI software entrepreneur bridging media and software. I run Boldane, helping founders with real expertise become known, and teach AI systems for marketing and Claude Code to 18K+ on YouTube.",
    type: "website",
    url: "https://oleg.ae",
    siteName: "Oleg Melnikov",
  },
  twitter: {
    card: "summary_large_image",
    title: "Oleg Melnikov: AI Systems for Marketing & Claude Code Tutorials",
    description:
      "AI software entrepreneur bridging media and software. I run Boldane, helping founders with real expertise become known, and teach AI systems for marketing and Claude Code to 18K+ on YouTube.",
  },
  alternates: {
    canonical: "https://oleg.ae",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSans.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased">
        <Plausible />
        {children}
      </body>
    </html>
  );
}
