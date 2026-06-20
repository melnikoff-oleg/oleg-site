import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Marketing Brain: Ask the Greatest Marketing Minds (AI Chat)",
  description:
    "Ask anything about offers, content, persuasion, and growth. An AI chat grounded in the best marketing books and talks (Hormozi, Brunson, Cialdini, Gary Vee, Ogilvy, Godin, Patel, MrBeast), with every answer cited to the exact page or video timecode.",
  keywords: [
    "marketing AI chat",
    "ask marketing experts AI",
    "AI marketing assistant",
    "Alex Hormozi AI",
    "marketing knowledge base",
    "AI systems for marketing",
    "Claude Code for marketing",
  ],
  openGraph: {
    title: "The Marketing Brain: Ask the Greatest Marketing Minds (AI Chat)",
    description:
      "An AI chat grounded in the best marketing books and talks, with every answer cited to the exact page or video timecode.",
    type: "website",
    url: "https://oleg.ae/marketing-brain",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Marketing Brain: Ask the Greatest Marketing Minds (AI Chat)",
    description:
      "An AI chat grounded in the best marketing books and talks, every answer cited to the exact page or timecode.",
  },
  alternates: {
    canonical: "https://oleg.ae/marketing-brain",
  },
};

export default function MarketingBrainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
