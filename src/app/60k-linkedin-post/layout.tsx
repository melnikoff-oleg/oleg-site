import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The $60K LinkedIn Post: 3 AI Prompts to Write Posts That Sell",
  description:
    "The exact 3-prompt system that generated $60,000 from a single LinkedIn post. Build your content foundation, run an AI interview, and get posts built from what you say. Works with Claude or ChatGPT.",
  keywords: [
    "LinkedIn content AI",
    "AI LinkedIn posts",
    "LinkedIn sales post",
    "AI content creation",
    "LinkedIn lead generation",
    "Claude for LinkedIn",
    "ChatGPT LinkedIn prompts",
    "AI personal branding",
    "LinkedIn content strategy",
    "Boldane",
  ],
  openGraph: {
    title: "The $60K LinkedIn Post: 3 AI Prompts to Write Posts That Sell",
    description:
      "The exact 3-prompt system that generated $60,000 from a single LinkedIn post. Works with Claude or ChatGPT.",
    type: "article",
    url: "https://oleg.ae/60k-linkedin-post",
    publishedTime: "2026-06-10T00:00:00Z",
    modifiedTime: "2026-06-10T00:00:00Z",
    authors: ["Oleg Melnikov"],
  },
  twitter: {
    card: "summary_large_image",
    title: "The $60K LinkedIn Post: 3 AI Prompts to Write Posts That Sell",
    description:
      "The exact 3-prompt system that generated $60,000 from a single LinkedIn post. Works with Claude or ChatGPT.",
  },
  alternates: {
    canonical: "https://oleg.ae/60k-linkedin-post",
  },
};

export default function LinkedInPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
