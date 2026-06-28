import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Build a High-Converting Landing Page with Claude Code: Free Kit (2026)",
  description:
    "A free, open-source kit that builds a landing page engineered to convert, not just look nice. Claude Code reads a distilled conversion playbook from Alex Hormozi and the world's best marketers, then builds and deploys your page on your own domain. No coding required.",
  keywords: [
    "Claude Code",
    "high-converting landing page",
    "landing page with AI",
    "Claude Code landing page",
    "build landing page with AI",
    "AI website builder",
    "conversion optimized landing page",
    "Alex Hormozi value equation",
    "Claude Code for marketing",
    "AI systems for marketing",
  ],
  openGraph: {
    title: "Build a High-Converting Landing Page with Claude Code: Free Kit",
    description:
      "A free kit that builds a landing page engineered to sell, powered by a conversion playbook from Hormozi and top marketers. No code required.",
    type: "article",
    url: "https://oleg.ae/high-converting-website",
    publishedTime: "2026-06-28T00:00:00Z",
    modifiedTime: "2026-06-28T00:00:00Z",
    authors: ["Oleg Melnikov"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Build a High-Converting Landing Page with Claude Code",
    description:
      "A free kit that builds a landing page engineered to sell, powered by a conversion playbook from Hormozi and top marketers. No code required.",
  },
  alternates: {
    canonical: "https://oleg.ae/high-converting-website",
  },
};

export default function HighConvertingWebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
