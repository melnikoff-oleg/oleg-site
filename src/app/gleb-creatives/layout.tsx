import type { Metadata } from "next";

// oleg.ae/gleb-creatives: a private page for the Bounded team. Unlisted: noindex, not in the sitemap.
export const metadata: Metadata = {
  title: "Top 12 outlier videos for Bounded",
  description:
    "35,075 Instagram and TikTok videos and 31 Bounded ads analyzed. The 12 strongest outlier videos from the last 30 days, and 20 accounts to study.",
  robots: { index: false, follow: false },
};

export default function GlebCreativesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
