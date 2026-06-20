import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Claude Code for Cold Outreach: Free AI Outreach Setup Guide (2026)",
  description:
    "Build a thoughtful cold outreach system with Claude Code. Research leads on LinkedIn, Instagram, or Facebook, then send personalized, value-first messages with custom visuals that earn replies.",
  keywords: [
    "Claude Code",
    "Claude AI",
    "AI cold outreach",
    "AI cold outreach tool",
    "AI outreach automation",
    "Claude Code tutorial",
    "Claude Code for marketing",
    "AI lead generation",
    "AI cold email generator",
    "AI sales outreach",
  ],
  openGraph: {
    title: "Claude Code for Cold Outreach: Free AI Outreach Setup Guide",
    description:
      "Build a thoughtful cold outreach system with Claude Code. Research leads, write personalized messages with visuals, and earn real replies.",
    type: "article",
    url: "https://oleg.ae/claude-outreach",
    publishedTime: "2026-05-12T00:00:00Z",
    modifiedTime: "2026-05-13T00:00:00Z",
    authors: ["Oleg Melnikov"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Claude Code for Cold Outreach: Free Setup Guide",
    description:
      "Build a thoughtful cold outreach system with Claude Code. Research leads, write personalized messages, and earn real replies.",
  },
  alternates: {
    canonical: "https://oleg.ae/claude-outreach",
  },
};

export default function ClaudeOutreachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
