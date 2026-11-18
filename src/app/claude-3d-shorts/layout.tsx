import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Make Viral Roblox-Style 3D Shorts with Claude From One Prompt (Free)",
  description:
    "One prompt turns Claude Code into a cartoon studio that makes 30-second Roblox-style 3D Shorts with a narrator, captions and music. The free prompt, the 5-minute setup and how to fix and restyle videos.",
  keywords: [
    "Claude 3D animation",
    "Claude Code Shorts",
    "3D cartoon with Claude",
    "Claude YouTube Shorts",
    "AI animation prompt",
    "Roblox animation with AI",
    "Roblox style Shorts with Claude",
  ],
  openGraph: {
    title: "Make Viral Roblox-Style 3D Shorts with Claude From One Prompt (Free)",
    description:
      "The free prompt, the 5-minute setup with a free ElevenLabs key, and two cartoons Claude made on the first try.",
    type: "article",
    url: "https://www.oleg.ae/claude-3d-shorts",
    publishedTime: "2026-11-16T00:00:00Z",
    modifiedTime: "2026-11-18T00:00:00Z",
    authors: ["Oleg Melnikov"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Make Viral Roblox-Style 3D Shorts with Claude From One Prompt (Free)",
    description:
      "The free prompt, the 5-minute setup, and two cartoons Claude made on the first try. No video generator, no editor.",
  },
  alternates: { canonical: "https://www.oleg.ae/claude-3d-shorts" },
};

export default function Claude3dShortsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
