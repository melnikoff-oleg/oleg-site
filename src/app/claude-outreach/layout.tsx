import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Claude Code for Cold Outreach — Oleg Melnikov",
  description:
    "Set up your AI cold outreach system with Claude Code. Scrape leads, generate personalized messages with visuals, and close deals on LinkedIn, Instagram, or Facebook.",
  openGraph: {
    title: "Claude Code for Cold Outreach — Oleg Melnikov",
    description:
      "Set up your AI outreach system with Claude Code. Scrape leads, generate personalized messages with visuals, and close deals on LinkedIn, Instagram, or Facebook.",
    type: "website",
  },
};

export default function ClaudeOutreachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
