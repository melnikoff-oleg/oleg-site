import type { Metadata } from "next";

// oleg.ae/3d-shorts-styles: a picker of Shorts styles that code can draw. Unlisted for now: noindex, not in the sitemap.
export const metadata: Metadata = {
  title: "3D Shorts styles",
  description: "Styles of viral animated Shorts, one top video each, with its views and three stills.",
  robots: { index: false, follow: false },
};

export default function ShortsStylesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
