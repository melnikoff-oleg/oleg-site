import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI TikTok Content with Claude Code: Free Setup Guide (2026)",
  description:
    "Build a Claude Code workflow that studies the TikToks earning real reach in your niche, learns what makes them work, and generates thumb-stopping video concepts and scripts.",
  keywords: [
    "Claude Code",
    "Claude AI",
    "AI TikTok content",
    "AI TikTok video generator",
    "TikTok content strategy",
    "Claude Code tutorial",
    "AI short form video",
    "AI video marketing",
    "Claude Code for marketing",
    "TikTok content AI",
  ],
  openGraph: {
    title: "AI TikTok Content with Claude Code: Free Setup Guide",
    description:
      "Study the TikToks earning real reach in your niche and generate thumb-stopping video concepts and scripts with Claude Code.",
    type: "article",
    url: "https://oleg.ae/claude-tiktok",
    publishedTime: "2026-05-12T00:00:00Z",
    modifiedTime: "2026-05-13T00:00:00Z",
    authors: ["Oleg Melnikov"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI TikTok Content with Claude Code: Free Setup Guide",
    description:
      "Study the TikToks earning real reach in your niche and generate strong video concepts with Claude Code.",
  },
  alternates: {
    canonical: "https://oleg.ae/claude-tiktok",
  },
};

export default function ClaudeTiktokLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
