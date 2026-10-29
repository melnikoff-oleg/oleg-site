import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Build a Viral Instagram Page with Claude Code",
  description:
    "Download one folder, open it in VS Code, and a local studio walks you through the seven steps of a viral Instagram theme page: the idea, the packaging, the first reels, posting, autopilot.",
  keywords: [
    "Claude Code",
    "viral Instagram page",
    "Instagram theme page",
    "AI Instagram Reels",
    "Higgsfield",
    "Claude Code Instagram",
    "faceless Instagram page",
    "AI content Instagram",
    "Claude Code tutorial",
    "Instagram automation",
  ],
  openGraph: {
    title: "Build a Viral Instagram Page with Claude Code: Free Setup Guide",
    description:
      "One folder, one prompt, and a local studio that builds the page with you: concept, username, profile picture, bio, the first reels, posting, autopilot.",
    type: "article",
    url: "https://www.oleg.ae/instagram-viral-pages",
    publishedTime: "2026-10-29T00:00:00Z",
    modifiedTime: "2026-10-29T00:00:00Z",
    authors: ["Oleg Melnikov"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Build a Viral Instagram Page with Claude Code: Free Setup Guide",
    description:
      "One folder, one prompt, and a local studio that builds the page with you: concept, packaging, the first reels, posting, autopilot.",
  },
  alternates: {
    canonical: "https://www.oleg.ae/instagram-viral-pages",
  },
};

export default function InstagramViralPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
