import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "An AI Interviewer That Turns Your Expertise Into Content: Free Setup Guide",
  description:
    "Build an AI voice interviewer with Claude Code that asks thoughtful questions about your work, then shapes the conversation into ready-to-post LinkedIn content. You talk, it writes, the ideas stay yours.",
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
    "LinkedIn content system",
  ],
  openGraph: {
    title:
      "An AI Interviewer That Turns Your Expertise Into Content: Free Setup Guide",
    description:
      "Build an AI voice interviewer that turns a real conversation about your work into ready-to-post LinkedIn content. You talk, it writes, the ideas stay yours.",
    type: "article",
    url: "https://oleg.ae/claude-interviewer",
    publishedTime: "2026-05-17T00:00:00Z",
    modifiedTime: "2026-05-17T00:00:00Z",
    authors: ["Oleg Melnikov"],
  },
  twitter: {
    card: "summary_large_image",
    title: "An AI Interviewer That Turns Your Expertise Into Content",
    description:
      "Build an AI voice interviewer with Claude Code that turns a real conversation about your work into ready-to-post LinkedIn content.",
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
