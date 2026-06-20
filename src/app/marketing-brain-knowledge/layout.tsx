import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "$1B Marketing Brain: Knowledge Base of the Greatest Marketing Minds",
  description:
    "A curated knowledge base of the best marketing and content minds: Hormozi, Brunson, Cialdini, Gary Vee, Ogilvy, Godin, Patel, Ralston, MrBeast. 8 books and 75 talks distilled into one searchable AI brain for marketing.",
  keywords: [
    "marketing knowledge base",
    "best marketing books",
    "Alex Hormozi",
    "Russell Brunson",
    "Robert Cialdini",
    "Gary Vaynerchuk",
    "David Ogilvy",
    "Seth Godin",
    "Neil Patel",
    "MrBeast",
    "AI systems for marketing",
    "Claude Code for marketing",
  ],
  openGraph: {
    title: "$1B Marketing Brain: Knowledge Base of the Greatest Marketing Minds",
    description:
      "8 books and 75 talks from the greatest marketing minds, distilled into one searchable AI brain. Every insight cited to the exact page or timecode.",
    type: "website",
    url: "https://oleg.ae/marketing-brain-knowledge",
  },
  twitter: {
    card: "summary_large_image",
    title: "$1B Marketing Brain: Knowledge Base of the Greatest Marketing Minds",
    description:
      "8 books and 75 talks from the greatest marketing minds, distilled into one searchable AI brain.",
  },
  alternates: {
    canonical: "https://oleg.ae/marketing-brain-knowledge",
  },
};

export default function MarketingBrainKnowledgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
