import type { Metadata } from "next";

const title = "LinkedIn Packaging: Banner, Portrait & Headline";
const description = "Download the LinkedIn packaging project. See real before and after examples, then create a banner, portrait and headline with a simple three-step setup.";

export const metadata: Metadata = {
  title,
  description,
  keywords: ["LinkedIn profile makeover", "LinkedIn banner generator", "AI LinkedIn portrait", "LinkedIn headline", "LinkedIn packaging"],
  alternates: { canonical: "https://www.oleg.ae/linkedin-packaging" },
  openGraph: { title, description, type: "article", url: "https://www.oleg.ae/linkedin-packaging", publishedTime: "2026-11-07T00:00:00Z", modifiedTime: "2026-11-07T00:00:00Z", authors: ["Oleg Melnikov"] },
  twitter: { card: "summary_large_image", title, description },
};

export default function LinkedInPackagingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
