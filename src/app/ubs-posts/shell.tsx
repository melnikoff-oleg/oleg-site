import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import { FontKickoff } from "@/components/font-kickoff";
import "../ubersuggest-feed/ubersuggest-feed.css";
import "./ubs-posts.css";

// The same dark gallery frame as /ubersuggest-feed, shared by the three pages of
// this round: /ubs-posts, /ubs-posts-rate, /ubs-posts-ratings.
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--ubs-serif", display: "swap", preload: false });

/** Unlisted working pages for client drafts: kept out of search results. */
export function meta(title: string, description: string): Metadata {
  return { title, description, robots: { index: false, follow: false } };
}

export function Shell({ children }: { children: React.ReactNode }) {
  // preload: false + FontKickoff: a <head> font preload holds Chrome's first
  // paint (see src/components/font-kickoff.tsx).
  return (
    <>
      <FontKickoff fonts={[`400 1em ${serif.style.fontFamily}`, `italic 400 1em ${serif.style.fontFamily}`]} />
      <div className={`ubs-page ${serif.variable}`}>{children}</div>
    </>
  );
}
