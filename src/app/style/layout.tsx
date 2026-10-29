import type { Metadata } from "next";
import "./style.css";

// Oleg's brand style guide: the fonts, the spacing, the colors, and the
// high-contrast rules for YouTube and social media. The page is set in the
// brand itself (the root layout's Wix Madefor faces, the navy tokens), so it
// is its own first specimen. A working page for Oleg, his editors and clients:
// reachable by link, kept out of search results, the sitemap and llms.txt
// (both read src/lib/seo/sitemap-routes.ts), like /fitness.
export const metadata: Metadata = {
  title: "Style guide",
  description:
    "Oleg Melnikov's brand style guide: Wix Madefor, the size and spacing scale, the Boldane colors, and the high-contrast rules for YouTube and social media.",
  robots: { index: false, follow: false },
};

export default function StyleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
