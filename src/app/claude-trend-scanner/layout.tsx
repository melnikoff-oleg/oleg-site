import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "AI Trend Scanner with Claude Code: Free Setup Guide",
  description:
    "Build an AI trend scanner with Claude Code that monitors Twitter, Reddit, YouTube, TikTok, and websites for trending topics in your niche. Get a structured daily briefing automatically and stay ahead of every trend.",
  keywords: [
    "Claude Code",
    "Claude AI",
    "AI trend scanner",
    "trending topics AI",
    "social media monitoring AI",
    "Claude Code tutorial",
    "content trends 2026",
    "AI content strategy",
    "Claude Code for marketing",
    "AI for social media",
  ],
  openGraph: {
    title: "AI Trend Scanner with Claude Code: Free Setup Guide",
    description:
      "Build an AI trend scanner that monitors Twitter, Reddit, YouTube, TikTok, and websites for trending topics. Get a structured briefing every morning.",
    type: "article",
    url: "https://oleg.ae/claude-trend-scanner",
    publishedTime: "2026-05-12T00:00:00Z",
    modifiedTime: "2026-05-13T00:00:00Z",
    authors: ["Oleg Melnikov"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Trend Scanner with Claude Code",
    description:
      "Build an AI trend scanner that monitors social media for trending topics in your niche. Stay ahead of every trend.",
  },
  alternates: {
    canonical: "https://oleg.ae/claude-trend-scanner",
  },
};

export default function ClaudeTrendScannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
