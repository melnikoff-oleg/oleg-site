import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import "../ubersuggest-feed/ubersuggest-feed.css";
import "./wasl-rebrand.css";

const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--ubs-serif", display: "swap" });

// Unlisted working page for a friend's rebrand: kept out of search results.
export const metadata: Metadata = {
  title: "Ten names for Wasl Apps",
  description: "Ten name candidates for the Wasl Apps rebrand, each with its .com and its story. Rate them.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className={`ubs-page wsl-page ${serif.variable}`}>{children}</div>;
}
