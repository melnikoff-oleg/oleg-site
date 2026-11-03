import type { Metadata } from "next";
import "./grocery.css";

// Oleg's grocery list, in Russian, the companion of /fitness. A personal page
// like /fitness: linked from nowhere, kept out of search results, out of the
// sitemap and out of llms.txt (tests/unit/sitemap.test.ts lists it in UNLISTED).
export const metadata: Metadata = {
  title: "Продукты",
  description: "Личный список продуктов: закупка во вторник и в пятницу, на 6 домашних дней.",
  robots: { index: false, follow: false },
};

export default function GroceryLayout({ children }: { children: React.ReactNode }) {
  return <div lang="ru">{children}</div>;
}
