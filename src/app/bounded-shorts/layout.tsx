import type { Metadata } from "next";

// oleg.ae/bounded-shorts: a private page for the Bounded team. Unlisted: noindex, not in the sitemap.
export const metadata: Metadata = {
  title: "4 test Shorts for Bounded",
  description: "Four code-made 3D Shorts for Bounded, each with three covers and a caption.",
  robots: { index: false, follow: false },
};

export default function BoundedShortsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
