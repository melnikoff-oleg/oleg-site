import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Ads Creator — Free Open Source Tool",
  description:
    "Clone winning Meta ads with AI. Ads AI studies your competitors' proven ads and generates new ad concepts for your brand — copy, visuals, and video scripts. Free and open source.",
  keywords: [
    "AI ad creator",
    "AI ad generator",
    "Meta ads AI",
    "AI advertising tool",
    "Claude Code",
    "AI marketing tool",
    "competitor ad analysis",
    "AI ad copy",
    "open source AI tool",
    "Claude Code for marketing",
  ],
  openGraph: {
    title: "AI Ads Creator — Free Open Source Tool",
    description:
      "Clone winning Meta ads with AI. Study competitors' proven ads and generate new ad concepts — copy, visuals, and video scripts.",
    type: "article",
    url: "https://oleg.ae/ads-ai",
    publishedTime: "2026-05-31T00:00:00Z",
    modifiedTime: "2026-05-31T00:00:00Z",
    authors: ["Oleg Melnikov"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Ads Creator — Free Open Source Tool",
    description:
      "Clone winning Meta ads with AI. Study competitors' proven ads and generate new ad concepts — copy, visuals, and video scripts.",
  },
  alternates: {
    canonical: "https://oleg.ae/ads-ai",
  },
};

export default function AdsAiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
