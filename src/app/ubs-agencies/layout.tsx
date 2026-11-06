import type { Metadata } from "next";

// A working page for the Ubersuggest team (Mike Kamo): what Semrush's own
// leaders say they do to win agency customers, each point linked to the moment
// in the interview. Reachable by link, kept out of search results, the sitemap
// and llms.txt (both read src/lib/seo/sitemap-routes.ts), like /style.
export const metadata: Metadata = {
  title: "How Semrush wins agencies",
  description:
    "Ten things Semrush does to win agency customers, taken from interviews with its leaders, each with a link to the exact moment.",
  robots: { index: false, follow: false },
};

export default function UbsAgenciesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
