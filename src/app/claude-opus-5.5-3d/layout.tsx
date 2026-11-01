import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Build Any Machine in 3D with Claude Opus 5.5",
  description:
    "A free Claude Code skill and nine copy-ready prompts that turn one picture of a machine into a 3D model you can take apart, with live panels and a self-driving tour.",
  keywords: [
    "Claude Opus 5.5",
    "Claude Code skill",
    "3D simulator",
    "interactive 3D model",
    "teardown skill",
    "Claude Code 3D",
    "three.js",
    "Claude Code tutorial",
  ],
  openGraph: {
    title: "Build a 3D Model of Any Machine with Claude Opus 5.5",
    description:
      "One free Claude Code skill and nine prompts: one picture in, one offline page out, with the machine in 3D, live panels, buttons and a tour that runs itself.",
    type: "article",
    url: "https://www.oleg.ae/claude-opus-5.5-3d",
    publishedTime: "2026-11-01T00:00:00Z",
    modifiedTime: "2026-11-01T00:00:00Z",
    authors: ["Oleg Melnikov"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Build a 3D Model of Any Machine with Claude Opus 5.5",
    description:
      "One free Claude Code skill and nine prompts: one picture in, one offline page out, with the machine in 3D, live panels, buttons and a self-driving tour.",
  },
  alternates: {
    canonical: "https://www.oleg.ae/claude-opus-5.5-3d",
  },
};

export default function ClaudeOpus3dLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
