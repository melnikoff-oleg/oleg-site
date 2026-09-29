import type { Metadata } from "next";
import "./ubersuggest-feed.css";

// Unlisted working pages for client drafts: kept out of search results.
export const metadata: Metadata = {
  title: "Ubersuggest LinkedIn drafts",
  description: "LinkedIn post drafts for Ubersuggest, shown as they will look in the feed. Rate them.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="ubs-page">{children}</div>;
}
