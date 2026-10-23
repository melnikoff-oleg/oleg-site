import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import { FontKickoff } from "@/components/font-kickoff";
import "../ubersuggest-feed/ubersuggest-feed.css";
import "./wasl-rebrand.css";

const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--ubs-serif", display: "swap", preload: false });

// Unlisted working page for a friend's rebrand: kept out of search results.
export const metadata: Metadata = {
  title: "Ten names for Wasl Apps",
  description: "Ten name candidates for the Wasl Apps rebrand, each with its .com and its story. Rate them.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  // preload: false + FontKickoff: a <head> font preload holds Chrome's first
  // paint (see src/components/font-kickoff.tsx).
  return (
    <>
      <FontKickoff fonts={[`400 1em ${serif.style.fontFamily}`, `italic 400 1em ${serif.style.fontFamily}`]} />
      <div className={`ubs-page wsl-page ${serif.variable}`}>{children}</div>
    </>
  );
}
