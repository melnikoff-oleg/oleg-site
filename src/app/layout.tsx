import type { Metadata } from "next";
import { Inter, Unbounded } from "next/font/google";
import { Plausible } from "@/components/plausible";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const unbounded = Unbounded({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-unbounded",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://oleg.ae"),
  title: {
    default: "Oleg Melnikov: AI Systems for Marketing & Claude Code Tutorials",
    template: "%s | Oleg Melnikov",
  },
  description:
    "AI software entrepreneur building AI systems for marketing. Claude Code tutorials, AI automation for B2B founders, and 18K+ YouTube community. Former big tech & hedge fund.",
  keywords: [
    "AI systems for marketing",
    "Claude Code",
    "Claude Code for marketing",
    "AI automation",
    "AI for B2B founders",
    "personal branding AI",
    "Oleg Melnikov",
  ],
  openGraph: {
    title: "Oleg Melnikov: AI Systems for Marketing & Claude Code Tutorials",
    description:
      "AI software entrepreneur building AI systems for marketing. Claude Code tutorials, AI automation for B2B founders, and 18K+ YouTube community.",
    type: "website",
    url: "https://oleg.ae",
    siteName: "Oleg Melnikov",
  },
  twitter: {
    card: "summary_large_image",
    title: "Oleg Melnikov: AI Systems for Marketing & Claude Code Tutorials",
    description:
      "AI software entrepreneur building AI systems for marketing. Claude Code tutorials, AI automation for B2B founders, and 18K+ YouTube community.",
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
    <html lang="en" className={`${inter.className} ${unbounded.variable}`}>
      <body>
        <Plausible />
        {children}
      </body>
    </html>
  );
}
