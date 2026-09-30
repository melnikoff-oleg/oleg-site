import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import "../ubersuggest-feed/ubersuggest-feed.css";
import "./ubernatural.css";

const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--ubs-serif", display: "swap" });

// Unlisted working page for client drafts: kept out of search results.
export const metadata: Metadata = {
  title: "übernatural LinkedIn drafts",
  description: "Thirty LinkedIn post drafts for Ivan, Egor and Bogdan, shown as they will look in the feed. Rate them.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className={`ubs-page ubn-page ${serif.variable}`}>{children}</div>;
}
