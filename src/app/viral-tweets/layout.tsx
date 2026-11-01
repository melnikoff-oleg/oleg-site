import type { Metadata } from "next";
import "./viral-tweets.css";

export const metadata: Metadata = {
  title: "Viral AI Tweets, Ranked by Outlier Score",
  description:
    "Fourteen viral AI tweets from late October 2026, ranked by outlier score: how far each post beat what an account of its size usually gets, with the videos.",
  keywords: [
    "viral tweets",
    "viral AI tweets",
    "outlier score",
    "Claude Code",
    "Claude Opus 5.5",
    "AI on X",
    "viral posts",
  ],
  openGraph: {
    title: "Viral AI Tweets, Ranked by Outlier Score",
    description:
      "Fourteen AI posts from X that broke out, highest outlier score first, with the videos, photos and quoted posts.",
    type: "article",
    url: "https://www.oleg.ae/viral-tweets",
    publishedTime: "2026-11-01T00:00:00Z",
    modifiedTime: "2026-11-01T00:00:00Z",
    authors: ["Oleg Melnikov"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Viral AI Tweets, Ranked by Outlier Score",
    description:
      "Fourteen AI posts from X that broke out, highest outlier score first, with the videos, photos and quoted posts.",
  },
  alternates: {
    canonical: "https://www.oleg.ae/viral-tweets",
  },
};

export default function ViralTweetsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
