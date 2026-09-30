import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import "./ubersuggest-feed.css";

// The display face for these two pages only, so the rest of the site's font budget is untouched.
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--ubs-serif", display: "swap" });

// Unlisted working pages for client drafts: kept out of search results.
export const metadata: Metadata = {
  title: "Ubersuggest LinkedIn drafts",
  description: "LinkedIn post drafts for Ubersuggest, shown as they will look in the feed. Rate them.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className={`ubs-page ${serif.variable}`}>{children}</div>;
}
