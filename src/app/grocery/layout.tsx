import type { Metadata } from "next";
import "./grocery.css";

// Oleg's grocery list, in English since 2026-11-04, the companion of /fitness. A personal page
// like /fitness: linked from nowhere, kept out of search results, out of the
// sitemap and out of llms.txt (tests/unit/sitemap.test.ts lists it in UNLISTED).
export const metadata: Metadata = {
  title: "Groceries",
  description: "Personal grocery list: Tuesday and Friday shopping, for 6 home days.",
  robots: { index: false, follow: false },
};

export default function GroceryLayout({ children }: { children: React.ReactNode }) {
  return <div lang="en">{children}</div>;
}
