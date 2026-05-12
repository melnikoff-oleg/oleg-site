import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Claude Code X/Twitter Content Machine — Free Setup Guide",
  description:
    "Build an AI-powered X/Twitter content system with Claude Code. Scrape competitor tweets, analyze what goes viral, and generate ready-to-publish posts in your niche automatically.",
  keywords: [
    "Claude Code",
    "Claude Code for Twitter",
    "AI Twitter content",
    "X content automation",
    "Claude Code tutorial",
    "AI social media marketing",
    "Twitter growth strategy",
  ],
  openGraph: {
    title: "Claude Code X/Twitter Content Machine — Free Setup Guide",
    description:
      "Build an AI-powered X/Twitter content system with Claude Code. Scrape competitors, analyze viral tweets, and generate posts in your voice.",
    type: "article",
    url: "https://oleg.ae/claude-twitter",
  },
  alternates: {
    canonical: "https://oleg.ae/claude-twitter",
  },
};

export default function ClaudeTwitterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
