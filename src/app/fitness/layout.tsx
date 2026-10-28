import type { Metadata } from "next";

// Oleg's own training program, in Russian. The root layout's Wix Madefor
// faces already carry the Cyrillic range (next/font emits every subset's
// @font-face and only preloads the ones named, and nothing on the site
// preloads), so the page inherits the site's type with no font work of its own.
//
// A personal page: linked from nowhere, kept out of search results, out of the
// sitemap and out of llms.txt (both read src/lib/seo/sitemap-routes.ts).
export const metadata: Metadata = {
  title: "Программа набора мышц",
  description: "Личная программа тренировок и питания на первый цикл, 8 недель с 28 октября 2026.",
  robots: { index: false, follow: false },
};

export default function FitnessLayout({ children }: { children: React.ReactNode }) {
  return <div lang="ru">{children}</div>;
}
