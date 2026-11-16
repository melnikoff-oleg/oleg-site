import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Make 3D Cartoon Shorts with Claude From One Prompt (Free)",
  description:
    "One short prompt and Claude Code makes a 30-second 3D cartoon with voices, music and sound effects. Only free tools, no MCP, no API keys. The exact prompt and three test videos.",
  keywords: [
    "Claude 3D animation",
    "Claude Code Shorts",
    "3D cartoon with Claude",
    "three.js animation prompt",
    "HyperFrames",
    "free AI animation",
    "Roblox style Shorts with Claude",
  ],
  openGraph: {
    title: "Make 3D Cartoon Shorts with Claude From One Prompt (Free)",
    description:
      "The exact prompt, the setup, and three 30-second cartoons it made on the first try, with voice, music and sound. Only free tools.",
    type: "article",
    url: "https://www.oleg.ae/claude-3d-shorts",
    publishedTime: "2026-11-16T00:00:00Z",
    modifiedTime: "2026-11-16T00:00:00Z",
    authors: ["Oleg Melnikov"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Make 3D Cartoon Shorts with Claude From One Prompt (Free)",
    description:
      "The exact prompt, the setup, and three 30-second cartoons it made on the first try. Only free tools, no MCP.",
  },
  alternates: { canonical: "https://www.oleg.ae/claude-3d-shorts" },
};

export default function Claude3dShortsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
