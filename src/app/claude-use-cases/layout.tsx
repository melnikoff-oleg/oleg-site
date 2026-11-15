import type { Metadata } from "next";

const TITLE = "27 Genius Ways to Use Claude, With Prompts";
const DESCRIPTION =
  "27 real things people built with Claude in the last weeks. Each one has the original post, what you need, the steps and a starter prompt to try it yourself.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "ways to use Claude",
    "Claude use cases",
    "Claude Code use cases",
    "Claude prompts",
    "Claude Code projects",
    "what to build with Claude",
  ],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "article",
    url: "https://www.oleg.ae/claude-use-cases",
    publishedTime: "2026-11-15T00:00:00Z",
    modifiedTime: "2026-11-15T00:00:00Z",
    authors: ["Oleg Melnikov"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  alternates: {
    canonical: "https://www.oleg.ae/claude-use-cases",
  },
};

export default function ClaudeUseCasesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
