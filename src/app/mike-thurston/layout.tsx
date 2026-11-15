import type { Metadata } from "next";

// oleg.ae/mike-thurston: a page for Mike Thurston. Unlisted: noindex, not in the sitemap.
export const metadata: Metadata = {
  title: "Outlier videos for Mike Thurston",
  description: "Fitness videos from the last 30 days that beat their own channel's normal many times over.",
  robots: { index: false, follow: false },
};

export default function MikeThurstonLayout({ children }: { children: React.ReactNode }) {
  return children;
}
