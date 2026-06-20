import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "AI Interviewer That Makes All Your Content: Free Setup Guide",
  description:
    "Build an AI voice interviewer with Claude Code that asks you smart questions about your expertise, then turns the conversation into ready-to-post LinkedIn content. No writing, no editing, just talk.",
  keywords: [
    "Claude Code",
    "Claude AI",
    "AI interviewer",
    "AI content creation",
    "AI LinkedIn content",
    "voice AI agent",
    "Claude Code tutorial",
    "AI content from voice",
    "Claude Code for marketing",
    "automated LinkedIn posts",
  ],
  openGraph: {
    title: "AI Interviewer That Makes All Your Content: Free Setup Guide",
    description:
      "Build an AI voice interviewer that turns casual conversations into viral LinkedIn posts. No writing required, just talk about your expertise.",
    type: "article",
    url: "https://oleg.ae/claude-interviewer",
    publishedTime: "2026-05-17T00:00:00Z",
    modifiedTime: "2026-05-17T00:00:00Z",
    authors: ["Oleg Melnikov"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Interviewer That Makes All Your Content",
    description:
      "Build an AI voice interviewer that turns casual conversations into viral LinkedIn posts using Claude Code.",
  },
  alternates: {
    canonical: "https://oleg.ae/claude-interviewer",
  },
};

export default function ClaudeInterviewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
