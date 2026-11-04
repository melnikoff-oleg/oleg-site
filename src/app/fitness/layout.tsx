import type { Metadata } from "next";
import "./fitness.css";

// Oleg's own training program, in English since 2026-11-04.
//
// A personal page: linked from nowhere, kept out of search results, out of the
// sitemap and out of llms.txt (both read src/lib/seo/sitemap-routes.ts).
export const metadata: Metadata = {
  title: "Muscle gain program",
  description: "Personal training and nutrition program for the first cycle, 8 weeks from Oct 28, 2026.",
  robots: { index: false, follow: false },
};

export default function FitnessLayout({ children }: { children: React.ReactNode }) {
  return <div lang="en">{children}</div>;
}
